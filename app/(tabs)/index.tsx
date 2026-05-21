import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { MessageSquare, Copy, RefreshCw, Bot, User, ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLang } from '@/context/LanguageContext';
import { MOCK_REPLIES } from '@/constants/mockData';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientCard } from '@/components/GradientCard';
import { PrimaryButton } from '@/components/PrimaryButton';
import { geminiService } from '@/services/geminiService';
import { settingsService } from '@/services/supabaseService';

type ReplyStyle = 'diplomatic' | 'assertive' | 'humorous' | 'formal';

const REPLY_STYLES_EN: { key: ReplyStyle; label: string; desc: string; color: string }[] = [
  { key: 'diplomatic', label: 'Diplomatic', desc: 'Calm & balanced', color: colors.primary },
  { key: 'assertive', label: 'Assertive', desc: 'Direct & firm', color: colors.accent },
  { key: 'humorous', label: 'Humorous', desc: 'Light & fun', color: colors.gold },
  { key: 'formal', label: 'Formal', desc: 'Professional', color: colors.textSecondary },
];

const REPLY_STYLES_AR: { key: ReplyStyle; label: string; desc: string; color: string }[] = [
  { key: 'diplomatic', label: 'دبلوماسي', desc: 'هادئ ومتوازن', color: colors.primary },
  { key: 'assertive', label: 'حازم', desc: 'مباشر وصريح', color: colors.accent },
  { key: 'humorous', label: 'فكاهي', desc: 'خفيف وممتع', color: colors.gold },
  { key: 'formal', label: 'رسمي', desc: 'احترافي', color: colors.textSecondary },
];

export default function ChatScreen() {
  const { tr, lang, isRTL } = useLang();
  const [receivedMsg, setReceivedMsg] = useState('');
  const [context, setContext] = useState('');
  const [replyStyle, setReplyStyle] = useState<ReplyStyle>('diplomatic');
  const [suggesting, setSuggesting] = useState(false);
  const [replies, setReplies] = useState<string[]>([]);
  const [activeReply, setActiveReply] = useState(0);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<{ msg: string; reply: string; style: ReplyStyle }[]>([]);
  const [apiConfigured, setApiConfigured] = useState(false);

  const rtlText = { textAlign: isRTL ? ('right' as const) : ('left' as const) };
  const rtlRow = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  const replyStyles = lang === 'ar' ? REPLY_STYLES_AR : REPLY_STYLES_EN;

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

  const handleSuggest = async () => {
    if (!receivedMsg.trim()) return;

    setSuggesting(true);
    setReplies([]);

    try {
      if (apiConfigured && geminiService.isConfigured()) {
        const reply = await geminiService.generateChatReply(
          receivedMsg,
          'Professional',
          replyStyle,
          context,
          lang
        );
        setReplies([reply]);
        setActiveReply(0);
      } else {
        setTimeout(() => {
          const mockReplies = MOCK_REPLIES[replyStyle][lang] as string[];
          setReplies(mockReplies);
          setActiveReply(0);
          setSuggesting(false);
        }, 2000);
        return;
      }
    } catch {
      Alert.alert(
        lang === 'ar' ? 'خطأ' : 'Error',
        lang === 'ar' ? 'حدث خطأ في توليد الرد' : 'Error generating reply'
      );
    } finally {
      setSuggesting(false);
    }
  };

  const handleUseReply = () => {
    if (replies[activeReply]) {
      setHistory(prev => [
        { msg: receivedMsg, reply: replies[activeReply], style: replyStyle },
        ...prev,
      ]);
      setReceivedMsg('');
      setContext('');
      setReplies([]);
    }
  };

  const handleCopy = () => {
    const text = replies[activeReply];
    if (text && Platform.OS === 'web') {
      navigator.clipboard?.writeText(text).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const styleInfo = replyStyles.find(s => s.key === replyStyle);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, rtlRow]}>
        <View>
          <Text style={[styles.headerTitle, rtlText]}>{tr.chatTitle}</Text>
          <Text style={[styles.headerSub, rtlText]}>{tr.chatSubtitle}</Text>
        </View>
        <LanguageToggle />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GradientCard variant="accent" style={styles.card}>
          <View style={[styles.cardHeader, rtlRow]}>
            <User size={16} color={colors.accent} />
            <Text style={[styles.cardLabel, rtlText]}>{tr.pasteLabel}</Text>
          </View>
          <TextInput
            style={[styles.textarea, rtlText]}
            value={receivedMsg}
            onChangeText={setReceivedMsg}
            placeholder={tr.pastePlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </GradientCard>

        <GradientCard style={styles.card}>
          <Text style={[styles.cardLabel, rtlText]}>{tr.contextLabel}</Text>
          <TextInput
            style={[styles.inputLine, rtlText]}
            value={context}
            onChangeText={setContext}
            placeholder={tr.contextPlaceholder}
            placeholderTextColor={colors.textMuted}
          />
        </GradientCard>

        <GradientCard style={styles.card}>
          <Text style={[styles.cardLabel, rtlText]}>{tr.replyStyleLabel}</Text>
          <View style={[styles.styleGrid, isRTL && styles.styleGridRTL]}>
            {replyStyles.map(style => (
              <TouchableOpacity
                key={style.key}
                onPress={() => setReplyStyle(style.key)}
                style={[
                  styles.styleCard,
                  replyStyle === style.key && {
                    borderColor: style.color,
                    backgroundColor: `${style.color}18`,
                  },
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles.styleLabel,
                    { color: replyStyle === style.key ? style.color : colors.textPrimary },
                  ]}
                >
                  {style.label}
                </Text>
                <Text style={styles.styleDesc}>{style.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GradientCard>

        <PrimaryButton
          label={suggesting ? tr.suggestingReplies : tr.suggestReplies}
          onPress={handleSuggest}
          loading={suggesting}
          disabled={!receivedMsg.trim()}
          fullWidth
          style={styles.suggestBtn}
        />

        {replies.length > 0 && (
          <GradientCard variant="primary" style={styles.replyCard}>
            <View style={[styles.replyHeaderRow, rtlRow]}>
              <View style={[styles.aiTag, rtlRow]}>
                <Bot size={13} color={colors.primary} />
                <Text style={styles.aiTagText}>
                  {lang === 'ar' ? 'توأمك الذكي' : 'AI Twin'}
                </Text>
              </View>
              {styleInfo && (
                <View
                  style={[
                    styles.styleBadge,
                    {
                      backgroundColor: `${styleInfo.color}22`,
                      borderColor: styleInfo.color,
                    },
                  ]}
                >
                  <Text style={[styles.styleBadgeText, { color: styleInfo.color }]}>
                    {styleInfo.label}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.replyText, rtlText]}>{replies[activeReply]}</Text>

            <View style={[styles.replyActions, rtlRow]}>
              <TouchableOpacity onPress={handleCopy} style={styles.replyActionBtn}>
                <Copy size={14} color={copied ? colors.primary : colors.textMuted} />
                <Text
                  style={[
                    styles.replyActionText,
                    { color: copied ? colors.primary : colors.textMuted },
                  ]}
                >
                  {copied ? tr.copied : tr.copyBtn}
                </Text>
              </TouchableOpacity>

              {replies.length > 1 && (
                <TouchableOpacity
                  onPress={() => setActiveReply(p => (p + 1) % replies.length)}
                  style={styles.replyActionBtn}
                >
                  <RefreshCw size={14} color={colors.accent} />
                  <Text style={[styles.replyActionText, { color: colors.accent }]}>
                    {tr.tryAnotherBtn}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleUseReply} style={styles.useBtn}>
                <Text style={styles.useBtnText}>{tr.useReplyBtn}</Text>
                <ChevronRight size={14} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
          </GradientCard>
        )}

        {replies.length === 0 && !suggesting && (
          <View style={styles.emptyState}>
            <MessageSquare size={42} color={colors.border} />
            <Text style={[styles.emptyText, rtlText]}>
              {lang === 'ar'
                ? 'الصق رسالة واختر أسلوب الرد للحصول على اقتراحات ذكية'
                : 'Paste a message and choose a reply style to get smart suggestions'}
            </Text>
          </View>
        )}

        {history.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.historyTitle, rtlText]}>
              {lang === 'ar' ? 'السجل الأخير' : 'Recent History'}
            </Text>
            {history.slice(0, 3).map((item, idx) => (
              <GradientCard key={idx} style={styles.historyCard}>
                <View style={[styles.historyMsgRow, rtlRow]}>
                  <User size={12} color={colors.textMuted} />
                  <Text style={[styles.historyMsg, rtlText]} numberOfLines={2}>
                    {item.msg}
                  </Text>
                </View>
                <View style={[styles.historyReplyRow, rtlRow]}>
                  <Bot size={12} color={colors.primary} />
                  <Text style={[styles.historyReply, rtlText]} numberOfLines={2}>
                    {item.reply}
                  </Text>
                </View>
              </GradientCard>
            ))}
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  textarea: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    padding: 12,
    fontSize: 14,
    lineHeight: 22,
    minHeight: 100,
  },
  inputLine: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginTop: 8,
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  styleGridRTL: {
    flexDirection: 'row-reverse',
  },
  styleCard: {
    width: '47%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  styleLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  styleDesc: {
    fontSize: 11,
    color: colors.textMuted,
  },
  suggestBtn: {
    marginBottom: 16,
  },
  replyCard: {
    marginBottom: 12,
  },
  replyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryGlow,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiTagText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  styleBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  styleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  replyText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 26,
    marginBottom: 14,
  },
  replyActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  replyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: colors.surfaceAlt,
  },
  replyActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  useBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginLeft: 'auto',
  },
  useBtnText: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    gap: 12,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  historySection: {
    marginTop: 8,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  historyCard: {
    marginBottom: 8,
    gap: 8,
  },
  historyMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  historyMsg: {
    flex: 1,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
  },
  historyReplyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  historyReply: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  bottomSpacer: {
    height: 20,
  },
});
