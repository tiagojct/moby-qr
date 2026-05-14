import '@phosphor-icons/web/regular';

import { initQR, updateQR, flashWhiteDots } from './qr.js';
import { initForm, buildData } from './form.js';
import { initExport } from './export.js';

// ─── Config state ────────────────────────────────────────────────────
const config = {
  width:  300,
  height: 300,
  margin: 10,
  qrOptions: { errorCorrectionLevel: 'M' },
  dotsOptions: {
    color: '#c8a96e',
    type: 'square',
  },
  backgroundOptions: { color: '#0c1014' },
  cornersSquareOptions: { color: '#c8a96e', type: 'square' },
  cornersDotOptions: { color: '#c8a96e', type: 'square' },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,
    hideBackgroundDots: true,
    imageSize: 0.4,
  },
  image: '',
};

// ─── Easter egg state ─────────────────────────────────────────────────
let lastDataHadMobyDick = false;
let mobyFlashCooldown = false;

function checkMobyDick(dataString) {
  const hasMoby = dataString.toLowerCase().includes('moby dick');
  if (hasMoby && !lastDataHadMobyDick && !mobyFlashCooldown) {
    mobyFlashCooldown = true;
    flashWhiteDots({ ...config.dotsOptions });
    setTimeout(() => { mobyFlashCooldown = false; }, 1200);
  }
  lastDataHadMobyDick = hasMoby;
}

// ─── Compose QR config from current state ─────────────────────────────
function buildQRConfig() {
  const c = {
    width:  config.width,
    height: config.height,
    margin: config.margin,
    qrOptions: { ...config.qrOptions },
    dotsOptions: { ...config.dotsOptions },
    backgroundOptions: { ...config.backgroundOptions },
    cornersSquareOptions: { ...config.cornersSquareOptions },
    cornersDotOptions: { ...config.cornersDotOptions },
    imageOptions: { ...config.imageOptions },
  };
  c.image = config.image;
  return c;
}

// ─── Refresh QR ──────────────────────────────────────────────────────
function refresh() {
  const data = buildData();
  checkMobyDick(data);
  updateQR(buildQRConfig(), data);
}

// ─── Slider helpers ──────────────────────────────────────────────────
function bindSlider(id, valId, format, onUpdate) {
  const slider = document.getElementById(id);
  const display = document.getElementById(valId);
  if (!slider) return;
  slider.addEventListener('input', () => {
    const v = parseFloat(slider.value);
    if (display) display.textContent = format(v);
    onUpdate(v);
    refresh();
  });
}

// ─── Init ─────────────────────────────────────────────────────────────
function init() {
  const container = document.getElementById('qr-canvas-container');
  initQR(container);

  initForm((data) => {
    checkMobyDick(data);
    updateQR(buildQRConfig(), data);
  });

  initExport();
  setupCustomisation();
}

// ─── Customisation panel wiring ───────────────────────────────────────
function setupCustomisation() {

  // Hull pattern (dot type)
  document.getElementById('dot-type')?.addEventListener('change', (e) => {
    config.dotsOptions.type = e.target.value;
    refresh();
  });

  // ── Dot color / gradient ──
  const radioButtons = document.querySelectorAll('input[name="dot-color-mode"]');
  const solidUI    = document.getElementById('dot-solid-ui');
  const gradientUI = document.getElementById('dot-gradient-ui');

  function applyDotColor() {
    const mode = document.querySelector('input[name="dot-color-mode"]:checked')?.value;
    if (mode === 'gradient') {
      const gType = document.getElementById('gradient-type')?.value || 'linear';
      const c1    = document.getElementById('gradient-color-1')?.value || '#c8a96e';
      const c2    = document.getElementById('gradient-color-2')?.value || '#7a8a99';
      config.dotsOptions = {
        type: config.dotsOptions.type,
        gradient: {
          type: gType,
          rotation: 0,
          colorStops: [
            { offset: 0, color: c1 },
            { offset: 1, color: c2 },
          ],
        },
      };
    } else {
      const c = document.getElementById('dot-color')?.value || '#c8a96e';
      config.dotsOptions = { type: config.dotsOptions.type, color: c };
    }
    refresh();
  }

  radioButtons.forEach((r) => {
    r.addEventListener('change', () => {
      const isGradient = r.value === 'gradient' && r.checked;
      solidUI.hidden    = isGradient;
      gradientUI.hidden = !isGradient;
      applyDotColor();
    });
  });

  document.getElementById('dot-color')?.addEventListener('input', applyDotColor);
  document.getElementById('gradient-type')?.addEventListener('change', applyDotColor);
  document.getElementById('gradient-color-1')?.addEventListener('input', applyDotColor);
  document.getElementById('gradient-color-2')?.addEventListener('input', applyDotColor);

  // Corner square type & color
  document.getElementById('corner-square-type')?.addEventListener('change', (e) => {
    config.cornersSquareOptions.type = e.target.value;
    refresh();
  });
  document.getElementById('corner-square-color')?.addEventListener('input', (e) => {
    config.cornersSquareOptions.color = e.target.value;
    refresh();
  });

  // Corner dot type & color
  document.getElementById('corner-dot-type')?.addEventListener('change', (e) => {
    config.cornersDotOptions.type = e.target.value;
    refresh();
  });
  document.getElementById('corner-dot-color')?.addEventListener('input', (e) => {
    config.cornersDotOptions.color = e.target.value;
    refresh();
  });

  // Background color
  document.getElementById('bg-color')?.addEventListener('input', (e) => {
    config.backgroundOptions.color = e.target.value;
    refresh();
  });

  // ── Image upload ──
  document.getElementById('image-upload')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      config.image = ev.target.result;
      document.getElementById('image-controls').hidden = false;
      refresh();
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('image-clear')?.addEventListener('click', () => {
    config.image = '';
    document.getElementById('image-upload').value = '';
    document.getElementById('image-controls').hidden = true;
    refresh();
  });

  document.getElementById('hide-bg-dots')?.addEventListener('change', (e) => {
    config.imageOptions.hideBackgroundDots = e.target.checked;
    refresh();
  });

  // Image size slider
  bindSlider(
    'image-size', 'image-size-val',
    (v) => v.toFixed(2),
    (v) => { config.imageOptions.imageSize = v; },
  );

  // Image margin slider
  bindSlider(
    'image-margin', 'image-margin-val',
    (v) => `${v}px`,
    (v) => { config.imageOptions.margin = v; },
  );

  // QR size slider (locked aspect ratio — width = height)
  bindSlider(
    'qr-size', 'qr-size-val',
    (v) => `${v}px`,
    (v) => { config.width = v; config.height = v; },
  );

  // Margin slider
  bindSlider(
    'qr-margin', 'qr-margin-val',
    (v) => String(v),
    (v) => { config.margin = v; },
  );

  // Error correction level
  const ecSelect = document.getElementById('error-correction');
  const ecLabel  = document.getElementById('ec-label');
  ecSelect?.addEventListener('change', (e) => {
    config.qrOptions.errorCorrectionLevel = e.target.value;
    if (ecLabel) {
      ecLabel.textContent = e.target.value === 'H'
        ? 'Hull integrity: Indestructible'
        : 'Hull integrity';
    }
    refresh();
  });
}

init();
