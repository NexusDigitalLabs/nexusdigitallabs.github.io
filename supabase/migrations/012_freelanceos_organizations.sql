-- FreelanceOS — Phase 0: organizations (the multi-tenancy root).
--
-- Every FreelanceOS business table (clients, projects, invoices, …) will carry
-- an org_id and gate access through public.is_org_member(org_id). Today each
-- user gets one personal organization; the membership table means teams can
-- be added later without reshaping the data.
--
-- Write posture:
--   - organizations: no INSERT/DELETE for clients. Created only via
--     ensure_personal_org(); owners/admins may UPDATE name + base_currency
--     only. `plan` is NOT client-writable (column grants below) — same
--     self-upgrade concern documented in 010_pro_entitlements.sql.
--   - org_members: read-only for clients; written by ensure_personal_org().
--
-- Run in Supabase → SQL Editor after 001–011.

-- ── Shared updated_at trigger (reused by later FreelanceOS tables) ───────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Tables ───────────────────────────────────────────────────────────────────

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  plan text not null default 'beta'
    check (plan in ('beta', 'free', 'freelancer', 'pro')),
  base_currency text not null default 'USD'
    check (base_currency ~ '^[A-Z]{3}$'),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

create index if not exists org_members_user_idx on public.org_members (user_id);

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

-- ── Membership helpers (used by every FreelanceOS RLS policy) ────────────────
-- SECURITY DEFINER so policies on org_members itself don't recurse.

create or replace function public.is_org_member(p_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id and user_id = (select auth.uid())
  );
$$;

create or replace function public.has_org_role(p_org_id uuid, p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.org_members
    where org_id = p_org_id
      and user_id = (select auth.uid())
      and role = any (p_roles)
  );
$$;

revoke all on function public.is_org_member(uuid) from public, anon;
revoke all on function public.has_org_role(uuid, text[]) from public, anon;
grant execute on function public.is_org_member(uuid) to authenticated;
grant execute on function public.has_org_role(uuid, text[]) to authenticated;

-- ── RLS ──────────────────────────────────────────────────────────────────────

alter table public.organizations enable row level security;
alter table public.org_members enable row level security;

revoke all on public.organizations from anon;
revoke all on public.org_members from anon;

drop policy if exists "organizations_select_member" on public.organizations;
create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

drop policy if exists "organizations_update_admin" on public.organizations;
create policy "organizations_update_admin"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, array['owner', 'admin']))
  with check (public.has_org_role(id, array['owner', 'admin']));

-- Column-level: clients may only change these columns, never `plan`.
revoke insert, update, delete on public.organizations from authenticated;
grant update (name, base_currency) on public.organizations to authenticated;

drop policy if exists "org_members_select_same_org" on public.org_members;
create policy "org_members_select_same_org"
  on public.org_members for select
  to authenticated
  using (user_id = (select auth.uid()) or public.is_org_member(org_id));

revoke insert, update, delete on public.org_members from authenticated;

-- ── Workspace bootstrap ──────────────────────────────────────────────────────
-- Called by the app on entry to /app. Idempotent: returns the caller's first
-- organization, creating a personal one (with owner membership) if none.

create or replace function public.ensure_personal_org()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_org uuid;
  v_name text;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  -- Serialize concurrent first visits (parallel requests) per user.
  perform pg_advisory_xact_lock(hashtextextended('fos_personal_org:' || v_uid::text, 0));

  select org_id into v_org
  from public.org_members
  where user_id = v_uid
  order by created_at
  limit 1;

  if v_org is not null then
    return v_org;
  end if;

  select nullif(btrim(display_name), '') into v_name
  from public.profiles
  where id = v_uid;

  insert into public.organizations (name, created_by)
  values (left(coalesce(v_name, 'My business'), 120), v_uid)
  returning id into v_org;

  insert into public.org_members (org_id, user_id, role)
  values (v_org, v_uid, 'owner');

  return v_org;
end;
$$;

revoke all on function public.ensure_personal_org() from public, anon;
grant execute on function public.ensure_personal_org() to authenticated;

-- ── Cleanup: an organization with no members is deleted ──────────────────────
-- Account deletion cascades auth.users → org_members; this then removes the
-- now-orphaned organization (and, via FKs, all of its business data).

create or replace function public.delete_empty_organization()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.organizations o
  where o.id = old.org_id
    and not exists (select 1 from public.org_members m where m.org_id = old.org_id);
  return null;
end;
$$;

revoke all on function public.delete_empty_organization() from public, anon, authenticated;

drop trigger if exists org_members_delete_empty_org on public.org_members;
create trigger org_members_delete_empty_org
  after delete on public.org_members
  for each row execute function public.delete_empty_organization();
