import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

interface AudioPlayerProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  pageLabel: string;
  narratedByLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  disabled?: boolean;
}

export function AudioPlayer({
  isPlaying,
  onPlayPause,
  onPrevious,
  onNext,
  pageLabel,
  narratedByLabel,
  canGoPrevious,
  canGoNext,
  disabled = false,
}: AudioPlayerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.narratedBy}>{narratedByLabel}</Text>
      <Text style={styles.pageLabel}>{pageLabel}</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, !canGoPrevious && styles.controlDisabled]}
          onPress={onPrevious}
          disabled={!canGoPrevious}
        >
          <Text style={styles.controlText}>◀</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.playButton, disabled && styles.controlDisabled]}
          onPress={onPlayPause}
          disabled={disabled}
        >
          <Text style={styles.playText}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, !canGoNext && styles.controlDisabled]}
          onPress={onNext}
          disabled={!canGoNext}
        >
          <Text style={styles.controlText}>▶</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  narratedBy: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pageLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.md,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlDisabled: {
    opacity: 0.4,
  },
  controlText: {
    fontSize: 16,
    color: colors.primary,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playText: {
    fontSize: 24,
    color: '#FFFFFF',
  },
});
