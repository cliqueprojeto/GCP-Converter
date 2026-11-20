// Teste dos motores embutidos de documentos e e-books (sem LibreOffice/Calibre).
// Uso: FIXTURES=<pasta com relatorio.docx, .odt, .rtf, planilha.xlsx/.ods/.csv,
//       apresentacao.pptx/.odp, livro.md, foto.png> GCP_NO_EXTERNAL=1 xvfb-run -a node scripts/e2e-docs.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright')); }

const F = process.env.FIXTURES;
const out = fs.mkdtempSync(path.join(os.tmpdir(), 'gcp-docs-'));
const f = (n) => path.join(F, n);

const DOC_T = ['pdf', 'docx', 'odt', 'rtf', 'txt', 'html', 'md', 'epub'];
const cases = [];
for (const src of ['relatorio.docx', 'relatorio.odt', 'relatorio.rtf', 'relatorio.html', 'livro.md']) for (const t of DOC_T) if (!src.endsWith('.' + t)) cases.push({ category: 'document', target: t, files: [f(src)] });
for (const src of ['planilha.xlsx', 'planilha.ods', 'planilha.csv']) for (const t of ['pdf', 'xlsx', 'ods', 'csv', 'html']) if (!src.endsWith('.' + t)) cases.push({ category: 'document', target: t, files: [f(src)] });
for (const src of ['apresentacao.pptx', 'apresentacao.odp']) for (const t of ['pdf', 'pptx', 'odp', 'html', 'docx']) if (!src.endsWith('.' + t)) cases.push({ category: 'document', target: t, files: [f(src)] });
for (const src of ['relatorio.docx', 'livro.md', 'relatorio.odt']) for (const t of ['epub', 'mobi', 'fb2']) cases.push({ category: 'ebook', target: t, files: [f(src)], options: { title: 'Livro Teste', author: 'Bruno Albertini' } });
cases.push({ category: 'image', target: 'png', files: [f('foto.png')], stage2: false });
// notas fiscais (XML fictício)
cases.push({ category: 'fiscal', target: 'pdf', files: [path.join(__dirname, 'fixture-cfe-ficticio.xml')] });
// arquivos complexos (mesclagens, formatos numéricos, layouts de slide, tabelas, formas)
for (const src of ['complexa.xlsx', 'complexa.ods']) if (fs.existsSync(f(src))) for (const t of ['pdf', 'xlsx', 'ods', 'csv', 'html']) if (!src.endsWith('.' + t)) cases.push({ category: 'document', target: t, files: [f(src)] });
for (const src of ['complexa.pptx', 'complexa.odp']) if (fs.existsSync(f(src))) for (const t of ['pdf', 'pptx', 'odp', 'html', 'docx', 'epub']) if (!src.endsWith('.' + t)) cases.push({ category: 'document', target: t, files: [f(src)] });

(async () => {
  const app = await playwright._electron.launch({ executablePath: process.env.APP_EXE || require('electron'), args: process.env.APP_EXE ? ['--no-sandbox'] : [root, '--no-sandbox'], env: { ...process.env } });
  const win = await app.firstWindow();
  await win.waitForSelector('.cat-grid', { timeout: 30000 });
  await win.evaluate((o) => window.gcp.setSettings({ outputMode: 'custom', outputDir: o, concurrency: 3, conflict: 'rename' }), out);
  const runAll = async (list) => {
    await win.evaluate(() => window.gcp.clearFinished());
    for (const c of list) await win.evaluate((b) => window.gcp.addJobs({ lang: 'pt-BR', ...b }), c);
    const start = Date.now();
    let jobs = [];
    while (Date.now() - start < 600000) {
      jobs = await win.evaluate(() => window.gcp.listJobs());
      if (jobs.length && jobs.every((j) => !['queued', 'running'].includes(j.status))) break;
      await new Promise((r) => setTimeout(r, 700));
    }
    return jobs;
  };
  let jobs = await runAll(cases);
  // 2ª etapa: os arquivos gerados (PDF, MOBI, FB2, EPUB) também são lidos de volta
  const produced = jobs.filter((j) => j.status === 'done');
  const pick = (ext, re) => produced.find((j) => j.ext === ext && (!re || re.test(j.input)));
  const stage2 = [];
  const pdf = pick('pdf', /relatorio\.docx/);
  if (pdf) for (const t of ['docx', 'pptx', 'xlsx', 'txt', 'epub', 'odt', 'html']) stage2.push({ category: 'document', target: t, files: [pdf.output] });
  if (pdf) stage2.push({ category: 'image', target: 'png', files: [pdf.output] });
  for (const ext of ['mobi', 'fb2', 'epub']) { const j = pick(ext, /livro\.md/); if (j) for (const t of ['pdf', 'txt', 'epub', 'docx']) if (t !== ext) stage2.push({ category: 'ebook', target: t, files: [j.output] }); }
  const jobs2 = await runAll(stage2);
  let fail = 0;
  for (const j of [...jobs, ...jobs2]) {
    const ok = j.status === 'done' && fs.existsSync(j.output) && fs.statSync(j.output).size > 0;
    if (!ok) fail++;
    console.log(`${ok ? '✓' : '✗'} ${path.basename(j.input).padEnd(38)} → ${String(j.ext).padEnd(5)} ${String(j.sizeOut).padStart(8)}  ${j.output ? path.basename(j.output) : ''}${j.error ? '  ' + j.error : ''}`);
  }
  await app.close();
  const total = jobs.length + jobs2.length;
  console.log(`\n${total - fail}/${total} OK · saída: ${out}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
