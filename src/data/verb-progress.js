// ── Verb course progress ──────────────────────────────────────────────────────
// Storage key 'verbProgress'; structure and scheduling in course-progress.js.
//
// What gets scheduled is a unit, not a single form: "робити · present" or the
// aspect choice of one pair. Learning a verb pair therefore adds about eight
// things to review, not thirty-six, and a review asks one form of the tense.
// Which forms go wrong is still kept per form in verb-weakness.js (it also marks
// activity, so this store does not).

import { CONJUGATIONS } from './verb-conjugations.js';
import { VERB_PAIRS } from './verb-aspects.js';
import { makeProgress } from './course-progress.js';

export const TENSES = ['present', 'past', 'future', 'imperative'];
export const tenseKey  = (infinitive, tense) => `verb:${infinitive}|${tense}`;
export const aspectKey = pairId => `aspect:${pairId}`;

const KEYS = [
  ...CONJUGATIONS.flatMap(v => TENSES.filter(t => v[t]).map(t => tenseKey(v.infinitive, t))),
  ...VERB_PAIRS.map(p => aspectKey(p.id)),
];

export const verbProgress = makeProgress('verbProgress', () => KEYS, { activity: false });
export const verbStats = () => verbProgress.stats();
