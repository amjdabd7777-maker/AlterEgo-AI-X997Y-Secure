import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Clipboard,
  Platform,
  Alert,
} from 'react-native';
import { Twitter, Film, FileText, Copy, RefreshCw, Sparkles, ChevronDown, CircleAlert as AlertCircle } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLang } from '@/context/LanguageContext';
import { MOCK_TWEETS, MOCK_REELS, MOCK_POSTS } from '@/constants/mockData';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { TagChip } from '@/components/TagChip';
import { geminiService } from '@/services/geminiService';
import { settingsService } from '@/services/supabaseService';

type ContentType = 'tweet' | 'reels' | 'post';
type ToneType = 'authentic' | 'inspirational' | 'humorous' | 'professional';

const TONES_EN = ['Authentic', 'Inspirational', 'Humorous', 'Professional'];
const TONES_AR = ['أصيل', 'ملهم', 'فكاهي', 'احترافي'];

export default function ContentScreen() {
  const { tr, lang, isRTL } = useLang();
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState<ContentType>('tweet');
  const [toneIndex, setToneIndex] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [activeResult, setActiveResult] = useState(0);
  const [copied, setCopied] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);

  const rtlText = { textAlign: isRTL ? ('right' as const) : ('left' as const) };
  const rtlRow = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    const key = await settingsService.getGeminiKey();
    if (key) {
      geminiService.setApiKey(key);
      setApiConfigured(true);
    }
  };

  const getMockData = () => {
    switch (contentType) {
      case 'tweet': return MOCK_TWEETS[lang];
      case 'reels': return MOCK_REELS[lang];
      case 'post': return MOCK_POSTS[lang];
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setGenerating(true);
    setResults([]);

    try {
      if (apiConfigured && geminiService.isConfigured()) {
        // Use real Gemini API
        const tones = lang === 'ar' ? TONES_AR : TONES_EN;
        const tone = tones[toneIndex] || 'authentic';
        let result = '';

        if (contentType === 'tweet') {
          result = await geminiService.generateTweet(topic, 'Professional', tone, lang);
        } else if (contentType === 'reels') {
          result = await geminiService.generateReelsScript(topic, 'Professional', tone, lang);
        } else {
          result = await geminiService.generatePost(topic, 'Professional', tone, lang);
        }

        setResults([result]);
      } else {
        // Use mock data
        setTimeout(() => {
          const data = getMockData();
          setResults(data);
        }, 1800);
      }
      setActiveResult(0);
    } catch (error) {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar'
          ? 'حدث خطأ في توليد المحتوى'
          : 'Error generating content'
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    const text = results[activeResult];
    if (text) {
      if (Platform.OS === 'web') {
        navigator.clipboard?.writeText(text).catch(() => {});
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    setActiveResult(prev => (prev + 1) % results.length);
  };

  const contentTypes: { key: ContentType; label: string; icon: any; color: string }[] = [
    { key: 'tweet', label: tr.tweetLabel, icon: Twitter, color: colors.accent },
    { key: 'reels', label: tr.reelsLabel, icon: Film, color: colors.error },
    { key: 'post', label: tr.postLabel, icon: FileText, color: colors.primary },
  ];

  const tones = lang === 'ar' ? TONES_AR : TONES_EN;
  const charCount = results[activeResult]?.length ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, rtlRow]}>
        <View>
          <Text style={[styles.headerTitle, rtlText]}>{tr.contentTitle}</Text>
          <Text style={[styles.headerSub, rtlText]}>{tr.contentSubtitle}</Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content Type Selector */}
        <View style={[styles.typeRow, isRTL && styles.typeRowRTL]}>
          {contentTypes.map(({ key, label, icon: Icon, color }) => (
            <TouchableOpacity
              key={key}
              onPress={() => { setContentType(key); setResults([]); }}
              style={[
                styles.typeBtn,
                contentType === key && { borderColor: color, backgroundColor: `${color}18` },
              ]}
              activeOpacity={0.75}
            >
              <Icon size={16} color={contentType === key ? color : colors.textMuted} />
              <Text style={[styles.typeLabel, { color: contentType === key ? color : colors.textMuted }]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Topic Input */}
        <GradientCard variant="primary" style={styles.card}>
          <Text style={[styles.label, rtlText]}>{tr.topicLabel}</Text>
          <TextInput
            style={[styles.input, rtlText]}
            value={topic}
            onChangeText={setTopic}
            placeholder={tr.topicPlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </GradientCard>

        {/* Tone Selector */}
        <GradientCard style={styles.card}>
          <Text style={[styles.label, rtlText]}>{tr.toneLabel}</Text>
          <View style={[styles.toneWrap, isRTL && styles.toneWrapRTL]}>
            {tones.map((tone, idx) => (
              <TagChip
                key={tone}
                label={tone}
                selected={toneIndex === idx}
                onPress={() => setToneIndex(idx)}
                variant={['primary', 'accent', 'gold', 'primary'][idx] as any}
              />
            ))}
          </View>
        </GradientCard>

        {/* Generate Button */}
        <PrimaryButton
          label={generating ? tr.generatingBtn : tr.generateBtn}
          onPress={handleGenerate}
          loading={generating}
          fullWidth
          style={styles.generateBtn}
        />

        {/* Results */}
        {results.length > 0 && (
          <GradientCard variant="accent" style={styles.resultCard}>
            <View style={[styles.resultHeader, rtlRow]}>
              <View style={[styles.aiTag, rtlRow]}>
                <Sparkles size={13} color={colors.accent} />
                <Text style={styles.aiTagText}>AI</Text>
              </View>
              <Text style={[styles.resultCount, { marginLeft: isRTL ? 0 : 'auto', marginRight: isRTL ? 'auto' : 0 }]}>
                {activeResult + 1} / {results.length}
              </Text>
            </View>

            <Text style={[styles.resultText, rtlText]}>
              {results[activeResult]}
            </Text>

            {charCount > 0 && (
              <Text style={[styles.charCount, rtlText]}>
                {charCount} {tr.characterCount}
              </Text>
            )}

            <View style={[styles.resultActions, rtlRow]}>
              <TouchableOpacity onPress={handleCopy} style={[styles.actionBtn, { flex: 1 }]}>
                <Copy size={15} color={copied ? colors.primary : colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: copied ? colors.primary : colors.textSecondary }]}>
                  {copied ? tr.copied : tr.copyBtn}
                </Text>
              </TouchableOpacity>
              {results.length > 1 && (
                <TouchableOpacity onPress={handleRegenerate} style={[styles.actionBtn, { flex: 1 }]}>
                  <RefreshCw size={15} color={colors.accent} />
                  <Text style={[styles.actionBtnText, { color: colors.accent }]}>{tr.regenerateBtn}</Text>
                </TouchableOpacity>
              )}
            </View>
          </GradientCard>
        )}

        {/* Empty State */}
        {results.length === 0 && !generating && (
          <View style={styles.emptyState}>
            <Sparkles size={40} color={colors.border} />
            <Text style={[styles.emptyText, rtlText]}>
              {lang === 'ar'
                ? 'أدخل موضوعاً واضغط إنشاء لرؤية السحر'
                : 'Enter a topic and tap Generate to see the magic'}
            </Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
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
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  typeRowRTL: {
    flexDirection: 'row-reverse',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 80,
  },
  toneWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  toneWrapRTL: {
    flexDirection: 'row-reverse',
  },
  generateBtn: {
    marginBottom: 16,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentGlow,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiTagText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  resultCount: {
    fontSize: 12,
    color: colors.textMuted,
  },
  resultText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: 12,
  },
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
  },
  resultActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 20,
  },
});
