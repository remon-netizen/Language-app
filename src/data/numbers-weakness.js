// ── Numbers & Time drill weakness tracker ─────────────────────────────────────
// Structure: { [itemKey]: { a: attempts, c: correct, t: lastTimestamp } }
// itemKey examples: "card:17", "ord:3:f", "time:7:30", "at:11:00"

import { markActivity } from './activity.js';

const STORAGE_KEY = 'numbersWeakness';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function recordAnswer(key, isCorrect) {
  const d = load();
  if (!d[key]) d[key] = { a: 0, c: 0, t: 0 };
  const e = d[key];
  e.a++; if (isCorrect) e.c++; e.t = Date.now();
  save();
  markActivity();
}

// 0 = never wrong (or never seen), 1 = always wrong.
export function errorRate(key) {
  const e = load()[key];
  if (!e || !e.a) return 0;
  return 1 - e.c / e.a;
}

export function attempts(key) {
  const e = load()[key];
  return e ? e.a : 0;
}

// Sampling weight: unseen items get a small boost, items you keep getting
// wrong get a big one, so the drill keeps circling back to them.
export function weight(key) {
  const e = load()[key];
  if (!e || !e.a) return 1.5;
  return 1 + 3 * (1 - e.c / e.a);
}

// Keys with prefix (e.g. "time:") that have been answered wrong more than right.
export function weakKeys(prefix = '') {
  const d = load();
  return Object.keys(d).filter(k => k.startsWith(prefix) && d[k].a > 0 && d[k].c / d[k].a < 0.5);
}

export function totalAttempts() {
  return Object.values(load()).reduce((n, e) => n + e.a, 0);
}
