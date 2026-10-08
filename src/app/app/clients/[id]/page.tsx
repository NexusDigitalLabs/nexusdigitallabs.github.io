import type { Metadata } from 'next';
import Link from 'next/link';
import { Archive, ArchiveRestore, Pencil, Plus, Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmSubmit } from '@/components/app/ConfirmSubmit';
import { Detail, EmptyState, InvoiceStatusBadge, MoneyList, PageHeader, ProjectStatusBadge } from '@/components/app/page-parts';
import { setClientArchivedAction } from '@/app/app/clients/actions';
import { balanceDue, invoiceDisplayStatus, sumByCurrency, todayISO } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { formatBilling, formatDate, OPEN_PROJECT_STATUSES } from '@/lib/freelanceos/projects';
import { getClientOr404, INVOICE_COLUMNS, PROJECT_COLUMNS, type InvoiceRow, type Project } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Client' };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const client = await getClientOr404(ctx, id);

  const [{ data, error }, { data: invoiceData, error: invoiceError }] = await Promise.all([
    ctx.supabase
      .from('projects')
      .select(PROJECT_COLUMNS)
      .eq('org_id', ctx.org.id)
      .eq('client_id', client.id)
      .order('created_at', { ascending: false }),
    ctx.supabase
      .from('invoices')
      .select(INVOICE_COLUMNS)
      .eq('org_id', ctx.org.id)
      .eq('client_id', client.id)
      .order('issue_date', { ascending: false }),
  ]);
  if (error || invoiceError) throw new Error('Could not load this client.');
  const projects = (data ?? []) as Project[];
  const today = todayISO();
  const invoices = ((invoiceData ?? []) as InvoiceRow[]).map((inv) => ({ ...inv, display: invoiceDisplayStatus(inv, today) }));
  const revenue = sumByCurrency(invoices, (i) => i.currency, (i) => i.amount_paid_minor);
  const outstanding = sumByCurrency(
    invoices.filter((i) => i.status === 'sent'),
    (i) => i.currency,
    balanceDue
  );
  const openCount = projects.filter((p) => OPEN_PROJECT_STATUSES.includes(p.status)).length;
  const archived = client.archived_at !== null;
  const newProjectHref = `/app/projects/new/?client=${client.id}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        back={{ href: '/app/clients/', label: 'Clients' }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {client.name}
            {archived && <Badge variant="secondary">Archived</Badge>}
          </span>
        }
        description={client.company}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/app/clients/${client.id}/edit/`}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <form action={setClientArchivedAction.bind(null, client.id, !archived)}>
              {archived ? (
                <Button variant="outline" type="submit">
                  <ArchiveRestore aria-hidden="true" />
                  Restore
                </Button>
              ) : (
                <ConfirmSubmit
                  destructive={false}
                  title={`Archive ${client.name}?`}
                  description="They'll move to the Archived tab and won't appear in client pickers. Their projects and invoices are kept, and you can restore them anytime."
                  confirmLabel="Archive client"
                >
                  <Archive aria-hidden="true" />
                  Archive
                </ConfirmSubmit>
              )}
            </form>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Open projects</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Revenue from client</CardDescription>
            <CardTitle className="text-2xl">
              <MoneyList totals={revenue} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Outstanding</CardDescription>
            <CardTitle className="text-2xl">
              <MoneyList totals={outstanding} />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <Detail label="Email">
                {client.email && (
                  <a href={`mailto:${client.email}`} className="hover:underline">
                    {client.email}
                  </a>
                )}
              </Detail>
              <Detail label="Phone">{client.phone}</Detail>
              <Detail label="Country">{client.country}</Detail>
              <Detail label="Billing currency">{client.currency}</Detail>
              <Detail label="Client since">{formatDate(client.created_at)}</Detail>
              {client.notes && (
                <Detail label="Notes">
                  <span className="whitespace-pre-wrap">{client.notes}</span>
                </Detail>
              )}
            </dl>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Projects</h2>
            {projects.length > 0 && !archived && (
              <Button size="sm" variant="outline" asChild>
                <Link href={newProjectHref}>
                  <Plus aria-hidden="true" />
                  New project
                </Link>
              </Button>
            )}
          </div>
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              description={archived ? 'This client is archived.' : `Create a project to track work for ${client.name}.`}
              action={
                !archived && (
                  <Button asChild>
                    <Link href={newProjectHref}>
                      <Plus aria-hidden="true" />
                      New project
                    </Link>
                  </Button>
                )
              }
            />
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Billing</TableHead>
                    <TableHead className="hidden md:table-cell">Due</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((p) => (
                    <TableRow key={p.id} className="relative">
                      <TableCell>
                        <Link href={`/app/projects/${p.id}/`} className="font-medium after:absolute after:inset-0 hover:underline">
                          {p.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <ProjectStatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{formatBilling(p)}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(p.due_date)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <h2 className="text-base font-semibold">Invoices</h2>
            {!archived && (
              <Button size="sm" variant="outline" asChild>
                <Link href={`/app/invoices/new/?client=${client.id}`}>
                  <Receipt aria-hidden="true" />
                  New invoice
                </Link>
              </Button>
            )}
          </div>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="rounded-xl border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden sm:table-cell">Due</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="relative">
                      <TableCell>
                        <Link href={`/app/invoices/${inv.id}/`} className="font-medium after:absolute after:inset-0 hover:underline">
                          {inv.number ?? 'Draft'}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={inv.display} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(inv.due_date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatMoney(inv.total_minor, inv.currency)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
