// Fila de conversões em lote com execução paralela.
'use strict';
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const { EventEmitter } = require('events');
const { BrowserWindow } = require('electron');
const { convertMedia, probe } = require('./engines/media');
const docs = require('./engines/documents');
const { findTarget } = require('../src/shared/formats');

let seq = 0;

class JobQueue extends EventEmitter {
  constructor(getSettings) {
    super();
    this.getSettings = getSettings;
    this.jobs = new Map();
    this.running = new Set();
    this.reserved = new Set();
  }

  list() {
    return [...this.jobs.values()].map(publicJob);
  }

  /** Adiciona um lote: { files, category, target, options, outputDir?, group? } */
  add(batch) {
    const s = this.getSettings();
    const created = [];
    const groupId = `g${Date.now()}`;
    // Ações que geram um único arquivo a partir de vários
    if (batch.category === 'compress' && batch.target === 'zip') {
      created.push(this._create({ ...batch, kind: 'zip', inputs: batch.files, input: batch.files[0], groupId }, s, 0));
    } else if (batch.options && batch.options.mergePdf && batch.target === 'pdf' && batch.files.length > 1) {
      created.push(this._create({ ...batch, kind: 'merge', inputs: batch.files, input: batch.files[0], groupId }, s, 0));
    } else {
      batch.files.forEach((file, i) => created.push(this._create({ ...batch, input: file, groupId }, s, i + 1)));
    }
    this.emit('changed');
    this.pump();
    return created.map(publicJob);
  }

  _create(b, s, index) {
    const id = `j${Date.now().toString(36)}${(++seq).toString(36)}`;
    const inExt = path.extname(b.input).slice(1).toLowerCase();
    let kind = b.kind || b.category;
    let target = b.target;
    let ext;
    if (b.category === 'compress' && kind !== 'zip') {
      // Compactar mantém o formato (com exceções sensatas)
      const { detectCategory } = require('../src/shared/formats');
      const cat = inExt === 'pdf' ? 'pdf' : detectCategory(inExt);
      kind = 'compress';
      ext = inExt;
      if (cat === 'image' && ['bmp', 'tif', 'tiff', 'svg', 'tga', 'ppm', 'pcx'].includes(inExt)) ext = 'png';
      if (cat === 'video' && !['mp4', 'mkv', 'webm', 'mov', 'm4v'].includes(inExt)) ext = 'mp4';
      if (cat === 'document' || cat === 'ebook' || !cat) ext = 'zip';
      if (cat === 'audio' && ['wav', 'aiff', 'aif', 'flac', 'alac', 'ape', 'wv', 'caf', 'au'].includes(inExt)) ext = b.options && b.options.losslessToMp3 === false ? inExt : 'mp3';
      target = { compressCat: cat };
    } else if (kind === 'zip') {
      ext = 'zip';
    } else if (kind === 'merge') {
      ext = 'pdf';
    } else {
      const t = findTarget(b.category, target);
      ext = t ? t.ext : target;
      if (b.category === 'image' && target === 'pdf') kind = 'document';
      if (b.category === 'image' && inExt === 'pdf' && target !== 'pdf') kind = 'pdfimages';
    }
    const job = {
      id,
      groupId: b.groupId,
      category: b.category,
      kind,
      input: b.input,
      inputs: b.inputs,
      inExt,
      target: typeof target === 'string' ? target : b.target,
      compress: typeof target === 'object' ? target : null,
      ext,
      options: b.options || {},
      outputDir: b.outputDir || (s.outputMode === 'custom' && s.outputDir ? s.outputDir : path.dirname(b.input)),
      namePattern: b.namePattern || s.namePattern || '{name}_{action}',
      conflict: s.conflict,
      keepMetadata: b.options && b.options.keepMetadata !== undefined ? b.options.keepMetadata : s.keepMetadata,
      hwAccel: s.hwAccel,
      lang: b.lang,
      index,
      status: 'queued',
      progress: 0,
      speed: null,
      sizeIn: 0,
      sizeOut: 0,
      output: null,
      error: null,
      createdAt: Date.now()
    };
    try {
      job.sizeIn = (job.inputs || [job.input]).reduce((a, f) => a + (fs.statSync(f).size || 0), 0);
    } catch {}
    this.jobs.set(id, job);
    return job;
  }

  pump() {
    const max = Math.max(1, Math.min(8, this.getSettings().concurrency || 2));
    for (const job of this.jobs.values()) {
      if (this.running.size >= max) break;
      if (job.status === 'queued') this._run(job);
    }
    if (this.running.size === 0 && ![...this.jobs.values()].some((j) => j.status === 'queued')) this.emit('idle');
  }

  async _run(job) {
    this.running.add(job.id);
    job.status = 'running';
    job.startedAt = Date.now();
    job.abort = new AbortController();
    this.emit('changed');
    let lastEmit = 0;
    const onProgress = (p, speed) => {
      if (p != null) job.progress = p;
      if (speed != null) job.speed = speed;
      const now = Date.now();
      if (now - lastEmit > 200) {
        lastEmit = now;
        this.emit('progress', { id: job.id, progress: job.progress, speed: job.speed });
      }
    };
    let tmpOut = null;
    try {
      const output = resolveOutput(job, this.reserved);
      if (output === null) {
        job.status = 'skipped';
        return;
      }
      this.reserved.add(output);
      job._reserved = output;
      await fsp.mkdir(path.dirname(output), { recursive: true });
      // Escreve em arquivo temporário e renomeia ao final (evita arquivos corrompidos)
      tmpOut = path.join(path.dirname(output), `.${path.basename(output, path.extname(output))}.${job.id}.gcp-part${path.extname(output)}`);
      if (path.resolve(output) === path.resolve(job.input)) job.inPlace = true;
      if (job.kind === 'pdfimages') {
        // PDF → uma imagem por página (nome-001.png, nome-002.png…)
        const base = output.slice(0, -path.extname(output).length);
        tmpOut = null;
        const outs = await docs.pdfToImages(job.input, base, job.ext, job.options, onProgress, job.abort.signal);
        job.outputs = outs;
        job.output = outs[0];
        job.sizeOut = outs.reduce((a, f) => a + fs.statSync(f).size, 0);
        job.progress = 1;
        job.status = 'done';
        return;
      }
      await this._execute(job, tmpOut, onProgress);
      if (job.abort.signal.aborted) throw Object.assign(new Error('cancelled'), { cancelled: true });
      await fsp.rm(output, { force: true });
      await fsp.rename(tmpOut, output);
      tmpOut = null;
      job.output = output;
      job.sizeOut = (await fsp.stat(output)).size;
      // Compactação que não reduziu: mantém o original (cópia) se o usuário preferir
      if (job.kind === 'compress' && job.sizeOut >= job.sizeIn && job.options.keepIfLarger !== true && path.extname(output).toLowerCase() === path.extname(job.input).toLowerCase()) {
        await fsp.copyFile(job.input, output);
        job.sizeOut = job.sizeIn;
        job.note = 'already-optimal';
      }
      job.progress = 1;
      job.status = 'done';
    } catch (e) {
      if (tmpOut) fsp.rm(tmpOut, { force: true }).catch(() => {});
      if (e.cancelled || (job.abort && job.abort.signal.aborted)) job.status = 'cancelled';
      else {
        job.status = 'error';
        job.error = String(e.message || e);
        console.error('[job]', job.input, e);
      }
    } finally {
      job.finishedAt = Date.now();
      if (job._reserved) this.reserved.delete(job._reserved);
      delete job._reserved;
      delete job.abort;
      this.running.delete(job.id);
      this.emit('changed');
      this.emit('finished', publicJob(job));
      this.pump();
    }
  }

  async _execute(job, out, onProgress) {
    const signal = job.abort.signal;
    const o = job.options;
    if (job.kind === 'zip') return docs.zipFiles(job.inputs, out, o.zipLevel ?? 6, onProgress);
    if (job.kind === 'merge') {
      // Converte cada item para PDF (se preciso) e une tudo
      const parts = [];
      const tmpDir = await fsp.mkdtemp(path.join(os.tmpdir(), 'gcp-merge-'));
      try {
        for (let i = 0; i < job.inputs.length; i++) {
          const f = job.inputs[i];
          if (signal.aborted) throw Object.assign(new Error('cancelled'), { cancelled: true });
          if (path.extname(f).toLowerCase() === '.pdf') parts.push(f);
          else {
            const p = path.join(tmpDir, `${i}.pdf`);
            await docs.convertDocument({ ...job, input: f, ext: 'pdf', kind: 'document' }, p, null, signal);
            parts.push(p);
          }
          onProgress((i + 1) / (job.inputs.length + 1));
        }
        await docs.mergePdfs(parts, out);
      } finally {
        fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
      }
      return;
    }
    if (job.kind === 'compress') return this._compress(job, out, onProgress, signal);
    if (job.kind === 'document' || job.kind === 'ebook' || job.kind === 'fiscal') return docs.convertDocument(job, out, onProgress, signal);
    if (job.kind === 'image' && job.inExt === 'svg') {
      const png = await renderSvg(job.input, o);
      try {
        return await convertMedia({ ...job, input: png }, out, onProgress, signal);
      } finally {
        fsp.rm(png, { force: true }).catch(() => {});
      }
    }
    return convertMedia(job, out, onProgress, signal);
  }

  async _compress(job, out, onProgress, signal) {
    const o = job.options;
    const level = o.level || 'medium'; // light | medium | strong | target
    const cat = job.compress.compressCat;
    if (cat === 'pdf') return docs.compressPdf(job.input, out, level === 'target' ? 'medium' : level, signal);
    if (cat === 'video') {
      const info = await probe(job.input);
      const opts = { ...o, quality: level === 'light' ? 'high' : level === 'strong' ? 'small' : 'balanced', videoCodec: o.codec || 'h264', speed: o.speed || 'balanced' };
      const j = { ...job, kind: 'video', target: job.ext === 'webm' ? 'webm' : job.ext === 'mkv' ? 'mkv' : job.ext === 'mov' ? 'mov' : 'mp4', options: opts };
      if (level === 'strong' && !o.resolution && info.height > 720) opts.resolution = '720';
      if (o.resolution) opts.resolution = o.resolution;
      opts.audioBitrate = level === 'strong' ? '96' : level === 'light' ? '160' : '128';
      if (level === 'target' && info.duration) {
        const mb = Math.max(0.5, parseFloat(o.targetMb) || 25);
        const totalKbps = (mb * 8192 * 0.96) / info.duration;
        const audioKbps = Math.min(128, Math.max(32, Math.round(totalKbps * 0.12)));
        j.targetAudioBitrate = audioKbps;
        j.targetBitrate = Math.max(50, Math.round(totalKbps - audioKbps));
        if (!o.resolution && info.height > 720 && j.targetBitrate < 1500) opts.resolution = j.targetBitrate < 600 ? '480' : '720';
      }
      return convertMedia(j, out, onProgress, signal);
    }
    if (cat === 'audio') {
      const bitrate = level === 'light' ? '192' : level === 'strong' ? '64' : '128';
      const map = { mp3: 'mp3', m4a: 'aac', aac: 'aac', ogg: 'ogg', oga: 'ogg', opus: 'opus', wma: 'wma' };
      const t = map[job.ext] || 'mp3';
      const j = { ...job, kind: 'audio', target: t, options: { ...o, bitrate, channels: level === 'strong' ? '1' : 'original' } };
      if (level === 'target') {
        const info = await probe(job.input);
        const mb = Math.max(0.2, parseFloat(o.targetMb) || 5);
        j.targetAudioBitrate = Math.max(24, Math.min(320, Math.round((mb * 8192 * 0.97) / (info.duration || 60))));
      }
      return convertMedia(j, out, onProgress, signal);
    }
    if (cat === 'image') {
      const q = level === 'light' ? 88 : level === 'strong' ? 60 : 75;
      const t = { jpeg: 'jpg', jpg: 'jpg', jfif: 'jpg', png: 'png', webp: 'webp', avif: 'avif', gif: 'gif' }[job.ext] || 'png';
      const opts = { ...o, quality: q, maxSide: o.maxSide || (level === 'strong' ? '1920' : 'original') };
      if (t === 'png' && level !== 'light') opts.palette = true;
      const input = job.inExt === 'svg' ? await renderSvg(job.input, o) : job.input;
      return convertMedia({ ...job, input, kind: 'image', target: t, options: opts }, out, onProgress, signal);
    }
    // Documentos/e-books: ZIP individual
    return docs.zipFiles([job.input], out, 9, onProgress);
  }

  cancel(id) {
    const job = this.jobs.get(id);
    if (!job) return;
    if (job.status === 'queued') job.status = 'cancelled';
    else if (job.abort) job.abort.abort();
    this.emit('changed');
    this.pump();
  }

  cancelAll() {
    for (const j of this.jobs.values()) if (['queued', 'running'].includes(j.status)) this.cancel(j.id);
  }

  retry(id) {
    const job = this.jobs.get(id);
    if (!job || !['error', 'cancelled', 'skipped'].includes(job.status)) return;
    Object.assign(job, { status: 'queued', progress: 0, error: null, output: null });
    this.emit('changed');
    this.pump();
  }

  remove(id) {
    const job = this.jobs.get(id);
    if (!job) return;
    if (job.status === 'running') this.cancel(id);
    this.jobs.delete(id);
    this.emit('changed');
  }

  clearFinished() {
    for (const [id, j] of this.jobs) if (['done', 'error', 'cancelled', 'skipped'].includes(j.status)) this.jobs.delete(id);
    this.emit('changed');
  }
}

function publicJob(j) {
  const { abort, ...rest } = j;
  return rest;
}

function fmtDate(d = new Date()) {
  const p = (n) => String(n).padStart(2, '0');
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}` };
}

function resolveOutput(job, reserved = new Set()) {
  const base = job.kind === 'zip' ? (job.options.zipName || `GCP-Converter-${fmtDate().date}`) : path.basename(job.input, path.extname(job.input));
  const { date, time } = fmtDate();
  // Sufixo que identifica o arquivo gerado pelo GCP Converter (o nome original é preservado)
  const lang = String(job.lang || 'pt-BR').slice(0, 2);
  const WORDS = { pt: { c: 'Convertido', z: 'Compactado', m: 'Unido' }, en: { c: 'Converted', z: 'Compressed', m: 'Merged' }, es: { c: 'Convertido', z: 'Comprimido', m: 'Unido' } }[lang] || { c: 'Convertido', z: 'Compactado', m: 'Unido' };
  const action = job.kind === 'compress' || job.kind === 'zip' ? WORDS.z : job.kind === 'merge' ? WORDS.m : WORDS.c;
  let pattern = job.kind === 'zip' ? '{name}_{action}' : job.namePattern || '{name}_{action}';
  if (!pattern.includes('{action}')) pattern += '_{action}';
  // não repete o sufixo em arquivos que já foram convertidos/compactados
  const already = [WORDS.c, WORDS.z, WORDS.m, 'Convertido', 'Compactado', 'Converted', 'Compressed', 'Comprimido', 'Unido', 'Merged'].some((w) => new RegExp(`_${w}( \\(\\d+\\))?$`).test(base));
  if (already) pattern = pattern.replace(/_?\{action\}/g, '');
  let name = pattern
    .replace(/\{action\}/g, action)
    .replace(/\{name\}/g, base)
    .replace(/\{ext\}/g, job.inExt)
    .replace(/\{target\}/g, job.ext)
    .replace(/\{date\}/g, date)
    .replace(/\{time\}/g, time)
    .replace(/\{index\}/g, String(job.index || 1).padStart(3, '0'));
  name = name.replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim() || base;
  let out = path.join(job.outputDir, `${name}.${job.ext}`);
  // Nunca sobrescreve o próprio arquivo de entrada.
  const same = (a, b) => path.resolve(a).toLowerCase() === path.resolve(b).toLowerCase();
  if (same(out, job.input)) out = path.join(job.outputDir, `${name}_${job.kind === 'compress' ? 'compact' : 'gcp'}.${job.ext}`);
  const taken = (p) => fs.existsSync(p) || reserved.has(p);
  if (!taken(out)) return out;
  if (job.conflict === 'overwrite' && !same(out, job.input) && !reserved.has(out)) return out;
  if (job.conflict === 'skip') return null;
  let i = 1;
  let cand;
  do cand = path.join(job.outputDir, `${path.basename(out, '.' + job.ext)} (${i++}).${job.ext}`);
  while (taken(cand));
  return cand;
}

/** Renderiza SVG em PNG usando o Chromium embutido. */
async function renderSvg(file, o = {}) {
  const svg = await fsp.readFile(file, 'utf8');
  const wM = svg.match(/<svg[^>]*\swidth="([\d.]+)/);
  const hM = svg.match(/<svg[^>]*\sheight="([\d.]+)/);
  const vb = svg.match(/viewBox="[\d.\-]+[\s,]+[\d.\-]+[\s,]+([\d.]+)[\s,]+([\d.]+)"/);
  let w = wM ? parseFloat(wM[1]) : vb ? parseFloat(vb[1]) : 1024;
  let h = hM ? parseFloat(hM[1]) : vb ? parseFloat(vb[2]) : 1024;
  const target = parseInt(o.svgSize, 10) || Math.max(1024, Math.max(w, h));
  const scale = target / Math.max(w, h);
  w = Math.round(w * scale);
  h = Math.round(h * scale);
  const win = new BrowserWindow({ show: false, width: w, height: h, frame: false, transparent: true, useContentSize: true, webPreferences: { sandbox: true } });
  try {
    const html = `<html><body style="margin:0;background:transparent;overflow:hidden"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}" style="width:${w}px;height:${h}px;display:block"></body></html>`;
    await win.loadURL('data:text/html;base64,' + Buffer.from(html).toString('base64'));
    await new Promise((r) => setTimeout(r, 250));
    const img = await win.webContents.capturePage({ x: 0, y: 0, width: w, height: h });
    const out = path.join(os.tmpdir(), `gcp-svg-${Date.now()}.png`);
    await fsp.writeFile(out, img.toPNG());
    return out;
  } finally {
    win.destroy();
  }
}

module.exports = { JobQueue };
