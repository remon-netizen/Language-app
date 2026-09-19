// ── Numbers course progress ───────────────────────────────────────────────────
// Structure: { [key]: { interval, easeFactor, repetitions, nextReview, a, c, t } }
// Same SM-2 code as the vocabulary deck and the saved words.

import { COURSE, inCourse } from './numbers-course.js';
import { scheduleWord } from '../words.js';

const STORAGE_KEY = 'numbersProgress';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

// quality: 5 typed exactly, 4 read or heard correctly, 3 close or chosen, 1 wrong.
// Only course items are scheduled; the random drill's other numbers are not.
export function recordNumber(key, quality) {
  if (!inCourse(key)) return;
  const d = load();
  const prev = d[key] || { a: 0, c: 0 };
  const next = scheduleWord(prev, quality);
  next.a = prev.a + 1;
  next.c = prev.c + (quality >= 3 ? 1 : 0);
  next.t = Date.now();
  d[key] = next;
  save();
}

export function dueNumbers() {
  const d = load(), now = Date.now();
  return COURSE.filter(c => d[c.item.key] && d[c.item.key].nextReview <= now);
}
export function unseenNumbers() {
  const d = load();
  return COURSE.filter(c => !d[c.item.key]);
}
export function numbersStats() {
  const d = load();
  const seen = COURSE.filter(c => d[c.item.key]);
  return {
    total: COURSE.length,
    seen: seen.length,
    // learned = answered correctly at least twice, as in the vocabulary deck
    learned: seen.filter(c => d[c.item.key].c >= 2).length,
    due: dueNumbers().length,
  };
}
