import type { Metadata } from 'next';
import ClientForm from '@/components/app/ClientForm';
import { PageHeader } from '@/components/app/page-parts';
import { createClientAction } from '@/app/app/clients/actions';
import { currencyOptions } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';

export const metadata: Metadata = { title: 'New client' };

export default async function NewClientPage() {
  const { org } = await requireOrg();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="New client" back={{ href: '/app/clients/', label: 'Clients' }} />
      <ClientForm
        action={createClientAction}
        client={{ name: '', company: null, email: null, phone: null, country: null, currency: org.base_currency, notes: null }}
        currencies={currencyOptions()}
        submitLabel="Create client"
        cancelHref="/app/clients/"
      />
    </div>
  );
}
