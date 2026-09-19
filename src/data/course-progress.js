// ── Course progress ───────────────────────────────────────────────────────────
// One progress store for every course (vocabulary, numbers, …), one per storage key.
// Sessions are run by grammar/course-engine.js.

import { scheduleWord } from '../words.js';
import { markActivity } from './activity.js';

// { [key]: { interval, easeFactor, repetitions, nextReview, a, c, t } }
// Same SM-2 code as the saved words, so everything ages the same way.
// quality: 5 produced exactly · 4 right the easier way round · 3 close or chosen · 1 wrong

export function makeProgress(storageKey, allKeys, { activity = true } = {}) {
  let data = null, known = null;
  const load = () => {
    if (!data) { try { data = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { data = {}; } }
    return data;
  };
  const save = () => localStorage.setItem(storageKey, JSON.stringify(data));
  const keys = () => allKeys();
  const has = key => (known ||= new Set(keys())).has(key);

  const api = {
    get: key => load()[key] || null,
    has,
    // Returns the entry as it was before, so a wrong verdict can be taken back.
    record(key, quality) {
      if (!has(key)) return null;
      const d = load();
      const before = d[key] || null;
      const prev = before || { a: 0, c: 0 };
      const next = scheduleWord(prev, quality);
      next.a = prev.a + 1;
      next.c = prev.c + (quality >= 3 ? 1 : 0);
      next.t = Date.now();
      d[key] = next;
      save();
      if (activity) markActivity();
      return before;
    },
    // "My answer was right too": put the entry back and grade the answer again.
    regrade(key, before, quality) {
      const d = load();
      if (before) d[key] = before; else delete d[key];
      const wasActive = activity; activity = false; // the first verdict already counted as activity
      api.record(key, quality);
      activity = wasActive;
    },
    dueKeys()    { const d = load(), now = Date.now(); return keys().filter(k => d[k] && d[k].nextReview <= now); },
    unseenKeys() { const d = load(); return keys().filter(k => !d[k]); },
    seenKeys()   { const d = load(); return keys().filter(k => d[k]); },
    // learned = answered correctly at least twice
    learnedKeys() { const d = load(); return keys().filter(k => d[k] && d[k].c >= 2); },
    weakKeys()   { const d = load(); return keys().filter(k => d[k] && d[k].a > 0 && d[k].c / d[k].a < 0.5); },
    stats() {
      return { total: keys().length, seen: api.seenKeys().length, learned: api.learnedKeys().length, due: api.dueKeys().length, weak: api.weakKeys().length };
    },
  };
  return api;
}

