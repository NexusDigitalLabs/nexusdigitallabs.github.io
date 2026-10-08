import type { Metadata } from 'next';
import ExpenseForm from '@/components/app/ExpenseForm';
import { PageHeader } from '@/components/app/page-parts';
import { saveExpenseAction } from '@/app/app/expenses/actions';
import { todayISO } from '@/lib/freelanceos/invoice-math';
import { currencyOptions } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getExpenseProjectChoices } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'New expense' };

export default async function NewExpensePage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const ctx = await requireOrg();
  const { project } = await searchParams;
  const projects = (await getExpenseProjectChoices(ctx)).filter((p) => p.status !== 'cancelled');
  const preselected = projects.find((p) => p.id === project)?.id ?? '';
  const back = preselected ? `/app/projects/${preselected}/` : '/app/expenses/';

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader title="New expense" back={{ href: back, label: preselected ? 'Project' : 'Expenses' }} />
      <ExpenseForm
        action={saveExpenseAction.bind(null, null)}
        projects={projects}
        currencies={currencyOptions()}
        expense={{
          spent_on: todayISO(),
          category: 'software',
          vendor: '',
          description: null,
          amount: '',
          currency: ctx.org.base_currency,
          project_id: preselected,
        }}
        submitLabel="Save expense"
        cancelHref={back}
      />
    </div>
  );
}
