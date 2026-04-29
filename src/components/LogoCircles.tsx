import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet } from 'react-native';
import { RING_COLORS } from '../theme';

const RINGS = [
  { ratio: 1.00, angle: -30, bwFactor: 1.00 },
  { ratio: 0.835, angle: -15, bwFactor: 0.90 },
  { ratio: 0.670, angle:   0, bwFactor: 0.82 },
  { ratio: 0.505, angle:  15, bwFactor: 0.74 },
  { ratio: 0.340, angle:  30, bwFactor: 0.66 },
  { ratio: 0.175, angle:  45, bwFactor: 0.58 },
] as const;

const ASPECT = 0.655; // height/width ratio for oval shape

interface Props {
  size?: number;
  spin?: boolean;   // slow continuous rotation
  pulse?: boolean;  // scale pulsing
  borderWidth?: number;
}

export default function LogoCircles({ size = 200, spin = false, pulse = false, borderWidth = 2.5 }: Props) {
  const rotAnims = useRef(RINGS.map(() => new Animated.Value(0))).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (spin) {
      const animations = rotAnims.map((anim, i) => {
        const duration = 6000 + i * 800;
        const direction = i % 2 === 0 ? 1 : -1;
        return Animated.loop(
          Animated.timing(anim, {
            toValue: direction,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
      });
      animations.forEach(a => a.start());
      return () => animations.forEach(a => a.stop());
    }
  }, [spin]);

  useEffect(() => {
    if (pulse) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0.96, duration: 900, useNativeDriver: true }),
        ])
      );
      anim.start();
      return () => anim.stop();
    }
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        pulse && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {RINGS.map((ring, i) => {
        const w = size * ring.ratio;
        const h = w * ASPECT;
        const bw = borderWidth * ring.bwFactor;

        const spinInterp = rotAnims[i].interpolate({
          inputRange: [-1, 0, 1],
          outputRange: ['-360deg', '0deg', '360deg'],
        });

        return (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                width: w,
                height: h,
                borderWidth: bw,
                borderColor: RING_COLORS[i],
                transform: [
                  { rotate: `${ring.angle}deg` },
                  ...(spin ? [{ rotate: spinInterp }] : []),
                ],
              },
            ]}
          />
        );
      })}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
  },
});
