// Armazenamento simples em JSON (preferências, histórico e estatísticas).
'use strict';
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

const DEFAULTS = {
  language: 'auto', // auto | pt-BR | en | es
  theme: 'dark', // dark | light | system
  iconStyle: 'dark', // dark | light
  outputMode: 'source', // source | custom
  outputDir: '',
  namePattern: '{name}_{action}', // tokens: {name} {action} {ext} {target} {date} {time} {index}
  conflict: 'rename', // rename | overwrite | skip
  concurrency: 2,
  keepMetadata: true,
  notify: true,
  openFolderOnFinish: false,
  sound: true,
  hwAccel: 'none', // none | nvidia | intel | amd | apple
  update: { frequency: 'startup', lastCheck: 0, skipVersion: '' },
  computerName: '',
  onboarded: false
};

class Store {
  constructor(file, defaults) {
    this.file = path.join(app.getPath('userData'), file);
    this.defaults = defaults;
    this.data = this._read();
  }
  _read() {
    try {
      const raw = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      if (Array.isArray(this.defaults)) return Array.isArray(raw) ? raw : [];
      return deepMerge(structuredClone(this.defaults), raw);
    } catch {
      return structuredClone(this.defaults);
    }
  }
  save() {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = this.file + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2));
      fs.renameSync(tmp, this.file);
    } catch (e) {
      console.error('store save failed', e);
    }
  }
}

function deepMerge(target, src) {
  if (!src || typeof src !== 'object') return target;
  for (const [k, v] of Object.entries(src)) {
    if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object') deepMerge(target[k], v);
    else target[k] = v;
  }
  return target;
}

module.exports = { Store, DEFAULTS, deepMerge };
