import Link from 'next/link';
import { Images, Lock, Merge, Minimize2, Moon, Scissors, ShieldCheck, WifiOff } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { pageMetadata, SITE_URL } from '@/lib/seo';

const PATH = '/pdfly/';
const TITLE = 'PDFly — Compress, Merge and Split PDFs on Your Phone';
const DESCRIPTION =
  'Shrink big PDFs, merge several into one, split out the pages you need, or turn photos into a PDF. Everything happens on your phone, nothing is uploaded, and there is no account.';

/** The live Play Store listing. Set to null to show a "coming soon" pill instead. */
const PLAY_URL: string | null = 'https://play.google.com/store/apps/details?id=dev.nexusdigitallabs.pdfly';

export const metadata = pageMetadata({
  title: TITLE,
  absoluteTitle: true,
  description: DESCRIPTION,
  path: PATH,
  keywords: [
    'PDFly',
    'compress PDF',
    'merge PDF',
    'split PDF',
    'images to PDF',
    'PDF tools Android',
    'offline PDF editor',
    'private PDF app',
  ],
  ogTitle: 'PDFly — your private PDF toolbox',
  ogDescription: 'Compress, merge, split and convert PDFs on your phone. Nothing is uploaded. No account.',
});

const SCREENS = [
  { src: '/pdfly/01-home.jpg', alt: 'PDFly home screen with the four PDF tools' },
  { src: '/pdfly/02-compress.jpg', alt: 'Compress screen with a large PDF chosen and a quality selector' },
  { src: '/pdfly/03-saved.jpg', alt: 'Result screen showing a PDF made 93 percent smaller' },
  { src: '/pdfly/04-merge.jpg', alt: 'Merge screen with three PDFs listed in order' },
  { src: '/pdfly/05-split.jpg', alt: 'Split screen with a page range slider' },
];

const FEATURES = [
  {
    icon: Minimize2,
    title: 'Compress',
    desc: 'Make a large PDF small enough to email or upload. Pick Low, Medium or High quality, and see exactly how much you saved.',
  },
  {
    icon: Merge,
    title: 'Merge',
    desc: 'Combine several PDFs into one document. Drag them into the order you want and add more at any time.',
  },
  {
    icon: Scissors,
    title: 'Split',
    desc: 'Pull out just the pages you need. Choose the first and last page with a simple slider.',
  },
  {
    icon: Images,
    title: 'Photos to PDF',
    desc: 'Turn pictures from your library into a single PDF, one photo per page, in the order you choose.',
  },
  {
    icon: WifiOff,
    title: 'Works offline',
    desc: 'No connection needed. PDFly does its work on your phone, so it is fast and works on a plane.',
  },
  {
    icon: Moon,
    title: 'Light and dark',
    desc: 'A clean design that follows your phone, with a dark theme for night time.',
  },
];

const STEPS = [
  { title: 'Pick a tool', desc: 'Compress, merge, split or photos to PDF. One tap from the home screen.' },
  { title: 'Choose your files', desc: 'Select PDFs from your files or photos from your library. Set the quality or page range.' },
  { title: 'Share the result', desc: 'Send it to Mail, Messages or any app, or save it to your files.' },
];

const PRIVACY = [
  'Your files never leave your phone',
  'No account and no sign-up',
  'No analytics inside the app',
  'Free, supported by ads that you can control in Settings',
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDFly',
    url: `${SITE_URL}${PATH}`,
    description: DESCRIPTION,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Android',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    ...(PLAY_URL ? { downloadUrl: PLAY_URL, installUrl: PLAY_URL } : {}),
    featureList: FEATURES.map((f) => f.title),
    publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: `${SITE_URL}/` },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'PDFly', item: `${SITE_URL}${PATH}` },
    ],
  },
];

const card = { background: 'var(--ndl-card-bg)', border: '1px solid var(--ndl-border)' } as const;

/** PDFly's violet accent, readable on both site themes (the site switches via [data-theme]). */
const ACCENT_CSS = `
.pdfly-accent{color:#A78BFA}
.pdfly-dot{background:#A78BFA}
.pdfly-chip{color:#DDD6FE;background:rgba(139,92,246,.14);border:1px solid rgba(167,139,250,.34)}
[data-theme="light"] .pdfly-accent{color:#6D28D9}
[data-theme="light"] .pdfly-dot{background:#6D28D9}
[data-theme="light"] .pdfly-chip{color:#5B21B6;background:#EDE9FE;border-color:#C4B5FD}
`;

function PlayButton() {
  if (PLAY_URL) {
    return (
      <a href={PLAY_URL} className="inline-block no-underline" aria-label="Get PDFly on Google Play">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/badges/google-play-badge.png" alt="Get it on Google Play" width={180} height={53} />
      </a>
    );
  }
  return (
    <span
      className="pdfly-chip inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl"
      role="status"
    >
      Coming soon on Google Play
    </span>
  );
}

export default function PdflyPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <style>{ACCENT_CSS}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="ndl-orb ndl-orb-1" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 pt-20 sm:pt-28 pb-16 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest pdfly-accent uppercase mb-5">
              <span className="pdfly-dot w-1.5 h-1.5 rounded-full" aria-hidden="true" />
              Android · Free
            </p>
            <div className="flex items-center gap-4 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/pdfly/pdfly-icon.png" alt="" width={64} height={64} className="rounded-2xl" />
              <span className="text-2xl font-semibold text-white tracking-tight">PDFly</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-light text-white tracking-tight leading-[1.1] mb-6">
              Your PDF toolbox. <span className="pdfly-accent">Private by design.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 font-light leading-relaxed mb-8 max-w-xl">
              Compress, merge and split PDFs, or turn photos into a PDF. Everything happens on your phone, so your files
              are never uploaded and you never need an account.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PlayButton />
              <span
                className="pdfly-chip inline-flex items-center text-sm font-semibold px-5 h-[53px] rounded-xl"
                role="status"
              >
                iPhone · coming soon
              </span>
              <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white no-underline">
                See how it works
              </a>
            </div>
            <p className="mt-5 text-xs text-slate-500">No account · No uploads · Works offline</p>
          </div>
          <ScrollReveal>
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SCREENS[0].src}
                alt={SCREENS[0].alt}
                width={540}
                height={1173}
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
                height={1173}
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
            <p className="text-xs font-semibold tracking-widest pdfly-accent uppercase mb-3">What&apos;s inside</p>
            <h2 id="features-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Four tools for the PDF jobs you do every week.
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <ScrollReveal key={f.title} delay={(i % 3) * 120}>
                <div className="h-full rounded-2xl p-6" style={card}>
                  <f.icon className="pdfly-accent w-6 h-6 mb-4" aria-hidden="true" />
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
            <p className="text-xs font-semibold tracking-widest pdfly-accent uppercase mb-3">How it works</p>
            <h2 id="how-heading" className="text-2xl sm:text-3xl font-light text-white tracking-tight">
              Three taps from file to finished.
            </h2>
          </ScrollReveal>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="rounded-2xl p-6" style={card}>
                <span className="pdfly-chip inline-flex w-8 h-8 rounded-full items-center justify-center text-sm font-semibold mb-4">
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
              <ShieldCheck className="pdfly-accent w-6 h-6 mb-4" aria-hidden="true" />
              <h2 id="privacy-heading" className="text-xl sm:text-2xl font-light text-white tracking-tight mb-4">
                Your files stay yours
              </h2>
              <ul className="space-y-2 mb-6">
                {PRIVACY.map((item) => (
                  <li key={item} className="text-sm text-slate-300 font-light flex gap-2">
                    <span className="pdfly-accent" aria-hidden="true">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/pdfly/privacy-policy/" className="text-sm text-blue-400 underline">
                  Read the privacy policy
                </Link>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                  Processed on your device
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <footer className="max-w-7xl mx-auto px-6 sm:px-10 pb-16 pt-4 text-center text-xs text-slate-500">
        PDFly is made by{' '}
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
