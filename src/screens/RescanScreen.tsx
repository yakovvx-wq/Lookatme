import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Rescan'>;

export default function RescanScreen() {
  const navigation = useNavigation<Nav>();
  const { result, previousResult, imageUri, previousImageUri, resetSession } = useApp();
  const t = useT();
  const isRTL = useRTL();

  if (!result || !previousResult) {
    return null;
  }

  const scoreDiff = result.score - previousResult.score;
  const improved = scoreDiff > 0;

  const handleNewCheck = () => {
    resetSession();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>{t.rescan.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Score comparison */}
        <View style={styles.scoreRow}>
          {/* Before */}
          <View style={styles.scoreColumn}>
            <Text style={styles.scoreLabel}>{t.rescan.before}</Text>
            <ScoreBadge score={previousResult.score} size="medium" animate={false} />
          </View>

          {/* Arrow */}
          <View style={styles.arrowContainer}>
            <LinearGradient
              colors={improved ? GRADIENTS.success : [COLORS.muted, COLORS.muted]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.arrowCircle}
            >
              <Ionicons
                name={isRTL ? 'arrow-back' : 'arrow-forward'}
                size={20}
                color={COLORS.white}
              />
            </LinearGradient>
            <Text style={[styles.diffText, improved ? styles.diffPositive : styles.diffNegative]}>
              {improved ? '+' : ''}{scoreDiff.toFixed(1)}
            </Text>
          </View>

          {/* After */}
          <View style={styles.scoreColumn}>
            <Text style={styles.scoreLabel}>{t.rescan.after}</Text>
            <ScoreBadge score={result.score} size="medium" animate />
          </View>
        </View>

        {/* Image comparison */}
        <View style={[styles.imageRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {previousImageUri && (
            <View style={styles.imageColumn}>
              <Image
                source={{ uri: previousImageUri }}
                style={[styles.comparisonImage, styles.imageBefore]}
                resizeMode="cover"
              />
              <Text style={styles.imageCaption}>{t.rescan.before}</Text>
            </View>
          )}
          {imageUri && (
            <View style={styles.imageColumn}>
              <Image
                source={{ uri: imageUri }}
                style={[styles.comparisonImage, styles.imageAfter]}
                resizeMode="cover"
              />
              <Text style={[styles.imageCaption, styles.imageCaptionAfter]}>
                {t.rescan.after}
              </Text>
            </View>
          )}
        </View>

        {/* What improved */}
        {improved && (
          <View style={styles.improvedSection}>
            <LinearGradient
              colors={GRADIENTS.success}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.improvedBanner}
            >
              <Text style={styles.greatJob}>{t.rescan.greatJob}</Text>
              <Text style={styles.pointsText}>
                +{scoreDiff.toFixed(1)} {t.rescan.pointsGained}
              </Text>
            </LinearGradient>

            <View style={styles.improvedContent}>
              <Text style={[styles.improvedTitle, rtlText(isRTL)]}>{t.rescan.improved}</Text>
              <Text style={[styles.improvedSummary, rtlText(isRTL)]}>{result.summary}</Text>
            </View>
          </View>
        )}

        {/* Remaining fixes */}
        {result.fixes.length > 0 && (
          <View style={styles.remainingSection}>
            <Text style={[styles.remainingTitle, rtlText(isRTL)]}>
              {result.fixes.length === 1
                ? (isRTL ? 'עוד תיקון קטן אחד:' : 'One more small fix:')
                : (isRTL ? 'עוד כמה תיקונים:' : 'A few more tweaks:')}
            </Text>
            {result.fixes.map((fix, i) => (
              <View key={i} style={styles.remainingItem}>
                <View style={styles.dot} />
                <Text style={[styles.remainingText, rtlText(isRTL)]}>
                  {fix.simple_instruction}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* New check CTA */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.newCheckButton}
            onPress={handleNewCheck}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.newCheckGradient}
            >
              <Ionicons name="scan-outline" size={20} color={COLORS.white} />
              <Text style={styles.newCheckText}>{t.rescan.newCheck}</Text>
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
  headerSpacer: { width: 40 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingBottom: SPACING.xxl,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    gap: SPACING.lg,
  },
  scoreColumn: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arrowContainer: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffText: {
    fontSize: 14,
    fontWeight: '700',
  },
  diffPositive: { color: COLORS.success },
  diffNegative: { color: COLORS.roseMid },
  imageRow: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  imageColumn: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  comparisonImage: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: RADIUS.lg,
  },
  imageBefore: {
    opacity: 0.85,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  imageAfter: {
    borderWidth: 2.5,
    borderColor: COLORS.success,
  },
  imageCaption: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  imageCaptionAfter: {
    color: COLORS.success,
  },
  improvedSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  improvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  greatJob: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  pointsText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  improvedContent: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
  },
  improvedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
  },
  improvedSummary: {
    fontSize: 14,
    color: COLORS.muted,
    lineHeight: 20,
  },
  remainingSection: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  remainingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  remainingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.roseMid,
    marginTop: 7,
    flexShrink: 0,
  },
  remainingText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 20,
  },
  ctaSection: {
    paddingHorizontal: SPACING.lg,
  },
  newCheckButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  newCheckGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  newCheckText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
});
