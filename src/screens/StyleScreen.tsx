import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  Alert,
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
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';

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
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setInspirationUri(result.assets[0].uri);
      setInspirationImage(result.assets[0].uri);
    }
  };

  const handleAnalyze = () => {
    if (!selected) return;
    setStyle(selected);
    navigation.navigate('Analyzing', { isRescan: false });
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
        <View style={styles.progress}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.dotActive]} />
        </View>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, rtlText(isRTL)]}>{t.style.title}</Text>
        <Text style={[styles.subtitle, rtlText(isRTL)]}>{t.style.subtitle}</Text>

        <View style={styles.grid}>
          {STYLE_OPTIONS.map((opt) => {
            const label = t.style[opt.id];
            const desc = opt.desc[language];
            const isSelected = selected === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => setSelected(opt.id)}
                activeOpacity={0.75}
              >
                <Text style={styles.emoji}>{opt.emoji}</Text>
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                  {label}
                </Text>
                <Text style={styles.cardDesc}>{desc}</Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={12} color={COLORS.white} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Inspiration */}
        <TouchableOpacity
          style={styles.inspirationButton}
          onPress={pickInspiration}
          activeOpacity={0.7}
        >
          {inspirationUri ? (
            <Image source={{ uri: inspirationUri }} style={styles.inspirationPreview} />
          ) : (
            <Ionicons name="image-outline" size={22} color={COLORS.roseMid} />
          )}
          <Text style={styles.inspirationText}>{t.style.inspiration}</Text>
          {inspirationUri && (
            <TouchableOpacity
              onPress={() => {
                setInspirationUri(null);
                setInspirationImage(null);
              }}
              style={styles.removeInspiration}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.muted} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* CTA */}
      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.analyzeButton, !selected && styles.analyzeButtonDisabled]}
          onPress={handleAnalyze}
          disabled={!selected}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={selected ? GRADIENTS.roseDeep : [COLORS.border, COLORS.border]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.analyzeGradient}
          >
            <Ionicons
              name="scan-outline"
              size={20}
              color={selected ? COLORS.white : COLORS.muted}
            />
            <Text style={[styles.analyzeText, !selected && styles.analyzeTextDisabled]}>
              {t.style.analyze}
            </Text>
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
    marginBottom: SPACING.lg,
  },
  card: {
    width: '47%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
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
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.dark,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardLabelSelected: {
    color: COLORS.roseMid,
  },
  cardDesc: {
    fontSize: 11,
    color: COLORS.muted,
    textAlign: 'center',
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
  inspirationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  inspirationPreview: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
  },
  inspirationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.roseMid,
    fontWeight: '500',
  },
  removeInspiration: {
    padding: SPACING.xs,
  },
  bottom: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  analyzeButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  analyzeText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
  },
  analyzeTextDisabled: {
    color: COLORS.muted,
  },
});
