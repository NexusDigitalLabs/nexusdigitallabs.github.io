import Link from 'next/link';
import { Bell, CloudUpload, Flame, Gift, ShieldCheck, Shirt, Sparkles } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { pageMetadata, SITE_URL } from '@/lib/seo';

const PATH = '/huffle/';
const TITLE = 'Huffle — A Gentle Movement Habit Game for Android';
const DESCRIPTION =
  'Log a walk, a stretch or a workout in one tap and watch your Huffling grow. A kind habit game with streaks that forgive, a daily gift and zero guilt — no account, no ads.';

/** Set to the live Play Store URL once the app is published; until then a "coming soon" pill shows. */
const PLAY_URL: string | null = null;

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'Huffle',
    'movement habit app',
    'gentle fitness habit tracker',
    'habit game',
    'exercise streak app',
    'beginner fitness app',
    'activity tracker Android',
  ],
  ogTitle: 'Huffle — move a little, grow a Huffling',
  ogDescription: 'A gentle movement habit game with streaks that forgive. No account, no ads.',
});

const SCREENS = [
  { src: '/huffle/01-home.jpg', alt: 'Huffle home screen with a Huffling, streak and daily gift' },
  { src: '/huffle/02-log.jpg', alt: 'Logging a session: pick a movement type in one tap' },
  { src: '/huffle/03-evolve.jpg', alt: 'The Huffling evolving to the next stage' },
  { src: '/huffle/04-gift.jpg', alt: 'Opening the daily gift' },
  { src: '/huffle/05-wardrobe.jpg', alt: 'The wardrobe of items to unlock' },
  { src: '/huffle/06-journey.jpg', alt: 'Journey screen with XP, streaks and stats' },
  { src: '/huffle/07-backup.jpg', alt: 'Optional backup to your own Google Drive' },
];

const FEATURES = [
  {
    icon: Sparkles,
    title: 'A creature that grows with you',
    desc: 'Your Huffling moves from winded and wobbly to steady, strong and thriving across five stages as you keep showing up.',
  },
  {
    icon: Flame,
    title: 'Streaks that forgive',
    desc: 'Build a streak, and earn freeze tokens that quietly cover a rough day. Miss a few days and the welcome back is a celebration.',
  },
  {
    icon: Gift,
    title: 'A daily gift',
    desc: 'Log a session and open a small surprise — something new for your Huffling to wear for the day.',
  },
  {
    icon: Shirt,
    title: 'A wardrobe to unlock',
    desc: 'Hats, scarves and more unlock through consistency, not payment. Earned items are yours to keep.',
  },
  {
    icon: Bell,
    title: 'Reminders, not nagging',
    desc: 'At most two gentle nudges a day, in your Huffling’s voice — and they stop on their own if you’re away.',
  },
  {
    icon: CloudUpload,
    title: 'Back up to your own Drive',
    desc: 'Optionally save your progress to a hidden folder in your Google Drive and restore it on a new phone.',
  },
];

const STEPS = [
  { title: 'Move', desc: 'A walk, a stretch, a game of football — anything counts.' },
  { title: 'Log it', desc: 'One tap and a type. Duration and a note are optional.' },
  { title: 'Watch them grow', desc: 'Your Huffling gains energy, evolves, and finds a gift.' },
];

const PRIVACY = [
  'No account to create',
  'No ads and no tracking',
  'Your data stays on your device',
  'Optional backup goes only to your own Google Drive',
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Huffle',
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: FEATURES.map((f) => f.title),
    publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: `${SITE_URL}/` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Huffle', item: `${SITE_URL}${PATH}` },
    ],
  },
];

const card = { background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' } as const;

/** Huffle's coral accent, readable on both site themes (the site switches via [data-theme]). */
const ACCENT_CSS = `
.huffle-accent{color:#F4A261}
.huffle-dot{background:#F4A261}
.huffle-chip{color:#FDBA74;background:rgba(249,115,22,.10);border:1px solid rgba(251,146,60,.32)}
[data-theme="light"] .huffle-accent{color:#C2410C}
[data-theme="light"] .huffle-dot{background:#C2410C}
[data-theme="light"] .huffle-chip{color:#9A3412;background:#FFEDD5;border-color:#FDBA74}
`;

function PlayButton() {
  if (PLAY_URL) {
    return (
      <a href={PLAY_URL} className="inline-block no-underline" aria-label="Get Huffle on Google Play">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/google-play-badge.png" alt="Get it on Google Play" width={180} height={53} />
      </a>
    );
  }
  return (
    <span
      className="huffle-chip inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl"
      role="status"
    >
      Coming soon on Google Play
    </span>
  );
}

export default function HufflePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{ACCENT_CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ndl-orb ndl-orb-1" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest huffle-accent uppercase mb-5">
              <span className="huffle-dot w-1.5 h-1.5 rounded-full" aria-hidden="true" />
              Android · Free
            </p>
            <div className="flex items-center gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/huffle/huffle-icon.png" alt="" width={64} height={64} className="rounded-2xl" />
              <span className="text-2xl font-semibold text-white tracking-tight">Huffle</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-[1.1] mb-6">
              Move a little. <span className="huffle-accent">Meet your Huffling.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed mb-8 max-w-xl">
              A gentle movement habit game. Log a walk, a stretch or a workout in one tap and your Huffling grows
              with you — with streaks that forgive and not a drop of guilt.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PlayButton />
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white no-underline">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">Free · No account · No ads</p>
          </div>
          <ScrollReveal>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/huffle/01-home.jpg"
                alt={SCREENS[0].alt}
                width={540}
                height={960}
                className="w-full max-w-[320px] h-auto rounded-3xl"
                style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Screenshots ──────────────────────────────────────────────────── */}
      <section className="py-16 border-t border-slate-800/50" aria-labelledby="screens-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <h2 id="screens-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-8">
            A look inside
          </h2>
          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 sm:mx-0 sm:px-0">
            {SCREENS.map((s) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={s.src}
                src={s.src}
                alt={s.alt}
                width={540}
                height={960}
                loading="lazy"
                className="snap-start shrink-0 w-[220px] sm:w-[260px] h-auto rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest huffle-accent uppercase mb-3">What&apos;s inside</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Built to make showing up feel good.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 120}>
                <div className="h-full rounded-2xl p-6" style={card}>
                  <f.icon className="huffle-accent w-6 h-6 mb-4" aria-hidden="true" />
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
            <p className="text-xs font-semibold tracking-widest huffle-accent uppercase mb-3">How it works</p>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Three small steps, every day.
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl p-6" style={card}>
                <span className="huffle-chip inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold mb-4">
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
              <ShieldCheck className="huffle-accent w-6 h-6 mb-4" aria-hidden="true" />
              <h2 id="privacy-heading" className="text-xl sm:text-2xl font-light text-white tracking-tight mb-4">
                Private by design
              </h2>
              <ul className="space-y-2 mb-6">
                {PRIVACY.map((item) => (
                  <li key={item} className="text-sm text-slate-300 font-light flex gap-2">
                    <span className="huffle-accent" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/huffle/privacy-policy/" className="text-sm text-blue-400 underline">
                Read the privacy policy
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 sm:px-10 pb-16 pt-4 text-center text-xs text-slate-500">
        Huffle is made by{' '}
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
