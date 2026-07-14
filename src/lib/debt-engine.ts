// ── Types ──────────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  name: string;
  amount: number;
}

export interface Debt {
  id: string;
  name: string;
  totalAmt: number;
  outstanding: number;
  monthlyPay: number;
}

export interface RunwayRow {
  month: number;
  totalOut: number;
  debtCount: number;
  payment: number;
  pivotMonth: boolean;
  debtDetail: Array<{ id: string; outstanding: number }>;
}

export interface RunResult {
  runway: RunwayRow[];
  freeCashFlow: number;
  totalExpenses: number;
  overage: number;
  totalInitialDebt: number;
  debtFreeMonth: number | null;
  isViable: boolean;
  error: string | null;
}

// ── Formatting helpers ─────────────────────────────────────────────────────────
export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function fmtC(n: number, sym: string): string {
  return `${sym} ${fmtNum(n)}`;
}

export function fmtMo(months: number | null): string {
  if (!months) return '—';
  const yr = Math.floor(months / 12);
  const mo = months % 12;
  if (yr === 0) return `${mo} mo`;
  if (mo === 0) return `${yr} yr`;
  return `${yr} yr ${mo} mo`;
}

// ── Debt payoff engine (snowball — lowest outstanding first) ───────────────────
export function runEngine(
  income: number,
  expenses: Expense[],
  debts: Debt[],
  sym: string,
): RunResult {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const freeCashFlow = income - totalExp;
  const totalMinPay = debts.reduce((s, d) => s + d.monthlyPay, 0);
  const overage = freeCashFlow - totalMinPay;

  const fail = (error: string): RunResult => ({
    runway: [], freeCashFlow, totalExpenses: totalExp, overage,
    totalInitialDebt: 0, debtFreeMonth: null, isViable: false, error,
  });

  if (freeCashFlow <= 0) return fail('Income does not cover living expenses. Review your expense list.');
  if (debts.length === 0) return fail('Add at least one debt to generate a plan.');
  if (overage < 0) {
    return fail(
      `Monthly payments (${fmtC(totalMinPay, sym)}) exceed your free cash flow (${fmtC(freeCashFlow, sym)}). Reduce expenses or increase income.`,
    );
  }

  // Deep clone & sort: lowest outstanding first (snowball)
  let sim = debts
    .map((d) => ({ id: d.id, name: d.name, totalAmt: d.totalAmt, outstanding: d.outstanding, monthlyPay: d.monthlyPay }))
    .sort((a, b) => a.outstanding - b.outstanding);

  const runway: RunwayRow[] = [];
  let debtFreeMonth: number | null = null;
  const totalInitialDebt = sim.reduce((s, d) => s + d.outstanding, 0);

  for (let month = 1; month <= 600; month++) {
    if (sim.length === 0) break;
    let budget = freeCashFlow;

    // 1. Pay minimums on all debts
    for (const d of sim) {
      const minPay = Math.min(d.monthlyPay, d.outstanding, budget);
      d.outstanding -= minPay;
      budget -= minPay;
    }

    // 2. Apply remaining budget to priority debt (lowest outstanding first)
    for (const d of sim) {
      if (budget < 0.5) break;
      if (d.outstanding > 0) {
        const extra = Math.min(d.outstanding, budget);
        d.outstanding -= extra;
        budget -= extra;
      }
    }

    // 3. Flush sub-unit residuals
    for (const d of sim) {
      if (d.outstanding < 1) d.outstanding = 0;
    }

    const totalOut = sim.reduce((s, d) => s + d.outstanding, 0);
    const prevCount = sim.length;
    sim = sim.filter((d) => d.outstanding > 0);

    const isPivot = sim.length === 0 && prevCount > 0;
    if (isPivot) debtFreeMonth = month;

    runway.push({
      month,
      totalOut,
      debtCount: sim.length,
      payment: freeCashFlow - Math.max(0, budget),
      pivotMonth: isPivot,
      debtDetail: sim.map((d) => ({ id: d.id, outstanding: d.outstanding })),
    });
  }

  return {
    runway, freeCashFlow, totalExpenses: totalExp, overage,
    totalInitialDebt, debtFreeMonth, isViable: true, error: null,
  };
}
