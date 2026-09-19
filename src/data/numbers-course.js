// ── Numbers & time as a course ────────────────────────────────────────────────
// The drill asks at random; the course is a fixed path through the same items,
// learned ten at a time like the vocabulary deck: first with the word shown,
// then from memory, then on an SM-2 schedule (numbers-progress.js).
//
// Nobody learns 10 000 numbers one by one. The stages teach the building blocks
// (0–19, the tens, the hundreds, тисяча) and a handful of compounds per pattern;
// the random drill is where the patterns get applied to numbers never seen before.
// Items keep the drill's keys ("card:17"), so both feed the same weak spots.

import { cardinalItem, ordinalItem, dateItem, timeItem } from './numbers-time.js';

const range = (a, b, step = 1) => { const r = []; for (let i = a; i <= b; i += step) r.push(i); return r; };

export const STAGES = [
  { id: 'zero-ten',  icon: '🔢', title: { en: '0 – 10', nl: '0 – 10' },
    items: range(0, 10).map(cardinalItem) },
  { id: 'teens',     icon: '🔢', title: { en: '11 – 19', nl: '11 – 19' },
    items: range(11, 19).map(cardinalItem) },
  { id: 'tens',      icon: '🔟', title: { en: 'The tens and 100', nl: 'De tientallen en 100' },
    items: range(20, 100, 10).map(cardinalItem) },
  { id: 'compose',   icon: '🧩', title: { en: 'Tens + units', nl: 'Tientallen + eenheden' },
    items: [21, 32, 43, 54, 65, 76, 87, 98].map(cardinalItem) },
  { id: 'hundreds',  icon: '💯', title: { en: 'The hundreds', nl: 'De honderdtallen' },
    items: range(200, 900, 100).map(cardinalItem) },
  { id: 'thousands', icon: '🏔️', title: { en: 'Thousands', nl: 'Duizendtallen' },
    items: [1000, 2000, 5000, 10000, 21000, 100000].map(cardinalItem) },
  { id: 'years',     icon: '📆', title: { en: 'Big numbers and years', nl: 'Grote getallen en jaartallen' },
    items: [101, 150, 365, 999, 1991, 2014, 2022, 2026].map(cardinalItem) },
  { id: 'ordinals',  icon: '🥇', title: { en: 'First to twelfth', nl: 'Eerste tot twaalfde' },
    items: range(1, 12).map(n => ordinalItem(n, 'm')) },
  { id: 'ordinals-fn', icon: '🥈', title: { en: 'Ordinals: feminine and neuter', nl: 'Rangtelwoorden: vrouwelijk en onzijdig' },
    items: [1, 2, 3].flatMap(n => [ordinalItem(n, 'f'), ordinalItem(n, 'n')]) },
  { id: 'hours',     icon: '🕰️', title: { en: 'Full hours', nl: 'Hele uren' },
    items: range(1, 12).map(h => timeItem(h, 0)) },
  { id: 'half-quarter', icon: '🕜', title: { en: 'Half and quarter hours', nl: 'Halve uren en kwartieren' },
    items: [1, 4, 7, 10].flatMap(h => [30, 15, 45].map(m => timeItem(h, m))) },
  { id: 'at-time',   icon: '⏰', title: { en: 'At … o\'clock', nl: 'Om … uur' },
    items: [...range(1, 12).map(h => timeItem(h, 0, true)), timeItem(7, 30, true), timeItem(8, 15, true), timeItem(9, 45, true)] },
  { id: 'dates',     icon: '📅', title: { en: 'Dates, one per month', nl: 'Datums, één per maand' },
    items: [[1, 1], [14, 2], [8, 3], [21, 4], [5, 5], [28, 6], [17, 7], [24, 8], [19, 9], [3, 10], [11, 11], [25, 12]].map(([d, m]) => dateItem(d, m)) },
];

export const COURSE = STAGES.flatMap(st => st.items.map(item => ({ item, stage: st })));
const BY_KEY = new Map(COURSE.map(c => [c.item.key, c]));
export const inCourse = key => BY_KEY.has(key);
