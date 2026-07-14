-- Preferred currency on user profiles (global preference)
-- Run in Supabase → SQL Editor after 001_profiles.sql

alter table public.profiles
  add column if not exists preferred_currency text not null default 'USD';

comment on column public.profiles.preferred_currency is
  'ISO-like currency code used across tools (e.g. Fuel Tracker).';

-- Optional: constrain to known codes used by the app
alter table public.profiles
  drop constraint if exists profiles_preferred_currency_check;

alter table public.profiles
  add constraint profiles_preferred_currency_check
  check (
    preferred_currency in (
      'USD', 'EUR', 'GBP', 'AUD', 'LKR', 'INR', 'SGD', 'CAD', 'JPY'
    )
  );
