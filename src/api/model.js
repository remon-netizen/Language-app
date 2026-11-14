// ── One place that talks to the AI provider ───────────────────────────────────
// Every feature that needs generated content (exercises, de/het nouns, homework
// phrases, word lookup, …) used to build its own Gemini request. That meant a
// user who chose Anthropic in Settings got Gemini auth errors everywhere except
// the chat. Now they all go through generateJSON(), which routes by provider.

import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

export const GEMINI_MODEL    = 'gemini-2.5-flash';
export const ANTHROPIC_MODEL = 'claude-haiku-4-5';

export class NoApiKeyError extends Error {
  constructor(message) { super(message); this.name = 'NoApiKeyError'; }
}

export function hasApiKey() {
  return !!getApiKey();
}

export function providerName() {
  return state.currentProvider === 'anthropic' ? 'Anthropic' : 'Gemini';
}

export function noKeyMessage() {
  return state.nativeLanguage === 'nl'
    ? 'Geen API-sleutel. Voeg je Gemini- of Anthropic-sleutel toe bij Instellingen (⚙️).'
    : 'No API key. Add your Gemini or Anthropic key in Settings (⚙️).';
}

// What to tell the learner when a request to the AI fails: which of the usual
// reasons it was, in their language, instead of the provider's own text
// ("invalid x-api-key", "Failed to fetch"). Plain text: the caller escapes it.
export function aiErrorText(err) {
  const msg = String(err?.message ?? err ?? '');
  const nl = state.nativeLanguage === 'nl';
  if (err instanceof NoApiKeyError || msg === noKeyMessage()) return msg;   // already a sentence for the learner
  // The providers word a rejected key differently: Anthropic "invalid x-api-key",
  // Gemini "API key not valid", either one a bare 401 / 403.
  if (/\b40[13]\b|api[ _-]?key|authentication|permission/i.test(msg)) {
    return nl ? `De ${providerName()}-API-sleutel is niet geaccepteerd. Controleer hem bij Instellingen (⚙️).`
              : `The ${providerName()} API key was not accepted. Check it in Settings (⚙️).`;
  }
  if (/\b429\b|\bHTTP 5\d\d\b|rate limit|quota|overloaded|exhausted/i.test(msg)) {
    return nl ? 'De AI-dienst is druk of je limiet is bereikt. Wacht even en probeer het opnieuw.'
              : 'The AI service is busy or your limit is reached. Wait a moment and try again.';
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) {
    return nl ? 'Netwerkfout. Controleer je internetverbinding.' : 'Network error. Check your internet connection.';
  }
  if (/Empty response/i.test(msg)) {
    return nl ? 'De AI gaf dit keer geen antwoord. Probeer het nog eens, of zeg het anders.'
              : 'The AI gave no answer this time. Try again, or say it differently.';
  }
  if (/Could not parse/i.test(msg)) {
    return nl ? 'Het antwoord van de AI was niet te lezen. Probeer het nog eens.'
              : 'The AI\'s answer could not be read. Try again.';
  }
  return (nl ? 'Fout: ' : 'Error: ') + msg;
}

// Raw text from the model. `system` is optional.
export async function generateText({ system, prompt, maxTokens = 2048, temperature = 0.4 }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new NoApiKeyError(noKeyMessage());
  const text = state.currentProvider === 'anthropic'
    ? await callAnthropic(apiKey, { system, prompt, maxTokens, temperature })
    : await callGemini(apiKey, { system, prompt, maxTokens, temperature });
  if (!text) throw new Error(`Empty response from ${providerName()}`);
  return text;
}

// Parsed JSON from the model, or null when the reply could not be parsed.
// Callers validate the shape they expect.
export async function generateJSON(opts) {
  return extractJSON(await generateText(opts));
}

async function callGemini(apiKey, { system, prompt, maxTokens, temperature }) {
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature,
      responseMimeType: 'application/json',
      // Thinking tokens eat into the output budget and can interleave with the
      // JSON output, breaking parsing.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
  if (system) body.system_instruction = { parts: [{ text: system }] };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  // parts[0] may be internal reasoning (thought:true); keep only real output.
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.filter(p => !p.thought).map(p => p.text).join('').trim();
}

async function callAnthropic(apiKey, { system, prompt, maxTokens, temperature }) {
  const body = {
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    temperature,
    messages: [{ role: 'user', content: prompt }],
  };
  if (system) body.system = system;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
}
