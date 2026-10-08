import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { businessProfileSchema, clientSchema, projectSchema } from '../schemas';

const errorsOf = (result: { success: boolean; error?: z.ZodError }) =>
  result.error ? z.flattenError(result.error).fieldErrors : {};

describe('businessProfileSchema', () => {
  const valid = {
    name: '  Dilan Studio ',
    email: 'Hello@Dilan.dev',
    phone: '',
    address: '',
    tax_id: '',
    base_currency: 'LKR',
    default_tax_rate: '',
    invoice_prefix: 'DS-',
    payment_details: '',
  };

  it('normalizes a valid profile', () => {
    const result = businessProfileSchema.parse(valid);
    expect(result).toMatchObject({
      name: 'Dilan Studio',
      email: 'hello@dilan.dev',
      phone: null,
      default_tax_rate: 0,
      invoice_prefix: 'DS-',
    });
  });

  it('requires a business email', () => {
    expect(errorsOf(businessProfileSchema.safeParse({ ...valid, email: '' }))).toHaveProperty('email');
  });

  it.each(['101', '-1', '12.345', 'ten'])('rejects tax rate %s', (rate) => {
    expect(errorsOf(businessProfileSchema.safeParse({ ...valid, default_tax_rate: rate }))).toHaveProperty(
      'default_tax_rate'
    );
  });

  it('accepts a decimal tax rate', () => {
    expect(businessProfileSchema.parse({ ...valid, default_tax_rate: '7.25' }).default_tax_rate).toBe(7.25);
  });

  it('rejects an invoice prefix with spaces', () => {
    expect(errorsOf(businessProfileSchema.safeParse({ ...valid, invoice_prefix: 'MY INV' }))).toHaveProperty(
      'invoice_prefix'
    );
  });
});

describe('clientSchema', () => {
  const valid = { name: 'ABC Corp', company: '', email: '', phone: '', country: 'Australia', currency: 'AUD', notes: '' };

  it('turns empty optional fields into null', () => {
    expect(clientSchema.parse(valid)).toEqual({
      name: 'ABC Corp',
      company: null,
      email: null,
      phone: null,
      country: 'Australia',
      currency: 'AUD',
      notes: null,
    });
  });

  it('validates email only when provided', () => {
    expect(errorsOf(clientSchema.safeParse({ ...valid, email: 'not-an-email' }))).toHaveProperty('email');
  });

  it('requires a name and a known currency', () => {
    const errors = errorsOf(clientSchema.safeParse({ ...valid, name: '   ', currency: 'ABC' }));
    expect(errors).toHaveProperty('name');
    expect(errors).toHaveProperty('currency');
  });
});

describe('projectSchema', () => {
  const valid = {
    client_id: '3f1c2a4e-8b6d-4c1e-9f2a-1b2c3d4e5f60',
    name: 'Mobile App',
    description: '',
    status: 'active',
    billing_type: 'hourly',
    currency: 'USD',
    rate: '40',
    budget: '2,000',
    start_date: '2026-10-01',
    due_date: '2026-12-31',
    notes: '',
  };

  it('converts money to minor units', () => {
    expect(projectSchema.parse(valid)).toMatchObject({ rate_minor: 4000, budget_minor: 200000 });
  });

  it('drops the rate for fixed-price projects', () => {
    expect(projectSchema.parse({ ...valid, billing_type: 'fixed' })).toMatchObject({
      rate_minor: null,
      budget_minor: 200000,
    });
  });

  it('allows empty money and dates', () => {
    expect(projectSchema.parse({ ...valid, rate: '', budget: '', start_date: '', due_date: '' })).toMatchObject({
      rate_minor: null,
      budget_minor: null,
      start_date: null,
      due_date: null,
    });
  });

  it('rejects bad amounts with a field error', () => {
    const errors = errorsOf(projectSchema.safeParse({ ...valid, rate: '40.555', budget: 'lots' }));
    expect(errors).toHaveProperty('rate');
    expect(errors).toHaveProperty('budget');
  });

  it('rejects a due date before the start date', () => {
    expect(errorsOf(projectSchema.safeParse({ ...valid, due_date: '2026-09-01' }))).toHaveProperty('due_date');
  });

  it('rejects unknown status, billing type and client id', () => {
    const errors = errorsOf(projectSchema.safeParse({ ...valid, status: 'done', billing_type: 'daily', client_id: 'x' }));
    expect(errors).toHaveProperty('status');
    expect(errors).toHaveProperty('billing_type');
    expect(errors).toHaveProperty('client_id');
  });
});

describe('expenseSchema', () => {
  const valid = { spent_on: '2026-10-08', category: 'software', vendor: ' Figma ', description: '', amount: '15', currency: 'USD', project_id: '' };

  it('normalizes a valid expense', async () => {
    const { expenseSchema } = await import('../schemas');
    expect(expenseSchema.parse(valid)).toEqual({
      spent_on: '2026-10-08',
      category: 'software',
      vendor: 'Figma',
      description: null,
      amount_minor: 1500,
      currency: 'USD',
      project_id: null,
    });
  });

  it('rejects zero amounts, unknown categories and missing vendor', async () => {
    const { expenseSchema } = await import('../schemas');
    const errors = (input: object) => {
      const r = expenseSchema.safeParse(input);
      return r.success ? {} : z.flattenError(r.error).fieldErrors;
    };
    expect(errors({ ...valid, amount: '0' })).toHaveProperty('amount');
    expect(errors({ ...valid, category: 'food' })).toHaveProperty('category');
    expect(errors({ ...valid, vendor: '  ' })).toHaveProperty('vendor');
  });
});
