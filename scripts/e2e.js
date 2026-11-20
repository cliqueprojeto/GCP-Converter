// Teste ponta a ponta: abre o app (Electron), gera arquivos de exemplo e
// converte cada categoria pela fila real. Uso: xvfb-run -a node scripts/e2e.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ff = require('ffmpeg-static');

let playwright;
try { playwright = require('playwright'); } catch { playwright = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright')); }

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gcp-e2e-'));
const out = path.join(dir, 'out');
fs.mkdirSync(out);
const f = (n) => path.join(dir, n);
const run = (args) => execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);

// Arquivos de exemplo
run(['-f', 'lavfi', '-i', 'testsrc2=size=1280x720:rate=30:duration=4', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=4', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', f('video.mp4')]);
run(['-f', 'lavfi', '-i', 'sine=frequency=330:duration=5', '-ac', '2', f('audio.wav')]);
run(['-f', 'lavfi', '-i', 'testsrc2=size=1600x1000', '-frames:v', '1', f('photo.png')]);
fs.writeFileSync(f('image.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120"><rect width="200" height="120" rx="20" fill="#8b5cf6"/><circle cx="60" cy="60" r="30" fill="#fff"/></svg>');
fs.writeFileSync(f('doc.md'), '# Relatório\n\nTexto com **negrito** e _itálico_.\n\n## Seção 2\n\n- item 1\n- item 2\n\n| a | b |\n|---|---|\n| 1 | 2 |\n');
fs.writeFileSync(f('page.html'), '<html><head><title>Página</title></head><body><h1>Olá</h1><p>Parágrafo de teste.</p></body></html>');
fs.writeFileSync(f('notes.txt'), 'Linha 1\nLinha 2\nAcentuação: ção, ñ, ü\n');

const cases = [
  { category: 'video', target: 'webm', files: [f('video.mp4')], options: { quality: 'small', resolution: '480', speed: 'fast' } },
  { category: 'video', target: 'gif', files: [f('video.mp4')], options: { trimEnd: '2' } },
  { category: 'video', target: 'mkv', files: [f('video.mp4')], options: { videoCodec: 'h265', quality: 'small', speed: 'fast', trimEnd: '2' } },
  { category: 'audio', target: 'mp3', files: [f('audio.wav'), f('video.mp4')], options: { bitrate: '128', normalize: true, fadeOut: '1' } },
  { category: 'audio', target: 'flac', files: [f('audio.wav')], options: {} },
  { category: 'audio', target: 'opus', files: [f('audio.wav')], options: { bitrate: '64' } },
  { category: 'image', target: 'jpg', files: [f('photo.png'), f('image.svg')], options: { quality: 80, maxSide: '800' } },
  { category: 'image', target: 'webp', files: [f('photo.png')], options: { quality: 75 } },
  { category: 'image', target: 'avif', files: [f('photo.png')], options: { quality: 60, maxSide: '640' } },
  { category: 'image', target: 'ico', files: [f('photo.png')], options: {} },
  { category: 'image', target: 'pdf', files: [f('photo.png')], options: {} },
  { category: 'document', target: 'pdf', files: [f('doc.md'), f('page.html'), f('notes.txt')], options: {} },
  { category: 'document', target: 'html', files: [f('doc.md')], options: {} },
  { category: 'document', target: 'pdf', files: [f('doc.md'), f('photo.png')], options: { mergePdf: true } },
  { category: 'ebook', target: 'epub', files: [f('doc.md')], options: { title: 'Livro Teste' } },
  { category: 'compress', target: 'same', files: [f('video.mp4'), f('photo.png')], options: { level: 'strong' } },
  { category: 'compress', target: 'same', files: [f('video.mp4')], options: { level: 'target', targetMb: '0.1' } },
  { category: 'compress', target: 'zip', files: [f('doc.md'), f('notes.txt')], options: { zipName: 'pacote' } }
];

// Casos com motores opcionais (só se instalados)
const has = (b) => { try { execFileSync(process.platform === 'win32' ? 'where' : 'which', [b], { stdio: 'ignore' }); return true; } catch { return false; } };
if (has('soffice') || has('pandoc')) {
  cases.push({ category: 'document', target: 'docx', files: [f('doc.md'), f('page.html')], options: {} });
  cases.push({ category: 'document', target: 'odt', files: [f('page.html')], options: {} });
}
if (has('pandoc')) {
  execFileSync('pandoc', [f('doc.md'), '-o', f('fixture.docx')]);
  cases.push({ category: 'document', target: 'pdf', files: [f('fixture.docx')], options: {} });
  cases.push({ category: 'ebook', target: 'epub', files: [f('fixture.docx')], options: {} });
}

(async () => {
  const app = await playwright._electron.launch({ executablePath: process.env.APP_EXE || require('electron'), args: process.env.APP_EXE ? ['--no-sandbox'] : [root, '--no-sandbox'], env: { ...process.env, ELECTRON_ENABLE_LOGGING: '1' } });
  const win = await app.firstWindow();
  await win.waitForSelector('.cat-grid', { timeout: 20000 });
  await win.evaluate((o) => window.gcp.setSettings({ outputMode: 'custom', outputDir: o, concurrency: 3, conflict: 'rename' }), out);
  for (const c of cases) await win.evaluate((b) => window.gcp.addJobs(b), c);
  const start = Date.now();
  let jobs = [];
  while (Date.now() - start < 240000) {
    jobs = await win.evaluate(() => window.gcp.listJobs());
    if (jobs.every((j) => !['queued', 'running'].includes(j.status))) break;
    await new Promise((r) => setTimeout(r, 500));
  }
  let fail = 0;
  for (const j of jobs) {
    const ok = j.status === 'done' && fs.existsSync(j.output) && fs.statSync(j.output).size > 0;
    if (!ok) fail++;
    console.log(`${ok ? '✓' : '✗'} ${j.category.padEnd(8)} ${String(j.inExt).padEnd(4)} → ${String(j.ext).padEnd(5)} ${j.status.padEnd(9)} ${j.sizeIn} → ${j.sizeOut}${j.error ? '  ' + j.error : ''}`);
  }
  await app.close();
  console.log(`\n${jobs.length - fail}/${jobs.length} OK · saída: ${out}`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
