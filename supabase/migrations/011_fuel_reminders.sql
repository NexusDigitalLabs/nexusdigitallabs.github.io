-- Maintenance reminders, synced server-side (previously AsyncStorage-only —
-- see Odova's docs/architecture.md and known-gaps.md). Mirrors fuel_fills'
-- shape and access pattern exactly: CRUD via service-role /api/fuel, RLS on
-- as defense-in-depth, SELECT-only for the claimed owner in the Table Editor.
--
-- Run in Supabase → SQL Editor after 002_fuel_user_id.sql (needs fuel_vehicles).

create table if not exists public.fuel_reminders (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.fuel_vehicles (id) on delete cascade,
  user_code text not null,
  title text not null,
  due_type text not null check (due_type in ('date', 'odometer')),
  due_date date,
  due_odometer numeric,
  notes text,
  completed_at timestamptz,
  -- Recurring reminders: set at most one of these. When a reminder with a
  -- recurrence interval is marked complete, the client creates the next
  -- occurrence (due_date/due_odometer advanced by the interval) as a new
  -- row — see Odova's GarageContext.completeReminder. No DB trigger for
  -- this deliberately: every other mutation in this schema is a plain
  -- single-row op with no server-side side effects, and a missed
  -- auto-creation (e.g. network drop) is low-stakes and user-correctable,
  -- unlike getting that logic wrong inside a trigger.
  recurrence_interval_days int,
  recurrence_interval_km numeric,
  created_at timestamptz not null default now(),
  constraint fuel_reminders_due_matches_type check (
    (due_type = 'date' and due_date is not null) or
    (due_type = 'odometer' and due_odometer is not null)
  )
);

create index if not exists fuel_reminders_vehicle_id_idx
  on public.fuel_reminders (vehicle_id);

create index if not exists fuel_reminders_user_code_idx
  on public.fuel_reminders (user_code);

alter table public.fuel_reminders enable row level security;

drop policy if exists "fuel_reminders_select_own" on public.fuel_reminders;
create policy "fuel_reminders_select_own"
  on public.fuel_reminders for select
  to authenticated
  using (
    exists (
      select 1
      from public.fuel_vehicles v
      where v.id = fuel_reminders.vehicle_id
        and v.user_id = auth.uid()
    )
  );

comment on table public.fuel_reminders is
  'Fuel Tracker maintenance reminders. RLS on; CRUD via service-role /api/fuel. Authenticated users may SELECT reminders for claimed vehicles only.';
