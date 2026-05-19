import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useLang } from '@/context/LanguageContext';
import { colors } from '@/constants/colors';

export function LanguageToggle() {
  const { toggleLang, tr, lang } = useLang();

  return (
    <TouchableOpacity onPress={toggleLang} style={styles.btn} activeOpacity={0.8}>
      <View style={styles.flagContainer}>
        <Text style={styles.flag}>{lang === 'en' ? '🌐' : '🌐'}</Text>
      </View>
      <Text style={styles.text}>{tr.language}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  flagContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flag: {
    fontSize: 14,
  },
  text: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
