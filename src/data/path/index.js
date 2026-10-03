// ── Course path: a structured Ukrainian course from A1 to B2 ──────────────────
// The spine follows the Ukrainian state standard "Українська мова як іноземна,
// рівні А1–С2" (National Commission on State Language Standards, 2024) and the
// Lviv University standard it grew from: per level, their grammar lists and
// communicative themes, in their order. One unit = one grammar point in one theme.
//
// A unit (one entry in a1.js … b2.js):
//   id        'a1-04'                      level 'A1' · icon an emoji
//   track     'ew' on the work units (electronic warfare), interleaved with the others
//   title     { en, nl }                   what the unit is about, a few words
//   grammar   { en, nl }                   the grammar point, a few words
//   explain   { en, nl }                   the explanation, markdown-lite:
//                                            blank line = new paragraph
//                                            "- " = bullet · "> uk — gloss" = example line
//                                            **bold** · `code`
//   words     [[uk, en, nl, pos, extra]]   12–16 new words; pos/extra as in vocab-uk.js
//                                          (n: extra = gender m/f/n/pl · v: extra = perfective)
//   sentences [{ uk, en, nl, hint, note }] 8–10 sentences that use the grammar point;
//                                          hint = the words in dictionary form,
//                                          note = { en, nl } the one thing to notice
//   exercises [{ type, uk, en, nl, note?, …}]
//               gap    uk has "___", answer = the missing form ("a / b" = both accepted)
//               choose options = ['…','…','…'], correct = index of the right one
//
// Words and sentences are scheduled (one SM-2 queue with every other course, see
// path-progress.js). Exercises are practice inside the unit and are not scheduled.
// A word that is already in the core vocabulary deck keeps its schedule there.

import { A1 } from './a1.js';
import { A2 } from './a2.js';
import { B1 } from './b1.js';
import { B2 } from './b2.js';

export const LEVELS = [
  { id: 'A1', name: { en: 'A1 · Beginner',           nl: 'A1 · Beginner' },       sub: { en: 'first contact, the basics',           nl: 'eerste contact, de basis' } },
  { id: 'A2', name: { en: 'A2 · Elementary',         nl: 'A2 · Basis' },          sub: { en: 'everyday situations',                 nl: 'alledaagse situaties' } },
  { id: 'B1', name: { en: 'B1 · Intermediate',       nl: 'B1 · Middenniveau' },   sub: { en: 'opinions, past and future, stories',  nl: 'meningen, verleden en toekomst, verhalen' } },
  { id: 'B2', name: { en: 'B2 · Upper-intermediate', nl: 'B2 · Hoger middenniveau' }, sub: { en: 'argument, nuance, formal and informal', nl: 'argumentatie, nuance, formeel en informeel' } },
];

export const UNITS = [...A1, ...A2, ...B1, ...B2];

export const unitsOf = level => UNITS.filter(u => u.level === level);
export const getUnit = id => UNITS.find(u => u.id === id);
export const unitIndex = unit => unitsOf(unit.level).indexOf(unit) + 1;
export const nextUnit = unit => UNITS[UNITS.indexOf(unit) + 1] || null;
