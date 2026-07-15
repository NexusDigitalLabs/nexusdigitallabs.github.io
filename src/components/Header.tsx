'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import AuthMenu, { AuthMenuMobile } from '@/components/AuthMenu';
import { scrollToSectionId, setHomeHash, setHomeSectionIntent, setHomeTopIntent } from '@/lib/scroll';

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
  { kind: 'section', sectionId: 'tools', label: 'Tools' },
  { kind: 'section', sectionId: 'articles', label: 'Articles' },
  { kind: 'section', sectionId: 'games', label: 'Games' },
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
  '/games/':                   { label: 'Games',             color: 'amber'   },
  '/articles/':                { label: 'Article',           color: 'blue'    },
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
    if (link.sectionId === 'tools') return pathname.startsWith('/tools');
    if (link.sectionId === 'articles') return pathname.startsWith('/articles');
    if (link.sectionId === 'games') return pathname.startsWith('/games');
    return false;
  }
  if (link.href === '/about/') return pathname === '/about' || pathname === '/about/';
  if (link.href === '/contact/') return pathname === '/contact' || pathname === '/contact/';
  return false;
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const badge = detectBadge(pathname);

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
      }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center gap-6">

        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline flex-shrink-0"
          onClick={(e) => {
            e.preventDefault();
            goHome();
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold ndl-on-accent text-sm"
            style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)', boxShadow: '0 4px 14px rgba(37,99,235,0.28)' }}
          >
            N
          </div>
          <span className="text-sm font-semibold tracking-tight" style={{ color: 'var(--ndl-text)' }}>
            NexusDigitalLabs
          </span>
        </Link>

        <nav className="flex-1 hidden md:flex items-center justify-center gap-9">
          {NAV_LINKS.map((link) => {
            const active = isActive(link, pathname);
            const className = 'text-sm transition-colors duration-200 no-underline relative group cursor-pointer bg-transparent border-0 p-0';
            const style = { color: active ? 'var(--ndl-text)' : 'var(--ndl-muted)' } as const;

            if (link.kind === 'section') {
              return (
                <button
                  key={navKey(link)}
                  type="button"
                  className={className}
                  style={style}
                  onClick={() => goHomeSection(link.sectionId)}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-px bg-blue-500 transition-all duration-300 ${
                      active ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            }

            return (
              <Link
                key={navKey(link)}
                href={link.href}
                className={className}
                style={style}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-blue-500 transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {badge && (
            <span className={`hidden md:inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap ${BADGE_CLASSES[badge.color]}`}>
              {badge.label}
            </span>
          )}

          <ThemeToggle />
          <AuthMenu />

          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: 'var(--ndl-muted)' }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ background: 'var(--ndl-surface)', borderColor: 'var(--ndl-border)' }}
        >
          <nav className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map((link) =>
              link.kind === 'section' ? (
                <button
                  key={navKey(link)}
                  type="button"
                  className="text-sm text-left transition-colors no-underline cursor-pointer bg-transparent border-0 p-0"
                  style={{ color: 'var(--ndl-text-secondary)' }}
                  onClick={() => goHomeSection(link.sectionId)}
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={navKey(link)}
                  href={link.href}
                  className="text-sm transition-colors no-underline"
                  style={{ color: 'var(--ndl-text-secondary)' }}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
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
        </div>
      )}
    </header>
  );
}
