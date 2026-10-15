import Link from 'next/link';
import { Bell, CalendarClock, ClipboardCheck, CloudUpload, ShieldCheck, Users, Wallet } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { pageMetadata, SITE_URL } from '@/lib/seo';

const PATH = '/mentto/';
const TITLE = 'Mentto — The Planner for Independent Tutors and Coaches';
const DESCRIPTION =
  'Enroll students, book recurring lessons, track attendance and fees, and get reminded before every class and due date. Built for private tutors, music teachers and coaches. No account, no ads.';

/** Set to the live Play Store URL once the app is published; until then a "coming soon" pill shows. */
const PLAY_URL: string | null = null;

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'Mentto',
    'tutor app',
    'private tutor scheduling app',
    'music teacher app',
    'student fee tracker',
    'tuition class manager',
    'lesson planner Android',
  ],
  ogTitle: 'Mentto — your students, lessons and fees in one place',
  ogDescription: 'The planner for independent tutors and coaches. Reminders before every class and fee. No account, no ads.',
});

const FEATURES = [
  {
    icon: Users,
    title: 'Every student in one place',
    desc: 'Contact details, guardian info and notes for each student, whether you teach one-on-one or small groups.',
  },
  {
    icon: CalendarClock,
    title: 'Recurring lesson slots',
    desc: 'Book a weekly slot once and it repeats. Cancel or move a single lesson without touching the rest.',
  },
  {
    icon: ClipboardCheck,
    title: 'Attendance in a tap',
    desc: 'Mark each lesson attended or missed, and see a student’s history at a glance.',
  },
  {
    icon: Wallet,
    title: 'Fees that add up',
    desc: 'Monthly, per-lesson or per-term plans, partial payments and a clear view of who still owes what.',
  },
  {
    icon: Bell,
    title: 'Reminders before it matters',
    desc: 'A heads-up before each lesson and when a fee falls due, so nothing slips through the cracks.',
  },
  {
    icon: CloudUpload,
    title: 'Backed up automatically',
    desc: 'Your records are saved to a hidden folder in your own Google Drive and restored on a new phone.',
  },
];

const STEPS = [
  { title: 'Add your students', desc: 'Name, contact and a fee plan. It takes a minute each.' },
  { title: 'Book their slots', desc: 'Set the weekly time once. Mentto keeps the calendar.' },
  { title: 'Teach. Mentto remembers.', desc: 'Lessons, attendance, payments due — all tracked and reminded.' },
];

const PRIVACY = [
  'No account to create',
  'No ads and no tracking',
  'Student records stay on your device',
  'Backups go only to your own Google Drive',
];

/** Sample lessons for the hero preview. Illustrative only. */
const PREVIEW = [
  { time: '4:00 PM', name: 'Vocal lesson · Amaya', meta: '45 min' },
  { time: '5:00 PM', name: 'Piano · Ravi', meta: '30 min' },
  { time: '6:30 PM', name: 'Group theory class', meta: '4 students' },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Mentto',
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android',
    featureList: FEATURES.map((f) => f.title),
    publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: `${SITE_URL}/` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Mentto', item: `${SITE_URL}${PATH}` },
    ],
  },
];

const card = { background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' } as const;

/** Mentto's indigo accent, readable on both site themes (the site switches via [data-theme]). */
const ACCENT_CSS = `
.mentto-accent{color:#818CF8}
.mentto-dot{background:#818CF8}
.mentto-chip{color:#C7D2FE;background:rgba(99,102,241,.12);border:1px solid rgba(129,140,248,.34)}
[data-theme="light"] .mentto-accent{color:#4338CA}
[data-theme="light"] .mentto-dot{background:#4338CA}
[data-theme="light"] .mentto-chip{color:#3730A3;background:#E0E7FF;border-color:#A5B4FC}
`;

function PlayButton() {
  if (PLAY_URL) {
    return (
      <a href={PLAY_URL} className="inline-block no-underline" aria-label="Get Mentto on Google Play">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/google-play-badge.png" alt="Get it on Google Play" width={180} height={53} />
      </a>
    );
  }
  return (
    <span
      className="mentto-chip inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl"
      role="status"
    >
      Coming soon on Google Play
    </span>
  );
}

function TodayPreview() {
  return (
    <div className="w-full max-w-[360px] rounded-3xl p-6" style={{ ...card, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}>
      <p className="text-xs font-semibold tracking-widest mentto-accent uppercase mb-1">Today</p>
      <p className="text-lg font-semibold text-white mb-5">3 lessons · 1 fee due</p>
      <ul className="space-y-3 mb-5">
        {PREVIEW.map((lesson) => (
          <li key={lesson.time} className="flex items-center gap-4 rounded-xl p-3" style={card}>
            <span className="text-sm font-semibold mentto-accent w-16 shrink-0">{lesson.time}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-sm text-white truncate">{lesson.name}</span>
              <span className="block text-xs text-slate-500">{lesson.meta}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="mentto-chip rounded-xl px-4 py-3 text-sm">October fee due from Ravi in 2 days</div>
    </div>
  );
}

export default function MenttoPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{ACCENT_CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ndl-orb ndl-orb-1" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest mentto-accent uppercase mb-5">
              <span className="mentto-dot w-1.5 h-1.5 rounded-full" aria-hidden="true" />
              Android · Coming soon
            </p>
            <div className="mb-6">
              <span className="text-2xl font-semibold text-white tracking-tight">Mentto</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-[1.1] mb-6">
              You teach. <span className="mentto-accent">Mentto keeps track.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed mb-8 max-w-xl">
              The planner for independent tutors and coaches. Students, recurring lessons, attendance and fees in one
              place, with a reminder before every class and every due date.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PlayButton />
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white no-underline">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">For tutors, music teachers and coaches · No account · No ads</p>
          </div>
          <ScrollReveal>
            <div className="flex justify-center">
              <TodayPreview />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest mentto-accent uppercase mb-3">What&apos;s inside</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Everything a one-person teaching business needs.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 120}>
                <div className="h-full rounded-2xl p-6" style={card}>
                  <f.icon className="mentto-accent w-6 h-6 mb-4" aria-hidden="true" />
                  <h3 className="text-base font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="scroll-mt-20 py-20 sm:py-24 border-t border-slate-800/50"
        aria-labelledby="how-heading"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-widest mentto-accent uppercase mb-3">How it works</p>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Set it up once. Teach all term.
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl p-6" style={card}>
                <span className="mentto-chip inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold mb-4">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Privacy ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="privacy-heading">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <ScrollReveal>
            <div className="rounded-2xl p-8" style={card}>
              <ShieldCheck className="mentto-accent w-6 h-6 mb-4" aria-hidden="true" />
              <h2 id="privacy-heading" className="text-xl sm:text-2xl font-light text-white tracking-tight mb-4">
                Your students&apos; details stay yours
              </h2>
              <ul className="space-y-2">
                {PRIVACY.map((item) => (
                  <li key={item} className="text-sm text-slate-300 font-light flex gap-2">
                    <span className="mentto-accent" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 sm:px-10 pb-16 pt-4 text-center text-xs text-slate-500">
        Mentto is made by{' '}
        <Link href="/" className="text-slate-400 underline">
          NexusDigitalLabs
        </Link>
        . Questions?{' '}
        <a href="mailto:hello@nexusdigitallabs.dev" className="text-slate-400 underline">
          hello@nexusdigitallabs.dev
        </a>
      </footer>
    </>
  );
}
