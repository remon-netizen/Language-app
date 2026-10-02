// ── Course path: items and progress ──────────────────────────────────────────
// Every unit's words and sentences are items on the shared SM-2 schedule
// (course-progress.js). A word that is also in the core vocabulary deck is the
// deck's item: learning it here marks it there, and the vocabulary course reviews
// it, so a word never sits in two queues. Everything else is kept under
// 'pathProgress'. Which steps of a unit were done is kept under 'pathUnits'.

import { VOCAB } from './vocab-uk.js';
import { makeProgress } from './course-progress.js';
import { getVocabProgress, recordVocab, regradeVocab } from './vocab-progress.js';
import { UNITS } from './path/index.js';

const coreByUk = new Map(VOCAB.map(w => [w.uk, w]));

// A unit's words and sentences in the shape the cards want.
const cache = new Map();
export function unitItems(unit) {
  if (cache.has(unit.id)) return cache.get(unit.id);
  const words = unit.words.map(([uk, en, nl, pos, extra]) => {
    const core = coreByUk.get(uk);
    if (core) return { ...core, core: true, unitId: unit.id };
    return { key: `path:w:${uk}`, uk, en, nl, pos, theme: 'path', unitId: unit.id, core: false,
             gender: pos === 'n' ? extra : null, perfective: pos === 'v' ? extra : null };
  });
  const sentences = unit.sentences.map((s, i) => ({ key: `path:s:${unit.id}:${i}`, kind: 'sentence', unitId: unit.id, ...s }));
  const items = { words, sentences, all: [...words, ...sentences] };
  cache.set(unit.id, items);
  return items;
}
const allItems = () => UNITS.flatMap(u => unitItems(u).all);

const progress = makeProgress('pathProgress', () => allItems().filter(i => !i.core).map(i => i.key));

export const entryOf = item => (item.core ? getVocabProgress(item.key) : progress.get(item.key));
// quality: 5 exact · 4 right the easier way round · 3 close · 1 wrong. Returns the entry as it was.
export const recordItem = (item, quality) => (item.core ? recordVocab(item.key, quality) : progress.record(item.key, quality));
export const regradeItem = (item, before, quality) => (item.core ? regradeVocab(item.key, before, quality) : progress.regrade(item.key, before, quality));

// Due here = the path's own items. Core words come back through the vocabulary course.
export function dueItems() {
  const now = Date.now();
  return allItems().filter(i => { if (i.core) return false; const e = entryOf(i); return e && e.nextReview <= now; });
}

export function pathStats() {
  const items = allItems();
  const now = Date.now();
  const entries = items.map(entryOf);
  return {
    total: items.length,
    seen: entries.filter(Boolean).length,
    learned: entries.filter(e => e && e.c >= 2).length,
    due: items.filter((i, k) => !i.core && entries[k] && entries[k].nextReview <= now).length,
    weak: entries.filter(e => e && e.a > 0 && e.c / e.a < 0.5).length,
  };
}

// How far a unit is: the share of its items that were met at least once.
export function unitProgress(unit) {
  const items = unitItems(unit).all;
  if (!items.length) return 0;
  return items.filter(i => entryOf(i)).length / items.length;
}

// ── Unit steps ───────────────────────────────────────────────────────────────
// { [unitId]: { read, words, sentences, exercises } } — timestamps of when each step was done.

const STEPS_KEY = 'pathUnits';
export const STEPS = ['words', 'sentences', 'exercises'];
let steps = null;
const loadSteps = () => { if (!steps) { try { steps = JSON.parse(localStorage.getItem(STEPS_KEY)) || {}; } catch { steps = {}; } } return steps; };
export const unitState = id => loadSteps()[id] || {};
export function markUnitStep(id, step) {
  const d = loadSteps();
  d[id] = { ...(d[id] || {}), [step]: Date.now() };
  localStorage.setItem(STEPS_KEY, JSON.stringify(d));
}
export const unitDone = id => STEPS.every(s => unitState(id)[s]);
export const unitStarted = id => Object.keys(unitState(id)).length > 0;
