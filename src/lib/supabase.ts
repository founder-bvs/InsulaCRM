import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Environment variables or local overrides
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Retrieve runtime overrides from localStorage if configured via UI
export const getStoredSupabaseConfig = () => {
  const url = localStorage.getItem('vrtkl_supabase_url') || ENV_SUPABASE_URL;
  const anonKey = localStorage.getItem('vrtkl_supabase_anon_key') || ENV_SUPABASE_ANON_KEY;
  return { url, anonKey };
};

export const saveStoredSupabaseConfig = (url: string, anonKey: string) => {
  localStorage.setItem('vrtkl_supabase_url', url.trim());
  localStorage.setItem('vrtkl_supabase_anon_key', anonKey.trim());
  // Re-instantiate client
  initSupabaseClient();
};

export const clearStoredSupabaseConfig = () => {
  localStorage.removeItem('vrtkl_supabase_url');
  localStorage.removeItem('vrtkl_supabase_anon_key');
  initSupabaseClient();
};

let supabaseInstance: SupabaseClient | null = null;

export const initSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getStoredSupabaseConfig();

  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
      return null;
    }
  }

  supabaseInstance = null;
  return null;
};

// Initial run
initSupabaseClient();

export const getSupabase = (): SupabaseClient | null => {
  if (!supabaseInstance) {
    return initSupabaseClient();
  }
  return supabaseInstance;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getStoredSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 10);
};

// Test connection
export const testSupabaseConnection = async (testUrl?: string, testKey?: string): Promise<{ success: boolean; message: string }> => {
  const url = testUrl || getStoredSupabaseConfig().url;
  const anonKey = testKey || getStoredSupabaseConfig().anonKey;

  if (!url || !anonKey || !url.startsWith('http')) {
    return { success: false, message: 'URL або ключ Supabase не вказано чи має некоректний формат.' };
  }

  try {
    const client = createClient(url, anonKey);
    // Ping auth or public query
    const { error } = await client.from('buildings').select('count', { count: 'exact', head: true });
    
    // If error is 404 or relation does not exist yet, connection is still valid (database reachable)
    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // Permission or connection error
      return { success: false, message: error.message || 'Помилка доступу до Supabase.' };
    }

    return { success: true, message: 'Успішне підключення до бази даних Supabase!' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Не вдалося з’єднатися з сервером Supabase.' };
  }
};
