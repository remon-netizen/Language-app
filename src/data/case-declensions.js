// Ukrainian noun declension data for case practice drill
// 60 nouns (30 A1, 20 A2, 10 B1) with all 7 cases in singular and plural

export const CASES = ['nominative','accusative','genitive','dative','instrumental','locative','vocative'];

export const CASE_LABELS = {
  nominative:   { en: 'Nominative — subject (хто? що?)', nl: 'Nominatief — onderwerp (хто? що?)', uk: 'Називний' },
  accusative:   { en: 'Accusative — direct object (кого? що?)', nl: 'Accusatief — lijdend voorwerp (кого? що?)', uk: 'Знахідний' },
  genitive:     { en: 'Genitive — possession/of (кого? чого?)', nl: 'Genitief — bezit/van (кого? чого?)', uk: 'Родовий' },
  dative:       { en: 'Dative — to whom (кому? чому?)', nl: 'Datief — aan wie (кому? чому?)', uk: 'Давальний' },
  instrumental: { en: 'Instrumental — with/by (ким? чим?)', nl: 'Instrumentalis — met/waarmee (ким? чим?)', uk: 'Орудний' },
  locative:     { en: 'Locative — location (на/в чому?)', nl: 'Locatief — locatie (на/в чому?)', uk: 'Місцевий' },
  vocative:     { en: 'Vocative — addressing (hey!)', nl: 'Vocatief — aanspreken (hé!)', uk: 'Кличний' },
};

export const NOUNS = [
  // ═══════════════════════════════════════════
  // A1 MASCULINE (10)
  // ═══════════════════════════════════════════
  {
    nom_s: 'друг',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'friend', nl: 'vriend' },
    singular: {
      nominative: 'друг', accusative: 'друга', genitive: 'друга',
      dative: 'другу', instrumental: 'другом', locative: 'другу', vocative: 'друже',
    },
    plural: {
      nominative: 'друзі', accusative: 'друзів', genitive: 'друзів',
      dative: 'друзям', instrumental: 'друзями', locative: 'друзях', vocative: 'друзі',
    },
  },
  {
    nom_s: 'стіл',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'table', nl: 'tafel' },
    singular: {
      nominative: 'стіл', accusative: 'стіл', genitive: 'стола',
      dative: 'столу', instrumental: 'столом', locative: 'столі', vocative: 'столе',
    },
    plural: {
      nominative: 'столи', accusative: 'столи', genitive: 'столів',
      dative: 'столам', instrumental: 'столами', locative: 'столах', vocative: 'столи',
    },
  },
  {
    nom_s: 'дім',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'house', nl: 'huis' },
    singular: {
      nominative: 'дім', accusative: 'дім', genitive: 'дому',
      dative: 'дому', instrumental: 'домом', locative: 'домі', vocative: 'доме',
    },
    plural: {
      nominative: 'доми', accusative: 'доми', genitive: 'домів',
      dative: 'домам', instrumental: 'домами', locative: 'домах', vocative: 'доми',
    },
  },
  {
    nom_s: 'брат',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'brother', nl: 'broer' },
    singular: {
      nominative: 'брат', accusative: 'брата', genitive: 'брата',
      dative: 'брату', instrumental: 'братом', locative: 'братові', vocative: 'брате',
    },
    plural: {
      nominative: 'брати', accusative: 'братів', genitive: 'братів',
      dative: 'братам', instrumental: 'братами', locative: 'братах', vocative: 'брати',
    },
  },
  {
    nom_s: 'хліб',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'bread', nl: 'brood' },
    singular: {
      nominative: 'хліб', accusative: 'хліб', genitive: 'хліба',
      dative: 'хлібу', instrumental: 'хлібом', locative: 'хлібі', vocative: 'хлібе',
    },
    plural: {
      nominative: 'хліби', accusative: 'хліби', genitive: 'хлібів',
      dative: 'хлібам', instrumental: 'хлібами', locative: 'хлібах', vocative: 'хліби',
    },
  },
  {
    nom_s: 'лист',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'letter', nl: 'brief' },
    singular: {
      nominative: 'лист', accusative: 'лист', genitive: 'листа',
      dative: 'листу', instrumental: 'листом', locative: 'листі', vocative: 'листе',
    },
    plural: {
      nominative: 'листи', accusative: 'листи', genitive: 'листів',
      dative: 'листам', instrumental: 'листами', locative: 'листах', vocative: 'листи',
    },
  },
  {
    nom_s: 'місяць',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'month', nl: 'maand' },
    singular: {
      nominative: 'місяць', accusative: 'місяць', genitive: 'місяця',
      dative: 'місяцю', instrumental: 'місяцем', locative: 'місяці', vocative: 'місяцю',
    },
    plural: {
      nominative: 'місяці', accusative: 'місяці', genitive: 'місяців',
      dative: 'місяцям', instrumental: 'місяцями', locative: 'місяцях', vocative: 'місяці',
    },
  },
  {
    nom_s: 'учитель',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'teacher', nl: 'leraar' },
    singular: {
      nominative: 'учитель', accusative: 'учителя', genitive: 'учителя',
      dative: 'учителю', instrumental: 'учителем', locative: 'учителі', vocative: 'учителю',
    },
    plural: {
      nominative: 'учителі', accusative: 'учителів', genitive: 'учителів',
      dative: 'учителям', instrumental: 'учителями', locative: 'учителях', vocative: 'учителі',
    },
  },
  {
    nom_s: 'телефон',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'phone', nl: 'telefoon' },
    singular: {
      nominative: 'телефон', accusative: 'телефон', genitive: 'телефону',
      dative: 'телефону', instrumental: 'телефоном', locative: 'телефоні', vocative: 'телефоне',
    },
    plural: {
      nominative: 'телефони', accusative: 'телефони', genitive: 'телефонів',
      dative: 'телефонам', instrumental: 'телефонами', locative: 'телефонах', vocative: 'телефони',
    },
  },
  {
    nom_s: 'автобус',
    gender: 'm',
    level: 'A1',
    meaning: { en: 'bus', nl: 'bus' },
    singular: {
      nominative: 'автобус', accusative: 'автобус', genitive: 'автобуса',
      dative: 'автобусу', instrumental: 'автобусом', locative: 'автобусі', vocative: 'автобусе',
    },
    plural: {
      nominative: 'автобуси', accusative: 'автобуси', genitive: 'автобусів',
      dative: 'автобусам', instrumental: 'автобусами', locative: 'автобусах', vocative: 'автобуси',
    },
  },

  // ═══════════════════════════════════════════
  // A1 FEMININE (10)
  // ═══════════════════════════════════════════
  {
    nom_s: 'книга',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'book', nl: 'boek' },
    singular: {
      nominative: 'книга', accusative: 'книгу', genitive: 'книги',
      dative: 'книзі', instrumental: 'книгою', locative: 'книзі', vocative: 'книго',
    },
    plural: {
      nominative: 'книги', accusative: 'книги', genitive: 'книг',
      dative: 'книгам', instrumental: 'книгами', locative: 'книгах', vocative: 'книги',
    },
  },
  {
    nom_s: 'мама',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'mom', nl: 'mama' },
    singular: {
      nominative: 'мама', accusative: 'маму', genitive: 'мами',
      dative: 'мамі', instrumental: 'мамою', locative: 'мамі', vocative: 'мамо',
    },
    plural: {
      nominative: 'мами', accusative: 'мам', genitive: 'мам',
      dative: 'мамам', instrumental: 'мамами', locative: 'мамах', vocative: 'мами',
    },
  },
  {
    nom_s: 'вода',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'water', nl: 'water' },
    singular: {
      nominative: 'вода', accusative: 'воду', genitive: 'води',
      dative: 'воді', instrumental: 'водою', locative: 'воді', vocative: 'водо',
    },
    plural: {
      nominative: 'води', accusative: 'води', genitive: 'вод',
      dative: 'водам', instrumental: 'водами', locative: 'водах', vocative: 'води',
    },
  },
  {
    nom_s: 'школа',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'school', nl: 'school' },
    singular: {
      nominative: 'школа', accusative: 'школу', genitive: 'школи',
      dative: 'школі', instrumental: 'школою', locative: 'школі', vocative: 'школо',
    },
    plural: {
      nominative: 'школи', accusative: 'школи', genitive: 'шкіл',
      dative: 'школам', instrumental: 'школами', locative: 'школах', vocative: 'школи',
    },
  },
  {
    nom_s: 'сестра',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'sister', nl: 'zus' },
    singular: {
      nominative: 'сестра', accusative: 'сестру', genitive: 'сестри',
      dative: 'сестрі', instrumental: 'сестрою', locative: 'сестрі', vocative: 'сестро',
    },
    plural: {
      nominative: 'сестри', accusative: 'сестер', genitive: 'сестер',
      dative: 'сестрам', instrumental: 'сестрами', locative: 'сестрах', vocative: 'сестри',
    },
  },
  {
    nom_s: 'рука',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'hand', nl: 'hand' },
    singular: {
      nominative: 'рука', accusative: 'руку', genitive: 'руки',
      dative: 'руці', instrumental: 'рукою', locative: 'руці', vocative: 'руко',
    },
    plural: {
      nominative: 'руки', accusative: 'руки', genitive: 'рук',
      dative: 'рукам', instrumental: 'руками', locative: 'руках', vocative: 'руки',
    },
  },
  {
    nom_s: 'вулиця',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'street', nl: 'straat' },
    singular: {
      nominative: 'вулиця', accusative: 'вулицю', genitive: 'вулиці',
      dative: 'вулиці', instrumental: 'вулицею', locative: 'вулиці', vocative: 'вулице',
    },
    plural: {
      nominative: 'вулиці', accusative: 'вулиці', genitive: 'вулиць',
      dative: 'вулицям', instrumental: 'вулицями', locative: 'вулицях', vocative: 'вулиці',
    },
  },
  {
    nom_s: 'кухня',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'kitchen', nl: 'keuken' },
    singular: {
      nominative: 'кухня', accusative: 'кухню', genitive: 'кухні',
      dative: 'кухні', instrumental: 'кухнею', locative: 'кухні', vocative: 'кухне',
    },
    plural: {
      nominative: 'кухні', accusative: 'кухні', genitive: 'кухонь',
      dative: 'кухням', instrumental: 'кухнями', locative: 'кухнях', vocative: 'кухні',
    },
  },
  {
    nom_s: 'ніч',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'night', nl: 'nacht' },
    singular: {
      nominative: 'ніч', accusative: 'ніч', genitive: 'ночі',
      dative: 'ночі', instrumental: 'ніччю', locative: 'ночі', vocative: 'ноче',
    },
    plural: {
      nominative: 'ночі', accusative: 'ночі', genitive: 'ночей',
      dative: 'ночам', instrumental: 'ночами', locative: 'ночах', vocative: 'ночі',
    },
  },
  {
    nom_s: 'любов',
    gender: 'f',
    level: 'A1',
    meaning: { en: 'love', nl: 'liefde' },
    singular: {
      nominative: 'любов', accusative: 'любов', genitive: 'любові',
      dative: 'любові', instrumental: 'любов\'ю', locative: 'любові', vocative: 'любове',
    },
    plural: {
      nominative: 'любові', accusative: 'любові', genitive: 'любовей',
      dative: 'любовям', instrumental: 'любовями', locative: 'любовях', vocative: 'любові',
    },
  },

  // ═══════════════════════════════════════════
  // A1 NEUTER (10)
  // ═══════════════════════════════════════════
  {
    nom_s: 'місто',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'city', nl: 'stad' },
    singular: {
      nominative: 'місто', accusative: 'місто', genitive: 'міста',
      dative: 'місту', instrumental: 'містом', locative: 'місті', vocative: 'місто',
    },
    plural: {
      nominative: 'міста', accusative: 'міста', genitive: 'міст',
      dative: 'містам', instrumental: 'містами', locative: 'містах', vocative: 'міста',
    },
  },
  {
    nom_s: 'вікно',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'window', nl: 'raam' },
    singular: {
      nominative: 'вікно', accusative: 'вікно', genitive: 'вікна',
      dative: 'вікну', instrumental: 'вікном', locative: 'вікні', vocative: 'вікно',
    },
    plural: {
      nominative: 'вікна', accusative: 'вікна', genitive: 'вікон',
      dative: 'вікнам', instrumental: 'вікнами', locative: 'вікнах', vocative: 'вікна',
    },
  },
  {
    nom_s: 'молоко',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'milk', nl: 'melk' },
    singular: {
      nominative: 'молоко', accusative: 'молоко', genitive: 'молока',
      dative: 'молоку', instrumental: 'молоком', locative: 'молоці', vocative: 'молоко',
    },
    plural: {
      nominative: 'молока', accusative: 'молока', genitive: 'молок',
      dative: 'молокам', instrumental: 'молоками', locative: 'молоках', vocative: 'молока',
    },
  },
  {
    nom_s: 'море',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'sea', nl: 'zee' },
    singular: {
      nominative: 'море', accusative: 'море', genitive: 'моря',
      dative: 'морю', instrumental: 'морем', locative: 'морі', vocative: 'море',
    },
    plural: {
      nominative: 'моря', accusative: 'моря', genitive: 'морів',
      dative: 'морям', instrumental: 'морями', locative: 'морях', vocative: 'моря',
    },
  },
  {
    nom_s: 'ім\'я',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'name', nl: 'naam' },
    singular: {
      nominative: 'ім\'я', accusative: 'ім\'я', genitive: 'імені',
      dative: 'імені', instrumental: 'іменем', locative: 'імені', vocative: 'ім\'я',
    },
    plural: {
      nominative: 'імена', accusative: 'імена', genitive: 'імен',
      dative: 'іменам', instrumental: 'іменами', locative: 'іменах', vocative: 'імена',
    },
  },
  {
    nom_s: 'серце',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'heart', nl: 'hart' },
    singular: {
      nominative: 'серце', accusative: 'серце', genitive: 'серця',
      dative: 'серцю', instrumental: 'серцем', locative: 'серці', vocative: 'серце',
    },
    plural: {
      nominative: 'серця', accusative: 'серця', genitive: 'сердець',
      dative: 'серцям', instrumental: 'серцями', locative: 'серцях', vocative: 'серця',
    },
  },
  {
    nom_s: 'яблуко',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'apple', nl: 'appel' },
    singular: {
      nominative: 'яблуко', accusative: 'яблуко', genitive: 'яблука',
      dative: 'яблуку', instrumental: 'яблуком', locative: 'яблуці', vocative: 'яблуко',
    },
    plural: {
      nominative: 'яблука', accusative: 'яблука', genitive: 'яблук',
      dative: 'яблукам', instrumental: 'яблуками', locative: 'яблуках', vocative: 'яблука',
    },
  },
  {
    nom_s: 'слово',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'word', nl: 'woord' },
    singular: {
      nominative: 'слово', accusative: 'слово', genitive: 'слова',
      dative: 'слову', instrumental: 'словом', locative: 'слові', vocative: 'слово',
    },
    plural: {
      nominative: 'слова', accusative: 'слова', genitive: 'слів',
      dative: 'словам', instrumental: 'словами', locative: 'словах', vocative: 'слова',
    },
  },
  {
    nom_s: 'питання',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'question', nl: 'vraag' },
    singular: {
      nominative: 'питання', accusative: 'питання', genitive: 'питання',
      dative: 'питанню', instrumental: 'питанням', locative: 'питанні', vocative: 'питання',
    },
    plural: {
      nominative: 'питання', accusative: 'питання', genitive: 'питань',
      dative: 'питанням', instrumental: 'питаннями', locative: 'питаннях', vocative: 'питання',
    },
  },
  {
    nom_s: 'завдання',
    gender: 'n',
    level: 'A1',
    meaning: { en: 'task', nl: 'opdracht' },
    singular: {
      nominative: 'завдання', accusative: 'завдання', genitive: 'завдання',
      dative: 'завданню', instrumental: 'завданням', locative: 'завданні', vocative: 'завдання',
    },
    plural: {
      nominative: 'завдання', accusative: 'завдання', genitive: 'завдань',
      dative: 'завданням', instrumental: 'завданнями', locative: 'завданнях', vocative: 'завдання',
    },
  },

  // ═══════════════════════════════════════════
  // A2 MASCULINE (7)
  // ═══════════════════════════════════════════
  {
    nom_s: 'лікар',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'doctor', nl: 'dokter' },
    singular: {
      nominative: 'лікар', accusative: 'лікаря', genitive: 'лікаря',
      dative: 'лікарю', instrumental: 'лікарем', locative: 'лікарі', vocative: 'лікарю',
    },
    plural: {
      nominative: 'лікарі', accusative: 'лікарів', genitive: 'лікарів',
      dative: 'лікарям', instrumental: 'лікарями', locative: 'лікарях', vocative: 'лікарі',
    },
  },
  {
    nom_s: 'сусід',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'neighbor', nl: 'buurman' },
    singular: {
      nominative: 'сусід', accusative: 'сусіда', genitive: 'сусіда',
      dative: 'сусіду', instrumental: 'сусідом', locative: 'сусідові', vocative: 'сусіде',
    },
    plural: {
      nominative: 'сусіди', accusative: 'сусідів', genitive: 'сусідів',
      dative: 'сусідам', instrumental: 'сусідами', locative: 'сусідах', vocative: 'сусіди',
    },
  },
  {
    nom_s: 'ключ',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'key', nl: 'sleutel' },
    singular: {
      nominative: 'ключ', accusative: 'ключ', genitive: 'ключа',
      dative: 'ключу', instrumental: 'ключем', locative: 'ключі', vocative: 'ключу',
    },
    plural: {
      nominative: 'ключі', accusative: 'ключі', genitive: 'ключів',
      dative: 'ключам', instrumental: 'ключами', locative: 'ключах', vocative: 'ключі',
    },
  },
  {
    nom_s: 'подарунок',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'gift', nl: 'cadeau' },
    singular: {
      nominative: 'подарунок', accusative: 'подарунок', genitive: 'подарунка',
      dative: 'подарунку', instrumental: 'подарунком', locative: 'подарунку', vocative: 'подарунку',
    },
    plural: {
      nominative: 'подарунки', accusative: 'подарунки', genitive: 'подарунків',
      dative: 'подарункам', instrumental: 'подарунками', locative: 'подарунках', vocative: 'подарунки',
    },
  },
  {
    nom_s: 'комп\'ютер',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'computer', nl: 'computer' },
    singular: {
      nominative: 'комп\'ютер', accusative: 'комп\'ютер', genitive: 'комп\'ютера',
      dative: 'комп\'ютеру', instrumental: 'комп\'ютером', locative: 'комп\'ютері', vocative: 'комп\'ютере',
    },
    plural: {
      nominative: 'комп\'ютери', accusative: 'комп\'ютери', genitive: 'комп\'ютерів',
      dative: 'комп\'ютерам', instrumental: 'комп\'ютерами', locative: 'комп\'ютерах', vocative: 'комп\'ютери',
    },
  },
  {
    nom_s: 'магазин',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'store', nl: 'winkel' },
    singular: {
      nominative: 'магазин', accusative: 'магазин', genitive: 'магазину',
      dative: 'магазину', instrumental: 'магазином', locative: 'магазині', vocative: 'магазине',
    },
    plural: {
      nominative: 'магазини', accusative: 'магазини', genitive: 'магазинів',
      dative: 'магазинам', instrumental: 'магазинами', locative: 'магазинах', vocative: 'магазини',
    },
  },
  {
    nom_s: 'вечір',
    gender: 'm',
    level: 'A2',
    meaning: { en: 'evening', nl: 'avond' },
    singular: {
      nominative: 'вечір', accusative: 'вечір', genitive: 'вечора',
      dative: 'вечору', instrumental: 'вечором', locative: 'вечорі', vocative: 'вечоре',
    },
    plural: {
      nominative: 'вечори', accusative: 'вечори', genitive: 'вечорів',
      dative: 'вечорам', instrumental: 'вечорами', locative: 'вечорах', vocative: 'вечори',
    },
  },

  // ═══════════════════════════════════════════
  // A2 FEMININE (7)
  // ═══════════════════════════════════════════
  {
    nom_s: 'подруга',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'female friend', nl: 'vriendin' },
    singular: {
      nominative: 'подруга', accusative: 'подругу', genitive: 'подруги',
      dative: 'подрузі', instrumental: 'подругою', locative: 'подрузі', vocative: 'подруго',
    },
    plural: {
      nominative: 'подруги', accusative: 'подруг', genitive: 'подруг',
      dative: 'подругам', instrumental: 'подругами', locative: 'подругах', vocative: 'подруги',
    },
  },
  {
    nom_s: 'робота',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'work', nl: 'werk' },
    singular: {
      nominative: 'робота', accusative: 'роботу', genitive: 'роботи',
      dative: 'роботі', instrumental: 'роботою', locative: 'роботі', vocative: 'робото',
    },
    plural: {
      nominative: 'роботи', accusative: 'роботи', genitive: 'робіт',
      dative: 'роботам', instrumental: 'роботами', locative: 'роботах', vocative: 'роботи',
    },
  },
  {
    nom_s: 'кімната',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'room', nl: 'kamer' },
    singular: {
      nominative: 'кімната', accusative: 'кімнату', genitive: 'кімнати',
      dative: 'кімнаті', instrumental: 'кімнатою', locative: 'кімнаті', vocative: 'кімнато',
    },
    plural: {
      nominative: 'кімнати', accusative: 'кімнати', genitive: 'кімнат',
      dative: 'кімнатам', instrumental: 'кімнатами', locative: 'кімнатах', vocative: 'кімнати',
    },
  },
  {
    nom_s: 'проблема',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'problem', nl: 'probleem' },
    singular: {
      nominative: 'проблема', accusative: 'проблему', genitive: 'проблеми',
      dative: 'проблемі', instrumental: 'проблемою', locative: 'проблемі', vocative: 'проблемо',
    },
    plural: {
      nominative: 'проблеми', accusative: 'проблеми', genitive: 'проблем',
      dative: 'проблемам', instrumental: 'проблемами', locative: 'проблемах', vocative: 'проблеми',
    },
  },
  {
    nom_s: 'квартира',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'apartment', nl: 'appartement' },
    singular: {
      nominative: 'квартира', accusative: 'квартиру', genitive: 'квартири',
      dative: 'квартирі', instrumental: 'квартирою', locative: 'квартирі', vocative: 'квартиро',
    },
    plural: {
      nominative: 'квартири', accusative: 'квартири', genitive: 'квартир',
      dative: 'квартирам', instrumental: 'квартирами', locative: 'квартирах', vocative: 'квартири',
    },
  },
  {
    nom_s: 'тарілка',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'plate', nl: 'bord' },
    singular: {
      nominative: 'тарілка', accusative: 'тарілку', genitive: 'тарілки',
      dative: 'тарілці', instrumental: 'тарілкою', locative: 'тарілці', vocative: 'тарілко',
    },
    plural: {
      nominative: 'тарілки', accusative: 'тарілки', genitive: 'тарілок',
      dative: 'тарілкам', instrumental: 'тарілками', locative: 'тарілках', vocative: 'тарілки',
    },
  },
  {
    nom_s: 'відповідь',
    gender: 'f',
    level: 'A2',
    meaning: { en: 'answer', nl: 'antwoord' },
    singular: {
      nominative: 'відповідь', accusative: 'відповідь', genitive: 'відповіді',
      dative: 'відповіді', instrumental: 'відповіддю', locative: 'відповіді', vocative: 'відповіді',
    },
    plural: {
      nominative: 'відповіді', accusative: 'відповіді', genitive: 'відповідей',
      dative: 'відповідям', instrumental: 'відповідями', locative: 'відповідях', vocative: 'відповіді',
    },
  },

  // ═══════════════════════════════════════════
  // A2 NEUTER (6)
  // ═══════════════════════════════════════════
  {
    nom_s: 'озеро',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'lake', nl: 'meer' },
    singular: {
      nominative: 'озеро', accusative: 'озеро', genitive: 'озера',
      dative: 'озеру', instrumental: 'озером', locative: 'озері', vocative: 'озеро',
    },
    plural: {
      nominative: 'озера', accusative: 'озера', genitive: 'озер',
      dative: 'озерам', instrumental: 'озерами', locative: 'озерах', vocative: 'озера',
    },
  },
  {
    nom_s: 'дерево',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'tree', nl: 'boom' },
    singular: {
      nominative: 'дерево', accusative: 'дерево', genitive: 'дерева',
      dative: 'дереву', instrumental: 'деревом', locative: 'дереві', vocative: 'дерево',
    },
    plural: {
      nominative: 'дерева', accusative: 'дерева', genitive: 'дерев',
      dative: 'деревам', instrumental: 'деревами', locative: 'деревах', vocative: 'дерева',
    },
  },
  {
    nom_s: 'повідомлення',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'message', nl: 'bericht' },
    singular: {
      nominative: 'повідомлення', accusative: 'повідомлення', genitive: 'повідомлення',
      dative: 'повідомленню', instrumental: 'повідомленням', locative: 'повідомленні', vocative: 'повідомлення',
    },
    plural: {
      nominative: 'повідомлення', accusative: 'повідомлення', genitive: 'повідомлень',
      dative: 'повідомленням', instrumental: 'повідомленнями', locative: 'повідомленнях', vocative: 'повідомлення',
    },
  },
  {
    nom_s: 'життя',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'life', nl: 'leven' },
    singular: {
      nominative: 'життя', accusative: 'життя', genitive: 'життя',
      dative: 'життю', instrumental: 'життям', locative: 'житті', vocative: 'життя',
    },
    plural: {
      nominative: 'життя', accusative: 'життя', genitive: 'життів',
      dative: 'життям', instrumental: 'життями', locative: 'життях', vocative: 'життя',
    },
  },
  {
    nom_s: 'обличчя',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'face', nl: 'gezicht' },
    singular: {
      nominative: 'обличчя', accusative: 'обличчя', genitive: 'обличчя',
      dative: 'обличчю', instrumental: 'обличчям', locative: 'обличчі', vocative: 'обличчя',
    },
    plural: {
      nominative: 'обличчя', accusative: 'обличчя', genitive: 'облич',
      dative: 'обличчям', instrumental: 'обличчями', locative: 'обличчях', vocative: 'обличчя',
    },
  },
  {
    nom_s: 'прізвище',
    gender: 'n',
    level: 'A2',
    meaning: { en: 'surname', nl: 'achternaam' },
    singular: {
      nominative: 'прізвище', accusative: 'прізвище', genitive: 'прізвища',
      dative: 'прізвищу', instrumental: 'прізвищем', locative: 'прізвищі', vocative: 'прізвище',
    },
    plural: {
      nominative: 'прізвища', accusative: 'прізвища', genitive: 'прізвищ',
      dative: 'прізвищам', instrumental: 'прізвищами', locative: 'прізвищах', vocative: 'прізвища',
    },
  },

  // ═══════════════════════════════════════════
  // B1 MASCULINE (3)
  // ═══════════════════════════════════════════
  {
    nom_s: 'письменник',
    gender: 'm',
    level: 'B1',
    meaning: { en: 'writer', nl: 'schrijver' },
    singular: {
      nominative: 'письменник', accusative: 'письменника', genitive: 'письменника',
      dative: 'письменнику', instrumental: 'письменником', locative: 'письменникові', vocative: 'письменнику',
    },
    plural: {
      nominative: 'письменники', accusative: 'письменників', genitive: 'письменників',
      dative: 'письменникам', instrumental: 'письменниками', locative: 'письменниках', vocative: 'письменники',
    },
  },
  {
    nom_s: 'уряд',
    gender: 'm',
    level: 'B1',
    meaning: { en: 'government', nl: 'regering' },
    singular: {
      nominative: 'уряд', accusative: 'уряд', genitive: 'уряду',
      dative: 'уряду', instrumental: 'урядом', locative: 'уряді', vocative: 'уряде',
    },
    plural: {
      nominative: 'уряди', accusative: 'уряди', genitive: 'урядів',
      dative: 'урядам', instrumental: 'урядами', locative: 'урядах', vocative: 'уряди',
    },
  },
  {
    nom_s: 'розвиток',
    gender: 'm',
    level: 'B1',
    meaning: { en: 'development', nl: 'ontwikkeling' },
    singular: {
      nominative: 'розвиток', accusative: 'розвиток', genitive: 'розвитку',
      dative: 'розвитку', instrumental: 'розвитком', locative: 'розвитку', vocative: 'розвитку',
    },
    plural: {
      nominative: 'розвитки', accusative: 'розвитки', genitive: 'розвитків',
      dative: 'розвиткам', instrumental: 'розвитками', locative: 'розвитках', vocative: 'розвитки',
    },
  },

  // ═══════════════════════════════════════════
  // B1 FEMININE (4)
  // ═══════════════════════════════════════════
  {
    nom_s: 'можливість',
    gender: 'f',
    level: 'B1',
    meaning: { en: 'opportunity', nl: 'mogelijkheid' },
    singular: {
      nominative: 'можливість', accusative: 'можливість', genitive: 'можливості',
      dative: 'можливості', instrumental: 'можливістю', locative: 'можливості', vocative: 'можливосте',
    },
    plural: {
      nominative: 'можливості', accusative: 'можливості', genitive: 'можливостей',
      dative: 'можливостям', instrumental: 'можливостями', locative: 'можливостях', vocative: 'можливості',
    },
  },
  {
    nom_s: 'безпека',
    gender: 'f',
    level: 'B1',
    meaning: { en: 'safety', nl: 'veiligheid' },
    singular: {
      nominative: 'безпека', accusative: 'безпеку', genitive: 'безпеки',
      dative: 'безпеці', instrumental: 'безпекою', locative: 'безпеці', vocative: 'безпеко',
    },
    plural: {
      nominative: 'безпеки', accusative: 'безпеки', genitive: 'безпек',
      dative: 'безпекам', instrumental: 'безпеками', locative: 'безпеках', vocative: 'безпеки',
    },
  },
  {
    nom_s: 'подорож',
    gender: 'f',
    level: 'B1',
    meaning: { en: 'journey', nl: 'reis' },
    singular: {
      nominative: 'подорож', accusative: 'подорож', genitive: 'подорожі',
      dative: 'подорожі', instrumental: 'подорожжю', locative: 'подорожі', vocative: 'подороже',
    },
    plural: {
      nominative: 'подорожі', accusative: 'подорожі', genitive: 'подорожей',
      dative: 'подорожам', instrumental: 'подорожами', locative: 'подорожах', vocative: 'подорожі',
    },
  },
  {
    nom_s: 'перевага',
    gender: 'f',
    level: 'B1',
    meaning: { en: 'advantage', nl: 'voordeel' },
    singular: {
      nominative: 'перевага', accusative: 'перевагу', genitive: 'переваги',
      dative: 'перевазі', instrumental: 'перевагою', locative: 'перевазі', vocative: 'переваго',
    },
    plural: {
      nominative: 'переваги', accusative: 'переваги', genitive: 'переваг',
      dative: 'перевагам', instrumental: 'перевагами', locative: 'перевагах', vocative: 'переваги',
    },
  },

  // ═══════════════════════════════════════════
  // B1 NEUTER (3)
  // ═══════════════════════════════════════════
  {
    nom_s: 'середовище',
    gender: 'n',
    level: 'B1',
    meaning: { en: 'environment', nl: 'omgeving' },
    singular: {
      nominative: 'середовище', accusative: 'середовище', genitive: 'середовища',
      dative: 'середовищу', instrumental: 'середовищем', locative: 'середовищі', vocative: 'середовище',
    },
    plural: {
      nominative: 'середовища', accusative: 'середовища', genitive: 'середовищ',
      dative: 'середовищам', instrumental: 'середовищами', locative: 'середовищах', vocative: 'середовища',
    },
  },
  {
    nom_s: 'суспільство',
    gender: 'n',
    level: 'B1',
    meaning: { en: 'society', nl: 'maatschappij' },
    singular: {
      nominative: 'суспільство', accusative: 'суспільство', genitive: 'суспільства',
      dative: 'суспільству', instrumental: 'суспільством', locative: 'суспільстві', vocative: 'суспільство',
    },
    plural: {
      nominative: 'суспільства', accusative: 'суспільства', genitive: 'суспільств',
      dative: 'суспільствам', instrumental: 'суспільствами', locative: 'суспільствах', vocative: 'суспільства',
    },
  },
  {
    nom_s: 'здоров\'я',
    gender: 'n',
    level: 'B1',
    meaning: { en: 'health', nl: 'gezondheid' },
    singular: {
      nominative: 'здоров\'я', accusative: 'здоров\'я', genitive: 'здоров\'я',
      dative: 'здоров\'ю', instrumental: 'здоров\'ям', locative: 'здоров\'ї', vocative: 'здоров\'я',
    },
    plural: {
      nominative: 'здоров\'я', accusative: 'здоров\'я', genitive: 'здоров\'їв',
      dative: 'здоров\'ям', instrumental: 'здоров\'ями', locative: 'здоров\'ях', vocative: 'здоров\'я',
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// ADJECTIVE-NOUN PAIRS (20)
// ═══════════════════════════════════════════════════════════════

export const ADJECTIVE_NOUNS = [
  // 1. новий + книга (f)
  {
    adjective: 'новий',
    noun: 'книга',
    level: 'A1',
    meaning: { en: 'new book', nl: 'nieuw boek' },
    forms: {
      nominative:    { s: 'нова книга',     p: 'нові книги' },
      accusative:    { s: 'нову книгу',     p: 'нові книги' },
      genitive:      { s: 'нової книги',    p: 'нових книг' },
      dative:        { s: 'новій книзі',    p: 'новим книгам' },
      instrumental:  { s: 'новою книгою',   p: 'новими книгами' },
      locative:      { s: 'новій книзі',    p: 'нових книгах' },
      vocative:      { s: 'нова книго',     p: 'нові книги' },
    },
  },
  // 2. старий + дім (m)
  {
    adjective: 'старий',
    noun: 'дім',
    level: 'A1',
    meaning: { en: 'old house', nl: 'oud huis' },
    forms: {
      nominative:    { s: 'старий дім',       p: 'старі доми' },
      accusative:    { s: 'старий дім',       p: 'старі доми' },
      genitive:      { s: 'старого дому',     p: 'старих домів' },
      dative:        { s: 'старому дому',     p: 'старим домам' },
      instrumental:  { s: 'старим домом',     p: 'старими домами' },
      locative:      { s: 'старому домі',     p: 'старих домах' },
      vocative:      { s: 'старий доме',      p: 'старі доми' },
    },
  },
  // 3. великий + місто (n)
  {
    adjective: 'великий',
    noun: 'місто',
    level: 'A1',
    meaning: { en: 'big city', nl: 'grote stad' },
    forms: {
      nominative:    { s: 'велике місто',      p: 'великі міста' },
      accusative:    { s: 'велике місто',      p: 'великі міста' },
      genitive:      { s: 'великого міста',    p: 'великих міст' },
      dative:        { s: 'великому місту',    p: 'великим містам' },
      instrumental:  { s: 'великим містом',    p: 'великими містами' },
      locative:      { s: 'великому місті',    p: 'великих містах' },
      vocative:      { s: 'велике місто',      p: 'великі міста' },
    },
  },
  // 4. маленький + кімната (f)
  {
    adjective: 'маленький',
    noun: 'кімната',
    level: 'A2',
    meaning: { en: 'small room', nl: 'kleine kamer' },
    forms: {
      nominative:    { s: 'маленька кімната',     p: 'маленькі кімнати' },
      accusative:    { s: 'маленьку кімнату',     p: 'маленькі кімнати' },
      genitive:      { s: 'маленької кімнати',    p: 'маленьких кімнат' },
      dative:        { s: 'маленькій кімнаті',    p: 'маленьким кімнатам' },
      instrumental:  { s: 'маленькою кімнатою',   p: 'маленькими кімнатами' },
      locative:      { s: 'маленькій кімнаті',    p: 'маленьких кімнатах' },
      vocative:      { s: 'маленька кімнато',     p: 'маленькі кімнати' },
    },
  },
  // 5. гарний + вулиця (f)
  {
    adjective: 'гарний',
    noun: 'вулиця',
    level: 'A1',
    meaning: { en: 'beautiful street', nl: 'mooie straat' },
    forms: {
      nominative:    { s: 'гарна вулиця',      p: 'гарні вулиці' },
      accusative:    { s: 'гарну вулицю',      p: 'гарні вулиці' },
      genitive:      { s: 'гарної вулиці',     p: 'гарних вулиць' },
      dative:        { s: 'гарній вулиці',     p: 'гарним вулицям' },
      instrumental:  { s: 'гарною вулицею',    p: 'гарними вулицями' },
      locative:      { s: 'гарній вулиці',     p: 'гарних вулицях' },
      vocative:      { s: 'гарна вулице',      p: 'гарні вулиці' },
    },
  },
  // 6. добрий + друг (m, animate)
  {
    adjective: 'добрий',
    noun: 'друг',
    level: 'A1',
    meaning: { en: 'good friend', nl: 'goede vriend' },
    forms: {
      nominative:    { s: 'добрий друг',       p: 'добрі друзі' },
      accusative:    { s: 'доброго друга',     p: 'добрих друзів' },
      genitive:      { s: 'доброго друга',     p: 'добрих друзів' },
      dative:        { s: 'доброму другу',     p: 'добрим друзям' },
      instrumental:  { s: 'добрим другом',     p: 'добрими друзями' },
      locative:      { s: 'доброму другу',     p: 'добрих друзях' },
      vocative:      { s: 'добрий друже',      p: 'добрі друзі' },
    },
  },
  // 7. молодий + сестра (f, animate)
  {
    adjective: 'молодий',
    noun: 'сестра',
    level: 'A1',
    meaning: { en: 'young sister', nl: 'jonge zus' },
    forms: {
      nominative:    { s: 'молода сестра',      p: 'молоді сестри' },
      accusative:    { s: 'молоду сестру',      p: 'молодих сестер' },
      genitive:      { s: 'молодої сестри',     p: 'молодих сестер' },
      dative:        { s: 'молодій сестрі',     p: 'молодим сестрам' },
      instrumental:  { s: 'молодою сестрою',    p: 'молодими сестрами' },
      locative:      { s: 'молодій сестрі',     p: 'молодих сестрах' },
      vocative:      { s: 'молода сестро',      p: 'молоді сестри' },
    },
  },
  // 8. синій + море (n)
  {
    adjective: 'синій',
    noun: 'море',
    level: 'A1',
    meaning: { en: 'blue sea', nl: 'blauwe zee' },
    forms: {
      nominative:    { s: 'синє море',        p: 'сині моря' },
      accusative:    { s: 'синє море',        p: 'сині моря' },
      genitive:      { s: 'синього моря',     p: 'синіх морів' },
      dative:        { s: 'синьому морю',     p: 'синім морям' },
      instrumental:  { s: 'синім морем',      p: 'синіми морями' },
      locative:      { s: 'синьому морі',     p: 'синіх морях' },
      vocative:      { s: 'синє море',        p: 'сині моря' },
    },
  },
  // 9. перший + питання (n)
  {
    adjective: 'перший',
    noun: 'питання',
    level: 'A1',
    meaning: { en: 'first question', nl: 'eerste vraag' },
    forms: {
      nominative:    { s: 'перше питання',       p: 'перші питання' },
      accusative:    { s: 'перше питання',       p: 'перші питання' },
      genitive:      { s: 'першого питання',     p: 'перших питань' },
      dative:        { s: 'першому питанню',     p: 'першим питанням' },
      instrumental:  { s: 'першим питанням',     p: 'першими питаннями' },
      locative:      { s: 'першому питанні',     p: 'перших питаннях' },
      vocative:      { s: 'перше питання',       p: 'перші питання' },
    },
  },
  // 10. останній + автобус (m)
  {
    adjective: 'останній',
    noun: 'автобус',
    level: 'A1',
    meaning: { en: 'last bus', nl: 'laatste bus' },
    forms: {
      nominative:    { s: 'останній автобус',      p: 'останні автобуси' },
      accusative:    { s: 'останній автобус',      p: 'останні автобуси' },
      genitive:      { s: 'останнього автобуса',   p: 'останніх автобусів' },
      dative:        { s: 'останньому автобусу',   p: 'останнім автобусам' },
      instrumental:  { s: 'останнім автобусом',    p: 'останніми автобусами' },
      locative:      { s: 'останньому автобусі',   p: 'останніх автобусах' },
      vocative:      { s: 'останній автобусе',     p: 'останні автобуси' },
    },
  },
  // 11. новий + телефон (m)
  {
    adjective: 'новий',
    noun: 'телефон',
    level: 'A1',
    meaning: { en: 'new phone', nl: 'nieuwe telefoon' },
    forms: {
      nominative:    { s: 'новий телефон',       p: 'нові телефони' },
      accusative:    { s: 'новий телефон',       p: 'нові телефони' },
      genitive:      { s: 'нового телефону',     p: 'нових телефонів' },
      dative:        { s: 'новому телефону',     p: 'новим телефонам' },
      instrumental:  { s: 'новим телефоном',     p: 'новими телефонами' },
      locative:      { s: 'новому телефоні',     p: 'нових телефонах' },
      vocative:      { s: 'новий телефоне',      p: 'нові телефони' },
    },
  },
  // 12. старий + школа (f)
  {
    adjective: 'старий',
    noun: 'школа',
    level: 'A1',
    meaning: { en: 'old school', nl: 'oude school' },
    forms: {
      nominative:    { s: 'стара школа',       p: 'старі школи' },
      accusative:    { s: 'стару школу',       p: 'старі школи' },
      genitive:      { s: 'старої школи',      p: 'старих шкіл' },
      dative:        { s: 'старій школі',      p: 'старим школам' },
      instrumental:  { s: 'старою школою',     p: 'старими школами' },
      locative:      { s: 'старій школі',      p: 'старих школах' },
      vocative:      { s: 'стара школо',       p: 'старі школи' },
    },
  },
  // 13. великий + вікно (n)
  {
    adjective: 'великий',
    noun: 'вікно',
    level: 'A1',
    meaning: { en: 'big window', nl: 'groot raam' },
    forms: {
      nominative:    { s: 'велике вікно',       p: 'великі вікна' },
      accusative:    { s: 'велике вікно',       p: 'великі вікна' },
      genitive:      { s: 'великого вікна',     p: 'великих вікон' },
      dative:        { s: 'великому вікну',     p: 'великим вікнам' },
      instrumental:  { s: 'великим вікном',     p: 'великими вікнами' },
      locative:      { s: 'великому вікні',     p: 'великих вікнах' },
      vocative:      { s: 'велике вікно',       p: 'великі вікна' },
    },
  },
  // 14. маленький + стіл (m)
  {
    adjective: 'маленький',
    noun: 'стіл',
    level: 'A1',
    meaning: { en: 'small table', nl: 'kleine tafel' },
    forms: {
      nominative:    { s: 'маленький стіл',       p: 'маленькі столи' },
      accusative:    { s: 'маленький стіл',       p: 'маленькі столи' },
      genitive:      { s: 'маленького стола',     p: 'маленьких столів' },
      dative:        { s: 'маленькому столу',     p: 'маленьким столам' },
      instrumental:  { s: 'маленьким столом',     p: 'маленькими столами' },
      locative:      { s: 'маленькому столі',     p: 'маленьких столах' },
      vocative:      { s: 'маленький столе',      p: 'маленькі столи' },
    },
  },
  // 15. гарний + подарунок (m)
  {
    adjective: 'гарний',
    noun: 'подарунок',
    level: 'A2',
    meaning: { en: 'nice gift', nl: 'mooi cadeau' },
    forms: {
      nominative:    { s: 'гарний подарунок',       p: 'гарні подарунки' },
      accusative:    { s: 'гарний подарунок',       p: 'гарні подарунки' },
      genitive:      { s: 'гарного подарунка',      p: 'гарних подарунків' },
      dative:        { s: 'гарному подарунку',      p: 'гарним подарункам' },
      instrumental:  { s: 'гарним подарунком',      p: 'гарними подарунками' },
      locative:      { s: 'гарному подарунку',      p: 'гарних подарунках' },
      vocative:      { s: 'гарний подарунку',       p: 'гарні подарунки' },
    },
  },
  // 16. добрий + учитель (m, animate)
  {
    adjective: 'добрий',
    noun: 'учитель',
    level: 'A1',
    meaning: { en: 'good teacher', nl: 'goede leraar' },
    forms: {
      nominative:    { s: 'добрий учитель',       p: 'добрі учителі' },
      accusative:    { s: 'доброго учителя',      p: 'добрих учителів' },
      genitive:      { s: 'доброго учителя',      p: 'добрих учителів' },
      dative:        { s: 'доброму учителю',      p: 'добрим учителям' },
      instrumental:  { s: 'добрим учителем',      p: 'добрими учителями' },
      locative:      { s: 'доброму учителі',      p: 'добрих учителях' },
      vocative:      { s: 'добрий учителю',       p: 'добрі учителі' },
    },
  },
  // 17. молодий + лікар (m, animate)
  {
    adjective: 'молодий',
    noun: 'лікар',
    level: 'A2',
    meaning: { en: 'young doctor', nl: 'jonge dokter' },
    forms: {
      nominative:    { s: 'молодий лікар',       p: 'молоді лікарі' },
      accusative:    { s: 'молодого лікаря',     p: 'молодих лікарів' },
      genitive:      { s: 'молодого лікаря',     p: 'молодих лікарів' },
      dative:        { s: 'молодому лікарю',     p: 'молодим лікарям' },
      instrumental:  { s: 'молодим лікарем',     p: 'молодими лікарями' },
      locative:      { s: 'молодому лікарі',     p: 'молодих лікарях' },
      vocative:      { s: 'молодий лікарю',      p: 'молоді лікарі' },
    },
  },
  // 18. синій + озеро (n)
  {
    adjective: 'синій',
    noun: 'озеро',
    level: 'A2',
    meaning: { en: 'blue lake', nl: 'blauw meer' },
    forms: {
      nominative:    { s: 'синє озеро',        p: 'сині озера' },
      accusative:    { s: 'синє озеро',        p: 'сині озера' },
      genitive:      { s: 'синього озера',     p: 'синіх озер' },
      dative:        { s: 'синьому озеру',     p: 'синім озерам' },
      instrumental:  { s: 'синім озером',      p: 'синіми озерами' },
      locative:      { s: 'синьому озері',     p: 'синіх озерах' },
      vocative:      { s: 'синє озеро',        p: 'сині озера' },
    },
  },
  // 19. перший + слово (n)
  {
    adjective: 'перший',
    noun: 'слово',
    level: 'A1',
    meaning: { en: 'first word', nl: 'eerste woord' },
    forms: {
      nominative:    { s: 'перше слово',       p: 'перші слова' },
      accusative:    { s: 'перше слово',       p: 'перші слова' },
      genitive:      { s: 'першого слова',     p: 'перших слів' },
      dative:        { s: 'першому слову',     p: 'першим словам' },
      instrumental:  { s: 'першим словом',     p: 'першими словами' },
      locative:      { s: 'першому слові',     p: 'перших словах' },
      vocative:      { s: 'перше слово',       p: 'перші слова' },
    },
  },
  // 20. останній + можливість (f, 3rd decl)
  {
    adjective: 'останній',
    noun: 'можливість',
    level: 'B1',
    meaning: { en: 'last opportunity', nl: 'laatste mogelijkheid' },
    forms: {
      nominative:    { s: 'остання можливість',       p: 'останні можливості' },
      accusative:    { s: 'останню можливість',       p: 'останні можливості' },
      genitive:      { s: 'останньої можливості',     p: 'останніх можливостей' },
      dative:        { s: 'останній можливості',      p: 'останнім можливостям' },
      instrumental:  { s: 'останньою можливістю',     p: 'останніми можливостями' },
      locative:      { s: 'останній можливості',      p: 'останніх можливостях' },
      vocative:      { s: 'остання можливосте',       p: 'останні можливості' },
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// CASE SENTENCES (70+)
// ═══════════════════════════════════════════════════════════════

export const CASE_SENTENCES = [
  // ─── NOMINATIVE (10) ───
  {
    uk: 'Це ___ .', answer: 'книга', full: 'Це книга.',
    en: 'This is a book.', nl: 'Dit is een boek.',
    targetCase: 'nominative', noun: 'книга', number: 'singular', level: 'A1',
  },
  {
    uk: '___ стоїть на кухні.', answer: 'стіл', full: 'Стіл стоїть на кухні.',
    en: 'The table is in the kitchen.', nl: 'De tafel staat in de keuken.',
    targetCase: 'nominative', noun: 'стіл', number: 'singular', level: 'A1',
  },
  {
    uk: 'Мій ___ живе далеко.', answer: 'брат', full: 'Мій брат живе далеко.',
    en: 'My brother lives far away.', nl: 'Mijn broer woont ver weg.',
    targetCase: 'nominative', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: '___ дуже смачне.', answer: 'молоко', full: 'Молоко дуже смачне.',
    en: 'The milk is very tasty.', nl: 'De melk is erg lekker.',
    targetCase: 'nominative', noun: 'молоко', number: 'singular', level: 'A1',
  },
  {
    uk: '___ прийшла додому.', answer: 'мама', full: 'Мама прийшла додому.',
    en: 'Mom came home.', nl: 'Mama kwam thuis.',
    targetCase: 'nominative', noun: 'мама', number: 'singular', level: 'A1',
  },
  {
    uk: '___ холодна.', answer: 'вода', full: 'Вода холодна.',
    en: 'The water is cold.', nl: 'Het water is koud.',
    targetCase: 'nominative', noun: 'вода', number: 'singular', level: 'A1',
  },
  {
    uk: 'Наше ___ велике.', answer: 'місто', full: 'Наше місто велике.',
    en: 'Our city is big.', nl: 'Onze stad is groot.',
    targetCase: 'nominative', noun: 'місто', number: 'singular', level: 'A1',
  },
  {
    uk: '___ починається о восьмій.', answer: 'робота', full: 'Робота починається о восьмій.',
    en: 'Work starts at eight.', nl: 'Het werk begint om acht uur.',
    targetCase: 'nominative', noun: 'робота', number: 'singular', level: 'A2',
  },
  {
    uk: '___ стояли біля школи.', answer: 'автобуси', full: 'Автобуси стояли біля школи.',
    en: 'The buses were standing near the school.', nl: 'De bussen stonden bij de school.',
    targetCase: 'nominative', noun: 'автобус', number: 'plural', level: 'A1',
  },
  {
    uk: '___ важливе.', answer: 'здоров\'я', full: 'Здоров\'я важливе.',
    en: 'Health is important.', nl: 'Gezondheid is belangrijk.',
    targetCase: 'nominative', noun: 'здоров\'я', number: 'singular', level: 'B1',
  },

  // ─── ACCUSATIVE (10) ───
  {
    uk: 'Я читаю ___ .', answer: 'книгу', full: 'Я читаю книгу.',
    en: 'I am reading a book.', nl: 'Ik lees een boek.',
    targetCase: 'accusative', noun: 'книга', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він бачить ___ .', answer: 'брата', full: 'Він бачить брата.',
    en: 'He sees his brother.', nl: 'Hij ziet zijn broer.',
    targetCase: 'accusative', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: 'Ми п\'ємо ___ .', answer: 'воду', full: 'Ми п\'ємо воду.',
    en: 'We are drinking water.', nl: 'Wij drinken water.',
    targetCase: 'accusative', noun: 'вода', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вона купила ___ .', answer: 'яблуко', full: 'Вона купила яблуко.',
    en: 'She bought an apple.', nl: 'Zij kocht een appel.',
    targetCase: 'accusative', noun: 'яблуко', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я чекаю ___ .', answer: 'автобус', full: 'Я чекаю автобус.',
    en: 'I am waiting for the bus.', nl: 'Ik wacht op de bus.',
    targetCase: 'accusative', noun: 'автобус', number: 'singular', level: 'A1',
  },
  {
    uk: 'Діти люблять ___ .', answer: 'маму', full: 'Діти люблять маму.',
    en: 'Children love their mom.', nl: 'Kinderen houden van mama.',
    targetCase: 'accusative', noun: 'мама', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я знаю ___ .', answer: 'відповідь', full: 'Я знаю відповідь.',
    en: 'I know the answer.', nl: 'Ik weet het antwoord.',
    targetCase: 'accusative', noun: 'відповідь', number: 'singular', level: 'A2',
  },
  {
    uk: 'Він написав ___ .', answer: 'лист', full: 'Він написав лист.',
    en: 'He wrote a letter.', nl: 'Hij schreef een brief.',
    targetCase: 'accusative', noun: 'лист', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вони знайшли ___ .', answer: 'ключ', full: 'Вони знайшли ключ.',
    en: 'They found the key.', nl: 'Ze vonden de sleutel.',
    targetCase: 'accusative', noun: 'ключ', number: 'singular', level: 'A2',
  },
  {
    uk: 'Я бачу ___ .', answer: 'море', full: 'Я бачу море.',
    en: 'I see the sea.', nl: 'Ik zie de zee.',
    targetCase: 'accusative', noun: 'море', number: 'singular', level: 'A1',
  },

  // ─── GENITIVE (10) ───
  {
    uk: 'У мене немає ___ .', answer: 'книги', full: 'У мене немає книги.',
    en: 'I don\'t have a book.', nl: 'Ik heb geen boek.',
    targetCase: 'genitive', noun: 'книга', number: 'singular', level: 'A1',
  },
  {
    uk: 'Біля ___ є парк.', answer: 'школи', full: 'Біля школи є парк.',
    en: 'There is a park near the school.', nl: 'Bij de school is een park.',
    targetCase: 'genitive', noun: 'школа', number: 'singular', level: 'A1',
  },
  {
    uk: 'Це книга ___ .', answer: 'брата', full: 'Це книга брата.',
    en: 'This is the brother\'s book.', nl: 'Dit is het boek van de broer.',
    targetCase: 'genitive', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: 'Склянка ___ .', answer: 'молока', full: 'Склянка молока.',
    en: 'A glass of milk.', nl: 'Een glas melk.',
    targetCase: 'genitive', noun: 'молоко', number: 'singular', level: 'A1',
  },
  {
    uk: 'Центр ___ дуже гарний.', answer: 'міста', full: 'Центр міста дуже гарний.',
    en: 'The city center is very beautiful.', nl: 'Het stadscentrum is erg mooi.',
    targetCase: 'genitive', noun: 'місто', number: 'singular', level: 'A1',
  },
  {
    uk: 'Без ___ важко жити.', answer: 'води', full: 'Без води важко жити.',
    en: 'It\'s hard to live without water.', nl: 'Het is moeilijk om zonder water te leven.',
    targetCase: 'genitive', noun: 'вода', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я не знаю його ___ .', answer: 'імені', full: 'Я не знаю його імені.',
    en: 'I don\'t know his name.', nl: 'Ik weet zijn naam niet.',
    targetCase: 'genitive', noun: 'ім\'я', number: 'singular', level: 'A1',
  },
  {
    uk: 'Поради ___ були корисними.', answer: 'лікаря', full: 'Поради лікаря були корисними.',
    en: 'The doctor\'s advice was useful.', nl: 'Het advies van de dokter was nuttig.',
    targetCase: 'genitive', noun: 'лікар', number: 'singular', level: 'A2',
  },
  {
    uk: 'У нас багато ___ .', answer: 'проблем', full: 'У нас багато проблем.',
    en: 'We have a lot of problems.', nl: 'Wij hebben veel problemen.',
    targetCase: 'genitive', noun: 'проблема', number: 'plural', level: 'A2',
  },
  {
    uk: 'Для ___ потрібен час.', answer: 'розвитку', full: 'Для розвитку потрібен час.',
    en: 'Development needs time.', nl: 'Voor ontwikkeling is tijd nodig.',
    targetCase: 'genitive', noun: 'розвиток', number: 'singular', level: 'B1',
  },

  // ─── DATIVE (10) ───
  {
    uk: 'Я дав книгу ___ .', answer: 'братові', full: 'Я дав книгу братові.',
    en: 'I gave the book to my brother.', nl: 'Ik gaf het boek aan mijn broer.',
    targetCase: 'dative', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він подзвонив ___ .', answer: 'мамі', full: 'Він подзвонив мамі.',
    en: 'He called mom.', nl: 'Hij belde mama.',
    targetCase: 'dative', noun: 'мама', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я допомагаю ___ .', answer: 'сестрі', full: 'Я допомагаю сестрі.',
    en: 'I am helping my sister.', nl: 'Ik help mijn zus.',
    targetCase: 'dative', noun: 'сестра', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вона радіє ___ .', answer: 'подарунку', full: 'Вона радіє подарунку.',
    en: 'She is happy about the gift.', nl: 'Ze is blij met het cadeau.',
    targetCase: 'dative', noun: 'подарунок', number: 'singular', level: 'A2',
  },
  {
    uk: 'Я дякую ___ .', answer: 'другу', full: 'Я дякую другу.',
    en: 'I thank my friend.', nl: 'Ik bedank mijn vriend.',
    targetCase: 'dative', noun: 'друг', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вчитель пояснив ___ .', answer: 'учителю', full: 'Вчитель пояснив учителю.',
    en: 'The teacher explained to the teacher.', nl: 'De leraar legde uit aan de leraar.',
    targetCase: 'dative', noun: 'учитель', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він дав воду ___ .', answer: 'сусіду', full: 'Він дав воду сусіду.',
    en: 'He gave water to the neighbor.', nl: 'Hij gaf water aan de buurman.',
    targetCase: 'dative', noun: 'сусід', number: 'singular', level: 'A2',
  },
  {
    uk: 'Передай привіт ___ .', answer: 'подрузі', full: 'Передай привіт подрузі.',
    en: 'Say hello to the friend.', nl: 'Doe de groeten aan de vriendin.',
    targetCase: 'dative', noun: 'подруга', number: 'singular', level: 'A2',
  },
  {
    uk: 'Я написав листа ___ .', answer: 'лікарю', full: 'Я написав листа лікарю.',
    en: 'I wrote a letter to the doctor.', nl: 'Ik schreef een brief aan de dokter.',
    targetCase: 'dative', noun: 'лікар', number: 'singular', level: 'A2',
  },
  {
    uk: 'Він присвятив життя ___ .', answer: 'суспільству', full: 'Він присвятив життя суспільству.',
    en: 'He dedicated his life to society.', nl: 'Hij wijdde zijn leven aan de maatschappij.',
    targetCase: 'dative', noun: 'суспільство', number: 'singular', level: 'B1',
  },

  // ─── INSTRUMENTAL (10) ───
  {
    uk: 'Я пишу ___ .', answer: 'ручкою', full: 'Я пишу ручкою.',
    en: 'I write with a pen.', nl: 'Ik schrijf met een pen.',
    targetCase: 'instrumental', noun: 'рука', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він розмовляє з ___ .', answer: 'братом', full: 'Він розмовляє з братом.',
    en: 'He is talking to his brother.', nl: 'Hij praat met zijn broer.',
    targetCase: 'instrumental', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я їду ___ .', answer: 'автобусом', full: 'Я їду автобусом.',
    en: 'I go by bus.', nl: 'Ik ga met de bus.',
    targetCase: 'instrumental', noun: 'автобус', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вона пишається ___ .', answer: 'сестрою', full: 'Вона пишається сестрою.',
    en: 'She is proud of her sister.', nl: 'Ze is trots op haar zus.',
    targetCase: 'instrumental', noun: 'сестра', number: 'singular', level: 'A1',
  },
  {
    uk: 'Хліб із ___ .', answer: 'молоком', full: 'Хліб із молоком.',
    en: 'Bread with milk.', nl: 'Brood met melk.',
    targetCase: 'instrumental', noun: 'молоко', number: 'singular', level: 'A1',
  },
  {
    uk: 'Вона стала ___ .', answer: 'учителем', full: 'Вона стала учителем.',
    en: 'She became a teacher.', nl: 'Ze werd leraar.',
    targetCase: 'instrumental', noun: 'учитель', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я цікавлюся ___ .', answer: 'морем', full: 'Я цікавлюся морем.',
    en: 'I am interested in the sea.', nl: 'Ik ben geinteresseerd in de zee.',
    targetCase: 'instrumental', noun: 'море', number: 'singular', level: 'A1',
  },
  {
    uk: 'Кімната з великим ___ .', answer: 'вікном', full: 'Кімната з великим вікном.',
    en: 'A room with a big window.', nl: 'Een kamer met een groot raam.',
    targetCase: 'instrumental', noun: 'вікно', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він працює ___ .', answer: 'лікарем', full: 'Він працює лікарем.',
    en: 'He works as a doctor.', nl: 'Hij werkt als dokter.',
    targetCase: 'instrumental', noun: 'лікар', number: 'singular', level: 'A2',
  },
  {
    uk: 'Ми задоволені ___ .', answer: 'роботою', full: 'Ми задоволені роботою.',
    en: 'We are satisfied with the work.', nl: 'Wij zijn tevreden met het werk.',
    targetCase: 'instrumental', noun: 'робота', number: 'singular', level: 'A2',
  },

  // ─── LOCATIVE (10) ───
  {
    uk: 'Книга на ___ .', answer: 'столі', full: 'Книга на столі.',
    en: 'The book is on the table.', nl: 'Het boek ligt op de tafel.',
    targetCase: 'locative', noun: 'стіл', number: 'singular', level: 'A1',
  },
  {
    uk: 'Діти в ___ .', answer: 'школі', full: 'Діти в школі.',
    en: 'The children are at school.', nl: 'De kinderen zijn op school.',
    targetCase: 'locative', noun: 'школа', number: 'singular', level: 'A1',
  },
  {
    uk: 'Ми живемо в ___ .', answer: 'місті', full: 'Ми живемо в місті.',
    en: 'We live in the city.', nl: 'Wij wonen in de stad.',
    targetCase: 'locative', noun: 'місто', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я готую на ___ .', answer: 'кухні', full: 'Я готую на кухні.',
    en: 'I cook in the kitchen.', nl: 'Ik kook in de keuken.',
    targetCase: 'locative', noun: 'кухня', number: 'singular', level: 'A1',
  },
  {
    uk: 'Він живе в ___ .', answer: 'домі', full: 'Він живе в домі.',
    en: 'He lives in the house.', nl: 'Hij woont in het huis.',
    targetCase: 'locative', noun: 'дім', number: 'singular', level: 'A1',
  },
  {
    uk: 'Ми гуляємо на ___ .', answer: 'вулиці', full: 'Ми гуляємо на вулиці.',
    en: 'We walk on the street.', nl: 'Wij wandelen op straat.',
    targetCase: 'locative', noun: 'вулиця', number: 'singular', level: 'A1',
  },
  {
    uk: 'Я живу в ___ .', answer: 'квартирі', full: 'Я живу в квартирі.',
    en: 'I live in an apartment.', nl: 'Ik woon in een appartement.',
    targetCase: 'locative', noun: 'квартира', number: 'singular', level: 'A2',
  },
  {
    uk: 'Ми купаємось в ___ .', answer: 'озері', full: 'Ми купаємось в озері.',
    en: 'We swim in the lake.', nl: 'Wij zwemmen in het meer.',
    targetCase: 'locative', noun: 'озеро', number: 'singular', level: 'A2',
  },
  {
    uk: 'Я працюю в ___ .', answer: 'магазині', full: 'Я працюю в магазині.',
    en: 'I work in a store.', nl: 'Ik werk in een winkel.',
    targetCase: 'locative', noun: 'магазин', number: 'singular', level: 'A2',
  },
  {
    uk: 'Це важливо в ___ .', answer: 'суспільстві', full: 'Це важливо в суспільстві.',
    en: 'This is important in society.', nl: 'Dit is belangrijk in de maatschappij.',
    targetCase: 'locative', noun: 'суспільство', number: 'singular', level: 'B1',
  },

  // ─── VOCATIVE (10) ───
  {
    uk: '___ , де ти?', answer: 'мамо', full: 'Мамо, де ти?',
    en: 'Mom, where are you?', nl: 'Mama, waar ben je?',
    targetCase: 'vocative', noun: 'мама', number: 'singular', level: 'A1',
  },
  {
    uk: '___ , допоможи мені!', answer: 'друже', full: 'Друже, допоможи мені!',
    en: 'Friend, help me!', nl: 'Vriend, help me!',
    targetCase: 'vocative', noun: 'друг', number: 'singular', level: 'A1',
  },
  {
    uk: '___ , іди сюди!', answer: 'брате', full: 'Брате, іди сюди!',
    en: 'Brother, come here!', nl: 'Broer, kom hier!',
    targetCase: 'vocative', noun: 'брат', number: 'singular', level: 'A1',
  },
  {
    uk: '___ , ти вдома?', answer: 'сестро', full: 'Сестро, ти вдома?',
    en: 'Sister, are you home?', nl: 'Zus, ben je thuis?',
    targetCase: 'vocative', noun: 'сестра', number: 'singular', level: 'A1',
  },
  {
    uk: '___ , дякую за урок!', answer: 'учителю', full: 'Учителю, дякую за урок!',
    en: 'Teacher, thank you for the lesson!', nl: 'Leraar, bedankt voor de les!',
    targetCase: 'vocative', noun: 'учитель', number: 'singular', level: 'A1',
  },
  {
    uk: 'Дорога ___ , вітаю!', answer: 'подруго', full: 'Дорога подруго, вітаю!',
    en: 'Dear friend, greetings!', nl: 'Lieve vriendin, gefeliciteerd!',
    targetCase: 'vocative', noun: 'подруга', number: 'singular', level: 'A2',
  },
  {
    uk: '___ , коли прийом?', answer: 'лікарю', full: 'Лікарю, коли прийом?',
    en: 'Doctor, when is the appointment?', nl: 'Dokter, wanneer is het spreekuur?',
    targetCase: 'vocative', noun: 'лікар', number: 'singular', level: 'A2',
  },
  {
    uk: '___ , ви вдома?', answer: 'сусіде', full: 'Сусіде, ви вдома?',
    en: 'Neighbor, are you home?', nl: 'Buurman, bent u thuis?',
    targetCase: 'vocative', noun: 'сусід', number: 'singular', level: 'A2',
  },
  {
    uk: 'Шановний ___ !', answer: 'письменнику', full: 'Шановний письменнику!',
    en: 'Dear writer!', nl: 'Geachte schrijver!',
    targetCase: 'vocative', noun: 'письменник', number: 'singular', level: 'B1',
  },
  {
    uk: 'Рідне ___ !', answer: 'серце', full: 'Рідне серце!',
    en: 'Dear heart!', nl: 'Lief hart!',
    targetCase: 'vocative', noun: 'серце', number: 'singular', level: 'A1',
  },
];

// ═══════════════════════════════════════════════════════════════
// BUILDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function buildCaseDrillSet(count = 25) {
  const questions = [];
  for (const noun of NOUNS) {
    for (const number of ['singular', 'plural']) {
      for (const caseName of CASES) {
        const form = noun[number]?.[caseName];
        if (!form) continue;
        questions.push({
          nom_s: noun.nom_s,
          gender: noun.gender,
          meaning: noun.meaning,
          level: noun.level,
          caseName,
          number,
          correctForm: form,
        });
      }
    }
  }
  // Fisher-Yates shuffle
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, count);
}

export function findNoun(nomSingular) {
  return NOUNS.find(n => n.nom_s === nomSingular);
}
