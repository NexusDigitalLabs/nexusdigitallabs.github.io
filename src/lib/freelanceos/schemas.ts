import { z } from 'zod';
import { isCurrencyCode, parseMoneyToMinor } from '@/lib/freelanceos/money';
import { BILLING_TYPES, PROJECT_STATUSES } from '@/lib/freelanceos/projects';

/**
 * Validation shared by forms and server actions. Inputs are FormData strings
 * (see readForm); outputs are the DB column shapes. Limits mirror the CHECK
 * constraints in supabase/migrations/012–013.
 */

const text = (max: number) => z.string().trim().max(max, `Keep this under ${max} characters.`);
const requiredText = (max: number, label: string) => text(max).min(1, `${label} is required.`);
const optionalText = (max: number) => text(max).transform((v) => (v === '' ? null : v));

const emailFormat = z.email();
const optionalEmail = z
  .string()
  .trim()
  .max(254)
  .refine((v) => v === '' || emailFormat.safeParse(v).success, 'Enter a valid email address.')
  .transform((v) => (v === '' ? null : v.toLowerCase()));

const currency = z.string().refine(isCurrencyCode, 'Choose a currency.');

const isoDate = z
  .string()
  .trim()
  .refine((v) => v === '' || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), 'Enter a valid date.')
  .transform((v) => (v === '' ? null : v));

// ── Business profile ─────────────────────────────────────────────────────────

export const BUSINESS_PROFILE_FIELDS = [
  'name',
  'email',
  'phone',
  'address',
  'tax_id',
  'base_currency',
  'default_tax_rate',
  'invoice_prefix',
  'payment_details',
] as const;

export const businessProfileSchema = z.object({
  name: requiredText(120, 'Business name'),
  email: optionalEmail.refine((v) => v !== null, 'Business email is required — it appears on your invoices.'),
  phone: optionalText(40),
  address: optionalText(500),
  tax_id: optionalText(60),
  base_currency: currency,
  default_tax_rate: z
    .string()
    .trim()
    .refine((v) => v === '' || (/^\d{1,3}(\.\d{1,2})?$/.test(v) && Number(v) <= 100), 'Enter a percentage from 0 to 100.')
    .transform((v) => (v === '' ? 0 : Number(v))),
  invoice_prefix: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_/-]{0,12}$/, 'Up to 12 letters, numbers, - _ or /.'),
  payment_details: optionalText(1000),
});

// ── Clients ──────────────────────────────────────────────────────────────────

export const CLIENT_FIELDS = ['name', 'company', 'email', 'phone', 'country', 'currency', 'notes'] as const;

export const clientSchema = z.object({
  name: requiredText(120, 'Client name'),
  company: optionalText(120),
  email: optionalEmail,
  phone: optionalText(40),
  country: optionalText(80),
  currency,
  notes: optionalText(5000),
});

// ── Projects ─────────────────────────────────────────────────────────────────

export const PROJECT_FIELDS = [
  'client_id',
  'name',
  'description',
  'status',
  'billing_type',
  'currency',
  'rate',
  'budget',
  'start_date',
  'due_date',
  'notes',
] as const;

export const projectSchema = z
  .object({
    client_id: z.uuid('Choose a client.'),
    name: requiredText(120, 'Project name'),
    description: optionalText(5000),
    status: z.enum(PROJECT_STATUSES, 'Choose a status.'),
    billing_type: z.enum(BILLING_TYPES, 'Choose a billing type.'),
    currency,
    rate: z.string(),
    budget: z.string(),
    start_date: isoDate,
    due_date: isoDate,
    notes: optionalText(5000),
  })
  .transform((v, ctx) => {
    const rate = parseMoneyToMinor(v.rate, v.currency);
    if (!rate.ok) ctx.addIssue({ code: 'custom', path: ['rate'], message: 'Enter a valid amount.' });
    const budget = parseMoneyToMinor(v.budget, v.currency);
    if (!budget.ok) ctx.addIssue({ code: 'custom', path: ['budget'], message: 'Enter a valid amount.' });
    if (v.start_date && v.due_date && v.due_date < v.start_date) {
      ctx.addIssue({ code: 'custom', path: ['due_date'], message: 'Due date must be on or after the start date.' });
    }
    if (!rate.ok || !budget.ok) return z.NEVER;

    // Rate only applies to hourly/retainer; don't keep a stale one around.
    const usesRate = v.billing_type === 'hourly' || v.billing_type === 'retainer';
    return {
      client_id: v.client_id,
      name: v.name,
      description: v.description,
      status: v.status,
      billing_type: v.billing_type,
      currency: v.currency,
      rate_minor: usesRate ? rate.value : null,
      budget_minor: budget.value,
      start_date: v.start_date,
      due_date: v.due_date,
      notes: v.notes,
    };
  });

export type BusinessProfileInput = z.output<typeof businessProfileSchema>;
export type ClientInput = z.output<typeof clientSchema>;
export type ProjectInput = z.output<typeof projectSchema>;
