// OpenDocument (ODT, ODS, ODP): leitura e escrita sem programas externos.
'use strict';
const fs = require('fs');
const { unzipSync, zipSync, strFromU8, strToU8 } = require('fflate');
const { DOMParser } = require('@xmldom/xmldom');
const { esc, imageMime, dataUrlToBytes } = require('./util');

const NS = {
  office: 'urn:oasis:names:tc:opendocument:xmlns:office:1.0',
  style: 'urn:oasis:names:tc:opendocument:xmlns:style:1.0',
  text: 'urn:oasis:names:tc:opendocument:xmlns:text:1.0',
  table: 'urn:oasis:names:tc:opendocument:xmlns:table:1.0',
  draw: 'urn:oasis:names:tc:opendocument:xmlns:drawing:1.0',
  fo: 'urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0',
  xlink: 'http://www.w3.org/1999/xlink',
  svg: 'urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0',
  presentation: 'urn:oasis:names:tc:opendocument:xmlns:presentation:1.0'
};
const ROOT_NS = Object.entries(NS).map(([k, v]) => `xmlns:${k}="${v}"`).join(' ') +
  ' xmlns:meta="urn:oasis:names:tc:opendocument:xmlns:meta:1.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:number="urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0"';

function open(file) {
  const zip = unzipSync(new Uint8Array(fs.readFileSync(file)));
  const xml = (name) => (zip[name] ? new DOMParser().parseFromString(strFromU8(zip[name]), 'text/xml') : null);
  return { zip, content: xml('content.xml'), styles: xml('styles.xml') };
}
const kids = (el) => Array.from(el.childNodes || []).filter((n) => n.nodeType === 1);
const local = (el) => el.localName || el.nodeName.split(':').pop();
const attr = (el, ns, name) => (el.getAttributeNS && el.getAttributeNS(NS[ns], name)) || el.getAttribute(`${ns}:${name}`) || '';
const lengthPx = (v) => {
  const m = String(v || '').match(/([\d.]+)\s*(cm|mm|in|pt|px)?/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return { cm: n * 37.795, mm: n * 3.7795, in: n * 96, pt: n * 1.333, px: n }[m[2] || 'px'] || n;
};

/** Mapa nome-do-estilo → propriedades de texto/parágrafo. */
function styleMap(...docs) {
  const map = {};
  for (const doc of docs) {
    if (!doc) continue;
    for (const tag of ['style', 'default-style']) {
      const list = doc.getElementsByTagNameNS(NS.style, tag);
      for (let i = 0; i < list.length; i++) {
        const s = list[i];
        const name = attr(s, 'style', 'name');
        const props = { parent: attr(s, 'style', 'parent-style-name'), name };
        const outline = attr(s, 'style', 'default-outline-level');
        if (outline) props.outline = parseInt(outline, 10);
        for (const p of kids(s)) {
          const w = attr(p, 'fo', 'font-weight'); if (w) props.b = /bold|[6-9]00/.test(w);
          const it = attr(p, 'fo', 'font-style'); if (it) props.i = it === 'italic';
          const u = attr(p, 'style', 'text-underline-style'); if (u) props.u = u !== 'none';
          const st = attr(p, 'style', 'text-line-through-style'); if (st) props.s = st !== 'none';
          const c = attr(p, 'fo', 'color'); if (c) props.color = c;
          const sz = attr(p, 'fo', 'font-size'); if (sz) props.size = sz;
          const al = attr(p, 'fo', 'text-align'); if (al) props.align = { start: 'left', end: 'right' }[al] || al;
          const bg = attr(p, 'fo', 'background-color'); if (bg && bg !== 'transparent') props.bg = bg;
          const pos = attr(p, 'style', 'text-position'); if (pos) props.pos = /^super|^\d/.test(pos) ? 'sup' : /^sub|^-/.test(pos) ? 'sub' : '';
        }
        if (name) map[name] = props;
      }
    }
  }
  const resolved = (name, depth = 0) => {
    const s = map[name];
    if (!s || depth > 8) return {};
    const up = resolved(s.parent, depth + 1);
    const heading = s.outline || up.heading || (/^Heading_20_(\d)$/.exec(s.name || '') || [])[1] || (/^Title$/.test(s.name || '') ? 1 : 0);
    return { ...up, ...s, heading: heading ? +heading : 0 };
  };
  return resolved;
}

function css(p) {
  const out = [];
  if (p.b) out.push('font-weight:bold');
  if (p.i) out.push('font-style:italic');
  const deco = [p.u && 'underline', p.s && 'line-through'].filter(Boolean).join(' ');
  if (deco) out.push(`text-decoration:${deco}`);
  if (p.color && p.color !== '#000000') out.push(`color:${p.color}`);
  if (p.bg) out.push(`background:${p.bg}`);
  return out.join(';');
}

/* ------------------------------ ODT → HTML ------------------------------ */
function readOdt(file) {
  const { zip, content, styles } = open(file);
  if (!content) throw new Error('ODT inválido');
  const st = styleMap(styles, content);
  const pic = (href) => {
    let data = zip[href.replace(/^\.\//, '')];
    // imagem vinculada (fora do arquivo): caminho relativo à pasta do documento
    if (!data && !/^[a-z]+:/i.test(href)) {
      try { data = fs.readFileSync(require('path').resolve(require('path').dirname(file), href.replace(/^\.\.\//, ''))); } catch {}
    }
    if (!data && /^file:/.test(href)) { try { data = fs.readFileSync(require('url').fileURLToPath(href)); } catch {} }
    return data ? `data:${imageMime(href)};base64,${Buffer.from(data).toString('base64')}` : '';
  };
  const inline = (el) => {
    let h = '';
    for (const n of Array.from(el.childNodes || [])) {
      if (n.nodeType === 3) { h += esc(n.nodeValue); continue; }
      if (n.nodeType !== 1) continue;
      const tag = local(n);
      if (tag === 's') h += '&nbsp;'.repeat(parseInt(attr(n, 'text', 'c'), 10) || 1);
      else if (tag === 'tab') h += '&emsp;';
      else if (tag === 'line-break') h += '<br>';
      else if (tag === 'span') {
        const p = st(attr(n, 'text', 'style-name'));
        let inner = inline(n);
        if (p.pos === 'sup') inner = `<sup>${inner}</sup>`;
        if (p.pos === 'sub') inner = `<sub>${inner}</sub>`;
        const c = css(p);
        h += c ? `<span style="${c}">${inner}</span>` : inner;
      } else if (tag === 'a') h += `<a href="${esc(attr(n, 'xlink', 'href'))}">${inline(n)}</a>`;
      else if (tag === 'frame') h += frame(n);
      else if (tag === 'note') {
        const body = kids(n).find((k) => local(k) === 'note-body');
        h += body ? `<sup title="${esc(body.textContent)}">[${esc((kids(n).find((k) => local(k) === 'note-citation') || {}).textContent || '*')}]</sup>` : '';
      } else if (!['bookmark', 'bookmark-start', 'bookmark-end', 'soft-page-break', 'annotation', 'sequence-decls'].includes(tag)) h += inline(n);
    }
    return h;
  };
  const frame = (n) => {
    const w = lengthPx(attr(n, 'svg', 'width'));
    let h = '';
    for (const k of kids(n)) {
      if (local(k) === 'image') {
        const src = pic(attr(k, 'xlink', 'href'));
        if (src) h += `<img src="${src}" style="max-width:100%;${w ? `width:${Math.round(w)}px` : ''}">`;
      } else if (local(k) === 'text-box') h += blocks(k);
    }
    return h;
  };
  const blocks = (el) => {
    let h = '';
    for (const n of kids(el)) {
      const tag = local(n);
      if (tag === 'h') {
        const lvl = Math.min(6, parseInt(attr(n, 'text', 'outline-level'), 10) || 1);
        h += `<h${lvl}>${inline(n)}</h${lvl}>`;
      } else if (tag === 'p' && st(attr(n, 'text', 'style-name')).heading) {
        const lvl = Math.min(6, st(attr(n, 'text', 'style-name')).heading);
        h += `<h${lvl}>${inline(n)}</h${lvl}>`;
      } else if (tag === 'p') {
        const p = st(attr(n, 'text', 'style-name'));
        const s = [p.align && p.align !== 'left' ? `text-align:${p.align}` : '', css(p)].filter(Boolean).join(';');
        const inner = inline(n);
        h += `<p${s ? ` style="${s}"` : ''}>${inner || '&nbsp;'}</p>`;
      } else if (tag === 'list') {
        const styleName = attr(n, 'text', 'style-name');
        const ordered = /num|^L\d+N|Numbering/i.test(styleName) || isNumbered(content, styles, styleName);
        h += `<${ordered ? 'ol' : 'ul'}>${kids(n).filter((k) => ['list-item', 'list-header'].includes(local(k))).map((li) => `<li>${blocks(li)}</li>`).join('')}</${ordered ? 'ol' : 'ul'}>`;
      } else if (tag === 'table') {
        h += '<table>';
        const rows = [];
        const collect = (e) => kids(e).forEach((k) => { const t = local(k); if (t === 'table-row') rows.push(k); else if (['table-header-rows', 'table-rows', 'table-row-group'].includes(t)) collect(k); });
        collect(n);
        for (const r of rows) {
          h += '<tr>';
          for (const c of kids(r)) {
            if (local(c) === 'covered-table-cell') continue;
            if (local(c) !== 'table-cell') continue;
            const cs = parseInt(attr(c, 'table', 'number-columns-spanned'), 10) || 1;
            const rs = parseInt(attr(c, 'table', 'number-rows-spanned'), 10) || 1;
            h += `<td${cs > 1 ? ` colspan="${cs}"` : ''}${rs > 1 ? ` rowspan="${rs}"` : ''}>${blocks(c)}</td>`;
          }
          h += '</tr>';
        }
        h += '</table>';
      } else if (tag === 'section' || tag === 'index-body' || tag === 'table-of-content' || tag === 'illustration-index') h += blocks(n);
      else if (tag === 'frame') h += `<p>${frame(n)}</p>`;
    }
    return h;
  };
  const body = content.getElementsByTagNameNS(NS.office, 'text')[0];
  const meta = zip['meta.xml'] ? strFromU8(zip['meta.xml']) : '';
  const title = (meta.match(/<dc:title>([^<]*)</) || [])[1] || '';
  return { html: body ? blocks(body) : '', title };
}

function isNumbered(content, styles, name) {
  for (const doc of [content, styles]) {
    if (!doc || !name) continue;
    const list = doc.getElementsByTagNameNS(NS.text, 'list-style');
    for (let i = 0; i < list.length; i++) {
      if (attr(list[i], 'style', 'name') === name) return kids(list[i]).some((k) => local(k) === 'list-level-style-number');
    }
  }
  return false;
}

/* ------------------------------ ODS → planilhas ------------------------------ */
/** Estilos de célula do ODS (cores, negrito, alinhamento, formato numérico) no formato do exceljs. */
function odsStyles(content, styles) {
  const numFmts = {};
  const numMaps = {};
  const cellStyles = {};
  const colWidths = {};
  for (const doc of [styles, content]) {
    if (!doc) continue;
    // formatos numéricos
    for (const tag of ['number-style', 'currency-style', 'percentage-style', 'date-style', 'time-style']) {
      const list = doc.getElementsByTagNameNS('urn:oasis:names:tc:opendocument:xmlns:datastyle:1.0', tag);
      for (let i = 0; i < list.length; i++) {
        const el = list[i];
        const name = attr(el, 'style', 'name');
        const map = kids(el).find((k) => local(k) === 'map');
        if (map) numMaps[name] = attr(map, 'style', 'apply-style-name');
        const num = kids(el).find((k) => local(k) === 'number');
        const dec = num ? parseInt(num.getAttribute('number:decimal-places') || '0', 10) : 0;
        const grouping = num && num.getAttribute('number:grouping') === 'true';
        const base = (grouping ? '#,##0' : '0') + (dec ? '.' + '0'.repeat(dec) : '');
        if (tag === 'date-style') { numFmts[name] = 'dd/mm/yyyy'; continue; }
        if (tag === 'time-style') { numFmts[name] = 'hh:mm'; continue; }
        // monta o formato com todas as partes: textos, número e símbolo de moeda
        let fmt = '';
        for (const k of kids(el)) {
          const t = local(k);
          if (t === 'number') fmt += base;
          else if (t === 'text') fmt += k.textContent === '%' ? '%' : k.textContent ? `"${k.textContent.replace(/"/g, '')}"` : '';
          else if (t === 'currency-symbol') fmt += `"${k.textContent || 'R$'}"`;
        }
        numFmts[name] = fmt || base;
      }
    }
    for (const [n, target] of Object.entries(numMaps)) if (numFmts[target]) numFmts[n] = numFmts[target];
    const list = doc.getElementsByTagNameNS(NS.style, 'style');
    for (let i = 0; i < list.length; i++) {
      const el = list[i];
      const name = attr(el, 'style', 'name');
      const fam = attr(el, 'style', 'family');
      if (fam === 'table-column') {
        const p = kids(el).find((k) => local(k) === 'table-column-properties');
        if (p) colWidths[name] = lengthPx(attr(p, 'style', 'column-width'));
        continue;
      }
      if (fam !== 'table-cell') continue;
      const st = { parent: attr(el, 'style', 'parent-style-name'), numFmt: numFmts[attr(el, 'style', 'data-style-name')] };
      for (const p of kids(el)) {
        const t = local(p);
        if (t === 'table-cell-properties') {
          const bg = attr(p, 'fo', 'background-color');
          if (bg && bg !== 'transparent') st.bg = bg.replace('#', '').toUpperCase();
          const border = attr(p, 'fo', 'border') || attr(p, 'fo', 'border-bottom');
          if (border && border !== 'none') st.border = true;
        } else if (t === 'text-properties') {
          if (/bold|[6-9]00/.test(attr(p, 'fo', 'font-weight'))) st.bold = true;
          if (attr(p, 'fo', 'font-style') === 'italic') st.italic = true;
          const c = attr(p, 'fo', 'color'); if (c) st.color = c.replace('#', '').toUpperCase();
          const sz = attr(p, 'fo', 'font-size'); if (/pt/.test(sz)) st.size = parseFloat(sz);
        } else if (t === 'paragraph-properties') {
          const al = attr(p, 'fo', 'text-align');
          if (al) st.align = { start: 'left', end: 'right', center: 'center', justify: 'justify' }[al] || al;
        }
      }
      cellStyles[name] = st;
    }
  }
  const resolve = (name, d = 0) => {
    const s = cellStyles[name];
    if (!s || d > 6) return {};
    const up = resolve(s.parent, d + 1);
    const out = { ...up };
    for (const [k, v] of Object.entries(s)) if (v !== undefined && k !== 'parent') out[k] = v;
    return out;
  };
  return { resolve, colWidths };
}

function readOds(file) {
  const { content, styles } = open(file);
  if (!content) throw new Error('ODS inválido');
  const { resolve, colWidths } = odsStyles(content, styles);
  const sheets = [];
  const tables = content.getElementsByTagNameNS(NS.table, 'table');
  for (let t = 0; t < tables.length; t++) {
    const table = tables[t];
    const rows = [];
    const cellStyle = [];
    const merges = [];
    const widths = [];
    const colDefault = [];
    for (const col of kids(table)) {
      if (local(col) !== 'table-column' && local(col) !== 'table-columns') continue;
      const cols = local(col) === 'table-columns' ? kids(col).filter((k) => local(k) === 'table-column') : [col];
      for (const c of cols) {
        const rep = Math.min(parseInt(attr(c, 'table', 'number-columns-repeated'), 10) || 1, 300);
        for (let i = 0; i < rep; i++) { widths.push(colWidths[attr(c, 'table', 'style-name')] || 0); colDefault.push(attr(c, 'table', 'default-cell-style-name')); }
      }
    }
    const collect = (e) => kids(e).forEach((k) => {
      const tag = local(k);
      if (tag === 'table-row') {
        const rep = Math.min(parseInt(attr(k, 'table', 'number-rows-repeated'), 10) || 1, 1000);
        const cells = [];
        const sts = [];
        for (const c of kids(k)) {
          if (!['table-cell', 'covered-table-cell'].includes(local(c))) continue;
          const crep = Math.min(parseInt(attr(c, 'table', 'number-columns-repeated'), 10) || 1, 500);
          const type = attr(c, 'office', 'value-type');
          let v = null;
          if (type === 'float' || type === 'percentage' || type === 'currency') v = parseFloat(attr(c, 'office', 'value'));
          else if (type === 'date') v = new Date(attr(c, 'office', 'date-value'));
          else if (type === 'boolean') v = attr(c, 'office', 'boolean-value') === 'true';
          else {
            const txt = kids(c).filter((p) => local(p) === 'p').map((p) => p.textContent).join('\n');
            v = txt === '' ? null : txt;
          }
          const styleName = attr(c, 'table', 'style-name') || colDefault[cells.length];
          const st = styleName ? resolve(styleName) : {};
          const cs = parseInt(attr(c, 'table', 'number-columns-spanned'), 10) || 1;
          const rs = parseInt(attr(c, 'table', 'number-rows-spanned'), 10) || 1;
          if ((cs > 1 || rs > 1) && local(c) === 'table-cell') merges.push({ r: rows.length, c: cells.length, rs, cs });
          for (let i = 0; i < crep; i++) { cells.push(v); sts.push(st); }
        }
        for (let i = 0; i < rep; i++) { rows.push(cells.slice()); cellStyle.push(sts.slice()); }
      } else if (['table-header-rows', 'table-rows', 'table-row-group'].includes(tag)) collect(k);
    });
    collect(table);
    while (rows.length && rows[rows.length - 1].every((v) => v === null || v === '')) { rows.pop(); cellStyle.pop(); }
    let width = 0;
    rows.forEach((r) => { let w = r.length; while (w && (r[w - 1] === null || r[w - 1] === '')) w--; width = Math.max(width, w); });
    merges.forEach((m) => { width = Math.max(width, m.c + m.cs); });
    sheets.push({ name: attr(table, 'table', 'name') || `Planilha${t + 1}`, rows: rows.map((r) => r.slice(0, width)), styles: cellStyle.map((r) => r.slice(0, width)), merges, widths: widths.slice(0, width) });
  }
  return sheets;
}

/* ------------------------------ ODP → slides ------------------------------ */
function readOdp(file) {
  const { zip, content, styles } = open(file);
  if (!content) throw new Error('ODP inválido');
  const st = styleMap(styles, content);
  let W = 1280, H = 720;
  if (styles) {
    // tamanho do slide: layout de página usado pela página-mestra dos slides (não o de anotações)
    const page0 = content.getElementsByTagNameNS(NS.draw, 'page')[0];
    const masterName = page0 ? attr(page0, 'draw', 'master-page-name') : '';
    const masters = styles.getElementsByTagNameNS(NS.style, 'master-page');
    let layoutName = '';
    for (let i = 0; i < masters.length; i++) if (!masterName || attr(masters[i], 'style', 'name') === masterName) { layoutName = attr(masters[i], 'style', 'page-layout-name'); break; }
    const layouts = styles.getElementsByTagNameNS(NS.style, 'page-layout');
    for (let i = 0; i < layouts.length; i++) {
      if (layoutName && attr(layouts[i], 'style', 'name') !== layoutName) continue;
      const props = kids(layouts[i]).find((k) => local(k) === 'page-layout-properties');
      const w = props && lengthPx(attr(props, 'fo', 'page-width'));
      const h = props && lengthPx(attr(props, 'fo', 'page-height'));
      if (w && h) { W = w; H = h; break; }
    }
  }
  const slides = [];
  const pages = content.getElementsByTagNameNS(NS.draw, 'page');
  const paraRuns = (p) => {
    const runs = [];
    const walk = (el, marks) => {
      for (const n of Array.from(el.childNodes || [])) {
        if (n.nodeType === 3) { if (n.nodeValue) runs.push({ text: n.nodeValue, ...marks }); continue; }
        if (n.nodeType !== 1) continue;
        const tag = local(n);
        if (tag === 'line-break') runs.push({ br: true });
        else if (tag === 's') runs.push({ text: ' '.repeat(parseInt(attr(n, 'text', 'c'), 10) || 1), ...marks });
        else if (tag === 'tab') runs.push({ text: '\t', ...marks });
        else {
          const s = tag === 'span' ? st(attr(n, 'text', 'style-name')) : {};
          walk(n, { ...marks, ...pickRun(s) });
        }
      }
    };
    const ps = st(attr(p, 'text', 'style-name'));
    walk(p, pickRun(ps));
    return { align: ps.align, runs };
  };
  for (let i = 0; i < pages.length; i++) {
    const items = [];
    for (const f of kids(pages[i])) {
      if (!['frame', 'custom-shape', 'rect'].includes(local(f))) continue;
      const box = { x: lengthPx(attr(f, 'svg', 'x')), y: lengthPx(attr(f, 'svg', 'y')), w: lengthPx(attr(f, 'svg', 'width')), h: lengthPx(attr(f, 'svg', 'height')) };
      const tableEl = kids(f).find((k) => local(k) === 'table');
      if (tableEl) {
        const rows = [];
        const collect = (e) => kids(e).forEach((k) => { const t = local(k); if (t === 'table-row') rows.push(kids(k).filter((c) => ['table-cell', 'covered-table-cell'].includes(local(c))).map((c) => ({ text: kids(c).map((p) => p.textContent).join('\n'), span: parseInt(attr(c, 'table', 'number-columns-spanned'), 10) || 1, merged: local(c) === 'covered-table-cell' }))); else if (['table-header-rows', 'table-rows'].includes(t)) collect(k); });
        collect(tableEl);
        items.push({ type: 'table', ...box, rows, firstRow: true });
        continue;
      }
      const img = kids(f).find((k) => local(k) === 'image');
      if (img) {
        const href = attr(img, 'xlink', 'href').replace(/^\.\//, '');
        if (zip[href]) items.push({ type: 'img', ...box, src: `data:${imageMime(href)};base64,${Buffer.from(zip[href]).toString('base64')}` });
        continue;
      }
      const tb = kids(f).find((k) => local(k) === 'text-box') || f;
      const paras = [];
      const collect = (e) => kids(e).forEach((k) => { const t = local(k); if (t === 'p' || t === 'h') paras.push(paraRuns(k)); else if (t === 'list' || t === 'list-item') collect(k); });
      collect(tb);
      if (paras.some((p) => p.runs.some((r) => r.text && r.text.trim()))) {
        const cls = attr(f, 'presentation', 'class');
        items.push({ type: 'text', ...box, paras, title: cls === 'title' });
      }
    }
    slides.push({ items });
  }
  return { w: W, h: H, slides };
}

function pickRun(s) {
  const r = {};
  if (s.b) r.b = true;
  if (s.i) r.i = true;
  if (s.u) r.u = true;
  if (s.color) r.color = s.color.replace('#', '');
  if (s.size && /pt/.test(s.size)) r.size = parseFloat(s.size);
  return r;
}

/* ------------------------------ escrita ------------------------------ */
function manifest(mime, files) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest:manifest xmlns:manifest="urn:oasis:names:tc:opendocument:xmlns:manifest:1.0" manifest:version="1.3">
<manifest:file-entry manifest:full-path="/" manifest:version="1.3" manifest:media-type="${mime}"/>
<manifest:file-entry manifest:full-path="content.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="styles.xml" manifest:media-type="text/xml"/>
<manifest:file-entry manifest:full-path="meta.xml" manifest:media-type="text/xml"/>
${files.map((f) => `<manifest:file-entry manifest:full-path="${f.path}" manifest:media-type="${f.mime}"/>`).join('\n')}
</manifest:manifest>`;
}
function metaXml(title) {
  return `<?xml version="1.0" encoding="UTF-8"?><office:document-meta ${ROOT_NS} office:version="1.3"><office:meta><meta:generator>GCP Converter</meta:generator><dc:title>${esc(title || '')}</dc:title><meta:creation-date>${new Date().toISOString().slice(0, 19)}</meta:creation-date></office:meta></office:document-meta>`;
}
function pack(out, mime, contentXml, stylesXml, title, pictures = []) {
  const files = {
    mimetype: [strToU8(mime), { level: 0 }],
    'META-INF/manifest.xml': strToU8(manifest(mime, pictures)),
    'content.xml': strToU8(contentXml),
    'styles.xml': strToU8(stylesXml),
    'meta.xml': strToU8(metaXml(title))
  };
  for (const p of pictures) files[p.path] = [p.data, { level: 0 }];
  fs.writeFileSync(out, Buffer.from(zipSync(files)));
}

const ODT_STYLES = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-styles ${ROOT_NS} office:version="1.3"><office:font-face-decls/>
<office:styles>
<style:default-style style:family="paragraph"><style:paragraph-properties fo:margin-bottom="0.2cm" fo:line-height="130%"/><style:text-properties style:font-name="Liberation Sans" fo:font-family="'Liberation Sans', Arial, sans-serif" fo:font-size="11pt" fo:language="pt" fo:country="BR"/></style:default-style>
<style:style style:name="Standard" style:family="paragraph" style:class="text"/>
<style:style style:name="Text_20_body" style:display-name="Text body" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:margin-top="0cm" fo:margin-bottom="0.25cm"/></style:style>
${[1, 2, 3, 4, 5, 6].map((n) => `<style:style style:name="Heading_20_${n}" style:display-name="Heading ${n}" style:family="paragraph" style:parent-style-name="Standard" style:next-style-name="Text_20_body" style:default-outline-level="${n}" style:class="text"><style:paragraph-properties fo:margin-top="${n < 3 ? 0.6 : 0.4}cm" fo:margin-bottom="0.2cm" fo:keep-with-next="always"/><style:text-properties fo:font-size="${[22, 17, 14, 12.5, 11.5, 11][n - 1]}pt" fo:font-weight="bold"/></style:style>`).join('')}
<style:style style:name="Quotations" style:family="paragraph" style:parent-style-name="Text_20_body"><style:paragraph-properties fo:margin-left="1cm" fo:margin-right="1cm"/><style:text-properties fo:font-style="italic" fo:color="#475069"/></style:style>
<style:style style:name="Preformatted_20_Text" style:display-name="Preformatted Text" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:margin-bottom="0cm" fo:background-color="#f4f5fb"/><style:text-properties style:font-name="Liberation Mono" fo:font-family="'Liberation Mono', Consolas, monospace" fo:font-size="9.5pt"/></style:style>
<style:style style:name="Table_20_Contents" style:display-name="Table Contents" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:margin-bottom="0cm"/></style:style>
<style:style style:name="Internet_20_link" style:display-name="Internet link" style:family="text"><style:text-properties fo:color="#7c3aed" style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"/></style:style>
<text:list-style style:name="LBullet">${[1, 2, 3, 4, 5].map((l) => `<text:list-level-style-bullet text:level="${l}" text:bullet-char="${['•', '◦', '▪', '•', '◦'][l - 1]}"><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${l * 0.635 + 0.635}cm" fo:text-indent="-0.635cm" fo:margin-left="${l * 0.635 + 0.635}cm"/></style:list-level-properties></text:list-level-style-bullet>`).join('')}</text:list-style>
<text:list-style style:name="LNumber">${[1, 2, 3, 4, 5].map((l) => `<text:list-level-style-number text:level="${l}" style:num-suffix="." style:num-format="${['1', 'a', 'i', '1', 'a'][l - 1]}"><style:list-level-properties text:list-level-position-and-space-mode="label-alignment"><style:list-level-label-alignment text:label-followed-by="listtab" text:list-tab-stop-position="${l * 0.635 + 0.635}cm" fo:text-indent="-0.635cm" fo:margin-left="${l * 0.635 + 0.635}cm"/></style:list-level-properties></text:list-level-style-number>`).join('')}</text:list-style>
</office:styles>
<office:automatic-styles><style:page-layout style:name="pm1"><style:page-layout-properties fo:page-width="21cm" fo:page-height="29.7cm" fo:margin-top="2cm" fo:margin-bottom="2cm" fo:margin-left="2cm" fo:margin-right="2cm"/></style:page-layout></office:automatic-styles>
<office:master-styles><style:master-page style:name="Standard" style:page-layout-name="pm1"/></office:master-styles>
</office:document-styles>`;

/** Gera ODT a partir dos blocos (ver src/engine/blocks.js). */
function writeOdt(blocks, title, out) {
  const auto = new Map();
  const pictures = [];
  const textStyle = (m) => {
    const key = ['b', 'i', 'u', 's', 'code', 'sup', 'sub'].filter((k) => m[k]).join('') + (m.color ? '#' + m.color : '');
    if (!key) return '';
    if (!auto.has(key)) {
      const props = [m.b && 'fo:font-weight="bold"', m.i && 'fo:font-style="italic"', m.u && 'style:text-underline-style="solid" style:text-underline-width="auto" style:text-underline-color="font-color"', m.s && 'style:text-line-through-style="solid"', m.code && 'style:font-name="Liberation Mono" fo:font-family="\'Liberation Mono\', monospace"', m.sup && 'style:text-position="super 58%"', m.sub && 'style:text-position="sub 58%"', m.color && `fo:color="#${m.color}"`].filter(Boolean).join(' ');
      auto.set(key, { name: `T${auto.size + 1}`, xml: `<style:style style:name="T${auto.size + 1}" style:family="text"><style:text-properties ${props}/></style:style>` });
    }
    return auto.get(key).name;
  };
  const paraAlign = new Map();
  const paraStyle = (base, align) => {
    if (!align || align === 'left') return base;
    const key = base + align;
    if (!paraAlign.has(key)) paraAlign.set(key, { name: `P${paraAlign.size + 1}`, xml: `<style:style style:name="P${paraAlign.size + 1}" style:family="paragraph" style:parent-style-name="${base}"><style:paragraph-properties fo:text-align="${align === 'right' ? 'end' : align}"/></style:style>` });
    return paraAlign.get(key).name;
  };
  const image = (r) => {
    const bin = dataUrlToBytes(r.img);
    if (!bin) return '';
    const ext = bin.ext;
    const p = `Pictures/img${pictures.length + 1}.${ext}`;
    pictures.push({ path: p, data: bin.bytes, mime: bin.mime });
    let w = (r.w || 400) / 96 * 2.54;
    let h = (r.h || 300) / 96 * 2.54;
    if (w > 17) { h = h * 17 / w; w = 17; }
    return `<draw:frame draw:name="img${pictures.length}" text:anchor-type="as-char" svg:width="${w.toFixed(2)}cm" svg:height="${h.toFixed(2)}cm"><draw:image xlink:href="${p}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame>`;
  };
  const inl = (list) => (list || []).map((r) => {
    if (r.br) return '<text:line-break/>';
    if (r.img) return image(r);
    let t = esc(r.text || '').replace(/\t/g, '<text:tab/>').replace(/ {2,}/g, (m) => ` <text:s text:c="${m.length - 1}"/>`);
    const s = textStyle(r);
    if (s) t = `<text:span text:style-name="${s}">${t}</text:span>`;
    if (r.href) t = `<text:a xlink:type="simple" xlink:href="${esc(r.href)}" text:style-name="Internet_20_link">${t}</text:a>`;
    return t;
  }).join('');
  let cols = 0;
  const block = (b, level = 0) => {
    switch (b.t) {
      case 'h': return `<text:h text:style-name="${paraStyle(`Heading_20_${b.level}`, b.align)}" text:outline-level="${b.level}">${inl(b.inl)}</text:h>`;
      case 'p': return `<text:p text:style-name="${paraStyle(level ? 'Table_20_Contents' : 'Text_20_body', b.align)}">${inl(b.inl)}</text:p>`;
      case 'pre': return b.text.split('\n').map((l) => `<text:p text:style-name="Preformatted_20_Text">${esc(l).replace(/ {2,}/g, (m) => ` <text:s text:c="${m.length - 1}"/>`) || ''}</text:p>`).join('');
      case 'quote': return b.blocks.map((x) => (x.t === 'p' ? `<text:p text:style-name="Quotations">${inl(x.inl)}</text:p>` : block(x))).join('');
      case 'hr': return '<text:p text:style-name="Text_20_body">―――――――――――――――</text:p>';
      case 'pagebreak': return '<text:p text:style-name="PBreak"/>';
      case 'list': return `<text:list text:style-name="${b.ordered ? 'LNumber' : 'LBullet'}">${b.items.map((it) => `<text:list-item>${(it.length ? it : [{ t: 'p', inl: [] }]).map((x) => block(x, level)).join('')}</text:list-item>`).join('')}</text:list>`;
      case 'table': {
        const n = Math.max(...b.rows.map((r) => r.reduce((a, c) => a + (c.colspan || 1), 0)));
        cols++;
        return `<table:table table:name="Tabela${cols}" table:style-name="Tbl"><table:table-column table:number-columns-repeated="${n}" table:style-name="TblCol"/>${b.rows.map((r) => `<table:table-row>${r.map((c) => `<table:table-cell table:style-name="TblCell" office:value-type="string"${c.colspan > 1 ? ` table:number-columns-spanned="${c.colspan}"` : ''}${c.rowspan > 1 ? ` table:number-rows-spanned="${c.rowspan}"` : ''}>${(c.blocks.length ? c.blocks : [{ t: 'p', inl: [] }]).map((x) => (c.head && x.t === 'p' ? block({ ...x, inl: x.inl.map((r) => ({ ...r, b: true })) }, 1) : block(x, 1))).join('')}</table:table-cell>${'<table:covered-table-cell/>'.repeat((c.colspan || 1) - 1)}`).join('')}</table:table-row>`).join('')}</table:table>`;
      }
      default: return '';
    }
  };
  const body = blocks.map((b) => block(b)).join('\n');
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content ${ROOT_NS} office:version="1.3"><office:automatic-styles>
<style:style style:name="PBreak" style:family="paragraph" style:parent-style-name="Standard"><style:paragraph-properties fo:break-after="page"/></style:style>
<style:style style:name="Tbl" style:family="table"><style:table-properties style:width="17cm" table:align="margins" fo:margin-bottom="0.3cm"/></style:style>
<style:style style:name="TblCol" style:family="table-column"/>
<style:style style:name="TblCell" style:family="table-cell"><style:table-cell-properties fo:padding="0.1cm" fo:border="0.5pt solid #b4b9cc"/></style:style>
${[...auto.values(), ...paraAlign.values()].map((s) => s.xml).join('\n')}
</office:automatic-styles><office:body><office:text>${body}</office:text></office:body></office:document-content>`;
  pack(out, 'application/vnd.oasis.opendocument.text', contentXml, ODT_STYLES, title, pictures);
}

/** Gera ODS a partir de planilhas [{name, rows}]. */
function writeOds(sheets, out) {
  const cell = (v) => {
    if (v === null || v === undefined || v === '') return '<table:table-cell/>';
    if (typeof v === 'number' && Number.isFinite(v)) return `<table:table-cell office:value-type="float" office:value="${v}"><text:p>${v}</text:p></table:table-cell>`;
    if (typeof v === 'boolean') return `<table:table-cell office:value-type="boolean" office:boolean-value="${v}"><text:p>${v ? 'VERDADEIRO' : 'FALSO'}</text:p></table:table-cell>`;
    if (v instanceof Date && !isNaN(v)) return `<table:table-cell office:value-type="date" office:date-value="${v.toISOString().slice(0, 19)}" table:style-name="cDate"><text:p>${v.toISOString().slice(0, 10)}</text:p></table:table-cell>`;
    return `<table:table-cell office:value-type="string">${String(v).split('\n').map((l) => `<text:p>${esc(l)}</text:p>`).join('')}</table:table-cell>`;
  };
  const tables = sheets.map((s) => `<table:table table:name="${esc(s.name.slice(0, 31))}">${s.rows.length ? `<table:table-column table:number-columns-repeated="${Math.max(1, ...s.rows.map((r) => r.length))}"/>` : '<table:table-column/>'}${(s.rows.length ? s.rows : [[]]).map((r) => `<table:table-row>${r.length ? r.map(cell).join('') : '<table:table-cell/>'}</table:table-row>`).join('')}</table:table>`).join('');
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content ${ROOT_NS} office:version="1.3"><office:automatic-styles><number:date-style style:name="N1"><number:year number:style="long"/><number:text>-</number:text><number:month number:style="long"/><number:text>-</number:text><number:day number:style="long"/></number:date-style><style:style style:name="cDate" style:family="table-cell" style:data-style-name="N1"/></office:automatic-styles><office:body><office:spreadsheet>${tables}</office:spreadsheet></office:body></office:document-content>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${ROOT_NS} office:version="1.3"><office:styles/></office:document-styles>`;
  pack(out, 'application/vnd.oasis.opendocument.spreadsheet', contentXml, stylesXml, sheets[0] ? sheets[0].name : '');
}

/** Gera ODP a partir de slides ({w, h, slides:[{items}]}). */
function writeOdp(deck, out) {
  const pictures = [];
  const cm = (px) => `${(px / 37.795).toFixed(3)}cm`;
  const auto = new Map();
  const tstyle = (r) => {
    const key = JSON.stringify([r.b, r.i, r.u, r.color, r.size]);
    if (!auto.has(key)) auto.set(key, { name: `T${auto.size + 1}`, xml: `<style:style style:name="T${auto.size + 1}" style:family="text"><style:text-properties ${[r.b && 'fo:font-weight="bold"', r.i && 'fo:font-style="italic"', r.u && 'style:text-underline-style="solid"', r.color && `fo:color="#${r.color}"`, r.size && `fo:font-size="${r.size}pt"`].filter(Boolean).join(' ')}/></style:style>` });
    return auto.get(key).name;
  };
  const pages = deck.slides.map((s, i) => `<draw:page draw:name="page${i + 1}" draw:master-page-name="Default">${s.items.map((it) => {
    const box = `svg:x="${cm(it.x)}" svg:y="${cm(it.y)}" svg:width="${cm(it.w)}" svg:height="${cm(it.h)}"`;
    if (it.type === 'table') {
      const n = Math.max(...it.rows.map((r) => r.filter((c) => !c.merged).length));
      return `<draw:frame ${box}><table:table><table:table-column table:number-columns-repeated="${n}"/>${it.rows.map((r) => `<table:table-row>${r.filter((c) => !c.merged).map((c) => `<table:table-cell office:value-type="string">${String(c.text).split('\n').map((l) => `<text:p>${esc(l)}</text:p>`).join('')}</table:table-cell>`).join('')}</table:table-row>`).join('')}</table:table></draw:frame>`;
    }
    if (it.type === 'img') {
      const bin = dataUrlToBytes(it.src);
      if (!bin) return '';
      const p = `Pictures/img${pictures.length + 1}.${bin.ext}`;
      pictures.push({ path: p, data: bin.bytes, mime: bin.mime });
      return `<draw:frame ${box}><draw:image xlink:href="${p}" xlink:type="simple" xlink:show="embed" xlink:actuate="onLoad"/></draw:frame>`;
    }
    return `<draw:frame ${box}><draw:text-box>${it.paras.map((p) => `<text:p${p.align && p.align !== 'left' ? ` text:style-name="P${p.align}"` : ''}>${p.runs.map((r) => (r.br ? '<text:line-break/>' : `<text:span text:style-name="${tstyle(r)}">${esc(r.text || '')}</text:span>`)).join('')}</text:p>`).join('')}</draw:text-box></draw:frame>`;
  }).join('')}</draw:page>`).join('');
  const contentXml = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content ${ROOT_NS} office:version="1.3"><office:automatic-styles>
<style:style style:name="Pcenter" style:family="paragraph"><style:paragraph-properties fo:text-align="center"/></style:style>
<style:style style:name="Pright" style:family="paragraph"><style:paragraph-properties fo:text-align="end"/></style:style>
<style:style style:name="Pjustify" style:family="paragraph"><style:paragraph-properties fo:text-align="justify"/></style:style>
${[...auto.values()].map((s) => s.xml).join('')}</office:automatic-styles><office:body><office:presentation>${pages}</office:presentation></office:body></office:document-content>`;
  const stylesXml = `<?xml version="1.0" encoding="UTF-8"?><office:document-styles ${ROOT_NS} office:version="1.3"><office:styles/><office:automatic-styles><style:page-layout style:name="PM1"><style:page-layout-properties fo:margin-top="0cm" fo:margin-bottom="0cm" fo:margin-left="0cm" fo:margin-right="0cm" fo:page-width="${cm(deck.w)}" fo:page-height="${cm(deck.h)}" style:print-orientation="landscape"/></style:page-layout></office:automatic-styles><office:master-styles><style:master-page style:name="Default" style:page-layout-name="PM1"/></office:master-styles></office:document-styles>`;
  pack(out, 'application/vnd.oasis.opendocument.presentation', contentXml, stylesXml, '', pictures);
}

module.exports = { readOdt, readOds, readOdp, writeOdt, writeOds, writeOdp, lengthPx };
