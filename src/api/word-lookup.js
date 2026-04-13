import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

export async function lookupWord(word) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key — add your Gemini key in Settings (⚙️)');

  const TARGET_NAMES = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
  const NATIVE_NAMES = { en: 'English', nl: 'Dutch' };
  const langName   = TARGET_NAMES[state.currentLanguage] || 'Ukrainian';
  const nativeName = NATIVE_NAMES[state.nativeLanguage] || 'English';

  const body = {
    system_instruction: { parts: [{ text: `You are a ${langName} language expert teaching a ${nativeName}-speaking learner. Return ONLY a valid JSON object, no markdown.` }] },
    contents: [{ role: 'user', parts: [{ text:
      `Look up this ${langName} word: "${word}"\n\nReturn JSON:\n` +
      `{\n  "word": "dictionary/base form of the word",\n  "translation": "${nativeName} translation",\n` +
      `  "part_of_speech": "verb|noun|adjective|adverb|pronoun|preposition|other",\n` +
      `  "part_of_speech_target": "name in ${langName}",\n` +
      `  "details": "key grammar info in ${nativeName} — gender, aspect, irregular forms etc. Keep it to one short sentence."\n}`
    }] }],
    generationConfig: {
      maxOutputTokens: 300,
      temperature: 0.1,
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
  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts.filter(p => !p.thought).map(p => p.text).join('').trim();
  const parsed = extractJSON(text);
  if (!parsed) throw new Error('Could not parse response');
  return parsed;
}
