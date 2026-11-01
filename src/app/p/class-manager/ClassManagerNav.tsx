import Link from 'next/link';
import { CLASS_MANAGER } from '@/lib/class-manager-pricing';

const TABS = [
  { href: '/p/class-manager/demo/', label: 'See the demo', key: 'demo' },
  { href: '/p/class-manager/quote/', label: 'Get a quote', key: 'quote' },
] as const;

/** Shared top bar for the Class Manager client pages (demo + quote). */
export default function ClassManagerNav({ active }: { active: 'demo' | 'quote' }) {
  return (
    <div className="flex flex-wrap items-center gap-4 pr-28 sm:pr-32">
      <p className="text-sm font-semibold text-[var(--ndl-text)]">
        {CLASS_MANAGER.productName}
        <span className="ml-2 font-normal text-[var(--ndl-muted)]">by NexusDigitalLabs</span>
      </p>
      <nav aria-label="Class Manager pages" className="flex gap-1 rounded-lg border border-[var(--ndl-border)] p-1 sm:ml-auto">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            aria-current={active === t.key ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-[var(--ndl-accent)] ${
              active === t.key
                ? 'bg-[var(--ndl-accent)] ndl-on-accent'
                : 'text-[var(--ndl-muted)] hover:text-[var(--ndl-text)]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
