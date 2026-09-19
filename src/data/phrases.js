// ── Phrases learned in lessons ────────────────────────────────────────────────
// Every phrase practised in a lesson (or a homework lesson) lands here and comes
// back for recall: see the meaning, say or type the phrase. Scheduled with the
// same SM-2 code as every course, so phrases sit in the one Review queue.
//
// Storage key 'learnedPhrases': [{ target, ph, translations, tip, lang, firstLearned,
//   lastPractised, practiceCount, lastReviewed, reviewScore,
//   interval, easeFactor, repetitions, nextReview, a, c }]

import { state } from '../state.js';
import { getTargetText } from './lesson-helpers.js';
import { scheduleWord } from '../words.js';
import { markActivity } from './activity.js';

const STORAGE_KEY = 'learnedPhrases';
const HOUR = 3600_000;

// Phrases used to wait out a cooldown that grew with their rolling score
// (0 → now, 50 → ~18 h, 80 → ~46 h, 100 → 72 h). Entries from then get the due
// date that cooldown would have given them, so nothing is reset.
function migrate(p) {
  if (p.nextReview !== undefined) return p;
  const score = p.reviewScore || 0;
  const cooldown = Math.pow(score / 100, 2) * 72 * HOUR;
  return { ...p,
    nextReview: p.lastReviewed ? p.lastReviewed + cooldown : 0,
    interval: Math.max(1, Math.round(cooldown / (24 * HOUR))), easeFactor: 2.5,
    repetitions: !p.lastReviewed ? 0 : score >= 85 ? 2 : score >= 60 ? 1 : 0,
    a: p.lastReviewed ? 1 : 0, c: p.lastReviewed && score >= 60 ? 1 : 0 };
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]').map(migrate); }
  catch { return []; }
}
const save = phrases => localStorage.setItem(STORAGE_KEY, JSON.stringify(phrases));
const mine = () => load().filter(p => p.lang === state.currentLanguage);

// Called for every phrase practised in a lesson. Deduplicates on the target text.
export function markPhraseAsLearned(phrase) {
  const target = getTargetText(phrase);
  if (!target) return;
  const learned = load();
  const existing = learned.find(p => p.target === target);
  if (existing) {
    existing.lastPractised = Date.now();
    existing.practiceCount = (existing.practiceCount || 0) + 1;
  } else {
    learned.push(migrate({
      target, ph: phrase.ph || '', translations: phrase.translations || {}, tip: phrase.tip || {},
      firstLearned: Date.now(), lastPractised: Date.now(), lastReviewed: 0,
      practiceCount: 1, reviewScore: 0, lang: state.currentLanguage,
    }));
  }
  save(learned);
}

export const getLearnedCount = () => mine().length;
export const getDuePhrases = () => { const now = Date.now(); return mine().filter(p => p.nextReview <= now); };

// score: 0–100 similarity of what was said or typed. Returns the entry as it was.
export function recordPhrase(target, score, quality) {
  const learned = load();
  const i = learned.findIndex(p => p.target === target);
  if (i === -1) return null;
  const before = { ...learned[i] };
  const p = scheduleWord(learned[i], quality);
  p.a = (before.a || 0) + 1;
  p.c = (before.c || 0) + (quality >= 3 ? 1 : 0);
  p.lastReviewed = Date.now();
  p.reviewScore = before.reviewScore ? Math.round(before.reviewScore * 0.6 + score * 0.4) : score; // rolling average
  learned[i] = p;
  save(learned);
  markActivity();
  return before;
}
// "My answer was right too": speech recognition mishears, typing has synonyms.
export function regradePhrase(target, before, quality) {
  const learned = load();
  const i = learned.findIndex(p => p.target === target);
  if (i === -1 || !before) return;
  learned[i] = before;
  save(learned);
  recordPhrase(target, 90, quality);
}

export function phraseStats() {
  const all = mine();
  return { total: all.length, seen: all.filter(p => p.lastReviewed).length,
           learned: all.filter(p => (p.c || 0) >= 2).length, due: getDuePhrases().length, weak: 0 };
}
