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

type Nav = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { setIsPro } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const handleUpgrade = () => {
    // TODO: integrate RevenueCat
    setIsPro(true);
    navigation.goBack();
  };

  const handleLater = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={GRADIENTS.roseDeep} style={styles.headerGradient}>
        <TouchableOpacity style={styles.closeButton} onPress={handleLater}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerIcon}>✨</Text>
          <Text style={styles.headerTitle}>{t.paywall.title}</Text>
          <Text style={styles.headerSubtitle}>{t.paywall.subtitle}</Text>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Comparison */}
        <View style={[styles.comparisonRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {/* Free column */}
          <View style={styles.planColumn}>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>{t.paywall.free}</Text>
            </View>
            {t.paywall.freeFeatures.map((feature, i) => (
              <View key={i} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.muted} />
                <Text style={[styles.featureText, rtlText(isRTL)]}>{feature}</Text>
              </View>
            ))}
            {t.paywall.proFeatures.slice(2).map((_, i) => (
              <View key={`x-${i}`} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.border} />
                <Text style={[styles.featureText, styles.featureTextDisabled, rtlText(isRTL)]}>—</Text>
              </View>
            ))}
          </View>

          {/* Pro column */}
          <View style={[styles.planColumn, styles.planColumnPro]}>
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              style={styles.planColumnProGradient}
            >
              <View style={[styles.planHeader, styles.planHeaderPro]}>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>{t.paywall.bestValue}</Text>
                </View>
                <Text style={styles.planNamePro}>{t.paywall.pro}</Text>
              </View>
              {t.paywall.proFeatures.map((feature, i) => (
                <View key={i} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.goldLight} />
                  <Text style={[styles.featureText, styles.featureTextPro, rtlText(isRTL)]}>
                    {feature}
                  </Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </View>

        {/* Trust signals */}
        <View style={styles.trustRow}>
          {[
            { icon: 'shield-checkmark-outline', label: isRTL ? 'ביטול בכל עת' : 'Cancel anytime' },
            { icon: 'lock-closed-outline', label: isRTL ? 'תשלום מאובטח' : 'Secure payment' },
          ].map((item, i) => (
            <View key={i} style={styles.trustItem}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={16} color={COLORS.muted} />
              <Text style={styles.trustText}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottomCta}>
        <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgrade} activeOpacity={0.85}>
          <LinearGradient
            colors={GRADIENTS.roseDeep}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.upgradeGradient}
          >
            <Text style={styles.upgradeText}>{t.paywall.cta}</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLater} style={styles.laterButton}>
          <Text style={styles.laterText}>{t.paywall.later}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.cream },
  headerGradient: {
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.md,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: SPACING.md,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.white,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  comparisonRow: {
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  planColumn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  planColumnPro: {
    borderColor: COLORS.roseMid,
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  planColumnProGradient: {
    flex: 1,
    padding: 0,
  },
  planHeader: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  planHeaderPro: {
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  bestValueBadge: {
    backgroundColor: COLORS.goldLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.round,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.dark,
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.dark,
  },
  planNamePro: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
  },
  featureRow: {
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
  },
  featureText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.dark,
    lineHeight: 18,
  },
  featureTextPro: {
    color: COLORS.white,
  },
  featureTextDisabled: {
    color: COLORS.border,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xl,
    marginBottom: SPACING.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  trustText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  bottomCta: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
    gap: SPACING.sm,
  },
  upgradeButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.roseDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  upgradeGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 4,
  },
  upgradeText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  laterText: {
    fontSize: 14,
    color: COLORS.muted,
  },
});
