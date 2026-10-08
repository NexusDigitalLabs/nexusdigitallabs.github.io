import { notFound } from 'next/navigation';
import { z } from 'zod';
import type { requireOrg } from '@/lib/freelanceos/org';
import type { BillingType, ProjectStatus } from '@/lib/freelanceos/projects';

/** Shared reads for FreelanceOS pages. Every query is scoped to the org. */

type Ctx = Awaited<ReturnType<typeof requireOrg>>;

export type Client = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  currency: string;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  billing_type: BillingType;
  currency: string;
  rate_minor: number | null;
  budget_minor: number | null;
  start_date: string | null;
  due_date: string | null;
  notes: string | null;
  created_at: string;
};

const CLIENT_COLUMNS = 'id, name, company, email, phone, country, currency, notes, archived_at, created_at';
export const PROJECT_COLUMNS =
  'id, client_id, name, description, status, billing_type, currency, rate_minor, budget_minor, start_date, due_date, notes, created_at';

const isUuid = (v: string) => z.uuid().safeParse(v).success;

/** Load a client in the caller's org, or 404 (also for malformed ids). */
export async function getClientOr404({ supabase, org }: Ctx, id: string): Promise<Client> {
  if (!isUuid(id)) notFound();
  const { data, error } = await supabase.from('clients').select(CLIENT_COLUMNS).eq('org_id', org.id).eq('id', id).maybeSingle();
  if (error) throw new Error('Could not load the client.');
  if (!data) notFound();
  return data as Client;
}

export async function getProjectOr404({ supabase, org }: Ctx, id: string): Promise<Project & { client: Pick<Client, 'id' | 'name' | 'company'> }> {
  if (!isUuid(id)) notFound();
  const { data, error } = await supabase
    .from('projects')
    .select(`${PROJECT_COLUMNS}, client:clients(id, name, company)`)
    .eq('org_id', org.id)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Could not load the project.');
  if (!data) notFound();
  return data as unknown as Project & { client: Pick<Client, 'id' | 'name' | 'company'> };
}

/** Clients for a project's client picker; archived ones only if already selected. */
export async function getClientChoices({ supabase, org }: Ctx, includeId?: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, company, currency, archived_at')
    .eq('org_id', org.id)
    .order('name');
  if (error) throw new Error('Could not load clients.');
  return (data ?? [])
    .filter((c) => c.archived_at === null || c.id === includeId)
    .map((c) => ({
      id: c.id as string,
      label: c.company ? `${c.name} (${c.company})` : (c.name as string),
      currency: c.currency as string,
    }));
}

// ── Invoices ─────────────────────────────────────────────────────────────────

export type InvoiceStatus = 'draft' | 'sent' | 'void';

export type PartySnapshot = {
  name: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  tax_id?: string | null;
};

export type InvoiceRow = {
  id: string;
  client_id: string;
  project_id: string | null;
  number: string | null;
  status: InvoiceStatus;
  currency: string;
  issue_date: string;
  due_date: string;
  tax_rate: number;
  discount_rate: number;
  notes: string | null;
  subtotal_minor: number;
  discount_minor: number;
  tax_minor: number;
  total_minor: number;
  amount_paid_minor: number;
  sent_at: string | null;
  created_at: string;
};

export type InvoiceItem = {
  id: string;
  position: number;
  description: string;
  quantity: number;
  unit_price_minor: number;
  amount_minor: number;
};

export type Payment = {
  id: string;
  amount_minor: number;
  currency: string;
  paid_on: string;
  method: string | null;
  note: string | null;
};

export const INVOICE_COLUMNS =
  'id, client_id, project_id, number, status, currency, issue_date, due_date, tax_rate, discount_rate, notes, subtotal_minor, discount_minor, tax_minor, total_minor, amount_paid_minor, sent_at, created_at';

export type InvoiceDetail = InvoiceRow & {
  from_snapshot: PartySnapshot | null;
  bill_to_snapshot: PartySnapshot | null;
  payment_details: string | null;
  client: { id: string; name: string; company: string | null; email: string | null; phone: string | null; country: string | null } | null;
  project: { id: string; name: string } | null;
  items: InvoiceItem[];
  payments: Payment[];
};

export async function getInvoiceOr404({ supabase, org }: Ctx, id: string): Promise<InvoiceDetail> {
  if (!isUuid(id)) notFound();
  const { data, error } = await supabase
    .from('invoices')
    .select(
      `${INVOICE_COLUMNS}, from_snapshot, bill_to_snapshot, payment_details,
       client:clients(id, name, company, email, phone, country),
       project:projects(id, name),
       items:invoice_items(id, position, description, quantity, unit_price_minor, amount_minor),
       payments(id, amount_minor, currency, paid_on, method, note)`
    )
    .eq('org_id', org.id)
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Could not load the invoice.');
  if (!data) notFound();
  const invoice = data as unknown as InvoiceDetail;
  invoice.items = [...invoice.items].sort((a, b) => a.position - b.position);
  invoice.payments = [...invoice.payments].sort((a, b) => b.paid_on.localeCompare(a.paid_on));
  return invoice;
}

export type BusinessProfileRow = PartySnapshot & {
  name: string;
  base_currency: string;
  default_tax_rate: number;
  invoice_prefix: string;
  payment_details: string | null;
};

export async function getBusinessProfile({ supabase, org }: Ctx): Promise<BusinessProfileRow> {
  const { data, error } = await supabase
    .from('organizations')
    .select('name, email, phone, address, tax_id, base_currency, default_tax_rate, invoice_prefix, payment_details')
    .eq('id', org.id)
    .single();
  if (error || !data) throw new Error('Could not load your business profile.');
  return { ...(data as BusinessProfileRow), default_tax_rate: Number(data.default_tax_rate) };
}

/** Open projects for the invoice builder's project picker. */
export async function getProjectChoices({ supabase, org }: Ctx) {
  const { data, error } = await supabase
    .from('projects')
    .select('id, client_id, name, billing_type, currency, rate_minor, budget_minor, status')
    .eq('org_id', org.id)
    .order('name');
  if (error) throw new Error('Could not load projects.');
  return (data ?? []) as Pick<Project, 'id' | 'client_id' | 'name' | 'billing_type' | 'currency' | 'rate_minor' | 'budget_minor' | 'status'>[];
}
