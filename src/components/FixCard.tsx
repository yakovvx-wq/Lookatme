import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fix } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme';

const AREA_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  eyes: 'eye-outline',
  eyeliner: 'pencil-outline',
  lips: 'heart-outline',
  brows: 'remove-outline',
  blush: 'color-palette-outline',
  highlight: 'sunny-outline',
  foundation: 'layers-outline',
};

interface FixCardProps {
  fix: Fix;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  isRTL?: boolean;
}

export default function FixCard({ fix, index, locked = false, onUnlock, isRTL }: FixCardProps) {
  const iconName = AREA_ICONS[fix.area] ?? 'brush-outline';
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <View style={[styles.row, { flexDirection: rowDir }]}>
        {/* Number circle */}
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name={iconName} size={18} color={COLORS.roseMid} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={locked ? 1 : undefined}
          >
            {locked ? '••••••••••••' : fix.title}
          </Text>
          {!locked && (
            <Text style={[styles.instruction, { textAlign: isRTL ? 'right' : 'left' }]}>
              {fix.simple_instruction}
            </Text>
          )}
        </View>

        {locked && (
          <TouchableOpacity style={styles.lockButton} onPress={onUnlock}>
            <Ionicons name="lock-closed" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {locked && (
        <View style={StyleSheet.absoluteFillObject as object} pointerEvents="none">
          <View style={styles.lockedOverlay} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardLocked: {
    opacity: 0.7,
  },
  row: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.roseMid,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  numberText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    marginBottom: 4,
  },
  instruction: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 18,
  },
  lockButton: {
    padding: SPACING.xs,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 245, 239, 0.6)',
  },
});
