import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<Nav>();
  const { language, setLanguage, resetSession } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const handleStart = () => {
    resetSession();
    navigation.navigate('Capture', {});
  };

  return (
    <LinearGradient colors={GRADIENTS.warmCream} style={styles.gradient}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea}>
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

        {/* Center content */}
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconEmoji}>💄</Text>
          </View>

          <Text style={styles.appName}>Quick Fix</Text>
          <Text style={styles.appSub}>AI Makeup</Text>

          <Text style={[styles.tagline, rtlText(isRTL)]}>{t.welcome.tagline}</Text>

          <View style={styles.pillRow}>
            {t.welcome.subtitle.split(' · ').map((s, i) => (
              <View key={i} style={styles.pill}>
                <Text style={styles.pillText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.startGradient}
            >
              <Text style={styles.startText}>{t.welcome.start}</Text>
              <Text style={styles.startArrow}>{isRTL ? '←' : '→'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            {language === 'en'
              ? 'Not a beauty score. A quick makeup fix.'
              : 'לא ציון יופי. תיקון איפור מהיר.'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: SPACING.lg },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: SPACING.sm,
  },
  langButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.dark,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.roseMid,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: SPACING.sm,
  },
  iconEmoji: { fontSize: 48 },
  appName: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: -1.5,
    marginBottom: -SPACING.sm,
  },
  appSub: {
    fontSize: 20,
    fontWeight: '400',
    color: COLORS.muted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  tagline: {
    fontSize: 16,
    color: COLORS.dark,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 280,
    marginTop: SPACING.md,
  },
  pillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  pill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
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
    color: COLORS.muted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
