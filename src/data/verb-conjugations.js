// Complete conjugation tables for 108 Ukrainian verbs (54 aspect pairs: 24 A1 + 15 A2 + 15 B1)

export const CONJUGATIONS = [
  // ============================================================
  // A1 VERBS (pairs 1-24)
  // ============================================================

  // 1. йти / піти — go on foot
  {
    infinitive: 'йти',
    aspect: 'imperfective',
    partner: 'піти',
    meaning: { en: 'to go (on foot)', nl: 'gaan (te voet)' },
    level: 'A1',
    present: { я: 'іду', ти: 'ідеш', 'він/вона': 'іде', ми: 'ідемо', ви: 'ідете', вони: 'ідуть' },
    past: { він: 'ішов', вона: 'ішла', воно: 'ішло', вони: 'ішли' },
    future: { я: 'буду йти', ти: 'будеш йти', 'він/вона': 'буде йти', ми: 'будемо йти', ви: 'будете йти', вони: 'будуть йти' },
    imperative: { ти: 'іди', ви: 'ідіть' },
    sentences: [
      { uk: 'Я ___ до школи щодня.', answer: 'іду', full: 'Я іду до школи щодня.', en: 'I go to school every day.', nl: 'Ik ga elke dag naar school.', tense: 'present', pronoun: 'я' },
      { uk: 'Він ___ додому після роботи.', answer: 'ішов', full: 'Він ішов додому після роботи.', en: 'He was walking home after work.', nl: 'Hij liep naar huis na het werk.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ йти в парк завтра.', answer: 'будемо', full: 'Ми будемо йти в парк завтра.', en: 'We will be walking to the park tomorrow.', nl: 'We zullen morgen naar het park lopen.', tense: 'future', pronoun: 'ми' },
    ],
  },
  {
    infinitive: 'піти',
    aspect: 'perfective',
    partner: 'йти',
    meaning: { en: 'to go (on foot, completed)', nl: 'gaan (te voet, voltooid)' },
    level: 'A1',
    present: null,
    past: { він: 'пішов', вона: 'пішла', воно: 'пішло', вони: 'пішли' },
    future: { я: 'піду', ти: 'підеш', 'він/вона': 'піде', ми: 'підемо', ви: 'підете', вони: 'підуть' },
    imperative: { ти: 'піди', ви: 'підіть' },
    sentences: [
      { uk: 'Вона ___ до магазину вчора.', answer: 'пішла', full: 'Вона пішла до магазину вчора.', en: 'She went to the store yesterday.', nl: 'Ze ging gisteren naar de winkel.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ на роботу рано вранці.', answer: 'піду', full: 'Я піду на роботу рано вранці.', en: 'I will go to work early in the morning.', nl: 'Ik ga vroeg in de ochtend naar het werk.', tense: 'future', pronoun: 'я' },
      { uk: '___ звідси!', answer: 'Піди', full: 'Піди звідси!', en: 'Go away from here!', nl: 'Ga hier weg!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 2. їхати / поїхати — go by transport
  {
    infinitive: 'їхати',
    aspect: 'imperfective',
    partner: 'поїхати',
    meaning: { en: 'to go (by transport)', nl: 'gaan (met vervoer)' },
    level: 'A1',
    present: { я: 'їду', ти: 'їдеш', 'він/вона': 'їде', ми: 'їдемо', ви: 'їдете', вони: 'їдуть' },
    past: { він: 'їхав', вона: 'їхала', воно: 'їхало', вони: 'їхали' },
    future: { я: 'буду їхати', ти: 'будеш їхати', 'він/вона': 'буде їхати', ми: 'будемо їхати', ви: 'будете їхати', вони: 'будуть їхати' },
    imperative: { ти: 'їдь', ви: 'їдьте' },
    sentences: [
      { uk: 'Я ___ на роботу автобусом.', answer: 'їду', full: 'Я їду на роботу автобусом.', en: 'I go to work by bus.', nl: 'Ik ga met de bus naar het werk.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ до Львова минулого тижня.', answer: 'їхали', full: 'Вони їхали до Львова минулого тижня.', en: 'They were travelling to Lviv last week.', nl: 'Ze reisden vorige week naar Lviv.', tense: 'past', pronoun: 'вони' },
      { uk: '___ обережно!', answer: 'Їдь', full: 'Їдь обережно!', en: 'Drive carefully!', nl: 'Rij voorzichtig!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'поїхати',
    aspect: 'perfective',
    partner: 'їхати',
    meaning: { en: 'to go (by transport, completed)', nl: 'gaan (met vervoer, voltooid)' },
    level: 'A1',
    present: null,
    past: { він: 'поїхав', вона: 'поїхала', воно: 'поїхало', вони: 'поїхали' },
    future: { я: 'поїду', ти: 'поїдеш', 'він/вона': 'поїде', ми: 'поїдемо', ви: 'поїдете', вони: 'поїдуть' },
    imperative: { ти: 'поїдь', ви: 'поїдьте' },
    sentences: [
      { uk: 'Він ___ у відрядження вчора.', answer: 'поїхав', full: 'Він поїхав у відрядження вчора.', en: 'He went on a business trip yesterday.', nl: 'Hij ging gisteren op zakenreis.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ на море влітку.', answer: 'поїдемо', full: 'Ми поїдемо на море влітку.', en: 'We will go to the sea in summer.', nl: 'We gaan in de zomer naar zee.', tense: 'future', pronoun: 'ми' },
      { uk: '___ вже, бо запізнишся!', answer: 'Поїдь', full: 'Поїдь вже, бо запізнишся!', en: 'Go already, or you will be late!', nl: 'Ga al, anders kom je te laat!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 3. працювати / попрацювати — work
  {
    infinitive: 'працювати',
    aspect: 'imperfective',
    partner: 'попрацювати',
    meaning: { en: 'to work', nl: 'werken' },
    level: 'A1',
    present: { я: 'працюю', ти: 'працюєш', 'він/вона': 'працює', ми: 'працюємо', ви: 'працюєте', вони: 'працюють' },
    past: { він: 'працював', вона: 'працювала', воно: 'працювало', вони: 'працювали' },
    future: { я: 'буду працювати', ти: 'будеш працювати', 'він/вона': 'буде працювати', ми: 'будемо працювати', ви: 'будете працювати', вони: 'будуть працювати' },
    imperative: { ти: 'працюй', ви: 'працюйте' },
    sentences: [
      { uk: 'Я ___ в офісі кожен день.', answer: 'працюю', full: 'Я працюю в офісі кожен день.', en: 'I work in the office every day.', nl: 'Ik werk elke dag op kantoor.', tense: 'present', pronoun: 'я' },
      { uk: 'Вона ___ вчора до пізнього вечора.', answer: 'працювала', full: 'Вона працювала вчора до пізнього вечора.', en: 'She worked until late evening yesterday.', nl: 'Ze werkte gisteren tot laat in de avond.', tense: 'past', pronoun: 'вона' },
      { uk: '___ старанно!', answer: 'Працюй', full: 'Працюй старанно!', en: 'Work diligently!', nl: 'Werk ijverig!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'попрацювати',
    aspect: 'perfective',
    partner: 'працювати',
    meaning: { en: 'to work (for a while, completed)', nl: 'werken (een tijdje, voltooid)' },
    level: 'A1',
    present: null,
    past: { він: 'попрацював', вона: 'попрацювала', воно: 'попрацювало', вони: 'попрацювали' },
    future: { я: 'попрацюю', ти: 'попрацюєш', 'він/вона': 'попрацює', ми: 'попрацюємо', ви: 'попрацюєте', вони: 'попрацюють' },
    imperative: { ти: 'попрацюй', ви: 'попрацюйте' },
    sentences: [
      { uk: 'Він ___ годину і пішов додому.', answer: 'попрацював', full: 'Він попрацював годину і пішов додому.', en: 'He worked for an hour and went home.', nl: 'Hij werkte een uur en ging naar huis.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ ще трохи і відпочину.', answer: 'попрацюю', full: 'Я попрацюю ще трохи і відпочину.', en: 'I will work a little more and rest.', nl: 'Ik werk nog even en rust dan uit.', tense: 'future', pronoun: 'я' },
      { uk: '___ ще трохи перед обідом!', answer: 'Попрацюй', full: 'Попрацюй ще трохи перед обідом!', en: 'Work a little more before lunch!', nl: 'Werk nog even voor de lunch!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 4. зустрічатися / зустрітися — meet up
  {
    infinitive: 'зустрічатися', aspect: 'imperfective', partner: 'зустрітися',
    meaning: { en: 'to meet up', nl: 'afspreken / ontmoeten' }, level: 'A1',
    present: { я: 'зустрічаюся', ти: 'зустрічаєшся', 'він/вона': 'зустрічається', ми: 'зустрічаємося', ви: 'зустрічаєтеся', вони: 'зустрічаються' },
    past: { він: 'зустрічався', вона: 'зустрічалася', воно: 'зустрічалося', вони: 'зустрічалися' },
    future: { я: 'буду зустрічатися', ти: 'будеш зустрічатися', 'він/вона': 'буде зустрічатися', ми: 'будемо зустрічатися', ви: 'будете зустрічатися', вони: 'будуть зустрічатися' },
    imperative: { ти: 'зустрічайся', ви: 'зустрічайтеся' },
    sentences: [
      { uk: 'Ми ___ з друзями щоп\'ятниці.', answer: 'зустрічаємося', full: 'Ми зустрічаємося з друзями щоп\'ятниці.', en: 'We meet up with friends every Friday.', nl: 'We spreken elke vrijdag met vrienden af.', tense: 'present', pronoun: 'ми' },
      { uk: 'Вони ___ в кафе минулого місяця.', answer: 'зустрічалися', full: 'Вони зустрічалися в кафе минулого місяця.', en: 'They used to meet at the cafe last month.', nl: 'Ze ontmoetten elkaar in het cafe vorige maand.', tense: 'past', pronoun: 'вони' },
      { uk: '___ з нами завтра!', answer: 'Зустрічайся', full: 'Зустрічайся з нами завтра!', en: 'Meet up with us tomorrow!', nl: 'Spreek morgen met ons af!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'зустрітися', aspect: 'perfective', partner: 'зустрічатися',
    meaning: { en: 'to meet up (completed)', nl: 'afspreken / ontmoeten (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'зустрівся', вона: 'зустрілася', воно: 'зустрілося', вони: 'зустрілися' },
    future: { я: 'зустрінуся', ти: 'зустрінешся', 'він/вона': 'зустрінеться', ми: 'зустрінемося', ви: 'зустрінетеся', вони: 'зустрінуться' },
    imperative: { ти: 'зустрінься', ви: 'зустріньтеся' },
    sentences: [
      { uk: 'Він ___ із другом біля метро.', answer: 'зустрівся', full: 'Він зустрівся із другом біля метро.', en: 'He met up with a friend near the metro.', nl: 'Hij ontmoette een vriend bij de metro.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ о п\'ятій годині.', answer: 'зустрінемося', full: 'Ми зустрінемося о п\'ятій годині.', en: 'We will meet at five o\'clock.', nl: 'We ontmoeten elkaar om vijf uur.', tense: 'future', pronoun: 'ми' },
      { uk: '___ зі мною після уроку!', answer: 'Зустрінься', full: 'Зустрінься зі мною після уроку!', en: 'Meet me after the lesson!', nl: 'Ontmoet me na de les!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 5. готувати / приготувати — cook/prepare
  {
    infinitive: 'готувати', aspect: 'imperfective', partner: 'приготувати',
    meaning: { en: 'to cook / to prepare', nl: 'koken / bereiden' }, level: 'A1',
    present: { я: 'готую', ти: 'готуєш', 'він/вона': 'готує', ми: 'готуємо', ви: 'готуєте', вони: 'готують' },
    past: { він: 'готував', вона: 'готувала', воно: 'готувало', вони: 'готували' },
    future: { я: 'буду готувати', ти: 'будеш готувати', 'він/вона': 'буде готувати', ми: 'будемо готувати', ви: 'будете готувати', вони: 'будуть готувати' },
    imperative: { ти: 'готуй', ви: 'готуйте' },
    sentences: [
      { uk: 'Мама ___ вечерю кожного дня.', answer: 'готує', full: 'Мама готує вечерю кожного дня.', en: 'Mom cooks dinner every day.', nl: 'Mama kookt elke dag het avondeten.', tense: 'present', pronoun: 'він/вона' },
      { uk: 'Я ___ обід для всієї родини.', answer: 'готую', full: 'Я готую обід для всієї родини.', en: 'I am cooking lunch for the whole family.', nl: 'Ik kook de lunch voor het hele gezin.', tense: 'present', pronoun: 'я' },
      { uk: 'Ми ___ готувати святковий торт.', answer: 'будемо', full: 'Ми будемо готувати святковий торт.', en: 'We will be making a holiday cake.', nl: 'We gaan een feesttaart maken.', tense: 'future', pronoun: 'ми' },
    ],
  },
  {
    infinitive: 'приготувати', aspect: 'perfective', partner: 'готувати',
    meaning: { en: 'to cook / to prepare (completed)', nl: 'koken / bereiden (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'приготував', вона: 'приготувала', воно: 'приготувало', вони: 'приготували' },
    future: { я: 'приготую', ти: 'приготуєш', 'він/вона': 'приготує', ми: 'приготуємо', ви: 'приготуєте', вони: 'приготують' },
    imperative: { ти: 'приготуй', ви: 'приготуйте' },
    sentences: [
      { uk: 'Вона ___ смачний борщ.', answer: 'приготувала', full: 'Вона приготувала смачний борщ.', en: 'She cooked a delicious borshch.', nl: 'Ze maakte een heerlijke borsjtj.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ сніданок за десять хвилин.', answer: 'приготую', full: 'Я приготую сніданок за десять хвилин.', en: 'I will make breakfast in ten minutes.', nl: 'Ik maak het ontbijt in tien minuten.', tense: 'future', pronoun: 'я' },
      { uk: '___ щось на вечерю, будь ласка!', answer: 'Приготуй', full: 'Приготуй щось на вечерю, будь ласка!', en: 'Prepare something for dinner, please!', nl: 'Maak alsjeblieft iets voor het avondeten!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 6. тренуватися / потренуватися — train/exercise
  {
    infinitive: 'тренуватися', aspect: 'imperfective', partner: 'потренуватися',
    meaning: { en: 'to train / to exercise', nl: 'trainen / oefenen' }, level: 'A1',
    present: { я: 'тренуюся', ти: 'тренуєшся', 'він/вона': 'тренується', ми: 'тренуємося', ви: 'тренуєтеся', вони: 'тренуються' },
    past: { він: 'тренувався', вона: 'тренувалася', воно: 'тренувалося', вони: 'тренувалися' },
    future: { я: 'буду тренуватися', ти: 'будеш тренуватися', 'він/вона': 'буде тренуватися', ми: 'будемо тренуватися', ви: 'будете тренуватися', вони: 'будуть тренуватися' },
    imperative: { ти: 'тренуйся', ви: 'тренуйтеся' },
    sentences: [
      { uk: 'Я ___ в спортзалі тричі на тиждень.', answer: 'тренуюся', full: 'Я тренуюся в спортзалі тричі на тиждень.', en: 'I train at the gym three times a week.', nl: 'Ik train drie keer per week in de sportschool.', tense: 'present', pronoun: 'я' },
      { uk: 'Він ___ перед змаганням.', answer: 'тренувався', full: 'Він тренувався перед змаганням.', en: 'He was training before the competition.', nl: 'Hij trainde voor de wedstrijd.', tense: 'past', pronoun: 'він' },
      { uk: '___ більше, якщо хочеш перемогти!', answer: 'Тренуйся', full: 'Тренуйся більше, якщо хочеш перемогти!', en: 'Train more if you want to win!', nl: 'Train meer als je wilt winnen!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'потренуватися', aspect: 'perfective', partner: 'тренуватися',
    meaning: { en: 'to train (for a while, completed)', nl: 'trainen (een tijdje, voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'потренувався', вона: 'потренувалася', воно: 'потренувалося', вони: 'потренувалися' },
    future: { я: 'потренуюся', ти: 'потренуєшся', 'він/вона': 'потренується', ми: 'потренуємося', ви: 'потренуєтеся', вони: 'потренуються' },
    imperative: { ти: 'потренуйся', ви: 'потренуйтеся' },
    sentences: [
      { uk: 'Вона ___ і пішла додому.', answer: 'потренувалася', full: 'Вона потренувалася і пішла додому.', en: 'She trained for a while and went home.', nl: 'Ze trainde even en ging naar huis.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ перед іспитом.', answer: 'потренуюся', full: 'Я потренуюся перед іспитом.', en: 'I will practice before the exam.', nl: 'Ik zal oefenen voor het examen.', tense: 'future', pronoun: 'я' },
      { uk: '___ ще трохи!', answer: 'Потренуйся', full: 'Потренуйся ще трохи!', en: 'Practice a little more!', nl: 'Oefen nog even!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 7. гуляти / погуляти — walk/stroll
  {
    infinitive: 'гуляти', aspect: 'imperfective', partner: 'погуляти',
    meaning: { en: 'to walk / to stroll', nl: 'wandelen' }, level: 'A1',
    present: { я: 'гуляю', ти: 'гуляєш', 'він/вона': 'гуляє', ми: 'гуляємо', ви: 'гуляєте', вони: 'гуляють' },
    past: { він: 'гуляв', вона: 'гуляла', воно: 'гуляло', вони: 'гуляли' },
    future: { я: 'буду гуляти', ти: 'будеш гуляти', 'він/вона': 'буде гуляти', ми: 'будемо гуляти', ви: 'будете гуляти', вони: 'будуть гуляти' },
    imperative: { ти: 'гуляй', ви: 'гуляйте' },
    sentences: [
      { uk: 'Діти ___ в парку після школи.', answer: 'гуляють', full: 'Діти гуляють в парку після школи.', en: 'The children walk in the park after school.', nl: 'De kinderen wandelen na school in het park.', tense: 'present', pronoun: 'вони' },
      { uk: 'Ми ___ біля озера вчора.', answer: 'гуляли', full: 'Ми гуляли біля озера вчора.', en: 'We strolled near the lake yesterday.', nl: 'We wandelden gisteren bij het meer.', tense: 'past', pronoun: 'вони' },
      { uk: '___ на свіжому повітрі!', answer: 'Гуляй', full: 'Гуляй на свіжому повітрі!', en: 'Walk in the fresh air!', nl: 'Wandel in de frisse lucht!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'погуляти', aspect: 'perfective', partner: 'гуляти',
    meaning: { en: 'to take a walk (completed)', nl: 'wandelen (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'погуляв', вона: 'погуляла', воно: 'погуляло', вони: 'погуляли' },
    future: { я: 'погуляю', ти: 'погуляєш', 'він/вона': 'погуляє', ми: 'погуляємо', ви: 'погуляєте', вони: 'погуляють' },
    imperative: { ти: 'погуляй', ви: 'погуляйте' },
    sentences: [
      { uk: 'Вони ___ в саду після обіду.', answer: 'погуляли', full: 'Вони погуляли в саду після обіду.', en: 'They took a walk in the garden after lunch.', nl: 'Ze wandelden na de lunch in de tuin.', tense: 'past', pronoun: 'вони' },
      { uk: 'Ти ___ з собакою ввечері?', answer: 'погуляєш', full: 'Ти погуляєш з собакою ввечері?', en: 'Will you walk the dog in the evening?', nl: 'Ga je vanavond met de hond wandelen?', tense: 'future', pronoun: 'ти' },
      { uk: '___ хоч трохи!', answer: 'Погуляй', full: 'Погуляй хоч трохи!', en: 'Take at least a short walk!', nl: 'Maak op zijn minst een korte wandeling!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 8. дивитися / подивитися — watch/look
  {
    infinitive: 'дивитися', aspect: 'imperfective', partner: 'подивитися',
    meaning: { en: 'to watch / to look', nl: 'kijken' }, level: 'A1',
    present: { я: 'дивлюся', ти: 'дивишся', 'він/вона': 'дивиться', ми: 'дивимося', ви: 'дивитеся', вони: 'дивляться' },
    past: { він: 'дивився', вона: 'дивилася', воно: 'дивилося', вони: 'дивилися' },
    future: { я: 'буду дивитися', ти: 'будеш дивитися', 'він/вона': 'буде дивитися', ми: 'будемо дивитися', ви: 'будете дивитися', вони: 'будуть дивитися' },
    imperative: { ти: 'дивися', ви: 'дивіться' },
    sentences: [
      { uk: 'Я ___ фільм щовечора.', answer: 'дивлюся', full: 'Я дивлюся фільм щовечора.', en: 'I watch a movie every evening.', nl: 'Ik kijk elke avond een film.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ на зірки вчора ввечері.', answer: 'дивилися', full: 'Вони дивилися на зірки вчора ввечері.', en: 'They were looking at the stars yesterday evening.', nl: 'Ze keken gisteravond naar de sterren.', tense: 'past', pronoun: 'вони' },
      { uk: '___! Там літак!', answer: 'Дивися', full: 'Дивися! Там літак!', en: 'Look! There is a plane!', nl: 'Kijk! Daar is een vliegtuig!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'подивитися', aspect: 'perfective', partner: 'дивитися',
    meaning: { en: 'to watch / to look (completed)', nl: 'kijken (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'подивився', вона: 'подивилася', воно: 'подивилося', вони: 'подивилися' },
    future: { я: 'подивлюся', ти: 'подивишся', 'він/вона': 'подивиться', ми: 'подивимося', ви: 'подивитеся', вони: 'подивляться' },
    imperative: { ти: 'подивися', ви: 'подивіться' },
    sentences: [
      { uk: 'Він ___ на годинник і побіг.', answer: 'подивився', full: 'Він подивився на годинник і побіг.', en: 'He looked at the clock and ran.', nl: 'Hij keek op de klok en rende.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ цей фільм завтра.', answer: 'подивлюся', full: 'Я подивлюся цей фільм завтра.', en: 'I will watch this movie tomorrow.', nl: 'Ik zal morgen deze film bekijken.', tense: 'future', pronoun: 'я' },
      { uk: '___ на це!', answer: 'Подивися', full: 'Подивися на це!', en: 'Take a look at this!', nl: 'Kijk hier eens naar!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 9. відпочивати / відпочити — rest/relax
  {
    infinitive: 'відпочивати', aspect: 'imperfective', partner: 'відпочити',
    meaning: { en: 'to rest / to relax', nl: 'rusten / uitrusten' }, level: 'A1',
    present: { я: 'відпочиваю', ти: 'відпочиваєш', 'він/вона': 'відпочиває', ми: 'відпочиваємо', ви: 'відпочиваєте', вони: 'відпочивають' },
    past: { він: 'відпочивав', вона: 'відпочивала', воно: 'відпочивало', вони: 'відпочивали' },
    future: { я: 'буду відпочивати', ти: 'будеш відпочивати', 'він/вона': 'буде відпочивати', ми: 'будемо відпочивати', ви: 'будете відпочивати', вони: 'будуть відпочивати' },
    imperative: { ти: 'відпочивай', ви: 'відпочивайте' },
    sentences: [
      { uk: 'Я ___ після важкого дня.', answer: 'відпочиваю', full: 'Я відпочиваю після важкого дня.', en: 'I rest after a hard day.', nl: 'Ik rust uit na een zware dag.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ на морі минулого літа.', answer: 'відпочивали', full: 'Вони відпочивали на морі минулого літа.', en: 'They were resting at the sea last summer.', nl: 'Ze rustten vorige zomer aan zee.', tense: 'past', pronoun: 'вони' },
      { uk: '___! Ти заслужив це.', answer: 'Відпочивай', full: 'Відпочивай! Ти заслужив це.', en: 'Rest! You deserve it.', nl: 'Rust uit! Je hebt het verdiend.', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'відпочити', aspect: 'perfective', partner: 'відпочивати',
    meaning: { en: 'to rest (completed)', nl: 'uitrusten (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'відпочив', вона: 'відпочила', воно: 'відпочило', вони: 'відпочили' },
    future: { я: 'відпочину', ти: 'відпочинеш', 'він/вона': 'відпочине', ми: 'відпочинемо', ви: 'відпочинете', вони: 'відпочинуть' },
    imperative: { ти: 'відпочинь', ви: 'відпочиньте' },
    sentences: [
      { uk: 'Вона ___ і знову почала працювати.', answer: 'відпочила', full: 'Вона відпочила і знову почала працювати.', en: 'She rested and started working again.', nl: 'Ze rustte uit en begon weer te werken.', tense: 'past', pronoun: 'вона' },
      { uk: 'Ми ___ на вихідних.', answer: 'відпочинемо', full: 'Ми відпочинемо на вихідних.', en: 'We will rest on the weekend.', nl: 'We zullen in het weekend uitrusten.', tense: 'future', pronoun: 'ми' },
      { uk: '___ трохи перед подорожжю!', answer: 'Відпочинь', full: 'Відпочинь трохи перед подорожжю!', en: 'Rest a bit before the trip!', nl: 'Rust even uit voor de reis!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 10. купувати / купити — buy
  {
    infinitive: 'купувати', aspect: 'imperfective', partner: 'купити',
    meaning: { en: 'to buy', nl: 'kopen' }, level: 'A1',
    present: { я: 'купую', ти: 'купуєш', 'він/вона': 'купує', ми: 'купуємо', ви: 'купуєте', вони: 'купують' },
    past: { він: 'купував', вона: 'купувала', воно: 'купувало', вони: 'купували' },
    future: { я: 'буду купувати', ти: 'будеш купувати', 'він/вона': 'буде купувати', ми: 'будемо купувати', ви: 'будете купувати', вони: 'будуть купувати' },
    imperative: { ти: 'купуй', ви: 'купуйте' },
    sentences: [
      { uk: 'Я ___ продукти щосуботи.', answer: 'купую', full: 'Я купую продукти щосуботи.', en: 'I buy groceries every Saturday.', nl: 'Ik koop elke zaterdag boodschappen.', tense: 'present', pronoun: 'я' },
      { uk: 'Вона ___ квіти на ринку.', answer: 'купувала', full: 'Вона купувала квіти на ринку.', en: 'She used to buy flowers at the market.', nl: 'Ze kocht bloemen op de markt.', tense: 'past', pronoun: 'вона' },
      { uk: 'Не ___ це, це занадто дорого!', answer: 'купуй', full: 'Не купуй це, це занадто дорого!', en: 'Do not buy this, it is too expensive!', nl: 'Koop dit niet, het is te duur!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'купити', aspect: 'perfective', partner: 'купувати',
    meaning: { en: 'to buy (completed)', nl: 'kopen (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'купив', вона: 'купила', воно: 'купило', вони: 'купили' },
    future: { я: 'куплю', ти: 'купиш', 'він/вона': 'купить', ми: 'купимо', ви: 'купите', вони: 'куплять' },
    imperative: { ти: 'купи', ви: 'купіть' },
    sentences: [
      { uk: 'Він ___ нову машину.', answer: 'купив', full: 'Він купив нову машину.', en: 'He bought a new car.', nl: 'Hij kocht een nieuwe auto.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ тобі подарунок.', answer: 'куплю', full: 'Я куплю тобі подарунок.', en: 'I will buy you a gift.', nl: 'Ik zal een cadeau voor je kopen.', tense: 'future', pronoun: 'я' },
      { uk: '___ хліб, будь ласка!', answer: 'Купи', full: 'Купи хліб, будь ласка!', en: 'Buy bread, please!', nl: 'Koop alsjeblieft brood!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 11. обирати / обрати — choose
  {
    infinitive: 'обирати', aspect: 'imperfective', partner: 'обрати',
    meaning: { en: 'to choose', nl: 'kiezen' }, level: 'A1',
    present: { я: 'обираю', ти: 'обираєш', 'він/вона': 'обирає', ми: 'обираємо', ви: 'обираєте', вони: 'обирають' },
    past: { він: 'обирав', вона: 'обирала', воно: 'обирало', вони: 'обирали' },
    future: { я: 'буду обирати', ти: 'будеш обирати', 'він/вона': 'буде обирати', ми: 'будемо обирати', ви: 'будете обирати', вони: 'будуть обирати' },
    imperative: { ти: 'обирай', ви: 'обирайте' },
    sentences: [
      { uk: 'Ти завжди ___ найкраще.', answer: 'обираєш', full: 'Ти завжди обираєш найкраще.', en: 'You always choose the best.', nl: 'Je kiest altijd het beste.', tense: 'present', pronoun: 'ти' },
      { uk: 'Вони довго ___ подарунок.', answer: 'обирали', full: 'Вони довго обирали подарунок.', en: 'They were choosing a gift for a long time.', nl: 'Ze kozen lang een cadeau uit.', tense: 'past', pronoun: 'вони' },
      { uk: '___ що хочеш!', answer: 'Обирай', full: 'Обирай що хочеш!', en: 'Choose whatever you want!', nl: 'Kies wat je wilt!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'обрати', aspect: 'perfective', partner: 'обирати',
    meaning: { en: 'to choose (completed)', nl: 'kiezen (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'обрав', вона: 'обрала', воно: 'обрало', вони: 'обрали' },
    future: { я: 'оберу', ти: 'обереш', 'він/вона': 'обере', ми: 'оберемо', ви: 'оберете', вони: 'оберуть' },
    imperative: { ти: 'обери', ви: 'оберіть' },
    sentences: [
      { uk: 'Вона ___ синю сукню.', answer: 'обрала', full: 'Вона обрала синю сукню.', en: 'She chose the blue dress.', nl: 'Ze koos de blauwe jurk.', tense: 'past', pronoun: 'вона' },
      { uk: 'Ми ___ найкращий варіант.', answer: 'оберемо', full: 'Ми оберемо найкращий варіант.', en: 'We will choose the best option.', nl: 'We kiezen de beste optie.', tense: 'future', pronoun: 'ми' },
      { uk: '___ одну страву з меню!', answer: 'Обери', full: 'Обери одну страву з меню!', en: 'Choose one dish from the menu!', nl: 'Kies een gerecht uit het menu!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 12. подорожувати / з'їздити — travel
  {
    infinitive: 'подорожувати', aspect: 'imperfective', partner: "з'їздити",
    meaning: { en: 'to travel', nl: 'reizen' }, level: 'A1',
    present: { я: 'подорожую', ти: 'подорожуєш', 'він/вона': 'подорожує', ми: 'подорожуємо', ви: 'подорожуєте', вони: 'подорожують' },
    past: { він: 'подорожував', вона: 'подорожувала', воно: 'подорожувало', вони: 'подорожували' },
    future: { я: 'буду подорожувати', ти: 'будеш подорожувати', 'він/вона': 'буде подорожувати', ми: 'будемо подорожувати', ви: 'будете подорожувати', вони: 'будуть подорожувати' },
    imperative: { ти: 'подорожуй', ви: 'подорожуйте' },
    sentences: [
      { uk: 'Я люблю ___ влітку.', answer: 'подорожувати', full: 'Я люблю подорожувати влітку.', en: 'I love to travel in summer.', nl: 'Ik reis graag in de zomer.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ по Європі минулого року.', answer: 'подорожували', full: 'Вони подорожували по Європі минулого року.', en: 'They travelled around Europe last year.', nl: 'Ze reisden vorig jaar door Europa.', tense: 'past', pronoun: 'вони' },
      { uk: '___! Світ великий!', answer: 'Подорожуй', full: 'Подорожуй! Світ великий!', en: 'Travel! The world is big!', nl: 'Reis! De wereld is groot!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: "з'їздити", aspect: 'perfective', partner: 'подорожувати',
    meaning: { en: 'to make a trip (completed)', nl: 'een reis maken (voltooid)' }, level: 'A1',
    present: null,
    past: { він: "з'їздив", вона: "з'їздила", воно: "з'їздило", вони: "з'їздили" },
    future: { я: "з'їжджу", ти: "з'їздиш", 'він/вона': "з'їздить", ми: "з'їздимо", ви: "з'їздите", вони: "з'їздять" },
    imperative: { ти: "з'їзди", ви: "з'їздіть" },
    sentences: [
      { uk: 'Він ___ до Одеси на вихідні.', answer: "з'їздив", full: "Він з'їздив до Одеси на вихідні.", en: 'He made a trip to Odesa for the weekend.', nl: 'Hij maakte een reis naar Odesa voor het weekend.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ до бабусі наступного тижня.', answer: "з'їздимо", full: "Ми з'їздимо до бабусі наступного тижня.", en: 'We will visit grandma next week.', nl: 'We bezoeken oma volgende week.', tense: 'future', pronoun: 'ми' },
      { uk: '___ до Карпат, тобі сподобається!', answer: "З'їзди", full: "З'їзди до Карпат, тобі сподобається!", en: 'Take a trip to the Carpathians, you will like it!', nl: 'Maak een reis naar de Karpaten, je zult het leuk vinden!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 13. чекати / почекати — wait
  {
    infinitive: 'чекати', aspect: 'imperfective', partner: 'почекати',
    meaning: { en: 'to wait', nl: 'wachten' }, level: 'A1',
    present: { я: 'чекаю', ти: 'чекаєш', 'він/вона': 'чекає', ми: 'чекаємо', ви: 'чекаєте', вони: 'чекають' },
    past: { він: 'чекав', вона: 'чекала', воно: 'чекало', вони: 'чекали' },
    future: { я: 'буду чекати', ти: 'будеш чекати', 'він/вона': 'буде чекати', ми: 'будемо чекати', ви: 'будете чекати', вони: 'будуть чекати' },
    imperative: { ти: 'чекай', ви: 'чекайте' },
    sentences: [
      { uk: 'Я ___ на автобус кожного ранку.', answer: 'чекаю', full: 'Я чекаю на автобус кожного ранку.', en: 'I wait for the bus every morning.', nl: 'Ik wacht elke ochtend op de bus.', tense: 'present', pronoun: 'я' },
      { uk: 'Вона ___ на тебе дві години.', answer: 'чекала', full: 'Вона чекала на тебе дві години.', en: 'She was waiting for you for two hours.', nl: 'Ze wachtte twee uur op je.', tense: 'past', pronoun: 'вона' },
      { uk: '___ мене тут!', answer: 'Чекай', full: 'Чекай мене тут!', en: 'Wait for me here!', nl: 'Wacht hier op me!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'почекати', aspect: 'perfective', partner: 'чекати',
    meaning: { en: 'to wait (for a bit, completed)', nl: 'wachten (even, voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'почекав', вона: 'почекала', воно: 'почекало', вони: 'почекали' },
    future: { я: 'почекаю', ти: 'почекаєш', 'він/вона': 'почекає', ми: 'почекаємо', ви: 'почекаєте', вони: 'почекають' },
    imperative: { ти: 'почекай', ви: 'почекайте' },
    sentences: [
      { uk: 'Він ___ п\'ять хвилин і пішов.', answer: 'почекав', full: 'Він почекав п\'ять хвилин і пішов.', en: 'He waited five minutes and left.', nl: 'Hij wachtte vijf minuten en ging weg.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ тебе біля входу.', answer: 'почекаю', full: 'Я почекаю тебе біля входу.', en: 'I will wait for you at the entrance.', nl: 'Ik wacht bij de ingang op je.', tense: 'future', pronoun: 'я' },
      { uk: '___ хвилинку!', answer: 'Почекай', full: 'Почекай хвилинку!', en: 'Wait a moment!', nl: 'Wacht even!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 14. повертатися / повернутися — return
  {
    infinitive: 'повертатися', aspect: 'imperfective', partner: 'повернутися',
    meaning: { en: 'to return', nl: 'terugkeren' }, level: 'A1',
    present: { я: 'повертаюся', ти: 'повертаєшся', 'він/вона': 'повертається', ми: 'повертаємося', ви: 'повертаєтеся', вони: 'повертаються' },
    past: { він: 'повертався', вона: 'поверталася', воно: 'поверталося', вони: 'поверталися' },
    future: { я: 'буду повертатися', ти: 'будеш повертатися', 'він/вона': 'буде повертатися', ми: 'будемо повертатися', ви: 'будете повертатися', вони: 'будуть повертатися' },
    imperative: { ти: 'повертайся', ви: 'повертайтеся' },
    sentences: [
      { uk: 'Я завжди ___ додому о шостій.', answer: 'повертаюся', full: 'Я завжди повертаюся додому о шостій.', en: 'I always return home at six.', nl: 'Ik kom altijd om zes uur thuis.', tense: 'present', pronoun: 'я' },
      { uk: 'Він ___ з роботи пізно.', answer: 'повертався', full: 'Він повертався з роботи пізно.', en: 'He used to return from work late.', nl: 'Hij kwam laat thuis van het werk.', tense: 'past', pronoun: 'він' },
      { uk: '___ скоріше!', answer: 'Повертайся', full: 'Повертайся скоріше!', en: 'Come back soon!', nl: 'Kom snel terug!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'повернутися', aspect: 'perfective', partner: 'повертатися',
    meaning: { en: 'to return (completed)', nl: 'terugkeren (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'повернувся', вона: 'повернулася', воно: 'повернулося', вони: 'повернулися' },
    future: { я: 'повернуся', ти: 'повернешся', 'він/вона': 'повернеться', ми: 'повернемося', ви: 'повернетеся', вони: 'повернуться' },
    imperative: { ти: 'повернися', ви: 'поверніться' },
    sentences: [
      { uk: 'Вона ___ з відпустки вчора.', answer: 'повернулася', full: 'Вона повернулася з відпустки вчора.', en: 'She returned from vacation yesterday.', nl: 'Ze kwam gisteren terug van vakantie.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ через годину.', answer: 'повернуся', full: 'Я повернуся через годину.', en: 'I will return in an hour.', nl: 'Ik kom over een uur terug.', tense: 'future', pronoun: 'я' },
      { uk: '___ до десятої!', answer: 'Повернися', full: 'Повернися до десятої!', en: 'Come back by ten!', nl: 'Kom voor tien uur terug!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 15. навчатися / навчитися — study/learn
  {
    infinitive: 'навчатися', aspect: 'imperfective', partner: 'навчитися',
    meaning: { en: 'to study / to learn', nl: 'studeren / leren' }, level: 'A1',
    present: { я: 'навчаюся', ти: 'навчаєшся', 'він/вона': 'навчається', ми: 'навчаємося', ви: 'навчаєтеся', вони: 'навчаються' },
    past: { він: 'навчався', вона: 'навчалася', воно: 'навчалося', вони: 'навчалися' },
    future: { я: 'буду навчатися', ти: 'будеш навчатися', 'він/вона': 'буде навчатися', ми: 'будемо навчатися', ви: 'будете навчатися', вони: 'будуть навчатися' },
    imperative: { ти: 'навчайся', ви: 'навчайтеся' },
    sentences: [
      { uk: 'Я ___ в університеті.', answer: 'навчаюся', full: 'Я навчаюся в університеті.', en: 'I study at the university.', nl: 'Ik studeer aan de universiteit.', tense: 'present', pronoun: 'я' },
      { uk: 'Він ___ грати на гітарі.', answer: 'навчався', full: 'Він навчався грати на гітарі.', en: 'He was learning to play the guitar.', nl: 'Hij leerde gitaar spelen.', tense: 'past', pronoun: 'він' },
      { uk: '___ добре!', answer: 'Навчайся', full: 'Навчайся добре!', en: 'Study well!', nl: 'Studeer goed!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'навчитися', aspect: 'perfective', partner: 'навчатися',
    meaning: { en: 'to learn (completed)', nl: 'leren (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'навчився', вона: 'навчилася', воно: 'навчилося', вони: 'навчилися' },
    future: { я: 'навчуся', ти: 'навчишся', 'він/вона': 'навчиться', ми: 'навчимося', ви: 'навчитеся', вони: 'навчаться' },
    imperative: { ти: 'навчися', ви: 'навчіться' },
    sentences: [
      { uk: 'Вона ___ плавати минулого літа.', answer: 'навчилася', full: 'Вона навчилася плавати минулого літа.', en: 'She learned to swim last summer.', nl: 'Ze leerde vorige zomer zwemmen.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ водити машину.', answer: 'навчуся', full: 'Я навчуся водити машину.', en: 'I will learn to drive a car.', nl: 'Ik zal leren autorijden.', tense: 'future', pronoun: 'я' },
      { uk: '___ цього!', answer: 'Навчися', full: 'Навчися цього!', en: 'Learn this!', nl: 'Leer dit!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 16. відвідувати / відвідати — visit
  {
    infinitive: 'відвідувати', aspect: 'imperfective', partner: 'відвідати',
    meaning: { en: 'to visit', nl: 'bezoeken' }, level: 'A1',
    present: { я: 'відвідую', ти: 'відвідуєш', 'він/вона': 'відвідує', ми: 'відвідуємо', ви: 'відвідуєте', вони: 'відвідують' },
    past: { він: 'відвідував', вона: 'відвідувала', воно: 'відвідувало', вони: 'відвідували' },
    future: { я: 'буду відвідувати', ти: 'будеш відвідувати', 'він/вона': 'буде відвідувати', ми: 'будемо відвідувати', ви: 'будете відвідувати', вони: 'будуть відвідувати' },
    imperative: { ти: 'відвідуй', ви: 'відвідуйте' },
    sentences: [
      { uk: 'Ми ___ бабусю щонеділі.', answer: 'відвідуємо', full: 'Ми відвідуємо бабусю щонеділі.', en: 'We visit grandma every Sunday.', nl: 'We bezoeken oma elke zondag.', tense: 'present', pronoun: 'ми' },
      { uk: 'Вони ___ музей минулого тижня.', answer: 'відвідували', full: 'Вони відвідували музей минулого тижня.', en: 'They visited the museum last week.', nl: 'Ze bezochten vorige week het museum.', tense: 'past', pronoun: 'вони' },
      { uk: '___ нас частіше!', answer: 'Відвідуй', full: 'Відвідуй нас частіше!', en: 'Visit us more often!', nl: 'Bezoek ons vaker!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'відвідати', aspect: 'perfective', partner: 'відвідувати',
    meaning: { en: 'to visit (completed)', nl: 'bezoeken (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'відвідав', вона: 'відвідала', воно: 'відвідало', вони: 'відвідали' },
    future: { я: 'відвідаю', ти: 'відвідаєш', 'він/вона': 'відвідає', ми: 'відвідаємо', ви: 'відвідаєте', вони: 'відвідають' },
    imperative: { ти: 'відвідай', ви: 'відвідайте' },
    sentences: [
      { uk: 'Вона ___ подругу в лікарні.', answer: 'відвідала', full: 'Вона відвідала подругу в лікарні.', en: 'She visited her friend in the hospital.', nl: 'Ze bezocht haar vriendin in het ziekenhuis.', tense: 'past', pronoun: 'вона' },
      { uk: 'Ми ___ цей замок завтра.', answer: 'відвідаємо', full: 'Ми відвідаємо цей замок завтра.', en: 'We will visit this castle tomorrow.', nl: 'We bezoeken morgen dit kasteel.', tense: 'future', pronoun: 'ми' },
      { uk: '___ лікаря якнайшвидше!', answer: 'Відвідай', full: 'Відвідай лікаря якнайшвидше!', en: 'Visit the doctor as soon as possible!', nl: 'Bezoek de dokter zo snel mogelijk!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 17. пити / випити — drink
  {
    infinitive: 'пити', aspect: 'imperfective', partner: 'випити',
    meaning: { en: 'to drink', nl: 'drinken' }, level: 'A1',
    present: { я: "п'ю", ти: "п'єш", 'він/вона': "п'є", ми: "п'ємо", ви: "п'єте", вони: "п'ють" },
    past: { він: 'пив', вона: 'пила', воно: 'пило', вони: 'пили' },
    future: { я: 'буду пити', ти: 'будеш пити', 'він/вона': 'буде пити', ми: 'будемо пити', ви: 'будете пити', вони: 'будуть пити' },
    imperative: { ти: 'пий', ви: 'пийте' },
    sentences: [
      { uk: 'Я ___ каву щоранку.', answer: "п'ю", full: "Я п'ю каву щоранку.", en: 'I drink coffee every morning.', nl: 'Ik drink elke ochtend koffie.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ чай увечері.', answer: 'пили', full: 'Вони пили чай увечері.', en: 'They drank tea in the evening.', nl: 'Ze dronken thee in de avond.', tense: 'past', pronoun: 'вони' },
      { uk: '___ більше води!', answer: 'Пий', full: 'Пий більше води!', en: 'Drink more water!', nl: 'Drink meer water!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'випити', aspect: 'perfective', partner: 'пити',
    meaning: { en: 'to drink (completed)', nl: 'drinken (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'випив', вона: 'випила', воно: 'випило', вони: 'випили' },
    future: { я: "вип'ю", ти: "вип'єш", 'він/вона': "вип'є", ми: "вип'ємо", ви: "вип'єте", вони: "вип'ють" },
    imperative: { ти: 'випий', ви: 'випийте' },
    sentences: [
      { uk: 'Він ___ склянку соку.', answer: 'випив', full: 'Він випив склянку соку.', en: 'He drank a glass of juice.', nl: 'Hij dronk een glas sap.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ каву і підемо.', answer: "вип'ю", full: "Я вип'ю каву і підемо.", en: 'I will drink my coffee and we will go.', nl: 'Ik drink mijn koffie op en dan gaan we.', tense: 'future', pronoun: 'я' },
      { uk: '___ цей чай, поки гарячий!', answer: 'Випий', full: 'Випий цей чай, поки гарячий!', en: 'Drink this tea while it is hot!', nl: 'Drink deze thee zolang hij warm is!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 18. їсти / з'їсти — eat
  {
    infinitive: 'їсти', aspect: 'imperfective', partner: "з'їсти",
    meaning: { en: 'to eat', nl: 'eten' }, level: 'A1',
    present: { я: 'їм', ти: 'їси', 'він/вона': 'їсть', ми: 'їмо', ви: 'їсте', вони: 'їдять' },
    past: { він: 'їв', вона: 'їла', воно: 'їло', вони: 'їли' },
    future: { я: 'буду їсти', ти: 'будеш їсти', 'він/вона': 'буде їсти', ми: 'будемо їсти', ви: 'будете їсти', вони: 'будуть їсти' },
    imperative: { ти: 'їж', ви: 'їжте' },
    sentences: [
      { uk: 'Я ___ сніданок о восьмій.', answer: 'їм', full: 'Я їм сніданок о восьмій.', en: 'I eat breakfast at eight.', nl: 'Ik eet om acht uur ontbijt.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ піцу на вечірці.', answer: 'їли', full: 'Вони їли піцу на вечірці.', en: 'They were eating pizza at the party.', nl: 'Ze aten pizza op het feest.', tense: 'past', pronoun: 'вони' },
      { uk: '___! Їжа холоне.', answer: 'Їж', full: 'Їж! Їжа холоне.', en: 'Eat! The food is getting cold.', nl: 'Eet! Het eten wordt koud.', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: "з'їсти", aspect: 'perfective', partner: 'їсти',
    meaning: { en: 'to eat (completed)', nl: 'eten (voltooid)' }, level: 'A1',
    present: null,
    past: { він: "з'їв", вона: "з'їла", воно: "з'їло", вони: "з'їли" },
    future: { я: "з'їм", ти: "з'їси", 'він/вона': "з'їсть", ми: "з'їмо", ви: "з'їсте", вони: "з'їдять" },
    imperative: { ти: "з'їж", ви: "з'їжте" },
    sentences: [
      { uk: 'Він ___ весь торт!', answer: "з'їв", full: "Він з'їв весь торт!", en: 'He ate the whole cake!', nl: 'Hij at de hele taart op!', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ це яблуко на перерві.', answer: "з'їм", full: "Я з'їм це яблуко на перерві.", en: 'I will eat this apple during the break.', nl: 'Ik eet deze appel op tijdens de pauze.', tense: 'future', pronoun: 'я' },
      { uk: '___ суп, він дуже смачний!', answer: "З'їж", full: "З'їж суп, він дуже смачний!", en: 'Eat the soup, it is very tasty!', nl: 'Eet de soep op, die is heel lekker!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 19. починати / почати — begin
  {
    infinitive: 'починати', aspect: 'imperfective', partner: 'почати',
    meaning: { en: 'to begin', nl: 'beginnen' }, level: 'A1',
    present: { я: 'починаю', ти: 'починаєш', 'він/вона': 'починає', ми: 'починаємо', ви: 'починаєте', вони: 'починають' },
    past: { він: 'починав', вона: 'починала', воно: 'починало', вони: 'починали' },
    future: { я: 'буду починати', ти: 'будеш починати', 'він/вона': 'буде починати', ми: 'будемо починати', ви: 'будете починати', вони: 'будуть починати' },
    imperative: { ти: 'починай', ви: 'починайте' },
    sentences: [
      { uk: 'Я ___ працювати о восьмій ранку.', answer: 'починаю', full: 'Я починаю працювати о восьмій ранку.', en: 'I start working at eight in the morning.', nl: 'Ik begin om acht uur te werken.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ підготовку до свята.', answer: 'починали', full: 'Вони починали підготовку до свята.', en: 'They were starting preparations for the celebration.', nl: 'Ze begonnen met de voorbereidingen voor het feest.', tense: 'past', pronoun: 'вони' },
      { uk: '___ робити домашнє завдання!', answer: 'Починай', full: 'Починай робити домашнє завдання!', en: 'Start doing your homework!', nl: 'Begin met je huiswerk!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'почати', aspect: 'perfective', partner: 'починати',
    meaning: { en: 'to begin (completed)', nl: 'beginnen (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'почав', вона: 'почала', воно: 'почало', вони: 'почали' },
    future: { я: 'почну', ти: 'почнеш', 'він/вона': 'почне', ми: 'почнемо', ви: 'почнете', вони: 'почнуть' },
    imperative: { ти: 'почни', ви: 'почніть' },
    sentences: [
      { uk: 'Вона ___ вивчати іспанську.', answer: 'почала', full: 'Вона почала вивчати іспанську.', en: 'She started learning Spanish.', nl: 'Ze begon Spaans te leren.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ новий проєкт завтра.', answer: 'почну', full: 'Я почну новий проєкт завтра.', en: 'I will start a new project tomorrow.', nl: 'Ik begin morgen aan een nieuw project.', tense: 'future', pronoun: 'я' },
      { uk: '___ з найлегшого!', answer: 'Почни', full: 'Почни з найлегшого!', en: 'Start with the easiest!', nl: 'Begin met het makkelijkste!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 20. закінчувати / закінчити — finish
  {
    infinitive: 'закінчувати', aspect: 'imperfective', partner: 'закінчити',
    meaning: { en: 'to finish', nl: 'afronden / voltooien' }, level: 'A1',
    present: { я: 'закінчую', ти: 'закінчуєш', 'він/вона': 'закінчує', ми: 'закінчуємо', ви: 'закінчуєте', вони: 'закінчують' },
    past: { він: 'закінчував', вона: 'закінчувала', воно: 'закінчувало', вони: 'закінчували' },
    future: { я: 'буду закінчувати', ти: 'будеш закінчувати', 'він/вона': 'буде закінчувати', ми: 'будемо закінчувати', ви: 'будете закінчувати', вони: 'будуть закінчувати' },
    imperative: { ти: 'закінчуй', ви: 'закінчуйте' },
    sentences: [
      { uk: 'Я ___ роботу о п\'ятій.', answer: 'закінчую', full: 'Я закінчую роботу о п\'ятій.', en: 'I finish work at five.', nl: 'Ik eindig om vijf uur met werken.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ проєкт минулого місяця.', answer: 'закінчували', full: 'Вони закінчували проєкт минулого місяця.', en: 'They were finishing the project last month.', nl: 'Ze waren vorige maand het project aan het afronden.', tense: 'past', pronoun: 'вони' },
      { uk: '___ швидше, ми чекаємо!', answer: 'Закінчуй', full: 'Закінчуй швидше, ми чекаємо!', en: 'Finish faster, we are waiting!', nl: 'Maak sneller af, we wachten!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'закінчити', aspect: 'perfective', partner: 'закінчувати',
    meaning: { en: 'to finish (completed)', nl: 'afronden / voltooien (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'закінчив', вона: 'закінчила', воно: 'закінчило', вони: 'закінчили' },
    future: { я: 'закінчу', ти: 'закінчиш', 'він/вона': 'закінчить', ми: 'закінчимо', ви: 'закінчите', вони: 'закінчать' },
    imperative: { ти: 'закінчи', ви: 'закінчіть' },
    sentences: [
      { uk: 'Він ___ університет у 2020 році.', answer: 'закінчив', full: 'Він закінчив університет у 2020 році.', en: 'He finished university in 2020.', nl: 'Hij voltooide de universiteit in 2020.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ цю книгу до кінця тижня.', answer: 'закінчу', full: 'Я закінчу цю книгу до кінця тижня.', en: 'I will finish this book by the end of the week.', nl: 'Ik maak dit boek af voor het einde van de week.', tense: 'future', pronoun: 'я' },
      { uk: '___ це завдання перед обідом!', answer: 'Закінчи', full: 'Закінчи це завдання перед обідом!', en: 'Finish this task before lunch!', nl: 'Maak deze taak af voor de lunch!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 21. бути / побути — be
  // бути has no true perfective partner; побути ("stay a while") is the closest.
  // Its future is irregular: буду, not "буду бути".
  {
    infinitive: 'бути', aspect: 'imperfective', partner: 'побути',
    meaning: { en: 'to be (also: future auxiliary)', nl: 'zijn (ook: hulpwerkwoord toekomst)' }, level: 'A1',
    present: { я: 'є', ти: 'є', 'він/вона': 'є', ми: 'є', ви: 'є', вони: 'є' },
    past: { він: 'був', вона: 'була', воно: 'було', вони: 'були' },
    future: { я: 'буду', ти: 'будеш', 'він/вона': 'буде', ми: 'будемо', ви: 'будете', вони: 'будуть' },
    imperative: { ти: 'будь', ви: 'будьте' },
    sentences: [
      { uk: 'У мене ___ два брати.', answer: 'є', full: 'У мене є два брати.', en: 'I have two brothers.', nl: 'Ik heb twee broers.', tense: 'present', pronoun: 'вони' },
      { uk: 'Вона ___ дуже щаслива.', answer: 'була', full: 'Вона була дуже щаслива.', en: 'She was very happy.', nl: 'Ze was heel gelukkig.', tense: 'past', pronoun: 'вона' },
      { uk: '___ обережний!', answer: 'Будь', full: 'Будь обережний!', en: 'Be careful!', nl: 'Wees voorzichtig!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'побути', aspect: 'perfective', partner: 'бути',
    meaning: { en: 'to stay (for a while)', nl: 'even blijven' }, level: 'A1',
    present: null,
    past: { він: 'побув', вона: 'побула', воно: 'побуло', вони: 'побули' },
    future: { я: 'побуду', ти: 'побудеш', 'він/вона': 'побуде', ми: 'побудемо', ви: 'побудете', вони: 'побудуть' },
    imperative: { ти: 'побудь', ви: 'побудьте' },
    sentences: [
      { uk: 'Він ___ там дві години.', answer: 'побув', full: 'Він побув там дві години.', en: 'He stayed there for two hours.', nl: 'Hij bleef daar twee uur.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ у Києві три дні.', answer: 'побудемо', full: 'Ми побудемо у Києві три дні.', en: 'We will stay in Kyiv for three days.', nl: 'We blijven drie dagen in Kyiv.', tense: 'future', pronoun: 'ми' },
      { uk: '___ тут ще трохи!', answer: 'Побудь', full: 'Побудь тут ще трохи!', en: 'Stay here a little longer!', nl: 'Blijf hier nog even!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 22. ходити / походити — go/walk (regularly; multidirectional, unlike йти)
  {
    infinitive: 'ходити', aspect: 'imperfective', partner: 'походити',
    meaning: { en: 'to go / to walk (regularly)', nl: 'gaan / lopen (regelmatig)' }, level: 'A1',
    present: { я: 'ходжу', ти: 'ходиш', 'він/вона': 'ходить', ми: 'ходимо', ви: 'ходите', вони: 'ходять' },
    past: { він: 'ходив', вона: 'ходила', воно: 'ходило', вони: 'ходили' },
    future: { я: 'буду ходити', ти: 'будеш ходити', 'він/вона': 'буде ходити', ми: 'будемо ходити', ви: 'будете ходити', вони: 'будуть ходити' },
    imperative: { ти: 'ходи', ви: 'ходіть' },
    sentences: [
      { uk: 'Я ___ у спортзал двічі на тиждень.', answer: 'ходжу', full: 'Я ходжу у спортзал двічі на тиждень.', en: 'I go to the gym twice a week.', nl: 'Ik ga twee keer per week naar de sportschool.', tense: 'present', pronoun: 'я' },
      { uk: 'Вони ___ у парк кожні вихідні.', answer: 'ходили', full: 'Вони ходили у парк кожні вихідні.', en: 'They used to go to the park every weekend.', nl: 'Ze gingen elk weekend naar het park.', tense: 'past', pronoun: 'вони' },
      { uk: '___ сюди!', answer: 'Ходи', full: 'Ходи сюди!', en: 'Come here!', nl: 'Kom hier!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'походити', aspect: 'perfective', partner: 'ходити',
    meaning: { en: 'to walk around (for a while)', nl: 'even rondlopen' }, level: 'A1',
    present: null,
    past: { він: 'походив', вона: 'походила', воно: 'походило', вони: 'походили' },
    future: { я: 'походжу', ти: 'походиш', 'він/вона': 'походить', ми: 'походимо', ви: 'походите', вони: 'походять' },
    imperative: { ти: 'походи', ви: 'походіть' },
    sentences: [
      { uk: 'Він ___ по місту годину.', answer: 'походив', full: 'Він походив по місту годину.', en: 'He walked around the city for an hour.', nl: 'Hij liep een uur door de stad.', tense: 'past', pronoun: 'він' },
      { uk: 'Я ___ трохи по парку.', answer: 'походжу', full: 'Я походжу трохи по парку.', en: 'I will walk around the park a bit.', nl: 'Ik loop even door het park.', tense: 'future', pronoun: 'я' },
      { uk: '___ ще десять хвилин!', answer: 'Походи', full: 'Походи ще десять хвилин!', en: 'Walk around for ten more minutes!', nl: 'Loop nog tien minuten rond!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 23. грати / пограти — play
  {
    infinitive: 'грати', aspect: 'imperfective', partner: 'пограти',
    meaning: { en: 'to play', nl: 'spelen' }, level: 'A1',
    present: { я: 'граю', ти: 'граєш', 'він/вона': 'грає', ми: 'граємо', ви: 'граєте', вони: 'грають' },
    past: { він: 'грав', вона: 'грала', воно: 'грало', вони: 'грали' },
    future: { я: 'буду грати', ти: 'будеш грати', 'він/вона': 'буде грати', ми: 'будемо грати', ви: 'будете грати', вони: 'будуть грати' },
    imperative: { ти: 'грай', ви: 'грайте' },
    sentences: [
      { uk: 'Він ___ у футбол щосуботи.', answer: 'грає', full: 'Він грає у футбол щосуботи.', en: 'He plays football every Saturday.', nl: 'Hij speelt elke zaterdag voetbal.', tense: 'present', pronoun: 'він/вона' },
      { uk: 'Вони ___ на гітарі весь вечір.', answer: 'грали', full: 'Вони грали на гітарі весь вечір.', en: 'They were playing the guitar all evening.', nl: 'Ze speelden de hele avond gitaar.', tense: 'past', pronoun: 'вони' },
      { uk: '___ зі мною!', answer: 'Грай', full: 'Грай зі мною!', en: 'Play with me!', nl: 'Speel met mij!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'пограти', aspect: 'perfective', partner: 'грати',
    meaning: { en: 'to play (for a while)', nl: 'even spelen' }, level: 'A1',
    present: null,
    past: { він: 'пограв', вона: 'пограла', воно: 'пограло', вони: 'пограли' },
    future: { я: 'пограю', ти: 'пограєш', 'він/вона': 'пограє', ми: 'пограємо', ви: 'пограєте', вони: 'пограють' },
    imperative: { ти: 'пограй', ви: 'пограйте' },
    sentences: [
      { uk: 'Вона ___ у шахи з батьком.', answer: 'пограла', full: 'Вона пограла у шахи з батьком.', en: 'She played chess with her father.', nl: 'Ze speelde schaak met haar vader.', tense: 'past', pronoun: 'вона' },
      { uk: 'Я ___ у теніс у неділю.', answer: 'пограю', full: 'Я пограю у теніс у неділю.', en: 'I will play tennis on Sunday.', nl: 'Ik speel zondag tennis.', tense: 'future', pronoun: 'я' },
      { uk: '___ з дітьми, будь ласка!', answer: 'Пограй', full: 'Пограй з дітьми, будь ласка!', en: 'Play with the children, please!', nl: 'Speel met de kinderen, alsjeblieft!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // 24. слухати / послухати — listen
  {
    infinitive: 'слухати', aspect: 'imperfective', partner: 'послухати',
    meaning: { en: 'to listen', nl: 'luisteren' }, level: 'A1',
    present: { я: 'слухаю', ти: 'слухаєш', 'він/вона': 'слухає', ми: 'слухаємо', ви: 'слухаєте', вони: 'слухають' },
    past: { він: 'слухав', вона: 'слухала', воно: 'слухало', вони: 'слухали' },
    future: { я: 'буду слухати', ти: 'будеш слухати', 'він/вона': 'буде слухати', ми: 'будемо слухати', ви: 'будете слухати', вони: 'будуть слухати' },
    imperative: { ти: 'слухай', ви: 'слухайте' },
    sentences: [
      { uk: 'Я ___ музику щоранку.', answer: 'слухаю', full: 'Я слухаю музику щоранку.', en: 'I listen to music every morning.', nl: 'Ik luister elke ochtend naar muziek.', tense: 'present', pronoun: 'я' },
      { uk: 'Вона ___ радіо в машині.', answer: 'слухала', full: 'Вона слухала радіо в машині.', en: 'She was listening to the radio in the car.', nl: 'Ze luisterde naar de radio in de auto.', tense: 'past', pronoun: 'вона' },
      { uk: '___ уважно!', answer: 'Слухай', full: 'Слухай уважно!', en: 'Listen carefully!', nl: 'Luister goed!', tense: 'imperative', pronoun: 'ти' },
    ],
  },
  {
    infinitive: 'послухати', aspect: 'perfective', partner: 'слухати',
    meaning: { en: 'to listen (completed)', nl: 'luisteren (voltooid)' }, level: 'A1',
    present: null,
    past: { він: 'послухав', вона: 'послухала', воно: 'послухало', вони: 'послухали' },
    future: { я: 'послухаю', ти: 'послухаєш', 'він/вона': 'послухає', ми: 'послухаємо', ви: 'послухаєте', вони: 'послухають' },
    imperative: { ти: 'послухай', ви: 'послухайте' },
    sentences: [
      { uk: 'Він ___ подкаст по дорозі.', answer: 'послухав', full: 'Він послухав подкаст по дорозі.', en: 'He listened to a podcast on the way.', nl: 'Hij luisterde onderweg naar een podcast.', tense: 'past', pronoun: 'він' },
      { uk: 'Ми ___ цю пісню разом.', answer: 'послухаємо', full: 'Ми послухаємо цю пісню разом.', en: 'We will listen to this song together.', nl: 'We luisteren samen naar dit liedje.', tense: 'future', pronoun: 'ми' },
      { uk: '___ мене хвилинку!', answer: 'Послухай', full: 'Послухай мене хвилинку!', en: 'Listen to me for a minute!', nl: 'Luister even naar me!', tense: 'imperative', pronoun: 'ти' },
    ],
  },

  // ============================================================
  // A2 VERBS (pairs 25-39)
  // ============================================================

  // 25. знати / дізнатися
  { infinitive: 'знати', aspect: 'imperfective', partner: 'дізнатися', meaning: { en: 'to know', nl: 'weten / kennen' }, level: 'A2', present: { я: 'знаю', ти: 'знаєш', 'він/вона': 'знає', ми: 'знаємо', ви: 'знаєте', вони: 'знають' }, past: { він: 'знав', вона: 'знала', воно: 'знало', вони: 'знали' }, future: { я: 'буду знати', ти: 'будеш знати', 'він/вона': 'буде знати', ми: 'будемо знати', ви: 'будете знати', вони: 'будуть знати' }, imperative: { ти: 'знай', ви: 'знайте' }, sentences: [ { uk: 'Я ___ цю людину давно.', answer: 'знаю', full: 'Я знаю цю людину давно.', en: 'I have known this person for a long time.', nl: 'Ik ken deze persoon al lang.', tense: 'present', pronoun: 'я' }, { uk: 'Вони не ___ правди.', answer: 'знали', full: 'Вони не знали правди.', en: 'They did not know the truth.', nl: 'Ze wisten de waarheid niet.', tense: 'past', pronoun: 'вони' }, { uk: '___: ти не один!', answer: 'Знай', full: 'Знай: ти не один!', en: 'Know this: you are not alone!', nl: 'Weet dit: je bent niet alleen!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'дізнатися', aspect: 'perfective', partner: 'знати', meaning: { en: 'to find out', nl: 'te weten komen / ontdekken' }, level: 'A2', present: null, past: { він: 'дізнався', вона: 'дізналася', воно: 'дізналося', вони: 'дізналися' }, future: { я: 'дізнаюся', ти: 'дізнаєшся', 'він/вона': 'дізнається', ми: 'дізнаємося', ви: 'дізнаєтеся', вони: 'дізнаються' }, imperative: { ти: 'дізнайся', ви: 'дізнайтеся' }, sentences: [ { uk: 'Вона ___ про це вчора.', answer: 'дізналася', full: 'Вона дізналася про це вчора.', en: 'She found out about it yesterday.', nl: 'Ze kwam er gisteren achter.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ результати завтра.', answer: 'дізнаюся', full: 'Я дізнаюся результати завтра.', en: 'I will find out the results tomorrow.', nl: 'Ik kom morgen de resultaten te weten.', tense: 'future', pronoun: 'я' }, { uk: '___, коли відправляється потяг!', answer: 'Дізнайся', full: 'Дізнайся, коли відправляється потяг!', en: 'Find out when the train departs!', nl: 'Kom te weten wanneer de trein vertrekt!', tense: 'imperative', pronoun: 'ти' } ] },

  // 26. бачити / побачити
  { infinitive: 'бачити', aspect: 'imperfective', partner: 'побачити', meaning: { en: 'to see', nl: 'zien' }, level: 'A2', present: { я: 'бачу', ти: 'бачиш', 'він/вона': 'бачить', ми: 'бачимо', ви: 'бачите', вони: 'бачать' }, past: { він: 'бачив', вона: 'бачила', воно: 'бачило', вони: 'бачили' }, future: { я: 'буду бачити', ти: 'будеш бачити', 'він/вона': 'буде бачити', ми: 'будемо бачити', ви: 'будете бачити', вони: 'будуть бачити' }, imperative: { ти: 'бач', ви: 'бачте' }, sentences: [ { uk: 'Я ___ гарний парк з вікна.', answer: 'бачу', full: 'Я бачу гарний парк з вікна.', en: 'I see a beautiful park from the window.', nl: 'Ik zie een mooi park vanuit het raam.', tense: 'present', pronoun: 'я' }, { uk: 'Ти ___ цей фільм раніше?', answer: 'бачив', full: 'Ти бачив цей фільм раніше?', en: 'Have you seen this movie before?', nl: 'Heb je deze film eerder gezien?', tense: 'past', pronoun: 'він' }, { uk: 'Ми ___ бачити одне одного частіше.', answer: 'будемо', full: 'Ми будемо бачити одне одного частіше.', en: 'We will see each other more often.', nl: 'We zullen elkaar vaker zien.', tense: 'future', pronoun: 'ми' } ] },
  { infinitive: 'побачити', aspect: 'perfective', partner: 'бачити', meaning: { en: 'to see (completed)', nl: 'zien (voltooid)' }, level: 'A2', present: null, past: { він: 'побачив', вона: 'побачила', воно: 'побачило', вони: 'побачили' }, future: { я: 'побачу', ти: 'побачиш', 'він/вона': 'побачить', ми: 'побачимо', ви: 'побачите', вони: 'побачать' }, imperative: { ти: 'побач', ви: 'побачте' }, sentences: [ { uk: 'Він ___ її на вулиці.', answer: 'побачив', full: 'Він побачив її на вулиці.', en: 'He saw her on the street.', nl: 'Hij zag haar op straat.', tense: 'past', pronoun: 'він' }, { uk: 'Ти ___ різницю одразу.', answer: 'побачиш', full: 'Ти побачиш різницю одразу.', en: 'You will see the difference right away.', nl: 'Je zult het verschil meteen zien.', tense: 'future', pronoun: 'ти' }, { uk: 'Ми ___ один одного завтра.', answer: 'побачимо', full: 'Ми побачимо один одного завтра.', en: 'We will see each other tomorrow.', nl: 'We zien elkaar morgen.', tense: 'future', pronoun: 'ми' } ] },

  // 27. чути / почути
  { infinitive: 'чути', aspect: 'imperfective', partner: 'почути', meaning: { en: 'to hear', nl: 'horen' }, level: 'A2', present: { я: 'чую', ти: 'чуєш', 'він/вона': 'чує', ми: 'чуємо', ви: 'чуєте', вони: 'чують' }, past: { він: 'чув', вона: 'чула', воно: 'чуло', вони: 'чули' }, future: { я: 'буду чути', ти: 'будеш чути', 'він/вона': 'буде чути', ми: 'будемо чути', ви: 'будете чути', вони: 'будуть чути' }, imperative: { ти: 'чуй', ви: 'чуйте' }, sentences: [ { uk: 'Я ___ музику з сусідньої кімнати.', answer: 'чую', full: 'Я чую музику з сусідньої кімнати.', en: 'I hear music from the next room.', nl: 'Ik hoor muziek uit de kamer ernaast.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ дивний звук уночі.', answer: 'чули', full: 'Вони чули дивний звук уночі.', en: 'They heard a strange sound at night.', nl: 'Ze hoorden een vreemd geluid in de nacht.', tense: 'past', pronoun: 'вони' }, { uk: 'Ти ___ мене добре?', answer: 'чуєш', full: 'Ти чуєш мене добре?', en: 'Can you hear me well?', nl: 'Hoor je me goed?', tense: 'present', pronoun: 'ти' } ] },
  { infinitive: 'почути', aspect: 'perfective', partner: 'чути', meaning: { en: 'to hear (completed)', nl: 'horen (voltooid)' }, level: 'A2', present: null, past: { він: 'почув', вона: 'почула', воно: 'почуло', вони: 'почули' }, future: { я: 'почую', ти: 'почуєш', 'він/вона': 'почує', ми: 'почуємо', ви: 'почуєте', вони: 'почують' }, imperative: { ти: 'почуй', ви: 'почуйте' }, sentences: [ { uk: 'Вона ___ крик і побігла.', answer: 'почула', full: 'Вона почула крик і побігла.', en: 'She heard a scream and ran.', nl: 'Ze hoorde een schreeuw en rende.', tense: 'past', pronoun: 'вона' }, { uk: 'Ти ___ цю пісню і закохаєшся.', answer: 'почуєш', full: 'Ти почуєш цю пісню і закохаєшся.', en: 'You will hear this song and fall in love.', nl: 'Je zult dit lied horen en verliefd worden.', tense: 'future', pronoun: 'ти' }, { uk: '___ мене, будь ласка!', answer: 'Почуй', full: 'Почуй мене, будь ласка!', en: 'Hear me, please!', nl: 'Hoor me, alsjeblieft!', tense: 'imperative', pronoun: 'ти' } ] },

  // 28. робити / зробити
  { infinitive: 'робити', aspect: 'imperfective', partner: 'зробити', meaning: { en: 'to do / to make', nl: 'doen / maken' }, level: 'A2', present: { я: 'роблю', ти: 'робиш', 'він/вона': 'робить', ми: 'робимо', ви: 'робите', вони: 'роблять' }, past: { він: 'робив', вона: 'робила', воно: 'робило', вони: 'робили' }, future: { я: 'буду робити', ти: 'будеш робити', 'він/вона': 'буде робити', ми: 'будемо робити', ви: 'будете робити', вони: 'будуть робити' }, imperative: { ти: 'роби', ви: 'робіть' }, sentences: [ { uk: 'Що ти ___ зараз?', answer: 'робиш', full: 'Що ти робиш зараз?', en: 'What are you doing now?', nl: 'Wat doe je nu?', tense: 'present', pronoun: 'ти' }, { uk: 'Вони ___ домашнє завдання вчора.', answer: 'робили', full: 'Вони робили домашнє завдання вчора.', en: 'They were doing homework yesterday.', nl: 'Ze maakten gisteren huiswerk.', tense: 'past', pronoun: 'вони' }, { uk: '___ це правильно!', answer: 'Роби', full: 'Роби це правильно!', en: 'Do it correctly!', nl: 'Doe het goed!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'зробити', aspect: 'perfective', partner: 'робити', meaning: { en: 'to do / to make (completed)', nl: 'doen / maken (voltooid)' }, level: 'A2', present: null, past: { він: 'зробив', вона: 'зробила', воно: 'зробило', вони: 'зробили' }, future: { я: 'зроблю', ти: 'зробиш', 'він/вона': 'зробить', ми: 'зробимо', ви: 'зробите', вони: 'зроблять' }, imperative: { ти: 'зроби', ви: 'зробіть' }, sentences: [ { uk: 'Він ___ все вчасно.', answer: 'зробив', full: 'Він зробив все вчасно.', en: 'He did everything on time.', nl: 'Hij deed alles op tijd.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ це до вечора.', answer: 'зроблю', full: 'Я зроблю це до вечора.', en: 'I will do it by evening.', nl: 'Ik zal het voor de avond doen.', tense: 'future', pronoun: 'я' }, { uk: '___ мені послугу!', answer: 'Зроби', full: 'Зроби мені послугу!', en: 'Do me a favour!', nl: 'Doe me een gunst!', tense: 'imperative', pronoun: 'ти' } ] },

  // 29. думати / подумати
  { infinitive: 'думати', aspect: 'imperfective', partner: 'подумати', meaning: { en: 'to think', nl: 'denken' }, level: 'A2', present: { я: 'думаю', ти: 'думаєш', 'він/вона': 'думає', ми: 'думаємо', ви: 'думаєте', вони: 'думають' }, past: { він: 'думав', вона: 'думала', воно: 'думало', вони: 'думали' }, future: { я: 'буду думати', ти: 'будеш думати', 'він/вона': 'буде думати', ми: 'будемо думати', ви: 'будете думати', вони: 'будуть думати' }, imperative: { ти: 'думай', ви: 'думайте' }, sentences: [ { uk: 'Я ___, що це гарна ідея.', answer: 'думаю', full: 'Я думаю, що це гарна ідея.', en: 'I think it is a good idea.', nl: 'Ik denk dat het een goed idee is.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ про майбутнє.', answer: 'думав', full: 'Він думав про майбутнє.', en: 'He was thinking about the future.', nl: 'Hij dacht aan de toekomst.', tense: 'past', pronoun: 'він' }, { uk: '___ перед тим, як говорити!', answer: 'Думай', full: 'Думай перед тим, як говорити!', en: 'Think before you speak!', nl: 'Denk na voordat je spreekt!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'подумати', aspect: 'perfective', partner: 'думати', meaning: { en: 'to think (completed)', nl: 'denken (voltooid)' }, level: 'A2', present: null, past: { він: 'подумав', вона: 'подумала', воно: 'подумало', вони: 'подумали' }, future: { я: 'подумаю', ти: 'подумаєш', 'він/вона': 'подумає', ми: 'подумаємо', ви: 'подумаєте', вони: 'подумають' }, imperative: { ти: 'подумай', ви: 'подумайте' }, sentences: [ { uk: 'Вона ___ і прийняла рішення.', answer: 'подумала', full: 'Вона подумала і прийняла рішення.', en: 'She thought about it and made a decision.', nl: 'Ze dacht erover na en nam een beslissing.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ про це і скажу тобі.', answer: 'подумаю', full: 'Я подумаю про це і скажу тобі.', en: 'I will think about it and tell you.', nl: 'Ik zal erover nadenken en het je vertellen.', tense: 'future', pronoun: 'я' }, { uk: '___ добре перед відповіддю!', answer: 'Подумай', full: 'Подумай добре перед відповіддю!', en: 'Think well before answering!', nl: 'Denk goed na voor je antwoordt!', tense: 'imperative', pronoun: 'ти' } ] },

  // 30. говорити / сказати
  { infinitive: 'говорити', aspect: 'imperfective', partner: 'сказати', meaning: { en: 'to speak / to talk', nl: 'spreken / praten' }, level: 'A2', present: { я: 'говорю', ти: 'говориш', 'він/вона': 'говорить', ми: 'говоримо', ви: 'говорите', вони: 'говорять' }, past: { він: 'говорив', вона: 'говорила', воно: 'говорило', вони: 'говорили' }, future: { я: 'буду говорити', ти: 'будеш говорити', 'він/вона': 'буде говорити', ми: 'будемо говорити', ви: 'будете говорити', вони: 'будуть говорити' }, imperative: { ти: 'говори', ви: 'говоріть' }, sentences: [ { uk: 'Я ___ українською.', answer: 'говорю', full: 'Я говорю українською.', en: 'I speak Ukrainian.', nl: 'Ik spreek Oekraiens.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ про погоду.', answer: 'говорили', full: 'Вони говорили про погоду.', en: 'They were talking about the weather.', nl: 'Ze spraken over het weer.', tense: 'past', pronoun: 'вони' }, { uk: '___ голосніше, я не чую!', answer: 'Говори', full: 'Говори голосніше, я не чую!', en: 'Speak louder, I can not hear!', nl: 'Spreek luider, ik kan je niet horen!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'сказати', aspect: 'perfective', partner: 'говорити', meaning: { en: 'to say / to tell', nl: 'zeggen / vertellen' }, level: 'A2', present: null, past: { він: 'сказав', вона: 'сказала', воно: 'сказало', вони: 'сказали' }, future: { я: 'скажу', ти: 'скажеш', 'він/вона': 'скаже', ми: 'скажемо', ви: 'скажете', вони: 'скажуть' }, imperative: { ти: 'скажи', ви: 'скажіть' }, sentences: [ { uk: 'Він ___ правду.', answer: 'сказав', full: 'Він сказав правду.', en: 'He told the truth.', nl: 'Hij vertelde de waarheid.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ тобі завтра.', answer: 'скажу', full: 'Я скажу тобі завтра.', en: 'I will tell you tomorrow.', nl: 'Ik zal het je morgen vertellen.', tense: 'future', pronoun: 'я' }, { uk: '___ мені свій номер телефону!', answer: 'Скажи', full: 'Скажи мені свій номер телефону!', en: 'Tell me your phone number!', nl: 'Vertel me je telefoonnummer!', tense: 'imperative', pronoun: 'ти' } ] },

  // 31. відповідати / відповісти
  { infinitive: 'відповідати', aspect: 'imperfective', partner: 'відповісти', meaning: { en: 'to answer', nl: 'antwoorden' }, level: 'A2', present: { я: 'відповідаю', ти: 'відповідаєш', 'він/вона': 'відповідає', ми: 'відповідаємо', ви: 'відповідаєте', вони: 'відповідають' }, past: { він: 'відповідав', вона: 'відповідала', воно: 'відповідало', вони: 'відповідали' }, future: { я: 'буду відповідати', ти: 'будеш відповідати', 'він/вона': 'буде відповідати', ми: 'будемо відповідати', ви: 'будете відповідати', вони: 'будуть відповідати' }, imperative: { ти: 'відповідай', ви: 'відповідайте' }, sentences: [ { uk: 'Я завжди ___ на листи.', answer: 'відповідаю', full: 'Я завжди відповідаю на листи.', en: 'I always reply to letters.', nl: 'Ik beantwoord altijd brieven.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ на всі запитання.', answer: 'відповідав', full: 'Він відповідав на всі запитання.', en: 'He was answering all the questions.', nl: 'Hij beantwoordde alle vragen.', tense: 'past', pronoun: 'він' }, { uk: '___ чесно!', answer: 'Відповідай', full: 'Відповідай чесно!', en: 'Answer honestly!', nl: 'Antwoord eerlijk!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'відповісти', aspect: 'perfective', partner: 'відповідати', meaning: { en: 'to answer (completed)', nl: 'antwoorden (voltooid)' }, level: 'A2', present: null, past: { він: 'відповів', вона: 'відповіла', воно: 'відповіло', вони: 'відповіли' }, future: { я: 'відповім', ти: 'відповіш', 'він/вона': 'відповість', ми: 'відповімо', ви: 'відповісте', вони: 'відповідять' }, imperative: { ти: 'відповідь', ви: 'відповідьте' }, sentences: [ { uk: 'Вона ___ на моє запитання.', answer: 'відповіла', full: 'Вона відповіла на моє запитання.', en: 'She answered my question.', nl: 'Ze beantwoordde mijn vraag.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ тобі після обіду.', answer: 'відповім', full: 'Я відповім тобі після обіду.', en: 'I will answer you after lunch.', nl: 'Ik zal je na de lunch antwoorden.', tense: 'future', pronoun: 'я' }, { uk: '___ на це питання!', answer: 'Відповідь', full: 'Відповідь на це питання!', en: 'Answer this question!', nl: 'Beantwoord deze vraag!', tense: 'imperative', pronoun: 'ти' } ] },

  // 32. допомагати / допомогти
  { infinitive: 'допомагати', aspect: 'imperfective', partner: 'допомогти', meaning: { en: 'to help', nl: 'helpen' }, level: 'A2', present: { я: 'допомагаю', ти: 'допомагаєш', 'він/вона': 'допомагає', ми: 'допомагаємо', ви: 'допомагаєте', вони: 'допомагають' }, past: { він: 'допомагав', вона: 'допомагала', воно: 'допомагало', вони: 'допомагали' }, future: { я: 'буду допомагати', ти: 'будеш допомагати', 'він/вона': 'буде допомагати', ми: 'будемо допомагати', ви: 'будете допомагати', вони: 'будуть допомагати' }, imperative: { ти: 'допомагай', ви: 'допомагайте' }, sentences: [ { uk: 'Він завжди ___ друзям.', answer: 'допомагає', full: 'Він завжди допомагає друзям.', en: 'He always helps friends.', nl: 'Hij helpt altijd vrienden.', tense: 'present', pronoun: 'він/вона' }, { uk: 'Ми ___ сусідам минулого тижня.', answer: 'допомагали', full: 'Ми допомагали сусідам минулого тижня.', en: 'We were helping the neighbors last week.', nl: 'We hielpen de buren vorige week.', tense: 'past', pronoun: 'вони' }, { uk: '___ мамі на кухні!', answer: 'Допомагай', full: 'Допомагай мамі на кухні!', en: 'Help mom in the kitchen!', nl: 'Help mama in de keuken!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'допомогти', aspect: 'perfective', partner: 'допомагати', meaning: { en: 'to help (completed)', nl: 'helpen (voltooid)' }, level: 'A2', present: null, past: { він: 'допоміг', вона: 'допомогла', воно: 'допомогло', вони: 'допомогли' }, future: { я: 'допоможу', ти: 'допоможеш', 'він/вона': 'допоможе', ми: 'допоможемо', ви: 'допоможете', вони: 'допоможуть' }, imperative: { ти: 'допоможи', ви: 'допоможіть' }, sentences: [ { uk: 'Вона ___ мені з домашнім завданням.', answer: 'допомогла', full: 'Вона допомогла мені з домашнім завданням.', en: 'She helped me with homework.', nl: 'Ze hielp me met huiswerk.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ тобі завтра.', answer: 'допоможу', full: 'Я допоможу тобі завтра.', en: 'I will help you tomorrow.', nl: 'Ik zal je morgen helpen.', tense: 'future', pronoun: 'я' }, { uk: '___ мені, будь ласка!', answer: 'Допоможи', full: 'Допоможи мені, будь ласка!', en: 'Help me, please!', nl: 'Help me, alsjeblieft!', tense: 'imperative', pronoun: 'ти' } ] },

  // 33. просити / попросити
  { infinitive: 'просити', aspect: 'imperfective', partner: 'попросити', meaning: { en: 'to ask / to request', nl: 'vragen / verzoeken' }, level: 'A2', present: { я: 'прошу', ти: 'просиш', 'він/вона': 'просить', ми: 'просимо', ви: 'просите', вони: 'просять' }, past: { він: 'просив', вона: 'просила', воно: 'просило', вони: 'просили' }, future: { я: 'буду просити', ти: 'будеш просити', 'він/вона': 'буде просити', ми: 'будемо просити', ви: 'будете просити', вони: 'будуть просити' }, imperative: { ти: 'проси', ви: 'просіть' }, sentences: [ { uk: 'Я ___ тебе про допомогу.', answer: 'прошу', full: 'Я прошу тебе про допомогу.', en: 'I am asking you for help.', nl: 'Ik vraag je om hulp.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ дозволу.', answer: 'просив', full: 'Він просив дозволу.', en: 'He was asking for permission.', nl: 'Hij vroeg om toestemming.', tense: 'past', pronoun: 'він' }, { uk: 'Не ___ про це знову!', answer: 'проси', full: 'Не проси про це знову!', en: 'Do not ask about it again!', nl: 'Vraag er niet nog een keer om!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'попросити', aspect: 'perfective', partner: 'просити', meaning: { en: 'to ask / to request (completed)', nl: 'vragen / verzoeken (voltooid)' }, level: 'A2', present: null, past: { він: 'попросив', вона: 'попросила', воно: 'попросило', вони: 'попросили' }, future: { я: 'попрошу', ти: 'попросиш', 'він/вона': 'попросить', ми: 'попросимо', ви: 'попросите', вони: 'попросять' }, imperative: { ти: 'попроси', ви: 'попросіть' }, sentences: [ { uk: 'Вона ___ квитки у касира.', answer: 'попросила', full: 'Вона попросила квитки у касира.', en: 'She asked the cashier for tickets.', nl: 'Ze vroeg de kassier om kaartjes.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ його про допомогу.', answer: 'попрошу', full: 'Я попрошу його про допомогу.', en: 'I will ask him for help.', nl: 'Ik zal hem om hulp vragen.', tense: 'future', pronoun: 'я' }, { uk: '___ вчителя пояснити це!', answer: 'Попроси', full: 'Попроси вчителя пояснити це!', en: 'Ask the teacher to explain this!', nl: 'Vraag de leraar om dit uit te leggen!', tense: 'imperative', pronoun: 'ти' } ] },

  // 34. платити / заплатити
  { infinitive: 'платити', aspect: 'imperfective', partner: 'заплатити', meaning: { en: 'to pay', nl: 'betalen' }, level: 'A2', present: { я: 'плачу', ти: 'платиш', 'він/вона': 'платить', ми: 'платимо', ви: 'платите', вони: 'платять' }, past: { він: 'платив', вона: 'платила', воно: 'платило', вони: 'платили' }, future: { я: 'буду платити', ти: 'будеш платити', 'він/вона': 'буде платити', ми: 'будемо платити', ви: 'будете платити', вони: 'будуть платити' }, imperative: { ти: 'плати', ви: 'платіть' }, sentences: [ { uk: 'Я ___ за квартиру щомісяця.', answer: 'плачу', full: 'Я плачу за квартиру щомісяця.', en: 'I pay for the apartment every month.', nl: 'Ik betaal elke maand voor het appartement.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ готівкою.', answer: 'платили', full: 'Вони платили готівкою.', en: 'They paid with cash.', nl: 'Ze betaalden contant.', tense: 'past', pronoun: 'вони' }, { uk: '___ за вхід тут!', answer: 'Плати', full: 'Плати за вхід тут!', en: 'Pay for admission here!', nl: 'Betaal hier voor de toegang!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'заплатити', aspect: 'perfective', partner: 'платити', meaning: { en: 'to pay (completed)', nl: 'betalen (voltooid)' }, level: 'A2', present: null, past: { він: 'заплатив', вона: 'заплатила', воно: 'заплатило', вони: 'заплатили' }, future: { я: 'заплачу', ти: 'заплатиш', 'він/вона': 'заплатить', ми: 'заплатимо', ви: 'заплатите', вони: 'заплатять' }, imperative: { ти: 'заплати', ви: 'заплатіть' }, sentences: [ { uk: 'Він ___ за обід.', answer: 'заплатив', full: 'Він заплатив за обід.', en: 'He paid for lunch.', nl: 'Hij betaalde voor de lunch.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ карткою.', answer: 'заплачу', full: 'Я заплачу карткою.', en: 'I will pay by card.', nl: 'Ik betaal met de kaart.', tense: 'future', pronoun: 'я' }, { uk: '___ на касі!', answer: 'Заплати', full: 'Заплати на касі!', en: 'Pay at the register!', nl: 'Betaal bij de kassa!', tense: 'imperative', pronoun: 'ти' } ] },

  // 35. отримувати / отримати
  { infinitive: 'отримувати', aspect: 'imperfective', partner: 'отримати', meaning: { en: 'to receive', nl: 'ontvangen' }, level: 'A2', present: { я: 'отримую', ти: 'отримуєш', 'він/вона': 'отримує', ми: 'отримуємо', ви: 'отримуєте', вони: 'отримують' }, past: { він: 'отримував', вона: 'отримувала', воно: 'отримувало', вони: 'отримували' }, future: { я: 'буду отримувати', ти: 'будеш отримувати', 'він/вона': 'буде отримувати', ми: 'будемо отримувати', ви: 'будете отримувати', вони: 'будуть отримувати' }, imperative: { ти: 'отримуй', ви: 'отримуйте' }, sentences: [ { uk: 'Я ___ зарплату щомісяця.', answer: 'отримую', full: 'Я отримую зарплату щомісяця.', en: 'I receive my salary every month.', nl: 'Ik ontvang elke maand mijn salaris.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ листи від бабусі.', answer: 'отримували', full: 'Вони отримували листи від бабусі.', en: 'They used to receive letters from grandma.', nl: 'Ze ontvingen brieven van oma.', tense: 'past', pronoun: 'вони' }, { uk: '___ задоволення від навчання!', answer: 'Отримуй', full: 'Отримуй задоволення від навчання!', en: 'Enjoy learning!', nl: 'Geniet van het leren!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'отримати', aspect: 'perfective', partner: 'отримувати', meaning: { en: 'to receive (completed)', nl: 'ontvangen (voltooid)' }, level: 'A2', present: null, past: { він: 'отримав', вона: 'отримала', воно: 'отримало', вони: 'отримали' }, future: { я: 'отримаю', ти: 'отримаєш', 'він/вона': 'отримає', ми: 'отримаємо', ви: 'отримаєте', вони: 'отримають' }, imperative: { ти: 'отримай', ви: 'отримайте' }, sentences: [ { uk: 'Він ___ подарунок на день народження.', answer: 'отримав', full: 'Він отримав подарунок на день народження.', en: 'He received a birthday present.', nl: 'Hij ontving een verjaardagscadeau.', tense: 'past', pronoun: 'він' }, { uk: 'Ти ___ відповідь завтра.', answer: 'отримаєш', full: 'Ти отримаєш відповідь завтра.', en: 'You will receive an answer tomorrow.', nl: 'Je ontvangt morgen een antwoord.', tense: 'future', pronoun: 'ти' }, { uk: '___ дозвіл перед початком!', answer: 'Отримай', full: 'Отримай дозвіл перед початком!', en: 'Get permission before starting!', nl: 'Krijg toestemming voordat je begint!', tense: 'imperative', pronoun: 'ти' } ] },

  // 36. писати / написати
  { infinitive: 'писати', aspect: 'imperfective', partner: 'написати', meaning: { en: 'to write', nl: 'schrijven' }, level: 'A2', present: { я: 'пишу', ти: 'пишеш', 'він/вона': 'пише', ми: 'пишемо', ви: 'пишете', вони: 'пишуть' }, past: { він: 'писав', вона: 'писала', воно: 'писало', вони: 'писали' }, future: { я: 'буду писати', ти: 'будеш писати', 'він/вона': 'буде писати', ми: 'будемо писати', ви: 'будете писати', вони: 'будуть писати' }, imperative: { ти: 'пиши', ви: 'пишіть' }, sentences: [ { uk: 'Я ___ листа другу.', answer: 'пишу', full: 'Я пишу листа другу.', en: 'I am writing a letter to a friend.', nl: 'Ik schrijf een brief aan een vriend.', tense: 'present', pronoun: 'я' }, { uk: 'Вона ___ вірші в юності.', answer: 'писала', full: 'Вона писала вірші в юності.', en: 'She used to write poetry in her youth.', nl: 'Ze schreef gedichten in haar jeugd.', tense: 'past', pronoun: 'вона' }, { uk: '___ розбірливо!', answer: 'Пиши', full: 'Пиши розбірливо!', en: 'Write legibly!', nl: 'Schrijf leesbaar!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'написати', aspect: 'perfective', partner: 'писати', meaning: { en: 'to write (completed)', nl: 'schrijven (voltooid)' }, level: 'A2', present: null, past: { він: 'написав', вона: 'написала', воно: 'написало', вони: 'написали' }, future: { я: 'напишу', ти: 'напишеш', 'він/вона': 'напише', ми: 'напишемо', ви: 'напишете', вони: 'напишуть' }, imperative: { ти: 'напиши', ви: 'напишіть' }, sentences: [ { uk: 'Він ___ книгу за рік.', answer: 'написав', full: 'Він написав книгу за рік.', en: 'He wrote a book in a year.', nl: 'Hij schreef een boek in een jaar.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ тобі повідомлення.', answer: 'напишу', full: 'Я напишу тобі повідомлення.', en: 'I will write you a message.', nl: 'Ik zal je een bericht schrijven.', tense: 'future', pronoun: 'я' }, { uk: '___ мені, коли приїдеш!', answer: 'Напиши', full: 'Напиши мені, коли приїдеш!', en: 'Write to me when you arrive!', nl: 'Schrijf me als je aankomt!', tense: 'imperative', pronoun: 'ти' } ] },

  // 37. читати / прочитати
  { infinitive: 'читати', aspect: 'imperfective', partner: 'прочитати', meaning: { en: 'to read', nl: 'lezen' }, level: 'A2', present: { я: 'читаю', ти: 'читаєш', 'він/вона': 'читає', ми: 'читаємо', ви: 'читаєте', вони: 'читають' }, past: { він: 'читав', вона: 'читала', воно: 'читало', вони: 'читали' }, future: { я: 'буду читати', ти: 'будеш читати', 'він/вона': 'буде читати', ми: 'будемо читати', ви: 'будете читати', вони: 'будуть читати' }, imperative: { ти: 'читай', ви: 'читайте' }, sentences: [ { uk: 'Я ___ книгу перед сном.', answer: 'читаю', full: 'Я читаю книгу перед сном.', en: 'I read a book before bed.', nl: 'Ik lees een boek voor het slapengaan.', tense: 'present', pronoun: 'я' }, { uk: 'Діти ___ казки ввечері.', answer: 'читали', full: 'Діти читали казки ввечері.', en: 'The children were reading fairy tales in the evening.', nl: 'De kinderen lazen sprookjes in de avond.', tense: 'past', pronoun: 'вони' }, { uk: '___ більше книг!', answer: 'Читай', full: 'Читай більше книг!', en: 'Read more books!', nl: 'Lees meer boeken!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'прочитати', aspect: 'perfective', partner: 'читати', meaning: { en: 'to read (completed)', nl: 'lezen (voltooid)' }, level: 'A2', present: null, past: { він: 'прочитав', вона: 'прочитала', воно: 'прочитало', вони: 'прочитали' }, future: { я: 'прочитаю', ти: 'прочитаєш', 'він/вона': 'прочитає', ми: 'прочитаємо', ви: 'прочитаєте', вони: 'прочитають' }, imperative: { ти: 'прочитай', ви: 'прочитайте' }, sentences: [ { uk: 'Вона ___ цю книгу за три дні.', answer: 'прочитала', full: 'Вона прочитала цю книгу за три дні.', en: 'She read this book in three days.', nl: 'Ze las dit boek in drie dagen.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ цю статтю до вечора.', answer: 'прочитаю', full: 'Я прочитаю цю статтю до вечора.', en: 'I will read this article by evening.', nl: 'Ik lees dit artikel voor de avond.', tense: 'future', pronoun: 'я' }, { uk: '___ цей параграф уважно!', answer: 'Прочитай', full: 'Прочитай цей параграф уважно!', en: 'Read this paragraph carefully!', nl: 'Lees deze paragraaf aandachtig!', tense: 'imperative', pronoun: 'ти' } ] },

  // 38. вчити / вивчити
  { infinitive: 'вчити', aspect: 'imperfective', partner: 'вивчити', meaning: { en: 'to learn / to study', nl: 'leren / studeren' }, level: 'A2', present: { я: 'вчу', ти: 'вчиш', 'він/вона': 'вчить', ми: 'вчимо', ви: 'вчите', вони: 'вчать' }, past: { він: 'вчив', вона: 'вчила', воно: 'вчило', вони: 'вчили' }, future: { я: 'буду вчити', ти: 'будеш вчити', 'він/вона': 'буде вчити', ми: 'будемо вчити', ви: 'будете вчити', вони: 'будуть вчити' }, imperative: { ти: 'вчи', ви: 'вчіть' }, sentences: [ { uk: 'Я ___ українську мову.', answer: 'вчу', full: 'Я вчу українську мову.', en: 'I am studying the Ukrainian language.', nl: 'Ik leer de Oekraiense taal.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ нові слова щодня.', answer: 'вчили', full: 'Вони вчили нові слова щодня.', en: 'They were learning new words every day.', nl: 'Ze leerden elke dag nieuwe woorden.', tense: 'past', pronoun: 'вони' }, { uk: '___ граматику ретельно!', answer: 'Вчи', full: 'Вчи граматику ретельно!', en: 'Study grammar thoroughly!', nl: 'Leer de grammatica grondig!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'вивчити', aspect: 'perfective', partner: 'вчити', meaning: { en: 'to learn / to study (completed)', nl: 'leren / studeren (voltooid)' }, level: 'A2', present: null, past: { він: 'вивчив', вона: 'вивчила', воно: 'вивчило', вони: 'вивчили' }, future: { я: 'вивчу', ти: 'вивчиш', 'він/вона': 'вивчить', ми: 'вивчимо', ви: 'вивчите', вони: 'вивчать' }, imperative: { ти: 'вивчи', ви: 'вивчіть' }, sentences: [ { uk: 'Він ___ три мови.', answer: 'вивчив', full: 'Він вивчив три мови.', en: 'He learned three languages.', nl: 'Hij leerde drie talen.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ цю тему до іспиту.', answer: 'вивчу', full: 'Я вивчу цю тему до іспиту.', en: 'I will learn this topic before the exam.', nl: 'Ik zal dit onderwerp leren voor het examen.', tense: 'future', pronoun: 'я' }, { uk: '___ цей вірш напам\'ять!', answer: 'Вивчи', full: 'Вивчи цей вірш напам\'ять!', en: 'Learn this poem by heart!', nl: 'Leer dit gedicht uit je hoofd!', tense: 'imperative', pronoun: 'ти' } ] },

  // 39. розуміти / зрозуміти
  { infinitive: 'розуміти', aspect: 'imperfective', partner: 'зрозуміти', meaning: { en: 'to understand', nl: 'begrijpen' }, level: 'A2', present: { я: 'розумію', ти: 'розумієш', 'він/вона': 'розуміє', ми: 'розуміємо', ви: 'розумієте', вони: 'розуміють' }, past: { він: 'розумів', вона: 'розуміла', воно: 'розуміло', вони: 'розуміли' }, future: { я: 'буду розуміти', ти: 'будеш розуміти', 'він/вона': 'буде розуміти', ми: 'будемо розуміти', ви: 'будете розуміти', вони: 'будуть розуміти' }, imperative: { ти: 'розумій', ви: 'розумійте' }, sentences: [ { uk: 'Я ___ тебе добре.', answer: 'розумію', full: 'Я розумію тебе добре.', en: 'I understand you well.', nl: 'Ik begrijp je goed.', tense: 'present', pronoun: 'я' }, { uk: 'Вони не ___ його жартів.', answer: 'розуміли', full: 'Вони не розуміли його жартів.', en: 'They did not understand his jokes.', nl: 'Ze begrepen zijn grappen niet.', tense: 'past', pronoun: 'вони' }, { uk: 'Ти ___ розуміти це з часом.', answer: 'будеш', full: 'Ти будеш розуміти це з часом.', en: 'You will understand this with time.', nl: 'Je zult dit met de tijd begrijpen.', tense: 'future', pronoun: 'ти' } ] },
  { infinitive: 'зрозуміти', aspect: 'perfective', partner: 'розуміти', meaning: { en: 'to understand (completed)', nl: 'begrijpen (voltooid)' }, level: 'A2', present: null, past: { він: 'зрозумів', вона: 'зрозуміла', воно: 'зрозуміло', вони: 'зрозуміли' }, future: { я: 'зрозумію', ти: 'зрозумієш', 'він/вона': 'зрозуміє', ми: 'зрозуміємо', ви: 'зрозумієте', вони: 'зрозуміють' }, imperative: { ти: 'зрозумій', ви: 'зрозумійте' }, sentences: [ { uk: 'Вона нарешті ___ задачу.', answer: 'зрозуміла', full: 'Вона нарешті зрозуміла задачу.', en: 'She finally understood the problem.', nl: 'Ze begreep eindelijk het probleem.', tense: 'past', pronoun: 'вона' }, { uk: 'Ти ___ це, коли виростеш.', answer: 'зрозумієш', full: 'Ти зрозумієш це, коли виростеш.', en: 'You will understand this when you grow up.', nl: 'Je zult dit begrijpen als je opgroeit.', tense: 'future', pronoun: 'ти' }, { uk: '___ мене правильно!', answer: 'Зрозумій', full: 'Зрозумій мене правильно!', en: 'Understand me correctly!', nl: 'Begrijp me goed!', tense: 'imperative', pronoun: 'ти' } ] },

  // ============================================================
  // B1 VERBS (pairs 40-54)
  // ============================================================

  // 40. пояснювати / пояснити
  { infinitive: 'пояснювати', aspect: 'imperfective', partner: 'пояснити', meaning: { en: 'to explain', nl: 'uitleggen' }, level: 'B1', present: { я: 'пояснюю', ти: 'пояснюєш', 'він/вона': 'пояснює', ми: 'пояснюємо', ви: 'пояснюєте', вони: 'пояснюють' }, past: { він: 'пояснював', вона: 'пояснювала', воно: 'пояснювало', вони: 'пояснювали' }, future: { я: 'буду пояснювати', ти: 'будеш пояснювати', 'він/вона': 'буде пояснювати', ми: 'будемо пояснювати', ви: 'будете пояснювати', вони: 'будуть пояснювати' }, imperative: { ти: 'пояснюй', ви: 'пояснюйте' }, sentences: [ { uk: 'Вчитель ___ нову тему.', answer: 'пояснює', full: 'Вчитель пояснює нову тему.', en: 'The teacher is explaining a new topic.', nl: 'De leraar legt een nieuw onderwerp uit.', tense: 'present', pronoun: 'він/вона' }, { uk: 'Він ___ правила гри дітям.', answer: 'пояснював', full: 'Він пояснював правила гри дітям.', en: 'He was explaining the game rules to the children.', nl: 'Hij legde de spelregels aan de kinderen uit.', tense: 'past', pronoun: 'він' }, { uk: '___ простіше, будь ласка!', answer: 'Пояснюй', full: 'Пояснюй простіше, будь ласка!', en: 'Explain more simply, please!', nl: 'Leg het eenvoudiger uit, alsjeblieft!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'пояснити', aspect: 'perfective', partner: 'пояснювати', meaning: { en: 'to explain (completed)', nl: 'uitleggen (voltooid)' }, level: 'B1', present: null, past: { він: 'пояснив', вона: 'пояснила', воно: 'пояснило', вони: 'пояснили' }, future: { я: 'поясню', ти: 'поясниш', 'він/вона': 'пояснить', ми: 'пояснимо', ви: 'поясните', вони: 'пояснять' }, imperative: { ти: 'поясни', ви: 'поясніть' }, sentences: [ { uk: 'Вона ___ мені ситуацію.', answer: 'пояснила', full: 'Вона пояснила мені ситуацію.', en: 'She explained the situation to me.', nl: 'Ze legde me de situatie uit.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ це пізніше.', answer: 'поясню', full: 'Я поясню це пізніше.', en: 'I will explain this later.', nl: 'Ik zal dit later uitleggen.', tense: 'future', pronoun: 'я' }, { uk: '___ мені, як це працює!', answer: 'Поясни', full: 'Поясни мені, як це працює!', en: 'Explain to me how this works!', nl: 'Leg me uit hoe dit werkt!', tense: 'imperative', pronoun: 'ти' } ] },

  // 41. розповідати / розповісти
  { infinitive: 'розповідати', aspect: 'imperfective', partner: 'розповісти', meaning: { en: 'to tell / to narrate', nl: 'vertellen' }, level: 'B1', present: { я: 'розповідаю', ти: 'розповідаєш', 'він/вона': 'розповідає', ми: 'розповідаємо', ви: 'розповідаєте', вони: 'розповідають' }, past: { він: 'розповідав', вона: 'розповідала', воно: 'розповідало', вони: 'розповідали' }, future: { я: 'буду розповідати', ти: 'будеш розповідати', 'він/вона': 'буде розповідати', ми: 'будемо розповідати', ви: 'будете розповідати', вони: 'будуть розповідати' }, imperative: { ти: 'розповідай', ви: 'розповідайте' }, sentences: [ { uk: 'Бабуся ___ казки дітям.', answer: 'розповідає', full: 'Бабуся розповідає казки дітям.', en: 'Grandma tells fairy tales to the children.', nl: 'Oma vertelt sprookjes aan de kinderen.', tense: 'present', pronoun: 'він/вона' }, { uk: 'Він ___ про свою подорож.', answer: 'розповідав', full: 'Він розповідав про свою подорож.', en: 'He was telling about his trip.', nl: 'Hij vertelde over zijn reis.', tense: 'past', pronoun: 'він' }, { uk: '___! Мені цікаво!', answer: 'Розповідай', full: 'Розповідай! Мені цікаво!', en: 'Tell me! I am interested!', nl: 'Vertel! Ik ben benieuwd!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'розповісти', aspect: 'perfective', partner: 'розповідати', meaning: { en: 'to tell / to narrate (completed)', nl: 'vertellen (voltooid)' }, level: 'B1', present: null, past: { він: 'розповів', вона: 'розповіла', воно: 'розповіло', вони: 'розповіли' }, future: { я: 'розповім', ти: 'розповіш', 'він/вона': 'розповість', ми: 'розповімо', ви: 'розповісте', вони: 'розповідять' }, imperative: { ти: 'розкажи', ви: 'розкажіть' }, sentences: [ { uk: 'Вона ___ нам цікаву історію.', answer: 'розповіла', full: 'Вона розповіла нам цікаву історію.', en: 'She told us an interesting story.', nl: 'Ze vertelde ons een interessant verhaal.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ тобі все завтра.', answer: 'розповім', full: 'Я розповім тобі все завтра.', en: 'I will tell you everything tomorrow.', nl: 'Ik vertel je morgen alles.', tense: 'future', pronoun: 'я' }, { uk: '___ мені про свій день!', answer: 'Розкажи', full: 'Розкажи мені про свій день!', en: 'Tell me about your day!', nl: 'Vertel me over je dag!', tense: 'imperative', pronoun: 'ти' } ] },

  // 42. перекладати / перекласти
  { infinitive: 'перекладати', aspect: 'imperfective', partner: 'перекласти', meaning: { en: 'to translate', nl: 'vertalen' }, level: 'B1', present: { я: 'перекладаю', ти: 'перекладаєш', 'він/вона': 'перекладає', ми: 'перекладаємо', ви: 'перекладаєте', вони: 'перекладають' }, past: { він: 'перекладав', вона: 'перекладала', воно: 'перекладало', вони: 'перекладали' }, future: { я: 'буду перекладати', ти: 'будеш перекладати', 'він/вона': 'буде перекладати', ми: 'будемо перекладати', ви: 'будете перекладати', вони: 'будуть перекладати' }, imperative: { ти: 'перекладай', ви: 'перекладайте' }, sentences: [ { uk: 'Я ___ тексти з англійської.', answer: 'перекладаю', full: 'Я перекладаю тексти з англійської.', en: 'I translate texts from English.', nl: 'Ik vertaal teksten uit het Engels.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ документи цілий день.', answer: 'перекладали', full: 'Вони перекладали документи цілий день.', en: 'They were translating documents all day.', nl: 'Ze vertaalden de hele dag documenten.', tense: 'past', pronoun: 'вони' }, { uk: '___ це слово за словом!', answer: 'Перекладай', full: 'Перекладай це слово за словом!', en: 'Translate it word by word!', nl: 'Vertaal het woord voor woord!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'перекласти', aspect: 'perfective', partner: 'перекладати', meaning: { en: 'to translate (completed)', nl: 'vertalen (voltooid)' }, level: 'B1', present: null, past: { він: 'переклав', вона: 'переклала', воно: 'переклало', вони: 'переклали' }, future: { я: 'перекладу', ти: 'перекладеш', 'він/вона': 'перекладе', ми: 'перекладемо', ви: 'перекладете', вони: 'перекладуть' }, imperative: { ти: 'переклади', ви: 'перекладіть' }, sentences: [ { uk: 'Він ___ цю статтю минулого тижня.', answer: 'переклав', full: 'Він переклав цю статтю минулого тижня.', en: 'He translated this article last week.', nl: 'Hij vertaalde dit artikel vorige week.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ це речення для тебе.', answer: 'перекладу', full: 'Я перекладу це речення для тебе.', en: 'I will translate this sentence for you.', nl: 'Ik zal deze zin voor je vertalen.', tense: 'future', pronoun: 'я' }, { uk: '___ це на українську!', answer: 'Переклади', full: 'Переклади це на українську!', en: 'Translate this into Ukrainian!', nl: 'Vertaal dit naar het Oekraiens!', tense: 'imperative', pronoun: 'ти' } ] },

  // 43. вирішувати / вирішити
  { infinitive: 'вирішувати', aspect: 'imperfective', partner: 'вирішити', meaning: { en: 'to decide / to solve', nl: 'beslissen / oplossen' }, level: 'B1', present: { я: 'вирішую', ти: 'вирішуєш', 'він/вона': 'вирішує', ми: 'вирішуємо', ви: 'вирішуєте', вони: 'вирішують' }, past: { він: 'вирішував', вона: 'вирішувала', воно: 'вирішувало', вони: 'вирішували' }, future: { я: 'буду вирішувати', ти: 'будеш вирішувати', 'він/вона': 'буде вирішувати', ми: 'будемо вирішувати', ви: 'будете вирішувати', вони: 'будуть вирішувати' }, imperative: { ти: 'вирішуй', ви: 'вирішуйте' }, sentences: [ { uk: 'Ми ___ цю проблему зараз.', answer: 'вирішуємо', full: 'Ми вирішуємо цю проблему зараз.', en: 'We are solving this problem now.', nl: 'We lossen dit probleem nu op.', tense: 'present', pronoun: 'ми' }, { uk: 'Він ___ задачі з математики.', answer: 'вирішував', full: 'Він вирішував задачі з математики.', en: 'He was solving math problems.', nl: 'Hij loste wiskundeopgaven op.', tense: 'past', pronoun: 'він' }, { uk: '___ швидше, часу мало!', answer: 'Вирішуй', full: 'Вирішуй швидше, часу мало!', en: 'Decide faster, time is short!', nl: 'Beslis sneller, de tijd is kort!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'вирішити', aspect: 'perfective', partner: 'вирішувати', meaning: { en: 'to decide / to solve (completed)', nl: 'beslissen / oplossen (voltooid)' }, level: 'B1', present: null, past: { він: 'вирішив', вона: 'вирішила', воно: 'вирішило', вони: 'вирішили' }, future: { я: 'вирішу', ти: 'вирішиш', 'він/вона': 'вирішить', ми: 'вирішимо', ви: 'вирішите', вони: 'вирішать' }, imperative: { ти: 'виріши', ви: 'вирішіть' }, sentences: [ { uk: 'Вона ___ переїхати в інше місто.', answer: 'вирішила', full: 'Вона вирішила переїхати в інше місто.', en: 'She decided to move to another city.', nl: 'Ze besloot naar een andere stad te verhuizen.', tense: 'past', pronoun: 'вона' }, { uk: 'Ми ___ це до кінця дня.', answer: 'вирішимо', full: 'Ми вирішимо це до кінця дня.', en: 'We will solve this by the end of the day.', nl: 'We lossen dit op voor het einde van de dag.', tense: 'future', pronoun: 'ми' }, { uk: '___ сам, що тобі важливо!', answer: 'Виріши', full: 'Виріши сам, що тобі важливо!', en: 'Decide for yourself what is important to you!', nl: 'Beslis zelf wat voor jou belangrijk is!', tense: 'imperative', pronoun: 'ти' } ] },

  // 44. змінювати / змінити
  { infinitive: 'змінювати', aspect: 'imperfective', partner: 'змінити', meaning: { en: 'to change', nl: 'veranderen' }, level: 'B1', present: { я: 'змінюю', ти: 'змінюєш', 'він/вона': 'змінює', ми: 'змінюємо', ви: 'змінюєте', вони: 'змінюють' }, past: { він: 'змінював', вона: 'змінювала', воно: 'змінювало', вони: 'змінювали' }, future: { я: 'буду змінювати', ти: 'будеш змінювати', 'він/вона': 'буде змінювати', ми: 'будемо змінювати', ви: 'будете змінювати', вони: 'будуть змінювати' }, imperative: { ти: 'змінюй', ви: 'змінюйте' }, sentences: [ { uk: 'Він часто ___ свою думку.', answer: 'змінює', full: 'Він часто змінює свою думку.', en: 'He often changes his mind.', nl: 'Hij verandert vaak van gedachten.', tense: 'present', pronoun: 'він/вона' }, { uk: 'Вони ___ правила щороку.', answer: 'змінювали', full: 'Вони змінювали правила щороку.', en: 'They changed the rules every year.', nl: 'Ze veranderden elk jaar de regels.', tense: 'past', pronoun: 'вони' }, { uk: '___ підхід, якщо не працює!', answer: 'Змінюй', full: 'Змінюй підхід, якщо не працює!', en: 'Change the approach if it does not work!', nl: 'Verander de aanpak als het niet werkt!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'змінити', aspect: 'perfective', partner: 'змінювати', meaning: { en: 'to change (completed)', nl: 'veranderen (voltooid)' }, level: 'B1', present: null, past: { він: 'змінив', вона: 'змінила', воно: 'змінило', вони: 'змінили' }, future: { я: 'зміню', ти: 'зміниш', 'він/вона': 'змінить', ми: 'змінимо', ви: 'зміните', вони: 'змінять' }, imperative: { ти: 'зміни', ви: 'змініть' }, sentences: [ { uk: 'Вона ___ зачіску.', answer: 'змінила', full: 'Вона змінила зачіску.', en: 'She changed her hairstyle.', nl: 'Ze veranderde haar kapsel.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ пароль завтра.', answer: 'зміню', full: 'Я зміню пароль завтра.', en: 'I will change the password tomorrow.', nl: 'Ik verander morgen het wachtwoord.', tense: 'future', pronoun: 'я' }, { uk: '___ своє ставлення!', answer: 'Зміни', full: 'Зміни своє ставлення!', en: 'Change your attitude!', nl: 'Verander je houding!', tense: 'imperative', pronoun: 'ти' } ] },

  // 45. порівнювати / порівняти
  { infinitive: 'порівнювати', aspect: 'imperfective', partner: 'порівняти', meaning: { en: 'to compare', nl: 'vergelijken' }, level: 'B1', present: { я: 'порівнюю', ти: 'порівнюєш', 'він/вона': 'порівнює', ми: 'порівнюємо', ви: 'порівнюєте', вони: 'порівнюють' }, past: { він: 'порівнював', вона: 'порівнювала', воно: 'порівнювало', вони: 'порівнювали' }, future: { я: 'буду порівнювати', ти: 'будеш порівнювати', 'він/вона': 'буде порівнювати', ми: 'будемо порівнювати', ви: 'будете порівнювати', вони: 'будуть порівнювати' }, imperative: { ти: 'порівнюй', ви: 'порівнюйте' }, sentences: [ { uk: 'Я завжди ___ ціни в різних магазинах.', answer: 'порівнюю', full: 'Я завжди порівнюю ціни в різних магазинах.', en: 'I always compare prices in different shops.', nl: 'Ik vergelijk altijd prijzen in verschillende winkels.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ результати тестів.', answer: 'порівнювали', full: 'Вони порівнювали результати тестів.', en: 'They were comparing test results.', nl: 'Ze vergeleken de testresultaten.', tense: 'past', pronoun: 'вони' }, { uk: 'Не ___ себе з іншими!', answer: 'порівнюй', full: 'Не порівнюй себе з іншими!', en: 'Do not compare yourself to others!', nl: 'Vergelijk jezelf niet met anderen!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'порівняти', aspect: 'perfective', partner: 'порівнювати', meaning: { en: 'to compare (completed)', nl: 'vergelijken (voltooid)' }, level: 'B1', present: null, past: { він: 'порівняв', вона: 'порівняла', воно: 'порівняло', вони: 'порівняли' }, future: { я: 'порівняю', ти: 'порівняєш', 'він/вона': 'порівняє', ми: 'порівняємо', ви: 'порівняєте', вони: 'порівняють' }, imperative: { ти: 'порівняй', ви: 'порівняйте' }, sentences: [ { uk: 'Він ___ два варіанти і обрав кращий.', answer: 'порівняв', full: 'Він порівняв два варіанти і обрав кращий.', en: 'He compared two options and chose the better one.', nl: 'Hij vergeleek twee opties en koos de betere.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ ці документи завтра.', answer: 'порівняю', full: 'Я порівняю ці документи завтра.', en: 'I will compare these documents tomorrow.', nl: 'Ik zal morgen deze documenten vergelijken.', tense: 'future', pronoun: 'я' }, { uk: '___ ці два тексти!', answer: 'Порівняй', full: 'Порівняй ці два тексти!', en: 'Compare these two texts!', nl: 'Vergelijk deze twee teksten!', tense: 'imperative', pronoun: 'ти' } ] },

  // 46. пропонувати / запропонувати
  { infinitive: 'пропонувати', aspect: 'imperfective', partner: 'запропонувати', meaning: { en: 'to suggest / to offer', nl: 'voorstellen / aanbieden' }, level: 'B1', present: { я: 'пропоную', ти: 'пропонуєш', 'він/вона': 'пропонує', ми: 'пропонуємо', ви: 'пропонуєте', вони: 'пропонують' }, past: { він: 'пропонував', вона: 'пропонувала', воно: 'пропонувало', вони: 'пропонували' }, future: { я: 'буду пропонувати', ти: 'будеш пропонувати', 'він/вона': 'буде пропонувати', ми: 'будемо пропонувати', ви: 'будете пропонувати', вони: 'будуть пропонувати' }, imperative: { ти: 'пропонуй', ви: 'пропонуйте' }, sentences: [ { uk: 'Я ___ піти в кіно.', answer: 'пропоную', full: 'Я пропоную піти в кіно.', en: 'I suggest going to the cinema.', nl: 'Ik stel voor om naar de bioscoop te gaan.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ різні варіанти.', answer: 'пропонував', full: 'Він пропонував різні варіанти.', en: 'He was suggesting various options.', nl: 'Hij stelde verschillende opties voor.', tense: 'past', pronoun: 'він' }, { uk: '___ свої ідеї сміливо!', answer: 'Пропонуй', full: 'Пропонуй свої ідеї сміливо!', en: 'Suggest your ideas boldly!', nl: 'Stel je ideeën moedig voor!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'запропонувати', aspect: 'perfective', partner: 'пропонувати', meaning: { en: 'to suggest / to offer (completed)', nl: 'voorstellen / aanbieden (voltooid)' }, level: 'B1', present: null, past: { він: 'запропонував', вона: 'запропонувала', воно: 'запропонувало', вони: 'запропонували' }, future: { я: 'запропоную', ти: 'запропонуєш', 'він/вона': 'запропонує', ми: 'запропонуємо', ви: 'запропонуєте', вони: 'запропонують' }, imperative: { ти: 'запропонуй', ви: 'запропонуйте' }, sentences: [ { uk: 'Вона ___ новий план.', answer: 'запропонувала', full: 'Вона запропонувала новий план.', en: 'She proposed a new plan.', nl: 'Ze stelde een nieuw plan voor.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ кращий варіант.', answer: 'запропоную', full: 'Я запропоную кращий варіант.', en: 'I will suggest a better option.', nl: 'Ik zal een betere optie voorstellen.', tense: 'future', pronoun: 'я' }, { uk: '___ щось цікаве на вечір!', answer: 'Запропонуй', full: 'Запропонуй щось цікаве на вечір!', en: 'Suggest something interesting for the evening!', nl: 'Stel iets interessants voor de avond voor!', tense: 'imperative', pronoun: 'ти' } ] },

  // 47. намагатися / спробувати
  { infinitive: 'намагатися', aspect: 'imperfective', partner: 'спробувати', meaning: { en: 'to try / to attempt', nl: 'proberen' }, level: 'B1', present: { я: 'намагаюся', ти: 'намагаєшся', 'він/вона': 'намагається', ми: 'намагаємося', ви: 'намагаєтеся', вони: 'намагаються' }, past: { він: 'намагався', вона: 'намагалася', воно: 'намагалося', вони: 'намагалися' }, future: { я: 'буду намагатися', ти: 'будеш намагатися', 'він/вона': 'буде намагатися', ми: 'будемо намагатися', ви: 'будете намагатися', вони: 'будуть намагатися' }, imperative: { ти: 'намагайся', ви: 'намагайтеся' }, sentences: [ { uk: 'Я ___ зрозуміти цю задачу.', answer: 'намагаюся', full: 'Я намагаюся зрозуміти цю задачу.', en: 'I am trying to understand this problem.', nl: 'Ik probeer dit probleem te begrijpen.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ відкрити двері.', answer: 'намагався', full: 'Він намагався відкрити двері.', en: 'He was trying to open the door.', nl: 'Hij probeerde de deur te openen.', tense: 'past', pronoun: 'він' }, { uk: '___ більше!', answer: 'Намагайся', full: 'Намагайся більше!', en: 'Try harder!', nl: 'Probeer harder!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'спробувати', aspect: 'perfective', partner: 'намагатися', meaning: { en: 'to try (completed)', nl: 'proberen (voltooid)' }, level: 'B1', present: null, past: { він: 'спробував', вона: 'спробувала', воно: 'спробувало', вони: 'спробували' }, future: { я: 'спробую', ти: 'спробуєш', 'він/вона': 'спробує', ми: 'спробуємо', ви: 'спробуєте', вони: 'спробують' }, imperative: { ти: 'спробуй', ви: 'спробуйте' }, sentences: [ { uk: 'Вона ___ нову страву.', answer: 'спробувала', full: 'Вона спробувала нову страву.', en: 'She tried a new dish.', nl: 'Ze probeerde een nieuw gerecht.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ зробити це інакше.', answer: 'спробую', full: 'Я спробую зробити це інакше.', en: 'I will try to do it differently.', nl: 'Ik zal proberen het anders te doen.', tense: 'future', pronoun: 'я' }, { uk: '___ цей торт!', answer: 'Спробуй', full: 'Спробуй цей торт!', en: 'Try this cake!', nl: 'Probeer deze taart!', tense: 'imperative', pronoun: 'ти' } ] },

  // 48. забувати / забути
  { infinitive: 'забувати', aspect: 'imperfective', partner: 'забути', meaning: { en: 'to forget', nl: 'vergeten' }, level: 'B1', present: { я: 'забуваю', ти: 'забуваєш', 'він/вона': 'забуває', ми: 'забуваємо', ви: 'забуваєте', вони: 'забувають' }, past: { він: 'забував', вона: 'забувала', воно: 'забувало', вони: 'забували' }, future: { я: 'буду забувати', ти: 'будеш забувати', 'він/вона': 'буде забувати', ми: 'будемо забувати', ви: 'будете забувати', вони: 'будуть забувати' }, imperative: { ти: 'забувай', ви: 'забувайте' }, sentences: [ { uk: 'Я часто ___ ключі вдома.', answer: 'забуваю', full: 'Я часто забуваю ключі вдома.', en: 'I often forget my keys at home.', nl: 'Ik vergeet mijn sleutels vaak thuis.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ про зустрічі.', answer: 'забував', full: 'Він забував про зустрічі.', en: 'He used to forget about meetings.', nl: 'Hij vergat afspraken.', tense: 'past', pronoun: 'він' }, { uk: 'Не ___ про нас!', answer: 'забувай', full: 'Не забувай про нас!', en: 'Do not forget about us!', nl: 'Vergeet ons niet!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'забути', aspect: 'perfective', partner: 'забувати', meaning: { en: 'to forget (completed)', nl: 'vergeten (voltooid)' }, level: 'B1', present: null, past: { він: 'забув', вона: 'забула', воно: 'забуло', вони: 'забули' }, future: { я: 'забуду', ти: 'забудеш', 'він/вона': 'забуде', ми: 'забудемо', ви: 'забудете', вони: 'забудуть' }, imperative: { ти: 'забудь', ви: 'забудьте' }, sentences: [ { uk: 'Вона ___ парасольку в кафе.', answer: 'забула', full: 'Вона забула парасольку в кафе.', en: 'She forgot her umbrella at the cafe.', nl: 'Ze vergat haar paraplu in het cafe.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ніколи не ___ цей день.', answer: 'забуду', full: 'Я ніколи не забуду цей день.', en: 'I will never forget this day.', nl: 'Ik zal deze dag nooit vergeten.', tense: 'future', pronoun: 'я' }, { uk: '___ про це!', answer: 'Забудь', full: 'Забудь про це!', en: 'Forget about it!', nl: 'Vergeet het!', tense: 'imperative', pronoun: 'ти' } ] },

  // 49. згадувати / згадати
  { infinitive: 'згадувати', aspect: 'imperfective', partner: 'згадати', meaning: { en: 'to remember / to recall', nl: 'herinneren / zich herinneren' }, level: 'B1', present: { я: 'згадую', ти: 'згадуєш', 'він/вона': 'згадує', ми: 'згадуємо', ви: 'згадуєте', вони: 'згадують' }, past: { він: 'згадував', вона: 'згадувала', воно: 'згадувало', вони: 'згадували' }, future: { я: 'буду згадувати', ти: 'будеш згадувати', 'він/вона': 'буде згадувати', ми: 'будемо згадувати', ви: 'будете згадувати', вони: 'будуть згадувати' }, imperative: { ти: 'згадуй', ви: 'згадуйте' }, sentences: [ { uk: 'Я часто ___ дитинство.', answer: 'згадую', full: 'Я часто згадую дитинство.', en: 'I often recall my childhood.', nl: 'Ik herinner me vaak mijn jeugd.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ старі часи.', answer: 'згадували', full: 'Вони згадували старі часи.', en: 'They were reminiscing about old times.', nl: 'Ze haalden herinneringen op aan vroeger.', tense: 'past', pronoun: 'вони' }, { uk: '___ тільки хороше!', answer: 'Згадуй', full: 'Згадуй тільки хороше!', en: 'Remember only the good things!', nl: 'Herinner je alleen de goede dingen!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'згадати', aspect: 'perfective', partner: 'згадувати', meaning: { en: 'to remember / to recall (completed)', nl: 'herinneren (voltooid)' }, level: 'B1', present: null, past: { він: 'згадав', вона: 'згадала', воно: 'згадало', вони: 'згадали' }, future: { я: 'згадаю', ти: 'згадаєш', 'він/вона': 'згадає', ми: 'згадаємо', ви: 'згадаєте', вони: 'згадають' }, imperative: { ти: 'згадай', ви: 'згадайте' }, sentences: [ { uk: 'Він раптом ___ її ім\'я.', answer: 'згадав', full: 'Він раптом згадав її ім\'я.', en: 'He suddenly remembered her name.', nl: 'Hij herinnerde zich plotseling haar naam.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ це пізніше.', answer: 'згадаю', full: 'Я згадаю це пізніше.', en: 'I will recall it later.', nl: 'Ik zal het me later herinneren.', tense: 'future', pronoun: 'я' }, { uk: '___, де ти поклав ключі!', answer: 'Згадай', full: 'Згадай, де ти поклав ключі!', en: 'Remember where you put the keys!', nl: 'Herinner je waar je de sleutels hebt neergelegd!', tense: 'imperative', pronoun: 'ти' } ] },

  // 50. залишатися / залишитися
  { infinitive: 'залишатися', aspect: 'imperfective', partner: 'залишитися', meaning: { en: 'to stay / to remain', nl: 'blijven' }, level: 'B1', present: { я: 'залишаюся', ти: 'залишаєшся', 'він/вона': 'залишається', ми: 'залишаємося', ви: 'залишаєтеся', вони: 'залишаються' }, past: { він: 'залишався', вона: 'залишалася', воно: 'залишалося', вони: 'залишалися' }, future: { я: 'буду залишатися', ти: 'будеш залишатися', 'він/вона': 'буде залишатися', ми: 'будемо залишатися', ви: 'будете залишатися', вони: 'будуть залишатися' }, imperative: { ти: 'залишайся', ви: 'залишайтеся' }, sentences: [ { uk: 'Я ___ вдома ввечері.', answer: 'залишаюся', full: 'Я залишаюся вдома ввечері.', en: 'I stay at home in the evening.', nl: 'Ik blijf \'s avonds thuis.', tense: 'present', pronoun: 'я' }, { uk: 'Він ___ на роботі допізна.', answer: 'залишався', full: 'Він залишався на роботі допізна.', en: 'He used to stay at work late.', nl: 'Hij bleef laat op het werk.', tense: 'past', pronoun: 'він' }, { uk: '___ тут, я зараз повернуся!', answer: 'Залишайся', full: 'Залишайся тут, я зараз повернуся!', en: 'Stay here, I will be right back!', nl: 'Blijf hier, ik kom zo terug!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'залишитися', aspect: 'perfective', partner: 'залишатися', meaning: { en: 'to stay / to remain (completed)', nl: 'blijven (voltooid)' }, level: 'B1', present: null, past: { він: 'залишився', вона: 'залишилася', воно: 'залишилося', вони: 'залишилися' }, future: { я: 'залишуся', ти: 'залишишся', 'він/вона': 'залишиться', ми: 'залишимося', ви: 'залишитеся', вони: 'залишаться' }, imperative: { ти: 'залишися', ви: 'залишіться' }, sentences: [ { uk: 'Вона ___ вдома через хворобу.', answer: 'залишилася', full: 'Вона залишилася вдома через хворобу.', en: 'She stayed at home because of illness.', nl: 'Ze bleef thuis vanwege ziekte.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ ще на один день.', answer: 'залишуся', full: 'Я залишуся ще на один день.', en: 'I will stay for one more day.', nl: 'Ik blijf nog een dag.', tense: 'future', pronoun: 'я' }, { uk: '___ на вечерю!', answer: 'Залишися', full: 'Залишися на вечерю!', en: 'Stay for dinner!', nl: 'Blijf voor het avondeten!', tense: 'imperative', pronoun: 'ти' } ] },

  // 51. зберігати / зберегти
  { infinitive: 'зберігати', aspect: 'imperfective', partner: 'зберегти', meaning: { en: 'to save / to preserve', nl: 'bewaren / opslaan' }, level: 'B1', present: { я: 'зберігаю', ти: 'зберігаєш', 'він/вона': 'зберігає', ми: 'зберігаємо', ви: 'зберігаєте', вони: 'зберігають' }, past: { він: 'зберігав', вона: 'зберігала', воно: 'зберігало', вони: 'зберігали' }, future: { я: 'буду зберігати', ти: 'будеш зберігати', 'він/вона': 'буде зберігати', ми: 'будемо зберігати', ви: 'будете зберігати', вони: 'будуть зберігати' }, imperative: { ти: 'зберігай', ви: 'зберігайте' }, sentences: [ { uk: 'Я ___ всі фотографії на комп\'ютері.', answer: 'зберігаю', full: 'Я зберігаю всі фотографії на комп\'ютері.', en: 'I save all photos on the computer.', nl: 'Ik bewaar alle foto\'s op de computer.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ традиції своєї родини.', answer: 'зберігали', full: 'Вони зберігали традиції своєї родини.', en: 'They preserved their family traditions.', nl: 'Ze bewaarden de tradities van hun familie.', tense: 'past', pronoun: 'вони' }, { uk: '___ спокій!', answer: 'Зберігай', full: 'Зберігай спокій!', en: 'Keep calm!', nl: 'Bewaar de rust!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'зберегти', aspect: 'perfective', partner: 'зберігати', meaning: { en: 'to save / to preserve (completed)', nl: 'bewaren / opslaan (voltooid)' }, level: 'B1', present: null, past: { він: 'зберіг', вона: 'зберегла', воно: 'зберегло', вони: 'зберегли' }, future: { я: 'збережу', ти: 'збережеш', 'він/вона': 'збереже', ми: 'збережемо', ви: 'збережете', вони: 'збережуть' }, imperative: { ти: 'збережи', ви: 'збережіть' }, sentences: [ { uk: 'Він ___ файл на флешку.', answer: 'зберіг', full: 'Він зберіг файл на флешку.', en: 'He saved the file to a flash drive.', nl: 'Hij sloeg het bestand op een USB-stick op.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ цей документ.', answer: 'збережу', full: 'Я збережу цей документ.', en: 'I will save this document.', nl: 'Ik zal dit document opslaan.', tense: 'future', pronoun: 'я' }, { uk: '___ це на пам\'ять!', answer: 'Збережи', full: 'Збережи це на пам\'ять!', en: 'Save this as a keepsake!', nl: 'Bewaar dit als aandenken!', tense: 'imperative', pronoun: 'ти' } ] },

  // 52. надсилати / надіслати
  { infinitive: 'надсилати', aspect: 'imperfective', partner: 'надіслати', meaning: { en: 'to send', nl: 'sturen / verzenden' }, level: 'B1', present: { я: 'надсилаю', ти: 'надсилаєш', 'він/вона': 'надсилає', ми: 'надсилаємо', ви: 'надсилаєте', вони: 'надсилають' }, past: { він: 'надсилав', вона: 'надсилала', воно: 'надсилало', вони: 'надсилали' }, future: { я: 'буду надсилати', ти: 'будеш надсилати', 'він/вона': 'буде надсилати', ми: 'будемо надсилати', ви: 'будете надсилати', вони: 'будуть надсилати' }, imperative: { ти: 'надсилай', ви: 'надсилайте' }, sentences: [ { uk: 'Я ___ листи щотижня.', answer: 'надсилаю', full: 'Я надсилаю листи щотижня.', en: 'I send letters every week.', nl: 'Ik stuur elke week brieven.', tense: 'present', pronoun: 'я' }, { uk: 'Вони ___ посилки за кордон.', answer: 'надсилали', full: 'Вони надсилали посилки за кордон.', en: 'They used to send packages abroad.', nl: 'Ze stuurden pakketjes naar het buitenland.', tense: 'past', pronoun: 'вони' }, { uk: '___ мені документи електронною поштою!', answer: 'Надсилай', full: 'Надсилай мені документи електронною поштою!', en: 'Send me documents by email!', nl: 'Stuur me documenten per e-mail!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'надіслати', aspect: 'perfective', partner: 'надсилати', meaning: { en: 'to send (completed)', nl: 'sturen / verzenden (voltooid)' }, level: 'B1', present: null, past: { він: 'надіслав', вона: 'надіслала', воно: 'надіслало', вони: 'надіслали' }, future: { я: 'надішлю', ти: 'надішлеш', 'він/вона': 'надішле', ми: 'надішлемо', ви: 'надішлете', вони: 'надішлють' }, imperative: { ти: 'надішли', ви: 'надішліть' }, sentences: [ { uk: 'Він ___ повідомлення вчора.', answer: 'надіслав', full: 'Він надіслав повідомлення вчора.', en: 'He sent a message yesterday.', nl: 'Hij stuurde gisteren een bericht.', tense: 'past', pronoun: 'він' }, { uk: 'Я ___ тобі файл завтра.', answer: 'надішлю', full: 'Я надішлю тобі файл завтра.', en: 'I will send you the file tomorrow.', nl: 'Ik stuur je morgen het bestand.', tense: 'future', pronoun: 'я' }, { uk: '___ мені адресу!', answer: 'Надішли', full: 'Надішли мені адресу!', en: 'Send me the address!', nl: 'Stuur me het adres!', tense: 'imperative', pronoun: 'ти' } ] },

  // 53. запрошувати / запросити
  { infinitive: 'запрошувати', aspect: 'imperfective', partner: 'запросити', meaning: { en: 'to invite', nl: 'uitnodigen' }, level: 'B1', present: { я: 'запрошую', ти: 'запрошуєш', 'він/вона': 'запрошує', ми: 'запрошуємо', ви: 'запрошуєте', вони: 'запрошують' }, past: { він: 'запрошував', вона: 'запрошувала', воно: 'запрошувало', вони: 'запрошували' }, future: { я: 'буду запрошувати', ти: 'будеш запрошувати', 'він/вона': 'буде запрошувати', ми: 'будемо запрошувати', ви: 'будете запрошувати', вони: 'будуть запрошувати' }, imperative: { ти: 'запрошуй', ви: 'запрошуйте' }, sentences: [ { uk: 'Ми ___ гостей на свято.', answer: 'запрошуємо', full: 'Ми запрошуємо гостей на свято.', en: 'We invite guests to the celebration.', nl: 'We nodigen gasten uit voor het feest.', tense: 'present', pronoun: 'ми' }, { uk: 'Він ___ друзів на день народження.', answer: 'запрошував', full: 'Він запрошував друзів на день народження.', en: 'He used to invite friends for his birthday.', nl: 'Hij nodigde vrienden uit voor zijn verjaardag.', tense: 'past', pronoun: 'він' }, { uk: '___ всіх друзів!', answer: 'Запрошуй', full: 'Запрошуй всіх друзів!', en: 'Invite all friends!', nl: 'Nodig alle vrienden uit!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'запросити', aspect: 'perfective', partner: 'запрошувати', meaning: { en: 'to invite (completed)', nl: 'uitnodigen (voltooid)' }, level: 'B1', present: null, past: { він: 'запросив', вона: 'запросила', воно: 'запросило', вони: 'запросили' }, future: { я: 'запрошу', ти: 'запросиш', 'він/вона': 'запросить', ми: 'запросимо', ви: 'запросите', вони: 'запросять' }, imperative: { ти: 'запроси', ви: 'запросіть' }, sentences: [ { uk: 'Вона ___ нас на вечерю.', answer: 'запросила', full: 'Вона запросила нас на вечерю.', en: 'She invited us for dinner.', nl: 'Ze nodigde ons uit voor het avondeten.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ його на каву.', answer: 'запрошу', full: 'Я запрошу його на каву.', en: 'I will invite him for coffee.', nl: 'Ik zal hem uitnodigen voor koffie.', tense: 'future', pronoun: 'я' }, { uk: '___ Марію на вечірку!', answer: 'Запроси', full: 'Запроси Марію на вечірку!', en: 'Invite Maria to the party!', nl: 'Nodig Maria uit voor het feest!', tense: 'imperative', pronoun: 'ти' } ] },

  // 54. перевіряти / перевірити
  { infinitive: 'перевіряти', aspect: 'imperfective', partner: 'перевірити', meaning: { en: 'to check / to verify', nl: 'controleren / nakijken' }, level: 'B1', present: { я: 'перевіряю', ти: 'перевіряєш', 'він/вона': 'перевіряє', ми: 'перевіряємо', ви: 'перевіряєте', вони: 'перевіряють' }, past: { він: 'перевіряв', вона: 'перевіряла', воно: 'перевіряло', вони: 'перевіряли' }, future: { я: 'буду перевіряти', ти: 'будеш перевіряти', 'він/вона': 'буде перевіряти', ми: 'будемо перевіряти', ви: 'будете перевіряти', вони: 'будуть перевіряти' }, imperative: { ти: 'перевіряй', ви: 'перевіряйте' }, sentences: [ { uk: 'Я ___ пошту щоранку.', answer: 'перевіряю', full: 'Я перевіряю пошту щоранку.', en: 'I check email every morning.', nl: 'Ik controleer elke ochtend mijn e-mail.', tense: 'present', pronoun: 'я' }, { uk: 'Вчитель ___ домашні завдання.', answer: 'перевіряв', full: 'Вчитель перевіряв домашні завдання.', en: 'The teacher was checking homework.', nl: 'De leraar keek het huiswerk na.', tense: 'past', pronoun: 'він' }, { uk: '___ все двічі перед відправкою!', answer: 'Перевіряй', full: 'Перевіряй все двічі перед відправкою!', en: 'Check everything twice before sending!', nl: 'Controleer alles twee keer voor het verzenden!', tense: 'imperative', pronoun: 'ти' } ] },
  { infinitive: 'перевірити', aspect: 'perfective', partner: 'перевіряти', meaning: { en: 'to check / to verify (completed)', nl: 'controleren / nakijken (voltooid)' }, level: 'B1', present: null, past: { він: 'перевірив', вона: 'перевірила', воно: 'перевірило', вони: 'перевірили' }, future: { я: 'перевірю', ти: 'перевіриш', 'він/вона': 'перевірить', ми: 'перевіримо', ви: 'перевірите', вони: 'перевірять' }, imperative: { ти: 'перевір', ви: 'перевірте' }, sentences: [ { uk: 'Вона ___ всі дані.', answer: 'перевірила', full: 'Вона перевірила всі дані.', en: 'She checked all the data.', nl: 'Ze controleerde alle gegevens.', tense: 'past', pronoun: 'вона' }, { uk: 'Я ___ це ще раз.', answer: 'перевірю', full: 'Я перевірю це ще раз.', en: 'I will check this once more.', nl: 'Ik zal dit nog een keer controleren.', tense: 'future', pronoun: 'я' }, { uk: '___ розклад перед виходом!', answer: 'Перевір', full: 'Перевір розклад перед виходом!', en: 'Check the schedule before leaving!', nl: 'Controleer het rooster voordat je vertrekt!', tense: 'imperative', pronoun: 'ти' } ] },
];

/** Build a randomised drill set of `count` questions from all conjugation forms. */
export function buildDrillSet(count = 25) {
  const questions = [];
  for (const verb of CONJUGATIONS) {
    const tenses = [
      { name: 'present', label: { en: 'Present', nl: 'Tegenwoordige tijd' }, forms: verb.present },
      { name: 'past', label: { en: 'Past', nl: 'Verleden tijd' }, forms: verb.past },
      { name: 'future', label: { en: 'Future', nl: 'Toekomst' }, forms: verb.future },
      { name: 'imperative', label: { en: 'Imperative', nl: 'Gebiedende wijs' }, forms: verb.imperative },
    ];
    for (const tense of tenses) {
      if (!tense.forms) continue;
      for (const [pronoun, form] of Object.entries(tense.forms)) {
        questions.push({
          infinitive: verb.infinitive,
          aspect: verb.aspect,
          partner: verb.partner,
          meaning: verb.meaning,
          tense: tense.name,
          tenseLabel: tense.label,
          pronoun,
          correctForm: form,
        });
      }
    }
  }
  // Shuffle (Fisher-Yates)
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }
  return questions.slice(0, count);
}

/** Look up a verb by infinitive. Returns the conjugation object or undefined. */
export function findVerb(infinitive) {
  return CONJUGATIONS.find((v) => v.infinitive === infinitive);
}
