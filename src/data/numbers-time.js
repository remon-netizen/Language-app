// ── Ukrainian numbers, ordinals and clock time ────────────────────────────────
// Pure data + generators for the Numbers & Time Drill. Every drill item has:
//   key      unique id used for weakness tracking ("card:17", "time:7:30", …)
//   prompt   what the learner sees (digits / "3rd" / "7:30")
//   answers  accepted Ukrainian answers, first one is the canonical form
//   note     { en, nl } short explanation shown after checking
//   value    numeric value (numbers/ordinals) or "h:mm" (time), for MC/listen modes

// ── Cardinals ─────────────────────────────────────────────────────────────────

export const UNITS = {
  0: 'нуль', 1: 'один', 2: 'два', 3: 'три', 4: 'чотири', 5: "п'ять",
  6: 'шість', 7: 'сім', 8: 'вісім', 9: "дев'ять", 10: 'десять',
  11: 'одинадцять', 12: 'дванадцять', 13: 'тринадцять', 14: 'чотирнадцять',
  15: "п'ятнадцять", 16: 'шістнадцять', 17: 'сімнадцять', 18: 'вісімнадцять',
  19: "дев'ятнадцять",
};
export const TENS = {
  20: 'двадцять', 30: 'тридцять', 40: 'сорок', 50: "п'ятдесят",
  60: 'шістдесят', 70: 'сімдесят', 80: 'вісімдесят', 90: "дев'яносто",
};
export const HUNDREDS = {
  100: 'сто', 200: 'двісті', 300: 'триста', 400: 'чотириста', 500: "п'ятсот",
  600: 'шістсот', 700: 'сімсот', 800: 'вісімсот', 900: "дев'ятсот",
};

// "тисяча" declines after the number in front of it:
// 1 тисяча · 2–4 тисячі · 5+ тисяч  (and 21, 31… behave like 1; 22–24 like 2–4)
export function thousandWord(n) {
  const last2 = n % 100, last = n % 10;
  if (last2 >= 11 && last2 <= 19) return 'тисяч';
  if (last === 1) return 'тисяча';
  if (last >= 2 && last <= 4) return 'тисячі';
  return 'тисяч';
}

// Cardinal words for 0 … 999 999. Returns the canonical masculine form.
export function cardinal(n) {
  if (n < 20) return UNITS[n];
  if (n < 100) {
    const t = Math.floor(n / 10) * 10, u = n % 10;
    return u ? `${TENS[t]} ${UNITS[u]}` : TENS[t];
  }
  if (n < 1000) {
    const h = Math.floor(n / 100) * 100, rest = n % 100;
    return rest ? `${HUNDREDS[h]} ${cardinal(rest)}` : HUNDREDS[h];
  }
  const th = Math.floor(n / 1000), rest = n % 1000;
  // тисяча is feminine, so 1 → одна and 2 → дві in front of it. Bare "тисяча"
  // (without одна) is what people actually say for 1000.
  const thWords = th === 1 ? 'тисяча' : `${feminine(cardinal(th))} ${thousandWord(th)}`;
  return rest ? `${thWords} ${cardinal(rest)}` : thWords;
}

// один → одна, два → дві at the end of a number phrase (feminine agreement).
function feminine(words) {
  return words.replace(/один$/, 'одна').replace(/два$/, 'дві');
}

// Accepted alternatives beyond the canonical form (gender variants etc.).
function cardinalAlts(n) {
  const alts = [];
  const last = n % 10, last2 = n % 100;
  const c = cardinal(n);
  if (n === 1) alts.push('одна', 'одне', 'одно');
  else if (n === 2) alts.push('дві');
  else if (last === 1 && last2 !== 11) alts.push(c.replace(/один$/, 'одна'), c.replace(/один$/, 'одне'));
  else if (last === 2 && last2 !== 12) alts.push(c.replace(/два$/, 'дві'));
  if (n >= 1000 && Math.floor(n / 1000) === 1) alts.push(c.replace(/^тисяча/, 'одна тисяча'));
  return alts;
}

function cardinalNote(n) {
  if (n < 20) return null;
  if (n < 100) {
    const t = Math.floor(n / 10) * 10, u = n % 10;
    if (!u) return null;
    return {
      en: `${TENS[t]} (${t}) + ${UNITS[u]} (${u}) — tens and units are just placed side by side.`,
      nl: `${TENS[t]} (${t}) + ${UNITS[u]} (${u}) — tientallen en eenheden worden gewoon achter elkaar gezet.`,
    };
  }
  if (n < 1000) {
    const h = Math.floor(n / 100) * 100, rest = n % 100;
    if (!rest) return null;
    return {
      en: `${HUNDREDS[h]} (${h}) + ${cardinal(rest)} (${rest}).`,
      nl: `${HUNDREDS[h]} (${h}) + ${cardinal(rest)} (${rest}).`,
    };
  }
  const th = Math.floor(n / 1000);
  return {
    en: `тисяча declines: 1 тисяча · 2–4 тисячі · 5+ тисяч. Here: ${th} → ${thousandWord(th)}.`,
    nl: `тисяча verbuigt: 1 тисяча · 2–4 тисячі · 5+ тисяч. Hier: ${th} → ${thousandWord(th)}.`,
  };
}

function cardinalItem(n) {
  return {
    key: `card:${n}`, kind: 'cardinal', value: n,
    prompt: String(n),
    answers: [cardinal(n), ...cardinalAlts(n)],
    note: cardinalNote(n),
  };
}

// ── Ordinals ──────────────────────────────────────────────────────────────────

// Masculine nominative. Compound ordinals only change the last word:
// 21st = двадцять перший.
export const ORDINAL_BASE = {
  1: 'перший', 2: 'другий', 3: 'третій', 4: 'четвертий', 5: "п'ятий",
  6: 'шостий', 7: 'сьомий', 8: 'восьмий', 9: "дев'ятий", 10: 'десятий',
  11: 'одинадцятий', 12: 'дванадцятий', 13: 'тринадцятий', 14: 'чотирнадцятий',
  15: "п'ятнадцятий", 16: 'шістнадцятий', 17: 'сімнадцятий', 18: 'вісімнадцятий',
  19: "дев'ятнадцятий", 20: 'двадцятий', 30: 'тридцятий', 40: 'сороковий',
  50: "п'ятдесятий", 60: 'шістдесятий', 70: 'сімдесятий', 80: 'вісімдесятий',
  90: "дев'яностий", 100: 'сотий', 1000: 'тисячний',
};

export const GENDERS = ['m', 'f', 'n'];

// Turn a masculine ordinal into the requested gender (nominative).
export function ordinalGender(masc, gender) {
  if (gender === 'm') return masc;
  const soft = masc.endsWith('ій'); // третій → третя / третє
  const stem = masc.slice(0, -2);
  if (gender === 'f') return stem + (soft ? 'я' : 'а');
  return stem + (soft ? 'є' : 'е');
}

export function ordinal(n, gender = 'm') {
  if (ORDINAL_BASE[n]) return ordinalGender(ORDINAL_BASE[n], gender);
  if (n < 100) {
    const t = Math.floor(n / 10) * 10, u = n % 10;
    return `${TENS[t]} ${ordinalGender(ORDINAL_BASE[u], gender)}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100) * 100, rest = n % 100;
    return `${HUNDREDS[h]} ${ordinal(rest, gender)}`;
  }
  return ordinalGender(ORDINAL_BASE[n], gender);
}

export function ordinalSuffix(n, native) {
  if (native === 'nl') return `${n}e`;
  const l2 = n % 100, l = n % 10;
  if (l2 >= 11 && l2 <= 13) return `${n}th`;
  return `${n}${l === 1 ? 'st' : l === 2 ? 'nd' : l === 3 ? 'rd' : 'th'}`;
}

export const GENDER_LABEL = {
  m: { en: 'masculine · він', nl: 'mannelijk · він' },
  f: { en: 'feminine · вона',  nl: 'vrouwelijk · вона' },
  n: { en: 'neuter · воно',    nl: 'onzijdig · воно' },
};

function ordinalNote(n, gender) {
  const m = ordinal(n, 'm'), f = ordinal(n, 'f'), nn = ordinal(n, 'n');
  const forms = `${m} · ${f} · ${nn}`;
  if (n > 20 && !ORDINAL_BASE[n]) {
    return {
      en: `Only the last word becomes ordinal: ${cardinal(Math.floor(n / 10) * 10)} + ${ordinal(n % 10, gender)}. All genders: ${forms}`,
      nl: `Alleen het laatste woord wordt een rangtelwoord: ${cardinal(Math.floor(n / 10) * 10)} + ${ordinal(n % 10, gender)}. Alle geslachten: ${forms}`,
    };
  }
  return {
    en: `Ordinals are adjectives, so they agree in gender: ${forms}`,
    nl: `Rangtelwoorden zijn bijvoeglijke naamwoorden en volgen het geslacht: ${forms}`,
  };
}

function ordinalItem(n, gender) {
  return {
    key: `ord:${n}:${gender}`, kind: 'ordinal', value: n, gender,
    prompt: String(n), // suffix is added at render time (native-language dependent)
    answers: [ordinal(n, gender)],
    note: ordinalNote(n, gender),
  };
}

// ── Dates ─────────────────────────────────────────────────────────────────────

// Month names in the genitive, which is the only form a date ever needs
// ("п'ятнадцяте вересня" = the fifteenth OF September).
export const MONTHS = [
  { gen: 'січня',     nom: 'січень',   en: 'January',   nl: 'januari' },
  { gen: 'лютого',    nom: 'лютий',    en: 'February',  nl: 'februari' },
  { gen: 'березня',   nom: 'березень', en: 'March',     nl: 'maart' },
  { gen: 'квітня',    nom: 'квітень',  en: 'April',     nl: 'april' },
  { gen: 'травня',    nom: 'травень',  en: 'May',       nl: 'mei' },
  { gen: 'червня',    nom: 'червень',  en: 'June',      nl: 'juni' },
  { gen: 'липня',     nom: 'липень',   en: 'July',      nl: 'juli' },
  { gen: 'серпня',    nom: 'серпень',  en: 'August',    nl: 'augustus' },
  { gen: 'вересня',   nom: 'вересень', en: 'September', nl: 'september' },
  { gen: 'жовтня',    nom: 'жовтень',  en: 'October',   nl: 'oktober' },
  { gen: 'листопада', nom: 'листопад', en: 'November',  nl: 'november' },
  { gen: 'грудня',    nom: 'грудень',  en: 'December',  nl: 'december' },
];

// Genitive of the (neuter) ordinal: перше → першого, третє → третього.
// Only the last word of a compound ordinal changes: двадцять першого.
export function ordinalGenitive(n) {
  const masc = ordinal(n, 'm');
  const words = masc.split(' ');
  const last = words.pop();
  const gen = last.endsWith('ій') ? last.slice(0, -2) + 'ього' : last.slice(0, -2) + 'ого';
  return [...words, gen].join(' ');
}

function dateItem(d, m) {
  const month = MONTHS[m - 1];
  return {
    key: `date:${d}-${m}`, kind: 'date', value: `${d}-${m}`, d, m,
    prompt: `${d}-${m}`,
    // "What's the date?" takes the nominative neuter (число is neuter);
    // "on the …" takes the genitive. Both are accepted.
    answers: [`${ordinal(d, 'n')} ${month.gen}`, `${ordinalGenitive(d)} ${month.gen}`],
    note: {
      en: `Яке сьогодні число? → ${ordinal(d, 'n')} ${month.gen} (neuter, because число is neuter). "On the ${ordinalSuffix(d, "en")}" → ${ordinalGenitive(d)} ${month.gen} (genitive). The month is always genitive: ${month.nom} → ${month.gen}.`,
      nl: `Яке сьогодні число? → ${ordinal(d, 'n')} ${month.gen} (onzijdig, want число is onzijdig). "Op de ${d}e" → ${ordinalGenitive(d)} ${month.gen} (genitief). De maand staat altijd in de genitief: ${month.nom} → ${month.gen}.`,
    },
  };
}

// ── Clock time ────────────────────────────────────────────────────────────────

// Hour as feminine ordinal in three cases:
//   nom  "сьома (година)"          — it is 7 o'clock
//   acc  "на восьму"               — past the hour, towards the eighth
//   loc  "о сьомій"                — at 7
export const HOUR_FORMS = {
  1:  { nom: 'перша',       acc: 'першу',       loc: 'першій' },
  2:  { nom: 'друга',       acc: 'другу',       loc: 'другій' },
  3:  { nom: 'третя',       acc: 'третю',       loc: 'третій' },
  4:  { nom: 'четверта',    acc: 'четверту',    loc: 'четвертій' },
  5:  { nom: "п'ята",       acc: "п'яту",       loc: "п'ятій" },
  6:  { nom: 'шоста',       acc: 'шосту',       loc: 'шостій' },
  7:  { nom: 'сьома',       acc: 'сьому',       loc: 'сьомій' },
  8:  { nom: 'восьма',      acc: 'восьму',      loc: 'восьмій' },
  9:  { nom: "дев'ята",     acc: "дев'яту",     loc: "дев'ятій" },
  10: { nom: 'десята',      acc: 'десяту',      loc: 'десятій' },
  11: { nom: 'одинадцята',  acc: 'одинадцяту',  loc: 'одинадцятій' },
  12: { nom: 'дванадцята',  acc: 'дванадцяту',  loc: 'дванадцятій' },
};

const nextHour = h => (h % 12) + 1;
// "о" becomes "об" before a vowel (об одинадцятій).
const atPrep = h => (h === 11 ? 'об' : 'о');

// The minute word: 1 хвилина · 2–4 хвилини · 5+ хвилин.
function minuteWord(m) {
  const l = m % 10, l2 = m % 100;
  if (l2 >= 11 && l2 <= 19) return 'хвилин';
  if (l === 1) return 'хвилина';
  if (l >= 2 && l <= 4) return 'хвилини';
  return 'хвилин';
}

export const TIME_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

// Build the "what time is it?" (Котра година?) answers for h:mm.
export function timeAnswers(h, m) {
  const H = HOUR_FORMS[h], N = HOUR_FORMS[nextHour(h)];
  const digital = m === 0 ? [`${H.nom} година`, H.nom]
    : [`${H.nom} ${cardinal(m)}`, `${H.nom} година ${cardinal(m)} ${minuteWord(m)}`];
  if (m === 0) return digital;
  if (m === 30) return [`пів на ${N.acc}`, ...digital, `половина на ${N.acc}`];
  if (m === 15) return [`чверть на ${N.acc}`, `п'ятнадцять хвилин на ${N.acc}`, ...digital];
  if (m === 45) return [`за чверть ${N.nom}`, `за п'ятнадцять ${N.nom}`, ...digital];
  if (m < 30)  return [`${cardinal(m)} ${minuteWord(m)} на ${N.acc}`, ...digital];
  const to = 60 - m;
  return [`за ${cardinal(to)} ${N.nom}`, `за ${cardinal(to)} хвилин ${N.nom}`, ...digital];
}

// Build the "at what time?" (О котрій годині?) answers.
export function atTimeAnswers(h, m) {
  const H = HOUR_FORMS[h], N = HOUR_FORMS[nextHour(h)];
  const o = atPrep(h);
  if (m === 0)  return [`${o} ${H.loc}`, `${o} ${H.loc} годині`];
  if (m === 30) return [`о пів на ${N.acc}`, `${o} ${H.loc} тридцять`];
  if (m === 15) return [`о чверть на ${N.acc}`, `${o} ${H.loc} п'ятнадцять`];
  if (m === 45) return [`за чверть ${N.nom}`, `${o} ${H.loc} сорок п'ять`];
  if (m < 30)  return [`о ${cardinal(m)} ${minuteWord(m)} на ${N.acc}`, `${o} ${H.loc} ${cardinal(m)}`];
  const to = 60 - m;
  return [`за ${cardinal(to)} ${N.nom}`, `${o} ${H.loc} ${cardinal(m)}`];
}

// Spoken gloss in the learner's native language, e.g. "half past seven" /
// "half acht". Dutch and Ukrainian both count towards the NEXT hour for
// "half", which is worth seeing side by side.
const EN_NUM = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const NL_NUM = ['', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf', 'twaalf'];
const EN_MIN = { 5: 'five', 10: 'ten', 20: 'twenty', 25: 'twenty-five' };
const NL_MIN = { 5: 'vijf', 10: 'tien' };

export function timeGloss(h, m, native) {
  const n = nextHour(h);
  if (native === 'nl') {
    if (m === 0)  return `${NL_NUM[h]} uur`;
    if (m === 15) return `kwart over ${NL_NUM[h]}`;
    if (m === 30) return `half ${NL_NUM[n]}`;
    if (m === 45) return `kwart voor ${NL_NUM[n]}`;
    if (m < 15)   return `${NL_MIN[m]} over ${NL_NUM[h]}`;
    if (m < 30)   return `${NL_MIN[30 - m]} voor half ${NL_NUM[n]}`;
    if (m < 45)   return `${NL_MIN[m - 30]} over half ${NL_NUM[n]}`;
    return `${NL_MIN[60 - m]} voor ${NL_NUM[n]}`;
  }
  if (m === 0)  return `${EN_NUM[h]} o'clock`;
  if (m === 15) return `quarter past ${EN_NUM[h]}`;
  if (m === 30) return `half past ${EN_NUM[h]}`;
  if (m === 45) return `quarter to ${EN_NUM[n]}`;
  if (m < 30)   return `${EN_MIN[m]} past ${EN_NUM[h]}`;
  return `${EN_MIN[60 - m]} to ${EN_NUM[n]}`;
}

function timeNote(h, m, at) {
  const N = HOUR_FORMS[nextHour(h)], H = HOUR_FORMS[h];
  const nh = nextHour(h);
  if (m === 0) {
    return at
      ? { en: `"at" = о + hour in the locative (-ій): ${atPrep(h)} ${H.loc}. Before a vowel о → об.`,
          nl: `"om" = о + uur in de locatief (-ій): ${atPrep(h)} ${H.loc}. Voor een klinker wordt о → об.` }
      : { en: `Hours are feminine ordinals (година is feminine): ${H.nom} година.`,
          nl: `Uren zijn vrouwelijke rangtelwoorden (година is vrouwelijk): ${H.nom} година.` };
  }
  if (m === 30) {
    return { en: `пів на ${N.acc} = "half (on the way) to the ${nh}th hour" — exactly like Dutch "half ${NL_NUM[nh]}". Digital style also works: ${H.nom} тридцять.`,
             nl: `пів на ${N.acc} = "half op weg naar het ${nh}e uur" — precies als "half ${NL_NUM[nh]}". Digitaal mag ook: ${H.nom} тридцять.` };
  }
  if (m === 15) {
    return { en: `чверть на ${N.acc} = a quarter into the ${nh}th hour. на + accusative (-у).`,
             nl: `чверть на ${N.acc} = een kwart in het ${nh}e uur. на + accusatief (-у).` };
  }
  if (m === 45) {
    return { en: `за чверть ${N.nom} = "a quarter before ${nh}". за + minutes, then the hour in the nominative.`,
             nl: `за чверть ${N.nom} = "kwart voor ${nh}". за + minuten, dan het uur in de nominatief.` };
  }
  if (m < 30) {
    return { en: `${cardinal(m)} ${minuteWord(m)} на ${N.acc}: minutes past go "on to" the next hour (на + -у).`,
             nl: `${cardinal(m)} ${minuteWord(m)} на ${N.acc}: minuten "over" gaan richting het volgende uur (на + -у).` };
  }
  return { en: `за ${cardinal(60 - m)} ${N.nom}: minutes to = за + minutes + hour in the nominative.`,
           nl: `за ${cardinal(60 - m)} ${N.nom}: minuten "voor" = за + minuten + uur in de nominatief.` };
}

function timeItem(h, m, at = false) {
  const hm = `${h}:${String(m).padStart(2, '0')}`;
  return {
    key: `${at ? 'at' : 'time'}:${hm}`, kind: at ? 'attime' : 'time', value: hm, h, m,
    prompt: hm,
    answers: at ? atTimeAnswers(h, m) : timeAnswers(h, m),
    note: timeNote(h, m, at),
  };
}

// ── Categories ────────────────────────────────────────────────────────────────

const range = (a, b, step = 1) => { const r = []; for (let i = a; i <= b; i += step) r.push(i); return r; };
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

export const CATEGORIES = [
  {
    id: 'small', icon: '🔢',
    title: { en: 'Numbers 0–20', nl: 'Getallen 0–20' },
    sub:   { en: 'один, два, три …', nl: 'один, два, три …' },
    items: () => range(0, 20).map(cardinalItem),
  },
  {
    id: 'tens', icon: '🔟',
    title: { en: 'Numbers 21–100', nl: 'Getallen 21–100' },
    sub:   { en: 'двадцять один, сорок …', nl: 'двадцять один, сорок …' },
    // All the tens, plus a fresh random sample of in-between numbers each time.
    items: () => [...range(20, 100, 10), ...range(21, 99).filter(n => n % 10)].map(cardinalItem),
  },
  {
    id: 'big', icon: '💯',
    title: { en: 'Numbers 100–10 000', nl: 'Getallen 100–10.000' },
    sub:   { en: 'сто, двісті, тисяча …', nl: 'сто, двісті, тисяча …' },
    items: () => {
      const fixed = [...range(100, 900, 100), 1000, 2000, 3000, 4000, 5000, 10000];
      const random = new Set();
      while (random.size < 30) random.add(rnd(101, 999));
      while (random.size < 40) random.add(rnd(1001, 9999));
      return [...fixed, ...random].map(cardinalItem);
    },
  },
  {
    id: 'ordinal', icon: '🥇',
    title: { en: 'Ordinals', nl: 'Rangtelwoorden' },
    sub:   { en: 'перший, другий, третій …', nl: 'перший, другий, третій …' },
    items: () => {
      const items = [];
      const base = Object.keys(ORDINAL_BASE).map(Number);
      for (const n of base) {
        items.push(ordinalItem(n, 'm'));
        if (n <= 12) { items.push(ordinalItem(n, 'f')); items.push(ordinalItem(n, 'n')); }
      }
      const compound = new Set();
      while (compound.size < 8) { const n = rnd(21, 99); if (n % 10) compound.add(n); }
      for (const n of compound) items.push(ordinalItem(n, 'm'));
      return items;
    },
  },
  {
    id: 'dates', icon: '📅',
    title: { en: 'Dates', nl: 'Datums' },
    sub:   { en: 'перше січня, п\'ятого травня …', nl: 'перше січня, п\'ятого травня …' },
    items: () => {
      const items = [];
      // Every month with a low day, plus a random spread of other days.
      for (let m = 1; m <= 12; m++) items.push(dateItem(((m * 7) % 28) + 1, m));
      const seen = new Set(items.map(i => i.key));
      while (items.length < 48) {
        const d = rnd(1, 31), m = rnd(1, 12);
        if (d > 28 && m === 2) continue;
        if (d === 31 && [4, 6, 9, 11].includes(m)) continue;
        const it = dateItem(d, m);
        if (!seen.has(it.key)) { seen.add(it.key); items.push(it); }
      }
      return items;
    },
  },
  {
    id: 'time', icon: '🕰️',
    title: { en: 'What time is it?', nl: 'Hoe laat is het?' },
    sub:   { en: 'Котра година? — пів на восьму', nl: 'Котра година? — пів на восьму' },
    items: () => {
      const items = [];
      for (const h of range(1, 12)) for (const m of TIME_MINUTES) items.push(timeItem(h, m));
      return items;
    },
  },
  {
    id: 'attime', icon: '⏰',
    title: { en: 'At what time?', nl: 'Om hoe laat?' },
    sub:   { en: 'О котрій? — о сьомій', nl: 'О котрій? — о сьомій' },
    items: () => {
      const items = [];
      for (const h of range(1, 12)) for (const m of [0, 0, 15, 30, 45]) items.push(timeItem(h, m, true));
      // full hours are the core here, so they appear twice in the pool
      return items;
    },
  },
];

export function getCategory(id) { return CATEGORIES.find(c => c.id === id); }

// ── Reference tables (for the study screens) ──────────────────────────────────

export function referenceRows(catId) {
  switch (catId) {
    case 'small': return range(0, 20).map(n => ({ left: String(n), right: cardinal(n), extra: n === 1 ? 'одна (f) · одне (n)' : n === 2 ? 'дві (f)' : '' }));
    case 'tens':  return [...range(20, 90, 10), 21, 22, 35, 48, 99, 100].map(n => ({ left: String(n), right: cardinal(n) }));
    case 'big':   return [...range(100, 900, 100), 101, 250, 999, 1000, 2000, 5000, 10000, 21000].map(n => ({ left: String(n), right: cardinal(n) }));
    case 'ordinal':
      return Object.keys(ORDINAL_BASE).map(Number).map(n => ({
        left: String(n), right: ordinal(n, 'm'), extra: `${ordinal(n, 'f')} · ${ordinal(n, 'n')}`,
      })).concat([{ left: '21', right: ordinal(21, 'm'), extra: `${ordinal(21, 'f')} · ${ordinal(21, 'n')}` }]);
    case 'dates':
      return MONTHS.map((mo, i) => ({ left: `${i + 1}`, right: `${mo.nom} → ${mo.gen}`, extra: `${(i * 3) % 28 + 1} ${mo.en}: ${ordinal((i * 3) % 28 + 1, 'n')} ${mo.gen}` }));
    case 'time':
      return range(1, 12).map(h => ({ left: `${h}:00`, right: `${HOUR_FORMS[h].nom} година`, extra: `${h}:30 → пів на ${HOUR_FORMS[nextHour(h)].acc}` }));
    case 'attime':
      return range(1, 12).map(h => ({ left: `${h}:00`, right: `${atPrep(h)} ${HOUR_FORMS[h].loc}`, extra: `${h}:30 → о пів на ${HOUR_FORMS[nextHour(h)].acc}` }));
  }
  return [];
}

// Pattern cheat-sheet for the time categories, shown above the table.
export const TIME_PATTERNS = [
  { ex: '7:00', uk: 'сьома година',                 en: 'hour = feminine ordinal',      nl: 'uur = vrouwelijk rangtelwoord' },
  { ex: '7:05', uk: "п'ять хвилин на восьму",       en: 'minutes past → на + next hour', nl: 'minuten over → на + volgend uur' },
  { ex: '7:15', uk: 'чверть на восьму',             en: 'quarter past',                  nl: 'kwart over' },
  { ex: '7:30', uk: 'пів на восьму',                en: 'half past (= half to eight)',   nl: 'half acht' },
  { ex: '7:45', uk: 'за чверть восьма',             en: 'quarter to → за + hour (nom.)', nl: 'kwart voor → за + uur (nom.)' },
  { ex: '7:50', uk: 'за десять восьма',             en: 'minutes to',                    nl: 'minuten voor' },
  { ex: '7:30', uk: 'сьома тридцять',               en: 'digital style, always fine',    nl: 'digitale stijl, altijd goed' },
  { ex: 'at 7', uk: 'о сьомій (об одинадцятій)',    en: 'at = о + locative (-ій)',       nl: 'om = о + locatief (-ій)' },
];
