import { describe, it, expect } from 'vitest';
import { formatMonth, monthRange, parseMonth, shiftMonth } from '../expenses';

describe('expense months', () => {
  it('parses a month param or falls back to today', () => {
    expect(parseMonth('2026-03', '2026-10-08')).toBe('2026-03');
    expect(parseMonth('2026-13', '2026-10-08')).toBe('2026-10');
    expect(parseMonth('garbage', '2026-10-08')).toBe('2026-10');
    expect(parseMonth(undefined, '2026-10-08')).toBe('2026-10');
  });

  it('builds half-open ranges, including December', () => {
    expect(monthRange('2026-10')).toEqual({ start: '2026-10-01', end: '2026-11-01' });
    expect(monthRange('2026-12')).toEqual({ start: '2026-12-01', end: '2027-01-01' });
  });

  it('shifts across year boundaries', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-10', 0)).toBe('2026-10');
  });

  it('formats a month', () => {
    expect(formatMonth('2026-10')).toBe('October 2026');
  });
});
