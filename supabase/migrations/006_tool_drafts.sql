-- Opt-in cloud drafts for tools (Invoice / Debt). Payload is opaque JSON.
-- Only created when the user explicitly enables cloud save while signed in.

create table if not exists public.tool_drafts (
  user_id uuid not null references auth.users (id) on delete cascade,
  tool_key text not null check (tool_key in ('invoice-generator', 'debt-optimizer')),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, tool_key)
);

alter table public.tool_drafts enable row level security;

drop policy if exists "tool_drafts_select_own" on public.tool_drafts;
create policy "tool_drafts_select_own"
  on public.tool_drafts for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "tool_drafts_insert_own" on public.tool_drafts;
create policy "tool_drafts_insert_own"
  on public.tool_drafts for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "tool_drafts_update_own" on public.tool_drafts;
create policy "tool_drafts_update_own"
  on public.tool_drafts for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tool_drafts_delete_own" on public.tool_drafts;
create policy "tool_drafts_delete_own"
  on public.tool_drafts for delete
  to authenticated
  using (auth.uid() = user_id);
