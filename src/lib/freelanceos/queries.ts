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
