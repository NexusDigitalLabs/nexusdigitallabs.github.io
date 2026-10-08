'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { requireOrg } from '@/lib/freelanceos/org';
import { errorState, readForm, validationErrorState, type FormState } from '@/lib/freelanceos/forms';
import { BUSINESS_PROFILE_FIELDS, businessProfileSchema } from '@/lib/freelanceos/schemas';

export async function updateBusinessProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org, role } = await requireOrg();
  const values = readForm(formData, BUSINESS_PROFILE_FIELDS);

  if (role !== 'owner' && role !== 'admin') {
    return errorState('Only workspace owners can change the business profile.', values);
  }

  const parsed = businessProfileSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  const { error } = await supabase.from('organizations').update(parsed.data).eq('id', org.id);
  if (error) {
    console.error('[freelanceos] update business profile failed', { orgId: org.id, error: error.message });
    return errorState('Could not save your profile. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  return { status: 'success', message: 'Business profile saved.', values };
}

/**
 * Permanently delete the signed-in user's account. Database cascades remove
 * their profile, saved tool drafts, game scores and FreelanceOS membership —
 * and with it a workspace they were the only member of (clients, projects,
 * invoices, payments, expenses). Fuel Tracker garages are unlinked, not
 * deleted (see 002_fuel_user_id.sql). Mirrors /api/fuel resource=delete_account.
 */
export async function deleteAccountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, user } = await requireOrg();
  if (formData.get('confirm') !== 'DELETE') {
    return { status: 'error', message: 'Type DELETE (in capitals) to confirm.', fieldErrors: { confirm: ['Type DELETE to confirm.'] } };
  }

  const admin = createServerSupabaseClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('[freelanceos] delete account failed', { userId: user.id, error: error.message });
    return errorState('Could not delete your account. Please try again or contact us.');
  }

  // The user no longer exists; clear the session cookies best-effort.
  await supabase.auth.signOut().catch(() => {});
  redirect('/?account=deleted');
}
