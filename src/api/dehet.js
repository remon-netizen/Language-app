
import { generateJSON } from './model.js';
const LEVEL_GUIDE = {
  a1: 'very common everyday nouns only (body parts, food, furniture, colors, numbers, family)',
  a2: 'common daily-life nouns (work, transport, nature, clothing, weather, house)',
  b1: 'intermediate nouns including some abstract concepts, institutions, professions',
  b2: 'advanced nouns with tricky exceptions, loanwords, and less common vocabulary',
};

export async function generateDeHetNouns(level = 'a2') {
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

  const parsed = await generateJSON({ prompt: prompt, maxTokens: 1024, temperature: 0.3 });
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Invalid noun list from Gemini');
  return parsed;
}
