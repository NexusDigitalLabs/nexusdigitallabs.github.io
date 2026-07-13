'use client';

import { useEffect, useRef } from 'react';

interface Props {
  children: React.ReactNode;
  className?: string;
  /** CSS transition-delay applied when the element becomes visible. */
  delay?: number; // milliseconds
  threshold?: number;
}

/**
 * ScrollReveal — wraps children in an Intersection Observer.
 * When the element enters the viewport, the `ndl-revealed` class is added,
 * triggering the transition defined in globals.css.
 *
 * Uses `useEffect` so the initial server-rendered HTML is visible immediately
 * (no flash of invisible content on fast connections), with the observer
 * attaching only in the browser.
 */
export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  threshold = 0.12,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('ndl-revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`ndl-reveal ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
