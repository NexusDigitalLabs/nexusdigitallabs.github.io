import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/lib/freelanceos/projects';
import { PROJECT_STATUS_LABELS } from '@/lib/freelanceos/projects';
import { INVOICE_STATUS_LABELS, type InvoiceDisplayStatus } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { cn } from '@/lib/utils';

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-3">
      {back && (
        <Link
          href={back.href}
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight break-words">{title}</h1>
          {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planned: 'border-transparent bg-muted text-muted-foreground',
  active: 'border-transparent bg-primary/15 text-primary',
  on_hold: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  completed: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  cancelled: 'border-transparent bg-muted text-muted-foreground line-through',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge className={cn('font-medium', STATUS_STYLES[status])}>{PROJECT_STATUS_LABELS[status]}</Badge>;
}

/** Label/value pair for detail pages. */
export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{children || '—'}</dd>
    </div>
  );
}

const INVOICE_STATUS_STYLES: Record<InvoiceDisplayStatus, string> = {
  draft: 'border-transparent bg-muted text-muted-foreground',
  sent: 'border-transparent bg-primary/15 text-primary',
  partial: 'border-transparent bg-primary/15 text-primary',
  overdue: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
  paid: 'border-transparent bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
  void: 'border-transparent bg-muted text-muted-foreground line-through',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceDisplayStatus }) {
  return <Badge className={cn('font-medium', INVOICE_STATUS_STYLES[status])}>{INVOICE_STATUS_LABELS[status]}</Badge>;
}

/** "USD 1,200.00 · EUR 300.00" style totals; "—" when empty. */
export function MoneyList({ totals }: { totals: { currency: string; amount: number }[] }) {
  if (totals.length === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex flex-col">
      {totals.map((t) => (
        <span key={t.currency} className="tabular-nums">
          {formatMoney(t.amount, t.currency)}
        </span>
      ))}
    </span>
  );
}

/**
 * Responsive stat grid: 2 columns on phones (a lone last card spans both),
 * `cols` from `lg` up. Pair with <StatCard />.
 */
export function StatGrid({ cols = 3, children }: { cols?: 2 | 3 | 4; children: ReactNode }) {
  const lg = { 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4' }[cols];
  return (
    <div className={cn('grid grid-cols-2 gap-3 sm:gap-4 [&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:col-span-1', lg)}>
      {children}
    </div>
  );
}

/** Compact metric tile: tight on phones, roomier from `sm` up. Optional link. */
export function StatCard({
  label,
  children,
  footer,
  href,
  valueClassName,
}: {
  label: string;
  children: ReactNode;
  footer?: ReactNode;
  href?: string;
  valueClassName?: string;
}) {
  const body = (
    <>
      <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
      <div className={cn('mt-1 text-lg leading-tight font-semibold tabular-nums break-words sm:mt-1.5 sm:text-2xl', valueClassName)}>
        {children}
      </div>
      {footer && <div className="mt-1.5 text-[11px] text-muted-foreground sm:text-xs">{footer}</div>}
    </>
  );
  const shell = 'block h-full min-w-0 rounded-xl border bg-card p-3.5 sm:p-5';
  return href ? (
    <Link href={href} className={cn(shell, 'transition-colors hover:bg-muted/40')}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}
