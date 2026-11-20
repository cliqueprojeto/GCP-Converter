// E-books sem programas externos: geração de MOBI (Kindle) e FB2.
'use strict';
const fs = require('fs');
const crypto = require('crypto');
const { esc, dataUrlToBytes } = require('./util');

/* ------------------------------ imagens ------------------------------ */
function toJpeg(dataUrl, maxSide = 1200) {
  const bin = dataUrlToBytes(dataUrl);
  if (!bin) return null;
  try {
    const { nativeImage } = require('electron');
    let img = nativeImage.createFromBuffer(bin.bytes);
    if (img.isEmpty()) return bin.ext === 'jpg' || bin.ext === 'gif' ? bin.bytes : null;
    const { width, height } = img.getSize();
    if (Math.max(width, height) > maxSide) img = img.resize(width >= height ? { width: maxSide } : { height: maxSide });
    return img.toJPEG(85);
  } catch {
    return bin.ext === 'jpg' || bin.ext === 'gif' ? bin.bytes : null;
  }
}

/* ------------------------------ blocos → HTML simples ------------------------------ */
function blocksToSimpleHtml(blocks, imageRef) {
  const inl = (list) => (list || []).map((r) => {
    if (r.br) return '<br/>';
    if (r.img) { const ref = imageRef(r); return ref ? `<img ${ref}/>` : ''; }
    let t = esc(r.text || '');
    if (r.code) t = `<code>${t}</code>`;
    if (r.sup) t = `<sup>${t}</sup>`;
    if (r.sub) t = `<sub>${t}</sub>`;
    if (r.s) t = `<s>${t}</s>`;
    if (r.u && !r.href) t = `<u>${t}</u>`;
    if (r.i) t = `<i>${t}</i>`;
    if (r.b) t = `<b>${t}</b>`;
    if (r.href) t = `<a href="${esc(r.href)}">${t}</a>`;
    return t;
  }).join('');
  const block = (b) => {
    switch (b.t) {
      case 'h': return `<h${b.level}${b.align === 'center' ? ' align="center"' : ''}>${inl(b.inl)}</h${b.level}>`;
      case 'p': return `<p${b.align && b.align !== 'left' ? ` align="${b.align}"` : ''}>${inl(b.inl)}</p>`;
      case 'pre': return `<pre>${esc(b.text)}</pre>`;
      case 'quote': return `<blockquote>${b.blocks.map(block).join('')}</blockquote>`;
      case 'hr': return '<hr/>';
      case 'pagebreak': return '<mbp:pagebreak/>';
      case 'list': return `<${b.ordered ? 'ol' : 'ul'}>${b.items.map((it) => `<li>${it.map((x) => (x.t === 'p' ? inl(x.inl) : block(x))).join('<br/>')}</li>`).join('')}</${b.ordered ? 'ol' : 'ul'}>`;
      case 'table': return `<table border="1">${b.rows.map((r) => `<tr>${r.map((c) => `<${c.head ? 'th' : 'td'}${c.colspan > 1 ? ` colspan="${c.colspan}"` : ''}>${c.blocks.map((x) => (x.t === 'p' ? inl(x.inl) : block(x))).join('<br/>')}</${c.head ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</table>`;
      default: return '';
    }
  };
  // capítulos começam em nova página
  return blocks.map((b, i) => (b.t === 'h' && b.level === 1 && i > 0 ? '<mbp:pagebreak/>' : '') + block(b)).join('\n');
}

/* ------------------------------ MOBI ------------------------------ */
const LOCALE = { 'pt-BR': 0x0416, pt: 0x0416, en: 0x0409, es: 0x0c0a };

function u16(n) { const b = Buffer.alloc(2); b.writeUInt16BE(n & 0xffff); return b; }
function u32(n) { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; }

/** Gera um arquivo MOBI (formato Kindle) a partir dos blocos. */
function writeMobi(blocks, meta, out) {
  const images = [];
  let coverIndex = -1;
  if (meta.cover) {
    const j = toJpeg(meta.cover);
    if (j) { images.push(j); coverIndex = 0; }
  }
  const imgRef = (r) => {
    const j = toJpeg(r.img);
    if (!j) return '';
    images.push(j);
    return `recindex="${String(images.length).padStart(5, '0')}"`;
  };
  const body = blocksToSimpleHtml(blocks, imgRef);
  const html = `<html><head><guide></guide></head><body>${meta.title ? `<h1 align="center">${esc(meta.title)}</h1>${meta.author ? `<p align="center"><i>${esc(meta.author)}</i></p>` : ''}<mbp:pagebreak/>` : ''}${body}</body></html>`;
  const text = Buffer.from(html, 'utf8');

  // registros de texto: 4096 bytes + bytes de continuação UTF-8 (flag multibyte)
  const RS = 4096;
  const textRecords = [];
  for (let pos = 0; pos < text.length; pos += RS) {
    const chunk = text.subarray(pos, Math.min(pos + RS, text.length));
    let overlap = Buffer.alloc(0);
    const end = pos + chunk.length;
    if (end < text.length) {
      let k = 0;
      while (k < 3 && end + k < text.length && (text[end + k] & 0xc0) === 0x80) k++;
      overlap = text.subarray(end, end + k);
    }
    textRecords.push(Buffer.concat([chunk, overlap, Buffer.from([overlap.length])]));
  }

  const nText = textRecords.length;
  const firstImage = images.length ? nText + 1 : 0xffffffff;
  const flisIndex = nText + 1 + images.length;
  const fcisIndex = flisIndex + 1;
  const lastContent = images.length ? nText + images.length : nText;

  // EXTH
  const exthRecs = [];
  const addExth = (type, data) => {
    const d = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
    exthRecs.push(Buffer.concat([u32(type), u32(d.length + 8), d]));
  };
  if (meta.author) addExth(100, meta.author);
  addExth(101, meta.publisher || 'GCP Converter');
  if (meta.description) addExth(103, meta.description);
  addExth(106, new Date().toISOString().slice(0, 10));
  addExth(503, meta.title || 'Sem título');
  addExth(524, meta.lang || 'pt-BR');
  if (coverIndex >= 0) { addExth(201, u32(coverIndex)); addExth(203, u32(0)); }
  let exthBody = Buffer.concat(exthRecs);
  const exthLen = 12 + exthBody.length;
  const exthPad = (4 - (exthLen % 4)) % 4;
  const exth = Buffer.concat([Buffer.from('EXTH'), u32(exthLen + exthPad), u32(exthRecs.length), exthBody, Buffer.alloc(exthPad)]);

  const title = Buffer.from(meta.title || 'Sem título', 'utf8');
  const MOBI_LEN = 232;
  const fullNameOffset = 16 + MOBI_LEN + exth.length;

  const mobi = Buffer.alloc(MOBI_LEN, 0);
  mobi.write('MOBI', 0);
  mobi.writeUInt32BE(MOBI_LEN, 0x04);
  mobi.writeUInt32BE(2, 0x08); // livro
  mobi.writeUInt32BE(65001, 0x0c); // UTF-8
  mobi.writeUInt32BE(crypto.randomBytes(4).readUInt32BE(0), 0x10);
  mobi.writeUInt32BE(6, 0x14); // versão
  for (let o = 0x18; o <= 0x3c; o += 4) mobi.writeUInt32BE(0xffffffff, o);
  mobi.writeUInt32BE(images.length ? firstImage : flisIndex, 0x40); // primeiro registro fora do texto
  mobi.writeUInt32BE(fullNameOffset, 0x44);
  mobi.writeUInt32BE(title.length, 0x48);
  mobi.writeUInt32BE(LOCALE[meta.lang] || LOCALE['pt-BR'], 0x4c);
  mobi.writeUInt32BE(6, 0x58); // versão mínima
  mobi.writeUInt32BE(firstImage, 0x5c);
  mobi.writeUInt32BE(0x50, 0x70); // tem EXTH
  mobi.writeUInt32BE(0xffffffff, 0x94);
  mobi.writeUInt32BE(0xffffffff, 0x98); // sem DRM
  mobi.writeUInt16BE(1, 0xb0); // primeiro registro de conteúdo
  mobi.writeUInt16BE(lastContent, 0xb2);
  mobi.writeUInt32BE(1, 0xb4);
  mobi.writeUInt32BE(fcisIndex, 0xb8);
  mobi.writeUInt32BE(1, 0xbc);
  mobi.writeUInt32BE(flisIndex, 0xc0);
  mobi.writeUInt32BE(1, 0xc4);
  mobi.writeUInt32BE(0xffffffff, 0xd0);
  mobi.writeUInt32BE(0xffffffff, 0xd8);
  mobi.writeUInt32BE(0xffffffff, 0xdc);
  mobi.writeUInt32BE(1, 0xe0); // flags extras: bytes multibyte no fim dos registros
  mobi.writeUInt32BE(0xffffffff, 0xe4);

  const palmdoc = Buffer.concat([u16(1), u16(0), u32(text.length), u16(nText), u16(RS), u16(0), u16(0)]);
  let rec0 = Buffer.concat([palmdoc, mobi, exth, title, Buffer.alloc(2)]);
  rec0 = Buffer.concat([rec0, Buffer.alloc((4 - (rec0.length % 4)) % 4), Buffer.alloc(1024 * 2)]);

  const flis = Buffer.from('464c4953000000080041000000000000ffffffff000100030000000300000001ffffffff', 'hex');
  const fcis = Buffer.concat([Buffer.from('46434953000000140000001000000001', 'hex'), Buffer.alloc(4), u32(text.length), Buffer.from('00000000000000200000000800010001' + '00000000', 'hex')]);
  const eof = Buffer.from([0xe9, 0x8e, 0x0d, 0x0a]);

  const records = [rec0, ...textRecords, ...images, flis, fcis, eof];

  // cabeçalho PDB
  const n = records.length;
  const header = Buffer.alloc(78, 0);
  const name = (meta.title || 'book').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9 _-]/g, '_').slice(0, 31);
  header.write(name, 0, 'latin1');
  const now = Math.floor(Date.now() / 1000) + 2082844800;
  header.writeUInt32BE(now >>> 0, 36);
  header.writeUInt32BE(now >>> 0, 40);
  header.write('BOOK', 60);
  header.write('MOBI', 64);
  header.writeUInt32BE(2 * n - 1, 68);
  header.writeUInt16BE(n, 76);
  const list = Buffer.alloc(8 * n + 2, 0);
  let offset = 78 + list.length;
  records.forEach((r, i) => {
    list.writeUInt32BE(offset, i * 8);
    list.writeUInt32BE((2 * i) & 0xffffff, i * 8 + 4);
    offset += r.length;
  });
  fs.writeFileSync(out, Buffer.concat([header, list, ...records]));
}

/* ------------------------------ FB2 ------------------------------ */
function writeFb2(blocks, meta, out) {
  const binaries = [];
  const imgRef = (r) => {
    const j = toJpeg(r.img, 1600);
    if (!j) return '';
    const id = `img${binaries.length + 1}.jpg`;
    binaries.push(`<binary id="${id}" content-type="image/jpeg">${j.toString('base64')}</binary>`);
    return `<image l:href="#${id}"/>`;
  };
  const inl = (list) => (list || []).map((r) => {
    if (r.br) return '';
    if (r.img) return imgRef(r);
    let t = esc(r.text || '');
    if (r.code) t = `<code>${t}</code>`;
    if (r.sup) t = `<sup>${t}</sup>`;
    if (r.sub) t = `<sub>${t}</sub>`;
    if (r.s) t = `<strikethrough>${t}</strikethrough>`;
    if (r.i) t = `<emphasis>${t}</emphasis>`;
    if (r.b) t = `<strong>${t}</strong>`;
    if (r.href) t = `<a l:href="${esc(r.href)}">${t}</a>`;
    return t;
  }).join('');
  // imagens fora de parágrafos (FB2 não aceita <image> dentro de <p> com texto)
  const para = (list) => {
    const imgs = (list || []).filter((r) => r.img);
    const txt = (list || []).filter((r) => !r.img);
    return (txt.some((r) => r.text && r.text.trim()) ? `<p>${inl(txt)}</p>` : '') + imgs.map((r) => imgRef(r)).join('');
  };
  const block = (b) => {
    switch (b.t) {
      case 'h': return b.level <= 1 ? '' : `<subtitle>${inl(b.inl.filter((r) => !r.img))}</subtitle>`;
      case 'p': return para(b.inl);
      case 'pre': return b.text.split('\n').map((l) => `<p><code>${esc(l)}</code></p>`).join('');
      case 'quote': return `<cite>${b.blocks.map(block).join('')}</cite>`;
      case 'hr': return '<empty-line/>';
      case 'list': return b.items.map((it, k) => it.map((x, j) => (x.t === 'p' ? `<p>${j === 0 ? (b.ordered ? `${k + 1}. ` : '• ') : ''}${inl(x.inl.filter((r) => !r.img))}</p>` : block(x))).join('')).join('');
      case 'table': return `<table>${b.rows.map((r) => `<tr>${r.map((c) => `<${c.head ? 'th' : 'td'}>${c.blocks.map((x) => (x.t === 'p' ? inl(x.inl.filter((y) => !y.img)) : '')).join(' ')}</${c.head ? 'th' : 'td'}>`).join('')}</tr>`).join('')}</table>`;
      default: return '';
    }
  };
  // seções por <h1>
  const sections = [];
  let cur = { title: null, items: [] };
  for (const b of blocks) {
    if (b.t === 'h' && b.level === 1) {
      if (cur.title || cur.items.length) sections.push(cur);
      cur = { title: b.inl.filter((r) => !r.img), items: [] };
    } else cur.items.push(b);
  }
  sections.push(cur);
  const [first, last] = String(meta.author || '').trim().split(/\s+(?=\S+$)/);
  let coverXml = '';
  if (meta.cover) {
    const j = toJpeg(meta.cover, 1600);
    if (j) { binaries.unshift(`<binary id="cover.jpg" content-type="image/jpeg">${j.toString('base64')}</binary>`); coverXml = '<coverpage><image l:href="#cover.jpg"/></coverpage>'; }
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0" xmlns:l="http://www.w3.org/1999/xlink">
<description><title-info><genre>prose</genre><author>${meta.author ? `<first-name>${esc(last ? first : '')}</first-name><last-name>${esc(last || first)}</last-name>` : '<nickname>—</nickname>'}</author><book-title>${esc(meta.title || 'Sem título')}</book-title>${coverXml}<lang>${esc((meta.lang || 'pt').slice(0, 2))}</lang></title-info>
<document-info><author><nickname>GCP Converter</nickname></author><program-used>GCP Converter</program-used><date value="${new Date().toISOString().slice(0, 10)}">${new Date().toISOString().slice(0, 10)}</date><id>${crypto.randomUUID()}</id><version>1.0</version></document-info></description>
<body><title><p>${esc(meta.title || 'Sem título')}</p></title>${sections.map((s) => `<section>${s.title ? `<title><p>${inl(s.title)}</p></title>` : ''}${s.items.map(block).join('') || '<empty-line/>'}</section>`).join('')}</body>
${binaries.join('\n')}
</FictionBook>`;
  fs.writeFileSync(out, xml, 'utf8');
}

module.exports = { writeMobi, writeFb2, blocksToSimpleHtml };
