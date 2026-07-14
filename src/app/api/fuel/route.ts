import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

// ── GET — fetch vehicles or fills ────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code       = searchParams.get('code');
  const resource   = searchParams.get('resource');
  const vehicleId  = searchParams.get('vehicleId');

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  try {
    const supabase = createServerSupabaseClient();

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

    return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── POST — create vehicle or fill ────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { resource, code } = body;

  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 });

  try {
    const supabase = createServerSupabaseClient();

    if (resource === 'vehicle') {
      const { make, model, year, fuelType, nickname } = body;
      const { data, error } = await supabase
        .from('fuel_vehicles')
        .insert({
          user_code: code,
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
