import { state, getLTLang } from '../state.js';

export async function checkGrammarLanguageTool(text) {
  try {
    const res = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ text, language: getLTLang() })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const matches = data.matches || [];

    if (matches.length === 0) {
      return { has_errors: false, corrected: text, explanation: state.nativeLanguage === 'nl'
        ? 'De spellingcontrole vond niets. Die kijkt niet naar naamvallen, tijden of context: daarvoor is een API-sleutel nodig (Instellingen ⚙️).'
        : 'The spell checker found nothing. It does not look at cases, tenses or context: that needs an API key (Settings ⚙️).' };
    }

    // Apply all replacements to build corrected text
    let corrected = text;
    let shift = 0;
    // Sort by position so replacements don't interfere with each other
    const sorted = [...matches].sort((a, b) => a.offset - b.offset);
    for (const m of sorted) {
      const rep = m.replacements[0]?.value;
      if (rep === undefined) continue;
      const start = m.offset + shift;
      corrected = corrected.slice(0, start) + rep + corrected.slice(start + m.length);
      shift += rep.length - m.length;
    }

    // Build a human-friendly explanation from the first 2 matches
    const notes = sorted.slice(0, 2).map(m => {
      const orig = text.slice(m.offset, m.offset + m.length);
      const rep  = m.replacements[0]?.value;
      if (rep) return `"${orig}" → "${rep}": ${m.message}`;
      return m.message;
    });

    return { has_errors: true, corrected, explanation: notes.join(' · ') };
  } catch(e) {
    return null; // silent fail — don't block conversation on network error
  }
}
