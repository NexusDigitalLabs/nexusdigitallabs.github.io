import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

/**
 * POST /api/counters
 * Body: { path: string }
 * Increments the view count for the given page path.
 * Returns: { count: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { path?: unknown };
    const rawPath = body.path;

    if (typeof rawPath !== 'string' || !rawPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // Sanitise: allow only safe URL path characters, cap at 200 chars
    const safePath = ('/' + rawPath.replace(/[^a-z0-9/\-_.~]/gi, '')).slice(0, 200);

    const supabase = createServerSupabaseClient();

    // Read existing count
    const { data: existing, error: readError } = await supabase
      .from('page_views')
      .select('count')
      .eq('page_path', safePath)
      .maybeSingle();

    if (readError) throw readError;

    let newCount: number;

    if (existing) {
      const nextCount = (existing.count as number) + 1;
      const { data: updated, error: updateError } = await supabase
        .from('page_views')
        .update({ count: nextCount })
        .eq('page_path', safePath)
        .select('count')
        .single();

      if (updateError) throw updateError;
      newCount = (updated?.count as number) ?? nextCount;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('page_views')
        .insert({ page_path: safePath, count: 1 })
        .select('count')
        .single();

      if (insertError) throw insertError;
      newCount = (inserted?.count as number) ?? 1;
    }

    return NextResponse.json({ count: newCount });
  } catch (err) {
    console.error('[/api/counters POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/counters?path=/your/page
 * Returns the current view count for the given page path.
 * Returns: { count: number }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');

    if (!path) {
      return NextResponse.json({ error: 'Missing ?path= parameter' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase
      .from('page_views')
      .select('count')
      .eq('page_path', path)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ count: (data?.count as number) ?? 0 });
  } catch (err) {
    console.error('[/api/counters GET]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
