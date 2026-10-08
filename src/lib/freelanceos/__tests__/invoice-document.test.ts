import { describe, it, expect } from 'vitest';
import { buildInvoiceSheet } from '../invoice-document';

const base = {
  number: null as string | null,
  status: 'draft' as 'draft' | 'sent' | 'void',
  currency: 'USD',
  issue_date: '2026-10-01',
  due_date: '2026-10-31',
  tax_rate: 8.25,
  discount_rate: 10,
  notes: 'Thanks!',
  subtotal_minor: 7000,
  discount_minor: 700,
  tax_minor: 520,
  total_minor: 6820,
  amount_paid_minor: 0,
  from_snapshot: { name: 'Snapshot Studio', email: 'old@studio.dev' },
  bill_to_snapshot: { name: 'Jane', company: 'Old Corp' },
  payment_details: 'Old bank',
  items: [{ id: 'i1', position: 1, description: 'Dev', quantity: 1.5, unit_price_minor: 3333, amount_minor: 5000 }],
};
const live = {
  business: { name: 'Live Studio', email: 'live@studio.dev', tax_id: 'VAT1', payment_details: 'Live bank' },
  client: { name: 'Jane Smith', company: 'ABC Corp', email: 'jane@abc.com', country: 'Australia' },
};
const today = '2026-10-08';

describe('buildInvoiceSheet', () => {
  it('drafts use live business + client details', () => {
    const sheet = buildInvoiceSheet(base, live, today);
    expect(sheet.number).toBe('Draft');
    expect(sheet.badge).toEqual({ label: 'Draft', tone: 'draft' });
    expect(sheet.from).toEqual({ name: 'Live Studio', lines: ['live@studio.dev', 'Tax ID: VAT1'] });
    expect(sheet.billTo).toEqual({ name: 'ABC Corp', lines: ['Jane Smith', 'jane@abc.com', 'Australia'] });
    expect(sheet.payment).toEqual({ text: 'Live bank' });
  });

  it('sent invoices print the snapshots, not live data', () => {
    const sheet = buildInvoiceSheet({ ...base, status: 'sent', number: 'INV-0001' }, live, today);
    expect(sheet.number).toBe('INV-0001');
    expect(sheet.from.name).toBe('Snapshot Studio');
    expect(sheet.billTo.name).toBe('Old Corp');
    expect(sheet.payment).toEqual({ text: 'Old bank' });
    expect(sheet.badge).toBeUndefined();
  });

  it('formats money, rates and quantities', () => {
    const sheet = buildInvoiceSheet(base, live, today);
    expect(sheet.items[0]).toMatchObject({ quantity: '1.5', rate: '$33.33', amount: '$50.00' });
    expect(sheet.summary).toEqual([
      { label: 'Subtotal', value: '$70.00', tone: 'strong' },
      { label: 'Discount (10%)', value: '−$7.00', tone: 'negative' },
      { label: 'Tax (8.25%)', value: '$5.20' },
    ]);
    expect(sheet.total).toBe('$68.20');
    expect(sheet.totalLabel).toBe('Total due');
  });

  it('shows balance due when partly paid', () => {
    const sheet = buildInvoiceSheet({ ...base, status: 'sent', number: 'INV-1', amount_paid_minor: 2000 }, live, today);
    expect(sheet.totalLabel).toBe('Balance due');
    expect(sheet.total).toBe('$48.20');
    expect(sheet.summary.at(-1)).toEqual({ label: 'Paid', value: '−$20.00', tone: 'negative' });
  });

  it('badges paid and overdue invoices', () => {
    expect(buildInvoiceSheet({ ...base, status: 'sent', amount_paid_minor: 6820 }, live, today).badge?.tone).toBe('paid');
    expect(buildInvoiceSheet({ ...base, status: 'sent', due_date: '2026-10-01' }, live, today).badge?.tone).toBe('overdue');
  });
});
