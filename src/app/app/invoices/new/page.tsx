import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import InvoiceBuilder from '@/components/app/InvoiceBuilder';
import { EmptyState, PageHeader } from '@/components/app/page-parts';
import { saveInvoiceDraftAction } from '@/app/app/invoices/actions';
import { addDaysISO, formatHundredths, todayISO } from '@/lib/freelanceos/invoice-math';
import { currencyOptions, minorToInput } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { invoiceLineFromProject } from '@/lib/freelanceos/projects';
import { getBusinessProfile, getClientChoices, getProjectChoices } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'New invoice' };

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string; project?: string }>;
}) {
  const ctx = await requireOrg();
  const params = await searchParams;
  const [clients, projects, profile] = await Promise.all([getClientChoices(ctx), getProjectChoices(ctx), getBusinessProfile(ctx)]);

  // ?project= implies its client; ?client= preselects a client only.
  const project = projects.find((p) => p.id === params.project);
  const client = clients.find((c) => c.id === (project?.client_id ?? params.client));
  const today = todayISO();
  const backHref = project ? `/app/projects/${project.id}/` : client ? `/app/clients/${client.id}/` : '/app/invoices/';

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader
        title="New invoice"
        description="Saved as a draft. You'll get an invoice number when you mark it as sent."
        back={{ href: backHref, label: project ? project.name : client ? client.label : 'Invoices' }}
      />
      {clients.length === 0 ? (
        <EmptyState
          title="Add a client first"
          description="Every invoice is billed to a client."
          action={
            <Button asChild>
              <Link href="/app/clients/new/">
                <Plus aria-hidden="true" />
                New client
              </Link>
            </Button>
          }
        />
      ) : (
        <InvoiceBuilder
          action={saveInvoiceDraftAction.bind(null, null)}
          clients={clients}
          projects={projects.filter((p) => p.status !== 'cancelled')}
          currencies={currencyOptions()}
          invoice={{
            client_id: client?.id ?? '',
            project_id: project?.id ?? '',
            currency: project?.currency ?? client?.currency ?? profile.base_currency,
            issue_date: today,
            due_date: addDaysISO(today, 30),
            tax_rate: profile.default_tax_rate ? formatHundredths(Math.round(profile.default_tax_rate * 100)) : '',
            discount_rate: '',
            notes: null,
            items: project ? [invoiceLineFromProject(project, minorToInput)] : [],
          }}
          submitLabel="Save draft"
          cancelHref={backHref}
        />
      )}
    </div>
  );
}
