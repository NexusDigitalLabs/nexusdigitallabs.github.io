import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, InvoiceStatusBadge, MoneyList, PageHeader } from '@/components/app/page-parts';
import { balanceDue, invoiceDisplayStatus, sumByCurrency, todayISO, type InvoiceDisplayStatus } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { formatDate } from '@/lib/freelanceos/projects';
import { INVOICE_COLUMNS, type InvoiceRow } from '@/lib/freelanceos/queries';
import { cn } from '@/lib/utils';

export const metadata: Metadata = { title: 'Invoices' };

const VIEWS = [
  { key: 'all', label: 'All', match: () => true },
  { key: 'draft', label: 'Drafts', match: (s: InvoiceDisplayStatus) => s === 'draft' },
  { key: 'outstanding', label: 'Outstanding', match: (s: InvoiceDisplayStatus) => s === 'sent' || s === 'partial' || s === 'overdue' },
  { key: 'overdue', label: 'Overdue', match: (s: InvoiceDisplayStatus) => s === 'overdue' },
  { key: 'paid', label: 'Paid', match: (s: InvoiceDisplayStatus) => s === 'paid' },
  { key: 'void', label: 'Void', match: (s: InvoiceDisplayStatus) => s === 'void' },
] as const;

export default async function InvoicesPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { supabase, org } = await requireOrg();
  const { view: rawView } = await searchParams;
  const view = VIEWS.find((v) => v.key === rawView) ?? VIEWS[0];
  const today = todayISO();

  const [{ data, error }, { count: clientCount }] = await Promise.all([
    supabase
      .from('invoices')
      .select(`${INVOICE_COLUMNS}, client:clients(id, name, company)`)
      .eq('org_id', org.id)
      .order('issue_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(500),
    supabase.from('clients').select('id', { count: 'exact', head: true }).eq('org_id', org.id).is('archived_at', null),
  ]);
  if (error) throw new Error('Could not load invoices.');

  const all = ((data ?? []) as unknown as (InvoiceRow & { client: { name: string; company: string | null } | null })[]).map(
    (inv) => ({ ...inv, display: invoiceDisplayStatus(inv, today) })
  );
  const invoices = all.filter((inv) => view.match(inv.display));
  const open = all.filter((inv) => ['sent', 'partial', 'overdue'].includes(inv.display));
  const outstanding = sumByCurrency(open, (i) => i.currency, balanceDue);
  const overdue = sumByCurrency(open.filter((i) => i.display === 'overdue'), (i) => i.currency, balanceDue);
  const hasClients = (clientCount ?? 0) > 0;

  const newButton = (
    <Button asChild>
      <Link href={hasClients ? '/app/invoices/new/' : '/app/clients/new/'}>
        <Plus aria-hidden="true" />
        {hasClients ? 'New invoice' : 'Add a client first'}
      </Link>
    </Button>
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Invoices" description="Bill your clients and track what's been paid." actions={newButton} />

      {all.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardDescription>Outstanding</CardDescription>
              <CardTitle className="text-2xl">
                <MoneyList totals={outstanding} />
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Overdue</CardDescription>
              <CardTitle className={cn('text-2xl', overdue.length > 0 && 'text-red-600 dark:text-red-400')}>
                <MoneyList totals={overdue} />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <nav aria-label="Invoice filter" className="flex flex-wrap gap-1 text-sm">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={v.key === 'all' ? '/app/invoices/' : `/app/invoices/?view=${v.key}`}
            aria-current={v.key === view.key ? 'page' : undefined}
            className={cn(
              'rounded-md px-3 py-1.5',
              v.key === view.key ? 'bg-muted font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {v.label}
          </Link>
        ))}
      </nav>

      {invoices.length === 0 ? (
        view.key === 'all' ? (
          <EmptyState
            title={hasClients ? 'Create your first invoice' : 'Invoices are sent to clients'}
            description={
              hasClients
                ? 'Add line items, download a PDF, and track payments as they come in.'
                : 'Add a client first, then bill them from here.'
            }
            action={newButton}
          />
        ) : (
          <EmptyState title="Nothing here" description={`No ${view.label.toLowerCase()} invoices right now.`} />
        )
      ) : (
        <div className="rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Issued</TableHead>
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
                    {inv.client && <p className="text-xs text-muted-foreground">{inv.client.company || inv.client.name}</p>}
                  </TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={inv.display} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{formatDate(inv.issue_date)}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDate(inv.due_date)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(inv.total_minor, inv.currency)}
                    {inv.display === 'partial' || (inv.display === 'overdue' && inv.amount_paid_minor > 0) ? (
                      <p className="text-xs text-muted-foreground">{formatMoney(balanceDue(inv), inv.currency)} due</p>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
