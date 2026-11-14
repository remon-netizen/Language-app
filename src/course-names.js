// ── One name per course ──────────────────────────────────────────────────────
// Wherever courses are listed (the hub, Review, Progress, weak spots) a course is
// called the same thing and wears the same icon as on its own screen.

import { state } from './state.js';

export const COURSE_ICON = {
  path: '🗺️', vocab: '🧠', verbs: '✍️', cases: '📌', prefixes: '🔗', numbers: '🔢', sentences: '🧩', dialogues: '🎧',
};

const NAMES = {
  path:      { en: 'Course path',      nl: 'Leerpad' },
  vocab:     { en: 'Vocabulary',       nl: 'Woordenschat' },
  mywords:   { en: 'Vocabulary',       nl: 'Woordenschat' },
  verbs:     { en: 'Verb Drill',       nl: 'Werkwoord Drill' },
  cases:     { en: 'Case Drill',       nl: 'Naamvallen Drill' },
  prefixes:  { en: 'Prefix Drill',     nl: 'Voorvoegsel Drill' },
  numbers:   { en: 'Numbers & Time',   nl: 'Getallen & Tijd' },
  sentences: { en: 'Sentence Builder', nl: 'Zinnen bouwen' },
  dialogues: { en: 'Dialogues',        nl: 'Dialogen' },
};

export const courseName = id => (NAMES[id] ? NAMES[id][state.nativeLanguage === 'nl' ? 'nl' : 'en'] : id);
