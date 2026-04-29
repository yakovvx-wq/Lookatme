import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { useT, useRTL } from '../i18n';
import { COLORS, GRADIENTS, SPACING, RADIUS } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';
import FaceFrame from '../components/FaceFrame';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Capture'>;
type Route = RouteProp<RootStackParamList, 'Capture'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export default function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const isRescan = route.params?.isRescan ?? false;
  const insets = useSafeAreaInsets();

  const { setImage, prepareRescan } = useApp();
  const t = useT();
  const isRTL = useRTL();

  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('front');

  const goToConfirm = useCallback((uri: string) => {
    navigation.navigate('Confirm', { imageUri: uri, isRescan });
  }, [isRescan, navigation]);

  const takePicture = async () => {
    if (!cameraRef.current || !cameraReady || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.88, skipProcessing: false });
      if (photo?.uri) goToConfirm(photo.uri);
    } catch (e) {
      // silently handle camera error
    } finally {
      setCapturing(false);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.88,
      allowsEditing: true,
      aspect: [3, 4],
    });
    if (!result.canceled && result.assets[0]) {
      goToConfirm(result.assets[0].uri);
    }
  };

  // Camera not permitted yet — ask
  if (!permission) return <View style={styles.bg} />;

  if (!permission.granted) {
    return (
      <View style={styles.bg}>
        <StatusBar barStyle="light-content" backgroundColor="#0F0F10" />
        <SafeAreaView style={styles.permSafe}>
          <View style={styles.permContent}>
            <Ionicons name="camera-outline" size={64} color={COLORS.pink} />
            <Text style={styles.permTitle}>{isRTL ? 'נדרשת גישה למצלמה' : 'Camera Access Needed'}</Text>
            <Text style={styles.permBody}>
              {isRTL
                ? 'כדי לצלם את האיפור שלך, נצטרך גישה למצלמה.'
                : 'To take your makeup photo, we need camera access.'}
            </Text>
            <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
              <LinearGradient colors={GRADIENTS.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.permBtnGrad}>
                <Text style={styles.permBtnText}>{isRTL ? 'אפשרי גישה' : 'Allow Camera'}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={openGallery} style={styles.galleryFallback}>
              <Text style={styles.galleryFallbackText}>{t.capture.gallery}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const camH = SCREEN_H;
  const camW = SCREEN_W;

  return (
    <View style={styles.bg}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Full-screen camera */}
      <CameraView
        ref={cameraRef}
        style={{ width: camW, height: camH }}
        facing={facing}
        onCameraReady={() => setCameraReady(true)}
      />

      {/* Face frame overlay */}
      <FaceFrame width={camW} height={camH} pulse />

      {/* Top bar */}
      <SafeAreaView style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        <View style={[styles.topBar, { paddingTop: insets.top + SPACING.sm, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? 'chevron-forward' : 'chevron-back'} size={26} color={COLORS.white} />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.topTitle}>
              {isRescan ? t.capture.rescanTitle : t.capture.frameHint}
            </Text>
            <Text style={styles.topSub}>
              {isRescan ? t.capture.rescanSubtitle : t.capture.frameSubHint}
            </Text>
          </View>

          <TouchableOpacity style={styles.iconBtn} onPress={() => setFacing(f => f === 'front' ? 'back' : 'front')}>
            <Ionicons name="camera-reverse-outline" size={26} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Bottom controls */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + SPACING.md }]}>
          {/* Gallery button */}
          <TouchableOpacity style={styles.sideBtn} onPress={openGallery}>
            <Ionicons name="images-outline" size={28} color={COLORS.white} />
            <Text style={styles.sideBtnText}>{isRTL ? 'גלריה' : 'Gallery'}</Text>
          </TouchableOpacity>

          {/* Shutter button */}
          <TouchableOpacity
            style={[styles.shutter, capturing && styles.shutterActive]}
            onPress={takePicture}
            activeOpacity={0.8}
          >
            <View style={styles.shutterInner} />
          </TouchableOpacity>

          {/* Spacer */}
          <View style={styles.sideBtn} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#000' },
  topBar: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  topSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: SPACING.xl,
  },
  sideBtn: {
    width: 64,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  sideBtnText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  shutterActive: {
    borderColor: COLORS.pink,
    backgroundColor: 'rgba(255,91,167,0.2)',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
  },
  // Permission screen
  permSafe: { flex: 1 },
  permContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  permTitle: { fontSize: 22, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  permBody: { fontSize: 15, color: COLORS.muted, textAlign: 'center', lineHeight: 22 },
  permBtn: { width: '100%', borderRadius: RADIUS.round, overflow: 'hidden', marginTop: SPACING.md },
  permBtnGrad: { alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2 },
  permBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  galleryFallback: { marginTop: SPACING.sm, padding: SPACING.sm },
  galleryFallbackText: { color: COLORS.muted, fontSize: 14 },
});
