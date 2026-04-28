import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import ScoreBadge from '../components/ScoreBadge';
import FixCard from '../components/FixCard';
import ImageWithMarkers from '../components/ImageWithMarkers';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Results'>;

export default function ResultsScreen() {
  const navigation = useNavigation<Nav>();
  const { result, imageUri, isPro, startRescan } = useApp();
  const t = useT();
  const isRTL = useRTL();

  if (!result || !imageUri) {
    return null;
  }

  const handleRescan = () => {
    if (!isPro) {
      navigation.navigate('Paywall');
      return;
    }
    // Don't call startRescan here - it clears imageUri!
    // Instead, just navigate to Capture and let it handle the rescan flow
    navigation.navigate('Capture', { isRescan: true });
  };

  const handleUnlock = () => {
    navigation.navigate('Paywall');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={COLORS.dark}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.results.scoreLabel}</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score + Summary */}
        <View style={styles.scoreSection}>
          <ScoreBadge score={result.score ?? 0} size="large" animate />
          <Text style={styles.scoreLabel}>{t.results.scoreLabel}</Text>
          <Text style={[styles.summary, rtlText(isRTL)]}>{result.summary ?? ''}</Text>
        </View>

        {/* Image with markers */}
        <View style={styles.imageSection}>
          <ImageWithMarkers
            imageUri={imageUri}
            faceImage={result.face_image}
            fixes={result.fixes ?? []}
            showAll={isPro}
          />
        </View>

        {/* Fixes */}
        <View style={styles.fixesSection}>
          <Text style={[styles.fixesTitle, rtlText(isRTL)]}>{t.results.fixes}</Text>

          {/* Fix 1 — always visible */}
          {result.fixes?.[0] != null && (
            <FixCard
              fix={result.fixes[0]}
              index={0}
              locked={false}
              isRTL={isRTL}
            />
          )}

          {/* Fixes 2 & 3 — pro only */}
          {(result.fixes ?? []).slice(1).map((fix, i) =>
            isPro ? (
              <FixCard key={i} fix={fix} index={i + 1} isRTL={isRTL} />
            ) : (
              <FixCard key={i} fix={fix} index={i + 1} locked onUnlock={handleUnlock} isRTL={isRTL} />
            )
          )}

          {/* Paywall CTA (free users) */}
          {!isPro && (result.fixes?.length ?? 0) > 1 && (
            <TouchableOpacity style={styles.paywallBanner} onPress={handleUnlock} activeOpacity={0.85}>
              <LinearGradient
                colors={GRADIENTS.roseDeep}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.paywallGradient}
              >
                <View style={styles.paywallContent}>
                  <Ionicons name="lock-open-outline" size={24} color={COLORS.white} />
                  <View style={styles.paywallText}>
                    <Text style={styles.paywallTitle}>{t.results.unlockTitle}</Text>
                    <Text style={styles.paywallSubtitle}>{t.results.unlockSubtitle}</Text>
                  </View>
                </View>
                <View style={styles.paywallCta}>
                  <Text style={styles.paywallCtaText}>{t.results.upgradeCta}</Text>
                  <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={16} color={COLORS.dark} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Rescan CTA */}
        <View style={styles.rescanSection}>
          <TouchableOpacity style={styles.rescanButton} onPress={handleRescan} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rescanGradient}
            >
              <Ionicons name="refresh-outline" size={20} color={COLORS.white} />
              <Text style={styles.rescanText}>{t.results.rescan}</Text>
              {!isPro && (
                <View style={styles.proTag}>
                  <Ionicons name="lock-closed" size={10} color={COLORS.dark} />
                  <Text style={styles.proTagText}>Pro</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.dark,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  scoreSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  summary: {
    fontSize: 15,
    color: COLORS.dark,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 320,
  },
  imageSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  fixesSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  fixesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.md,
  },
  paywallBanner: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginTop: SPACING.sm,
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  paywallGradient: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  paywallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  paywallText: { flex: 1 },
  paywallTitle: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
    marginBottom: 2,
  },
  paywallSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  paywallCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.round,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.xs,
    alignSelf: 'flex-start',
  },
  paywallCtaText: {
    color: COLORS.dark,
    fontWeight: '700',
    fontSize: 13,
  },
  rescanSection: {
    paddingHorizontal: SPACING.lg,
  },
  rescanButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  rescanGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  rescanText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  proTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.goldLight,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    gap: 3,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.dark,
  },
});
