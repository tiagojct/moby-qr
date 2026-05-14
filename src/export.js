import { downloadQR } from './qr.js';

export function initExport() {
  document.getElementById('download-png')?.addEventListener('click', () => {
    downloadQR('png');
  });
  document.getElementById('download-svg')?.addEventListener('click', () => {
    downloadQR('svg');
  });
}
