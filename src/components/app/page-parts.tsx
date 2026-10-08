import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProjectStatus } from '@/lib/freelanceos/projects';
import { PROJECT_STATUS_LABELS } from '@/lib/freelanceos/projects';
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
