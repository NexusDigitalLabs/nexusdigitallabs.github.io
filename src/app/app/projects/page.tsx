import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, PageHeader, ProjectStatusBadge } from '@/components/app/page-parts';
import { requireOrg } from '@/lib/freelanceos/org';
import { formatBilling, formatDate, OPEN_PROJECT_STATUSES } from '@/lib/freelanceos/projects';
import { PROJECT_COLUMNS, type Project } from '@/lib/freelanceos/queries';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Projects' };

const VIEWS = [
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Completed & cancelled' },
  { key: 'all', label: 'All' },
] as const;
type View = (typeof VIEWS)[number]['key'];

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { supabase, org } = await requireOrg();
  const { view: rawView } = await searchParams;
  const view: View = VIEWS.some((v) => v.key === rawView) ? (rawView as View) : 'open';

  let query = supabase
    .from('projects')
    .select(`${PROJECT_COLUMNS}, client:clients(id, name)`)
    .eq('org_id', org.id)
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (view === 'open') query = query.in('status', [...OPEN_PROJECT_STATUSES]);
  if (view === 'closed') query = query.in('status', ['completed', 'cancelled']);

  const [{ data, error }, { count: clientCount }] = await Promise.all([
    query,
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('org_id', org.id).is('archived_at', null),
  ]);
  if (error) throw new Error('Could not load projects.');
  const projects = (data ?? []) as unknown as (Project & { client: { id: string; name: string } | null })[];
  const hasClients = (clientCount ?? 0) > 0;

  const newButton = (
    <Button asChild>
      <Link href={hasClients ? '/app/projects/new/' : '/app/clients/new/'}>
        <Plus aria-hidden="true" />
        {hasClients ? 'New project' : 'Add a client first'}
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      {/* The "open" empty state carries its own button — don't show two. */}
      <PageHeader
        title="Projects"
        description="Everything you're working on, by client."
        actions={!(projects.length === 0 && view === 'open') && newButton}
      />

      <nav aria-label="Project filter" className="flex flex-wrap gap-1 text-sm">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={v.key === 'open' ? '/app/projects/' : `/app/projects/?view=${v.key}`}
            aria-current={v.key === view ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-1.5',
              v.key === view ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {projects.length === 0 ? (
        view === 'open' ? (
          <EmptyState
            title={hasClients ? 'No open projects' : 'Projects belong to clients'}
            description={
              hasClients
                ? 'Create a project to track its billing, budget and dates.'
                : 'Add your first client, then create a project for them.'
            }
            action={newButton}
          />
        ) : (
          <EmptyState title="Nothing here yet" description="Projects you complete or cancel will show up here." />
        )
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Billing</TableHead>
                <TableHead className="hidden sm:table-cell">Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((p) => (
                <TableRow key={p.id} className="relative">
                  <TableCell>
                    <Link href={`/app/projects/${p.id}/`} className="font-medium after:absolute after:inset-0 hover:underline">
                      {p.name}
                    </Link>
                    {p.client && <p className="text-xs text-muted-foreground">{p.client.name}</p>}
                  </TableCell>
                  <TableCell>
                    <ProjectStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{formatBilling(p)}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(p.due_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
