import { state, getTutorFirstName } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

const TARGET_LANG_NAME = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
const NATIVE_LANG_NAME = { en: 'English', nl: 'Dutch' };

export function buildSystemPrompt(inTargetLang) {
  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const langName    = TARGET_LANG_NAME[targetCode] || 'Ukrainian';
  const nativeName  = NATIVE_LANG_NAME[nativeCode] || 'English';
  const tutorName   = getTutorFirstName();

  const diffGuide = {
    a1: `The user is a complete beginner (CEFR A1). Use only very simple words and very short sentences. Introduce 1–2 new words per message. Be very warm and encouraging. Mix ${langName} with ${nativeName} explanations when helpful. Avoid all complex grammar.`,
    a2: `The user is a basic learner (CEFR A2). Use simple, everyday sentences and common vocabulary. Introduce new words naturally in context. Be encouraging and supportive. Keep grammar straightforward.`,
    b1: `The user is at intermediate level (CEFR B1). Use natural conversational ${langName}. Introduce varied vocabulary in context. Occasionally point out interesting grammar. Be supportive but treat them as a capable learner.`,
    b2: `The user is upper-intermediate to advanced (CEFR B2). Use rich vocabulary, complex grammar, and idiomatic expressions. Engage in natural, nuanced conversation. Correct mistakes concisely without over-explaining.`,
  };

  return `You are ${tutorName}, a friendly and encouraging ${langName} language tutor having a real conversation with a student. The student's native language is ${nativeName}.

DIFFICULTY LEVEL: ${state.currentDifficulty.toUpperCase()}
${diffGuide[state.currentDifficulty]}

The student's message is ${inTargetLang ? `in ${langName}` : `in ${nativeName}`}. ${inTargetLang ? `You MUST analyse their ${langName} grammar — this is the most important part of your response.` : `Respond in ${langName} to keep them practising.`}

You MUST respond with a single valid JSON object only. No markdown, no code fences, no text outside the JSON.

${inTargetLang ? `GRAMMAR ANALYSIS RULES (critical):
- ALWAYS set "has_errors" — true if there is a clear, unambiguous grammar mistake; false if the sentence is correct OR if correctness depends on context.
- "corrected": the full corrected sentence — NEVER drop any part of the original sentence. Only fix the actual error, leave everything else exactly as-is.
- Do NOT assume the speaker's gender. If a word form depends on gender, note both options in the explanation instead of picking one.
- "explanation": ALWAYS write in ${nativeName.toUpperCase()}. Explain only real errors. Be precise — only flag things that are genuinely wrong, not things that are context-dependent.` : ''}

Required JSON format. Note that the field is named "response_uk" for legacy reasons but it must contain the response in ${langName}, and "response_en" must contain the translation in ${nativeName} (the student's native language, even if that is not English):
{
  "response_uk": "Your natural ${langName} response here",
  "response_en": "${nativeName} translation of your response",
  "grammar_feedback": ${inTargetLang ? `{
    "has_errors": true or false,
    "corrected": "The correct ${langName} sentence (always include)",
    "explanation": "Short, friendly grammar note written in ${nativeName} (always include)"
  }` : 'null'},
  "suggestions": [
    {"uk": "Suggested ${langName} phrase for the student to say next", "en": "${nativeName} meaning"},
    {"uk": "Another option", "en": "${nativeName} meaning"},
    {"uk": "A slightly more challenging option", "en": "${nativeName} meaning"},
    {"uk": "An alternative", "en": "${nativeName} meaning"}
  ]
}`;
}


export async function callGeminiAPI(userMessage, isUkrainian) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  state.conversationHistory.push({ role: 'user', content: userMessage });

  const contents = state.conversationHistory.slice(-12).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const body = {
    system_instruction: { parts: [{ text: buildSystemPrompt(isUkrainian) }] },
    contents,
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.4,
      responseMimeType: 'application/json',
      // Disable thinking mode — thinking tokens eat into the output budget
      // and can interleave with the JSON output, breaking parsing.
      thinkingConfig: { thinkingBudget: 0 }
    }
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
  // gemini-2.5-flash is a thinking model: parts[0] may be the internal reasoning
  // (marked thought:true). Skip those and join only the real output parts.
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter(p => !p.thought)
    .map(p => p.text)
    .join('')
    .trim();
  if (!text) throw new Error('Empty response from Gemini');

  const parsed = extractJSON(text);
  if (!parsed || !parsed.response_uk) {
    console.error('[Gemini] Parse failed. Raw text received:', text);
    console.error('[Gemini] Full API response:', JSON.stringify(data, null, 2));
    throw new Error('Could not parse Gemini response');
  }

  state.conversationHistory.push({ role: 'assistant', content: parsed.response_uk });
  return parsed;
}
