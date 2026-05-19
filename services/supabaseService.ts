import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserSettings {
  id: string;
  gemini_api_key?: string;
  preferred_language?: string;
  updated_at?: string;
}

export const settingsService = {
  async saveGeminiKey(apiKey: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { error } = await supabase
        .from('alter_ego_profiles')
        .upsert({
          user_id: user.id,
          gemini_api_key: apiKey,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return !error;
    } catch {
      return false;
    }
  },

  async getGeminiKey(): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('alter_ego_profiles')
        .select('gemini_api_key')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      return data.gemini_api_key || null;
    } catch {
      return null;
    }
  },

  async savePreferredLanguage(language: 'en' | 'ar'): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return false;

      const { error } = await supabase
        .from('alter_ego_profiles')
        .upsert({
          user_id: user.id,
          preferred_language: language,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      return !error;
    } catch {
      return false;
    }
  },

  async getUserSettings(): Promise<UserSettings | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('alter_ego_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      return {
        id: user.id,
        gemini_api_key: data.gemini_api_key,
        preferred_language: data.preferred_language,
        updated_at: data.updated_at,
      };
    } catch {
      return null;
    }
  },
};
