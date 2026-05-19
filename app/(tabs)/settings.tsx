import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Settings, Key, Link2, CircleAlert as AlertCircle, Check, Copy, Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLang } from '@/context/LanguageContext';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { geminiService } from '@/services/geminiService';
import { settingsService } from '@/services/supabaseService';

export default function SettingsScreen() {
  const { tr, lang, isRTL } = useLang();
  const [apiKey, setApiKey] = useState('');
  const [displayKey, setDisplayKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [saved, setSaved] = useState(false);

  const rtlText = { textAlign: isRTL ? ('right' as const) : ('left' as const) };
  const rtlRow = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      setLoading(true);
      const key = await settingsService.getGeminiKey();
      if (key) {
        setApiKey(key);
        setDisplayKey('•'.repeat(Math.min(20, key.length)));
        geminiService.setApiKey(key);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (text: string) => {
    setApiKey(text);
    setDisplayKey('•'.repeat(Math.min(20, text.length)));
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar'
          ? 'يرجى إدخال مفتاح API'
          : 'Please enter an API key'
      );
      return;
    }

    try {
      setSaving(true);
      const success = await settingsService.saveGeminiKey(apiKey);
      if (success) {
        geminiService.setApiKey(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        Alert.alert(
          lang === 'ar' ? 'خطأ' : 'Error',
          lang === 'ar'
            ? 'فشل حفظ مفتاح API'
            : 'Failed to save API key'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      setTestResult('error');
      setTimeout(() => setTestResult('idle'), 3000);
      return;
    }

    try {
      setTesting(true);
      geminiService.setApiKey(apiKey);
      const isConnected = await geminiService.testConnection();
      setTestResult(isConnected ? 'success' : 'error');
      setTimeout(() => setTestResult('idle'), 3000);
    } finally {
      setTesting(false);
    }
  };

  const handleCopyKey = () => {
    if (navigator.clipboard && apiKey) {
      navigator.clipboard.writeText(apiKey).catch(() => {});
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{tr.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, rtlRow]}>
        <View>
          <Text style={[styles.headerTitle, rtlText]}>
            {lang === 'ar' ? 'الإعدادات' : 'Settings'}
          </Text>
          <Text style={[styles.headerSub, rtlText]}>
            {lang === 'ar'
              ? 'تكوين الـ API والتفضيلات'
              : 'Configure API and preferences'}
          </Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Gemini API Section */}
        <GradientCard variant="primary" style={styles.section}>
          <View style={[styles.sectionHeader, rtlRow]}>
            <Key size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, rtlText, { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }]}>
              {lang === 'ar' ? 'مفتاح Gemini API' : 'Gemini API Key'}
            </Text>
          </View>

          <Text style={[styles.description, rtlText]}>
            {lang === 'ar'
              ? 'أدخل مفتاح Gemini API الخاص بك لتفعيل الميزات الذكية الكاملة'
              : 'Enter your Gemini API key to enable AI-powered features'}
          </Text>

          {/* How to Get Key Link */}
          <TouchableOpacity style={styles.infoBox} onPress={() => {
            if (typeof window !== 'undefined' && window.open) {
              window.open('https://makersuite.google.com/app/apikey', '_blank');
            }
          }}>
            <View style={[styles.infoRow, rtlRow]}>
              <Link2 size={14} color={colors.accent} />
              <Text style={[styles.infoText, rtlText]}>
                {lang === 'ar'
                  ? 'احصل على مفتاح API من Google AI Studio'
                  : 'Get API key from Google AI Studio'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* API Key Input */}
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, rtlRow]}>
              <TextInput
                style={[styles.keyInput, rtlText]}
                value={apiKey}
                onChangeText={handleApiKeyChange}
                placeholder={lang === 'ar' ? 'أدخل مفتاح API' : 'Paste your API key...'}
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showKey}
                editable={!saving}
              />
              <TouchableOpacity
                onPress={() => setShowKey(!showKey)}
                style={styles.toggleShowBtn}
              >
                {showKey ? (
                  <EyeOff size={18} color={colors.textMuted} />
                ) : (
                  <Eye size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>

            {apiKey && !showKey && (
              <Text style={[styles.maskedText, rtlText]}>
                {displayKey}
              </Text>
            )}
          </View>

          {/* Copy and Show Buttons */}
          <View style={[styles.buttonRow, rtlRow]}>
            <TouchableOpacity
              onPress={handleCopyKey}
              style={styles.secondaryBtn}
              disabled={!apiKey}
            >
              <Copy size={16} color={apiKey ? colors.accent : colors.textMuted} />
              <Text style={[styles.secondaryBtnText, { color: apiKey ? colors.accent : colors.textMuted }]}>
                {lang === 'ar' ? 'نسخ' : 'Copy'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleTestConnection}
              disabled={!apiKey || testing}
              style={[styles.testBtn, testing && styles.testBtnLoading]}
            >
              {testing ? (
                <ActivityIndicator size="small" color={colors.gold} />
              ) : (
                <>
                  {testResult === 'success' ? (
                    <Check size={16} color={colors.primary} />
                  ) : testResult === 'error' ? (
                    <AlertCircle size={16} color={colors.error} />
                  ) : (
                    <Link2 size={16} color={colors.gold} />
                  )}
                </>
              )}
              <Text
                style={[
                  styles.testBtnText,
                  testResult === 'success' && { color: colors.primary },
                  testResult === 'error' && { color: colors.error },
                ]}
              >
                {testResult === 'success'
                  ? lang === 'ar'
                    ? 'متصل!'
                    : 'Connected!'
                  : testResult === 'error'
                    ? lang === 'ar'
                      ? 'خطأ'
                      : 'Error'
                    : lang === 'ar'
                      ? 'اختبار الاتصال'
                      : 'Test'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <PrimaryButton
            label={saved ? (lang === 'ar' ? 'تم الحفظ!' : 'Saved!') : (lang === 'ar' ? 'حفظ المفتاح' : 'Save Key')}
            onPress={handleSaveApiKey}
            loading={saving}
            variant={saved ? 'outline' : 'primary'}
            fullWidth
            style={styles.saveBtn}
          />

          {/* API Key Status */}
          {apiKey && (
            <View style={[styles.statusBox, styles.statusBoxSuccess]}>
              <Check size={16} color={colors.primary} />
              <Text style={[styles.statusText, rtlText]}>
                {lang === 'ar'
                  ? 'مفتاح API مُدخل'
                  : 'API key configured'}
              </Text>
            </View>
          )}

          {!apiKey && (
            <View style={[styles.statusBox, styles.statusBoxWarning]}>
              <AlertCircle size={16} color={colors.warning} />
              <Text style={[styles.statusText, rtlText]}>
                {lang === 'ar'
                  ? 'الميزات الذكية معطلة - أضف مفتاح API'
                  : 'AI features disabled - add API key'}
              </Text>
            </View>
          )}
        </GradientCard>

        {/* Info Box */}
        <GradientCard style={styles.section}>
          <View style={[styles.infoSection, rtlRow]}>
            <AlertCircle size={20} color={colors.accent} />
            <View style={{ flex: 1, marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 }}>
              <Text style={[styles.infoTitle, rtlText]}>
                {lang === 'ar' ? 'معلومات الأمان' : 'Security Info'}
              </Text>
              <Text style={[styles.infoDetail, rtlText]}>
                {lang === 'ar'
                  ? 'مفتاحك محفوظ بآمان في Supabase. لا تشارك مفتاحك مع أحد.'
                  : 'Your key is securely stored in Supabase. Never share your API key.'}
              </Text>
            </View>
          </View>
        </GradientCard>

        {/* Features Info */}
        <GradientCard style={styles.section}>
          <Text style={[styles.featuresTitle, rtlText]}>
            {lang === 'ar' ? 'الميزات الممكنة' : 'Enabled Features'}
          </Text>
          <View style={styles.featuresList}>
            {[
              { icon: 'tweet', label: lang === 'ar' ? 'توليد التغريدات' : 'Tweet Generation' },
              { icon: 'reels', label: lang === 'ar' ? 'سيناريوهات الريلز' : 'Reels Scripts' },
              { icon: 'posts', label: lang === 'ar' ? 'البوستات' : 'Social Posts' },
              { icon: 'chat', label: lang === 'ar' ? 'ردود المحادثات' : 'Chat Replies' },
            ].map((feature, idx) => (
              <View key={idx} style={[styles.featureItem, rtlRow]}>
                <View style={styles.featureDot} />
                <Text style={[styles.featureLabel, rtlText]}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </GradientCard>

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 12,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  infoBox: {
    backgroundColor: colors.accentGlow,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 12,
  },
  keyInput: {
    flex: 1,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  toggleShowBtn: {
    padding: 6,
  },
  maskedText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    flex: 1,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  testBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: colors.goldGlow,
    borderWidth: 1,
    borderColor: colors.gold,
    flex: 1,
  },
  testBtnLoading: {
    opacity: 0.7,
  },
  testBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
  },
  saveBtn: {
    marginBottom: 12,
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  statusBoxSuccess: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  statusBoxWarning: {
    backgroundColor: colors.errorGlow,
    borderColor: colors.error,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  infoDetail: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  featureLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  bottomSpacer: {
    height: 20,
  },
});
