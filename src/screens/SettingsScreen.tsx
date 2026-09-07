import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguageSelector } from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';
import { AppLanguage } from '../types';
import { colors, spacing } from '../theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { narrationLanguage, setNarrationLanguage } = useLanguage();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t('settings.narrationLanguage')}</Text>
      <Text style={styles.sectionHint}>{t('settings.narrationHint')}</Text>
      <LanguageSelector
        value={narrationLanguage}
        onChange={(lang: AppLanguage) => setNarrationLanguage(lang)}
      />

      <View style={styles.aboutCard}>
        <Text style={styles.aboutTitle}>{t('settings.about')}</Text>
        <Text style={styles.aboutText}>{t('settings.aboutText')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  sectionHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  aboutCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
