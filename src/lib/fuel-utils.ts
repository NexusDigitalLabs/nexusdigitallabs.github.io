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
  /** km driven since the previous full fill (the baseline this measurement runs from). */
  distance: number | null;
  l100km: number | null;
  kmpl: number | null;
  totalCost: number;
  /** Cost of the fuel burned over `distance` / `distance`. */
  costPerKm: number | null;
  /** Litres burned over `distance`: this fill plus any partial fills since the previous full fill. */
  consumedLitres: number | null;
  /** Cost of those litres. */
  consumedCost: number | null;
  /** True for the fill that has no baseline to measure from (the first one, or the first full fill). */
  isFirst: boolean;
}

export interface EfficiencySummary {
  distance: number;
  litres: number;
  cost: number;
  kmpl: number;
  l100km: number;
  costPerKm: number;
}

export interface OdometerNeighbour {
  odometer: number;
  date: string;
}

// ── Sync code helpers ──────────────────────────────────────────────────────────
/**
 * 8-char suffix from the Web Crypto RNG (~36^8 ≈ 2.8e12 combinations) — the sync
 * code is a bearer secret (see docs/tools/fuel-tracker.md), so it must not be
 * guessable. `crypto.getRandomValues` is available globally in both the browser
 * and the Next.js Node runtime; do not swap this for `Math.random()`.
 */
export function genCode(nickname: string): string {
  const clean = nickname.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'mygarage';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  const suffix = Array.from(bytes, (b) => (b % 36).toString(36)).join('');
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
    return 'Could not reach the data service. Please try again in a moment.';
  }
  if (r.includes('does not exist') || r.includes('42p01') || r.includes('relation')) {
    return 'Data service is temporarily unavailable. Please try again later.';
  }
  if (r.includes('jwt') || r.includes('unauthorized') || r.includes('401')) {
    return 'Authentication failed. Please sign in again and retry.';
  }
  return raw;
}

// ── Core efficiency calculations ───────────────────────────────────────────────

/**
 * Compute derived statistics for a list of fill-ups (sorted by date, then odometer).
 *
 * Efficiency is measured full-to-full: the baseline is the most recent *full*
 * fill, and the litres burned since then are this fill plus every partial fill
 * in between (a partial fill's litres were burned too, we just don't know the
 * tank level at that point).
 * - The first fill, or the first full fill if the first is partial, is the
 *   baseline and has no efficiency data.
 * - Partial fills carry no efficiency of their own; their litres roll into the
 *   next full fill.
 * - Non-positive distance between baseline and fill is treated as invalid, and
 *   the baseline moves on to that fill.
 */
export function computeStats(fills: FillUp[]): FillStats[] {
  const sorted = [...fills].sort(
    (a, b) =>
      new Date(a.fill_date).getTime() - new Date(b.fill_date).getTime() ||
      a.odometer - b.odometer,
  );

  let baselineOdometer: number | null = null;
  let pendingLitres = 0;
  let pendingCost = 0;

  return sorted.map((fill, i) => {
    const totalCost = fill.litres * fill.price_per_litre;
    const none: FillStats = {
      fill, distance: null, l100km: null, kmpl: null, totalCost,
      costPerKm: null, consumedLitres: null, consumedCost: null, isFirst: i === 0,
    };

    if (fill.is_partial) {
      if (baselineOdometer !== null) {
        pendingLitres += fill.litres;
        pendingCost += totalCost;
      }
      return none;
    }

    if (baselineOdometer === null) {
      baselineOdometer = fill.odometer;
      pendingLitres = 0;
      pendingCost = 0;
      return { ...none, isFirst: true };
    }

    const dist = fill.odometer - baselineOdometer;
    const litres = pendingLitres + fill.litres;
    const cost = pendingCost + totalCost;
    baselineOdometer = fill.odometer;
    pendingLitres = 0;
    pendingCost = 0;

    if (dist <= 0 || litres <= 0) return none;

    return {
      fill,
      distance: dist,
      l100km: (litres / dist) * 100,
      kmpl: dist / litres,
      totalCost,
      costPerKm: cost / dist,
      consumedLitres: litres,
      consumedCost: cost,
      isFirst: false,
    };
  });
}

/**
 * Overall efficiency across every measured interval: total distance over total
 * litres. Averaging per-fill ratios would weight a 200 km interval the same as a
 * 900 km one and make km/L and L/100km disagree with each other.
 */
export function summariseEfficiency(stats: FillStats[]): EfficiencySummary | null {
  let distance = 0;
  let litres = 0;
  let cost = 0;
  for (const s of stats) {
    if (s.distance === null || s.consumedLitres === null || s.consumedCost === null) continue;
    distance += s.distance;
    litres += s.consumedLitres;
    cost += s.consumedCost;
  }
  if (distance <= 0 || litres <= 0) return null;
  return {
    distance, litres, cost,
    kmpl: distance / litres,
    l100km: (litres / distance) * 100,
    costPerKm: cost / distance,
  };
}

/**
 * The fill-ups on either side of `date` (YYYY-MM-DD), by date. A new reading
 * must sit strictly between them, which lets users back-fill old fill-ups while
 * still catching typos.
 */
export function odometerBounds(
  fills: FillUp[],
  date: string,
): { before: OdometerNeighbour | null; after: OdometerNeighbour | null } {
  let before: OdometerNeighbour | null = null;
  let after: OdometerNeighbour | null = null;
  for (const f of fills) {
    const d = f.fill_date.slice(0, 10);
    if (d < date) {
      if (!before || d > before.date || (d === before.date && f.odometer > before.odometer)) {
        before = { odometer: f.odometer, date: d };
      }
    } else if (d > date) {
      if (!after || d < after.date || (d === after.date && f.odometer < after.odometer)) {
        after = { odometer: f.odometer, date: d };
      }
    }
  }
  return { before, after };
}

/** Today's date as YYYY-MM-DD in the user's local time zone (not UTC). */
export function todayISODate(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ── API path sanitisation (mirrors /api/counters route logic) ─────────────────
export function sanitisePath(raw: string): string {
  return ('/' + raw.replace(/[^a-z0-9/\-_.~]/gi, '')).slice(0, 200);
}
