import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Fix } from '../types';
import { COLORS, RING_COLORS, SPACING, RADIUS } from '../theme';

interface FixCardProps {
  fix: Fix;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  isRTL?: boolean;
}

export default function FixCard({ fix, index, locked = false, onUnlock, isRTL }: FixCardProps) {
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 100, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const accentColor = RING_COLORS[index % RING_COLORS.length];
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <Animated.View style={[styles.card, locked && styles.cardLocked, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.row, { flexDirection: rowDir }]}>
        <View style={[styles.badge, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
          <Text style={[styles.badgeNum, { color: accentColor }]}>{index + 1}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={locked ? 1 : undefined}>
            {locked ? '••••••••••••' : fix.title}
          </Text>
          {!locked && (
            <>
              <Text style={[styles.compliment, { textAlign: isRTL ? 'right' : 'left', color: accentColor }]}>
                {fix.compliment}
              </Text>
              <Text style={[styles.recommendation, { textAlign: isRTL ? 'right' : 'left' }]}>
                {fix.recommendation}
              </Text>
            </>
          )}
        </View>

        {locked && (
          <TouchableOpacity style={styles.lockBtn} onPress={onUnlock}>
            <Ionicons name="lock-closed" size={18} color={COLORS.muted} />
          </TouchableOpacity>
        )}
      </View>

      {locked && (
        <View style={StyleSheet.absoluteFillObject as object} pointerEvents="none">
          <View style={styles.lockedOverlay} />
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  cardLocked: { opacity: 0.55 },
  row: { alignItems: 'flex-start', gap: SPACING.sm },
  badge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  badgeNum: { fontWeight: '800', fontSize: 14 },
  content: { flex: 1, gap: 5 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  compliment: { fontSize: 13, lineHeight: 19 },
  recommendation: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  lockBtn: { padding: SPACING.xs },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,15,16,0.45)' },
});
