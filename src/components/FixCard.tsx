import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fix } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme';

interface FixCardProps {
  fix: Fix;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  isRTL?: boolean;
}

export default function FixCard({ fix, index, locked = false, onUnlock, isRTL }: FixCardProps) {
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <View style={[styles.row, { flexDirection: rowDir }]}>
        <View style={styles.numberCircle}>
          <Text style={styles.numberText}>{index + 1}</Text>
        </View>

        <View style={styles.textContainer}>
          <Text
            style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}
            numberOfLines={locked ? 1 : undefined}
          >
            {locked ? '••••••••••••' : fix.title}
          </Text>
          {!locked && (
            <>
              <Text style={[styles.compliment, { textAlign: isRTL ? 'right' : 'left' }]}>
                {fix.compliment}
              </Text>
              <Text style={[styles.recommendation, { textAlign: isRTL ? 'right' : 'left' }]}>
                {fix.recommendation}
              </Text>
            </>
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
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  numberText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.dark,
  },
  compliment: {
    fontSize: 13,
    color: COLORS.roseMid,
    lineHeight: 19,
  },
  recommendation: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  lockButton: {
    padding: SPACING.xs,
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 245, 239, 0.6)',
  },
});
