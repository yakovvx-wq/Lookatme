import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Recommendation } from '../types';
import { COLORS } from '../theme';

interface ImageWithMarkersProps {
  imageUri: string;
  faceImage?: string;
  recommendations: Recommendation[];
  showAll?: boolean;
}

const DOT_SIZE = 26;

export default function ImageWithMarkers({
  imageUri,
  faceImage,
  recommendations,
  showAll = false,
}: ImageWithMarkersProps) {
  const displayUri = faceImage ?? imageUri;
  const visibleRecs = showAll ? recommendations : recommendations.slice(0, 1);
  const lockedRecs = showAll ? [] : recommendations.slice(1);

  return (
    <View style={styles.container}>
      <Image source={{ uri: displayUri }} style={styles.image} resizeMode="cover" />

      <View style={StyleSheet.absoluteFillObject as object} pointerEvents="none">
        {visibleRecs.map((rec, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: `${rec.marker_position.x}%` as any,
                top: `${rec.marker_position.y}%` as any,
                backgroundColor: rec.marker_color,
                shadowColor: rec.marker_color,
              },
            ]}
          >
            <Text style={styles.dotNum}>{i + 1}</Text>
          </View>
        ))}

        {lockedRecs.map((rec, i) => (
          <View
            key={`locked-${i}`}
            style={[
              styles.dot,
              styles.dotLocked,
              {
                left: `${rec.marker_position.x}%` as any,
                top: `${rec.marker_position.y}%` as any,
              },
            ]}
          >
            <Text style={styles.dotNum}>{visibleRecs.length + i + 1}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -(DOT_SIZE / 2),
    marginTop: -(DOT_SIZE / 2),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  dotLocked: {
    backgroundColor: COLORS.muted,
    shadowColor: 'transparent',
    opacity: 0.5,
  },
  dotNum: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
});
