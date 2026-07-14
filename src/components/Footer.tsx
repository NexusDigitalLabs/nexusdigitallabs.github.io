import Link from 'next/link';
import MetricCounter from './MetricCounter';

const COMPANY_LINKS = [
  { href: '/about/',          label: 'About'          },
  { href: '/contact/',        label: 'Contact'        },
  { href: '/privacy-policy/', label: 'Privacy Policy' },
];

const TOOL_LINKS = [
  { href: '/tools/prompt-architect/',  label: 'Prompt Architect'  },
  { href: '/tools/invoice-generator/', label: 'Invoice Generator' },
  { href: '/tools/debt-optimizer/',    label: 'Debt Optimizer'    },
  { href: '/tools/fuel-tracker/',      label: 'Fuel Tracker'      },
];

const GAME_LINKS = [
  { href: '/games/',           label: 'All Games'  },
  { href: '/games/2048/',      label: '2048'       },
  { href: '/games/snake/',     label: 'Snake'      },
  { href: '/games/blackjack/', label: 'Blackjack'  },
];

function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase mb-4">{heading}</p>
      <div className="space-y-3">
        {links.map(({ href, label, external }) => (
          external ? (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-slate-400 hover:text-white transition-colors no-underline"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="block text-sm text-slate-400 hover:text-white transition-colors no-underline"
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
    <footer className="border-t border-slate-800/50 bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14">

        {/* ── Columns ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                style={{ background: 'linear-gradient(135deg,#2563eb,#6366f1)' }}
              >
                N
              </div>
              <span className="text-sm font-semibold text-white">NexusDigitalLabs</span>
            </div>
            <p className="text-xs text-slate-500 font-light leading-relaxed max-w-[200px]">
              Minimalist web utilities and developer tools built for speed, privacy, and utility.
            </p>
          </div>

          <FooterColumn heading="Company" links={COMPANY_LINKS} />
          <FooterColumn heading="Tools" links={TOOL_LINKS} />
          <FooterColumn heading="Games" links={GAME_LINKS} />
        </div>

        {/* ── Bottom bar ── */}
        <div className="pt-8 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-600">
          <span>© {new Date().getFullYear()} NexusDigitalLabs. All rights reserved.</span>
          <MetricCounter />
          <span>React · Zero cookies · No tracking</span>
        </div>
      </div>
    </footer>
  );
}
