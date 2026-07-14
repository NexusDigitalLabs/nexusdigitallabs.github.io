import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createServerSupabaseAuthClient } from '@/lib/supabase/server';

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
async function ownerIdForCode(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  code: string
): Promise<string | null> {
  const { data } = await supabase
    .from('fuel_vehicles')
    .select('user_id')
    .eq('user_code', code)
    .not('user_id', 'is', null)
    .limit(1)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
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
      if (!userId) {
        return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
      }

      const { data, error } = await supabase
        .from('fuel_vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const rows = data ?? [];
      if (rows.length === 0) {
        return NextResponse.json({ data: [], code: null });
      }

      // Prefer the garage (user_code) that has the most vehicles; tie-break earliest.
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

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    if (resource === 'vehicles') {
      const { data, error } = await supabase
        .from('fuel_vehicles')
        .select('*')
        .eq('user_code', code)
        .order('created_at', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    if (resource === 'fills' && vehicleId) {
      const { data, error } = await supabase
        .from('fuel_fills')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('fill_date', { ascending: true })
        .order('odometer', { ascending: true });

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      const ownerId = (data?.user_id as string | undefined) ?? null;
      const signedInId = await getSignedInUserId();

      return NextResponse.json({
        claimed: Boolean(ownerId),
        owner_id: ownerId,
        is_owner: Boolean(ownerId && signedInId && ownerId === signedInId),
        signed_in: Boolean(signedInId),
      });
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST — create vehicle / fill, or claim garage ────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { resource, code } = body;

  try {
    if (resource === 'claim') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Missing code' }, { status: 400 });
      }

      const userId = await getSignedInUserId();
      if (!userId) {
        return NextResponse.json({ error: 'Sign in required to claim a garage' }, { status: 401 });
      }

      const supabase = createServerSupabaseClient();
      const { data, error } = await supabase.rpc('claim_fuel_garage', {
        p_user_code: code.trim(),
        p_user_id: userId,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const result = data as {
        ok?: boolean;
        error?: string;
        vehicles_updated?: number;
        pending?: boolean;
      } | null;

      if (!result?.ok) {
        if (result?.error === 'already_claimed') {
          return NextResponse.json(
            { error: 'This sync code is already linked to another account' },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { error: result?.error ?? 'Claim failed' },
          { status: 400 }
        );
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

    if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

    const supabase = createServerSupabaseClient();

    if (resource === 'vehicle') {
      const { make, model, year, fuelType, nickname } = body;
      const ownerId = await ownerIdForCode(supabase, code);
      const { data, error } = await supabase
        .from('fuel_vehicles')
        .insert({
          user_code: code,
          user_id: ownerId,
          make: make?.trim(),
          model: model?.trim(),
          year: year ? Number(year) : null,
          fuel_type: fuelType || 'petrol',
          nickname: nickname?.trim() || null,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    if (resource === 'fill') {
      const { vehicleId, fillDate, odometer, litres, pricePerLitre, isPartial, notes } = body;
      const { data, error } = await supabase
        .from('fuel_fills')
        .insert({
          vehicle_id: vehicleId,
          user_code: code,
          fill_date: fillDate,
          odometer: Number(odometer),
          litres: Number(litres),
          price_per_litre: Number(pricePerLitre),
          is_partial: isPartial || false,
          notes: notes?.trim() || null,
        })
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── DELETE — remove fill, vehicle, or all user data ──────────────────────────
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { resource, id, code } = body;

  try {
    const supabase = createServerSupabaseClient();

    if (resource === 'fill' && id) {
      const { error } = await supabase.from('fuel_fills').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (resource === 'vehicle' && id) {
      const { error } = await supabase.from('fuel_vehicles').delete().eq('id', id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    if (resource === 'user' && code) {
      // Cascades to fuel_fills via FK constraint
      const { error } = await supabase
        .from('fuel_vehicles')
        .delete()
        .eq('user_code', code);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
