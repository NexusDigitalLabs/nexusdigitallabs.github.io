import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import InvoiceBuilder from '@/components/app/InvoiceBuilder';
import { PageHeader } from '@/components/app/page-parts';
import { saveInvoiceDraftAction } from '@/app/app/invoices/actions';
import { formatHundredths } from '@/lib/freelanceos/invoice-math';
import { currencyOptions, minorToInput } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getClientChoices, getInvoiceOr404, getProjectChoices } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Edit invoice' };

const pct = (rate: number) => (rate ? formatHundredths(Math.round(rate * 100)) : '');

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const invoice = await getInvoiceOr404(ctx, id);
  // Sent invoices are locked (also enforced by the DB).
  if (invoice.status !== 'draft') redirect(`/app/invoices/${invoice.id}/`);

  const [clients, projects] = await Promise.all([getClientChoices(ctx, invoice.client_id), getProjectChoices(ctx)]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Edit draft invoice" back={{ href: `/app/invoices/${invoice.id}/`, label: 'Invoice' }} />
      <InvoiceBuilder
        action={saveInvoiceDraftAction.bind(null, invoice.id)}
        clients={clients}
        projects={projects.filter((p) => p.status !== 'cancelled' || p.id === invoice.project_id)}
        currencies={currencyOptions()}
        invoice={{
          client_id: invoice.client_id,
          project_id: invoice.project_id ?? '',
          currency: invoice.currency,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          tax_rate: pct(invoice.tax_rate),
          discount_rate: pct(invoice.discount_rate),
          notes: invoice.notes,
          items: invoice.items.map((item) => ({
            description: item.description,
            quantity: formatHundredths(Math.round(item.quantity * 100)),
            unit_price: minorToInput(item.unit_price_minor, invoice.currency),
          })),
        }}
        submitLabel="Save draft"
        cancelHref={`/app/invoices/${invoice.id}/`}
      />
    </div>
  );
}
