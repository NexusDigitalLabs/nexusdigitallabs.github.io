import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

const DESTINATIONS = [
  { href: '/#tools', label: 'Tools', note: 'Prompt, JSON, SVG, invoice and fuel utilities' },
  { href: '/articles/', label: 'Articles', note: 'Practical guides on AI, freelancing and money' },
  { href: '/games/', label: 'Games', note: 'Free browser games, no download' },
  { href: '/academy/', label: 'Academy', note: 'A free AI engineering course' },
];

export default function NotFound() {
  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>
        Error 404
      </p>
      <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
        We couldn’t find that page
      </h1>
      <p className="text-sm sm:text-base font-light leading-relaxed mb-10" style={{ color: 'var(--ndl-muted)' }}>
        The link may be out of date or the address mistyped. These are the places most people are looking for.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 mb-10">
        {DESTINATIONS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="block rounded-xl px-5 py-4 no-underline transition-colors"
            style={{ background: 'var(--ndl-surface)', border: '1px solid var(--ndl-border)' }}
          >
            <span className="block text-sm font-semibold mb-1" style={{ color: 'var(--ndl-text)' }}>
              {d.label}
            </span>
            <span className="block text-xs font-light" style={{ color: 'var(--ndl-muted)' }}>
              {d.note}
            </span>
          </Link>
        ))}
      </div>

      <Link href="/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
        ← Back to the homepage
      </Link>
    </section>
  );
}
