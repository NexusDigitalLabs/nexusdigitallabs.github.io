import DebtOptimizerClient from '@/components/tools/DebtOptimizerClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
  description:
    'Compare Short, Medium, and Long debt payoff plans that also build savings. Enter income, expenses, and balances — no monthly payment required. Free, 100% client-side, with PDF export.',
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
    'Short, Medium, and Long plans that clear debt while building savings. No monthly payment fields — just income, expenses, and balances.',
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
              The Debt Settlement &amp; Savings Planner is a free, browser-based tool that builds three ways to become debt-free while still putting money into savings. Enter your monthly income, living expenses, and debt balances — you do not need to know or enter monthly payments for credit cards or loans. The tool calculates free cash flow, then generates Short, Medium, and Long plans that split that surplus between debt payoff and savings.
            </p>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
              Debts are cleared with the snowball method (lowest balance first). Pick the plan that fits your comfort level, review the month-by-month runway, and download a PDF that includes all three options plus the selected schedule.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">How to use it</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-5">Building your debt payoff plan</h2>
            <ol className="space-y-4 text-sm sm:text-base text-slate-400 font-light">
              {[
                ['Enter your monthly income', 'Input your take-home (after-tax) income. If income varies, use a conservative average.'],
                ['Add your monthly expenses', 'List living costs — rent, utilities, groceries, subscriptions. Use + to add as many categories as you need.'],
                ['Add your debts', 'For each credit card or loan, enter a name, total amount / limit, and outstanding balance. No monthly payment required — the planner decides how much to put toward debt each month.'],
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
                { q: 'Why is there no monthly payment field?', a: 'The planner builds the payment plan for you. It takes whatever free cash flow remains after expenses and splits it between debts and savings according to Short (90/10), Medium (70/30), or Long (50/50). You only need outstanding balances.' },
                { q: 'What do Short, Medium, and Long mean?', a: 'Short puts most surplus toward debt so you clear balances faster with a small savings buffer. Medium balances both. Long puts half toward savings so you build a larger cushion while debt takes longer to clear.' },
                { q: 'What debt payoff method does this tool use?', a: 'Within each plan’s debt budget, the tool uses the snowball method — lowest outstanding balance first — then rolls that capacity into the next debt. That builds early wins and keeps the plan easy to follow.' },
                { q: 'Is my financial data stored anywhere?', a: 'No. All calculations happen entirely in your browser. No data is transmitted to any server or stored in a database. You can verify this with your browser’s network inspector.' },
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

          <div className="pt-6 border-t border-slate-800/40">
            <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-4">Related reading</p>
            <a href="/articles/avalanche-vs-snowball-debt-payoff/" className="text-sm text-sky-400 hover:text-sky-300 transition-colors no-underline">
              Avalanche vs Snowball: Which Debt Payoff Method Saves More? →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
