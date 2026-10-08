'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  FormMessage,
  SelectField,
  SubmitButton,
  TextField,
  currencySelectOptions,
} from '@/components/app/form';
import { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS } from '@/lib/freelanceos/expenses';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';
import type { CurrencyOption } from '@/lib/freelanceos/money';

export type ExpenseFormValues = {
  spent_on: string;
  category: string;
  vendor: string;
  description: string | null;
  amount: string;
  currency: string;
  project_id: string;
};

export default function ExpenseForm({
  action,
  expense,
  projects,
  currencies,
  submitLabel,
  cancelHref,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  expense: ExpenseFormValues;
  projects: { id: string; label: string }[];
  currencies: CurrencyOption[];
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <TextField name="vendor" label="Vendor" required placeholder="Figma, AWS, Uber…" state={state} defaultValue={expense.vendor} />
          <SelectField
            name="category"
            label="Category"
            required
            state={state}
            defaultValue={expense.category}
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: EXPENSE_CATEGORY_LABELS[c] }))}
          />
          <div className="grid grid-cols-[1fr_9rem] gap-4">
            <TextField name="amount" label="Amount" required inputMode="decimal" placeholder="0.00" state={state} defaultValue={expense.amount} />
            <SelectField
              name="currency"
              label="Currency"
              required
              state={state}
              defaultValue={expense.currency}
              options={currencySelectOptions(currencies)}
            />
          </div>
          <TextField name="spent_on" label="Date" type="date" required state={state} defaultValue={expense.spent_on} />
          <SelectField
            name="project_id"
            label="Project"
            hint="Optional — link it to see project costs."
            state={state}
            defaultValue={expense.project_id}
            placeholder="No project"
            options={projects.map((p) => ({ value: p.id, label: p.label }))}
          />
          <TextField name="description" label="Description" placeholder="Monthly plan" state={state} defaultValue={expense.description} />
        </CardContent>
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Button variant="ghost" asChild>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <FormMessage state={state} />
      </div>
    </form>
  );
}
