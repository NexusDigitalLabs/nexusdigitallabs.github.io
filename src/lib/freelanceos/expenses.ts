export const EXPENSE_CATEGORIES = ['software', 'hardware', 'travel', 'hosting', 'advertising', 'office', 'other'] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  software: 'Software',
  hardware: 'Hardware',
  travel: 'Travel',
  hosting: 'Hosting',
  advertising: 'Advertising',
  office: 'Office',
  other: 'Other',
};

/** "2026-10" for a YYYY-MM-DD date. */
export function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

/** Validated YYYY-MM from a query param, else the month containing `today`. */
export function parseMonth(raw: string | undefined, today: string): string {
  return raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw) ? raw : monthKey(today);
}

/** First day of the month and first day of the next month (half-open range). */
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split('-').map(Number);
  const next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
  return { start: `${month}-01`, end: `${next}-01` };
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const index = y * 12 + (m - 1) + delta;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, '0')}`;
}

/** "October 2026" */
export function formatMonth(month: string): string {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${month}-01T00:00:00Z`)
  );
}
