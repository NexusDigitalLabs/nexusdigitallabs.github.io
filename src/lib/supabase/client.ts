import { createBrowserClient } from '@supabase/ssr';

function requirePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return { url, anonKey };
}

/**
 * Browser Supabase client (anon key). Safe for Client Components.
 * Session is stored in cookies via @supabase/ssr.
 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = requirePublicEnv();
  return createBrowserClient(url, anonKey);
}
