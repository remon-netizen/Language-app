import { state } from '../state.js';
import { getApiKey } from '../storage.js';
import { extractJSON, shuffleMCQOptions } from '../utils.js';

const NATIVE_NAME_IB = { en: 'English', nl: 'Dutch' };
function nativeName() { return NATIVE_NAME_IB[state.nativeLanguage] || 'English'; }

// ── Topic definitions ─────────────────────────────────────────────────────────

export const INBURGERING_TOPICS = [
  {
    id:       'kns_overheid',
    icon:     '🏛️',
    title:    'Overheid & Democratie',
    subtitle: 'verkiezingen, gemeente, wetten',
    category: 'kns',
    hint:     'Test exact knowledge of the Dutch government: three tiers (Rijk/provincie/gemeente), elections (Tweede Kamer has 150 seats, elected every 4 years), role of the Koning (signing laws, not governing), coalition formation, the Grondwet. Use tricky distractors: e.g. confuse gemeente vs provincie responsibilities, or ask who appoints the burgemeester (king on recommendation of council, not directly elected). Include "what should you do if…" scenario questions.',
  },
  {
    id:       'kns_zorg',
    icon:     '🏥',
    title:    'Zorg & Gezondheid',
    subtitle: 'huisarts, zorgverzekering, apotheek',
    category: 'kns',
    hint:     'Test exact knowledge of Dutch healthcare: zorgverzekering is mandatory for everyone over 18, current eigen risico is €385/year, verwijzing is needed for a specialist, 112 for life-threatening emergencies, 0900-8844 for non-urgent police. GGD handles public health (vaccinations, STI testing). Distractors: confuse eigen risico with zorgtoeslag, or ask whether you need a verwijzing for a tandarts (no). Include scenario questions: "Je hebt koorts, wat doe je eerst?"',
  },
  {
    id:       'kns_werk',
    icon:     '💼',
    title:    'Werk & Uitkering',
    subtitle: 'UWV, bijstand, arbeidscontract',
    category: 'kns',
    hint:     'Test exact knowledge: WW (werkloosheidsuitkering) from UWV requires at least 26 weeks employment in last 36 weeks, bijstand from gemeente for those with no other income, minimum wage is set nationally and updated twice per year. Payslip (loonstrook) terms: bruto vs netto, loonheffing, vakantiegeld (8%). Distractors: confuse UWV (WW) vs gemeente (bijstand), or ask how long you can receive WW. Scenario: "Je bent ontslagen, waar meld je je?", "Wat staat op een loonstrook?"',
  },
  {
    id:       'kns_onderwijs',
    icon:     '🎓',
    title:    'Onderwijs',
    subtitle: 'basisschool, middelbare school, MBO/HBO',
    category: 'kns',
    hint:     'Test exact knowledge: leerplicht from age 5 to 18 (fully until 16, then partially), basisschool is 8 years (groep 1-8), CITO-toets at end of basisschool, secondary tracks: VMBO (4 years), HAVO (5 years), VWO (6 years, goes to university). MBO = vocational, HBO = university of applied sciences, WO = research university. Distractors: confuse VMBO/HAVO/VWO pathways, or ask what age leerplicht ends. Scenario: "Jouw kind is 4 jaar, moet het naar school?"',
  },
  {
    id:       'kns_wonen',
    icon:     '🏠',
    title:    'Wonen',
    subtitle: 'huurcontract, gemeente, inschrijven',
    category: 'kns',
    hint:     'Test exact knowledge: BRP (Basisregistratie Personen) — you must register at gemeente within 5 days of moving, sociale huur has income limits (set by woningcorporatie), huurtoeslag available if rent is below liberalisatiegrens (~€808/month), landlord must give 1 month notice for inspections. Distractors: confuse social vs free-sector rent rules, who arranges huurtoeslag (Belastingdienst, not gemeente). Scenario: "Je verhuist naar een nieuw adres, wat doe je binnen 5 dagen?", "Wie betaalt de huurtoeslag uit?"',
  },
  {
    id:       'kns_waarden',
    icon:     '⚖️',
    title:    'Normen & Waarden',
    subtitle: 'vrijheid, gelijkheid, grondrechten',
    category: 'kns',
    hint:     'Test exact knowledge: Article 1 of the Grondwet prohibits discrimination, Article 6 guarantees freedom of religion, Article 7 freedom of speech. Equal rights for men and women, same-sex marriage legal since 2001. Separation of church and state. Anti-discrimination law (AWGB). Distractors: ask which article covers which right, or test that freedom of speech has limits (incitement to violence is illegal). Scenario: "Je werkgever betaalt vrouwen minder dan mannen. Wat kun je doen?"',
  },
  {
    id:       'kns_geschiedenis',
    icon:     '🇳🇱',
    title:    'Geschiedenis & Cultuur',
    subtitle: 'WO2, VOC, Nederlandse tradities',
    category: 'kns',
    hint:     'Test exact knowledge: Golden Age 17th century (VOC founded 1602, largest trading company), WWII Netherlands occupied 1940-1945, Anne Frank hid in Amsterdam, Bevrijdingsdag May 5th, Dodenherdenking May 4th, Koningsdag April 27th. Dutch national symbols: orange, tulips, windmills, Deltawerken. Distractors: confuse dates, ask what Koningsdag celebrates (birthday of the king), test that Dodenherdenking is remembrance (not liberation). Scenario: "Wanneer herdenkt Nederland de slachtoffers van WO2?"',
  },
  {
    id:       'taal_lezen',
    icon:     '📖',
    title:    'Lezen & Begrijpen',
    subtitle: 'één langere tekst, meerdere vragen',
    category: 'taal',
    hint:     'READING SESSION: Generate ONE realistic Dutch text of 180-240 words (a formal letter from gemeente, a housing corporation notice, a school newsletter, or a job advertisement). Then generate 10 questions about this text: comprehension questions, vocabulary in context, inference questions, and questions about the purpose/tone of the text. This mirrors the real exam format where one text is read and multiple questions follow.',
  },
  {
    id:       'taal_luisteren',
    icon:     '🎧',
    title:    'Luisteren & Reageren',
    subtitle: 'beluister het fragment, beantwoord de vraag',
    category: 'taal',
    hint:     'LISTENING SESSION: For each of the 10 questions, generate a realistic short spoken fragment (20-50 words) that would be heard in a Dutch daily-life situation (a voicemail from the huisarts, an announcement at school, a conversation at the gemeentehuis loket, a radio news item, a phone call about a job). Each question must include a "situation" field (5-8 words setting the scene) and a "passage" field (the exact words spoken/heard). Then ask a comprehension or reaction question. The learner will hear the passage read aloud.',
  },
  {
    id:       'taal_spreken',
    icon:     '🗣️',
    title:    'Spreken & Reageren',
    subtitle: 'wat zeg je in deze situatie?',
    category: 'taal',
    hint:     'SPEAKING SESSION: Generate 10 exercises testing spoken Dutch responses in realistic civic situations (calling to make a doctor\'s appointment, responding to a job interviewer\'s question, asking for help at the gemeentehuis, explaining a problem to a verhuurder, reacting to a school letter). Each question must include a "situation" field describing the context. Mix multiple-choice (choose the most appropriate response) and open questions (write/say what you would say). Test formal vs informal register distinctions.',
  },
  {
    id:       'taal_schrijven',
    icon:     '✍️',
    title:    'Schrijven',
    subtitle: 'schrijf een brief, e-mail of formulier',
    category: 'taal',
    hint:     'WRITING SESSION — handled separately, do not use this hint for the standard generator.',
  },
  {
    id:       'taal_praktisch',
    icon:     '📋',
    title:    'Praktisch Nederlands',
    subtitle: 'formulieren, brieven, DigiD',
    category: 'taal',
    hint:     'Test practical Dutch literacy at exam level: reading a loonstrook (identify bruto/netto/vakantiegeld/loonheffing), understanding a DigiD activation letter, reading a toeslagenbeschikking from the Belastingdienst, understanding a brief from the woningcorporatie, filling in a huursubsidie form. Questions should use excerpts of realistic official Dutch text and test whether the learner understands the key action required.',
  },
];

// ── Shared fetch helper ───────────────────────────────────────────────────────

async function callGemini(prompt, systemPrompt, maxTokens = 6500) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('No API key — add your Gemini key in Settings (⚙️)');

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.4,
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
  const data  = await res.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  return parts.filter(p => !p.thought).map(p => p.text).join('').trim();
}

// ── Standard questions (KNS + luisteren + spreken + praktisch) ────────────────

export async function generateInburgeringQuestions(topic, level = 'b1') {
  const isA2         = level === 'a2';
  const routeLabel   = isA2 ? 'A2 (Z-route / zelfredzaamheidsroute)' : 'B1 (standaard inburgeringsroute)';
  const langGuidance = isA2
    ? 'Use simple, short sentences. Basic everyday vocabulary. Avoid complex grammar.'
    : 'Use natural B1-level Dutch. Include formal register where realistic (official letters, forms).';

  const isListening = topic.id === 'taal_luisteren';
  const isSpeaking  = topic.id === 'taal_spreken';
  const isLanguage  = topic.category === 'taal';

  const questionSchema = isListening
    ? `{ "type": "multiple_choice", "situation": "short context (5-8 words)", "passage": "spoken fragment text (20-50 words)", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }`
    : isSpeaking
      ? `// Multiple-choice:\n    { "type": "multiple_choice", "situation": "short context (5-8 words)", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." },\n    // Open:\n    { "type": "open", "situation": "short context (5-8 words)", "question": "...", "correct_answer": "...", "explanation": "..." }`
      : isLanguage
        ? `// Multiple-choice:\n    { "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." },\n    // Open:\n    { "type": "open", "question": "...", "correct_answer": "...", "explanation": "..." }`
        : `{ "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }`;

  const typesInstruction = isListening
    ? 'All 10 questions must be multiple_choice. Every question MUST have a "situation" field AND a "passage" field (the spoken text).'
    : isSpeaking
      ? 'Mix: 6 multiple_choice + 4 open. Every question MUST have a "situation" field.'
      : isLanguage
        ? 'Mix: 7 multiple_choice + 3 open.'
        : 'All 10 questions must be multiple_choice. Use the exact style of real DUO KNS exam questions: specific facts, tricky distractors, include scenario questions ("Wat moet je doen als...?").';

  const prompt =
    `You are preparing a Dutch language learner for the official inburgeringsexamen.\n` +
    `Exam route: ${routeLabel}\n` +
    `Topic: "${topic.title}" — ${topic.subtitle}\n` +
    `Focus: ${topic.hint}\n\n` +
    `Generate exactly 10 practice questions.\n` +
    `${typesInstruction}\n\n` +
    `Return JSON:\n` +
    `{\n  "intro": "One sentence in ${nativeName()}: what this topic covers and why it matters.",\n` +
    `  "exercises": [\n    ${questionSchema}\n  ]\n}\n\n` +
    `Rules:\n` +
    `- Questions, options, situations, passages, and correct_answer must be in Dutch\n` +
    `- CRITICAL: "explanation" must be written in ${nativeName().toUpperCase()} ONLY. Never write the explanation in Dutch unless the student's native language is Dutch. ` +
      `You may quote short Dutch words or phrases inside the explanation, but the surrounding sentences must be in the student's native language (${nativeName()}).\n` +
    `- Give a DEEP analysis in each explanation (3–5 sentences): name the grammar rule or civic fact, explain WHY the correct answer is correct, ` +
      `explain WHY the most tempting wrong answer is wrong, and add a reusable takeaway the learner can apply elsewhere.\n` +
    `- Multiple-choice: exactly 4 options, exactly 1 correct, plausible distractors\n` +
    `- Open answers: short (one word, phrase, or sentence)\n` +
    `- Vary scenarios across all 10 questions\n` +
    `- Language level: ${langGuidance}`;

  const raw    = await callGemini(prompt, 'You are an expert on the Dutch inburgeringsexamen. Return ONLY valid JSON, no markdown.');
  const parsed = extractJSON(raw);
  if (!parsed?.exercises?.length) throw new Error('Could not parse questions from response');

  return {
    intro:     parsed.intro || '',
    exercises: parsed.exercises.slice(0, 10).map(q => shuffleMCQOptions({ type: 'multiple_choice', ...q })),
  };
}

// ── Reading session (one long text + 10 questions) ────────────────────────────

export async function generateReadingSession(level = 'b1') {
  const isA2 = level === 'a2';
  const textLevel = isA2
    ? 'A2 level: simple sentences, common vocabulary, short paragraphs'
    : 'B1 level: moderately complex sentences, some formal vocabulary, realistic official tone';

  const prompt =
    `Generate a Dutch reading comprehension session for the inburgeringsexamen (${level.toUpperCase()} route).\n\n` +
    `Step 1 — Write ONE realistic Dutch text of 200-240 words. Choose one of:\n` +
    `  • A formal letter from the gemeente (e.g. about vergunning, uitkering, inschrijving)\n` +
    `  • A notice from a woningcorporatie (e.g. onderhoud, huurverhoging)\n` +
    `  • A school newsletter (e.g. oudersavond, vakantiedagen, activiteiten)\n` +
    `  • A job advertisement\n` +
    `Text level: ${textLevel}\n\n` +
    `Step 2 — Write 10 questions about this text:\n` +
    `  • 4 comprehension questions (what does the text say about X?)\n` +
    `  • 2 vocabulary questions (what does the word "..." mean in this context?)\n` +
    `  • 2 inference questions (why does the sender write this letter? what is the main purpose?)\n` +
    `  • 2 action questions (what must the reader do? by when?)\n\n` +
    `Return JSON:\n` +
    `{\n` +
    `  "text_type": "brief from gemeente / notice / newsletter / job ad",\n` +
    `  "reading_text": "The full Dutch text here (200-240 words)",\n` +
    `  "exercises": [\n` +
    `    { "type": "multiple_choice", "question": "...", "options": ["A","B","C","D"], "correct": 0, "explanation": "..." }\n` +
    `  ]\n` +
    `}\n\n` +
    `Rules:\n` +
    `- reading_text must be in Dutch, realistic, no placeholders\n` +
    `- All 10 exercises reference the reading_text\n` +
    `- Questions and options in Dutch\n` +
    `- CRITICAL: "explanation" must be written in ${nativeName().toUpperCase()} ONLY. Never write the explanation in Dutch unless the student's native language is Dutch. ` +
      `You may quote short Dutch words from the text inside the explanation, but the surrounding sentences must be in the student's native language (${nativeName()}).\n` +
    `- Give a DEEP analysis in each explanation (3–5 sentences): quote the exact line in the text that supports the answer, explain WHY, ` +
      `explain why the tempting distractor is wrong, and note the reading skill being tested (inference, vocabulary in context, main idea, etc.).\n` +
    `- Exactly 4 options, 1 correct per question`;

  const raw    = await callGemini(prompt, 'You are an expert on the Dutch inburgeringsexamen. Return ONLY valid JSON, no markdown.', 7500);
  const parsed = extractJSON(raw);
  if (!parsed?.reading_text || !parsed?.exercises?.length) throw new Error('Could not parse reading session');

  return {
    reading_text: parsed.reading_text,
    text_type:    parsed.text_type || 'tekst',
    exercises:    parsed.exercises.slice(0, 10).map(q => shuffleMCQOptions({ type: 'multiple_choice', ...q })),
  };
}

// ── Writing tasks ─────────────────────────────────────────────────────────────

export async function generateWritingTasks(level = 'b1') {
  const isA2 = level === 'a2';
  const writingLevel = isA2
    ? 'A2: simple sentences, 30-50 words per task, basic vocabulary, informal or semi-formal'
    : 'B1: complete paragraphs, 50-80 words per task, some formal vocabulary, correct salutation/closing';

  const prompt =
    `Generate 3 Dutch writing tasks for the inburgeringsexamen (${level.toUpperCase()} route).\n\n` +
    `Each task should be a realistic civic writing situation:\n` +
    `  • Task 1: Writing a short e-mail or brief (e.g. to verhuurder, school, werkgever)\n` +
    `  • Task 2: Responding to an official situation in writing (e.g. reply to gemeente letter)\n` +
    `  • Task 3: Filling in or writing for a practical purpose (e.g. complaint, request, explanation)\n\n` +
    `Writing level: ${writingLevel}\n\n` +
    `Return JSON:\n` +
    `{\n` +
    `  "tasks": [\n` +
    `    {\n` +
    `      "situation": "2-3 sentences in Dutch describing the context",\n` +
    `      "prompt": "Wat schrijf je? (instruction in Dutch)",\n` +
    `      "word_target": "e.g. 40-60 woorden",\n` +
    `      "criteria": ["criterion 1 in Dutch", "criterion 2", "criterion 3"],\n` +
    `      "example_answer": "A complete example answer in Dutch"\n` +
    `    }\n` +
    `  ]\n` +
    `}\n\n` +
    `Rules:\n` +
    `- situation and prompt in Dutch, example_answer in Dutch\n` +
    `- criteria: 3-4 specific checkable items (e.g. "Je noemt de datum", "Je vraagt om antwoord")\n` +
    `- example_answer must be a realistic, complete Dutch text\n` +
    `- Vary the three tasks: different genres, different recipients`;

  const raw    = await callGemini(prompt, 'You are an expert on the Dutch inburgeringsexamen schrijfvaardigheid. Return ONLY valid JSON, no markdown.', 3000);
  const parsed = extractJSON(raw);
  if (!parsed?.tasks?.length) throw new Error('Could not parse writing tasks');
  return parsed.tasks.slice(0, 3);
}

// ── Writing evaluation ────────────────────────────────────────────────────────

export async function evaluateWriting(task, userText, level = 'b1') {
  const prompt =
    `Evaluate this Dutch writing exercise for the inburgeringsexamen (${level.toUpperCase()} route).\n\n` +
    `Situation: ${task.situation}\n` +
    `Task: ${task.prompt}\n` +
    `Criteria: ${(task.criteria || []).join(', ')}\n` +
    `Word target: ${task.word_target}\n\n` +
    `Learner's answer:\n"${userText}"\n\n` +
    `Return JSON:\n` +
    `{\n` +
    `  "task_completion": "volledig / gedeeltelijk / onvolledig",\n` +
    `  "criteria_met": [true, false, true],\n` +
    `  "grammar_score": "goed / redelijk / matig",\n` +
    `  "vocabulary_score": "goed / redelijk / matig",\n` +
    `  "corrections": ["original sentence → corrected sentence (max 3 most important)"],\n` +
    `  "improved_version": "Full improved Dutch version of the learner's text",\n` +
    `  "tip": "One specific, actionable improvement tip in English"\n` +
    `}\n\n` +
    `Be constructive, fair, and specific. criteria_met array must match the number of criteria given.`;

  const raw    = await callGemini(prompt, 'You are a Dutch language writing teacher. Return ONLY valid JSON, no markdown.', 1500);
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error('Could not evaluate writing');
  return parsed;
}

// ── Speaking evaluation ───────────────────────────────────────────────────────

export async function evaluateSpeaking(situation, question, userResponse, level = 'b1') {
  const prompt =
    `Evaluate this spoken Dutch response for the inburgeringsexamen (${level.toUpperCase()} route).\n\n` +
    `Situation: ${situation}\n` +
    `Question/task: ${question}\n` +
    `Learner said: "${userResponse}"\n\n` +
    `Return JSON:\n` +
    `{\n` +
    `  "appropriate": true/false,\n` +
    `  "register_correct": true/false,\n` +
    `  "grammar_score": "goed / redelijk / matig",\n` +
    `  "better_response": "An improved Dutch version of what they said",\n` +
    `  "explanation": "2-3 sentences in English: what was good, what to improve"\n` +
    `}\n\n` +
    `Be encouraging. If the response is appropriate and understandable, appropriate=true even if imperfect.`;

  const raw    = await callGemini(prompt, 'You are a Dutch speaking skills teacher. Return ONLY valid JSON, no markdown.', 800);
  const parsed = extractJSON(raw);
  if (!parsed) throw new Error('Could not evaluate speaking response');
  return parsed;
}
