-- Hotfix: disable RLS on fuel tables (safe with service-role /api/fuel)
-- Run this in Supabase SQL Editor if vehicles stopped appearing after 002.
-- Keeps user_id column + claim_fuel_garage(); only removes RLS.

alter table public.fuel_vehicles disable row level security;
alter table public.fuel_fills disable row level security;

drop policy if exists "fuel_vehicles_select_own" on public.fuel_vehicles;
drop policy if exists "fuel_vehicles_update_own" on public.fuel_vehicles;
drop policy if exists "fuel_fills_select_own" on public.fuel_fills;
