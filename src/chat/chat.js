import { state, getTTSLang, getTutorFirstName } from '../state.js';
import { showScreen } from '../router.js';
import { loadApiKey, saveProgress, updatePointsBadge, getApiKey } from '../storage.js';
import { setupRecognition } from '../speech.js';
import { calcSimilarity, escHtml } from '../utils.js';
import { callGeminiAPI } from '../api/gemini.js';
import { callClaudeAPI } from '../api/claude.js';
import { checkGrammarLanguageTool } from '../api/languagetool.js';
import { generateConversationSummary } from '../api/conversation-summary.js';
import { addUserMessage, addBotMessage, addGrammarFeedback, addErrorMessage, addSystemNotice, showTypingIndicator, hideTypingIndicator } from './chat-ui.js';
import { updateSuggestions } from './suggestions.js';
import { t } from '../i18n.js';

export function openFreeChat() {
  state.freeChatLang = state.currentLanguage; // match speech recognition to current language
  showScreen('chatScreen');
  loadApiKey();
  const chatArea = document.getElementById('chatArea');
  if (chatArea.children.length === 0 && state.conversationHistory.length === 0) {
    startConversation();
  }
}

// ── Per-language openers and starter suggestions ──────────────────────────────
// Each entry maps target → native → array of openers / level → suggestion list.
// `uk` field is the target-language utterance (legacy field name, kept to
// avoid touching every consumer); `en` is the translation in the user's
// native language.

function buildOpeners(target, native, n) {
  const data = {
    nl: {
      en: [
        { uk: `Hallo! Ik ben ${n}, jouw Nederlandse taalhulp. Hoe heet jij?`, en: `Hello! I'm ${n}, your Dutch language helper. What's your name?` },
        { uk: `Welkom! Ik ben ${n}. Laten we Nederlands oefenen. Waar kom jij vandaan?`, en: `Welcome! I'm ${n}. Let's practise Dutch. Where are you from?` },
        { uk: `Hoi! Ik ben ${n}. Hoe gaat het vandaag? Wat wil jij leren?`, en: `Hi! I'm ${n}. How are you today? What would you like to learn?` },
      ],
    },
    uk: {
      en: [
        { uk: `Привіт! Я ${n}, твій помічник з української мови. Як тебе звати?`, en: `Hi! I'm ${n}, your Ukrainian language helper. What's your name?` },
        { uk: `Вітаю! Я ${n}. Давай поговоримо по-українськи. Звідки ти?`, en: `Welcome! I'm ${n}. Let's chat in Ukrainian. Where are you from?` },
        { uk: `Привіт! Я ${n}. Як справи сьогодні? Що ти хочеш вивчити?`, en: `Hello! I'm ${n}. How are you today? What would you like to learn?` },
      ],
      nl: [
        { uk: `Привіт! Я ${n}, твій помічник з української мови. Як тебе звати?`, en: `Hallo! Ik ben ${n}, jouw hulp bij het Oekraïens. Hoe heet jij?` },
        { uk: `Вітаю! Я ${n}. Давай поговоримо по-українськи. Звідки ти?`, en: `Welkom! Ik ben ${n}. Laten we Oekraïens oefenen. Waar kom jij vandaan?` },
        { uk: `Привіт! Я ${n}. Як справи сьогодні? Що ти хочеш вивчити?`, en: `Hoi! Ik ben ${n}. Hoe gaat het vandaag? Wat wil jij leren?` },
      ],
    },
    en: {
      nl: [
        { uk: `Hi! I'm ${n}, your English language helper. What's your name?`, en: `Hoi! Ik ben ${n}, jouw hulp bij het Engels. Hoe heet jij?` },
        { uk: `Welcome! I'm ${n}. Let's practise English together. Where are you from?`, en: `Welkom! Ik ben ${n}. Laten we samen Engels oefenen. Waar kom jij vandaan?` },
        { uk: `Hello! I'm ${n}. How are you today? What would you like to learn?`, en: `Hallo! Ik ben ${n}. Hoe gaat het vandaag? Wat wil je leren?` },
      ],
    },
    fr: {
      en: [
        { uk: `Bonjour ! Je suis ${n}, votre assistant pour le français. Comment vous appelez-vous ?`, en: `Hello! I'm ${n}, your French language helper. What's your name?` },
        { uk: `Bienvenue ! Je suis ${n}. Pratiquons le français ensemble. D'où venez-vous ?`, en: `Welcome! I'm ${n}. Let's practise French together. Where are you from?` },
        { uk: `Salut ! Je suis ${n}. Comment allez-vous aujourd'hui ? Qu'est-ce que vous voulez apprendre ?`, en: `Hi! I'm ${n}. How are you today? What would you like to learn?` },
      ],
    },
  };
  return data[target]?.[native] || data[target]?.en || data.uk.en;
}

function buildStarterSuggestions(target, native) {
  const data = {
    nl: {
      en: {
        a1: [
          { uk: 'Ik heet [jouw naam]', en: 'My name is [your name]' },
          { uk: 'Ik kom uit Nederland', en: 'I am from the Netherlands' },
          { uk: 'Goed, dank je!', en: 'Fine, thank you!' },
          { uk: 'Ik begrijp het niet', en: 'I don\'t understand' },
        ],
        a2: [
          { uk: 'Ik heet [naam]. Ik leer Nederlands.', en: 'My name is [name]. I\'m learning Dutch.' },
          { uk: 'Ik woon in Amsterdam', en: 'I live in Amsterdam' },
          { uk: 'Kun je dat herhalen?', en: 'Can you repeat that?' },
          { uk: 'Wat betekent dat?', en: 'What does that mean?' },
        ],
        b1: [
          { uk: 'Ik leer al een tijdje Nederlands', en: 'I\'ve been learning Dutch for a while' },
          { uk: 'Hoe lang leer jij talen?', en: 'How long have you been learning languages?' },
          { uk: 'Ik heb een vraag over grammatica', en: 'I have a question about grammar' },
          { uk: 'Vertel me over Nederland', en: 'Tell me about the Netherlands' },
        ],
        b2: [
          { uk: 'Interessant, wat doe jij eigenlijk?', en: 'Interesting, what do you actually do?' },
          { uk: 'Laten we het hebben over cultuur', en: 'Let\'s talk about culture' },
          { uk: 'Wat denk jij hierover?', en: 'What do you think about this?' },
          { uk: 'Leg me deze grammaticale constructie uit', en: 'Explain this grammar structure to me' },
        ],
      },
    },
    uk: {
      en: {
        a1: [
          { uk: 'Мене звати [your name]', en: 'My name is [your name]' },
          { uk: 'Я з Нідерландів', en: 'I am from the Netherlands' },
          { uk: 'Добре, дякую!', en: 'Fine, thank you!' },
          { uk: 'Я не розумію', en: 'I don\'t understand' },
        ],
        a2: [
          { uk: 'Мене звати [name]. Я вивчаю українську.', en: 'My name is [name]. I\'m learning Ukrainian.' },
          { uk: 'Я живу в Амстердамі', en: 'I live in Amsterdam' },
          { uk: 'Можеш говорити повільніше?', en: 'Can you speak more slowly?' },
          { uk: 'Що це означає?', en: 'What does that mean?' },
        ],
        b1: [
          { uk: 'Я вже деякий час вивчаю українську', en: 'I\'ve been studying Ukrainian for a while' },
          { uk: 'Як давно ти вчиш мови?', en: 'How long have you been learning languages?' },
          { uk: 'Маю питання про граматику', en: 'I have a question about grammar' },
          { uk: 'Розкажи мені про Україну', en: 'Tell me about Ukraine' },
        ],
        b2: [
          { uk: 'Цікаво, а чим ти займаєшся?', en: 'Interesting, and what do you do?' },
          { uk: 'Давай поговоримо про культуру', en: 'Let\'s talk about culture' },
          { uk: 'Що ти думаєш про це?', en: 'What do you think about that?' },
          { uk: 'Поясни мені цю граматичну конструкцію', en: 'Explain this grammar structure to me' },
        ],
      },
      nl: {
        a1: [
          { uk: 'Мене звати [jouw naam]', en: 'Ik heet [jouw naam]' },
          { uk: 'Я з Нідерландів', en: 'Ik kom uit Nederland' },
          { uk: 'Добре, дякую!', en: 'Goed, dank je!' },
          { uk: 'Я не розумію', en: 'Ik begrijp het niet' },
        ],
        a2: [
          { uk: 'Мене звати [naam]. Я вивчаю українську.', en: 'Ik heet [naam]. Ik leer Oekraïens.' },
          { uk: 'Я живу в Амстердамі', en: 'Ik woon in Amsterdam' },
          { uk: 'Можеш говорити повільніше?', en: 'Kun je langzamer spreken?' },
          { uk: 'Що це означає?', en: 'Wat betekent dat?' },
        ],
        b1: [
          { uk: 'Я вже деякий час вивчаю українську', en: 'Ik leer al een tijdje Oekraïens' },
          { uk: 'Як давно ти вчиш мови?', en: 'Hoe lang leer jij al talen?' },
          { uk: 'Маю питання про граматику', en: 'Ik heb een vraag over grammatica' },
          { uk: 'Розкажи мені про Україну', en: 'Vertel me over Oekraïne' },
        ],
        b2: [
          { uk: 'Цікаво, а чим ти займаєшся?', en: 'Interessant, wat doe jij eigenlijk?' },
          { uk: 'Давай поговоримо про культуру', en: 'Laten we het over cultuur hebben' },
          { uk: 'Що ти думаєш про це?', en: 'Wat denk jij hierover?' },
          { uk: 'Поясни мені цю граматичну конструкцію', en: 'Leg me deze grammaticale constructie uit' },
        ],
      },
    },
    en: {
      nl: {
        a1: [
          { uk: 'My name is [your name]', en: 'Ik heet [jouw naam]' },
          { uk: 'I\'m from the Netherlands', en: 'Ik kom uit Nederland' },
          { uk: 'Fine, thank you!', en: 'Goed, dank je!' },
          { uk: 'I don\'t understand', en: 'Ik begrijp het niet' },
        ],
        a2: [
          { uk: 'My name is [name]. I\'m learning English.', en: 'Ik heet [naam]. Ik leer Engels.' },
          { uk: 'I live in Amsterdam', en: 'Ik woon in Amsterdam' },
          { uk: 'Can you repeat that?', en: 'Kun je dat herhalen?' },
          { uk: 'What does that mean?', en: 'Wat betekent dat?' },
        ],
        b1: [
          { uk: 'I\'ve been learning English for a while', en: 'Ik leer al een tijdje Engels' },
          { uk: 'How long have you been learning languages?', en: 'Hoe lang leer jij al talen?' },
          { uk: 'I have a question about grammar', en: 'Ik heb een vraag over grammatica' },
          { uk: 'Tell me about the United Kingdom', en: 'Vertel me iets over het Verenigd Koninkrijk' },
        ],
        b2: [
          { uk: 'Interesting, what do you actually do?', en: 'Interessant, wat doe jij eigenlijk?' },
          { uk: 'Let\'s talk about culture', en: 'Laten we het over cultuur hebben' },
          { uk: 'What do you think about this?', en: 'Wat denk jij hierover?' },
          { uk: 'Could you explain this grammar structure?', en: 'Kun je deze grammaticale constructie uitleggen?' },
        ],
      },
    },
    fr: {
      en: {
        a1: [
          { uk: 'Je m\'appelle [your name]', en: 'My name is [your name]' },
          { uk: 'Je viens de...', en: 'I come from...' },
          { uk: 'Ça va bien, merci !', en: 'I\'m fine, thank you!' },
          { uk: 'Je ne comprends pas', en: 'I don\'t understand' },
        ],
        a2: [
          { uk: 'Je m\'appelle [nom]. J\'apprends le français.', en: 'My name is [name]. I\'m learning French.' },
          { uk: 'J\'habite à Amsterdam', en: 'I live in Amsterdam' },
          { uk: 'Pouvez-vous répéter ?', en: 'Can you repeat that?' },
          { uk: 'Qu\'est-ce que ça veut dire ?', en: 'What does that mean?' },
        ],
        b1: [
          { uk: 'J\'apprends le français depuis un moment', en: 'I\'ve been learning French for a while' },
          { uk: 'Depuis combien de temps apprenez-vous les langues ?', en: 'How long have you been learning languages?' },
          { uk: 'J\'ai une question sur la grammaire', en: 'I have a question about grammar' },
          { uk: 'Parlez-moi de la France', en: 'Tell me about France' },
        ],
        b2: [
          { uk: 'Intéressant, que faites-vous dans la vie ?', en: 'Interesting, what do you do for a living?' },
          { uk: 'Parlons de la culture française', en: 'Let\'s talk about French culture' },
          { uk: 'Qu\'en pensez-vous ?', en: 'What do you think about this?' },
          { uk: 'Pourriez-vous m\'expliquer cette construction grammaticale ?', en: 'Could you explain this grammar structure?' },
        ],
      },
    },
  };
  return data[target]?.[native] || data[target]?.en || data.uk.en;
}

export function startConversation() {
  const target  = state.currentLanguage;
  const native  = state.nativeLanguage;
  const n       = getTutorFirstName();
  const openers = buildOpeners(target, native, n);

  const opener = openers[Math.floor(Math.random() * openers.length)];
  state.conversationHistory.push({ role: 'assistant', content: opener.uk });
  addBotMessage(opener.uk, opener.en);

  const initSugs = buildStarterSuggestions(target, native);
  updateSuggestions(initSugs[state.currentDifficulty] || initSugs.a1);
}

// Localised CEFR difficulty descriptions, indexed by native language.
const DIFF_LABELS = {
  en: {
    a1: 'A1 — very simple words and short phrases, lots of encouragement!',
    a2: 'A2 — basic sentences and everyday vocabulary.',
    b1: 'B1 — natural conversation with grammar notes.',
    b2: 'B2 — rich vocabulary, complex grammar, near-native chat.',
  },
  nl: {
    a1: 'A1 — heel eenvoudige woorden en korte zinnen, veel aanmoediging!',
    a2: 'A2 — eenvoudige zinnen en alledaagse woordenschat.',
    b1: 'B1 — natuurlijk gesprek met grammatica-aantekeningen.',
    b2: 'B2 — rijke woordenschat, complexe grammatica, bijna moedertaal.',
  },
};

export function setDifficulty(diff) {
  state.currentDifficulty = diff;
  document.querySelectorAll('.diff-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.diff === diff);
  });
  state.conversationHistory = [];
  state.grammarErrors = [];
  document.getElementById('chatArea').innerHTML = '';
  document.getElementById('suggestionsList').innerHTML = `<div class="suggestions-empty">${t('chat.suggestionsEmpty')}</div>`;
  hideSummaryPanel();
  const labels = DIFF_LABELS[state.nativeLanguage] || DIFF_LABELS.en;
  addSystemNotice(labels[diff]);
}

export function setLang(lang) {
  state.freeChatLang = lang;
  document.getElementById('langUk').className = 'lang-btn' + (lang === 'uk' ? ' active' : '');
  document.getElementById('langEn').className = 'lang-btn' + (lang === 'en' ? ' active' : '');
}

export async function sendText() {
  const input = document.getElementById('talkInput');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  await processUserInput(text);
}

export async function processUserInput(text) {
  // inTargetLang: true when user is writing in the language they're learning.
  // For Ukrainian: detect Cyrillic — easy.
  // For Dutch/English target: both use Latin and so does the only valid native
  // language for those targets, so we can't reliably distinguish by script.
  // We optimistically assume the user is writing in the target language
  // (the prompt explicitly invites that), and let the AI's grammar feedback
  // catch the case where they typed in their native language instead.
  const inTargetLang = state.currentLanguage === 'uk'
    ? /[\u0400-\u04FF]/.test(text)
    : true;
  const checkGrammar = inTargetLang;

  const userMsgDiv = addUserMessage(text);
  userMsgDiv.querySelector('.redo-btn').addEventListener('click', () => redoFromMessage(userMsgDiv));

  state.totalPoints += 3;
  updatePointsBadge();
  saveProgress();

  showTypingIndicator();

  try {
    const grammarPromise = checkGrammar
      ? checkGrammarLanguageTool(text)
      : Promise.resolve(null);

    const apiKey = getApiKey();
    let convPromise;
    if (apiKey) {
      convPromise = state.currentProvider === 'gemini'
        ? callGeminiAPI(text, inTargetLang)
        : callClaudeAPI(text, inTargetLang);
    } else {
      convPromise = new Promise(r => setTimeout(() => {
        const result = getFallbackResponse(text);
        if (!state.conversationHistory.find(m => m.content === text)) {
          state.conversationHistory.push({ role: 'user', content: text });
        }
        state.conversationHistory.push({ role: 'assistant', content: result.response_uk });
        r(result);
      }, 600));
    }

    const [grammarResult, convResult] = await Promise.all([grammarPromise, convPromise]);
    hideTypingIndicator();

    // Prefer AI grammar feedback (context-aware) over LanguageTool (rule-based only).
    // Fall back to LanguageTool when no API key is set or AI returned no feedback.
    const grammarToShow = convResult?.grammar_feedback ?? grammarResult;
    if (grammarToShow) {
      addGrammarFeedback(grammarToShow, text);
      // Collect errors for the end-of-conversation summary
      if (grammarToShow.has_errors && grammarToShow.corrected) {
        state.grammarErrors.push({
          original:    text,
          corrected:   grammarToShow.corrected,
          explanation: grammarToShow.explanation || '',
        });
      }
    }

    if (convResult) {
      addBotMessage(convResult.response_uk, convResult.response_en);
      if (convResult.suggestions?.length) updateSuggestions(convResult.suggestions);
    }

    // Show summary button once there's enough to summarise (≥ 2 exchanges = 4 messages)
    if (state.conversationHistory.length >= 4) showSummaryButton();

  } catch(err) {
    hideTypingIndicator();
    addErrorMessage(err.message);
  }
}

export function getFallbackResponse(userText) {
  const lower = userText.toLowerCase();

  // English fallback responses (target = English)
  if (state.currentLanguage === 'en') {
    const enResponses = [
      { keys: ['hello','hi','hey','good morning','good afternoon','good evening'], uk: 'Hello! How are you today?', en: 'Hallo! Hoe gaat het vandaag?' },
      { keys: ['fine','good','great','well'], uk: 'That\'s wonderful! I\'m doing well too, thanks for asking.', en: 'Wat fijn! Met mij gaat het ook goed, bedankt voor het vragen.' },
      { keys: ['thank','thanks'], uk: 'You\'re welcome! You\'re doing really well.', en: 'Graag gedaan! Je doet het heel goed.' },
      { keys: ['food','eat','dinner','breakfast','lunch'], uk: 'Food is one of my favourite topics! What did you eat today?', en: 'Eten is een van mijn favoriete onderwerpen! Wat heb je vandaag gegeten?' },
      { keys: ['bye','goodbye','see you','cheerio'], uk: 'Goodbye! Have a wonderful day!', en: 'Tot ziens! Een fijne dag verder!' },
      { keys: ['learn','study','practise','practice'], uk: 'Practice is the key. Keep going — you\'re improving every day!', en: 'Oefenen is de sleutel. Ga zo door — je gaat elke dag vooruit!' },
      { keys: ['england','english','britain','uk','london'], uk: 'England is full of history! Have you ever visited?', en: 'Engeland zit vol geschiedenis! Ben je er ooit geweest?' },
    ];
    const matched = enResponses.find(r => r.keys.some(k => lower.includes(k)));
    const enFallbacks = [
      { uk: 'Interesting! Keep going, you\'re doing well.', en: 'Interessant! Ga zo door, je doet het goed.' },
      { uk: 'Wonderful — your English is getting better and better!', en: 'Geweldig — je Engels gaat steeds beter!' },
      { uk: 'I see. What else would you like to talk about?', en: 'Aha. Waar wil je het verder over hebben?' },
    ];
    const resp = matched || enFallbacks[Math.floor(Math.random() * enFallbacks.length)];
    return {
      response_uk: resp.uk, response_en: resp.en, grammar_feedback: null,
      suggestions: [
        { uk: 'How do you say "..." in English?', en: 'Hoe zeg je "..." in het Engels?' },
        { uk: 'Could you repeat that?', en: 'Kun je dat herhalen?' },
        { uk: 'Thank you very much!', en: 'Heel erg bedankt!' },
        { uk: 'That\'s really interesting', en: 'Dat is echt interessant' },
      ]
    };
  }

  // French fallback responses (target = French)
  if (state.currentLanguage === 'fr') {
    const frResponses = [
      { keys: ['bonjour','salut','bonsoir','hello','hi','hey'], uk: 'Bonjour ! Comment allez-vous aujourd\'hui ?', en: 'Hello! How are you today?' },
      { keys: ['bien','good','fine','great','ça va'], uk: 'Magnifique ! Moi aussi je vais bien, merci !', en: 'Wonderful! I\'m doing well too, thanks!' },
      { keys: ['merci','thank'], uk: 'De rien ! Vous vous débrouillez très bien !', en: 'You\'re welcome! You\'re doing really well!' },
      { keys: ['manger','food','eat','fromage','vin','wine','cheese'], uk: 'La cuisine française est extraordinaire ! Quel est votre plat préféré ?', en: 'French cuisine is extraordinary! What\'s your favourite dish?' },
      { keys: ['bye','revoir','goodbye','salut'], uk: 'Au revoir ! Bonne continuation avec votre français !', en: 'Goodbye! Keep up the good work with your French!' },
      { keys: ['learn','apprendre','étudier','study'], uk: 'Excellent ! La pratique est la clé du succès. Continuez !', en: 'Excellent! Practice is the key to success. Keep going!' },
      { keys: ['france','french','paris','français'], uk: 'La France est un pays magnifique avec une culture riche !', en: 'France is a magnificent country with a rich culture!' },
    ];
    const matched = frResponses.find(r => r.keys.some(k => lower.includes(k)));
    const frFallbacks = [
      { uk: 'Intéressant ! Continuez, vous vous débrouillez bien !', en: 'Interesting! Keep going, you\'re doing well!' },
      { uk: 'Formidable ! Votre français s\'améliore de jour en jour !', en: 'Wonderful! Your French is improving every day!' },
      { uk: 'Je comprends. De quoi d\'autre voulez-vous parler ?', en: 'I understand. What else would you like to talk about?' },
    ];
    const resp = matched || frFallbacks[Math.floor(Math.random() * frFallbacks.length)];
    return {
      response_uk: resp.uk, response_en: resp.en, grammar_feedback: null,
      suggestions: [
        { uk: 'Comment dit-on "..." en français ?', en: 'How do you say "..." in French?' },
        { uk: 'Pouvez-vous répéter ?', en: 'Can you repeat that?' },
        { uk: 'Merci beaucoup !', en: 'Thank you very much!' },
        { uk: 'C\'est très intéressant', en: 'That\'s very interesting' },
      ]
    };
  }

  // Dutch fallback responses
  if (state.currentLanguage === 'nl') {
    const nlResponses = [
      { keys: ['hallo','hoi','hey','goedemorgen','goedemiddag','goedenavond'], uk: 'Hallo! Hoe gaat het met jou?', en: 'Hello! How are you?' },
      { keys: ['goed','prima','uitstekend','geweldig'], uk: 'Geweldig! Ik ga ook goed, dank je!', en: 'Great! I\'m also doing well, thanks!' },
      { keys: ['dank','bedankt','dankjewel'], uk: 'Graag gedaan! Je doet het heel goed!', en: 'You\'re welcome! You\'re doing great!' },
      { keys: ['stroopwafel','kaas','cheese','eten','food'], uk: 'Stroopwafels zijn heerlijk! Eet jij graag Nederlandse snacks?', en: 'Stroopwafels are delicious! Do you enjoy Dutch snacks?' },
      { keys: ['dag','doei','tot ziens','bye','goodbye'], uk: 'Tot ziens! Veel succes met leren!', en: 'Goodbye! Good luck with your studies!' },
      { keys: ['leer','studer','oefenen','practise'], uk: 'Geweldig! Oefenen is de sleutel. Ga zo door!', en: 'Great! Practice is the key. Keep it up!' },
      { keys: ['nederland','dutch','holland','amsterdam'], uk: 'Nederland is een prachtig land! Heb jij Nederland ooit bezocht?', en: 'The Netherlands is a beautiful country! Have you ever visited?' },
    ];
    const matched = nlResponses.find(r => r.keys.some(k => lower.includes(k)));
    const fallbacks = [
      { uk: 'Interessant! Ga door, je doet het goed!', en: 'Interesting! Keep going, you\'re doing well!' },
      { uk: 'Geweldig! Je Nederlands wordt steeds beter!', en: 'Wonderful! Your Dutch is getting better and better!' },
      { uk: 'Ik begrijp het. Wat wil je nog meer zeggen?', en: 'I understand. What else would you like to say?' },
    ];
    const resp = matched || fallbacks[Math.floor(Math.random() * fallbacks.length)];
    return {
      response_uk: resp.uk, response_en: resp.en, grammar_feedback: null,
      suggestions: [
        { uk: 'Hoe zeg je "..." in het Nederlands?', en: 'How do you say "..." in Dutch?' },
        { uk: 'Kun je dat herhalen?', en: 'Can you repeat that?' },
        { uk: 'Dank je wel!', en: 'Thank you!' },
        { uk: 'Dat is heel interessant', en: 'That\'s very interesting' },
      ]
    };
  }

  const responses = [
    { keys: ['привіт','hello','hi','hey','вітаю'], uk: 'Привіт! Як справи?', en: 'Hello! How are you?' },
    { keys: ['добре','fine','good','great','чудово'], uk: 'Чудово! Я теж добре, дякую!', en: 'Wonderful! I\'m also well, thanks!' },
    { keys: ['дякую','thanks','thank'], uk: 'Будь ласка! Ти молодець!', en: 'You\'re welcome! Well done!' },
    { keys: ['люблю','love','подобається','like'], uk: 'Мені теж це дуже подобається!', en: 'I really like that too!' },
    { keys: ['борщ','borscht','їжа','food','їсти','eat'], uk: 'Борщ — це дуже смачно! Ти їв борщ?', en: 'Borscht is very delicious! Have you had borscht?' },
    { keys: ['bye','до побачення','бувай','goodbye'], uk: 'До побачення! Гарного дня!', en: 'Goodbye! Have a great day!' },
    { keys: ['learn','вчити','вчуся','studying'], uk: 'Молодець! Вивчення мови — це чудово! Продовжуй!', en: 'Well done! Learning a language is wonderful! Keep going!' },
    { keys: ['ukraine','україна','ukrainian','українська'], uk: 'Україна — прекрасна країна з багатою культурою!', en: 'Ukraine is a beautiful country with a rich culture!' },
    { keys: ['name','звати','зовуть','називаюся'], uk: 'Приємно познайомитися! А як тебе звати?', en: 'Nice to meet you! And what\'s your name?' },
  ];
  const matched = responses.find(r => r.keys.some(k => lower.includes(k)));
  if (matched) {
    return {
      response_uk: matched.uk, response_en: matched.en, grammar_feedback: null,
      suggestions: [
        { uk: 'Дуже добре!', en: 'Very good!' },
        { uk: 'Розкажи більше', en: 'Tell me more' },
        { uk: 'Я не розумію', en: 'I don\'t understand' },
        { uk: 'Дякую за допомогу', en: 'Thank you for the help' },
      ]
    };
  }
  const fallbacks = [
    { uk: 'Цікаво! Продовжуй, ти добре справляєшся!', en: 'Interesting! Keep going, you\'re doing well!' },
    { uk: 'Чудово! Твоя українська стає кращою!', en: 'Wonderful! Your Ukrainian is getting better!' },
    { uk: 'Я розумію. Що ще ти хочеш сказати?', en: 'I understand. What else would you like to say?' },
    { uk: 'Молодець! Ти робиш гарний прогрес!', en: 'Well done! You\'re making great progress!' },
  ];
  const f = fallbacks[Math.floor(Math.random() * fallbacks.length)];
  return {
    response_uk: f.uk, response_en: f.en, grammar_feedback: null,
    suggestions: [
      { uk: 'Як сказати "..." по-українськи?', en: 'How do you say "..." in Ukrainian?' },
      { uk: 'Ще раз, будь ласка', en: 'Once more, please' },
      { uk: 'Дякую!', en: 'Thank you!' },
      { uk: 'Це дуже цікаво', en: 'That\'s very interesting' },
    ]
  };
}

export function redoFromMessage(msgDiv) {
  const chatArea = document.getElementById('chatArea');
  // Remove the user message and everything added after it (speech feedback, grammar, bot reply)
  while (msgDiv.nextSibling) chatArea.removeChild(msgDiv.nextSibling);
  chatArea.removeChild(msgDiv);

  // Roll back conversation history — remove assistant entry first, then user entry
  if (state.conversationHistory.length && state.conversationHistory[state.conversationHistory.length - 1].role === 'assistant') {
    state.conversationHistory.pop();
  }
  if (state.conversationHistory.length && state.conversationHistory[state.conversationHistory.length - 1].role === 'user') {
    state.conversationHistory.pop();
  }

  // Open the mic so they can try again immediately
  toggleFreeSpeak();
}

export function toggleFreeSpeak() {
  if (state.freeRecording) {
    // User pressed stop — send whatever was accumulated
    if (state.freeRecognition) state.freeRecognition.stop();
    return;
  }
  state.freeRecording = true;
  state.freeSpeechChunks = []; // accumulate transcript across continuous chunks
  updateFreeMicBtn();
  const lang = getTTSLang();
  state.freeRecognition = setupRecognition(lang, (event) => {
    // Collect every finalised chunk while recording
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        state.freeSpeechChunks.push(event.results[i][0].transcript.trim());
      }
    }
  }, async () => {
    // Recognition ended (user pressed stop or browser cut off)
    state.freeRecording = false;
    updateFreeMicBtn();
    const text = (state.freeSpeechChunks || []).join(' ').trim();
    if (text) await processUserInput(text);
  });
  if (state.freeRecognition) state.freeRecognition.start();
}

export function updateFreeMicBtn() {
  const btn = document.getElementById('talkMicBtn');
  if (state.freeRecording) { btn.textContent = '⏹'; btn.classList.add('recording'); }
  else { btn.textContent = '🎙️'; btn.classList.remove('recording'); }
}

// ── Conversation Summary ──────────────────────────────────────────────────────

function showSummaryButton() {
  const btn = document.getElementById('chatSummaryBtn');
  if (btn) btn.style.display = 'block';
}

function hideSummaryPanel() {
  const btn  = document.getElementById('chatSummaryBtn');
  const card = document.getElementById('summaryCard');
  if (btn)  btn.style.display = 'none';
  if (card) { card.style.display = 'none'; card.querySelector('#summaryContent').innerHTML = ''; }
}

export async function showConversationSummary() {
  const btn  = document.getElementById('chatSummaryBtn');
  const card = document.getElementById('summaryCard');
  const body = document.getElementById('summaryContent');
  if (!card || !body) return;

  btn.disabled = true;
  btn.textContent = '⏳ Generating…';
  card.style.display = 'block';
  body.innerHTML = '<div style="color:var(--gray);font-size:0.85rem;text-align:center;padding:12px">Analysing conversation…</div>';

  try {
    const s = await generateConversationSummary();

    body.innerHTML = `
      <div class="sum-overall">${escHtml(s.overall_assessment)}</div>

      ${s.what_went_well?.length ? `
        <div class="sum-section-title">✅ What went well</div>
        <ul class="sum-list">${s.what_went_well.map(x => `<li>${escHtml(x)}</li>`).join('')}</ul>
      ` : ''}

      ${s.mistakes_made?.length ? `
        <div class="sum-section-title">⚠️ Grammar to review</div>
        ${s.mistakes_made.map(m => `
          <div class="sum-mistake">
            <div class="sum-mistake-orig">${escHtml(m.original)}</div>
            <div class="sum-mistake-fix">→ ${escHtml(m.corrected)}</div>
            <div class="sum-mistake-rule">${escHtml(m.rule)}</div>
          </div>`).join('')}
      ` : ''}

      ${s.vocabulary_used?.length ? `
        <div class="sum-section-title">📝 Vocabulary used</div>
        <div class="sum-vocab">
          ${s.vocabulary_used.map(v => `
            <div class="sum-vocab-item">
              <span class="sum-vocab-word">${escHtml(v.word)}</span>
              <span class="sum-vocab-en">${escHtml(v.english)}</span>
              ${v.note ? `<div class="sum-vocab-note">${escHtml(v.note)}</div>` : ''}
            </div>`).join('')}
        </div>
      ` : ''}

      ${s.suggested_focus?.length ? `
        <div class="sum-section-title">🎯 Focus next time</div>
        <ul class="sum-list">${s.suggested_focus.map(x => `<li>${escHtml(x)}</li>`).join('')}</ul>
      ` : ''}

      ${s.encouragement ? `<div class="sum-encouragement">${escHtml(s.encouragement)}</div>` : ''}
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:#dc2626;font-size:0.85rem;padding:8px">${escHtml(err.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = '📊 Refresh Summary';
  }
}
