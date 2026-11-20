'use strict';
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', bmp: 'image/bmp', webp: 'image/webp', svg: 'image/svg+xml', tif: 'image/tiff', tiff: 'image/tiff', emf: 'image/x-emf', wmf: 'image/x-wmf' };
const imageMime = (name) => MIME[String(name).split('.').pop().toLowerCase()] || 'application/octet-stream';
function dataUrlToBytes(url) {
  const m = String(url || '').match(/^data:([^;,]+)(;base64)?,(.*)$/s);
  if (!m) return null;
  const mime = m[1];
  const bytes = m[2] ? Buffer.from(m[3], 'base64') : Buffer.from(decodeURIComponent(m[3]));
  const ext = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/bmp': 'bmp', 'image/webp': 'webp', 'image/svg+xml': 'svg' }[mime] || 'bin';
  return { mime, bytes, ext };
}
module.exports = { esc, imageMime, dataUrlToBytes };
