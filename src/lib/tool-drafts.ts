import type { SupabaseClient } from '@supabase/supabase-js';

export const TOOL_DRAFT_KEYS = ['invoice-generator', 'debt-optimizer'] as const;
export type ToolDraftKey = (typeof TOOL_DRAFT_KEYS)[number];

export function isToolDraftKey(value: string): value is ToolDraftKey {
  return (TOOL_DRAFT_KEYS as readonly string[]).includes(value);
}

export const cloudOptInKey = (tool: ToolDraftKey) => `ndl_cloud_draft_opt_in_${tool}`;

export function isCloudDraftOptedIn(tool: ToolDraftKey): boolean {
  try {
    return localStorage.getItem(cloudOptInKey(tool)) === '1';
  } catch {
    return false;
  }
}

export function setCloudDraftOptIn(tool: ToolDraftKey, enabled: boolean) {
  try {
    if (enabled) localStorage.setItem(cloudOptInKey(tool), '1');
    else localStorage.removeItem(cloudOptInKey(tool));
  } catch {
    /* ignore */
  }
}

export async function fetchToolDraft(
  supabase: SupabaseClient,
  userId: string,
  toolKey: ToolDraftKey
): Promise<{ payload: Record<string, unknown> | null; error: string | null }> {
  const { data, error } = await supabase
    .from('tool_drafts')
    .select('payload')
    .eq('user_id', userId)
    .eq('tool_key', toolKey)
    .maybeSingle();

  if (error) return { payload: null, error: error.message };
  if (!data?.payload || typeof data.payload !== 'object') {
    return { payload: null, error: null };
  }
  return { payload: data.payload as Record<string, unknown>, error: null };
}

export async function upsertToolDraft(
  supabase: SupabaseClient,
  userId: string,
  toolKey: ToolDraftKey,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase.from('tool_drafts').upsert(
    {
      user_id: userId,
      tool_key: toolKey,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,tool_key' }
  );
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}

export async function deleteToolDraft(
  supabase: SupabaseClient,
  userId: string,
  toolKey: ToolDraftKey
): Promise<{ ok: boolean; error: string | null }> {
  const { error } = await supabase
    .from('tool_drafts')
    .delete()
    .eq('user_id', userId)
    .eq('tool_key', toolKey);
  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
