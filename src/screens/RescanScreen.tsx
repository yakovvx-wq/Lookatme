import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
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
import { COLORS, GRADIENTS, RING_COLORS, SPACING, RADIUS } from '../theme';
import ScoreBadge from '../components/ScoreBadge';
import FixCard from '../components/FixCard';
import ImageWithMarkers from '../components/ImageWithMarkers';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Rescan'>;

export default function RescanScreen() {
  const navigation = useNavigation<Nav>();
  const { rescanResult, result, previousImageUri, imageUri, resetSession, isPro } = useApp();
  const t = useT();
  const isRTL = useRTL();

  // Fallback: if we have rescanResult use it; otherwise use old-style result comparison
  if (!rescanResult && !result) return null;

  const handleNewCheck = () => {
    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  const handleFixAgain = () => {
    navigation.navigate('Capture', { isRescan: true });
  };

  const handleUnlock = () => navigation.navigate('Paywall');

  // ── New rescan format ──
  if (rescanResult) {
    const {
      previous_score,
      new_score,
      change_detected,
      improvement_level,
      summary,
      recommendation_results,
      still_needs_work,
      next_recommendations,
      next_action,
    } = rescanResult;

    const scoreDiff = new_score - previous_score;
    const improved = scoreDiff > 0;
    const isPerfect = next_action === 'save_result';
    const noChange = !change_detected || improvement_level === 'none';

    return (
      <View style={styles.bg}>
        <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={styles.spacer} />
            <Text style={styles.headerTitle}>{t.rescan.title}</Text>
            <View style={styles.spacer} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

            {/* Score row */}
            <View style={styles.scoreRow}>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>{t.rescan.before}</Text>
                <ScoreBadge score={previous_score} size="medium" animate={false} />
              </View>
              <View style={styles.arrowWrap}>
                <LinearGradient
                  colors={improved ? GRADIENTS.tealGreen : [COLORS.muted, COLORS.muted]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.arrowCircle}
                >
                  <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={COLORS.white} />
                </LinearGradient>
                <Text style={[styles.diffText, improved ? styles.diffPos : styles.diffNeutral]}>
                  {improved ? `+${scoreDiff.toFixed(1)}` : '='}
                </Text>
              </View>
              <View style={styles.scoreCol}>
                <Text style={styles.scoreLabel}>{t.rescan.after}</Text>
                <ScoreBadge score={new_score} size="medium" animate />
              </View>
            </View>

            {/* Photo comparison */}
            <View style={[styles.imageRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {previousImageUri && (
                <View style={styles.imageCol}>
                  <Image source={{ uri: previousImageUri }} style={[styles.img, styles.imgBefore]} resizeMode="cover" />
                  <Text style={styles.imgCaption}>{t.rescan.before}</Text>
                </View>
              )}
              {imageUri && (
                <View style={styles.imageCol}>
                  <Image source={{ uri: imageUri }} style={[styles.img, improved ? styles.imgAfter : styles.imgSame]} resizeMode="cover" />
                  <Text style={[styles.imgCaption, improved && { color: COLORS.green }]}>{t.rescan.after}</Text>
                </View>
              )}
            </View>

            {/* Perfect! */}
            {isPerfect && (
              <View style={styles.perfectCard}>
                <LinearGradient colors={GRADIENTS.tealGreen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.perfectBanner}>
                  <Text style={styles.perfectTitle}>{t.rescan.perfectTitle}</Text>
                </LinearGradient>
                <View style={styles.perfectBody}>
                  <Text style={[styles.perfectBodyText, rtlText(isRTL)]}>{t.rescan.perfectBody}</Text>
                </View>
              </View>
            )}

            {/* No change */}
            {noChange && !isPerfect && (
              <View style={styles.noChangeCard}>
                <Text style={[styles.noChangeTitle, rtlText(isRTL)]}>{t.rescan.noChange}</Text>
                <Text style={[styles.noChangeBody, rtlText(isRTL)]}>{t.rescan.noChangeDetail}</Text>
              </View>
            )}

            {/* Summary */}
            {!isPerfect && !noChange && (
              <View style={styles.summaryCard}>
                <LinearGradient colors={GRADIENTS.tealGreen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.summaryBanner}>
                  <Text style={styles.summaryBannerText}>{t.rescan.greatJob}  +{scoreDiff.toFixed(1)} {t.rescan.pointsGained}</Text>
                </LinearGradient>
                <View style={styles.summaryBody}>
                  <Text style={[styles.summaryText, rtlText(isRTL)]}>{summary}</Text>
                </View>
              </View>
            )}

            {/* What was fixed */}
            {recommendation_results.length > 0 && (
              <View style={styles.fixedCard}>
                <Text style={[styles.sectionTitle, rtlText(isRTL)]}>{t.rescan.whatFixed}</Text>
                {recommendation_results.map((rr, i) => (
                  <View key={i} style={[styles.fixedRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.fixedDot, { backgroundColor: rr.was_improved ? COLORS.green : COLORS.muted }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.fixedArea, rtlText(isRTL)]}>{rr.previous_title}</Text>
                      <Text style={[styles.fixedResult, rtlText(isRTL)]}>{rr.result_text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Next recommendations */}
            {still_needs_work && next_recommendations.length > 0 && (
              <View style={styles.nextSection}>
                <Text style={[styles.sectionTitle, { paddingHorizontal: SPACING.lg }, rtlText(isRTL)]}>
                  {t.rescan.nextSteps}
                </Text>
                {(isPro ? next_recommendations : next_recommendations.slice(0, 1)).map((rec, i) => (
                  <View key={i} style={{ paddingHorizontal: SPACING.lg }}>
                    <FixCard rec={rec} index={i} locked={false} isRTL={isRTL} />
                  </View>
                ))}
                {!isPro && next_recommendations.length > 1 && (
                  <View style={{ paddingHorizontal: SPACING.lg }}>
                    <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock}>
                      <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.unlockGrad}>
                        <Ionicons name="lock-open-outline" size={18} color={COLORS.white} />
                        <Text style={styles.unlockText}>{t.results.unlockTitle}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* CTAs */}
            <View style={styles.ctaWrap}>
              {isPerfect ? (
                <TouchableOpacity style={styles.newBtn} onPress={handleNewCheck} activeOpacity={0.85}>
                  <LinearGradient colors={GRADIENTS.tealGreen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newGradient}>
                    <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} />
                    <Text style={styles.newText}>{t.rescan.saveResult}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.newBtn} onPress={handleFixAgain} activeOpacity={0.85}>
                  <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newGradient}>
                    <Ionicons name="camera-outline" size={20} color={COLORS.white} />
                    <Text style={styles.newText}>{t.rescan.fixAgain}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.newCheckBtn} onPress={handleNewCheck}>
                <Text style={styles.newCheckText}>{t.rescan.newCheck}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // ── Legacy fallback (result-only comparison) ──
  if (!result) return null;
  const scoreDiff2 = result.score - (previousImageUri ? result.score - 1 : result.score);
  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.scoreRow}>
            <ScoreBadge score={result.score} size="medium" animate />
          </View>
          <Text style={[styles.summaryText, { textAlign: 'center', paddingHorizontal: SPACING.lg }]}>{result.summary}</Text>
          <View style={styles.ctaWrap}>
            <TouchableOpacity style={styles.newBtn} onPress={handleNewCheck}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newGradient}>
                <Text style={styles.newText}>{t.rescan.newCheck}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  spacer: { width: 40 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  scrollContent: { paddingBottom: SPACING.xxl },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.lg, gap: SPACING.lg },
  scoreCol: { alignItems: 'center', gap: SPACING.sm },
  scoreLabel: { fontSize: 11, fontWeight: '600', color: COLORS.muted, letterSpacing: 1, textTransform: 'uppercase' },
  arrowWrap: { alignItems: 'center', gap: SPACING.xs },
  arrowCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  diffText: { fontSize: 14, fontWeight: '700' },
  diffPos: { color: COLORS.green },
  diffNeutral: { color: COLORS.muted },
  imageRow: { paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.lg },
  imageCol: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  img: { width: '100%', aspectRatio: 3 / 4, borderRadius: RADIUS.lg },
  imgBefore: { opacity: 0.7, borderWidth: 1.5, borderColor: COLORS.border },
  imgAfter: { borderWidth: 2, borderColor: COLORS.green },
  imgSame: { borderWidth: 1.5, borderColor: COLORS.border },
  imgCaption: { fontSize: 11, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  perfectCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  perfectBanner: { padding: SPACING.md, alignItems: 'center' },
  perfectTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  perfectBody: { backgroundColor: COLORS.card, padding: SPACING.md },
  perfectBodyText: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  noChangeCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  noChangeTitle: { fontSize: 15, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  noChangeBody: { fontSize: 13, color: COLORS.muted, lineHeight: 19 },
  summaryCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  summaryBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.md },
  summaryBannerText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  summaryBody: { backgroundColor: COLORS.card, padding: SPACING.md },
  summaryText: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  fixedCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border, gap: SPACING.md },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm },
  fixedRow: { alignItems: 'flex-start', gap: SPACING.sm },
  fixedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  fixedArea: { fontSize: 13, fontWeight: '700', color: COLORS.white, marginBottom: 2 },
  fixedResult: { fontSize: 13, color: COLORS.muted, lineHeight: 18 },
  nextSection: { marginBottom: SPACING.lg, gap: SPACING.sm },
  unlockBtn: { borderRadius: RADIUS.round, overflow: 'hidden', marginTop: SPACING.xs },
  unlockGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md, gap: SPACING.sm },
  unlockText: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  ctaWrap: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  newBtn: { borderRadius: RADIUS.round, overflow: 'hidden', shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  newGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  newText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  newCheckBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  newCheckText: { fontSize: 14, color: COLORS.muted },
});
