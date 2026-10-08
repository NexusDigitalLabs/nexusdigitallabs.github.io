import type { Metadata } from 'next';
import ClientForm from '@/components/app/ClientForm';
import { PageHeader } from '@/components/app/page-parts';
import { updateClientAction } from '@/app/app/clients/actions';
import { currencyOptions } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getClientOr404 } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Edit client' };

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClientOr404(await requireOrg(), id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={`Edit ${client.name}`} back={{ href: `/app/clients/${client.id}/`, label: client.name }} />
      <ClientForm
        action={updateClientAction.bind(null, client.id)}
        client={client}
        currencies={currencyOptions()}
        submitLabel="Save changes"
        cancelHref={`/app/clients/${client.id}/`}
      />
    </div>
  );
}
