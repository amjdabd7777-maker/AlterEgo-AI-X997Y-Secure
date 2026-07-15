import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Check, User, Brain, Heart, Zap, Camera } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useLang } from '@/context/LanguageContext';
import { PERSONALITY_TRAITS, MOCK_TWEETS } from '@/constants/mockData';
import { LanguageToggle } from '@/components/LanguageToggle';
import { GradientCard } from '@/components/GradientCard';
import { TagChip } from '@/components/TagChip';
import { PrimaryButton } from '@/components/PrimaryButton';

type Step = 'personality' | 'interests';

const STEPS: Step[] = ['personality', 'interests'];

export default function ProfileScreen() {
  const { tr, lang, isRTL } = useLang();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [personality, setPersonality] = useState('');
  const [habits, setHabits] = useState('');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState('');
  const [saved, setSaved] = useState(false);

  const stepLabels = [tr.stepPersonality, tr.stepInterests];

  const rtlText = { textAlign: isRTL ? ('right' as const) : ('left' as const) };
  const rtlRow = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev =>
      prev.includes(trait) ? prev.filter(t => t !== trait) : [...prev, trait]
    );
  };

  const addInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests(prev => [...prev, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (item: string) => {
    setInterests(prev => prev.filter(i => i !== item));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, rtlRow]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, rtlText]}>{tr.appName}</Text>
          <Text style={[styles.headerSub, rtlText]}>{tr.onboardingSubtitle}</Text>
        </View>
        <LanguageToggle />
      </View>

      <View style={[styles.stepsRow, rtlRow]}>
        {stepLabels.map((label, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => setCurrentStep(idx)}
            style={styles.stepItem}
          >
            <View
              style={[
                styles.stepDot,
                idx === currentStep && styles.stepDotActive,
                idx < currentStep && styles.stepDotDone,
              ]}
            >
              {idx < currentStep ? (
                <Check size={14} color={colors.primary} />
              ) : (
                <Text style={[styles.stepNum, idx === currentStep && styles.stepNumActive]}>
                  {idx + 1}
                </Text>
              )}
            </View>
            <Text style={[styles.stepLabel, idx === currentStep && styles.stepLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={styles.stepConnectorWrap}>
          <View style={styles.stepConnector} />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Studio Entry */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(tabs)/index/studio')}
        >
          <GradientCard variant="gold" style={styles.studioCard}>
            <View style={[styles.studioRow, rtlRow]}>
              <View style={styles.studioIconWrap}>
                <Camera size={22} color={colors.gold} />
              </View>
              <View style={styles.studioTextWrap}>
                <Text style={[styles.studioTitle, rtlText]}>{tr.studioOpenBtn}</Text>
                <Text style={[styles.studioDesc, rtlText]}>{tr.studioOpenDesc}</Text>
              </View>
              <Text style={styles.studioArrow}>›</Text>
            </View>
          </GradientCard>
        </TouchableOpacity>

        {/* Step 0: Personality */}
        {currentStep === 0 && (
          <View>
            <GradientCard variant="primary" style={styles.sectionCard}>
              <View style={[styles.sectionHeader, rtlRow]}>
                <Brain size={20} color={colors.primary} />
                <Text
                  style={[
                    styles.sectionTitle,
                    rtlText,
                    { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
                  ]}
                >
                  {tr.personalityLabel}
                </Text>
              </View>
              <TextInput
                style={[styles.textarea, rtlText]}
                value={personality}
                onChangeText={setPersonality}
                placeholder={tr.personalityPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </GradientCard>

            <GradientCard style={styles.sectionCard}>
              <Text style={[styles.sectionTitle, rtlText]}>{tr.traitsLabel}</Text>
              <View style={[styles.tagsWrap, isRTL && styles.tagsWrapRTL]}>
                {PERSONALITY_TRAITS[lang].map(trait => (
                  <TagChip
                    key={trait}
                    label={trait}
                    selected={selectedTraits.includes(trait)}
                    onPress={() => toggleTrait(trait)}
                  />
                ))}
              </View>
            </GradientCard>

            <GradientCard style={styles.sectionCard}>
              <View style={[styles.sectionHeader, rtlRow]}>
                <Zap size={18} color={colors.gold} />
                <Text
                  style={[
                    styles.sectionTitle,
                    rtlText,
                    { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
                  ]}
                >
                  {tr.habitsLabel}
                </Text>
              </View>
              <TextInput
                style={[styles.textarea, rtlText]}
                value={habits}
                onChangeText={setHabits}
                placeholder={tr.habitsPlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </GradientCard>
          </View>
        )}

        {/* Step 1: Interests */}
        {currentStep === 1 && (
          <View>
            <GradientCard variant="accent" style={styles.sectionCard}>
              <View style={[styles.sectionHeader, rtlRow]}>
                <Heart size={20} color={colors.accent} />
                <Text
                  style={[
                    styles.sectionTitle,
                    rtlText,
                    { marginLeft: isRTL ? 0 : 8, marginRight: isRTL ? 8 : 0 },
                  ]}
                >
                  {tr.interestsLabel}
                </Text>
              </View>
              <View style={[styles.inputRow, rtlRow]}>
                <TextInput
                  style={[styles.inputField, rtlText]}
                  value={interestInput}
                  onChangeText={setInterestInput}
                  placeholder={tr.interestPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  onSubmitEditing={addInterest}
                  returnKeyType="done"
                />
                <TouchableOpacity onPress={addInterest} style={styles.addBtn}>
                  <Text style={styles.addBtnText}>{tr.addBtn}</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.tagsWrap, isRTL && styles.tagsWrapRTL]}>
                {interests.map(item => (
                  <TouchableOpacity
                    key={item}
                    onPress={() => removeInterest(item)}
                    style={styles.interestTag}
                  >
                    <Text style={styles.interestTagText}>{item}</Text>
                    <Text style={styles.removeX}>×</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {interests.length === 0 && (
                <Text style={[styles.emptyHint, rtlText]}>
                  {lang === 'ar'
                    ? 'أضف اهتماماتك مثل: التقنية، الكتب، السينما، ريادة الأعمال...'
                    : 'Add your interests like: Tech, Books, Cinema, Entrepreneurship...'}
                </Text>
              )}
            </GradientCard>

            <GradientCard style={styles.sectionCard}>
              <Text style={[styles.previewLabel, rtlText]}>
                {lang === 'ar' ? 'مثال على محتوى بأسلوبك' : 'Sample content in your voice'}
              </Text>
              <Text style={[styles.sampleTweet, rtlText]}>
                "{MOCK_TWEETS[lang][0]}"
              </Text>
            </GradientCard>
          </View>
        )}

        {/* Navigation */}
        <View style={[styles.navRow, rtlRow]}>
          {currentStep > 0 && (
            <PrimaryButton
              label={lang === 'ar' ? 'السابق' : 'Back'}
              onPress={() => setCurrentStep(p => p - 1)}
              variant="outline"
              style={styles.navBtn}
            />
          )}
          {currentStep < STEPS.length - 1 ? (
            <PrimaryButton
              label={tr.continueBtn}
              onPress={() => setCurrentStep(p => p + 1)}
              style={styles.navBtn}
            />
          ) : (
            <PrimaryButton
              label={saved ? tr.profileSaved : tr.saveBtn}
              onPress={handleSave}
              variant={saved ? 'outline' : 'primary'}
              style={styles.navBtn}
            />
          )}
        </View>

        {saved && (
          <View style={styles.savedBanner}>
            <Check size={16} color={colors.primary} />
            <Text style={styles.savedText}>{tr.profileSaved}</Text>
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
  headerLeft: {
    flex: 1,
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
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 4,
    position: 'relative',
  },
  stepConnectorWrap: {
    position: 'absolute',
    top: '50%',
    left: '20%',
    right: '20%',
    height: 1,
    zIndex: -1,
  },
  stepConnector: {
    height: 1,
    backgroundColor: colors.border,
    flex: 1,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  stepDotDone: {
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  stepNum: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
  },
  stepNumActive: {
    color: colors.primary,
  },
  stepLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  studioCard: {
    marginBottom: 16,
  },
  studioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studioIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.goldGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studioTextWrap: {
    flex: 1,
  },
  studioTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studioDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  studioArrow: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '300',
  },
  sectionCard: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
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
    minHeight: 90,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagsWrapRTL: {
    flexDirection: 'row-reverse',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  inputField: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentGlow,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    gap: 6,
  },
  interestTagText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '500',
  },
  removeX: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 18,
  },
  emptyHint: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 20,
  },
  previewLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  sampleTweet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  navBtn: {
    flex: 1,
  },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryGlow,
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
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
