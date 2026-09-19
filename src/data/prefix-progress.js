// ── Prefix course progress ────────────────────────────────────────────────────
// Storage key 'prefixProgress'; structure and scheduling in course-progress.js.
// The scheduled unit is one prefixed verb (виходити, приходити …), learned a word
// family at a time. prefix-weakness.js keeps the per-question-type misses and
// marks activity, so this store does not.

import { BASE_VERBS } from './prefix-verbs.js';
import { makeProgress } from './course-progress.js';

export const prefixKey = verb => `prefix:${verb}`;
const KEYS = [...new Set(BASE_VERBS.flatMap(bv => bv.prefixed.map(pv => prefixKey(pv.verb))))];

export const prefixProgress = makeProgress('prefixProgress', () => KEYS, { activity: false });
export const prefixStats = () => prefixProgress.stats();
