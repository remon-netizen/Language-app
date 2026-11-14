// ── Typing course: the steps ──────────────────────────────────────────────────
// Getting used to the Ukrainian keyboard, in the order the alphabet unit of the
// course path presents the letters: the ones that look and sound familiar, the
// ones that look familiar and are not, then the new shapes. Each step brings a
// few letters, drills them in syllables, and then has the learner type real
// words that use only letters met so far. The words come from the vocabulary
// deck (typing-ui.js picks them), so nothing here needs spelling by hand except
// the few extras below.
//
// A step:
//   id       kept in progress, so never renumber
//   letters  the new letters of this step, in teaching order ('' for none)
//   title    { en, nl }      sub  { en, nl } one line on what is special about them
//   drills   syllable lines typed before the words (letter patterns, not words)
//   kind     'letters' (default) · 'capitals' · 'sentences'

export const STAGES = [
  { id: 's1', letters: 'аеіокмт',
    title: { en: 'Letters you recognise', nl: 'Letters die je herkent' },
    sub:   { en: 'they look and sound as you expect', nl: 'ze zien eruit en klinken zoals je verwacht' },
    drills: ['ак ок ек ік', 'ма мо ме мі', 'та то те ті'] },
  { id: 's2', letters: 'внрсух',
    title: { en: 'False friends', nl: 'Valse vrienden' },
    sub:   { en: 'they look Latin and sound different', nl: 'ze lijken Latijns en klinken anders' },
    drills: ['ва во ну не', 'ра ро су сі', 'ха хо ху ні'] },
  { id: 's3', letters: 'ийїєюя',
    title: { en: 'The other vowels and й', nl: 'De andere klinkers en й' },
    sub:   { en: 'и as in bit, і as in see; є ю я begin with a y', nl: 'и als in pit, і als in zie; є ю я beginnen met een j' },
    drills: ['ми ти ви ни', 'ай ой ій ей', 'її має моє', 'ня ню ся сю'] },
  { id: 's4', letters: 'бгдзлп',
    title: { en: 'New shapes', nl: 'Nieuwe vormen' },
    sub:   { en: 'six consonants you have to learn by sight', nl: 'zes medeklinkers die je op het oog moet leren' },
    drills: ['ба бо га го', 'да до за зо', 'ла ло па по'] },
  { id: 's5', letters: 'жцчшщфґ',
    title: { en: 'Hushing sounds, ф and ґ', nl: 'Sisklanken, ф en ґ' },
    sub:   { en: 'zh, ts, ch, sh, shch', nl: 'zj, ts, tsj, sj, sjtsj' },
    drills: ['жа жо ца цо', 'ча чо ша шо', 'ща що фа ґа'] },
  { id: 's6', letters: "ь'",
    title: { en: 'Soft sign and apostrophe', nl: 'Zacht teken en apostrof' },
    sub:   { en: 'no sound of their own: one softens, one separates', nl: 'geen eigen klank: de een verzacht, de ander scheidt' },
    drills: ['ть нь ль сь', "п'я б'ю м'я в'є"] },
  { id: 's7', letters: '', kind: 'capitals',
    title: { en: 'Capital letters', nl: 'Hoofdletters' },
    sub:   { en: 'names and places', nl: 'namen en plaatsen' },
    drills: [] },
  { id: 's8', letters: '', kind: 'sentences',
    title: { en: 'Whole sentences', nl: 'Hele zinnen' },
    sub:   { en: 'with full stops, commas and question marks', nl: 'met punten, komma\'s en vraagtekens' },
    drills: [] },
];

// Words the vocabulary deck lacks for the steps that would otherwise run short:
// the first step has only seven letters, and ґ is rare.
export const EXTRA_WORDS = [
  { uk: 'мак',    en: 'poppy',              nl: 'klaproos' },
  { uk: 'том',    en: 'volume (of a book)', nl: 'deel (van een boek)' },
  { uk: 'кома',   en: 'comma',              nl: 'komma' },
  { uk: 'атом',   en: 'atom',               nl: 'atoom' },
  { uk: 'тема',   en: 'topic',              nl: 'onderwerp' },
  { uk: 'макет',  en: 'scale model',        nl: 'maquette' },
  { uk: 'ґудзик', en: 'button',             nl: 'knoop' },
  { uk: 'ґанок',  en: 'porch',              nl: 'veranda' },
];

// Step 7: capitals. Names and places every learner meets early.
export const NAMES = [
  'Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Україна', 'Європа', 'Карпати',
  'Олена', 'Марк', 'Іван', 'Оксана', 'Тарас', 'Андрій', 'Марія', 'Петро', 'Софія', 'Богдан', 'Ірина',
  'Нідерланди', 'Амстердам', 'Варшава',
];

// ── The keyboard ─────────────────────────────────────────────────────────────
// The standard Ukrainian layout: the three letter rows are the same on Windows,
// Linux and macOS ("Ukrainian"; checked against macOS itself). Each key is
// [what it types, what is printed on a Latin keyboard]. ґ and the apostrophe sit
// in different places per system and are explained in words (typing-ui.js).
export const KEY_ROWS = [
  [['й', 'Q'], ['ц', 'W'], ['у', 'E'], ['к', 'R'], ['е', 'T'], ['н', 'Y'], ['г', 'U'], ['ш', 'I'], ['щ', 'O'], ['з', 'P'], ['х', '['], ['ї', ']']],
  [['ф', 'A'], ['і', 'S'], ['в', 'D'], ['а', 'F'], ['п', 'G'], ['р', 'H'], ['о', 'J'], ['л', 'K'], ['д', 'L'], ['ж', ';'], ['є', "'"]],
  [['я', 'Z'], ['ч', 'X'], ['с', 'C'], ['м', 'V'], ['и', 'B'], ['т', 'N'], ['ь', 'M'], ['б', ','], ['ю', '.'], ['.', '/']],
];
