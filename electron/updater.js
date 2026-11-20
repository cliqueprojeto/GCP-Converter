// Atualizações automáticas a partir das Releases do GitHub
// (cliqueprojeto/GCP-Converter). Detecta o tipo de instalação e aplica o
// pacote correto: .exe (Windows), .dmg (macOS Intel/Apple Silicon),
// .deb, .rpm, .pkg.tar.zst (Arch/BigLinux/Manjaro) ou AppImage.
'use strict';
const fs = require('fs');
const fsp = fs.promises;
const os = require('os');
const path = require('path');
const https = require('https');
const { spawn, execFileSync } = require('child_process');
const { app, shell, net } = require('electron');

const REPO = 'cliqueprojeto/GCP-Converter';
const API = `https://api.github.com/repos/${REPO}`;
const RELEASES_PAGE = `https://github.com/${REPO}/releases`;

const FREQUENCY_MS = {
  daily: 24 * 3600e3,
  weekly: 7 * 24 * 3600e3,
  biweekly: 14 * 24 * 3600e3,
  monthly: 30 * 24 * 3600e3
};

function cmpVersion(a, b) {
  const pa = String(a).replace(/^v/, '').split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  const pb = String(b).replace(/^v/, '').split(/[.-]/).map((x) => parseInt(x, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

function readOsRelease() {
  try {
    const txt = fs.readFileSync('/etc/os-release', 'utf8');
    const get = (k) => ((txt.match(new RegExp(`^${k}="?([^"\\n]*)"?`, 'm')) || [])[1] || '').toLowerCase();
    return { id: get('ID'), like: get('ID_LIKE'), name: (txt.match(/^PRETTY_NAME="?([^"\n]*)"?/m) || [])[1] || '' };
  } catch {
    return { id: '', like: '', name: '' };
  }
}

/** Descobre como o app foi instalado. */
function installInfo() {
  if (process.platform === 'win32') return { kind: 'exe', label: 'Windows (instalador)' };
  if (process.platform === 'darwin') return { kind: 'dmg', label: `macOS ${process.arch === 'arm64' ? 'Apple Silicon' : 'Intel'}` };
  if (process.env.APPIMAGE) return { kind: 'appimage', label: 'Linux (AppImage)' };
  if (!app.isPackaged) return { kind: 'dev', label: 'Desenvolvimento' };
  const r = readOsRelease();
  const ids = `${r.id} ${r.like}`;
  if (/arch|manjaro|biglinux|endeavour|garuda/.test(ids)) return { kind: 'pacman', label: 'Arch / BigLinux / Manjaro (pacote)', distro: r.name };
  if (/debian|ubuntu|mint|pop|elementary|zorin|kali/.test(ids)) return { kind: 'deb', label: 'Debian / Ubuntu / Mint (pacote .deb)', distro: r.name };
  if (/fedora|rhel|centos|suse|opensuse|rocky|alma|mageia/.test(ids)) return { kind: 'rpm', label: 'Fedora / openSUSE / RHEL (pacote .rpm)', distro: r.name };
  return { kind: 'appimage', label: 'Linux', distro: r.name };
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = net.request({ url, headers: { 'User-Agent': 'GCP-Converter-Updater', Accept: 'application/vnd.github+json' } });
    let body = '';
    req.on('response', (res) => {
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        if (res.statusCode >= 400) return reject(new Error(`GitHub HTTP ${res.statusCode}`));
        try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function pickAsset(assets, info) {
  const arch = process.arch === 'arm64' ? /(arm64|aarch64)/i : /(x64|amd64|x86_64)/i;
  const byExt = (re) => assets.filter((a) => re.test(a.name));
  let list = [];
  switch (info.kind) {
    case 'exe': list = byExt(/\.exe$/i); break;
    case 'dmg': list = byExt(/\.dmg$/i); break;
    case 'deb': list = byExt(/\.deb$/i); break;
    case 'rpm': list = byExt(/\.rpm$/i); break;
    case 'pacman': list = byExt(/\.pkg\.tar\.zst$|\.pacman$/i); break;
    case 'appimage': list = byExt(/\.AppImage$/i); break;
    default: list = [];
  }
  return list.find((a) => arch.test(a.name)) || (list.length === 1 || info.kind === 'exe' ? list[0] : null) || list[0] || null;
}

class Updater {
  constructor({ store, send }) {
    this.store = store;
    this.send = send;
    this.info = installInfo();
    this.latest = null;
    this.downloading = false;
  }

  status() {
    return {
      current: app.getVersion(),
      install: this.info,
      frequency: this.store.data.update.frequency,
      lastCheck: this.store.data.update.lastCheck,
      latest: this.latest,
      releasesPage: RELEASES_PAGE
    };
  }

  isDue() {
    const { frequency, lastCheck } = this.store.data.update;
    if (frequency === 'never') return false;
    if (frequency === 'startup') return true;
    return Date.now() - (lastCheck || 0) >= (FREQUENCY_MS[frequency] || FREQUENCY_MS.weekly);
  }

  async check({ manual = false } = {}) {
    try {
      const rel = await fetchJson(`${API}/releases/latest`);
      this.store.data.update.lastCheck = Date.now();
      this.store.save();
      const version = String(rel.tag_name || '').replace(/^v/, '');
      const asset = pickAsset(rel.assets || [], this.info);
      this.latest = {
        version,
        name: rel.name || rel.tag_name,
        notes: rel.body || '',
        url: rel.html_url,
        date: rel.published_at,
        asset: asset ? { name: asset.name, url: asset.browser_download_url, size: asset.size } : null,
        available: cmpVersion(version, app.getVersion()) > 0
      };
      if (this.latest.available && (manual || this.store.data.update.skipVersion !== version)) this.send('update:available', this.latest);
      return { ok: true, ...this.status() };
    } catch (e) {
      this.store.data.update.lastCheck = Date.now();
      this.store.save();
      return { ok: false, error: String(e.message || e), ...this.status() };
    }
  }

  async releases() {
    try {
      const list = await fetchJson(`${API}/releases?per_page=30`);
      return list.filter((r) => !r.draft).map((r) => ({ version: String(r.tag_name).replace(/^v/, ''), name: r.name, notes: r.body || '', date: r.published_at, url: r.html_url, prerelease: r.prerelease }));
    } catch (e) {
      return { error: String(e.message || e) };
    }
  }

  skip(version) {
    this.store.data.update.skipVersion = version;
    this.store.save();
  }

  download(url, dest, onProgress) {
    return new Promise((resolve, reject) => {
      const get = (u, redirects = 0) => {
        https
          .get(u, { headers: { 'User-Agent': 'GCP-Converter-Updater' } }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 8) {
              res.resume();
              return get(new URL(res.headers.location, u).toString(), redirects + 1);
            }
            if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
            const total = parseInt(res.headers['content-length'] || '0', 10);
            let got = 0;
            const file = fs.createWriteStream(dest);
            res.on('data', (c) => {
              got += c.length;
              if (total) onProgress(got / total);
            });
            res.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', reject);
          })
          .on('error', reject);
      };
      get(url);
    });
  }

  async install() {
    if (!this.latest || !this.latest.asset) {
      shell.openExternal(this.latest ? this.latest.url : RELEASES_PAGE);
      return { ok: false, opened: true };
    }
    if (this.downloading) return { ok: false };
    this.downloading = true;
    try {
      const dir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-update-'));
      const dest = path.join(dir, this.latest.asset.name);
      await this.download(this.latest.asset.url, dest, (p) => this.send('update:progress', p));
      this.send('update:progress', 1);
      return await this.apply(dest);
    } catch (e) {
      return { ok: false, error: String(e.message || e) };
    } finally {
      this.downloading = false;
    }
  }

  async apply(file) {
    const k = this.info.kind;
    if (k === 'exe') {
      spawn(file, [], { detached: true, stdio: 'ignore' }).unref();
      setTimeout(() => app.quit(), 800);
      return { ok: true, action: 'installer' };
    }
    if (k === 'dmg') {
      await shell.openPath(file);
      return { ok: true, action: 'dmg' };
    }
    if (k === 'appimage') {
      const target = process.env.APPIMAGE;
      await fsp.copyFile(file, target + '.new');
      await fsp.chmod(target + '.new', 0o755);
      await fsp.rename(target + '.new', target);
      app.relaunch();
      app.exit(0);
      return { ok: true };
    }
    // Pacotes Linux: instala com pkexec (pede a senha de administrador)
    const cmds = {
      deb: [['apt-get', 'install', '-y', '--allow-downgrades', file], ['dpkg', '-i', file]],
      rpm: [['dnf', 'install', '-y', file], ['zypper', '--non-interactive', 'install', '--allow-unsigned-rpm', file], ['rpm', '-Uvh', '--replacepkgs', file]],
      pacman: [['pacman', '-U', '--noconfirm', file]]
    }[k];
    const hasPkexec = (() => {
      try { execFileSync('which', ['pkexec']); return true; } catch { return false; }
    })();
    if (!cmds || !hasPkexec) {
      shell.showItemInFolder(file);
      return { ok: false, manual: true, file };
    }
    const which = (b) => { try { execFileSync('which', [b]); return true; } catch { return false; } };
    const cmd = cmds.find((c) => which(c[0])) || cmds[cmds.length - 1];
    const code = await new Promise((resolve) => {
      const p = spawn('pkexec', cmd, { stdio: 'ignore' });
      p.on('close', resolve);
      p.on('error', () => resolve(-1));
    });
    if (code === 0) {
      app.relaunch();
      setTimeout(() => app.exit(0), 300);
      return { ok: true };
    }
    shell.showItemInFolder(file);
    return { ok: false, manual: true, file, error: `código ${code}` };
  }
}

module.exports = { Updater, cmpVersion, installInfo, RELEASES_PAGE };
