import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Audio } from 'expo-av';

import { AudioPlayer } from '../components/AudioPlayer';
import { LanguageSelector } from '../components/LanguageSelector';
import { storyApi, narrationApi } from '../services/api';
import {
  isMockAudioUrl,
  speakAsGrandma,
  stopGrandmaSpeech,
} from '../services/speech';
import { API_BASE_URL } from '../config/api';
import { getLanguageLabel, isAppLanguage } from '../constants/languages';
import { AppLanguage, Narration, RootStackParamList, Story } from '../types';
import { colors, spacing } from '../theme';
import { detectTextLanguage } from '../utils/languageDetection';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'StoryReader'>;
  route: RouteProp<RootStackParamList, 'StoryReader'>;
};

function resolveAudioUrl(url: string): string {
  const mediaHost = API_BASE_URL.replace(':8080', ':8084');
  return url
    .replace('http://localhost:8084', mediaHost)
    .replace('http://127.0.0.1:8084', mediaHost);
}

export default function StoryReaderScreen({ route }: Props) {
  const { storyId, language: initialLanguage } = route.params;
  const { t } = useTranslation();

  const [story, setStory] = useState<Story | null>(null);
  const [narrations, setNarrations] = useState<Narration[]>([]);
  const [displayTitle, setDisplayTitle] = useState('');
  const [language, setLanguage] = useState<AppLanguage>(
    isAppLanguage(initialLanguage) ? initialLanguage : 'en'
  );
  const [currentPage, setCurrentPage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    loadStory();
    return () => {
      stopGrandmaSpeech();
      soundRef.current?.unloadAsync();
    };
  }, [storyId]);

  useEffect(() => {
    if (story) {
      loadNarrations(language);
    }
  }, [language, story]);

  const loadStory = async () => {
    try {
      const data = await storyApi.get(storyId);
      setStory(data);
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const loadNarrations = async (lang: AppLanguage) => {
    if (!story) return;

    try {
      setGenerating(true);
      const sourceLanguage: AppLanguage = isAppLanguage(story.language)
        ? story.language
        : 'en';

      const data = await narrationApi.generate({
        storyId,
        pages: story.pages,
        language: lang,
        sourceLanguage,
      });

      setNarrations(data);

      const detectedSource = detectTextLanguage(story.title + ' ' + story.content, sourceLanguage);

      if (lang === detectedSource) {
        setDisplayTitle(story.title);
      } else {
        const translated = await narrationApi.translate({
          text: story.title,
          sourceLanguage: detectedSource,
          targetLanguage: lang,
        });
        setDisplayTitle(translated.translatedText);
      }

      setCurrentPage(0);
      await stopAudio();
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setGenerating(false);
    }
  };

  const stopAudio = async () => {
    await stopGrandmaSpeech();
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleLanguageChange = async (lang: AppLanguage) => {
    if (lang === language) return;
    await stopAudio();
    setLanguage(lang);
  };

  const playWithSpeech = async (text: string) => {
    setIsPlaying(true);
    try {
      await speakAsGrandma(text, language);
    } catch {
      Alert.alert(t('common.error'));
    } finally {
      setIsPlaying(false);
    }
  };

  const playWithAudioFile = async (audioUrl: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: resolveAudioUrl(audioUrl) },
        { shouldPlay: true, rate: 0.9 }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      Alert.alert(t('common.error'));
      setIsPlaying(false);
    }
  };

  const handlePlayPause = async () => {
    const narration = narrations[currentPage];
    const pageText = narration?.text ?? story?.pages[currentPage] ?? story?.content;
    if (!pageText) return;

    if (isPlaying) {
      await stopAudio();
      return;
    }

    if (narration?.audioUrl && !isMockAudioUrl(narration.audioUrl)) {
      await playWithAudioFile(narration.audioUrl);
      return;
    }

    await playWithSpeech(pageText);
  };

  const goToPage = async (page: number) => {
    await stopAudio();
    setCurrentPage(page);
  };

  if (loading || !story) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  const pageText =
    narrations.find((n) => n.pageNumber === currentPage + 1)?.text ??
    narrations[currentPage]?.text ??
    story.pages[currentPage] ??
    story.content;
  const totalPages = story.pages.length;

  return (
    <View style={styles.container}>
      <LanguageSelector value={language} onChange={handleLanguageChange} />

      <Text style={styles.title}>{displayTitle || story.title}</Text>

      <ScrollView style={styles.pageContainer} contentContainerStyle={styles.pageContent}>
        {generating ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>{t('reader.generating')}</Text>
          </View>
        ) : (
          <Text style={styles.pageText}>{pageText}</Text>
        )}
      </ScrollView>

      <AudioPlayer
        isPlaying={isPlaying}
        onPlayPause={handlePlayPause}
        onPrevious={() => goToPage(Math.max(0, currentPage - 1))}
        onNext={() => goToPage(Math.min(totalPages - 1, currentPage + 1))}
        pageLabel={`${t('reader.page')} ${currentPage + 1} ${t('reader.of')} ${totalPages}`}
        narratedByLabel={t('reader.narratedBy')}
        canGoPrevious={currentPage > 0}
        canGoNext={currentPage < totalPages - 1}
        disabled={generating}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  languageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pageContainer: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  pageContent: {
    padding: spacing.lg,
  },
  pageText: {
    fontSize: 20,
    lineHeight: 32,
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },
});
