const KEY = 'pequod-qr-presets';

export function getPresets() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function savePreset(name, config) {
  const list = getPresets();
  list.push({ id: Date.now(), name, config });
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function deletePreset(id) {
  const list = getPresets().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}
