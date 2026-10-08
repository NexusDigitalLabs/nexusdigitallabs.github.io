-- FreelanceOS — Phase 1: business profile, clients, projects, activity log.
--
-- Every table is org-scoped and gated by public.is_org_member(org_id)
-- (see 012). Money is stored as integer minor units (cents) + ISO currency.
--
-- Run in Supabase → SQL Editor after 012.

-- ── Business profile (columns on organizations) ──────────────────────────────

alter table public.organizations
  add column if not exists email text
    check (email is null or char_length(email) <= 254),
  add column if not exists phone text
    check (phone is null or char_length(phone) <= 40),
  add column if not exists address text
    check (address is null or char_length(address) <= 500),
  add column if not exists tax_id text
    check (tax_id is null or char_length(tax_id) <= 60),
  add column if not exists default_tax_rate numeric(5, 2) not null default 0
    check (default_tax_rate between 0 and 100),
  add column if not exists invoice_prefix text not null default 'INV-'
    check (invoice_prefix ~ '^[A-Za-z0-9_/-]{0,12}$'),
  add column if not exists payment_details text
    check (payment_details is null or char_length(payment_details) <= 1000);

-- Still never `plan` (see 012).
grant update (
  name, base_currency, email, phone, address, tax_id,
  default_tax_rate, invoice_prefix, payment_details
) on public.organizations to authenticated;

-- ── Clients ──────────────────────────────────────────────────────────────────

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  company text check (company is null or char_length(company) <= 120),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  country text check (country is null or char_length(country) <= 80),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  notes text check (notes is null or char_length(notes) <= 5000),
  archived_at timestamptz,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Target for projects' composite FK (client must be in the same org).
  unique (org_id, id)
);

create index if not exists clients_org_name_idx on public.clients (org_id, archived_at, name);

-- ── Projects ─────────────────────────────────────────────────────────────────

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid not null,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (description is null or char_length(description) <= 5000),
  status text not null default 'active'
    check (status in ('planned', 'active', 'on_hold', 'completed', 'cancelled')),
  billing_type text not null default 'hourly'
    check (billing_type in ('hourly', 'fixed', 'milestone', 'retainer')),
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  -- hourly: rate per hour · retainer: amount per month · fixed/milestone: unused
  rate_minor bigint check (rate_minor is null or rate_minor >= 0),
  budget_minor bigint check (budget_minor is null or budget_minor >= 0),
  start_date date,
  due_date date,
  notes text check (notes is null or char_length(notes) <= 5000),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_date is null or start_date is null or due_date >= start_date),
  -- NO ACTION (checked at end of statement): a client with projects can't be
  -- deleted on its own, but an org delete cascades through both cleanly.
  foreign key (org_id, client_id) references public.clients (org_id, id)
);

create index if not exists projects_org_status_idx on public.projects (org_id, status);
create index if not exists projects_client_idx on public.projects (client_id);

-- ── updated_at triggers ──────────────────────────────────────────────────────

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ── RLS: members of the org can read and write its clients/projects ──────────

alter table public.clients enable row level security;
alter table public.projects enable row level security;

revoke all on public.clients from anon;
revoke all on public.projects from anon;

drop policy if exists "clients_member_all" on public.clients;
create policy "clients_member_all"
  on public.clients for all
  to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

drop policy if exists "projects_member_all" on public.projects;
create policy "projects_member_all"
  on public.projects for all
  to authenticated
  using (public.is_org_member(org_id))
  with check (public.is_org_member(org_id));

-- ── Activity log (dashboard "recent activity"; later the audit log) ──────────
-- Written only by triggers; members can read their org's entries.

create table if not exists public.activity_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  entity_type text not null check (entity_type in ('client', 'project')),
  entity_id uuid not null,
  action text not null,
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists activity_log_org_created_idx
  on public.activity_log (org_id, created_at desc);

alter table public.activity_log enable row level security;
revoke all on public.activity_log from anon;
revoke insert, update, delete on public.activity_log from authenticated;

drop policy if exists "activity_log_select_member" on public.activity_log;
create policy "activity_log_select_member"
  on public.activity_log for select
  to authenticated
  using (public.is_org_member(org_id));

create or replace function public.log_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entity text := case tg_table_name when 'clients' then 'client' else 'project' end;
  v_action text;
  v_details jsonb := '{}'::jsonb;
begin
  if tg_op = 'INSERT' then
    v_action := 'created';
  else
    -- Ignore no-op saves and system changes (created_by is set null when a
    -- user account is deleted — must not log, or block the cascade).
    if (to_jsonb(new) - 'updated_at' - 'created_by') = (to_jsonb(old) - 'updated_at' - 'created_by') then
      return null;
    end if;

    v_action := 'updated';
    -- Nested IFs: PL/pgSQL doesn't short-circuit AND, and each table has
    -- columns the other lacks.
    if tg_table_name = 'clients' then
      if old.archived_at is null and new.archived_at is not null then
        v_action := 'archived';
      elsif old.archived_at is not null and new.archived_at is null then
        v_action := 'restored';
      end if;
    elsif old.status is distinct from new.status then
      v_action := 'status_changed';
      v_details := jsonb_build_object('from', old.status, 'to', new.status);
    end if;
  end if;

  insert into public.activity_log (org_id, actor_id, entity_type, entity_id, action, summary, details)
  values (new.org_id, auth.uid(), v_entity, new.id, v_action, new.name, v_details);

  return null;
end;
$$;

revoke all on function public.log_activity() from public, anon, authenticated;

drop trigger if exists clients_log_activity on public.clients;
create trigger clients_log_activity
  after insert or update on public.clients
  for each row execute function public.log_activity();

drop trigger if exists projects_log_activity on public.projects;
create trigger projects_log_activity
  after insert or update on public.projects
  for each row execute function public.log_activity();
