import { describe, it, expect } from 'vitest';
import { runEngine, fmtNum, fmtC, fmtMo, type Expense, type Debt } from '../debt-engine';

// ── fmtNum ────────────────────────────────────────────────────────────────────
describe('fmtNum', () => {
  it('rounds and formats with thousand separators', () => {
    expect(fmtNum(1500)).toBe('1,500');
    expect(fmtNum(1000000)).toBe('1,000,000');
  });

  it('rounds fractional values', () => {
    expect(fmtNum(1500.7)).toBe('1,501');
    expect(fmtNum(1500.3)).toBe('1,500');
  });
});

// ── fmtC ─────────────────────────────────────────────────────────────────────
describe('fmtC', () => {
  it('prepends the currency symbol', () => {
    expect(fmtC(1500, '$')).toBe('$ 1,500');
    expect(fmtC(85000, 'Rs')).toBe('Rs 85,000');
  });
});

// ── fmtMo ─────────────────────────────────────────────────────────────────────
describe('fmtMo', () => {
  it('returns em dash for null', () => {
    expect(fmtMo(null)).toBe('—');
  });

  it('returns months only when less than 12', () => {
    expect(fmtMo(6)).toBe('6 mo');
    expect(fmtMo(1)).toBe('1 mo');
  });

  it('returns years only when no remainder', () => {
    expect(fmtMo(12)).toBe('1 yr');
    expect(fmtMo(24)).toBe('2 yr');
  });

  it('returns combined years and months', () => {
    expect(fmtMo(14)).toBe('1 yr 2 mo');
    expect(fmtMo(25)).toBe('2 yr 1 mo');
  });
});

// ── runEngine — error states ───────────────────────────────────────────────────
describe('runEngine — error states', () => {
  const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 2000 }];

  it('fails when income does not cover expenses', () => {
    const result = runEngine(1000, expenses, [], '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('living expenses');
  });

  it('fails when no debts are provided', () => {
    const result = runEngine(5000, expenses, [], '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('at least one debt');
  });

  it('fails when minimum payments exceed free cash flow', () => {
    const debts: Debt[] = [
      { id: 'd1', name: 'Loan', totalAmt: 10000, outstanding: 8000, monthlyPay: 4000 },
    ];
    // freeCashFlow = 5000 - 2000 = 3000; totalMinPay = 4000; overage = -1000
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('exceed your free cash flow');
  });

  it('returns correct freeCashFlow and totalExpenses in failure result', () => {
    const result = runEngine(5000, expenses, [], '$');
    expect(result.freeCashFlow).toBe(3000);
    expect(result.totalExpenses).toBe(2000);
  });
});

// ── runEngine — happy path ─────────────────────────────────────────────────────
describe('runEngine — happy path', () => {
  const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];

  const debts: Debt[] = [
    { id: 'd1', name: 'Credit Card', totalAmt: 5000, outstanding: 1200, monthlyPay: 200 },
    { id: 'd2', name: 'Loan',        totalAmt: 10000, outstanding: 3600, monthlyPay: 300 },
  ];
  // income=5000, expenses=1000 → FCF=4000, minPay=500, overage=3500

  it('returns isViable=true', () => {
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.isViable).toBe(true);
    expect(result.error).toBeNull();
  });

  it('calculates freeCashFlow correctly', () => {
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.freeCashFlow).toBe(4000);
  });

  it('calculates totalInitialDebt correctly', () => {
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.totalInitialDebt).toBe(4800); // 1200 + 3600
  });

  it('produces a runway with at least one row', () => {
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.runway.length).toBeGreaterThan(0);
  });

  it('sets a debtFreeMonth', () => {
    const result = runEngine(5000, expenses, debts, '$');
    expect(result.debtFreeMonth).not.toBeNull();
    expect(result.debtFreeMonth).toBeGreaterThan(0);
  });

  it('marks exactly one runway row as pivotMonth', () => {
    const result = runEngine(5000, expenses, debts, '$');
    const pivots = result.runway.filter((r) => r.pivotMonth);
    expect(pivots.length).toBe(1);
  });

  it('pivot row month matches debtFreeMonth', () => {
    const result = runEngine(5000, expenses, debts, '$');
    const pivot = result.runway.find((r) => r.pivotMonth);
    expect(pivot?.month).toBe(result.debtFreeMonth);
  });

  it('totalOut reaches 0 at or after the pivot month', () => {
    const result = runEngine(5000, expenses, debts, '$');
    const pivot = result.runway.find((r) => r.pivotMonth);
    expect(pivot?.totalOut).toBe(0);
  });

  it('sorts debts by outstanding amount (snowball: smallest first)', () => {
    // Credit card (1200) should be paid off before loan (3600)
    const result = runEngine(5000, expenses, debts, '$');
    // After a few months, debtDetail should drop to 1 (the larger debt remains)
    const earlyRow = result.runway.find((r) => r.debtCount === 1);
    expect(earlyRow).toBeDefined();
    // That remaining debt should be the loan (d2), not the credit card (d1)
    const remainingId = earlyRow?.debtDetail[0]?.id;
    expect(remainingId).toBe('d2');
  });
});

// ── runEngine — single debt ────────────────────────────────────────────────────
describe('runEngine — single debt exact payoff', () => {
  it('pays off a single debt within the expected number of months', () => {
    // income=3000, expenses=1000 → FCF=2000; debt outstanding=2000, min=500
    // Month 1: pay 500 min + 1500 extra = debt gone in 1 month
    const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];
    const debts: Debt[] = [{ id: 'd1', name: 'Card', totalAmt: 2000, outstanding: 2000, monthlyPay: 500 }];
    const result = runEngine(3000, expenses, debts, '$');
    expect(result.debtFreeMonth).toBe(1);
    expect(result.runway.length).toBe(1);
  });

  it('handles multi-month payoff correctly', () => {
    // income=2000, expenses=1000 → FCF=1000; debt=5000, min=300
    // Month 1: pay 1000, remaining=4000; Month 2: 3000; etc — 5 months total
    const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];
    const debts: Debt[] = [{ id: 'd1', name: 'Card', totalAmt: 5000, outstanding: 5000, monthlyPay: 300 }];
    const result = runEngine(2000, expenses, debts, '$');
    expect(result.debtFreeMonth).toBe(5);
  });
});
