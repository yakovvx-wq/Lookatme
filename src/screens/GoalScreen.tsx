import React, { useState } from 'react';
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
import { Goal, RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, RING_COLORS, SPACING, RADIUS } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Goal'>;

const GOAL_OPTIONS: { id: Goal; emoji: string }[] = [
  { id: 'daily', emoji: '☀️' },
  { id: 'work', emoji: '💼' },
  { id: 'date', emoji: '🌙' },
  { id: 'event', emoji: '✨' },
  { id: 'photo', emoji: '📸' },
];

export default function GoalScreen() {
  const navigation = useNavigation<Nav>();
  const { setGoal } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const [selected, setSelected] = useState<Goal | null>(null);

  const handleNext = () => {
    if (!selected) return;
    setGoal(selected);
    navigation.navigate('Style');
  };

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.progressRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
          <View style={styles.backBtn} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, rtlText(isRTL)]}>{t.goal.title}</Text>
          <Text style={[styles.subtitle, rtlText(isRTL)]}>{t.goal.subtitle}</Text>

          <View style={styles.grid}>
            {GOAL_OPTIONS.map((opt, idx) => {
              const label = t.goal[opt.id];
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
                  <Text style={[styles.cardLabel, isSelected && { color: accentColor }]}>{label}</Text>
                  {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: accentColor }]}>
                      <Ionicons name="checkmark" size={11} color={COLORS.white} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.nextBtn, !selected && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={selected ? GRADIENTS.primary : [COLORS.card, COLORS.card]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.nextGradient}
            >
              <Text style={[styles.nextText, !selected && styles.nextTextOff]}>{t.goal.next}</Text>
              <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={selected ? COLORS.white : COLORS.muted} />
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
  header: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressRow: { flex: 1, flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.pink, width: 24 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.lg },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.xs, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: COLORS.muted, marginBottom: SPACING.xl, lineHeight: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  card: {
    width: '47%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  emoji: { fontSize: 36, marginBottom: SPACING.sm },
  cardLabel: { fontSize: 15, fontWeight: '600', color: COLORS.white, textAlign: 'center' },
  checkCircle: {
    position: 'absolute',
    top: SPACING.sm, right: SPACING.sm,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  bottom: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.xl, paddingTop: SPACING.sm },
  nextBtn: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  nextBtnDisabled: { shadowOpacity: 0, elevation: 0 },
  nextGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  nextText: { color: COLORS.white, fontSize: 17, fontWeight: '700' },
  nextTextOff: { color: COLORS.muted },
});
