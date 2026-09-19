# AdSense & Consent Mode

The site is built to be AdSense-ready before an account exists: required pages,
Privacy Policy disclosure, `robots.txt` allowance, and (this doc) consent
plumbing are all already in place. No ads are live — nothing renders until
`NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set.

## Why a consent gate exists at all

GTM (`GTM-KB4MRJV6`, loaded unconditionally in `layout.tsx`) already fires
tags today — confirmed live (scroll-depth tracking, `gtm.dom`, `gtm.load`
events). Since Jan 16 2024, Google requires publishers serving ads (AdSense,
Ad Manager, AdMob) to EEA/UK users to use a **Google-certified CMP** and send
Consent Mode v2 signals. This isn't optional once ads are live.

## What's implemented

- **`src/lib/consent.ts`** — Consent Mode v2 read/write/broadcast. Single
  source of truth: `getStoredConsent()`, `setConsent(state)`,
  `reapplyStoredConsent()`.
- **`layout.tsx`** — `gtag('consent', 'default', {...all denied,
  wait_for_update: 500})` runs in a `beforeInteractive` script placed
  *before* the GTM snippet, so every tag GTM fires (now or later) starts
  from a safe denied baseline.
- **`src/components/ConsentBanner.tsx`** — first-visit banner (Accept/Reject).
  Re-applies a stored choice silently on return visits instead of
  re-prompting. Mounted globally in `layout.tsx`.
- **`src/components/CookieSettingsLink.tsx`** — footer link (Company column)
  that re-opens the banner, so withdrawing consent is as easy as giving it.
- **`src/components/AdSenseScript.tsx`** — loads the AdSense script only when
  `NEXT_PUBLIC_ADSENSE_CLIENT_ID` is set *and* the visitor has granted
  consent. Renders nothing otherwise — safe no-op today.

## What this does NOT satisfy on its own

`ConsentBanner` is hand-built, not a Google-certified CMP — Google doesn't
certify custom code. It's correct, real GDPR compliance for the GTM tag
already loading today, and it wires Consent Mode v2 signals correctly, but it
alone doesn't clear AdSense's EEA/UK certified-CMP requirement.

## To actually go live

1. Apply for AdSense (content/pages already qualify — see the eligibility
   audit in project history if you want the full checklist). This step needs
   your own Google account; nothing here can do it for you.
2. Once approved, in the AdSense dashboard: **Privacy & messaging** → turn on
   the GDPR/UK message. This is Google's own certified CMP, configured
   entirely in their dashboard, and reads/writes the same `dataLayer` this
   file already pushes to — no code change needed here for that step.
3. Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` (Vercel env var) — `AdSenseScript.tsx`
   picks it up automatically.
4. Create `public/ads.txt` with the line AdSense gives you
   (`google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`) — can't be
   created correctly before you have a publisher ID.
5. Add actual `<ins class="adsbygoogle">` ad-unit markup to the
   pages/placements you want — not yet done anywhere; `AdSenseScript` only
   loads the library, it doesn't place ad slots.

## Testing

`src/lib/__tests__/consent.test.ts` covers storage, the gtag push shape, and
event broadcast. Manually verified live (2026-09-19): default pushes before
GTM init, Accept persists + updates + dismisses, reload re-applies without
re-prompting, footer link re-opens.
