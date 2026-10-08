import { describe, it, expect } from 'vitest';
import {
  addDaysISO,
  balanceDue,
  computeTotals,
  formatHundredths,
  invoiceDisplayStatus,
  lineAmountMinor,
  parseHundredths,
  sumByCurrency,
} from '../invoice-math';

describe('parseHundredths / formatHundredths', () => {
  it.each([
    ['1', 100],
    ['1.5', 150],
    ['0.25', 25],
    ['8.25', 825],
    ['1,000', 100000],
  ])('%s → %d', (input, expected) => {
    expect(parseHundredths(input)).toBe(expected);
  });

  it.each(['', 'abc', '-1', '1.234', '1e3'])('rejects %p', (input) => {
    expect(parseHundredths(input)).toBeNull();
  });

  it('formats without trailing zeros', () => {
    expect(formatHundredths(150)).toBe('1.5');
    expect(formatHundredths(200)).toBe('2');
    expect(formatHundredths(825)).toBe('8.25');
    expect(formatHundredths(5)).toBe('0.05');
  });
});

describe('computeTotals — matches the SQL in migration 014', () => {
  it('reproduces the DB test case exactly', () => {
    // 1.5 × $33.33 (= 4999.5 → 5000) + 2 × $10, 10% discount, 8.25% tax
    const totals = computeTotals(
      [
        { quantityHundredths: 150, unitPriceMinor: 3333 },
        { quantityHundredths: 200, unitPriceMinor: 1000 },
      ],
      1000,
      825
    );
    expect(totals).toEqual({ subtotal: 7000, discount: 700, tax: 520, total: 6820 });
  });

  it('rounds half-up on exact ties', () => {
    expect(lineAmountMinor(150, 333)).toBe(500); // 499.5
    expect(lineAmountMinor(50, 1)).toBe(1); // 0.5
  });

  it('avoids float drift on awkward values', () => {
    // 0.1 + 0.2-style traps: 3 × 0.29 hours at $1.15
    expect(lineAmountMinor(29, 115)).toBe(33); // 33.35 → 33
    expect(computeTotals([{ quantityHundredths: 100, unitPriceMinor: 10 }], 0, 1500)).toEqual({
      subtotal: 10,
      discount: 0,
      tax: 2, // 1.5 → 2
      total: 12,
    });
  });

  it('handles an empty invoice', () => {
    expect(computeTotals([], 1000, 1000)).toEqual({ subtotal: 0, discount: 0, tax: 0, total: 0 });
  });
});

describe('invoiceDisplayStatus', () => {
  const base = { status: 'sent' as const, total_minor: 10000, amount_paid_minor: 0, due_date: '2026-10-31' };
  const today = '2026-10-08';

  it('derives paid, partial, overdue and sent', () => {
    expect(invoiceDisplayStatus(base, today)).toBe('sent');
    expect(invoiceDisplayStatus({ ...base, amount_paid_minor: 4000 }, today)).toBe('partial');
    expect(invoiceDisplayStatus({ ...base, amount_paid_minor: 10000 }, today)).toBe('paid');
    expect(invoiceDisplayStatus({ ...base, due_date: '2026-10-07' }, today)).toBe('overdue');
    expect(invoiceDisplayStatus({ ...base, due_date: '2026-10-07', amount_paid_minor: 10000 }, today)).toBe('paid');
  });

  it('due today is not overdue', () => {
    expect(invoiceDisplayStatus({ ...base, due_date: today }, today)).toBe('sent');
  });

  it('passes drafts and void through', () => {
    expect(invoiceDisplayStatus({ ...base, status: 'draft' }, today)).toBe('draft');
    expect(invoiceDisplayStatus({ ...base, status: 'void' }, today)).toBe('void');
  });
});

describe('helpers', () => {
  it('addDaysISO crosses month and year boundaries', () => {
    expect(addDaysISO('2026-10-08', 30)).toBe('2026-11-07');
    expect(addDaysISO('2026-12-20', 14)).toBe('2027-01-03');
  });

  it('balanceDue never goes negative', () => {
    expect(balanceDue({ total_minor: 100, amount_paid_minor: 40 })).toBe(60);
    expect(balanceDue({ total_minor: 100, amount_paid_minor: 150 })).toBe(0);
  });

  it('sumByCurrency groups and sorts', () => {
    const rows = [
      { c: 'USD', a: 100 },
      { c: 'EUR', a: 500 },
      { c: 'USD', a: 50 },
      { c: 'LKR', a: 0 },
    ];
    expect(sumByCurrency(rows, (r) => r.c, (r) => r.a)).toEqual([
      { currency: 'EUR', amount: 500 },
      { currency: 'USD', amount: 150 },
    ]);
  });
});
