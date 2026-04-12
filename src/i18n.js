// Minimal i18n layer.
//
// Usage:   t('home.start')        →  "Begin gesprek"  (when nativeLanguage = 'nl')
//          t('lesson.phraseOf', { current: 3, total: 8 })
//
// Strings are keyed by feature.action and resolved against the user's
// nativeLanguage. Falls back to English if a key is missing in the chosen
// dictionary, and to the key itself if missing everywhere — so a partial
// translation is always safe to ship.

import { state } from './state.js';

const dict = {
  en: {
    // Header / shell
    'header.title':       '{flag} {language} Practice',
    'header.tagline':     'Speak. Listen. Learn.',
    'header.settings':    'Settings',

    // Home screen
    'home.iSpeak':        'I speak',
    'home.iLearn':        'I want to learn',
    'home.start':         'Start Conversation',
    'home.grammarTitle':  'Grammar Exercises',
    'home.grammarBtn':    '🎯 Grammar Exercises →',
    'home.myWords':       'My Words',
    'home.inburgering':   'Inburgeringsexamen',
    'home.inburgeringSub':'Practise KNS & language skills for the exam',
    'home.lessons':       '📖 Lessons',
    'home.lessonsSub':    'Practise words and phrases with speech',
    'home.lessonsBtnTitle':'Lessons',
    'home.lessonsBtnSub': 'Practise words and phrases with speech',
    'home.reviewTitle':   'Review',
    'home.reviewSub':     'Practise phrases from memory',
    'home.hwTitle':       'Upload homework',
    'home.hwSub':         'Upload a .docx or .txt and practise speaking the vocabulary',
    'home.hwBtn':         'Choose file',
    'home.browserTitle':  'Use Microsoft Edge for the best voice quality',
    'home.browserSub':    'Edge has Microsoft\'s neural voices — they sound significantly more natural than Chrome\'s.',
    'home.browserClose':  'Got it',

    // Language names (used inside header.title)
    'lang.uk':            'Ukrainian',
    'lang.nl':            'Dutch',
    'lang.en':            'English',

    // Lesson cards
    'lesson.phrases':         'phrases',
    'lesson.tag.beginner':    'beginner',
    'lesson.tag.intermediate':'intermediate',

    // Lesson screen
    'lesson.phraseOf':        'Phrase {current} of {total}',
    'lesson.listen':          'Listen',
    'lesson.listenSlow':      'Slow',
    'lesson.hearMeaning':     'Hear meaning',
    'lesson.playing':         'Playing...',
    'lesson.speak':           'Speak',
    'lesson.stop':            'Stop',
    'lesson.iHeard':          'I heard:',
    'lesson.expected':        'Expected',
    'lesson.heard':           'Heard',
    'lesson.feedback.excellent': 'Excellent pronunciation!',
    'lesson.feedback.good':      'Good effort! A little more practice.',
    'lesson.feedback.tryAgain':  'Keep trying — you\'ll get it!',
    'lesson.feedback.noSpeech':  'Nothing detected. Try again!',
    'lesson.completeSubtitle':   'You practised {count} {name} phrases',
    'lesson.excellent':          'Excellent',
    'lesson.good':               'Good',
    'lesson.avgScore':           'Avg score',

    // Chat screen
    'chat.title':         '{language} AI Conversation',
    'chat.subtitle':      'Talk freely · Grammar feedback · Suggestions',
    'chat.placeholder':   'Type or speak…',
    'chat.send':          'Send →',
    'chat.suggestions':   '💡 Suggested replies',
    'chat.suggestionsEmpty':'Suggestions will appear after the AI responds.',
    'chat.translateTitle':'🔤 Translate to {language}',
    'chat.translateBtn':  'Translate to {language} →',
    'chat.translatePlaceholder':'Type {nativeLanguage} here…',
    'chat.translating':   'Translating…',
    'chat.copy':          '📋 Copy',
    'chat.copied':        '✓ Copied!',
    'chat.summaryBtn':    '📊 Conversation Summary',
    'chat.refreshSummary':'📊 Refresh Summary',
    'chat.generating':    '⏳ Generating…',
    'chat.level':         'Level',

    // Settings drawer
    'settings.title':     'Settings',
    'settings.voice':     'Voice',
    'settings.voiceLoading':'Loading voices…',
    'settings.speed':     'Speech speed',
    'settings.speedSlow': '🐢 Slow',
    'settings.speedNormal':'▶ Normal',
    'settings.aiTitle':   'AI Provider & API Key',
    'settings.test':      '▶ Test',
    'settings.save':      'Save',
    'settings.noKey':     'No key — conversations will use fallback responses',

    // My Words
    'words.title':        '📚 My Words',
    'words.subtitle':     'Words saved from conversations',
  },

  nl: {
    // Header / shell
    'header.title':       '{flag} {language} oefenen',
    'header.tagline':     'Spreek. Luister. Leer.',
    'header.settings':    'Instellingen',

    // Home screen
    'home.iSpeak':        'Ik spreek',
    'home.iLearn':        'Ik wil leren',
    'home.start':         'Begin gesprek',
    'home.grammarTitle':  'Grammatica-oefeningen',
    'home.grammarBtn':    '🎯 Grammatica-oefeningen →',
    'home.myWords':       'Mijn woorden',
    'home.inburgering':   'Inburgeringsexamen',
    'home.inburgeringSub':'Oefen KNS & taalvaardigheid voor het examen',
    'home.lessons':       '📖 Lessen',
    'home.lessonsSub':    'Oefen woorden en zinnen met spraak',
    'home.lessonsBtnTitle':'Lessen',
    'home.lessonsBtnSub': 'Oefen woorden en zinnen met spraak',
    'home.reviewTitle':   'Herhaling',
    'home.reviewSub':     'Oefen zinnen uit je geheugen',
    'home.hwTitle':       'Huiswerk uploaden',
    'home.hwSub':         'Upload een .docx of .txt en oefen de woordenschat met spreken',
    'home.hwBtn':         'Kies bestand',
    'home.browserTitle':  'Gebruik Microsoft Edge voor de beste stemkwaliteit',
    'home.browserSub':    'Edge heeft de neurale stemmen van Microsoft — die klinken veel natuurlijker dan die van Chrome.',
    'home.browserClose':  'Begrepen',

    // Language names
    'lang.uk':            'Oekraïens',
    'lang.nl':            'Nederlands',
    'lang.en':            'Engels',

    // Lesson cards
    'lesson.phrases':         'zinnen',
    'lesson.tag.beginner':    'beginner',
    'lesson.tag.intermediate':'gevorderd',

    // Lesson screen
    'lesson.phraseOf':        'Zin {current} van {total}',
    'lesson.listen':          'Luister',
    'lesson.listenSlow':      'Langzaam',
    'lesson.hearMeaning':     'Hoor betekenis',
    'lesson.playing':         'Wordt afgespeeld...',
    'lesson.speak':           'Spreek',
    'lesson.stop':            'Stop',
    'lesson.iHeard':          'Ik hoorde:',
    'lesson.expected':        'Verwacht',
    'lesson.heard':           'Gehoord',
    'lesson.feedback.excellent': 'Uitstekende uitspraak!',
    'lesson.feedback.good':      'Goed bezig! Nog een beetje oefenen.',
    'lesson.feedback.tryAgain':  'Blijf het proberen — het gaat lukken!',
    'lesson.feedback.noSpeech':  'Niets gehoord. Probeer het nog eens!',
    'lesson.completeSubtitle':   'Je hebt {count} {name}-zinnen geoefend',
    'lesson.excellent':          'Uitstekend',
    'lesson.good':               'Goed',
    'lesson.avgScore':           'Gem. score',

    // Chat screen
    'chat.title':         '{language} AI-gesprek',
    'chat.subtitle':      'Praat vrijuit · Grammatica-feedback · Suggesties',
    'chat.placeholder':   'Typ of spreek…',
    'chat.send':          'Verstuur →',
    'chat.suggestions':   '💡 Suggesties',
    'chat.suggestionsEmpty':'Suggesties verschijnen nadat de AI heeft geantwoord.',
    'chat.translateTitle':'🔤 Vertaal naar {language}',
    'chat.translateBtn':  'Vertaal naar {language} →',
    'chat.translatePlaceholder':'Typ hier {nativeLanguage}…',
    'chat.translating':   'Vertalen…',
    'chat.copy':          '📋 Kopiëren',
    'chat.copied':        '✓ Gekopieerd!',
    'chat.summaryBtn':    '📊 Gespreksamenvatting',
    'chat.refreshSummary':'📊 Samenvatting vernieuwen',
    'chat.generating':    '⏳ Bezig met genereren…',
    'chat.level':         'Niveau',

    // Settings drawer
    'settings.title':     'Instellingen',
    'settings.voice':     'Stem',
    'settings.voiceLoading':'Stemmen laden…',
    'settings.speed':     'Spreeksnelheid',
    'settings.speedSlow': '🐢 Langzaam',
    'settings.speedNormal':'▶ Normaal',
    'settings.aiTitle':   'AI-aanbieder & API-sleutel',
    'settings.test':      '▶ Test',
    'settings.save':      'Opslaan',
    'settings.noKey':     'Geen sleutel — gesprekken gebruiken standaardantwoorden',

    // My Words
    'words.title':        '📚 Mijn woorden',
    'words.subtitle':     'Opgeslagen woorden uit gesprekken',
  },
};

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`);
}

export function t(key, vars) {
  const lang = state.nativeLanguage || 'en';
  const tpl = (dict[lang] && dict[lang][key]) || dict.en[key] || key;
  return interpolate(tpl, vars);
}

// Localised name of *any* language code, written in the user's native language.
// Used by the language pickers and chat title.
export function languageName(code, inLang = state.nativeLanguage) {
  return (dict[inLang] && dict[inLang][`lang.${code}`]) || dict.en[`lang.${code}`] || code;
}
