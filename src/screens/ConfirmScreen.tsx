import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ImageQuality } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL, rtlText } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import FaceFrame from '../components/FaceFrame';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Confirm'>;
type Route = RouteProp<RootStackParamList, 'Confirm'>;

const { width: SW } = Dimensions.get('window');
const IMG_H = SW * (4 / 3);

function useImageQuality(uri: string): ImageQuality {
  return useMemo(() => {
    // Simple heuristic: check URI for typical low-quality signals
    // A real check would look at image dimensions from ImagePicker result
    // For now default to Good since ImagePicker already gives us quality: 0.88
    return 'good';
  }, [uri]);
}

export default function ConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { imageUri, isRescan } = route.params;

  const { setImage, prepareRescan } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const quality = useImageQuality(imageUri);

  const qualityColor =
    quality === 'good' ? COLORS.green :
    quality === 'medium' ? COLORS.yellow :
    COLORS.pink;

  const qualityLabel =
    quality === 'good' ? t.confirm.qualityGood :
    quality === 'medium' ? t.confirm.qualityMedium :
    t.confirm.qualityPoor;

  const handleAnalyze = () => {
    if (isRescan) {
      prepareRescan(imageUri);
      navigation.navigate('Analyzing', { isRescan: true });
    } else {
      setImage(imageUri);
      navigation.navigate('Goal');
    }
  };

  const handleRetake = () => {
    navigation.goBack();
  };

  const checks = [
    { key: 'checkFace',    icon: 'person-outline'       },
    { key: 'checkLight',   icon: 'sunny-outline'        },
    { key: 'checkVisible', icon: 'eye-outline'          },
    { key: 'checkFilter',  icon: 'image-outline'        },
  ] as const;

  const imgH = Math.min(IMG_H, 420);

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
      <SafeAreaView style={styles.safe} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backBtn} onPress={handleRetake}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.confirm.title}</Text>
          <View style={styles.backBtn} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Image preview with face frame */}
          <View style={[styles.imageWrap, { height: imgH }]}>
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            <FaceFrame width={SW - SPACING.lg * 2} height={imgH} />
          </View>

          {/* Quality badge */}
          <View style={[styles.qualityRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.qualityDot, { backgroundColor: qualityColor }]} />
            <Text style={[styles.qualityLabel, { color: qualityColor }]}>{qualityLabel}</Text>
          </View>
          {quality === 'poor' && (
            <Text style={[styles.qualityNote, rtlText(isRTL)]}>{t.confirm.qualityNote}</Text>
          )}

          {/* Checklist */}
          <View style={styles.checklist}>
            {checks.map(({ key, icon }) => (
              <View key={key} style={[styles.checkRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark" size={14} color={COLORS.green} />
                </View>
                <Text style={[styles.checkLabel, rtlText(isRTL)]}>{t.confirm[key]}</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* CTA */}
        <View style={[styles.cta, { paddingBottom: SPACING.xl }]}>
          {quality === 'poor' ? (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze} activeOpacity={0.85}>
                <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                  <Text style={styles.btnText}>{t.confirm.continueAnyway}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.outlineBtn} onPress={handleRetake}>
                <Ionicons name="camera-outline" size={18} color={COLORS.pink} />
                <Text style={styles.outlineBtnText}>{t.confirm.retake}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.primaryBtn} onPress={handleAnalyze} activeOpacity={0.85}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGrad}>
                <Ionicons name="sparkles-outline" size={20} color={COLORS.white} />
                <Text style={styles.btnText}>{t.confirm.analyze}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
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
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: COLORS.white, textAlign: 'center' },
  scroll: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  imageWrap: {
    width: '100%',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
  },
  image: { width: '100%', height: '100%' },
  qualityRow: {
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  qualityDot: { width: 8, height: 8, borderRadius: 4 },
  qualityLabel: { fontSize: 13, fontWeight: '700' },
  qualityNote: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  checklist: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  checkRow: { alignItems: 'center', gap: SPACING.sm },
  checkIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.green + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLabel: { flex: 1, fontSize: 14, color: COLORS.white, fontWeight: '500' },
  cta: { paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  primaryBtn: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  outlineBtn: {
    borderRadius: RADIUS.round,
    borderWidth: 1.5,
    borderColor: COLORS.pink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  outlineBtnText: { color: COLORS.pink, fontSize: 15, fontWeight: '600' },
});
