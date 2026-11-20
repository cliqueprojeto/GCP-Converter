// Apresentações: leitura de PPTX, escrita de PPTX (pptxgenjs) e
// renderização de slides em HTML (para gerar PDF com o Chromium).
'use strict';
const fs = require('fs');
const path = require('path');
const { unzipSync, strFromU8 } = require('fflate');
const { DOMParser } = require('@xmldom/xmldom');
const { esc, imageMime } = require('./util');

const EMU = 9525; // 1px = 9525 EMU
const kids = (el, name) => Array.from(el ? el.childNodes || [] : []).filter((n) => n.nodeType === 1 && (!name || (n.localName || n.nodeName.split(':').pop()) === name));
const first = (el, name) => kids(el, name)[0] || null;
const find = (el, name) => {
  if (!el) return null;
  for (const k of kids(el)) {
    if ((k.localName || k.nodeName.split(':').pop()) === name) return k;
    const f = find(k, name);
    if (f) return f;
  }
  return null;
};
const findAll = (el, name, out = []) => {
  for (const k of kids(el)) {
    if ((k.localName || k.nodeName.split(':').pop()) === name) out.push(k);
    findAll(k, name, out);
  }
  return out;
};
const a = (el, n) => (el ? el.getAttribute(n) : null);

function readPptx(file) {
  const zip = unzipSync(new Uint8Array(fs.readFileSync(file)));
  const xml = (name) => (zip[name] ? new DOMParser().parseFromString(strFromU8(zip[name]), 'text/xml') : null);
  const rels = (name) => {
    const dir = path.posix.dirname(name);
    const r = xml(`${dir}/_rels/${path.posix.basename(name)}.rels`);
    const map = {};
    if (r) for (const rel of findAll(r.documentElement, 'Relationship')) map[a(rel, 'Id')] = { target: path.posix.normalize(path.posix.join(dir, a(rel, 'Target'))), type: a(rel, 'Type') };
    return map;
  };
  const pres = xml('ppt/presentation.xml');
  if (!pres) throw new Error('PPTX inválido');
  const sz = find(pres.documentElement, 'sldSz');
  const W = Math.round((+a(sz, 'cx') || 12192000) / EMU);
  const H = Math.round((+a(sz, 'cy') || 6858000) / EMU);
  const presRels = rels('ppt/presentation.xml');
  const slideIds = findAll(find(pres.documentElement, 'sldIdLst'), 'sldId');
  const theme = (() => {
    const t = Object.values(presRels).find((r) => /theme$/.test(r.type));
    const doc = t ? xml(t.target) : null;
    const map = {};
    if (doc) {
      const cs = find(doc.documentElement, 'clrScheme');
      for (const c of kids(cs)) {
        const v = first(c, 'srgbClr') || first(c, 'sysClr');
        if (v) map[c.localName] = a(v, 'val') === 'windowText' ? '000000' : a(v, 'lastClr') || a(v, 'val');
      }
    }
    map.tx1 = map.dk1 || '000000'; map.bg1 = map.lt1 || 'FFFFFF'; map.tx2 = map.dk2 || '44546A'; map.bg2 = map.lt2 || 'E7E6E6';
    return map;
  })();
  const color = (el) => {
    if (!el) return null;
    const s = first(el, 'srgbClr');
    if (s) return a(s, 'val');
    const sc = first(el, 'schemeClr');
    if (sc) return theme[a(sc, 'val')] || null;
    return null;
  };
  const xfrm = (sp) => {
    const x = find(sp, 'xfrm');
    if (!x) return null;
    const off = first(x, 'off');
    const ext = first(x, 'ext');
    if (!off || !ext) return null;
    return { x: +a(off, 'x') / EMU, y: +a(off, 'y') / EMU, w: +a(ext, 'cx') / EMU, h: +a(ext, 'cy') / EMU };
  };
  const phKey = (sp) => {
    const ph = find(find(sp, 'nvPr') || sp, 'ph');
    if (!ph) return null;
    return { type: a(ph, 'type') || 'body', idx: a(ph, 'idx') };
  };
  const phBoxes = (doc) => {
    const list = [];
    if (!doc) return list;
    for (const sp of findAll(doc.documentElement, 'sp')) {
      const k = phKey(sp);
      const b = xfrm(sp);
      if (k && b) list.push({ ...k, box: b, size: (() => { const d = find(sp, 'defRPr'); return d && a(d, 'sz') ? +a(d, 'sz') / 100 : null; })() });
    }
    return list;
  };
  const slides = [];
  for (const sid of slideIds) {
    const target = presRels[a(sid, 'r:id')];
    if (!target) continue;
    const doc = xml(target.target);
    if (!doc) continue;
    const srels = rels(target.target);
    const layoutRel = Object.values(srels).find((r) => /slideLayout$/.test(r.type));
    const layoutDoc = layoutRel ? xml(layoutRel.target) : null;
    const masterRel = layoutRel ? Object.values(rels(layoutRel.target)).find((r) => /slideMaster$/.test(r.type)) : null;
    const masterDoc = masterRel ? xml(masterRel.target) : null;
    const inherited = [...phBoxes(layoutDoc), ...phBoxes(masterDoc)];
    // tamanhos padrão do slide mestre (txStyles), como no PowerPoint
    const masterSize = (style, lvl) => {
      const ts = masterDoc && find(masterDoc.documentElement, style);
      const lp = ts && first(ts, `lvl${lvl + 1}pPr`);
      const d = lp && first(lp, 'defRPr');
      return d && a(d, 'sz') ? +a(d, 'sz') / 100 : null;
    };
    const findPh = (k) => k && (inherited.find((p) => k.idx && p.idx === k.idx) || inherited.find((p) => p.type === k.type) || inherited.find((p) => (k.type === 'ctrTitle' && p.type === 'title') || (k.type === 'subTitle' && p.type === 'body')));
    const items = [];
    // fundo
    let bg = null;
    for (const d of [doc, layoutDoc, masterDoc]) {
      const b = d && find(d.documentElement, 'bg');
      if (b) { bg = color(find(b, 'solidFill')); if (bg) break; }
    }
    const tree = find(doc.documentElement, 'spTree');
    const walk = (node, ox = 0, oy = 0) => {
      for (const el of kids(node)) {
        const tag = el.localName;
        if (tag === 'grpSp') { walk(el, ox, oy); continue; }
        if (tag === 'pic') {
          const blip = find(el, 'blip');
          const rid = blip && (blip.getAttribute('r:embed') || blip.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'embed'));
          const img = rid && srels[rid] && zip[srels[rid].target];
          const box = xfrm(el) || (findPh(phKey(el)) || {}).box;
          if (img && box) items.push({ type: 'img', ...box, src: `data:${imageMime(srels[rid].target)};base64,${Buffer.from(img).toString('base64')}` });
          continue;
        }
        if (tag === 'graphicFrame') {
          const tbl = find(el, 'tbl');
          const box = xfrm(el);
          if (tbl && box) {
            const rows = kids(tbl, 'tr').map((tr) => kids(tr, 'tc').map((tc) => {
              const txt = findAll(tc, 'p').map((p) => findAll(p, 't').map((t) => t.textContent).join('')).join('\n');
              const tcPr = first(tc, 'tcPr');
              const rpr = find(tc, 'rPr');
              return { text: txt, fill: tcPr ? color(first(tcPr, 'solidFill')) : null, b: !!(rpr && a(rpr, 'b') === '1'), span: +a(tc, 'gridSpan') || 1, merged: a(tc, 'hMerge') === '1' || a(tc, 'vMerge') === '1' };
            }));
            const firstRow = a(first(tbl, 'tblPr'), 'firstRow') === '1';
            items.push({ type: 'table', ...box, rows, firstRow });
          }
          continue;
        }
        if (tag !== 'sp') continue;
        const key = phKey(el);
        const ph = findPh(key);
        const box = xfrm(el) || (ph && ph.box);
        if (!box) continue;
        const spPr = first(el, 'spPr');
        const fill = color(first(spPr, 'solidFill'));
        const geom = first(spPr, 'prstGeom');
        const shape = geom ? a(geom, 'prst') : null;
        const bodyPr = find(el, 'bodyPr');
        const anchor = bodyPr && a(bodyPr, 'anchor');
        const body = first(el, 'txBody');
        const paras = [];
        if (body) {
          for (const p of kids(body, 'p')) {
            const ppr = first(p, 'pPr');
            const algn = ppr && a(ppr, 'algn');
            const lvl = ppr ? +a(ppr, 'lvl') || 0 : 0;
            const runs = [];
            for (const r of kids(p)) {
              const t = r.localName;
              if (t === 'br') { runs.push({ br: true }); continue; }
              if (t !== 'r' && t !== 'fld') continue;
              const rpr = first(r, 'rPr');
              const text = (first(r, 't') || {}).textContent || '';
              const run = { text };
              if (rpr) {
                if (a(rpr, 'b') === '1') run.b = true;
                if (a(rpr, 'i') === '1') run.i = true;
                if (a(rpr, 'u') && a(rpr, 'u') !== 'none') run.u = true;
                if (a(rpr, 'sz')) run.size = +a(rpr, 'sz') / 100;
                const c = color(first(rpr, 'solidFill'));
                if (c) run.color = c;
              }
              if (!run.size && ph && ph.size) run.size = ph.size;
              const isTitle = key && /^(title|ctrTitle)$/.test(key.type);
              if (!run.size) run.size = isTitle ? (key.type === 'ctrTitle' ? 44 : masterSize('titleStyle', 0) || 44) : key && key.type === 'subTitle' ? 24 : key ? masterSize('bodyStyle', lvl) || [28, 24, 20, 18, 18][lvl] || 18 : masterSize('otherStyle', 0) || 18;
              runs.push(run);
            }
            const bullet = ppr && (first(ppr, 'buChar') ? a(first(ppr, 'buChar'), 'char') : first(ppr, 'buAutoNum') ? '•' : null);
            const isBody = key && (key.type === 'body' || (key.type !== 'title' && key.type !== 'ctrTitle' && key.type !== 'subTitle' && key.idx && !/^(dt|ftr|sldNum)$/.test(key.type)));
            paras.push({ align: { ctr: 'center', r: 'right', just: 'justify', l: 'left' }[algn] || ((key && /ctrTitle|subTitle/.test(key.type)) || (!key && fill) ? 'center' : undefined), runs, bullet: bullet || (isBody && runs.some((x) => x.text && x.text.trim()) && !ppr?.getElementsByTagName?.('a:buNone')?.length ? '•' : null), level: lvl });
          }
        }
        if (paras.some((p) => p.runs.some((r) => r.text && r.text.trim())) || fill) items.push({ type: 'text', ...box, paras, fill, shape, anchor: anchor || (fill && !key ? 'ctr' : null), title: !!(key && /^(title|ctrTitle)$/.test(key.type)), subtitle: !!(key && key.type === 'subTitle') });
      }
    };
    walk(tree);
    slides.push({ bg, items });
  }
  return { w: W, h: H, slides };
}

/** HTML com um slide por página (para PDF). */
function slidesToHtml(deck) {
  const { w, h } = deck;
  const run = (r) => (r.br ? '<br>' : `<span style="${[r.b && 'font-weight:bold', r.i && 'font-style:italic', r.u && 'text-decoration:underline', r.color && `color:#${r.color}`, `font-size:${(r.size || 18) * 1.333}px`].filter(Boolean).join(';')}">${esc(r.text || '').replace(/\t/g, '&emsp;')}</span>`);
  const pages = deck.slides.map((s) => `<section class="slide" style="background:${s.bg ? '#' + s.bg : '#fff'}">${s.items.map((it) => {
    const pos = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px`;
    if (it.type === 'img') return `<img src="${it.src}" style="position:absolute;${pos};object-fit:contain">`;
    if (it.type === 'table') return `<table class="tbl" style="position:absolute;${pos}">${it.rows.map((r, ri) => `<tr>${r.filter((c) => !c.merged).map((c) => `<td${c.span > 1 ? ` colspan="${c.span}"` : ''} style="${c.fill ? `background:#${c.fill};` : ri === 0 && it.firstRow !== false ? 'background:#4472c4;color:#fff;' : ri % 2 ? 'background:#e9edf6;' : 'background:#cfd5ea;'}${c.b || (ri === 0 && it.firstRow !== false) ? 'font-weight:bold;' : ''}">${esc(c.text).replace(/\n/g, '<br>')}</td>`).join('')}</tr>`).join('')}</table>`;
    const radius = /roundRect/.test(it.shape || '') ? 'border-radius:12px;' : it.shape === 'ellipse' ? 'border-radius:50%;' : '';
    const valign = it.anchor === 'ctr' || it.title ? 'center' : it.anchor === 'b' ? 'flex-end' : 'flex-start';
    return `<div class="box${it.title ? ' title' : ''}" style="position:absolute;${pos};${it.fill ? `background:#${it.fill};` : ''}${radius}justify-content:${valign};">${it.paras.map((p) => `<p style="${p.align ? `text-align:${p.align};` : ''}${p.level ? `margin-left:${p.level * 28}px;` : ''}">${p.bullet && p.runs.some((r) => r.text && r.text.trim()) ? `<span class="bu">${esc(p.bullet)}</span>` : ''}${p.runs.map(run).join('') || '&nbsp;'}</p>`).join('')}</div>`;
  }).join('')}</section>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: ${w}px ${h}px; margin: 0; }
    html, body { margin: 0; padding: 0; }
    body { font-family: Calibri, Carlito, "Segoe UI", Arial, sans-serif; color: #111; -webkit-print-color-adjust: exact; }
    .slide { position: relative; width: ${w}px; height: ${h}px; overflow: hidden; page-break-after: always; break-after: page; }
    .slide:last-child { page-break-after: auto; break-after: auto; }
    .box { box-sizing: border-box; padding: 7px 10px; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-start; }
    .box.title { justify-content: center; }
    .box p { margin: 0 0 6px; line-height: 1.15; }
    .bu { display: inline-block; width: 1.1em; }
    .tbl { border-collapse: collapse; table-layout: fixed; font-size: 18px; }
    .tbl td { border: 1px solid #fff; padding: 6px 10px; vertical-align: middle; }
  </style></head><body>${pages}</body></html>`;
}

/** Gera PPTX a partir dos slides. */
async function writePptx(deck, out, title) {
  const PptxGenJS = require('pptxgenjs');
  const pptx = new PptxGenJS();
  const inW = deck.w / 96;
  const inH = deck.h / 96;
  pptx.defineLayout({ name: 'GCP', width: inW, height: inH });
  pptx.layout = 'GCP';
  pptx.title = title || '';
  pptx.company = 'GCP Converter';
  for (const s of deck.slides) {
    const slide = pptx.addSlide();
    if (s.bg) slide.background = { color: s.bg };
    for (const it of s.items) {
      const box = { x: it.x / 96, y: it.y / 96, w: Math.max(0.1, it.w / 96), h: Math.max(0.1, it.h / 96) };
      if (it.type === 'img') { slide.addImage({ data: it.src, ...box }); continue; }
      if (it.type === 'table') {
        slide.addTable(it.rows.map((r, ri) => r.filter((c) => !c.merged).map((c) => ({ text: c.text, options: { bold: c.b || ri === 0, fill: c.fill ? { color: c.fill } : undefined, colspan: c.span > 1 ? c.span : undefined } }))), { ...box, fontSize: 14, border: { type: 'solid', pt: 1, color: 'BFBFBF' } });
        continue;
      }
      const runs = [];
      it.paras.forEach((p, k) => {
        const align = p.align === 'justify' ? 'justify' : p.align || 'left';
        const rs = p.runs.filter((r) => !r.br);
        if (!rs.length) { runs.push({ text: '', options: { breakLine: true, align } }); return; }
        rs.forEach((r, j) => runs.push({ text: r.text || '', options: { bold: !!r.b, italic: !!r.i, underline: r.u ? { style: 'sng' } : undefined, color: r.color, fontSize: r.size || 18, align, bullet: j === 0 && p.bullet ? { indent: 18 } : false, indentLevel: p.level || 0, breakLine: j === rs.length - 1 && k < it.paras.length - 1 } }));
      });
      slide.addText(runs, { ...box, valign: it.title || it.anchor === 'ctr' ? 'middle' : it.anchor === 'b' ? 'bottom' : 'top', shape: /roundRect/.test(it.shape || '') ? pptx.ShapeType.roundRect : undefined, rectRadius: /roundRect/.test(it.shape || '') ? 0.15 : undefined, fill: it.fill ? { color: it.fill } : undefined, margin: 4, fontFace: 'Calibri' });
    }
  }
  const buf = await pptx.write({ outputType: 'nodebuffer' });
  fs.writeFileSync(out, buf);
}

module.exports = { readPptx, slidesToHtml, writePptx };
