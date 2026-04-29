import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Animated,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { COLORS, GRADIENTS, SPACING } from '../theme';
import { analyzeMakeup } from '../services/analyzeMakeup';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analyzing'>;
type Route = RouteProp<RootStackParamList, 'Analyzing'>;

const MESSAGE_INTERVAL = 1100;

export default function AnalyzingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { isRescan } = route.params;

  const { imageUri, goal, style, setResult, language } = useApp();
  const t = useT();

  const messages = t.analyzing.messages;
  const [msgIndex, setMsgIndex] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const dot = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    );
    dot.start();

    const msgTimer = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length);
    }, MESSAGE_INTERVAL);

    let cancelled = false;

    const stop = () => {
      clearInterval(msgTimer);
      pulse.stop();
      dot.stop();
    };

    const run = async () => {
      try {
        if (!imageUri || !goal || !style) {
          navigation.navigate('Welcome');
          return;
        }

        const result = await analyzeMakeup(imageUri, goal, style, language);

        if (cancelled) return;
        stop();

        setResult({
          score: result.score,
          summary: result.summary,
          fixes: result.fixes,
          face_image: result.face_image,
        });
        navigation.replace(isRescan ? 'Rescan' : 'Results');
      } catch (err) {
        if (cancelled) return;
        stop();
        const isTimeout = err instanceof Error && err.name === 'AbortError';
        const msg = isTimeout
          ? (language === 'he' ? 'הבקשה לקחה יותר מדי זמן (timeout).' : 'Request timed out.')
          : (err instanceof Error ? err.message : String(err));
        Alert.alert(
          language === 'he' ? 'שגיאה' : 'Error',
          msg,
          [{ text: 'OK', onPress: () => navigation.navigate('Capture', { isRescan }) }]
        );
      }
    };

    run();

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  return (
    <LinearGradient colors={GRADIENTS.analyzing} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        {/* Image preview */}
        {imageUri && (
          <Animated.View
            style={[styles.imageWrapper, { transform: [{ scale: pulseAnim }] }]}
          >
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageOverlay} />
            <View style={styles.scanLine} />
          </Animated.View>
        )}

        {/* Animated dots */}
        <View style={styles.dotsRow}>
          {[0, 1, 2].map(i => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  opacity: dotAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [i === 1 ? 0.4 : 0.2, i === 1 ? 1 : 0.6],
                  }),
                  transform: [
                    {
                      scale: dotAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [i === 1 ? 0.8 : 0.6, i === 1 ? 1.2 : 1],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Message */}
        <Text style={styles.message}>{messages[msgIndex]}</Text>
        <Text style={styles.subMessage}>
          {language === 'en' ? 'AI Makeup Analysis' : 'ניתוח איפור AI'}
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xl,
    paddingHorizontal: SPACING.xl,
  },
  imageWrapper: {
    width: 180,
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.roseLight,
    shadowColor: COLORS.roseMid,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(139, 61, 90, 0.15)',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    top: '50%',
    backgroundColor: COLORS.roseLight,
    opacity: 0.7,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.roseLight,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subMessage: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
