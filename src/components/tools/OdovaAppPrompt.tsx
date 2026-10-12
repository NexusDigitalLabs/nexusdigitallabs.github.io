'use client';

import { useEffect } from 'react';
import { odovaPlayUrl } from '@/lib/odova-app';

export type AppPromptFeature = 'vehicles' | 'export';

const COPY: Record<AppPromptFeature, { title: string; body: string; campaign: string }> = {
  vehicles: {
    title: 'More vehicles are in the Odova app',
    body: 'The web tracker covers one vehicle, the same as the free plan in the app. Get Odova for Android to track every vehicle in one garage, with maintenance reminders and CSV export.',
    campaign: 'fuel_tracker_vehicles',
  },
  export: {
    title: 'CSV export is in the Odova app',
    body: 'Exporting your full fill-up and service history to CSV is part of Odova Pro in the Android app. Your garage loads there with the same sync code.',
    campaign: 'fuel_tracker_export',
  },
};

export default function OdovaAppPrompt({
  feature,
  onClose,
}: {
  feature: AppPromptFeature | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!feature) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [feature, onClose]);

  if (!feature) return null;
  const { title, body, campaign } = COPY[feature];

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="odova-app-prompt-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '26rem', background: 'var(--ndl-surface)',
          border: '1px solid var(--ndl-border)', padding: '1.75rem',
        }}
      >
        <h2 id="odova-app-prompt-title" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--ndl-text)', marginBottom: '0.75rem' }}>
          {title}
        </h2>
        <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--ndl-muted)', marginBottom: '1.25rem' }}>{body}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <a href={odovaPlayUrl(campaign)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/badges/google-play-badge.png" alt="Get it on Google Play" width={148} height={44} style={{ display: 'block', height: '2.75rem', width: 'auto' }} />
          </a>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--ndl-border)', color: 'var(--ndl-text)', padding: '0.5rem 1rem', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer' }}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
