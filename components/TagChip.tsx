import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface Props {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: 'primary' | 'accent' | 'gold';
}

export function TagChip({ label, selected, onPress, variant = 'primary' }: Props) {
  const activeColor = { primary: colors.primary, accent: colors.accent, gold: colors.gold }[variant];
  const activeGlow = { primary: colors.primaryGlow, accent: colors.accentGlow, gold: colors.goldGlow }[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: activeGlow, borderColor: activeColor }
          : { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: selected ? activeColor : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 7,
    margin: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});
