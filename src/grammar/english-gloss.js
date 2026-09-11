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

/**
 * A delimitative perfective ("по-" + verb) means "do it for a while", not "do it
 * to completion". The data records that as "(for a while, completed)", so pull the
 * phrase out and keep it: dropping it turns попрацював into a flat "he worked",
 * which is actually the commonest reading of the *imperfective* попрацював pairs with.
 */
function qualifierOf(meaningEn) {
  const paren = /\(([^)]*)\)/.exec(String(meaningEn || ''));
  if (!paren) return '';
  const d = /for a (while|bit)/.exec(paren[1]);
  return d ? `for a ${d[1]}` : '';
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
 * @param {object} verb     a CONJUGATIONS entry
 * @param {string} tense    'present' | 'past' | 'future' | 'imperative'
 * @param {string} pronoun  the table row key, e.g. 'я' or 'він/вона'
 * @returns {string} the gloss, or '' if it cannot be built
 */
export function englishGloss(verb, tense, pronoun) {
  const meaningEn = verb && verb.meaning ? verb.meaning.en : '';
  const lemma = englishLemma(meaningEn);
  if (!lemma) return '';

  const [head, ...particle] = lemma.split(' ');
  const tail = particle.length ? ' ' + particle.join(' ') : '';
  const perfective = verb.aspect === 'perfective';
  // Only a perfective is bounded, so only it can carry the "for a while". The
  // phrase comes from meaning.en rather than the delimitative flag because some
  // delimitatives (погуляти -> "take a walk") already read as bounded in English,
  // where appending it again would be redundant.
  const q = perfective && qualifierOf(meaningEn) ? ' ' + qualifierOf(meaningEn) : '';

  // Imperative has no subject in English: "go!", "find out!"
  if (tense === 'imperative') return `${head}${tail}${q}!`;

  const subject = SUBJECT[pronoun];
  if (!subject) return '';

  const simple = perfective || STATIVE.has(head);

  if (tense === 'present') {
    if (head === 'be') return `${subject} ${beForm(pronoun)}`;
    return `${subject} ${THIRD_SG.has(pronoun) ? thirdOf(head) : head}${tail}`;
  }

  if (tense === 'past') {
    if (head === 'be') return `${subject} ${PLURAL.has(pronoun) ? 'were' : 'was'}`;
    if (simple) return `${subject} ${pastOf(head)}${tail}${q}`;
    return `${subject} ${PLURAL.has(pronoun) ? 'were' : 'was'} ${ingOf(head)}${tail}`;
  }

  if (tense === 'future') {
    if (simple) return `${subject} will ${head}${tail}${q}`;
    return `${subject} will be ${ingOf(head)}${tail}`;
  }

  return '';
}

/**
 * One line of usage guidance per tense block.
 *
 * The per-row gloss can only ever show one English reading, but a Ukrainian
 * imperfective past covers three (progressive, habitual, plain factual). Showing
 * only "he was working" teaches a false equivalence -- yet replacing it with
 * "he worked" would read identically to the perfective and erase the contrast the
 * side-by-side tables exist to show. So the row keeps the contrastive reading and
 * this line states the full range underneath.
 *
 * English only, matching the glosses it sits with.
 *
 * @param {object} verb   a CONJUGATIONS entry
 * @param {string} tense  'present' | 'past' | 'future' | 'imperative'
 * @returns {string} the note, or '' when a tense needs none
 */
export function aspectNote(verb, tense) {
  const meaningEn = verb && verb.meaning ? verb.meaning.en : '';
  const lemma = englishLemma(meaningEn);
  if (!lemma) return '';

  const [head, ...particle] = lemma.split(' ');
  const tail = particle.length ? ' ' + particle.join(' ') : '';
  const v = head + tail;

  if (verb.aspect === 'imperfective') {
    // Present needs no note: "I work" already says it, and the pair tip carries
    // the aspect contrast. Only tenses with a quirk of their own get a line.
    if (tense === 'present') return '';
    if (tense === 'past') {
      if (head === 'be') return 'a state that held over time';
      if (STATIVE.has(head)) return `a state that held over time: ${pastOf(head)}${tail} · used to ${v}`;
      return `ongoing, repeated, or simply factual: was ${ingOf(head)}${tail} · used to ${v} · ${pastOf(head)}${tail}`;
    }
    // Statives have no continuous, so there is no progressive to contrast against;
    // offering one would print the very "will be knowing" this module avoids.
    if (tense === 'future') {
      return STATIVE.has(head)
        ? `a state that will hold — “will ${v}”`
        : `usually just “will ${v}” — not only “will be ${ingOf(head)}${tail}”`;
    }
    if (tense === 'imperative') return 'general or repeated — and the normal choice after “не”';
    return '';
  }

  // Only the past gets a note. Future and imperative repeated the same "one
  // completed action" line three times over; the pair tip now says it once, and
  // says it better. The past keeps its line because it sits directly opposite the
  // imperfective past, where the contrast is the point of the two columns.
  //
  // Read the flag rather than the prose: погуляти is delimitative but its
  // meaning.en says "(completed)", so wording alone misclassified it.
  if (tense === 'past') {
    return verb.delimitative
      ? 'one bounded stretch — done for a while, not finished off'
      : 'one action, seen as completed';
  }
  return '';
}
