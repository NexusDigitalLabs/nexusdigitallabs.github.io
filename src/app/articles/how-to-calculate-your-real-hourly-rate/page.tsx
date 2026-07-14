import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'How to Calculate Your Real Hourly Rate as a Freelancer — NexusDigitalLabs',
  description:
    'Most freelancers undercharge because they set rates based on gut feel, not numbers. Here is the exact formula to calculate what you actually need to earn per billable hour.',
  path: '/articles/how-to-calculate-your-real-hourly-rate/',
  keywords: [
    'freelance hourly rate calculator',
    'how to set freelance rates',
    'freelance pricing formula',
    'billable hours freelance',
    'freelance income target',
    'how to price freelance work',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'How to Calculate Your Real Hourly Rate as a Freelancer',
  ogDescription:
    'The exact formula to calculate your minimum viable hourly rate based on income targets, working hours, and non-billable time.',
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
  { q: 'Should I charge the same rate for all clients?', a: 'No. Your rate should reflect the client\'s budget, the complexity of the work, the urgency, and the strategic value of the relationship. A startup with limited budget may get a lower rate for interesting work. A corporate client with large budgets should pay a premium.' },
  { q: 'How often should I raise my rates?', a: 'Review your rates annually at minimum. Raise them when your skills and portfolio have grown, when you have more demand than capacity, or when inflation has eroded your real earnings. Give existing clients 30–60 days notice before rate increases.' },
  { q: 'Is it better to charge hourly or per project?', a: 'Project-based pricing is generally better for both parties on well-defined scopes. It eliminates the client\'s anxiety about hours adding up and rewards you for working efficiently. Hourly billing is better for ongoing work with unclear scope or frequent changes.' },
  { q: 'What if my rate feels too high?', a: 'If you are uncomfortable quoting your rate, the discomfort is usually about confidence, not pricing. If a client says "too expensive", that is useful market feedback — but one rejection is not a signal to lower your rate permanently. Test your rate across 5–10 clients before drawing conclusions.' },
];

export default function HourlyRatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'How to Calculate Your Real Hourly Rate as a Freelancer',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/how-to-calculate-your-real-hourly-rate/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1">Freelance Finance</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">6 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">How to Calculate Your Real Hourly Rate as a Freelancer</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Most freelancers set rates based on gut feel or what competitors charge. This approach almost always leads to undercharging. Here is the formula that starts with what you actually need.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>The most common freelance pricing mistake is working backwards from a number that sounds reasonable rather than forwards from a number that is mathematically sufficient. Your rate needs to cover not just your time, but your unpaid time, your expenses, your taxes, and the gaps between projects.</P>

            <H2>Step 1: Define Your Annual Income Target</H2>
            <P>Start with what you want to take home after taxes. Add back your estimated tax rate to get the gross target.</P>
            <P>Example: You want $60,000 after tax. With a 25% effective tax rate, your gross income target is $60,000 ÷ 0.75 = <strong className="text-slate-200">$80,000 gross</strong>.</P>
            <P>Also add your annual business expenses: software subscriptions, hardware, insurance, accounting, marketing. If these total $5,000/year, your revised gross target is <strong className="text-slate-200">$85,000</strong>.</P>

            <H2>Step 2: Calculate Your Actual Billable Hours</H2>
            <P>Do not use 2,080 hours (52 weeks × 40 hours). That assumes zero time off and 100% billable efficiency — neither is realistic for freelancers.</P>
            <UL items={[
              'Start: 52 weeks × 5 days = 260 working days',
              'Subtract: 15 days holiday, 10 days sick/personal = 235 working days',
              'Subtract: 20% non-billable time (admin, sales, proposals, learning) = 188 billable days',
              'At 6 billable hours per day: 188 × 6 = 1,128 billable hours per year',
            ]} />
            <P>1,128 billable hours is a realistic annual target for a solo freelancer working sustainably.</P>

            <H2>Step 3: Calculate Your Minimum Hourly Rate</H2>
            <P><strong className="text-slate-200">Minimum rate = Annual gross target ÷ Billable hours</strong></P>
            <P>$85,000 ÷ 1,128 = <strong className="text-slate-200">$75.35/hr minimum</strong>.</P>
            <P>This is your floor — the rate below which you are earning less than your target. Your market rate may be higher. Your specialty rate should be higher. But now you know your number.</P>

            <H2>Step 4: Add a Positioning Premium</H2>
            <P>Your minimum rate is not your market rate. Add a premium based on:</P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">Specialisation</strong> — the more specific your niche, the less competition and the higher your rate</span>,
              <span key="2"><strong className="text-slate-200">Proven results</strong> — case studies and measurable outcomes justify higher rates than credentials alone</span>,
              <span key="3"><strong className="text-slate-200">Urgency</strong> — rush projects should carry a 25–50% premium minimum</span>,
              <span key="4"><strong className="text-slate-200">Client size</strong> — enterprise clients have larger budgets and expect enterprise rates</span>,
            ]} />
            <P>A minimum rate of $75/hr may become a quoted rate of $95–120/hr for a positioned specialist working with mid-to-large clients.</P>

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
            <p className="text-xs font-semibold tracking-widest text-emerald-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Freelancer Invoice Generator</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Once you know your rate, generate a professional PDF invoice with itemised line items in under two minutes. No account needed.</p>
            <Link href="/tools/invoice-generator/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Invoice Generator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
