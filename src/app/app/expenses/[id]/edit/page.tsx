import type { Metadata } from 'next';
import { Trash2 } from 'lucide-react';
import { ConfirmSubmit } from '@/components/app/ConfirmSubmit';
import ExpenseForm from '@/components/app/ExpenseForm';
import { PageHeader } from '@/components/app/page-parts';
import { deleteExpenseAction, saveExpenseAction } from '@/app/app/expenses/actions';
import { monthKey } from '@/lib/freelanceos/expenses';
import { currencyOptions, minorToInput } from '@/lib/freelanceos/money';
import { requireOrg } from '@/lib/freelanceos/org';
import { getExpenseOr404, getExpenseProjectChoices } from '@/lib/freelanceos/queries';

export const metadata: Metadata = { title: 'Edit expense' };

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireOrg();
  const [expense, projects] = await Promise.all([getExpenseOr404(ctx, id), getExpenseProjectChoices(ctx)]);
  const back = `/app/expenses/?month=${monthKey(expense.spent_on)}`;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <PageHeader
        title={`Edit ${expense.vendor}`}
        back={{ href: back, label: 'Expenses' }}
        actions={
          <form action={deleteExpenseAction.bind(null, expense.id, monthKey(expense.spent_on))}>
            <ConfirmSubmit
              title={`Delete the ${expense.vendor} expense?`}
              description="It's removed from your expense totals and project costs. This can't be undone."
              confirmLabel="Delete expense"
            >
              <Trash2 aria-hidden="true" />
              Delete
            </ConfirmSubmit>
          </form>
        }
      />
      <ExpenseForm
        action={saveExpenseAction.bind(null, expense.id)}
        projects={projects.filter((p) => p.status !== 'cancelled' || p.id === expense.project_id)}
        currencies={currencyOptions()}
        expense={{
          spent_on: expense.spent_on,
          category: expense.category,
          vendor: expense.vendor,
          description: expense.description,
          amount: minorToInput(expense.amount_minor, expense.currency),
          currency: expense.currency,
          project_id: expense.project_id ?? '',
        }}
        submitLabel="Save changes"
        cancelHref={back}
      />
    </div>
  );
}
