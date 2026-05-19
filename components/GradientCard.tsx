import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface Props {
  children: ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'accent' | 'gold';
}

export function GradientCard({ children, style, variant = 'default' }: Props) {
  const borderColor = {
    default: colors.border,
    primary: colors.primary,
    accent: colors.accent,
    gold: colors.gold,
  }[variant];

  const glowColor = {
    default: 'transparent',
    primary: colors.primaryGlow,
    accent: colors.accentGlow,
    gold: colors.goldGlow,
  }[variant];

  return (
    <View style={[styles.card, { borderColor, backgroundColor: colors.card }, style]}>
      {variant !== 'default' && (
        <View style={[StyleSheet.absoluteFill, styles.glow, { backgroundColor: glowColor }]} />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  glow: {
    borderRadius: 16,
  },
});
