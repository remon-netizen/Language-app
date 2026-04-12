export function setupRecognition(lang, onResult, onEnd) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { alert('Your browser does not support speech recognition. Please use Chrome or Edge.'); return null; }
  const rec = new SR();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = false;
  rec.maxAlternatives = 3;
  rec.onresult = onResult;
  rec.onerror = (e) => {
    if (e.error === 'not-allowed') document.getElementById('micNotice').classList.add('show');
    if (onEnd) onEnd();
  };
  rec.onend = () => { if (onEnd) onEnd(); };
  return rec;
}
