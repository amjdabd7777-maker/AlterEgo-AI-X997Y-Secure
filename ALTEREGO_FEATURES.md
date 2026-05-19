# AlterEgo AI - Features Overview

## Supported Languages
- English (LTR)
- Arabic (RTL)
- **Language toggle** available in every screen header

## Features

### 1. Profile & Onboarding (Profile Tab)
**Purpose**: Train your AI Twin with your personality

**3-Step Wizard**:
1. **Personality Step**
   - Personality description textarea
   - 12 selectable personality traits (varies by language)
   - Daily habits & lifestyle input
   - Sample tweet preview in your voice

2. **Interests Step**
   - Add/remove interests with dynamic tagging
   - Real-time preview of AI-generated content
   - Easy deletion of interest tags

3. **Voice Clone Step**
   - Visual microphone UI
   - Animated pulse rings during recording
   - Status feedback: Idle → Recording → Analyzing → Ready
   - Voice waveform visualization when ready

**Features**:
- Step-by-step progress indicator with checkmarks
- Navigable step switcher
- Profile saved confirmation banner
- All text supports Arabic RTL layout

---

### 2. AI Content Creator (Creator Tab)
**Purpose**: Generate social media content in your unique voice

**Inputs**:
- Topic/idea textarea
- 4 tone options: Authentic, Inspirational, Humorous, Professional
- Platform selector: Tweet / Reels Script / Post
- 3 different content types with mock data per language

**Features**:
- Real-time content generation (1.8s simulate)
- Copy to clipboard
- Cycle through multiple variants
- Character count display
- AI badge indicator
- Responsive platform buttons with color-coded icons
- Language-specific mock content (English & Arabic)

---

### 3. Smart Chat Assistant (Chat Tab)
**Purpose**: Get diplomatic, smart replies in your voice

**Inputs**:
- Received message textarea (required)
- Optional context note (e.g., "this is my boss")
- 4 reply style selector: Diplomatic, Assertive, Humorous, Formal
- Each style has color coding and description

**Features**:
- Generate multiple reply suggestions (2s simulate)
- Copy suggested reply to clipboard
- Cycle through different replies
- Recent conversation history (up to 3 last exchanges)
- Color-coded style badges
- AI Twin indicator with style info
- Use This Reply action (clears inputs, adds to history)

---

## Design System

### Colors
- **Primary**: #00C896 (Green) - Main CTA, success states
- **Accent**: #0099FF (Blue) - Chat-related, alternative actions
- **Gold**: #FFB830 - Voice features, highlights
- **Background**: #0A0A0F (Nearly black)
- **Surface**: #12121A (Dark cards)
- **Text Primary**: #F0F0FF (Off-white)
- **Text Secondary**: #9090B0 (Gray)

### Typography
- Headers: 26px/800 weight, -0.5 letter spacing
- Sections: 15px/700 weight
- Body: 14px/400 weight
- Labels: 13px/600 weight

### Components
- **GradientCard**: Bordered cards with optional glow effect (primary/accent/gold)
- **TagChip**: Interactive tag selectors
- **PrimaryButton**: CTA with multiple variants (primary/accent/outline/ghost)
- **LanguageToggle**: Quick language switcher in every header

---

## RTL Support
- Automatic layout flip when Arabic selected
- Text direction: right for Arabic, left for English
- Flexbox direction reversal for row layouts
- All icons maintain correct orientation
- Input fields support both directions

---

## Mock Data
All features work without API keys using mock data:
- **Tweets**: 4 English + 4 Arabic samples
- **Reels Scripts**: 2 English + 2 Arabic with full scene breakdowns
- **Posts**: 2 English + 2 Arabic with full captions
- **Chat Replies**: 4 styles × 2 per style × 2 languages

---

## Database Schema (Supabase)

### alter_ego_profiles
- User profile with personality, traits, interests
- Voice clone status, language preference
- RLS: Users can only access their own profile

### content_history
- Stores generated tweets, reels, posts
- Topic, tone, language logged
- RLS: Users can only access their own history

### chat_history
- Stores received messages and suggested replies
- Reply style and language tracked
- RLS: Users can only access their own history

---

## Browser Support
- Web (modern browsers)
- Responsive design (mobile-first)
- Touch-friendly tap targets (44px minimum)

## Gemini API Integration

### Fully Integrated
- Settings screen for Gemini API key management
- Secure key storage in Supabase (encrypted)
- Connection testing and validation
- Fallback to mock data when API not configured

### When API is Configured
- **Content Creator**: Generates tweets, reels scripts, posts using Gemini
- **Chat Assistant**: Generates smart replies in user's selected style
- All generated content respects user's language preference (English/Arabic)
- Content history is saved in Supabase

### Setup Flow
1. Get API key from Google AI Studio
2. Go to Settings tab
3. Paste API key
4. Click "Test Connection" to verify
5. Click "Save Key" to secure it in Supabase

## Ready for
- Production web deployment
- Real-time AI content generation with Gemini API
- Authentication setup (Supabase Auth ready)
- Progressive feature expansion
