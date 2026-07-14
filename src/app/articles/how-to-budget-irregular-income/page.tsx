import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'How to Budget on an Irregular Income — NexusDigitalLabs',
  description:
    'A practical budgeting system for freelancers, contractors, and anyone with variable monthly income — covering baseline expenses, income flooring, and debt management.',
  path: '/articles/how-to-budget-irregular-income/',
  keywords: [
    'budget irregular income',
    'freelance budgeting',
    'variable income budget',
    'how to budget as freelancer',
    'irregular income debt payoff',
    'freelance personal finance',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'How to Budget on an Irregular Income',
  ogDescription:
    'A budgeting system built for variable income — covering expense floors, income smoothing, and debt payoff on unpredictable cash flow.',
});

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}
function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="text-slate-400 font-light text-sm sm:text-base leading-relaxed mb-4 space-y-1.5 pl-5 list-disc marker:text-slate-600">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

const FAQ = [
  { q: 'How large should my income buffer be?', a: 'Aim for 2–3 months of baseline expenses. This covers gaps between projects, late-paying clients, and unexpected costs without forcing you to take work you do not want or accumulate debt.' },
  { q: 'Should I pay off debt or build a buffer first?', a: 'Build a small emergency buffer first — at least one month of baseline expenses. Then focus aggressively on debt. Without any buffer, a single slow month can push you back into debt faster than you are paying it off.' },
  { q: 'How do I handle taxes on irregular income?', a: 'Set aside 25–30% of every payment received into a separate tax account immediately. Do not touch it until tax time. This removes the psychological temptation to spend money you will owe and eliminates the annual panic of a large tax bill.' },
  { q: 'What if some months I earn almost nothing?', a: 'Your income floor (the minimum viable income level) determines your minimum viable client pipeline. If your floor is $3,000/month, you need enough active client relationships to reliably generate that. Regular outreach and relationship maintenance is not optional — it is financial infrastructure.' },
];

export default function IrregularIncomeBudgetPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'How to Budget on an Irregular Income',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/how-to-budget-irregular-income/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1">Personal Finance</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">6 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">How to Budget on an Irregular Income</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Standard budgeting advice assumes a consistent monthly salary. For freelancers and contractors, income varies wildly — and a different system is needed.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>The most common budgeting advice — &quot;track your spending and stick to a monthly budget&quot; — was designed for salaried employees who receive the same amount every month. When your income varies by 50–300% between months, that model breaks down immediately.</P>
            <P>Irregular income requires a system built around income floors, not income averages.</P>

            <H2>Step 1: Define Your Baseline Expenses</H2>
            <P>Your baseline is the minimum you need to cover every month regardless of what you earn. List only non-negotiable fixed costs:</P>
            <UL items={[
              'Rent or mortgage',
              'Utilities (electricity, water, internet)',
              'Debt minimum payments (credit cards, loans)',
              'Insurance premiums',
              'Essential subscriptions (phone, essential software)',
              'Basic food and transport',
            ]} />
            <P>This number is your income floor. If you earn less than this in a given month, you are running a deficit. Know your number. Most freelancers are surprised at how low it actually is — typically $1,500–$2,500/month for a single person in a mid-cost city.</P>

            <H2>Step 2: Pay Yourself a Fixed Monthly &quot;Salary&quot;</H2>
            <P>Open a separate business account. All client payments go in there. At the start of each month, transfer a fixed amount to your personal account — your self-determined salary, set at 110–120% of your baseline expenses.</P>
            <P>In high-income months, the surplus stays in the business account. In low months, you draw from that buffer. This smooths out income volatility and lets you budget from a consistent personal income figure.</P>

            <H2>Step 3: Build a 2-Month Buffer Before Aggressively Paying Debt</H2>
            <P>Without a buffer, a slow month forces you to use credit — often at high interest — cancelling out your debt payoff progress. Before making extra debt payments, accumulate 2 months of baseline expenses in your business account. This is your emergency floor, not spending money.</P>

            <H2>Step 4: Apply Surplus to Debt Using the Snowball Method</H2>
            <P>Once your buffer is in place, any income above your self-salary goes to debt. Target the smallest balance first regardless of interest rate. Quick wins keep motivation high and reduce the number of minimum payments you owe each month, freeing up cash faster.</P>

            <H2>Step 5: Set a Tax Reserve Automatically</H2>
            <P>Every time a client payment arrives, immediately move 25–30% to a dedicated tax savings account. Do this before anything else — before paying yourself, before expenses. Treating tax as the first expense eliminates the end-of-year surprise and keeps you compliant without stress.</P>

            <H2>Frequently Asked Questions</H2>
            <div className="space-y-5 mt-2">
              {FAQ.map((item) => (
                <div key={item.q} className="border-l-2 border-slate-700 pl-4">
                  <p className="text-sm font-semibold text-slate-200 mb-1">{item.q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Debt Settlement & Savings Optimizer</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Enter your income, expenses, and debt balances to see a month-by-month payoff plan — including exactly when you become debt-free and when savings growth begins.</p>
            <Link href="/tools/debt-optimizer/" className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Debt Optimizer
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
