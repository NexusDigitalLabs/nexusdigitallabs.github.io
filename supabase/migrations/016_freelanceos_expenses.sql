-- FreelanceOS — expenses.
--
-- Org-scoped like everything else (is_org_member). An expense can optionally
-- belong to a project in the same org (composite FK). Money is integer minor
-- units + ISO currency. New expenses appear in the activity feed.
--
-- Run in Supabase → SQL Editor after 015.

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid,
  spent_on date not null default current_date,
  category text not null default 'other'
    check (category in ('software', 'hardware', 'travel', 'hosting', 'advertising', 'office', 'other')),
  vendor text not null check (char_length(btrim(vendor)) between 1 and 120),
  description text check (description is null or char_length(description) <= 500),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (org_id, project_id) references public.projects (org_id, id)
);

create index if not exists expenses_org_spent_on_idx on public.expenses (org_id, spent_on desc);
create index if not exists expenses_project_idx on public.expenses (project_id);

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

alter table public.expenses enable row level security;
revoke all on public.expenses from anon;

drop policy if exists "expenses_member_all" on public.expenses;
create policy "expenses_member_all"
  on public.expenses for all
  to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

-- ── Activity: log new expenses ───────────────────────────────────────────────

alter table public.activity_log drop constraint if exists activity_log_entity_type_check;
alter table public.activity_log add constraint activity_log_entity_type_check
  check (entity_type in ('client', 'project', 'invoice', 'expense'));

create or replace function public.log_expense_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.activity_log (org_id, actor_id, entity_type, entity_id, action, summary, details)
  values (
    new.org_id, auth.uid(), 'expense', new.id, 'created', new.vendor,
    jsonb_build_object('amount_minor', new.amount_minor, 'currency', new.currency)
  );
  return null;
end;
$$;

revoke all on function public.log_expense_activity() from public, anon, authenticated;

drop trigger if exists expenses_log_activity on public.expenses;
create trigger expenses_log_activity
  after insert on public.expenses
  for each row execute function public.log_expense_activity();
