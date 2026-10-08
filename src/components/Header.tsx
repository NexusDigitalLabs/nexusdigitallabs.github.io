'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import AuthMenu, { AuthMenuMobile } from '@/components/AuthMenu';
import { scrollToSectionId, setHomeHash, setHomeSectionIntent, setHomeTopIntent } from '@/lib/scroll';
import BrandMark from '@/components/BrandMark';

// ── Types ─────────────────────────────────────────────────────────────────────
type BadgeColor = 'violet' | 'emerald' | 'sky' | 'amber' | 'blue' | 'slate';

interface Badge {
  label: string;
  color: BadgeColor;
}

type NavLink =
  | { kind: 'section'; sectionId: string; label: string }
  | { kind: 'page'; href: string; label: string };

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV_LINKS: NavLink[] = [
  { kind: 'section', sectionId: 'academy', label: 'Academy' },
  { kind: 'section', sectionId: 'tools', label: 'Tools' },
  { kind: 'section', sectionId: 'articles', label: 'Articles' },
  { kind: 'section', sectionId: 'games', label: 'Games' },
  { kind: 'page', href: '/freelanceos/', label: 'FreelanceOS' },
  { kind: 'page', href: '/about/', label: 'About' },
  { kind: 'page', href: '/contact/', label: 'Contact' },
];

// ── Page-context badges ───────────────────────────────────────────────────────
const BADGES: Record<string, Badge> = {
  '/tools/prompt-architect/':  { label: 'Prompt Architect',  color: 'violet'  },
  '/tools/json-engine/':       { label: 'JSON Engine',       color: 'blue'    },
  '/tools/svg-studio/':        { label: 'SVG Studio',        color: 'emerald' },
  '/tools/env-formatter/':     { label: 'Env Formatter',     color: 'slate'   },
  '/tools/prompt-packager/':   { label: 'Prompt Packager',   color: 'violet'  },
  '/tools/invoice-generator/': { label: 'Invoice Generator', color: 'emerald' },
  '/tools/debt-optimizer/':    { label: 'Debt Optimizer',    color: 'sky'     },
  '/tools/fuel-tracker/':      { label: 'Fuel Tracker',      color: 'amber'   },
  '/games/2048/':              { label: '2048',              color: 'amber'   },
  '/games/snake/':             { label: 'Snake',             color: 'amber'   },
  '/games/blackjack/':         { label: 'Blackjack',         color: 'amber'   },
  '/games/sudoku/':            { label: 'Sudoku',            color: 'violet'  },
  '/games/gridlock/':          { label: 'Gridlock',          color: 'sky'     },
  '/games/sumoku/':            { label: 'Sumoku',            color: 'emerald' },
  '/games/cryptic-paths/':     { label: 'Cryptic Paths',     color: 'violet'  },
  '/games/semantic-shift/':    { label: 'Semantic Shift',    color: 'amber'   },
  '/games/':                   { label: 'Games',             color: 'amber'   },
  '/academy/':                 { label: 'Academy',           color: 'violet'  },
  '/articles/':                { label: 'Article',           color: 'blue'    },
  '/freelanceos/':             { label: 'FreelanceOS',       color: 'blue'    },
  '/about/':                   { label: 'About',             color: 'slate'   },
  '/contact/':                 { label: 'Contact',           color: 'slate'   },
};

const BADGE_CLASSES: Record<BadgeColor, string> = {
  violet:  'text-violet-400 bg-violet-500/10 border border-violet-500/25',
  emerald: 'text-emerald-400 bg-emerald-900/30 border border-emerald-400/25',
  sky:     'text-sky-400 bg-sky-500/10 border border-sky-400/25',
  amber:   'text-amber-400 bg-amber-500/10 border border-amber-400/25',
  blue:    'text-blue-400 bg-blue-600/10 border border-blue-400/25',
  slate:   'text-slate-400 bg-slate-900/40 border border-slate-600/40',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function detectBadge(pathname: string): Badge | null {
  for (const [prefix, badge] of Object.entries(BADGES)) {
    if (pathname.startsWith(prefix.replace(/\/$/, '')) || pathname === prefix) {
      return badge;
    }
  }
  return null;
}

function isActive(link: NavLink, pathname: string): boolean {
  if (link.kind === 'section') {
    if (link.sectionId === 'academy') return pathname.startsWith('/academy');
    if (link.sectionId === 'tools') return pathname.startsWith('/tools');
    if (link.sectionId === 'articles') return pathname.startsWith('/articles');
    if (link.sectionId === 'games') return pathname.startsWith('/games');
    return false;
  }
  // Page links are active on their page and anything beneath it.
  const base = link.href.replace(/\/$/, '');
  return pathname === base || pathname.startsWith(`${base}/`);
}

/** Section landing pages, where the context badge would just repeat the active nav item. */
const NAV_ROOTS = new Set(['/academy', '/articles', '/games', '/freelanceos', '/about', '/contact']);

function badgeDuplicatesNav(pathname: string): boolean {
  return NAV_ROOTS.has(pathname.replace(/\/$/, ''));
}

// Desktop nav item: pill that lights up on hover and stays lit (accent) when active.
const NAV_ITEM_BASE =
  'text-sm no-underline cursor-pointer border px-3.5 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap';
const NAV_ITEM_IDLE = 'border-transparent hover:bg-[var(--ndl-surface-2)]';

function navItemStyle(active: boolean): React.CSSProperties {
  return active
    ? {
        color: 'var(--ndl-text)',
        background: 'color-mix(in srgb, var(--ndl-accent) 14%, transparent)',
        borderColor: 'color-mix(in srgb, var(--ndl-accent) 38%, transparent)',
        boxShadow: '0 0 18px color-mix(in srgb, var(--ndl-accent) 22%, transparent)',
      }
    : { color: 'var(--ndl-muted)' };
}

function MenuIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function navKey(link: NavLink): string {
  return link.kind === 'section' ? `section-${link.sectionId}` : link.href;
}

/** For useSyncExternalStore: true on the client, false during SSR/hydration. */
const subscribeNoop = () => () => {};

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // The drawer renders through a portal (the header's backdrop-filter would
  // otherwise trap `position: fixed` children inside the 64px header bar).
  const portalReady = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const pathname = usePathname();
  const router = useRouter();
  const badge = badgeDuplicatesNav(pathname) ? null : detectBadge(pathname);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => {
      setIsDesktop(mq.matches);
      // Drawer is mobile-only — close it if the viewport grows past md.
      if (mq.matches) setMobileOpen(false);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  // While the drawer is open: lock page scroll, close on Escape, move focus
  // into the drawer; on close, return focus to the menu button.
  useEffect(() => {
    if (!mobileOpen) {
      if (wasOpen.current) menuButtonRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => drawerCloseRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
    };
  }, [mobileOpen]);

  function goHomeSection(sectionId: string) {
    setMobileOpen(false);
    const onHome = pathname === '/' || pathname === '';
    if (onHome) {
      setHomeHash(sectionId, 'replace');
      window.requestAnimationFrame(() => {
        scrollToSectionId(sectionId, 'smooth');
      });
      return;
    }
    // App Router often restores a stale `/#tools` (or drops the hash) on soft
    // navigations — park the intent, then go to `/` and let ScrollToTop apply it.
    setHomeSectionIntent(sectionId);
    router.push('/', { scroll: false });
  }

  function goHome() {
    setMobileOpen(false);
    if (pathname === '/' || pathname === '') {
      setHomeHash('', 'replace');
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      return;
    }
    // Clear any stale `/#tools` Next might restore when returning to `/`.
    setHomeTopIntent();
    router.push('/', { scroll: false });
  }

  return (
    <header
      className="sticky top-0 z-[9999] border-b"
      style={{
        background: 'var(--ndl-header)',
        borderColor: 'var(--ndl-border)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        // Clears Dynamic Island / status bar when installed as a PWA (viewport-fit=cover).
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 h-16 flex items-center gap-3 sm:gap-6 min-w-0">

        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 no-underline flex-shrink-0 min-w-0"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          <BrandMark size={32} />
          <span className="text-sm font-semibold tracking-tight truncate" style={{ color: 'var(--ndl-text)' }}>
            NexusDigitalLabs
          </span>
        </Link>

        <nav className="flex-1 hidden md:flex items-center justify-center gap-1 lg:gap-2">
          {NAV_LINKS.map((link) => {
            const active = isActive(link, pathname);
            const className = `${NAV_ITEM_BASE} ${active ? '' : NAV_ITEM_IDLE}`;
            const style = navItemStyle(active);

            if (link.kind === 'section') {
              return (
                <button
                  key={navKey(link)}
                  type="button"
                  className={className}
                  style={style}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => goHomeSection(link.sectionId)}
                >
                  {link.label}
                </button>
              );
            }

            return (
              <Link
                key={navKey(link)}
                href={link.href}
                className={className}
                style={style}
                aria-current={active ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {badge && (
            <span className={`hidden md:inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap ${BADGE_CLASSES[badge.color]}`}>
              {badge.label}
            </span>
          )}

          {/* Desktop only — mobile uses Theme section inside the hamburger drawer */}
          {isDesktop && <ThemeToggle />}
          <AuthMenu />

          <button
            ref={menuButtonRef}
            className="md:hidden p-2 -mr-1 transition-colors shrink-0"
            style={{ color: 'var(--ndl-muted)' }}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-drawer"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {portalReady &&
        createPortal(
          <div
            className="md:hidden"
            // Closed: visibility hides it from screen readers/tab order once the
            // slide-out finishes (the delay keeps the exit animation visible).
            style={{
              visibility: mobileOpen ? 'visible' : 'hidden',
              transition: mobileOpen ? 'visibility 0s' : 'visibility 0s linear 300ms',
            }}
          >
            {/* Backdrop — tap to close */}
            <div
              aria-hidden="true"
              className="fixed inset-0 z-[10002] transition-opacity duration-300 motion-reduce:transition-none"
              style={{ background: 'rgba(2, 6, 23, 0.6)', backdropFilter: 'blur(2px)', opacity: mobileOpen ? 1 : 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <aside
              id="mobile-nav-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="fixed inset-y-0 right-0 z-[10003] flex w-[84vw] max-w-sm flex-col overflow-y-auto border-l shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none"
              style={{
                background: 'var(--ndl-surface)',
                borderColor: 'var(--ndl-border)',
                transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
                paddingTop: 'env(safe-area-inset-top, 0px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              }}
            >
              <div className="flex h-16 shrink-0 items-center justify-between border-b px-6" style={{ borderColor: 'var(--ndl-border)' }}>
                <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--ndl-text)' }}>
                  Menu
                </span>
                <button
                  ref={drawerCloseRef}
                  type="button"
                  className="p-2 -mr-2 transition-colors"
                  style={{ color: 'var(--ndl-muted)' }}
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <nav aria-label="Mobile" className="px-6 py-5 flex flex-col gap-4">
                {NAV_LINKS.map((link) => {
                  const active = isActive(link, pathname);
                  const mobileClass = 'text-sm text-left transition-colors no-underline cursor-pointer bg-transparent border-0 border-l-2 pl-3 -ml-3';
                  const mobileStyle = {
                    color: active ? 'var(--ndl-text)' : 'var(--ndl-text-secondary)',
                    borderLeftColor: active ? 'var(--ndl-accent)' : 'transparent',
                    fontWeight: active ? 600 : undefined,
                  };
                  return link.kind === 'section' ? (
                    <button
                      key={navKey(link)}
                      type="button"
                      className={mobileClass}
                      style={mobileStyle}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => goHomeSection(link.sectionId)}
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={navKey(link)}
                      href={link.href}
                      className={mobileClass}
                      style={mobileStyle}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <div className="pt-2" style={{ borderTop: '1px solid var(--ndl-border)' }}>
                  <p className="text-[0.65rem] font-semibold tracking-widest uppercase mb-2.5" style={{ color: 'var(--ndl-faint)' }}>
                    Account
                  </p>
                  <AuthMenuMobile onNavigate={() => setMobileOpen(false)} />
                </div>
                <div className="pt-2" style={{ borderTop: '1px solid var(--ndl-border)' }}>
                  <p className="text-[0.65rem] font-semibold tracking-widest uppercase mb-2.5" style={{ color: 'var(--ndl-faint)' }}>
                    Theme
                  </p>
                  <ThemeToggle showLabels />
                </div>
              </nav>
            </aside>
          </div>,
          document.body
        )}
    </header>
  );
}
