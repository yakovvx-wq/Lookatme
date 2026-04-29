import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Recommendation } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme';

interface FixCardProps {
  rec: Recommendation;
  index: number;
  locked?: boolean;
  onUnlock?: () => void;
  isRTL?: boolean;
}

export default function FixCard({ rec, index, locked = false, onUnlock, isRTL }: FixCardProps) {
  const slideAnim = useRef(new Animated.Value(24)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay: index * 100, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const accentColor = rec.marker_color;
  const rowDir = isRTL ? 'row-reverse' : 'row';

  return (
    <Animated.View style={[styles.card, locked && styles.cardLocked, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.row, { flexDirection: rowDir }]}>
        {/* Colored dot matching the image marker */}
        <View style={[styles.badge, { backgroundColor: accentColor, shadowColor: accentColor }]}>
          <Text style={styles.badgeNum}>{index + 1}</Text>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={locked ? 1 : undefined}>
            {locked ? '••••••••••••' : rec.title}
          </Text>
          {!locked && (
            <>
              <Text style={[styles.recommendation, { textAlign: isRTL ? 'right' : 'left' }]}>
                {rec.recommendation}
              </Text>
              <View style={[styles.quickRow, { flexDirection: rowDir }]}>
                <View style={[styles.quickPill, { backgroundColor: accentColor + '22', borderColor: accentColor + '55' }]}>
                  <Ionicons name="flash-outline" size={11} color={accentColor} />
                  <Text style={[styles.quickText, { color: accentColor }]}>{rec.quick_action}</Text>
                </View>
              </View>
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
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeNum: { color: '#fff', fontWeight: '800', fontSize: 13 },
  content: { flex: 1, gap: 5 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.white },
  recommendation: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  quickRow: { marginTop: 4 },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  quickText: { fontSize: 11, fontWeight: '700' },
  lockBtn: { padding: SPACING.xs },
  lockedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,15,16,0.45)' },
});
