import { describe, it, expect } from 'vitest';
import {
  runEngine, fmtNum, fmtC, fmtMo, fmtPct, PLAN_SPLITS,
  type Expense, type Debt,
} from '../debt-engine';

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

// ── fmtPct ────────────────────────────────────────────────────────────────────
describe('fmtPct', () => {
  it('formats decimal percentages', () => {
    expect(fmtPct(0.9)).toBe('90%');
    expect(fmtPct(0.7)).toBe('70%');
    expect(fmtPct(0.5)).toBe('50%');
  });
});

// ── PLAN_SPLITS ───────────────────────────────────────────────────────────────
describe('PLAN_SPLITS', () => {
  it('defines short, medium, and long with debt + savings summing to 100%', () => {
    expect(PLAN_SPLITS).toHaveLength(3);
    expect(PLAN_SPLITS.map((p) => p.horizon)).toEqual(['short', 'medium', 'long']);
    for (const p of PLAN_SPLITS) {
      expect(p.debtPct + p.savingsPct).toBeCloseTo(1, 5);
    }
  });
});

const baseExpenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];
const baseDebts: Debt[] = [
  { id: 'd1', name: 'Credit Card', totalAmt: 5000, outstanding: 1200 },
  { id: 'd2', name: 'Loan',        totalAmt: 10000, outstanding: 3600 },
];
// income=5000, expenses=1000 → FCF=4000
// short:  debt 3600 / save 400
// medium: debt 2800 / save 1200
// long:   debt 2000 / save 2000

// ── runEngine — error states ───────────────────────────────────────────────────
describe('runEngine — error states', () => {
  it('fails when income does not cover expenses', () => {
    const result = runEngine(1000, [{ id: 'e1', name: 'Rent', amount: 2000 }], [], '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('living expenses');
    expect(result.plans).toHaveLength(0);
  });

  it('fails when no debts are provided', () => {
    const result = runEngine(5000, baseExpenses, [], '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('at least one debt');
  });

  it('fails when all outstanding balances are zero', () => {
    const debts: Debt[] = [
      { id: 'd1', name: 'Card', totalAmt: 5000, outstanding: 0 },
    ];
    const result = runEngine(5000, baseExpenses, debts, '$');
    expect(result.isViable).toBe(false);
    expect(result.error).toContain('outstanding');
  });

  it('returns correct freeCashFlow and totalExpenses in failure result', () => {
    const result = runEngine(5000, [{ id: 'e1', name: 'Rent', amount: 2000 }], [], '$');
    expect(result.freeCashFlow).toBe(3000);
    expect(result.totalExpenses).toBe(2000);
  });
});

// ── runEngine — multi-plan happy path ──────────────────────────────────────────
describe('runEngine — multi-plan happy path', () => {
  it('returns isViable=true with three plans', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    expect(result.isViable).toBe(true);
    expect(result.error).toBeNull();
    expect(result.plans).toHaveLength(3);
  });

  it('calculates freeCashFlow and totalInitialDebt correctly', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    expect(result.freeCashFlow).toBe(4000);
    expect(result.totalInitialDebt).toBe(4800);
  });

  it('allocates FCF by plan percentages', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    const medium = result.plans.find((p) => p.horizon === 'medium')!;
    const long = result.plans.find((p) => p.horizon === 'long')!;

    expect(short.monthlyDebtBudget).toBeCloseTo(3600);
    expect(short.monthlySavings).toBeCloseTo(400);
    expect(medium.monthlyDebtBudget).toBeCloseTo(2800);
    expect(medium.monthlySavings).toBeCloseTo(1200);
    expect(long.monthlyDebtBudget).toBeCloseTo(2000);
    expect(long.monthlySavings).toBeCloseTo(2000);
  });

  it('short plan clears debt fastest', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    const medium = result.plans.find((p) => p.horizon === 'medium')!;
    const long = result.plans.find((p) => p.horizon === 'long')!;

    expect(short.debtFreeMonth).not.toBeNull();
    expect(medium.debtFreeMonth).not.toBeNull();
    expect(long.debtFreeMonth).not.toBeNull();
    expect(short.debtFreeMonth!).toBeLessThanOrEqual(medium.debtFreeMonth!);
    expect(medium.debtFreeMonth!).toBeLessThanOrEqual(long.debtFreeMonth!);
  });

  it('long plan accumulates more savings by debt-free date than short', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    const long = result.plans.find((p) => p.horizon === 'long')!;
    expect(long.totalSavedByDebtFree).toBeGreaterThan(short.totalSavedByDebtFree);
  });

  it('runway rows track savings and payment', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    expect(short.runway.length).toBeGreaterThan(0);
    const first = short.runway[0];
    expect(first.savings).toBeCloseTo(400);
    expect(first.payment).toBeGreaterThan(0);
    expect(first.savingsTotal).toBeCloseTo(400);
  });

  it('marks exactly one pivot month per viable plan', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    for (const plan of result.plans) {
      const pivots = plan.runway.filter((r) => r.pivotMonth);
      expect(pivots.length).toBe(1);
      expect(pivots[0].month).toBe(plan.debtFreeMonth);
      expect(pivots[0].totalOut).toBe(0);
    }
  });

  it('pays smallest balance first (snowball)', () => {
    const result = runEngine(5000, baseExpenses, baseDebts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    const earlyRow = short.runway.find((r) => r.debtCount === 1);
    expect(earlyRow).toBeDefined();
    expect(earlyRow?.debtDetail[0]?.id).toBe('d2'); // loan remains after card is cleared
  });
});

// ── runEngine — single debt ────────────────────────────────────────────────────
describe('runEngine — single debt exact payoff', () => {
  it('short plan pays off a small debt in one month when budget covers it', () => {
    // FCF=2000, short debt budget=1800; outstanding=1500 → 1 month
    const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];
    const debts: Debt[] = [{ id: 'd1', name: 'Card', totalAmt: 2000, outstanding: 1500 }];
    const result = runEngine(3000, expenses, debts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    expect(short.debtFreeMonth).toBe(1);
  });

  it('handles multi-month payoff with short allocation', () => {
    // FCF=1000, short debt budget=900; outstanding=5000 → ceil(5000/900)=6 months
    const expenses: Expense[] = [{ id: 'e1', name: 'Rent', amount: 1000 }];
    const debts: Debt[] = [{ id: 'd1', name: 'Card', totalAmt: 5000, outstanding: 5000 }];
    const result = runEngine(2000, expenses, debts, '$');
    const short = result.plans.find((p) => p.horizon === 'short')!;
    expect(short.debtFreeMonth).toBe(6);
    expect(short.totalSavedByDebtFree).toBeCloseTo(600); // 100 * 6
  });
});
