// GCP Converter — processo principal.
// Desenvolvido por Bruno Albertini | Gestão Cultural Pro — www.gestaoculturalpro.com.br
'use strict';
const { app, BrowserWindow, ipcMain, dialog, shell, nativeTheme, Notification, nativeImage, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { Store, DEFAULTS } = require('./store');
const { JobQueue } = require('./jobs');
const { Updater } = require('./updater');
const tools = require('./engines/tools');
const { probe } = require('./engines/media');
const { plan } = require('./engines/documents');

app.setName('GCP Converter');
if (process.platform === 'win32') app.setAppUserModelId('br.com.gestaoculturalpro.gcpconverter');
if (process.platform === 'linux') app.commandLine.appendSwitch('enable-features', 'WaylandWindowDecorations');

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  return;
}

let win = null;
let settings;
let history;
let stats;
let queue;
let updater;
const pendingOpen = [];

const ASSETS = path.join(__dirname, '..', 'assets');
function iconPath(style) {
  const name = style === 'light' ? 'icon-light' : 'icon';
  return path.join(ASSETS, `${name}.png`);
}

function send(channel, payload) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, payload);
}

function filesFromArgv(argv) {
  return argv.slice(app.isPackaged ? 1 : 2).filter((a) => !a.startsWith('-') && fs.existsSync(a) && fs.statSync(a).isFile());
}

function createWindow() {
  const s = settings.data;
  nativeTheme.themeSource = s.theme === 'system' ? 'system' : s.theme;
  win = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 1020,
    minHeight: 680,
    title: 'GCP Converter',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#0b1120' : '#f5f7fb',
    icon: iconPath(s.iconStyle),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  });
  Menu.setApplicationMenu(process.platform === 'darwin' ? Menu.buildFromTemplate([{ role: 'appMenu' }, { role: 'editMenu' }, { role: 'windowMenu' }]) : null);
  win.loadFile(path.join(__dirname, '..', 'src', 'index.html'));
  win.once('ready-to-show', () => win.show());
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) {
      e.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });
  if (process.argv.includes('--dev')) win.webContents.openDevTools({ mode: 'detach' });
}

app.on('second-instance', (_e, argv) => {
  const files = filesFromArgv(argv);
  if (files.length) send('files:opened', files);
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('open-file', (e, file) => {
  e.preventDefault();
  if (win) send('files:opened', [file]);
  else pendingOpen.push(file);
});

app.whenReady().then(async () => {
  settings = new Store('settings.json', DEFAULTS);
  history = new Store('history.json', []);
  stats = new Store('stats.json', { converted: 0, bytesIn: 0, bytesOut: 0, saved: 0, byCategory: {} });
  if (!settings.data.computerName) settings.data.computerName = os.hostname();

  queue = new JobQueue(() => settings.data);
  updater = new Updater({ store: settings, send });

  queue.on('changed', () => send('jobs:changed', queue.list()));
  queue.on('progress', (p) => send('jobs:progress', p));
  queue.on('finished', (job) => {
    if (job.status === 'done') {
      history.data.unshift({ id: job.id, input: job.input, output: job.output, category: job.category, kind: job.kind, ext: job.ext, inExt: job.inExt, sizeIn: job.sizeIn, sizeOut: job.sizeOut, at: Date.now(), ms: job.finishedAt - job.startedAt });
      history.data = history.data.slice(0, 300);
      history.save();
      const st = stats.data;
      st.converted++;
      st.bytesIn += job.sizeIn || 0;
      st.bytesOut += job.sizeOut || 0;
      if (job.sizeIn > job.sizeOut) st.saved += job.sizeIn - job.sizeOut;
      st.byCategory[job.category] = (st.byCategory[job.category] || 0) + 1;
      stats.save();
    }
  });
  let batchStart = Date.now();
  queue.on('idle', () => {
    const list = queue.list();
    const recent = list.filter((j) => (j.finishedAt || 0) >= batchStart);
    if (!recent.length) return;
    const done = recent.filter((j) => j.status === 'done');
    const failed = recent.filter((j) => j.status === 'error');
    send('jobs:idle', { done: done.length, failed: failed.length });
    if (settings.data.notify && Notification.isSupported() && (!win || !win.isFocused())) {
      new Notification({ title: 'GCP Converter', body: `${done.length} ✓  ${failed.length ? '· ' + failed.length + ' ✕' : ''}`, icon: iconPath(settings.data.iconStyle) }).show();
    }
    if (settings.data.openFolderOnFinish && done.length) shell.showItemInFolder(done[done.length - 1].output);
    batchStart = Date.now();
  });
  queue.on('changed', () => {
    if (!queue.running.size) return;
    if (win) win.setProgressBar(overallProgress());
  });
  queue.on('progress', () => win && win.setProgressBar(overallProgress()));
  queue.on('idle', () => win && win.setProgressBar(-1));

  createWindow();
  pendingOpen.push(...filesFromArgv(process.argv));
  win.webContents.once('did-finish-load', () => {
    if (pendingOpen.length) setTimeout(() => send('files:opened', pendingOpen.splice(0)), 600);
    if (updater.isDue()) setTimeout(() => updater.check(), 2500);
  });
  tools.detect();
  // Checagem periódica enquanto o app fica aberto
  setInterval(() => {
    if (settings.data.update.frequency !== 'startup' && updater.isDue()) updater.check();
  }, 6 * 3600e3);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function overallProgress() {
  const active = queue.list().filter((j) => ['queued', 'running'].includes(j.status));
  if (!active.length) return -1;
  return active.reduce((a, j) => a + (j.progress || 0), 0) / active.length;
}

app.on('window-all-closed', () => {
  if (queue) queue.cancelAll();
  app.quit();
});

/* ---------------------------- IPC ---------------------------- */

const handle = (ch, fn) => ipcMain.handle(ch, (_e, ...args) => fn(...args));

handle('app:info', () => ({
  version: app.getVersion(),
  platform: process.platform,
  arch: process.arch,
  locale: app.getLocale(),
  systemLocales: app.getPreferredSystemLanguages ? app.getPreferredSystemLanguages() : [app.getLocale()],
  electron: process.versions.electron,
  chrome: process.versions.chrome,
  node: process.versions.node,
  install: updater.info,
  hostname: os.hostname(),
  userData: app.getPath('userData'),
  downloads: app.getPath('downloads')
}));

handle('settings:get', () => settings.data);
handle('settings:set', (patch) => {
  const before = settings.data;
  settings.data = require('./store').deepMerge(structuredClone(before), patch || {});
  settings.save();
  if (patch && patch.theme) nativeTheme.themeSource = patch.theme === 'system' ? 'system' : patch.theme;
  if (patch && patch.iconStyle && win) {
    const img = nativeImage.createFromPath(iconPath(patch.iconStyle));
    win.setIcon(img);
    if (process.platform === 'darwin' && app.dock) app.dock.setIcon(img);
  }
  if (patch && patch.concurrency) queue.pump();
  return settings.data;
});
handle('theme:dark', () => nativeTheme.shouldUseDarkColors);
nativeTheme.on('updated', () => send('theme:changed', nativeTheme.shouldUseDarkColors));

handle('dialog:openFiles', async (opts = {}) => {
  const r = await dialog.showOpenDialog(win, {
    title: opts.title,
    properties: ['openFile', 'multiSelections'],
    filters: opts.extensions && opts.extensions.length ? [{ name: opts.filterName || 'Arquivos', extensions: opts.extensions }, { name: '*', extensions: ['*'] }] : undefined
  });
  return r.canceled ? [] : r.filePaths;
});
handle('dialog:openFolder', async (opts = {}) => {
  const r = await dialog.showOpenDialog(win, { title: opts.title, properties: ['openDirectory', 'createDirectory'] });
  return r.canceled ? null : r.filePaths[0];
});
handle('fs:expand', async (paths) => {
  // Expande pastas (recursivo, até 5000 arquivos)
  const out = [];
  const walk = (p, depth) => {
    if (out.length > 5000) return;
    let st;
    try { st = fs.statSync(p); } catch { return; }
    if (st.isFile()) out.push(p);
    else if (st.isDirectory() && depth < 6) {
      for (const e of fs.readdirSync(p)) if (!e.startsWith('.')) walk(path.join(p, e), depth + 1);
    }
  };
  (paths || []).forEach((p) => walk(p, 0));
  return out.map((p) => {
    let size = 0;
    try { size = fs.statSync(p).size; } catch {}
    return { path: p, name: path.basename(p), ext: path.extname(p).slice(1).toLowerCase(), size, dir: path.dirname(p) };
  });
});
handle('media:probe', (file) => probe(file));
handle('media:thumbnail', (file) => require('./engines/media').frameThumb(file));
handle('tools:detect', (force) => tools.detect(force));
handle('docs:plan', async (inExt, outExt, kind) => plan(inExt, outExt, await tools.detect(), kind));
handle('docs:planMany', async (pairs, kind) => {
  const tl = await tools.detect();
  return (pairs || []).map(([a, b]) => plan(a, b, tl, kind));
});

handle('jobs:add', (batch) => queue.add(batch));
handle('jobs:list', () => queue.list());
handle('jobs:cancel', (id) => queue.cancel(id));
handle('jobs:cancelAll', () => queue.cancelAll());
handle('jobs:retry', (id) => queue.retry(id));
handle('jobs:remove', (id) => queue.remove(id));
handle('jobs:clearFinished', () => queue.clearFinished());

handle('history:get', () => history.data);
handle('history:clear', () => {
  history.data = [];
  history.save();
  return [];
});
handle('stats:get', () => stats.data);

handle('shell:open', (p) => shell.openPath(p));
handle('shell:show', (p) => shell.showItemInFolder(p));
handle('shell:external', (url) => {
  if (/^https?:\/\//.test(url)) shell.openExternal(url);
});
handle('file:exists', (p) => !!p && fs.existsSync(p));

handle('update:status', () => updater.status());
handle('update:check', () => updater.check({ manual: true }));
handle('update:install', () => updater.install());
handle('update:skip', (v) => updater.skip(v));
handle('update:releases', () => updater.releases());

handle('pix:qr', async (text) => {
  const QR = require('qrcode');
  return QR.toDataURL(text, { margin: 1, width: 440, errorCorrectionLevel: 'M', color: { dark: '#0b1120', light: '#ffffff' } });
});

handle('changelog:local', () => {
  try {
    return fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  } catch {
    return '';
  }
});
handle('licenses:get', () => {
  const read = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return ''; } };
  return { app: read(path.join(__dirname, '..', 'LICENSE')), thirdParty: read(path.join(__dirname, '..', 'THIRD_PARTY_NOTICES.md')) };
});
handle('markdown:render', (md) => {
  const { marked } = require('marked');
  return marked.parse(String(md || ''), { gfm: true, breaks: true });
});
