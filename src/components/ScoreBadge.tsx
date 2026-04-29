import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, RING_COLORS } from '../theme';

interface ScoreBadgeProps {
  score: number;
  size?: 'large' | 'medium' | 'small';
  animate?: boolean;
}

function ringColor(score: number) {
  if (score >= 8.5) return COLORS.green;
  if (score >= 7)   return COLORS.yellow;
  if (score >= 5)   return COLORS.orange;
  return COLORS.pink;
}

export default function ScoreBadge({ score, size = 'large', animate = true }: ScoreBadgeProps) {
  const scaleAnim  = useRef(new Animated.Value(animate ? 0.5 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const countAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) { scaleAnim.setValue(1); opacityAnim.setValue(1); countAnim.setValue(score); return; }
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(countAnim, { toValue: score, duration: 900, useNativeDriver: false }),
    ]).start();
  }, [score]);

  const color = ringColor(score);
  const dim   = size === 'large' ? 120 : size === 'medium' ? 84 : 56;
  const fs    = size === 'large' ? 34  : size === 'medium' ? 22  : 16;
  const fsOf  = size === 'large' ? 14  : size === 'medium' ? 11  : 10;
  const bw    = size === 'large' ? 3.5 : 2.5;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dim, height: dim, borderRadius: dim / 2,
          borderColor: color, borderWidth: bw,
          transform: [{ scale: scaleAnim }], opacity: opacityAnim,
          shadowColor: color,
        },
      ]}
    >
      <Animated.Text style={[styles.score, { color, fontSize: fs }]}>
        {animate
          ? countAnim.interpolate({ inputRange: [0, 10], outputRange: ['0.0', '10.0'], extrapolate: 'clamp' })
          : score.toFixed(1)}
      </Animated.Text>
      <Text style={[styles.outOf, { fontSize: fsOf }]}>/10</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  score: { fontWeight: '800', letterSpacing: -1 },
  outOf: { fontWeight: '500', color: COLORS.muted, marginTop: -2 },
});
