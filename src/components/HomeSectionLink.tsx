'use client';

import type { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  type HomeSectionId,
  scrollToSectionId,
  setHomeHash,
  setHomeSectionIntent,
} from '@/lib/scroll';

type Props = {
  sectionId: HomeSectionId;
  className?: string;
  style?: React.CSSProperties;
  children: ReactNode;
};

/**
 * Navigate to a homepage section from anywhere. Uses scroll-intent so App Router
 * cannot restore a stale `/#tools` hash (unlike plain Link href="/#…").
 */
export default function HomeSectionLink({ sectionId, className, style, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function go() {
    const onHome = pathname === '/' || pathname === '';
    if (onHome) {
      setHomeHash(sectionId, 'replace');
      window.requestAnimationFrame(() => {
        scrollToSectionId(sectionId, 'smooth');
      });
      return;
    }
    setHomeSectionIntent(sectionId);
    router.push('/', { scroll: false });
  }

  return (
    <button type="button" className={className} style={style} onClick={go}>
      {children}
    </button>
  );
}
