import DebtOptimizerClient from '@/components/tools/DebtOptimizerClient';
import AdSlot from '@/components/AdSlot';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
  description:
    'Compare Short, Medium, and Long debt payoff plans that also build savings. Enter income, expenses, balances, and minimum payments. Free, 100% client-side, with PDF export.',
  path: '/tools/debt-optimizer/',
  keywords: [
    'debt payoff calculator',
    'debt free planner',
    'short medium long debt plan',
    'credit card payoff',
    'debt settlement',
    'savings while paying debt',
    'snowball method',
    'NexusDigitalLabs',
  ],
  absoluteTitle: true,
  ogDescription:
    'Short, Medium, and Long plans that clear debt while building savings. Pays required minimums first, then snowball extra.',
});

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Debt Settlement & Savings Planner',
  url: 'https://nexusdigitallabs.dev/tools/debt-optimizer/',
  description:
    'Browser-based debt planner with Short, Medium, and Long payoff-and-savings strategies and PDF export.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export default function DebtOptimizerPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DebtOptimizerClient />

      {/* ── SEO content ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-800/50 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 space-y-12">
          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">About this tool</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-4">What is the Debt Settlement &amp; Savings Planner?</h2>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mb-3">
              The Debt Settlement &amp; Savings Planner is a free, browser-based tool that builds three ways to become debt-free while still putting money into savings. Enter your monthly income, living expenses, debt balances, and required minimum payments for each credit card or loan. The tool calculates free cash flow, pays all minimums every month, then applies snowball extra to the lowest balance. Short, Medium, and Long plans split remaining surplus between faster payoff and savings.
            </p>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
              Debts are cleared with the snowball method (lowest balance first). Pick the plan that fits your comfort level, review the month-by-month runway, and download a PDF that includes all three options plus the selected schedule.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">Technical guide</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-4">
              Debt Snowball vs Debt Avalanche — the math
            </h2>
            <h3 className="text-lg font-medium text-slate-200 tracking-tight mb-3">
              How each method orders your payments
            </h3>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mb-4">
              Both methods start the same way: every month you pay the required minimum on every debt. What differs is where
              the leftover “extra” goes after those minimums.
            </p>
            <ul className="list-disc pl-5 space-y-3 text-sm sm:text-base text-slate-400 font-light mb-4">
              <li>
                <strong className="text-slate-200 font-medium">Snowball</strong> orders debts by{' '}
                <em>lowest remaining balance first</em>. Extra cash clears the smallest balance, then rolls into the next.
                Interest paid over the full schedule is often higher than Avalanche, but early “wins” can make the plan
                easier to stick with — especially on irregular freelance income.
              </li>
              <li>
                <strong className="text-slate-200 font-medium">Avalanche</strong> orders by{' '}
                <em>highest interest rate (APR) first</em>. Extra cash attacks the costliest debt. Mathematically this usually
                minimizes total interest if you never miss a payment and rates are accurate.
              </li>
            </ul>
            <h3 className="text-lg font-medium text-slate-200 tracking-tight mb-3">
              What this planner computes
            </h3>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base mb-4">
              Free cash flow = income − living expenses. After funding all minimums, remaining surplus is split between
              debt payoff and savings according to Short / Medium / Long. Within the debt budget, this tool applies{' '}
              <strong className="text-slate-200 font-medium">snowball ordering</strong> (lowest balance first). Use the
              article below if you want a full Avalanche-vs-Snowball comparison with worked examples before you choose a plan.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">How to use it</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-5">Building your debt payoff plan</h2>
            <ol className="space-y-4 text-sm sm:text-base text-slate-400 font-light">
              {[
                ['Enter your monthly income', 'Input your take-home (after-tax) income. If income varies, use a conservative average.'],
                ['Add your monthly expenses', 'List living costs — rent, utilities, groceries, subscriptions. Use + to add as many categories as you need.'],
                ['Add your debts', 'For each credit card or loan, enter a name, total amount / limit, outstanding balance, and minimum monthly payment. Credit cards auto-suggest ~5% of the balance when the name includes “card”.'],
                ['Calculate and compare plans', 'Click Calculate Plan to see Short (aggressive), Medium (balanced), and Long (more savings) side by side — each with debt-free date and savings by that date.'],
                ['Select a plan and review the runway', 'Choose the plan that fits you. Review payoff order and the month-by-month table showing debt payments and cumulative savings.'],
                ['Download your PDF', 'Export the selected plan plus a comparison of all three options for offline use or sharing.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <div>
                    <p className="font-medium text-slate-200 mb-1">{title}</p>
                    <p className="text-slate-400 font-light">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">FAQ</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-6">Frequently asked questions</h2>
            <div className="space-y-6">
              {[
                { q: 'How are credit card minimum payments handled?', a: 'Enter the minimum shown on your statement, or use the suggested figure for cards (~2.5% of balance or a typical issuer floor — a rough planning estimate only). Every month the plan pays all minimums first, then snowball extra toward the lowest balance.' },
                { q: 'What do Short, Medium, and Long mean?', a: 'Short puts most surplus toward debt so you clear balances faster with a small savings buffer. Medium balances both. Long puts half toward savings so you build a larger cushion while debt takes longer to clear.' },
                { q: 'What debt payoff method does this tool use?', a: 'Within each plan’s debt budget, the tool uses the snowball method — lowest outstanding balance first — then rolls that capacity into the next debt. That builds early wins and keeps the plan easy to follow.' },
                { q: 'Is my financial data stored anywhere?', a: 'By default, all planning stays in your browser. If you sign in and enable Cloud draft, a copy of the form is stored under your account so you can resume later — you can turn that off anytime. See the Privacy Policy for details.' },
                { q: 'What if I have more expenses than income?', a: 'The tool shows a warning and will not build plans until free cash flow is positive. Review expenses or income before continuing.' },
                { q: 'Can I model different scenarios?', a: 'Yes. Change income, expenses, or balances and recalculate. Switch between Short, Medium, and Long without re-entering debts to compare timelines and savings side by side.' },
              ].map(({ q, a }) => (
                <div key={q} className="border-l-2 border-slate-700 pl-5">
                  <p className="text-sm font-semibold text-slate-200 mb-2">{q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/40 space-y-4">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">Related reading</p>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              Confused about strategies? Read our complete personal finance breakdown:{' '}
              <a href="/articles/avalanche-vs-snowball-debt-payoff/" className="text-sky-400 hover:text-sky-300 transition-colors underline-offset-4 hover:underline">
                Avalanche vs Snowball: Which Debt Payoff Method Saves More?
              </a>
              .
            </p>
            <p className="text-xs text-slate-500 font-light leading-relaxed border-l-2 border-slate-700 pl-4">
              Not financial advice. This planner is an educational calculator for personal scenarios you enter yourself.
              It does not recommend products, guarantee outcomes, or replace a licensed adviser.
            </p>
          </div>
        </div>
      </section>

      <AdSlot slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOLS} />
    </>
  );
}
