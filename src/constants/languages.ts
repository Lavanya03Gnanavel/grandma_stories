import { AppLanguage } from '../types';

export const APP_LANGUAGES: AppLanguage[] = ['en', 'ta', 'hi', 'te', 'ml', 'kn'];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
};

export const LANGUAGE_NATIVE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ta: 'தமிழ்',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ml: 'മലയാളം',
  kn: 'ಕನ್ನಡ',
};

export const LANGUAGE_PATTERN = 'en|ta|hi|te|ml|kn';

export function isAppLanguage(value: string): value is AppLanguage {
  return APP_LANGUAGES.includes(value as AppLanguage);
}

export function getLanguageLabel(language: AppLanguage): string {
  return LANGUAGE_NATIVE_LABELS[language];
}
