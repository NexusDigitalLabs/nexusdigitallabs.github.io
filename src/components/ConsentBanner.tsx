'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { reapplyStoredConsent, setConsent, OPEN_CONSENT_SETTINGS_EVENT } from '@/lib/consent';

/**
 * First-visit cookie/ad consent gate (Google Consent Mode v2) + the target
 * of the footer's "Cookie Settings" link. See lib/consent.ts's header
 * comment for what this does and doesn't satisfy re: AdSense's EEA/UK
 * certified-CMP requirement.
 */
export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = reapplyStoredConsent();
    if (!stored) setVisible(true);

    function handleReopen() {
      setVisible(true);
    }
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, handleReopen);
    return () => window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, handleReopen);
  }, []);

  function choose(state: 'granted' | 'denied') {
    setConsent(state);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie and advertising consent"
      className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4 sm:px-6 sm:pb-6"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div
        className="max-w-3xl mx-auto p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{
          background: 'var(--ndl-card-bg)',
          border: '1px solid var(--ndl-border)',
          borderRadius: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        <p className="text-sm font-light leading-relaxed flex-1" style={{ color: 'var(--ndl-text-secondary)' }}>
          We use cookies for essential site functionality, and — on pages where advertising is
          enabled — for ad measurement and personalisation. You can accept or decline the
          non-essential cookies. See our{' '}
          <Link href="/privacy-policy/" className="underline" style={{ color: 'var(--ndl-accent)' }}>
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => choose('denied')}
            className="text-xs font-semibold tracking-wide uppercase px-4 py-2.5 transition-colors"
            style={{ border: '1px solid var(--ndl-border)', color: 'var(--ndl-text)', borderRadius: 8, background: 'transparent' }}
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            className="text-xs font-semibold tracking-wide uppercase px-4 py-2.5 transition-colors"
            style={{ background: 'var(--ndl-accent)', color: '#fff', borderRadius: 8, border: '1px solid var(--ndl-accent)' }}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
