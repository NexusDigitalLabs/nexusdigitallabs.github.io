# Fuel Tracker

**Route:** `/tools/fuel-tracker/`  
**Status:** Live  
**Source:** `src/components/tools/FuelTrackerClient.tsx`  
**API:** `src/app/api/fuel/route.ts`

---

## Overview

A browser-based fuel tracking tool that allows users to log fill-ups, track real-world fuel efficiency (L/100km and km/L), and monitor spend across one or more vehicles. Data is synced cross-device via a unique personal code — no account or email required.

---

## Features

- **Multi-vehicle support** — add and switch between unlimited vehicles
- **Fill-up logging** — date, odometer, litres, price per litre, partial fill toggle, notes
- **Efficiency metrics** — L/100km, km/L, best/worst fill, cost per km
- **SVG line charts** — efficiency over time, cumulative spend
- **Cross-device sync** — "Nickname + auto-suffix" pattern (e.g. `MyGarage-7X4P`) stored in `localStorage` and Supabase
- **CSV export** — full fill history with all calculated columns
- **Currency selector** — 9 currencies; stored in `localStorage`
- **Delete controls** — delete individual fills, vehicles, or all user data

---

## Data Model

### `fuel_vehicles`

| Column       | Type      | Notes                          |
|--------------|-----------|--------------------------------|
| `id`         | uuid (PK) | Auto-generated                 |
| `user_code`  | text      | The user's sync code           |
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
| `user_code`       | text        | Denormalised for security queries  |
| `fill_date`       | date        |                                    |
| `odometer`        | numeric     | km                                 |
| `litres`          | numeric     |                                    |
| `price_per_litre` | numeric     |                                    |
| `is_partial`      | boolean     | Excludes from efficiency calc      |
| `notes`           | text        | Optional                           |
| `created_at`      | timestamptz |                                    |

---

## Supabase SQL Migration

Run the following in your Supabase SQL editor:

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
2. System appends 4-char random suffix: `XXXX = Math.random().toString(36).slice(2,6).toUpperCase()`
3. Final code: `Nickname-XXXX` — stored in `localStorage` key `ndl_fuel_code`
4. On another device: "I Have a Code" mode → validates by fetching vehicles for that code

**Privacy:** No email or PII is requested. If user enters an `@` symbol in nickname, a warning is shown advising against using personal info.

---

## Tech Stack

- **Framework:** Next.js 14 App Router (React 18)
- **Rendering:** Client Component (`'use client'`)
- **Database:** Supabase (PostgreSQL)
- **API:** Next.js Route Handler (`/api/fuel`)
- **Charts:** Custom inline SVG (no chart library)
- **Styling:** Inline styles matching site dark theme
