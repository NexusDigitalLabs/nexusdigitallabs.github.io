-- Patch: clear Security Advisor rls_enabled_no_policy on page_views.
-- Run this if you already applied 008 before the deny policy was added.
-- Safe to re-run. Fresh installs can skip this and use 008 alone.

drop policy if exists "page_views_no_client_access" on public.page_views;
create policy "page_views_no_client_access"
  on public.page_views
  for all
  to anon, authenticated
  using (false)
  with check (false);

comment on table public.page_views is
  'Anonymous page view counters. RLS on; client roles denied; access only via service-role /api/counters.';
