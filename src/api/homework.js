// Homework document → speaking practice phrases generator.
import { generateJSON } from './model.js';
//
// Accepts a .docx or .txt file, extracts the text, sends it to Gemini,
// and returns an array of practice phrases in the standard lesson shape:
//   { target, ph, translations: { en?, nl? }, tip: { en?, nl? } }

import { state } from '../state.js';

// ── .docx text extraction ────────────────────────────────────────────────────
// A .docx is a ZIP containing word/document.xml. We load JSZip dynamically
// from CDN the first time it's needed (the app has no build step).

let jsZipPromise = null;

function loadJSZip() {
  if (window.JSZip) return Promise.resolve(window.JSZip);
  if (jsZipPromise) return jsZipPromise;
  jsZipPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => resolve(window.JSZip);
    script.onerror = () => reject(new Error('Could not load JSZip library'));
    document.head.appendChild(script);
  });
  return jsZipPromise;
}

async function extractDocxText(file) {
  const JSZip = await loadJSZip();
  const zip = await JSZip.loadAsync(file);
  const docXml = zip.file('word/document.xml');
  if (!docXml) throw new Error('Not a valid .docx file (word/document.xml missing)');
  const xmlText = await docXml.async('string');
  // Parse XML and extract all <w:t> text nodes.
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');
  const paragraphs = doc.getElementsByTagName('w:p');
  const lines = [];
  for (const p of paragraphs) {
    const texts = p.getElementsByTagName('w:t');
    let line = '';
    for (const t of texts) line += t.textContent;
    if (line.trim()) lines.push(line.trim());
  }
  return lines.join('\n');
}

// ── Read any supported file ──────────────────────────────────────────────────

export async function readHomeworkFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.txt') || name.endsWith('.text')) {
    return file.text();
  }
  if (name.endsWith('.docx')) {
    return extractDocxText(file);
  }
  throw new Error('Unsupported file type. Please use .docx or .txt.');
}

// ── Generate speaking practice from homework text ────────────────────────────

const TARGET_NAME = { uk: 'Ukrainian', nl: 'Dutch', en: 'English', fr: 'French' };
const NATIVE_NAME = { en: 'English', nl: 'Dutch' };

export async function generateHomeworkPhrases(homeworkText) {
  const targetCode = state.currentLanguage;
  const nativeCode = state.nativeLanguage;
  const langName   = TARGET_NAME[targetCode] || 'Ukrainian';
  const nativeName = NATIVE_NAME[nativeCode] || 'English';

  const prompt =
    `You are an experienced ${langName} language teacher. A student has shared their homework from their weekly ${langName} class. ` +
    `Based on this homework, generate 10 practice phrases that help the student master the vocabulary, grammar patterns, and topics covered.\n\n` +
    `HOMEWORK CONTENT:\n"""\n${homeworkText.slice(0, 4000)}\n"""\n\n` +
    `Generate JSON:\n` +
    `{\n  "topic_summary": "One-sentence summary of what this homework covers (in ${nativeName})",\n` +
    `  "phrases": [\n    {\n` +
    `      "target": "${langName} phrase the student should learn to say",\n` +
    `      "ph": "phonetic pronunciation guide (for a ${nativeName} speaker)",\n` +
    `      "translation_native": "${nativeName} translation",\n` +
    `      "tip_native": "A short, helpful tip in ${nativeName} (pronunciation hint, grammar note, or cultural context)"\n` +
    `    }\n  ]\n}\n\n` +
    `Rules:\n` +
    `- Focus on SPEAKING practice — phrases the student will actually say in conversation\n` +
    `- Include vocabulary and grammar patterns from the homework, applied in realistic sentences\n` +
    `- Order from easiest to hardest\n` +
    `- Mix single words, short phrases, and full sentences\n` +
    `- Phonetic guides should be intuitive for a ${nativeName} speaker (stress marked with CAPS)\n` +
    `- Tips in ${nativeName}, brief and practical\n` +
    `- If the homework contains exercises or fill-in-the-blank, use the ANSWERS as the basis for phrases\n` +
    `- If the homework has a dialogue, extract the most useful lines as practice phrases`;

  const parsed = await generateJSON({ system: `You are an expert ${langName} teacher. Return ONLY valid JSON, no markdown fences.`, prompt: prompt, maxTokens: 4000, temperature: 0.4 });

  if (!parsed?.phrases?.length) throw new Error('Could not generate phrases from homework');

  // Convert to standard lesson phrase shape.
  const nativeKey = nativeCode; // 'en' or 'nl'
  return {
    topicSummary: parsed.topic_summary || '',
    phrases: parsed.phrases.slice(0, 12).map(p => ({
      target: p.target,
      ph: p.ph || '',
      translations: { [nativeKey]: p.translation_native },
      tip: { [nativeKey]: p.tip_native ? `💡 ${p.tip_native}` : '' },
    })),
  };
}
