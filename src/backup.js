// ── Backup: all progress as one file, and back ───────────────────────────────
// Everything the app keeps lives in this browser's localStorage: course
// progress and schedules, learned phrases, saved words, unit steps, activity,
// settings. A backup is one JSON file with every key except the API keys
// (secrets stay on the device). Restoring replaces the device's data with the
// file's and reloads, so a browser reset or a new phone costs nothing.

const SECRETS = new Set(['geminiKey', 'anthropicKey']);
const LAST = 'lastBackup';
const FORMAT = 'language-app-backup';

export function backupData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!SECRETS.has(k) && k !== LAST) data[k] = localStorage.getItem(k);
  }
  return { format: FORMAT, version: 1, exported: new Date().toISOString(), keys: Object.keys(data).length, data };
}

// Hands the browser a file to save; on a phone that is the share / save sheet.
export function downloadBackup() {
  const b = backupData();
  const blob = new Blob([JSON.stringify(b)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `language-app-backup-${b.exported.slice(0, 10)}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  localStorage.setItem(LAST, String(Date.now()));
  return b;
}

export const lastBackup = () => Number(localStorage.getItem(LAST)) || 0;

// Throws 'not-json' or 'not-backup'; otherwise returns the parsed backup.
export function parseBackup(text) {
  let b;
  try { b = JSON.parse(text); } catch { throw new Error('not-json'); }
  if (!b || b.format !== FORMAT || !b.data || typeof b.data !== 'object') throw new Error('not-backup');
  return b;
}

// Replace the device's data with the backup's. API keys on the device are kept.
export function restoreBackup(b) {
  const keep = {};
  for (const k of SECRETS) { const v = localStorage.getItem(k); if (v) keep[k] = v; }
  localStorage.clear();
  for (const [k, v] of Object.entries(b.data)) if (typeof v === 'string') localStorage.setItem(k, v);
  for (const [k, v] of Object.entries(keep)) localStorage.setItem(k, v);
}
