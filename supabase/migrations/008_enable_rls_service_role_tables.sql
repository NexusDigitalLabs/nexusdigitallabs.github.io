-- Security: enable RLS on tables accessed only via service-role API routes.
-- Fixes Supabase advisor: rls_disabled_in_public ("Table publicly accessible").
--
-- /api/fuel and /api/counters use SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS.
-- Anon / authenticated clients must not read or write these tables directly.
--
-- Run in Supabase → SQL Editor after 002_fuel_user_id.sql (and base fuel tables).
-- Do NOT re-run 002b_fuel_disable_rls.sql after this migration.

-- ── page_views (footer counters via /api/counters) ────────────────────────────

create table if not exists public.page_views (
  page_path text primary key,
  count     int8 not null default 1
);

alter table public.page_views enable row level security;

-- Explicit deny for client roles (clears advisor: rls_enabled_no_policy).
-- service_role bypasses RLS and continues to power /api/counters.
drop policy if exists "page_views_no_client_access" on public.page_views;
create policy "page_views_no_client_access"
  on public.page_views
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ── fuel_vehicles / fuel_fills (via /api/fuel) ────────────────────────────────

alter table public.fuel_vehicles enable row level security;
alter table public.fuel_fills enable row level security;

-- Drop any leftover broad policies from older drafts.
drop policy if exists "fuel_vehicles_select_own" on public.fuel_vehicles;
drop policy if exists "fuel_vehicles_update_own" on public.fuel_vehicles;
drop policy if exists "fuel_vehicles_insert_own" on public.fuel_vehicles;
drop policy if exists "fuel_vehicles_delete_own" on public.fuel_vehicles;
drop policy if exists "fuel_fills_select_own" on public.fuel_fills;
drop policy if exists "fuel_fills_insert_own" on public.fuel_fills;
drop policy if exists "fuel_fills_update_own" on public.fuel_fills;
drop policy if exists "fuel_fills_delete_own" on public.fuel_fills;

-- Optional: signed-in users can view their own claimed garage in the Table Editor.
-- Mutations still go through /api/fuel (service role). Unclaimed (user_id null) rows
-- stay invisible to the anon/authenticated roles.
create policy "fuel_vehicles_select_own"
  on public.fuel_vehicles for select
  to authenticated
  using (auth.uid() = user_id);

create policy "fuel_fills_select_own"
  on public.fuel_fills for select
  to authenticated
  using (
    exists (
      select 1
      from public.fuel_vehicles v
      where v.id = fuel_fills.vehicle_id
        and v.user_id = auth.uid()
    )
  );

comment on table public.fuel_vehicles is
  'Fuel Tracker vehicles. RLS on; CRUD via service-role /api/fuel. Authenticated users may SELECT claimed rows only.';

comment on table public.fuel_fills is
  'Fuel Tracker fill-ups. RLS on; CRUD via service-role /api/fuel. Authenticated users may SELECT fills for claimed vehicles only.';

comment on table public.page_views is
  'Anonymous page view counters. RLS on; client roles denied; access only via service-role /api/counters.';
