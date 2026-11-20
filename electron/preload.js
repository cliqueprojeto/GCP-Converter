// Ponte segura entre a interface e o processo principal.
'use strict';
const { contextBridge, ipcRenderer, webUtils } = require('electron');

const invoke = (ch) => (...args) => ipcRenderer.invoke(ch, ...args);
const on = (ch) => (cb) => {
  const fn = (_e, payload) => cb(payload);
  ipcRenderer.on(ch, fn);
  return () => ipcRenderer.removeListener(ch, fn);
};

contextBridge.exposeInMainWorld('gcp', {
  appInfo: invoke('app:info'),
  getSettings: invoke('settings:get'),
  setSettings: invoke('settings:set'),
  isDark: invoke('theme:dark'),
  onThemeChanged: on('theme:changed'),

  openFiles: invoke('dialog:openFiles'),
  openFolder: invoke('dialog:openFolder'),
  expand: invoke('fs:expand'),
  pathForFile: (file) => (webUtils && webUtils.getPathForFile ? webUtils.getPathForFile(file) : file.path),
  probe: invoke('media:probe'),
  thumbnail: invoke('media:thumbnail'),
  detectTools: invoke('tools:detect'),
  docPlan: invoke('docs:plan'),
  docPlanMany: invoke('docs:planMany'),

  addJobs: invoke('jobs:add'),
  listJobs: invoke('jobs:list'),
  cancelJob: invoke('jobs:cancel'),
  cancelAll: invoke('jobs:cancelAll'),
  retryJob: invoke('jobs:retry'),
  removeJob: invoke('jobs:remove'),
  clearFinished: invoke('jobs:clearFinished'),
  onJobs: on('jobs:changed'),
  onProgress: on('jobs:progress'),
  onIdle: on('jobs:idle'),
  onFilesOpened: on('files:opened'),

  history: invoke('history:get'),
  clearHistory: invoke('history:clear'),
  stats: invoke('stats:get'),

  open: invoke('shell:open'),
  show: invoke('shell:show'),
  external: invoke('shell:external'),
  exists: invoke('file:exists'),

  updateStatus: invoke('update:status'),
  checkUpdate: invoke('update:check'),
  installUpdate: invoke('update:install'),
  skipUpdate: invoke('update:skip'),
  releases: invoke('update:releases'),
  onUpdate: on('update:available'),
  onUpdateProgress: on('update:progress'),

  pixQr: invoke('pix:qr'),
  changelog: invoke('changelog:local'),
  licenses: invoke('licenses:get'),
  markdown: invoke('markdown:render')
});
