import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface FaceFrameProps {
  width: number;
  height: number;
  pulse?: boolean;
}

// Oval face guide with animated ring light glow
export default function FaceFrame({ width, height, pulse = false }: FaceFrameProps) {
  const glowAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (!pulse) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.6, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const ovalW = width * 0.72;
  const ovalH = height * 0.72;

  return (
    <View style={[StyleSheet.absoluteFillObject, styles.container]} pointerEvents="none">
      {/* Dark overlay — corners */}
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

      {/* Ring light glow — outer */}
      <Animated.View
        style={[
          styles.ring,
          styles.ringOuter,
          {
            width: ovalW + 24,
            height: ovalH + 24,
            borderRadius: (ovalW + 24) / 2,
            opacity: glowAnim,
          },
        ]}
      />

      {/* Ring light — main border */}
      <View
        style={[
          styles.ring,
          styles.ringMain,
          {
            width: ovalW,
            height: ovalH,
            borderRadius: ovalW / 2,
          },
        ]}
      />

      {/* Guide markers: eye level and nose/center line */}
      <View style={[styles.guideRow, { top: height * 0.5 - ovalH * 0.12 }]}>
        <View style={styles.guideDot} />
        <View style={[styles.guideLine, { width: ovalW * 0.14 }]} />
        <View style={[styles.guideLine, { width: ovalW * 0.14 }]} />
        <View style={styles.guideDot} />
      </View>

      {/* Center vertical guide */}
      <View
        style={[
          styles.centerLine,
          {
            top: height * 0.5 - ovalH * 0.25,
            height: ovalH * 0.5,
            left: width / 2 - 0.5,
          },
        ]}
      />

      {/* Corner brackets at oval edges for extra precision feel */}
      {[
        { top: height * 0.5 - ovalH / 2 - 1, left: width / 2 - 20, rotate: '0deg' },
        { top: height * 0.5 - ovalH / 2 - 1, left: width / 2 + 4, rotate: '90deg' },
        { top: height * 0.5 + ovalH / 2 - 15, left: width / 2 - 20, rotate: '270deg' },
        { top: height * 0.5 + ovalH / 2 - 15, left: width / 2 + 4, rotate: '180deg' },
      ].map((pos, i) => (
        <View
          key={i}
          style={[
            styles.bracket,
            { top: pos.top, left: pos.left, transform: [{ rotate: pos.rotate }] },
          ]}
        />
      ))}
    </View>
  );
}

const RING_COLOR = 'rgba(255,255,255,0.92)';
const GUIDE_COLOR = 'rgba(255,255,255,0.30)';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(15,15,16,0.55)',
  },
  ring: {
    position: 'absolute',
    alignSelf: 'center',
  },
  ringOuter: {
    borderWidth: 6,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 18,
    elevation: 0,
  },
  ringMain: {
    borderWidth: 2.5,
    borderColor: RING_COLOR,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 0,
  },
  guideRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  guideDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GUIDE_COLOR,
  },
  guideLine: {
    height: 1,
    backgroundColor: GUIDE_COLOR,
  },
  centerLine: {
    position: 'absolute',
    width: 1,
    backgroundColor: GUIDE_COLOR,
  },
  bracket: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: RING_COLOR,
  },
});
