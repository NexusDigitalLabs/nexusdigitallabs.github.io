# Fuel Tracker

**Route:** `/tools/fuel-tracker/`  
**Status:** Live  
**Source:** `src/components/tools/FuelTrackerClient.tsx`  
**API:** `src/app/api/fuel/route.ts`  
**Auth docs:** [`docs/auth.md`](../auth.md)

---

## Overview

Browser-based fuel tracking for fill-ups, real-world efficiency (L/100km and km/L), and spend across one or more vehicles. Cross-device sync works via a personal **sync code** (no account required). Optionally, signed-in users can **link** a garage to their account so it restores automatically on new devices.

Global support CTA: the root layout includes the lightweight `KofiTipLink` floating button on this and all future tool pages. Do not add Ko-fi widget scripts; see [`docs/support.md`](../support.md).

Install prompt: the mobile PWA install banner is now global (root layout), not tool-specific — see [`docs/pwa.md`](../pwa.md). The old page-level `PWAInstallBanner` on this route has been removed.

---

## Features

- **Multi-vehicle support** — add and switch between unlimited vehicles
- **Fill-up logging** — date, odometer, litres, price per litre, partial fill toggle, notes
- **Efficiency metrics** — L/100km, km/L, best/worst fill, cost per km
- **SVG line charts** — efficiency over time, cumulative spend
- **Cross-device sync** — nickname + auto-suffix code (e.g. `MyGarage-7X4P`) in `localStorage` and Supabase
- **Optional account link** — claim garage to Google / magic-link account; restore via sign-in
- **CSV export** — full fill history with calculated columns
- **Currency selector** — 9 currencies; stored in `localStorage`
- **Delete controls** — delete fills, vehicles, or all garage data

---

## Data Model

### `fuel_vehicles`

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | uuid (PK) | Auto-generated                 |
| `user_code`  | text      | Sync code                      |
| `user_id`    | uuid (FK) | Optional — `auth.users.id` when claimed |
| `make`       | text      | e.g. "Toyota"                  |
| `model`      | text      | e.g. "Prius"                   |
| `year`       | int       | Nullable                       |
| `fuel_type`  | text      | Petrol / Diesel / Hybrid / LPG |
| `nickname`   | text      | Optional display label         |
| `created_at` | timestamptz | Auto-generated               |

### `fuel_fills`

| Column            | Type        | Notes                              |
|-------------------|-------------|------------------------------------|
| `id`              | uuid (PK)   | Auto-generated                     |
| `vehicle_id`      | uuid (FK)   | References `fuel_vehicles.id`      |
| `user_code`       | text        | Denormalised                       |
| `fill_date`       | date        |                                    |
| `odometer`        | numeric     | km                                 |
| `litres`          | numeric     |                                    |
| `price_per_litre` | numeric     |                                    |
| `is_partial`      | boolean     | Excludes from efficiency calc      |
| `notes`           | text        | Optional                           |
| `created_at`      | timestamptz |                                    |

---

## Supabase SQL

### Base tables

Run the following in your Supabase SQL editor if creating from scratch:

```sql
create table fuel_vehicles (
  id uuid default gen_random_uuid() primary key,
  user_code text not null,
  make text not null,
  model text not null,
  year int,
  fuel_type text default 'petrol',
  nickname text,
  created_at timestamptz default now()
);

create index fuel_vehicles_user_code_idx on fuel_vehicles(user_code);

create table fuel_fills (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references fuel_vehicles(id) on delete cascade,
  user_code text not null,
  fill_date date not null,
  odometer numeric(10,1) not null,
  litres numeric(6,2) not null,
  price_per_litre numeric(6,3) not null,
  is_partial boolean default false,
  notes text,
  created_at timestamptz default now()
);

create index fuel_fills_vehicle_id_idx on fuel_fills(vehicle_id);
create index fuel_fills_user_code_idx on fuel_fills(user_code);
```

### Account link (optional)

1. Profiles: [`supabase/migrations/001_profiles.sql`](../../supabase/migrations/001_profiles.sql)
2. Fuel `user_id` + claim helper: [`supabase/migrations/002_fuel_user_id.sql`](../../supabase/migrations/002_fuel_user_id.sql)
3. Unlink helper: [`supabase/migrations/004_unlink_fuel_garage.sql`](../../supabase/migrations/004_unlink_fuel_garage.sql)
4. **RLS (required):** [`008_enable_rls_service_role_tables.sql`](../../supabase/migrations/008_enable_rls_service_role_tables.sql) — enables RLS on `fuel_vehicles`, `fuel_fills`, and `page_views` so the anon key cannot read/write them. Service-role `/api/fuel` is unchanged.
5. **Function grants (required):** [`009_harden_security_definer_functions.sql`](../../supabase/migrations/009_harden_security_definer_functions.sql) — revokes client RPC on claim/unlink helpers; locks `handle_new_user` to trigger-only.

Sync by code still uses `/api/fuel` with the **service role**. Anonymous codes remain fully supported when `user_id` is null. The old `002b_fuel_disable_rls.sql` hot-fix is archived at `supabase/migrations/archive/` — do not move it back into `supabase/migrations/`.

---

## API (`/api/fuel`)

| Method | Resource | Auth | Notes |
|--------|----------|------|-------|
| GET | `vehicles` + `code` | No, unless claimed | List vehicles for sync code — if claimed, returns `{ data: [], locked: true }` to any caller not signed in as the owner (server-enforced; see below) |
| GET | `fills` + `code` + `vehicleId` | No, unless claimed | Fill history — same `locked` behaviour as `vehicles` |
| GET | `claim_status` + `code` | Optional session | Claimed / is_owner / signed_in |
| GET | `account` | Signed in | Restore garage(s) linked to `user_id` |
| POST | `vehicle` / `fill` + `code` | No | Create; new vehicles inherit existing `user_id` |
| POST | `claim` + `code` | Signed in | Links garage to account (`claim_fuel_garage`) |
| POST | `unlink` + `code` | Signed in (owner) | Clears `user_id` (`unlink_fuel_garage`); sync code kept |
| DELETE | `fill` / `vehicle` / `user` | No | Delete by id or wipe code |

**Claim lock is server-enforced**, not just a client UI convention: once a garage is
claimed, `GET vehicles`/`fills` withholds real data (`locked: true`, empty `data`)
from any request that isn't signed in as the owner — checked server-side against the
SSR cookie session. Any client consuming this API must check `locked` explicitly
rather than inferring it from `data` contents. Non-browser clients (e.g. a mobile
app) can't send this cookie and so currently always see `locked: true` for a claimed
garage — Bearer-token auth support is planned but not yet implemented.

**Rate limited** (soft, in-memory, per serverless instance, resets every 60s): GET
requests to 30/min/IP, POST/DELETE to 20/min/IP — mitigates sync-code enumeration
against `genCode()`'s ~2.8×10¹² combination space (see Sync Code Design below).

---

## Efficiency Calculations

| Metric       | Formula                                  | Excludes partials |
|--------------|------------------------------------------|-------------------|
| L/100km      | `(litres / distance) × 100`             | Yes               |
| km/L         | `distance / litres`                      | Yes               |
| Cost per km  | `(litres × price_per_litre) / distance`  | Yes               |
| Total spend  | `Σ (litres × price_per_litre)`           | No                |

Distance = `current_odometer − previous_odometer`

---

## Sync Code Design

1. User chooses a nickname (≤20 chars, alphanumeric + `-_`)
2. System appends an 8-char suffix from `crypto.getRandomValues` (~36⁸ ≈ 2.8×10¹²
   combinations — see `genCode()` in `lib/fuel-utils.ts`). Previously 4 chars via
   `Math.random()`, which was brute-forceable; already-issued 4-char codes remain
   valid, only newly generated codes use the longer format.
3. Final code: `nickname-xxxxxxxx` — stored in `localStorage` key `ndl_fuel_code`
4. On another device: "I Have a Code", **or** sign in if the garage was linked to an account

**Privacy:** Sync-code use does not require email. If the user types `@` in the nickname, a warning advises against personal info. Optional account link stores email/provider profile via Supabase Auth — see the [Privacy Policy](https://nexusdigitallabs.dev/privacy-policy/).

---

## Tech Stack

- **Framework:** Next.js App Router (React)
- **Rendering:** Client Component (`'use client'`)
- **Database:** Supabase (PostgreSQL)
- **API:** Next.js Route Handler (`/api/fuel`)
- **Charts:** Custom inline SVG
- **Auth (optional):** Supabase SSR cookies + `/account/`
