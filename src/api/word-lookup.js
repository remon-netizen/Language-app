import { state } from '../state.js';
import { generateJSON } from './model.js';

export async function lookupWord(word) {
  const TARGET_NAMES = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
  const NATIVE_NAMES = { en: 'English', nl: 'Dutch' };
  const langName   = TARGET_NAMES[state.currentLanguage] || 'Ukrainian';
  const nativeName = NATIVE_NAMES[state.nativeLanguage] || 'English';

  const parsed = await generateJSON({ system: `You are a ${langName} language expert teaching a ${nativeName}-speaking learner. Return ONLY a valid JSON object, no markdown.`, prompt: `Look up this ${langName} word: "${word}"\n\nReturn JSON:\n` +
      `{\n  "word": "dictionary/base form of the word",\n  "translation": "${nativeName} translation",\n` +
      `  "part_of_speech": "verb|noun|adjective|adverb|pronoun|preposition|other",\n` +
      `  "part_of_speech_target": "name in ${langName}",\n` +
      `  "details": "key grammar info in ${nativeName} — gender, aspect, irregular forms etc. Keep it to one short sentence."\n}`, maxTokens: 300, temperature: 0.1 });
  if (!parsed) throw new Error('Could not parse response');
  return parsed;
}
