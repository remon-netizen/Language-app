// One-line aspect tips for the verb pairs that VERB_PAIRS does not cover.
//
// VERB_PAIRS carries tips only for the 20 pairs in the aspect drill, and its
// entries also hold sentence data that drill depends on -- so the remaining 34
// pairs live here rather than being bolted on there as half-entries.
//
// A tip states what the perfective actually does, because that is a fact about
// the pair, not about any one tense. Three kinds show up:
//   - completive   the action reaches its result   (читати -> прочитати)
//   - delimitative a bounded stretch, no result    (грати -> пограти)
//   - inceptive    the moment a state begins       (знати -> дізнатися)
// Suppletive pairs (different roots, no prefix) are called out, since the
// prefix pattern learners rely on does not apply to them.
//
// Keyed by the imperfective infinitive.

export const ASPECT_TIPS = {
  'бути': {
    en: 'бути = to be, and the auxiliary behind every imperfective future (буду читати); побути = spend a while somewhere — not a true perfective of "be"',
    nl: 'бути = zijn, en het hulpwerkwoord achter elke onvoltooide toekomst (буду читати); побути = ergens een tijdje zijn — geen echte voltooide vorm van "zijn"',
  },
  'ходити': {
    en: 'ходити = go regularly, or in various directions (contrast йти = going one way, now); походити = walk about for a while',
    nl: 'ходити = regelmatig gaan, of alle kanten op (vgl. йти = nu één kant op); походити = een tijdje rondlopen',
  },
  'грати': {
    en: 'грати = play, as an activity or a habit; пограти = play for a while — a bounded stint, not "finish playing"',
    nl: 'грати = spelen, als bezigheid of gewoonte; пограти = een tijdje spelen — een afgebakende periode, niet "klaar met spelen"',
  },
  'слухати': {
    en: 'слухати = be listening, or listen regularly; послухати = give something a listen, right through',
    nl: 'слухати = aan het luisteren zijn, of regelmatig luisteren; послухати = ergens helemaal naar luisteren',
  },
  'знати': {
    en: 'знати = know, a state you are already in; дізнатися = find out — the moment you come to know, not "finished knowing"',
    nl: 'знати = weten, een toestand waarin je al bent; дізнатися = te weten komen — het moment dat je het verneemt, niet "klaar met weten"',
  },
  'бачити': {
    en: 'бачити = see, have in view; побачити = catch sight of — the moment something comes into view',
    nl: 'бачити = zien, in beeld hebben; побачити = in het oog krijgen — het moment dat iets zichtbaar wordt',
  },
  'чути': {
    en: 'чути = hear, be able to hear; почути = catch a sound — the moment it reaches you',
    nl: 'чути = horen, kunnen horen; почути = opvangen — het moment dat het je bereikt',
  },
  'робити': {
    en: 'робити = be doing it, or do it as a rule; зробити = get it done — the result exists afterwards',
    nl: 'робити = ermee bezig zijn, of het gewoonlijk doen; зробити = afkrijgen — daarna is het resultaat er',
  },
  'думати': {
    en: 'думати = be thinking, or hold an opinion; подумати = have a think — one bout of thought',
    nl: 'думати = aan het denken zijn, of een mening hebben; подумати = even nadenken — één keer',
  },
  'говорити': {
    en: 'говорити = speak or talk, as an activity; сказати = say one thing — a different root, not a prefixed form',
    nl: 'говорити = spreken of praten, als bezigheid; сказати = één ding zeggen — een andere stam, geen voorvoegselvorm',
  },
  'відповідати': {
    en: 'відповідати = be answering, or answer as a rule; відповісти = give the answer, once',
    nl: 'відповідати = aan het antwoorden zijn, of gewoonlijk antwoorden; відповісти = één keer antwoord geven',
  },
  'допомагати': {
    en: 'допомагати = help regularly, or be helping; допомогти = help out once, and it makes a difference',
    nl: 'допомагати = regelmatig helpen, of aan het helpen zijn; допомогти = één keer helpen, met effect',
  },
  'просити': {
    en: 'просити = keep asking, or ask as a habit; попросити = make one request',
    nl: 'просити = blijven vragen, of gewoonlijk vragen; попросити = één verzoek doen',
  },
  'платити': {
    en: 'платити = pay, or be paying; заплатити = pay up — the bill is settled',
    nl: 'платити = betalen, of aan het betalen zijn; заплатити = afrekenen — de rekening is voldaan',
  },
  'отримувати': {
    en: 'отримувати = receive regularly; отримати = receive it once, and now have it',
    nl: 'отримувати = regelmatig ontvangen; отримати = één keer ontvangen, en nu hebben',
  },
  'писати': {
    en: 'писати = be writing, or write as an activity; написати = write it and finish it',
    nl: 'писати = aan het schrijven zijn, of schrijven als bezigheid; написати = schrijven en afmaken',
  },
  'читати': {
    en: 'читати = be reading, or read regularly; прочитати = read it through to the end',
    nl: 'читати = aan het lezen zijn, of regelmatig lezen; прочитати = helemaal uitlezen',
  },
  'вчити': {
    en: 'вчити = be studying something; вивчити = master it — you know it afterwards',
    nl: 'вчити = iets aan het leren zijn; вивчити = onder de knie krijgen — daarna ken je het',
  },
  'розуміти': {
    en: 'розуміти = understand, a state you are in; зрозуміти = grasp it — the moment it clicks',
    nl: 'розуміти = begrijpen, een toestand; зрозуміти = doorkrijgen — het moment dat het klikt',
  },
  'пояснювати': {
    en: 'пояснювати = be explaining, or explain as a rule; пояснити = explain it so that it lands',
    nl: 'пояснювати = aan het uitleggen zijn, of gewoonlijk uitleggen; пояснити = uitleggen zodat het overkomt',
  },
  'розповідати': {
    en: 'розповідати = be telling, or tell repeatedly; розповісти = tell the whole thing, once',
    nl: 'розповідати = aan het vertellen zijn, of vaker vertellen; розповісти = het hele verhaal één keer vertellen',
  },
  'перекладати': {
    en: 'перекладати = translate as an activity or a job; перекласти = finish translating one thing',
    nl: 'перекладати = vertalen als bezigheid of beroep; перекласти = één tekst afvertalen',
  },
  'вирішувати': {
    en: 'вирішувати = be working towards a decision; вирішити = settle it — the decision is made',
    nl: 'вирішувати = bezig zijn een besluit te nemen; вирішити = beslissen — het besluit staat vast',
  },
  'змінювати': {
    en: 'змінювати = be changing it, or change it repeatedly; змінити = change it — it is different now',
    nl: 'змінювати = aan het veranderen zijn, of herhaaldelijk veranderen; змінити = veranderen — het is nu anders',
  },
  'порівнювати': {
    en: 'порівнювати = be comparing, or compare as a practice; порівняти = compare and reach a verdict',
    nl: 'порівнювати = aan het vergelijken zijn, of gewoonlijk vergelijken; порівняти = vergelijken en tot een oordeel komen',
  },
  'пропонувати': {
    en: 'пропонувати = keep offering, or offer as a rule; запропонувати = put one proposal forward',
    nl: 'пропонувати = blijven aanbieden, of gewoonlijk aanbieden; запропонувати = één voorstel doen',
  },
  'намагатися': {
    en: 'намагатися = keep trying, sustained effort; спробувати = give it a go once — a different root, not a prefixed form',
    nl: 'намагатися = blijven proberen, volgehouden inspanning; спробувати = één keer proberen — een andere stam, geen voorvoegselvorm',
  },
  'забувати': {
    en: 'забувати = keep forgetting, as a tendency; забути = forget it — it is gone',
    nl: 'забувати = steeds vergeten, als neiging; забути = vergeten — het is weg',
  },
  'згадувати': {
    en: 'згадувати = keep bringing to mind, or mention often; згадати = recall it — the moment it comes back',
    nl: 'згадувати = steeds in gedachten halen, of vaak noemen; згадати = zich herinneren — het moment dat het terugkomt',
  },
  'залишатися': {
    en: 'залишатися = stay on, or keep staying; залишитися = stay this once — the choice is made',
    nl: 'залишатися = blijven, of steeds blijven; залишитися = deze keer blijven — de keuze is gemaakt',
  },
  'зберігати': {
    en: 'зберігати = keep or store on an ongoing basis; зберегти = save it — it is secured',
    nl: 'зберігати = doorlopend bewaren of opslaan; зберегти = opslaan — het is veiliggesteld',
  },
  'надсилати': {
    en: 'надсилати = send regularly, or be sending; надіслати = send it — it is on its way',
    nl: 'надсилати = regelmatig versturen, of aan het versturen zijn; надіслати = versturen — het is onderweg',
  },
  'запрошувати': {
    en: 'запрошувати = invite as a habit, or be inviting; запросити = issue one invitation',
    nl: 'запрошувати = gewoonlijk uitnodigen, of aan het uitnodigen zijn; запросити = één uitnodiging doen',
  },
  'перевіряти': {
    en: 'перевіряти = check regularly, or be checking; перевірити = check it once and know',
    nl: 'перевіряти = regelmatig controleren, of aan het controleren zijn; перевірити = één keer controleren en het weten',
  },
};
