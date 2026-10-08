'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrg } from '@/lib/freelanceos/org';
import { balanceDue } from '@/lib/freelanceos/invoice-math';
import { errorState, readForm, validationErrorState, type FormState } from '@/lib/freelanceos/forms';
import { INVOICE_FIELDS, PAYMENT_FIELDS, invoiceSchema, paymentSchema } from '@/lib/freelanceos/schemas';

const idSchema = z.uuid();

/** Messages raised by the DB triggers in migration 014 are safe to show. */
function dbMessage(error: { code?: string; message: string } | null, fallback: string): string {
  return error?.code === '22023' ? error.message : fallback;
}

export async function saveInvoiceDraftAction(
  invoiceId: string | null,
  _prev: FormState,
  formData: FormData
): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  const values = readForm(formData, INVOICE_FIELDS);
  if (invoiceId !== null && !idSchema.safeParse(invoiceId).success) return errorState('Invoice not found.', values);

  const parsed = invoiceSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  // Atomic: invoice + items in one transaction, as the caller (RLS applies).
  const { data, error } = await supabase.rpc('save_invoice_draft', {
    p_invoice_id: invoiceId,
    p_org_id: org.id,
    p_fields: parsed.data.fields,
    p_items: parsed.data.items,
  });
  if (error || typeof data !== 'string') {
    console.error('[freelanceos] save invoice draft failed', { orgId: org.id, invoiceId, error: error?.message });
    return errorState(dbMessage(error, 'Could not save the invoice. Please try again.'), values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/invoices/${data}/`);
}

/** Send (finalize), void or delete — one action so the panel can show errors. */
export async function invoiceStatusAction(invoiceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  if (!idSchema.safeParse(invoiceId).success) return errorState('Invoice not found.');
  const intent = formData.get('intent');

  if (intent === 'delete') {
    const { data, error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)
      .eq('org_id', org.id)
      .eq('status', 'draft')
      .select('id');
    if (error || !data?.length) {
      console.error('[freelanceos] delete invoice failed', { orgId: org.id, invoiceId, error: error?.message });
      return errorState('Only draft invoices can be deleted.');
    }
    revalidatePath('/app', 'layout');
    redirect('/app/invoices/');
  }

  const transition =
    intent === 'send' ? { from: 'draft', to: 'sent', ok: 'Invoice marked as sent.' }
    : intent === 'void' ? { from: 'sent', to: 'void', ok: 'Invoice voided.' }
    : null;
  if (!transition) return errorState('Unknown action.');

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: transition.to })
    .eq('id', invoiceId)
    .eq('org_id', org.id)
    .eq('status', transition.from)
    .select('id');
  if (error || !data?.length) {
    console.error('[freelanceos] invoice status change failed', { orgId: org.id, invoiceId, intent, error: error?.message });
    return errorState(dbMessage(error, 'Could not update the invoice. Refresh and try again.'));
  }

  revalidatePath('/app', 'layout');
  return { status: 'success', message: transition.ok };
}

export async function recordPaymentAction(invoiceId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  const values = readForm(formData, PAYMENT_FIELDS);
  if (!idSchema.safeParse(invoiceId).success) return errorState('Invoice not found.', values);

  const { data: invoice, error: loadError } = await supabase
    .from('invoices')
    .select('id, status, currency, total_minor, amount_paid_minor')
    .eq('id', invoiceId)
    .eq('org_id', org.id)
    .maybeSingle();
  if (loadError || !invoice) return errorState('Invoice not found.', values);
  if (invoice.status !== 'sent') return errorState('Payments can only be recorded on sent invoices.', values);

  const parsed = paymentSchema(invoice.currency, balanceDue(invoice)).safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  const { error } = await supabase.from('payments').insert({ ...parsed.data, org_id: org.id, invoice_id: invoiceId });
  if (error) {
    console.error('[freelanceos] record payment failed', { orgId: org.id, invoiceId, error: error.message });
    return errorState(dbMessage(error, 'Could not record the payment. Please try again.'), values);
  }

  revalidatePath('/app', 'layout');
  return { status: 'success', message: 'Payment recorded.' };
}

export async function deletePaymentAction(invoiceId: string, paymentId: string): Promise<void> {
  const { supabase, org } = await requireOrg();
  if (!idSchema.safeParse(invoiceId).success || !idSchema.safeParse(paymentId).success) return;

  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', paymentId)
    .eq('invoice_id', invoiceId)
    .eq('org_id', org.id);
  if (error) {
    console.error('[freelanceos] delete payment failed', { orgId: org.id, paymentId, error: error.message });
    throw new Error('Could not remove the payment.');
  }

  revalidatePath('/app', 'layout');
}
