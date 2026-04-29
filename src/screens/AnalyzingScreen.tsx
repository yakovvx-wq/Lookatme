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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT } from '../i18n';
import { COLORS, SPACING } from '../theme';
import { analyzeMakeup } from '../services/analyzeMakeup';
import LogoCircles from '../components/LogoCircles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analyzing'>;
type Route = RouteProp<RootStackParamList, 'Analyzing'>;

const MESSAGE_INTERVAL = 1200;

export default function AnalyzingScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { isRescan } = route.params;

  const { imageUri, goal, style, setResult, language } = useApp();
  const t = useT();

  const messages = t.analyzing.messages;
  const [msgIndex, setMsgIndex] = useState(0);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(0.9)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade image in
    Animated.parallel([
      Animated.timing(imageOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(imageScale, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Cycle messages with fade
    const msgTimer = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
      setMsgIndex(i => (i + 1) % messages.length);
    }, MESSAGE_INTERVAL);

    let cancelled = false;

    const stop = () => clearInterval(msgTimer);

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
          ? (language === 'he' ? 'הבקשה לקחה יותר מדי זמן.' : 'Request timed out.')
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
    <View style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        {/* Top: image preview */}
        {imageUri && (
          <Animated.View style={[styles.imageWrap, { opacity: imageOpacity, transform: [{ scale: imageScale }] }]}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageVignette} />
          </Animated.View>
        )}

        {/* Center: spinning logo */}
        <View style={styles.logoWrap}>
          <LogoCircles size={180} spin pulse />
        </View>

        {/* Bottom: text */}
        <View style={styles.textWrap}>
          <Animated.Text style={[styles.message, { opacity: fadeAnim }]}>
            {messages[msgIndex]}
          </Animated.Text>
          <Text style={styles.sub}>
            {language === 'he' ? 'ניתוח AI · לוקאטמי' : 'AI Analysis · Lookatme'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  imageWrap: {
    width: 140,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,91,167,0.4)',
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  image: { width: '100%', height: '100%' },
  imageVignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,16,0.2)',
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  message: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sub: {
    fontSize: 12,
    color: COLORS.mutedLight,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
