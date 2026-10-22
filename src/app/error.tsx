'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[app error boundary]', error);
  }, [error]);

  return (
    <section className="max-w-3xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
      <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--ndl-accent)' }}>
        Something went wrong
      </p>
      <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-4" style={{ color: 'var(--ndl-text)' }}>
        This page hit an unexpected problem
      </h1>
      <p className="text-sm sm:text-base font-light leading-relaxed mb-8" style={{ color: 'var(--ndl-muted)' }}>
        It is not you. Try again, and if it keeps happening, head back to the homepage or let us know through the
        contact page.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-full px-5 py-2.5 text-sm font-semibold ndl-on-accent"
          style={{ background: 'var(--ndl-accent)' }}
        >
          Try again
        </button>
        <Link href="/" className="text-sm no-underline" style={{ color: 'var(--ndl-accent)' }}>
          Go to the homepage
        </Link>
        <Link href="/contact/" className="text-sm no-underline" style={{ color: 'var(--ndl-muted)' }}>
          Contact us
        </Link>
      </div>
    </section>
  );
}
