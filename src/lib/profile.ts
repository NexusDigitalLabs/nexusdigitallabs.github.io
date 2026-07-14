import type { SupabaseClient, User } from '@supabase/supabase-js';
import {
  DEFAULT_CURRENCY,
  normalizeCurrencyCode,
  type CurrencyCode,
} from '@/lib/currencies';

export type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  preferred_currency: CurrencyCode;
  created_at?: string;
  updated_at?: string;
};

const PROFILE_COLUMNS =
  'id, email, display_name, avatar_url, preferred_currency, created_at, updated_at';

function displayNameFromUser(user: User): string {
  const meta = user.user_metadata ?? {};
  return (
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    (user.email ? user.email.split('@')[0] : '') ||
    'User'
  );
}

function avatarFromUser(user: User): string | null {
  const meta = user.user_metadata ?? {};
  const fromMeta = (meta.avatar_url || meta.picture || null) as string | null;
  if (fromMeta) return fromMeta;
  for (const identity of user.identities ?? []) {
    const data = identity.identity_data ?? {};
    const url = (data.avatar_url || data.picture || null) as string | null;
    if (url) return url;
  }
  return null;
}

function asProfile(row: Record<string, unknown> | null): Profile | null {
  if (!row) return null;
  return {
    id: row.id as string,
    email: (row.email as string | null) ?? null,
    display_name: (row.display_name as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    preferred_currency: normalizeCurrencyCode(
      row.preferred_currency as string | null | undefined,
      DEFAULT_CURRENCY
    ),
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };
}

/**
 * Creates or refreshes the signed-in user's profile row.
 * Preserves existing display_name and preferred_currency.
 */
export async function ensureProfile(
  supabase: SupabaseClient,
  user: User
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data: existing, error: fetchError } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', user.id)
    .maybeSingle();

  if (fetchError) {
    return { profile: null, error: fetchError.message };
  }

  const providerAvatar = avatarFromUser(user);
  const now = new Date().toISOString();

  if (existing) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        email: user.email ?? null,
        avatar_url: providerAvatar ?? existing.avatar_url,
        updated_at: now,
      })
      .eq('id', user.id)
      .select(PROFILE_COLUMNS)
      .single();

    if (error) return { profile: null, error: error.message };
    return { profile: asProfile(data as Record<string, unknown>), error: null };
  }

  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email ?? null,
      display_name: displayNameFromUser(user),
      avatar_url: providerAvatar,
      preferred_currency: DEFAULT_CURRENCY,
      updated_at: now,
    })
    .select(PROFILE_COLUMNS)
    .single();

  if (error) {
    return { profile: null, error: error.message };
  }

  return { profile: asProfile(data as Record<string, unknown>), error: null };
}

export async function fetchOwnProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{ profile: Profile | null; error: string | null }> {
  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .eq('id', userId)
    .maybeSingle();

  if (error) return { profile: null, error: error.message };
  return { profile: asProfile(data as Record<string, unknown> | null), error: null };
}

export async function updateOwnDisplayName(
  supabase: SupabaseClient,
  userId: string,
  displayName: string
): Promise<{ profile: Profile | null; error: string | null }> {
  const trimmed = displayName.trim().slice(0, 80);
  if (!trimmed) return { profile: null, error: 'Display name cannot be empty.' };

  const { data, error } = await supabase
    .from('profiles')
    .update({ display_name: trimmed, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: asProfile(data as Record<string, unknown>), error: null };
}

export async function updateOwnPreferredCurrency(
  supabase: SupabaseClient,
  userId: string,
  currency: string
): Promise<{ profile: Profile | null; error: string | null }> {
  const code = normalizeCurrencyCode(currency);
  const { data, error } = await supabase
    .from('profiles')
    .update({ preferred_currency: code, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) return { profile: null, error: error.message };
  return { profile: asProfile(data as Record<string, unknown>), error: null };
}
