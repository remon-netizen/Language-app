// ── Backup: the controls, in Settings ────────────────────────────────────────
// Making and restoring a backup is a setting-like chore, so its buttons sit in
// the Settings drawer. The Progress screen only says when the last one was.

import { state } from './state.js';
import { downloadBackup, lastBackup, parseBackup, restoreBackup } from './backup.js';
import { activeDays } from './data/activity.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);
const fmtDate = t => new Date(t).toLocaleDateString(state.nativeLanguage === 'nl' ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const backupStatus = () => {
  const last = lastBackup();
  return last ? L(`Last backup: ${fmtDate(last)}`, `Laatste back-up: ${fmtDate(last)}`) : L('No backup yet', 'Nog geen back-up');
};

// Time to make one: the last is more than two weeks old, or there never was one
// and there are a few days of work to lose by now.
export function backupDue() {
  const last = lastBackup();
  return last ? Date.now() - last > 14 * 86400_000 : activeDays() >= 3;
}

export function renderBackupSection(root) {
  if (!root) return;
  root.innerHTML = `
    <div class="settings-label">${L('Backup', 'Back-up')}</div>
    <div class="bk-status ${backupDue() ? 'bk-due' : ''}" id="bkStatus">${backupStatus()}</div>
    <div class="bk-explain">${L('Your progress lives only in this browser. A backup is one file that puts everything back, on another device too.',
                                'Je voortgang staat alleen in deze browser. Een back-up is één bestand waarmee je alles terugzet, ook op een ander apparaat.')}</div>
    <div class="pg-backup-actions">
      <button class="pg-backup-btn pg-backup-primary" id="bkDownload" type="button">⬇️ ${L('Download', 'Downloaden')}</button>
      <button class="pg-backup-btn" id="bkRestore" type="button">⬆️ ${L('Restore', 'Terugzetten')}</button>
      <input type="file" id="bkFile" accept="application/json,.json" hidden>
    </div>
    <div class="pg-backup-note" id="bkNote" hidden></div>`;

  const note = (text, bad = false) => { const n = root.querySelector('#bkNote'); n.textContent = text; n.hidden = false; n.classList.toggle('pg-backup-bad', bad); };
  root.querySelector('#bkDownload').addEventListener('click', () => {
    const b = downloadBackup();
    const status = root.querySelector('#bkStatus');
    status.textContent = backupStatus();
    status.classList.remove('bk-due');
    note(L(`Saved ${b.keys} items. Keep the file somewhere safe (cloud drive, mail to yourself).`, `${b.keys} items opgeslagen. Bewaar het bestand op een veilige plek (cloud, mail naar jezelf).`));
  });
  const file = root.querySelector('#bkFile');
  root.querySelector('#bkRestore').addEventListener('click', () => { file.value = ''; file.click(); });
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
