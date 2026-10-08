'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrg } from '@/lib/freelanceos/org';
import { monthKey } from '@/lib/freelanceos/expenses';
import { errorState, readForm, validationErrorState, type FormState } from '@/lib/freelanceos/forms';
import { EXPENSE_FIELDS, expenseSchema } from '@/lib/freelanceos/schemas';

const idSchema = z.uuid();

export async function saveExpenseAction(expenseId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  const values = readForm(formData, EXPENSE_FIELDS);
  if (expenseId !== null && !idSchema.safeParse(expenseId).success) return errorState('Expense not found.', values);

  const parsed = expenseSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  // The composite FK (org_id, project_id) also rejects another org's project.
  const query =
    expenseId === null
      ? supabase.from('expenses').insert({ ...parsed.data, org_id: org.id })
      : supabase.from('expenses').update(parsed.data).eq('id', expenseId).eq('org_id', org.id);
  const { data, error } = await query.select('id').maybeSingle();
  if (error || !data) {
    console.error('[freelanceos] save expense failed', { orgId: org.id, expenseId, error: error?.message });
    return errorState('Could not save the expense. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/expenses/?month=${monthKey(parsed.data.spent_on)}`);
}

export async function deleteExpenseAction(expenseId: string, month: string): Promise<void> {
  const { supabase, org } = await requireOrg();
  if (!idSchema.safeParse(expenseId).success) return;

  const { error } = await supabase.from('expenses').delete().eq('id', expenseId).eq('org_id', org.id);
  if (error) {
    console.error('[freelanceos] delete expense failed', { orgId: org.id, expenseId, error: error.message });
    throw new Error('Could not delete the expense.');
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/expenses/?month=${/^\d{4}-\d{2}$/.test(month) ? month : ''}`);
}
