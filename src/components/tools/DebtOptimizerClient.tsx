'use client';

import {
  useState, useRef, useCallback, useLayoutEffect, useId,
} from 'react';
import Script from 'next/script';

// ── Currency constants ─────────────────────────────────────────────────────────
const CURRENCY_MAP: Record<string, { symbol: string; label: string }> = {
  USD: { symbol: '$',    label: 'USD — US Dollar ($)'          },
  EUR: { symbol: '€',    label: 'EUR — Euro (€)'               },
  GBP: { symbol: '£',    label: 'GBP — British Pound (£)'      },
  LKR: { symbol: 'Rs',   label: 'LKR — Sri Lankan Rupee (Rs)'  },
  INR: { symbol: '₹',    label: 'INR — Indian Rupee (₹)'       },
  AUD: { symbol: 'A$',   label: 'AUD — Australian Dollar (A$)' },
  CAD: { symbol: 'C$',   label: 'CAD — Canadian Dollar (C$)'   },
  SGD: { symbol: 'S$',   label: 'SGD — Singapore Dollar (S$)'  },
  AED: { symbol: 'د.إ',  label: 'AED — UAE Dirham (د.إ)'       },
  MYR: { symbol: 'RM',   label: 'MYR — Malaysian Ringgit (RM)' },
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface Expense {
  id: string;
  name: string;
  amount: number;
}

interface Debt {
  id: string;
  name: string;
  totalAmt: number;
  outstanding: number;
  monthlyPay: number;
}

interface RunwayRow {
  month: number;
  totalOut: number;
  debtCount: number;
  payment: number;
  pivotMonth: boolean;
  debtDetail: Array<{ id: string; outstanding: number }>;
}

interface RunResult {
  runway: RunwayRow[];
  freeCashFlow: number;
  totalExpenses: number;
  overage: number;
  totalInitialDebt: number;
  debtFreeMonth: number | null;
  isViable: boolean;
  error: string | null;
}

type Html2PdfInstance = {
  set: (opts: object) => Html2PdfInstance;
  from: (el: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

// ── Formatting helpers ─────────────────────────────────────────────────────────
function fmtNum(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

function fmtC(n: number, sym: string) {
  return `${sym} ${fmtNum(n)}`;
}

function fmtMo(months: number | null): string {
  if (!months) return '—';
  const yr = Math.floor(months / 12);
  const mo = months % 12;
  if (yr === 0) return `${mo} mo`;
  if (mo === 0) return `${yr} yr`;
  return `${yr} yr ${mo} mo`;
}

function todayStr() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Amount input component (comma formatting while typing, cursor-stable) ──────
interface AmountInputProps {
  value: number;
  onChange: (n: number) => void;
  placeholder?: string;
  className?: string;
  prefix?: string;
  style?: React.CSSProperties;
}

function AmountInput({ value, onChange, placeholder = '0', className = '', prefix, style }: AmountInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const fromEnd = useRef(0);
  const isFocused = useRef(false);

  const formatted = value > 0 ? Math.round(value).toLocaleString('en-US') : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    fromEnd.current = e.target.value.length - (e.target.selectionStart ?? 0);
    const digits = e.target.value.replace(/[^\d]/g, '');
    onChange(digits ? parseInt(digits, 10) : 0);
  };

  // Restore cursor position after React updates the value
  useLayoutEffect(() => {
    const el = ref.current;
    if (el && isFocused.current) {
      const newPos = Math.max(0, formatted.length - fromEnd.current);
      el.setSelectionRange(newPos, newPos);
    }
  });

  return (
    <div className="relative" style={style}>
      {prefix && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs select-none pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={formatted}
        onChange={handleChange}
        placeholder={placeholder}
        onFocus={(e) => { isFocused.current = true; setTimeout(() => e.target.select(), 0); }}
        onBlur={() => { isFocused.current = false; fromEnd.current = 0; }}
        className={`block w-full bg-white border border-slate-200 focus:border-black outline-none px-2.5 py-2 text-[0.8125rem] font-[Inter,sans-serif] text-slate-900 placeholder:text-slate-400 ${prefix ? 'pl-7' : ''} ${className}`}
        style={{ borderRadius: 0, MozAppearance: 'textfield' } as React.CSSProperties}
      />
    </div>
  );
}

// ── Engine ─────────────────────────────────────────────────────────────────────
function runEngine(
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
      `Monthly payments (${fmtC(totalMinPay, sym)}) exceed your free cash flow (${fmtC(freeCashFlow, sym)}). Reduce expenses or increase income.`
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

// ── CSS helpers ────────────────────────────────────────────────────────────────
const siBase =
  'block w-full bg-white border border-slate-200 focus:border-black outline-none px-2.5 py-2 text-[0.8125rem] font-[Inter,sans-serif] text-slate-900 placeholder:text-slate-400 transition-colors';

const lblBase =
  'block text-[0.6875rem] font-semibold tracking-[0.07em] uppercase text-slate-500 mb-[0.3rem]';

// ── Main component ─────────────────────────────────────────────────────────────
export default function DebtOptimizerClient() {
  const uid = useId();

  // State
  const [currency, setCurrencyCode] = useState('LKR');
  const [income, setIncome] = useState(150000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', name: 'Rent / Mortgage', amount: 30000 },
    { id: 'exp-2', name: 'Groceries',        amount: 15000 },
    { id: 'exp-3', name: 'Utilities',         amount:  8000 },
  ]);
  const [debts, setDebts] = useState<Debt[]>([
    { id: 'debt-1', name: 'Credit Card', totalAmt: 200000, outstanding:  85000, monthlyPay:  5000 },
    { id: 'debt-2', name: 'Car Loan',    totalAmt: 800000, outstanding: 420000, monthlyPay: 18000 },
  ]);
  const [expUid, setExpUid] = useState(4);
  const [debtUid, setDebtUid] = useState(3);
  const [result, setResult] = useState<RunResult | null>(null);
  const [isCalc, setIsCalc] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sym = CURRENCY_MAP[currency]?.symbol ?? '$';
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const fcf = income - totalExp;

  // ── Expense helpers ──────────────────────────────────────────────────────────
  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: `exp-${expUid}`, name: '', amount: 0 }]);
    setExpUid((n) => n + 1);
  };
  const removeExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const updateExpense = (id: string, field: keyof Expense, value: string | number) =>
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));

  // ── Debt helpers ─────────────────────────────────────────────────────────────
  const addDebt = () => {
    setDebts((prev) => [...prev, { id: `debt-${debtUid}`, name: '', totalAmt: 0, outstanding: 0, monthlyPay: 0 }]);
    setDebtUid((n) => n + 1);
  };
  const removeDebt = (id: string) => setDebts((prev) => prev.filter((d) => d.id !== id));
  const updateDebt = (id: string, field: keyof Debt, value: string | number) =>
    setDebts((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));

  // ── Calculate ────────────────────────────────────────────────────────────────
  const calculate = useCallback(() => {
    setIsCalc(true);
    setTimeout(() => {
      const r = runEngine(income, expenses, debts, sym);
      setResult(r);
      setIsCalc(false);
    }, 20);
  }, [income, expenses, debts, sym]);

  // ── PDF download ─────────────────────────────────────────────────────────────
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    if (!result?.isViable || !pdfRef.current) return;
    const w = window as Window & { html2pdf?: () => Html2PdfInstance };
    if (!w.html2pdf) { alert('PDF engine is still loading, please wait.'); return; }
    setIsDownloading(true);

    const el = pdfRef.current;
    el.style.display = 'block';
    try {
      await w.html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: 'debt-payoff-plan.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css'] },
        })
        .from(el)
        .save();
    } finally {
      el.style.display = 'none';
      setIsDownloading(false);
    }
  }, [result]);

  // ── Payoff month per debt ────────────────────────────────────────────────────
  const payoffMonth = useCallback((id: string): number | null => {
    if (!result?.isViable) return null;
    for (const row of result.runway) {
      if (!row.debtDetail.some((dd) => dd.id === id)) return row.month;
    }
    return null;
  }, [result]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="lazyOnload"
      />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-1.5">
                Financial Tool
              </p>
              <h1 className="text-2xl sm:text-[1.625rem] font-semibold text-slate-900 tracking-tight leading-snug mt-1">
                Debt Settlement &amp; Savings Planner
              </h1>
              <p className="text-sm text-slate-400 font-light mt-1.5 leading-relaxed">
                Add your income, expenses, and debts — get a month-by-month payoff runway and download a PDF plan.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 shrink-0"
              style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', alignSelf: 'flex-start', marginTop: '4px' }}>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              100% client-side · Zero data transmitted
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN LAYOUT ─────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-8">
        <div className="flex gap-8 items-start flex-col lg:flex-row">

          {/* ── LEFT: Inputs ─────────────────────────────────────────────────── */}
          <div className="w-full lg:w-[380px] lg:shrink-0 lg:sticky lg:top-16 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto">

            {/* Currency */}
            <div className="mb-6">
              <label className={lblBase} htmlFor={`${uid}-currency`}>Currency</label>
              <select
                id={`${uid}-currency`}
                className={siBase}
                style={{ borderRadius: 0, cursor: 'pointer' }}
                value={currency}
                onChange={(e) => setCurrencyCode(e.target.value)}
              >
                {Object.entries(CURRENCY_MAP).map(([code, { label }]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            {/* Income */}
            <div className="mb-6">
              <label className={lblBase} htmlFor={`${uid}-income`}>Monthly Net Income</label>
              <AmountInput value={income} onChange={setIncome} prefix={sym} />
            </div>

            {/* Expenses */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400">Monthly Expenses</p>
                <button
                  type="button"
                  onClick={addExpense}
                  className="inline-flex items-center gap-[0.3rem] text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-slate-900 hover:text-slate-500 bg-transparent border-none cursor-pointer p-0 transition-colors font-[Inter,sans-serif]"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              {expenses.length === 0 ? (
                <p className="text-xs text-slate-400 font-light py-3 text-center">No expenses yet.</p>
              ) : (
                <div className="space-y-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp.name}
                        placeholder="Expense name"
                        onChange={(e) => updateExpense(exp.id, 'name', e.target.value)}
                        className={`${siBase} flex-1`}
                        style={{ borderRadius: 0, padding: '0.375rem 0.5rem' }}
                      />
                      <AmountInput
                        value={exp.amount}
                        onChange={(n) => updateExpense(exp.id, 'amount', n)}
                        prefix={sym}
                        style={{ width: '110px', flexShrink: 0 }}
                      />
                      <button
                        type="button"
                        onClick={() => removeExpense(exp.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-2.5 pt-2.5" style={{ borderTop: '1px solid #e2e8f0' }}>
                <span className="text-xs text-slate-400 font-medium">Total Expenses</span>
                <span className="text-xs font-semibold text-slate-700">{fmtC(totalExp, sym)}</span>
              </div>
            </div>

            {/* FCF preview */}
            <div className="mb-6 px-3 py-2.5" style={{ border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-400 font-medium">Free Cash Flow</span>
                <span className="text-sm font-semibold" style={{ color: fcf >= 0 ? '#0f172a' : '#ef4444' }}>
                  {fmtC(fcf, sym)}
                </span>
              </div>
            </div>

            {/* Debts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400">Loans &amp; Credit Cards</p>
                <button
                  type="button"
                  onClick={addDebt}
                  className="inline-flex items-center gap-[0.3rem] text-[0.6875rem] font-bold tracking-[0.05em] uppercase text-slate-900 hover:text-slate-500 bg-transparent border-none cursor-pointer p-0 transition-colors font-[Inter,sans-serif]"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              {debts.length === 0 ? (
                <p className="text-xs text-slate-400 font-light py-3 text-center">No debts yet.</p>
              ) : (
                <div className="space-y-3">
                  {debts.map((debt) => {
                    const pct = debt.totalAmt > 0
                      ? Math.min(100, (debt.outstanding / debt.totalAmt) * 100)
                      : 0;
                    return (
                      <div key={debt.id} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '12px' }}>
                        {/* Name + remove */}
                        <div className="flex items-center gap-2 mb-2.5">
                          <input
                            type="text"
                            value={debt.name}
                            placeholder="Loan / Card name"
                            onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                            className={`${siBase} flex-1`}
                            style={{ borderRadius: 0, padding: '0.3rem 0.5rem', fontSize: '0.8125rem', fontWeight: 500 }}
                          />
                          <button
                            type="button"
                            onClick={() => removeDebt(debt.id)}
                            className="text-slate-300 hover:text-red-400 transition-colors bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        {/* Three fields */}
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className={lblBase}>Total Amount</label>
                            <AmountInput value={debt.totalAmt} onChange={(n) => updateDebt(debt.id, 'totalAmt', n)} prefix={sym} />
                          </div>
                          <div>
                            <label className={lblBase}>Outstanding</label>
                            <AmountInput value={debt.outstanding} onChange={(n) => updateDebt(debt.id, 'outstanding', n)} prefix={sym} />
                          </div>
                          <div>
                            <label className={lblBase}>Monthly Pay</label>
                            <AmountInput value={debt.monthlyPay} onChange={(n) => updateDebt(debt.id, 'monthlyPay', n)} prefix={sym} />
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="mt-2.5 h-[3px] bg-slate-100 overflow-hidden">
                          <div className="h-[3px] bg-slate-400 transition-all" style={{ width: `${pct.toFixed(1)}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">{Math.round(pct)}% outstanding</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={calculate}
              disabled={isCalc}
              className="w-full py-3 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white text-[0.8125rem] font-semibold tracking-[0.04em] uppercase cursor-pointer border-none transition-colors disabled:cursor-not-allowed font-[Inter,sans-serif]"
              style={{ borderRadius: 0 }}
            >
              {isCalc ? 'Calculating…' : 'Calculate Plan'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!result?.isViable || isDownloading}
              className="w-full mt-2 py-3 bg-white hover:bg-slate-50 text-slate-900 text-[0.8125rem] font-semibold tracking-[0.04em] uppercase cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[Inter,sans-serif]"
              style={{ border: '1px solid #0f172a', borderRadius: 0 }}
            >
              {isDownloading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              {isDownloading ? 'Generating…' : 'Download PDF'}
            </button>

            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-light">
              Debts are paid lowest-balance-first (snowball method). This plan does not account for interest accrual — actual payoff time may vary.
            </p>
          </div>

          {/* ── RIGHT: Results ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {!result ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ border: '1px solid #e2e8f0' }}>
                  <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-400 font-light leading-relaxed">
                  Fill in your details and click<br />
                  <strong className="font-medium text-slate-500">Calculate Plan</strong>.
                </p>
              </div>
            ) : !result.isViable ? (
              <div className="flex items-start gap-3 p-5" style={{ border: '1px solid #fca5a5', background: '#fef2f2' }}>
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-900 mb-0.5">Cannot Build Plan</p>
                  <p className="text-sm text-red-700 font-light leading-relaxed">{result.error}</p>
                </div>
              </div>
            ) : (
              <div>
                {/* Summary cards */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Free Cash Flow',  value: fmtC(result.freeCashFlow, sym),     sub: 'Income minus total expenses',  green: false },
                    { label: 'Monthly Overage', value: fmtC(result.overage, sym),           sub: 'After all minimum payments',   green: false },
                    { label: 'Debt-Free In',    value: fmtMo(result.debtFreeMonth),         sub: result.debtFreeMonth ? `Month ${result.debtFreeMonth}` : '—', green: true },
                    { label: 'Total to Repay',  value: fmtC(result.totalInitialDebt, sym),  sub: 'Sum of outstanding balances',  green: false },
                  ].map(({ label, value, sub, green }) => (
                    <div key={label} style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '1rem 1.25rem' }}>
                      <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-2">{label}</p>
                      <p className="text-2xl font-semibold leading-none mb-1.5" style={{ color: green ? '#16a34a' : '#0f172a' }}>{value}</p>
                      <p className="text-[11px] text-slate-400 font-light">{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Payoff schedule per debt */}
                <div className="mb-6" style={{ border: '1px solid #e2e8f0', background: '#fff', padding: '1rem 1.25rem' }}>
                  <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-3">
                    Payoff Order <span className="font-normal normal-case text-slate-400 tracking-normal">— lowest balance first</span>
                  </p>
                  {debts
                    .slice()
                    .sort((a, b) => a.outstanding - b.outstanding)
                    .map((d) => {
                      const mo = payoffMonth(d.id);
                      const pct = d.totalAmt > 0 ? Math.min(100, (d.outstanding / d.totalAmt) * 100) : 0;
                      return (
                        <div key={d.id} className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700 truncate">{d.name}</p>
                            <div className="mt-1 h-[3px] bg-slate-100 overflow-hidden" style={{ width: '100%' }}>
                              <div className="h-[3px] bg-slate-400 transition-all" style={{ width: `${pct.toFixed(1)}%` }} />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{fmtC(d.outstanding, sym)} of {fmtC(d.totalAmt, sym)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs font-mono text-slate-600">{fmtC(d.monthlyPay, sym)}/mo</p>
                            {mo ? (
                              <p className="text-[11px] font-semibold" style={{ color: '#16a34a' }}>Paid off mo. {mo}</p>
                            ) : (
                              <p className="text-[11px] text-slate-400">—</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Month-by-month runway */}
                <div style={{ border: '1px solid #e2e8f0', background: '#fff' }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                    <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400 mb-[2px]">Month-by-Month Runway</p>
                    <p className="text-[11px] text-slate-400 font-light">{result.runway.length} months total</p>
                  </div>
                  <div style={{ overflow: 'auto', maxHeight: '480px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '480px' }}>
                      <thead>
                        <tr>
                          {['Mo.', 'Status', 'Outstanding', 'Paid Down', 'Payment'].map((h, i) => (
                            <th key={h} style={{
                              padding: '0.625rem 1rem', fontSize: '0.5625rem', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b',
                              background: '#fff', borderBottom: '2px solid #0f172a',
                              whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2,
                              textAlign: 'left',
                              paddingLeft: i === 0 ? '1rem' : undefined,
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.runway.map((row) => {
                          const pct = result.totalInitialDebt > 0
                            ? Math.max(0, 100 - (row.totalOut / result.totalInitialDebt) * 100)
                            : 100;
                          return (
                            <tr key={row.month}
                              style={row.pivotMonth
                                ? { background: '#f0fdf4', borderLeft: '3px solid #4ade80' }
                                : undefined}
                            >
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace', color: '#94a3b8', width: '52px' }}>{row.month}</td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                {row.pivotMonth ? (
                                  <span style={{ display: 'inline-block', padding: '1px 6px', background: '#4ade80', color: '#052e16', fontSize: '8px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    PAID OFF
                                  </span>
                                ) : row.debtCount === 0 ? (
                                  <span className="text-xs font-medium" style={{ color: '#16a34a' }}>Done</span>
                                ) : (
                                  <span className="text-xs text-slate-400">{row.debtCount} active</span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                                {row.totalOut > 0.5 ? (
                                  <span className="font-mono text-slate-700">{fmtC(row.totalOut, sym)}</span>
                                ) : (
                                  <span className="font-mono font-semibold" style={{ color: '#16a34a' }}>{fmtC(0, sym)}</span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9', width: '110px' }}>
                                <div style={{ height: '3px', background: '#f1f5f9', width: '90px', overflow: 'hidden' }}>
                                  <div style={{ height: '3px', background: '#4ade80', width: `${pct.toFixed(1)}%` }} />
                                </div>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace', color: '#475569' }}>{fmtC(row.payment, sym)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Hidden PDF content ────────────────────────────────────────────────── */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        {result?.isViable && <PdfContent result={result} debts={debts} expenses={expenses} income={income} currency={currency} sym={sym} />}
      </div>
    </>
  );
}

// ── PDF content component ──────────────────────────────────────────────────────
function PdfContent({
  result, debts, expenses, income, currency, sym,
}: {
  result: RunResult; debts: Debt[]; expenses: Expense[];
  income: number; currency: string; sym: string;
}) {
  const totalDebt = debts.reduce((s, d) => s + d.outstanding, 0);
  const sortedDebts = [...debts].sort((a, b) => a.outstanding - b.outstanding);

  const payoffMo = (id: string): number | null => {
    for (const row of result.runway) {
      if (!row.debtDetail.some((dd) => dd.id === id)) return row.month;
    }
    return null;
  };

  const shownRows = result.runway.slice(0, 48);

  return (
    <div style={{
      width: '794px', padding: '48px 56px',
      fontFamily: 'Inter, sans-serif', fontSize: '11px',
      color: '#0f172a', background: '#fff', lineHeight: '1.5',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>Debt Settlement &amp; Savings Plan</h1>
          <p style={{ color: '#64748b', fontSize: '10px', margin: '2px 0 0' }}>Generated by NexusDigitalLabs · nexusdigitallabs.dev</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
          <div>{todayStr()}</div>
          <div>Currency: {currency} ({sym})</div>
        </div>
      </div>

      {/* Summary */}
      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {[
          { lbl: 'Monthly Income',  val: fmtC(income, sym),              green: false },
          { lbl: 'Total Expenses',  val: fmtC(result.totalExpenses, sym), green: false },
          { lbl: 'Free Cash Flow',  val: fmtC(result.freeCashFlow, sym),  green: false },
          { lbl: 'Debt-Free In',    val: fmtMo(result.debtFreeMonth),     green: true  },
        ].map(({ lbl, val, green }) => (
          <div key={lbl} style={{ border: '1px solid #e2e8f0', padding: '10px 12px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>{lbl}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: green ? '#16a34a' : '#0f172a' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Expenses table */}
      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Monthly Expenses</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            <th style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #0f172a', textAlign: 'left' }}>Expense</th>
            <th style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #0f172a', textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id}>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>{e.name}</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(e.amount, sym)}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: '2px solid #0f172a' }}>
            <td style={{ padding: '5px 8px', fontSize: '10px' }}>Total</td>
            <td style={{ padding: '5px 8px', fontSize: '10px', textAlign: 'right' }}>{fmtC(result.totalExpenses, sym)}</td>
          </tr>
        </tbody>
      </table>

      {/* Debts table */}
      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Loans &amp; Credit Cards</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            {['Name','Total Amount','Outstanding','Monthly Pay','Paid Off'].map((h, i) => (
              <th key={h} style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #0f172a', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedDebts.map((d) => {
            const mo = payoffMo(d.id);
            return (
              <tr key={d.id}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>{d.name}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(d.totalAmt, sym)}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(d.outstanding, sym)}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(d.monthlyPay, sym)}/mo</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{mo ? `Month ${mo}` : '—'}</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700, borderTop: '2px solid #0f172a' }}>
            <td style={{ padding: '5px 8px', fontSize: '10px' }}>Total</td>
            <td style={{ padding: '5px 8px', fontSize: '10px' }} />
            <td style={{ padding: '5px 8px', fontSize: '10px', textAlign: 'right' }}>{fmtC(totalDebt, sym)}</td>
            <td /><td />
          </tr>
        </tbody>
      </table>

      {/* Runway */}
      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        Month-by-Month Runway{result.runway.length > 48 ? ` (first 48 of ${result.runway.length})` : ''}
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            {['Month','Status','Outstanding','Payment'].map((h, i) => (
              <th key={h} style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #0f172a', textAlign: i < 2 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shownRows.map((row) => (
            <tr key={row.month} style={row.pivotMonth ? { background: '#f0fdf4', fontWeight: 600 } : undefined}>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>{row.month}</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>{row.pivotMonth ? 'PAID OFF' : `${row.debtCount} debts`}</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(row.totalOut, sym)}</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(row.payment, sym)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.runway.length > 48 && (
        <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px' }}>… and {result.runway.length - 48} more months not shown.</p>
      )}

      {/* Footer */}
      <div style={{ marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '9px', color: '#94a3b8' }}>
        This plan is generated for informational purposes only and does not account for interest accrual.
        Actual payoff timelines may vary. All data is processed locally in your browser — no information is transmitted or stored.
      </div>
    </div>
  );
}
