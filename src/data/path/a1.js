// A1 units of the course path. Shape: see ./index.js.
export const A1 = [
  {
    id: 'a1-01', level: 'A1', icon: '👋',
    title: { en: 'Hello, I am…', nl: 'Hallo, ik ben…' },
    grammar: { en: 'Я / ти / він / вона · "to be" is left out', nl: 'Я / ти / він / вона · "zijn" valt weg' },
    explain: {
      en: `Ukrainian has no present tense of **to be** in a sentence like "I am Mark". You simply put the two words next to each other.

> Я Марк. — I (am) Mark.
> Вона студентка. — She (is) a student.
> Це Олена. — This (is) Olena.

The personal pronouns you need first:

- \`я\` I · \`ти\` you (one person, informal)
- \`він\` he · \`вона\` she · \`воно\` it
- \`ми\` we · \`ви\` you (several people, or one person politely) · \`вони\` they

**Ви** is also the polite "you" for one adult you do not know. Use it with strangers, shop staff and older people; use **ти** with friends and family.

A question that expects yes or no keeps the same word order; only the voice goes up:

> Ти Марк? — (Are) you Mark?
> Так, я Марк. — Yes, I (am) Mark.
> Ні, я не Марк. — No, I (am) not Mark.`,
      nl: `Oekraïens heeft geen tegenwoordige tijd van **zijn** in een zin als "ik ben Mark". Je zet de twee woorden gewoon naast elkaar.

> Я Марк. — Ik (ben) Mark.
> Вона студентка. — Zij (is) studente.
> Це Олена. — Dit (is) Olena.

De persoonlijke voornaamwoorden die je eerst nodig hebt:

- \`я\` ik · \`ти\` jij (één persoon, informeel)
- \`він\` hij · \`вона\` zij · \`воно\` het
- \`ми\` wij · \`ви\` jullie (of één persoon beleefd: u) · \`вони\` zij (meervoud)

**Ви** is ook de beleefde "u" voor één volwassene die je niet kent. Gebruik het bij onbekenden, winkelpersoneel en ouderen; **ти** bij vrienden en familie.

Een ja/nee-vraag houdt dezelfde woordvolgorde; alleen de toon gaat omhoog:

> Ти Марк? — (Ben) jij Mark?
> Так, я Марк. — Ja, ik (ben) Mark.
> Ні, я не Марк. — Nee, ik (ben) niet Mark.`,
    },
    words: [
      ['я', 'I', 'ik', 'pron', ''],
      ['ти', 'you (one person, informal)', 'jij / je', 'pron', ''],
      ['він', 'he', 'hij', 'pron', ''],
      ['вона', 'she', 'zij / ze', 'pron', ''],
      ['ми', 'we', 'wij / we', 'pron', ''],
      ['ви', 'you (plural or polite)', 'jullie / u', 'pron', ''],
      ['вони', 'they', 'zij / ze (meervoud)', 'pron', ''],
      ['це', 'this / this is', 'dit / dit is', 'pron', ''],
      ['привіт', 'hi / hello (informal)', 'hoi / hallo (informeel)', 'expr', ''],
      ['студент', 'student (male)', 'student', 'n', 'm'],
      ['студентка', 'student (female)', 'studente', 'n', 'f'],
      ['друг', 'friend (male)', 'vriend', 'n', 'm'],
      ['подруга', 'friend (female)', 'vriendin', 'n', 'f'],
      ['так', 'yes', 'ja', 'part', ''],
      ['ні', 'no', 'nee', 'part', ''],
      ['не', 'not', 'niet', 'part', ''],
    ],
    sentences: [
      { uk: 'Я Марк.', en: 'I am Mark.', nl: 'Ik ben Mark.', hint: ['я', 'Марк'],
        note: { en: 'No word for "am": the pronoun and the name stand side by side.', nl: 'Geen woord voor "ben": voornaamwoord en naam staan naast elkaar.' } },
      { uk: 'Це Олена.', en: 'This is Olena.', nl: 'Dit is Olena.', hint: ['це', 'Олена'],
        note: { en: 'це introduces someone or something: "this (is)".', nl: 'це stelt iemand of iets voor: "dit (is)".' } },
      { uk: 'Вона студентка.', en: 'She is a student.', nl: 'Zij is studente.', hint: ['вона', 'студентка'],
        note: { en: 'No article either: студентка = "a student" and "the student".', nl: 'Ook geen lidwoord: студентка = "een studente" en "de studente".' } },
      { uk: 'Він мій друг.', en: 'He is my friend.', nl: 'Hij is mijn vriend.', hint: ['він', 'мій', 'друг'],
        note: { en: 'мій = my, for a masculine noun like друг.', nl: 'мій = mijn, bij een mannelijk woord zoals друг.' } },
      { uk: 'Ти студент?', en: 'Are you a student?', nl: 'Ben jij student?', hint: ['ти', 'студент'],
        note: { en: 'A yes/no question is the statement with rising intonation and a question mark.', nl: 'Een ja/nee-vraag is de bewering met stijgende toon en een vraagteken.' } },
      { uk: 'Так, я студент.', en: 'Yes, I am a student.', nl: 'Ja, ik ben student.', hint: ['так', 'я', 'студент'],
        note: { en: 'так = yes. A comma after it, as in English.', nl: 'так = ja. Een komma erna, net als in het Nederlands.' } },
      { uk: 'Ні, я не студент.', en: 'No, I am not a student.', nl: 'Nee, ik ben geen student.', hint: ['ні', 'я', 'не', 'студент'],
        note: { en: 'ні answers the question, не negates the word that follows it.', nl: 'ні beantwoordt de vraag, не ontkent het woord erna.' } },
      { uk: 'Ми студенти.', en: 'We are students.', nl: 'Wij zijn studenten.', hint: ['ми', 'студент'],
        note: { en: 'Plural of студент: студенти (-и).', nl: 'Meervoud van студент: студенти (-и).' } },
    ],
    exercises: [
      { type: 'gap', uk: '___ Марк.', answer: 'Я', en: 'I am Mark.', nl: 'Ik ben Mark.' },
      { type: 'gap', uk: '___ студентка.', answer: 'Вона', en: 'She is a student.', nl: 'Zij is studente.' },
      { type: 'gap', uk: 'Ні, я ___ студент.', answer: 'не', en: 'No, I am not a student.', nl: 'Nee, ik ben geen student.',
        note: { en: 'не goes right before the word it negates.', nl: 'не staat direct voor het woord dat het ontkent.' } },
      { type: 'choose', uk: '___ Олена. (This is Olena.)', options: ['Це', 'Ти', 'Вона'], correct: 0, en: 'This is Olena.', nl: 'Dit is Olena.' },
      { type: 'choose', uk: 'Він мій ___.', options: ['подруга', 'друг', 'студентка'], correct: 1, en: 'He is my friend.', nl: 'Hij is mijn vriend.',
        note: { en: 'він is "he", so the friend is a man: друг.', nl: 'він is "hij", dus de vriend is een man: друг.' } },
      { type: 'choose', uk: 'Ти студент? — ___, я студент.', options: ['Ні', 'Не', 'Так'], correct: 2, en: 'Are you a student? — Yes, I am a student.', nl: 'Ben jij student? — Ja, ik ben student.' },
    ],
  },
];
