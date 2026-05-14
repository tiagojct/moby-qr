export function getLabelConfig() {
  return {
    text:  (document.getElementById('label-text')?.value || '').trim(),
    color: document.getElementById('label-color')?.value || '#d4c5a9',
    size:  parseInt(document.getElementById('label-size')?.value || '16', 10),
  };
}

export function drawLabeledCanvas(sourceCanvas, label, bgColor = '#0c1014') {
  const padding    = 14;
  const lineHeight = Math.ceil(label.size * 1.5);
  const newH       = sourceCanvas.height + lineHeight + padding * 2;

  const c   = document.createElement('canvas');
  c.width   = sourceCanvas.width;
  c.height  = newH;
  const ctx = c.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, c.width, newH);
  ctx.drawImage(sourceCanvas, 0, 0);

  ctx.font         = `${label.size}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle    = label.color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.text, c.width / 2, sourceCanvas.height + padding + lineHeight / 2);

  return c;
}

export function updateLabelPreview(label) {
  const wrap = document.getElementById('label-preview');
  const text = document.getElementById('label-preview-text');
  if (!wrap || !text) return;

  if (!label.text) {
    wrap.hidden = true;
    return;
  }

  wrap.hidden   = false;
  text.textContent = label.text;
  text.style.color    = label.color;
  text.style.fontSize = `${label.size}px`;
}
