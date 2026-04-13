import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON } from '../utils.js';

async function callGrammarAPI(systemPrompt, userMessage) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key set. Add your Gemini key in Settings (⚙️).');

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: 2048,
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
  if (!text) throw new Error('Empty response from Gemini');
  const parsed = extractJSON(text);
  if (!parsed) throw new Error('Could not parse grammar response');
  return parsed;
}

const TARGET_LANG_NAME_GR = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
const NATIVE_LANG_NAME_GR = { en: 'English', nl: 'Dutch' };

// ── Verb conjugation ──────────────────────────────────────────────────────────
export async function conjugateVerb(verb) {
  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const lang       = TARGET_LANG_NAME_GR[targetCode] || 'Ukrainian';
  const nativeName = NATIVE_LANG_NAME_GR[nativeCode] || 'English';

  const ukSchema = `{
  "verb_infinitive": "...",
  "verb_target": "...",
  "tenses": [
    {
      "tense_name": "Present",
      "tense_name_target": "Теперішній час",
      "forms": [
        { "pronoun": "я", "pronoun_en": "I", "form": "..." },
        { "pronoun": "ти", "pronoun_en": "you", "form": "..." },
        { "pronoun": "він/вона", "pronoun_en": "he/she", "form": "..." },
        { "pronoun": "ми", "pronoun_en": "we", "form": "..." },
        { "pronoun": "ви", "pronoun_en": "you (pl/formal)", "form": "..." },
        { "pronoun": "вони", "pronoun_en": "they", "form": "..." }
      ]
    },
    {
      "tense_name": "Past",
      "tense_name_target": "Минулий час",
      "forms": [
        { "pronoun": "він (m.)", "pronoun_en": "he (masc.)", "form": "..." },
        { "pronoun": "вона (f.)", "pronoun_en": "she (fem.)", "form": "..." },
        { "pronoun": "воно (n.)", "pronoun_en": "it (neut.)", "form": "..." },
        { "pronoun": "вони (pl.)", "pronoun_en": "they (pl.)", "form": "..." }
      ]
    },
    {
      "tense_name": "Future",
      "tense_name_target": "Майбутній час",
      "forms": [
        { "pronoun": "я", "pronoun_en": "I", "form": "..." },
        { "pronoun": "ти", "pronoun_en": "you", "form": "..." },
        { "pronoun": "він/вона", "pronoun_en": "he/she", "form": "..." },
        { "pronoun": "ми", "pronoun_en": "we", "form": "..." },
        { "pronoun": "ви", "pronoun_en": "you (pl/formal)", "form": "..." },
        { "pronoun": "вони", "pronoun_en": "they", "form": "..." }
      ]
    },
    {
      "tense_name": "Imperative",
      "tense_name_target": "Наказовий спосіб",
      "forms": [
        { "pronoun": "ти", "pronoun_en": "you (sing.)", "form": "..." },
        { "pronoun": "ви", "pronoun_en": "you (pl./formal)", "form": "..." }
      ]
    }
  ],
  "notes": "..."
}`;

  const nlSchema = `{
  "verb_infinitive": "...",
  "verb_target": "...",
  "tenses": [
    {
      "tense_name": "Present",
      "tense_name_target": "Tegenwoordige tijd",
      "forms": [
        { "pronoun": "ik", "pronoun_en": "I", "form": "..." },
        { "pronoun": "jij/je", "pronoun_en": "you", "form": "..." },
        { "pronoun": "hij/zij/het", "pronoun_en": "he/she/it", "form": "..." },
        { "pronoun": "wij/we", "pronoun_en": "we", "form": "..." },
        { "pronoun": "jullie", "pronoun_en": "you (pl.)", "form": "..." },
        { "pronoun": "zij/ze", "pronoun_en": "they", "form": "..." }
      ]
    },
    {
      "tense_name": "Simple Past",
      "tense_name_target": "Onvoltooid verleden tijd",
      "forms": [
        { "pronoun": "ik/jij/hij", "pronoun_en": "I/you/he", "form": "..." },
        { "pronoun": "wij/jullie/zij", "pronoun_en": "we/you/they", "form": "..." }
      ]
    },
    {
      "tense_name": "Present Perfect",
      "tense_name_target": "Voltooid tegenwoordige tijd",
      "forms": [
        { "pronoun": "ik", "pronoun_en": "I", "form": "..." },
        { "pronoun": "jij/je", "pronoun_en": "you", "form": "..." },
        { "pronoun": "hij/zij/het", "pronoun_en": "he/she/it", "form": "..." },
        { "pronoun": "wij/we", "pronoun_en": "we", "form": "..." },
        { "pronoun": "jullie", "pronoun_en": "you (pl.)", "form": "..." },
        { "pronoun": "zij/ze", "pronoun_en": "they", "form": "..." }
      ]
    }
  ],
  "notes": "..."
}`;

  const enSchema = `{
  "verb_infinitive": "...",
  "verb_target": "...",
  "tenses": [
    {
      "tense_name": "Present Simple",
      "tense_name_target": "Present Simple",
      "forms": [
        { "pronoun": "I",         "pronoun_en": "I",         "form": "..." },
        { "pronoun": "you",       "pronoun_en": "you",       "form": "..." },
        { "pronoun": "he/she/it", "pronoun_en": "he/she/it", "form": "..." },
        { "pronoun": "we",        "pronoun_en": "we",        "form": "..." },
        { "pronoun": "they",      "pronoun_en": "they",      "form": "..." }
      ]
    },
    {
      "tense_name": "Past Simple",
      "tense_name_target": "Past Simple",
      "forms": [
        { "pronoun": "I/you/he/she/it/we/they", "pronoun_en": "all persons", "form": "..." }
      ]
    },
    {
      "tense_name": "Present Perfect",
      "tense_name_target": "Present Perfect",
      "forms": [
        { "pronoun": "I/you/we/they", "pronoun_en": "I/you/we/they", "form": "have ..." },
        { "pronoun": "he/she/it",     "pronoun_en": "he/she/it",     "form": "has ..." }
      ]
    },
    {
      "tense_name": "Forms",
      "tense_name_target": "Principal parts",
      "forms": [
        { "pronoun": "base",            "pronoun_en": "base form",      "form": "..." },
        { "pronoun": "-s form",         "pronoun_en": "3rd-person sg.", "form": "..." },
        { "pronoun": "-ing",            "pronoun_en": "present participle", "form": "..." },
        { "pronoun": "past",            "pronoun_en": "past simple",     "form": "..." },
        { "pronoun": "past participle", "pronoun_en": "past participle", "form": "..." }
      ]
    }
  ],
  "notes": "..."
}`;

  const frSchema = `{
  "verb_infinitive": "...",
  "verb_target": "...",
  "tenses": [
    {
      "tense_name": "Present",
      "tense_name_target": "Présent",
      "forms": [
        { "pronoun": "je",         "pronoun_en": "I",         "form": "..." },
        { "pronoun": "tu",         "pronoun_en": "you",       "form": "..." },
        { "pronoun": "il/elle/on", "pronoun_en": "he/she/one","form": "..." },
        { "pronoun": "nous",       "pronoun_en": "we",        "form": "..." },
        { "pronoun": "vous",       "pronoun_en": "you (pl./formal)", "form": "..." },
        { "pronoun": "ils/elles",  "pronoun_en": "they",      "form": "..." }
      ]
    },
    {
      "tense_name": "Passé Composé",
      "tense_name_target": "Passé composé",
      "forms": [
        { "pronoun": "je",         "pronoun_en": "I",         "form": "..." },
        { "pronoun": "tu",         "pronoun_en": "you",       "form": "..." },
        { "pronoun": "il/elle/on", "pronoun_en": "he/she/one","form": "..." },
        { "pronoun": "nous",       "pronoun_en": "we",        "form": "..." },
        { "pronoun": "vous",       "pronoun_en": "you (pl./formal)", "form": "..." },
        { "pronoun": "ils/elles",  "pronoun_en": "they",      "form": "..." }
      ]
    },
    {
      "tense_name": "Imparfait",
      "tense_name_target": "Imparfait",
      "forms": [
        { "pronoun": "je",         "pronoun_en": "I",         "form": "..." },
        { "pronoun": "tu",         "pronoun_en": "you",       "form": "..." },
        { "pronoun": "il/elle/on", "pronoun_en": "he/she/one","form": "..." },
        { "pronoun": "nous",       "pronoun_en": "we",        "form": "..." },
        { "pronoun": "vous",       "pronoun_en": "you (pl./formal)", "form": "..." },
        { "pronoun": "ils/elles",  "pronoun_en": "they",      "form": "..." }
      ]
    },
    {
      "tense_name": "Future",
      "tense_name_target": "Futur simple",
      "forms": [
        { "pronoun": "je",         "pronoun_en": "I",         "form": "..." },
        { "pronoun": "tu",         "pronoun_en": "you",       "form": "..." },
        { "pronoun": "il/elle/on", "pronoun_en": "he/she/one","form": "..." },
        { "pronoun": "nous",       "pronoun_en": "we",        "form": "..." },
        { "pronoun": "vous",       "pronoun_en": "you (pl./formal)", "form": "..." },
        { "pronoun": "ils/elles",  "pronoun_en": "they",      "form": "..." }
      ]
    }
  ],
  "notes": "..."
}`;

  const schemaByLang = { uk: ukSchema, nl: nlSchema, en: enSchema, fr: frSchema };
  const schema = schemaByLang[targetCode] || ukSchema;
  const prompt = `You are a ${lang} grammar expert teaching a ${nativeName}-speaking learner. The user provides a verb. Return ONLY a valid JSON object matching this exact schema with real ${lang} conjugations filled in. Write any prose ("notes") in ${nativeName}. No markdown, no explanation outside the JSON.\n\nSchema:\n${schema}`;
  return callGrammarAPI(prompt, `Conjugate the ${lang} verb: "${verb}"`);
}

// ── Sentence dissection ───────────────────────────────────────────────────────
export async function dissectSentence(sentence) {
  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const lang       = TARGET_LANG_NAME_GR[targetCode] || 'Ukrainian';
  const nativeName = NATIVE_LANG_NAME_GR[nativeCode] || 'English';

  const schema = `{
  "sentence_original": "...",
  "sentence_translation": "...",
  "words": [
    {
      "word": "...",
      "lemma": "...",
      "part_of_speech": "noun|verb|adjective|adverb|pronoun|preposition|conjunction|particle|other",
      "part_of_speech_target": "... (in ${lang})",
      "role_in_sentence": "subject|predicate|object|modifier|adverbial|other",
      "details": "...",
      "translation": "..."
    }
  ],
  "grammar_note": "..."
}`;

  const ukExtra = 'For Ukrainian: include case (nominative/accusative/genitive/dative/instrumental/locative), gender (masculine/feminine/neuter), number, tense and aspect for verbs in the "details" field.';
  const nlExtra = 'For Dutch: include tense for verbs, de/het for nouns, comparative degree for adjectives, and note any separable verb prefixes in the "details" field. Dutch has no grammatical case system — do not include case.';
  const enExtra = 'For English: include tense and form for verbs (base, -s, -ing, past, past participle), number for nouns, comparative/superlative for adjectives, and note phrasal-verb particles in the "details" field. English has no grammatical case beyond pronouns — only mark case on pronouns (nominative/accusative).';
  const frExtra = 'For French: include gender (masculin/féminin) and number (singulier/pluriel) for nouns and adjectives, tense and mood for verbs (présent, passé composé, imparfait, futur, subjonctif, conditionnel), verb group (-er/-ir/-re), and note any liaison or elision in the "details" field.';
  const extras = { uk: ukExtra, nl: nlExtra, en: enExtra, fr: frExtra };

  const prompt = `You are a ${lang} grammar expert teaching a ${nativeName}-speaking learner. Analyse the provided sentence word by word. Return ONLY a valid JSON object matching this schema. ${extras[targetCode] || ukExtra} Write all "translation", "details" and "grammar_note" prose in ${nativeName}. No markdown.\n\nSchema:\n${schema}`;
  return callGrammarAPI(prompt, `Analyse this ${lang} sentence: "${sentence}"`);
}
