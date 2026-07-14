'use client';

import {
  useState, useRef, useCallback, useLayoutEffect, useId, useMemo,
} from 'react';
import Script from 'next/script';
import {
  type Expense, type Debt, type MultiPlanResult, type PlanResult, type PlanHorizon,
  runEngine, fmtC, fmtMo, fmtPct,
} from '@/lib/debt-engine';

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

// ── Local types ────────────────────────────────────────────────────────────────
type Html2PdfInstance = {
  set: (opts: object) => Html2PdfInstance;
  from: (el: HTMLElement) => Html2PdfInstance;
  save: () => Promise<void>;
};

// ── Local helpers ──────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// ── Dark-theme design tokens ───────────────────────────────────────────────────
const D = {
  pageBg:       '#0b0f19',
  cardBg:       'rgba(255,255,255,0.04)',
  cardBgAlt:    'rgba(255,255,255,0.06)',
  cardBorder:   'rgba(255,255,255,0.08)',
  cardBorderHi: 'rgba(255,255,255,0.14)',
  inputBg:      'rgba(255,255,255,0.05)',
  inputBorder:  'rgba(255,255,255,0.1)',
  inputFocus:   'rgba(255,255,255,0.9)',
  sep:          'rgba(255,255,255,0.06)',
  textPrimary:  '#f8fafc',
  textSecondary:'#cbd5e1',
  textMuted:    '#94a3b8',
  textFaint:    '#64748b',
  green:        '#4ade80',
  greenDark:    '#052e16',
  blue:         '#60a5fa',
  red:          '#f87171',
  redBg:        'rgba(239,68,68,0.08)',
  redBorder:    'rgba(239,68,68,0.25)',
  accent:       '#2563eb',
} as const;

const siBaseClass =
  'block w-full outline-none px-2.5 py-2 text-[0.8125rem] font-[Inter,sans-serif] placeholder:text-slate-600 transition-colors';
const siBaseStyle: React.CSSProperties = {
  background: D.inputBg, border: `1px solid ${D.inputBorder}`,
  color: D.textPrimary, borderRadius: 0,
};

const lblBase =
  'block text-[0.6875rem] font-semibold tracking-[0.07em] uppercase text-slate-500 mb-[0.3rem]';

// ── Amount input ───────────────────────────────────────────────────────────────
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
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs select-none pointer-events-none" style={{ color: D.textMuted }}>
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
        onFocus={(e) => {
          isFocused.current = true;
          e.target.style.borderColor = D.inputFocus;
          setTimeout(() => e.target.select(), 0);
        }}
        onBlur={(e) => {
          isFocused.current = false;
          fromEnd.current = 0;
          e.target.style.borderColor = D.inputBorder;
        }}
        className={`${siBaseClass} ${prefix ? 'pl-7' : ''} ${className}`}
        style={{ ...siBaseStyle, MozAppearance: 'textfield' } as React.CSSProperties}
      />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DebtOptimizerClient() {
  const uid = useId();

  const [currency, setCurrencyCode] = useState('LKR');
  const [income, setIncome] = useState(150000);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: 'exp-1', name: 'Rent / Mortgage', amount: 30000 },
    { id: 'exp-2', name: 'Groceries',        amount: 15000 },
    { id: 'exp-3', name: 'Utilities',         amount:  8000 },
  ]);
  const [debts, setDebts] = useState<Debt[]>([
    { id: 'debt-1', name: 'Credit Card', totalAmt: 200000, outstanding:  85000 },
    { id: 'debt-2', name: 'Car Loan',    totalAmt: 800000, outstanding: 420000 },
  ]);
  const [expUid, setExpUid] = useState(4);
  const [debtUid, setDebtUid] = useState(3);
  const [result, setResult] = useState<MultiPlanResult | null>(null);
  const [selectedHorizon, setSelectedHorizon] = useState<PlanHorizon>('medium');
  const [isCalc, setIsCalc] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const sym = CURRENCY_MAP[currency]?.symbol ?? '$';
  const totalExp = expenses.reduce((s, e) => s + e.amount, 0);
  const fcf = income - totalExp;

  const selectedPlan: PlanResult | null = useMemo(() => {
    if (!result?.isViable) return null;
    return result.plans.find((p) => p.horizon === selectedHorizon)
      ?? result.plans.find((p) => p.isViable)
      ?? null;
  }, [result, selectedHorizon]);

  const addExpense = () => {
    setExpenses((prev) => [...prev, { id: `exp-${expUid}`, name: '', amount: 0 }]);
    setExpUid((n) => n + 1);
  };
  const removeExpense = (id: string) => setExpenses((prev) => prev.filter((e) => e.id !== id));
  const updateExpense = (id: string, field: keyof Expense, value: string | number) =>
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, [field]: value } : e));

  const addDebt = () => {
    setDebts((prev) => [...prev, { id: `debt-${debtUid}`, name: '', totalAmt: 0, outstanding: 0 }]);
    setDebtUid((n) => n + 1);
  };
  const removeDebt = (id: string) => setDebts((prev) => prev.filter((d) => d.id !== id));
  const updateDebt = (id: string, field: keyof Debt, value: string | number) =>
    setDebts((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));

  const calculate = useCallback(() => {
    setIsCalc(true);
    setTimeout(() => {
      const r = runEngine(income, expenses, debts, sym);
      setResult(r);
      // Prefer medium if viable, else first viable plan
      const preferred = r.plans.find((p) => p.horizon === 'medium' && p.isViable)
        ?? r.plans.find((p) => p.isViable);
      if (preferred) setSelectedHorizon(preferred.horizon);
      setIsCalc(false);
    }, 20);
  }, [income, expenses, debts, sym]);

  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = useCallback(async () => {
    if (!result?.isViable || !selectedPlan || !pdfRef.current) return;
    const w = window as Window & { html2pdf?: () => Html2PdfInstance };
    if (!w.html2pdf) { alert('PDF engine is still loading, please wait.'); return; }
    setIsDownloading(true);

    const el = pdfRef.current;
    el.style.display = 'block';
    try {
      await w.html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `debt-payoff-${selectedPlan.horizon}-plan.pdf`,
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
  }, [result, selectedPlan]);

  const payoffMonth = useCallback((id: string): number | null => {
    if (!selectedPlan?.isViable) return null;
    for (const row of selectedPlan.runway) {
      if (!row.debtDetail.some((dd) => dd.id === id)) return row.month;
    }
    return null;
  }, [selectedPlan]);

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="lazyOnload"
      />

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${D.cardBorder}`, background: D.pageBg }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-7">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-1.5" style={{ color: D.textFaint }}>
                Financial Tool
              </p>
              <h1 className="text-2xl sm:text-[1.625rem] font-semibold tracking-tight leading-snug mt-1" style={{ color: D.textPrimary }}>
                Debt Settlement &amp; Savings Planner
              </h1>
              <p className="text-sm font-light mt-1.5 leading-relaxed" style={{ color: D.textMuted }}>
                Add income, expenses, and debts — compare Short, Medium, and Long plans that clear debt while building savings.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] shrink-0"
              style={{ border: `1px solid ${D.cardBorder}`, padding: '0.5rem 0.75rem', alignSelf: 'flex-start', marginTop: '4px', color: D.textFaint }}>
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

            <div className="mb-6">
              <label className={lblBase} htmlFor={`${uid}-currency`}>Currency</label>
              <select
                id={`${uid}-currency`}
                className={siBaseClass}
                style={{ ...siBaseStyle, cursor: 'pointer' }}
                value={currency}
                onChange={(e) => setCurrencyCode(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = D.inputFocus)}
                onBlur={(e)  => (e.target.style.borderColor = D.inputBorder)}
              >
                {Object.entries(CURRENCY_MAP).map(([code, { label }]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className={lblBase} htmlFor={`${uid}-income`}>Monthly Net Income</label>
              <AmountInput value={income} onChange={setIncome} prefix={sym} />
            </div>

            {/* Expenses */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase" style={{ color: D.textFaint }}>Monthly Expenses</p>
                <button
                  type="button"
                  onClick={addExpense}
                  className="inline-flex items-center gap-[0.3rem] text-[0.6875rem] font-bold tracking-[0.05em] uppercase bg-transparent border-none cursor-pointer p-0 transition-colors font-[Inter,sans-serif]"
                  style={{ color: D.textSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.color = D.textPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = D.textSecondary)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              {expenses.length === 0 ? (
                <p className="text-xs font-light py-3 text-center" style={{ color: D.textMuted }}>No expenses yet.</p>
              ) : (
                <div className="space-y-2">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={exp.name}
                        placeholder="Expense name"
                        onChange={(e) => updateExpense(exp.id, 'name', e.target.value)}
                        className={`${siBaseClass} flex-1`}
                        style={{ ...siBaseStyle, padding: '0.375rem 0.5rem' }}
                        onFocus={(e) => (e.target.style.borderColor = D.inputFocus)}
                        onBlur={(e)  => (e.target.style.borderColor = D.inputBorder)}
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
                        className="transition-colors bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
                        style={{ color: D.textFaint }}
                        onMouseEnter={e => (e.currentTarget.style.color = D.red)}
                        onMouseLeave={e => (e.currentTarget.style.color = D.textFaint)}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${D.sep}` }}>
                <span className="text-xs font-medium" style={{ color: D.textMuted }}>Total Expenses</span>
                <span className="text-xs font-semibold" style={{ color: D.textSecondary }}>{fmtC(totalExp, sym)}</span>
              </div>
            </div>

            <div className="mb-6 px-3 py-2.5" style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg }}>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium" style={{ color: D.textMuted }}>Free Cash Flow</span>
                <span className="text-sm font-semibold" style={{ color: fcf >= 0 ? D.green : D.red }}>
                  {fmtC(fcf, sym)}
                </span>
              </div>
              <p className="text-[10px] mt-1.5 font-light" style={{ color: D.textFaint }}>
                Split across debt payoff and savings in each plan.
              </p>
            </div>

            {/* Debts — no monthly payment */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase" style={{ color: D.textFaint }}>Loans &amp; Credit Cards</p>
                <button
                  type="button"
                  onClick={addDebt}
                  className="inline-flex items-center gap-[0.3rem] text-[0.6875rem] font-bold tracking-[0.05em] uppercase bg-transparent border-none cursor-pointer p-0 transition-colors font-[Inter,sans-serif]"
                  style={{ color: D.textSecondary }}
                  onMouseEnter={e => (e.currentTarget.style.color = D.textPrimary)}
                  onMouseLeave={e => (e.currentTarget.style.color = D.textSecondary)}
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Add
                </button>
              </div>

              {debts.length === 0 ? (
                <p className="text-xs font-light py-3 text-center" style={{ color: D.textMuted }}>No debts yet.</p>
              ) : (
                <div className="space-y-3">
                  {debts.map((debt) => {
                    const pct = debt.totalAmt > 0
                      ? Math.min(100, (debt.outstanding / debt.totalAmt) * 100)
                      : 0;
                    return (
                      <div key={debt.id} style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg, padding: '12px' }}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <input
                            type="text"
                            value={debt.name}
                            placeholder="Loan / Card name"
                            onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                            className={`${siBaseClass} flex-1`}
                            style={{ ...siBaseStyle, padding: '0.3rem 0.5rem', fontSize: '0.8125rem', fontWeight: 500 }}
                            onFocus={(e) => (e.target.style.borderColor = D.inputFocus)}
                            onBlur={(e)  => (e.target.style.borderColor = D.inputBorder)}
                          />
                          <button
                            type="button"
                            onClick={() => removeDebt(debt.id)}
                            className="transition-colors bg-transparent border-none cursor-pointer p-0 leading-none shrink-0"
                            style={{ color: D.textFaint }}
                            onMouseEnter={e => (e.currentTarget.style.color = D.red)}
                            onMouseLeave={e => (e.currentTarget.style.color = D.textFaint)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className={lblBase}>Total / Limit</label>
                            <AmountInput value={debt.totalAmt} onChange={(n) => updateDebt(debt.id, 'totalAmt', n)} prefix={sym} />
                          </div>
                          <div>
                            <label className={lblBase}>Outstanding</label>
                            <AmountInput value={debt.outstanding} onChange={(n) => updateDebt(debt.id, 'outstanding', n)} prefix={sym} />
                          </div>
                        </div>
                        <div className="mt-2.5 h-[3px] overflow-hidden" style={{ background: D.sep }}>
                          <div className="h-[3px] transition-all" style={{ width: `${pct.toFixed(1)}%`, background: D.textFaint }} />
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: D.textFaint }}>{Math.round(pct)}% outstanding</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={calculate}
              disabled={isCalc}
              className="w-full py-3 text-[0.8125rem] font-semibold tracking-[0.04em] uppercase cursor-pointer border-none transition-colors disabled:cursor-not-allowed font-[Inter,sans-serif]"
              style={{ borderRadius: 0, background: D.accent, color: '#fff', opacity: isCalc ? 0.7 : 1 }}
            >
              {isCalc ? 'Calculating…' : 'Calculate Plan'}
            </button>

            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={!result?.isViable || !selectedPlan || isDownloading}
              className="w-full mt-2 py-3 text-[0.8125rem] font-semibold tracking-[0.04em] uppercase cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-[Inter,sans-serif]"
              style={{ border: `1px solid ${D.cardBorderHi}`, borderRadius: 0, background: 'transparent', color: D.textSecondary }}
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

            <p className="text-[10px] mt-4 leading-relaxed font-light" style={{ color: D.textFaint }}>
              No monthly payment needed — the tool builds Short, Medium, and Long plans from your free cash flow.
              Debts paid lowest-balance-first. Interest not included.
            </p>
          </div>

          {/* ── RIGHT: Results ───────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {!result ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-12 h-12 flex items-center justify-center mb-4" style={{ border: `1px solid ${D.cardBorder}` }}>
                  <svg className="w-6 h-6" style={{ color: D.textFaint }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-light leading-relaxed" style={{ color: D.textMuted }}>
                  Fill in your details and click<br />
                  <strong className="font-medium" style={{ color: D.textSecondary }}>Calculate Plan</strong>.
                </p>
              </div>
            ) : !result.isViable ? (
              <div className="flex items-start gap-3 p-5" style={{ border: `1px solid ${D.redBorder}`, background: D.redBg }}>
                <svg className="w-5 h-5 shrink-0 mt-0.5" style={{ color: D.red }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: D.red }}>Cannot Build Plan</p>
                  <p className="text-sm font-light leading-relaxed" style={{ color: D.textMuted }}>{result.error}</p>
                </div>
              </div>
            ) : selectedPlan ? (
              <div>
                {/* Overview strip */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Free Cash Flow', value: fmtC(result.freeCashFlow, sym), sub: 'Income − expenses' },
                    { label: 'Total to Repay', value: fmtC(result.totalInitialDebt, sym), sub: 'Outstanding balances' },
                    { label: 'Debt-Free In', value: fmtMo(selectedPlan.debtFreeMonth), sub: `${selectedPlan.label} plan`, green: true },
                  ].map(({ label, value, sub, green }) => (
                    <div key={label} style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg, padding: '1rem 1.25rem' }}>
                      <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: D.textFaint }}>{label}</p>
                      <p className="text-2xl font-semibold leading-none mb-1.5" style={{ color: green ? D.green : D.textPrimary }}>{value}</p>
                      <p className="text-[11px] font-light" style={{ color: D.textMuted }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Short / Medium / Long plan cards */}
                <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: D.textFaint }}>
                  Choose a Plan
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {result.plans.map((plan) => {
                    const active = plan.horizon === selectedHorizon;
                    return (
                      <button
                        key={plan.horizon}
                        type="button"
                        onClick={() => plan.isViable && setSelectedHorizon(plan.horizon)}
                        disabled={!plan.isViable}
                        className="text-left cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          border: `1px solid ${active ? D.blue : D.cardBorder}`,
                          background: active ? 'rgba(37,99,235,0.12)' : D.cardBg,
                          padding: '1rem',
                          borderRadius: 0,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold" style={{ color: active ? D.blue : D.textPrimary }}>
                            {plan.label}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: D.textFaint }}>
                            {fmtPct(plan.debtPct)} / {fmtPct(plan.savingsPct)}
                          </span>
                        </div>
                        <p className="text-[11px] font-light leading-relaxed mb-3" style={{ color: D.textMuted }}>
                          {plan.description}
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span style={{ color: D.textFaint }}>Debt budget</span>
                            <span className="font-mono" style={{ color: D.textSecondary }}>{fmtC(plan.monthlyDebtBudget, sym)}/mo</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span style={{ color: D.textFaint }}>Savings</span>
                            <span className="font-mono" style={{ color: D.green }}>{fmtC(plan.monthlySavings, sym)}/mo</span>
                          </div>
                          <div className="flex justify-between text-[11px] pt-1.5" style={{ borderTop: `1px solid ${D.sep}` }}>
                            <span style={{ color: D.textFaint }}>Debt-free</span>
                            <span className="font-semibold" style={{ color: D.green }}>{fmtMo(plan.debtFreeMonth)}</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span style={{ color: D.textFaint }}>Saved by then</span>
                            <span className="font-mono" style={{ color: D.textSecondary }}>{fmtC(plan.totalSavedByDebtFree, sym)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected plan detail metrics */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Monthly to Debt', value: fmtC(selectedPlan.monthlyDebtBudget, sym), sub: `${fmtPct(selectedPlan.debtPct)} of free cash flow` },
                    { label: 'Monthly Savings', value: fmtC(selectedPlan.monthlySavings, sym), sub: `${fmtPct(selectedPlan.savingsPct)} of free cash flow`, green: true },
                    { label: 'Debt-Free In', value: fmtMo(selectedPlan.debtFreeMonth), sub: selectedPlan.debtFreeMonth ? `Month ${selectedPlan.debtFreeMonth}` : '—', green: true },
                    { label: 'Total Saved', value: fmtC(selectedPlan.totalSavedByDebtFree, sym), sub: 'By debt-free date', green: true },
                  ].map(({ label, value, sub, green }) => (
                    <div key={label} style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg, padding: '1rem 1.25rem' }}>
                      <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-2" style={{ color: D.textFaint }}>{label}</p>
                      <p className="text-xl font-semibold leading-none mb-1.5" style={{ color: green ? D.green : D.textPrimary }}>{value}</p>
                      <p className="text-[11px] font-light" style={{ color: D.textMuted }}>{sub}</p>
                    </div>
                  ))}
                </div>

                {/* Payoff order */}
                <div className="mb-6" style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg, padding: '1rem 1.25rem' }}>
                  <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-3" style={{ color: D.textFaint }}>
                    Payoff Order <span className="font-normal normal-case tracking-normal">— lowest balance first · {selectedPlan.label} plan</span>
                  </p>
                  {debts
                    .filter((d) => d.outstanding > 0)
                    .slice()
                    .sort((a, b) => a.outstanding - b.outstanding)
                    .map((d) => {
                      const mo = payoffMonth(d.id);
                      const pct = d.totalAmt > 0 ? Math.min(100, (d.outstanding / d.totalAmt) * 100) : 0;
                      return (
                        <div key={d.id} className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: `1px solid ${D.sep}` }}>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate" style={{ color: D.textSecondary }}>{d.name || 'Unnamed debt'}</p>
                            <div className="mt-1 h-[3px] overflow-hidden" style={{ width: '100%', background: D.sep }}>
                              <div className="h-[3px] transition-all" style={{ width: `${pct.toFixed(1)}%`, background: D.textFaint }} />
                            </div>
                            <p className="text-[10px] mt-0.5" style={{ color: D.textMuted }}>{fmtC(d.outstanding, sym)} of {fmtC(d.totalAmt, sym)}</p>
                          </div>
                          <div className="text-right shrink-0">
                            {mo ? (
                              <p className="text-[11px] font-semibold" style={{ color: D.green }}>Paid off mo. {mo}</p>
                            ) : (
                              <p className="text-[11px]" style={{ color: D.textFaint }}>—</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Month-by-month runway */}
                <div style={{ border: `1px solid ${D.cardBorder}`, background: D.cardBg }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: `1px solid ${D.sep}` }}>
                    <p className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase mb-[2px]" style={{ color: D.textFaint }}>
                      Month-by-Month Runway
                    </p>
                    <p className="text-[11px] font-light" style={{ color: D.textMuted }}>
                      {selectedPlan.label} plan · {selectedPlan.runway.length} months · {fmtC(selectedPlan.monthlySavings, sym)}/mo saved
                    </p>
                  </div>
                  <div style={{ overflow: 'auto', maxHeight: '480px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '520px' }}>
                      <thead>
                        <tr>
                          {['Mo.', 'Status', 'Outstanding', 'Paid Down', 'To Debt', 'Saved'].map((h, i) => (
                            <th key={h} style={{
                              padding: '0.625rem 1rem', fontSize: '0.5625rem', fontWeight: 700,
                              letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textFaint,
                              background: D.cardBgAlt, borderBottom: `1px solid ${D.cardBorderHi}`,
                              whiteSpace: 'nowrap', position: 'sticky', top: 0, zIndex: 2,
                              textAlign: 'left',
                              paddingLeft: i === 0 ? '1rem' : undefined,
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPlan.runway.map((row) => {
                          const pct = result.totalInitialDebt > 0
                            ? Math.max(0, 100 - (row.totalOut / result.totalInitialDebt) * 100)
                            : 100;
                          return (
                            <tr key={row.month}
                              style={row.pivotMonth
                                ? { background: 'rgba(74,222,128,0.06)', borderLeft: `3px solid ${D.green}` }
                                : undefined}
                            >
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}`, fontFamily: 'monospace', color: D.textMuted, width: '52px' }}>{row.month}</td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}` }}>
                                {row.pivotMonth ? (
                                  <span style={{ display: 'inline-block', padding: '1px 6px', background: D.green, color: D.greenDark, fontSize: '8px', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                                    PAID OFF
                                  </span>
                                ) : (
                                  <span className="text-xs" style={{ color: D.textMuted }}>{row.debtCount} active</span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}` }}>
                                {row.totalOut > 0.5 ? (
                                  <span className="font-mono" style={{ color: D.textSecondary }}>{fmtC(row.totalOut, sym)}</span>
                                ) : (
                                  <span className="font-mono font-semibold" style={{ color: D.green }}>{fmtC(0, sym)}</span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}`, width: '100px' }}>
                                <div style={{ height: '3px', background: D.sep, width: '80px', overflow: 'hidden' }}>
                                  <div style={{ height: '3px', background: D.green, width: `${pct.toFixed(1)}%` }} />
                                </div>
                              </td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}`, fontFamily: 'monospace', color: D.textMuted }}>{fmtC(row.payment, sym)}</td>
                              <td style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderBottom: `1px solid ${D.sep}`, fontFamily: 'monospace', color: D.green }}>{fmtC(row.savingsTotal, sym)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Hidden PDF content ────────────────────────────────────────────────── */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        {result?.isViable && selectedPlan && (
          <PdfContent
            result={result}
            plan={selectedPlan}
            debts={debts}
            expenses={expenses}
            income={income}
            currency={currency}
            sym={sym}
          />
        )}
      </div>
    </>
  );
}

// ── PDF content ────────────────────────────────────────────────────────────────
function PdfContent({
  result, plan, debts, expenses, income, currency, sym,
}: {
  result: MultiPlanResult;
  plan: PlanResult;
  debts: Debt[];
  expenses: Expense[];
  income: number;
  currency: string;
  sym: string;
}) {
  const totalDebt = debts.reduce((s, d) => s + d.outstanding, 0);
  const sortedDebts = [...debts].filter((d) => d.outstanding > 0).sort((a, b) => a.outstanding - b.outstanding);

  const payoffMo = (id: string): number | null => {
    for (const row of plan.runway) {
      if (!row.debtDetail.some((dd) => dd.id === id)) return row.month;
    }
    return null;
  };

  const shownRows = plan.runway.slice(0, 48);

  return (
    <div style={{
      width: '794px', padding: '48px 56px',
      fontFamily: 'Inter, sans-serif', fontSize: '11px',
      color: '#0f172a', background: '#fff', lineHeight: '1.5',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px' }}>
            Debt Settlement &amp; Savings Plan — {plan.label}
          </h1>
          <p style={{ color: '#64748b', fontSize: '10px', margin: '2px 0 0' }}>Generated by NexusDigitalLabs · nexusdigitallabs.dev</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '10px', color: '#64748b' }}>
          <div>{todayStr()}</div>
          <div>Currency: {currency} ({sym})</div>
          <div>{fmtPct(plan.debtPct)} debt · {fmtPct(plan.savingsPct)} savings</div>
        </div>
      </div>

      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Summary</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        {[
          { lbl: 'Monthly Income', val: fmtC(income, sym), green: false },
          { lbl: 'Free Cash Flow', val: fmtC(result.freeCashFlow, sym), green: false },
          { lbl: 'Debt-Free In', val: fmtMo(plan.debtFreeMonth), green: true },
          { lbl: 'Saved by Then', val: fmtC(plan.totalSavedByDebtFree, sym), green: true },
        ].map(({ lbl, val, green }) => (
          <div key={lbl} style={{ border: '1px solid #e2e8f0', padding: '10px 12px' }}>
            <div style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '4px' }}>{lbl}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: green ? '#16a34a' : '#0f172a' }}>{val}</div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>All Plan Options</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            {['Plan', 'To Debt', 'To Savings', 'Debt-Free', 'Saved by Then'].map((h, i) => (
              <th key={h} style={{ padding: '5px 8px', fontSize: '8px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #0f172a', textAlign: i === 0 ? 'left' : 'right' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.plans.map((p) => (
            <tr key={p.horizon} style={p.horizon === plan.horizon ? { background: '#eff6ff', fontWeight: 600 } : undefined}>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px' }}>
                {p.label}{p.horizon === plan.horizon ? ' ★' : ''}
              </td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(p.monthlyDebtBudget, sym)}/mo</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(p.monthlySavings, sym)}/mo</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtMo(p.debtFreeMonth)}</td>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(p.totalSavedByDebtFree, sym)}</td>
            </tr>
          ))}
        </tbody>
      </table>

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

      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>Loans &amp; Credit Cards</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            {['Name', 'Total / Limit', 'Outstanding', 'Paid Off'].map((h, i) => (
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
                <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{mo ? `Month ${mo}` : '—'}</td>
              </tr>
            );
          })}
          <tr style={{ fontWeight: 700, borderTop: '2px solid #0f172a' }}>
            <td style={{ padding: '5px 8px', fontSize: '10px' }}>Total</td>
            <td style={{ padding: '5px 8px', fontSize: '10px' }} />
            <td style={{ padding: '5px 8px', fontSize: '10px', textAlign: 'right' }}>{fmtC(totalDebt, sym)}</td>
            <td />
          </tr>
        </tbody>
      </table>

      <h2 style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#64748b', margin: '20px 0 8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        Month-by-Month Runway ({plan.label}){plan.runway.length > 48 ? ` — first 48 of ${plan.runway.length}` : ''}
      </h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px' }}>
        <thead>
          <tr>
            {['Month', 'Status', 'Outstanding', 'To Debt', 'Cumulative Saved'].map((h, i) => (
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
              <td style={{ padding: '5px 8px', borderBottom: '1px solid #f1f5f9', fontSize: '10px', textAlign: 'right' }}>{fmtC(row.savingsTotal, sym)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {plan.runway.length > 48 && (
        <p style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px' }}>… and {plan.runway.length - 48} more months not shown.</p>
      )}

      <div style={{ marginTop: '32px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', fontSize: '9px', color: '#94a3b8' }}>
        This plan is generated for informational purposes only and does not account for interest accrual.
        Actual payoff timelines may vary. All data is processed locally in your browser — no information is transmitted or stored.
      </div>
    </div>
  );
}
