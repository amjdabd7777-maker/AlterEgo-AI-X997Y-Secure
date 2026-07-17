import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

function createSupabaseClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: null, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }), single: async () => ({ data: null, error: null }) }),
        upsert: () => ({ eq: async () => ({ error: null }) }),
        delete: () => ({ eq: async () => ({ error: null }) }),
      }),
    } as unknown as SupabaseClient;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
}

export const supabase = createSupabaseClient();

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
