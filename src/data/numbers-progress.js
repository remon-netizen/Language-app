// ── Numbers course progress ───────────────────────────────────────────────────
// Storage key 'numbersProgress'; structure and scheduling in course-progress.js.
// Only course items are scheduled: the free drill's other numbers are ignored.
// Activity is already marked by numbers-weakness.js, which every answer also feeds.

import { COURSE } from './numbers-course.js';
import { makeProgress } from './course-progress.js';

const BY_KEY = new Map(COURSE.map(c => [c.item.key, c]));
const progress = makeProgress('numbersProgress', () => COURSE.map(c => c.item.key), { activity: false });
const entries = keys => keys.map(k => BY_KEY.get(k));

// quality: 5 typed exactly, 4 read or heard correctly, 3 close or chosen, 1 wrong
export const recordNumber  = (key, quality) => progress.record(key, quality);
export const dueNumbers    = () => entries(progress.dueKeys());
export const unseenNumbers = () => entries(progress.unseenKeys());
export const numbersStats  = () => progress.stats();
