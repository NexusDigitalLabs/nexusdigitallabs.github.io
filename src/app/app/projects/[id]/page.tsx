import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, Pencil, Receipt, RotateCcw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Detail, MoneyList, PageHeader, ProjectStatusBadge } from '@/components/app/page-parts';
import { setProjectStatusAction } from '@/app/app/projects/actions';
import { sumByCurrency } from '@/lib/freelanceos/invoice-math';
import { formatMoney } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { BILLING_TYPE_LABELS, formatDate, OPEN_PROJECT_STATUSES, RATE_UNIT } from '@/lib/freelanceos/projects';
import { getProjectOr404 } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Project' };

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const project = await getProjectOr404(ctx, id);
  const [{ data: invoiceData }, { data: expenseData }] = await Promise.all([
    ctx.supabase
      .from('invoices')
      .select('currency, total_minor, amount_paid_minor')
      .eq('org_id', ctx.org.id)
      .eq('project_id', project.id)
      .eq('status', 'sent'),
    ctx.supabase.from('expenses').select('currency, amount_minor').eq('org_id', ctx.org.id).eq('project_id', project.id),
  ]);
  const spent = sumByCurrency(expenseData ?? [], (e) => e.currency, (e) => e.amount_minor);
  const invoiced = sumByCurrency(invoiceData ?? [], (i) => i.currency, (i) => i.total_minor);
  const paid = sumByCurrency(invoiceData ?? [], (i) => i.currency, (i) => i.amount_paid_minor);
  const isOpen = OPEN_PROJECT_STATUSES.includes(project.status);
  const rateUnit = RATE_UNIT[project.billing_type];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        back={{ href: '/app/projects/', label: 'Projects' }}
        title={
          <span className="flex flex-wrap items-center gap-2">
            {project.name}
            <ProjectStatusBadge status={project.status} />
          </span>
        }
        description={
          project.client && (
            <Link href={`/app/clients/${project.client.id}/`} className="hover:underline">
              {project.client.name}
              {project.client.company ? ` · ${project.client.company}` : ''}
            </Link>
          )
        }
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/app/invoices/new/?project=${project.id}`}>
                <Receipt aria-hidden="true" />
                Create invoice
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/app/projects/${project.id}/edit/`}>
                <Pencil aria-hidden="true" />
                Edit
              </Link>
            </Button>
            <form action={setProjectStatusAction.bind(null, project.id, isOpen ? 'completed' : 'active')}>
              <Button variant={isOpen ? 'default' : 'outline'} type="submit">
                {isOpen ? <CheckCircle2 aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}
                {isOpen ? 'Mark completed' : 'Reopen'}
              </Button>
            </form>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Invoiced</CardDescription>
            <CardTitle className="text-2xl">
              <MoneyList totals={invoiced} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-2xl">
              <MoneyList totals={paid} />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Expenses</CardDescription>
            <CardTitle className="text-2xl">
              <MoneyList totals={spent} />
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-4">
            <Link href={`/app/expenses/new/?project=${project.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Wallet className="size-3" aria-hidden="true" />
              Add expense
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <Detail label="Billing type">{BILLING_TYPE_LABELS[project.billing_type]}</Detail>
              {rateUnit && (
                <Detail label={project.billing_type === 'hourly' ? 'Rate' : 'Retainer'}>
                  {project.rate_minor !== null && `${formatMoney(project.rate_minor, project.currency)} ${rateUnit}`}
                </Detail>
              )}
              <Detail label={project.billing_type === 'fixed' ? 'Price' : 'Budget'}>
                {project.budget_minor !== null && formatMoney(project.budget_minor, project.currency)}
              </Detail>
              <Detail label="Currency">{project.currency}</Detail>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <Detail label="Start date">{project.start_date && formatDate(project.start_date)}</Detail>
              <Detail label="Due date">{project.due_date && formatDate(project.due_date)}</Detail>
              <Detail label="Created">{formatDate(project.created_at)}</Detail>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <Detail label="Description">
                {project.description && <span className="whitespace-pre-wrap">{project.description}</span>}
              </Detail>
              <Detail label="Notes">{project.notes && <span className="whitespace-pre-wrap">{project.notes}</span>}</Detail>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
