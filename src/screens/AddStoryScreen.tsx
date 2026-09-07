import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import * as DocumentPicker from 'expo-document-picker';

import { LanguageSelector } from '../components/LanguageSelector';
import { storyApi, narrationApi } from '../services/api';
import axios from 'axios';
import { isAppLanguage } from '../constants/languages';
import { AppLanguage, RootStackParamList } from '../types';
import { colors, spacing } from '../theme';
import { detectTextLanguage } from '../utils/languageDetection';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddStory'>;
};

type PickedFile = {
  uri: string;
  name: string;
  mimeType?: string;
  file?: File;
};

export default function AddStoryScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [pickedFile, setPickedFile] = useState<PickedFile | null>(null);
  const [saving, setSaving] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      setPickedFile({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        file: asset.file,
      });
      setContent('');

      if (!title.trim()) {
        const fileTitle = asset.name.replace(/\.(pdf|docx)$/i, '').replace(/[_-]/g, ' ');
        setTitle(fileTitle);
      }
    } catch {
      Alert.alert(t('common.error'));
    }
  };

  const clearDocument = () => {
    setPickedFile(null);
  };

  const startNarration = async (story: Awaited<ReturnType<typeof storyApi.create>>) => {
    const sourceLanguage = detectTextLanguage(
      `${story.title} ${story.content}`,
      isAppLanguage(story.language) ? story.language : 'en'
    );
    const narrationLanguage = language;
    await narrationApi.generate({
      storyId: story.id,
      pages: story.pages,
      language: narrationLanguage,
      sourceLanguage,
    });
    navigation.replace('StoryReader', { storyId: story.id, language: narrationLanguage });
  };

  const handleSubmit = async () => {
    const hasText = Boolean(content.trim());
    const hasFile = Boolean(pickedFile);

    if (!hasText && !hasFile) {
      Alert.alert(t('addStory.missingContentTitle'), t('addStory.missingContentMessage'));
      return;
    }

    try {
      setSaving(true);

      if (hasFile && pickedFile) {
        const story = await storyApi.uploadDocument({
          uri: pickedFile.uri,
          name: pickedFile.name,
          mimeType: pickedFile.mimeType,
          file: pickedFile.file,
          title: title.trim() || undefined,
          language,
        });
        await startNarration(story);
        return;
      }

      if (!title.trim() || !content.trim()) {
        Alert.alert(t('addStory.missingContentTitle'), t('addStory.missingContentMessage'));
        return;
      }

      const story = await storyApi.create({
        title: title.trim(),
        content: content.trim(),
        language: detectTextLanguage(`${title} ${content}`, language),
      });
      await startNarration(story);
    } catch (error) {
      let message = 'Unable to save and narrate the story. Please try again.';
      if (axios.isAxiosError(error)) {
        message = error.response?.data?.message ?? error.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert(t('common.error'), message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>{t('addStory.storyTitle')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('addStory.storyTitlePlaceholder')}
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textSecondary}
      />

      <Text style={styles.label}>{t('addStory.uploadDocument')}</Text>
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument} disabled={saving}>
        <Text style={styles.uploadButtonText}>{t('addStory.chooseFile')}</Text>
      </TouchableOpacity>

      {pickedFile ? (
        <View style={styles.fileCard}>
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>{pickedFile.name}</Text>
            <Text style={styles.fileHint}>{t('addStory.fileHint')}</Text>
          </View>
          <TouchableOpacity onPress={clearDocument}>
            <Text style={styles.removeFile}>{t('addStory.removeFile')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.orText}>{t('addStory.orDivider')}</Text>

          <Text style={styles.label}>{t('addStory.storyContent')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('addStory.storyContentPlaceholder')}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
          />
        </>
      )}

      <Text style={styles.label}>{t('addStory.language')}</Text>
      <Text style={styles.languageHint}>{t('addStory.languageHint')}</Text>
      <LanguageSelector value={language} onChange={setLanguage} />

      <TouchableOpacity
        style={[styles.submitButton, saving && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>{t('addStory.submit')}</Text>
        )}
      </TouchableOpacity>
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
    paddingBottom: spacing.xl,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 180,
  },
  uploadButton: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    padding: spacing.md,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  fileCard: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fileHint: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  removeFile: {
    color: colors.primary,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginVertical: spacing.md,
    fontWeight: '600',
  },
  languageRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  languageHint: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
