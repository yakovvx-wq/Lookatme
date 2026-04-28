import React, { useState } from 'react';
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
import { Goal, RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';

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
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={COLORS.dark}
          />
        </TouchableOpacity>
        {/* Progress dots */}
        <View style={styles.progress}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, rtlText(isRTL)]}>{t.goal.title}</Text>
        <Text style={[styles.subtitle, rtlText(isRTL)]}>{t.goal.subtitle}</Text>

        <View style={styles.grid}>
          {GOAL_OPTIONS.map((opt) => {
            const label = t.goal[opt.id];
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(opt.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <Text
                  style={[
                    styles.cardLabel,
                    isSelected && styles.cardLabelSelected,
                  ]}
                >
                  {label}
                </Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.nextButton, !selected && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? GRADIENTS.roseDeep : [COLORS.border, COLORS.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextGradient}
          >
            <Text style={[styles.nextText, !selected && styles.nextTextDisabled]}>
              {t.goal.next}
            </Text>
            <Ionicons
              name={isRTL ? 'arrow-back' : 'arrow-forward'}
              size={20}
              color={selected ? COLORS.white : COLORS.muted}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
  progress: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.roseMid,
    width: 24,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.dark,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  cardSelected: {
    borderColor: COLORS.roseMid,
    backgroundColor: '#FFF0F4',
  },
  emoji: {
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
  },
  cardLabelSelected: {
    color: COLORS.roseMid,
  },
  checkCircle: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.roseMid,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  nextButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  nextText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  nextTextDisabled: {
    color: COLORS.muted,
  },
});
