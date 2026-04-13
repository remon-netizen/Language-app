// ── Language sets ────────────────────────────────────────────────────────────
// Native = the language the learner already speaks (interface language).
// Target = the language the learner is studying.
// Invariant: native !== target.
export const NATIVE_LANGUAGES = ['nl', 'en'];
export const TARGET_LANGUAGES = ['uk', 'nl', 'en', 'fr'];

const DEFAULT_NATIVE = 'nl';
const DEFAULT_TARGET = 'uk';

function loadInitialLanguages() {
  let native = localStorage.getItem('appNativeLanguage') || DEFAULT_NATIVE;
  if (!NATIVE_LANGUAGES.includes(native)) native = DEFAULT_NATIVE;

  let target = localStorage.getItem('appLanguage') || DEFAULT_TARGET;
  if (!TARGET_LANGUAGES.includes(target)) target = DEFAULT_TARGET;

  // Enforce native !== target. If somehow equal (e.g. upgraded install where
  // appLanguage='nl' and we just defaulted nativeLanguage='nl'), pick the
  // first valid alternative target.
  if (target === native) {
    target = TARGET_LANGUAGES.find(t => t !== native) || DEFAULT_TARGET;
  }
  return { native, target };
}

const initialLangs = loadInitialLanguages();

export const state = {
  currentLesson: null,
  currentPhraseIndex: 0,
  lessonScores: [],
  totalPoints: 0,
  recognition: null,
  synth: window.speechSynthesis,
  isRecording: false,
  freeChatLang: 'uk',
  freeRecording: false,
  freeRecognition: null,
  categoryProgress: {},
  conversationHistory: [],
  grammarErrors: [],         // collected during current conversation for summary
  currentDifficulty: 'a1',
  currentProvider: localStorage.getItem('aiProvider') || 'gemini',
  // Target language — what the learner is studying ('uk' | 'nl' | 'en').
  currentLanguage: initialLangs.target,
  // Native language — what the learner already speaks ('nl' | 'en').
  // Drives UI strings, AI explanation language, translator source.
  nativeLanguage: initialLangs.native,
  speechRate: parseFloat(localStorage.getItem('speechRate') || '1.0'),
  selectedVoice: null,      // selected Ukrainian voice
  selectedNlVoice: null,    // selected Dutch voice
  selectedEnVoice: null,    // selected English voice
  selectedFrVoice: null,    // selected French voice
  availableUkVoices: [],
  availableNlVoices: [],
  availableEnVoices: [],
  availableFrVoices: [],
};

// Possible target languages for a given native language (excludes the native).
export function validTargetsFor(native) {
  return TARGET_LANGUAGES.filter(t => t !== native);
}

// ── Language helpers ─────────────────────────────────────────────────────────
// BCP-47 language tag for Web Speech API + TTS.
export function getTTSLang() {
  switch (state.currentLanguage) {
    case 'nl': return 'nl-NL';
    case 'en': return 'en-GB';
    case 'fr': return 'fr-FR';
    case 'uk':
    default:   return 'uk-UA';
  }
}

// Short code used by LanguageTool API.
export function getLTLang() {
  switch (state.currentLanguage) {
    case 'nl': return 'nl';
    case 'en': return 'en-GB';
    case 'fr': return 'fr';
    case 'uk':
    default:   return 'uk';
  }
}

// Long human-readable name of the target language, written in the user's
// native language. Used in UI labels like "Translate to Ukrainian".
export function getTargetLanguageName(inLang = state.nativeLanguage) {
  const names = {
    en: { uk: 'Ukrainian', nl: 'Dutch',     en: 'English', fr: 'French' },
    nl: { uk: 'Oekraïens', nl: 'Nederlands', en: 'Engels',  fr: 'Frans' },
  };
  return names[inLang]?.[state.currentLanguage] || state.currentLanguage;
}

// Flag emoji for the current target language.
export function getTargetFlag() {
  return { uk: '🇺🇦', nl: '🇳🇱', en: '🇬🇧', fr: '🇫🇷' }[state.currentLanguage] || '🌐';
}

// Extract the human first name from a TTS voice name.
// e.g. "Microsoft Maarten Online (nl-NL)" → "Maarten"
//      "Google Nederlands"                → null  (no real name)
function extractFirstName(voiceName) {
  if (!voiceName) return null;
  const cleaned = voiceName
    .replace(/^(Microsoft|Google|Apple|Amazon)\s+/i, '') // strip vendor
    .replace(/\s+(Online|Natural|Neural|Desktop|Mobile|Enhanced)\b.*/i, '') // strip quality tag
    .replace(/[\s\-–]+[\(\[]?[a-z]{2}[-_][A-Z]{2}[\)\]]?.*$/, '') // strip lang code
    .trim();
  const first = cleaned.split(/\s+/)[0];
  // Reject non-names (language labels like "Nederlands", "Ukrainian", etc.)
  if (!first || /^(Nederlands|Ukrainian|English|German|French|Spanish|Dutch|Engels|Oekraïens|Français|Frans)$/i.test(first)) return null;
  return first;
}

// Default tutor name when the TTS voice has no human name embedded.
const DEFAULT_TUTOR = { uk: 'Sasha', nl: 'Emma', en: 'Oliver', fr: 'Pierre' };

export function getTutorFirstName() {
  const voice =
    state.currentLanguage === 'nl' ? state.selectedNlVoice :
    state.currentLanguage === 'en' ? state.selectedEnVoice :
    state.currentLanguage === 'fr' ? state.selectedFrVoice :
    null;
  if (voice) {
    const extracted = extractFirstName(voice.name);
    if (extracted) return extracted;
  }
  return DEFAULT_TUTOR[state.currentLanguage] || 'Sasha';
}

export function getTutorName() {
  return `${getTutorFirstName()} ${getTargetFlag()}`;
}
