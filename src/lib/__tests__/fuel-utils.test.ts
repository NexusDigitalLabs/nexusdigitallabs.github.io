import { describe, it, expect } from 'vitest';
import {
  genCode,
  normaliseCode,
  fmt,
  fmtCurrency,
  fmtDate,
  friendlyError,
  computeStats,
  summariseEfficiency,
  odometerBounds,
  todayISODate,
  sanitisePath,
  type FillUp,
} from '../fuel-utils';

// ── genCode ───────────────────────────────────────────────────────────────────
describe('genCode', () => {
  it('produces lowercase output', () => {
    const code = genCode('Alice');
    expect(code).toBe(code.toLowerCase());
  });

  it('includes the sanitised nickname followed by a dash and 8-char suffix', () => {
    const code = genCode('Tesla');
    expect(code).toMatch(/^tesla-[a-z0-9]{8}$/);
  });

  it('strips special characters from nickname', () => {
    const code = genCode('My Car!! 2024');
    expect(code).toMatch(/^mycar2024-[a-z0-9]{8}$/);
  });

  it('falls back to "mygarage" when nickname is empty after stripping', () => {
    const code = genCode('!!!');
    expect(code).toMatch(/^mygarage-[a-z0-9]{8}$/);
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
    expect(msg).toMatch(/data service|try again/i);
  });

  it('translates missing table errors', () => {
    const msg = friendlyError('relation "fuel_vehicles" does not exist');
    expect(msg).toMatch(/unavailable|try again/i);
  });

  it('translates JWT / auth errors', () => {
    const msg = friendlyError('jwt expired');
    expect(msg).toMatch(/sign in|Authentication failed/i);
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

// ── Full-to-full efficiency (partial fills) ───────────────────────────────────
describe('computeStats — partial fills roll into the next full fill', () => {
  it('measures a fill after a partial from the previous full fill, using all litres since', () => {
    const stats = computeStats([
      { ...BASE, id: 'a', fill_date: '2026-09-14', odometer: 10900, litres: 38.5 },
      { ...BASE, id: 'b', fill_date: '2026-09-28', odometer: 11450, litres: 36.2 },
      { ...BASE, id: 'c', fill_date: '2026-10-06', odometer: 11800, litres: 20, is_partial: true },
      { ...BASE, id: 'd', fill_date: '2026-10-12', odometer: 12000, litres: 35 },
    ]);
    expect(stats[2].kmpl).toBeNull();
    expect(stats[3].distance).toBe(550);
    expect(stats[3].consumedLitres).toBe(55);
    expect(stats[3].kmpl).toBeCloseTo(10, 5);
  });

  it('treats the first full fill as the baseline when the first fill is partial', () => {
    const stats = computeStats([
      fill('a', '2026-01-01', 1000, 10, true),
      fill('b', '2026-01-10', 1400, 30),
      fill('c', '2026-01-20', 1800, 32),
    ]);
    expect(stats[1].isFirst).toBe(true);
    expect(stats[1].kmpl).toBeNull();
    expect(stats[2].kmpl).toBeCloseTo(400 / 32, 5);
  });

  it('rolls several consecutive partial fills into the next full fill', () => {
    const stats = computeStats([
      fill('a', '2026-02-01', 5000, 40),
      fill('b', '2026-02-05', 5100, 10, true),
      fill('c', '2026-02-08', 5200, 12, true),
      fill('d', '2026-02-12', 5400, 20),
    ]);
    expect(stats[3].consumedLitres).toBe(42);
    expect(stats[3].kmpl).toBeCloseTo(400 / 42, 5);
  });
});

describe('summariseEfficiency', () => {
  it('uses total distance over total litres so km/L and L/100km agree', () => {
    const stats = computeStats([
      fill('a', '2026-09-14', 10900, 38.5),
      fill('b', '2026-09-28', 11450, 36.2),
      fill('c', '2026-10-06', 11800, 20, true),
      fill('d', '2026-10-12', 12000, 35),
    ]);
    const s = summariseEfficiency(stats)!;
    expect(s.distance).toBe(1100);
    expect(s.litres).toBeCloseTo(91.2, 5);
    expect(s.kmpl).toBeCloseTo(1100 / 91.2, 5);
    expect(s.l100km).toBeCloseTo(100 / s.kmpl, 5);
  });

  it('costs only the fuel burned over the measured distance', () => {
    const stats = computeStats([
      fill('a', '2026-01-01', 10000, 40), // baseline: its fuel was burned before the log started
      fill('b', '2026-01-15', 10500, 35), // $70 over 500 km
    ]);
    expect(summariseEfficiency(stats)!.costPerKm).toBeCloseTo(0.14, 5);
  });

  it('returns null when nothing can be measured', () => {
    expect(summariseEfficiency([])).toBeNull();
    expect(summariseEfficiency(computeStats([fill('a', '2026-01-01', 1000, 10)]))).toBeNull();
  });
});

// ── odometerBounds (back-filling) ─────────────────────────────────────────────
describe('odometerBounds', () => {
  const fills = [
    fill('a', '2026-06-01', 10000, 30),
    fill('b', '2026-07-01', 10500, 30),
    fill('c', '2026-08-01', 11000, 30),
  ];

  it('returns the neighbours on either side of a date', () => {
    expect(odometerBounds(fills, '2026-06-15')).toEqual({
      before: { odometer: 10000, date: '2026-06-01' },
      after: { odometer: 10500, date: '2026-07-01' },
    });
  });

  it('has no lower bound before the first fill and no upper bound after the last', () => {
    expect(odometerBounds(fills, '2026-05-01').before).toBeNull();
    expect(odometerBounds(fills, '2026-09-01').after).toBeNull();
  });

  it('returns no bounds for an empty log', () => {
    expect(odometerBounds([], '2026-09-01')).toEqual({ before: null, after: null });
  });
});

describe('todayISODate', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    expect(todayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
