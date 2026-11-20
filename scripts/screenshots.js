// Gera as capturas de tela do README a partir do app real.
// Uso: xvfb-run -a node scripts/screenshots.js
'use strict';
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const ff = require('ffmpeg-static');
let playwright;
try { playwright = require('playwright'); } catch { playwright = require(path.join(execFileSync('npm', ['root', '-g']).toString().trim(), 'playwright')); }

const shots = path.join(root, 'docs', 'screenshots');
fs.mkdirSync(shots, { recursive: true });
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gcp-shots-'));
const f = (n) => path.join(dir, n);
const run = (args) => execFileSync(ff, ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
const names = ['Viagem_Lisboa_2026', 'Entrevista_Podcast_ep12', 'Making_of_Espetaculo', 'Teaser_Festival_Cultural'];
names.forEach((n, i) => run(['-f', 'lavfi', '-i', `testsrc2=size=1920x1080:rate=30:duration=${12 + i * 7}`, '-f', 'lavfi', '-i', `sine=frequency=${300 + i * 80}:duration=${12 + i * 7}`, '-vf', `hue=h=${i * 70}`, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-shortest', f(`${n}.mp4`)]));
['Show_ao_vivo.wav', 'Trilha_sonora.flac', 'Narracao.m4a'].forEach((n, i) => run(['-f', 'lavfi', '-i', `sine=frequency=${220 + i * 110}:duration=${30 + i * 20}`, '-ac', '2', f(n)]));
['Palco_principal.png', 'Cartaz_evento.png', 'Oficina_criativa.png'].forEach((n, i) => run(['-f', 'lavfi', '-i', `gradients=size=1600x1000:c0=0x${['6d4af0', '0ea5e9', 'ec4899'][i]}:c1=0x${['ec4899', '34d399', 'fbbf24'][i]}:seed=${i + 3}`, '-frames:v', '1', f(n)]));
fs.writeFileSync(f('Projeto_Cultural.md'), '# Projeto Cultural\n\nJustificativa e objetivos.\n');
fs.writeFileSync(f('Relatorio_Final.html'), '<h1>Relatório</h1><p>Texto</p>');

(async () => {
  const app = await playwright._electron.launch({ executablePath: require('electron'), args: [root, '--no-sandbox'] });
  const win = await app.firstWindow();
  await app.evaluate(({ BrowserWindow }) => { const w = BrowserWindow.getAllWindows()[0]; w.setSize(1440, 900); w.center(); });
  await win.waitForSelector('.cat-grid');
  await win.evaluate(() => window.gcp.setSettings({ language: 'pt-BR', theme: 'dark', outputMode: 'source', concurrency: 2 }));
  await win.reload();
  await win.waitForSelector('.cat-grid');
  await win.waitForTimeout(600);
  const shot = async (name) => { await win.waitForTimeout(500); await win.screenshot({ path: path.join(shots, `${name}.png`) }); console.log('📸', name); };
  const send = (files) => app.evaluate(({ BrowserWindow }, p) => BrowserWindow.getAllWindows()[0].webContents.send('files:opened', p), files);
  const click = (sel) => win.click(sel);

  await shot('01-inicio');
  await send(names.map((n) => f(`${n}.mp4`)));
  await win.waitForTimeout(3500);
  await click('.preset[data-id="instagram"]');
  await shot('02-video');
  await send(['Show_ao_vivo.wav', 'Trilha_sonora.flac', 'Narracao.m4a'].map(f));
  await win.waitForTimeout(1500);
  await click('.nav-item[data-route="audio"]');
  await win.waitForTimeout(1500);
  await click('.preset[data-id="podcast"]');
  await shot('03-audio');
  await send(['Palco_principal.png', 'Cartaz_evento.png', 'Oficina_criativa.png'].map(f));
  await win.waitForTimeout(1200);
  await click('.fmt[data-id="avif"]');
  await shot('04-imagem');
  await send([f('Projeto_Cultural.md'), f('Relatorio_Final.html')]);
  await win.waitForTimeout(1500);
  await shot('05-documentos');
  await click('.nav-item[data-route="ebook"]');
  await shot('06-ebooks');
  await click('.nav-item[data-route="compress"]');
  await shot('07-compactar');
  // fila com conversões em andamento
  await click('.nav-item[data-route="video"]');
  await win.waitForTimeout(500);
  await click('.preset[data-id="web"]');
  await click('[data-action="convert"]');
  await win.waitForTimeout(6000);
  await shot('08-fila');
  await win.evaluate(() => window.gcp.cancelAll());
  await click('.nav-item[data-route="settings"]');
  await shot('09-configuracoes');
  await click('.tab[data-tab="engines"]');
  await win.waitForTimeout(800);
  await shot('10-motores');
  await click('.tab[data-tab="about"]');
  await win.waitForTimeout(1500);
  await shot('11-sobre');
  await click('#heartBtn');
  await win.waitForTimeout(800);
  await shot('12-apoie');
  await win.keyboard.press('Escape');
  // tema claro
  await win.evaluate(() => window.gcp.setSettings({ theme: 'light', language: 'en' }));
  await win.reload();
  await win.waitForSelector('.cat-grid');
  await shot('13-light-en');
  await win.evaluate(() => window.gcp.setSettings({ theme: 'light', language: 'es' }));
  await win.reload();
  await win.waitForSelector('.cat-grid');
  await click('.nav-item[data-route="settings"]');
  await shot('14-light-es');
  await win.evaluate(() => window.gcp.setSettings({ theme: 'dark', language: 'auto' }));
  await app.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
