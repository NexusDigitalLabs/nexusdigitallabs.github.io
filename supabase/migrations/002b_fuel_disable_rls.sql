-- DEPRECATED hot-fix — do not run on production after migration 008.
-- Disabling RLS exposes fuel_* to the anon key (Security Advisor: rls_disabled_in_public).
-- Use 008_enable_rls_service_role_tables.sql instead. Service-role /api/fuel bypasses RLS.

alter table public.fuel_vehicles disable row level security;
alter table public.fuel_fills disable row level security;

drop policy if exists "fuel_vehicles_select_own" on public.fuel_vehicles;
drop policy if exists "fuel_vehicles_update_own" on public.fuel_vehicles;
drop policy if exists "fuel_fills_select_own" on public.fuel_fills;
