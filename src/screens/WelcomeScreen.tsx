import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import LogoCircles from '../components/LogoCircles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { language, setLanguage, resetSession } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, []);

  const handleStart = () => {
    resetSession();
    navigation.navigate('Capture', {});
  };

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe}>
        {/* Language toggle */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.langButton}
            onPress={() => setLanguage(language === 'en' ? 'he' : 'en')}
            activeOpacity={0.7}
          >
            <Text style={styles.langText}>{language === 'en' ? 'עב' : 'EN'}</Text>
          </TouchableOpacity>
        </View>

        {/* Center: logo + brand text */}
        <Animated.View style={[styles.center, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <LogoCircles size={220} spin />

          <View style={styles.brandRow}>
            <Text style={styles.brandLook}>LOOK</Text>
            <Text style={styles.brandAt}>AT</Text>
            <Text style={styles.brandMe}>ME</Text>
          </View>
          <Text style={styles.tagline}>REFINE YOUR LOOK</Text>

          <View style={styles.pillRow}>
            {['AI', isRTL ? 'מהיר' : 'Fast', isRTL ? 'מדויק' : 'Precise'].map((s, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{s}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Bottom CTA */}
        <Animated.View style={[styles.bottom, { opacity: fadeIn }]}>
          <TouchableOpacity style={styles.startButton} onPress={handleStart} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTS.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={styles.startText}>{t.welcome.start}</Text>
              <Text style={styles.startArrow}>{isRTL ? '←' : '→'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {language === 'he' ? 'לא ציון יופי — תיקון איפור חכם.' : 'Not a beauty score. A smart makeup fix.'}
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1, paddingHorizontal: SPACING.lg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: SPACING.sm,
  },
  langButton: {
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
  },
  langText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: SPACING.md,
    gap: 0,
  },
  brandLook: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  brandAt: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.pink,
    letterSpacing: 2,
  },
  brandMe: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
    letterSpacing: 5,
    textTransform: 'uppercase',
    marginTop: -SPACING.xs,
  },
  pillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  pill: {
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },
  bottom: {
    paddingBottom: SPACING.xl,
    gap: SPACING.md,
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 10,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg - 2,
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  startText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  startArrow: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '700',
  },
  disclaimer: {
    fontSize: 12,
    color: COLORS.mutedLight,
    textAlign: 'center',
  },
});
