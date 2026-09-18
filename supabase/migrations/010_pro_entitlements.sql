-- Pro entitlement record, written only by the RevenueCat webhook handler
-- (service role — see src/app/api/revenuecat-webhook/route.ts). This is the
-- prerequisite for ever enforcing Pro limits server-side instead of trusting
-- the client; the client-side gate in the Odova app remains the primary UX
-- today, this is the record a future server check would read.
--
-- Separate table rather than columns on `profiles`, deliberately: profiles'
-- existing "profiles_update_own" policy lets a signed-in user update their
-- own row for any column, so an is_pro column there would be directly
-- writable by any authenticated client via the anon key — a free
-- self-upgrade. A dedicated table with a select-only policy (no
-- insert/update/delete for anon/authenticated) closes that off entirely,
-- mirroring fuel_vehicles/fuel_fills' post-008 posture.

create table if not exists public.pro_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_pro boolean not null default false,
  revenuecat_app_user_id text,
  product_id text,
  updated_at timestamptz not null default now()
);

alter table public.pro_entitlements enable row level security;

drop policy if exists "pro_entitlements_select_own" on public.pro_entitlements;
create policy "pro_entitlements_select_own"
  on public.pro_entitlements for select
  using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policies for anon/authenticated —
-- every write goes through the service-role webhook handler.
