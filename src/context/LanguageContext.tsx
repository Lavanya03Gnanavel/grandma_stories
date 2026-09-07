import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { AppLanguage } from '../types';
import { isAppLanguage } from '../constants/languages';

interface LanguageContextType {
  narrationLanguage: AppLanguage;
  setNarrationLanguage: (lang: AppLanguage) => Promise<void>;
  isReady: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const NARRATION_LANGUAGE_KEY = '@grandma_stories_narration_language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [narrationLanguage, setNarrationLanguageState] = useState<AppLanguage>('en');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const storedNarration = await AsyncStorage.getItem(NARRATION_LANGUAGE_KEY);
        setNarrationLanguageState(
          storedNarration && isAppLanguage(storedNarration) ? storedNarration : 'en'
        );
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const setNarrationLanguage = async (lang: AppLanguage) => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    await AsyncStorage.setItem(NARRATION_LANGUAGE_KEY, lang);
    setNarrationLanguageState(lang);
  };

  return (
    <LanguageContext.Provider value={{ narrationLanguage, setNarrationLanguage, isReady }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
