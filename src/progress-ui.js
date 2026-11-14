import { state } from './state.js';
import { escHtml } from './utils.js';
import { getCourses } from './review.js';
import { getWordsCount, getDueWords } from './words.js';
import { getAllMastery as verbMastery } from './data/verb-weakness.js';
import { getAllMastery as caseMastery } from './data/case-weakness.js';
import { getAllMastery as prefixMastery } from './data/prefix-weakness.js';
import { totalAttempts as numbersAttempts } from './data/numbers-weakness.js';
import { tracker as sentenceTracker } from './grammar/sentence-build-ui.js';
import { tracker as dialogueTracker } from './grammar/dialogue-ui.js';
import { DIALOGUES } from './data/dialogues-uk.js';
import { currentStreak, lastDays, totalAnswers, activeDays } from './data/activity.js';
import { COURSE_ICON, courseName } from './course-names.js';
import { weakSpots } from './weak-spots.js';
import { backupStatus, backupDue } from './backup-ui.js';

// ── One screen with every number the app keeps ───────────────────────────────
// A course is listed once: what was learned and is scheduled, and under it what
// its free drill has recorded. "Weak" is the number the weak-spots list on Home
// adds up, so the two always agree.

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);
// "1 day" / "3 days"
const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;
const answers = n => L(count(n, 'answer', 'answers'), count(n, 'antwoord', 'antwoorden'));

// Totals of a drill's per-item record: { attempts, pct }
function sumMastery(m) {
  let attempts = 0, correct = 0;
  for (const v of Object.values(m)) { attempts += v.attempts; correct += v.correct; }
  return { attempts, pct: attempts ? Math.round(correct / attempts * 100) : null };
}

function bar(pct, cls = '') {
  return `<div class="pg-bar"><div class="pg-bar-fill ${cls}" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>`;
}

export function openProgressScreen() {
  window.showScreen('progressScreen');
  const s = document.getElementById('progressScreen');
  const nl = state.nativeLanguage === 'nl';
  const lang = nl ? 'nl' : 'en';
  const isUK = state.currentLanguage === 'uk';

  const weakOf = Object.fromEntries(weakSpots().map(x => [x.id, x.count]));
  const weakText = n => (n ? ` · ${n} ${L('weak', 'zwak')}` : '');

  // The free drill of a course keeps its own record of answers.
  const drillOf = isUK ? {
    verbs: sumMastery(verbMastery()), cases: sumMastery(caseMastery()), prefixes: sumMastery(prefixMastery()),
    numbers: { attempts: numbersAttempts(), pct: null },
  } : {};

  const courseRow = c => {
    const st = c.stats(), d = drillOf[c.id];
    const weak = weakOf[c.id === 'mywords' ? 'vocab' : c.id] || 0;
    const drillLine = d && d.attempts ? `${L('Free drill', 'Vrije drill')}: ${answers(d.attempts)}${d.pct != null ? ` · ${d.pct}% ${L('right', 'goed')}` : ''}` : '';
    const learnedLine = st.seen
      ? `${st.learned} / ${st.total} ${c.unit[lang]} ${L('learned', 'geleerd')} · ${st.seen} ${L('seen', 'gezien')}`
      : c.fresh[lang];
    return `
    <button class="pg-card pg-row" onclick="${c.open}">
      <span class="pg-row-icon">${c.icon}</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${escHtml(c.name)} ${st.due ? `<span class="pg-due">${st.due} ${L('due', 'aan de beurt')}</span>` : ''}</span>
        <span class="pg-row-sub">${escHtml(learnedLine)}${drillLine ? '' : weakText(weak)}</span>
        ${drillLine ? `<span class="pg-row-sub">${escHtml(drillLine)}${weakText(weak)}</span>` : ''}
        ${st.seen ? bar(st.learned / st.total * 100, 'pg-fill-pink') : ''}
      </span>
    </button>`;
  };

  // Whole sentences and listening: practice without a schedule.
  const applied = isUK ? [
    { id: 'sentences', open: 'openSentenceBuildScreen()', attempts: sentenceTracker.totalAttempts(), correct: sentenceTracker.totalCorrect(), extra: '' },
    { id: 'dialogues', open: 'openDialogueScreen()', attempts: dialogueTracker.totalAttempts(), correct: dialogueTracker.totalCorrect(),
      extra: ` · ${new Set(dialogueTracker.seenKeys().map(k => k.split(':')[1])).size}/${DIALOGUES.length} ${L('dialogues', 'dialogen')}` },
  ] : [];
  const appliedRow = d => {
    const pct = d.attempts ? Math.round(d.correct / d.attempts * 100) : null;
    return `
      <button class="pg-card pg-row" onclick="${d.open}">
        <span class="pg-row-icon">${COURSE_ICON[d.id]}</span>
        <span class="pg-row-text">
          <span class="pg-row-title">${escHtml(courseName(d.id))} ${pct != null ? `<span class="pg-pct">${pct}%</span>` : ''}</span>
          <span class="pg-row-sub">${d.attempts ? `${answers(d.attempts)}${d.extra}${weakText(weakOf[d.id] || 0)}` : L('Not started', 'Nog niet begonnen')}</span>
          ${pct != null ? bar(pct, pct >= 80 ? 'pg-fill-green' : pct >= 50 ? 'pg-fill-amber' : 'pg-fill-red') : ''}
        </span>
      </button>`;
  };

  // Activity
  const streak = currentStreak();
  const days = lastDays(14);
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const weekday = d => d.toLocaleDateString(nl ? 'nl-NL' : 'en-GB', { weekday: 'narrow' });

  const words = getWordsCount(), dueWords = getDueWords().length;
  const due = backupDue();

  s.innerHTML = `
    <div class="lesson-header">
      <button class="back-btn" onclick="showScreen('homeScreen')">←</button>
      <div>
        <div class="lesson-title">📊 ${L('Progress', 'Voortgang')}</div>
        <div class="lesson-subtitle">${L('Everything the app remembers about your practice', 'Alles wat de app over je oefenen bijhoudt')}</div>
      </div>
    </div>

    <div class="pg-card pg-streak">
      <div class="pg-streak-num">${streak > 0 ? '🔥 ' + streak : '💤'}</div>
      <div class="pg-streak-text">
        <div class="pg-streak-title">${streak > 0 ? L(`${streak}-day streak`, `${count(streak, 'dag', 'dagen')} op rij`) : L('No streak yet', 'Nog geen reeks')}</div>
        <div class="pg-streak-sub">${L(`${count(totalAnswers(), 'answer', 'answers')} over ${count(activeDays(), 'day', 'days')}`, `${count(totalAnswers(), 'antwoord', 'antwoorden')} op ${count(activeDays(), 'dag', 'dagen')}`)}</div>
      </div>
      <div class="pg-days">
        ${days.map(d => `<div class="pg-day" title="${d.key}: ${d.count}"><div class="pg-day-bar" style="height:${Math.round(d.count / maxDay * 100)}%"></div><div class="pg-day-label">${weekday(d.date)}</div></div>`).join('')}
      </div>
    </div>

    <div class="pg-section">${L('Courses', 'Cursussen')}</div>
    ${getCourses().map(courseRow).join('')}

    ${applied.length ? `<div class="pg-section">${L('Whole sentences and listening', 'Hele zinnen en luisteren')}</div>` : ''}
    ${applied.map(appliedRow).join('')}

    <div class="pg-section">${L('My words', 'Mijn woorden')}</div>
    <button class="pg-card pg-row" onclick="openWordsScreen()">
      <span class="pg-row-icon">📇</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${words} ${L('saved words', 'opgeslagen woorden')} ${dueWords ? `<span class="pg-due">${dueWords} ${L('due', 'aan de beurt')}</span>` : ''}</span>
        <span class="pg-row-sub">${L('From conversations', 'Uit gesprekken')}</span>
      </span>
    </button>

    <div class="pg-section">${L('Backup', 'Back-up')}</div>
    <button class="pg-card pg-row ${due ? 'pg-backup-old' : ''}" onclick="toggleSettingsDrawer()">
      <span class="pg-row-icon">💾</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${escHtml(backupStatus())}</span>
        <span class="pg-row-sub">${due
          ? L('Time for a backup: your progress lives only in this browser. The buttons are in Settings.', 'Tijd voor een back-up: je voortgang staat alleen in deze browser. De knoppen staan bij Instellingen.')
          : L('Making and restoring a backup is done in Settings.', 'Een back-up maken of terugzetten doe je bij Instellingen.')}</span>
      </span>
    </button>
`;
}
