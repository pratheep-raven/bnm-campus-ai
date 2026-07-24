import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Order of credential resolution:
// 1. Saved Credentials tab values in localStorage
// 2. VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) as fallback

export function getStoredUrl(): string {
  const local = localStorage.getItem('BNM_SUPABASE_URL')?.trim();
  if (local) return local;
  const env = (import.meta as any).env?.VITE_SUPABASE_URL?.trim();
  if (env) return env;
  return '';
}

export function getStoredKey(): string {
  const localKey = (
    localStorage.getItem('BNM_SUPABASE_PUBLISHABLE_KEY') ||
    localStorage.getItem('BNM_SUPABASE_ANON_KEY')
  )?.trim();
  if (localKey) return localKey;

  const envKey = (
    (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
    (import.meta as any).env?.VITE_SUPABASE_ANON_KEY
  )?.trim();
  if (envKey) return envKey;

  return '';
}

function isPlaceholderUrl(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  return (
    lower.includes('your-supabase-project-id') ||
    lower.includes('placeholder-url')
  );
}

function isPlaceholderKey(key: string): boolean {
  if (!key) return true;
  const lower = key.toLowerCase();
  return (
    lower.includes('your-supabase-publishable-key') ||
    lower.includes('your-supabase-anon-key') ||
    lower.includes('placeholder-key')
  );
}

// Requirement 7 & 8: Must begin with https://. Never add https:// automatically to random text.
export function isValidSupabaseUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' && parsed.hostname.length > 0;
  } catch {
    return false;
  }
}

export function isSupabaseConfigured(): boolean {
  const url = getStoredUrl();
  const key = getStoredKey();
  return (
    isValidSupabaseUrl(url) &&
    !isPlaceholderUrl(url) &&
    Boolean(key) &&
    !isPlaceholderKey(key)
  );
}

export function getSupabaseConfig() {
  return {
    url: getStoredUrl(),
    key: getStoredKey(),
  };
}

let cachedClient: SupabaseClient | null = null;
let cachedClientUrl = '';
let cachedClientKey = '';

export function getSupabaseClient(): SupabaseClient {
  const url = getStoredUrl();
  const key = getStoredKey();

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials are not configured.');
  }

  if (cachedClient && cachedClientUrl === url && cachedClientKey === key) {
    return cachedClient;
  }

  cachedClientUrl = url;
  cachedClientKey = key;
  cachedClient = createClient(url, key);
  return cachedClient;
}

export function setSupabaseConfig(url: string, key: string) {
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();

  if (!trimmedUrl || !trimmedKey) {
    throw new Error('Please provide both Supabase URL and Publishable Key.');
  }

  if (!trimmedUrl.startsWith('https://')) {
    throw new Error('Supabase Project URL must begin with https://');
  }

  try {
    new URL(trimmedUrl);
  } catch {
    throw new Error('Invalid Supabase Project URL format.');
  }

  localStorage.setItem('BNM_SUPABASE_URL', trimmedUrl);
  localStorage.setItem('BNM_SUPABASE_PUBLISHABLE_KEY', trimmedKey);

  // Reinitialize client
  cachedClient = null;
  cachedClientUrl = '';
  cachedClientKey = '';

  // Reload application automatically
  window.location.reload();
}

export function formatSupabaseError(err: any): string {
  if (!err) return 'An unknown error occurred.';
  const msg = typeof err === 'string' ? err : err?.message || String(err);

  if (msg.toLowerCase().includes('failed to fetch')) {
    const url = getStoredUrl();
    return `Failed to fetch: Unable to reach Supabase project${url ? ` at ${url}` : ''}. Please check your Project URL, network connection, or CORS settings.`;
  }

  return msg;
}

// Proxy export so existing imports of `supabase` use the dynamically initialized client
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const val = (client as any)[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  }
});
