import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface ScoreBadgeProps {
  score: number;
  size?: 'large' | 'medium' | 'small';
  animate?: boolean;
}

function scoreColor(score: number) {
  if (score >= 8.5) return { ring: COLORS.success, text: COLORS.success };
  if (score >= 7) return { ring: COLORS.gold, text: COLORS.gold };
  return { ring: COLORS.roseMid, text: COLORS.roseMid };
}

export default function ScoreBadge({ score, size = 'large', animate = true }: ScoreBadgeProps) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animate) {
      scaleAnim.setValue(1);
      opacityAnim.setValue(1);
      return;
    }
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [score]);

  const { ring, text: textColor } = scoreColor(score);
  const dim = size === 'large' ? 120 : size === 'medium' ? 80 : 56;
  const fontSize = size === 'large' ? 34 : size === 'medium' ? 22 : 16;
  const tenFontSize = size === 'large' ? 16 : size === 'medium' ? 12 : 10;
  const borderWidth = size === 'large' ? 4 : 3;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          borderColor: ring,
          borderWidth,
          backgroundColor: COLORS.white,
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          shadowColor: ring,
        },
      ]}
    >
      <Text style={[styles.score, { color: textColor, fontSize }]}>
        {score.toFixed(1)}
      </Text>
      <Text style={[styles.outOf, { fontSize: tenFontSize, color: COLORS.muted }]}>/10</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  score: {
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: undefined,
  },
  outOf: {
    fontWeight: '500',
    marginTop: -2,
  },
});
