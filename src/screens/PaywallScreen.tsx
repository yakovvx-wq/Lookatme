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
import { COLORS, GRADIENTS, RING_COLORS, SPACING, RADIUS } from '../theme';
import LogoCircles from '../components/LogoCircles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

export default function PaywallScreen() {
  const navigation = useNavigation<Nav>();
  const { setIsPro } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const handleUpgrade = () => { setIsPro(true); navigation.goBack(); };
  const handleLater   = () => navigation.goBack();

  const proFeatures = [
    { icon: 'eye-outline',          label: isRTL ? '3 תיקונים מלאים' : '3 full makeup fixes' },
    { icon: 'refresh-outline',      label: isRTL ? 'סריקה חוזרת ללא הגבלה' : 'Unlimited rescans' },
    { icon: 'sparkles-outline',     label: isRTL ? 'ניתוח מפורט AI' : 'Detailed AI analysis' },
    { icon: 'lock-open-outline',    label: isRTL ? 'כל האזורים עם סימון' : 'All zones with markers' },
  ];

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.closeBtn} onPress={handleLater}>
          <Ionicons name="close" size={22} color={COLORS.muted} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <LogoCircles size={130} spin />
          </View>

          <Text style={styles.title}>{t.paywall.title}</Text>
          <Text style={styles.subtitle}>{t.paywall.subtitle}</Text>

          {/* Features */}
          <View style={styles.features}>
            {proFeatures.map((f, i) => (
              <View key={i} style={[styles.featureRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.featureIcon, { backgroundColor: RING_COLORS[i] + '22' }]}>
                  <Ionicons name={f.icon as any} size={20} color={RING_COLORS[i]} />
                </View>
                <Text style={[styles.featureText, rtlText(isRTL)]}>{f.label}</Text>
              </View>
            ))}
          </View>

          {/* Price card */}
          <View style={styles.priceCard}>
            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.priceGradient}>
              <Text style={styles.priceLabel}>{isRTL ? 'פרו · בלתי מוגבל' : 'Pro · Unlimited'}</Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>$4.99</Text>
                <Text style={styles.pricePer}>/{isRTL ? 'חודש' : 'mo'}</Text>
              </View>
              <View style={styles.bestBadge}>
                <Text style={styles.bestText}>{t.paywall.bestValue}</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Trust */}
          <View style={styles.trustRow}>
            {[
              { icon: 'shield-checkmark-outline', label: isRTL ? 'ביטול בכל עת' : 'Cancel anytime' },
              { icon: 'lock-closed-outline',      label: isRTL ? 'תשלום מאובטח' : 'Secure payment' },
            ].map((item, i) => (
              <View key={i} style={styles.trustItem}>
                <Ionicons name={item.icon as any} size={14} color={COLORS.muted} />
                <Text style={styles.trustText}>{item.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={styles.cta}>
          <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
            <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.upgradeGradient}>
              <Text style={styles.upgradeText}>{t.paywall.cta}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLater} style={styles.laterBtn}>
            <Text style={styles.laterText}>{t.paywall.later}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1 },
  closeBtn: { alignSelf: 'flex-end', padding: SPACING.md },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md, alignItems: 'center' },
  logoWrap: { marginBottom: SPACING.lg },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, textAlign: 'center', letterSpacing: -0.5, marginBottom: SPACING.sm },
  subtitle: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22, marginBottom: SPACING.xl, maxWidth: 280 },
  features: { width: '100%', gap: SPACING.md, marginBottom: SPACING.xl },
  featureRow: { alignItems: 'center', gap: SPACING.md },
  featureIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  featureText: { flex: 1, fontSize: 15, color: COLORS.white, fontWeight: '500' },
  priceCard: {
    width: '100%', borderRadius: RADIUS.xl, overflow: 'hidden',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
  },
  priceGradient: { padding: SPACING.lg, alignItems: 'center', gap: SPACING.xs },
  priceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, letterSpacing: 1, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 44, fontWeight: '800', color: COLORS.white },
  pricePer: { fontSize: 18, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  bestBadge: { backgroundColor: COLORS.yellow, borderRadius: RADIUS.round, paddingHorizontal: SPACING.md, paddingVertical: 4 },
  bestText: { fontSize: 12, fontWeight: '700', color: COLORS.dark },
  trustRow: { flexDirection: 'row', gap: SPACING.xl, marginBottom: SPACING.md },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  trustText: { fontSize: 12, color: COLORS.muted },
  cta: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.sm, gap: SPACING.sm },
  upgradeBtn: {
    borderRadius: RADIUS.round, overflow: 'hidden',
    shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  upgradeGradient: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 4 },
  upgradeText: { color: COLORS.white, fontSize: 17, fontWeight: '700', letterSpacing: 0.3 },
  laterBtn: { alignItems: 'center', paddingVertical: SPACING.sm },
  laterText: { fontSize: 14, color: COLORS.muted },
});
