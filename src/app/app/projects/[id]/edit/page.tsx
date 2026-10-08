import type { Metadata } from 'next';
import ProjectForm from '@/components/app/ProjectForm';
import { PageHeader } from '@/components/app/page-parts';
import { updateProjectAction } from '@/app/app/projects/actions';
import { currencyOptions, minorToInput } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getClientChoices, getProjectOr404 } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Edit project' };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const project = await getProjectOr404(ctx, id);
  const clients = await getClientChoices(ctx, project.client_id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title={`Edit ${project.name}`} back={{ href: `/app/projects/${project.id}/`, label: project.name }} />
      <ProjectForm
        action={updateProjectAction.bind(null, project.id)}
        clients={clients}
        currencies={currencyOptions()}
        project={{
          ...project,
          rate: minorToInput(project.rate_minor, project.currency),
          budget: minorToInput(project.budget_minor, project.currency),
        }}
        submitLabel="Save changes"
        cancelHref={`/app/projects/${project.id}/`}
      />
    </div>
  );
}
