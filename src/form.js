const QR_TYPES = {
  url: {
    icon: 'ph-globe',
    label: 'A Distant Shore — URL',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-url">URL</label>
        <input id="f-url" type="url" class="input-text" placeholder="https://example.com" autocomplete="off" />
      </div>
    `,
    buildData: () => {
      const v = val('f-url');
      return v;
    },
  },

  text: {
    icon: 'ph-text-t',
    label: 'Words in the Water — Plain text',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-text">Text</label>
        <textarea id="f-text" class="input-textarea" placeholder="Enter any text…" rows="4"></textarea>
      </div>
    `,
    buildData: () => val('f-text'),
  },

  vcard: {
    icon: 'ph-address-book',
    label: "A Sailor's Manifest — vCard",
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-vc-first">First name</label>
        <input id="f-vc-first" type="text" class="input-text" placeholder="Herman" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-vc-last">Last name</label>
        <input id="f-vc-last" type="text" class="input-text" placeholder="Melville" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-vc-phone">Phone</label>
        <input id="f-vc-phone" type="tel" class="input-text" placeholder="+1 555 000 0000" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-vc-email">Email</label>
        <input id="f-vc-email" type="email" class="input-text" placeholder="herman@pequod.sea" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-vc-org">Organisation</label>
        <input id="f-vc-org" type="text" class="input-text" placeholder="Pequod Whaling Co." autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-vc-url">URL</label>
        <input id="f-vc-url" type="url" class="input-text" placeholder="https://pequod.sea" autocomplete="off" />
      </div>
    `,
    buildData: () => {
      const first = val('f-vc-first');
      const last  = val('f-vc-last');
      if (!first && !last) return '';
      const fn = [first, last].filter(Boolean).join(' ');
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escVCard(last)};${escVCard(first)};;;`,
        `FN:${escVCard(fn)}`,
      ];
      const org   = val('f-vc-org');
      const phone = val('f-vc-phone');
      const email = val('f-vc-email');
      const url   = val('f-vc-url');
      if (org)   lines.push(`ORG:${escVCard(org)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${escVCard(email)}`);
      if (url)   lines.push(`URL:${url}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    },
  },

  wifi: {
    icon: 'ph-wifi-high',
    label: 'The Wireless Sea — Wi-Fi',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-wifi-ssid">Network name (SSID)</label>
        <input id="f-wifi-ssid" type="text" class="input-text" placeholder="Pequod_5G" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-wifi-pass">Password</label>
        <input id="f-wifi-pass" type="text" class="input-text" placeholder="••••••••" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-wifi-enc">Encryption</label>
        <select id="f-wifi-enc" class="input-select">
          <option value="WPA">WPA / WPA2</option>
          <option value="WEP">WEP</option>
          <option value="nopass">None (open)</option>
        </select>
      </div>
      <div class="wifi-hidden-row">
        <label class="toggle-label">
          <input type="checkbox" id="f-wifi-hidden" class="input-checkbox" />
          <span class="toggle-text">Hidden network</span>
        </label>
      </div>
    `,
    buildData: () => {
      const ssid = val('f-wifi-ssid');
      if (!ssid) return '';
      const pass   = val('f-wifi-pass');
      const enc    = val('f-wifi-enc') || 'WPA';
      const hidden = document.getElementById('f-wifi-hidden')?.checked ? 'true' : 'false';
      const esc = (s) => s.replace(/([\\;,":"])/g, '\\$1');
      let str = `WIFI:T:${enc};S:${esc(ssid)};`;
      if (enc !== 'nopass' && pass) str += `P:${esc(pass)};`;
      str += `H:${hidden};;`;
      return str;
    },
  },

  email: {
    icon: 'ph-envelope',
    label: 'Letter from the Deep — Email',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-email-to">To</label>
        <input id="f-email-to" type="email" class="input-text" placeholder="captain@pequod.sea" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-email-subj">Subject</label>
        <input id="f-email-subj" type="text" class="input-text" placeholder="Sighted the White Whale" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-email-body">Body</label>
        <textarea id="f-email-body" class="input-textarea" placeholder="Your message…" rows="4"></textarea>
      </div>
    `,
    buildData: () => {
      const to = val('f-email-to');
      if (!to) return '';
      const subj = val('f-email-subj');
      const body = val('f-email-body');
      let href = `mailto:${to}`;
      const params = [];
      if (subj) params.push(`subject=${encodeURIComponent(subj)}`);
      if (body) params.push(`body=${encodeURIComponent(body)}`);
      if (params.length) href += `?${params.join('&')}`;
      return href;
    },
  },

  sms: {
    icon: 'ph-chat-circle-text',
    label: 'Signal Flare — SMS',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-sms-num">Phone number</label>
        <input id="f-sms-num" type="tel" class="input-text" placeholder="+1 555 000 0000" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-sms-msg">Message</label>
        <textarea id="f-sms-msg" class="input-textarea" placeholder="Your message…" rows="3"></textarea>
      </div>
    `,
    buildData: () => {
      const num = val('f-sms-num');
      if (!num) return '';
      const msg = val('f-sms-msg');
      return msg ? `SMSTO:${num}:${msg}` : `SMSTO:${num}`;
    },
  },

  geo: {
    icon: 'ph-map-pin',
    label: 'Mark the Chart — Coordinates',
    fields: () => `
      <div class="field-row">
        <label class="field-label" for="f-geo-lat">Latitude</label>
        <input id="f-geo-lat" type="number" class="input-text" placeholder="48.8566" step="any" min="-90" max="90" autocomplete="off" />
      </div>
      <div class="field-row">
        <label class="field-label" for="f-geo-lng">Longitude</label>
        <input id="f-geo-lng" type="number" class="input-text" placeholder="2.3522" step="any" min="-180" max="180" autocomplete="off" />
      </div>
    `,
    buildData: () => {
      const lat = val('f-geo-lat');
      const lng = val('f-geo-lng');
      if (!lat || !lng) return '';
      return `geo:${lat},${lng}`;
    },
  },
};

function val(id) {
  return (document.getElementById(id)?.value || '').trim();
}

function escVCard(s) {
  return s.replace(/[\\,;]/g, '\\$&');
}

let currentType = 'url';
let onChangeCallback = null;

export function initForm(onChange) {
  onChangeCallback = onChange;

  const typeSelect = document.getElementById('qr-type');
  typeSelect.addEventListener('change', () => {
    currentType = typeSelect.value;
    renderFields(currentType);
    onChange(buildData());
  });

  renderFields(currentType);
}

export function buildData() {
  return QR_TYPES[currentType]?.buildData() ?? '';
}

function renderFields(type) {
  const container = document.getElementById('qr-fields');
  const def = QR_TYPES[type];
  if (!def) return;

  container.innerHTML = `
    <div class="form-type-header">
      <${def.icon} size="16"></${def.icon}>
      ${def.label}
    </div>
    ${def.fields()}
  `;

  container.querySelectorAll('input, textarea, select').forEach((el) => {
    el.addEventListener('input', () => onChangeCallback?.(buildData()));
    el.addEventListener('change', () => onChangeCallback?.(buildData()));
  });
}
