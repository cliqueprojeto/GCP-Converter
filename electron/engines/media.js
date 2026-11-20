// Conversão de vídeo, áudio e imagem com FFmpeg (embutido no aplicativo).
'use strict';
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { ffmpegPath, ffmpegEncoders } = require('./tools');

/** Lê duração, resolução e faixas de um arquivo usando `ffmpeg -i`. */
function probe(file) {
  return new Promise((resolve) => {
    const ff = ffmpegPath();
    if (!ff) return resolve({});
    const p = spawn(ff, ['-hide_banner', '-i', file], { windowsHide: true });
    let err = '';
    p.stderr.on('data', (d) => (err += d));
    p.on('error', () => resolve({}));
    p.on('close', () => {
      const info = { hasVideo: false, hasAudio: false };
      const d = err.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
      if (d) info.duration = +d[1] * 3600 + +d[2] * 60 + parseFloat(d[3]);
      const br = err.match(/bitrate:\s*(\d+)\s*kb\/s/);
      if (br) info.bitrate = +br[1];
      const v = err.match(/Stream #[^\n]*Video:\s*([^\s,]+)[^\n]*?\s(\d{2,5})x(\d{2,5})/);
      if (v && !/attached pic/.test(err.split('\n').find((l) => l.includes('Video:')) || '')) {
        info.hasVideo = true;
        info.videoCodec = v[1];
        info.width = +v[2];
        info.height = +v[3];
      } else if (v) {
        info.coverArt = true;
        info.width = +v[2];
        info.height = +v[3];
      }
      const fps = err.match(/(\d+(?:\.\d+)?)\s*fps/);
      if (fps) info.fps = parseFloat(fps[1]);
      const a = err.match(/Stream #[^\n]*Audio:\s*([^\s,]+)[^\n]*?(\d+)\s*Hz/);
      if (a) {
        info.hasAudio = true;
        info.audioCodec = a[1];
        info.sampleRate = +a[2];
      }
      resolve(info);
    });
  });
}

const QUALITY = {
  h264: { high: 18, balanced: 23, small: 28 },
  h265: { high: 22, balanced: 27, small: 32 },
  vp9: { high: 28, balanced: 34, small: 40 },
  av1: { high: 26, balanced: 32, small: 40 }
};

function num(v, d) {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : d;
}

function parseTime(v) {
  if (v === undefined || v === null || v === '') return null;
  const s = String(v).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return parseFloat(s);
  const parts = s.split(':').map(parseFloat);
  if (parts.some((x) => !Number.isFinite(x))) return null;
  return parts.reduce((acc, x) => acc * 60 + x, 0);
}

function scaleFilter(resolution, w0, h0) {
  if (!resolution || resolution === 'original') return null;
  if (/^\d+x\d+$/.test(resolution)) {
    const [w, h] = resolution.split('x').map(Number);
    // Enquadra no tamanho alvo mantendo proporção e completa com barras (ideal para Reels/TikTok).
    return `scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1`;
  }
  const target = parseInt(resolution, 10);
  if (!target) return null;
  // Não amplia vídeos menores que o alvo.
  if (h0 && w0 && Math.min(w0, h0) <= target) return null;
  return w0 && h0 && h0 > w0 ? `scale=${target}:-2` : `scale=-2:${target}`;
}

function videoEncoder(codec, hw, encoders) {
  const has = (e) => encoders.has(e);
  const hwMap = {
    h264: { nvidia: 'h264_nvenc', intel: 'h264_qsv', amd: 'h264_amf', apple: 'h264_videotoolbox' },
    h265: { nvidia: 'hevc_nvenc', intel: 'hevc_qsv', amd: 'hevc_amf', apple: 'hevc_videotoolbox' }
  };
  if (hw && hw !== 'none' && hwMap[codec] && hwMap[codec][hw] && has(hwMap[codec][hw])) return { name: hwMap[codec][hw], hw: true };
  if (codec === 'h264') return { name: 'libx264' };
  if (codec === 'h265') return { name: has('libx265') ? 'libx265' : 'libx264', family: has('libx265') ? 'h265' : 'h264' };
  if (codec === 'vp9') return { name: 'libvpx-vp9' };
  if (codec === 'vp8') return { name: 'libvpx' };
  if (codec === 'av1') {
    if (has('libsvtav1')) return { name: 'libsvtav1' };
    if (has('libaom-av1')) return { name: 'libaom-av1' };
    return { name: 'libvpx-vp9', family: 'vp9' };
  }
  return { name: codec };
}

function defaultsFor(target) {
  switch (target) {
    case 'webm': return { v: 'vp9', a: 'opus' };
    case 'avi': return { v: 'mpeg4', a: 'mp3' };
    case 'wmv': return { v: 'wmv2', a: 'wmav2' };
    case 'flv': return { v: 'h264', a: 'aac' };
    case 'mpeg': return { v: 'mpeg2video', a: 'mp2' };
    case '3gp': return { v: 'h264', a: 'aac', small: true };
    default: return { v: 'h264', a: 'aac' };
  }
}

const AUDIO_ENC = { aac: 'aac', opus: 'libopus', mp3: 'libmp3lame', vorbis: 'libvorbis', wmav2: 'wmav2', mp2: 'mp2', ac3: 'ac3', flac: 'flac' };

/** Monta argumentos FFmpeg para vídeo. */
async function videoArgs(job, info) {
  const o = job.options || {};
  const enc = await ffmpegEncoders();
  const args = [];
  const filters = [];
  const t = job.target;

  if (t === 'gif' || t === 'webp-anim') {
    const fps = o.fps && o.fps !== 'original' ? o.fps : '12';
    const width = o.resolution && o.resolution !== 'original' ? Math.min(parseInt(o.resolution, 10) || 480, 1080) : 480;
    const base = `fps=${fps},scale=${width}:-2:flags=lanczos`;
    if (t === 'gif') {
      args.push('-filter_complex', `[0:v]${base},split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=sierra2_4a`);
      args.push('-loop', '0');
    } else {
      args.push('-vf', base, '-c:v', 'libwebp_anim', '-quality', String(o.quality === 'small' ? 55 : o.quality === 'high' ? 85 : 72), '-loop', '0', '-an');
    }
    return args;
  }

  const def = defaultsFor(t);
  let codec = o.videoCodec && o.videoCodec !== 'auto' ? o.videoCodec : def.v;
  if (t === 'webm' && !['vp9', 'vp8', 'av1'].includes(codec)) codec = 'vp9';
  if (['mp4', 'm4v', 'mov'].includes(t) && ['vp8', 'mpeg4', 'wmv2'].includes(codec)) codec = 'h264';

  if (codec === 'copy') {
    args.push('-c:v', 'copy');
  } else {
    const ve = videoEncoder(codec, job.hwAccel, enc);
    const family = ve.family || codec;
    args.push('-c:v', ve.name);
    const qName = o.quality || 'balanced';
    const qTable = QUALITY[family];
    const customCrf = o.crf !== undefined && o.crf !== '' ? parseInt(o.crf, 10) : null;
    const speed = o.speed || 'balanced';

    if (job.targetBitrate) {
      args.push('-b:v', `${job.targetBitrate}k`, '-maxrate', `${Math.round(job.targetBitrate * 1.3)}k`, '-bufsize', `${job.targetBitrate * 2}k`);
    } else if (ve.hw) {
      const q = customCrf || (qTable ? qTable[qName] : 23);
      if (ve.name.includes('nvenc')) args.push('-rc', 'vbr', '-cq', String(q), '-b:v', '0');
      else if (ve.name.includes('qsv')) args.push('-global_quality', String(q));
      else if (ve.name.includes('videotoolbox')) args.push('-q:v', String(Math.max(1, Math.min(100, 100 - q * 2))));
      else args.push('-qp_i', String(q), '-qp_p', String(q));
    } else if (qTable) {
      const crf = customCrf || qTable[qName];
      args.push('-crf', String(crf));
      if (family === 'vp9') args.push('-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', speed === 'fast' ? '5' : speed === 'quality' ? '1' : '3');
      if (ve.name === 'libaom-av1') args.push('-b:v', '0', '-cpu-used', speed === 'fast' ? '8' : speed === 'quality' ? '4' : '6', '-row-mt', '1');
      if (ve.name === 'libsvtav1') args.push('-preset', speed === 'fast' ? '10' : speed === 'quality' ? '5' : '8');
      if (family === 'h264' || family === 'h265') args.push('-preset', speed === 'fast' ? 'veryfast' : speed === 'quality' ? 'slow' : 'medium');
    } else {
      const q = { high: 2, balanced: 5, small: 9 }[qName] || 5;
      args.push('-q:v', String(q));
    }
    if (['h264', 'h265'].includes(family) && !ve.hw) args.push('-pix_fmt', 'yuv420p');
    if (family === 'h265' && ['mp4', 'mov', 'm4v'].includes(t)) args.push('-tag:v', 'hvc1');
    if (['mp4', 'mov', 'm4v'].includes(t)) args.push('-movflags', '+faststart');

    const sf = scaleFilter(o.resolution, info.width, info.height);
    if (sf) filters.push(sf);
    if (o.rotate && o.rotate !== '0') filters.push({ 90: 'transpose=1', 180: 'transpose=1,transpose=1', 270: 'transpose=2' }[o.rotate]);
    if (o.flip === 'h') filters.push('hflip');
    if (o.flip === 'v') filters.push('vflip');
    if (o.deinterlace) filters.push('yadif');
    if (o.grayscale) filters.push('hue=s=0');
    if (o.fps && o.fps !== 'original') args.push('-r', String(o.fps));
    if (o.speedFactor && o.speedFactor !== '1') filters.push(`setpts=PTS/${num(o.speedFactor, 1)}`);
    if (codec === 'h264' || family === 'h264') {
      // dimensões pares para yuv420p
      if (!sf) filters.push('scale=trunc(iw/2)*2:trunc(ih/2)*2');
    }
    if (filters.filter(Boolean).length) args.push('-vf', filters.filter(Boolean).join(','));
  }

  // Áudio
  const aCodec = o.audioCodec && o.audioCodec !== 'auto' ? o.audioCodec : def.a;
  if (o.mute || aCodec === 'none' || !info.hasAudio) {
    args.push('-an');
  } else if (aCodec === 'copy') {
    args.push('-c:a', 'copy');
  } else {
    let ac = aCodec;
    if (t === 'webm' && !['opus', 'vorbis'].includes(ac)) ac = 'opus';
    args.push('-c:a', AUDIO_ENC[ac] || ac);
    if (ac !== 'flac') args.push('-b:a', `${num(job.targetAudioBitrate || o.audioBitrate, def.small ? 64 : 160)}k`);
    const af = [];
    if (o.normalize) af.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    if (o.volume && o.volume !== '100') af.push(`volume=${num(o.volume, 100) / 100}`);
    if (o.speedFactor && o.speedFactor !== '1') af.push(atempoChain(num(o.speedFactor, 1)));
    if (af.length) args.push('-af', af.join(','));
    if (ac === 'opus') args.push('-ar', '48000');
    if (t === 'mpeg' || t === '3gp' || ac === 'wmav2') args.push('-ar', t === '3gp' ? '22050' : '44100');
  }
  if (o.subtitles === 'copy' && ['mkv'].includes(t)) args.push('-map', '0', '-c:s', 'copy');
  return args;
}

function atempoChain(f) {
  const parts = [];
  while (f > 2) { parts.push('atempo=2.0'); f /= 2; }
  while (f < 0.5) { parts.push('atempo=0.5'); f /= 0.5; }
  parts.push(`atempo=${f.toFixed(3)}`);
  return parts.join(',');
}

/** Monta argumentos FFmpeg para áudio. */
async function audioArgs(job, info) {
  const o = job.options || {};
  const args = ['-vn'];
  const t = job.target;
  const bitrate = num(job.targetAudioBitrate || o.bitrate, 192);
  const enc = { mp3: 'libmp3lame', aac: 'aac', ogg: 'libvorbis', opus: 'libopus', flac: 'flac', wav: 'pcm_s16le', aiff: 'pcm_s16be', alac: 'alac', wma: 'wmav2', ac3: 'ac3', amr: 'libopencore_amrnb' }[t];
  if (t === 'amr') {
    const encs = await ffmpegEncoders();
    args.push('-c:a', encs.has('libopencore_amrnb') ? 'libopencore_amrnb' : encs.has('libvo_amrwbenc') ? 'libvo_amrwbenc' : 'libopencore_amrnb');
    args.push('-ar', '8000', '-ac', '1', '-b:a', '12.2k');
  } else {
    args.push('-c:a', enc);
    if (['mp3', 'aac', 'ogg', 'opus', 'wma', 'ac3'].includes(t)) {
      if (o.vbr && t === 'mp3') args.push('-q:a', String({ high: 0, balanced: 2, small: 5 }[o.vbr] ?? 2));
      else args.push('-b:a', `${t === 'opus' ? Math.min(bitrate, 256) : bitrate}k`);
    }
    if (t === 'flac') args.push('-compression_level', String(o.flacLevel || 8));
    if (o.bitDepth === '24' && ['wav', 'aiff'].includes(t)) args[args.indexOf(enc)] = t === 'wav' ? 'pcm_s24le' : 'pcm_s24be';
    let sr = o.sampleRate && o.sampleRate !== 'original' ? o.sampleRate : null;
    if (t === 'opus') sr = '48000';
    if (t === 'ac3' && !sr) sr = '48000';
    if (sr) args.push('-ar', String(sr));
    if (o.channels && o.channels !== 'original') args.push('-ac', String(o.channels));
  }
  const af = [];
  if (o.normalize) af.push('loudnorm=I=-16:TP=-1.5:LRA=11');
  if (o.volume && String(o.volume) !== '100') af.push(`volume=${num(o.volume, 100) / 100}`);
  if (o.speedFactor && o.speedFactor !== '1') af.push(atempoChain(num(o.speedFactor, 1)));
  if (o.removeSilence) af.push('silenceremove=start_periods=1:start_threshold=-50dB:stop_periods=-1:stop_duration=1:stop_threshold=-50dB');
  const fadeIn = num(o.fadeIn, 0);
  if (fadeIn > 0) af.push(`afade=t=in:st=0:d=${fadeIn}`);
  const fadeOut = num(o.fadeOut, 0);
  if (fadeOut > 0) {
    const start = parseTime(o.trimStart) || 0;
    const end = parseTime(o.trimEnd) || info.duration || 0;
    const len = end - start;
    if (len > fadeOut) af.push(`afade=t=out:st=${(len - fadeOut).toFixed(2)}:d=${fadeOut}`);
  }
  if (af.length) args.push('-af', af.join(','));
  if (o.keepCover !== false && info.coverArt && ['mp3', 'aac', 'flac', 'alac'].includes(t)) {
    args.splice(0, 1); // remove -vn
    args.unshift('-map', '0:a', '-map', '0:v?', '-c:v', 'copy', '-disposition:v', 'attached_pic');
    if (t === 'mp3') args.push('-id3v2_version', '3');
  }
  return args;
}

function qualityToQscale(q) {
  // 100 → 2 (melhor), 1 → 31 (pior)
  return Math.round(31 - (Math.max(1, Math.min(100, q)) / 100) * 29);
}

/** Monta argumentos FFmpeg para imagem. */
async function imageArgs(job, info) {
  const o = job.options || {};
  const t = job.target;
  const q = num(o.quality, 85);
  const filters = [];
  const max = o.maxSide && o.maxSide !== 'original' ? parseInt(o.maxSide, 10) : null;
  if (o.width || o.height) {
    const w = parseInt(o.width, 10) || -2;
    const h = parseInt(o.height, 10) || -2;
    filters.push(o.keepAspect === false && w > 0 && h > 0 ? `scale=${w}:${h}` : `scale=${w > 0 ? w : -1}:${h > 0 ? h : -1}:force_original_aspect_ratio=${w > 0 && h > 0 ? 'decrease' : 'disable'}`);
  } else if (o.scalePercent && o.scalePercent !== '100') {
    filters.push(`scale=iw*${num(o.scalePercent, 100) / 100}:-1`);
  } else if (max) {
    filters.push(`scale='if(gt(iw,ih),min(${max},iw),-1)':'if(gt(iw,ih),-1,min(${max},ih))'`);
  }
  if (t === 'ico') {
    const side = Math.min(256, parseInt(o.icoSize, 10) || 256);
    filters.push(`scale=${side}:${side}:force_original_aspect_ratio=decrease`, 'format=rgba', `pad=${side}:${side}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`);
  }
  if (o.rotate && o.rotate !== '0') filters.push({ 90: 'transpose=1', 180: 'transpose=1,transpose=1', 270: 'transpose=2' }[o.rotate]);
  if (o.flip === 'h') filters.push('hflip');
  if (o.flip === 'v') filters.push('vflip');
  if (o.grayscale) filters.push('format=gray');

  const args = [];
  if (t === 'jpg') {
    // JPEG não tem transparência: aplica fundo branco
    filters.push('format=rgba', 'split[a][b];[a]drawbox=c=white@1:t=fill[bg];[bg][b]overlay=format=auto', 'format=yuvj444p');
    args.push('-frames:v', '1', '-q:v', String(qualityToQscale(q)));
  } else if (t === 'png') {
    args.push('-frames:v', '1', '-compression_level', String(o.pngLevel ?? 9));
    if (o.palette) {
      const chain = filters.length ? filters.join(',') + ',' : '';
      return ['-filter_complex', `[0:v]${chain}split[a][b];[a]palettegen=max_colors=${o.colors || 256}:reserve_transparent=1[p];[b][p]paletteuse=dither=sierra2_4a`, '-frames:v', '1', ...stripMeta(job)];
    }
  } else if (t === 'webp') {
    args.push('-frames:v', '1', '-c:v', 'libwebp', '-quality', String(Math.round(q)), '-compression_level', '6');
    if (q >= 100) args.push('-lossless', '1');
  } else if (t === 'avif') {
    const crf = Math.round(63 - (q / 100) * 50);
    args.push('-frames:v', '1', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', String(crf), '-b:v', '0', '-cpu-used', '6');
    filters.push('format=yuv420p');
  } else if (t === 'gif') {
    const chain = filters.length ? filters.join(',') + ',' : '';
    return ['-filter_complex', `[0:v]${chain}split[a][b];[a]palettegen[p];[b][p]paletteuse`, '-loop', '0', ...stripMeta(job)];
  } else if (t === 'bmp') {
    args.push('-frames:v', '1');
    filters.push('format=bgr24');
  } else if (t === 'tiff') {
    args.push('-frames:v', '1', '-compression_algo', o.tiffCompression || 'lzw');
  } else if (t === 'ico') {
    args.push('-frames:v', '1', '-c:v', 'png');
  }
  if (filters.length) {
    const graph = filters.join(',');
    if (graph.includes('[')) args.unshift('-filter_complex', `[0:v]${graph}`);
    else args.unshift('-vf', graph);
  }
  return [...args, ...stripMeta(job)];
}

function stripMeta(job) {
  return job.keepMetadata === false ? ['-map_metadata', '-1'] : [];
}

/**
 * Executa o FFmpeg com progresso.
 * @returns {Promise<void>}
 */
function runFfmpeg({ input, output, args, preInput = [], duration, onProgress, signal }) {
  return new Promise((resolve, reject) => {
    const ff = ffmpegPath();
    if (!ff) return reject(new Error('FFmpeg não encontrado'));
    const full = ['-hide_banner', '-nostdin', '-y', ...preInput, '-i', input, ...args, '-progress', 'pipe:1', '-nostats', output];
    const p = spawn(ff, full, { windowsHide: true });
    let tail = '';
    const onAbort = () => {
      try { p.kill('SIGKILL'); } catch {}
    };
    if (signal) {
      if (signal.aborted) onAbort();
      signal.addEventListener('abort', onAbort, { once: true });
    }
    p.stdout.on('data', (d) => {
      const s = String(d);
      const m = s.match(/out_time_(?:us|ms)=(\d+)/g);
      if (m && duration) {
        const last = m[m.length - 1];
        const us = parseInt(last.split('=')[1], 10);
        if (us > 0) onProgress && onProgress(Math.min(0.995, us / 1e6 / duration));
      }
      const sp = s.match(/speed=\s*([\d.]+)x/);
      if (sp && onProgress) onProgress(null, parseFloat(sp[1]));
    });
    p.stderr.on('data', (d) => {
      tail = (tail + d).slice(-4000);
    });
    p.on('error', reject);
    p.on('close', (code) => {
      if (signal) signal.removeEventListener('abort', onAbort);
      if (signal && signal.aborted) return reject(Object.assign(new Error('cancelled'), { cancelled: true }));
      if (code === 0) return resolve();
      const lines = tail.trim().split(/\r?\n/).filter((l) => !/^\s*(frame|size|Press|\[out)/.test(l));
      reject(new Error(lines.slice(-3).join(' · ') || `FFmpeg saiu com código ${code}`));
    });
  });
}

/** Converte vídeo/áudio/imagem. */
async function convertMedia(job, output, onProgress, signal) {
  const info = await probe(job.input);
  const preInput = [];
  const o = job.options || {};
  const start = parseTime(o.trimStart);
  const end = parseTime(o.trimEnd);
  if (job.kind !== 'image') {
    if (start) preInput.push('-ss', String(start));
    if (end && end > (start || 0)) preInput.push('-to', String(end));
  }
  let duration = info.duration || 0;
  if (end) duration = Math.min(duration || end, end) - (start || 0);
  else if (start) duration -= start;
  if (o.speedFactor && o.speedFactor !== '1') duration = duration / num(o.speedFactor, 1);

  let args;
  if (job.kind === 'video') args = await videoArgs(job, info);
  else if (job.kind === 'audio') args = await audioArgs(job, info);
  else args = await imageArgs(job, info);
  if (job.kind !== 'image') {
    if (job.keepMetadata === false) args.push('-map_metadata', '-1');
  }
  if (job.kind === 'video' && o.threads) args.push('-threads', String(o.threads));

  try {
    await runFfmpeg({ input: job.input, output, args, preInput, duration, onProgress, signal });
  } catch (e) {
    // Fallback: se a aceleração por hardware falhar, tenta novamente por software.
    if (!e.cancelled && job.kind === 'video' && job.hwAccel && job.hwAccel !== 'none') {
      const soft = { ...job, hwAccel: 'none' };
      const args2 = await videoArgs(soft, info);
      await runFfmpeg({ input: job.input, output, args: args2, preInput, duration, onProgress, signal });
    } else throw e;
  }
  return { info };
}

/** Miniatura (data URL JPEG) de um quadro do vídeo. */
function frameThumb(file) {
  return new Promise((resolve) => {
    const ff = ffmpegPath();
    if (!ff) return resolve(null);
    const p = spawn(ff, ['-hide_banner', '-loglevel', 'error', '-ss', '1', '-i', file, '-frames:v', '1', '-vf', 'scale=160:-2', '-f', 'image2pipe', '-c:v', 'mjpeg', '-q:v', '5', 'pipe:1'], { windowsHide: true });
    const chunks = [];
    const timer = setTimeout(() => { try { p.kill(); } catch {} }, 15000);
    p.stdout.on('data', (d) => chunks.push(d));
    p.on('error', () => resolve(null));
    p.on('close', () => {
      clearTimeout(timer);
      const buf = Buffer.concat(chunks);
      resolve(buf.length ? 'data:image/jpeg;base64,' + buf.toString('base64') : null);
    });
  });
}

module.exports = { probe, convertMedia, runFfmpeg, parseTime, frameThumb };
