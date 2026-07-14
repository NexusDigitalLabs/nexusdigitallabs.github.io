import { pageMetadata } from '@/lib/seo';
import Link from 'next/link';

export const metadata = pageMetadata({
  title: 'How to Write a Freelance Contract That Protects You — NexusDigitalLabs',
  description:
    'The essential clauses every freelance contract must include — scope, payment terms, intellectual property, revision limits, and termination rights.',
  path: '/articles/how-to-write-a-freelance-contract/',
  keywords: [
    'freelance contract template',
    'how to write a freelance contract',
    'freelance agreement clauses',
    'scope of work contract',
    'freelance IP ownership',
    'kill fee clause',
    'freelance termination clause',
  ],
  absoluteTitle: true,
  type: 'article',
  ogTitle: 'How to Write a Freelance Contract That Protects You',
  ogDescription:
    'The essential clauses every freelance contract must include to get paid on time and avoid scope creep.',
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
  { q: 'Does a freelance contract need to be notarised?', a: 'No. In most jurisdictions, a written contract signed by both parties (including via email confirmation or electronic signature) is legally binding. Notarisation is typically only required for real estate transactions and official legal documents.' },
  { q: 'Can I use the same contract for every client?', a: 'You can use a base template, but customise the Scope of Work, payment schedule, and delivery dates for each project. Using the exact same contract without modification increases the risk of a scope mismatch.' },
  { q: 'What is a kill fee?', a: 'A kill fee is a partial payment owed to you if a client cancels a project after work has begun. Typically 25–50% of the agreed project price. It compensates you for time invested and the opportunity cost of turning down other work.' },
  { q: 'Who owns the work I produce as a freelancer?', a: 'By default in most countries, the creator (you) owns the intellectual property unless the contract explicitly transfers ownership to the client. Always include an IP transfer clause that specifies ownership transfers only upon receipt of final payment.' },
  { q: 'How many revisions should I include?', a: 'Two rounds of revisions is the industry standard for most creative and design work. Clearly define what constitutes a "revision" vs. a "new requirement" in your contract. Unlimited revisions without a cap will reliably be exploited.' },
];

export default function FreelanceContractPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'How to Write a Freelance Contract That Protects You',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/how-to-write-a-freelance-contract/',
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
              <span className="text-xs text-slate-500">7 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">How to Write a Freelance Contract That Actually Protects You</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">A freelance contract is your only protection against scope creep, late payment, and cancelled projects. Here is what every clause must say.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>Most freelancers either skip contracts entirely or use templates they found online without understanding what the clauses actually mean. Both approaches leave you exposed. A missing scope definition leads to scope creep. A missing IP clause means you may not own your own work. A missing termination clause means a client can cancel with zero compensation after months of work.</P>
            <P>A good freelance contract does not need to be long. It needs to be precise on six key areas.</P>

            <H2>1. Scope of Work</H2>
            <P>This is the most important section and the most commonly written too vaguely. Do not write &quot;website redesign&quot;. Write exactly what is included:</P>
            <UL items={[
              'Number of pages or screens',
              'Specific deliverable formats (e.g. Figma file, production-ready HTML, compiled PDF)',
              'What is explicitly NOT included (e.g. copywriting, photography, third-party integrations)',
              'Reference documents such as a brief or wireframes by filename and date',
            ]} />
            <P>The more specific the scope, the easier it is to identify when a client is requesting something outside it — and to bill accordingly.</P>

            <H2>2. Payment Schedule</H2>
            <P>Never start work without a deposit. Standard structures:</P>
            <UL items={[
              <span key="1"><strong className="text-slate-200">50% upfront, 50% on delivery</strong> — best for projects under 4 weeks</span>,
              <span key="2"><strong className="text-slate-200">33% / 33% / 34% at milestones</strong> — best for longer projects with defined phases</span>,
              <span key="3"><strong className="text-slate-200">Monthly retainer</strong> — billed on the 1st of each month in advance for ongoing work</span>,
            ]} />
            <P>State the exact due date of each payment, not &quot;Net 30&quot; alone. Include a late payment clause: 1.5% per month on overdue balances is standard.</P>

            <H2>3. Revision Policy</H2>
            <P>Define revisions clearly. A revision is a change to existing work. A new requirement is a change to the agreed scope — and should be billed separately. Include:</P>
            <UL items={[
              'Number of included revision rounds (2 is standard)',
              'How revisions must be submitted (consolidated in a single document, not piecemeal)',
              'Your hourly rate for additional revisions beyond the included rounds',
            ]} />

            <H2>4. Intellectual Property</H2>
            <P>By default, you own what you create. IP transfers to the client only when your contract says so and only upon full payment. Write it explicitly:</P>
            <P><em className="text-slate-300">&quot;All intellectual property rights in the deliverables transfer to the Client upon receipt of full final payment. Until that time, all rights remain with the Contractor.&quot;</em></P>

            <H2>5. Kill Fee / Cancellation</H2>
            <P>If a client cancels a project after work has begun, you are owed compensation. A standard kill fee schedule:</P>
            <UL items={[
              'Cancelled before work begins: deposit is forfeited',
              'Cancelled after work begins but before 50% completion: 50% of total project fee',
              'Cancelled after 50% completion: 75–100% of total project fee',
            ]} />

            <H2>6. Governing Law and Dispute Resolution</H2>
            <P>State which country and jurisdiction&apos;s law governs the contract. For international clients, specify that disputes will be resolved in your jurisdiction — not theirs. This matters significantly if you ever need to pursue payment through legal channels.</P>

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
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Once the contract is signed, generate a professional PDF invoice in under two minutes. No account, no watermark, no cost.</p>
            <Link href="/tools/invoice-generator/" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 ndl-on-accent text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Invoice Generator
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
