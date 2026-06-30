// ── Ukrainian Verbal Prefixes ─────────────────────────────────────────────────

export const PREFIXES = [
  { prefix: 'при-', meaning: { en: 'arrival, approach, attachment', nl: 'aankomst, nadering, bevestiging' } },
  { prefix: 'ви-',  meaning: { en: 'out, outward, completion', nl: 'uit, naar buiten, voltooiing' } },
  { prefix: 'за-',  meaning: { en: 'behind, beginning, dropping by', nl: 'achter, begin, even langsgaan' } },
  { prefix: 'від-', meaning: { en: 'away from, separation', nl: 'weg van, scheiding' } },
  { prefix: 'по-',  meaning: { en: 'a little, along, beginning', nl: 'een beetje, langs, begin' } },
  { prefix: 'до-',  meaning: { en: 'up to, reaching, adding', nl: 'tot, bereiken, toevoegen' } },
  { prefix: 'на-',  meaning: { en: 'onto, accumulation', nl: 'op, ophoping' } },
  { prefix: 'з-/с-', meaning: { en: 'down from, together, completion', nl: 'van af, samen, voltooiing' } },
  { prefix: 'пере-', meaning: { en: 're-, across, over', nl: 'her-, over, door' } },
  { prefix: 'роз-', meaning: { en: 'apart, spreading, un-', nl: 'uit elkaar, verspreiden, ont-' } },
  { prefix: 'об-',  meaning: { en: 'around, covering', nl: 'om, rondom, bedekken' } },
  { prefix: 'під-', meaning: { en: 'under, up to, slightly', nl: 'onder, tot, lichtjes' } },
  { prefix: 'про-', meaning: { en: 'through, past, missing', nl: 'door, voorbij, missen' } },
  { prefix: 'у-/в-', meaning: { en: 'into, inward', nl: 'in, naar binnen' } },
];

export const BASE_VERBS = [
  // ── 1. йти (go on foot) ──
  {
    base: 'йти',
    meaning: { en: 'to go (on foot)', nl: 'gaan (te voet)' },
    level: 'A1',
    prefixed: [
      { prefix: 'при-', verb: 'прийти', meaning: { en: 'to come, to arrive', nl: 'aankomen, komen' },
        sentence: { uk: 'Він ___ додому пізно.', answer: 'прийшов', full: 'Він прийшов додому пізно.', en: 'He came home late.', nl: 'Hij kwam laat thuis.' } },
      { prefix: 'ви-', verb: 'вийти', meaning: { en: 'to go out, to exit', nl: 'naar buiten gaan, uitgaan' },
        sentence: { uk: 'Вона ___ з магазину.', answer: 'вийшла', full: 'Вона вийшла з магазину.', en: 'She came out of the store.', nl: 'Ze kwam uit de winkel.' } },
      { prefix: 'за-', verb: 'зайти', meaning: { en: 'to drop by, to stop in', nl: 'even langsgaan, binnenlopen' },
        sentence: { uk: 'Я ___ до друга по дорозі.', answer: 'зайшов', full: 'Я зайшов до друга по дорозі.', en: 'I stopped by a friend on the way.', nl: 'Ik ging onderweg even langs een vriend.' } },
      { prefix: 'від-', verb: 'відійти', meaning: { en: 'to step away, to move away', nl: 'weglopen, afstand nemen' },
        sentence: { uk: 'Він ___ від вікна.', answer: 'відійшов', full: 'Він відійшов від вікна.', en: 'He stepped away from the window.', nl: 'Hij liep weg van het raam.' } },
      { prefix: 'пере-', verb: 'перейти', meaning: { en: 'to cross, to go across', nl: 'oversteken' },
        sentence: { uk: 'Ми ___ через дорогу.', answer: 'перейшли', full: 'Ми перейшли через дорогу.', en: 'We crossed the road.', nl: 'We staken de weg over.' } },
      { prefix: 'про-', verb: 'пройти', meaning: { en: 'to pass through, to walk past', nl: 'doorlopen, voorbijgaan' },
        sentence: { uk: 'Ми ___ повз парк.', answer: 'пройшли', full: 'Ми пройшли повз парк.', en: 'We walked past the park.', nl: 'We liepen langs het park.' } },
      { prefix: 'під-', verb: 'підійти', meaning: { en: 'to approach, to come up to', nl: 'naderen, dichterbij komen' },
        sentence: { uk: 'Вона ___ до мене.', answer: 'підійшла', full: 'Вона підійшла до мене.', en: 'She came up to me.', nl: 'Ze kwam naar me toe.' } },
      { prefix: 'у-/в-', verb: 'увійти', meaning: { en: 'to enter, to go in', nl: 'binnengaan, betreden' },
        sentence: { uk: 'Він ___ до кімнати.', answer: 'увійшов', full: 'Він увійшов до кімнати.', en: 'He entered the room.', nl: 'Hij ging de kamer binnen.' } },
    ],
  },

  // ── 2. їхати (go by transport) ──
  {
    base: 'їхати',
    meaning: { en: 'to go (by transport)', nl: 'gaan (met vervoer)' },
    level: 'A1',
    prefixed: [
      { prefix: 'при-', verb: 'приїхати', meaning: { en: 'to arrive (by transport)', nl: 'aankomen (met vervoer)' },
        sentence: { uk: 'Мама ___ вчора.', answer: 'приїхала', full: 'Мама приїхала вчора.', en: 'Mom arrived yesterday.', nl: 'Mama is gisteren aangekomen.' } },
      { prefix: 'ви-', verb: 'виїхати', meaning: { en: 'to leave, to drive out', nl: 'vertrekken, wegrijden' },
        sentence: { uk: 'Ми ___ з міста рано.', answer: 'виїхали', full: 'Ми виїхали з міста рано.', en: 'We left the city early.', nl: 'We vertrokken vroeg uit de stad.' } },
      { prefix: 'за-', verb: 'заїхати', meaning: { en: 'to swing by (in a vehicle)', nl: 'even langsrijden' },
        sentence: { uk: 'Я ___ до магазину по дорозі.', answer: 'заїхав', full: 'Я заїхав до магазину по дорозі.', en: 'I stopped by the store on the way.', nl: 'Ik ging onderweg even langs de winkel.' } },
      { prefix: 'пере-', verb: 'переїхати', meaning: { en: 'to move (to new place), to run over', nl: 'verhuizen, overrijden' },
        sentence: { uk: 'Вони ___ в нову квартиру.', answer: 'переїхали', full: 'Вони переїхали в нову квартиру.', en: 'They moved to a new apartment.', nl: 'Ze zijn naar een nieuw appartement verhuisd.' } },
      { prefix: 'під-', verb: 'під\'їхати', meaning: { en: 'to drive up to', nl: 'aanrijden, naderen' },
        sentence: { uk: 'Таксі ___ до готелю.', answer: 'під\'їхало', full: 'Таксі під\'їхало до готелю.', en: 'The taxi pulled up to the hotel.', nl: 'De taxi reed voor bij het hotel.' } },
      { prefix: 'до-', verb: 'доїхати', meaning: { en: 'to reach (by transport)', nl: 'bereiken (met vervoer)' },
        sentence: { uk: 'Ми ___ до вокзалу за годину.', answer: 'доїхали', full: 'Ми доїхали до вокзалу за годину.', en: 'We reached the station in an hour.', nl: 'We bereikten het station in een uur.' } },
    ],
  },

  // ── 3. нести (carry) ──
  {
    base: 'нести',
    meaning: { en: 'to carry', nl: 'dragen' },
    level: 'A2',
    prefixed: [
      { prefix: 'при-', verb: 'принести', meaning: { en: 'to bring', nl: 'meebrengen' },
        sentence: { uk: 'Він ___ квіти.', answer: 'приніс', full: 'Він приніс квіти.', en: 'He brought flowers.', nl: 'Hij bracht bloemen mee.' } },
      { prefix: 'ви-', verb: 'винести', meaning: { en: 'to carry out, to take out', nl: 'naar buiten brengen' },
        sentence: { uk: 'Вона ___ сміття.', answer: 'винесла', full: 'Вона винесла сміття.', en: 'She took out the trash.', nl: 'Ze bracht het afval naar buiten.' } },
      { prefix: 'від-', verb: 'віднести', meaning: { en: 'to carry away, to take to', nl: 'wegbrengen' },
        sentence: { uk: 'Я ___ документи в офіс.', answer: 'відніс', full: 'Я відніс документи в офіс.', en: 'I took the documents to the office.', nl: 'Ik bracht de documenten naar kantoor.' } },
      { prefix: 'пере-', verb: 'перенести', meaning: { en: 'to move, to reschedule, to endure', nl: 'verplaatsen, verzetten, verdragen' },
        sentence: { uk: 'Ми ___ зустріч на п\'ятницю.', answer: 'перенесли', full: 'Ми перенесли зустріч на п\'ятницю.', en: 'We rescheduled the meeting to Friday.', nl: 'We hebben de vergadering naar vrijdag verplaatst.' } },
      { prefix: 'з-', verb: 'знести', meaning: { en: 'to carry down, to demolish', nl: 'naar beneden dragen, slopen' },
        sentence: { uk: 'Старий будинок ___ .', answer: 'знесли', full: 'Старий будинок знесли.', en: 'The old building was demolished.', nl: 'Het oude gebouw werd gesloopt.' } },
    ],
  },

  // ── 4. брати (take) ──
  {
    base: 'брати',
    meaning: { en: 'to take', nl: 'nemen / pakken' },
    level: 'A1',
    prefixed: [
      { prefix: 'за-', verb: 'забрати', meaning: { en: 'to pick up, to take away', nl: 'ophalen, meenemen' },
        sentence: { uk: 'Я ___ дитину зі школи.', answer: 'забрав', full: 'Я забрав дитину зі школи.', en: 'I picked up the child from school.', nl: 'Ik haalde het kind op van school.' } },
      { prefix: 'ви-', verb: 'вибрати', meaning: { en: 'to choose, to select', nl: 'kiezen, selecteren' },
        sentence: { uk: 'Вона ___ червону сукню.', answer: 'вибрала', full: 'Вона вибрала червону сукню.', en: 'She chose the red dress.', nl: 'Ze koos de rode jurk.' } },
      { prefix: 'з-', verb: 'зібрати', meaning: { en: 'to collect, to gather', nl: 'verzamelen, bijeenbrengen' },
        sentence: { uk: 'Діти ___ гриби в лісі.', answer: 'зібрали', full: 'Діти зібрали гриби в лісі.', en: 'The children gathered mushrooms in the forest.', nl: 'De kinderen verzamelden paddenstoelen in het bos.' } },
      { prefix: 'під-', verb: 'підібрати', meaning: { en: 'to pick up, to match', nl: 'oprapen, bij elkaar zoeken' },
        sentence: { uk: 'Він ___ ключі з підлоги.', answer: 'підібрав', full: 'Він підібрав ключі з підлоги.', en: 'He picked up the keys from the floor.', nl: 'Hij raapte de sleutels van de vloer op.' } },
      { prefix: 'роз-', verb: 'розібрати', meaning: { en: 'to take apart, to sort out', nl: 'uit elkaar halen, uitzoeken' },
        sentence: { uk: 'Ми ___ старий мотор.', answer: 'розібрали', full: 'Ми розібрали старий мотор.', en: 'We took apart the old engine.', nl: 'We haalden de oude motor uit elkaar.' } },
    ],
  },

  // ── 5. писати (write) ──
  {
    base: 'писати',
    meaning: { en: 'to write', nl: 'schrijven' },
    level: 'A1',
    prefixed: [
      { prefix: 'на-', verb: 'написати', meaning: { en: 'to write (completed)', nl: 'schrijven (voltooid)' },
        sentence: { uk: 'Вона ___ листа мамі.', answer: 'написала', full: 'Вона написала листа мамі.', en: 'She wrote a letter to her mom.', nl: 'Ze schreef een brief aan haar moeder.' } },
      { prefix: 'за-', verb: 'записати', meaning: { en: 'to write down, to record', nl: 'opschrijven, opnemen' },
        sentence: { uk: 'Я ___ його номер телефону.', answer: 'записав', full: 'Я записав його номер телефону.', en: 'I wrote down his phone number.', nl: 'Ik schreef zijn telefoonnummer op.' } },
      { prefix: 'пере-', verb: 'переписати', meaning: { en: 'to rewrite, to copy', nl: 'herschrijven, overschrijven' },
        sentence: { uk: 'Учитель попросив ___ текст.', answer: 'переписати', full: 'Учитель попросив переписати текст.', en: 'The teacher asked to rewrite the text.', nl: 'De leraar vroeg om de tekst te herschrijven.' } },
      { prefix: 'під-', verb: 'підписати', meaning: { en: 'to sign', nl: 'ondertekenen' },
        sentence: { uk: 'Вона ___ договір.', answer: 'підписала', full: 'Вона підписала договір.', en: 'She signed the contract.', nl: 'Ze tekende het contract.' } },
      { prefix: 'від-', verb: 'відписати', meaning: { en: 'to reply in writing, to unsubscribe', nl: 'schriftelijk antwoorden, afmelden' },
        sentence: { uk: 'Я ___ на його повідомлення.', answer: 'відписав', full: 'Я відписав на його повідомлення.', en: 'I replied to his message.', nl: 'Ik antwoordde op zijn bericht.' } },
    ],
  },

  // ── 6. ходити (walk, go regularly) ──
  {
    base: 'ходити',
    meaning: { en: 'to walk, to go (regularly)', nl: 'lopen, gaan (regelmatig)' },
    level: 'A1',
    prefixed: [
      { prefix: 'ви-', verb: 'виходити', meaning: { en: 'to go out, to come out', nl: 'naar buiten gaan' },
        sentence: { uk: 'Він ___ з дому о восьмій.', answer: 'виходить', full: 'Він виходить з дому о восьмій.', en: 'He leaves home at eight.', nl: 'Hij gaat om acht uur van huis.' } },
      { prefix: 'за-', verb: 'заходити', meaning: { en: 'to drop by (regularly)', nl: 'langskomen (regelmatig)' },
        sentence: { uk: 'Вона часто ___ до нас.', answer: 'заходить', full: 'Вона часто заходить до нас.', en: 'She often drops by our place.', nl: 'Ze komt vaak bij ons langs.' } },
      { prefix: 'від-', verb: 'відходити', meaning: { en: 'to depart, to move away', nl: 'vertrekken, weggaan' },
        sentence: { uk: 'Автобус ___ через п\'ять хвилин.', answer: 'відходить', full: 'Автобус відходить через п\'ять хвилин.', en: 'The bus departs in five minutes.', nl: 'De bus vertrekt over vijf minuten.' } },
      { prefix: 'про-', verb: 'проходити', meaning: { en: 'to pass by, to take place', nl: 'voorbijlopen, plaatsvinden' },
        sentence: { uk: 'Урок ___ у великій залі.', answer: 'проходить', full: 'Урок проходить у великій залі.', en: 'The lesson takes place in the big hall.', nl: 'De les vindt plaats in de grote zaal.' } },
      { prefix: 'пере-', verb: 'переходити', meaning: { en: 'to cross (regularly)', nl: 'oversteken (regelmatig)' },
        sentence: { uk: 'Діти ___ дорогу тут кожного дня.', answer: 'переходять', full: 'Діти переходять дорогу тут кожного дня.', en: 'Children cross the road here every day.', nl: 'Kinderen steken hier elke dag de weg over.' } },
    ],
  },

  // ── 7. бити (hit, beat) ──
  {
    base: 'бити',
    meaning: { en: 'to hit, to beat', nl: 'slaan' },
    level: 'A2',
    prefixed: [
      { prefix: 'роз-', verb: 'розбити', meaning: { en: 'to break, to smash', nl: 'breken, kapot slaan' },
        sentence: { uk: 'Він ___ вазу.', answer: 'розбив', full: 'Він розбив вазу.', en: 'He broke the vase.', nl: 'Hij brak de vaas.' } },
      { prefix: 'за-', verb: 'забити', meaning: { en: 'to hammer in, to score (a goal)', nl: 'inslaan, scoren (een doelpunt)' },
        sentence: { uk: 'Він ___ гол у кінці матчу.', answer: 'забив', full: 'Він забив гол у кінці матчу.', en: 'He scored a goal at the end of the match.', nl: 'Hij scoorde een doelpunt aan het einde van de wedstrijd.' } },
      { prefix: 'від-', verb: 'відбити', meaning: { en: 'to deflect, to fight off', nl: 'afweren, terugslaan' },
        sentence: { uk: 'Воротар ___ м\'яч.', answer: 'відбив', full: 'Воротар відбив м\'яч.', en: 'The goalkeeper deflected the ball.', nl: 'De keeper sloeg de bal weg.' } },
    ],
  },

  // ── 8. їсти (eat) ──
  {
    base: 'їсти',
    meaning: { en: 'to eat', nl: 'eten' },
    level: 'A1',
    prefixed: [
      { prefix: 'з-', verb: "з'їсти", meaning: { en: 'to eat up', nl: 'opeten' },
        sentence: { uk: "Він ___ весь торт.", answer: "з'їв", full: "Він з'їв весь торт.", en: 'He ate up the whole cake.', nl: 'Hij at de hele taart op.' } },
      { prefix: 'пере-', verb: "переїсти", meaning: { en: 'to overeat', nl: 'te veel eten' },
        sentence: { uk: "Я ___ на вечері.", answer: "переїв", full: "Я переїв на вечері.", en: 'I overate at dinner.', nl: 'Ik heb te veel gegeten bij het diner.' } },
      { prefix: 'на-', verb: "наїстися", meaning: { en: 'to eat enough, to be full', nl: 'genoeg eten, vol zitten' },
        sentence: { uk: "Ти вже ___?", answer: "наївся", full: "Ти вже наївся?", en: 'Have you eaten enough?', nl: 'Heb je al genoeg gegeten?' } },
    ],
  },

  // ── 9. давати (give) ──
  {
    base: 'давати',
    meaning: { en: 'to give', nl: 'geven' },
    level: 'A2',
    prefixed: [
      { prefix: 'від-', verb: 'віддати', meaning: { en: 'to give away, to return', nl: 'weggeven, teruggeven' },
        sentence: { uk: 'Він ___ книгу бібліотеці.', answer: 'віддав', full: 'Він віддав книгу бібліотеці.', en: 'He returned the book to the library.', nl: 'Hij gaf het boek terug aan de bibliotheek.' } },
      { prefix: 'пере-', verb: 'передати', meaning: { en: 'to pass, to hand over', nl: 'doorgeven, overhandigen' },
        sentence: { uk: '___ мені сіль, будь ласка.', answer: 'Передай', full: 'Передай мені сіль, будь ласка.', en: 'Pass me the salt, please.', nl: 'Geef me het zout door, alsjeblieft.' } },
      { prefix: 'з-', verb: 'здати', meaning: { en: 'to hand in, to pass (exam)', nl: 'inleveren, slagen (examen)' },
        sentence: { uk: 'Вона ___ іспит на відмінно.', answer: 'здала', full: 'Вона здала іспит на відмінно.', en: 'She passed the exam with top marks.', nl: 'Ze slaagde met uitstekende cijfers voor het examen.' } },
      { prefix: 'до-', verb: 'додати', meaning: { en: 'to add', nl: 'toevoegen' },
        sentence: { uk: '___ трохи солі.', answer: 'Додай', full: 'Додай трохи солі.', en: 'Add a little salt.', nl: 'Voeg een beetje zout toe.' } },
    ],
  },

  // ── 10. ставити (put, place) ──
  {
    base: 'ставити',
    meaning: { en: 'to put, to place (upright)', nl: 'neerzetten, plaatsen' },
    level: 'A2',
    prefixed: [
      { prefix: 'по-', verb: 'поставити', meaning: { en: 'to put, to place (completed)', nl: 'neerzetten (voltooid)' },
        sentence: { uk: 'Вона ___ вазу на стіл.', answer: 'поставила', full: 'Вона поставила вазу на стіл.', en: 'She placed the vase on the table.', nl: 'Ze zette de vaas op de tafel.' } },
      { prefix: 'від-', verb: 'відставити', meaning: { en: 'to put aside', nl: 'opzij zetten' },
        sentence: { uk: '___ каструлю від вогню.', answer: 'Відстав', full: 'Відстав каструлю від вогню.', en: 'Put the pot away from the fire.', nl: 'Zet de pan weg van het vuur.' } },
      { prefix: 'пере-', verb: 'переставити', meaning: { en: 'to rearrange, to move', nl: 'verplaatsen, herschikken' },
        sentence: { uk: 'Ми ___ меблі в кімнаті.', answer: 'переставили', full: 'Ми переставили меблі в кімнаті.', en: 'We rearranged the furniture in the room.', nl: 'We hebben de meubels in de kamer verplaatst.' } },
    ],
  },

  // ── 11. робити (do/make) ──
  {
    base: 'робити',
    meaning: { en: 'to do, to make', nl: 'doen, maken' },
    level: 'A1',
    prefixed: [
      { prefix: 'з-', verb: 'зробити', meaning: { en: 'to do/make (completed)', nl: 'doen/maken (voltooid)' },
        sentence: { uk: 'Вона ___ домашнє завдання.', answer: 'зробила', full: 'Вона зробила домашнє завдання.', en: 'She did the homework.', nl: 'Ze maakte het huiswerk.' } },
      { prefix: 'пере-', verb: 'переробити', meaning: { en: 'to redo, to remake', nl: 'opnieuw doen, hermaken' },
        sentence: { uk: 'Мені потрібно ___ цей звіт.', answer: 'переробити', full: 'Мені потрібно переробити цей звіт.', en: 'I need to redo this report.', nl: 'Ik moet dit rapport opnieuw maken.' } },
      { prefix: 'до-', verb: 'доробити', meaning: { en: 'to finish doing', nl: 'afmaken' },
        sentence: { uk: 'Я ___ проект увечері.', answer: 'доробив', full: 'Я доробив проект увечері.', en: 'I finished the project in the evening.', nl: 'Ik maakte het project in de avond af.' } },
    ],
  },

  // ── 12. казати (say) ──
  {
    base: 'казати',
    meaning: { en: 'to say, to tell', nl: 'zeggen, vertellen' },
    level: 'A2',
    prefixed: [
      { prefix: 'роз-', verb: 'розказати', meaning: { en: 'to tell (a story)', nl: 'vertellen (een verhaal)' },
        sentence: { uk: 'Бабуся ___ казку.', answer: 'розказала', full: 'Бабуся розказала казку.', en: 'Grandma told a fairy tale.', nl: 'Oma vertelde een sprookje.' } },
      { prefix: 'під-', verb: 'підказати', meaning: { en: 'to hint, to prompt', nl: 'een hint geven, voorzeggen' },
        sentence: { uk: 'Ти можеш мені ___?', answer: 'підказати', full: 'Ти можеш мені підказати?', en: 'Can you give me a hint?', nl: 'Kun je me een hint geven?' } },
      { prefix: 'пере-', verb: 'переказати', meaning: { en: 'to retell, to transfer (money)', nl: 'navertellen, overmaken (geld)' },
        sentence: { uk: 'Він ___ гроші на рахунок.', answer: 'переказав', full: 'Він переказав гроші на рахунок.', en: 'He transferred money to the account.', nl: 'Hij maakte geld over naar de rekening.' } },
    ],
  },

  // ── 13. кидати (throw) ──
  {
    base: 'кидати',
    meaning: { en: 'to throw', nl: 'gooien' },
    level: 'B1',
    prefixed: [
      { prefix: 'ви-', verb: 'викидати', meaning: { en: 'to throw out, to discard', nl: 'weggooien' },
        sentence: { uk: 'Не ___ це!', answer: 'викидай', full: 'Не викидай це!', en: "Don't throw this away!", nl: 'Gooi dit niet weg!' } },
      { prefix: 'за-', verb: 'закидати', meaning: { en: 'to toss in, to bombard', nl: 'naar binnen gooien, bestoken' },
        sentence: { uk: 'Він ___ м\'яч у кошик.', answer: 'закинув', full: 'Він закинув м\'яч у кошик.', en: 'He tossed the ball into the basket.', nl: 'Hij gooide de bal in de mand.' } },
      { prefix: 'під-', verb: 'підкидати', meaning: { en: 'to toss up', nl: 'omhoog gooien' },
        sentence: { uk: 'Вона ___ монету.', answer: 'підкинула', full: 'Вона підкинула монету.', en: 'She flipped a coin.', nl: 'Ze gooide een munt op.' } },
    ],
  },

  // ── 14. вчити (teach/learn) ──
  {
    base: 'вчити',
    meaning: { en: 'to teach / to learn', nl: 'leren / onderwijzen' },
    level: 'A1',
    prefixed: [
      { prefix: 'ви-', verb: 'вивчити', meaning: { en: 'to learn thoroughly, to master', nl: 'grondig leren, beheersen' },
        sentence: { uk: 'Я хочу ___ українську мову.', answer: 'вивчити', full: 'Я хочу вивчити українську мову.', en: 'I want to learn Ukrainian.', nl: 'Ik wil Oekraïens leren.' } },
      { prefix: 'на-', verb: 'навчити', meaning: { en: 'to teach (completed)', nl: 'leren (voltooid, iemand iets leren)' },
        sentence: { uk: 'Мама ___ мене готувати.', answer: 'навчила', full: 'Мама навчила мене готувати.', en: 'Mom taught me to cook.', nl: 'Mama leerde me koken.' } },
      { prefix: 'пере-', verb: 'перевчити', meaning: { en: 'to retrain, to relearn', nl: 'omscholen, opnieuw leren' },
        sentence: { uk: 'Йому довелося ___ .', answer: 'перевчитися', full: 'Йому довелося перевчитися.', en: 'He had to retrain.', nl: 'Hij moest zich omscholen.' } },
    ],
  },

  // ── 15. ставати (become) ──
  {
    base: 'ставати',
    meaning: { en: 'to become, to stand up', nl: 'worden, opstaan' },
    level: 'B1',
    prefixed: [
      { prefix: 'від-', verb: 'відставати', meaning: { en: 'to fall behind, to lag', nl: 'achterblijven, achterlopen' },
        sentence: { uk: 'Він ___ від групи.', answer: 'відстає', full: 'Він відстає від групи.', en: 'He is falling behind the group.', nl: 'Hij loopt achter op de groep.' } },
      { prefix: 'при-', verb: 'приставати', meaning: { en: 'to pester, to stick to', nl: 'lastigvallen, zich aansluiten' },
        sentence: { uk: 'Не ___ до мене!', answer: 'приставай', full: 'Не приставай до мене!', en: "Don't bother me!", nl: 'Val me niet lastig!' } },
      { prefix: 'пере-', verb: 'переставати', meaning: { en: 'to stop, to cease', nl: 'stoppen, ophouden' },
        sentence: { uk: 'Дощ ___ .', answer: 'перестав', full: 'Дощ перестав.', en: 'The rain stopped.', nl: 'De regen stopte.' } },
    ],
  },
];

// ── Builder functions ─────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build "choose prefix" questions (MC)
export function buildPrefixChoiceQuestions(count = 10) {
  const all = [];
  for (const bv of BASE_VERBS) {
    for (const pv of bv.prefixed) {
      all.push({
        type: 'choose_prefix',
        base: bv.base,
        baseMeaning: bv.meaning,
        level: bv.level,
        correctPrefix: pv.prefix,
        verb: pv.verb,
        meaning: pv.meaning,
      });
    }
  }
  return shuffle(all).slice(0, count);
}

// Build "identify meaning" questions (MC)
export function buildMeaningQuestions(count = 10) {
  const all = [];
  for (const bv of BASE_VERBS) {
    for (const pv of bv.prefixed) {
      all.push({
        type: 'identify_meaning',
        base: bv.base,
        baseMeaning: bv.meaning,
        level: bv.level,
        verb: pv.verb,
        prefix: pv.prefix,
        correctMeaning: pv.meaning,
      });
    }
  }
  return shuffle(all).slice(0, count);
}

// Build "fill in blank" questions (typing)
export function buildSentenceQuestions(count = 10) {
  const all = [];
  for (const bv of BASE_VERBS) {
    for (const pv of bv.prefixed) {
      if (!pv.sentence) continue;
      all.push({
        type: 'fill_blank',
        base: bv.base,
        baseMeaning: bv.meaning,
        level: bv.level,
        verb: pv.verb,
        prefix: pv.prefix,
        meaning: pv.meaning,
        sentence: pv.sentence.uk,
        answer: pv.sentence.answer,
        fullSentence: pv.sentence.full,
        translation: pv.sentence,
      });
    }
  }
  return shuffle(all).slice(0, count);
}

// Build mixed drill set
export function buildPrefixDrillSet(count = 25) {
  const choiceCount = Math.ceil(count * 0.4);
  const meaningCount = Math.ceil(count * 0.3);
  const sentenceCount = count - choiceCount - meaningCount;

  const mixed = [
    ...buildPrefixChoiceQuestions(choiceCount),
    ...buildMeaningQuestions(meaningCount),
    ...buildSentenceQuestions(sentenceCount),
  ];
  return shuffle(mixed).slice(0, count);
}

// Get all unique prefixed verbs for a base verb
export function findBaseVerb(base) {
  return BASE_VERBS.find(bv => bv.base === base);
}

// Get all distractors for MC questions
export function getDistractorPrefixes(correctPrefix, count = 3) {
  const allPrefixes = PREFIXES.map(p => p.prefix).filter(p => p !== correctPrefix);
  return shuffle(allPrefixes).slice(0, count);
}

export function getDistractorMeanings(correctMeaning, count = 3) {
  const allMeanings = [];
  for (const bv of BASE_VERBS) {
    for (const pv of bv.prefixed) {
      const m = pv.meaning;
      if (m.en !== correctMeaning.en) allMeanings.push(m);
    }
  }
  return shuffle(allMeanings).slice(0, count);
}
