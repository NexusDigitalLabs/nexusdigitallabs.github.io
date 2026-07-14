'use client';

import { useState, useEffect } from 'react';

// Extend Window to include the non-standard iOS standalone property
declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallBanner() {
  const [show, setShow]                   = useState(false);
  const [isIOS, setIsIOS]                 = useState(false);
  const [installing, setInstalling]       = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already running as installed PWA — hide banner
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    if (isStandalone) return;

    // User previously dismissed — respect that
    try {
      if (localStorage.getItem('ndl_pwa_dismissed')) return;
    } catch { /* ignore */ }

    const ua = navigator.userAgent;
    const onIOS = /iPad|iPhone|iPod/.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    const onMobile = onIOS || /Android/i.test(ua) || window.innerWidth < 768;

    if (!onMobile) return;

    if (onIOS) {
      // iOS Safari doesn't fire beforeinstallprompt — show manual instructions
      setIsIOS(true);
      setShow(true);
      return;
    }

    // Android / Chrome — capture the native install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    try { localStorage.setItem('ndl_pwa_dismissed', '1'); } catch { /* ignore */ }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'calc(100% - 2rem)',
      maxWidth: '420px',
      background: 'var(--ndl-surface)',
      border: '1px solid rgba(245,158,11,0.35)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      padding: '1rem 1.25rem',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.875rem',
    }}>
      {/* Fuel icon */}
      <div style={{
        width: '40px', height: '40px', flexShrink: 0,
        background: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.25rem' }}>⛽</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--ndl-text)', margin: '0 0 0.25rem' }}>
          Add Fuel Tracker to your home screen
        </p>

        {isIOS ? (
          <p style={{ fontSize: '0.75rem', color: 'var(--ndl-muted)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
            Tap{' '}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b', fontWeight: 600 }}>
              {/* iOS Share icon */}
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0L8 6m4-4v13" />
              </svg>
              Share
            </span>
            {' '}then{' '}
            <strong style={{ color: 'var(--ndl-text)' }}>Add to Home Screen</strong>
            {' '}to use Fuel Tracker like a native app.
          </p>
        ) : (
          <p style={{ fontSize: '0.75rem', color: 'var(--ndl-muted)', margin: '0 0 0.75rem', lineHeight: 1.6 }}>
            Install as an app — works offline, opens instantly, no browser chrome.
          </p>
        )}

        {!isIOS && (
          <button
            type="button"
            onClick={handleInstall}
            disabled={installing}
            style={{
              background: '#f59e0b', border: 'none', color: '#0f172a',
              padding: '0.5rem 1rem', cursor: installing ? 'not-allowed' : 'pointer',
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', opacity: installing ? 0.7 : 1,
            }}
          >
            {installing ? 'Installing…' : '+ Add to Home Screen'}
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{
          background: 'none', border: 'none', color: 'var(--ndl-faint)',
          cursor: 'pointer', fontSize: '1rem', padding: '0',
          flexShrink: 0, lineHeight: 1,
        }}
      >
        ✕
      </button>
    </div>
  );
}
