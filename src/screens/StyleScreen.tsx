import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Style, RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, RING_COLORS, SPACING, RADIUS } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Style'>;

const STYLE_OPTIONS: { id: Style; emoji: string; desc: { en: string; he: string } }[] = [
  { id: 'natural', emoji: '🌿', desc: { en: 'Minimal, skin-first', he: 'מינימלי, עור קודם' } },
  { id: 'clean', emoji: '✨', desc: { en: 'Fresh & polished', he: 'טרי ומלוטש' } },
  { id: 'softGlam', emoji: '💫', desc: { en: 'Subtle shimmer', he: 'ניצוץ עדין' } },
  { id: 'fullGlam', emoji: '💎', desc: { en: 'Fully done up', he: 'לוק מלא' } },
  { id: 'dramatic', emoji: '🎭', desc: { en: 'Dark & bold edges', he: 'קצוות נועזים' } },
  { id: 'bold', emoji: '🔥', desc: { en: 'Statement look', he: 'לוק בולט' } },
];

export default function StyleScreen() {
  const navigation = useNavigation<Nav>();
  const { setStyle, setInspirationImage, language } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const [selected, setSelected] = useState<Style | null>(null);
  const [inspirationUri, setInspirationUri] = useState<string | null>(null);

  const pickInspiration = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Photo library access is required.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) { setInspirationUri(result.assets[0].uri); setInspirationImage(result.assets[0].uri); }
  };

  const handleAnalyze = () => {
    if (!selected) return;
    setStyle(selected);
    navigation.navigate('Analyzing', { isRescan: false });
  };

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.progressRow}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <View style={styles.backBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, rtlText(isRTL)]}>{t.style.title}</Text>
          <Text style={[styles.subtitle, rtlText(isRTL)]}>{t.style.subtitle}</Text>

          <View style={styles.grid}>
            {STYLE_OPTIONS.map((opt, idx) => {
              const isSelected = selected === opt.id;
              const accentColor = RING_COLORS[idx % RING_COLORS.length];
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.card, isSelected && { borderColor: accentColor, borderWidth: 1.5 }]}
                  onPress={() => setSelected(opt.id)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.emoji}>{opt.emoji}</Text>
                  <Text style={[styles.cardLabel, isSelected && { color: accentColor }]}>{t.style[opt.id]}</Text>
                  <Text style={styles.cardDesc}>{opt.desc[language]}</Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: accentColor }]}>
                      <Ionicons name="checkmark" size={11} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.inspirationBtn} onPress={pickInspiration} activeOpacity={0.7}>
            {inspirationUri ? (
              <Image source={{ uri: inspirationUri }} style={styles.inspirationImg} />
            ) : (
              <Ionicons name="image-outline" size={22} color={COLORS.pink} />
            )}
            <Text style={styles.inspirationText}>{t.style.inspiration}</Text>
            {inspirationUri && (
              <TouchableOpacity onPress={() => { setInspirationUri(null); setInspirationImage(null); }}>
                <Ionicons name="close-circle" size={18} color={COLORS.muted} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.analyzeBtn, !selected && styles.analyzeBtnOff]}
            onPress={handleAnalyze}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={selected ? GRADIENTS.primary : [COLORS.card, COLORS.card]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.analyzeGradient}
            >
              <Ionicons name="scan-outline" size={20} color={selected ? COLORS.white : COLORS.muted} />
              <Text style={[styles.analyzeText, !selected && styles.analyzeTextOff]}>{t.style.analyze}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1 },
  header: { alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.pink, width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: SPACING.xl, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.lg },
  card: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  emoji: { fontSize: 32, marginBottom: SPACING.xs },
  cardLabel: { fontSize: 14, fontWeight: '600', color: COLORS.white, textAlign: 'center', marginBottom: 2 },
  cardDesc: { fontSize: 11, color: COLORS.muted, textAlign: 'center' },
  checkCircle: { position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inspirationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  inspirationImg: { width: 36, height: 36, borderRadius: RADIUS.sm },
  inspirationText: { flex: 1, fontSize: 14, color: COLORS.pink, fontWeight: '500' },
  bottom: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.sm },
  analyzeBtn: {
    borderRadius: RADIUS.round, overflow: 'hidden',
    shadowColor: COLORS.pink, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  analyzeBtnOff: { shadowOpacity: 0, elevation: 0 },
  analyzeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  analyzeText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  analyzeTextOff: { color: COLORS.muted },
});
