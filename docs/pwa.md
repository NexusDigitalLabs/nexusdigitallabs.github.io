# Progressive Web App (PWA)

NexusDigitalLabs is installable as a whole-site app. Users can add it to their
home screen and launch it full-screen (no browser chrome), with offline-capable
caching of previously visited routes.

## What powers it

| Piece | File | Notes |
|-------|------|-------|
| Web app manifest | `public/manifest.json` | Site-wide: `start_url: "/"`, `scope: "/"`, brand icons, accent theme. |
| Service worker | `public/sw.js` (+ `public/workbox-*.js`) | **Generated on build** by `@ducanh2912/next-pwa`. Git-ignored. |
| Build config | `next.config.ts` | Wraps Next config with `withPWA`. Disabled in development. |
| Metadata | `src/app/layout.tsx` | `manifest`, `appleWebApp`, `themeColor`, `applicationName`. |
| Icons | `src/app/icon.png`, `src/app/apple-icon.png`, `src/app/favicon.ico`, `public/icon-192.png`, `public/icon-512.png` | Generated from `public/favicon.png` via `scripts/gen-favicons.mjs`. |
| Install prompt | `src/components/PWAInstallBanner.tsx` | Mounted globally in the root layout. Mobile-only. |

## Build requirement (Next.js 16)

`next-pwa` injects a **webpack** plugin to emit the service worker. Next.js 16
defaults to **Turbopack** for `next build` / `next dev`, which skips webpack
plugins and therefore does **not** generate `sw.js` during a plain Turbopack build.

For this reason the production build script uses the webpack builder:

```jsonc
// package.json
"build": "next build --webpack"
```

`next.config.ts` also sets `turbopack.root` to this project directory so a
parent lockfile (e.g. `~/pnpm-lock.yaml`) cannot make Turbopack resolve
modules from the wrong workspace. Without that, Safari/dev can throw a
React Client Manifest error about `global-error.js`. Do not remove
`turbopack.root` or the empty webpack/turbopack coexistence will regress.

Do not change the build script back to plain `next build` or the service worker
will stop being generated (the app still works, but is no longer
installable/offline).

The service worker is disabled in development (`disable: NODE_ENV === 'development'`),
so `next dev` is unaffected. To test the installable build locally:

```bash
npm run build && npm start
```

## Install behaviour

- **Android / Chrome** — `PWAInstallBanner` captures `beforeinstallprompt` and
  shows an "Add to Home Screen" button.
- **Samsung Internet** — do **not** use Samsung's install flow. Samsung's
  WebAPK minting server generates an outdated `targetSdkVersion`, which triggers
  Android's "Unsafe app blocked / built for an older version of Android" warning
  on Android 14+. The banner detects `SamsungBrowser` and directs users to open
  the site in **Google Chrome**, then use **Install app**.
- **iOS / Safari** — no programmatic prompt exists; the banner shows
  Share → *Add to Home Screen* instructions instead.
- Dismissing stores `ndl_pwa_dismissed=1` in `localStorage` (persists across
  visits). The banner is hidden automatically when already running standalone.

## iOS safe areas

`viewportFit: 'cover'` is set so `env(safe-area-inset-*)` works. The sticky
header uses `padding-top: env(safe-area-inset-top)` and
`appleWebApp.statusBarStyle` is `'default'` (not `black-translucent`) so the
logo / nav are not drawn under the Dynamic Island or status bar when launched
as a home-screen app.

## Regenerating icons

All icons derive from `public/favicon.png` (the blue "N"). To regenerate after
changing the source logo:

```bash
node scripts/gen-favicons.mjs
```

This writes `icon.png` (256), `apple-icon.png` (180), a multi-size
`favicon.ico` (16/32/48), and the manifest icons `icon-192.png` / `icon-512.png`.

## Not included

Native app-store packaging (Apple App Store / Google Play) is out of scope. If
needed later, wrap this PWA with PWABuilder or Capacitor — no separate codebase
required.
