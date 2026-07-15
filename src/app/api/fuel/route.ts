import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';

type SupabaseAdmin = ReturnType<typeof createServerSupabaseClient>;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function serverError(err: unknown, label: string) {
  console.error(`[${label}]`, err);
  return jsonError('Something went wrong. Please try again.', 500);
}

async function getSignedInUserId(): Promise<string | null> {
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

// ── GET — fetch vehicles, fills, claim status, or account garage ─────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const resource = searchParams.get('resource');
  const vehicleId = searchParams.get('vehicleId');

  try {
    const supabase = createServerSupabaseClient();

    // Restore garage for the signed-in account (no sync code required).
    if (resource === 'account') {
      const userId = await getSignedInUserId();
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
      const signedInId = await getSignedInUserId();

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

      const userId = await getSignedInUserId();
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

      const userId = await getSignedInUserId();
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

// ── DELETE — remove fill, vehicle, or all user data ──────────────────────────
export async function DELETE(req: NextRequest) {
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
