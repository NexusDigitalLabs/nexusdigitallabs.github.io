# Support CTA

NexusDigitalLabs uses a lightweight Ko-fi link for voluntary support — not a third-party widget embed.

## Global placement

- The floating tip jar lives in `src/app/layout.tsx` via `KofiTipLink variant="floating" href={KOFI_URL}`.
- Because it is in the root layout, it appears on all existing and future pages: tools, articles, games, legal pages, About, Contact, and account pages.
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

Do not re-add the button in the footer brand column — the floating CTA already covers every page.

## Future pages

Future App Router pages should rely on the root-layout floating tip jar by default. Add an inline `KofiTipLink` only when it improves local page context and does not duplicate a nearby support CTA.
