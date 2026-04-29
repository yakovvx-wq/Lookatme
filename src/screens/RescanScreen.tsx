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
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import ScoreBadge from '../components/ScoreBadge';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Rescan'>;

export default function RescanScreen() {
  const navigation = useNavigation<Nav>();
  const { result, previousResult, imageUri, previousImageUri, resetSession } = useApp();
  const t = useT();
  const isRTL = useRTL();

  if (!result || !previousResult) return null;

  const scoreDiff = result.score - previousResult.score;
  const improved  = scoreDiff > 0;

  const handleNewCheck = () => {
    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

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
          {/* Score comparison */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>{t.rescan.before}</Text>
              <ScoreBadge score={previousResult.score} size="medium" animate={false} />
            </View>

            <View style={styles.arrowWrap}>
              <LinearGradient
                colors={improved ? GRADIENTS.tealGreen : [COLORS.muted, COLORS.muted]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={styles.arrowCircle}
              >
                <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={COLORS.white} />
              </LinearGradient>
              <Text style={[styles.diffText, improved ? styles.diffPos : styles.diffNeg]}>
                {improved ? '+' : ''}{scoreDiff.toFixed(1)}
              </Text>
            </View>

            <View style={styles.scoreCol}>
              <Text style={styles.scoreLabel}>{t.rescan.after}</Text>
              <ScoreBadge score={result.score} size="medium" animate />
            </View>
          </View>

          {/* Images */}
          <View style={[styles.imageRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {previousImageUri && (
              <View style={styles.imageCol}>
                <Image source={{ uri: previousImageUri }} style={[styles.img, styles.imgBefore]} resizeMode="cover" />
                <Text style={styles.imgCaption}>{t.rescan.before}</Text>
              </View>
            )}
            {imageUri && (
              <View style={styles.imageCol}>
                <Image source={{ uri: imageUri }} style={[styles.img, styles.imgAfter]} resizeMode="cover" />
                <Text style={[styles.imgCaption, improved && { color: COLORS.green }]}>{t.rescan.after}</Text>
              </View>
            )}
          </View>

          {/* Improved banner */}
          {improved && (
            <View style={styles.improvedWrap}>
              <LinearGradient colors={GRADIENTS.tealGreen} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.improvedBanner}>
                <Text style={styles.greatJob}>{t.rescan.greatJob}</Text>
                <Text style={styles.pts}>+{scoreDiff.toFixed(1)} {t.rescan.pointsGained}</Text>
              </LinearGradient>
              <View style={styles.improvedBody}>
                <Text style={[styles.improvedTitle, rtlText(isRTL)]}>{t.rescan.improved}</Text>
                <Text style={[styles.improvedSummary, rtlText(isRTL)]}>{result.summary}</Text>
              </View>
            </View>
          )}

          {/* Remaining */}
          {result.fixes.length > 0 && (
            <View style={styles.remainingCard}>
              <Text style={[styles.remainingTitle, rtlText(isRTL)]}>
                {result.fixes.length === 1
                  ? (isRTL ? 'עוד תיקון קטן:' : 'One more small fix:')
                  : (isRTL ? 'עוד כמה תיקונים:' : 'A few more tweaks:')}
              </Text>
              {result.fixes.map((fix, i) => (
                <View key={i} style={[styles.remainingItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={styles.dot} />
                  <Text style={[styles.remainingText, rtlText(isRTL)]}>{fix.recommendation}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.ctaWrap}>
            <TouchableOpacity style={styles.newBtn} onPress={handleNewCheck} activeOpacity={0.85}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.newGradient}>
                <Ionicons name="scan-outline" size={20} color={COLORS.white} />
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
  diffNeg: { color: COLORS.pink },
  imageRow: { paddingHorizontal: SPACING.lg, gap: SPACING.md, marginBottom: SPACING.lg },
  imageCol: { flex: 1, alignItems: 'center', gap: SPACING.xs },
  img: { width: '100%', aspectRatio: 3/4, borderRadius: RADIUS.lg },
  imgBefore: { opacity: 0.7, borderWidth: 1.5, borderColor: COLORS.border },
  imgAfter: { borderWidth: 2, borderColor: COLORS.green },
  imgCaption: { fontSize: 11, fontWeight: '600', color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 1 },
  improvedWrap: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, borderRadius: RADIUS.lg, overflow: 'hidden' },
  improvedBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.md },
  greatJob: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  pts: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  improvedBody: { backgroundColor: COLORS.card, padding: SPACING.md },
  improvedTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.xs },
  improvedSummary: { fontSize: 14, color: COLORS.muted, lineHeight: 20 },
  remainingCard: { marginHorizontal: SPACING.lg, marginBottom: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  remainingTitle: { fontSize: 14, fontWeight: '700', color: COLORS.white, marginBottom: SPACING.sm },
  remainingItem: { alignItems: 'flex-start', gap: SPACING.sm, marginBottom: SPACING.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.pink, marginTop: 7, flexShrink: 0 },
  remainingText: { flex: 1, fontSize: 13, color: COLORS.muted, lineHeight: 20 },
  ctaWrap: { paddingHorizontal: SPACING.lg },
  newBtn: { borderRadius: RADIUS.round, overflow: 'hidden', shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 6 },
  newGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  newText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
});
