import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the service role key.
 * Only call this from server-side code (Route Handlers, Server Components, Server Actions).
 * Never expose this client or its key to the browser.
 */
export function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
