import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';
import { buildSystemPrompt } from './gemini.js';
import { ANTHROPIC_MODEL } from './model.js';

export async function callClaudeAPI(userMessage, isUkrainian) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  state.conversationHistory.push({ role: 'user', content: userMessage });
  const sent = state.conversationHistory.length;

  try {
    const body = {
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: buildSystemPrompt(isUkrainian),
      messages: state.conversationHistory.slice(-12)
    };

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    // The reply is the text blocks; anything else in front of them (a thinking
    // block) is skipped, and a reply without text (a declined request) is said so.
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
    if (!text) throw new Error('Empty response from Anthropic');

    const parsed = extractJSON(text);
    if (!parsed || !parsed.response_uk) throw new Error('Could not parse AI response');

    state.conversationHistory.push({ role: 'assistant', content: parsed.response_uk });
    return parsed;
  } catch (err) {
    // The message got no answer: it must not stay in what the next request sends.
    if (state.conversationHistory.length === sent) state.conversationHistory.pop();
    throw err;
  }
}
