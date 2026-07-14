// ── Types ──────────────────────────────────────────────────────────────────────
export interface FillUp {
  id: string;
  vehicle_id: string;
  fill_date: string;
  odometer: number;
  litres: number;
  price_per_litre: number;
  is_partial: boolean;
  notes: string | null;
}

export interface FillStats {
  fill: FillUp;
  distance: number | null;
  l100km: number | null;
  kmpl: number | null;
  totalCost: number;
  costPerKm: number | null;
  isFirst: boolean;
}

// ── Sync code helpers ──────────────────────────────────────────────────────────
export function genCode(nickname: string): string {
  const clean = nickname.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'mygarage';
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}-${suffix}`.toLowerCase();
}

export function normaliseCode(raw: string): string {
  return raw.trim().toLowerCase();
}

// ── Formatting helpers ─────────────────────────────────────────────────────────
export function fmt(n: number, dp = 2): string {
  return n.toFixed(dp);
}

export function fmtCurrency(sym: string, n: number): string {
  return `${sym}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(d: string): string {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Supabase / network error translation ───────────────────────────────────────
export function friendlyError(raw: string): string {
  const r = raw.toLowerCase();
  if (r.includes('invalid api key') || r.includes('invalid_key') || r.includes('apikey')) {
    return 'API key error — check that SUPABASE_SERVICE_ROLE_KEY is correctly set in your Vercel environment variables.';
  }
  if (r.includes('does not exist') || r.includes('42p01') || r.includes('relation')) {
    return 'Database tables not found. Run the SQL migration from docs/tools/fuel-tracker.md in your Supabase SQL editor first.';
  }
  if (r.includes('jwt') || r.includes('unauthorized') || r.includes('401')) {
    return 'Authentication failed — the Supabase service role key may be expired or incorrect.';
  }
  return raw;
}

// ── Core efficiency calculations ───────────────────────────────────────────────

/**
 * Compute derived statistics for a sorted list of fill-ups.
 * - First fill is always isFirst=true with no efficiency data (no previous odometer).
 * - Partial fills are flagged but not used for efficiency calculations.
 * - Negative or zero distance between fills is treated as invalid.
 */
export function computeStats(fills: FillUp[]): FillStats[] {
  const sorted = [...fills].sort(
    (a, b) =>
      new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime() ||
      a.odometer - b.odometer,
  );

  return sorted.map((fill, i) => {
    const totalCost = fill.litres * fill.price_per_litre;
    if (i === 0) {
      return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: true };
    }
    if (fill.is_partial) {
      return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: false };
    }
    const dist = fill.odometer - sorted[i - 1].odometer;
    if (dist <= 0) {
      return { fill, distance: null, l100km: null, kmpl: null, totalCost, costPerKm: null, isFirst: false };
    }
    return {
      fill,
      distance: dist,
      l100km: (fill.litres / dist) * 100,
      kmpl: dist / fill.litres,
      totalCost,
      costPerKm: totalCost / dist,
      isFirst: false,
    };
  });
}

// ── API path sanitisation (mirrors /api/counters route logic) ─────────────────
export function sanitisePath(raw: string): string {
  return ('/' + raw.replace(/[^a-z0-9/\-_.~]/gi, '')).slice(0, 200);
}
