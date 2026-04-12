import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { buildSystemPrompt } from './gemini.js';

export async function callClaudeAPI(userMessage, isUkrainian) {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  state.conversationHistory.push({ role: 'user', content: userMessage });

  const body = {
    model: 'claude-haiku-4-5',
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
  const text = data.content[0].text.trim();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch(e) {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) parsed = JSON.parse(m[0]);
    else throw new Error('Could not parse AI response');
  }

  state.conversationHistory.push({ role: 'assistant', content: parsed.response_uk });
  return parsed;
}
