import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

export async function generateConversationSummary() {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set');

  const TARGET_NAMES = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
  const NATIVE_NAMES = { en: 'English', nl: 'Dutch' };
  const langName   = TARGET_NAMES[state.currentLanguage] || 'Ukrainian';
  const nativeName = NATIVE_NAMES[state.nativeLanguage] || 'English';

  if (state.conversationHistory.length < 2) throw new Error('Not enough conversation to summarise');

  const conversationText = state.conversationHistory
    .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
    .join('\n');

  const errors = state.grammarErrors || [];
  const errorContext = errors.length > 0
    ? `\n\nGrammar corrections already given during this conversation:\n${
        errors.map(e => `- Original: "${e.original}" → Corrected: "${e.corrected}" (${e.explanation})`).join('\n')
      }`
    : '';

  const prompt = `You are an expert ${langName} language teacher. Analyse this language learning conversation and create a structured learning summary.

CONVERSATION:
${conversationText}${errorContext}

Return ONLY a valid JSON object:
{
  "overall_assessment": "1–2 sentence warm summary of the student's performance this session",
  "what_went_well": [
    "strength observed (max 3 items)"
  ],
  "mistakes_made": [
    {
      "original": "what student wrote/said (in ${langName})",
      "corrected": "corrected version (in ${langName})",
      "rule": "brief explanation of the grammar rule in ${nativeName}"
    }
  ],
  "vocabulary_used": [
    {
      "word": "${langName} word or phrase the student used",
      "english": "${nativeName} meaning",
      "note": "usage note in ${nativeName} or null"
    }
  ],
  "suggested_focus": [
    "specific grammar or vocabulary topic to work on next (max 3, in ${nativeName})"
  ],
  "encouragement": "A warm, specific encouraging sentence for the student, in ${nativeName}"
}

Guidelines:
- Keep ALL explanations and notes in ${nativeName} (the student's native language).
- "original" and "corrected" fields must be in ${langName}.
- "mistakes_made": only real grammar/vocabulary errors, max 5. If no errors, use empty array.
- "vocabulary_used": only ${langName} words/phrases the STUDENT used (not the tutor), max 8. Focus on notable or new words.
- Be warm, specific, and constructive throughout.`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 1500,
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
  if (!parsed || !parsed.overall_assessment) throw new Error('Could not parse summary');
  return parsed;
}
