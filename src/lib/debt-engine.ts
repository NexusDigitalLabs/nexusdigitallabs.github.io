// ── Types ──────────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  name: string;
  amount: number;
}

/** Debt input — minimum payments are required each month; surplus FCF is allocated by the engine. */
export interface Debt {
  id: string;
  name: string;
  totalAmt: number;
  /** Current balance still owed. */
  outstanding: number;
  /** Required monthly minimum payment (credit card / loan). Defaults to 0 when omitted. */
  minPayment?: number;
  /** Cumulative payments logged against this debt (for progress tracking). */
  totalPaid?: number;
}

export function debtMinPayment(d: Debt): number {
  return Math.max(0, d.minPayment ?? 0);
}

export function totalMinPayments(debts: Debt[]): number {
  return debts
    .filter((d) => d.outstanding > 0)
    .reduce((s, d) => s + debtMinPayment(d), 0);
}

/** Common issuer minimum: ~2.5% of balance (CARD Act–style simplified). */
export const CREDIT_CARD_MIN_PERCENT = 0.025;

/** Typical statement minimum floors by currency (rough planning figures). */
export const CREDIT_CARD_MIN_FLOORS: Record<string, number> = {
  USD: 25,
  EUR: 25,
  GBP: 25,
  LKR: 500,
  INR: 500,
  AUD: 25,
  CAD: 25,
  SGD: 25,
  AED: 50,
  MYR: 25,
};

export const CREDIT_CARD_MIN_DISCLAIMER =
  'Suggested minimums are rough planning figures (~2.5% of balance or a typical issuer floor). Check your statement for the exact amount.';

/** Heuristic: name suggests a revolving credit card balance. */
export function isLikelyCreditCard(name: string): boolean {
  return /\b(card|visa|mastercard|amex|credit)\b/i.test(name);
}

/**
 * Standard credit-card minimum estimate: greater of ~2.5% of balance or currency floor,
 * capped at outstanding. Issuer rules vary — this is for planning only.
 */
export function estimateCreditCardMinPayment(outstanding: number, currency = 'USD'): number {
  if (outstanding <= 0) return 0;
  const pctAmount = Math.round(outstanding * CREDIT_CARD_MIN_PERCENT);
  const floor = CREDIT_CARD_MIN_FLOORS[currency] ?? 25;
  return Math.min(outstanding, Math.max(pctAmount, floor));
}

/** Suggested minimum for a debt row (credit cards only). */
export function suggestedDebtMinPayment(debt: Debt, currency = 'USD'): number | null {
  if (debt.outstanding <= 0 || !isLikelyCreditCard(debt.name)) return null;
  return estimateCreditCardMinPayment(debt.outstanding, currency);
}

export function debtsMissingMinPayment(debts: Debt[]): Debt[] {
  return debts.filter((d) => d.outstanding > 0 && debtMinPayment(d) <= 0);
}

/** Remaining balance after logged payments (outstanding is kept in sync when recording). */
export function debtRemaining(d: Debt): number {
  return Math.max(0, d.outstanding);
}

export function totalDebtRemaining(debts: Debt[]): number {
  return debts.filter((d) => d.outstanding > 0).reduce((s, d) => s + debtRemaining(d), 0);
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

export interface DebtPaymentDetail {
  id: string;
  minPaid: number;
  extraPaid: number;
  totalPaid: number;
  outstanding: number;
}

export interface RunwayRow {
  month: number;
  totalOut: number;
  debtCount: number;
  /** Total amount applied to debts this month. */
  payment: number;
  /** Total minimum payments applied this month. */
  minPayment: number;
  /** Total snowball extra applied this month. */
  extraPayment: number;
  /** Amount saved this month. */
  savings: number;
  /** Cumulative savings after this month. */
  savingsTotal: number;
  pivotMonth: boolean;
  debtDetail: Array<{ id: string; outstanding: number }>;
  /** Per-debt payment applied this month (min + extra combined). */
  paymentsByDebt: Array<{ id: string; amount: number }>;
  /** Per-debt breakdown: minimum, extra, and remaining balance. */
  debtBreakdown: DebtPaymentDetail[];
}

/** How much to put toward each debt under a plan, and when. */
export interface DebtAllocation {
  id: string;
  name: string;
  outstanding: number;
  /** Required monthly minimum while this debt is active. */
  monthlyMin: number;
  /** Typical snowball extra per month while this debt is the focus. */
  monthlyExtra: number;
  /** Typical total when this debt is the snowball focus (min + extra). */
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
  /** Sum of required minimum payments at plan start. */
  totalMinPayments: number;
  /** Snowball extra available after minimums (month 1 steady state). */
  monthlySnowballExtra: number;
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
  totalMinPayments: number;
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

type SimDebt = {
  id: string;
  outstanding: number;
  minPayment: number;
};

function buildAllocations(
  debts: Debt[],
  monthlyDebtBudget: number,
  totalMins: number,
  runway: RunwayRow[],
): DebtAllocation[] {
  const nameById = new Map(debts.map((d) => [d.id, d.name || 'Unnamed debt']));
  const outstandingById = new Map(debts.map((d) => [d.id, d.outstanding]));
  const minById = new Map(debts.map((d) => [d.id, debtMinPayment(d)]));

  const order = [...debts]
    .filter((d) => d.outstanding > 0)
    .sort((a, b) => a.outstanding - b.outstanding)
    .map((d) => d.id);

  const stats = new Map<string, {
    totalPaid: number;
    startMonth: number | null;
    endMonth: number | null;
    extraMonths: number[];
  }>();

  for (const id of order) {
    stats.set(id, { totalPaid: 0, startMonth: null, endMonth: null, extraMonths: [] });
  }

  for (const row of runway) {
    for (const detail of row.debtBreakdown) {
      const s = stats.get(detail.id);
      if (!s || detail.totalPaid <= 0) continue;
      s.totalPaid += detail.totalPaid;
      if (s.startMonth === null) s.startMonth = row.month;
      s.endMonth = row.month;
      if (detail.extraPaid > 0.5) s.extraMonths.push(detail.extraPaid);
    }
  }

  const steadyExtra = Math.max(0, monthlyDebtBudget - totalMins);

  return order.map((id) => {
    const s = stats.get(id)!;
    const monthlyMin = minById.get(id) ?? 0;
    const months = s.startMonth && s.endMonth ? s.endMonth - s.startMonth + 1 : 0;
    const monthlyExtra = s.extraMonths.length > 0
      ? s.extraMonths.reduce((a, b) => a + b, 0) / s.extraMonths.length
      : 0;
    const monthlyPut = monthlyMin + (monthlyExtra > 0.5 ? monthlyExtra : steadyExtra);

    return {
      id,
      name: nameById.get(id) ?? 'Unnamed debt',
      outstanding: outstandingById.get(id) ?? 0,
      monthlyMin: Math.round(monthlyMin * 100) / 100,
      monthlyExtra: Math.round(monthlyExtra * 100) / 100,
      monthlyPut: Math.round(monthlyPut * 100) / 100,
      startMonth: s.startMonth ?? 1,
      endMonth: s.endMonth,
      months,
      totalPaid: Math.round(s.totalPaid * 100) / 100,
    };
  });
}

function simulateMonth(
  sim: SimDebt[],
  budget: number,
): { sim: SimDebt[]; breakdown: DebtPaymentDetail[]; minPaid: number; extraPaid: number } {
  const breakdownMap = new Map<string, DebtPaymentDetail>();
  const ensure = (id: string) => {
    if (!breakdownMap.has(id)) {
      breakdownMap.set(id, { id, minPaid: 0, extraPaid: 0, totalPaid: 0, outstanding: 0 });
    }
    return breakdownMap.get(id)!;
  };

  let remaining = budget;
  let minPaid = 0;
  let extraPaid = 0;

  for (const d of sim) {
    if (remaining < 0.5 || d.outstanding < 0.5) continue;
    const pay = Math.min(d.outstanding, d.minPayment, remaining);
    if (pay <= 0) continue;
    d.outstanding -= pay;
    remaining -= pay;
    minPaid += pay;
    const row = ensure(d.id);
    row.minPaid += pay;
    row.totalPaid += pay;
  }

  const snowballOrder = [...sim]
    .filter((d) => d.outstanding > 0.5)
    .sort((a, b) => a.outstanding - b.outstanding);

  for (const d of snowballOrder) {
    if (remaining < 0.5) break;
    const pay = Math.min(d.outstanding, remaining);
    if (pay <= 0) continue;
    d.outstanding -= pay;
    remaining -= pay;
    extraPaid += pay;
    const row = ensure(d.id);
    row.extraPaid += pay;
    row.totalPaid += pay;
  }

  for (const d of sim) {
    if (d.outstanding < 1) d.outstanding = 0;
    const row = ensure(d.id);
    row.outstanding = d.outstanding;
  }

  const breakdown = sim.map((d) => ensure(d.id));
  return { sim: sim.filter((d) => d.outstanding > 0), breakdown, minPaid, extraPaid };
}

// ── Single-plan simulator (snowball — lowest outstanding first) ────────────────
function simulatePlan(
  freeCashFlow: number,
  debts: Debt[],
  split: PlanSplit,
): PlanResult {
  const monthlyDebtBudget = freeCashFlow * split.debtPct;
  const monthlySavings = freeCashFlow * split.savingsPct;
  const totalMins = totalMinPayments(debts);
  const monthlySnowballExtra = Math.max(0, monthlyDebtBudget - totalMins);

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
    totalMinPayments: totalMins,
    monthlySnowballExtra,
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

  if (totalMins > monthlyDebtBudget + 0.5) {
    return empty({
      isViable: false,
      error: `Minimum payments exceed this plan's debt budget (${fmtNum(totalMins)} vs ${fmtNum(monthlyDebtBudget)}). Try the Short plan or increase income.`,
    });
  }

  let sim: SimDebt[] = debts
    .filter((d) => d.outstanding > 0)
    .map((d) => ({
      id: d.id,
      outstanding: d.outstanding,
      minPayment: debtMinPayment(d),
    }))
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

    const prevCount = sim.length;
    const { sim: nextSim, breakdown, minPaid, extraPaid } = simulateMonth(
      sim.map((d) => ({ ...d })),
      monthlyDebtBudget,
    );
    sim = nextSim;

    savingsTotal += monthlySavings;
    const payment = minPaid + extraPaid;
    const totalOut = sim.reduce((s, d) => s + d.outstanding, 0);

    const isPivot = sim.length === 0 && prevCount > 0;
    if (isPivot) debtFreeMonth = month;

    runway.push({
      month,
      totalOut,
      debtCount: sim.length,
      payment,
      minPayment: minPaid,
      extraPayment: extraPaid,
      savings: monthlySavings,
      savingsTotal,
      pivotMonth: isPivot,
      debtDetail: sim.map((d) => ({ id: d.id, outstanding: d.outstanding })),
      paymentsByDebt: breakdown
        .filter((b) => b.totalPaid > 0)
        .map((b) => ({ id: b.id, amount: b.totalPaid })),
      debtBreakdown: breakdown,
    });
  }

  const pivotRow = runway.find((r) => r.pivotMonth);
  const totalSavedByDebtFree = pivotRow?.savingsTotal ?? 0;
  const allocations = buildAllocations(debts, monthlyDebtBudget, totalMins, runway);

  return {
    horizon: split.horizon,
    label: split.label,
    description: split.description,
    debtPct: split.debtPct,
    savingsPct: split.savingsPct,
    monthlyDebtBudget,
    monthlySavings,
    totalMinPayments: totalMins,
    monthlySnowballExtra,
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
 * Each month pays all required minimums first, then applies snowball extra to the
 * lowest balance. Free Cash Flow is split between debt and savings per plan.
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
  const totalMins = totalMinPayments(activeDebts);

  const fail = (error: string): MultiPlanResult => ({
    freeCashFlow,
    totalExpenses: totalExp,
    totalInitialDebt: 0,
    totalMinPayments: totalMins,
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
  if (totalMins > freeCashFlow + 0.5) {
    return fail(
      'Minimum payments exceed free cash flow. Reduce minimums, increase income, or cut expenses.',
    );
  }

  const plans = PLAN_SPLITS.map((split) => simulatePlan(freeCashFlow, activeDebts, split));
  const anyViable = plans.some((p) => p.isViable);

  return {
    freeCashFlow,
    totalExpenses: totalExp,
    totalInitialDebt,
    totalMinPayments: totalMins,
    isViable: anyViable,
    error: anyViable
      ? null
      : 'None of the plans can clear your debts with the current free cash flow. Increase income or reduce expenses.',
    plans,
  };
}
