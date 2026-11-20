// Detecção dos motores de conversão (embutidos e opcionais do sistema).
'use strict';
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFile } = require('child_process');

const isWin = process.platform === 'win32';
const isMac = process.platform === 'darwin';

function ffmpegPath() {
  let p = null;
  try {
    p = require('ffmpeg-static');
  } catch {}
  if (p) p = p.replace('app.asar' + path.sep, 'app.asar.unpacked' + path.sep);
  if (p && fs.existsSync(p)) return p;
  return which(isWin ? 'ffmpeg.exe' : 'ffmpeg');
}

function which(bin) {
  const dirs = (process.env.PATH || '').split(path.delimiter);
  if (!isWin) dirs.push('/usr/bin', '/usr/local/bin', '/opt/homebrew/bin', '/snap/bin', '/var/lib/flatpak/exports/bin');
  for (const d of dirs) {
    if (!d) continue;
    const full = path.join(d, bin);
    try {
      if (fs.statSync(full).isFile()) return full;
    } catch {}
  }
  return null;
}

function globFirst(patterns) {
  for (const pat of patterns) {
    if (!pat.includes('*')) {
      if (fs.existsSync(pat)) return pat;
      continue;
    }
    const [base, ...rest] = pat.split('*');
    const dir = path.dirname(base + 'x');
    const prefix = path.basename(base + 'x').slice(0, -1);
    try {
      const entries = fs.readdirSync(dir).filter((e) => e.startsWith(prefix)).sort().reverse();
      for (const e of entries) {
        const cand = path.join(dir, e) + rest.join('*');
        if (fs.existsSync(cand)) return cand;
      }
    } catch {}
  }
  return null;
}

const PF = process.env.ProgramFiles || 'C:\\Program Files';
const PF86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
const LAD = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');

const EXTERNAL = {
  libreoffice: {
    name: 'LibreOffice',
    url: 'https://www.libreoffice.org/download/download/',
    purpose: 'office',
    find() {
      // mesmos locais procurados pelo GCP-PDF
      try { return require('./gcp-pdf').libreOfficeCandidates().find((p) => fs.existsSync(p)) || null; } catch {}
      if (isWin) return globFirst([path.join(PF, 'LibreOffice', 'program', 'soffice.exe'), path.join(PF86, 'LibreOffice', 'program', 'soffice.exe')]) || which('soffice.exe');
      if (isMac) return globFirst(['/Applications/LibreOffice.app/Contents/MacOS/soffice']) || which('soffice');
      return which('soffice') || which('libreoffice');
    },
    versionArgs: ['--version'],
    install: { arch: 'sudo pacman -S libreoffice-fresh', deb: 'sudo apt install libreoffice', rpm: 'sudo dnf install libreoffice', mac: 'brew install --cask libreoffice', win: 'winget install TheDocumentFoundation.LibreOffice' }
  },
  calibre: {
    name: 'Calibre',
    url: 'https://calibre-ebook.com/download',
    purpose: 'ebook',
    find() {
      if (isWin) return globFirst([path.join(PF, 'Calibre2', 'ebook-convert.exe'), path.join(PF86, 'Calibre2', 'ebook-convert.exe')]) || which('ebook-convert.exe');
      if (isMac) return globFirst(['/Applications/calibre.app/Contents/MacOS/ebook-convert']) || which('ebook-convert');
      return which('ebook-convert');
    },
    versionArgs: ['--version'],
    install: { arch: 'sudo pacman -S calibre', deb: 'sudo apt install calibre', rpm: 'sudo dnf install calibre', mac: 'brew install --cask calibre', win: 'winget install calibre.calibre' }
  },
  ghostscript: {
    name: 'Ghostscript',
    url: 'https://www.ghostscript.com/releases/gsdnld.html',
    purpose: 'pdf',
    find() {
      if (isWin) return globFirst([path.join(PF, 'gs', 'gs*', 'bin', 'gswin64c.exe'), path.join(PF86, 'gs', 'gs*', 'bin', 'gswin32c.exe')]) || which('gswin64c.exe');
      return which('gs');
    },
    versionArgs: ['--version'],
    install: { arch: 'sudo pacman -S ghostscript', deb: 'sudo apt install ghostscript', rpm: 'sudo dnf install ghostscript', mac: 'brew install ghostscript', win: 'winget install ArtifexSoftware.GhostScript' }
  }
};

let cache = null;

function runVersion(bin, args) {
  return new Promise((resolve) => {
    execFile(bin, args, { timeout: 15000, windowsHide: true }, (err, stdout, stderr) => {
      const out = String(stdout || stderr || '').split(/\r?\n/).find((l) => l.trim()) || '';
      const m = out.match(/(\d+\.\d+(?:\.\d+)*)/);
      resolve(m ? m[1] : err ? '' : out.slice(0, 40));
    });
  });
}

async function detect(force = false) {
  if (cache && !force) return cache;
  const result = {};
  const ff = ffmpegPath();
  result.ffmpeg = { id: 'ffmpeg', name: 'FFmpeg', bundled: true, path: ff, available: !!ff, version: ff ? await runVersion(ff, ['-version']) : '', url: 'https://ffmpeg.org', purpose: 'media' };
  result.chromium = { id: 'chromium', name: 'Chromium (PDF/HTML)', bundled: true, available: true, version: process.versions.chrome, purpose: 'render' };
  result.builtin = { id: 'builtin', name: 'Motor de documentos GCP-PDF', bundled: true, available: true, version: '', purpose: 'document' };
  result.ebooks = { id: 'ebooks', name: 'Motor de e-books (EPUB · MOBI · FB2 · CBZ)', bundled: true, available: true, version: '', purpose: 'ebookBuiltin' };
  await Promise.all(
    Object.entries(EXTERNAL).map(async ([id, def]) => {
      const p = def.find();
      const off = process.env.GCP_NO_EXTERNAL === '1';
      result[id] = { id, name: def.name, bundled: false, optional: true, path: off ? null : p, available: off ? false : !!p, version: p ? await runVersion(p, def.versionArgs) : '', url: def.url, purpose: def.purpose, install: def.install };
    })
  );
  cache = result;
  return result;
}

let encoderCache = null;
async function ffmpegEncoders() {
  if (encoderCache) return encoderCache;
  const ff = ffmpegPath();
  encoderCache = new Set();
  if (!ff) return encoderCache;
  await new Promise((resolve) => {
    execFile(ff, ['-hide_banner', '-encoders'], { maxBuffer: 8 * 1024 * 1024, windowsHide: true }, (err, stdout) => {
      String(stdout || '').split(/\r?\n/).forEach((l) => {
        const m = l.match(/^\s*[VAS][.\w]{5}\s+(\S+)/);
        if (m) encoderCache.add(m[1]);
      });
      resolve();
    });
  });
  return encoderCache;
}

module.exports = { detect, ffmpegPath, ffmpegEncoders, which, EXTERNAL };
