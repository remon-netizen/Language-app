import { state } from './state.js';

const L = (en, nl) => (state.nativeLanguage === 'nl' ? nl : en);

export function setupRecognition(lang, onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert(L('This browser cannot recognise speech. Answering out loud works in Chrome, Edge and Safari.',
            'Deze browser kan geen spraak herkennen. Hardop antwoorden werkt in Chrome, Edge en Safari.'));
    return null;
  }
  const rec = new SR();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  rec.onresult = onResult;
  // An error is followed by an end event: the caller hears about the end once.
  let ended = false;
  const end = () => { if (ended) return; ended = true; if (onEnd) onEnd(); };
  rec.onerror = (e) => {
    if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
      alert(L('The microphone is blocked for this site. Allow it in the browser\'s site settings to answer out loud.',
              'De microfoon is geblokkeerd voor deze site. Sta hem toe bij de site-instellingen van de browser om hardop te antwoorden.'));
    }
    end();
  };
  rec.onend = end;
  return rec;
}
