// ── Generic per-item weakness tracker ─────────────────────────────────────────
// Structure in localStorage: { [key]: { a: attempts, c: correct, t: last } }
// Used by the sentence builder and dialogues; numbers-weakness.js has the same
// shape and will move onto this factory when it is next touched.

export function makeTracker(storageKey) {
  let data = null;
  const load = () => {
    if (data) return data;
    try { data = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { data = {}; }
    return data;
  };
  const save = () => localStorage.setItem(storageKey, JSON.stringify(data));

  return {
    recordAnswer(key, isCorrect) {
      const d = load();
      if (!d[key]) d[key] = { a: 0, c: 0, t: 0 };
      d[key].a++; if (isCorrect) d[key].c++; d[key].t = Date.now();
      save();
    },
    attempts(key) { return load()[key]?.a || 0; },
    errorRate(key) { const e = load()[key]; return e && e.a ? 1 - e.c / e.a : 0; },
    // Unseen items get a small boost, repeatedly missed ones a big one.
    weight(key) { const e = load()[key]; return !e || !e.a ? 1.5 : 1 + 3 * (1 - e.c / e.a); },
    weakKeys(prefix = '') {
      const d = load();
      return Object.keys(d).filter(k => k.startsWith(prefix) && d[k].a > 0 && d[k].c / d[k].a < 0.5);
    },
    seenKeys(prefix = '') { return Object.keys(load()).filter(k => k.startsWith(prefix)); },
    totalAttempts() { return Object.values(load()).reduce((n, e) => n + e.a, 0); },
    totalCorrect() { return Object.values(load()).reduce((n, e) => n + e.c, 0); },
  };
}
