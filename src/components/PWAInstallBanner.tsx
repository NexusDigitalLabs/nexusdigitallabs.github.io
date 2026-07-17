'use client';

import { useState, useEffect } from 'react';

declare global {
  interface Navigator {
    standalone?: boolean;
  }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ndl_pwa_dismissed';

/**
 * Mobile-only install prompt for the whole-site PWA.
 * Android/Chrome: uses beforeinstallprompt. Samsung Internet: directs users
 * to Chrome because Samsung's WebAPK minting server targets an outdated SDK.
 * iOS: Share → Add to Home Screen tips.
 */
export default function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSamsungInternet, setIsSamsungInternet] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true;
    if (isStandalone) return;

    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* ignore */
    }

    const ua = navigator.userAgent;
    const onSamsungInternet = /SamsungBrowser/i.test(ua);
    const onIOS =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as Window & { MSStream?: unknown }).MSStream;
    const onMobile = onIOS || /Android/i.test(ua) || window.innerWidth < 768;
    if (!onMobile) return;

    if (onIOS) {
      setIsIOS(true);
      setShow(true);
      return;
    }

    if (onSamsungInternet) {
      setIsSamsungInternet(true);
      setShow(true);

      // Suppress any page-driven Samsung install prompt. Users can still use
      // the browser menu, so the visible guidance explicitly directs to Chrome.
      const blockSamsungPrompt = (e: Event) => e.preventDefault();
      window.addEventListener('beforeinstallprompt', blockSamsungPrompt);
      return () => window.removeEventListener('beforeinstallprompt', blockSamsungPrompt);
    }

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
    if (outcome === 'accepted') setShow(false);
    setInstalling(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Install NexusDigitalLabs"
      className="fixed z-[60] left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-sm"
      style={{
        bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom, 0px) + 4.75rem))',
        background: 'var(--ndl-surface)',
        border: '1px solid color-mix(in srgb, var(--ndl-accent) 35%, var(--ndl-border))',
        boxShadow: '0 8px 32px color-mix(in srgb, var(--ndl-accent) 18%, transparent)',
        borderRadius: 12,
        padding: '0.875rem 1rem',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 shrink-0 flex items-center justify-center text-sm font-bold ndl-on-accent"
          style={{
            background: 'linear-gradient(135deg,#2563eb,#6366f1)',
            borderRadius: 10,
          }}
          aria-hidden="true"
        >
          N
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[0.8125rem] font-bold m-0 mb-1" style={{ color: 'var(--ndl-text)' }}>
            Install NexusDigitalLabs
          </p>

          {isIOS ? (
            <p className="text-xs m-0 leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Tap{' '}
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--ndl-accent)' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0L8 6m4-4v13"
                  />
                </svg>
                Share
              </span>{' '}
              then <strong style={{ color: 'var(--ndl-text)' }}>Add to Home Screen</strong> for a full-screen app
              experience.
            </p>
          ) : isSamsungInternet ? (
            <p className="text-xs m-0 leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Samsung Internet currently creates an outdated Android installer.
              Open <strong style={{ color: 'var(--ndl-text)' }}>nexusdigitallabs.dev</strong> in{' '}
              <strong style={{ color: 'var(--ndl-accent)' }}>Google Chrome</strong>, then choose{' '}
              <strong style={{ color: 'var(--ndl-text)' }}>Install app</strong>.
            </p>
          ) : (
            <p className="text-xs m-0 mb-3 leading-relaxed" style={{ color: 'var(--ndl-muted)' }}>
              Install as an app — opens instantly, no browser chrome.
            </p>
          )}

          {!isIOS && !isSamsungInternet && (
            <button
              type="button"
              onClick={handleInstall}
              disabled={installing}
              className="mt-2 text-xs font-bold uppercase tracking-wide px-3 py-2 cursor-pointer disabled:opacity-70"
              style={{
                background: 'var(--ndl-accent)',
                border: 'none',
                color: '#fff',
                borderRadius: 8,
              }}
            >
              {installing ? 'Installing…' : '+ Add to Home Screen'}
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 leading-none text-base cursor-pointer p-0 bg-transparent border-none"
          style={{ color: 'var(--ndl-faint)' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
