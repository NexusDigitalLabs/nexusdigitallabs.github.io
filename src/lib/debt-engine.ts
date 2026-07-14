// ── Types ──────────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  name: string;
  amount: number;
}

/** Debt input — no monthly payment required; the engine allocates Free Cash Flow. */
export interface Debt {
  id: string;
  name: string;
  totalAmt: number;
  outstanding: number;
}

export type PlanHorizon = 'short' | 'medium' | 'long';

export interface PlanSplit {
  horizon: PlanHorizon;
  label: string;
  description: string;
  debtPct: number;
  savingsPct: number;
}

/** Short / Medium / Long allocation of Free Cash Flow between debt and savings. */
export const PLAN_SPLITS: PlanSplit[] = [
  {
    horizon: 'short',
    label: 'Short',
    description: 'Aggressive payoff — most surplus goes to debt, small savings buffer.',
    debtPct: 0.9,
    savingsPct: 0.1,
  },
  {
    horizon: 'medium',
    label: 'Medium',
    description: 'Balanced — steady payoff while building meaningful savings.',
    debtPct: 0.7,
    savingsPct: 0.3,
  },
  {
    horizon: 'long',
    label: 'Long',
    description: 'Steady payoff — half to debt, half to savings for a stronger cushion.',
    debtPct: 0.5,
    savingsPct: 0.5,
  },
];

export interface RunwayRow {
  month: number;
  totalOut: number;
  debtCount: number;
  /** Amount applied to debts this month. */
  payment: number;
  /** Amount saved this month. */
  savings: number;
  /** Cumulative savings after this month. */
  savingsTotal: number;
  pivotMonth: boolean;
  debtDetail: Array<{ id: string; outstanding: number }>;
  /** Per-debt payment applied this month (snowball focus). */
  paymentsByDebt: Array<{ id: string; amount: number }>;
}

/** How much to put toward each debt under a plan, and when. */
export interface DebtAllocation {
  id: string;
  name: string;
  outstanding: number;
  /** Typical monthly amount to put toward this debt while it is the snowball focus. */
  monthlyPut: number;
  startMonth: number;
  endMonth: number | null;
  months: number;
  totalPaid: number;
}

export interface PlanResult {
  horizon: PlanHorizon;
  label: string;
  description: string;
  debtPct: number;
  savingsPct: number;
  /** Monthly budget allocated to debt repayment. */
  monthlyDebtBudget: number;
  /** Monthly amount set aside for savings. */
  monthlySavings: number;
  runway: RunwayRow[];
  /** Ordered snowball schedule: which debt gets how much, and for which months. */
  allocations: DebtAllocation[];
  debtFreeMonth: number | null;
  /** Total saved by the month debts are cleared (0 if never cleared). */
  totalSavedByDebtFree: number;
  isViable: boolean;
  error: string | null;
}

export interface MultiPlanResult {
  freeCashFlow: number;
  totalExpenses: number;
  totalInitialDebt: number;
  isViable: boolean;
  error: string | null;
  plans: PlanResult[];
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

export function fmtPct(pct: number): string {
  return `${Math.round(pct * 100)}%`;
}

function buildAllocations(
  debts: Debt[],
  monthlyDebtBudget: number,
  runway: RunwayRow[],
): DebtAllocation[] {
  const nameById = new Map(debts.map((d) => [d.id, d.name || 'Unnamed debt']));
  const outstandingById = new Map(debts.map((d) => [d.id, d.outstanding]));

  // Preserve snowball order (lowest outstanding first)
  const order = [...debts]
    .filter((d) => d.outstanding > 0)
    .sort((a, b) => a.outstanding - b.outstanding)
    .map((d) => d.id);

  const stats = new Map<string, { totalPaid: number; startMonth: number | null; endMonth: number | null; focusMonths: number[] }>();
  for (const id of order) {
    stats.set(id, { totalPaid: 0, startMonth: null, endMonth: null, focusMonths: [] });
  }

  for (const row of runway) {
    for (const p of row.paymentsByDebt) {
      const s = stats.get(p.id);
      if (!s) continue;
      s.totalPaid += p.amount;
      if (s.startMonth === null) s.startMonth = row.month;
      s.endMonth = row.month;
      if (p.amount > 0.5) s.focusMonths.push(row.month);
    }
  }

  return order.map((id) => {
    const s = stats.get(id)!;
    const months = s.startMonth && s.endMonth ? s.endMonth - s.startMonth + 1 : 0;
    // Typical monthly put = full debt budget while this is the focus (partial last month allowed)
    const monthlyPut = months > 0
      ? Math.min(monthlyDebtBudget, s.totalPaid / Math.max(1, s.focusMonths.length || months))
      : 0;

    return {
      id,
      name: nameById.get(id) ?? 'Unnamed debt',
      outstanding: outstandingById.get(id) ?? 0,
      monthlyPut: Math.round(monthlyPut * 100) / 100,
      startMonth: s.startMonth ?? 1,
      endMonth: s.endMonth,
      months,
      totalPaid: Math.round(s.totalPaid * 100) / 100,
    };
  });
}

// ── Single-plan simulator (snowball — lowest outstanding first) ────────────────
function simulatePlan(
  freeCashFlow: number,
  debts: Debt[],
  split: PlanSplit,
): PlanResult {
  const monthlyDebtBudget = freeCashFlow * split.debtPct;
  const monthlySavings = freeCashFlow * split.savingsPct;

  const empty = (
    extra: Partial<PlanResult> & { isViable: boolean; error: string | null },
  ): PlanResult => ({
    horizon: split.horizon,
    label: split.label,
    description: split.description,
    debtPct: split.debtPct,
    savingsPct: split.savingsPct,
    monthlyDebtBudget,
    monthlySavings,
    runway: [],
    allocations: [],
    debtFreeMonth: null,
    totalSavedByDebtFree: 0,
    ...extra,
  });

  if (monthlyDebtBudget < 0.5) {
    return empty({
      isViable: false,
      error: 'Debt budget is too small to make progress. Increase income or reduce expenses.',
    });
  }

  let sim = debts
    .map((d) => ({ id: d.id, outstanding: d.outstanding }))
    .filter((d) => d.outstanding > 0)
    .sort((a, b) => a.outstanding - b.outstanding);

  if (sim.length === 0) {
    return empty({
      isViable: false,
      error: 'All outstanding balances are zero.',
    });
  }

  const runway: RunwayRow[] = [];
  let debtFreeMonth: number | null = null;
  let savingsTotal = 0;

  for (let month = 1; month <= 600; month++) {
    if (sim.length === 0) break;

    let budget = monthlyDebtBudget;
    const paymentsByDebt: Array<{ id: string; amount: number }> = [];

    for (const d of sim) {
      if (budget < 0.5) break;
      if (d.outstanding > 0) {
        const pay = Math.min(d.outstanding, budget);
        d.outstanding -= pay;
        budget -= pay;
        if (pay > 0) paymentsByDebt.push({ id: d.id, amount: pay });
      }
    }

    for (const d of sim) {
      if (d.outstanding < 1) d.outstanding = 0;
    }

    savingsTotal += monthlySavings;
    const payment = monthlyDebtBudget - Math.max(0, budget);
    const totalOut = sim.reduce((s, d) => s + d.outstanding, 0);
    const prevCount = sim.length;
    sim = sim.filter((d) => d.outstanding > 0);

    const isPivot = sim.length === 0 && prevCount > 0;
    if (isPivot) debtFreeMonth = month;

    runway.push({
      month,
      totalOut,
      debtCount: sim.length,
      payment,
      savings: monthlySavings,
      savingsTotal,
      pivotMonth: isPivot,
      debtDetail: sim.map((d) => ({ id: d.id, outstanding: d.outstanding })),
      paymentsByDebt,
    });
  }

  const pivotRow = runway.find((r) => r.pivotMonth);
  const totalSavedByDebtFree = pivotRow?.savingsTotal ?? 0;
  const allocations = buildAllocations(debts, monthlyDebtBudget, runway);

  return {
    horizon: split.horizon,
    label: split.label,
    description: split.description,
    debtPct: split.debtPct,
    savingsPct: split.savingsPct,
    monthlyDebtBudget,
    monthlySavings,
    runway,
    allocations,
    debtFreeMonth,
    totalSavedByDebtFree,
    isViable: debtFreeMonth !== null,
    error: debtFreeMonth === null
      ? 'Could not clear all debts within 50 years at this allocation. Try the Short plan or increase income.'
      : null,
  };
}

// ── Multi-plan engine ──────────────────────────────────────────────────────────
/**
 * Builds Short / Medium / Long settlement plans from income, expenses, and debts.
 * No per-debt monthly payment is required — Free Cash Flow is split between
 * debt payoff (snowball) and savings according to each plan's percentages.
 */
export function runEngine(
  income: number,
  expenses: Expense[],
  debts: Debt[],
  _sym?: string,
): MultiPlanResult {
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const freeCashFlow = income - totalExp;
  const activeDebts = debts.filter((d) => d.outstanding > 0);
  const totalInitialDebt = activeDebts.reduce((s, d) => s + d.outstanding, 0);

  const fail = (error: string): MultiPlanResult => ({
    freeCashFlow,
    totalExpenses: totalExp,
    totalInitialDebt: 0,
    isViable: false,
    error,
    plans: [],
  });

  if (freeCashFlow <= 0) {
    return fail('Income does not cover living expenses. Review your expense list.');
  }
  if (activeDebts.length === 0) {
    return fail('Add at least one debt with an outstanding balance to generate a plan.');
  }

  const plans = PLAN_SPLITS.map((split) => simulatePlan(freeCashFlow, activeDebts, split));
  const anyViable = plans.some((p) => p.isViable);

  return {
    freeCashFlow,
    totalExpenses: totalExp,
    totalInitialDebt,
    isViable: anyViable,
    error: anyViable
      ? null
      : 'None of the plans can clear your debts with the current free cash flow. Increase income or reduce expenses.',
    plans,
  };
}
