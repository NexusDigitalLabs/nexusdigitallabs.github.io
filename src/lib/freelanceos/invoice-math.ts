/**
 * Invoice arithmetic in integer minor units — must match the SQL in
 * supabase/migrations/014_freelanceos_invoices.sql exactly, because the DB
 * recomputes totals and this module only powers the live preview.
 *
 * Quantities and percentage rates are held as integer hundredths (1.5 → 150,
 * 8.25% → 825) so every step is exact; ties round half-up like Postgres
 * round() does for the non-negative values involved here.
 */

/** "1.5" → 150; null for empty/invalid/non-positive or more than 2 decimals. */
export function parseHundredths(input: string | number): number | null {
  const s = String(input).replace(/[\s,]/g, '');
  const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(s);
  if (!m) return null;
  const value = Number(m[1] + (m[2] ?? '').padEnd(2, '0'));
  return Number.isSafeInteger(value) ? value : null;
}

/** 150 → "1.5", 200 → "2", 825 → "8.25". */
export function formatHundredths(h: number): string {
  const whole = Math.trunc(h / 100);
  const frac = String(h % 100).padStart(2, '0').replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : String(whole);
}

export function lineAmountMinor(quantityHundredths: number, unitPriceMinor: number): number {
  return Math.round((quantityHundredths * unitPriceMinor) / 100);
}

export type InvoiceTotals = {
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};

export function computeTotals(
  lines: { quantityHundredths: number; unitPriceMinor: number }[],
  discountRateHundredths: number,
  taxRateHundredths: number
): InvoiceTotals {
  const subtotal = lines.reduce((sum, l) => sum + lineAmountMinor(l.quantityHundredths, l.unitPriceMinor), 0);
  const discount = Math.round((subtotal * discountRateHundredths) / 10000);
  const tax = Math.round(((subtotal - discount) * taxRateHundredths) / 10000);
  return { subtotal, discount, tax, total: subtotal - discount + tax };
}

// ── Display status (paid / overdue are derived, not stored) ──────────────────

export type InvoiceDisplayStatus = 'draft' | 'sent' | 'partial' | 'overdue' | 'paid' | 'void';

export const INVOICE_STATUS_LABELS: Record<InvoiceDisplayStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  partial: 'Partially paid',
  overdue: 'Overdue',
  paid: 'Paid',
  void: 'Void',
};

/** Today's date as YYYY-MM-DD (UTC), the format due dates are compared in. */
export function todayISO(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function invoiceDisplayStatus(
  inv: { status: 'draft' | 'sent' | 'void'; total_minor: number; amount_paid_minor: number; due_date: string },
  today: string = todayISO()
): InvoiceDisplayStatus {
  if (inv.status !== 'sent') return inv.status;
  if (inv.total_minor > 0 && inv.amount_paid_minor >= inv.total_minor) return 'paid';
  if (inv.due_date < today) return 'overdue';
  if (inv.amount_paid_minor > 0) return 'partial';
  return 'sent';
}

export function balanceDue(inv: { total_minor: number; amount_paid_minor: number }): number {
  return Math.max(0, inv.total_minor - inv.amount_paid_minor);
}

/** Sum amounts per currency: [{ currency: 'USD', amount: 1200 }, …], largest first. */
export function sumByCurrency<T>(rows: T[], currency: (r: T) => string, amount: (r: T) => number) {
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(currency(r), (totals.get(currency(r)) ?? 0) + amount(r));
  return [...totals.entries()]
    .filter(([, value]) => value !== 0)
    .map(([code, value]) => ({ currency: code, amount: value }))
    .sort((a, b) => b.amount - a.amount);
}
