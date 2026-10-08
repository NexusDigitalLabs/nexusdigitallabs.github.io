'use server';

import { revalidatePath } from 'next/cache';
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
