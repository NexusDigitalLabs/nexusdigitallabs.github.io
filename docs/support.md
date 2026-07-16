# Support CTA

NexusDigitalLabs uses a lightweight Ko-fi link for voluntary support — not a third-party widget embed.

## Global placement

- Temporarily disabled until the support/tip page is fully ready.
- The root-layout mount in `src/app/layout.tsx` is intentionally commented out with a TODO:

```tsx
{/* TODO: Re-enable once the support/tip page is fully ready.
<KofiTipLink variant="floating" href={KOFI_URL} />
*/}
```

- Do not add Ko-fi widget scripts or third-party embeds. Keep support UI as a simple external link to preserve Lighthouse/Core Web Vitals.

## Design rules

- Match platform tokens (`var(--ndl-accent)`, `border-radius: 12px`, high contrast).
- Copy: **Buy me a coffee?** with a large leading ☕ emoji (no Lucide icon, no third-party widget chrome).
- Floating position: fixed bottom-right (`z-50`), using `env(safe-area-inset-bottom)` so it sits near the bottom on mobile without colliding with the home indicator.
- Persistent — no dismiss control.

## Component

```
src/components/KofiTipLink.tsx
```

Client component (`"use client"`). Accepts `href` for the Ko-fi destination.

```tsx
<KofiTipLink variant="floating" href={KOFI_URL} />
<KofiTipLink />
<KofiTipLink variant="card" />
```

Do not re-add the button in the footer brand column while the global floating CTA is paused.

## Future pages

Future App Router pages should not add new floating support CTAs while the support/tip page is still being finalized. Re-enable the root-layout mount once the destination is ready.
