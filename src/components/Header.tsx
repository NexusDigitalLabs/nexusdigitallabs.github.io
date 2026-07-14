'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import AuthMenu, { AuthMenuMobile } from '@/components/AuthMenu';

// ── Types ─────────────────────────────────────────────────────────────────────
type BadgeColor = 'violet' | 'emerald' | 'sky' | 'amber' | 'blue' | 'slate';

interface Badge {
  label: string;
  color: BadgeColor;
}

// ── Nav links ─────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { href: '/#tools',    label: 'Tools'    },
  { href: '/#articles', label: 'Articles' },
  { href: '/games/',    label: 'Games'    },
  { href: '/about/',    label: 'About'    },
  { href: '/contact/',  label: 'Contact'  },
];

// ── Page-context badges ───────────────────────────────────────────────────────
const BADGES: Record<string, Badge> = {
  '/tools/prompt-architect/':  { label: 'Prompt Architect',  color: 'violet'  },
  '/tools/invoice-generator/': { label: 'Invoice Generator', color: 'emerald' },
  '/tools/debt-optimizer/':    { label: 'Debt Optimizer',    color: 'sky'     },
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

function isActive(href: string, pathname: string): boolean {
  if (href === '/#tools')    return pathname.startsWith('/tools/');
  if (href === '/#articles') return pathname.startsWith('/articles/');
  if (href === '/games/')    return pathname.startsWith('/games/');
  if (href === '/about/')    return pathname === '/about' || pathname === '/about/';
  if (href === '/contact/')  return pathname === '/contact' || pathname === '/contact/';
  return false;
}

// ── SVG icons ─────────────────────────────────────────────────────────────────
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const badge = detectBadge(pathname);

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
      {/* ── Desktop bar ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline flex-shrink-0">
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

        {/* Centered nav links (hidden on mobile) */}
        <nav className="flex-1 hidden md:flex items-center justify-center gap-9">
          {NAV_LINKS.map(({ href, label }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors duration-200 no-underline relative group"
                style={{ color: active ? 'var(--ndl-text)' : 'var(--ndl-muted)' }}
              >
                {label}
                <span
                  className={`absolute -bottom-0.5 left-0 h-px bg-blue-500 transition-all duration-300 ${
                    active ? 'w-full' : 'w-0 group-hover:w-full'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right: badge + theme + hamburger */}
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

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div
          className="md:hidden border-t"
          style={{ background: 'var(--ndl-surface)', borderColor: 'var(--ndl-border)' }}
        >
          <nav className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm transition-colors no-underline"
                style={{ color: 'var(--ndl-text-secondary)' }}
                onClick={() => setMobileOpen(false)}
              >
                {label}
              </Link>
            ))}
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
