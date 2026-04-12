import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

const LEVEL_GUIDE = {
  a1: 'very common everyday nouns only (body parts, food, furniture, colors, numbers, family)',
  a2: 'common daily-life nouns (work, transport, nature, clothing, weather, house)',
  b1: 'intermediate nouns including some abstract concepts, institutions, professions',
  b2: 'advanced nouns with tricky exceptions, loanwords, and less common vocabulary',
};

export async function generateDeHetNouns(level = 'a2') {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set');

  const prompt = `Generate exactly 20 Dutch nouns for a de/het article drill at CEFR ${level.toUpperCase()} level.
Focus on: ${LEVEL_GUIDE[level] || LEVEL_GUIDE.a2}

Include a natural mix (roughly 60% de, 40% het or similar). Include some that learners commonly get wrong.

Return ONLY a valid JSON array (no markdown, no text outside):
[
  {"word": "huis", "article": "het", "english": "house", "tip": null},
  {"word": "meisje", "article": "het", "english": "girl", "tip": "Diminutives ending in -je are always het"},
  {"word": "auto", "article": "de", "english": "car", "tip": null}
]

Rules for "tip": include a short helpful grammar rule ONLY for words that follow a clear pattern
(e.g. diminutives -je → het, infinitives used as nouns → het, -heid/-ing/-schap → de, etc.).
For words with no clear rule, set tip to null.
Always use lowercase for "article". Always use the base/singular form for "word".`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.3,
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
  if (!text) throw new Error('Empty response from Gemini');

  const parsed = extractJSON(text);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid noun list from Gemini');
  return parsed;
}
