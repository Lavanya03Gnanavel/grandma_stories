import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';

import i18n from './src/i18n';
import { LanguageProvider } from './src/context/LanguageContext';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <ErrorBoundary>
            <StatusBar style="dark" />
            <AppNavigator />
          </ErrorBoundary>
        </LanguageProvider>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}
