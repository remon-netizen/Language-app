import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON, shuffleMCQOptions } from '../utils.js';

const LEVEL_LABELS = {
  a1: 'A1 beginner',
  a2: 'A2 elementary',
  b1: 'B1 intermediate',
  b2: 'B2 upper-intermediate',
};

const TOPIC_HINTS_UK = {
  cases:        'Focus on choosing the correct grammatical case (Nominative, Genitive, Dative, Accusative, Instrumental, Locative) for a noun or pronoun in context.',
  aspect:       'Focus on choosing perfective vs imperfective verb aspect (e.g. писати / написати) and explain why.',
  gender:       'Focus on noun gender (masculine / feminine / neuter) and correct adjective agreement (ending -ий/-а/-е etc.).',
  adverbs:      'Focus on Ukrainian adverbs of time (зараз, вже, ще), place (тут, там, звідси), and manner (добре, швидко). Test correct usage and word position.',
  prepositions: 'Focus on choosing the correct preposition (у/в, на, до, від, з, за, під, над, між…) and the case it requires.',
  pronouns:     'Focus on personal pronouns (я, ти, він/вона/воно, ми, ви, вони) and possessives (мій, твій, його/її…) in different cases.',
  negation:     'Focus on не, ні, нічого, ніхто, ніде, ніколи and double-negation rules in Ukrainian.',
  numbers:      'Focus on numeral agreement with nouns: 1 рік / 2–4 роки / 5+ років and ordinal forms.',
};

const TOPIC_HINTS_NL = {
  de_het:       'Focus on whether a noun takes "de" or "het" as its definite article, including common patterns and exceptions.',
  conjugation:  'Focus on present-tense verb conjugation: stem + endings, irregular verbs (zijn, hebben, gaan, doen), and t-rules.',
  past_tense:   'Focus on choosing between simple past (reed, liep) and present perfect (heeft gereden, heeft gelopen), and weak vs strong verb patterns.',
  word_order:   'Focus on the V2 rule (verb-second in main clauses), inversion after fronted adverbials, and verb-final order in subordinate clauses.',
  adjectives:   'Focus on adjective inflection: when to add -e (before de-words and in predicative position) vs no ending.',
  adverbs:      'Focus on Dutch adverbs of time (nu, al, nog), place (hier, daar, ergens) and manner (goed, snel, graag), and correct sentence position.',
  separable:    'Focus on separable verbs (opbellen, meenemen, aanzetten): when the prefix separates, and how to use them in subordinate clauses.',
  prepositions: 'Focus on common prepositions (op, in, aan, bij, naar, van, met, voor, achter, tussen) and the contexts they require.',
};

const TOPIC_HINTS_EN = {
  tenses:       'Focus on choosing the right English tense: present simple vs present continuous, past simple vs present perfect, future forms (will / going to / present continuous).',
  articles:     'Focus on a / an / the / no article. Test definite vs indefinite use, generic statements, and common fixed expressions ("go to bed", "play the piano").',
  conditionals: 'Focus on the four main conditionals (zero, first, second, third) and mixed conditionals. Test which form fits the meaning and the if/main-clause verb pairing.',
  prepositions: 'Focus on prepositions of time (at/on/in), place (at/on/in), and movement (to, into, onto). Include common collocations: "good at", "interested in", "afraid of".',
  word_order:   'Focus on standard SVO order, adverb position (frequency adverbs before the main verb but after "to be"), and question word order with auxiliaries.',
  phrasal:      'Focus on common phrasal verbs (look up, give up, run into, take off) — meaning in context and whether they are separable or inseparable.',
  modals:       'Focus on modal verbs (can, could, may, might, must, should, would). Test ability vs permission, obligation vs advice, and present vs past forms.',
  pronouns:     'Focus on subject vs object pronouns (I/me, he/him), possessives (my/mine), reflexives (myself), and relative pronouns (who/which/that).',
};

const TOPIC_HINT_MAPS = { uk: TOPIC_HINTS_UK, nl: TOPIC_HINTS_NL, en: TOPIC_HINTS_EN };
const TARGET_NAME     = { uk: 'Ukrainian', nl: 'Dutch', en: 'English' };
const NATIVE_NAME     = { en: 'English',  nl: 'Dutch' };

export async function generateExercises(topicId, topicTitle, level = 'a1', includeOpen = false) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key — add your Gemini key in Settings (⚙️)');

  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const langName   = TARGET_NAME[targetCode] || 'Ukrainian';
  const nativeName = NATIVE_NAME[nativeCode] || 'English';
  const lvlLabel   = LEVEL_LABELS[level] || 'A1 beginner';
  const hintMap    = TOPIC_HINT_MAPS[targetCode] || TOPIC_HINTS_UK;
  const hint       = hintMap[topicId] || `Focus on the grammar topic: ${topicTitle}.`;

  const mixLine = includeOpen
    ? 'Include a mix: 6 multiple-choice questions AND 4 open-ended questions (student writes the answer). Spread them naturally — do not group all open questions at the end.'
    : 'All 10 questions must be multiple-choice.';

  const schemaLines = includeOpen
    ? [
        '// Multiple-choice question:',
        '{ "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }',
        '// Open question:',
        '{ "type": "open", "question": "...", "correct_answer": "...", "explanation": "..." }',
      ].join('\n    ')
    : '{ "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }';

  const prompt =
    `Generate exactly 10 grammar exercises for a ${lvlLabel} ${langName} learner.\n` +
    `Topic: "${topicTitle}"\n` +
    `Grammar focus: ${hint}\n` +
    `${mixLine}\n\n` +
    `Return JSON:\n` +
    `{\n  "exercises": [\n    ${schemaLines}\n  ]\n}\n\n` +
    `Rules:\n` +
    `- All ${langName} text (questions, options, correct_answer) must be natural and correct\n` +
    `- CRITICAL: "explanation" field must be written in ${nativeName.toUpperCase()} ONLY. Do NOT write the explanation in ${langName}. ` +
      `You may quote short ${langName} words or phrases inside the ${nativeName} explanation (e.g. quoting the word being tested), but the surrounding sentences must be ${nativeName}.\n` +
    `- Give a DEEP grammar analysis in each explanation (3–5 sentences), covering:\n` +
    `    1. The name of the grammar rule or concept being tested (e.g. "V2 word order", "tangconstructie / middle field placement", "genitive case after negation", "adjective agreement with neuter nouns")\n` +
    `    2. WHY the correct answer is correct — state the underlying rule precisely, using proper linguistic terminology (subject, finite verb, past participle, direct object, middle field, etc.). Do NOT write vague phrasings like "after the first verb" when you mean "after the finite verb" or "in the middle field".\n` +
    `    3. WHY the wrong answer the learner likely picked is wrong — name the mistake precisely (e.g. "places the adverb in the front field, forcing V2 inversion that the sentence doesn't have")\n` +
    `    4. A brief generalisation or mnemonic the learner can reuse\n` +
    `- ACCURACY CHECK: before writing the explanation, mentally parse the correct sentence word by word and confirm your rule actually describes the position shown in the correct answer — not a different position. If your explanation says "X goes after the finite verb" but the correct answer shows X after the direct object, your explanation is WRONG and you must rewrite it.\n` +
    `- Dutch-specific guidance (if ${langName} is Dutch): use the terms "finite verb" (not "first verb"), "past participle", "middle field / middenveld", "verbal bracket / tangconstructie", "V2 word order". Short adverbs like "al", "nog", "niet", "wel" live in the middle field; with a DEFINITE object they follow the object ("Ik heb mijn huiswerk al gedaan"), with an INDEFINITE object they precede it ("Ik heb al een boek gelezen"). State this distinction when it applies.\n` +
    `- Ukrainian-specific guidance (if ${langName} is Ukrainian): name the case explicitly (nominative, genitive, dative, accusative, instrumental, locative, vocative), name the gender, and for verbs name the aspect (perfective/imperfective).\n` +
    `- English-specific guidance (if ${langName} is English): name tenses precisely (present simple, present continuous, present perfect, past simple, past perfect), name auxiliary verbs (do/does/did, have/has/had, be/is/are/was/were), and for prepositions/articles state the rule that fixes the choice rather than just labelling it as "idiomatic".\n` +
    `- Multiple-choice: exactly 4 options, exactly one correct answer\n` +
    `- Open questions: provide one clear, concise correct_answer (not a list)\n` +
    `- Vary exercise style: fill-in-the-blank, choose correct form, spot the error, short translation\n` +
    `- Use realistic everyday sentences — not textbook clichés\n` +
    `- Wrong options should be plausible to someone who hasn't learned the rule yet\n` +
    `- Difficulty: ${lvlLabel}`;

  const body = {
    system_instruction: {
      parts: [{ text: `You are an experienced ${langName} grammar teacher. Your students' native language is ${nativeName}; write all explanations in ${nativeName}. Return ONLY a valid JSON object, no markdown fences.` }],
    },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      // Deeper English explanations (3–5 sentences each) make each item longer, so budget more tokens.
      maxOutputTokens: 6000,
      temperature: 0.5,
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

  const data   = await res.json();
  const parts  = data.candidates?.[0]?.content?.parts || [];
  const text   = parts.filter(p => !p.thought).map(p => p.text).join('').trim();
  const parsed = extractJSON(text);

  if (!parsed?.exercises?.length) throw new Error('Could not parse exercises from response');

  // Normalise: ensure every item has a type, then shuffle MCQ options so the
  // correct answer isn't always index 0 (Gemini tends to copy the schema example).
  return parsed.exercises.slice(0, 10).map(q => {
    const normalised = { type: 'multiple_choice', ...q };
    return shuffleMCQOptions(normalised);
  });
}
