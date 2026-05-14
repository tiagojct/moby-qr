import QRCodeStyling from 'qr-code-styling';

let qr = null;
let canvasContainer = null;

export const defaultConfig = {
  width: 300,
  height: 300,
  margin: 10,
  qrOptions: {
    errorCorrectionLevel: 'M',
  },
  dotsOptions: {
    color: '#c8a96e',
    type: 'square',
  },
  backgroundOptions: {
    color: '#0c1014',
  },
  cornersSquareOptions: {
    color: '#c8a96e',
    type: 'square',
  },
  cornersDotOptions: {
    color: '#c8a96e',
    type: 'square',
  },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: 4,
    hideBackgroundDots: true,
    imageSize: 0.4,
  },
};

export function initQR(container) {
  canvasContainer = container;
  qr = new QRCodeStyling({ ...defaultConfig, data: ' ' });
  qr.append(container);
}

export function updateQR(partialConfig, dataString) {
  if (!qr) return;

  const wrapper = document.getElementById('qr-preview-wrapper');
  const canvasCont = document.getElementById('qr-canvas-container');
  const emptyState = document.getElementById('qr-empty-state');

  const hasData = dataString && dataString.trim().length > 0;

  if (emptyState)  emptyState.style.display  = hasData ? 'none' : 'flex';
  if (canvasCont)  canvasCont.style.display   = hasData ? 'block' : 'none';

  if (!hasData) return;

  if (wrapper) wrapper.style.opacity = '0.3';

  qr.update({ ...partialConfig, data: dataString });

  setTimeout(() => {
    if (wrapper) wrapper.style.opacity = '1';
  }, 80);
}

export function flashWhiteDots(currentDotsOptions) {
  if (!qr) return;
  qr.update({ dotsOptions: { type: currentDotsOptions.type || 'square', color: '#ffffff' } });
  setTimeout(() => {
    qr.update({ dotsOptions: currentDotsOptions });
  }, 400);
}

export function downloadQR(extension) {
  if (!qr) return;
  qr.download({ name: 'pequod-qr', extension });
}
