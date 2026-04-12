// Generate harder practice phrases for the next level of a lesson topic.
//
// Takes the current lesson's topic name + the phrases the student already
// mastered, and asks Gemini to produce 8 harder phrases on the same theme
// at the next CEFR level.

import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

const TARGET_NAME = { uk: 'Ukrainian', nl: 'Dutch', en: 'English' };
const NATIVE_NAME = { en: 'English', nl: 'Dutch' };

const LEVELS = ['A1', 'A2', 'B1', 'B2'];

export function getLessonLevel(lessonId) {
  const stored = JSON.parse(localStorage.getItem('lessonLevels') || '{}');
  return stored[lessonId] || 0; // 0 = beginner (A1), 1 = A2, 2 = B1, 3 = B2
}

export function saveLessonLevel(lessonId, levelIndex) {
  const stored = JSON.parse(localStorage.getItem('lessonLevels') || '{}');
  stored[lessonId] = levelIndex;
  localStorage.setItem('lessonLevels', JSON.stringify(stored));
}

export function getLevelLabel(levelIndex) {
  return LEVELS[levelIndex] || LEVELS[0];
}

export function getNextLevelLabel(levelIndex) {
  return LEVELS[Math.min(levelIndex + 1, LEVELS.length - 1)];
}

export function hasNextLevel(levelIndex) {
  return levelIndex < LEVELS.length - 1;
}

export async function generateNextLevelPhrases(lesson, currentLevelIndex) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key — add your Gemini key in Settings.');

  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const langName   = TARGET_NAME[targetCode] || 'Ukrainian';
  const nativeName = NATIVE_NAME[nativeCode] || 'English';
  const currentLevel = LEVELS[currentLevelIndex] || 'A1';
  const nextLevel    = LEVELS[Math.min(currentLevelIndex + 1, LEVELS.length - 1)];

  // Include the phrases the student already knows so Gemini builds on them.
  const knownPhrases = (lesson.phrases || [])
    .map(p => p.target || p.uk || '')
    .filter(Boolean)
    .join(', ');

  const topicName = typeof lesson.name === 'object'
    ? (lesson.name.en || lesson.name.nl || '')
    : (lesson.name || '');

  const prompt =
    `You are an experienced ${langName} language teacher. A student has completed the "${topicName}" lesson at ${currentLevel} level.\n\n` +
    `Phrases they already know:\n${knownPhrases}\n\n` +
    `Now generate 8 NEW practice phrases on the SAME topic but at ${nextLevel} level — harder vocabulary, longer sentences, more complex grammar.\n\n` +
    `Return JSON:\n` +
    `{\n  "phrases": [\n    {\n` +
    `      "target": "${langName} phrase",\n` +
    `      "ph": "phonetic pronunciation guide for a ${nativeName} speaker",\n` +
    `      "translation_native": "${nativeName} translation",\n` +
    `      "tip_native": "Helpful tip in ${nativeName}"\n` +
    `    }\n  ]\n}\n\n` +
    `Rules:\n` +
    `- Do NOT repeat any of the known phrases — build on them\n` +
    `- ${nextLevel} level: ${nextLevel === 'A2' ? 'longer sentences, basic connectors (і, але, тому що), past tense' : nextLevel === 'B1' ? 'complex sentences, varied tenses, conditionals, expressing opinions' : 'idiomatic expressions, nuanced vocabulary, complex grammar, near-native phrasing'}\n` +
    `- Stay on the "${topicName}" topic\n` +
    `- Order easiest → hardest\n` +
    `- Phonetic guides with stress marked in CAPS`;

  const body = {
    system_instruction: {
      parts: [{ text: `You are an expert ${langName} teacher. Return ONLY valid JSON, no markdown.` }],
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 3000,
      temperature: 0.5,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }

  const data  = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text  = parts.filter(p => !p.thought).map(p => p.text).join('').trim();
  const parsed = extractJSON(text);

  if (!parsed?.phrases?.length) throw new Error('Could not generate next-level phrases');

  const nativeKey = nativeCode;
  return parsed.phrases.slice(0, 10).map(p => ({
    target: p.target,
    ph: p.ph || '',
    translations: { [nativeKey]: p.translation_native },
    tip: { [nativeKey]: p.tip_native ? `💡 ${p.tip_native}` : '' },
  }));
}
