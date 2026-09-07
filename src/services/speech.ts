import * as Speech from 'expo-speech';
import { AppLanguage } from '../types';

const SPEECH_LANGUAGE: Record<AppLanguage, string> = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  te: 'te-IN',
  ml: 'ml-IN',
  kn: 'kn-IN',
};

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'samantha',
  'victoria',
  'karen',
  'moira',
  'tessa',
  'veena',
  'zira',
  'hazel',
  'susan',
  'fiona',
  'kate',
  'serena',
  'lekha',
  'priya',
  'heera',
  'meera',
  'google uk english female',
  'microsoft zira',
  'grandma',
  'elder',
];

const MALE_VOICE_HINTS = [
  'male',
  'man',
  'daniel',
  'david',
  'james',
  'alex',
  'fred',
  'rishi',
  'tom',
  'mark',
  'aaron',
  'nathan',
  'google uk english male',
];

const voiceCache: Partial<Record<AppLanguage, string>> = {};

function matchesLanguage(voiceLanguage: string, appLanguage: AppLanguage): boolean {
  const normalized = voiceLanguage.toLowerCase().replace('_', '-');
  const prefix = SPEECH_LANGUAGE[appLanguage].split('-')[0];
  return normalized.startsWith(prefix);
}

function isLikelyFemaleVoice(name: string): boolean {
  const lower = name.toLowerCase();
  if (MALE_VOICE_HINTS.some((hint) => lower.includes(hint))) {
    return false;
  }
  return FEMALE_VOICE_HINTS.some((hint) => lower.includes(hint));
}

function scoreVoice(name: string, quality: string): number {
  const lower = name.toLowerCase();
  let score = 0;

  if (isLikelyFemaleVoice(name)) score += 10;
  if (lower.includes('enhanced')) score += 3;
  if (lower.includes('premium')) score += 2;
  if (lower.includes('india') || lower.includes('-in')) score += 2;
  if (quality === 'Enhanced') score += 2;

  return score;
}

/** Pick the best available female voice for grandmother-style narration. */
export async function getGrandmaVoiceId(language: AppLanguage): Promise<string | undefined> {
  if (voiceCache[language]) {
    return voiceCache[language];
  }

  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const candidates = voices
      .filter((voice) => matchesLanguage(voice.language, language))
      .map((voice) => ({
        id: voice.identifier,
        score: scoreVoice(voice.name, voice.quality),
        isFemale: isLikelyFemaleVoice(voice.name),
      }))
      .filter((voice) => voice.isFemale)
      .sort((a, b) => b.score - a.score);

    if (candidates.length > 0) {
      voiceCache[language] = candidates[0].id;
      return candidates[0].id;
    }

    const languageFallback = voices
      .filter((voice) => matchesLanguage(voice.language, language))
      .filter((voice) => !MALE_VOICE_HINTS.some((hint) => voice.name.toLowerCase().includes(hint)))
      .sort((a, b) => scoreVoice(b.name, b.quality) - scoreVoice(a.name, a.quality));

    if (languageFallback.length > 0) {
      voiceCache[language] = languageFallback[0].identifier;
      return languageFallback[0].identifier;
    }
  } catch {
    // Web or platform may not expose voice list — fall back to language default.
  }

  return undefined;
}

/** Grandmother-style narration using a female device/browser voice. */
export async function speakAsGrandma(text: string, language: AppLanguage): Promise<void> {
  await Speech.stop();

  const voice = await getGrandmaVoiceId(language);

  return new Promise((resolve, reject) => {
    Speech.speak(text, {
      language: SPEECH_LANGUAGE[language],
      voice,
      rate: 0.78,
      pitch: 0.95,
      onDone: () => resolve(),
      onStopped: () => resolve(),
      onError: (error) => reject(error),
    });
  });
}

export async function stopGrandmaSpeech(): Promise<void> {
  await Speech.stop();
}

export async function isGrandmaSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}

export function isMockAudioUrl(url?: string): boolean {
  return !url || url.includes('/mock/');
}

export async function listGrandmaVoices(language: AppLanguage): Promise<string[]> {
  const voices = await Speech.getAvailableVoicesAsync();
  return voices
    .filter((voice) => matchesLanguage(voice.language, language))
    .filter((voice) => isLikelyFemaleVoice(voice.name))
    .map((voice) => voice.name);
}
