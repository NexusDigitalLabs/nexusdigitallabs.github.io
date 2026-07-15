# NexusDigitalLabs

**Engineering minimalist web utilities, developer tools, and browser games.**

### [→ Visit nexusdigitallabs.dev](https://nexusdigitallabs.dev/)

![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)
![Next.js](https://img.shields.io/badge/Built%20With-Next.js%2016-000000?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## What Is This

NexusDigitalLabs is an independent software studio that builds zero-bloat, single-purpose digital products engineered for speed, privacy, and genuine utility. This repository is the monorepo powering the entire `nexusdigitallabs.dev` domain — the studio homepage, all production utility tools, browser games, and engineering articles.

The guiding philosophy:

- **Client-side first.** Calculators and generators process data in the browser. No telemetry on what users type. Accounts and Fuel Tracker sync are optional cloud features.
- **Zero unnecessary dependencies.** React, Next.js, and Tailwind CSS. Nothing else in the production bundle beyond what's actively used.
- **Free forever.** Deployed on Vercel's free tier with Supabase's free tier for analytics. There are no paywalls, no freemium tiers, and no subscription gates.
- **Privacy by architecture.** Umami analytics is cookie-free and aggregate-only. Auth cookies exist only after voluntary sign-in. See `/privacy-policy/`.

---

## Repository Structure

```
nexusdigitallabs.github.io/
│
├── src/
│   ├── app/                                    # Next.js App Router pages
│   │   ├── layout.tsx                          # Root layout (Header, Footer, fonts, Umami)
│   │   ├── globals.css                         # Design tokens, animations, scroll-reveal
│   │   ├── page.tsx                            # / — Studio homepage
│   │   ├── about/page.tsx                      # /about/
│   │   ├── contact/page.tsx                    # /contact/
│   │   ├── privacy-policy/page.tsx             # /privacy-policy/
│   │   │
│   │   ├── articles/
│   │   │   ├── page.tsx                        # /articles/ — index listing all articles
│   │   │   ├── optimizing-ai-prompt-tokens-for-llms/page.tsx
│   │   │   ├── how-to-reduce-openai-api-costs/page.tsx
│   │   │   ├── how-to-write-a-freelance-invoice/page.tsx
│   │   │   ├── avalanche-vs-snowball-debt-payoff/page.tsx
│   │   │   └── browser-games-no-download-no-login/page.tsx
│   │   │
│   │   ├── tools/
│   │   │   ├── prompt-architect/page.tsx       # Tool page + SEO block
│   │   │   ├── invoice-generator/page.tsx      # Tool page + SEO block
│   │   │   ├── debt-optimizer/page.tsx         # Tool page + SEO block
│   │   │   └── fuel-tracker/page.tsx           # Tool page + SEO block
│   │   │
│   │   ├── games/
│   │   │   ├── page.tsx                        # /games/ — lobby
│   │   │   ├── 2048/page.tsx
│   │   │   ├── snake/page.tsx
│   │   │   └── blackjack/page.tsx
│   │   │
│   │   └── api/
│   │       └── counters/route.ts               # Page-view counter (Supabase upsert)
│   │
│   ├── components/
│   │   ├── Header.tsx                          # Sticky global nav with page-context badge
│   │   ├── Footer.tsx                          # Footer with link columns and MetricCounter
│   │   ├── MetricCounter.tsx                   # Client-side page-view display ("// Views: X")
│   │   ├── ScrollReveal.tsx                    # IntersectionObserver fade-up animation wrapper
│   │   ├── ContactForm.tsx                     # Contact form (posts to /api/contact via Resend)
│   │   │
│   │   ├── tools/
│   │   │   ├── PromptArchitectClient.tsx       # Token counter + prompt optimizer UI
│   │   │   ├── InvoiceGeneratorClient.tsx      # Invoice builder + PDF export
│   │   │   └── DebtOptimizerClient.tsx         # Debt payoff planner + PDF export
│   │   │
│   │   └── games/
│   │       ├── GameLoader.tsx                  # Dynamic import wrapper (ssr: false)
│   │       ├── GamesLobbyClient.tsx            # Game index with scores + How to Play
│   │       ├── UsernameGate.tsx                # Inline username entry (no fixed overlay)
│   │       ├── GameHelpModal.tsx               # Shared dark-themed How to Play modal
│   │       ├── Game2048.tsx                    # 4×4 tile merge game
│   │       ├── GameSnake.tsx                   # Canvas-based arcade snake
│   │       └── GameBlackjack.tsx               # Card game with dealer AI + chip betting
│   │
│   ├── hooks/
│   │   └── useGameState.ts                     # Stable localStorage hooks (useCallback)
│   │
│   └── lib/
│       └── supabase-server.ts                  # Server-side Supabase client
│
├── public/                                     # Static assets (served at /)
│   ├── favicon.png
│   ├── og-image.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── docs/                                       # Internal documentation per section
│   ├── tools/
│   │   ├── prompt-architect.md
│   │   ├── invoice-generator.md
│   │   ├── debt-optimizer.md
│   │   └── fuel-tracker.md
│   └── games/
│       └── games.md
│
├── .env.local                                  # Local secrets — never committed
├── .env.local.example                          # Template for contributors
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## All Live Routes

| Route | Type | Description |
|---|---|---|
| `/` | Page | Studio homepage — intro, tools index, articles, games |
| `/about/` | Page | Studio mission, principles, values, tech stack, FAQ |
| `/contact/` | Page | Contact form |
| `/privacy-policy/` | Page | Privacy policy |
| `/login/` | Page | Google OAuth + magic link sign-in |
| `/account/` | Page | Profile / display name (signed in) |
| `/auth/callback/` | Route | Completes OAuth / magic-link exchange |
| `/articles/` | Page | Articles index — listing all published articles |
| `/articles/optimizing-ai-prompt-tokens-for-llms/` | Article | LLM token waste, whitespace, JSON flattening |
| `/articles/how-to-reduce-openai-api-costs/` | Article | 6 techniques: compression, routing, caching, batching |
| `/articles/how-to-write-a-freelance-invoice/` | Article | Invoice structure, payment terms, follow-up |
| `/articles/avalanche-vs-snowball-debt-payoff/` | Article | Debt strategy comparison with worked example |
| `/articles/browser-games-no-download-no-login/` | Article | Overview of all three browser games |
| `/tools/prompt-architect/` | Tool | LLM prompt flattener, token counter, cost estimator |
| `/tools/invoice-generator/` | Tool | Freelancer PDF invoice generator |
| `/tools/debt-optimizer/` | Tool | Debt settlement & savings planner with PDF export |
| `/tools/fuel-tracker/` | Tool | Fill-up logger with L/100km efficiency tracking & cross-device sync |
| `/games/` | Game lobby | Game index with high scores and How to Play |
| `/games/2048/` | Game | 2048 tile merge — keyboard + swipe |
| `/games/snake/` | Game | Snake arcade — canvas + requestAnimationFrame |
| `/games/blackjack/` | Game | Blackjack — dealer AI, chip betting, double down |
| `/api/counters` | API | Internal — page-view counter (Supabase upsert/read) |

---

## Tools

### Prompt Architect
> Free AI prompt optimizer and token counter — 100% client-side.

The most complete free token counter available without an API key or account. Uses a JavaScript BPE tokenizer that closely approximates OpenAI's `tiktoken` library, with live cost estimates for GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, and Gemini 1.5 Pro.

**Features:**
- Live token count (BPE estimation, updates on every keystroke)
- API cost estimation across four major model tiers
- One-click whitespace stripping (`/[ \t]+$/gm`)
- Line-ending normalization (CRLF → LF)
- Consecutive blank line collapse
- Single-line flattening for compact prompt injection
- 100% client-side — prompts never leave the browser

| | |
|---|---|
| Route | `/tools/prompt-architect/` |
| Source | `src/components/tools/PromptArchitectClient.tsx` |
| Docs | [`docs/tools/prompt-architect.md`](docs/tools/prompt-architect.md) |
| Status | Live ✅ |

---

### Freelancer Invoice Generator
> Professional PDF invoice generator — no account, no watermark, no cost.

A single-page invoice builder with a live preview. Supports dynamic line items, optional tax and discount lines, custom payment terms, and bank transfer details. PDF generation runs entirely in the browser using `html2pdf.js` loaded from CDN.

**Features:**
- Dynamic line items (add/remove rows)
- Live-updating invoice preview
- Tax percentage and discount amount fields
- Bank details / payment instructions section
- One-click A4 PDF download (no watermark)
- Pre-populated fields persist within the session

| | |
|---|---|
| Route | `/tools/invoice-generator/` |
| Source | `src/components/tools/InvoiceGeneratorClient.tsx` |
| Docs | [`docs/tools/invoice-generator.md`](docs/tools/invoice-generator.md) |
| Status | Live ✅ |

---

### Debt Settlement & Savings Planner
> Short / Medium / Long debt payoff plans that also build savings — with PDF export.

Enter income, expenses, and outstanding balances (no monthly payment field). Free cash flow is split into three strategies: Short (90% debt / 10% savings), Medium (70/30), and Long (50/50). Each plan uses snowball (lowest balance first) and shows debt-free date, monthly savings, and a month-by-month runway.

**Features:**
- Add unlimited expense categories via `+` button
- Debts need only name, total/limit, and outstanding balance
- Three selectable plans: Short, Medium, Long
- Real-time comma-formatted currency inputs
- Currency selector
- Month-by-month runway with debt payments and cumulative savings
- PDF export of selected plan + all-plan comparison
- Warning when expenses exceed income

| | |
|---|---|
| Route | `/tools/debt-optimizer/` |
| Source | `src/components/tools/DebtOptimizerClient.tsx` + `src/lib/debt-engine.ts` |
| Docs | [`docs/tools/debt-optimizer.md`](docs/tools/debt-optimizer.md) |
| Status | Live ✅ |

---

### Fuel Tracker
> Log fill-ups, track L/100km efficiency, and monitor fuel spend — cross-device via sync code (optional account link).

Users create a "garage" by choosing a nickname; the system appends a 4-char random suffix to generate a unique sync code (e.g. `MyGarage-7X4P`). The code is stored in `localStorage` for automatic loading and can be entered on any other device. All data (vehicles + fill-ups) is stored in Supabase under the sync code. Signed-in users can optionally **link** the garage to their account so it restores on login.

**Features:**
- Multi-vehicle support (add unlimited vehicles — make, model, year, fuel type, nickname)
- Fill-up logging: date, odometer, litres, price per litre, partial fill toggle, notes
- Automatic efficiency calculation: L/100km, km/L, cost per km
- Best/worst efficiency tracking, colour-coded rows in history table
- SVG line charts — efficiency over time & cumulative spend
- Currency selector (9 currencies, persisted in `localStorage`)
- Quick cost preview while entering fill form
- CSV export with all calculated columns
- Delete individual fills, vehicles, or all data
- Cross-device sync via sync code (Supabase backend)
- Optional account claim / restore-on-sign-in
- Sync-code flow needs no email; warning if `@` detected in nickname

**Efficiency Formulas:**
- `L/100km = (litres ÷ distance) × 100`
- `km/L = distance ÷ litres`
- `Cost/km = total_cost ÷ distance`
- Partial fills are excluded from efficiency but included in spend totals

| | |
|---|---|
| Route | `/tools/fuel-tracker/` |
| Source | `src/components/tools/FuelTrackerClient.tsx` |
| API | `src/app/api/fuel/route.ts` |
| Docs | [`docs/tools/fuel-tracker.md`](docs/tools/fuel-tracker.md), [`docs/auth.md`](docs/auth.md) |
| Status | Live ✅ |

---

## Articles

All articles are Next.js Server Components — statically rendered at build time, immediately crawlable by search engines, and cross-linked to the relevant tool. Each includes JSON-LD `Article` structured data for Google rich snippets.

| Title | Slug | Topic |
|---|---|---|
| Optimizing AI Prompt Tokens for LLMs | `optimizing-ai-prompt-tokens-for-llms` | Whitespace, JSON flattening, token waste |
| How to Reduce OpenAI API Costs | `how-to-reduce-openai-api-costs` | Compression, routing, caching, batching |
| How to Write a Freelance Invoice | `how-to-write-a-freelance-invoice` | Invoice structure, payment terms, follow-up |
| Avalanche vs Snowball Debt Payoff | `avalanche-vs-snowball-debt-payoff` | Debt strategy comparison with worked example |
| Browser Games — No Download, No Login | `browser-games-no-download-no-login` | Overview of all three NDL browser games |

---

## Games

All games share a common architecture built around two core patterns:

**`useGameState` hook** (`src/hooks/useGameState.ts`) — manages username and per-game high scores via `localStorage`. All functions are wrapped in `useCallback` to maintain stable references across renders and prevent infinite re-render loops in consumer components.

**`GameLoader`** (`src/components/games/GameLoader.tsx`) — a client component that dynamically imports all game components with `ssr: false`. This prevents server-side rendering of components that rely on browser-only APIs (`localStorage`, `canvas`), eliminating React hydration mismatches that would leave the page non-interactive.

**`UsernameGate`** — renders as a full-height page section (not a `position: fixed` overlay). Fixed overlays at any z-index can intercept pointer events from sticky headers in certain browser rendering contexts. Inline rendering avoids this entirely.

**`GameHelpModal`** — a shared dark-themed modal rendered with `z-index: 10000`. Each game page has a labeled `How to Play` button in its header. The games lobby also has a per-card `How to Play` button that opens the rules without entering the game.

| Game | Route | Mechanic | Source |
|---|---|---|---|
| 2048 | `/games/2048/` | Reactive 4×4 matrix, keyboard arrow keys + touch swipe | `Game2048.tsx` |
| Snake | `/games/snake/` | HTML5 Canvas, `requestAnimationFrame` loop, D-pad for touch | `GameSnake.tsx` |
| Blackjack | `/games/blackjack/` | 52-card deck, dealer AI draws to 17, chip betting, double down | `GameBlackjack.tsx` |

All high scores are stored in `localStorage` — never transmitted. The Blackjack game displays an entertainment-only disclaimer banner (no real money, no gambling).

---

## Design System

The site uses a consistent dark-theme design system defined in `src/app/globals.css`:

| Token | Value | Usage |
|---|---|---|
| `--ndl-bg` | `#0b0f19` | Page background |
| `--ndl-surface` | `#0f1420` | Card/panel surface |
| `--ndl-border` | `rgba(30,41,59,0.8)` | Subtle borders |
| `--ndl-text` | `#f8fafc` | Primary text |
| `--ndl-muted` | `#94a3b8` | Secondary/muted text |
| `--ndl-accent` | `#3b82f6` | Blue accent |
| `--ndl-accent-2` | `#6366f1` | Indigo gradient accent |

**Accent colours per section:**
- Tools → Blue (`#3b82f6`) / Violet (`#6366f1`) / Sky (`#0ea5e9`)
- Games → Amber (`#f59e0b`), Emerald (`#4ade80`), Indigo (`#818cf8`)
- Articles → matching tool accent where article links to a tool

**Animation classes:**
- `.ndl-anim-1` through `.ndl-anim-5` — staggered fade-up on hero sections
- `.ndl-reveal` / `.ndl-revealed` — `IntersectionObserver`-triggered scroll animations (`ScrollReveal` component). Elements at `opacity: 0` have `pointer-events: none` to prevent invisible elements from absorbing clicks.
- `.ndl-orb` — ambient gradient blobs with CSS pulse animation

---

## Analytics

Two independent analytics layers run in parallel:

| Layer | Tool | Purpose | Data stored |
|---|---|---|---|
| Public counter | Supabase (`page_views` table) | Visible `// Views: X,XXX` in footer | `page_path` (text) + `count` (int8) |
| Internal analytics | Umami (cookie-free, cloud) | Page views, sessions, referrers | Aggregate only, no PII |

The `MetricCounter` component fires a `POST /api/counters` on mount to upsert the count for the current `window.location.pathname`. The Route Handler (`src/app/api/counters/route.ts`) uses the Supabase service role key to perform an authenticated upsert, keeping the key server-side only.

---

## Tech Stack

| Layer | Choice | Version | Reason |
|---|---|---|---|
| Framework | Next.js App Router | 16.2.10 | RSC by default, file-based routing, Vercel-native |
| UI library | React | 19.2.4 | Server + Client Components, hooks-based game state |
| Language | TypeScript | 5.9.x | Full type coverage across components and hooks |
| Styling | Tailwind CSS | v4 | Utility-first, zero runtime CSS, purged in production |
| Hosting | Vercel | — | Zero-config Next.js deployment, global edge CDN |
| Database | Supabase (PostgreSQL) | — | Page-view counter; free tier |
| Analytics | Umami Cloud | — | Cookie-free, GDPR/CCPA compliant |
| PDF export | `html2pdf.js` | CDN | Client-side A4 PDF generation (Invoice + Debt tools) |
| Game state | `localStorage` | — | Username + high scores, never transmitted |

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

> ⚠️ **Never commit `.env.local`** — it is in `.gitignore`. The `SUPABASE_SERVICE_ROLE_KEY` grants full database access and must remain server-side only. It is only used inside the Next.js Route Handler at `src/app/api/counters/route.ts`.

**Supabase table setup:**

```sql
create table page_views (
  page_path text primary key,
  count     int8 default 1
);
```

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Type-check without building
npx tsc --noEmit

# Production build (verify before pushing)
npm run build
```

Without `.env.local`, the `MetricCounter` in the footer will silently degrade (shows nothing). All tools and games work fully without Supabase credentials.

---

## Deployment

The `main` branch auto-deploys to Vercel on every push. No manual steps required after initial setup.

```bash
git push origin main
# → Vercel picks up the push, runs `npm run build`, deploys to production
```

**Vercel environment variables** must be set in the Vercel Dashboard under **Settings → Environment Variables** for the production deployment to use Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Key Engineering Decisions

### Why `GameLoader` with `ssr: false`
Game components access `localStorage` and the Canvas API — both browser-only. Rendering them on the server produces HTML with `null` content (the components return `null` before `useEffect` runs). React's hydration then finds a mismatch between the server-rendered `null` and the client-rendered game UI, causing a hydration error that prevents event handlers from attaching — the entire page becomes non-interactive. `GameLoader` uses `next/dynamic` with `ssr: false` to skip server rendering for these components entirely.

### Why `useCallback` on all `useGameState` functions
Early versions declared `getHighScore` and `saveScore` as plain function expressions inside the hook. Each render produced a new function reference. Consumer components that listed these in `useEffect` dependency arrays triggered infinite render loops — the JS thread was fully occupied, making the page unresponsive to all pointer events. All hook functions are now wrapped in `useCallback` with `[]` dependencies to guarantee stable references.

### Why `UsernameGate` is not a fixed overlay
A `position: fixed; inset: 0` element at `z-index: 100` covers the entire viewport. Even with the header at `z-index: 9999`, certain browser stacking context resolutions — particularly on Vercel's edge-cached static pages — can cause the fixed overlay to absorb pointer events before they reach a sticky-positioned ancestor. Rendering the gate as an inline full-height flex section eliminates this class of bug entirely.

### Why `.ndl-reveal` has `pointer-events: none`
`ScrollReveal` wraps content in a `div` that starts at `opacity: 0`. Without `pointer-events: none`, these invisible wrappers absorb click events on anything that overlaps them while they're fading in. On the homepage, `ScrollReveal` wrappers covering navigation-height areas were silently blocking header link clicks until the animation completed.

---

## Internal Docs

| Doc | Content |
|---|---|
| [`docs/tools/prompt-architect.md`](docs/tools/prompt-architect.md) | Token counter implementation, BPE approach, transformation pipeline |
| [`docs/tools/invoice-generator.md`](docs/tools/invoice-generator.md) | Invoice fields, PDF generation, layout notes |
| [`docs/tools/debt-optimizer.md`](docs/tools/debt-optimizer.md) | Short/Medium/Long plans, snowball + savings splits, PDF export |
| [`docs/tools/fuel-tracker.md`](docs/tools/fuel-tracker.md) | Data model, sync code, account claim, API, efficiency formulas |
| [`docs/auth.md`](docs/auth.md) | Supabase Auth, profiles, Fuel Tracker claim / restore |
| [`docs/games/games.md`](docs/games/games.md) | Game architecture, useGameState hook, all three game mechanics |

---

## Contributing

Open an issue or pull request on GitHub. Contributions welcome for:
- New utility tools (prefer client-side processing; optional auth only when clearly valuable)
- Article corrections or additions
- Bug fixes
- Accessibility improvements

All PRs must pass `npm run build` with no TypeScript errors before merge.

---

## License

MIT — free to use, fork, and adapt.
