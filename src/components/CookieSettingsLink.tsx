'use client';

import { OPEN_CONSENT_SETTINGS_EVENT } from '@/lib/consent';

/** Re-opens ConsentBanner so a visitor can change an earlier choice — GDPR
 * requires withdrawing consent to be as easy as giving it. */
export default function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_CONSENT_SETTINGS_EVENT))}
      className={`text-left bg-transparent border-0 p-0 cursor-pointer ${className ?? ''}`}
    >
      Cookie Settings
    </button>
  );
}
