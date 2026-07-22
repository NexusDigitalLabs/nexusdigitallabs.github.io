# Auth & accounts

NexusDigitalLabs uses **Supabase Auth** (Google OAuth + magic link). Most tools stay fully client-side; accounts unlock optional cloud features such as Fuel Tracker garage claim.

## Auth gate UI

Use [`AuthGate`](../src/components/AuthGate.tsx) to block any feature that requires sign-in:

```tsx
<AuthGate next="/account/" title="Sign in required" description="…">
  <ProtectedPanel />
</AuthGate>
```

Signed-out users see a blurred locked shell + dialog with **Sign in to continue** (preserves `?next=`). Sign-out / sign-in triggers `router.refresh()` via `AuthProvider`.

### Fuel Tracker

After you sign in (or link a garage), that sync code is marked auth-locked (`localStorage` key `ndl_fuel_auth_lock`). Signing out replaces the dashboard with a full-page `AuthGate` — data is not shown. Pure anonymous sync-code use (never signed in on that garage) still works without an account.

### Preferred currency

Run [`003_preferred_currency.sql`](../supabase/migrations/003_preferred_currency.sql). `profiles.preferred_currency` is the signed-in preference (Fuel Tracker + Account). Anonymous users still use `localStorage` (`ndl_fuel_currency`).

## Env vars

| Variable | Where | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | Browser + SSR auth (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel | Server-only admin APIs (fuel sync codes, counters) |

Never expose the service role key to the client.

## Phase A — profiles

1. Run [`supabase/migrations/001_profiles.sql`](../supabase/migrations/001_profiles.sql) in the Supabase SQL Editor.
2. On login, `/auth/callback` and `AuthProvider` upsert into `public.profiles` (RLS: own row only). Custom display names are preserved on later syncs.
3. `/account/` lets signed-in users edit display name; header menu links there.

### Supabase Auth settings

- **Site URL:** production origin (e.g. `https://nexusdigitallabs.dev`)
- **Redirect URLs:** include `https://nexusdigitallabs.dev/auth/callback/` and local `http://localhost:3000/auth/callback/`

## Phase B — Fuel Tracker claim (complete)

1. Run [`supabase/migrations/002_fuel_user_id.sql`](../supabase/migrations/002_fuel_user_id.sql) (requires Phase A).
2. **Claim API:** `POST /api/fuel` `{ resource: "claim", code }` (signed-in); `GET …?resource=claim_status&code=`; new vehicles inherit existing `user_id` for that code.
3. **Restore by account:** `GET /api/fuel?resource=account` + Fuel Tracker init when signed in with no local sync code.
4. **UI:** sync card + Settings — **Link to my account** / **Sign in to link** / Linked badge.

Anonymous `user_code` sync continues to work without signing in.

## RLS on service-role tables (required)

Run [`008_enable_rls_service_role_tables.sql`](../supabase/migrations/008_enable_rls_service_role_tables.sql) so Supabase Security Advisor no longer flags `rls_disabled_in_public`.

| Table | Access model |
|-------|----------------|
| `fuel_vehicles` / `fuel_fills` | RLS on. CRUD only via `/api/fuel` (service role). Signed-in users may **SELECT** claimed rows (`user_id = auth.uid()`). |
| `page_views` | RLS on; explicit deny for `anon` / `authenticated`. Read/write only via `/api/counters` (service role). |

If you already ran an older `008` and Advisor shows `rls_enabled_no_policy` on `page_views`, run [`008b_page_views_deny_client_policy.sql`](../supabase/migrations/008b_page_views_deny_client_policy.sql).

Do **not** re-run [`002b_fuel_disable_rls.sql`](../supabase/migrations/002b_fuel_disable_rls.sql) after `008` — that file was a temporary hot-fix and leaves tables publicly readable with the anon key.

## Harden SECURITY DEFINER functions (required)

Run [`009_harden_security_definer_functions.sql`](../supabase/migrations/009_harden_security_definer_functions.sql) after `001`–`004` (and preferably after `008`).

| Function | Intended callers |
|----------|------------------|
| `claim_fuel_garage` / `unlink_fuel_garage` | `service_role` only (`/api/fuel`) — revoke `anon` / `authenticated` |
| `handle_new_user` | Auth trigger only — no PostgREST RPC |
| `set_profiles_updated_at` | Trigger; `search_path = public` |

Optional (Auth dashboard, not SQL): enable **Leaked password protection** under Auth → Password security if password sign-in is allowed.

## Privacy / legal

Account and Fuel Tracker processing is disclosed in [`/privacy-policy/`](https://nexusdigitallabs.dev/privacy-policy/) and [`/terms/`](https://nexusdigitallabs.dev/terms/). See also [`docs/tools/fuel-tracker.md`](tools/fuel-tracker.md).

## Phase B+ — Unlink garage

Run [`004_unlink_fuel_garage.sql`](../supabase/migrations/004_unlink_fuel_garage.sql). UI: **Unlink from account** on the sync card / Settings. Clears `user_id` and auth lock; sync code remains.

## Phase C — Games high scores

Run [`005_game_scores.sql`](../supabase/migrations/005_game_scores.sql). Signed-in players merge local ↔ cloud best scores via `useGameState` + `src/lib/game-scores.ts` (RLS: own rows).

Then run [`007_game_scores_brain.sql`](../supabase/migrations/007_game_scores_brain.sql) to allow brain-suite keys (`sudoku`, `gridlock`, `sumoku`, `cryptic-paths`, `semantic-shift`).

## Opt-in tool drafts (Invoice / Debt)

Run [`006_tool_drafts.sql`](../supabase/migrations/006_tool_drafts.sql). Default remains local-only. Users can enable **Cloud draft** while signed in (`tool_drafts` table, RLS own row only).

## Deferred

- Custom SMTP for magic-link email branding (Resend / DNS).

## Contact form

The contact page posts to `POST /api/contact`, which sends mail with **Resend** (server-only).

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Resend API key |
| `CONTACT_FROM_EMAIL` | Public From (e.g. `NexusDigitalLabs <hello@nexusdigitallabs.dev>`) |
| `CONTACT_TO_EMAIL` | Private inbox (e.g. `dilanfdo.dev@gmail.com`) — never exposed to the client |

Set the same vars on Vercel. Domain sending must be verified in Resend. `Reply-To` is the visitor’s address.

## Support CTA

The Ko-fi support CTA is a lightweight external link (`KofiTipLink`) rendered globally from the root layout. It does not affect auth state, user data, or Supabase. Do not add Ko-fi scripts or embeds; see [`docs/support.md`](support.md).
