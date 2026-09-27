import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';

type SupabaseAdmin = ReturnType<typeof createServerSupabaseClient>;

// Must match Odova's src/lib/config.ts REVENUECAT_ENTITLEMENT_ID.
const REVENUECAT_ENTITLEMENT_ID = 'odova_pro';
const FREE_TIER_VEHICLE_LIMIT = 1;

/**
 * Soft in-memory rate limit (per serverless instance), mirroring api/contact's
 * pattern. GET is limited too, not just mutations — it's the sync-code
 * enumeration/brute-force vector (see genCode() in lib/fuel-utils.ts).
 */
const RATE_WINDOW_MS = 60_000;
const READ_RATE_MAX = 30;
const WRITE_RATE_MAX = 20;
const hits = new Map<string, number[]>();

function clientKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * `bucket` keeps read/write budgets independent per IP — otherwise a burst of
 * reads (e.g. the app polling claim_status) could exhaust a legitimate user's
 * write budget (e.g. logging a fill-up) and vice versa, since they'd share one
 * counter under the same key.
 */
function rateLimited(key: string, bucket: 'read' | 'write', max: number): boolean {
  const bucketKey = `${bucket}:${key}`;
  const now = Date.now();
  const recent = (hits.get(bucketKey) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= max) {
    hits.set(bucketKey, recent);
    return true;
  }
  recent.push(now);
  hits.set(bucketKey, recent);
  return false;
}

function rateLimitResponse() {
  return jsonError('Too many requests. Please wait a minute and try again.', 429);
}

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function serverError(err: unknown, label: string) {
  console.error(`[${label}]`, err);
  return jsonError('Something went wrong. Please try again.', 500);
}

/**
 * Resolves the caller's Supabase user id from either an SSR cookie session
 * (the web app) or an `Authorization: Bearer <access_token>` header (a
 * non-browser client, e.g. the Odova mobile app, which has no cookie jar to
 * share with this domain). Cookie session takes precedence when both are
 * somehow present; Bearer is the fallback, not the default, so existing web
 * behaviour is unchanged.
 */
async function getSignedInUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice('Bearer '.length).trim();
      const supabase = createServerSupabaseClient();
      const {
        data: { user },
      } = await supabase.auth.getUser(token);
      return user?.id ?? null;
    } catch {
      return null;
    }
  }
  try {
    const auth = await createServerSupabaseAuthClient();
    const {
      data: { user },
    } = await auth.auth.getUser();
    return user?.id ?? null;
  } catch {
    return null;
  }
}

/** If this sync code was already claimed, return that user_id so new rows inherit it. */
async function ownerIdForCode(supabase: SupabaseAdmin, code: string): Promise<string | null> {
  const { data } = await supabase
    .from('fuel_vehicles')
    .select('user_id')
    .eq('user_code', code)
    .not('user_id', 'is', null)
    .limit(1)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

async function vehicleBelongsToCode(
  supabase: SupabaseAdmin,
  vehicleId: string,
  code: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('fuel_vehicles')
    .select('id')
    .eq('id', vehicleId)
    .eq('user_code', code)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

async function fillBelongsToCode(
  supabase: SupabaseAdmin,
  fillId: string,
  code: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('fuel_fills')
    .select('id')
    .eq('id', fillId)
    .eq('user_code', code)
    .maybeSingle();
  if (error) throw error;
  return Boolean(data?.id);
}

/**
 * Server-side check backing the free tier's vehicle-count cap. Deliberately
 * fails OPEN (does not block) whenever entitlement can't be positively
 * determined, on both paths below — this is a defense against the "anyone
 * with a sync code can curl unlimited vehicles for free" gap, not a system
 * that should ever lock out a real payer because of an infra/config gap it
 * can't see:
 *
 * - Claimed garage (ownerId set): looks up `pro_entitlements`, written by
 *   the RevenueCat webhook (see revenuecat-webhook/route.ts). No row at all
 *   is ambiguous (webhook may not be wired up in the RevenueCat dashboard
 *   yet, or this purchase predates it) — allow. A row with is_pro=false is
 *   a confident revoke signal — block.
 * - Unclaimed/anonymous garage: the client (Odova) sends its RevenueCat
 *   app_user_id (see api.ts createVehicle). Verified live against
 *   RevenueCat's REST API using REVENUECAT_SECRET_API_KEY (the dashboard's
 *   secret key, not the public SDK key already embedded in the app). If
 *   that env var isn't set yet, or no app_user_id was sent, this path
 *   can't verify anything — allow.
 */
async function hasProEntitlement(
  supabase: SupabaseAdmin,
  ownerId: string | null,
  revenueCatAppUserId: unknown
): Promise<boolean> {
  if (ownerId) {
    const { data, error } = await supabase
      .from('pro_entitlements')
      .select('is_pro')
      .eq('user_id', ownerId)
      .maybeSingle();
    if (error) throw error;
    if (data === null) return true; // No record yet — ambiguous, don't block.
    return Boolean(data.is_pro);
  }

  const rcId = typeof revenueCatAppUserId === 'string' ? revenueCatAppUserId.trim() : '';
  const secretKey = process.env.REVENUECAT_SECRET_API_KEY;
  if (!rcId || !secretKey) return true; // Can't verify — don't block.

  try {
    const res = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(rcId)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return true; // RevenueCat unreachable/erroring — don't block on our outage.
    const json = (await res.json()) as {
      subscriber?: { entitlements?: Record<string, { expires_date?: string | null }> };
    };
    const entitlement = json.subscriber?.entitlements?.[REVENUECAT_ENTITLEMENT_ID];
    if (!entitlement) return false; // Verified: this id has no active grant.
    // A non-renewing entitlement with no expiry never expires; one with an
    // expiry must still be in the future.
    return !entitlement.expires_date || new Date(entitlement.expires_date).getTime() > Date.now();
  } catch {
    return true; // Network error reaching RevenueCat — don't block on our outage.
  }
}

// ── GET — fetch vehicles, fills, claim status, or account garage ─────────────
export async function GET(req: NextRequest) {
  if (rateLimited(clientKey(req), 'read', READ_RATE_MAX)) return rateLimitResponse();

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const resource = searchParams.get('resource');
  const vehicleId = searchParams.get('vehicleId');

  try {
    const supabase = createServerSupabaseClient();

    // Restore garage for the signed-in account (no sync code required).
    if (resource === 'account') {
      const userId = await getSignedInUserId(req);
      if (!userId) return jsonError('Sign in required', 401);

      const { data, error } = await supabase
        .from('fuel_vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) return serverError(error, '/api/fuel GET account');

      const rows = data ?? [];
      if (rows.length === 0) {
        return NextResponse.json({ data: [], code: null });
      }

      const byCode = new Map<string, typeof rows>();
      for (const row of rows) {
        const c = row.user_code as string;
        const list = byCode.get(c) ?? [];
        list.push(row);
        byCode.set(c, list);
      }
      let bestCode = rows[0].user_code as string;
      let bestCount = 0;
      for (const [c, list] of byCode) {
        if (list.length > bestCount) {
          bestCode = c;
          bestCount = list.length;
        }
      }

      return NextResponse.json({
        data: byCode.get(bestCode) ?? [],
        code: bestCode,
      });
    }

    if (!code) return jsonError('Missing code', 400);

    // A claimed garage's data may only be read by its owner. This used to be a
    // client-side-only UI convention (see isGarageAuthLocked in
    // FuelTrackerClient.tsx) inferred from already-returned data — the API never
    // actually enforced it, so any client could read a "claimed" garage's data
    // by sync code alone. Enforce it here instead, and signal it explicitly via
    // `locked` so clients don't have to infer lock state from array contents.
    if (resource === 'vehicles' || resource === 'fills') {
      const ownerId = await ownerIdForCode(supabase, code);
      if (ownerId) {
        const signedInId = await getSignedInUserId(req);
        if (signedInId !== ownerId) {
          return NextResponse.json({ data: [], locked: true });
        }
      }
    }

    if (resource === 'vehicles') {
      const { data, error } = await supabase
        .from('fuel_vehicles')
        .select('*')
        .eq('user_code', code)
        .order('created_at', { ascending: true });

      if (error) return serverError(error, '/api/fuel GET vehicles');
      return NextResponse.json({ data });
    }

    if (resource === 'fills') {
      if (!vehicleId) return jsonError('Missing vehicleId', 400);
      const ok = await vehicleBelongsToCode(supabase, vehicleId, code);
      if (!ok) return jsonError('Vehicle not found for this sync code', 404);

      const { data, error } = await supabase
        .from('fuel_fills')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .eq('user_code', code)
        .order('fill_date', { ascending: true })
        .order('odometer', { ascending: true });

      if (error) return serverError(error, '/api/fuel GET fills');
      return NextResponse.json({ data });
    }

    if (resource === 'claim_status') {
      const { data, error } = await supabase
        .from('fuel_vehicles')
        .select('user_id')
        .eq('user_code', code)
        .not('user_id', 'is', null)
        .limit(1)
        .maybeSingle();

      if (error) return serverError(error, '/api/fuel GET claim_status');

      const ownerId = (data?.user_id as string | undefined) ?? null;
      const signedInId = await getSignedInUserId(req);

      // Do not expose owner UUID to clients — only claim relationship flags.
      return NextResponse.json({
        claimed: Boolean(ownerId),
        is_owner: Boolean(ownerId && signedInId && ownerId === signedInId),
        signed_in: Boolean(signedInId),
      });
    }

    return jsonError('Invalid resource', 400);
  } catch (e) {
    return serverError(e, '/api/fuel GET');
  }
}

// ── POST — create vehicle / fill, or claim garage ────────────────────────────
export async function POST(req: NextRequest) {
  if (rateLimited(clientKey(req), 'write', WRITE_RATE_MAX)) return rateLimitResponse();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const resource = body.resource as string | undefined;
  const code = typeof body.code === 'string' ? body.code : undefined;

  try {
    if (resource === 'claim') {
      if (!code) return jsonError('Missing code', 400);

      const userId = await getSignedInUserId(req);
      if (!userId) return jsonError('Sign in required to claim a garage', 401);

      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.rpc('claim_fuel_garage', {
        p_user_code: code.trim(),
        p_user_id: userId,
      });

      if (error) return serverError(error, '/api/fuel POST claim');

      const result = data as {
        ok?: boolean;
        error?: string;
        vehicles_updated?: number;
        pending?: boolean;
      } | null;

      if (!result?.ok) {
        if (result?.error === 'already_claimed') {
          return jsonError('This sync code is already linked to another account', 409);
        }
        return jsonError(result?.error ?? 'Claim failed', 400);
      }

      if (result.pending || result.vehicles_updated === 0) {
        return NextResponse.json(
          {
            error: 'Add at least one vehicle under this sync code before linking it to your account',
            pending: true,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        vehicles_updated: result.vehicles_updated ?? 0,
      });
    }

    if (resource === 'unlink') {
      if (!code) return jsonError('Missing code', 400);

      const userId = await getSignedInUserId(req);
      if (!userId) return jsonError('Sign in required to unlink a garage', 401);

      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.rpc('unlink_fuel_garage', {
        p_user_code: code.trim(),
        p_user_id: userId,
      });

      if (error) return serverError(error, '/api/fuel POST unlink');

      const result = data as {
        ok?: boolean;
        error?: string;
        vehicles_updated?: number;
        already_unlinked?: boolean;
      } | null;

      if (!result?.ok) {
        if (result?.error === 'not_owner') {
          return jsonError('Only the linked account can unlink this garage', 403);
        }
        return jsonError(result?.error ?? 'Unlink failed', 400);
      }

      return NextResponse.json({
        success: true,
        vehicles_updated: result.vehicles_updated ?? 0,
        already_unlinked: Boolean(result.already_unlinked),
      });
    }

    if (resource === 'delete_account') {
      const userId = await getSignedInUserId(req);
      if (!userId) return jsonError('Sign in required to delete your account', 401);

      const supabase = createServerSupabaseClient();
      // Cascades: profiles and pro_entitlements rows are deleted (on delete
      // cascade from auth.users). fuel_vehicles.user_id is `on delete set
      // null` (see 002_fuel_user_id.sql) — any claimed garages fall back to
      // anonymous sync-code-only access rather than being deleted, mirroring
      // what "unlink" already does deliberately; a user who also wants their
      // garage data gone still has the separate DELETE resource=user flow.
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) return serverError(error, '/api/fuel POST delete_account');

      return NextResponse.json({ success: true });
    }

    if (!code) return jsonError('Missing code', 400);

    const supabase = createServerSupabaseClient();

    if (resource === 'vehicle') {
      const make = typeof body.make === 'string' ? body.make.trim() : '';
      const model = typeof body.model === 'string' ? body.model.trim() : '';
      if (!make || !model) return jsonError('Make and model are required', 400);

      const yearRaw = body.year;
      const year =
        yearRaw === null || yearRaw === undefined || yearRaw === ''
          ? null
          : Number(yearRaw);
      if (year !== null && !Number.isFinite(year)) {
        return jsonError('Invalid year', 400);
      }

      const ownerId = await ownerIdForCode(supabase, code);

      const { count: existingCount, error: countError } = await supabase
        .from('fuel_vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('user_code', code);
      if (countError) return serverError(countError, '/api/fuel POST vehicle count');

      if ((existingCount ?? 0) >= FREE_TIER_VEHICLE_LIMIT) {
        const isPro = await hasProEntitlement(supabase, ownerId, body.revenueCatAppUserId);
        if (!isPro) {
          return jsonError('Upgrade to Pro to add more than one vehicle.', 403);
        }
      }

      const { data, error } = await supabase
        .from('fuel_vehicles')
        .insert({
          user_code: code,
          user_id: ownerId,
          make,
          model,
          year,
          fuel_type: (typeof body.fuelType === 'string' && body.fuelType) || 'petrol',
          nickname:
            typeof body.nickname === 'string' && body.nickname.trim()
              ? body.nickname.trim()
              : null,
        })
        .select()
        .single();

      if (error) return serverError(error, '/api/fuel POST vehicle');
      return NextResponse.json({ data });
    }

    if (resource === 'fill') {
      const vehicleId = typeof body.vehicleId === 'string' ? body.vehicleId : '';
      if (!vehicleId) return jsonError('Missing vehicleId', 400);

      const ok = await vehicleBelongsToCode(supabase, vehicleId, code);
      if (!ok) return jsonError('Vehicle not found for this sync code', 404);

      const odometer = Number(body.odometer);
      const litres = Number(body.litres);
      const pricePerLitre = Number(body.pricePerLitre);
      if (![odometer, litres, pricePerLitre].every(Number.isFinite)) {
        return jsonError('Odometer, litres, and price must be valid numbers', 400);
      }

      const { data, error } = await supabase
        .from('fuel_fills')
        .insert({
          vehicle_id: vehicleId,
          user_code: code,
          fill_date: body.fillDate,
          odometer,
          litres,
          price_per_litre: pricePerLitre,
          is_partial: Boolean(body.isPartial),
          notes:
            typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null,
        })
        .select()
        .single();

      if (error) return serverError(error, '/api/fuel POST fill');
      return NextResponse.json({ data });
    }

    return jsonError('Invalid resource', 400);
  } catch (e) {
    return serverError(e, '/api/fuel POST');
  }
}

// ── PATCH — update vehicle or fill fields ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  if (rateLimited(clientKey(req), 'write', WRITE_RATE_MAX)) return rateLimitResponse();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const resource = body.resource as string | undefined;
  const id = typeof body.id === 'string' ? body.id : undefined;
  const code = typeof body.code === 'string' ? body.code : undefined;
  if (!id || !code) return jsonError('Missing id or code', 400);

  try {
    const supabase = createServerSupabaseClient();

    if (resource === 'vehicle') {
      const ok = await vehicleBelongsToCode(supabase, id, code);
      if (!ok) return jsonError('Vehicle not found for this sync code', 404);

      const updates: Record<string, unknown> = {};

      if ('make' in body) {
        const make = typeof body.make === 'string' ? body.make.trim() : '';
        if (!make) return jsonError('Make cannot be empty', 400);
        updates.make = make;
      }
      if ('model' in body) {
        const model = typeof body.model === 'string' ? body.model.trim() : '';
        if (!model) return jsonError('Model cannot be empty', 400);
        updates.model = model;
      }
      if ('year' in body) {
        const yearRaw = body.year;
        const year =
          yearRaw === null || yearRaw === undefined || yearRaw === ''
            ? null
            : Number(yearRaw);
        if (year !== null && !Number.isFinite(year)) return jsonError('Invalid year', 400);
        updates.year = year;
      }
      if ('fuelType' in body) {
        updates.fuel_type = (typeof body.fuelType === 'string' && body.fuelType) || 'petrol';
      }
      if ('nickname' in body) {
        updates.nickname =
          typeof body.nickname === 'string' && body.nickname.trim() ? body.nickname.trim() : null;
      }

      if (Object.keys(updates).length === 0) return jsonError('No fields to update', 400);

      const { data, error } = await supabase
        .from('fuel_vehicles')
        .update(updates)
        .eq('id', id)
        .eq('user_code', code)
        .select()
        .single();

      if (error) return serverError(error, '/api/fuel PATCH vehicle');
      return NextResponse.json({ data });
    }

    if (resource === 'fill') {
      const ok = await fillBelongsToCode(supabase, id, code);
      if (!ok) return jsonError('Fill not found for this sync code', 404);

      const updates: Record<string, unknown> = {};

      if ('fillDate' in body) updates.fill_date = body.fillDate;
      if ('odometer' in body) {
        const odometer = Number(body.odometer);
        if (!Number.isFinite(odometer)) return jsonError('Odometer must be a valid number', 400);
        updates.odometer = odometer;
      }
      if ('litres' in body) {
        const litres = Number(body.litres);
        if (!Number.isFinite(litres)) return jsonError('Litres must be a valid number', 400);
        updates.litres = litres;
      }
      if ('pricePerLitre' in body) {
        const pricePerLitre = Number(body.pricePerLitre);
        if (!Number.isFinite(pricePerLitre)) return jsonError('Price must be a valid number', 400);
        updates.price_per_litre = pricePerLitre;
      }
      if ('isPartial' in body) updates.is_partial = Boolean(body.isPartial);
      if ('notes' in body) {
        updates.notes =
          typeof body.notes === 'string' && body.notes.trim() ? body.notes.trim() : null;
      }

      if (Object.keys(updates).length === 0) return jsonError('No fields to update', 400);

      const { data, error } = await supabase
        .from('fuel_fills')
        .update(updates)
        .eq('id', id)
        .eq('user_code', code)
        .select()
        .single();

      if (error) return serverError(error, '/api/fuel PATCH fill');
      return NextResponse.json({ data });
    }

    return jsonError('Invalid resource', 400);
  } catch (e) {
    return serverError(e, '/api/fuel PATCH');
  }
}

// ── DELETE — remove fill, vehicle, or all user data ──────────────────────────
export async function DELETE(req: NextRequest) {
  if (rateLimited(clientKey(req), 'write', WRITE_RATE_MAX)) return rateLimitResponse();

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const resource = body.resource as string | undefined;
  const id = typeof body.id === 'string' ? body.id : undefined;
  const code = typeof body.code === 'string' ? body.code : undefined;

  try {
    const supabase = createServerSupabaseClient();

    if (resource === 'fill') {
      if (!id || !code) return jsonError('Missing id or code', 400);
      const ok = await fillBelongsToCode(supabase, id, code);
      if (!ok) return jsonError('Fill not found for this sync code', 404);

      const { error } = await supabase
        .from('fuel_fills')
        .delete()
        .eq('id', id)
        .eq('user_code', code);
      if (error) return serverError(error, '/api/fuel DELETE fill');
      return NextResponse.json({ success: true });
    }

    if (resource === 'vehicle') {
      if (!id || !code) return jsonError('Missing id or code', 400);
      const ok = await vehicleBelongsToCode(supabase, id, code);
      if (!ok) return jsonError('Vehicle not found for this sync code', 404);

      const { error } = await supabase
        .from('fuel_vehicles')
        .delete()
        .eq('id', id)
        .eq('user_code', code);
      if (error) return serverError(error, '/api/fuel DELETE vehicle');
      return NextResponse.json({ success: true });
    }

    if (resource === 'user') {
      if (!code) return jsonError('Missing code', 400);
      // Cascades to fuel_fills via FK constraint
      const { error } = await supabase.from('fuel_vehicles').delete().eq('user_code', code);
      if (error) return serverError(error, '/api/fuel DELETE user');
      return NextResponse.json({ success: true });
    }

    return jsonError('Invalid resource', 400);
  } catch (e) {
    return serverError(e, '/api/fuel DELETE');
  }
}
