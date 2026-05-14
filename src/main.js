import jsQR from 'jsqr';

import { hydrateIcons, icon } from './icons.js';
import { initQR, updateQR, flashWhiteDots } from './qr.js';
import { initForm, buildData } from './form.js';
import { initExport } from './export.js';
import { PALETTES } from './palettes.js';
import { getPresets, savePreset, deletePreset } from './presets.js';
import { getLabelConfig, updateLabelPreview } from './label.js';

// ─── Config state ────────────────────────────────────────────────────
const DEFAULTS = {
  width:  300,
  height: 300,
  margin: 10,
  qrOptions: { errorCorrectionLevel: 'M' },
  dotsOptions:          { color: '#c8a96e', type: 'square' },
  backgroundOptions:    { color: '#0c1014' },
  cornersSquareOptions: { color: '#c8a96e', type: 'square' },
  cornersDotOptions:    { color: '#c8a96e', type: 'square' },
  imageOptions: { crossOrigin: 'anonymous', margin: 4, hideBackgroundDots: true, imageSize: 0.4 },
  image: '',
};

const config = structuredClone(DEFAULTS);

// ─── Palette / preset tracking ────────────────────────────────────────
let activePaletteId = 'pequod';

function setActivePalette(id) {
  activePaletteId = id;
  document.querySelectorAll('.palette-card').forEach((el) =>
    el.classList.toggle('active', el.dataset.palette === id));
}

function clearActivePalette() {
  if (!activePaletteId) return;
  activePaletteId = null;
  document.querySelectorAll('.palette-card').forEach((el) => el.classList.remove('active'));
}

// ─── Easter egg ───────────────────────────────────────────────────────
let lastDataHadMobyDick = false;
let mobyFlashCooldown   = false;

function checkMobyDick(dataString) {
  const hasMoby = dataString.toLowerCase().includes('moby dick');
  if (hasMoby && !lastDataHadMobyDick && !mobyFlashCooldown) {
    mobyFlashCooldown = true;
    flashWhiteDots({ ...config.dotsOptions });
    setTimeout(() => { mobyFlashCooldown = false; }, 1200);
  }
  lastDataHadMobyDick = hasMoby;
}

// ─── QR config builder ────────────────────────────────────────────────
function buildQRConfig() {
  return {
    width:  config.width,
    height: config.height,
    margin: config.margin,
    qrOptions:            { ...config.qrOptions },
    dotsOptions:          { ...config.dotsOptions },
    backgroundOptions:    { ...config.backgroundOptions },
    cornersSquareOptions: { ...config.cornersSquareOptions },
    cornersDotOptions:    { ...config.cornersDotOptions },
    imageOptions:         { ...config.imageOptions },
    image: config.image,
  };
}

// ─── Scan check ───────────────────────────────────────────────────────
let scanTimer = null;

function scheduleScan() {
  clearTimeout(scanTimer);
  scanTimer = setTimeout(runScanCheck, 220);
}

function runScanCheck() {
  const canvas = document.querySelector('#qr-canvas-container canvas');
  const status = document.getElementById('scan-status');
  const okEl   = document.getElementById('scan-ok');
  const failEl = document.getElementById('scan-fail');
  if (!canvas || !status) return;

  try {
    const ctx  = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data.data, data.width, data.height);
    status.hidden  = false;
    okEl.hidden    = !code;
    failEl.hidden  = !!code;
  } catch {
    status.hidden = true;
  }
}

function hideScanStatus() {
  const status = document.getElementById('scan-status');
  if (status) status.hidden = true;
}

// ─── Refresh ──────────────────────────────────────────────────────────
function refresh() {
  const data = buildData();
  checkMobyDick(data);
  updateQR(buildQRConfig(), data);
  if (data) scheduleScan(); else hideScanStatus();
  updateLabelPreview(getLabelConfig());
}

// ─── Sync UI inputs from config ───────────────────────────────────────
function syncInputs() {
  setVal('dot-color',           config.dotsOptions.color          || '#c8a96e');
  setVal('corner-square-color', config.cornersSquareOptions.color || '#c8a96e');
  setVal('corner-dot-color',    config.cornersDotOptions.color    || '#c8a96e');
  setVal('bg-color',            config.backgroundOptions.color    || '#0c1014');
  setVal('dot-type',            config.dotsOptions.type           || 'square');
  setVal('corner-square-type',  config.cornersSquareOptions.type  || 'square');
  setVal('corner-dot-type',     config.cornersDotOptions.type     || 'square');
  setVal('qr-size',             String(config.width));
  setVal('qr-margin',           String(config.margin));
  setVal('error-correction',    config.qrOptions.errorCorrectionLevel || 'M');
  setVal('image-size',          String(config.imageOptions.imageSize));
  setVal('image-margin',        String(config.imageOptions.margin));

  setText('qr-size-val',    `${config.width}px`);
  setText('qr-margin-val',  String(config.margin));
  setText('image-size-val', parseFloat(config.imageOptions.imageSize).toFixed(2));
  setText('image-margin-val', `${config.imageOptions.margin}px`);

  const ecLabel = document.getElementById('ec-label');
  if (ecLabel) ecLabel.textContent = config.qrOptions.errorCorrectionLevel === 'H'
    ? 'Hull integrity: Indestructible' : 'Hull integrity';

  // Ensure gradient UIs are in solid mode after a reset/palette switch
  const solidRadio = document.querySelector('input[name="dot-color-mode"][value="solid"]');
  if (solidRadio) { solidRadio.checked = true; }
  setHidden('dot-solid-ui', false);
  setHidden('dot-gradient-ui', true);

  const csSolidRadio = document.querySelector('input[name="corner-sq-mode"][value="solid"]');
  if (csSolidRadio) { csSolidRadio.checked = true; }
  setHidden('corner-sq-solid-ui', false);
  setHidden('corner-sq-gradient-ui', true);
}

// ─── Helpers ──────────────────────────────────────────────────────────
function setVal(id, val)  { const el = document.getElementById(id); if (el) el.value = val; }
function setText(id, txt) { const el = document.getElementById(id); if (el) el.textContent = txt; }
function setHidden(id, h) { const el = document.getElementById(id); if (el) el.hidden = h; }

function bindSlider(id, valId, format, onUpdate) {
  const slider = document.getElementById(id);
  if (!slider) return;
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    setText(valId, format(v));
    onUpdate(v);
    refresh();
  });
}

// ─── Init ─────────────────────────────────────────────────────────────
function init() {
  hydrateIcons(document.body);

  initQR(document.getElementById('qr-canvas-container'));

  initForm((data) => {
    checkMobyDick(data);
    updateQR(buildQRConfig(), data);
    if (data) scheduleScan(); else hideScanStatus();
  });

  initExport();
  setupCustomisation();
}

// ─── Customisation wiring ─────────────────────────────────────────────
function setupCustomisation() {

  // ── Palette grid ──
  const grid = document.getElementById('palette-grid');
  if (grid) {
    grid.innerHTML = PALETTES.map((p) => `
      <button class="palette-card${p.id === activePaletteId ? ' active' : ''}"
              data-palette="${p.id}" title="${p.name} — ${p.desc}" type="button">
        <div class="palette-swatch" style="background:${p.bg}">
          <div class="palette-dot" style="background:${p.corner}"></div>
          <div class="palette-dot" style="background:${p.dots}"></div>
          <div class="palette-dot" style="background:${p.corner}"></div>
        </div>
        <span class="palette-name">${p.name}</span>
      </button>
    `).join('');

    grid.addEventListener('click', (e) => {
      const card = e.target.closest('.palette-card');
      if (!card) return;
      const p = PALETTES.find((x) => x.id === card.dataset.palette);
      if (!p) return;

      config.dotsOptions          = { type: config.dotsOptions.type,          color: p.dots };
      config.cornersSquareOptions = { type: config.cornersSquareOptions.type, color: p.corner };
      config.cornersDotOptions    = { type: config.cornersDotOptions.type,    color: p.corner };
      config.backgroundOptions    = { color: p.bg };

      syncInputs();
      setActivePalette(p.id);
      refresh();
    });
  }

  // ── Saved presets ──
  renderSavedPresets();

  document.getElementById('preset-save')?.addEventListener('click', () => {
    const name = document.getElementById('preset-name')?.value.trim();
    if (!name) return;
    savePreset(name, buildQRConfig());
    setVal('preset-name', '');
    renderSavedPresets();
  });

  // ── Reset ──
  document.getElementById('reset-all')?.addEventListener('click', () => {
    Object.assign(config, structuredClone(DEFAULTS));
    config.image = '';
    setHidden('image-controls', true);
    setVal('image-upload', '');
    syncInputs();
    clearActivePalette();
    setActivePalette('pequod');
    refresh();
  });

  // ── Hull pattern ──
  document.getElementById('dot-type')?.addEventListener('change', (e) => {
    config.dotsOptions.type = e.target.value;
    refresh();
  });

  // ── Dot color / gradient ──
  const dotRadios   = document.querySelectorAll('input[name="dot-color-mode"]');
  const dotSolidUI  = document.getElementById('dot-solid-ui');
  const dotGradUI   = document.getElementById('dot-gradient-ui');

  function applyDotColor() {
    const mode = document.querySelector('input[name="dot-color-mode"]:checked')?.value;
    if (mode === 'gradient') {
      config.dotsOptions = {
        type: config.dotsOptions.type,
        gradient: {
          type: document.getElementById('gradient-type')?.value || 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: document.getElementById('gradient-color-1')?.value || '#c8a96e' },
            { offset: 1, color: document.getElementById('gradient-color-2')?.value || '#7a8a99' },
          ],
        },
      };
    } else {
      config.dotsOptions = { type: config.dotsOptions.type, color: document.getElementById('dot-color')?.value || '#c8a96e' };
    }
    refresh();
  }

  dotRadios.forEach((r) => r.addEventListener('change', () => {
    const isGrad = r.value === 'gradient' && r.checked;
    dotSolidUI.hidden = isGrad;
    dotGradUI.hidden  = !isGrad;
    if (isGrad) clearActivePalette();
    applyDotColor();
  }));

  document.getElementById('dot-color')?.addEventListener('input',          () => { clearActivePalette(); applyDotColor(); });
  document.getElementById('gradient-type')?.addEventListener('change',     () => { clearActivePalette(); applyDotColor(); });
  document.getElementById('gradient-color-1')?.addEventListener('input',   () => { clearActivePalette(); applyDotColor(); });
  document.getElementById('gradient-color-2')?.addEventListener('input',   () => { clearActivePalette(); applyDotColor(); });

  // ── Corner square type / color / gradient ──
  document.getElementById('corner-square-type')?.addEventListener('change', (e) => {
    config.cornersSquareOptions.type = e.target.value;
    refresh();
  });

  const csRadios    = document.querySelectorAll('input[name="corner-sq-mode"]');
  const csSolidUI   = document.getElementById('corner-sq-solid-ui');
  const csGradUI    = document.getElementById('corner-sq-gradient-ui');

  function applyCornerSqColor() {
    const mode = document.querySelector('input[name="corner-sq-mode"]:checked')?.value;
    if (mode === 'gradient') {
      config.cornersSquareOptions = {
        type: config.cornersSquareOptions.type,
        gradient: {
          type: document.getElementById('corner-sq-gradient-type')?.value || 'linear',
          rotation: 0,
          colorStops: [
            { offset: 0, color: document.getElementById('corner-sq-gradient-c1')?.value || '#c8a96e' },
            { offset: 1, color: document.getElementById('corner-sq-gradient-c2')?.value || '#7a8a99' },
          ],
        },
      };
    } else {
      config.cornersSquareOptions = {
        type: config.cornersSquareOptions.type,
        color: document.getElementById('corner-square-color')?.value || '#c8a96e',
      };
    }
    refresh();
  }

  csRadios.forEach((r) => r.addEventListener('change', () => {
    const isGrad = r.value === 'gradient' && r.checked;
    csSolidUI.hidden = isGrad;
    csGradUI.hidden  = !isGrad;
    if (isGrad) clearActivePalette();
    applyCornerSqColor();
  }));

  document.getElementById('corner-square-color')?.addEventListener('input', () => { clearActivePalette(); applyCornerSqColor(); });
  document.getElementById('corner-sq-gradient-type')?.addEventListener('change', () => { clearActivePalette(); applyCornerSqColor(); });
  document.getElementById('corner-sq-gradient-c1')?.addEventListener('input',   () => { clearActivePalette(); applyCornerSqColor(); });
  document.getElementById('corner-sq-gradient-c2')?.addEventListener('input',   () => { clearActivePalette(); applyCornerSqColor(); });

  // ── Corner dot type / color ──
  document.getElementById('corner-dot-type')?.addEventListener('change', (e) => {
    config.cornersDotOptions.type = e.target.value;
    refresh();
  });
  document.getElementById('corner-dot-color')?.addEventListener('input', (e) => {
    clearActivePalette();
    config.cornersDotOptions.color = e.target.value;
    refresh();
  });

  // ── Background ──
  document.getElementById('bg-color')?.addEventListener('input', (e) => {
    clearActivePalette();
    config.backgroundOptions.color = e.target.value;
    refresh();
  });

  // ── Image ──
  document.getElementById('image-upload')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      config.image = ev.target.result;
      setHidden('image-controls', false);
      refresh();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('image-clear')?.addEventListener('click', () => {
    config.image = '';
    setVal('image-upload', '');
    setHidden('image-controls', true);
    refresh();
  });

  document.getElementById('hide-bg-dots')?.addEventListener('change', (e) => {
    config.imageOptions.hideBackgroundDots = e.target.checked;
    refresh();
  });

  bindSlider('image-size',  'image-size-val',  (v) => v.toFixed(2),    (v) => { config.imageOptions.imageSize = v; });
  bindSlider('image-margin','image-margin-val', (v) => `${v}px`,       (v) => { config.imageOptions.margin = v; });
  bindSlider('qr-size',     'qr-size-val',      (v) => `${v}px`,       (v) => { config.width = v; config.height = v; });
  bindSlider('qr-margin',   'qr-margin-val',    (v) => String(v),      (v) => { config.margin = v; });

  // ── Error correction ──
  document.getElementById('error-correction')?.addEventListener('change', (e) => {
    config.qrOptions.errorCorrectionLevel = e.target.value;
    setText('ec-label', e.target.value === 'H' ? 'Hull integrity: Indestructible' : 'Hull integrity');
    refresh();
  });

  // ── Label ──
  ['label-text', 'label-color', 'label-size'].forEach((id) => {
    document.getElementById(id)?.addEventListener('input', () => {
      updateLabelPreview(getLabelConfig());
    });
  });
  bindSlider('label-size', 'label-size-val', (v) => `${v}px`, () => {
    updateLabelPreview(getLabelConfig());
  });
}

// ─── Saved presets rendering ──────────────────────────────────────────
function renderSavedPresets() {
  const list = document.getElementById('saved-presets-list');
  if (!list) return;

  const presets = getPresets();
  if (!presets.length) {
    list.innerHTML = '<p class="hint-text">No saved presets yet.</p>';
    return;
  }

  list.innerHTML = presets.map((p) => `
    <div class="preset-row" data-id="${p.id}">
      <button class="preset-apply btn-ghost" data-id="${p.id}" type="button">${p.name}</button>
      <button class="preset-delete btn-ghost-danger" data-id="${p.id}" type="button" title="Delete">
        ${icon('trash', 13)}
      </button>
    </div>
  `).join('');

  list.querySelectorAll('.preset-apply').forEach((btn) => {
    btn.addEventListener('click', () => {
      const preset = getPresets().find((p) => p.id === parseInt(btn.dataset.id, 10));
      if (!preset) return;
      Object.assign(config, structuredClone(preset.config));
      syncInputs();
      clearActivePalette();
      refresh();
    });
  });

  list.querySelectorAll('.preset-delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      deletePreset(parseInt(btn.dataset.id, 10));
      renderSavedPresets();
    });
  });
}

init();
