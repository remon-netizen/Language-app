import { state } from './state.js';
import { escHtml } from './utils.js';
import { getCourses } from './review.js';
import { getWordsCount, getDueWords } from './words.js';
import { getAllMastery as verbMastery } from './data/verb-weakness.js';
import { getAllMastery as caseMastery } from './data/case-weakness.js';
import { getAllMastery as prefixMastery } from './data/prefix-weakness.js';
import { totalAttempts as numbersAttempts, weakKeys as numbersWeak } from './data/numbers-weakness.js';
import { tracker as sentenceTracker } from './grammar/sentence-build-ui.js';
import { tracker as dialogueTracker } from './grammar/dialogue-ui.js';
import { DIALOGUES } from './data/dialogues-uk.js';
import { currentStreak, lastDays, totalAnswers, activeDays } from './data/activity.js';
import { downloadBackup, lastBackup, parseBackup, restoreBackup } from './backup.js';

// ── One screen with every number the app keeps ───────────────────────────────

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

function sumMastery(m) {
  let attempts = 0, correct = 0, weak = 0, items = 0;
  for (const v of Object.values(m)) { attempts += v.attempts; correct += v.correct; items++; if (v.attempts && v.pct < 50) weak++; }
  return { attempts, correct, weak, items, pct: attempts ? Math.round(correct / attempts * 100) : 0 };
}

function bar(pct, cls = '') {
  return `<div class="pg-bar"><div class="pg-bar-fill ${cls}" style="width:${Math.max(0, Math.min(100, pct))}%"></div></div>`;
}

export function openProgressScreen() {
  window.showScreen('progressScreen');
  const s = document.getElementById('progressScreen');
  const nl = state.nativeLanguage === 'nl';
  const isUK = state.currentLanguage === 'uk';
  const isNL = state.nativeLanguage === 'nl';

  // Review queues
  const words = getWordsCount(), dueWords = getDueWords().length;

  // Drills
  const drills = isUK ? [
    { icon: '✍️', name: L('Verb Drill', 'Werkwoord Drill'), m: sumMastery(verbMastery()), open: 'openVerbDrillScreen()' },
    { icon: '📌', name: L('Case Drill', 'Naamvallen Drill'), m: sumMastery(caseMastery()), open: 'openCaseDrillScreen()' },
    { icon: '🔗', name: L('Prefix Drill', 'Voorvoegsel Drill'), m: sumMastery(prefixMastery()), open: 'openPrefixDrillScreen()' },
    { icon: '🔢', name: L('Numbers & Time', 'Getallen & Tijd'), m: { attempts: numbersAttempts(), weak: numbersWeak().length, pct: null }, open: 'openNumbersDrillScreen()' },
    { icon: '🧩', name: L('Sentence Builder', 'Zinnen bouwen'), m: { attempts: sentenceTracker.totalAttempts(), correct: sentenceTracker.totalCorrect(), weak: sentenceTracker.weakKeys().length }, open: 'openSentenceBuildScreen()' },
    { icon: '🎧', name: L('Dialogues', 'Dialogen'), m: { attempts: dialogueTracker.totalAttempts(), correct: dialogueTracker.totalCorrect(), weak: dialogueTracker.weakKeys().length, done: new Set(dialogueTracker.seenKeys().map(k => k.split(':')[1])).size, of: DIALOGUES.length }, open: 'openDialogueScreen()' },
  ] : [];
  drills.forEach(d => { if (d.m.pct == null && d.m.attempts && d.m.correct != null) d.m.pct = Math.round(d.m.correct / d.m.attempts * 100); });

  // Activity
  const streak = currentStreak();
  const days = lastDays(14);
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const weekday = d => d.toLocaleDateString(nl ? 'nl-NL' : 'en-GB', { weekday: 'narrow' });

  // Backup: when the last one was, and whether it is time for another
  const fmtDate = t => new Date(t).toLocaleDateString(nl ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const last = lastBackup();
  const backupOld = totalAnswers() > 0 && (!last || Date.now() - last > 14 * 86400_000);

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
        <div class="pg-streak-title">${streak > 0 ? L(`${streak}-day streak`, `${streak} dagen op rij`) : L('No streak yet', 'Nog geen reeks')}</div>
        <div class="pg-streak-sub">${totalAnswers()} ${L('answers over', 'antwoorden op')} ${activeDays()} ${L('days', 'dagen')}</div>
      </div>
      <div class="pg-days">
        ${days.map(d => `<div class="pg-day" title="${d.key}: ${d.count}"><div class="pg-day-bar" style="height:${Math.round(d.count / maxDay * 100)}%"></div><div class="pg-day-label">${weekday(d.date)}</div></div>`).join('')}
      </div>
    </div>

    <div class="pg-section">${L('Backup', 'Back-up')}</div>
    <div class="pg-card pg-backup ${backupOld ? 'pg-backup-old' : ''}">
      <span class="pg-row-title">💾 ${L('Your progress lives in this browser', 'Je voortgang staat in deze browser')}</span>
      <span class="pg-row-sub" id="pgBackupSub">${last
        ? L(`Last backup: ${fmtDate(last)}`, `Laatste back-up: ${fmtDate(last)}`)
        : L('No backup yet. A browser reset or a new phone would lose everything.', 'Nog geen back-up. Bij een reset van de browser of een nieuwe telefoon ben je alles kwijt.')}</span>
      <div class="pg-backup-actions">
        <button class="pg-backup-btn pg-backup-primary" id="pgBackup" type="button">⬇️ ${L('Download backup', 'Back-up downloaden')}</button>
        <button class="pg-backup-btn" id="pgRestore" type="button">⬆️ ${L('Restore from file', 'Terugzetten uit bestand')}</button>
        <input type="file" id="pgRestoreFile" accept="application/json,.json" hidden>
      </div>
      <div class="pg-backup-note" id="pgBackupNote" hidden></div>
    </div>

    <div class="pg-section">${L('Review queues', 'Herhaalrijen')}</div>
    <button class="pg-card pg-row" onclick="openWordsScreen()">
      <span class="pg-row-icon">📇</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${words} ${L('saved words', 'opgeslagen woorden')} ${dueWords ? `<span class="pg-due">${dueWords} ${L('due', 'aan de beurt')}</span>` : ''}</span>
        <span class="pg-row-sub">${L('From conversations', 'Uit gesprekken')}</span>
      </span>
    </button>
    ${getCourses().map(c => { const st = c.stats(); return `
    <button class="pg-card pg-row" onclick="${c.open}">
      <span class="pg-row-icon">${c.icon}</span>
      <span class="pg-row-text">
        <span class="pg-row-title">${st.learned} / ${st.total} ${c.unit[isNL ? 'nl' : 'en']} ${L('learned', 'geleerd')} ${st.due ? `<span class="pg-due">${st.due} ${L('due', 'aan de beurt')}</span>` : ''}</span>
        <span class="pg-row-sub">${c.name[isNL ? 'nl' : 'en']} · ${st.seen} ${L('seen', 'gezien')}${st.weak ? ' · ' + st.weak + ' ' + L('weak', 'zwak') : ''}</span>
        ${bar(st.learned / st.total * 100, 'pg-fill-pink')}
      </span>
    </button>`; }).join('')}

    ${drills.length ? `<div class="pg-section">${L('Drills', 'Drills')}</div>` : ''}
    ${drills.map(d => `
      <button class="pg-card pg-row" onclick="${d.open}">
        <span class="pg-row-icon">${d.icon}</span>
        <span class="pg-row-text">
          <span class="pg-row-title">${escHtml(d.name)} ${d.m.attempts ? `<span class="pg-pct">${d.m.pct != null ? d.m.pct + '%' : ''}</span>` : ''}</span>
          <span class="pg-row-sub">${d.m.attempts
            ? `${d.m.attempts} ${L('answers', 'antwoorden')}${d.m.items ? ` · ${d.m.items} ${L('items', 'items')}` : ''}${d.m.done != null ? ` · ${d.m.done}/${d.m.of} ${L('dialogues', 'dialogen')}` : ''} · ${d.m.weak} ${L('weak', 'zwak')}`
            : L('Not started', 'Nog niet begonnen')}</span>
          ${d.m.attempts && d.m.pct != null ? bar(d.m.pct, d.m.pct >= 80 ? 'pg-fill-green' : d.m.pct >= 50 ? 'pg-fill-amber' : 'pg-fill-red') : ''}
        </span>
      </button>`).join('')}
`;

  wireBackup(s, fmtDate);
}

// ── Backup buttons ───────────────────────────────────────────────────────────

function wireBackup(s, fmtDate) {
  const note = (text, bad = false) => { const n = s.querySelector('#pgBackupNote'); n.textContent = text; n.hidden = false; n.classList.toggle('pg-backup-bad', bad); };
  s.querySelector('#pgBackup').addEventListener('click', () => {
    const b = downloadBackup();
    s.querySelector('#pgBackupSub').textContent = L(`Last backup: ${fmtDate(Date.now())}`, `Laatste back-up: ${fmtDate(Date.now())}`);
    s.querySelector('.pg-backup').classList.remove('pg-backup-old');
    note(L(`Saved ${b.keys} items. Keep the file somewhere safe (cloud drive, mail to yourself).`, `${b.keys} items opgeslagen. Bewaar het bestand op een veilige plek (cloud, mail naar jezelf).`));
  });
  const file = s.querySelector('#pgRestoreFile');
  s.querySelector('#pgRestore').addEventListener('click', () => { file.value = ''; file.click(); });
  file.addEventListener('change', async () => {
    const f = file.files[0];
    if (!f) return;
    let b;
    try { b = parseBackup(await f.text()); }
    catch (e) {
      note(e.message === 'not-json' ? L('That file is not readable as JSON.', 'Dat bestand is niet leesbaar als JSON.') : L('That is not a backup of this app.', 'Dat is geen back-up van deze app.'), true);
      return;
    }
    const when = b.exported ? fmtDate(Date.parse(b.exported)) : '?';
    const ok = window.confirm(L(`Replace everything on this device with the backup of ${when} (${b.keys ?? Object.keys(b.data).length} items)? Current progress here will be lost.`,
                                `Alles op dit apparaat vervangen door de back-up van ${when} (${b.keys ?? Object.keys(b.data).length} items)? De huidige voortgang hier gaat verloren.`));
    if (!ok) return;
    restoreBackup(b);
    note(L('Restored. Reloading…', 'Teruggezet. Herladen…'));
    setTimeout(() => window.location.reload(), 400);
  });
}
