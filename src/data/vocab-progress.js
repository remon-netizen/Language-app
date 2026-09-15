// ── Vocabulary deck progress ──────────────────────────────────────────────────
// Structure: { [key]: { interval, easeFactor, repetitions, nextReview, a, c, t } }
// Scheduling reuses the SM-2 implementation the conversation words use, so the
// deck and the saved words age the same way.

import { VOCAB } from './vocab-uk.js';
import { scheduleWord } from '../words.js';

const STORAGE_KEY = 'vocabProgress';
let data = null;

function load() {
  if (data) return data;
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  return data;
}
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

export function getVocabProgress(key) { return load()[key] || null; }

// quality: 5 exact, 3 close, 1 wrong
export function recordVocab(key, quality) {
  const d = load();
  const prev = d[key] || { a: 0, c: 0 };
  const next = scheduleWord(prev, quality);
  next.a = prev.a + 1;
  next.c = prev.c + (quality >= 3 ? 1 : 0);
  next.t = Date.now();
  d[key] = next;
  save();
}

export function dueVocab() {
  const d = load(), now = Date.now();
  return VOCAB.filter(w => d[w.key] && d[w.key].nextReview <= now);
}
export function unseenVocab() {
  const d = load();
  return VOCAB.filter(w => !d[w.key]);
}
export function seenVocab() {
  const d = load();
  return VOCAB.filter(w => d[w.key]);
}
// A word counts as learned once it has been produced correctly at least twice.
export function learnedVocab() {
  const d = load();
  return VOCAB.filter(w => d[w.key] && d[w.key].c >= 2);
}
export function weakVocab() {
  const d = load();
  return VOCAB.filter(w => d[w.key] && d[w.key].a > 0 && d[w.key].c / d[w.key].a < 0.5);
}
export function vocabStats() {
  return { total: VOCAB.length, seen: seenVocab().length, learned: learnedVocab().length, due: dueVocab().length, weak: weakVocab().length };
}
