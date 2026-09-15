// ── Ukrainian pronouns: personal and possessive, all cases ────────────────────
// Personal pronouns have one form per case. Third-person forms take an н-
// after a preposition (у нього, до неї, з ними); those are accepted answers.
// Possessives decline like adjectives: masculine, feminine, neuter, plural.
// Where two forms are in use (accusative animate/inanimate, locative -ому/-ім)
// the first is the primary answer and the rest are accepted.

export const PRON_CASES = ['nominative', 'genitive', 'dative', 'accusative', 'instrumental', 'locative'];

const P = (word, en, nl, forms, alts = {}) => ({ word, kind: 'personal', meaning: { en, nl }, forms, alts });

export const PERSONAL = [
  P('я',    'I',        'ik',   { nominative: 'я',    genitive: 'мене', dative: 'мені', accusative: 'мене', instrumental: 'мною', locative: 'мені' }),
  P('ти',   'you',      'jij',  { nominative: 'ти',   genitive: 'тебе', dative: 'тобі', accusative: 'тебе', instrumental: 'тобою', locative: 'тобі' }),
  P('він',  'he',       'hij',  { nominative: 'він',  genitive: 'його', dative: 'йому', accusative: 'його', instrumental: 'ним',  locative: 'ньому' },
    { genitive: ['нього'], accusative: ['нього'], locative: ['нім'] }),
  P('вона', 'she',      'zij',  { nominative: 'вона', genitive: 'її',   dative: 'їй',   accusative: 'її',   instrumental: 'нею',  locative: 'ній' },
    { genitive: ['неї'], accusative: ['неї'] }),
  P('воно', 'it',       'het',  { nominative: 'воно', genitive: 'його', dative: 'йому', accusative: 'його', instrumental: 'ним',  locative: 'ньому' },
    { genitive: ['нього'], accusative: ['нього'], locative: ['нім'] }),
  P('ми',   'we',       'wij',  { nominative: 'ми',   genitive: 'нас',  dative: 'нам',  accusative: 'нас',  instrumental: 'нами', locative: 'нас' }),
  P('ви',   'you (pl./formal)', 'jullie / u', { nominative: 'ви', genitive: 'вас', dative: 'вам', accusative: 'вас', instrumental: 'вами', locative: 'вас' }),
  P('вони', 'they',     'zij (mv.)', { nominative: 'вони', genitive: 'їх', dative: 'їм', accusative: 'їх', instrumental: 'ними', locative: 'них' },
    { genitive: ['них'], accusative: ['них'] }),
];

// Possessive paradigms. Each case maps gender → [primary, ...accepted].
const G = (m, f, n, p) => ({ m, f, n, p });
const poss = (word, en, nl, rows) => ({ word, kind: 'possessive', meaning: { en, nl }, forms: rows });

// Builds the six cases for the мій / твій / свій pattern.
function soft(stem) { // stem = 'м' | 'тв' | 'св'
  const s = stem;
  return {
    nominative:   G([`${s}ій`], [`${s}оя`], [`${s}оє`], [`${s}ої`]),
    genitive:     G([`${s}ого`], [`${s}оєї`], [`${s}ого`], [`${s}оїх`]),
    dative:       G([`${s}оєму`], [`${s}оїй`], [`${s}оєму`], [`${s}оїм`]),
    accusative:   G([`${s}ій`, `${s}ого`], [`${s}ою`], [`${s}оє`], [`${s}ої`, `${s}оїх`]),
    instrumental: G([`${s}оїм`], [`${s}оєю`], [`${s}оїм`], [`${s}оїми`]),
    locative:     G([`${s}оєму`, `${s}оїм`], [`${s}оїй`], [`${s}оєму`, `${s}оїм`], [`${s}оїх`]),
  };
}
// Builds the six cases for the наш / ваш pattern.
function hard(stem) { // stem = 'наш' | 'ваш'
  const s = stem;
  return {
    nominative:   G([s], [`${s}а`], [`${s}е`], [`${s}і`]),
    genitive:     G([`${s}ого`], [`${s}ої`], [`${s}ого`], [`${s}их`]),
    dative:       G([`${s}ому`], [`${s}ій`], [`${s}ому`], [`${s}им`]),
    accusative:   G([s, `${s}ого`], [`${s}у`], [`${s}е`], [`${s}і`, `${s}их`]),
    instrumental: G([`${s}им`], [`${s}ою`], [`${s}им`], [`${s}ими`]),
    locative:     G([`${s}ому`, `${s}ім`], [`${s}ій`], [`${s}ому`, `${s}ім`], [`${s}их`]),
  };
}

export const POSSESSIVE = [
  poss('мій',   'my',                'mijn',        soft('м')),
  poss('твій',  'your (sg.)',        'jouw',        soft('тв')),
  poss('свій',  'one\'s own',        'eigen',       soft('св')),
  poss('наш',   'our',               'ons / onze',  hard('наш')),
  poss('ваш',   'your (pl./formal)', 'jullie / uw', hard('ваш')),
  poss('їхній', 'their',             'hun', {
    nominative:   G(['їхній'], ['їхня'], ['їхнє'], ['їхні']),
    genitive:     G(['їхнього'], ['їхньої'], ['їхнього'], ['їхніх']),
    dative:       G(['їхньому'], ['їхній'], ['їхньому'], ['їхнім']),
    accusative:   G(['їхній', 'їхнього'], ['їхню'], ['їхнє'], ['їхні', 'їхніх']),
    instrumental: G(['їхнім'], ['їхньою'], ['їхнім'], ['їхніми']),
    locative:     G(['їхньому', 'їхнім'], ['їхній'], ['їхньому', 'їхнім'], ['їхніх']),
  }),
];

// його / її (his / her) never change form; worth knowing, not worth drilling.
export const INDECLINABLE_NOTE = {
  en: 'його (his/its) and її (her) never change: його книга, з його книгою. Only їхній (their) declines.',
  nl: 'його (zijn) en її (haar) veranderen nooit: його книга, з його книгою. Alleen їхній (hun) verbuigt.',
};

export const GENDER_LABELS = { m: { en: 'masculine', nl: 'mannelijk' }, f: { en: 'feminine', nl: 'vrouwelijk' }, n: { en: 'neuter', nl: 'onzijdig' }, p: { en: 'plural', nl: 'meervoud' } };
