-- Phase C: cloud high scores for signed-in players
-- Local scores remain the default; cloud sync is optional when signed in.

create table if not exists public.game_scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  game_key text not null check (game_key in ('2048', 'snake', 'blackjack')),
  high_score integer not null default 0 check (high_score >= 0),
  display_name text,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_key)
);

create index if not exists game_scores_game_key_score_idx
  on public.game_scores (game_key, high_score desc);

alter table public.game_scores enable row level security;

drop policy if exists "game_scores_select_own" on public.game_scores;
create policy "game_scores_select_own"
  on public.game_scores for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "game_scores_upsert_own" on public.game_scores;
create policy "game_scores_insert_own"
  on public.game_scores for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "game_scores_update_own" on public.game_scores;
create policy "game_scores_update_own"
  on public.game_scores for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Public read of leaderboard tops via service role API only (no anon select).
-- Optional: allow authenticated users to read top scores for a game.
drop policy if exists "game_scores_select_leaderboard" on public.game_scores;
create policy "game_scores_select_leaderboard"
  on public.game_scores for select
  to authenticated
  using (true);
