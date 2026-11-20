// Converte o HTML renderizado em uma estrutura simples de blocos
// (títulos, parágrafos, listas, tabelas, imagens) usada pelos geradores
// DOCX, ODT, RTF, FB2 e MOBI. Executado dentro do Chromium.
(async function () {
  const BLOCK = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'TABLE', 'PRE', 'BLOCKQUOTE', 'HR', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'MAIN', 'NAV', 'ASIDE', 'FIGURE', 'FIGCAPTION', 'DL', 'DT', 'DD', 'ADDRESS', 'CENTER', 'BODY', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'CAPTION']);
  const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'TITLE', 'META', 'LINK', 'IFRAME', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']);

  async function toDataURL(img) {
    const src = img.currentSrc || img.src;
    if (!src) return null;
    if (src.startsWith('data:')) return src;
    try {
      const blob = await (await fetch(src)).blob();
      return await new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = () => r(null); fr.readAsDataURL(blob); });
    } catch { return null; }
  }

  function marksOf(el, base) {
    const m = { ...base };
    const tag = el.tagName;
    const cs = getComputedStyle(el);
    if (tag === 'B' || tag === 'STRONG' || parseInt(cs.fontWeight, 10) >= 600) m.b = true;
    if (tag === 'I' || tag === 'EM' || tag === 'CITE' || cs.fontStyle === 'italic') m.i = true;
    if (tag === 'U' || tag === 'INS' || (cs.textDecorationLine || '').includes('underline')) m.u = true;
    if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL' || (cs.textDecorationLine || '').includes('line-through')) m.s = true;
    if (tag === 'CODE' || tag === 'KBD' || tag === 'SAMP' || tag === 'TT') m.code = true;
    if (tag === 'SUP') m.sup = true;
    if (tag === 'SUB') m.sub = true;
    if (tag === 'A' && el.getAttribute('href') && !el.getAttribute('href').startsWith('#')) { m.href = el.href; m.u = true; }
    const color = cs.color;
    if (color && !/^rgba?\(0, 0, 0|rgb\(27, 34, 53\)|rgb\(15, 23, 42\)/.test(color)) {
      const mm = color.match(/rgba?\((\d+), (\d+), (\d+)/);
      if (mm && !m.href) m.color = [mm[1], mm[2], mm[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('');
    }
    return m;
  }

  async function inlines(node, base, out) {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) {
        const text = ch.textContent.replace(/\s+/g, ' ');
        if (text) out.push({ text, ...base });
      } else if (ch.nodeType === 1) {
        if (SKIP.has(ch.tagName)) continue;
        if (ch.tagName === 'BR') { out.push({ br: true }); continue; }
        if (ch.tagName === 'IMG') {
          const src = await toDataURL(ch);
          if (src) out.push({ img: src, w: ch.naturalWidth || ch.width || 0, h: ch.naturalHeight || ch.height || 0, alt: ch.alt || '' });
          continue;
        }
        await inlines(ch, marksOf(ch, base), out);
      }
    }
    return out;
  }

  function trimInl(arr) {
    while (arr.length && arr[0].text !== undefined && !arr[0].text.trim()) arr.shift();
    if (arr.length && arr[0].text !== undefined) arr[0] = { ...arr[0], text: arr[0].text.replace(/^\s+/, '') };
    const last = arr.length - 1;
    if (last >= 0 && arr[last].text !== undefined) arr[last] = { ...arr[last], text: arr[last].text.replace(/\s+$/, '') };
    return arr.filter((x) => x.text === undefined || x.text !== '');
  }

  function hasBlockChild(el) {
    for (const ch of el.children) if (BLOCK.has(ch.tagName) || (ch.tagName === 'IMG' && ch.width > 200)) return true;
    return false;
  }

  async function blocksOf(el, out, ctx = {}) {
    let pending = [];
    const flush = async () => {
      const inl = trimInl(pending);
      if (inl.length) out.push({ t: 'p', inl, align: ctx.align });
      pending = [];
    };
    for (const ch of el.childNodes) {
      if (ch.nodeType === 3) { if (ch.textContent.trim()) pending.push({ text: ch.textContent.replace(/\s+/g, ' ') }); continue; }
      if (ch.nodeType !== 1 || SKIP.has(ch.tagName)) continue;
      const tag = ch.tagName;
      if (getComputedStyle(ch).display === 'none') continue;
      if (!BLOCK.has(tag) && tag !== 'IMG') { await inlines({ childNodes: [ch] }, {}, pending); continue; }
      if (tag === 'IMG') { await inlines({ childNodes: [ch] }, {}, pending); continue; }
      await flush();
      const align = (() => { const a = getComputedStyle(ch).textAlign; return ['center', 'right', 'justify'].includes(a) ? a : undefined; })();
      if (/^H[1-6]$/.test(tag)) {
        const inl = trimInl(await inlines(ch, {}, []));
        if (inl.length) out.push({ t: 'h', level: +tag[1], inl, align });
      } else if (tag === 'UL' || tag === 'OL') {
        const items = [];
        for (const li of ch.children) {
          if (li.tagName !== 'LI') continue;
          const b = [];
          await blocksOf(li, b, {});
          items.push(b);
        }
        if (items.length) out.push({ t: 'list', ordered: tag === 'OL', items });
      } else if (tag === 'TABLE') {
        const rows = [];
        for (const tr of ch.querySelectorAll(':scope > tr, :scope > thead > tr, :scope > tbody > tr, :scope > tfoot > tr')) {
          const cells = [];
          for (const td of tr.children) {
            if (td.tagName !== 'TD' && td.tagName !== 'TH') continue;
            const b = [];
            await blocksOf(td, b, {});
            cells.push({ head: td.tagName === 'TH', colspan: td.colSpan || 1, rowspan: td.rowSpan || 1, blocks: b });
          }
          if (cells.length) rows.push(cells);
        }
        if (rows.length) out.push({ t: 'table', rows });
      } else if (tag === 'PRE') {
        out.push({ t: 'pre', text: ch.innerText.replace(/\n$/, '') });
      } else if (tag === 'BLOCKQUOTE') {
        const b = [];
        await blocksOf(ch, b, {});
        out.push({ t: 'quote', blocks: b });
      } else if (tag === 'HR') {
        out.push({ t: ch.classList.contains('pagebreak') ? 'pagebreak' : 'hr' });
      } else if (hasBlockChild(ch)) {
        await blocksOf(ch, out, { align: align || ctx.align });
      } else {
        const inl = trimInl(await inlines(ch, marksOf(ch, {}), []));
        if (inl.length) out.push({ t: 'p', inl, align: align || ctx.align });
      }
      const pb = getComputedStyle(ch).breakAfter;
      if (pb === 'page') out.push({ t: 'pagebreak' });
    }
    await flush();
    return out;
  }

  // aguarda imagens
  await Promise.all([...document.images].map((im) => (im.complete ? 0 : new Promise((r) => { im.onload = im.onerror = r; }))));
  const blocks = await blocksOf(document.body, []);
  return { title: document.title || '', blocks };
})();
