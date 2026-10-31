'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { SITE_URL } from '@/lib/seo';
import {
  CLASS_MANAGER,
  INCLUDED_FEATURES,
  MODULES,
  PRICING,
  basePrice,
  buildQuote,
  defaultSelection,
  formatLine,
  formatLkr,
  moduleMonthly,
  quoteText,
  tierName,
  type Billing,
  type ClientType,
  type PricedOption,
  type QuoteLine,
} from '@/lib/class-manager-pricing';

const DEMO_PATH = '/p/class-manager/demo/';
const focus = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ndl-accent)]';
const card = 'rounded-xl border border-[var(--ndl-border)] bg-[var(--ndl-surface)]';
const numberInput =
  'w-28 rounded-lg border border-[var(--ndl-input-border)] bg-[var(--ndl-input-bg)] px-3 py-2 font-mono text-base text-[var(--ndl-text)] tabular-nums ' +
  focus;

const CLIENT_TYPES: Array<{ value: ClientType; title: string; desc: string }> = [
  { value: 'tutor', title: 'Individual tutor', desc: 'Online or small physical classes, one teacher' },
  { value: 'institute', title: 'Institute', desc: 'Several teachers, halls and counter staff' },
];

export default function QuoteBuilderClient() {
  const [clientType, setClientType] = useState<ClientType>('tutor');
  const [selection, setSelection] = useState(() => defaultSelection('tutor'));
  const [billing, setBilling] = useState<Billing>('monthly');
  const { copied, copy } = useCopyToClipboard(3000);

  const input = { clientType, billing, ...selection };
  const quote = buildQuote(input);
  const demoUrl = `${SITE_URL}${DEMO_PATH}`;
  const yearlyWaivesSetup = PRICING.fixedSetup[clientType].waivedWhenYearly;

  function chooseType(type: ClientType) {
    setClientType(type);
    setSelection(defaultSelection(type));
  }

  function setStudents(value: number) {
    const students = Math.max(1, Math.min(5000, Math.round(value) || 1));
    setSelection((s) => ({ ...s, students }));
  }

  function toggleModule(id: string) {
    setSelection((s) => ({
      ...s,
      moduleIds: s.moduleIds.includes(id) ? s.moduleIds.filter((x) => x !== id) : [...s.moduleIds, id],
    }));
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className={`${card} divide-y divide-[var(--ndl-border)] px-5 sm:px-7`}>
        <Step n={1} title="Who is it for?">
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Client type">
            {CLIENT_TYPES.map((t) => (
              <label
                key={t.value}
                className={`cursor-pointer rounded-lg border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ndl-accent)] ${
                  clientType === t.value
                    ? 'border-[var(--ndl-accent)] bg-[var(--ndl-accent)]/10'
                    : 'border-[var(--ndl-border)] hover:border-[var(--ndl-border-soft)]'
                }`}
              >
                <input
                  type="radio"
                  name="client-type"
                  id={`client-type-${t.value}`}
                  className="sr-only"
                  checked={clientType === t.value}
                  onChange={() => chooseType(t.value)}
                />
                <span className="block font-semibold text-[var(--ndl-text)]">{t.title}</span>
                <span className="text-sm text-[var(--ndl-muted)]">{t.desc}</span>
              </label>
            ))}
          </div>
        </Step>

        <Step n={2} title="How many students?" hint="Count students enrolled in at least one class in a month. You only pay for active students.">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="range"
              id="students-range"
              aria-label="Active students"
              min={10}
              max={1500}
              step={10}
              value={Math.min(1500, selection.students)}
              onChange={(e) => setStudents(+e.target.value)}
              className="min-w-48 flex-1 accent-[var(--ndl-accent)]"
            />
            <input
              type="number"
              id="students"
              aria-label="Active students"
              min={1}
              max={5000}
              value={selection.students}
              onChange={(e) => setStudents(+e.target.value)}
              className={numberInput}
            />
          </div>
          <p className="mt-3 text-sm text-[var(--ndl-muted)]">
            <span className="font-semibold text-[var(--ndl-text)]">{tierName(selection.students)} plan</span> ·
            platform fee {formatLkr(basePrice(selection.students))} per month
            {selection.students <= 100 && ' (flat, up to 100 students)'}
          </p>
        </Step>

        <Step n={3} title="Included in every plan">
          <ul className="flex flex-wrap gap-2">
            {INCLUDED_FEATURES.map((f) => (
              <li key={f} className="rounded-full bg-[var(--ndl-surface-2)] px-3 py-1 text-sm text-[var(--ndl-text-secondary)]">
                <span className="mr-1 font-bold text-emerald-500" aria-hidden="true">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-[var(--ndl-faint)]">{CLASS_MANAGER.fairUse}</p>
        </Step>

        <Step n={4} title="Choose your features" hint="We've ticked the usual picks for your type. Change anything.">
          <div className="grid gap-2">
            {MODULES.map((m) => (
              <OptionRow key={m.id} option={m} monthly={moduleMonthly(m, selection.students)} idPrefix="module" checked={selection.moduleIds.includes(m.id)} onToggle={() => toggleModule(m.id)} />
            ))}
          </div>
        </Step>

      </div>

      <aside id="quote" aria-live="polite" className={`${card} border-[var(--ndl-text)]/40 p-6 lg:sticky lg:top-6`}>
        <h2 className="text-lg font-semibold text-[var(--ndl-text)]">Your quote</h2>
        <p className="mb-4 text-sm text-[var(--ndl-muted)]">
          {clientType === 'tutor' ? 'Individual tutor' : 'Institute'} · {selection.students.toLocaleString('en-LK')} active students
        </p>

        <div className="mb-5 grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--ndl-border)] text-sm font-semibold" role="radiogroup" aria-label="Billing">
          {(['monthly', 'yearly'] as const).map((b) => (
            <label
              key={b}
              className={`cursor-pointer px-2 py-2 text-center has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ndl-accent)] ${
                billing === b ? 'bg-[var(--ndl-accent)] ndl-on-accent' : 'text-[var(--ndl-muted)]'
              }`}
            >
              <input type="radio" name="billing" id={`billing-${b}`} className="sr-only" checked={billing === b} onChange={() => setBilling(b)} />
              {b === 'monthly' ? 'Pay monthly' : 'Pay yearly · 2 months free'}
            </label>
          ))}
        </div>

        <Lines title="Monthly" lines={quote.monthlyLines} />
        <Lines title="One-time set-up" lines={quote.setupLines} />

        <dl className="mt-5 grid gap-2">
          <Total
            big
            label={billing === 'yearly' ? 'Per year (10 months charged)' : 'Per month'}
            value={formatLkr(billing === 'yearly' ? quote.yearlyTotal : quote.monthlyTotal)}
          />
          <Total label="One-time set-up" value={formatLkr(quote.setupTotal)} />
          <Total label="First year, all in" value={formatLkr(quote.firstYearTotal)} />
        </dl>
        <p className="mt-3 text-xs text-[var(--ndl-muted)]">
          About {formatLkr(quote.perStudent)} per student per month.{' '}
          {billing === 'yearly'
            ? `Paying yearly saves ${formatLkr(quote.yearlySaving)}${yearlyWaivesSetup ? ' and the set-up fee' : ''}.`
            : `Pay yearly to get 2 months free${yearlyWaivesSetup ? ' and no set-up fee' : ''}.`}
        </p>
        {quote.clientPays.length > 0 && (
          <div className="mt-4 rounded-lg border border-[var(--ndl-border)] p-3">
            <p className="text-xs font-semibold text-[var(--ndl-text)]">Paid by you directly, not included above</p>
            <ul className="mt-1.5 grid gap-1 text-xs text-[var(--ndl-muted)]">
              {quote.clientPays.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 grid gap-2">
          <button
            type="button"
            onClick={() => copy(quoteText(input, quote, demoUrl))}
            className={`rounded-lg bg-[var(--ndl-accent)] px-4 py-2.5 text-sm font-semibold ndl-on-accent hover:opacity-90 ${focus}`}
          >
            {copied ? 'Quote copied. Paste it into WhatsApp or email.' : 'Copy quote to send'}
          </button>
          <Link
            href={DEMO_PATH}
            className={`rounded-lg border border-[var(--ndl-accent)] px-4 py-2.5 text-center text-sm font-semibold text-[var(--ndl-accent)] hover:bg-[var(--ndl-accent)]/10 ${focus}`}
          >
            See how the system works
          </Link>
        </div>
        <p className="mt-5 text-sm text-[var(--ndl-muted)]">
          Questions?{' '}
          <a href={`mailto:${CLASS_MANAGER.contactEmail}`} className={`break-all font-medium text-[var(--ndl-accent)] underline underline-offset-4 ${focus}`}>
            {CLASS_MANAGER.contactEmail}
          </a>
        </p>
        <p className="mt-3 text-xs text-[var(--ndl-faint)]">{CLASS_MANAGER.priceReview}</p>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between bg-[var(--ndl-text)] px-4 py-3 text-sm text-[var(--ndl-bg)] lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <span>
          Per month <b className="ml-1 font-mono text-base tabular-nums">{formatLkr(quote.monthlyTotal)}</b>
        </span>
        <a href="#quote" className={`font-semibold underline underline-offset-4 ${focus}`}>
          See quote
        </a>
      </div>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: number; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-xs text-[var(--ndl-accent)]">{String(n).padStart(2, '0')}</span>
        <h2 className="text-lg font-semibold text-[var(--ndl-text)]">{title}</h2>
      </div>
      {hint && <p className="mb-4 text-sm text-[var(--ndl-muted)]">{hint}</p>}
      {children}
    </section>
  );
}

function OptionRow({
  option,
  monthly,
  idPrefix,
  checked,
  onToggle,
}: {
  option: PricedOption;
  monthly: number;
  idPrefix: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={`grid cursor-pointer grid-cols-[20px_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border-2 px-4 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--ndl-accent)] ${
        checked ? 'border-[var(--ndl-accent)] bg-[var(--ndl-accent)]/10' : 'border-[var(--ndl-border)] hover:border-[var(--ndl-border-soft)]'
      }`}
    >
      <input type="checkbox" id={`${idPrefix}-${option.id}`} checked={checked} onChange={onToggle} className="mt-1 h-4 w-4 accent-[var(--ndl-accent)]" />
      <span className="min-w-0">
        <span className="block font-medium text-[var(--ndl-text)]">{option.name}</span>
        <span className="text-sm text-[var(--ndl-muted)]">{option.desc}</span>
      </span>
      <span className="text-right font-mono text-sm tabular-nums text-[var(--ndl-text)]">
        {monthly > 0 && (
          <span className="block">
            {formatLkr(monthly)}
            <span className="block font-sans text-[11px] text-[var(--ndl-muted)]">
              {option.perStudent ? `per month · LKR ${option.perStudent} a student` : 'per month'}
            </span>
          </span>
        )}
        {option.setup > 0 && (
          <span className="block">
            {monthly > 0 && '+ '}
            {formatLkr(option.setup)}
            <span className="block font-sans text-[11px] text-[var(--ndl-muted)]">one-time</span>
          </span>
        )}
      </span>
    </label>
  );
}

function Lines({ title, lines }: { title: string; lines: QuoteLine[] }) {
  return (
    <div className="mt-4">
      <p className="mb-1 text-[11px] font-semibold tracking-[0.08em] uppercase text-[var(--ndl-muted)]">{title}</p>
      <ul className="text-sm">
        {lines.map((l) => (
          <li key={l.name} className="flex justify-between gap-3 border-b border-dashed border-[var(--ndl-border)] py-1.5">
            <span className="text-[var(--ndl-text-secondary)]">
              {l.name}
              {l.fixed && <span className="ml-1 text-[11px] text-[var(--ndl-faint)]">· fixed</span>}
            </span>
            <span className="whitespace-nowrap font-mono tabular-nums text-[var(--ndl-text)]">{formatLine(l)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Total({ label, value, big = false }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-sm text-[var(--ndl-muted)]">{label}</dt>
      <dd className={`font-mono tabular-nums ${big ? 'text-2xl font-bold text-[var(--ndl-accent)]' : 'text-base text-[var(--ndl-text)]'}`}>{value}</dd>
    </div>
  );
}
