// Accessors for the multi-language lesson shape:
//   {
//     id, icon, tag,
//     name: { en, nl },
//     phrases: [{ target, ph, translations: { en?, nl? }, tip: { en?, nl? } }]
//   }
//
// All accessors gracefully fall back across available languages so a lesson
// file that only has one native translation (e.g. dutch-lessons.js → 'en')
// still works for the other native if someone toggles into a weird state.

import { LESSONS as UK_LESSONS } from './lessons.js';
import { DUTCH_LESSONS as NL_LESSONS } from './dutch-lessons.js';
import { ENGLISH_LESSONS as EN_LESSONS } from './english-lessons.js';

export function getLessonsForTarget(target) {
  switch (target) {
    case 'nl': return NL_LESSONS;
    case 'en': return EN_LESSONS;
    case 'uk':
    default:   return UK_LESSONS;
  }
}

const FALLBACK_ORDER = ['en', 'nl'];

function pickLocalised(obj, native) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj[native]) return obj[native];
  for (const k of FALLBACK_ORDER) if (obj[k]) return obj[k];
  return '';
}

export function getTargetText(phrase) {
  // New shape uses `target`. Old shape used `uk` for any target language —
  // keep the fallback so a half-migrated lesson still renders.
  return phrase?.target ?? phrase?.uk ?? '';
}

export function getTranslation(phrase, native) {
  if (!phrase) return '';
  // Old shape: `en` field directly on the phrase.
  if (!phrase.translations && phrase.en && native === 'en') return phrase.en;
  return pickLocalised(phrase.translations, native);
}

export function getTip(phrase, native) {
  return pickLocalised(phrase?.tip, native);
}

export function getLessonName(lesson, native) {
  return pickLocalised(lesson?.name, native);
}
