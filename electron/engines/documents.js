// Conversão de documentos e e-books.
// Motores embutidos: Chromium (HTML→PDF), mammoth (DOCX), marked (Markdown),
// pdf-lib (PDF), JSZip (EPUB/ZIP). Motores opcionais do sistema: LibreOffice,
// Calibre, Pandoc, Ghostscript e Poppler.
'use strict';
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const { BrowserWindow } = require('electron');
const { detect } = require('./tools');

const OFFICE_IN = ['doc', 'docx', 'odt', 'rtf', 'txt', 'html', 'htm', 'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'wpd', 'pages', 'key', 'numbers', 'md'];
const OFFICE_OUT = {
  text: ['pdf', 'docx', 'odt', 'rtf', 'txt', 'html'],
  sheet: ['pdf', 'xlsx', 'ods', 'csv', 'html'],
  slides: ['pdf', 'pptx', 'odp', 'html']
};
const SHEET_IN = ['xls', 'xlsx', 'ods', 'csv', 'numbers'];
const SLIDE_IN = ['ppt', 'pptx', 'odp', 'key'];
const CALIBRE_IN = ['epub', 'mobi', 'azw', 'azw3', 'kfx', 'fb2', 'lit', 'pdb', 'lrf', 'cbz', 'cbr', 'cb7', 'djvu', 'pdf', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown', 'html', 'htm'];
const CALIBRE_OUT = ['epub', 'mobi', 'azw3', 'fb2', 'pdf', 'docx', 'txt', 'html', 'rtf', 'htmlz', 'txtz', 'pdb', 'lrf', 'snb', 'tcr', 'oeb', 'pml', 'rb', 'odt'];
const PANDOC_IN = ['md', 'markdown', 'html', 'htm', 'docx', 'odt', 'rtf', 'epub', 'txt', 'tex', 'rst', 'fb2'];
const PANDOC_OUT = ['md', 'html', 'docx', 'odt', 'rtf', 'epub', 'txt', 'fb2'];
const IMG_IN = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'];
const BUILTIN_HTML_SOURCES = ['md', 'markdown', 'txt', 'html', 'htm', 'docx', 'epub'];
const BUILTIN_HTML_TARGETS = ['pdf', 'html', 'txt', 'md', 'epub'];

const LABEL = { builtin: 'GCP (embutido)', libreoffice: 'LibreOffice', calibre: 'Calibre', pandoc: 'Pandoc', ghostscript: 'Ghostscript', poppler: 'Poppler' };

/**
 * Decide qual motor usa para converter `inExt` em `outExt`.
 * Retorna { engine } ou { missing: [motores que resolveriam] }.
 */
function plan(inExt, outExt, tools, kind) {
  inExt = inExt.toLowerCase();
  const has = (id) => tools[id] && tools[id].available;
  if (inExt === outExt || (inExt === 'htm' && outExt === 'html') || (inExt === 'markdown' && outExt === 'md')) return { engine: 'copy' };
  const candidates = [];

  // Imagens → PDF (pdf-lib)
  if (IMG_IN.includes(inExt) && outExt === 'pdf') candidates.push('builtin');
  // PDF → TXT/imagens (Poppler)
  if (inExt === 'pdf' && ['txt', 'html'].includes(outExt)) candidates.push('poppler');
  // Caminhos embutidos via HTML
  if (BUILTIN_HTML_SOURCES.includes(inExt) && BUILTIN_HTML_TARGETS.includes(outExt)) {
    // Para e-books preferimos Calibre quando instalado (melhor fidelidade)
    if (kind === 'ebook' && has('calibre') && !['md'].includes(outExt)) candidates.push('calibre');
    candidates.push('builtin');
  }
  // Escritório
  const officeTargets = SHEET_IN.includes(inExt) ? OFFICE_OUT.sheet : SLIDE_IN.includes(inExt) ? OFFICE_OUT.slides : OFFICE_OUT.text;
  if (OFFICE_IN.includes(inExt) && officeTargets.includes(outExt) && inExt !== 'md') candidates.push('libreoffice');
  if (inExt === 'pdf' && ['docx', 'odt'].includes(outExt)) candidates.push('libreoffice');
  // Markup
  if (PANDOC_IN.includes(inExt) && PANDOC_OUT.includes(outExt)) candidates.push('pandoc');
  // E-books
  if (CALIBRE_IN.includes(inExt) && CALIBRE_OUT.includes(outExt)) candidates.push('calibre');
  // Markdown → formatos de escritório: Pandoc ou (HTML intermediário + LibreOffice)
  if (['md', 'markdown', 'epub'].includes(inExt) && ['docx', 'odt', 'rtf'].includes(outExt)) candidates.push('builtin+libreoffice');

  const unique = [...new Set(candidates)];
  for (const c of unique) {
    if (c === 'builtin') return { engine: 'builtin' };
    if (c === 'builtin+libreoffice' && has('libreoffice')) return { engine: c };
    if (has(c)) return { engine: c };
  }
  const missing = unique.filter((c) => c !== 'builtin').map((c) => c.replace('builtin+', ''));
  return { missing: [...new Set(missing)] };
}

/* ------------------------------------------------------------------ */
/* utilidades                                                          */
/* ------------------------------------------------------------------ */

function run(bin, args, { signal, cwd, timeout = 30 * 60 * 1000 } = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { cwd, windowsHide: true });
    let out = '';
    let err = '';
    const kill = () => { try { p.kill('SIGKILL'); } catch {} };
    const timer = setTimeout(kill, timeout);
    if (signal) signal.addEventListener('abort', kill, { once: true });
    p.stdout.on('data', (d) => (out = (out + d).slice(-20000)));
    p.stderr.on('data', (d) => (err = (err + d).slice(-8000)));
    p.on('error', (e) => { clearTimeout(timer); reject(e); });
    p.on('close', (code) => {
      clearTimeout(timer);
      if (signal && signal.aborted) return reject(Object.assign(new Error('cancelled'), { cancelled: true }));
      if (code === 0) resolve({ out, err });
      else reject(new Error((err || out).trim().split(/\r?\n/).slice(-3).join(' · ') || `código ${code}`));
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const DOC_CSS = `
  @page { margin: 18mm 16mm; }
  html { -webkit-print-color-adjust: exact; }
  body { font-family: "Inter", "Segoe UI", "Helvetica Neue", Arial, sans-serif; font-size: 11.5pt; line-height: 1.6; color: #1b2235; max-width: 900px; margin: 0 auto; padding: 24px; }
  h1, h2, h3, h4 { color: #0f172a; line-height: 1.25; margin: 1.4em 0 .5em; }
  h1 { font-size: 24pt; border-bottom: 3px solid #8b5cf6; padding-bottom: .2em; }
  h2 { font-size: 17pt; } h3 { font-size: 14pt; }
  a { color: #7c3aed; }
  img { max-width: 100%; height: auto; }
  pre { background: #f4f5fb; padding: 12px 14px; border-radius: 8px; overflow-x: auto; font-size: 9.5pt; white-space: pre-wrap; }
  code { font-family: "JetBrains Mono", Consolas, monospace; background: #f4f5fb; padding: 1px 4px; border-radius: 4px; }
  pre code { background: none; padding: 0; }
  blockquote { border-left: 4px solid #c4b5fd; margin: 1em 0; padding: .2em 1em; color: #475069; background: #faf8ff; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 10pt; }
  th, td { border: 1px solid #d9dcea; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f1effc; }
  hr { border: none; border-top: 1px solid #d9dcea; margin: 2em 0; }
  .txt { white-space: pre-wrap; font-family: "JetBrains Mono", Consolas, monospace; font-size: 10pt; }
`;

function wrapHtml(body, title, extraCss = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${DOC_CSS}${extraCss}</style></head><body>${body}</body></html>`;
}

/** Lê qualquer fonte suportada e retorna { html (corpo), title }. */
async function sourceToHtml(input, inExt) {
  const title = path.basename(input, path.extname(input));
  if (inExt === 'md' || inExt === 'markdown') {
    const { marked } = require('marked');
    const md = await fsp.readFile(input, 'utf8');
    return { html: marked.parse(md, { gfm: true }), title, baseDir: path.dirname(input) };
  }
  if (inExt === 'txt') {
    const txt = await fsp.readFile(input, 'utf8');
    return { html: `<div class="txt">${escapeHtml(txt)}</div>`, title, plain: txt };
  }
  if (inExt === 'html' || inExt === 'htm') {
    const raw = await fsp.readFile(input, 'utf8');
    const m = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const styles = (raw.match(/<style[\s\S]*?<\/style>/gi) || []).join('');
    return { html: styles + (m ? m[1] : raw), title: (raw.match(/<title>([^<]*)<\/title>/i) || [])[1] || title, baseDir: path.dirname(input), full: raw };
  }
  if (inExt === 'docx') {
    const mammoth = require('mammoth');
    const res = await mammoth.convertToHtml({ path: input });
    return { html: res.value, title };
  }
  if (inExt === 'epub') return epubToHtml(input);
  throw new Error(`Formato de origem não suportado: ${inExt}`);
}

async function epubToHtml(input) {
  const JSZip = require('jszip');
  const zip = await JSZip.loadAsync(await fsp.readFile(input));
  const container = await zip.file('META-INF/container.xml').async('string');
  const opfPath = container.match(/full-path="([^"]+)"/)[1];
  const opfDir = path.posix.dirname(opfPath);
  const opf = await zip.file(opfPath).async('string');
  const title = ((opf.match(/<dc:title[^>]*>([^<]+)</) || [])[1] || path.basename(input, '.epub')).trim();
  const manifest = {};
  for (const m of opf.matchAll(/<item\b([^>]*)\/?>/g)) {
    const id = (m[1].match(/\bid="([^"]+)"/) || [])[1];
    const href = (m[1].match(/\bhref="([^"]+)"/) || [])[1];
    const type = (m[1].match(/media-type="([^"]+)"/) || [])[1];
    if (id && href) manifest[id] = { href: decodeURIComponent(href), type };
  }
  const spine = [...opf.matchAll(/<itemref[^>]*idref="([^"]+)"/g)].map((m) => m[1]);
  const join = (base, rel) => path.posix.normalize(path.posix.join(base, rel));
  const parts = [];
  for (const id of spine) {
    const item = manifest[id];
    if (!item) continue;
    const full = join(opfDir, item.href);
    const f = zip.file(full);
    if (!f) continue;
    let html = await f.async('string');
    const body = (html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [])[1] || html;
    // Embute imagens como data URI
    const dir = path.posix.dirname(full);
    const replaced = [];
    for (const im of body.matchAll(/(?:src|xlink:href|href)="([^"]+\.(?:png|jpe?g|gif|svg|webp))"/gi)) {
      const imgPath = join(dir, decodeURIComponent(im[1]));
      const imgFile = zip.file(imgPath);
      if (imgFile) {
        const b64 = await imgFile.async('base64');
        const ext = path.extname(imgPath).slice(1).toLowerCase().replace('jpg', 'jpeg').replace('svg', 'svg+xml');
        replaced.push([im[1], `data:image/${ext};base64,${b64}`]);
      }
    }
    let out = body;
    for (const [a, b] of replaced) out = out.split(`"${a}"`).join(`"${b}"`);
    parts.push(`<section class="chapter">${out}</section>`);
  }
  return { html: parts.join('\n<hr/>\n'), title };
}

/** Abre HTML em janela oculta do Chromium para extrair texto, XHTML ou gerar PDF. */
async function withHiddenPage(fullHtml, baseDir, fn) {
  const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-doc-'));
  const file = path.join(baseDir && fs.existsSync(baseDir) ? baseDir : tmpDir, `.gcp-render-${process.pid}-${Date.now()}.html`);
  let writtenFile = file;
  try {
    await fsp.writeFile(file, fullHtml, 'utf8');
  } catch {
    writtenFile = path.join(tmpDir, 'render.html');
    await fsp.writeFile(writtenFile, fullHtml, 'utf8');
  }
  const win = new BrowserWindow({ show: false, width: 1000, height: 1400, webPreferences: { offscreen: false, javascript: true, sandbox: true } });
  try {
    await win.loadFile(writtenFile);
    await new Promise((r) => setTimeout(r, 150));
    return await fn(win);
  } finally {
    win.destroy();
    fsp.rm(writtenFile, { force: true }).catch(() => {});
    fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function htmlToPdf(fullHtml, baseDir, output, opts = {}) {
  await withHiddenPage(fullHtml, baseDir, async (win) => {
    const data = await win.webContents.printToPDF({
      pageSize: opts.pageSize || 'A4',
      landscape: opts.orientation === 'landscape',
      printBackground: true,
      margins: { marginType: 'default' },
      generateDocumentOutline: true
    });
    await fsp.writeFile(output, data);
  });
}

async function htmlToText(fullHtml) {
  return withHiddenPage(fullHtml, null, (win) => win.webContents.executeJavaScript('document.body.innerText'));
}

async function htmlToXhtml(fullHtml) {
  return withHiddenPage(fullHtml, null, (win) =>
    win.webContents.executeJavaScript(`(function(){
      document.querySelectorAll('script').forEach(s=>s.remove());
      return new XMLSerializer().serializeToString(document.body);
    })()`)
  );
}

function htmlToMarkdownBasic(html) {
  // Conversão simples (sem dependências) — Pandoc é usado quando disponível.
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, '')
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n${'#'.repeat(+n)} ${t.replace(/<[^>]+>/g, '').trim()}\n\n`)
    .replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, '**$2**')
    .replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, '*$2*')
    .replace(/<a [^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)')
    .replace(/<img [^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, '![$2]($1)')
    .replace(/<img [^>]*src="([^"]*)"[^>]*>/gi, '![]($1)')
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n')
    .replace(/<br\s*\/?>/gi, '  \n')
    .replace(/<\/(p|div|ul|ol|table|tr|blockquote|section)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim() + '\n';
}

/** Gera um EPUB 3 a partir de um corpo XHTML. */
async function buildEpub(xhtmlBody, title, output, lang = 'pt-BR') {
  const JSZip = require('jszip');
  const zip = new JSZip();
  const uid = 'urn:uuid:' + require('crypto').randomUUID();
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  zip.file('META-INF/container.xml', `<?xml version="1.0" encoding="UTF-8"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`);
  // Divide em capítulos por <h1>
  const body = xhtmlBody.replace(/^<body[^>]*>/, '').replace(/<\/body>$/, '');
  const chunks = body.split(/(?=<h1[\s>])/i).filter((c) => c.trim());
  const chapters = (chunks.length ? chunks : [body]).map((c, i) => {
    const h = (c.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i) || [])[1];
    return { id: `c${i + 1}`, title: h ? h.replace(/<[^>]+>/g, '').trim() : `${title} ${i + 1}`, body: c };
  });
  const css = `body{font-family:serif;line-height:1.5;margin:0 5%;} h1,h2,h3{font-family:sans-serif;} img{max-width:100%;} pre{white-space:pre-wrap;}`;
  zip.file('OEBPS/style.css', css);
  for (const ch of chapters) {
    zip.file(`OEBPS/${ch.id}.xhtml`, `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${lang}"><head><meta charset="utf-8"/><title>${escapeHtml(ch.title)}</title><link rel="stylesheet" href="style.css"/></head><body>${ch.body.replace(/ xmlns="http:\/\/www.w3.org\/1999\/xhtml"/g, '')}</body></html>`);
  }
  zip.file('OEBPS/nav.xhtml', `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><meta charset="utf-8"/><title>${escapeHtml(title)}</title></head><body><nav epub:type="toc" id="toc"><h1>${escapeHtml(title)}</h1><ol>${chapters.map((c) => `<li><a href="${c.id}.xhtml">${escapeHtml(c.title)}</a></li>`).join('')}</ol></nav></body></html>`);
  zip.file('OEBPS/content.opf', `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${lang}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="uid">${uid}</dc:identifier><dc:title>${escapeHtml(title)}</dc:title><dc:language>${lang}</dc:language><dc:creator>GCP Converter</dc:creator><meta property="dcterms:modified">${now}</meta></metadata>
<manifest><item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="css" href="style.css" media-type="text/css"/>${chapters.map((c) => `<item id="${c.id}" href="${c.id}.xhtml" media-type="application/xhtml+xml"/>`).join('')}</manifest>
<spine>${chapters.map((c) => `<itemref idref="${c.id}"/>`).join('')}</spine>
</package>`);
  const buf = await zip.generateAsync({ type: 'nodebuffer', mimeType: 'application/epub+zip', compression: 'DEFLATE' });
  await fsp.writeFile(output, buf);
}

async function imagesToPdf(inputs, output, opts = {}) {
  const { PDFDocument } = require('pdf-lib');
  const { runFfmpeg } = require('./media');
  const pdf = await PDFDocument.create();
  const A4 = [595.28, 841.89];
  for (const input of inputs) {
    let ext = path.extname(input).slice(1).toLowerCase();
    let file = input;
    let tmp = null;
    if (!['jpg', 'jpeg', 'png'].includes(ext)) {
      tmp = path.join(os.tmpdir(), `gcp-img-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
      await runFfmpeg({ input, output: tmp, args: ['-frames:v', '1'] });
      file = tmp;
      ext = 'png';
    }
    const bytes = await fsp.readFile(file);
    const img = ext === 'png' ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    if (opts.pageSize === 'fit') {
      const page = pdf.addPage([img.width, img.height]);
      page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
    } else {
      let [pw, ph] = opts.pageSize === 'Letter' ? [612, 792] : A4;
      if (opts.orientation === 'landscape' || (opts.orientation !== 'portrait' && img.width > img.height)) [pw, ph] = [ph, pw];
      const page = pdf.addPage([pw, ph]);
      const margin = 24;
      const scale = Math.min((pw - margin * 2) / img.width, (ph - margin * 2) / img.height, 1);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
    if (tmp) fsp.rm(tmp, { force: true }).catch(() => {});
  }
  pdf.setProducer('GCP Converter');
  pdf.setCreator('GCP Converter — Gestão Cultural Pro');
  await fsp.writeFile(output, await pdf.save());
}

/* ------------------------------------------------------------------ */
/* motores externos                                                    */
/* ------------------------------------------------------------------ */

async function viaLibreOffice(bin, input, outExt, output, signal) {
  const outDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-lo-'));
  const profile = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-lo-profile-'));
  const profileUrl = 'file://' + (process.platform === 'win32' ? '/' : '') + profile.replace(/\\/g, '/');
  let filter = outExt;
  if (outExt === 'txt') filter = 'txt:Text (encoded):UTF8';
  if (outExt === 'csv') filter = 'csv:Text - txt - csv (StarCalc):44,34,76,1';
  if (outExt === 'html') filter = 'html';
  const inExt = path.extname(input).slice(1).toLowerCase();
  // Entrada HTML abre no Writer/Web: é preciso indicar o filtro de exportação
  if (['html', 'htm'].includes(inExt)) {
    const web = { docx: 'docx:MS Word 2007 XML', odt: 'odt:writer8', rtf: 'rtf:Rich Text Format', pdf: 'pdf:writer_web_pdf_Export', txt: 'txt:Text (encoded):UTF8' };
    if (web[outExt]) filter = web[outExt];
  }
  const args = [`-env:UserInstallation=${profileUrl}`, '--headless', '--norestore', '--nologo'];
  if (inExt === 'pdf') args.push('--infilter=writer_pdf_import');
  args.push('--convert-to', filter, '--outdir', outDir, input);
  try {
    await run(bin, args, { signal });
    const files = await fsp.readdir(outDir);
    const produced = files.find((f) => f.toLowerCase().endsWith('.' + outExt)) || files[0];
    if (!produced) throw new Error('LibreOffice não gerou saída');
    await moveFile(path.join(outDir, produced), output);
  } finally {
    fsp.rm(outDir, { recursive: true, force: true }).catch(() => {});
    fsp.rm(profile, { recursive: true, force: true }).catch(() => {});
  }
}

async function moveFile(src, dst) {
  try {
    await fsp.rename(src, dst);
  } catch {
    await fsp.copyFile(src, dst);
    await fsp.rm(src, { force: true });
  }
}

async function viaCalibre(bin, input, output, opts, signal, onProgress) {
  const args = [input, output];
  if (opts.title) args.push('--title', opts.title);
  if (opts.author) args.push('--authors', opts.author);
  if (opts.cover) args.push('--cover', opts.cover);
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

async function viaPandoc(bin, input, inExt, outExt, output, signal) {
  const fromMap = { md: 'markdown', markdown: 'markdown', htm: 'html', txt: 'markdown', tex: 'latex' };
  const toMap = { md: 'gfm', txt: 'plain' };
  const args = [input, '-f', fromMap[inExt] || inExt, '-t', toMap[outExt] || outExt, '-o', output, '--standalone'];
  if (['docx', 'odt', 'epub'].includes(inExt)) args.push('--extract-media=' + path.join(path.dirname(output), path.basename(output, path.extname(output)) + '_media'));
  await run(bin, args, { signal });
}

/* ------------------------------------------------------------------ */
/* entrada principal                                                   */
/* ------------------------------------------------------------------ */

async function convertDocument(job, output, onProgress, signal) {
  const tools = await detect();
  const inExt = path.extname(job.input).slice(1).toLowerCase();
  const outExt = job.ext;
  const o = job.options || {};
  const p = plan(inExt, outExt, tools, job.kind);
  if (!p.engine) {
    const names = (p.missing || []).map((m) => LABEL[m] || m).join(' ou ');
    const err = new Error(names ? `MISSING_ENGINE:${names}` : `UNSUPPORTED:${inExt}→${outExt}`);
    err.missing = p.missing;
    throw err;
  }
  onProgress && onProgress(0.05);
  job.engine = p.engine;

  if (p.engine === 'copy') {
    await fsp.copyFile(job.input, output);
  } else if (p.engine === 'libreoffice') {
    await viaLibreOffice(tools.libreoffice.path, job.input, outExt, output, signal);
  } else if (p.engine === 'calibre') {
    await viaCalibre(tools.calibre.path, job.input, output, o, signal, onProgress);
  } else if (p.engine === 'pandoc') {
    await viaPandoc(tools.pandoc.path, job.input, inExt, outExt, output, signal);
  } else if (p.engine === 'poppler') {
    const bin = tools.poppler.path.replace(/pdftoppm(\.exe)?$/i, (m, e) => (outExt === 'txt' ? 'pdftotext' : 'pdftohtml') + (e || ''));
    await run(bin, outExt === 'txt' ? ['-layout', job.input, output] : ['-s', '-noframes', job.input, output], { signal });
  } else if (p.engine === 'builtin+libreoffice') {
    const src = await sourceToHtml(job.input, inExt);
    const tmp = path.join(os.tmpdir(), `gcp-${Date.now()}.html`);
    await fsp.writeFile(tmp, wrapHtml(src.html, src.title));
    try {
      await viaLibreOffice(tools.libreoffice.path, tmp, outExt, output, signal);
    } finally {
      fsp.rm(tmp, { force: true }).catch(() => {});
    }
  } else if (IMG_IN.includes(inExt) && outExt === 'pdf') {
    await imagesToPdf([job.input], output, o);
  } else {
    // Embutido via HTML
    const src = await sourceToHtml(job.input, inExt);
    onProgress && onProgress(0.4);
    const full = src.full && outExt === 'pdf' ? src.full : wrapHtml(src.html, src.title, o.extraCss || '');
    if (outExt === 'pdf') await htmlToPdf(full, src.baseDir, output, o);
    else if (outExt === 'html') await fsp.writeFile(output, wrapHtml(src.html, src.title));
    else if (outExt === 'txt') await fsp.writeFile(output, src.plain != null ? src.plain : await htmlToText(full), 'utf8');
    else if (outExt === 'md') {
      if (inExt === 'docx') {
        const mammoth = require('mammoth');
        const r = await mammoth.convertToMarkdown({ path: job.input });
        await fsp.writeFile(output, r.value, 'utf8');
      } else if (inExt === 'txt') await fsp.copyFile(job.input, output);
      else await fsp.writeFile(output, htmlToMarkdownBasic(src.html), 'utf8');
    } else if (outExt === 'epub') {
      const xhtml = await htmlToXhtml(wrapHtml(src.html, src.title));
      await buildEpub(xhtml, o.title || src.title, output, job.lang || 'pt-BR');
    }
  }
  return { engine: p.engine };
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

/** Une vários PDFs em um só. */
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

/** Cria um arquivo ZIP com vários arquivos. */
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

module.exports = { plan, convertDocument, compressPdf, mergePdfs, zipFiles, imagesToPdf, htmlToPdf, LABEL };
