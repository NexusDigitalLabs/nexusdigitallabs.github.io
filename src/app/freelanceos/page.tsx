import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Lock,
  Receipt,
  Timer,
  Wallet,
} from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { FREELANCEOS_FAQ } from '@/data/freelanceos';
import { pageMetadata, SITE_URL } from '@/lib/seo';

const PATH = '/freelanceos/';
const TITLE = 'FreelanceOS — Free Invoicing & Client Manager for Freelancers';
const DESCRIPTION =
  'Manage clients, projects, invoices, payments and expenses in one place. Auto-numbered PDF invoices, overdue tracking and a revenue dashboard — free during beta.';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'freelance invoicing software',
    'invoice tracker for freelancers',
    'freelancer client management',
    'free invoicing app',
    'track unpaid invoices',
    'freelance business manager',
    'freelancer expense tracker',
    'FreelanceOS',
  ],
  ogTitle: 'FreelanceOS — run your freelance business in one place',
  ogDescription: 'Clients, projects, invoices, payments and expenses together. Free during beta.',
});

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Clients & projects',
    desc: 'Every client with their projects, billing type (hourly, fixed, milestone or retainer), rate, budget and due dates.',
  },
  {
    icon: Receipt,
    title: 'Invoices that number themselves',
    desc: 'Build an invoice in a minute — or add a line straight from a project. Numbers are assigned when you issue it, never duplicated.',
  },
  {
    icon: FileText,
    title: 'Clean, real-text PDFs',
    desc: 'Sharp A4 PDFs your clients can search and copy from, at a few kilobytes — not a blurry screenshot.',
  },
  {
    icon: CheckCircle2,
    title: 'Know who has paid',
    desc: 'Record full or partial payments. Unpaid, overdue and paid are worked out for you from due dates and payments.',
  },
  {
    icon: LayoutDashboard,
    title: 'A dashboard that answers “how am I doing?”',
    desc: 'Revenue this month, outstanding money, invoices due soon and recent activity — per currency, no conversion guesswork.',
  },
  {
    icon: Wallet,
    title: 'Expenses',
    desc: 'Log software, hosting, travel and other costs, link them to projects, and see what each month really cost.',
  },
];

const STEPS = [
  { title: 'Add a client', desc: 'Name, contact details and the currency you bill them in.' },
  { title: 'Create a project', desc: 'Pick how you bill — hourly, fixed price, milestones or a retainer.' },
  { title: 'Invoice and get paid', desc: 'Issue the invoice, send the PDF, and record the payment when it lands.' },
];

const ROADMAP = [
  { icon: Timer, title: 'Time tracking', desc: 'Start a timer or log hours, then invoice tracked time in one click.' },
  { icon: Bot, title: 'AI assistant', desc: '“How much did I earn this month?” — answers from your own business data.' },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'FreelanceOS',
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', description: 'Free during beta' },
    featureList: FEATURES.map((f) => f.title),
    publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: `${SITE_URL}/` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FREELANCEOS_FAQ.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'FreelanceOS', item: `${SITE_URL}${PATH}` },
    ],
  },
];

const card = { background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' } as const;

function StartButton({ label = 'Start free' }: { label?: string }) {
  return (
    <Link
      href="/app/"
      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-7 py-3.5 rounded-xl transition-all duration-200 no-underline"
      style={{ boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}
    >
      {label} <ArrowRight className="w-4 h-4" aria-hidden="true" />
    </Link>
  );
}

/** Static product snapshot (sample numbers) — a light stand-in for a screenshot. */
function DashboardSnapshot() {
  // Marketing snapshot: sample numbers that tell a good-month story (money
  // coming in), with invented businesses — not real companies.
  // Outstanding = the one unpaid row below.
  const stats = [
    { label: 'Revenue this month', value: '$5,380.00', note: '↑ 18% vs last month' },
    { label: 'Outstanding', value: '$1,450.00', note: '1 invoice, not yet due' },
    { label: 'Expenses this month', value: '$214.60', note: '4% of revenue' },
  ];
  const recent = [
    { label: 'INV-0044 · Lumen Yoga Studio', amount: '$380.00', status: 'Paid', tone: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'INV-0043 · Kestrel Analytics', amount: '$695.00', status: 'Paid', tone: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'INV-0045 · Harbour & Pine Co.', amount: '$1,450.00', status: 'Due in 6 days', tone: 'text-blue-400 bg-blue-500/10' },
  ];
  return (
    <div className="rounded-2xl p-5 sm:p-6" style={card} aria-label="Example FreelanceOS dashboard with sample data" role="img">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'var(--ndl-surface-2)' }}>
            <p className="text-xs text-slate-400 mb-1">{s.label}</p>
            <p className="text-xl font-semibold text-white tabular-nums">{s.value}</p>
            <p className={`mt-1 text-[11px] ${s.note.startsWith('↑') ? 'text-emerald-400' : 'text-slate-500'}`}>{s.note}</p>
          </div>
        ))}
      </div>
      <p className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">Recent invoices</p>
      <ul className="space-y-2">
        {recent.map((d) => (
          <li key={d.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-slate-300 truncate">{d.label}</span>
            <span className="flex items-center gap-3 shrink-0">
              <span className="text-white tabular-nums">{d.amount}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${d.tone}`}>{d.status}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function FreelanceOSPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ndl-orb ndl-orb-1" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest text-blue-400 uppercase mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
              Free beta
            </p>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-[1.1] mb-6">
              Run your freelance business <span className="text-blue-400">in one place.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed mb-8 max-w-xl">
              FreelanceOS keeps your clients, projects, invoices, payments and expenses together — so you always know
              what you&apos;ve earned, what you&apos;re owed and what&apos;s overdue. Stop juggling spreadsheets and
              separate invoicing tools.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <StartButton />
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white no-underline">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">Free while in beta · Sign in with Google or email · No card required</p>
          </div>
          <ScrollReveal>
            <DashboardSnapshot />
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">What&apos;s inside</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              From “I got a client” to “I got paid”.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 120}>
                <div className="h-full rounded-2xl p-6" style={card}>
                  <f.icon className="w-6 h-6 text-blue-400 mb-4" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="how-heading">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">How it works</p>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Three steps to your first paid invoice.
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl p-6" style={card}>
                <span className="inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/30 mb-4">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Pricing + privacy ────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="pricing-heading">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl p-8" style={card}>
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Pricing</p>
            <h2 id="pricing-heading" className="text-2xl font-light text-white tracking-tight mb-3">
              Free during the beta.
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-5">
              Every feature, no limits on clients, projects or invoices while FreelanceOS is in beta. Paid plans will
              come later for advanced features — beta users will get a founding-member offer, announced well in
              advance.
            </p>
            <StartButton label="Create your free workspace" />
          </div>
          <div className="rounded-2xl p-8" style={card}>
            <Lock className="w-6 h-6 text-blue-400 mb-4" aria-hidden="true" />
            <h2 className="text-2xl font-light text-white tracking-tight mb-3">Your business data stays yours.</h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              Each workspace is isolated at the database level, so no other account can read your clients or invoices.
              We don&apos;t sell your data, there are no ads inside the app, and you can delete your account at any
              time. Details are in the{' '}
              <Link href="/privacy-policy/#freelanceos" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── Roadmap ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="roadmap-heading">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Coming next</p>
          <h2 id="roadmap-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-10">
            Built in the open, shaped by beta users.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {ROADMAP.map((r) => (
              <div key={r.title} className="rounded-2xl p-6 flex gap-4" style={card}>
                <r.icon className="w-6 h-6 text-blue-400 shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">{r.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ (mirrors the FAQPage JSON-LD) ────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">FAQ</p>
          <h2 id="faq-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FREELANCEOS_FAQ.map(({ q, a }) => (
              <div key={q} className="border-l-2 border-slate-700 pl-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-2">{q}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-4">
            Stop managing your freelance business across five tools.
          </h2>
          <p className="text-sm text-slate-400 font-light mb-8">
            Set up takes two minutes. Already using our free{' '}
            <Link href="/tools/invoice-generator/" className="text-blue-400 hover:text-blue-300">
              Invoice Generator
            </Link>
            ? FreelanceOS uses the same clean invoice design.
          </p>
          <StartButton />
        </div>
      </section>
    </>
  );
}
