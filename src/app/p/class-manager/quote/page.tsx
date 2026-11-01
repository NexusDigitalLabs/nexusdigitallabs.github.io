import type { Metadata } from 'next';
import ClassManagerNav from '../ClassManagerNav';
import QuoteBuilderClient from './QuoteBuilderClient';

export const metadata: Metadata = {
  title: { absolute: 'Class Manager — Get a quote' },
  description: 'Pick the features your tuition classes need and see set-up and monthly prices in LKR.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/p/class-manager/quote/' },
};

export default function ClassManagerQuotePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 sm:px-6 lg:pb-16">
      <ClassManagerNav active="quote" />
      <header className="mt-10 mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ndl-text)] sm:text-4xl text-balance">
          Build your class system
        </h1>
        <p className="mt-3 text-[var(--ndl-text-secondary)]">
          Pick what your classes need. The price updates as you go, in Sri Lankan rupees. Hosting, backups and
          support are always included.
        </p>
      </header>
      <QuoteBuilderClient />
    </div>
  );
}
