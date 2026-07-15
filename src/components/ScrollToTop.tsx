'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  isHomeSectionId,
  scrollToSectionId,
  setHomeHash,
  takeHomeNavIntent,
} from '@/lib/scroll';

/**
 * On route change:
 * - prefer pending home-nav intent (header) over a stale URL hash
 * - if URL has a valid section hash, scroll there
 * - otherwise reset to top
 *
 * Next App Router can restore a previous `/#tools` when returning to `/`,
 * which previously made Articles/Games nav land on Tools.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const onHome = pathname === '/' || pathname === '';

    if (!onHome) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    const intent = takeHomeNavIntent();

    if (intent?.type === 'top') {
      setHomeHash('', 'replace');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    const hashId = normalizeHash(window.location.hash);
    const id = intent?.type === 'section'
      ? intent.id
      : isHomeSectionId(hashId)
        ? hashId
        : '';

    if (!id) {
      if (window.location.hash) setHomeHash('', 'replace');
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return undefined;
    }

    setHomeHash(id, 'replace');

    let attempts = 0;
    let raf = 0;
    const tryScroll = () => {
      attempts += 1;
      if (scrollToSectionId(id, 'smooth')) return;
      if (attempts < 20) {
        raf = window.requestAnimationFrame(tryScroll);
        return;
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const t = window.setTimeout(tryScroll, 0);
    return () => {
      window.clearTimeout(t);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [pathname]);

  return null;
}

function normalizeHash(hash: string): string {
  return hash.replace(/^#/, '').split('#')[0]?.trim() ?? '';
}
