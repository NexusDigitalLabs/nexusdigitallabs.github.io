'use client';

import { type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ThemeToggle from '@/components/ThemeToggle';

/**
 * Full site chrome everywhere except private /p/* routes,
 * which only keep the theme toggle (no nav / auth / footer).
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPrivatePortfolio = Boolean(pathname?.startsWith('/p/'));

  if (isPrivatePortfolio) {
    return (
      <>
        <div
          className="fixed top-0 right-0 z-50 p-3 sm:p-4"
          style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
        >
          <ThemeToggle />
        </div>
        <div className="flex-1 flex flex-col min-h-0">{children}</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
