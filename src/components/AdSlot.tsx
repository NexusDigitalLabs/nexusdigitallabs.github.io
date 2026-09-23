'use client';

import { useEffect, useRef, useState } from 'react';
import { getStoredConsent, CONSENT_CHANGED_EVENT } from '@/lib/consent';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * A single AdSense ad unit. Same gating as AdSenseScript.tsx (which loads
 * the underlying script in layout.tsx): renders nothing unless a publisher
 * ID AND a slot ID are both set AND the visitor has granted ad consent.
 * Safe no-op today — no account exists yet, so this renders nothing
 * anywhere it's placed. Once approved, set NEXT_PUBLIC_ADSENSE_CLIENT_ID
 * and pass this component a real `slot` id; no other change needed.
 */
export default function AdSlot({ slot, label = 'Advertisement' }: { slot?: string; label?: string }) {
  const [granted, setGranted] = useState(false);
  const pushedRef = useRef(false);

  useEffect(() => {
    setGranted(getStoredConsent() === 'granted');
    function handleChange(e: Event) {
      setGranted((e as CustomEvent<'granted' | 'denied'>).detail === 'granted');
    }
    window.addEventListener(CONSENT_CHANGED_EVENT, handleChange);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleChange);
  }, []);

  const active = Boolean(ADSENSE_CLIENT_ID && slot && granted);

  useEffect(() => {
    if (!active || pushedRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch {
      /* adsbygoogle.js not loaded yet — nothing to recover, next mount retries */
    }
  }, [active]);

  if (!active) return null;

  return (
    <div className="my-8">
      <p className="text-[0.6rem] font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--ndl-faint)' }}>
        {label}
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
