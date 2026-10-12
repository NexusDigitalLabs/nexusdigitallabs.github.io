'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { EVENT_COOKIE, decodeEvents, type AnalyticsEvent } from '@/lib/analytics-events';

type Umami = { track: (event: string, data?: Record<string, string | number>) => void };

/** Send an event to Umami, waiting briefly for its script (afterInteractive) to load. */
export function trackEvent(event: AnalyticsEvent | string, data?: Record<string, string | number>) {
  let tries = 0;
  const send = () => {
    const umami = (window as Window & { umami?: Umami }).umami;
    if (umami) umami.track(event, data);
    else if (tries++ < 20) window.setTimeout(send, 250);
  };
  send();
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

/** Delivers events queued by the server (src/lib/analytics-server.ts). Renders nothing. */
export default function AnalyticsFlush() {
  const pathname = usePathname();

  useEffect(() => {
    const events = decodeEvents(readCookie(EVENT_COOKIE));
    if (events.length) {
      document.cookie = `${EVENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
      events.forEach((e) => trackEvent(e));
    }
  }, [pathname]);

  return null;
}

/** Sends `event` once per browser for `onceKey` (e.g. a new workspace's id). */
export function TrackOnce({ event, onceKey }: { event: AnalyticsEvent; onceKey: string }) {
  useEffect(() => {
    const key = `ndl_tracked_${event}_${onceKey}`;
    try {
      if (localStorage.getItem(key)) return;
      localStorage.setItem(key, '1');
    } catch {
      /* storage unavailable — still track once per mount */
    }
    trackEvent(event);
  }, [event, onceKey]);

  return null;
}
