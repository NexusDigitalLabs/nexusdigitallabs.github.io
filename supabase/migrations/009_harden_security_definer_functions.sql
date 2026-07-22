-- Harden SECURITY DEFINER functions + fix mutable search_path.
-- Clears Supabase Advisor:
--   - function_search_path_mutable (set_profiles_updated_at)
--   - anon_security_definer_function_executable
--   - authenticated_security_definer_function_executable
--
-- App impact: none — /api/fuel still calls claim/unlink with service_role.
-- handle_new_user remains trigger-only (auth.users INSERT); no public RPC.
--
-- Run in Supabase → SQL Editor after 001–004 (and preferably after 008).

-- ── 1) Fix search_path on profiles updated_at trigger ────────────────────────

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 2) Fuel helpers: service_role only (not anon / authenticated RPC) ────────

revoke all on function public.claim_fuel_garage(text, uuid) from public;
revoke all on function public.claim_fuel_garage(text, uuid) from anon;
revoke all on function public.claim_fuel_garage(text, uuid) from authenticated;
grant execute on function public.claim_fuel_garage(text, uuid) to service_role;

revoke all on function public.unlink_fuel_garage(text, uuid) from public;
revoke all on function public.unlink_fuel_garage(text, uuid) from anon;
revoke all on function public.unlink_fuel_garage(text, uuid) from authenticated;
grant execute on function public.unlink_fuel_garage(text, uuid) to service_role;

-- ── 3) Auth trigger: no direct RPC for any client role ───────────────────────

revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon;
revoke all on function public.handle_new_user() from authenticated;
