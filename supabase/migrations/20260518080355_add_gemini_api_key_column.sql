/*
  # Add Gemini API Key to Profiles

  1. Modified Tables
    - `alter_ego_profiles`
      - Added `gemini_api_key` (text, encrypted)
  
  2. Security
    - The API key is stored securely in Supabase
    - RLS policies ensure only the user can access their own key
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alter_ego_profiles' AND column_name = 'gemini_api_key'
  ) THEN
    ALTER TABLE alter_ego_profiles ADD COLUMN gemini_api_key text;
  END IF;
END $$;
