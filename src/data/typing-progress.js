// ── Typing course: what is kept ───────────────────────────────────────────────
// Under 'typingProgress':
//   stages  { [id]: { done, last, runs, cpm, acc } }  when a step was first finished and
//           the best speed (characters a minute) and accuracy (0–1) reached on it
//   keys    { [letter]: [seen, missed] }  how often a letter was due and how often
//           the wrong key was hit instead. Halved now and then, so that what counts
//           is how it goes lately, not how it went in the first week.
// Typing is practice, not memory work: nothing here is on the review schedule.

import { markActivity } from './activity.js';
import { STAGES } from './typing.js';

const KEY = 'typingProgress';
let data = null;
function load() {
  if (!data) { try { data = JSON.parse(localStorage.getItem(KEY)) || {}; } catch { data = {}; } }
  data.stages = data.stages || {};
  data.keys = data.keys || {};
  return data;
}
const save = () => localStorage.setItem(KEY, JSON.stringify(load()));

export const stageRecord = id => load().stages[id] || null;

// A finished round of a step. Returns whether it beat the step's best speed.
export function recordRound(id, { cpm, acc }) {
  const d = load();
  const prev = d.stages[id] || {};
  const record = !!prev.cpm && cpm > prev.cpm;
  d.stages[id] = {
    done: prev.done || Date.now(), last: Date.now(), runs: (prev.runs || 0) + 1,
    cpm: Math.max(prev.cpm || 0, cpm || 0), acc: Math.max(prev.acc || 0, acc || 0),
  };
  save();
  return record;
}

// One key press: the letter that was due, and whether it was hit. Kept in memory
// and written with the next round or flush(), not on every key.
export function noteKey(letter, hit) {
  const k = load().keys;
  const e = k[letter] || (k[letter] = [0, 0]);
  e[0]++; if (!hit) e[1]++;
  if (e[0] > 40) { e[0] /= 2; e[1] /= 2; }
}
export const flush = save;

// One answered card of the course counts towards the day's activity, like any other.
export const noteAnswer = () => markActivity();

// Letters that go wrong at least one time in five, worst first.
export function troubleLetters(max = 4) {
  return Object.entries(load().keys)
    .filter(([, [seen, missed]]) => seen >= 12 && missed / seen >= 0.2)
    .sort((a, b) => b[1][1] / b[1][0] - a[1][1] / a[1][0])
    .slice(0, max).map(([letter]) => letter);
}

export function typingStats() {
  const s = load().stages;
  const done = STAGES.filter(x => s[x.id]?.done).length;
  const best = Math.max(0, ...Object.values(s).map(x => x.cpm || 0));
  return { done, total: STAGES.length, best, started: Object.keys(s).length > 0 };
}
export const nextStage = () => STAGES.find(x => !load().stages[x.id]?.done) || null;
