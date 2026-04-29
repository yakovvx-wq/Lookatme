import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Capture'>;
type Route = RouteProp<RootStackParamList, 'Capture'>;

export default function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const isRescan = route.params?.isRescan ?? false;

  const { setImage, prepareRescan } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) setPreviewUri(result.assets[0].uri);
  };

  const handleContinue = () => {
    if (!previewUri) return;
    if (isRescan) {
      prepareRescan(previewUri);
      navigation.navigate('Analyzing', { isRescan: true });
    } else {
      setImage(previewUri);
      navigation.navigate('Goal');
    }
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{isRescan ? t.capture.rescanTitle : t.capture.title}</Text>
            <Text style={styles.headerSub}>{isRescan ? t.capture.rescanSubtitle : t.capture.subtitle}</Text>
          </View>
          <View style={styles.backBtn} />
        </View>

        {/* Preview */}
        <View style={styles.previewArea}>
          {previewUri ? (
            <View style={styles.imageWrap}>
              <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
              <TouchableOpacity style={styles.retakeBtn} onPress={() => setPreviewUri(null)}>
                <Ionicons name="refresh" size={16} color={COLORS.white} />
                <Text style={styles.retakeText}>{t.capture.retake}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderIcon}>
                <Ionicons name="camera-outline" size={52} color={COLORS.pink} />
              </View>
              <Text style={styles.placeholderText}>
                {isRescan ? t.capture.rescanSubtitle : t.capture.subtitle}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!previewUri ? (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={openCamera} activeOpacity={0.85}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Ionicons name="camera" size={22} color={COLORS.white} />
                <Text style={styles.btnText}>{t.capture.camera}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineBtn} onPress={openGallery} activeOpacity={0.8}>
              <Ionicons name="images-outline" size={22} color={COLORS.pink} />
              <Text style={styles.outlineBtnText}>{t.capture.gallery}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.85}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btnGradient}>
                <Text style={styles.btnText}>{t.capture.continue}</Text>
                <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={COLORS.white} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.dark },
  safe: { flex: 1, paddingHorizontal: SPACING.lg },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  headerSub: { fontSize: 12, color: COLORS.muted, marginTop: 2, textAlign: 'center' },
  previewArea: { flex: 1, marginBottom: SPACING.md },
  imageWrap: { flex: 1 },
  preview: { flex: 1, borderRadius: RADIUS.xl },
  retakeBtn: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  retakeText: { color: COLORS.white, fontSize: 13, fontWeight: '600' },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.md,
  },
  placeholderIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,91,167,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: { fontSize: 14, color: COLORS.muted, textAlign: 'center', maxWidth: 220, lineHeight: 20 },
  actions: { paddingBottom: SPACING.xl, gap: SPACING.sm },
  primaryBtn: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
    shadowColor: COLORS.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnGradient: {
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
  outlineBtnText: { color: COLORS.pink, fontSize: 16, fontWeight: '600' },
});
