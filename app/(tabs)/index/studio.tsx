import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  LayoutChangeEvent,
  ImageStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RotateCcw, Check, Sun, Contrast, RotateCw, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLang } from '@/context/LanguageContext';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';

const DEFAULT_BRIGHTNESS = 1;
const DEFAULT_CONTRAST = 1;
const DEFAULT_ROTATION = 0;

const PHOTO_URI =
  'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=800';

function CustomSlider({
  value,
  min,
  max,
  step,
  onValueChange,
  trackColor,
  thumbColor,
}: {
  value: number;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
  trackColor: string;
  thumbColor: string;
}) {
  const [width, setWidth] = useState(0);
  const isDragging = useRef(false);

  const range = max - min;
  const pct = (value - min) / range;

  const updateFromX = (x: number) => {
    const clamped = Math.max(0, Math.min(width, x));
    const raw = min + (clamped / width) * range;
    const stepped = Math.round(raw / step) * step;
    onValueChange(Math.max(min, Math.min(max, stepped)));
  };

  return (
    <View
      style={styles.sliderTrackWrap}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      onStartShouldSetResponder={() => true}
      onMoveShouldSetResponder={() => true}
      onResponderGrant={(e) => {
        isDragging.current = true;
        updateFromX(e.nativeEvent.locationX);
      }}
      onResponderMove={(e) => {
        if (isDragging.current) updateFromX(e.nativeEvent.locationX);
      }}
      onResponderRelease={() => {
        isDragging.current = false;
      }}
    >
      <View style={[styles.sliderTrack, { backgroundColor: trackColor }]} />
      <View
        style={[
          styles.sliderFill,
          { width: width > 0 ? width * pct : 0, backgroundColor: thumbColor },
        ]}
      />
      <View
        style={[
          styles.sliderThumb,
          {
            left: width > 0 ? width * pct - 11 : 0,
            backgroundColor: thumbColor,
          },
        ]}
      />
    </View>
  );
}

function SliderRow({
  icon,
  label,
  value,
  displayValue,
  min,
  max,
  step,
  onValueChange,
  accentColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  displayValue: string;
  min: number;
  max: number;
  step: number;
  onValueChange: (v: number) => void;
  accentColor: string;
}) {
  return (
    <View style={styles.sliderRow}>
      <View style={styles.sliderHeader}>
        {icon}
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={[styles.sliderValue, { color: accentColor }]}>{displayValue}</Text>
      </View>
      <CustomSlider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={onValueChange}
        trackColor={colors.surfaceAlt}
        thumbColor={accentColor}
      />
    </View>
  );
}

export default function StudioScreen() {
  const { tr, lang, isRTL } = useLang();
  const router = useRouter();
  const [brightness, setBrightness] = useState(DEFAULT_BRIGHTNESS);
  const [contrast, setContrast] = useState(DEFAULT_CONTRAST);
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const [saved, setSaved] = useState(false);

  const rtlText = { textAlign: isRTL ? ('right' as const) : ('left' as const) };
  const rtlRow = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  const filterStyle: ImageStyle = {
    // @ts-expect-error: CSS filter property is web-only and not in RN types
    filter: `brightness(${brightness}) contrast(${contrast})`,
    transform: [{ rotate: `${rotation}deg` }],
  };

  const handleReset = () => {
    setBrightness(DEFAULT_BRIGHTNESS);
    setContrast(DEFAULT_CONTRAST);
    setRotation(DEFAULT_ROTATION);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.back();
    }, 1200);
  };

  const isModified =
    brightness !== DEFAULT_BRIGHTNESS ||
    contrast !== DEFAULT_CONTRAST ||
    rotation !== DEFAULT_ROTATION;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, rtlRow]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, rtlText]}>{tr.studioTitle}</Text>
          <Text style={[styles.headerSub, rtlText]}>{tr.studioSubtitle}</Text>
        </View>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetBtn}
          activeOpacity={0.7}
          disabled={!isModified}
        >
          <RotateCcw size={18} color={isModified ? colors.gold : colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Photo Preview */}
        <View style={styles.previewWrap}>
          <View style={styles.previewFrame}>
            <Image
              source={{ uri: PHOTO_URI }}
              style={[styles.previewImage, filterStyle]}
              resizeMode="cover"
            />
            <View style={styles.previewOverlay}>
              <Camera size={28} color={colors.textMuted} />
            </View>
          </View>
        </View>

        {/* Controls */}
        <GradientCard variant="primary" style={styles.controlsCard}>
          <SliderRow
            icon={<Sun size={16} color={colors.primary} />}
            label={tr.studioBrightness}
            value={brightness}
            displayValue={brightness.toFixed(2)}
            min={0}
            max={2}
            step={0.05}
            onValueChange={setBrightness}
            accentColor={colors.primary}
          />

          <View style={styles.divider} />

          <SliderRow
            icon={<Contrast size={16} color={colors.accent} />}
            label={tr.studioContrast}
            value={contrast}
            displayValue={contrast.toFixed(2)}
            min={0}
            max={2}
            step={0.05}
            onValueChange={setContrast}
            accentColor={colors.accent}
          />

          <View style={styles.divider} />

          <SliderRow
            icon={<RotateCw size={16} color={colors.gold} />}
            label={tr.studioRotation}
            value={rotation}
            displayValue={`${Math.round(rotation)}°`}
            min={0}
            max={360}
            step={1}
            onValueChange={setRotation}
            accentColor={colors.gold}
          />
        </GradientCard>

        {/* Save Button */}
        <PrimaryButton
          label={saved ? tr.studioSaved : tr.studioSave}
          onPress={handleSave}
          variant={saved ? 'outline' : 'primary'}
          fullWidth
          style={styles.saveBtn}
        />

        {saved && (
          <View style={styles.savedBanner}>
            <Check size={16} color={colors.primary} />
            <Text style={styles.savedText}>{tr.studioSaved}</Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  resetBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  previewWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  previewFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(10, 10, 15, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsCard: {
    marginBottom: 20,
    padding: 20,
  },
  sliderRow: {
    paddingVertical: 4,
  },
  sliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sliderLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sliderTrackWrap: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  sliderFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 15,
  opacity: 0.5,
  maxWidth: '100%',
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    top: 7,
    borderWidth: 3,
    borderColor: colors.background,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  saveBtn: {
    marginBottom: 12,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryGlow,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  savedText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  bottomSpacer: {
    height: 20,
  },
});
