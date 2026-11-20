// RTF: leitura (RTF → HTML) e escrita (blocos → RTF), sem programas externos.
'use strict';
const { esc, dataUrlToBytes } = require('./util');

const CP1252 = { 0x80: 0x20ac, 0x82: 0x201a, 0x83: 0x192, 0x84: 0x201e, 0x85: 0x2026, 0x86: 0x2020, 0x87: 0x2021, 0x88: 0x2c6, 0x89: 0x2030, 0x8a: 0x160, 0x8b: 0x2039, 0x8c: 0x152, 0x8e: 0x17d, 0x91: 0x2018, 0x92: 0x2019, 0x93: 0x201c, 0x94: 0x201d, 0x95: 0x2022, 0x96: 0x2013, 0x97: 0x2014, 0x98: 0x2dc, 0x99: 0x2122, 0x9a: 0x161, 0x9b: 0x203a, 0x9c: 0x153, 0x9e: 0x17e, 0x9f: 0x178 };
const SKIP_DEST = new Set(['fonttbl', 'colortbl', 'stylesheet', 'info', 'listtable', 'listoverridetable', 'rsidtbl', 'generator', 'xmlnstbl', 'themedata', 'colorschememapping', 'latentstyles', 'datastore', 'header', 'footer', 'headerl', 'headerr', 'footerl', 'footerr', 'headerf', 'footerf', 'fldinst', 'object', 'filetbl', 'revtbl', 'mmathPr', 'pgdsctbl', 'wgrffmtfilter', 'fchars', 'lchars', 'bkmkstart', 'bkmkend', 'nonshppict', 'background', 'shpinst', 'sp', 'sv', 'sn', 'listtext', 'pntext', 'pntxtb', 'pntxta']);

function readRtf(text) {
  let i = 0;
  const n = text.length;
  const stack = [];
  let st = { b: false, i: false, u: false, s: false, sup: false, sub: false, skip: false, uc: 1, color: 0 };
  const colors = [];
  let html = '';
  let para = '';
  let inTable = false;
  let row = [];
  let cell = '';
  let paraAlign = '';
  let curIntbl = false;
  let outline = -1;
  let pict = null;
  let ucSkip = 0;
  const open = () => {
    let o = '';
    if (st.b) o += '<b>'; if (st.i) o += '<i>'; if (st.u) o += '<u>'; if (st.s) o += '<s>'; if (st.sup) o += '<sup>'; if (st.sub) o += '<sub>';
    return o;
  };
  const close = () => {
    let o = '';
    if (st.sub) o += '</sub>'; if (st.sup) o += '</sup>'; if (st.s) o += '</s>'; if (st.u) o += '</u>'; if (st.i) o += '</i>'; if (st.b) o += '</b>';
    return o;
  };
  const emit = (s) => {
    if (ucSkip > 0) { ucSkip--; return; }
    if (st.skip) return;
    const t = open() + esc(s) + close();
    const c = st.color && colors[st.color] ? `<span style="color:${colors[st.color]}">${t}</span>` : t;
    if (inTable && curIntbl) cell += c; else para += c;
  };
  const endPara = () => {
    const content = para;
    para = '';
    if (inTable && curIntbl) { cell += content + '<br>'; return; }
    if (inTable) { inTable = false; html += '</table>'; }
    if (outline >= 0 && outline < 6 && content.replace(/<[^>]+>/g, '').trim()) { const lv = outline + 1; html += `<h${lv}>${content.replace(/<\/?b>/g, '')}</h${lv}>`; return; }
    html += `<p${paraAlign ? ` style="text-align:${paraAlign}"` : ''}>${content || '&nbsp;'}</p>`;
  };
  let colorDefs = null;
  while (i < n) {
    const ch = text[i];
    if (ch === '{') { stack.push({ ...st }); i++; if (pict) pict.depth++; continue; }
    if (ch === '}') {
      if (pict) { pict.depth--; if (pict.depth === 0) { finishPict(); } }
      if (colorDefs && st.colortbl) { colorDefs = null; }
      st = stack.pop() || st; i++; continue;
    }
    if (ch === '\\') {
      const next = text[i + 1];
      if (next === '\\' || next === '{' || next === '}') { if (pict) { i += 2; continue; } emit(next); i += 2; continue; }
      if (next === "'") {
        const code = parseInt(text.substr(i + 2, 2), 16);
        i += 4;
        if (st.colortbl) continue;
        emit(String.fromCharCode(CP1252[code] || code));
        continue;
      }
      if (next === '*') { st.skip = true; i += 2; continue; }
      if (next === '~') { emit('\u00a0'); i += 2; continue; }
      if (next === '-' || next === '_') { i += 2; continue; }
      if (next === '\n' || next === '\r') { endPara(); i += 2; continue; }
      const m = /^([a-zA-Z]+)(-?\d+)? ?/.exec(text.slice(i + 1, i + 40));
      if (!m) { i++; continue; }
      i += 1 + m[0].length;
      const word = m[1];
      const arg = m[2] !== undefined ? parseInt(m[2], 10) : null;
      if (pict) {
        if (word === 'pngblip') pict.type = 'png';
        else if (word === 'jpegblip') pict.type = 'jpeg';
        else if (word === 'picwgoal') pict.w = arg / 15;
        else if (word === 'pichgoal') pict.h = arg / 15;
        continue;
      }
      if (SKIP_DEST.has(word)) { st.skip = true; continue; }
      switch (word) {
        case 'colortbl': st.skip = true; st.colortbl = true; colorDefs = { r: 0, g: 0, b: 0 }; parseColors(); break;
        case 'pict': pict = { depth: 1, hex: '', type: '', state: st }; st.skip = true; break;
        case 'par': case 'sect': endPara(); break;
        case 'line': if (inTable && curIntbl) cell += '<br>'; else para += '<br>'; break;
        case 'tab': emit('\t'); break;
        case 'page': html += '<hr class="pagebreak">'; break;
        case 'pard': paraAlign = ''; curIntbl = false; outline = -1; break;
        case 'outlinelevel': outline = arg == null ? -1 : arg; break;
        case 'qc': paraAlign = 'center'; break;
        case 'qr': paraAlign = 'right'; break;
        case 'qj': paraAlign = 'justify'; break;
        case 'ql': paraAlign = ''; break;
        case 'plain': st.b = st.i = st.u = st.s = st.sup = st.sub = false; st.color = 0; break;
        case 'b': st.b = arg !== 0; break;
        case 'i': st.i = arg !== 0; break;
        case 'ul': st.u = arg !== 0; break;
        case 'ulnone': st.u = false; break;
        case 'strike': st.s = arg !== 0; break;
        case 'super': st.sup = true; break;
        case 'sub': st.sub = true; break;
        case 'nosupersub': st.sup = st.sub = false; break;
        case 'cf': st.color = arg || 0; break;
        case 'uc': st.uc = arg || 1; break;
        case 'u': { let c = arg < 0 ? arg + 65536 : arg; emit(String.fromCharCode(c)); ucSkip = st.uc; break; }
        case 'emdash': emit('—'); break;
        case 'endash': emit('–'); break;
        case 'bullet': emit('•'); break;
        case 'lquote': emit('‘'); break;
        case 'rquote': emit('’'); break;
        case 'ldblquote': emit('“'); break;
        case 'rdblquote': emit('”'); break;
        case 'trowd': curIntbl = true; if (!inTable) { inTable = true; html += '<table>'; } row = []; break;
        case 'cell': row.push(cell + para); cell = ''; para = ''; break;
        case 'row': html += `<tr>${row.map((c) => `<td>${c.replace(/(<br>)+$/, '')}</td>`).join('')}</tr>`; row = []; break;
        case 'intbl': curIntbl = true; if (!inTable) { inTable = true; html += '<table>'; } break;
        default: break;
      }
      continue;
    }
    if (ch === '\r' || ch === '\n') { i++; continue; }
    if (pict) { if (pict.depth === 1 && /[0-9a-fA-F]/.test(ch)) pict.hex += ch; i++; continue; }
    // texto comum (bloco até o próximo controle)
    let j = i;
    while (j < n && !'\\{}\r\n'.includes(text[j])) j++;
    const chunk = text.slice(i, j);
    if (ucSkip > 0) {
      const k = Math.min(ucSkip, chunk.length);
      ucSkip -= k;
      if (chunk.length > k) emit(chunk.slice(k));
    } else emit(chunk);
    i = j;
  }
  if (para) endPara();
  if (inTable) html += '</table>';
  return { html };

  function parseColors() {
    // lê a tabela de cores imediatamente
    let j = i;
    let r = 0, g = 0, b = 0;
    colors.length = 0;
    while (j < n && text[j] !== '}') {
      const m = /^\\(red|green|blue)(\d+)/.exec(text.slice(j, j + 12));
      if (m) { if (m[1] === 'red') r = +m[2]; if (m[1] === 'green') g = +m[2]; if (m[1] === 'blue') b = +m[2]; j += m[0].length; continue; }
      if (text[j] === ';') { colors.push(`rgb(${r},${g},${b})`); r = g = b = 0; }
      j++;
    }
  }
  function finishPict() {
    const p = pict;
    pict = null;
    if (p.type && p.hex.length > 10) {
      const b64 = Buffer.from(p.hex, 'hex').toString('base64');
      const tag = `<img src="data:image/${p.type};base64,${b64}"${p.w ? ` width="${Math.round(p.w)}"` : ''}>`;
      if (inTable && curIntbl) cell += tag; else para += tag;
    }
  }
}

function rtfText(s) {
  let o = '';
  for (const ch of String(s)) {
    const c = ch.codePointAt(0);
    if (ch === '\\' || ch === '{' || ch === '}') o += '\\' + ch;
    else if (ch === '\t') o += '\\tab ';
    else if (c < 128) o += ch;
    else if (c > 0xffff) { const h = Math.floor((c - 0x10000) / 0x400) + 0xd800; const l = ((c - 0x10000) % 0x400) + 0xdc00; o += `\\u${h - 65536}?\\u${l - 65536}?`; }
    else o += `\\u${c > 32767 ? c - 65536 : c}?`;
  }
  return o;
}

/** Gera RTF a partir de blocos. */
function writeRtf(blocks, title) {
  const colors = ['000000', '7c3aed'];
  const colorIdx = (hex) => { let k = colors.indexOf(hex); if (k < 0) { colors.push(hex); k = colors.length - 1; } return k + 1; };
  const inl = (list) => (list || []).map((r) => {
    if (r.br) return '\\line ';
    if (r.img) {
      const bin = dataUrlToBytes(r.img);
      if (!bin || !['png', 'jpg'].includes(bin.ext)) return '';
      let w = r.w || 400, h = r.h || 300;
      if (w > 640) { h = h * 640 / w; w = 640; }
      return `{\\pict\\${bin.ext === 'png' ? 'pngblip' : 'jpegblip'}\\picwgoal${Math.round(w * 15)}\\pichgoal${Math.round(h * 15)} ${bin.bytes.toString('hex')}}`;
    }
    let pre = '';
    if (r.b) pre += '\\b'; if (r.i) pre += '\\i'; if (r.u) pre += '\\ul'; if (r.s) pre += '\\strike'; if (r.sup) pre += '\\super'; if (r.sub) pre += '\\sub';
    if (r.code) pre += '\\f1';
    if (r.href) pre += `\\cf2`;
    else if (r.color) pre += `\\cf${colorIdx(r.color)}`;
    const body = rtfText(r.text || '');
    const t = pre ? `{${pre} ${body}}` : body;
    return r.href ? `{\\field{\\*\\fldinst{HYPERLINK "${r.href.replace(/"/g, '')}"}}{\\fldrslt ${t}}}` : t;
  }).join('');
  const align = (a) => ({ center: '\\qc', right: '\\qr', justify: '\\qj' }[a] || '\\ql');
  const SIZES = [44, 34, 28, 25, 23, 22];
  const out = [];
  const block = (b, indent = 0) => {
    switch (b.t) {
      case 'h': out.push(`\\pard\\s${b.level}\\sb240\\sa120\\keepn${align(b.align)}\\li${indent}\\b\\fs${SIZES[b.level - 1]} ${inl(b.inl)}\\b0\\fs22\\par`); break;
      case 'p': out.push(`\\pard\\sa120\\sl276\\slmult1${align(b.align)}\\li${indent} ${inl(b.inl)}\\par`); break;
      case 'pre': b.text.split('\n').forEach((l) => out.push(`\\pard\\li${indent}{\\f1\\fs19 ${rtfText(l)}}\\par`)); break;
      case 'quote': b.blocks.forEach((x) => block(x, indent + 567)); break;
      case 'hr': out.push('\\pard\\brdrb\\brdrs\\brdrw10\\brsp20 \\par'); break;
      case 'pagebreak': out.push('\\page'); break;
      case 'list': b.items.forEach((it, k) => {
        const mark = b.ordered ? `${k + 1}.` : '\\bullet';
        const [first, ...rest] = it.length ? it : [{ t: 'p', inl: [] }];
        if (first.t === 'p') out.push(`\\pard\\sa60\\fi-360\\li${indent + 720}\\tx${indent + 720} ${mark}\\tab ${inl(first.inl)}\\par`);
        else { out.push(`\\pard\\fi-360\\li${indent + 720} ${mark}\\tab\\par`); block(first, indent + 720); }
        rest.forEach((x) => block(x, indent + 720));
      }); break;
      case 'table': {
        const n = Math.max(...b.rows.map((r) => r.length));
        const w = Math.floor(9638 / n);
        b.rows.forEach((r) => {
          let defs = '\\trowd\\trgaph108\\trleft0';
          for (let c = 0; c < n; c++) defs += `\\clbrdrt\\brdrs\\brdrw10\\clbrdrl\\brdrs\\brdrw10\\clbrdrb\\brdrs\\brdrw10\\clbrdrr\\brdrs\\brdrw10\\cellx${w * (c + 1)}`;
          const cells = [];
          for (let c = 0; c < n; c++) {
            const cell = r[c];
            const txt = cell ? cell.blocks.map((x) => (x.t === 'p' || x.t === 'h' ? inl(cell.head ? x.inl.map((y) => ({ ...y, b: true })) : x.inl) : '')).join('\\line ') : '';
            cells.push(`\\pard\\intbl ${txt}\\cell`);
          }
          out.push(defs + cells.join('') + '\\row');
        });
        out.push('\\pard\\par');
        break;
      }
      default: break;
    }
  };
  blocks.forEach((b) => block(b));
  const ctbl = '{\\colortbl;' + colors.map((h) => `\\red${parseInt(h.slice(0, 2), 16)}\\green${parseInt(h.slice(2, 4), 16)}\\blue${parseInt(h.slice(4, 6), 16)};`).join('') + '}';
  return `{\\rtf1\\ansi\\ansicpg1252\\deff0\\uc1{\\fonttbl{\\f0\\fswiss\\fcharset0 Arial;}{\\f1\\fmodern\\fcharset0 Courier New;}}${ctbl}{\\info{\\title ${rtfText(title || '')}}{\\doccomm GCP Converter}}\\paperw11906\\paperh16838\\margl1134\\margr1134\\margt1134\\margb1134\\fs22\n${out.join('\n')}\n}`;
}

module.exports = { readRtf, writeRtf };
