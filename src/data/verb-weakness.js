// ── Verb weakness tracker ─────────────────────────────────────────────────────
// Tracks which conjugation forms the learner gets wrong, persisted in localStorage.
// Structure: { [infinitive]: { [tense|pronoun]: { a: attempts, c: correct, t: timestamp } } }

const STORAGE_KEY = 'verbWeakness';

let data = null;

function load() {
  if (data) return data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    data = {};
  }
  return data;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function recordAnswer(infinitive, tense, pronoun, isCorrect) {
  const d = load();
  if (!d[infinitive]) d[infinitive] = {};
  const key = `${tense}|${pronoun}`;
  if (!d[infinitive][key]) d[infinitive][key] = { a: 0, c: 0, t: 0 };
  const entry = d[infinitive][key];
  entry.a++;
  if (isCorrect) entry.c++;
  entry.t = Date.now();
  save();
}

export function getVerbMastery(infinitive) {
  const d = load();
  const entries = d[infinitive];
  if (!entries) return { attempts: 0, correct: 0, pct: 0 };
  let attempts = 0, correct = 0;
  for (const e of Object.values(entries)) {
    attempts += e.a;
    correct += e.c;
  }
  return { attempts, correct, pct: attempts ? Math.round((correct / attempts) * 100) : 0 };
}

export function getAllMastery() {
  const d = load();
  const result = {};
  for (const inf of Object.keys(d)) {
    result[inf] = getVerbMastery(inf);
  }
  return result;
}

// Returns the weakest verb+tense+pronoun combos, sorted by error rate (worst first).
// Only includes items with at least 1 attempt.
export function getWeakItems(count = 25) {
  const d = load();
  const items = [];
  for (const [inf, entries] of Object.entries(d)) {
    for (const [key, e] of Object.entries(entries)) {
      if (e.a === 0) continue;
      const errorRate = 1 - (e.c / e.a);
      if (errorRate <= 0) continue; // skip perfect items
      const [tense, pronoun] = key.split('|');
      items.push({ infinitive: inf, tense, pronoun, errorRate, attempts: e.a, last: e.t });
    }
  }
  // Sort: highest error rate first, then least recent
  items.sort((a, b) => b.errorRate - a.errorRate || a.last - b.last);
  return items.slice(0, count);
}

export function hasWeaknessData() {
  const d = load();
  return Object.keys(d).length > 0;
}

export function getWeakVerbCount() {
  const items = getWeakItems(999);
  const verbs = new Set(items.map(i => i.infinitive));
  return verbs.size;
}
