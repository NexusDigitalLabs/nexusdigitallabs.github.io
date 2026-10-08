import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader } from '@/components/app/page-parts';
import { requireOrg } from '@/lib/freelanceos/org';
import { ilikeAny, sanitizeSearch } from '@/lib/freelanceos/search';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Clients' };

type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  currency: string;
  archived_at: string | null;
  projects: { count: number }[];
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; archived?: string }>;
}) {
  const { supabase, org } = await requireOrg();
  const params = await searchParams;
  const q = sanitizeSearch(params.q);
  const showArchived = params.archived === '1';

  let query = supabase
    .from('clients')
    .select('id, name, company, email, currency, archived_at, projects(count)')
    .eq('org_id', org.id)
    .order('name');
  query = showArchived ? query.not('archived_at', 'is', null) : query.is('archived_at', null);
  if (q) query = query.or(ilikeAny(['name', 'company', 'email'], q));

  const { data, error } = await query;
  if (error) throw new Error('Could not load clients.');
  const clients = (data ?? []) as ClientRow[];

  const tabHref = (archived: boolean) => {
    const sp = new URLSearchParams();
    if (q) sp.set('q', q);
    if (archived) sp.set('archived', '1');
    const s = sp.toString();
    return `/app/clients/${s ? `?${s}` : ''}`;
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        title="Clients"
        description="The people and companies you work with."
        actions={
          <Button asChild>
            <Link href="/app/clients/new/">
              <Plus aria-hidden="true" />
              New client
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <form action="/app/clients/" className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input name="q" defaultValue={q} placeholder="Search clients…" aria-label="Search clients" className="pl-9" />
          {showArchived && <input type="hidden" name="archived" value="1" />}
        </form>
        <nav aria-label="Client filter" className="flex gap-1 text-sm">
          {[
            { label: 'Active', archived: false },
            { label: 'Archived', archived: true },
          ].map((tab) => (
            <Link
              key={tab.label}
              href={tabHref(tab.archived)}
              aria-current={tab.archived === showArchived ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5',
                tab.archived === showArchived ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {clients.length === 0 ? (
        q ? (
          <EmptyState title="No matching clients" description={`Nothing matches “${q}”. Try a different name, company or email.`} />
        ) : showArchived ? (
          <EmptyState title="No archived clients" description="Clients you archive will show up here." />
        ) : (
          <EmptyState
            title="Add your first client"
            description="Clients hold your projects and invoices. Start with someone you're working with now."
            action={
              <Button asChild>
                <Link href="/app/clients/new/">
                  <Plus aria-hidden="true" />
                  New client
                </Link>
              </Button>
            }
          />
        )
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Currency</TableHead>
                <TableHead className="text-right">Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id} className="relative">
                  <TableCell>
                    <Link href={`/app/clients/${c.id}/`} className="font-medium after:absolute after:inset-0 hover:underline">
                      {c.name}
                    </Link>
                    {c.company && <p className="text-xs text-muted-foreground">{c.company}</p>}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{c.email ?? '—'}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{c.currency}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{c.projects[0]?.count ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
