import { cache } from 'react';
import { redirect } from 'next/navigation';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';
import { loginUrl } from '@/lib/auth-redirect';
import { getEntitlements, type Entitlements } from '@/lib/freelanceos/entitlements';

export type OrgRole = 'owner' | 'admin' | 'member';

export type Organization = {
  id: string;
  name: string;
  plan: string;
  base_currency: string;
};

/**
 * Server-only entry point for every FreelanceOS page, action and route.
 *
 * Resolves the signed-in user and their organization (creating a personal one
 * on first visit). The org id always comes from the database for the session
 * user — never from the request — and the returned client is the user-scoped
 * (RLS-enforced) Supabase client, so queries can't cross organizations.
 *
 * Cached per request, so the layout and page share one lookup.
 */
export const requireOrg = cache(async () => {
  const supabase = await createServerSupabaseAuthClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(loginUrl('/app/'));

  const { data: orgId, error: ensureError } = await supabase.rpc('ensure_personal_org');
  if (ensureError || typeof orgId !== 'string') {
    console.error('[freelanceos] ensure_personal_org failed', { userId: user.id, error: ensureError?.message });
    throw new Error('Could not load your workspace.');
  }

  const { data, error } = await supabase
    .from('organizations')
    .select('id, name, plan, base_currency, org_members!inner(role)')
    .eq('id', orgId)
    .eq('org_members.user_id', user.id)
    .single();
  if (error || !data) {
    console.error('[freelanceos] organization lookup failed', { userId: user.id, orgId, error: error?.message });
    throw new Error('Could not load your workspace.');
  }

  const { org_members: members, ...org } = data as Organization & { org_members: { role: OrgRole }[] };
  const role = members[0]?.role ?? 'member';
  const entitlements: Entitlements = getEntitlements(org.plan);

  return { supabase, user, org, role, entitlements };
});
