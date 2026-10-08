'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrg } from '@/lib/freelanceos/org';
import { isWithinLimit } from '@/lib/freelanceos/entitlements';
import { errorState, readForm, validationErrorState, type FormState } from '@/lib/freelanceos/forms';
import { CLIENT_FIELDS, clientSchema } from '@/lib/freelanceos/schemas';

const idSchema = z.uuid();

export async function createClientAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org, entitlements } = await requireOrg();
  const values = readForm(formData, CLIENT_FIELDS);

  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  if (entitlements.maxClients !== null) {
    const { count } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .is('archived_at', null);
    if (!isWithinLimit(entitlements.maxClients, count ?? 0)) {
      return errorState(`Your plan includes up to ${entitlements.maxClients} active clients.`, values);
    }
  }

  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, org_id: org.id })
    .select('id')
    .single();
  if (error || !data) {
    console.error('[freelanceos] create client failed', { orgId: org.id, error: error?.message });
    return errorState('Could not create the client. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/clients/${data.id}/`);
}

export async function updateClientAction(clientId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  const values = readForm(formData, CLIENT_FIELDS);
  if (!idSchema.safeParse(clientId).success) return errorState('Client not found.', values);

  const parsed = clientSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  const { data, error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', clientId)
    .eq('org_id', org.id)
    .select('id')
    .maybeSingle();
  if (error || !data) {
    console.error('[freelanceos] update client failed', { orgId: org.id, clientId, error: error?.message });
    return errorState('Could not save the client. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/clients/${clientId}/`);
}

export async function setClientArchivedAction(clientId: string, archived: boolean): Promise<void> {
  const { supabase, org } = await requireOrg();
  if (!idSchema.safeParse(clientId).success) return;

  const { error } = await supabase
    .from('clients')
    .update({ archived_at: archived ? new Date().toISOString() : null })
    .eq('id', clientId)
    .eq('org_id', org.id);
  if (error) {
    console.error('[freelanceos] archive client failed', { orgId: org.id, clientId, error: error.message });
    throw new Error('Could not update the client.');
  }

  revalidatePath('/app', 'layout');
}
