// ── Vocabulary deck: words and progress ───────────────────────────────────────
// The deck is the core list (Ukrainian only, data/vocab-uk.js) plus the learner's
// own words: everything saved from a conversation is the theme "My words", asked
// and scheduled exactly like a core word. For the other target languages the deck
// is My words alone.
//
// Core words keep their progress under 'vocabProgress' (course-progress.js). A saved
// word carries its schedule on itself in 'savedWords', as it always did, so words
// reviewed with the old flashcards keep their due dates.

import { state } from '../state.js';
import { VOCAB } from './vocab-uk.js';
import { makeProgress } from './course-progress.js';
import { loadSavedWords, scheduleWord, updateWordAfterReview } from '../words.js';
import { markActivity } from './activity.js';

const core = () => (state.currentLanguage === 'uk' ? VOCAB : []);
const progress = makeProgress('vocabProgress', () => VOCAB.map(w => w.key));

// ── My words ─────────────────────────────────────────────────────────────────

const SAVED = 'saved:';
// A saved word in the shape of a deck word. The translation was looked up in the
// learner's own language, so it serves as the meaning whichever language is set now.
// A lookup lists meanings as "comfortable, convenient"; the deck separates accepted
// answers with " / ", so that typing one of them is enough.
const asMeaning = t => t.replace(/\s*[;,]\s*/g, ' / ');
const toDeckWord = w => ({
  key: SAVED + w.word, uk: w.word, en: asMeaning(w.translation), nl: asMeaning(w.translation),
  pos: 'saved', posText: w.part_of_speech_target || w.part_of_speech || '', details: w.details || '',
  theme: 'mine', gender: null, perfective: null, saved: w,
});
export const myWords = () => loadSavedWords().filter(w => w.translation).map(toDeckWord);
export const deck = () => [...core(), ...myWords()];

// Words reviewed with the old flashcards have a schedule but no answer counts.
const savedEntry = w => (w.nextReview || w.a ? {
  interval: w.interval, easeFactor: w.easeFactor, repetitions: w.repetitions, nextReview: w.nextReview || 0,
  a: w.a ?? 1, c: w.c ?? (w.repetitions || 0), t: w.t || 0,
} : null);

function recordSaved(key, quality) {
  const w = loadSavedWords().find(x => SAVED + x.word === key);
  if (!w) return null;
  const before = { ...w };
  const prev = savedEntry(w) || { a: 0, c: 0 };
  updateWordAfterReview({ ...scheduleWord(w, quality), a: prev.a + 1, c: prev.c + (quality >= 3 ? 1 : 0), t: Date.now() });
  markActivity();
  return before;
}

// ── Progress over the whole deck ─────────────────────────────────────────────

const isSaved = key => key.startsWith(SAVED);
const entryOf = w => (w.saved ? savedEntry(w.saved) : progress.get(w.key));

export const getVocabProgress = key => entryOf(deck().find(w => w.key === key) || { key });

// quality: 5 exact, 4 right the easier way round, 3 close, 1 wrong. Returns the entry as it was.
export const recordVocab = (key, quality) => (isSaved(key) ? recordSaved(key, quality) : progress.record(key, quality));
export function regradeVocab(key, before, quality) {
  if (!isSaved(key)) return progress.regrade(key, before, quality);
  if (before) updateWordAfterReview(before);
  recordSaved(key, quality);
}

export const unseenVocab = () => deck().filter(w => !entryOf(w));          // in learning order, my words last
export const dueVocab    = () => { const now = Date.now(); return deck().filter(w => { const e = entryOf(w); return e && e.nextReview <= now; }); };
export const weakVocab   = () => deck().filter(w => { const e = entryOf(w); return e && e.a > 0 && e.c / e.a < 0.5; });
export function vocabStats() {
  const entries = deck().map(entryOf);
  const now = Date.now();
  return {
    total: entries.length,
    seen: entries.filter(Boolean).length,
    learned: entries.filter(e => e && e.c >= 2).length,   // produced correctly at least twice
    due: entries.filter(e => e && e.nextReview <= now).length,
    weak: entries.filter(e => e && e.a > 0 && e.c / e.a < 0.5).length,
  };
}
