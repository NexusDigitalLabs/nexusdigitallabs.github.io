import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectForm from '@/components/app/ProjectForm';
import { EmptyState, PageHeader } from '@/components/app/page-parts';
import { createProjectAction } from '@/app/app/projects/actions';
import { currencyOptions } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getClientChoices } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'New project' };

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const ctx = await requireOrg();
  const { client: preselect } = await searchParams;
  const clients = await getClientChoices(ctx);
  const selected = clients.find((c) => c.id === preselect);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="New project" back={{ href: selected ? `/app/clients/${selected.id}/` : '/app/projects/', label: selected ? selected.label : 'Projects' }} />
      {clients.length === 0 ? (
        <EmptyState
          title="Add a client first"
          description="Every project belongs to a client."
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
        <ProjectForm
          action={createProjectAction}
          clients={clients}
          currencies={currencyOptions()}
          project={{
            client_id: selected?.id ?? '',
            name: '',
            description: null,
            status: 'active',
            billing_type: 'hourly',
            currency: selected?.currency ?? ctx.org.base_currency,
            rate: '',
            budget: '',
            start_date: null,
            due_date: null,
            notes: null,
          }}
          submitLabel="Create project"
          cancelHref={selected ? `/app/clients/${selected.id}/` : '/app/projects/'}
        />
      )}
    </div>
  );
}
