// Conversão de documentos e e-books — tudo embutido, sem programas externos.
//
// Ordem de prioridade (igual ao GCP-PDF):
//   • Documentos do Office → PDF: Microsoft Office (Windows, se instalado) → LibreOffice (se instalado)
//     → motor interno do GCP-PDF (DOCX e XLSX com layout de página fiel).
//   • PDF → DOCX / PPTX / XLSX / EPUB / PNG: motores de layout do GCP-PDF.
// Formatos que o GCP-PDF só converte com programas externos (ODT, ODS, ODP, PPTX, RTF) ganham
// leitores próprios em ./builtin, usados quando nem o Office nem o LibreOffice estão disponíveis.
// Calibre só é usado para AZW3 e formatos raros de e-book (KFX, LIT, LRF, PDB, DjVu).
'use strict';
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { BrowserWindow } = require('electron');
const { detect } = require('./tools');

let gcpPdf = null;
const G = () => (gcpPdf ||= require('./gcp-pdf'));
const B = {
  odf: () => require('./builtin/odf'),
  rtf: () => require('./builtin/rtf'),
  slides: () => require('./builtin/slides'),
  sheets: () => require('./builtin/sheets'),
  ebooks: () => require('./builtin/ebooks')
};

/* ------------------------------------------------------------------ */
/* catálogo                                                            */
/* ------------------------------------------------------------------ */

const GCP_IN = ['docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'doc', 'xls', 'ppt', 'rtf', 'txt', 'xml', 'png', 'jpg', 'jpeg', 'webp', 'bmp'];
const LEGACY = ['doc', 'xls', 'ppt', 'wpd', 'pages', 'key', 'numbers'];
const SHEET = ['xlsx', 'ods', 'csv'];
const SLIDE = ['pptx', 'odp'];
const READER = ['mobi', 'azw', 'azw3', 'fb2'];
const COMIC = ['cbz', 'cbr', 'cb7'];
const CALIBRE_ONLY_IN = ['kfx', 'lit', 'lrf', 'pdb', 'djvu'];
const CALIBRE_ONLY_OUT = ['azw3'];
const IMG = ['png', 'jpg', 'jpeg', 'webp', 'bmp', 'gif', 'tif', 'tiff', 'avif'];

const LABEL = { builtin: 'GCP (embutido)', libreoffice: 'LibreOffice', office: 'Microsoft Office ou LibreOffice', calibre: 'Calibre', ghostscript: 'Ghostscript' };

/**
 * Decide como converter `inExt` em `outExt`.
 * Retorna { engine } ou { missing: [motores necessários] }.
 */
function plan(inExt, outExt, tools, kind) {
  inExt = String(inExt).toLowerCase();
  const has = (id) => tools[id] && tools[id].available;
  if (inExt === outExt || (inExt === 'htm' && outExt === 'html') || (inExt === 'markdown' && outExt === 'md')) return { engine: 'copy' };
  if (CALIBRE_ONLY_OUT.includes(outExt) || CALIBRE_ONLY_IN.includes(inExt)) return has('calibre') ? { engine: 'calibre' } : { missing: ['calibre'] };
  if (inExt === 'xml') return outExt === 'pdf' ? { engine: 'builtin' } : { unsupported: true };
  if (LEGACY.includes(inExt)) {
    // Igual ao GCP-PDF: Microsoft Office (Windows) ou LibreOffice
    if (has('libreoffice') || process.platform === 'win32') return { engine: 'builtin' };
    return { missing: ['office'] };
  }
  return { engine: 'builtin' };
}

/* ------------------------------------------------------------------ */
/* utilidades                                                          */
/* ------------------------------------------------------------------ */

function run(bin, args, { signal, timeout = 30 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    let err = '';
    const kill = () => { try { p.kill('SIGKILL'); } catch {} };
    const timer = setTimeout(kill, timeout);
    if (signal) signal.addEventListener('abort', kill, { once: true });
    p.stdout.on('data', () => {});
    p.stderr.on('data', (d) => (err = (err + d).slice(-8000)));
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (signal && signal.aborted) return reject(Object.assign(new Error('cancelled'), { cancelled: true }));
      code === 0 ? resolve() : reject(new Error(err.trim().split(/\r?\n/).slice(-3).join(' · ') || `código ${code}`));
    });
  });
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const cancelled = (signal) => { if (signal && signal.aborted) throw Object.assign(new Error('cancelled'), { cancelled: true }); };

const DOC_CSS = `
  @page { size: A4; margin: 20mm 18mm; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #111; margin: 0; }
  h1, h2, h3, h4 { line-height: 1.25; margin: 1.2em 0 .45em; page-break-after: avoid; }
  h1 { font-size: 22pt; } h2 { font-size: 16pt; } h3 { font-size: 13.5pt; }
  img { max-width: 100%; height: auto; }
  pre { background: #f4f5f7; padding: 10px 12px; border-radius: 6px; font-size: 9.5pt; white-space: pre-wrap; }
  code { font-family: Consolas, "Liberation Mono", monospace; }
  blockquote { border-left: 4px solid #c9cdd8; margin: 1em 0; padding: .2em 1em; color: #444; }
  table { border-collapse: collapse; width: 100%; margin: .8em 0; font-size: 10pt; page-break-inside: auto; }
  th, td { border: 1px solid #c8ccd8; padding: 4px 7px; text-align: left; vertical-align: top; }
  th { background: #f1f2f6; }
  hr.pagebreak { border: 0; page-break-after: always; break-after: page; }
`;

function wrapHtml(body, title, css = '', pageCss = '') {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(title || '')}</title><style>${DOC_CSS}${pageCss}${css}</style></head><body>${body}</body></html>`;
}

function pageCssFor(o = {}) {
  const size = o.pageSize && o.pageSize !== 'A4' && o.pageSize !== 'fit' ? o.pageSize : 'A4';
  return o.orientation === 'landscape' || size !== 'A4' ? `@page { size: ${size}${o.orientation === 'landscape' ? ' landscape' : ''}; }` : '';
}

/** HTML → PDF com o Chromium (mesma configuração do GCP-PDF: janela oculta, sem scripts). */
async function htmlToPdf(html, options = {}) {
  const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-conv-html-'));
  const file = path.join(folder, 'documento.html');
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false } });
  try {
    await fsp.writeFile(file, html, { mode: 0o600 });
    await win.loadFile(file);
    const headerFooter = !!(options.headerTemplate || options.footerTemplate);
    return new Uint8Array(await win.webContents.printToPDF({ pageSize: 'A4', printBackground: true, preferCSSPageSize: true, generateDocumentOutline: true, displayHeaderFooter: headerFooter, headerTemplate: options.headerTemplate || '<span></span>', footerTemplate: options.footerTemplate || '<span></span>' }));
  } finally {
    win.destroy();
    fsp.rm(folder, { recursive: true, force: true }).catch(() => {});
  }
}

/** HTML → PDF com tamanho de página próprio (bobina 80 mm de NFC-e e CF-e SAT). */
async function htmlToPdfSized(html, widthMm, heightMm) {
  const folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-conv-html-'));
  const file = path.join(folder, 'documento.html');
  const win = new BrowserWindow({ show: false, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, javascript: false } });
  try {
    await fsp.writeFile(file, html, { mode: 0o600 });
    await win.loadFile(file);
    return new Uint8Array(await win.webContents.printToPDF({ pageSize: { width: widthMm / 25.4, height: Math.max(40, heightMm) / 25.4 }, printBackground: true, preferCSSPageSize: true, margins: { marginType: 'none' } }));
  } finally {
    win.destroy();
    fsp.rm(folder, { recursive: true, force: true }).catch(() => {});
  }
}

/** XML fiscal → PDF no leiaute oficial (DANFE, DANFE NFC-e, DANFSe, extrato CF-e SAT, DACTE…). */
async function fiscalToPdf(input) {
  const bytes = new Uint8Array(await fsp.readFile(input));
  const F = require('./builtin/fiscal');
  const root = F.parse(bytes);
  const kind = root && F.kindOf(root);
  if (kind === 'nfse-nacional') return htmlToPdf(await F.danfseV2(root));
  if (kind === 'cfe') { const { html, height } = await F.extratoCfe(root); return htmlToPdfSized(html, 80, height); }
  if (kind === 'nfce') { const { html, height } = await F.danfeNfce(root); return htmlToPdfSized(html, 80, height); }
  return (await G().fiscalXmlToPdf(bytes, htmlToPdf, htmlToPdfSized)).bytes;
}

/** Abre HTML numa janela oculta com scripts (para analisar o documento). */
async function withPage(html, fn, { webSecurity = true, file: pageFile } = {}) {
  let folder = null;
  let file = pageFile;
  if (!file) {
    folder = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-conv-page-'));
    file = path.join(folder, 'page.html');
    await fsp.writeFile(file, html, 'utf8');
  }
  const win = new BrowserWindow({ show: false, width: 1000, height: 1400, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, webSecurity } });
  try {
    await win.loadFile(file);
    return await fn(win);
  } finally {
    win.destroy();
    if (folder) fsp.rm(folder, { recursive: true, force: true }).catch(() => {});
  }
}

const BLOCKS_JS = () => fs.readFileSync(path.join(__dirname, '..', '..', 'src', 'engine', 'blocks.js'), 'utf8');
async function htmlToBlocks(fullHtml) {
  return withPage(fullHtml, (win) => win.webContents.executeJavaScript(BLOCKS_JS()));
}
async function htmlToText(fullHtml) {
  return withPage(fullHtml, (win) => win.webContents.executeJavaScript('document.body.innerText'));
}
async function htmlToXhtml(fullHtml) {
  return withPage(fullHtml, (win) => win.webContents.executeJavaScript(`(function(){document.querySelectorAll('script').forEach(s=>s.remove());return new XMLSerializer().serializeToString(document.body);})()`));
}

/** Lê MOBI, AZW, AZW3 e FB2 com o leitor embutido (foliate-js no Chromium). */
async function readWithFoliate(input, kind) {
  const page = path.join(__dirname, '..', '..', 'src', 'engine', 'reader.html');
  return withPage(null, async (win) => {
    for (let i = 0; i < 100; i++) {
      if (await win.webContents.executeJavaScript('!!window.gcpReady')) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    const url = require('url').pathToFileURL(input).href;
    const r = await win.webContents.executeJavaScript(`window.gcpReadBook(${JSON.stringify(url)}, ${JSON.stringify(kind)})`);
    if (!r.ok) throw new Error(r.error);
    return r;
  }, { webSecurity: false, file: page });
}

/** Troca imagens locais por data URIs (Markdown/HTML com imagens relativas). */
async function inlineLocalImages(html, baseDir) {
  if (!baseDir) return html;
  const re = /(<img\b[^>]*\bsrc=")([^"]+)(")/gi;
  const parts = [];
  let last = 0;
  for (const m of html.matchAll(re)) {
    parts.push(html.slice(last, m.index));
    let src = m[2];
    if (!/^(data:|https?:)/i.test(src)) {
      try {
        const p = src.startsWith('file:') ? require('url').fileURLToPath(src) : path.resolve(baseDir, decodeURIComponent(src));
        const ext = path.extname(p).slice(1).toLowerCase().replace('jpg', 'jpeg').replace('svg', 'svg+xml');
        src = `data:image/${ext};base64,${(await fsp.readFile(p)).toString('base64')}`;
      } catch {}
    }
    parts.push(m[1] + src + m[3]);
    last = m.index + m[0].length;
  }
  parts.push(html.slice(last));
  return parts.join('');
}

/* ------------------------------------------------------------------ */
/* leitores                                                            */
/* ------------------------------------------------------------------ */

/** Conteúdo "semântico" (títulos, parágrafos, listas, tabelas) em HTML. */
async function semantic(input, inExt, signal) {
  const title = path.basename(input, path.extname(input));
  const read = (enc) => fsp.readFile(input, enc);
  switch (inExt) {
    case 'md': case 'markdown': {
      const { marked } = require('marked');
      return { html: await inlineLocalImages(marked.parse(await read('utf8'), { gfm: true }), path.dirname(input)), title };
    }
    case 'txt': {
      const txt = (await read('utf8')).replace(/\r\n?/g, '\n');
      return { html: txt.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n'), title, plain: txt };
    }
    case 'html': case 'htm': case 'xhtml': {
      const raw = await read('utf8');
      const body = (raw.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || raw;
      const styles = (raw.match(/<style[\s\S]*?<\/style>/gi) || []).join('');
      return { html: await inlineLocalImages(body, path.dirname(input)), css: styles.replace(/<\/?style[^>]*>/gi, ''), title: (raw.match(/<title>([^<]*)<\/title>/i) || [])[1] || title };
    }
    case 'docx': {
      const mammoth = require('mammoth');
      return { html: (await mammoth.convertToHtml({ path: input })).value, title };
    }
    case 'odt': return { ...B.odf().readOdt(input), title };
    case 'rtf': return { ...B.rtf().readRtf(await read('latin1')), title };
    case 'epub': {
      const b = G().readEpubBook(new Uint8Array(await read()));
      return { html: b.html, css: b.css, title: b.title || title, author: b.author, lang: b.language, cover: b.cover };
    }
    case 'mobi': case 'azw': case 'azw3': case 'fb2': {
      const b = await readWithFoliate(input, inExt === 'fb2' ? 'fb2' : 'mobi');
      return { html: b.html, title: b.title || title, author: b.author, lang: b.lang, cover: b.cover };
    }
    case 'pptx': case 'odp': {
      const deck = await readSlides(input, inExt);
      const html = deck.slides.map((s, i) => {
        const texts = s.items.filter((it) => it.type === 'text');
        const head = texts.find((t) => t.title) || texts[0];
        const body = texts.filter((t) => t !== head).map((t) => t.paras.map((p) => `<p>${p.runs.map((r) => (r.br ? '<br>' : esc(r.text || ''))).join('')}</p>`).join('')).join('');
        const imgs = s.items.filter((it) => it.type === 'img').map((it) => `<p><img src="${it.src}"></p>`).join('');
        const h = head ? head.paras.map((p) => p.runs.map((r) => esc(r.text || '')).join('')).join(' ') : `Slide ${i + 1}`;
        return `<h2>${h}</h2>${body}${imgs}`;
      }).join('\n');
      return { html, title };
    }
    case 'xlsx': case 'ods': case 'csv': {
      const sheets = await B.sheets().readSheets(input, inExt);
      const full = B.sheets().sheetsToHtml(sheets, title);
      return { html: (full.match(/<body>([\s\S]*)<\/body>/) || [])[1] || '', title };
    }
    case 'pdf': {
      // PDF → DOCX com o motor de layout do GCP-PDF → HTML estruturado
      const r = await G().convertPdf(new Uint8Array(await read()), { format: 'docx' });
      const mammoth = require('mammoth');
      return { html: (await mammoth.convertToHtml({ buffer: Buffer.from(r.bytes) })).value, title };
    }
    default:
      if (COMIC.includes(inExt)) {
        const c = await G().readComic(new Uint8Array(await read()), path.basename(input));
        return { html: c.pages.map((p) => `<p><img src="data:${p.type};base64,${Buffer.from(p.data).toString('base64')}"></p>`).join(''), title: c.title || title, cover: c.pages[0] ? `data:${c.pages[0].type};base64,${Buffer.from(c.pages[0].data).toString('base64')}` : '' };
      }
      if (IMG.includes(inExt)) {
        const png = await imageToPng(input);
        return { html: `<p><img src="data:image/png;base64,${(await fsp.readFile(png)).toString('base64')}"></p>`, title };
      }
      throw new Error(`UNSUPPORTED:${inExt}`);
  }
}

async function readSlides(input, inExt) {
  return inExt === 'odp' ? B.odf().readOdp(input) : B.slides().readPptx(input);
}

async function imageToPng(input) {
  const { runFfmpeg } = require('./media');
  const out = path.join(os.tmpdir(), `gcp-img-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
  await runFfmpeg({ input, output: out, args: ['-frames:v', '1'] });
  return out;
}

async function tmpFile(ext) {
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-conv-'));
  return path.join(dir, `arquivo.${ext}`);
}

/** Qualquer formato → PDF (bytes). */
async function toPdf(input, inExt, o = {}, signal) {
  const g = G();
  if (inExt === 'pdf') return new Uint8Array(await fsp.readFile(input));
  if (inExt === 'xml') return fiscalToPdf(input);
  // Mesma cadeia do GCP-PDF: Office (Windows) → LibreOffice → motor interno (DOCX/XLSX/TXT/imagens)
  if (GCP_IN.includes(inExt)) {
    try {
      const r = await g.readInputDocument(input, htmlToPdf);
      return r.bytes;
    } catch (e) {
      cancelled(signal);
      // Formatos que o GCP-PDF só converte com Office/LibreOffice: leitores próprios
      if (inExt === 'odt' || inExt === 'rtf') {
        const s = await semantic(input, inExt, signal);
        return htmlToPdf(wrapHtml(s.html, s.title, s.css, pageCssFor(o)));
      }
      if (SLIDE.includes(inExt)) return htmlToPdf(B.slides().slidesToHtml(await readSlides(input, inExt)));
      if (inExt === 'ods') {
        const tmp = await tmpFile('xlsx');
        await B.sheets().writeXlsx(await B.sheets().readSheets(input, 'ods'), tmp);
        try { return await toPdf(tmp, 'xlsx', o, signal); } finally { fsp.rm(path.dirname(tmp), { recursive: true, force: true }).catch(() => {}); }
      }
      throw e;
    }
  }
  if (inExt === 'csv') {
    const tmp = await tmpFile('xlsx');
    await B.sheets().writeXlsx(await B.sheets().readSheets(input, 'csv'), tmp);
    try { return await toPdf(tmp, 'xlsx', o, signal); } finally { fsp.rm(path.dirname(tmp), { recursive: true, force: true }).catch(() => {}); }
  }
  if (inExt === 'html' || inExt === 'htm') {
    const raw = await fsp.readFile(input, 'utf8');
    if (/<html[\s>]/i.test(raw)) return htmlToPdf(await inlineLocalImages(raw, path.dirname(input)));
  }
  if (inExt === 'epub') {
    const b = G().readEpubBook(new Uint8Array(await fsp.readFile(input)));
    return htmlToPdf(wrapHtml(b.html, b.title, `${b.css}\nbody{line-height:1.5}`, pageCssFor(o)));
  }
  if (COMIC.includes(inExt)) {
    const c = await g.readComic(new Uint8Array(await fsp.readFile(input)), path.basename(input));
    const { PDFDocument } = require('pdf-lib');
    const pdf = await PDFDocument.create();
    for (const p of c.pages) {
      cancelled(signal);
      let bytes = p.data;
      let img;
      try { img = /png/.test(p.type) ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes); } catch {
        const { nativeImage } = require('electron');
        img = await pdf.embedPng(nativeImage.createFromBuffer(Buffer.from(bytes)).toPNG());
      }
      pdf.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    }
    return pdf.save();
  }
  if (IMG.includes(inExt)) {
    const png = await imageToPng(input);
    try { return (await g.readInputDocument(png, htmlToPdf)).bytes; } finally { fsp.rm(png, { force: true }).catch(() => {}); }
  }
  const s = await semantic(input, inExt, signal);
  return htmlToPdf(wrapHtml(s.html, s.title, s.css, pageCssFor(o)));
}

/* ------------------------------------------------------------------ */
/* entrada principal                                                   */
/* ------------------------------------------------------------------ */

async function convertDocument(job, output, onProgress, signal) {
  const tools = await detect();
  const inExt = path.extname(job.input).slice(1).toLowerCase();
  const out = job.ext;
  const o = job.options || {};
  const p = plan(inExt, out, tools, job.kind);
  if (p.unsupported) throw new Error(`UNSUPPORTED:${inExt}→${out}`);
  if (!p.engine) {
    const names = (p.missing || []).map((m) => LABEL[m] || m).join(' ou ');
    const err = new Error(`MISSING_ENGINE:${names}`);
    err.missing = p.missing;
    throw err;
  }
  job.engine = p.engine;
  const progress = (v) => onProgress && onProgress(v);
  progress(0.05);
  const g = G();
  const write = (bytes) => fsp.writeFile(output, Buffer.from(bytes));
  const title = o.title || path.basename(job.input, path.extname(job.input));

  if (p.engine === 'copy') return fsp.copyFile(job.input, output);
  if (p.engine === 'calibre') return viaCalibre(tools.calibre.path, job.input, output, o, signal, onProgress);

  // ---- PDF
  if (out === 'pdf') {
    if (IMG.includes(inExt) && (o.pageSize === 'fit' || o.pageSize === 'Letter' || o.orientation === 'portrait' || o.orientation === 'landscape')) return imagesToPdf([job.input], output, o);
    return write(await toPdf(job.input, inExt, o, signal));
  }

  // ---- Office (motores de layout do GCP-PDF)
  if (out === 'xlsx' && SHEET.includes(inExt)) return B.sheets().writeXlsx(await B.sheets().readSheets(job.input, inExt), output);
  if (out === 'pptx' && inExt === 'odp') return B.slides().writePptx(await readSlides(job.input, inExt), output, title);
  if (['docx', 'pptx', 'xlsx'].includes(out)) {
    const pdf = await toPdf(job.input, inExt, o, signal);
    progress(0.5);
    cancelled(signal);
    const r = await g.convertPdf(pdf, { format: out }, () => progress(0.75));
    return write(r.bytes);
  }

  // ---- Texto
  if (out === 'txt') {
    if (inExt === 'pdf') return fsp.writeFile(output, await pdfText(job.input), 'utf8');
    if (inExt === 'docx') return fsp.writeFile(output, (await require('mammoth').extractRawText({ path: job.input })).value, 'utf8');
    if (SHEET.includes(inExt)) {
      const sheets = await B.sheets().readSheets(job.input, inExt);
      return fsp.writeFile(output, sheets.map((s) => s.rows.map((r) => r.map((v) => (v == null ? '' : v instanceof Date ? v.toISOString().slice(0, 10) : v)).join('\t')).join('\n')).join('\n\n'), 'utf8');
    }
    const s = await semantic(job.input, inExt, signal);
    return fsp.writeFile(output, s.plain != null ? s.plain : await htmlToText(wrapHtml(s.html, s.title)), 'utf8');
  }

  // ---- HTML (com o layout do documento original quando possível)
  if (out === 'html') {
    if (inExt === 'docx') return fsp.writeFile(output, g.docxToHtml(new Uint8Array(await fsp.readFile(job.input))).html, 'utf8');
    if (inExt === 'xlsx') return fsp.writeFile(output, await g.xlsxToHtml(new Uint8Array(await fsp.readFile(job.input))), 'utf8');
    if (inExt === 'ods' || inExt === 'csv') return fsp.writeFile(output, B.sheets().sheetsToHtml(await B.sheets().readSheets(job.input, inExt), title), 'utf8');
    if (SLIDE.includes(inExt)) return fsp.writeFile(output, B.slides().slidesToHtml(await readSlides(job.input, inExt)), 'utf8');
    const s = await semantic(job.input, inExt, signal);
    return fsp.writeFile(output, wrapHtml(s.html, s.title, s.css), 'utf8');
  }

  // ---- Markdown
  if (out === 'md') {
    const s = await semantic(job.input, inExt, signal);
    const TurndownService = require('turndown');
    const { gfm } = require('turndown-plugin-gfm');
    const td = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced', bulletListMarker: '-' });
    td.use(gfm);
    return fsp.writeFile(output, td.turndown(s.html) + '\n', 'utf8');
  }

  // ---- EPUB
  if (out === 'epub') {
    // PDF e documentos com layout de página: motor de EPUB do GCP-PDF (refluxo a partir do PDF)
    if (inExt === 'pdf' || ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odp'].includes(inExt)) {
      const pdf = await toPdf(job.input, inExt, o, signal);
      progress(0.4);
      const analysis = await g.analyzeEpub(pdf);
      const bytes = await g.toEpub(pdf, { title: o.title || analysis.title || title, author: o.author || analysis.author || '', language: ['pt-BR', 'en', 'es'].includes(job.lang) ? job.lang : 'pt-BR', chapters: analysis.chapters });
      return write(bytes);
    }
    const s = await semantic(job.input, inExt, signal);
    progress(0.5);
    const xhtml = await htmlToXhtml(wrapHtml(s.html, s.title, s.css));
    return buildEpub(xhtml, o.title || s.title, output, s.lang || job.lang || 'pt-BR', o.author || s.author, s.cover);
  }

  // ---- OpenDocument / RTF / e-books (geradores próprios)
  if (out === 'ods' || out === 'csv') {
    let sheets;
    if (SHEET.includes(inExt)) sheets = await B.sheets().readSheets(job.input, inExt);
    else {
      const tmp = await tmpFile('xlsx');
      const r = await g.convertPdf(await toPdf(job.input, inExt, o, signal), { format: 'xlsx' });
      await fsp.writeFile(tmp, Buffer.from(r.bytes));
      sheets = await B.sheets().readSheets(tmp, 'xlsx');
      fsp.rm(path.dirname(tmp), { recursive: true, force: true }).catch(() => {});
    }
    return out === 'ods' ? B.odf().writeOds(sheets, output) : B.sheets().writeCsv(sheets, output);
  }
  if (out === 'odp') {
    let deck;
    if (SLIDE.includes(inExt)) deck = await readSlides(job.input, inExt);
    else {
      const tmp = await tmpFile('pptx');
      const r = await g.convertPdf(await toPdf(job.input, inExt, o, signal), { format: 'pptx' });
      await fsp.writeFile(tmp, Buffer.from(r.bytes));
      deck = B.slides().readPptx(tmp);
      fsp.rm(path.dirname(tmp), { recursive: true, force: true }).catch(() => {});
    }
    return B.odf().writeOdp(deck, output);
  }
  if (['odt', 'rtf', 'mobi', 'fb2'].includes(out)) {
    const s = await semantic(job.input, inExt, signal);
    progress(0.45);
    cancelled(signal);
    const { blocks } = await htmlToBlocks(wrapHtml(s.html, s.title, s.css));
    progress(0.75);
    const meta = { title: o.title || s.title, author: o.author || s.author || '', lang: s.lang || job.lang || 'pt-BR', cover: s.cover };
    if (out === 'odt') return B.odf().writeOdt(blocks, meta.title, output);
    if (out === 'rtf') return fsp.writeFile(output, B.rtf().writeRtf(blocks, meta.title), 'latin1');
    if (out === 'mobi') return B.ebooks().writeMobi(blocks, meta, output);
    return B.ebooks().writeFb2(blocks, meta, output);
  }
  throw new Error(`UNSUPPORTED:${inExt}→${out}`);
}

/** Texto de um PDF (com o motor do GCP-PDF; recupera o texto linha a linha se necessário). */
async function pdfText(input) {
  const bytes = new Uint8Array(await fsp.readFile(input));
  const r = await G().convertPdf(bytes, { format: 'txt' });
  const text = Buffer.from(r.bytes).toString('utf8');
  if (text.replace(/\s|\f/g, '').length) return text;
  const pdf = await G().loadPdf(new Uint8Array(bytes));
  const pages = [];
  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      const c = await (await pdf.getPage(i)).getTextContent();
      let line = '';
      let lastY = null;
      const lines = [];
      for (const it of c.items) {
        if (!('str' in it)) continue;
        const y = Math.round(it.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 2) { lines.push(line); line = ''; }
        line += it.str;
        if (it.hasEOL) { lines.push(line); line = ''; lastY = null; continue; }
        lastY = y;
      }
      if (line) lines.push(line);
      pages.push(lines.map((l) => l.replace(/\s+$/, '')).join('\n').replace(/\n{3,}/g, '\n\n'));
    }
  } finally { await pdf.loadingTask.destroy(); }
  return pages.join('\n\f\n');
}

/** PDF → imagens (uma por página), com o renderizador do GCP-PDF. */
async function pdfToImages(input, outBase, ext, o = {}, onProgress, signal) {
  const bytes = new Uint8Array(await fsp.readFile(input));
  const pdf = await G().loadPdf(new Uint8Array(bytes));
  const n = pdf.numPages;
  await pdf.loadingTask.destroy();
  const dpi = parseInt(o.dpi, 10) || 150;
  const outs = [];
  const { runFfmpeg } = require('./media');
  for (let i = 0; i < n; i++) {
    cancelled(signal);
    const [page] = await G().renderPdfPages(new Uint8Array(bytes), [i], dpi, () => {});
    const target = n === 1 ? `${outBase}.${ext}` : `${outBase}-${String(i + 1).padStart(3, '0')}.${ext}`;
    if (ext === 'png') await fsp.writeFile(target, Buffer.from(page.bytes));
    else {
      const tmp = path.join(os.tmpdir(), `gcp-page-${Date.now()}-${i}.png`);
      await fsp.writeFile(tmp, Buffer.from(page.bytes));
      const q = parseInt(o.quality, 10) || 88;
      const args = ext === 'jpg' ? ['-frames:v', '1', '-q:v', String(Math.round(31 - (q / 100) * 29))] : ext === 'webp' ? ['-frames:v', '1', '-c:v', 'libwebp', '-quality', String(q)] : ['-frames:v', '1'];
      try { await runFfmpeg({ input: tmp, output: target, args }); } finally { fsp.rm(tmp, { force: true }).catch(() => {}); }
    }
    outs.push(target);
    onProgress && onProgress((i + 1) / n);
  }
  return outs;
}

/* ------------------------------------------------------------------ */
/* EPUB (fontes com texto corrido)                                      */
/* ------------------------------------------------------------------ */

async function buildEpub(xhtmlBody, title, output, lang = 'pt-BR', author = '', cover = '') {
  const JSZip = require('jszip');
  const zip = new JSZip();
  const uid = 'urn:uuid:' + require('crypto').randomUUID();
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  let body = xhtmlBody.replace(/^<body[^>]*>/, '').replace(/<\/body>$/, '');
  // imagens embutidas viram arquivos do EPUB
  const images = [];
  body = body.replace(/src="data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([^"]+)"/g, (m, type, b64) => {
    const ext = { jpeg: 'jpg', 'svg+xml': 'svg' }[type] || type;
    const name = `images/img${images.length + 1}.${ext}`;
    images.push({ name, type: `image/${type}`, data: Buffer.from(b64, 'base64') });
    return `src="${name}"`;
  });
  const chunks = body.split(/(?=<h1[\s>])/i).filter((c) => c.trim());
  const chapters = (chunks.length ? chunks : [body]).map((c, i) => {
    const h = (c.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i) || [])[1];
    return { id: `c${i + 1}`, title: h ? h.replace(/<[^>]+>/g, '').trim() : `${title} ${i + 1}`, body: c };
  });
  zip.file('OEBPS/style.css', `body{font-family:serif;line-height:1.5;margin:0 5%;} h1,h2,h3{font-family:sans-serif;line-height:1.25} img{max-width:100%;height:auto} pre{white-space:pre-wrap} table{border-collapse:collapse} td,th{border:1px solid #999;padding:3px 6px}`);
  for (const ch of chapters) {
    zip.file(`OEBPS/${ch.id}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}"><head><meta charset="utf-8"/><title>${esc(ch.title)}</title><link rel="stylesheet" href="style.css"/></head><body>${ch.body.replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '')}</body></html>`);
  }
  for (const im of images) zip.file(`OEBPS/${im.name}`, im.data);
  let coverItem = '';
  let coverMeta = '';
  if (cover) {
    const m = cover.match(/^data:image\/(png|jpeg|jpg|gif|webp);base64,(.+)$/s);
    if (m) {
      const ext = m[1] === 'jpeg' ? 'jpg' : m[1];
      zip.file(`OEBPS/images/cover.${ext}`, Buffer.from(m[2], 'base64'));
      coverItem = `<item id="cover" href="images/cover.${ext}" media-type="image/${m[1] === 'jpg' ? 'jpeg' : m[1]}" properties="cover-image"/>`;
      coverMeta = '<meta name="cover" content="cover"/>';
    }
  }
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><meta charset="utf-8"/><title>${esc(title)}</title></head><body><nav epub:type="toc" id="toc"><h1>${esc(title)}</h1><ol>${chapters.map((c) => `<li><a href="${c.id}.xhtml">${esc(c.title)}</a></li>`).join('')}</ol></nav></body></html>`);
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">${uid}</dc:identifier><dc:title>${esc(title)}</dc:title><dc:language>${lang}</dc:language>${author ? `<dc:creator>${esc(author)}</dc:creator>` : ''}<meta property="dcterms:modified">${now}</meta>${coverMeta}</metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>${coverItem}${chapters.map((c) => `<item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}${images.map((im, i) => `<item id="im${i + 1}" href="${im.name}" media-type="${im.type}"/>`).join('')}</manifest>
<spine>${chapters.map((c) => `<itemref idref="${c.id}"/>`).join('')}</spine>
</package>`);
  const buf = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
  await fsp.writeFile(output, buf);
}

/* ------------------------------------------------------------------ */
/* imagens, PDF e ZIP                                                  */
/* ------------------------------------------------------------------ */

async function imagesToPdf(inputs, output, opts = {}) {
  const { PDFDocument } = require('pdf-lib');
  const pdf = await PDFDocument.create();
  const A4 = [595.28, 841.89];
  for (const input of inputs) {
    let ext = path.extname(input).slice(1).toLowerCase();
    let file = input;
    let tmp = null;
    if (!['jpg', 'jpeg', 'png'].includes(ext)) { tmp = await imageToPng(input); file = tmp; ext = 'png'; }
    const bytes = await fsp.readFile(file);
    const img = ext === 'png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    if (opts.pageSize === 'fit') {
      pdf.addPage([img.width, img.height]).drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      let [pw, ph] = opts.pageSize === 'Letter' ? [612, 792] : A4;
      if (opts.orientation === 'landscape' || (opts.orientation !== 'portrait' && img.width > img.height)) [pw, ph] = [ph, pw];
      const page = pdf.addPage([pw, ph]);
      const margin = 24;
      const scale = Math.min((pw - margin * 2) / img.width, (ph - margin * 2) / img.height, 1);
      page.drawImage(img, { x: (pw - img.width * scale) / 2, y: (ph - img.height * scale) / 2, width: img.width * scale, height: img.height * scale });
    }
    if (tmp) fsp.rm(tmp, { force: true }).catch(() => {});
  }
  pdf.setProducer('GCP Converter');
  pdf.setCreator('GCP Converter — Gestão Cultural Pro');
  await fsp.writeFile(output, await pdf.save());
}

async function viaCalibre(bin, input, output, opts, signal, onProgress) {
  const args = [input, output];
  if (opts.title) args.push('--title', opts.title);
  if (opts.author) args.push('--authors', opts.author);
  if (path.extname(output) === '.pdf') args.push('--paper-size', (opts.pageSize || 'a4').toLowerCase(), '--pdf-page-numbers');
  await new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true });
    let err = '';
    const kill = () => { try { p.kill('SIGKILL'); } catch {} };
    if (signal) signal.addEventListener('abort', kill, { once: true });
    p.stdout.on('data', (d) => {
      const m = String(d).match(/(\d+)%/g);
      if (m && onProgress) onProgress(parseInt(m[m.length - 1], 10) / 100);
    });
    p.stderr.on('data', (d) => (err = (err + d).slice(-4000)));
    p.on('error', reject);
    p.on('close', (code) => {
      if (signal && signal.aborted) return reject(Object.assign(new Error('cancelled'), { cancelled: true }));
      code === 0 ? resolve() : reject(new Error(err.trim().split(/\n/).slice(-2).join(' · ') || `Calibre: código ${code}`));
    });
  });
}

/** Compacta PDF com Ghostscript (ou regrava otimizado com pdf-lib). */
async function compressPdf(input, output, level, signal) {
  const tools = await detect();
  if (tools.ghostscript.available) {
    const setting = { light: '/printer', medium: '/ebook', strong: '/screen' }[level] || '/ebook';
    await run(tools.ghostscript.path, ['-sDEVICE=pdfwrite', '-dCompatibilityLevel=1.5', `-dPDFSETTINGS=${setting}`, '-dNOPAUSE', '-dQUIET', '-dBATCH', '-dDetectDuplicateImages=true', '-dCompressFonts=true', `-sOutputFile=${output}`, input], { signal });
    return { engine: 'ghostscript' };
  }
  const { PDFDocument } = require('pdf-lib');
  const pdf = await PDFDocument.load(await fsp.readFile(input), { ignoreEncryption: true, updateMetadata: false });
  await fsp.writeFile(output, await pdf.save({ useObjectStreams: true }));
  return { engine: 'builtin' };
}

async function mergePdfs(inputs, output) {
  const { PDFDocument } = require('pdf-lib');
  const out = await PDFDocument.create();
  for (const f of inputs) {
    const src = await PDFDocument.load(await fsp.readFile(f), { ignoreEncryption: true });
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  out.setProducer('GCP Converter');
  await fsp.writeFile(output, await out.save());
}

async function zipFiles(inputs, output, level = 6, onProgress) {
  const JSZip = require('jszip');
  const zip = new JSZip();
  const used = new Set();
  for (const f of inputs) {
    let name = path.basename(f);
    let i = 1;
    while (used.has(name)) name = `${path.basename(f, path.extname(f))} (${i++})${path.extname(f)}`;
    used.add(name);
    zip.file(name, fs.createReadStream(f));
  }
  await new Promise((resolve, reject) => {
    zip
      .generateNodeStream({ type: 'nodebuffer', streamFiles: true, compression: level > 0 ? 'DEFLATE' : 'STORE', compressionOptions: { level } }, (meta) => onProgress && onProgress(meta.percent / 100))
      .pipe(fs.createWriteStream(output))
      .on('finish', resolve)
      .on('error', reject);
  });
}

module.exports = { plan, convertDocument, compressPdf, mergePdfs, zipFiles, imagesToPdf, htmlToPdf, pdfToImages, toPdf, LABEL };
