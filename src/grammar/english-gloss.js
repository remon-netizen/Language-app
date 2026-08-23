// Builds an English gloss for one cell of a Ukrainian conjugation table, e.g.
// (йти, imperfective, past, він) -> "he was going".
//
// The point is that the two aspects read differently in English: an imperfective
// past becomes "he was going", a perfective past "he went". That contrast is the
// whole reason the tables are shown side by side, so spelling it out in English
// makes the aspect split visible rather than merely labelled.
//
// Forms are derived from meaning.en rather than stored per verb, so adding a
// verb needs no extra English data unless its past tense is irregular.

/** Irregular past tenses among the verbs this app teaches. */
const IRREGULAR_PAST = {
  be: 'was', begin: 'began', buy: 'bought', choose: 'chose', do: 'did',
  drink: 'drank', eat: 'ate', find: 'found', forget: 'forgot', go: 'went',
  hear: 'heard', know: 'knew', make: 'made', meet: 'met', pay: 'paid',
  read: 'read', say: 'said', see: 'saw', send: 'sent', speak: 'spoke',
  take: 'took', tell: 'told', think: 'thought', understand: 'understood',
  write: 'wrote',
};

const IRREGULAR_3SG = { be: 'is', do: 'does', go: 'goes', have: 'has', say: 'says' };

/** Where -ing needs a doubled consonant or is otherwise irregular. */
const IRREGULAR_ING = {
  be: 'being', begin: 'beginning', forget: 'forgetting', travel: 'travelling',
};

// Verbs whose continuous form is ungrammatical, so an imperfective past has to
// read "he knew" rather than "he was knowing".
const STATIVE = new Set(['be', 'know', 'see', 'hear', 'understand']);

const SUBJECT = {
  'я': 'I', 'ти': 'you', 'він/вона': 'he/she', 'ми': 'we', 'ви': 'you', 'вони': 'they',
  'він': 'he', 'вона': 'she', 'воно': 'it',
};

const THIRD_SG = new Set(['він/вона', 'він', 'вона', 'воно']);
const PLURAL   = new Set(['вони', 'ми', 'ви', 'ти']);

/** 'to go (on foot, completed)' -> 'go';  'to find out' -> 'find out' */
export function englishLemma(meaningEn) {
  return String(meaningEn || '')
    .replace(/^to /, '')
    .split(' / ')[0]
    .split(' (')[0]
    .trim();
}

function pastOf(w) {
  if (IRREGULAR_PAST[w]) return IRREGULAR_PAST[w];
  if (w.endsWith('e')) return w + 'd';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied';
  return w + 'ed';
}

function thirdOf(w) {
  if (IRREGULAR_3SG[w]) return IRREGULAR_3SG[w];
  if (/(s|x|z|ch|sh)$/.test(w)) return w + 'es';
  if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies';
  return w + 's';
}

function ingOf(w) {
  if (IRREGULAR_ING[w]) return IRREGULAR_ING[w];
  if (/[^aeiou]e$/.test(w)) return w.slice(0, -1) + 'ing';
  return w + 'ing';
}

function beForm(pronoun) {
  if (pronoun === 'я') return 'am';
  if (THIRD_SG.has(pronoun)) return 'is';
  return 'are';
}

/**
 * @param {string} meaningEn  the verb's meaning.en, e.g. 'to go (on foot)'
 * @param {string} aspect     'imperfective' | 'perfective'
 * @param {string} tense      'present' | 'past' | 'future' | 'imperative'
 * @param {string} pronoun    the table row key, e.g. 'я' or 'він/вона'
 * @returns {string} the gloss, or '' if it cannot be built
 */
export function englishGloss(meaningEn, aspect, tense, pronoun) {
  const lemma = englishLemma(meaningEn);
  if (!lemma) return '';

  const [head, ...particle] = lemma.split(' ');
  const tail = particle.length ? ' ' + particle.join(' ') : '';

  // Imperative has no subject in English: "go!", "find out!"
  if (tense === 'imperative') return head + tail + '!';

  const subject = SUBJECT[pronoun];
  if (!subject) return '';

  const perfective = aspect === 'perfective';
  const simple = perfective || STATIVE.has(head);

  if (tense === 'present') {
    if (head === 'be') return `${subject} ${beForm(pronoun)}`;
    return `${subject} ${THIRD_SG.has(pronoun) ? thirdOf(head) : head}${tail}`;
  }

  if (tense === 'past') {
    if (head === 'be') return `${subject} ${PLURAL.has(pronoun) ? 'were' : 'was'}`;
    if (simple) return `${subject} ${pastOf(head)}${tail}`;
    return `${subject} ${PLURAL.has(pronoun) ? 'were' : 'was'} ${ingOf(head)}${tail}`;
  }

  if (tense === 'future') {
    if (simple) return `${subject} will ${head}${tail}`;
    return `${subject} will be ${ingOf(head)}${tail}`;
  }

  return '';
}
