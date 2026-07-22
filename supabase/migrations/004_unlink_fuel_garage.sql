-- Unlink Fuel Tracker garage from an auth account
-- Run after 002_fuel_user_id.sql

create or replace function public.unlink_fuel_garage(p_user_code text, p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := trim(p_user_code);
  v_owner uuid;
  v_count int;
begin
  if v_code is null or v_code = '' then
    return jsonb_build_object('ok', false, 'error', 'missing_code');
  end if;
  if p_user_id is null then
    return jsonb_build_object('ok', false, 'error', 'missing_user');
  end if;

  select user_id into v_owner
  from public.fuel_vehicles
  where user_code = v_code
    and user_id is not null
  limit 1;

  if v_owner is null then
    return jsonb_build_object('ok', true, 'vehicles_updated', 0, 'already_unlinked', true);
  end if;

  if v_owner <> p_user_id then
    return jsonb_build_object('ok', false, 'error', 'not_owner');
  end if;

  update public.fuel_vehicles
  set user_id = null
  where user_code = v_code
    and user_id = p_user_id;

  get diagnostics v_count = row_count;

  return jsonb_build_object('ok', true, 'vehicles_updated', v_count);
end;
$$;

revoke all on function public.unlink_fuel_garage(text, uuid) from public;
revoke all on function public.unlink_fuel_garage(text, uuid) from anon;
revoke all on function public.unlink_fuel_garage(text, uuid) from authenticated;
grant execute on function public.unlink_fuel_garage(text, uuid) to service_role;
