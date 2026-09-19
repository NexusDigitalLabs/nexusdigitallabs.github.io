'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getStoredConsent, CONSENT_CHANGED_EVENT } from '@/lib/consent';

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
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    setGranted(getStoredConsent() === 'granted');
    function handleChange(e: Event) {
      setGranted((e as CustomEvent<'granted' | 'denied'>).detail === 'granted');
    }
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  if (!ADSENSE_CLIENT_ID || !granted) return null;

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
