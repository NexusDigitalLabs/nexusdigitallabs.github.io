import { formatMoney } from '@/lib/freelanceos/money';

export const PROJECT_STATUSES = ['planned', 'active', 'on_hold', 'completed', 'cancelled'] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Statuses that count as "open" work (dashboard + default list filter). */
export const OPEN_PROJECT_STATUSES: readonly ProjectStatus[] = ['planned', 'active', 'on_hold'];

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planned: 'Planned',
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const BILLING_TYPES = ['hourly', 'fixed', 'milestone', 'retainer'] as const;
export type BillingType = (typeof BILLING_TYPES)[number];

export const BILLING_TYPE_LABELS: Record<BillingType, string> = {
  hourly: 'Hourly',
  fixed: 'Fixed price',
  milestone: 'Milestones',
  retainer: 'Retainer',
};

/** Billing types where `rate_minor` is meaningful, with its unit label. */
export const RATE_UNIT: Partial<Record<BillingType, string>> = {
  hourly: 'per hour',
  retainer: 'per month',
};

type BillingFields = {
  billing_type: BillingType;
  currency: string;
  rate_minor: number | null;
  budget_minor: number | null;
};

/** Short billing summary, e.g. "$40.00 / hr" or "Fixed · $2,000.00". */
export function formatBilling(p: BillingFields): string {
  switch (p.billing_type) {
    case 'hourly':
      return p.rate_minor !== null ? `${formatMoney(p.rate_minor, p.currency)} / hr` : 'Hourly';
    case 'retainer':
      return p.rate_minor !== null ? `${formatMoney(p.rate_minor, p.currency)} / month` : 'Retainer';
    case 'fixed':
      return p.budget_minor !== null ? `Fixed · ${formatMoney(p.budget_minor, p.currency)}` : 'Fixed price';
    case 'milestone':
      return p.budget_minor !== null ? `Milestones · ${formatMoney(p.budget_minor, p.currency)}` : 'Milestones';
  }
}

/** "2026-10-07" → "Oct 7, 2026" (date-only values, so formatted in UTC). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(date);
}
