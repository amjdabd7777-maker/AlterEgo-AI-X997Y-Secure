/*
  # AlterEgo AI - User Profiles Schema

  1. New Tables
    - `alter_ego_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users, unique)
      - `personality_description` (text) - Free-form personality description
      - `selected_traits` (text[]) - Array of selected personality traits
      - `habits` (text) - Daily habits and lifestyle
      - `interests` (text[]) - Array of user interests
      - `voice_cloned` (boolean) - Whether voice clone is set up
      - `preferred_language` (text) - 'en' or 'ar'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `content_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content_type` (text) - 'tweet', 'reels', 'post'
      - `topic` (text)
      - `tone` (text)
      - `generated_content` (text)
      - `language` (text) - 'en' or 'ar'
      - `created_at` (timestamptz)

    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `received_message` (text)
      - `context_note` (text)
      - `reply_style` (text)
      - `suggested_reply` (text)
      - `language` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS alter_ego_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  personality_description text DEFAULT '',
  selected_traits text[] DEFAULT '{}',
  habits text DEFAULT '',
  interests text[] DEFAULT '{}',
  voice_cloned boolean DEFAULT false,
  preferred_language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE alter_ego_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON alter_ego_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON alter_ego_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON alter_ego_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON alter_ego_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Content history table
CREATE TABLE IF NOT EXISTS content_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type text NOT NULL DEFAULT 'post',
  topic text DEFAULT '',
  tone text DEFAULT '',
  generated_content text NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content history"
  ON content_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content history"
  ON content_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own content history"
  ON content_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  received_message text NOT NULL,
  context_note text DEFAULT '',
  reply_style text DEFAULT 'diplomatic',
  suggested_reply text NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat history"
  ON chat_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_content_history_user_id ON content_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
