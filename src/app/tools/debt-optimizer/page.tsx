import type { Metadata } from 'next';
import DebtOptimizerClient from '@/components/tools/DebtOptimizerClient';

export const metadata: Metadata = {
  title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
  description:
    'Simple, free debt payoff planner. Add your income, monthly expenses, and debts to see your debt-free date and a month-by-month repayment runway. Download as PDF. 100% client-side.',
  keywords: [
    'debt payoff calculator',
    'debt free planner',
    'loan payoff',
    'credit card payoff',
    'debt settlement',
    'monthly budget',
    'financial planner',
    'NexusDigitalLabs',
  ],
  alternates: { canonical: 'https://nexusdigitallabs.dev/tools/debt-optimizer/' },
  openGraph: {
    type: 'website',
    url: 'https://nexusdigitallabs.dev/tools/debt-optimizer/',
    title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
    description:
      'See your debt-free date with a month-by-month repayment plan. Add expenses, loans, and credit cards. Download as PDF.',
    images: [{ url: 'https://nexusdigitallabs.dev/og-image.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Debt Settlement & Savings Planner — NexusDigitalLabs',
    description: 'See your debt-free date with a month-by-month repayment plan. Download as PDF.',
    images: ['https://nexusdigitallabs.dev/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Debt Settlement & Savings Planner',
  url: 'https://nexusdigitallabs.dev/tools/debt-optimizer/',
  description: 'Simple browser-based debt payoff planner with PDF export.',
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
              The Debt Settlement &amp; Savings Planner is a free, browser-based tool that helps you build a month-by-month plan to eliminate debt and grow savings simultaneously. Enter your monthly income, recurring expenses, and debts — the tool calculates how much free cash flow you have available, applies it intelligently to your debts using the snowball method, and generates a detailed payoff timeline.
            </p>
            <p className="text-slate-400 font-light leading-relaxed text-sm sm:text-base">
              Once your debts are cleared, the plan automatically pivots that same monthly budget into a savings target. The complete plan can be downloaded as a PDF for offline reference or sharing with a financial advisor.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-widest text-sky-400 uppercase mb-4">How to use it</p>
            <h2 className="text-2xl font-light text-white tracking-tight mb-5">Building your debt payoff plan</h2>
            <ol className="space-y-4 text-sm sm:text-base text-slate-400 font-light">
              {[
                ['Enter your monthly income', 'Input your total take-home (after-tax) income per month. If your income varies, use a conservative average.'],
                ['Add your monthly expenses', 'List your fixed living costs — rent, utilities, groceries, subscriptions. Click the + button to add as many categories as needed.'],
                ['Add your debts', 'For each debt, enter the name, outstanding balance, and minimum monthly payment. Debts can be credit cards, personal loans, car loans, or any other obligation.'],
                ['Set your savings goal', 'Enter a monthly savings target for after your debts are cleared. The tool will show when you reach it based on your projected payoff timeline.'],
                ['Review your plan', 'The tool displays your monthly free cash flow, the order in which debts will be eliminated, and a month-by-month runway. Adjust inputs to model different scenarios.'],
                ['Download your PDF', 'Click "Download PDF Summary" to save a portable copy of your plan including the full payoff schedule.'],
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
                { q: 'What debt payoff method does this tool use?', a: 'The tool uses the snowball method — it targets the smallest outstanding balance first, then rolls those payments into the next debt. This approach builds momentum and is shown to improve follow-through compared to mathematically optimal but psychologically harder strategies.' },
                { q: 'Is my financial data stored anywhere?', a: 'No. All calculations happen entirely in your browser. No data is transmitted to any server, stored in any database, or accessible to anyone other than you. You can verify this by checking your browser\'s network inspector — no outbound requests are made.' },
                { q: 'What if I have more expenses than income?', a: 'The tool will display a warning indicating that your expenses exceed your income and a debt payoff plan cannot be calculated. In this case, review your expense list and identify areas to reduce before proceeding.' },
                { q: 'Can I model different scenarios?', a: 'Yes. Change any input — income, an expense amount, a debt balance — and the plan updates instantly. You can model the impact of a pay rise, cutting a subscription, or making an extra lump-sum payment by adjusting the corresponding field.' },
                { q: 'What happens to the savings pivot?', a: 'Once all debts are eliminated, the tool shows a savings projection starting from that month. The same monthly budget that was going to debt minimum payments is redirected to savings. This is the "pivot point" — the month your financial posture fundamentally changes.' },
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
