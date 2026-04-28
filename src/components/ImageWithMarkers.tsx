import React, { useState } from 'react';
import { View, Image, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import { Fix } from '../types';
import { COLORS } from '../theme';

interface ImageWithMarkersProps {
  imageUri: string;
  fixes: Fix[];
  showAll?: boolean;
}

const MARKER_SIZE = 28;

export default function ImageWithMarkers({
  imageUri,
  fixes,
  showAll = false,
}: ImageWithMarkersProps) {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const visibleFixes = showAll ? fixes : fixes.slice(0, 1);

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      {containerSize.width > 0 && (
        <View style={StyleSheet.absoluteFillObject as object} pointerEvents="none">
          {visibleFixes.map((fix, i) => {
            const left = containerSize.width * (fix.x / 100) - MARKER_SIZE / 2;
            const top = containerSize.height * (fix.y / 100) - MARKER_SIZE / 2;
            return (
              <View key={i} style={[styles.marker, { left, top }]}>
                <Text style={styles.markerText}>{i + 1}</Text>
              </View>
            );
          })}
          {!showAll && fixes.length > 1 &&
            fixes.slice(1).map((fix, i) => {
              const left = containerSize.width * (fix.x / 100) - MARKER_SIZE / 2;
              const top = containerSize.height * (fix.y / 100) - MARKER_SIZE / 2;
              return (
                <View key={`locked-${i}`} style={[styles.marker, styles.markerLocked, { left, top }]}>
                  <Text style={styles.markerText}>{i + 2}</Text>
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
  marker: {
    position: 'absolute',
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    backgroundColor: COLORS.roseMid,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  markerLocked: {
    backgroundColor: COLORS.muted,
    opacity: 0.6,
  },
  markerText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13,
  },
});
