// ── Vocabulary deck progress ──────────────────────────────────────────────────
// Storage key 'vocabProgress'; structure and scheduling in course-progress.js.

import { VOCAB } from './vocab-uk.js';
import { makeProgress } from './course-progress.js';

const BY_KEY = new Map(VOCAB.map(w => [w.key, w]));
const progress = makeProgress('vocabProgress', () => VOCAB.map(w => w.key));
const words = keys => keys.map(k => BY_KEY.get(k));

export const getVocabProgress = key => progress.get(key);
// quality: 5 exact, 4 right the easier way round, 3 close, 1 wrong. Returns the entry as it was.
export const recordVocab  = (key, quality) => progress.record(key, quality);
export const regradeVocab = (key, before, quality) => progress.regrade(key, before, quality);
export const dueVocab     = () => words(progress.dueKeys());
export const unseenVocab  = () => words(progress.unseenKeys());   // in learning order
export const weakVocab    = () => words(progress.weakKeys());
export const vocabStats   = () => progress.stats();
