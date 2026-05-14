import { downloadQR } from './qr.js';
import { getLabelConfig, drawLabeledCanvas } from './label.js';

function getQRCanvas() {
  return document.querySelector('#qr-canvas-container canvas') || null;
}

function getCompositeCanvas() {
  const canvas = getQRCanvas();
  if (!canvas) return null;
  const label = getLabelConfig();
  if (!label.text) return canvas;
  const bg = document.getElementById('bg-color')?.value || '#0c1014';
  return drawLabeledCanvas(canvas, label, bg);
}

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadPNG() {
  const canvas = getCompositeCanvas();
  if (!canvas) return;
  const label = getLabelConfig();
  if (!label.text) { downloadQR('png'); return; }
  canvas.toBlob((blob) => triggerBlobDownload(blob, 'pequod-qr.png'));
}

async function copyToClipboard() {
  const canvas = getCompositeCanvas();
  if (!canvas) return;

  const btn = document.getElementById('copy-png');

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
  if (!blob) return;

  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    flashBtn(btn, 'Copied!', true);
  } catch {
    // Clipboard API unavailable or denied — save as download instead
    triggerBlobDownload(blob, 'pequod-qr.png');
    flashBtn(btn, 'Saved PNG ↓', true);
  }
}

function flashBtn(btn, msg, ok) {
  if (!btn) return;
  const prev = btn.innerHTML;
  btn.textContent = msg;
  btn.style.color = ok ? 'var(--accent)' : 'var(--danger)';
  setTimeout(() => {
    btn.innerHTML  = prev;
    btn.style.color = '';
  }, 1600);
}

export function initExport() {
  document.getElementById('download-png')?.addEventListener('click', downloadPNG);
  document.getElementById('download-svg')?.addEventListener('click', () => downloadQR('svg'));
  document.getElementById('copy-png')?.addEventListener('click', copyToClipboard);
}
