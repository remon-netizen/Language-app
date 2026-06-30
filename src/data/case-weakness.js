// ── Case drill weakness tracker ───────────────────────────────────────────────
// Structure: { [nom_s]: { [case|number]: { a: attempts, c: correct, t: timestamp } } }

const STORAGE_KEY = 'caseWeakness';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function recordAnswer(noun, caseName, number, isCorrect) {
  const d = load();
  if (!d[noun]) d[noun] = {};
  const key = `${caseName}|${number}`;
  if (!d[noun][key]) d[noun][key] = { a: 0, c: 0, t: 0 };
  const e = d[noun][key];
  e.a++; if (isCorrect) e.c++; e.t = Date.now();
  save();
}

export function getNounMastery(noun) {
  const d = load();
  const entries = d[noun];
  if (!entries) return { attempts: 0, correct: 0, pct: 0 };
  let attempts = 0, correct = 0;
  for (const e of Object.values(entries)) { attempts += e.a; correct += e.c; }
  return { attempts, correct, pct: attempts ? Math.round((correct / attempts) * 100) : 0 };
}

export function getAllMastery() {
  const d = load();
  const result = {};
  for (const noun of Object.keys(d)) result[noun] = getNounMastery(noun);
  return result;
}

export function getWeakItems(count = 25) {
  const d = load();
  const items = [];
  for (const [noun, entries] of Object.entries(d)) {
    for (const [key, e] of Object.entries(entries)) {
      if (e.a === 0) continue;
      const errorRate = 1 - (e.c / e.a);
      if (errorRate <= 0) continue;
      const [caseName, number] = key.split('|');
      items.push({ noun, caseName, number, errorRate, attempts: e.a, last: e.t });
    }
  }
  items.sort((a, b) => b.errorRate - a.errorRate || a.last - b.last);
  return items.slice(0, count);
}

export function hasWeaknessData() { return Object.keys(load()).length > 0; }
export function getWeakNounCount() {
  const verbs = new Set(getWeakItems(999).map(i => i.noun));
  return verbs.size;
}
