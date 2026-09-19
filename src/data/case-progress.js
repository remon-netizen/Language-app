// ── Case course progress ──────────────────────────────────────────────────────
// Storage key 'caseProgress'; structure and scheduling in course-progress.js.
//
// The scheduled unit is one noun in one number ("книга · singular"): Learn One on
// a noun adds two things to review, and a review asks one of its seven cases.
// Which forms go wrong is kept per form in case-weakness.js, which also marks
// activity, so this store does not.

import { NOUNS } from './case-declensions.js';
import { makeProgress } from './course-progress.js';

export const NUMBERS = ['singular', 'plural'];
export const nounKey = (nomS, number) => `noun:${nomS}|${number}`;

const KEYS = NOUNS.flatMap(n => NUMBERS.filter(num => n[num]).map(num => nounKey(n.nom_s, num)));

export const caseProgress = makeProgress('caseProgress', () => KEYS, { activity: false });
export const caseStats = () => caseProgress.stats();
