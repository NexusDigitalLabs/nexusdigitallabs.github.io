import Link from 'next/link';
import MetricCounter from './MetricCounter';
import KofiTipLink from './KofiTipLink';
import { GAMES, TOOLS } from '@/data/catalog';

const COMPANY_LINKS = [
  { href: '/about/',          label: 'About'          },
  { href: '/contact/',        label: 'Contact'        },
  { href: '/privacy-policy/', label: 'Privacy Policy' },
  { href: '/terms/',          label: 'Terms of Use'   },
];

const TOOL_LINKS = TOOLS.map((t) => ({ href: t.href, label: t.title }));

const GAME_LINKS = [
  { href: '/games/', label: 'All Games' },
  ...GAMES.map((g) => ({ href: g.href, label: g.title })),
];

function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold tracking-widest uppercase mb-4"
        style={{ color: 'var(--ndl-faint)' }}
      >
        {heading}
      </p>
      <div className="space-y-3">
        {links.map(({ href, label, external }) => (
          external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="ndl-footer-link block text-sm transition-colors no-underline"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="ndl-footer-link block text-sm transition-colors no-underline"
            >
              {label}
            </Link>
          )
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--ndl-border)', background: 'var(--ndl-footer-bg)' }}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">

          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold ndl-on-accent text-xs"
                style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
              >
                N
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--ndl-text)' }}>
                NexusDigitalLabs
              </span>
            </div>
            <p className="text-xs font-light leading-relaxed max-w-[200px]" style={{ color: 'var(--ndl-faint)' }}>
              Minimalist web utilities and developer tools built for speed, privacy, and utility.
            </p>
            <KofiTipLink compact />
          </div>

          <FooterColumn heading="Company" links={COMPANY_LINKS} />
          <FooterColumn heading="Tools" links={TOOL_LINKS} />
          <FooterColumn heading="Games" links={GAME_LINKS} />
        </div>

        <div
          className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]"
          style={{ borderColor: 'var(--ndl-border-soft)', color: 'var(--ndl-faint)' }}
        >
          <span>© {new Date().getFullYear()} NexusDigitalLabs. All rights reserved.</span>
          <MetricCounter />
          <span>Privacy-first · Optional accounts</span>
        </div>
      </div>
    </footer>
  );
}
