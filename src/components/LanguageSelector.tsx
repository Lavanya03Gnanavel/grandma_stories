import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AppLanguage } from '../types';
import { APP_LANGUAGES, LANGUAGE_NATIVE_LABELS } from '../constants/languages';
import { colors, spacing } from '../theme';

interface LanguageSelectorProps {
  value: AppLanguage;
  onChange: (lang: AppLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.row}
      >
        {APP_LANGUAGES.map((lang) => {
          const active = value === lang;
          return (
            <TouchableOpacity
              key={lang}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(lang)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {LANGUAGE_NATIVE_LABELS[lang]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 0,
    flexShrink: 0,
    marginBottom: spacing.sm,
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  chip: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 18,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
});
