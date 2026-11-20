/*
 * GCP Converter — catálogo de formatos (compartilhado entre o processo
 * principal e a interface). Desenvolvido por Bruno Albertini | Gestão Cultural Pro.
 */
(function (root) {
  'use strict';

  const CATEGORIES = {
    video: {
      icon: 'clapperboard',
      color: '#a78bfa',
      inputs: ['mp4', 'mkv', 'webm', 'mov', 'avi', 'wmv', 'flv', 'm4v', 'mpg', 'mpeg', 'ts', 'mts', 'm2ts', '3gp', 'ogv', 'vob', 'gif', 'f4v', 'divx', 'asf', 'rm', 'rmvb'],
      targets: [
        { id: 'mp4', label: 'MP4', ext: 'mp4', tag: 'H.264 · AAC', hint: 'universal' },
        { id: 'mkv', label: 'MKV', ext: 'mkv', tag: 'Matroska', hint: 'flexible' },
        { id: 'webm', label: 'WEBM', ext: 'webm', tag: 'VP9 · Opus', hint: 'web' },
        { id: 'mov', label: 'MOV', ext: 'mov', tag: 'QuickTime', hint: 'apple' },
        { id: 'avi', label: 'AVI', ext: 'avi', tag: 'MPEG-4', hint: 'legacy' },
        { id: 'wmv', label: 'WMV', ext: 'wmv', tag: 'Windows Media', hint: 'windows' },
        { id: 'm4v', label: 'M4V', ext: 'm4v', tag: 'iTunes', hint: 'apple' },
        { id: 'flv', label: 'FLV', ext: 'flv', tag: 'Flash', hint: 'legacy' },
        { id: 'mpeg', label: 'MPEG', ext: 'mpg', tag: 'MPEG-2 · DVD', hint: 'dvd' },
        { id: '3gp', label: '3GP', ext: '3gp', tag: 'Celulares antigos', hint: 'mobile' },
        { id: 'gif', label: 'GIF', ext: 'gif', tag: 'Animação', hint: 'animation' },
        { id: 'webp-anim', label: 'WEBP', ext: 'webp', tag: 'Animação leve', hint: 'animation' }
      ]
    },
    audio: {
      icon: 'audio-lines',
      color: '#22d3ee',
      inputs: ['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg', 'oga', 'opus', 'wma', 'aiff', 'aif', 'alac', 'ac3', 'amr', 'ape', 'wv', 'mka', 'caf', 'au', 'dts', 'mp2',
        // vídeos também podem virar áudio
        'mp4', 'mkv', 'webm', 'mov', 'avi', 'wmv', 'flv', 'm4v', 'mpg', 'mpeg', 'ts', '3gp', 'ogv'],
      targets: [
        { id: 'mp3', label: 'MP3', ext: 'mp3', tag: 'LAME', hint: 'universal' },
        { id: 'aac', label: 'M4A', ext: 'm4a', tag: 'AAC', hint: 'apple' },
        { id: 'ogg', label: 'OGG', ext: 'ogg', tag: 'Vorbis', hint: 'open' },
        { id: 'opus', label: 'OPUS', ext: 'opus', tag: 'Opus', hint: 'voice' },
        { id: 'flac', label: 'FLAC', ext: 'flac', tag: 'Sem perdas', hint: 'lossless' },
        { id: 'wav', label: 'WAV', ext: 'wav', tag: 'PCM', hint: 'studio' },
        { id: 'aiff', label: 'AIFF', ext: 'aiff', tag: 'PCM Apple', hint: 'studio' },
        { id: 'alac', label: 'ALAC', ext: 'm4a', tag: 'Apple Lossless', hint: 'lossless' },
        { id: 'wma', label: 'WMA', ext: 'wma', tag: 'Windows Media', hint: 'windows' },
        { id: 'ac3', label: 'AC3', ext: 'ac3', tag: 'Dolby Digital', hint: 'surround' },
        { id: 'amr', label: 'AMR', ext: 'amr', tag: 'Voz/telefonia', hint: 'voice' }
      ]
    },
    image: {
      icon: 'image',
      color: '#f472b6',
      inputs: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'tif', 'tiff', 'gif', 'ico', 'tga', 'jp2', 'jfif', 'pbm', 'pgm', 'ppm', 'pcx', 'dds', 'exr', 'hdr', 'svg', 'qoi', 'pdf'],
      targets: [
        { id: 'jpg', label: 'JPG', ext: 'jpg', tag: 'Fotos', hint: 'universal' },
        { id: 'png', label: 'PNG', ext: 'png', tag: 'Transparência', hint: 'lossless' },
        { id: 'webp', label: 'WEBP', ext: 'webp', tag: 'Web moderna', hint: 'web' },
        { id: 'avif', label: 'AVIF', ext: 'avif', tag: 'Ultra leve', hint: 'web' },
        { id: 'gif', label: 'GIF', ext: 'gif', tag: '256 cores', hint: 'animation' },
        { id: 'bmp', label: 'BMP', ext: 'bmp', tag: 'Bitmap', hint: 'legacy' },
        { id: 'tiff', label: 'TIFF', ext: 'tiff', tag: 'Impressão', hint: 'print' },
        { id: 'ico', label: 'ICO', ext: 'ico', tag: 'Ícone Windows', hint: 'icon' },
        { id: 'pdf', label: 'PDF', ext: 'pdf', tag: 'Documento', hint: 'document' }
      ]
    },
    document: {
      icon: 'file-text',
      color: '#60a5fa',
      inputs: ['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown', 'html', 'htm', 'xls', 'xlsx', 'ods', 'csv', 'ppt', 'pptx', 'odp', 'epub', 'xml', 'wpd', 'pages', 'key', 'numbers',
        'jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'],
      targets: [
        { id: 'pdf', label: 'PDF', ext: 'pdf', tag: 'Portátil', hint: 'universal' },
        { id: 'docx', label: 'DOCX', ext: 'docx', tag: 'Word', hint: 'office' },
        { id: 'odt', label: 'ODT', ext: 'odt', tag: 'LibreOffice', hint: 'open' },
        { id: 'rtf', label: 'RTF', ext: 'rtf', tag: 'Rich Text', hint: 'legacy' },
        { id: 'txt', label: 'TXT', ext: 'txt', tag: 'Texto puro', hint: 'plain' },
        { id: 'html', label: 'HTML', ext: 'html', tag: 'Página web', hint: 'web' },
        { id: 'md', label: 'MD', ext: 'md', tag: 'Markdown', hint: 'plain' },
        { id: 'xlsx', label: 'XLSX', ext: 'xlsx', tag: 'Excel', hint: 'sheet' },
        { id: 'ods', label: 'ODS', ext: 'ods', tag: 'Planilha aberta', hint: 'sheet' },
        { id: 'csv', label: 'CSV', ext: 'csv', tag: 'Dados', hint: 'sheet' },
        { id: 'pptx', label: 'PPTX', ext: 'pptx', tag: 'PowerPoint', hint: 'slides' },
        { id: 'odp', label: 'ODP', ext: 'odp', tag: 'Apresentação', hint: 'slides' },
        { id: 'epub', label: 'EPUB', ext: 'epub', tag: 'E-book', hint: 'ebook' }
      ]
    },
    ebook: {
      icon: 'book-open',
      color: '#fbbf24',
      inputs: ['epub', 'mobi', 'azw', 'azw3', 'kfx', 'fb2', 'lit', 'pdb', 'lrf', 'cbz', 'cbr', 'cb7', 'djvu', 'pdf', 'docx', 'odt', 'rtf', 'txt', 'md', 'markdown', 'html', 'htm', 'pptx', 'odp'],
      targets: [
        { id: 'epub', label: 'EPUB', ext: 'epub', tag: 'Padrão aberto', hint: 'universal' },
        { id: 'mobi', label: 'MOBI', ext: 'mobi', tag: 'Kindle', hint: 'kindle' },
        { id: 'fb2', label: 'FB2', ext: 'fb2', tag: 'FictionBook', hint: 'open' },
        { id: 'pdf', label: 'PDF', ext: 'pdf', tag: 'Impressão', hint: 'print' },
        { id: 'docx', label: 'DOCX', ext: 'docx', tag: 'Word', hint: 'office' },
        { id: 'odt', label: 'ODT', ext: 'odt', tag: 'LibreOffice', hint: 'open' },
        { id: 'rtf', label: 'RTF', ext: 'rtf', tag: 'Rich Text', hint: 'legacy' },
        { id: 'txt', label: 'TXT', ext: 'txt', tag: 'Texto puro', hint: 'plain' },
        { id: 'html', label: 'HTML', ext: 'html', tag: 'Página web', hint: 'web' },
        { id: 'md', label: 'MD', ext: 'md', tag: 'Markdown', hint: 'plain' },
        { id: 'azw3', label: 'AZW3', ext: 'azw3', tag: 'Kindle (Calibre)', hint: 'kindle' }
      ]
    },
    fiscal: {
      icon: 'receipt-text',
      color: '#fb923c',
      inputs: ['xml'],
      targets: [
        { id: 'pdf', label: 'PDF', ext: 'pdf', tag: 'Leiaute oficial', hint: 'fiscal' }
      ]
    },
    compress: {
      icon: 'minimize-2',
      color: '#34d399',
      inputs: [],
      targets: [
        { id: 'same', label: 'AUTO', ext: '', tag: 'Mesmo formato', hint: 'auto' },
        { id: 'zip', label: 'ZIP', ext: 'zip', tag: 'Arquivo único', hint: 'archive' }
      ]
    }
  };

  // Compactar aceita tudo que as outras categorias aceitam + PDF.
  const all = new Set();
  ['video', 'audio', 'image', 'document', 'ebook'].forEach((c) => CATEGORIES[c].inputs.forEach((e) => all.add(e)));
  all.delete('xml');
  CATEGORIES.compress.inputs = Array.from(all);

  const CATEGORY_ORDER = ['video', 'audio', 'image', 'document', 'ebook', 'fiscal', 'compress'];

  /** Descobre a categoria "natural" de um arquivo pela extensão. */
  function detectCategory(ext) {
    ext = String(ext || '').toLowerCase().replace(/^\./, '');
    const priority = [
      ['image', ['jpg', 'jpeg', 'png', 'webp', 'avif', 'bmp', 'tif', 'tiff', 'ico', 'tga', 'jp2', 'jfif', 'pbm', 'pgm', 'ppm', 'pcx', 'dds', 'exr', 'hdr', 'svg', 'qoi']],
      ['video', CATEGORIES.video.inputs],
      ['audio', CATEGORIES.audio.inputs],
      ['ebook', ['epub', 'mobi', 'azw', 'azw3', 'kfx', 'fb2', 'lit', 'pdb', 'lrf', 'cbz', 'cbr', 'cb7', 'djvu']],
      ['document', CATEGORIES.document.inputs]
    ];
    if (ext === 'xml') return 'fiscal';
    for (const [cat, list] of priority) if (list.includes(ext)) return cat;
    return null;
  }

  function findTarget(category, id) {
    const c = CATEGORIES[category];
    return c ? c.targets.find((t) => t.id === id) : null;
  }

  // Predefinições de vídeo (podem ser combinadas com opções avançadas).
  const VIDEO_PRESETS = [
    { id: 'custom', icon: 'sliders-horizontal', target: null, opts: {} },
    { id: 'youtube', icon: 'youtube', target: 'mp4', opts: { resolution: '1080', fps: 'original', quality: 'high', videoCodec: 'h264', audioBitrate: '192' } },
    { id: 'instagram', icon: 'instagram', target: 'mp4', opts: { resolution: '1080x1920', fps: '30', quality: 'balanced', videoCodec: 'h264', audioBitrate: '128' } },
    { id: 'tiktok', icon: 'smartphone', target: 'mp4', opts: { resolution: '1080x1920', fps: '30', quality: 'balanced', videoCodec: 'h264', audioBitrate: '128' } },
    { id: 'whatsapp', icon: 'message-circle', target: 'mp4', opts: { resolution: '720', fps: '30', quality: 'small', videoCodec: 'h264', audioBitrate: '96' } },
    { id: 'email', icon: 'mail', target: 'mp4', opts: { resolution: '480', fps: '24', quality: 'small', videoCodec: 'h264', audioBitrate: '64' } },
    { id: '4k', icon: 'monitor', target: 'mkv', opts: { resolution: '2160', fps: 'original', quality: 'high', videoCodec: 'h265', audioBitrate: '256' } },
    { id: 'web', icon: 'globe', target: 'webm', opts: { resolution: '1080', fps: 'original', quality: 'balanced', videoCodec: 'vp9', audioBitrate: '128' } }
  ];

  const AUDIO_PRESETS = [
    { id: 'custom', icon: 'sliders-horizontal', target: null, opts: {} },
    { id: 'podcast', icon: 'mic', target: 'mp3', opts: { bitrate: '96', channels: '1', sampleRate: '44100', normalize: true } },
    { id: 'music', icon: 'music', target: 'mp3', opts: { bitrate: '320', channels: 'original', sampleRate: 'original' } },
    { id: 'audiophile', icon: 'gem', target: 'flac', opts: { sampleRate: 'original', channels: 'original' } },
    { id: 'whatsapp', icon: 'message-circle', target: 'opus', opts: { bitrate: '48', channels: '1', sampleRate: '48000' } },
    { id: 'ringtone', icon: 'bell-ring', target: 'aac', opts: { bitrate: '128', trimEnd: '30', fadeOut: '2' } },
    { id: 'studio', icon: 'audio-waveform', target: 'wav', opts: { sampleRate: '48000', channels: 'original' } }
  ];

  const IMAGE_PRESETS = [
    { id: 'custom', icon: 'sliders-horizontal', target: null, opts: {} },
    { id: 'web', icon: 'globe', target: 'webp', opts: { quality: 80, maxSide: '1920' } },
    { id: 'social', icon: 'instagram', target: 'jpg', opts: { quality: 88, maxSide: '1080' } },
    { id: 'thumbnail', icon: 'scaling', target: 'jpg', opts: { quality: 82, maxSide: '480' } },
    { id: 'print', icon: 'printer', target: 'tiff', opts: { quality: 100, maxSide: 'original' } },
    { id: 'icon', icon: 'app-window', target: 'ico', opts: { maxSide: '256' } },
    { id: 'ultra', icon: 'feather', target: 'avif', opts: { quality: 60, maxSide: '2560' } }
  ];

  const api = { CATEGORIES, CATEGORY_ORDER, VIDEO_PRESETS, AUDIO_PRESETS, IMAGE_PRESETS, detectCategory, findTarget };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GCP_FORMATS = api;
})(typeof window !== 'undefined' ? window : globalThis);
