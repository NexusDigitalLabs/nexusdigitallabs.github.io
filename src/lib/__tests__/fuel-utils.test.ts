import { describe, it, expect } from 'vitest';
import {
  genCode,
  normaliseCode,
  fmt,
  fmtCurrency,
  fmtDate,
  friendlyError,
  computeStats,
  sanitisePath,
  type FillUp,
} from '../fuel-utils';

// ── genCode ───────────────────────────────────────────────────────────────────
describe('genCode', () => {
  it('produces lowercase output', () => {
    const code = genCode('Alice');
    expect(code).toBe(code.toLowerCase());
  });

  it('includes the sanitised nickname followed by a dash and 4-char suffix', () => {
    const code = genCode('Tesla');
    expect(code).toMatch(/^tesla-[a-z0-9]{4}$/);
  });

  it('strips special characters from nickname', () => {
    const code = genCode('My Car!! 2024');
    expect(code).toMatch(/^mycar2024-[a-z0-9]{4}$/);
  });

  it('falls back to "mygarage" when nickname is empty after stripping', () => {
    const code = genCode('!!!');
    expect(code).toMatch(/^mygarage-[a-z0-9]{4}$/);
  });

  it('truncates nickname at 20 characters', () => {
    const code = genCode('averylongnicknamethatshouldbetruncated');
    const [nick] = code.split('-');
    expect(nick.length).toBeLessThanOrEqual(20);
  });

  it('generates unique codes on repeated calls with same nickname', () => {
    const codes = new Set(Array.from({ length: 20 }, () => genCode('test')));
    expect(codes.size).toBeGreaterThan(1);
  });
});

// ── normaliseCode ─────────────────────────────────────────────────────────────
describe('normaliseCode', () => {
  it('trims leading and trailing whitespace', () => {
    expect(normaliseCode('  abc-1234  ')).toBe('abc-1234');
  });

  it('converts to lowercase', () => {
    expect(normaliseCode('MYGARAGE-AB3X')).toBe('mygarage-ab3x');
  });

  it('handles already-clean input unchanged', () => {
    expect(normaliseCode('tesla-ab3x')).toBe('tesla-ab3x');
  });
});

// ── fmt ───────────────────────────────────────────────────────────────────────
describe('fmt', () => {
  it('formats to 2 decimal places by default', () => {
    expect(fmt(6.5)).toBe('6.50');
    expect(fmt(6.123)).toBe('6.12');
  });

  it('respects custom decimal places', () => {
    expect(fmt(6.5, 1)).toBe('6.5');
    expect(fmt(6.5, 0)).toBe('7');
  });
});

// ── fmtCurrency ───────────────────────────────────────────────────────────────
describe('fmtCurrency', () => {
  it('prepends the symbol', () => {
    expect(fmtCurrency('$', 100)).toBe('$100.00');
  });

  it('formats large numbers with locale separators', () => {
    expect(fmtCurrency('Rs', 1500.5)).toBe('Rs1,500.50');
  });
});

// ── fmtDate ───────────────────────────────────────────────────────────────────
describe('fmtDate', () => {
  it('formats ISO date string to readable date', () => {
    expect(fmtDate('2026-01-15')).toMatch(/Jan/);
    expect(fmtDate('2026-01-15')).toMatch(/2026/);
    expect(fmtDate('2026-01-15')).toMatch(/15/);
  });
});

// ── friendlyError ─────────────────────────────────────────────────────────────
describe('friendlyError', () => {
  it('translates invalid API key errors', () => {
    const msg = friendlyError('invalid api key provided');
    expect(msg).toContain('SUPABASE_SERVICE_ROLE_KEY');
  });

  it('translates missing table errors', () => {
    const msg = friendlyError('relation "fuel_vehicles" does not exist');
    expect(msg).toContain('SQL migration');
  });

  it('translates JWT / auth errors', () => {
    const msg = friendlyError('jwt expired');
    expect(msg).toContain('service role key');
  });

  it('returns the original message for unknown errors', () => {
    const raw = 'some completely unknown error';
    expect(friendlyError(raw)).toBe(raw);
  });
});

// ── computeStats ──────────────────────────────────────────────────────────────
const BASE: Omit<FillUp, 'id' | 'fill_date' | 'odometer' | 'litres'> = {
  vehicle_id: 'v1',
  price_per_litre: 2.0,
  is_partial: false,
  notes: null,
};

function fill(id: string, date: string, odometer: number, litres: number, partial = false): FillUp {
  return { ...BASE, id, fill_date: date, odometer, litres, is_partial: partial };
}

describe('computeStats', () => {
  it('marks the first fill as isFirst with no efficiency data', () => {
    const stats = computeStats([fill('f1', '2026-01-01', 10000, 40)]);
    expect(stats[0].isFirst).toBe(true);
    expect(stats[0].l100km).toBeNull();
    expect(stats[0].kmpl).toBeNull();
    expect(stats[0].distance).toBeNull();
  });

  it('calculates totalCost correctly for first fill', () => {
    const stats = computeStats([fill('f1', '2026-01-01', 10000, 40)]);
    expect(stats[0].totalCost).toBe(80); // 40L × $2.00
  });

  it('calculates L/100km correctly', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 40),
      fill('f2', '2026-01-15', 10500, 35), // 500km, 35L → 7.0 L/100km
    ];
    const stats = computeStats(fills);
    expect(stats[1].l100km).toBeCloseTo(7.0, 5);
  });

  it('calculates km/L correctly', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 40),
      fill('f2', '2026-01-15', 10500, 35), // 500 / 35 ≈ 14.286 km/L
    ];
    const stats = computeStats(fills);
    expect(stats[1].kmpl).toBeCloseTo(500 / 35, 5);
  });

  it('calculates costPerKm correctly', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 40),
      fill('f2', '2026-01-15', 10500, 35), // cost = 35×2 = $70, dist = 500 → $0.14/km
    ];
    const stats = computeStats(fills);
    expect(stats[1].costPerKm).toBeCloseTo(0.14, 5);
  });

  it('returns null efficiency for a partial fill', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 20),
      fill('f2', '2026-01-10', 10300, 15, true), // partial
    ];
    const stats = computeStats(fills);
    expect(stats[1].l100km).toBeNull();
    expect(stats[1].isFirst).toBe(false);
  });

  it('returns null efficiency when distance is zero or negative', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 40),
      fill('f2', '2026-01-02', 10000, 5), // same odometer
    ];
    const stats = computeStats(fills);
    expect(stats[1].l100km).toBeNull();
  });

  it('sorts fills by date before computing', () => {
    const fills = [
      fill('f2', '2026-01-15', 10500, 35), // out of order
      fill('f1', '2026-01-01', 10000, 40),
    ];
    const stats = computeStats(fills);
    // After sort, f1 is first and should be isFirst
    const firstEntry = stats.find((s) => s.fill.id === 'f1');
    expect(firstEntry?.isFirst).toBe(true);
  });

  it('handles three fills computing two efficiency readings', () => {
    const fills = [
      fill('f1', '2026-01-01', 10000, 40),
      fill('f2', '2026-01-15', 10500, 35),  // 500km, 35L → 7.0 L/100km
      fill('f3', '2026-02-01', 10900, 28),  // 400km, 28L → 7.0 L/100km
    ];
    const stats = computeStats(fills);
    expect(stats[1].l100km).toBeCloseTo(7.0, 5);
    expect(stats[2].l100km).toBeCloseTo(7.0, 5);
  });
});

// ── sanitisePath ──────────────────────────────────────────────────────────────
describe('sanitisePath', () => {
  it('always prefixes with /', () => {
    expect(sanitisePath('about')).toMatch(/^\//);
  });

  it('strips disallowed characters', () => {
    const result = sanitisePath('hello <world>');
    expect(result).not.toContain('<');
    expect(result).not.toContain('>');
  });

  it('preserves allowed characters: letters, numbers, /, -, _, .', () => {
    const result = sanitisePath('tools/prompt-architect/v1.0');
    expect(result).toContain('tools');
    expect(result).toContain('prompt-architect');
    expect(result).toContain('v1.0');
  });

  it('caps at 200 characters', () => {
    const long = 'a'.repeat(300);
    expect(sanitisePath(long).length).toBeLessThanOrEqual(200);
  });
});
