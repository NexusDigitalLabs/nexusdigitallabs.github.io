import Link from 'next/link';
import { Bell, Car, Check, Fuel, Gauge, Globe, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { pageMetadata, SITE_URL } from '@/lib/seo';
import { odovaPlayUrl } from '@/lib/odova-app';

const PATH = '/odova/';
const TITLE = 'Odova — Fuel and Maintenance Tracker for Your Vehicles';
const DESCRIPTION =
  'Log fill-ups, see your real fuel economy and cost per km, and get maintenance reminders by date or odometer. Free on Android with an optional one-time Pro.';

/** The live Play Store listing, tagged so Play Console shows installs from this page. */
const PLAY_URL = odovaPlayUrl('odova_page');

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'Odova',
    'fuel tracker app',
    'fuel consumption tracker Android',
    'mileage tracker',
    'car maintenance reminder app',
    'fuel economy calculator',
    'vehicle expense tracker',
  ],
  ogTitle: 'Odova — know what your car really costs to run',
  ogDescription: 'Fill-ups, real fuel economy and maintenance reminders for every vehicle. Free on Android.',
});

const SCREENS = [
  { src: '/odova/01-dashboard.jpg', alt: 'Dashboard with average fuel efficiency, total spend, cost per km and a trend chart' },
  { src: '/odova/02-log-fill-up.jpg', alt: 'Logging a fill-up with the total cost updating as you type' },
  { src: '/odova/03-history.jpg', alt: 'Fill history listing every fill-up with its efficiency' },
  { src: '/odova/04-maintenance.jpg', alt: 'Maintenance reminders with scheduled and completed items' },
  { src: '/odova/05-reminder.jpg', alt: 'Creating a repeating reminder by date or odometer' },
  { src: '/odova/06-vehicles.jpg', alt: 'Switching between vehicles in one garage' },
  { src: '/odova/07-get-started.jpg', alt: 'Getting started with just a garage nickname, no account needed' },
];

const FEATURES = [
  {
    icon: Gauge,
    title: 'Real fuel economy',
    desc: 'km/L and L/100km, or mpg, measured full-to-full, so partial fill-ups and gaps in your log don’t skew the numbers.',
  },
  {
    icon: Fuel,
    title: 'Fill-ups in seconds',
    desc: 'Enter odometer, litres and price and watch the total cost update as you type. Add past fill-ups in any order.',
  },
  {
    icon: TrendingUp,
    title: 'Spend and trends',
    desc: 'Total spend, cost per distance and efficiency charts show how your driving and fuel prices change over time.',
  },
  {
    icon: Bell,
    title: 'Maintenance reminders (Pro)',
    desc: 'Oil changes, tyre rotations, insurance renewals. Remind by date or by odometer, and repeat every X days or km.',
  },
  {
    icon: Car,
    title: 'Every vehicle in one garage (Pro)',
    desc: 'Switch between cars with a tap. The free version tracks one vehicle; Pro removes the limit.',
  },
  {
    icon: Globe,
    title: 'Your units, your currency',
    desc: 'Metric or imperial, nine currencies, and light or dark themes, whichever suits you.',
  },
];

const STEPS = [
  { title: 'Create a garage', desc: 'Pick a nickname. No account, no sign-up form.' },
  { title: 'Add your vehicle', desc: 'Make and model are all it needs. The rest is optional.' },
  { title: 'Log fill-ups. Odova does the maths.', desc: 'Efficiency, cost per distance and trends appear as you go.' },
];

const FREE = [
  'One vehicle, with unlimited fill-ups you can edit or delete',
  'Fuel efficiency, cost per distance and charts',
  'Metric or imperial units and nine currencies',
  'A sync code to open your garage on another device',
  'Optional sign-in to restore your garage with an email link',
  'A small banner ad',
];

const PRO = [
  'Unlimited vehicles',
  'Maintenance reminders by date or odometer, repeating if you like',
  'CSV export of every vehicle’s fill-ups and reminders',
  'No ads',
];

const PRIVACY = [
  'No account needed to start, just a garage nickname',
  'Your garage is saved under a private sync code so you can open it on another device',
  'Optional sign-in uses an email link, nothing more',
  'Delete all your data, or your account, from Settings',
  'The free version’s ads come from Google AdMob, and you choose your consent where it applies. Pro has none',
];

const FAQ = [
  {
    q: 'How does Odova work out fuel economy?',
    a: 'Efficiency is measured from one full tank to the next. Litres from any partial fill-ups in between count towards the next full one, so topping up before a trip doesn’t distort your average. Your overall figure is total distance divided by total litres, which keeps km/L and L/100km consistent.',
  },
  {
    q: 'Do I need an account?',
    a: 'No. Choose a garage nickname and start. You get a sync code that opens the same garage on another device. An email-link sign-in is optional if you would rather restore your garage that way.',
  },
  {
    q: 'What does Pro include, and what does it cost?',
    a: 'Pro adds unlimited vehicles, maintenance reminders, CSV export and no ads. It is a one-time purchase through Google Play rather than a subscription, and the price shows in your own currency in Google Play. You can restore it on a new device at any time.',
  },
  {
    q: 'Is there a web version?',
    a: 'Yes. The free web Fuel Tracker uses the same sync codes, so a garage you start on the web loads in the app and the other way round. The web version covers one vehicle; the extra features are in the app.',
  },
  {
    q: 'Can I delete my data?',
    a: 'Yes. In Settings, Delete all garage data removes your vehicles, fill-ups and reminders from our servers. If you signed in, Delete account removes the sign-in account itself. Use both for a complete removal.',
  },
  {
    q: 'Is there an iPhone version?',
    a: 'Not yet. Odova is on Android for now.',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Odova',
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    downloadUrl: PLAY_URL,
    installUrl: PLAY_URL,
    featureList: FEATURES.map((f) => f.title),
    publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: `${SITE_URL}/` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Odova', item: `${SITE_URL}${PATH}` },
    ],
  },
];

const card = { background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' } as const;

/** Odova's blue accent, readable on both site themes (the site switches via [data-theme]). */
const ACCENT_CSS = `
.odova-accent{color:#7FA2FF}
.odova-dot{background:#7FA2FF}
.odova-chip{color:#C7D6FF;background:rgba(59,110,240,.14);border:1px solid rgba(127,162,255,.36)}
[data-theme="light"] .odova-accent{color:#2F5BD7}
[data-theme="light"] .odova-dot{background:#2F5BD7}
[data-theme="light"] .odova-chip{color:#1E3FAE;background:#E1E9FF;border-color:#A9BDFB}
`;

function PlayButton() {
  return (
    <a href={PLAY_URL} className="inline-block no-underline" aria-label="Get Odova on Google Play">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/badges/google-play-badge.png" alt="Get it on Google Play" width={180} height={53} />
    </a>
  );
}

export default function OdovaPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{ACCENT_CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ndl-orb ndl-orb-1" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest odova-accent uppercase mb-5">
              <span className="odova-dot w-1.5 h-1.5 rounded-full" aria-hidden="true" />
              Android · Free, with a one-time Pro
            </p>
            <div className="flex items-center gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/odova/odova-icon.png" alt="" width={64} height={64} className="rounded-2xl" />
              <span className="text-2xl font-semibold text-white tracking-tight">Odova</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-[1.1] mb-6">
              Know what your car really costs. <span className="odova-accent">Odova does the maths.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed mb-8 max-w-xl">
              Fill-ups, real fuel economy, spend and maintenance reminders for every vehicle you own. Start in seconds
              with just a nickname.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PlayButton />
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white no-underline">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">Metric or imperial · Any currency · No account needed</p>
          </div>
          <ScrollReveal>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SCREENS[0].src}
                alt={SCREENS[0].alt}
                width={540}
                height={1212}
                className="w-full max-w-[300px] h-auto rounded-3xl"
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
                height={1212}
                loading="lazy"
                className="snap-start shrink-0 w-[200px] sm:w-[240px] h-auto rounded-2xl"
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest odova-accent uppercase mb-3">What&apos;s inside</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Everything you need to keep a vehicle running well.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 120}>
                <div className="h-full rounded-2xl p-6" style={card}>
                  <f.icon className="odova-accent w-6 h-6 mb-4" aria-hidden="true" />
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
            <p className="text-xs font-semibold tracking-widest odova-accent uppercase mb-3">How it works</p>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Three steps, then just fill up.
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl p-6" style={card}>
                <span className="odova-chip inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold mb-4">
                  {i + 1}
                </span>
                <h3 className="text-base font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{step.desc}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-center text-sm text-slate-400 font-light">
            Prefer a browser? The free{' '}
            <Link href="/tools/fuel-tracker/" className="text-blue-400 underline">
              web Fuel Tracker
            </Link>{' '}
            uses the same sync codes.
          </p>
        </div>
      </section>

      {/* ── Free and Pro ─────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="pricing-heading">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-12 text-center">
            <p className="text-xs font-semibold tracking-widest odova-accent uppercase mb-3">Free and Pro</p>
            <h2 id="pricing-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Free to start. Pro when you need more.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { name: 'Free', items: FREE, icon: Check },
              { name: 'Odova Pro', items: PRO, icon: Sparkles },
            ].map((plan) => (
              <div key={plan.name} className="rounded-2xl p-6" style={card}>
                <h3 className="flex items-center gap-2 text-base font-semibold text-white mb-4">
                  <plan.icon className="odova-accent w-5 h-5" aria-hidden="true" />
                  {plan.name}
                </h3>
                <ul className="space-y-2">
                  {plan.items.map((item) => (
                    <li key={item} className="text-sm text-slate-300 font-light flex gap-2">
                      <span className="odova-accent" aria-hidden="true">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-sm text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Pro is a one-time purchase through Google Play, not a subscription. You can restore it on a new device from
            the Pro screen at any time.
          </p>
        </div>
      </section>

      {/* ── Privacy ──────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="privacy-heading">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <ScrollReveal>
            <div className="rounded-2xl p-8" style={card}>
              <ShieldCheck className="odova-accent w-6 h-6 mb-4" aria-hidden="true" />
              <h2 id="privacy-heading" className="text-xl sm:text-2xl font-light text-white tracking-tight mb-4">
                Your records stay under your control
              </h2>
              <ul className="space-y-2 mb-6">
                {PRIVACY.map((item) => (
                  <li key={item} className="text-sm text-slate-300 font-light flex gap-2">
                    <span className="odova-accent" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/odova/privacy-policy/" className="text-sm text-blue-400 underline">
                  Read the privacy policy
                </Link>
                <Link href="/odova/terms/" className="text-sm text-blue-400 underline">
                  Terms of use
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-24 border-t border-slate-800/50" aria-labelledby="faq-heading">
        <div className="max-w-3xl mx-auto px-6 sm:px-10">
          <ScrollReveal className="mb-10">
            <p className="text-xs font-semibold tracking-widest odova-accent uppercase mb-3">Questions</p>
            <h2 id="faq-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Good to know
            </h2>
          </ScrollReveal>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl p-6" style={card}>
                <h3 className="text-base font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-slate-400 font-light leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <PlayButton />
          </div>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 sm:px-10 pb-16 pt-4 text-center text-xs text-slate-500">
        Odova is made by{' '}
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
