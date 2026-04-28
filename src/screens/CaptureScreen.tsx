import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
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
      Alert.alert('Permission needed', 'Camera access is required to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const handleContinue = () => {
    if (!previewUri) return;
    
    if (isRescan) {
      // For rescan: save previous result/image, set new image, then navigate
      prepareRescan(previewUri);
      navigation.navigate('Analyzing', { isRescan: true });
    } else {
      // For new capture: just set the image and proceed normally
      setImage(previewUri);
      navigation.navigate('Goal');
    }
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {isRescan ? t.capture.rescanTitle : t.capture.title}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isRescan ? t.capture.rescanSubtitle : t.capture.subtitle}
          </Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {/* Image Preview */}
      <View style={styles.previewArea}>
        {previewUri ? (
          <View style={styles.imageWrapper}>
            <Image source={{ uri: previewUri }} style={styles.preview} resizeMode="cover" />
            <TouchableOpacity style={styles.retakeButton} onPress={() => setPreviewUri(null)}>
              <Ionicons name="refresh" size={18} color={COLORS.white} />
              <Text style={styles.retakeText}>{t.capture.retake}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <View style={styles.placeholderIcon}>
              <Ionicons name="camera-outline" size={56} color={COLORS.roseLight} />
            </View>
            <Text style={styles.placeholderText}>
              {isRescan ? t.capture.rescanSubtitle : t.capture.subtitle}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {!previewUri ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={openCamera} activeOpacity={0.8}>
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Ionicons name="camera" size={22} color={COLORS.white} />
              <Text style={styles.actionText}>{t.capture.camera}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={openGallery}
            activeOpacity={0.8}
          >
            <Ionicons name="images-outline" size={22} color={COLORS.roseMid} />
            <Text style={[styles.actionText, styles.actionTextOutline]}>{t.capture.gallery}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleContinue} activeOpacity={0.85}>
            <LinearGradient
              colors={GRADIENTS.roseDeep}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionText}>{t.capture.continue}</Text>
              <Ionicons name={isRTL ? 'arrow-back' : 'arrow-forward'} size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.dark,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
    textAlign: 'center',
  },
  previewArea: {
    flex: 1,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  imageWrapper: {
    flex: 1,
  },
  preview: {
    flex: 1,
    borderRadius: RADIUS.xl,
  },
  retakeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  retakeText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  placeholder: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: SPACING.md,
  },
  placeholderIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 220,
    lineHeight: 20,
  },
  actions: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  actionButton: {
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  actionButtonOutline: {
    borderWidth: 2,
    borderColor: COLORS.roseMid,
    borderRadius: RADIUS.round,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  actionText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  actionTextOutline: {
    color: COLORS.roseMid,
  },
});
