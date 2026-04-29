import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
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
  const { result, imageUri, isPro } = useApp();
  const t = useT();
  const isRTL = useRTL();

  if (!result || !imageUri) return null;

  const recs = result.recommendations ?? [];
  const isPerfect = result.score >= 10;

  const handleRescan = () => {
    if (!isPro) { navigation.navigate('Paywall'); return; }
    navigation.navigate('Capture', { isRescan: true });
  };

  const handleUnlock = () => navigation.navigate('Paywall');
  const handleNewCheck = () => navigation.navigate('Welcome');

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.results.scoreLabel}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Score */}
          <View style={styles.scoreSection}>
            <ScoreBadge score={result.score ?? 0} size="large" animate />
            <Text style={styles.scoreLabel}>{t.results.scoreLabel}</Text>
            <Text style={[styles.summary, rtlText(isRTL)]}>{result.summary ?? ''}</Text>
            {result.photo_quality_note ? (
              <View style={styles.qualityNote}>
                <Ionicons name="warning-outline" size={14} color={COLORS.yellow} />
                <Text style={[styles.qualityNoteText, rtlText(isRTL)]}>{result.photo_quality_note}</Text>
              </View>
            ) : null}
          </View>

          {/* Face with dot markers — only if there are recs to show */}
          {recs.length > 0 && (
            <View style={styles.imageSection}>
              <ImageWithMarkers
                imageUri={imageUri}
                recommendations={recs}
                showAll={isPro}
              />
            </View>
          )}

          {/* Recommendations */}
          <View style={styles.fixesSection}>
            {isPerfect ? (
              <View style={styles.perfectWrap}>
                <Text style={styles.perfectEmoji}>✨</Text>
                <Text style={[styles.perfectText, rtlText(isRTL)]}>{t.results.perfect}</Text>
              </View>
            ) : recs.length === 0 ? (
              <View style={styles.perfectWrap}>
                <Text style={styles.perfectEmoji}>✨</Text>
                <Text style={[styles.perfectText, rtlText(isRTL)]}>
                  {isRTL ? 'האיפור נראה מעולה — אין מה לתקן!' : 'Your makeup looks flawless — nothing to fix!'}
                </Text>
              </View>
            ) : (
              <>
                <Text style={[styles.fixesTitle, rtlText(isRTL)]}>{t.results.fixes}</Text>

                <FixCard rec={recs[0]} index={0} locked={false} isRTL={isRTL} />

                {recs.slice(1).map((rec, i) =>
                  isPro ? (
                    <FixCard key={i} rec={rec} index={i + 1} isRTL={isRTL} />
                  ) : (
                    <FixCard key={i} rec={rec} index={i + 1} locked onUnlock={handleUnlock} isRTL={isRTL} />
                  )
                )}

                {!isPro && recs.length > 1 && (
                  <TouchableOpacity style={styles.paywallBanner} onPress={handleUnlock} activeOpacity={0.85}>
                    <LinearGradient
                      colors={GRADIENTS.primary}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.paywallGradient}
                    >
                      <View style={styles.paywallRow}>
                        <Ionicons name="lock-open-outline" size={22} color={COLORS.white} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.paywallTitle}>{t.results.unlockTitle}</Text>
                          <Text style={styles.paywallSub}>{t.results.unlockSubtitle}</Text>
                        </View>
                      </View>
                      <View style={styles.paywallCta}>
                        <Text style={styles.paywallCtaText}>{t.results.upgradeCta}</Text>
                        <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={14} color={COLORS.dark} />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>

          {/* CTA */}
          <View style={styles.ctaSection}>
            {isPerfect ? (
              <TouchableOpacity style={styles.rescanBtn} onPress={handleNewCheck} activeOpacity={0.85}>
                <LinearGradient
                  colors={GRADIENTS.tealGreen}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.rescanGradient}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                  <Text style={styles.rescanText}>
                    {isRTL ? 'התחילי בדיקה חדשה' : 'Start New Check'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.rescanBtn} onPress={handleRescan} activeOpacity={0.85}>
                <LinearGradient
                  colors={GRADIENTS.primary}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.rescanGradient}
                >
                  <Ionicons name="camera-outline" size={20} color={COLORS.white} />
                  <Text style={styles.rescanText}>{t.results.continueImproving}</Text>
                  {!isPro && (
                    <View style={styles.proTag}>
                      <Ionicons name="lock-closed" size={9} color={COLORS.dark} />
                      <Text style={styles.proTagText}>Pro</Text>
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  scrollContent: { paddingBottom: SPACING.xxl },
  scoreSection: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  scoreLabel: {
    fontSize: 11, fontWeight: '600', color: COLORS.muted,
    letterSpacing: 2, textTransform: 'uppercase', marginTop: SPACING.xs,
  },
  summary: {
    fontSize: 15, color: COLORS.white, lineHeight: 22,
    textAlign: 'center', maxWidth: 320,
  },
  qualityNote: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: 'rgba(255,203,87,0.1)', borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderWidth: 1, borderColor: 'rgba(255,203,87,0.3)',
  },
  qualityNoteText: { fontSize: 12, color: COLORS.yellow, flex: 1, lineHeight: 17 },
  imageSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  fixesSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  fixesTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  paywallBanner: {
    borderRadius: RADIUS.lg, overflow: 'hidden', marginTop: SPACING.sm,
    shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6,
  },
  paywallGradient: { padding: SPACING.md, gap: SPACING.sm },
  paywallRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  paywallTitle: { color: COLORS.white, fontWeight: '700', fontSize: 15, marginBottom: 2 },
  paywallSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  paywallCta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.round,
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    gap: SPACING.xs, alignSelf: 'flex-start',
  },
  paywallCtaText: { color: COLORS.dark, fontWeight: '700', fontSize: 13 },
  perfectWrap: { alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.lg },
  perfectEmoji: { fontSize: 32 },
  perfectText: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  ctaSection: { paddingHorizontal: SPACING.lg },
  rescanBtn: {
    borderRadius: RADIUS.round, overflow: 'hidden',
    shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 7,
  },
  rescanGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md + 2, gap: SPACING.sm,
  },
  rescanText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  proTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.yellow, borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.sm, paddingVertical: 2, gap: 3,
  },
  proTagText: { fontSize: 10, fontWeight: '700', color: COLORS.dark },
});
