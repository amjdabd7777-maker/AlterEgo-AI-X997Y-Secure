import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface Props {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost';
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function PrimaryButton({ label, onPress, loading, disabled, variant = 'primary', style, fullWidth }: Props) {
  const isDisabled = disabled || loading;

  const bgColor = {
    primary: colors.primary,
    accent: colors.accent,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const textColor = {
    primary: colors.textInverse,
    accent: '#fff',
    outline: colors.primary,
    ghost: colors.textSecondary,
  }[variant];

  const borderColor = {
    primary: 'transparent',
    accent: 'transparent',
    outline: colors.primary,
    ghost: 'transparent',
  }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.btn,
        { backgroundColor: bgColor, borderColor, opacity: isDisabled ? 0.5 : 1 },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
