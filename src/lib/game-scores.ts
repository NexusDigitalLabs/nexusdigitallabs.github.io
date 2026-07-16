import type { SupabaseClient } from '@supabase/supabase-js';

export const GAME_KEYS = [
  '2048',
  'snake',
  'blackjack',
  'sudoku',
  'gridlock',
  'sumoku',
  'cryptic-paths',
  'semantic-shift',
] as const;
export type GameKey = (typeof GAME_KEYS)[number];

export function isGameKey(value: string): value is GameKey {
  return (GAME_KEYS as readonly string[]).includes(value);
}

/** Fetch signed-in user's cloud high scores (best-effort). */
export async function fetchOwnGameScores(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('game_scores')
    .select('game_key, high_score')
    .eq('user_id', userId);

  if (error || !data) return {};

  const out: Record<string, number> = {};
  for (const row of data) {
    const key = row.game_key as string;
    const score = Number(row.high_score) || 0;
    out[key] = score;
  }
  return out;
}

/** Upsert a high score if it beats the cloud value (or inserts new). */
export async function upsertGameScore(
  supabase: SupabaseClient,
  userId: string,
  gameKey: GameKey,
  score: number,
  displayName?: string | null
): Promise<{ ok: boolean; error: string | null }> {
  if (!Number.isFinite(score) || score < 0) {
    return { ok: false, error: 'invalid_score' };
  }

  const { data: existing } = await supabase
    .from('game_scores')
    .select('high_score')
    .eq('user_id', userId)
    .eq('game_key', gameKey)
    .maybeSingle();

  const current = existing ? Number(existing.high_score) || 0 : 0;
  if (score <= current) {
    return { ok: true, error: null };
  }

  const { error } = await supabase.from('game_scores').upsert(
    {
      user_id: userId,
      game_key: gameKey,
      high_score: Math.floor(score),
      display_name: displayName?.trim().slice(0, 80) || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,game_key' }
  );

  if (error) return { ok: false, error: error.message };
  return { ok: true, error: null };
}
