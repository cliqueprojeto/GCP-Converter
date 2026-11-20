// Renderiza os ícones SVG em PNG (usa o Chromium do Playwright, se disponível).
// Uso: node scripts/render-icons.js
const path = require('path');
const fs = require('fs');
const root = path.join(__dirname, '..');
(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  async function render(svgFile, out, size) {
    const svg = fs.readFileSync(svgFile, 'utf8');
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" width="${size}" height="${size}" style="display:block"></body></html>`);
    await page.waitForTimeout(80);
    await page.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
  }
  await render(path.join(root, 'assets/icon.svg'), path.join(root, 'assets/icon.png'), 512);
  await render(path.join(root, 'assets/icon-light.svg'), path.join(root, 'assets/icon-light.png'), 512);
  await render(path.join(root, 'assets/icon.svg'), path.join(root, 'build/icon.png'), 1024);
  fs.mkdirSync(path.join(root, 'build/icons'), { recursive: true });
  for (const s of [16, 24, 32, 48, 64, 128, 256, 512, 1024]) await render(path.join(root, 'assets/icon.svg'), path.join(root, `build/icons/${s}x${s}.png`), s);
  await browser.close();
  buildIco();
  console.log('ok');
})();

// ICO multi-tamanho (PNG embutido) para o instalador Windows
function buildIco() {
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const imgs = sizes.map((s) => fs.readFileSync(path.join(root, `build/icons/${s}x${s}.png`)));
  const header = Buffer.alloc(6 + 16 * sizes.length);
  header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
  let offset = header.length;
  sizes.forEach((s, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(s >= 256 ? 0 : s, e); header.writeUInt8(s >= 256 ? 0 : s, e + 1);
    header.writeUInt8(0, e + 2); header.writeUInt8(0, e + 3);
    header.writeUInt16LE(1, e + 4); header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(imgs[i].length, e + 8); header.writeUInt32LE(offset, e + 12);
    offset += imgs[i].length;
  });
  fs.writeFileSync(path.join(root, 'build/icon.ico'), Buffer.concat([header, ...imgs]));
}
