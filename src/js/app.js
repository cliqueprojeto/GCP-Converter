/* GCP Converter — interface
 * Desenvolvido por Bruno Albertini | Gestão Cultural Pro — www.gestaoculturalpro.com.br
 */
(function () {
  'use strict';
  const api = window.gcp;
  const F = window.GCP_FORMATS;
  const { t } = window.I18N;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const PIX = '00020126850014br.gov.bcb.pix0136e474b71b-7491-4eac-992f-632652e5a4eb0223DEV GESTAO CULTURAL PRO5204000053039865802BR5915BRUNO ALBERTINI6006BRASIL62200516ChromeExtensions63042B27';
  const STRIPE = 'https://donate.stripe.com/fZu4gzeBSfhbd7451F6Ri00';
  const SITE = 'https://www.gestaoculturalpro.com.br';
  const REPO = 'https://github.com/cliqueprojeto/GCP-Converter';

  const CAT_COLORS = { video: '#a78bfa', audio: '#22d3ee', image: '#f472b6', document: '#60a5fa', ebook: '#fbbf24', fiscal: '#fb923c', compress: '#34d399' };
  const ROUTES = ['home', 'video', 'audio', 'image', 'document', 'ebook', 'fiscal', 'compress', 'queue', 'history', 'settings'];

  const DEFAULT_OPTS = {
    video: { quality: 'balanced', resolution: 'original', fps: 'original', videoCodec: 'auto', audioCodec: 'auto', audioBitrate: '160', speed: 'balanced', trimStart: '', trimEnd: '', rotate: '0', flip: '', mute: false, normalize: false, deinterlace: false, grayscale: false, speedFactor: '1', subtitles: 'copy' },
    audio: { bitrate: '192', sampleRate: 'original', channels: 'original', normalize: false, volume: '100', fadeIn: '0', fadeOut: '0', trimStart: '', trimEnd: '', removeSilence: false, keepCover: true, speedFactor: '1', bitDepth: '16' },
    image: { quality: 85, maxSide: 'original', width: '', height: '', rotate: '0', flip: '', grayscale: false, palette: false, pageSize: 'A4', orientation: 'auto' },
    document: { pageSize: 'A4', orientation: 'portrait', mergePdf: false },
    ebook: { title: '', author: '', pageSize: 'A4' },
    fiscal: { mergePdf: false },
    compress: { level: 'medium', targetMb: '25', zipLevel: 6, zipName: '', resolution: '' }
  };
  const DEFAULT_TARGET = { video: 'mp4', audio: 'mp3', image: 'webp', document: 'pdf', ebook: 'epub', fiscal: 'pdf', compress: 'same' };

  const state = {
    route: 'home',
    settings: {},
    info: {},
    files: { video: [], audio: [], image: [], document: [], ebook: [], fiscal: [], compress: [] },
    target: { ...DEFAULT_TARGET },
    preset: { video: 'custom', audio: 'custom', image: 'custom' },
    opts: JSON.parse(JSON.stringify(DEFAULT_OPTS)),
    jobs: [],
    tools: {},
    history: [],
    stats: {},
    settingsTab: 'general',
    plans: {},
    update: null,
    updateMsg: null
  };

  /* ------------------------------------------------------------ helpers */
  function ic(name, cls = '') {
    const svg = (window.GCP_ICONS && window.GCP_ICONS[name]) || window.GCP_ICONS['circle'];
    return cls ? svg.replace('class="lucide"', `class="lucide ${cls}"`) : svg;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function bytes(n) {
    if (!n && n !== 0) return '—';
    const u = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
    return `${n.toFixed(n < 10 && i ? 1 : 0)} ${u[i]}`;
  }
  function dur(s) {
    if (!s) return '';
    s = Math.round(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}` : `${m}:${String(x).padStart(2, '0')}`;
  }
  function fileUrl(p) {
    return 'file://' + (p.startsWith('/') ? '' : '/') + p.replace(/\\/g, '/').split('/').map((seg) => encodeURIComponent(seg).replace(/%3A/g, ':')).join('/');
  }
  function when(ts) {
    try {
      return new Intl.DateTimeFormat(I18N.lang, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(ts));
    } catch { return new Date(ts).toLocaleString(); }
  }
  function catLabel(c) { return t(`cat.${c}.t`); }

  function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.innerHTML = `${ic(kind === 'ok' ? 'circle-check' : kind === 'bad' ? 'circle-alert' : 'info')}<span>${msg}</span>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.style.transition = 'opacity .3s'; el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 3600);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
    }
    toast(t('toast.copied'), 'ok');
  }

  /** Selo de formato: "arquivo" com canto dobrado e rótulo colorido. */
  function fmtBadge(label, color, size = 34) {
    const h = Math.round(size * 1.18);
    const fs = label.length > 3 ? 7.6 : 8.6;
    return `<svg viewBox="0 0 34 40" width="${size}" height="${h}" aria-hidden="true">
      <defs><linearGradient id="fb${label}${color.slice(1)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".28"/><stop offset="1" stop-color="${color}" stop-opacity=".1"/></linearGradient></defs>
      <path d="M4 3.5A2.5 2.5 0 0 1 6.5 1H22l9 9v26.5a2.5 2.5 0 0 1-2.5 2.5h-22A2.5 2.5 0 0 1 4 36.5z" fill="url(#fb${label}${color.slice(1)})" stroke="${color}" stroke-opacity=".7" stroke-width="1.2"/>
      <path d="M22 1v6.5A2.5 2.5 0 0 0 24.5 10H31" fill="none" stroke="${color}" stroke-opacity=".7" stroke-width="1.2"/>
      <rect x="1" y="21" width="${label.length > 3 ? 32 : 28}" height="12" rx="3" fill="${color}"/>
      <text x="${label.length > 3 ? 17 : 15}" y="30" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="${fs}" fill="#0b1120">${esc(label)}</text>
    </svg>`;
  }

  /** Ilustração contextual de cada categoria. */
  function art(cat) {
    const c = CAT_COLORS[cat];
    const chips = {
      video: ['MP4', 'MKV', 'WEBM'], audio: ['MP3', 'FLAC', 'WAV'], image: ['JPG', 'PNG', 'WEBP'],
      document: ['PDF', 'DOCX', 'ODT'], ebook: ['EPUB', 'MOBI', 'FB2'], fiscal: ['NF-e', 'NFC-e', 'NFS-e'], compress: ['ZIP', 'PDF', 'MP4']
    }[cat];
    const glyph = {
      video: `<rect x="-34" y="-24" width="68" height="48" rx="9" fill="${c}" opacity=".95"/><path d="M-8-11 13 0-8 11z" fill="#0b1120"/><g fill="#0b1120" opacity=".35"><rect x="-30" y="-20" width="5" height="5" rx="1"/><rect x="-30" y="-8" width="5" height="5" rx="1"/><rect x="-30" y="4" width="5" height="5" rx="1"/><rect x="-30" y="15" width="5" height="5" rx="1"/><rect x="25" y="-20" width="5" height="5" rx="1"/><rect x="25" y="-8" width="5" height="5" rx="1"/><rect x="25" y="4" width="5" height="5" rx="1"/><rect x="25" y="15" width="5" height="5" rx="1"/></g>`,
      audio: `<g fill="${c}">${[-30, -21, -12, -3, 6, 15, 24].map((x, i) => { const hh = [16, 30, 44, 26, 40, 22, 12][i]; return `<rect x="${x}" y="${-hh / 2}" width="6" height="${hh}" rx="3"/>`; }).join('')}</g>`,
      image: `<rect x="-34" y="-26" width="68" height="52" rx="9" fill="${c}"/><circle cx="14" cy="-10" r="6" fill="#0b1120" opacity=".55"/><path d="M-34 18 -12 -4 4 12 14 4 34 22v-4 4a9 9 0 0 1-9 4h-50a9 9 0 0 1-9-9z" fill="#0b1120" opacity=".45"/>`,
      document: `<rect x="-22" y="-30" width="44" height="58" rx="6" fill="${c}" opacity=".45" transform="rotate(-8)"/><rect x="-22" y="-30" width="44" height="58" rx="6" fill="${c}"/><g fill="#0b1120" opacity=".4"><rect x="-14" y="-20" width="28" height="4" rx="2"/><rect x="-14" y="-11" width="22" height="4" rx="2"/><rect x="-14" y="-2" width="28" height="4" rx="2"/><rect x="-14" y="7" width="18" height="4" rx="2"/></g>`,
      ebook: `<path d="M0-20C-10-27-24-28-36-25v48c12-3 26-2 36 5z" fill="${c}"/><path d="M0-20C10-27 24-28 36-25v48c-12-3-26-2-36 5z" fill="${c}" opacity=".7"/><g stroke="#0b1120" stroke-opacity=".35" stroke-width="2.5" stroke-linecap="round"><path d="M-28-14h20M-28-6h20M-28 2h14"/><path d="M8-14h20M8-6h20M8 2h14"/></g>`,
      fiscal: `<path d="M-24-32h48v64l-8-6-8 6-8-6-8 6-8-6-8 6z" fill="${c}"/><g fill="#0b1120" opacity=".4"><rect x="-16" y="-22" width="32" height="4" rx="2"/><rect x="-16" y="-13" width="22" height="4" rx="2"/><rect x="-16" y="-4" width="28" height="4" rx="2"/></g><g fill="#0b1120" opacity=".55"><rect x="2" y="6" width="5" height="5"/><rect x="9" y="6" width="5" height="5"/><rect x="2" y="13" width="5" height="5"/><rect x="11" y="13" width="3" height="3"/></g>`,
      compress: `<rect x="-36" y="-22" width="34" height="44" rx="6" fill="${c}" opacity=".5"/><rect x="10" y="-11" width="22" height="28" rx="5" fill="${c}"/><path d="M-1 0h7m-4-4 4 4-4 4" stroke="${c}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
    }[cat];
    return `<svg class="art" viewBox="0 0 320 118" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="280" cy="10" r="60" fill="${c}" opacity=".10"/><circle cx="30" cy="120" r="50" fill="${c}" opacity=".08"/>
      <g opacity=".5" stroke="${c}" stroke-opacity=".25"><path d="M0 30h320M0 60h320M0 90h320" stroke-dasharray="2 6"/></g>
      <g transform="translate(160 60)">${glyph}</g>
      ${chips.map((ch, i) => { const pos = [[38, 26], [254, 82], [262, 30]][i]; return `<g transform="translate(${pos[0]} ${pos[1]}) rotate(${[-8, 6, 10][i]})"><rect x="-22" y="-11" width="44" height="22" rx="7" fill="#0b1120" fill-opacity=".55" stroke="${c}" stroke-opacity=".6"/><text x="0" y="4" text-anchor="middle" font-family="Inter,sans-serif" font-size="10" font-weight="800" fill="${c}">${ch}</text></g>`; }).join('')}
    </svg>`;
  }

  function emptyArt(c = '#4cc3f5') {
    return `<svg class="empty-art" viewBox="0 0 180 130" aria-hidden="true">
      <ellipse cx="90" cy="118" rx="62" ry="7" fill="${c}" opacity=".1"/>
      <rect x="40" y="22" width="62" height="80" rx="9" fill="${c}" opacity=".14" transform="rotate(-10 71 62)"/>
      <rect x="62" y="16" width="62" height="80" rx="9" fill="var(--panel-3)" stroke="${c}" stroke-opacity=".5"/>
      <rect x="72" y="30" width="34" height="5" rx="2.5" fill="${c}" opacity=".5"/><rect x="72" y="42" width="42" height="5" rx="2.5" fill="${c}" opacity=".3"/><rect x="72" y="54" width="28" height="5" rx="2.5" fill="${c}" opacity=".3"/>
      <circle cx="124" cy="88" r="18" fill="${c}"/><path d="M124 80v16m-8-8h16" stroke="#0b1120" stroke-width="3.5" stroke-linecap="round"/>
    </svg>`;
  }

  /* ------------------------------------------------------------ boot */
  async function boot() {
    state.info = await api.appInfo();
    state.settings = await api.getSettings();
    I18N.set(I18N.resolve(state.settings.language, state.info.systemLocales));
    applyTheme();
    state.jobs = await api.listJobs();
    state.stats = await api.stats();
    state.history = await api.history();
    api.detectTools().then((tl) => { state.tools = tl; if (['settings', 'document', 'ebook'].includes(state.route)) render(); });

    api.onJobs((jobs) => {
      const before = state.jobs;
      state.jobs = jobs;
      updateChrome();
      if (state.route === 'queue') renderQueueList();
      // atualiza estatísticas quando algo termina
      if (jobs.some((j) => j.status === 'done' && !before.find((b) => b.id === j.id && b.status === 'done'))) {
        api.stats().then((s) => (state.stats = s));
        api.history().then((h) => (state.history = h));
      }
    });
    api.onProgress((p) => {
      const j = state.jobs.find((x) => x.id === p.id);
      if (j) { j.progress = p.progress; j.speed = p.speed; }
      const bar = document.getElementById(`bar-${p.id}`);
      if (bar) bar.style.width = `${Math.round(p.progress * 100)}%`;
      const pct = document.getElementById(`pct-${p.id}`);
      if (pct) pct.textContent = `${Math.round(p.progress * 100)}%${p.speed ? ` · ${p.speed.toFixed(1)}×` : ''}`;
      updateRing();
    });
    api.onIdle((r) => {
      if (r.done) toast(t('queue.done.toast', { n: r.done }), 'ok');
      if (r.failed) toast(t('queue.fail.toast', { n: r.failed }), 'bad');
    });
    api.onFilesOpened((paths) => addPaths(paths));
    api.onUpdate((u) => { state.update = u; showUpdateModal(u); });
    api.onThemeChanged(() => applyTheme());

    $('#heartBtn').addEventListener('click', showSupport);
    $('#themeBtn').addEventListener('click', toggleTheme);
    $('#queueBtn').addEventListener('click', () => go('queue'));
    $('#omnibox').addEventListener('click', (e) => { if (!e.target.closest('#omniAdd')) pickFiles(); });
    $('#omniAdd').addEventListener('click', pickFiles);
    setupDragDrop();
    setupDelegation();
    go('home');
  }

  async function applyTheme() {
    let theme = state.settings.theme || 'dark';
    if (theme === 'system') theme = (await api.isDark()) ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
  }
  async function toggleTheme() {
    const cur = document.documentElement.dataset.theme;
    await saveSettings({ theme: cur === 'dark' ? 'light' : 'dark' });
    applyTheme();
    if (state.route === 'settings') render();
  }
  async function saveSettings(patch) {
    state.settings = await api.setSettings(patch);
    return state.settings;
  }

  /* ------------------------------------------------------------ chrome */
  function renderChrome() {
    $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$('[data-icon]').forEach((el) => (el.innerHTML = ic(el.dataset.icon)));
    $('#themeBtn').title = t('top.theme');
    $('#heartBtn').title = t('top.support');
    $('#queueBtn').title = t('nav.queue');
    $('#versionText').textContent = t('footer.version', { v: state.info.version });
    const navItem = (id, icon, label, extra = '') => `<div class="nav-item ${state.route === id ? 'active' : ''}" data-action="go" data-route="${id}"><span class="nav-ic" ${CAT_COLORS[id] ? `style="color:${CAT_COLORS[id]}"` : ''}>${ic(icon)}</span><span>${label}</span>${extra}</div>`;
    const cnt = (c) => (state.files[c].length ? `<span class="count">${state.files[c].length}</span>` : '');
    const active = state.jobs.filter((j) => ['queued', 'running'].includes(j.status)).length;
    $('#nav').innerHTML = [
      navItem('home', 'house', t('nav.home')),
      `<div class="nav-section">${t('nav.section.convert')}</div>`,
      ...['video', 'audio', 'image', 'document', 'ebook'].map((c) => navItem(c, F.CATEGORIES[c].icon, t(`nav.${c}`), cnt(c))),
      `<div class="nav-section">${t('nav.section.tools')}</div>`,
      navItem('fiscal', 'receipt-text', t('nav.fiscal'), cnt('fiscal')),
      navItem('compress', 'minimize-2', t('nav.compress'), cnt('compress')),
      navItem('queue', 'list-video', t('nav.queue'), active ? `<span class="count">${active}</span>` : ''),
      navItem('history', 'history', t('nav.history')),
      navItem('settings', 'settings', t('nav.settings'))
    ].join('');
    updateChrome();
  }
  function updateChrome() {
    const active = state.jobs.filter((j) => ['queued', 'running'].includes(j.status));
    const pill = $('#statusPill');
    pill.classList.toggle('busy', active.length > 0);
    $('#statusText').textContent = active.length ? t('status.working', { n: active.length }) : t('status.ready');
    const badge = $('#queueBadge');
    badge.textContent = active.length;
    badge.classList.toggle('hidden', !active.length);
    const navQ = $('.nav-item[data-route="queue"]');
    if (navQ) {
      const c = navQ.querySelector('.count');
      if (active.length) { if (c) c.textContent = active.length; else navQ.insertAdjacentHTML('beforeend', `<span class="count">${active.length}</span>`); }
      else if (c) c.remove();
    }
    updateRing();
  }
  function updateRing() {
    const active = state.jobs.filter((j) => ['queued', 'running'].includes(j.status));
    const ring = $('#queueRing');
    if (!active.length) { ring.style.background = 'none'; return; }
    const p = active.reduce((a, j) => a + (j.progress || 0), 0) / active.length;
    ring.style.background = `conic-gradient(var(--accent) ${p * 360}deg, transparent 0)`;
    ring.style.webkitMask = 'radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))';
  }

  function go(route) {
    if (!ROUTES.includes(route)) route = 'home';
    state.route = route;
    render();
    $('#view').scrollTop = 0;
  }

  function render() {
    renderChrome();
    const v = $('#view');
    const r = state.route;
    if (r === 'home') v.innerHTML = viewHome();
    else if (r === 'queue') { v.innerHTML = viewQueue(); renderQueueList(); }
    else if (r === 'history') v.innerHTML = viewHistory();
    else if (r === 'settings') { v.innerHTML = viewSettings(); afterSettings(); }
    else { v.innerHTML = viewTool(r); afterTool(r); }
  }

  /* ------------------------------------------------------------ home */
  function viewHome() {
    const totalFormats = new Set(F.CATEGORY_ORDER.flatMap((c) => F.CATEGORIES[c].inputs.concat(F.CATEGORIES[c].targets.map((x) => x.id)))).size;
    const st = state.stats || {};
    const statCard = (icon, color, value, label) => `<div class="stat"><div class="stat-ic" style="background:${color}22;color:${color}">${ic(icon)}</div><b>${value}</b><span>${label}</span></div>`;
    const recent = (state.history || []).slice(0, 4);
    return `
      <div class="hero">
        <div class="hero-text">
          <div class="eyebrow">${ic('sparkles')} GCP Converter</div>
          <h1>${esc(t('home.hello')).replace(/(\S+\?)$/, '<span class="grad">$1</span>')}</h1>
          <p>${t('home.sub')}</p>
          <div class="dropzone" data-action="pick" id="homeDrop">
            ${dropArt()}
            <div>
              <h3>${t('home.drop.title')}</h3>
              <p>${t('home.drop.sub', { n: totalFormats })}</p>
              <div class="dz-actions">
                <button class="btn btn-primary" data-action="pick">${ic('file-plus')} ${t('home.drop.browse')}</button>
                <button class="btn" data-action="pick-folder">${ic('folder-open')} ${t('home.drop.folder')}</button>
              </div>
            </div>
          </div>
        </div>
        <div class="stats">
          ${statCard('circle-check-big', '#34d399', (st.converted || 0).toLocaleString(I18N.lang), t('home.stats.converted'))}
          ${statCard('hard-drive-download', '#4cc3f5', bytes(st.saved || 0), t('home.stats.saved'))}
          ${statCard('layers', '#a78bfa', `${totalFormats}+`, t('home.stats.formats'))}
          ${statCard('shield-check', '#f472b6', '100%', t('home.stats.offline'))}
        </div>
      </div>
      <div class="section-head"><h2>${t('home.categories')}</h2></div>
      <div class="cat-grid">
        ${F.CATEGORY_ORDER.map((c) => `
          <div class="cat-card" style="--c:${CAT_COLORS[c]}" data-action="go" data-route="${c}">
            <div class="cat-art">${art(c)}</div>
            <div class="cat-body">
              <div class="cat-title"><span class="chip-ic">${ic(F.CATEGORIES[c].icon)}</span>${catLabel(c)}</div>
              <div class="cat-desc">${t(`cat.${c}.d`)}</div>
            </div>
          </div>`).join('')}
      </div>
      <div class="section-head"><h2>${t('home.features')}</h2></div>
      <div class="features">
        ${[['layers', '#4cc3f5', 'batch'], ['shield-check', '#34d399', 'private'], ['wand-sparkles', '#a78bfa', 'presets'], ['minimize-2', '#f472b6', 'compress']].map(([i, c, k]) => `
          <div class="feature"><div class="f-ic" style="background:${c}1f;color:${c}">${ic(i)}</div><b>${t(`feat.${k}.t`)}</b><p>${t(`feat.${k}.d`)}</p></div>`).join('')}
      </div>
      <div class="section-head"><h2>${t('home.recent')}</h2>${recent.length ? `<button class="btn btn-ghost btn-sm" data-action="go" data-route="history">${t('home.seeAll')} ${ic('arrow-right')}</button>` : ''}</div>
      ${recent.length ? recent.map(historyRow).join('') : `<div class="card empty">${emptyArt()}<span>${t('home.recent.empty')}</span></div>`}
    `;
  }

  function dropArt() {
    return `<svg class="dropzone-art" viewBox="0 0 132 112" aria-hidden="true">
      <defs><linearGradient id="dzg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ec4899"/></linearGradient></defs>
      <rect x="10" y="22" width="46" height="58" rx="8" fill="#a78bfa" opacity=".25" transform="rotate(-12 33 51)"/>
      <rect x="76" y="22" width="46" height="58" rx="8" fill="#22d3ee" opacity=".25" transform="rotate(12 99 51)"/>
      <rect x="40" y="12" width="52" height="66" rx="10" fill="url(#dzg)"/>
      <path d="M66 30v26m-11-11 11 11 11-11" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="52" y="62" width="28" height="5" rx="2.5" fill="#fff" opacity=".7"/>
      <ellipse cx="66" cy="100" rx="40" ry="5" fill="#4cc3f5" opacity=".15"/>
    </svg>`;
  }

  /* ------------------------------------------------------------ tool pages */
  function accepts(cat, ext) {
    return F.CATEGORIES[cat].inputs.includes(ext);
  }

  function viewTool(cat) {
    const C = F.CATEGORIES[cat];
    const color = CAT_COLORS[cat];
    const files = state.files[cat];
    const valid = files.filter((f) => accepts(cat, f.ext));
    const total = files.reduce((a, f) => a + (f.size || 0), 0);
    const target = state.target[cat];
    const tDef = C.targets.find((x) => x.id === target) || C.targets[0];
    let btnLabel = t('page.convert', { n: valid.length });
    if (cat === 'compress') btnLabel = target === 'zip' ? t('page.convertZip', { n: valid.length }) : t('page.compressBtn', { n: valid.length });
    if ((cat === 'document' || cat === 'fiscal') && target === 'pdf' && state.opts[cat].mergePdf && valid.length > 1) btnLabel = t('opt.mergePdf');
    const acceptList = cat === 'compress' ? 'MP4, MOV, MKV, MP3, WAV, JPG, PNG, PDF, DOCX…' : C.inputs.slice(0, 14).map((e) => e.toUpperCase()).join(', ') + (C.inputs.length > 14 ? '…' : '');
    return `
      <div class="page-head" style="--c:${color}">
        <div class="ph-ic">${ic(C.icon)}</div>
        <div><h1>${catLabel(cat)}</h1><p>${t(`cat.${cat}.d`)}</p></div>
      </div>
      <div class="tool">
        <div class="card">
          <div class="card-head">
            <div class="card-title">${ic('files')} ${t('page.files')} ${files.length ? `<span style="text-transform:none;letter-spacing:0;font-weight:500;color:var(--text-3)">· ${t('page.files.count', { n: files.length, size: bytes(total) })}</span>` : ''}</div>
            ${files.length ? `<button class="btn btn-ghost btn-sm" data-action="clear-files">${ic('trash-2')} ${t('page.clear')}</button>` : ''}
          </div>
          <div class="mini-drop" data-action="pick" id="pageDrop">
            <div class="md-ic">${ic('upload')}</div>
            <div><b>${t('page.drop')}</b><small>${t('page.drop.accept', { list: acceptList })}</small></div>
          </div>
          <div class="file-list" id="fileList">
            ${files.length ? files.map((f, i) => fileRow(cat, f, i, tDef)).join('') : `<div class="empty">${emptyArt(color)}<b>${t('page.empty.title')}</b><span>${t('page.empty.sub')}</span></div>`}
          </div>
        </div>
        <div class="side">
          ${cat === 'compress' ? compressPanel() : `
          <div class="card">
            <div class="card-head"><div class="card-title">${ic('file-output')} ${t('page.output')}</div></div>
            <div class="fmt-grid">
              ${C.targets.map((x) => `<div class="fmt ${x.id === target ? 'active' : ''}" data-action="target" data-id="${x.id}" title="${esc(x.tag)}">
                <div class="fmt-badge">${fmtBadge(x.label, color)}</div>
                <div class="fmt-label">${x.label}</div><div class="fmt-tag">${esc(x.tag)}</div>
                <span class="lock" id="lock-${x.id}"></span></div>`).join('')}
            </div>
            <div class="fmt-hint">${ic('info')} <span><b>${tDef.label}</b> · ${t(`hint.${tDef.hint}`)}</span></div>
          </div>
          ${presetsPanel(cat)}
          <div class="card">
            <div class="card-head"><div class="card-title">${ic('sliders-horizontal')} ${t('page.settings')}</div></div>
            ${optionsPanel(cat)}
          </div>`}
          <div class="card convert-bar">
            <div class="card-title">${ic('folder-output')} ${t('page.destination')}</div>
            <div class="seg" data-seg="outputMode">
              <button class="${state.settings.outputMode !== 'custom' ? 'on' : ''}" data-action="dest" data-v="source">${ic('folder-sync')} ${t('page.dest.source')}</button>
              <button class="${state.settings.outputMode === 'custom' ? 'on' : ''}" data-action="dest" data-v="custom">${ic('folder-cog')} ${t('page.dest.custom')}</button>
            </div>
            ${state.settings.outputMode === 'custom' ? `<div class="dest"><span class="path" title="${esc(state.settings.outputDir)}">${esc(state.settings.outputDir || '—')}</span><button class="btn btn-sm" data-action="choose-dir">${ic('folder-open')} ${t('page.dest.choose')}</button></div>` : ''}
            <button class="btn btn-primary btn-lg" data-action="convert" ${valid.length ? '' : 'disabled'}>${ic(cat === 'compress' ? 'minimize-2' : 'refresh-cw')} ${btnLabel}</button>
          </div>
        </div>
      </div>`;
  }

  function fileRow(cat, f, i, tDef) {
    const ok = accepts(cat, f.ext);
    const fcat = F.detectCategory(f.ext) || cat;
    const color = CAT_COLORS[fcat] || CAT_COLORS[cat];
    const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'avif', 'svg', 'ico', 'jfif'].includes(f.ext);
    const thumb = f.thumb ? `<img src="${f.thumb}" alt="">` : isImg ? `<img src="${fileUrl(f.path)}" alt="" loading="lazy" onerror="this.remove()">` : ic(F.CATEGORIES[fcat] ? F.CATEGORIES[fcat].icon : 'file');
    const meta = [bytes(f.size)];
    if (f.info) {
      if (f.info.duration) meta.push(dur(f.info.duration));
      if (f.info.width && f.info.hasVideo) meta.push(`${f.info.width}×${f.info.height}`);
      if (f.info.videoCodec && f.info.hasVideo) meta.push(f.info.videoCodec.toUpperCase());
      else if (f.info.audioCodec) meta.push(`${f.info.audioCodec.toUpperCase()}${f.info.sampleRate ? ' · ' + (f.info.sampleRate / 1000).toFixed(1) + ' kHz' : ''}`);
    }
    let toLabel = tDef ? tDef.label : '';
    if (cat === 'compress') toLabel = state.target.compress === 'zip' ? 'ZIP' : f.ext.toUpperCase();
    const plan = state.plans[`${f.ext}>${tDef && tDef.ext}`];
    let warn = '';
    if (!ok) warn = `<span class="warn">${ic('circle-alert', 'xs')} ${t('page.unsupported')}</span>`;
    else if (plan && plan.missing && plan.missing.length) warn = `<span class="need">${t('page.needs', { tool: plan.missing.map(engineName).join(' / ') })}</span>`;
    else if (plan && !plan.engine && !plan.missing) warn = `<span class="warn">${t('err.unsupported')}</span>`;
    return `<div class="file-row ${ok ? '' : 'bad'}" style="--c:${color}">
      <div class="thumb">${thumb}<span class="ext">${esc(f.ext.toUpperCase() || '?')}</span></div>
      <div style="min-width:0"><div class="file-name" title="${esc(f.path)}">${esc(f.name)}</div><div class="file-meta">${meta.map((m) => `<span>${esc(m)}</span>`).join('')}${warn}</div></div>
      <div class="arrow-fmt"><span>${esc(f.ext.toUpperCase())}</span>${ic('arrow-right')}<span class="to">${esc(toLabel)}</span></div>
      <button class="btn btn-ghost btn-sm" data-action="remove-file" data-i="${i}" title="${t('page.remove')}">${ic('x')}</button>
    </div>`;
  }
  function engineName(id) {
    return { libreoffice: 'LibreOffice', calibre: 'Calibre', ghostscript: 'Ghostscript', office: 'Microsoft Office / LibreOffice' }[id] || id;
  }

  function presetsPanel(cat) {
    const list = cat === 'video' ? F.VIDEO_PRESETS : cat === 'audio' ? F.AUDIO_PRESETS : cat === 'image' ? F.IMAGE_PRESETS : null;
    if (!list) return '';
    const pcolors = { youtube: '#ef4444', instagram: '#e1306c', tiktok: '#22d3ee', whatsapp: '#25d366', email: '#60a5fa', '4k': '#a78bfa', web: '#4cc3f5', podcast: '#f59e0b', music: '#a78bfa', audiophile: '#fbbf24', ringtone: '#f472b6', studio: '#22d3ee', social: '#e1306c', thumbnail: '#60a5fa', print: '#94a3b8', icon: '#a78bfa', ultra: '#34d399', custom: '#94a3b8' };
    const sub = (p) => (p.target ? (F.findTarget(cat, p.target) || {}).label + (p.opts.resolution && p.opts.resolution !== 'original' ? ` · ${p.opts.resolution.includes('x') ? p.opts.resolution.replace('x', '×') : p.opts.resolution + 'p'}` : p.opts.bitrate ? ` · ${p.opts.bitrate}k` : p.opts.maxSide && p.opts.maxSide !== 'original' ? ` · ${p.opts.maxSide}px` : '') : '—');
    return `<div class="card">
      <div class="card-head"><div class="card-title">${ic('wand-sparkles')} ${t('page.presets')}</div></div>
      <div class="presets">
        ${list.map((p) => `<div class="preset ${state.preset[cat] === p.id ? 'active' : ''}" data-action="preset" data-id="${p.id}">
          <span class="p-ic" style="background:${pcolors[p.id]}22;color:${pcolors[p.id]}">${ic(p.icon)}</span>
          <span>${t(`preset.${p.id}`)}<small>${esc(sub(p))}</small></span></div>`).join('')}
      </div>
    </div>`;
  }

  /* --- controles --- */
  function sel(key, options, cat, value) {
    const v = value !== undefined ? value : state.opts[cat][key];
    return `<select class="select" data-opt="${key}">${options.map(([val, label]) => `<option value="${esc(val)}" ${String(v) === String(val) ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select>`;
  }
  function seg(key, options, cat) {
    const v = state.opts[cat][key];
    return `<div class="seg">${options.map(([val, label, icon]) => `<button class="${String(v) === String(val) ? 'on' : ''}" data-action="seg" data-key="${key}" data-v="${esc(val)}">${icon ? ic(icon) : ''}${esc(label)}</button>`).join('')}</div>`;
  }
  function sw(key, label, icon, cat) {
    return `<label class="opt-inline"><span class="oi-text">${ic(icon)}${label}</span><span class="switch"><input type="checkbox" data-opt="${key}" ${state.opts[cat][key] ? 'checked' : ''}><span></span></span></label>`;
  }
  function inp(key, placeholder, cat, type = 'text') {
    return `<input class="input" type="${type}" data-opt="${key}" value="${esc(state.opts[cat][key])}" placeholder="${esc(placeholder)}">`;
  }
  function opt(label, control, icon) {
    return `<div class="opt"><span class="opt-label"><span style="display:flex;gap:8px;align-items:center">${icon ? ic(icon) : ''}${label}</span></span>${control}</div>`;
  }
  const O = () => t('opt.original');

  function optionsPanel(cat) {
    const target = state.target[cat];
    if (cat === 'video') {
      const anim = target === 'gif' || target === 'webp-anim';
      return `<div class="opts">
        ${opt(t('opt.quality'), seg('quality', [['high', t('opt.q.high'), 'gem'], ['balanced', t('opt.q.balanced'), 'scale'], ['small', t('opt.q.small'), 'feather']], cat), '')}
        <div class="opt-row">
          ${opt(t('opt.resolution'), sel('resolution', [['original', O()], ['2160', '4K · 2160p'], ['1440', '2K · 1440p'], ['1080', 'Full HD · 1080p'], ['720', 'HD · 720p'], ['480', 'SD · 480p'], ['360', '360p'], ['1080x1920', 'Vertical 1080×1920'], ['1080x1080', 'Quadrado 1080×1080']], cat))}
          ${opt(t('opt.fps'), sel('fps', [['original', O()], ['60', '60'], ['50', '50'], ['30', '30'], ['25', '25'], ['24', '24'], ['15', '15'], ['12', '12']], cat))}
        </div>
        ${anim ? '' : `<div class="opt-row">
          ${opt(t('opt.videoCodec'), sel('videoCodec', [['auto', t('opt.auto')], ['h264', 'H.264 / AVC'], ['h265', 'H.265 / HEVC'], ['vp9', 'VP9'], ['av1', 'AV1'], ['copy', t('opt.copy')]], cat))}
          ${opt(t('opt.audioCodec'), sel('audioCodec', [['auto', t('opt.auto')], ['aac', 'AAC'], ['mp3', 'MP3'], ['opus', 'Opus'], ['copy', t('opt.copy')], ['none', t('opt.none')]], cat))}
        </div>`}
        <div class="opt-row">
          ${opt(t('opt.trimStart'), inp('trimStart', t('opt.trimHint'), cat), 'scissors')}
          ${opt(t('opt.trimEnd'), inp('trimEnd', t('opt.trimHint'), cat))}
        </div>
        <details class="adv"><summary>${t('page.advanced')} ${ic('chevron-down')}</summary><div class="opts">
          ${anim ? '' : opt(t('opt.speed'), seg('speed', [['fast', t('opt.speed.fast')], ['balanced', t('opt.speed.balanced')], ['quality', t('opt.speed.quality')]], cat))}
          <div class="opt-row">
            ${anim ? '' : opt(t('opt.audioBitrate'), sel('audioBitrate', [['64', '64 kbps'], ['96', '96 kbps'], ['128', '128 kbps'], ['160', '160 kbps'], ['192', '192 kbps'], ['256', '256 kbps'], ['320', '320 kbps']], cat))}
            ${opt(t('opt.playback'), sel('speedFactor', [['0.5', '0.5×'], ['0.75', '0.75×'], ['1', '1×'], ['1.25', '1.25×'], ['1.5', '1.5×'], ['2', '2×']], cat))}
          </div>
          <div class="opt-row">
            ${opt(t('opt.rotate'), sel('rotate', [['0', '0°'], ['90', '90°'], ['180', '180°'], ['270', '270°']], cat))}
            ${opt(t('opt.flip'), sel('flip', [['', '—'], ['h', t('opt.flipH')], ['v', t('opt.flipV')]], cat))}
          </div>
          ${anim ? '' : sw('mute', t('opt.mute'), 'volume-x', cat)}
          ${anim ? '' : sw('normalize', t('opt.normalize'), 'audio-waveform', cat)}
          ${sw('deinterlace', t('opt.deinterlace'), 'rows-3', cat)}
          ${sw('grayscale', t('opt.grayscale'), 'contrast', cat)}
        </div></details>
      </div>`;
    }
    if (cat === 'audio') {
      const lossless = ['flac', 'wav', 'aiff', 'alac'].includes(target);
      const fixed = ['amr'].includes(target);
      return `<div class="opts">
        ${lossless || fixed ? '' : opt(t('opt.bitrate'), sel('bitrate', [['64', '64 kbps · voz'], ['96', '96 kbps'], ['128', '128 kbps · padrão'], ['160', '160 kbps'], ['192', '192 kbps · alta'], ['256', '256 kbps'], ['320', '320 kbps · máxima']], cat), 'gauge')}
        ${fixed ? '' : `<div class="opt-row">
          ${opt(t('opt.sampleRate'), sel('sampleRate', [['original', O()], ['22050', '22.05 kHz'], ['32000', '32 kHz'], ['44100', '44.1 kHz'], ['48000', '48 kHz'], ['96000', '96 kHz']], cat))}
          ${opt(t('opt.channels'), sel('channels', [['original', O()], ['1', t('opt.mono')], ['2', t('opt.stereo')], ['6', '5.1']], cat))}
        </div>`}
        ${['wav', 'aiff'].includes(target) ? opt(t('opt.bitDepth'), seg('bitDepth', [['16', '16-bit'], ['24', '24-bit']], cat)) : ''}
        ${sw('normalize', t('opt.normalize'), 'audio-waveform', cat)}
        <div class="opt-row">
          ${opt(t('opt.trimStart'), inp('trimStart', t('opt.trimHint'), cat), 'scissors')}
          ${opt(t('opt.trimEnd'), inp('trimEnd', t('opt.trimHint'), cat))}
        </div>
        <details class="adv"><summary>${t('page.advanced')} ${ic('chevron-down')}</summary><div class="opts">
          ${opt(`${t('opt.volume')} <b id="volVal">${state.opts.audio.volume}%</b>`, `<input type="range" min="10" max="300" step="5" data-opt="volume" value="${state.opts.audio.volume}" style="--p:${((state.opts.audio.volume - 10) / 290) * 100}%">`, 'volume-2')}
          <div class="opt-row">
            ${opt(t('opt.fadeIn'), inp('fadeIn', '0', cat, 'number'))}
            ${opt(t('opt.fadeOut'), inp('fadeOut', '0', cat, 'number'))}
          </div>
          ${opt(t('opt.playback'), sel('speedFactor', [['0.5', '0.5×'], ['0.75', '0.75×'], ['1', '1×'], ['1.25', '1.25×'], ['1.5', '1.5×'], ['2', '2×']], cat))}
          ${sw('removeSilence', t('opt.removeSilence'), 'scissors-line-dashed', cat)}
          ${sw('keepCover', t('opt.keepCover'), 'disc-3', cat)}
        </div></details>
      </div>`;
    }
    if (cat === 'image') {
      const q = state.opts.image.quality;
      const lossy = ['jpg', 'webp', 'avif'].includes(target);
      if (target === 'pdf') return docPageOpts('image', true);
      return `<div class="opts">
        ${lossy ? opt(`${t('opt.imgQuality')} <b id="qVal">${q}</b>`, `<input type="range" min="10" max="100" data-opt="quality" value="${q}" style="--p:${((q - 10) / 90) * 100}%">`, 'gem') : ''}
        ${target === 'ico' ? '' : opt(t('opt.maxSide'), sel('maxSide', [['original', O()], ['3840', '3840 px · 4K'], ['2560', '2560 px'], ['1920', '1920 px · Full HD'], ['1280', '1280 px'], ['1080', '1080 px'], ['800', '800 px'], ['480', '480 px'], ['256', '256 px']], cat), 'scaling')}
        <div class="opt-row">
          ${opt(t('opt.width'), inp('width', 'auto', cat, 'number'))}
          ${opt(t('opt.height'), inp('height', 'auto', cat, 'number'))}
        </div>
        <details class="adv"><summary>${t('page.advanced')} ${ic('chevron-down')}</summary><div class="opts">
          <div class="opt-row">
            ${opt(t('opt.rotate'), sel('rotate', [['0', '0°'], ['90', '90°'], ['180', '180°'], ['270', '270°']], cat))}
            ${opt(t('opt.flip'), sel('flip', [['', '—'], ['h', t('opt.flipH')], ['v', t('opt.flipV')]], cat))}
          </div>
          ${sw('grayscale', t('opt.grayscale'), 'contrast', cat)}
          ${target === 'png' ? sw('palette', t('opt.palette'), 'palette', cat) : ''}
        </div></details>
      </div>`;
    }
    if (cat === 'document') {
      return `<div class="opts">
        ${target === 'pdf' ? docPageOpts('document') + sw('mergePdf', t('opt.mergePdf'), 'combine', cat) : `<div class="fmt-hint">${ic('info')}<span>${t('hint.' + (F.findTarget('document', target) || {}).hint)}</span></div>`}
      </div>`;
    }
    if (cat === 'fiscal') {
      return `<div class="opts">
        <div class="fmt-hint">${ic('badge-check')}<span>${t('fiscal.types')}</span></div>
        ${sw('mergePdf', t('opt.mergePdf'), 'combine', cat)}
      </div>`;
    }
    if (cat === 'ebook') {
      return `<div class="opts">
        ${opt(t('opt.title'), inp('title', t('opt.ebookHint'), cat), 'heading')}
        ${opt(t('opt.author'), inp('author', t('opt.ebookHint'), cat), 'user-pen')}
        ${target === 'pdf' ? docPageOpts('ebook') : ''}
      </div>`;
    }
    return '';
  }

  function docPageOpts(cat, image) {
    return `<div class="opt-row">
      ${opt(t('opt.pageSize'), sel('pageSize', [['A4', 'A4'], ['Letter', 'Letter / Carta'], ['A3', 'A3'], ['A5', 'A5'], ['Legal', 'Legal / Ofício']].concat(image ? [['fit', t('opt.fit')]] : []), cat), 'file')}
      ${cat === 'ebook' ? '' : opt(t('opt.orientation'), sel('orientation', (image ? [['auto', t('opt.auto')]] : []).concat([['portrait', t('opt.portrait')], ['landscape', t('opt.landscape')]]), cat))}
    </div>`;
  }

  function compressPanel() {
    const o = state.opts.compress;
    const target = state.target.compress;
    const level = (id, icon, bars) => `<div class="level ${o.level === id ? 'active' : ''}" data-action="seg" data-key="level" data-v="${id}">
      <b>${ic(icon)} ${t(`opt.level.${id}`)}</b><small>${t(`opt.level.${id}.d`)}</small>
      <div class="meter">${[1, 2, 3, 4].map((n) => `<i class="${n <= bars ? 'on' : ''}"></i>`).join('')}</div></div>`;
    return `<div class="card">
      <div class="card-head"><div class="card-title">${ic('file-output')} ${t('page.output')}</div></div>
      <div class="fmt-grid" style="grid-template-columns:1fr 1fr">
        ${F.CATEGORIES.compress.targets.map((x) => `<div class="fmt ${x.id === target ? 'active' : ''}" data-action="target" data-id="${x.id}">
          <div class="fmt-badge">${fmtBadge(x.label, CAT_COLORS.compress)}</div><div class="fmt-label">${x.id === 'same' ? t('hint.auto') : 'ZIP'}</div><div class="fmt-tag">${t(`hint.${x.hint}`)}</div></div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div class="card-head"><div class="card-title">${ic('gauge')} ${t('opt.level')}</div></div>
      ${target === 'zip' ? `<div class="opts">
        ${opt(t('opt.zipName'), inp('zipName', `GCP-Converter-${new Date().toISOString().slice(0, 10)}`, 'compress'), 'file-archive')}
        ${opt(t('opt.zipLevel'), sel('zipLevel', [['0', '0 · ' + t('opt.speed.fast')], ['3', '3'], ['6', '6 · ' + t('opt.level.medium')], ['9', '9 · ' + t('opt.level.strong')]], 'compress'))}
      </div>` : `<div class="levels">
        ${level('light', 'feather', 1)}${level('medium', 'scale', 2)}${level('strong', 'zap', 4)}${level('target', 'target', 3)}
      </div>
      ${o.level === 'target' ? `<div class="opts" style="margin-top:14px">${opt(t('opt.targetMb'), inp('targetMb', '25', 'compress', 'number'), 'target')}</div>` : ''}
      <div class="fmt-hint" style="margin-top:14px">${ic('info')}<span>MP4/MOV/MKV · MP3/M4A · JPG/PNG/WEBP · PDF${state.tools.ghostscript && !state.tools.ghostscript.available ? ' (Ghostscript ↑)' : ''}</span></div>`}
    </div>`;
  }

  async function afterTool(cat) {
    const files = state.files[cat];
    // Probe e miniaturas (sequencial, sem travar a UI)
    for (const f of files) {
      if (state.route !== cat) return;
      const fc = F.detectCategory(f.ext);
      if (!f.info && (fc === 'video' || fc === 'audio')) {
        f.info = await api.probe(f.path).catch(() => ({}));
        if (!f.thumb && fc === 'video') f.thumb = await api.thumbnail(f.path).catch(() => null);
        refreshFileList(cat);
      }
    }
    if (cat === 'document' || cat === 'ebook') computePlans(cat);
  }

  async function computePlans(cat) {
    const exts = [...new Set(state.files[cat].map((f) => f.ext))].filter((e) => accepts(cat, e));
    const targets = F.CATEGORIES[cat].targets;
    const pairs = [];
    exts.forEach((e) => targets.forEach((x) => { if (!state.plans[`${e}>${x.ext}`]) pairs.push([e, x.ext]); }));
    const res = pairs.length ? await api.docPlanMany(pairs, cat) : [];
    pairs.forEach((p, i) => (state.plans[`${p[0]}>${p[1]}`] = res[i]));
    if (state.route !== cat) return;
    targets.forEach((x) => {
      const lock = document.getElementById(`lock-${x.id}`);
      if (!lock) return;
      const blocked = exts.some((e) => { const p = state.plans[`${e}>${x.ext}`]; return p && !p.engine; });
      lock.innerHTML = blocked && exts.length ? ic('lock') : '';
      lock.parentElement.title = blocked ? t('page.needs', { tool: [...new Set(exts.flatMap((e) => (state.plans[`${e}>${x.ext}`] || {}).missing || []))].map(engineName).join(' / ') || '—' }) : x.tag;
    });
    refreshFileList(cat);
  }

  function refreshFileList(cat) {
    const el = $('#fileList');
    if (!el || state.route !== cat) return;
    const tDef = F.CATEGORIES[cat].targets.find((x) => x.id === state.target[cat]);
    if (state.files[cat].length) el.innerHTML = state.files[cat].map((f, i) => fileRow(cat, f, i, tDef)).join('');
  }

  /* ------------------------------------------------------------ files */
  async function pickFiles() {
    const cat = F.CATEGORIES[state.route] ? state.route : null;
    const exts = cat && cat !== 'compress' ? F.CATEGORIES[cat].inputs : null;
    const paths = await api.openFiles({ extensions: exts, filterName: cat ? catLabel(cat) : undefined });
    if (paths.length) addPaths(paths, cat);
  }
  async function pickFolder() {
    const dir = await api.openFolder({});
    if (dir) addPaths([dir], F.CATEGORIES[state.route] ? state.route : null);
  }

  async function addPaths(paths, forceCat) {
    const entries = await api.expand(paths);
    if (!entries.length) return;
    const cat = forceCat || (F.CATEGORIES[state.route] ? state.route : null);
    let rest = entries;
    if (cat) {
      const list = state.files[cat];
      const known = new Set(list.map((f) => f.path));
      const fit = entries.filter((e) => accepts(cat, e.ext));
      const add = fit.filter((e) => !known.has(e.path));
      list.push(...add);
      rest = entries.filter((e) => !accepts(cat, e.ext));
      if (fit.length) {
        if (add.length) toast(t('toast.added', { n: add.length, cat: catLabel(cat) }), 'ok');
        if (!rest.length) { if (state.route !== cat) go(cat); else render(); return; }
      }
    }
    // Distribuição automática por tipo
    const counts = {};
    let unknown = 0;
    for (const e of rest) {
      const c = e.ext === 'pdf' ? 'document' : F.detectCategory(e.ext);
      if (!c) { unknown++; continue; }
      if (!state.files[c].some((f) => f.path === e.path)) state.files[c].push(e);
      counts[c] = (counts[c] || 0) + 1;
    }
    const cats = Object.keys(counts);
    if (unknown) toast(t('toast.unknown', { n: unknown }), 'bad');
    if (!cats.length) return;
    if (cats.length === 1) toast(t('toast.added', { n: counts[cats[0]], cat: catLabel(cats[0]) }), 'ok');
    else toast(t('toast.addedMulti', { n: rest.length - unknown }), 'ok');
    const top = cats.sort((a, b) => counts[b] - counts[a])[0];
    if (cat && rest.length !== entries.length) render();
    else go(top);
  }

  function setupDragDrop() {
    let depth = 0;
    const overlay = $('#dropOverlay');
    window.addEventListener('dragenter', (e) => { if ([...(e.dataTransfer.types || [])].includes('Files')) { depth++; overlay.classList.add('show'); } });
    window.addEventListener('dragleave', () => { depth = Math.max(0, depth - 1); if (!depth) overlay.classList.remove('show'); });
    window.addEventListener('dragover', (e) => e.preventDefault());
    window.addEventListener('drop', (e) => {
      e.preventDefault();
      depth = 0;
      overlay.classList.remove('show');
      const paths = [...e.dataTransfer.files].map((f) => api.pathForFile(f)).filter(Boolean);
      if (paths.length) addPaths(paths);
    });
  }

  /* ------------------------------------------------------------ actions */
  function setupDelegation() {
    document.addEventListener('click', async (e) => {
      const el = e.target.closest('[data-action]');
      if (!el) return;
      const a = el.dataset.action;
      const cat = state.route;
      if (a !== 'pick' || el.tagName === 'BUTTON' || el.classList.contains('dropzone') || el.classList.contains('mini-drop')) e.stopPropagation();
      switch (a) {
        case 'go': go(el.dataset.route); break;
        case 'pick': pickFiles(); break;
        case 'pick-folder': pickFolder(); break;
        case 'clear-files': state.files[cat] = []; render(); break;
        case 'remove-file': state.files[cat].splice(+el.dataset.i, 1); render(); break;
        case 'target':
          state.target[cat] = el.dataset.id;
          if (state.preset[cat]) state.preset[cat] = 'custom';
          render();
          break;
        case 'preset': applyPreset(cat, el.dataset.id); break;
        case 'seg': state.opts[cat][el.dataset.key] = el.dataset.v; render(); break;
        case 'dest':
          if (el.dataset.v === 'custom' && !state.settings.outputDir) {
            const d = await api.openFolder({});
            if (!d) return;
            await saveSettings({ outputMode: 'custom', outputDir: d });
          } else await saveSettings({ outputMode: el.dataset.v });
          render();
          break;
        case 'choose-dir': {
          const d = await api.openFolder({});
          if (d) { await saveSettings({ outputDir: d, outputMode: 'custom' }); render(); }
          break;
        }
        case 'convert': convert(cat); break;
        case 'q-open': api.open(el.dataset.p); break;
        case 'q-show': api.show(el.dataset.p); break;
        case 'q-cancel': api.cancelJob(el.dataset.id); break;
        case 'q-retry': api.retryJob(el.dataset.id); break;
        case 'q-remove': api.removeJob(el.dataset.id); break;
        case 'q-clear': api.clearFinished(); break;
        case 'q-cancel-all': api.cancelAll(); break;
        case 'h-clear': state.history = await api.clearHistory(); render(); break;
        case 'tab': state.settingsTab = el.dataset.tab; render(); break;
        case 'check-update': checkUpdate(); break;
        case 'external': api.external(el.dataset.url); break;
        case 'copy': copy(el.dataset.text); break;
        case 'refresh-tools': state.tools = await api.detectTools(true); state.plans = {}; render(); break;
        case 'support': showSupport(); break;
        case 'set': await saveSettings({ [el.dataset.key]: el.dataset.v }); afterSettingChange(el.dataset.key); break;
        case 'choose-default-dir': {
          const d = await api.openFolder({});
          if (d) { await saveSettings({ outputDir: d, outputMode: 'custom' }); render(); }
          break;
        }
      }
    });
    document.addEventListener('input', (e) => {
      const el = e.target;
      if (!el.dataset.opt) return;
      const cat = state.route;
      if (!state.opts[cat]) return;
      if (el.type === 'range') {
        state.opts[cat][el.dataset.opt] = +el.value;
        el.style.setProperty('--p', `${((el.value - el.min) / (el.max - el.min)) * 100}%`);
        const lab = el.dataset.opt === 'quality' ? $('#qVal') : $('#volVal');
        if (lab) lab.textContent = el.dataset.opt === 'volume' ? `${el.value}%` : el.value;
      } else if (el.type !== 'checkbox' && el.tagName !== 'SELECT') {
        state.opts[cat][el.dataset.opt] = el.value;
      }
      if (state.preset[cat]) {
        state.preset[cat] = 'custom';
        $$('.preset').forEach((p) => p.classList.toggle('active', p.dataset.id === 'custom'));
      }
    });
    document.addEventListener('change', async (e) => {
      const el = e.target;
      if (el.dataset.opt) {
        const cat = state.route;
        state.opts[cat][el.dataset.opt] = el.type === 'checkbox' ? el.checked : el.value;
        if (state.preset[cat]) state.preset[cat] = 'custom';
        if (el.tagName === 'SELECT' || el.type === 'checkbox') render();
      }
      if (el.dataset.setting) {
        const key = el.dataset.setting;
        let val = el.type === 'checkbox' ? el.checked : el.value;
        if (key === 'concurrency') val = parseInt(val, 10);
        if (key === 'update.frequency') await saveSettings({ update: { frequency: val } });
        else await saveSettings({ [key]: val });
        afterSettingChange(key);
      }
    });
  }

  async function afterSettingChange(key) {
    if (key === 'language') I18N.set(I18N.resolve(state.settings.language, state.info.systemLocales));
    if (key === 'theme') await applyTheme();
    toast(t('toast.saved'), 'ok');
    render();
  }

  function applyPreset(cat, id) {
    const list = cat === 'video' ? F.VIDEO_PRESETS : cat === 'audio' ? F.AUDIO_PRESETS : F.IMAGE_PRESETS;
    const p = list.find((x) => x.id === id);
    state.preset[cat] = id;
    if (p && p.target) {
      state.target[cat] = p.target;
      state.opts[cat] = { ...JSON.parse(JSON.stringify(DEFAULT_OPTS[cat])), ...p.opts };
    }
    render();
  }

  async function convert(cat) {
    const valid = state.files[cat].filter((f) => accepts(cat, f.ext));
    if (!valid.length) return;
    const options = { ...state.opts[cat] };
    if (cat === 'image' && state.target.image === 'pdf') options.orientation = options.orientation || 'auto';
    const jobs = await api.addJobs({ files: valid.map((f) => f.path), category: cat, target: state.target[cat], options, lang: I18N.lang });
    toast(t('toast.queued', { n: jobs.length }), 'ok');
    state.files[cat] = state.files[cat].filter((f) => !accepts(cat, f.ext));
    go('queue');
  }

  /* ------------------------------------------------------------ queue */
  function viewQueue() {
    return `<div class="page-head" style="--c:#4cc3f5"><div class="ph-ic">${ic('list-video')}</div><div><h1>${t('queue.title')}</h1><p>${t('queue.sub')}</p></div>
      <div style="margin-left:auto;display:flex;gap:8px"><button class="btn" data-action="q-cancel-all">${ic('circle-stop')} ${t('queue.cancelAll')}</button><button class="btn" data-action="q-clear">${ic('brush-cleaning')} ${t('queue.clear')}</button></div></div>
      <div class="q-summary" id="qSummary"></div>
      <div class="q-list" id="qList"></div>`;
  }
  function renderQueueList() {
    const list = $('#qList');
    if (!list) return;
    const jobs = state.jobs.slice().reverse();
    const done = jobs.filter((j) => j.status === 'done');
    const saved = done.reduce((a, j) => a + Math.max(0, (j.sizeIn || 0) - (j.sizeOut || 0)), 0);
    const s = (icon, color, v, l) => `<div class="q-sum"><div class="qs-ic" style="background:${color}1f;color:${color}">${ic(icon)}</div><div><b>${v}</b><span>${l}</span></div></div>`;
    $('#qSummary').innerHTML = [
      s('loader', '#4cc3f5', jobs.filter((j) => j.status === 'running').length, t('status.running')),
      s('clock', '#a78bfa', jobs.filter((j) => j.status === 'queued').length, t('status.queued')),
      s('circle-check', '#34d399', done.length, t('status.done')),
      s('hard-drive-download', '#f472b6', bytes(saved), t('home.stats.saved'))
    ].join('');
    if (!jobs.length) {
      list.innerHTML = `<div class="card empty">${emptyArt()}<b>${t('queue.empty')}</b><span>${t('queue.empty.sub')}</span></div>`;
      return;
    }
    list.innerHTML = jobs.map(queueItem).join('');
  }
  function queueItem(j) {
    const fcat = j.kind === 'zip' ? 'compress' : F.detectCategory(j.inExt) || j.category;
    const color = CAT_COLORS[j.category] || '#4cc3f5';
    const pct = Math.round((j.progress || 0) * 100);
    const name = j.kind === 'zip' || j.kind === 'merge' ? `${(j.inputs || []).length} × ${j.kind === 'zip' ? 'ZIP' : 'PDF'}` : j.input.split(/[\\/]/).pop();
    const meta = [];
    meta.push(`<span>${bytes(j.sizeIn)}${j.sizeOut ? ` → ${bytes(j.sizeOut)}` : ''}</span>`);
    if (j.status === 'done' && j.sizeIn && j.sizeOut) {
      const d = Math.round((1 - j.sizeOut / j.sizeIn) * 100);
      if (j.note === 'already-optimal') meta.push(`<span>${t('queue.optimal')}</span>`);
      else if (d > 0) meta.push(`<span class="good">${t('queue.saved', { p: d })}</span>`);
      else if (d < 0) meta.push(`<span>${t('queue.bigger', { p: -d })}</span>`);
    }
    if (j.status === 'done' && j.finishedAt && j.startedAt) meta.push(`<span>${ic('timer', '')} ${((j.finishedAt - j.startedAt) / 1000).toFixed(1)} s</span>`);
    if (j.status === 'error') meta.push(`<span class="err">${esc(humanError(j.error))}</span>`);
    if (j.output && j.status === 'done') meta.push(`<span title="${esc(j.output)}">${esc(j.output.split(/[\\/]/).pop())}</span>`);
    const actions = [];
    if (j.status === 'done') {
      actions.push(`<button class="btn btn-sm" data-action="q-open" data-p="${esc(j.output)}">${ic('external-link')} ${t('queue.open')}</button>`);
      actions.push(`<button class="btn btn-ghost btn-sm" data-action="q-show" data-p="${esc(j.output)}" title="${t('queue.showFolder')}">${ic('folder-open')}</button>`);
    }
    if (['queued', 'running'].includes(j.status)) actions.push(`<button class="btn btn-ghost btn-sm btn-danger" data-action="q-cancel" data-id="${j.id}" title="${t('queue.cancel')}">${ic('circle-x')}</button>`);
    if (['error', 'cancelled', 'skipped'].includes(j.status)) actions.push(`<button class="btn btn-sm" data-action="q-retry" data-id="${j.id}">${ic('rotate-ccw')} ${t('queue.retry')}</button>`);
    if (!['running'].includes(j.status)) actions.push(`<button class="btn btn-ghost btn-sm" data-action="q-remove" data-id="${j.id}">${ic('x')}</button>`);
    const isImg = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp'].includes(j.ext) && j.status === 'done';
    return `<div class="q-item ${j.status}" style="--c:${color}">
      <div class="thumb" style="--c:${CAT_COLORS[fcat] || color}">${isImg ? `<img src="${fileUrl(j.output)}?${j.finishedAt}" alt="">` : ic(j.kind === 'zip' ? 'file-archive' : (F.CATEGORIES[fcat] || F.CATEGORIES.compress).icon)}<span class="ext">${esc((j.ext || '').toUpperCase())}</span></div>
      <div class="q-main">
        <div class="q-top"><span class="file-name">${esc(name)}</span><span class="arrow-fmt"><span>${esc((j.inExt || '').toUpperCase())}</span>${ic('arrow-right')}<span class="to">${esc((j.ext || '').toUpperCase())}</span></span><span class="q-status ${j.status}" ${j.status === 'running' ? `id="pct-${j.id}"` : ''}>${j.status === 'running' ? `${pct}%` : t(`status.${j.status}`)}</span></div>
        <div class="progress"><i id="bar-${j.id}" style="width:${j.status === 'done' || j.status === 'error' ? 100 : pct}%"></i></div>
        <div class="q-meta">${meta.join('')}</div>
      </div>
      <div class="q-actions">${actions.join('')}</div>
    </div>`;
  }
  function humanError(e) {
    if (!e) return '';
    if (e.startsWith('MISSING_ENGINE:')) return t('err.missing', { tool: e.split(':')[1] });
    if (e.startsWith('UNSUPPORTED:')) return `${t('err.unsupported')} (${e.split(':')[1]})`;
    return e.length > 260 ? e.slice(0, 260) + '…' : e;
  }

  /* ------------------------------------------------------------ history */
  function historyRow(h) {
    const cat = h.category || 'compress';
    const color = CAT_COLORS[cat];
    const exists = true;
    const name = (h.output || '').split(/[\\/]/).pop();
    const d = h.sizeIn && h.sizeOut ? Math.round((1 - h.sizeOut / h.sizeIn) * 100) : 0;
    return `<div class="h-row" style="--c:${color}">
      <div class="thumb">${ic((F.CATEGORIES[cat] || F.CATEGORIES.compress).icon)}</div>
      <div style="min-width:0"><div class="file-name" title="${esc(h.output)}">${esc(name)}</div><div class="file-meta"><span>${esc((h.input || '').split(/[\\/]/).pop())}</span></div></div>
      <div class="arrow-fmt"><span>${esc((h.inExt || '').toUpperCase())}</span>${ic('arrow-right')}<span class="to">${esc((h.ext || '').toUpperCase())}</span></div>
      <div class="muted">${bytes(h.sizeOut)} ${d > 0 ? `<span style="color:var(--success);font-weight:700">−${d}%</span>` : ''}</div>
      <div class="muted h-date">${when(h.at)}</div>
      <div class="q-actions">${exists ? `<button class="btn btn-sm" data-action="q-open" data-p="${esc(h.output)}">${ic('external-link')}</button><button class="btn btn-ghost btn-sm" data-action="q-show" data-p="${esc(h.output)}">${ic('folder-open')}</button>` : ''}</div>
    </div>`;
  }
  function viewHistory() {
    const list = state.history || [];
    return `<div class="page-head" style="--c:#a78bfa"><div class="ph-ic">${ic('history')}</div><div><h1>${t('history.title')}</h1><p>${t('history.sub')}</p></div>
      ${list.length ? `<div style="margin-left:auto"><button class="btn" data-action="h-clear">${ic('trash-2')} ${t('history.clear')}</button></div>` : ''}</div>
      ${list.length ? list.map(historyRow).join('') : `<div class="card empty">${emptyArt('#a78bfa')}<b>${t('history.empty')}</b><span>${t('home.recent.empty')}</span></div>`}`;
  }

  /* ------------------------------------------------------------ settings */
  function viewSettings() {
    const tabs = [['general', 'settings-2'], ['output', 'folder-output'], ['performance', 'cpu'], ['engines', 'blocks'], ['about', 'info']];
    return `<h1 style="font-size:30px;margin:0 0 18px;letter-spacing:-0.02em">${t('settings.title')}</h1>
      <div class="tabs">${tabs.map(([id, icon]) => `<div class="tab ${state.settingsTab === id ? 'active' : ''}" data-action="tab" data-tab="${id}">${ic(icon)} ${t(`tab.${id}`)}</div>`).join('')}</div>
      <div id="settingsBody">${settingsBody()}</div>`;
  }
  function row(title, desc, control) {
    return `<div class="set-row"><div class="sr-text"><b>${title}</b><span>${desc || ''}</span></div>${control}</div>`;
  }
  function sSel(key, options, value) {
    return `<select class="select" data-setting="${key}">${options.map(([v, l]) => `<option value="${esc(v)}" ${String(value) === String(v) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  }
  function sSw(key, value) {
    return `<label class="switch"><input type="checkbox" data-setting="${key}" ${value ? 'checked' : ''}><span></span></label>`;
  }
  function settingsBody() {
    const s = state.settings;
    const tab = state.settingsTab;
    if (tab === 'general') {
      const st = state.updStatus;
      const last = s.update.lastCheck ? when(s.update.lastCheck) : t('set.never');
      return `<div class="set-card">
        <h3>${t('set.updates')}</h3>
        <div class="upd-line">${t('set.installed', { v: esc(state.info.version), kind: esc((state.info.install && state.info.install.label) || state.info.platform), last })}</div>
        <div class="upd-actions">
          <button class="btn" data-action="check-update" id="checkBtn">${ic('refresh-cw')} ${t('set.checkNow')}</button>
          <button class="btn btn-ghost" data-action="external" data-url="${REPO}/releases">${ic('globe')} ${t('set.releases')}</button>
          <span class="upd-msg ${state.updateMsg ? state.updateMsg.kind : ''}" id="updMsg">${state.updateMsg ? state.updateMsg.text : ''}</span>
        </div>
        ${row(t('set.autoUpdate'), t('set.autoUpdate.d'), sSel('update.frequency', ['daily', 'weekly', 'biweekly', 'monthly', 'startup', 'never'].map((f) => [f, t(`freq.${f}`)]), s.update.frequency))}
      </div>
      <div class="set-card">
        <h3>${t('set.general')}</h3>
        ${row(t('set.language'), t('set.language.d'), sSel('language', [['auto', `${t('set.lang.auto')}`]].concat(I18N.languages.map((l) => [l.id, `${l.flag}  ${l.label}`])), s.language))}
        ${row(t('set.theme'), t('set.theme.d'), sSel('theme', [['dark', t('theme.dark')], ['light', t('theme.light')], ['system', t('theme.system')]], s.theme))}
        ${row(t('set.icon'), t('set.icon.d'), `<div style="display:flex;gap:10px;align-items:center">
            <img src="../assets/icon.svg" width="40" height="40" style="border-radius:10px;${s.iconStyle !== 'light' ? 'outline:2px solid var(--accent);outline-offset:3px' : 'opacity:.6'};cursor:pointer" data-action="set" data-key="iconStyle" data-v="dark" title="${t('icon.dark')}">
            <img src="../assets/icon-light.svg" width="40" height="40" style="border-radius:10px;${s.iconStyle === 'light' ? 'outline:2px solid var(--accent);outline-offset:3px' : 'opacity:.6'};cursor:pointer" data-action="set" data-key="iconStyle" data-v="light" title="${t('icon.light')}">
          </div>`)}
        ${row(t('set.notify'), t('set.notify.d'), sSw('notify', s.notify))}
        ${row(t('set.openFolder'), t('set.openFolder.d'), sSw('openFolderOnFinish', s.openFolderOnFinish))}
      </div>`;
    }
    if (tab === 'output') {
      return `<div class="set-card">
        <h3>${t('tab.output')}</h3>
        ${row(t('set.outputDir'), t('set.outputDir.d'), `<div style="display:flex;gap:8px;align-items:center;max-width:460px">
          ${sSel('outputMode', [['source', t('page.dest.source')], ['custom', t('page.dest.custom')]], s.outputMode)}
          ${s.outputMode === 'custom' ? `<button class="btn btn-sm" data-action="choose-default-dir" title="${esc(s.outputDir)}">${ic('folder-open')} ${esc((s.outputDir || t('page.dest.choose')).split(/[\\/]/).pop() || s.outputDir)}</button>` : ''}
        </div>`)}
        ${row(t('opt.namePattern'), t('set.namePattern.d'), `<input class="input" data-setting="namePattern" value="${esc(s.namePattern)}" style="min-width:260px">`)}
        ${row(t('set.conflict'), t('set.conflict.d'), sSel('conflict', [['rename', t('conflict.rename')], ['overwrite', t('conflict.overwrite')], ['skip', t('conflict.skip')]], s.conflict))}
        ${row(t('set.keepMeta'), t('set.keepMeta.d'), sSw('keepMetadata', s.keepMetadata))}
      </div>`;
    }
    if (tab === 'performance') {
      return `<div class="set-card">
        <h3>${t('tab.performance')}</h3>
        ${row(t('set.concurrency'), t('set.concurrency.d'), sSel('concurrency', [1, 2, 3, 4, 6, 8].map((n) => [n, `${n}`]), s.concurrency))}
        ${row(t('set.hw'), t('set.hw.d'), sSel('hwAccel', ['none', 'nvidia', 'intel', 'amd', 'apple'].map((h) => [h, t(`hw.${h}`)]), s.hwAccel))}
      </div>`;
    }
    if (tab === 'engines') return enginesView();
    if (tab === 'about') return aboutView();
    return '';
  }

  function enginesView() {
    const tl = state.tools;
    const pm = state.info.platform === 'win32' ? 'win' : state.info.platform === 'darwin' ? 'mac' : ({ pacman: 'arch', deb: 'deb', rpm: 'rpm' }[(state.info.install || {}).kind] || 'deb');
    const colors = { ffmpeg: '#34d399', chromium: '#4cc3f5', builtin: '#a78bfa', ebooks: '#fbbf24', libreoffice: '#60a5fa', calibre: '#f59e0b', ghostscript: '#94a3b8' };
    const icons = { ffmpeg: 'film', chromium: 'globe', builtin: 'file-text', ebooks: 'book-open', libreoffice: 'file-cog', calibre: 'library', ghostscript: 'file-minus' };
    const ids = ['ffmpeg', 'builtin', 'ebooks', 'chromium', 'libreoffice', 'calibre', 'ghostscript'];
    return `<div class="set-card" style="padding:18px 22px"><h3 style="margin-top:0">${t('eng.title')}</h3><p style="color:var(--text-2);margin:0 0 4px;line-height:1.6">${t('eng.sub')}</p>
      <div style="margin-top:12px"><button class="btn btn-sm" data-action="refresh-tools">${ic('refresh-cw')} ${t('eng.refresh')}</button></div></div>
      <div class="eng-grid">${ids.filter((id) => tl[id]).map((id) => {
        const e = tl[id];
        const cmd = e.install ? e.install[pm] : '';
        return `<div class="eng">
          <div class="eng-top"><div class="eng-ic" style="background:${colors[id]}1f;color:${colors[id]}">${ic(icons[id])}</div>
            <div><b>${esc(e.name)}</b><small>${t(`eng.purpose.${e.purpose}`)}${e.version ? ` · v${esc(e.version)}` : ''}</small></div>
            <span class="eng-state ${e.available ? 'ok' : 'opt'}">${e.bundled ? t('eng.bundled') : e.available ? t('eng.installed') : t('eng.optional')}</span></div>
          ${e.optional ? `<small class="eng-note">${t(`eng.note.${id}`)}</small>` : ''}
          ${!e.available && cmd ? `<code><span>${esc(cmd)}</span><button data-action="copy" data-text="${esc(cmd)}" title="${t('eng.copy')}">${ic('copy')}</button></code>` : ''}
          ${!e.available && e.url ? `<div><button class="btn btn-sm" data-action="external" data-url="${esc(e.url)}">${ic('download')} ${t('eng.download')}</button></div>` : ''}
        </div>`;
      }).join('') || `<div class="card">${t('about.loading')}</div>`}</div>`;
  }

  function aboutView() {
    const i = state.info;
    return `<div class="about-hero">
        <img src="../assets/icon.svg" alt="">
        <div>
          <h2>GCP Converter <span style="font-size:14px;color:var(--text-3);font-weight:600">v${esc(i.version)}</span></h2>
          <div>${t('about.devBy')} <a href="#" data-action="external" data-url="${SITE}"><b>Bruno Albertini</b></a> · <a href="#" data-action="external" data-url="${SITE}">Gestão Cultural Pro</a></div>
          <p>${t('about.desc')}</p>
          <div class="links">
            <button class="btn btn-sm" data-action="external" data-url="${REPO}">${ic('github')} ${t('about.repo')}</button>
            <button class="btn btn-sm" data-action="external" data-url="${SITE}">${ic('globe')} ${t('about.site')}</button>
            <button class="btn btn-sm" data-action="external" data-url="${REPO}/issues">${ic('bug')} ${t('about.report')}</button>
            <button class="btn btn-sm btn-brand" data-action="support">${ic('heart')} ${t('support.title')}</button>
          </div>
        </div>
      </div>
      <div class="set-card"><h3>${t('about.system')}</h3>
        <div class="kv">
          <span>GCP Converter</span><span>${esc(i.version)} · ${esc((i.install || {}).label || '')}</span>
          <span>OS</span><span>${esc(i.platform)} · ${esc(i.arch)}</span>
          <span>Electron</span><span>${esc(i.electron)} · Chromium ${esc(i.chrome)} · Node ${esc(i.node)}</span>
          <span>FFmpeg</span><span>${esc((state.tools.ffmpeg || {}).version || '—')}</span>
        </div></div>
      <div class="set-card" style="padding-bottom:12px"><h3>${t('about.history')}</h3><div id="releases" style="padding-top:10px">${t('about.loading')}</div></div>
      <div class="set-card" style="padding-bottom:18px"><h3>${t('about.licenses')}</h3><div id="licenses">${t('about.loading')}</div></div>`;
  }

  async function afterSettings() {
    if (state.settingsTab === 'about') {
      const rel = await api.releases();
      const box = $('#releases');
      if (!box) return;
      let list = Array.isArray(rel) ? rel : [];
      let note = '';
      if (!list.length) {
        const md = await api.changelog();
        list = parseChangelog(md);
        if (!Array.isArray(rel)) note = `<p style="color:var(--text-3);font-size:12.5px">${t('about.offline')}</p>`;
      }
      const htmls = await Promise.all(list.map((r) => api.markdown(r.notes)));
      box.innerHTML = note + list.map((r, k) => `<div class="release"><h4>v${esc(r.version)} ${r.version === state.info.version ? `<span class="eng-state ok" style="margin:0">✓</span>` : ''} <span class="r-date">${r.date ? when(r.date) : ''}</span></h4><div class="md">${htmls[k]}</div></div>`).join('');
      const lic = await api.licenses();
      const lb = $('#licenses');
      if (lb) lb.innerHTML = `<p style="color:var(--text-2);font-size:13px;margin:10px 0">${t('about.license.app')}: <b>GNU GPL v3.0</b></p><div class="license-box">${esc(lic.app)}</div><p style="color:var(--text-2);font-size:13px;margin:16px 0 10px">${t('about.license.third')}</p><div class="license-box">${esc(lic.thirdParty)}</div>`;
    }
  }

  function parseChangelog(md) {
    const out = [];
    const parts = String(md || '').split(/^## /m).slice(1);
    for (const p of parts) {
      const [head, ...body] = p.split('\n');
      const m = head.match(/\[?v?(\d+\.\d+\.\d+)\]?(?:\s*[-—–]\s*(\S+))?/);
      if (m) out.push({ version: m[1], date: m[2] || null, notes: body.join('\n').trim() });
    }
    return out;
  }

  async function checkUpdate() {
    const btn = $('#checkBtn');
    const msg = $('#updMsg');
    if (btn) btn.disabled = true;
    if (msg) { msg.className = 'upd-msg'; msg.textContent = t('set.checking'); }
    const r = await api.checkUpdate();
    state.settings = await api.getSettings();
    if (r.ok && r.latest && r.latest.available) state.updateMsg = { kind: 'ok', text: `${t('upd.title')}: v${r.latest.version}` };
    else if (r.ok) state.updateMsg = { kind: 'ok', text: t('set.upToDate') };
    else state.updateMsg = { kind: 'bad', text: t('set.checkFail', { e: esc(r.error) }) };
    if (state.route === 'settings') render();
  }

  /* ------------------------------------------------------------ modals */
  function modal(html, cls = '') {
    const root = $('#modalRoot');
    root.innerHTML = `<div class="modal-backdrop"><div class="modal ${cls}" role="dialog" aria-modal="true"><button class="modal-close" data-close>${ic('x')}</button>${html}</div></div>`;
    const close = () => (root.innerHTML = '');
    root.querySelector('[data-close]').addEventListener('click', close);
    root.querySelector('.modal-backdrop').addEventListener('mousedown', (e) => { if (e.target.classList.contains('modal-backdrop')) close(); });
    const onKey = (e) => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
    document.addEventListener('keydown', onKey);
    return { root, close };
  }

  async function showSupport() {
    const qr = await api.pixQr(PIX);
    const { root } = modal(`
      <h2>${t('support.title')}</h2>
      <p class="sub">${t('support.sub')}</p>
      <div class="support-dev"><img src="../assets/icon.svg" alt=""><div><b>${t('about.devBy')} Bruno Albertini</b><a href="#" data-action="external" data-url="${SITE}">Gestão Cultural Pro ${ic('arrow-up-right')}</a></div></div>
      <div class="support-grid">
        <div class="sup-card">
          <div class="eyebrow">${t('support.pix')}</div>
          <div class="qr"><img src="${qr}" alt="QR Code PIX"></div>
          <div class="muted">${t('support.scan')}</div>
          <button class="btn btn-primary btn-lg" data-action="copy" data-text="${esc(PIX)}">${ic('copy')} ${t('support.copyPix')}</button>
          <details class="pix-code"><summary>${t('support.viewCode')}</summary><code>${esc(PIX)}</code></details>
        </div>
        <div class="sup-card">
          <div class="eyebrow">${t('support.stripe')}</div>
          <div class="stripe-heart">${ic('heart')}</div>
          <h3>${t('support.join')}</h3>
          <div class="muted" style="margin-top:0">${t('support.any')}</div>
          <button class="btn btn-lg" data-action="external" data-url="${STRIPE}">${t('support.stripeBtn')} ${ic('arrow-up-right')}</button>
          <button class="link-btn" data-action="copy" data-text="${STRIPE}">${ic('copy')} ${t('support.copyStripe')}</button>
          <div class="sup-foot">${t('support.voluntary')}</div>
        </div>
      </div>`);
    return root;
  }

  async function showUpdateModal(u) {
    const notes = await api.markdown(u.notes || '');
    const { root, close } = modal(`
      <div class="update-head"><div class="u-ic">${ic('rocket')}</div><div><h2 style="margin:0">${t('upd.title')}</h2><div style="color:var(--text-2)">${t('upd.sub', { v: esc(u.version) })}</div></div></div>
      <div class="card-title">${ic('sparkles')} ${t('upd.whatsNew')}</div>
      <div class="update-notes md">${notes || '—'}</div>
      <div class="progress hidden" id="updProg"><i style="width:0%"></i></div>
      <div class="upd-msg" id="updText" style="margin-bottom:12px"></div>
      <div class="modal-actions">
        <button class="btn btn-ghost" id="updSkip">${t('upd.skip')}</button>
        <button class="btn" id="updLater">${t('upd.later')}</button>
        <button class="btn btn-primary" id="updGo">${ic('download')} ${t('upd.install')}</button>
      </div>`, 'update-modal');
    $('#updLater', root).addEventListener('click', close);
    $('#updSkip', root).addEventListener('click', () => { api.skipUpdate(u.version); close(); });
    $('#updGo', root).addEventListener('click', async (e) => {
      e.target.disabled = true;
      $('#updProg', root).classList.remove('hidden');
      const off = api.onUpdateProgress((p) => {
        const bar = $('#updProg i', root);
        if (bar) bar.style.width = `${Math.round(p * 100)}%`;
        const txt = $('#updText', root);
        if (txt) txt.textContent = t('upd.downloading', { p: Math.round(p * 100) });
      });
      const r = await api.installUpdate();
      off();
      const txt = $('#updText', root);
      if (!txt) return;
      if (r.action === 'dmg') txt.textContent = t('upd.dmg');
      else if (r.manual) txt.textContent = t('upd.manual');
      else if (!r.ok && r.error) { txt.className = 'upd-msg bad'; txt.textContent = r.error; e.target.disabled = false; }
    });
  }

  boot().catch((e) => {
    console.error(e);
    document.body.insertAdjacentHTML('beforeend', `<pre style="color:#f87171;padding:20px">${esc(e.stack || e)}</pre>`);
  });
})();
