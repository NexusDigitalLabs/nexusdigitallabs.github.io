import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { invoiceSchema, paymentSchema } from '../schemas';

const errorsOf = (r: { error?: z.ZodError }): Record<string, string[] | undefined> =>
  r.error ? z.flattenError(r.error).fieldErrors : {};

const valid = {
  client_id: '3f1c2a4e-8b6d-4c1e-9f2a-1b2c3d4e5f60',
  project_id: '',
  currency: 'USD',
  issue_date: '2026-10-08',
  due_date: '2026-11-07',
  tax_rate: '8.25',
  discount_rate: '',
  notes: '',
  items_json: JSON.stringify([
    { description: 'Development', quantity: '1.5', unit_price: '33.33' },
    { description: 'Hosting', quantity: '2', unit_price: '10' },
  ]),
};

describe('invoiceSchema', () => {
  it('produces RPC-ready fields and items', () => {
    expect(invoiceSchema.parse(valid)).toEqual({
      fields: {
        client_id: valid.client_id,
        project_id: '',
        currency: 'USD',
        issue_date: '2026-10-08',
        due_date: '2026-11-07',
        tax_rate: '8.25',
        discount_rate: '0',
        notes: '',
      },
      items: [
        { description: 'Development', quantity: '1.5', unit_price_minor: 3333 },
        { description: 'Hosting', quantity: '2', unit_price_minor: 1000 },
      ],
    });
  });

  it('requires at least one item', () => {
    expect(errorsOf(invoiceSchema.safeParse({ ...valid, items_json: '[]' }))).toHaveProperty('items');
    expect(errorsOf(invoiceSchema.safeParse({ ...valid, items_json: 'not json' }))).toHaveProperty('items');
  });

  it('reports the bad line number', () => {
    const r = invoiceSchema.safeParse({
      ...valid,
      items_json: JSON.stringify([
        { description: 'ok', quantity: '1', unit_price: '1' },
        { description: 'bad', quantity: '0', unit_price: '1' },
      ]),
    });
    expect(errorsOf(r).items?.[0]).toMatch(/Line 2/);
  });

  it('rejects prices with too many decimals for the currency', () => {
    const r = invoiceSchema.safeParse({
      ...valid,
      currency: 'JPY',
      items_json: JSON.stringify([{ description: 'x', quantity: '1', unit_price: '10.5' }]),
    });
    expect(errorsOf(r).items?.[0]).toMatch(/valid price/);
  });

  it('validates rates and dates', () => {
    expect(errorsOf(invoiceSchema.safeParse({ ...valid, tax_rate: '120' }))).toHaveProperty('tax_rate');
    expect(errorsOf(invoiceSchema.safeParse({ ...valid, due_date: '2026-10-01' }))).toHaveProperty('due_date');
  });

  it('accepts a project id or empty', () => {
    expect(invoiceSchema.safeParse({ ...valid, project_id: 'nope' }).success).toBe(false);
    expect(invoiceSchema.safeParse({ ...valid, project_id: valid.client_id }).success).toBe(true);
  });
});

describe('paymentSchema', () => {
  const schema = paymentSchema('USD', 5000);

  it('parses a valid payment', () => {
    expect(schema.parse({ amount: '50', paid_on: '2026-10-08', method: 'Bank transfer', note: '' })).toEqual({
      amount_minor: 5000,
      paid_on: '2026-10-08',
      method: 'Bank transfer',
      note: null,
    });
  });

  it('rejects zero and amounts above the balance', () => {
    expect(errorsOf(schema.safeParse({ amount: '0', paid_on: '2026-10-08', method: '', note: '' }))).toHaveProperty('amount');
    expect(errorsOf(schema.safeParse({ amount: '50.01', paid_on: '2026-10-08', method: '', note: '' }))).toHaveProperty('amount');
  });
});
