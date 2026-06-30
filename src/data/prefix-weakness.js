// ── Prefix drill weakness tracker ─────────────────────────────────────────────
// Structure: { [prefixedVerb]: { [exerciseType]: { a: attempts, c: correct, t: timestamp } } }

const STORAGE_KEY = 'prefixWeakness';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function recordAnswer(verb, type, isCorrect) {
  const d = load();
  if (!d[verb]) d[verb] = {};
  if (!d[verb][type]) d[verb][type] = { a: 0, c: 0, t: 0 };
  const e = d[verb][type];
  e.a++; if (isCorrect) e.c++; e.t = Date.now();
  save();
}

export function getVerbMastery(verb) {
  const d = load();
  const entries = d[verb];
  if (!entries) return { attempts: 0, correct: 0, pct: 0 };
  let attempts = 0, correct = 0;
  for (const e of Object.values(entries)) { attempts += e.a; correct += e.c; }
  return { attempts, correct, pct: attempts ? Math.round((correct / attempts) * 100) : 0 };
}

export function getAllMastery() {
  const d = load();
  const result = {};
  for (const verb of Object.keys(d)) result[verb] = getVerbMastery(verb);
  return result;
}

export function getWeakItems(count = 25) {
  const d = load();
  const items = [];
  for (const [verb, entries] of Object.entries(d)) {
    for (const [type, e] of Object.entries(entries)) {
      if (e.a === 0) continue;
      const errorRate = 1 - (e.c / e.a);
      if (errorRate <= 0) continue;
      items.push({ verb, type, errorRate, attempts: e.a, last: e.t });
    }
  }
  items.sort((a, b) => b.errorRate - a.errorRate || a.last - b.last);
  return items.slice(0, count);
}

export function hasWeaknessData() { return Object.keys(load()).length > 0; }
export function getWeakVerbCount() {
  return new Set(getWeakItems(999).map(i => i.verb)).size;
}
