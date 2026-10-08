'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { requireOrg } from '@/lib/freelanceos/org';
import { isWithinLimit } from '@/lib/freelanceos/entitlements';
import { errorState, readForm, validationErrorState, type FormState } from '@/lib/freelanceos/forms';
import { OPEN_PROJECT_STATUSES, PROJECT_STATUSES } from '@/lib/freelanceos/projects';
import { PROJECT_FIELDS, projectSchema } from '@/lib/freelanceos/schemas';

const idSchema = z.uuid();

export async function createProjectAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org, entitlements } = await requireOrg();
  const values = readForm(formData, PROJECT_FIELDS);

  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  if (entitlements.maxActiveProjects !== null && OPEN_PROJECT_STATUSES.includes(parsed.data.status)) {
    const { count } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .in('status', [...OPEN_PROJECT_STATUSES]);
    if (!isWithinLimit(entitlements.maxActiveProjects, count ?? 0)) {
      return errorState(`Your plan includes up to ${entitlements.maxActiveProjects} open projects.`, values);
    }
  }

  // The composite FK (org_id, client_id) also rejects another org's client.
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...parsed.data, org_id: org.id })
    .select('id')
    .single();
  if (error || !data) {
    console.error('[freelanceos] create project failed', { orgId: org.id, error: error?.message });
    return errorState('Could not create the project. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/projects/${data.id}/`);
}

export async function updateProjectAction(projectId: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const { supabase, org } = await requireOrg();
  const values = readForm(formData, PROJECT_FIELDS);
  if (!idSchema.safeParse(projectId).success) return errorState('Project not found.', values);

  const parsed = projectSchema.safeParse(values);
  if (!parsed.success) return validationErrorState(parsed.error, values);

  const { data, error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', projectId)
    .eq('org_id', org.id)
    .select('id')
    .maybeSingle();
  if (error || !data) {
    console.error('[freelanceos] update project failed', { orgId: org.id, projectId, error: error?.message });
    return errorState('Could not save the project. Please try again.', values);
  }

  revalidatePath('/app', 'layout');
  redirect(`/app/projects/${projectId}/`);
}

const statusSchema = z.enum(PROJECT_STATUSES);

export async function setProjectStatusAction(projectId: string, status: string): Promise<void> {
  const { supabase, org } = await requireOrg();
  if (!idSchema.safeParse(projectId).success || !statusSchema.safeParse(status).success) return;

  const { error } = await supabase.from('projects').update({ status }).eq('id', projectId).eq('org_id', org.id);
  if (error) {
    console.error('[freelanceos] set project status failed', { orgId: org.id, projectId, error: error.message });
    throw new Error('Could not update the project.');
  }

  revalidatePath('/app', 'layout');
}
