// Planilhas: leitura (XLSX, CSV, ODS) e escrita (XLSX, CSV, ODS, HTML).
'use strict';
const fs = require('fs');
const { esc } = require('./util');

function parseCsv(text) {
  text = text.replace(/^﻿/, '');
  const sample = text.slice(0, 5000);
  const counts = { ',': 0, ';': 0, '\t': 0, '|': 0 };
  let q = false;
  for (const c of sample) { if (c === '"') q = !q; else if (!q && c in counts) counts[c]++; }
  const delim = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : ',';
  const rows = [];
  let row = [], field = '', inq = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inq) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inq = false; }
      else field += c;
    } else if (c === '"') inq = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  const num = (s) => {
    const t = s.trim();
    if (/^-?\d+([.,]\d+)?$/.test(t)) return parseFloat(t.replace(',', '.'));
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) return parseFloat(t.replace(/\./g, '').replace(',', '.'));
    return s === '' ? null : s;
  };
  return { rows: rows.map((r) => r.map(num)), delim };
}

async function readSheets(file, ext) {
  if (ext === 'csv' || ext === 'tsv' || ext === 'txt') {
    return [{ name: 'Planilha1', rows: parseCsv(fs.readFileSync(file, 'utf8')).rows }];
  }
  if (ext === 'ods') return require('./odf').readOds(file);
  const ExcelJS = require('exceljs');
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(file);
  return wb.worksheets.map((ws) => {
    const rows = [];
    ws.eachRow({ includeEmpty: true }, (row, r) => {
      const vals = [];
      row.eachCell({ includeEmpty: true }, (cell, c) => {
        let v = cell.value;
        if (v && typeof v === 'object' && !(v instanceof Date)) {
          if ('result' in v) v = v.result;
          else if ('richText' in v) v = v.richText.map((t) => t.text).join('');
          else if ('text' in v) v = v.text;
          else if ('error' in v) v = v.error;
          else v = String(v);
        }
        vals[c - 1] = v === undefined ? null : v;
      });
      rows[r - 1] = Array.from(vals, (x) => (x === undefined ? null : x));
    });
    return { name: ws.name, rows: Array.from(rows, (x) => x || []) };
  });
}

async function writeXlsx(sheets, out) {
  const ExcelJS = require('exceljs');
  const wb = new ExcelJS.Workbook();
  wb.creator = 'GCP Converter';
  for (const s of sheets) {
    const ws = wb.addWorksheet((s.name || 'Planilha').replace(/[\\/?*[\]:]/g, '_').slice(0, 31));
    s.rows.forEach((r) => ws.addRow(r));
    // estilos (quando a origem tem: ODS)
    if (s.styles) {
      s.styles.forEach((row, ri) => row.forEach((st, ci) => {
        if (!st || !Object.keys(st).length) return;
        const cell = ws.getCell(ri + 1, ci + 1);
        if (st.numFmt) cell.numFmt = st.numFmt;
        if (st.bold || st.italic || st.color || st.size) cell.font = { bold: !!st.bold, italic: !!st.italic, color: st.color ? { argb: 'FF' + st.color } : undefined, size: st.size };
        if (st.bg) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + st.bg } };
        if (st.align) cell.alignment = { horizontal: st.align };
        if (st.border) cell.border = { bottom: { style: 'thin' } };
      }));
    } else {
      // datas sem formato definido
      s.rows.forEach((r, ri) => r.forEach((v, ci) => { if (v instanceof Date) ws.getCell(ri + 1, ci + 1).numFmt = 'dd/mm/yyyy'; }));
    }
    (s.merges || []).forEach((m) => { try { ws.mergeCells(m.r + 1, m.c + 1, m.r + m.rs, m.c + m.cs); } catch {} });
    // larguras: da origem (px → caracteres) ou automáticas
    const widths = [];
    s.rows.forEach((r) => r.forEach((v, i) => { widths[i] = Math.max(widths[i] || 8, Math.min(60, String(v == null ? '' : v instanceof Date ? '00/00/0000' : v).length + 2)); }));
    widths.forEach((w, i) => { const src = s.widths && s.widths[i]; ws.getColumn(i + 1).width = src ? Math.max(4, Math.round(src / 7)) : w; });
  }
  await wb.xlsx.writeFile(out);
}

function writeCsv(sheets, out, delim = ',') {
  const cell = (v) => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString().slice(0, 10) : String(v);
    return /[",\n\r;]/.test(s) || s.includes(delim) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const s = sheets[0] || { rows: [] };
  fs.writeFileSync(out, '﻿' + s.rows.map((r) => r.map(cell).join(delim)).join('\r\n') + '\r\n', 'utf8');
}

function sheetsToHtml(sheets, title) {
  const fmt = (v) => (v === null || v === undefined ? '' : v instanceof Date ? v.toLocaleDateString('pt-BR') : typeof v === 'number' ? v.toLocaleString('pt-BR') : esc(v));
  const body = sheets.map((s) => `${sheets.length > 1 ? `<h2>${esc(s.name)}</h2>` : ''}<table>${s.rows.map((r) => `<tr>${r.map((v) => `<td${typeof v === 'number' ? ' class="n"' : ''}>${fmt(v)}</td>`).join('')}</tr>`).join('')}</table>`).join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title || '')}</title><style>@page{size:A4 landscape;margin:12mm}body{font-family:Calibri,Carlito,Arial,sans-serif;font-size:10pt}table{border-collapse:collapse;margin-bottom:18px}td{border:1px solid #c8ccd8;padding:3px 6px;vertical-align:top}td.n{text-align:right}h2{font-size:13pt}</style></head><body>${body}</body></html>`;
}

module.exports = { readSheets, writeXlsx, writeCsv, sheetsToHtml, parseCsv };
