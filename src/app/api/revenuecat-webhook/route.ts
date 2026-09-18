import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// Records RevenueCat purchase events as `pro_entitlements` rows (service
// role — see supabase/migrations/010_pro_entitlements.sql for why this is a
// separate table rather than columns on `profiles`). This is NOT yet read by
// anything — Odova's client-side Pro gate is the enforcement today. This
// endpoint is the prerequisite for ever enforcing it server-side instead of
// trusting the client, which the original security audit flagged as a real
// current gap.
//
// Configure in the RevenueCat dashboard: Project → Integrations → Webhooks →
// add this route's URL, and set "Authorization header value" to the same
// secret as REVENUECAT_WEBHOOK_SECRET below (RevenueCat sends it back as
// `Authorization: Bearer <secret>` on every call — this is the only
// authentication on this endpoint, so it must be set before going live).
//
// RevenueCat's documented event.type values relevant to Odova's one-time,
// non-renewing "pro" product: NON_RENEWING_PURCHASE, INITIAL_PURCHASE, and
// PRODUCT_CHANGE grant; CANCELLATION (i.e. a refund, for a non-renewing
// product) revokes. TRANSFER moves the entitlement to a different
// app_user_id — handled by revoking the old owner and granting the new one.
// Subscription-only events (RENEWAL, EXPIRATION, BILLING_ISSUE,
// UNCANCELLATION) are accepted but no-op — kept for forward compatibility if
// Odova ever adds a subscription tier, not because they apply today.

const GRANT_EVENTS = new Set(['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'RENEWAL']);
const REVOKE_EVENTS = new Set(['CANCELLATION', 'EXPIRATION']);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
  product_id?: string;
  transferred_from?: string[];
  transferred_to?: string[];
}

function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function upsertEntitlement(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  isPro: boolean,
  revenuecatAppUserId: string,
  productId: string | null
) {
  const { error } = await supabase
    .from('pro_entitlements')
    .upsert(
      {
        user_id: userId,
        is_pro: isPro,
        revenuecat_app_user_id: revenuecatAppUserId,
        product_id: productId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );
  if (error) throw error;
}

export async function POST(req: NextRequest) {
  const secret = process.env.REVENUECAT_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[revenuecat-webhook] REVENUECAT_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { event?: RevenueCatEvent };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const event = body.event;
  if (!event?.type || !event.app_user_id) {
    return NextResponse.json({ error: 'Missing event.type or event.app_user_id' }, { status: 400 });
  }

  // app_user_id is set to the Supabase user id via Purchases.logIn() on the
  // client (see Odova's src/lib/entitlements.ts) — anonymous RevenueCat IDs
  // (not yet linked to an account) aren't valid Supabase user ids and can't
  // be recorded here; that's fine, the client-side entitlement still works
  // for them, this table only tracks account-linked purchases.
  if (!isValidUuid(event.app_user_id)) {
    return NextResponse.json({ ok: true, skipped: 'non-account app_user_id' });
  }

  try {
    const supabase = createServerSupabaseClient();

    if (GRANT_EVENTS.has(event.type)) {
      await upsertEntitlement(supabase, event.app_user_id, true, event.app_user_id, event.product_id ?? null);
    } else if (REVOKE_EVENTS.has(event.type)) {
      await upsertEntitlement(supabase, event.app_user_id, false, event.app_user_id, event.product_id ?? null);
    } else if (event.type === 'TRANSFER') {
      for (const fromId of event.transferred_from ?? []) {
        if (isValidUuid(fromId)) await upsertEntitlement(supabase, fromId, false, fromId, null);
      }
      for (const toId of event.transferred_to ?? []) {
        if (isValidUuid(toId)) await upsertEntitlement(supabase, toId, true, toId, event.product_id ?? null);
      }
    }
    // Any other event.type: accepted, intentionally not handled (see header comment).

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[revenuecat-webhook]', err);
    return NextResponse.json({ error: 'Failed to record entitlement' }, { status: 500 });
  }
}
