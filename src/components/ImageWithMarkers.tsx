import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Fix } from '../types';
import { COLORS } from '../theme';

interface ImageWithMarkersProps {
  imageUri: string;
  faceImage?: string;
  fixes: Fix[];
  showAll?: boolean;
}

const ZONE_COLORS = ['#E8A0BF', '#B784A7', '#C9A0DC', '#9B72AA', '#DBA1C3'];

export default function ImageWithMarkers({
  imageUri,
  faceImage,
  fixes,
  showAll = false,
}: ImageWithMarkersProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const displayUri = faceImage ?? imageUri;
  const visibleFixes = showAll ? fixes : fixes.slice(0, 1);
  const lockedFixes = showAll ? [] : fixes.slice(1);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Image source={{ uri: displayUri }} style={styles.image} resizeMode="cover" />

      {containerSize.width > 0 && (
        <View style={StyleSheet.absoluteFillObject as object} pointerEvents="none">
          {/* Visible zone overlays */}
          {visibleFixes.map((fix, i) => {
            if (!fix.zone) return null;
            const { x, y, w, h, label, number } = fix.zone;
            const color = ZONE_COLORS[i % ZONE_COLORS.length];
            return (
              <View
                key={i}
                style={[
                  styles.zone,
                  {
                    left: `${x}%` as any,
                    top: `${y}%` as any,
                    width: `${w}%` as any,
                    height: `${h}%` as any,
                    borderColor: color,
                    backgroundColor: color + '33',
                  },
                ]}
              >
                <View style={[styles.zoneBadge, { backgroundColor: color }]}>
                  <Text style={styles.zoneBadgeText}>{number}</Text>
                </View>
                <Text style={[styles.zoneLabel, { color }]}>{label}</Text>
              </View>
            );
          })}

          {/* Locked zone overlays (blurred) */}
          {lockedFixes.map((fix, i) => {
            if (!fix.zone) return null;
            const { x, y, w, h, number } = fix.zone;
            return (
              <View
                key={`locked-${i}`}
                style={[
                  styles.zone,
                  styles.zoneLocked,
                  {
                    left: `${x}%` as any,
                    top: `${y}%` as any,
                    width: `${w}%` as any,
                    height: `${h}%` as any,
                  },
                ]}
              >
                <View style={[styles.zoneBadge, { backgroundColor: COLORS.muted }]}>
                  <Text style={styles.zoneBadgeText}>{number}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8D5DC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  zone: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 4,
    gap: 4,
  },
  zoneLocked: {
    borderColor: COLORS.muted,
    backgroundColor: 'rgba(150,150,150,0.15)',
    opacity: 0.6,
  },
  zoneBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  zoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
