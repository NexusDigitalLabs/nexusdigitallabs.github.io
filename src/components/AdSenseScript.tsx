'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getStoredConsent, CONSENT_CHANGED_EVENT } from '@/lib/consent';
import { isAppPath } from '@/lib/freelanceos/paths';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/**
 * Loads the AdSense script only once BOTH are true:
 *  - NEXT_PUBLIC_ADSENSE_CLIENT_ID is set (i.e. approved + pub-id configured
 *    — see .env.local.example)
 *  - the visitor has granted consent via ConsentBanner
 * Safe no-op today: no publisher ID exists yet, so this renders nothing on
 * every page regardless of consent state. Once approved, set the env var —
 * no other code changes needed anywhere in the app.
 */
export default function AdSenseScript() {
  const pathname = usePathname();
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(getStoredConsent() === 'granted');
    function handleChange(e: Event) {
      setGranted((e as CustomEvent<'granted' | 'denied'>).detail === 'granted');
    }
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  // No ads inside FreelanceOS (signed-in business data). Only stops the
  // initial load: a script already loaded on a public page stays loaded, so
  // also exclude /app/* in the AdSense dashboard (Auto ads → page exclusions).
  if (!ADSENSE_CLIENT_ID || !granted || isAppPath(pathname)) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
