import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import { storyApi } from '../services/api';
import { getLanguageLabel, isAppLanguage } from '../constants/languages';
import { AppLanguage, Story, RootStackParamList } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { colors, spacing } from '../theme';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { narrationLanguage } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storyApi.list();
      setStories(data);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useFocusEffect(
    useCallback(() => {
      loadStories();
    }, [loadStories])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>{t('appName')}</Text>
          <Text style={styles.tagline}>{t('tagline')}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddStory')}
      >
        <Text style={styles.addButtonText}>+ {t('home.addStory')}</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadStories}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : stories.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>{t('home.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.storyCard}
              onPress={() =>
                navigation.navigate('StoryReader', {
                  storyId: item.id,
                  language: (isAppLanguage(item.language) ? item.language : narrationLanguage),
                })
              }
            >
              <Text style={styles.storyTitle}>{item.title}</Text>
              <Text style={styles.storyMeta}>
                {getLanguageLabel(isAppLanguage(item.language) ? item.language : 'en')} · {item.pages.length} pages
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  tagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    maxWidth: 280,
  },
  settingsIcon: {
    fontSize: 24,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingBottom: spacing.xl,
  },
  storyCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  storyMeta: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  retryText: {
    color: colors.primary,
    fontWeight: '600',
  },
  loader: {
    marginTop: spacing.xl,
  },
});
