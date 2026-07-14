'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Resets window scroll on client navigations so sticky header stays visible
 * at the top of each page (Next.js can preserve scroll position otherwise).
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Prefer instant reset so sticky header does not stay "scrolled away".
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);

  return null;
}
