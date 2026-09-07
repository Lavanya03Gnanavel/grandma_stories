import { AppLanguage } from '../types';

const SCRIPT_RANGES: Array<{ language: AppLanguage; start: number; end: number }> = [
  { language: 'ta', start: 0x0b80, end: 0x0bff },
  { language: 'te', start: 0x0c00, end: 0x0c7f },
  { language: 'kn', start: 0x0c80, end: 0x0cff },
  { language: 'ml', start: 0x0d00, end: 0x0d7f },
  { language: 'hi', start: 0x0900, end: 0x097f },
];

/** Detect the story text language from script and characters. */
export function detectTextLanguage(text: string, fallback: AppLanguage = 'en'): AppLanguage {
  if (!text.trim()) return fallback;

  const scores: Record<AppLanguage, number> = {
    en: 0,
    ta: 0,
    hi: 0,
    te: 0,
    ml: 0,
    kn: 0,
  };

  for (const ch of text) {
    if (/\s|\d/.test(ch)) continue;
    const code = ch.charCodeAt(0);

    if (/[A-Za-z]/.test(ch)) {
      scores.en++;
      continue;
    }

    for (const range of SCRIPT_RANGES) {
      if (code >= range.start && code <= range.end) {
        scores[range.language]++;
      }
    }
  }

  let best: AppLanguage = fallback;
  let bestScore = 0;

  for (const language of Object.keys(scores) as AppLanguage[]) {
    if (scores[language] > bestScore) {
      bestScore = scores[language];
      best = language;
    }
  }

  if (bestScore === 0 && scores.en > 0) {
    return 'en';
  }

  return bestScore > 0 ? best : fallback;
}
