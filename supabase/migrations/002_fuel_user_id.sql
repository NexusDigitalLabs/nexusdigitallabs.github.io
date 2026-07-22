-- Phase B: link Fuel Tracker garages to auth users (optional)
-- Run in Supabase → SQL Editor after 001_profiles.sql
--
-- Anonymous sync via user_code remains fully supported.
-- The Next.js /api/fuel route continues to use the service-role key for
-- code-based CRUD. user_id enables "claim this garage" + restore by account.

-- ── Schema ───────────────────────────────────────────────────────────────────

alter table public.fuel_vehicles
  add column if not exists user_id uuid references auth.users (id) on delete set null;

create index if not exists fuel_vehicles_user_id_idx
  on public.fuel_vehicles (user_id)
  where user_id is not null;

-- One sync code should belong to at most one account once claimed.
-- (Multiple vehicle rows share the same user_code; all get the same user_id.)
create index if not exists fuel_vehicles_user_code_user_id_idx
  on public.fuel_vehicles (user_code, user_id);

comment on column public.fuel_vehicles.user_id is
  'Optional owner from Supabase Auth. Null = anonymous sync-code garage.';

-- ── Claim helper (callable from service role or authenticated session) ───────
-- Sets user_id on every vehicle row for a given user_code, only if:
--   - the code has at least one vehicle, and
--   - no other auth user already owns that code.

create or replace function public.claim_fuel_garage(p_user_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := trim(p_user_code);
  v_existing uuid;
  v_count int;
begin
  if v_code is null or v_code = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_code');
  end if;
  if p_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'missing_user');
  end if;

  select user_id into v_existing
  from public.fuel_vehicles
  where user_code = v_code
    and user_id is not null
  limit 1;

  if v_existing is not null and v_existing <> p_user_id then
    return jsonb_build_object('ok', false, 'error', 'already_claimed');
  end if;

  update public.fuel_vehicles
  set user_id = p_user_id
  where user_code = v_code;

  get diagnostics v_count = row_count;

  if v_count = 0 then
    -- No vehicles yet under this code — still OK; claim is recorded when first
    -- vehicle is created (API will set user_id if session is claimed).
    return jsonb_build_object('ok', true, 'vehicles_updated', 0, 'pending', true);
  end if;

  return jsonb_build_object('ok', true, 'vehicles_updated', v_count);
end;
$$;

revoke all on function public.claim_fuel_garage(text, uuid) from public;
revoke all on function public.claim_fuel_garage(text, uuid) from anon;
revoke all on function public.claim_fuel_garage(text, uuid) from authenticated;
grant execute on function public.claim_fuel_garage(text, uuid) to service_role;

-- Note: RLS for fuel_* is applied in 008_enable_rls_service_role_tables.sql.
-- Cross-device sync uses /api/fuel with the service-role key (bypasses RLS).
-- Securing by sync code happens in that API. Unclaimed rows stay hidden from
-- anon/authenticated in the Table Editor; claimed rows are SELECT-only for the owner.
