# NexusDigitalLabs

**Engineering minimalist web utilities, developer tools, and high-performance software.**

### [→ Visit nexusdigitallabs.dev](https://nexusdigitallabs.dev/)

![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel)
![Next.js](https://img.shields.io/badge/Built%20With-Next.js%2016-000000?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178c6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Analytics](https://img.shields.io/badge/Analytics-Umami%20%26%20Supabase-orange?style=flat-square)

---

## About

NexusDigitalLabs is a software studio that builds zero-bloat, highly focused digital products engineered for speed, privacy, and utility. This repository is the monorepo powering the entire `nexusdigitallabs.dev` domain — the homepage, all production utility tools, browser games, and engineering articles.

The site runs on **Next.js 16 (App Router)** with React Server Components deployed to **Vercel**. All tool logic is 100% client-side — no user data is ever transmitted to a server.

---

## Repository Structure

```
nexusdigitallabs.github.io/
│
├── src/
│   ├── app/                            # Next.js App Router pages
│   │   ├── page.tsx                    # / — Homepage
│   │   ├── about/page.tsx              # /about/
│   │   ├── contact/page.tsx            # /contact/
│   │   ├── privacy-policy/page.tsx     # /privacy-policy/
│   │   ├── articles/
│   │   │   └── optimizing-ai-prompt-tokens-for-llms/page.tsx
│   │   ├── tools/
│   │   │   ├── prompt-architect/page.tsx
│   │   │   ├── invoice-generator/page.tsx
│   │   │   └── debt-optimizer/page.tsx
│   │   ├── games/
│   │   │   ├── page.tsx                # /games/ — lobby
│   │   │   ├── 2048/page.tsx
│   │   │   ├── snake/page.tsx
│   │   │   └── blackjack/page.tsx
│   │   └── api/
│   │       └── counters/route.ts       # Page-view counter (Supabase)
│   │
│   ├── components/
│   │   ├── Header.tsx                  # Global navigation header
│   │   ├── Footer.tsx                  # Global footer with MetricCounter
│   │   ├── MetricCounter.tsx           # Client-side page-view display
│   │   ├── ScrollReveal.tsx            # IntersectionObserver scroll animations
│   │   ├── ContactForm.tsx             # Client-side contact form (mailto)
│   │   ├── tools/
│   │   │   ├── PromptArchitectClient.tsx
│   │   │   ├── InvoiceGeneratorClient.tsx
│   │   │   └── DebtOptimizerClient.tsx
│   │   └── games/
│   │       ├── UsernameGate.tsx        # Shared username modal
│   │       ├── GamesLobbyClient.tsx
│   │       ├── Game2048.tsx
│   │       ├── GameSnake.tsx
│   │       └── GameBlackjack.tsx
│   │
│   ├── hooks/
│   │   └── useGameState.ts             # localStorage username + high scores
│   │
│   └── lib/
│       └── supabase-server.ts          # Server-side Supabase client
│
├── public/                             # Static assets (served at /)
│   ├── favicon.png
│   ├── og-image.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── docs/                               # Internal documentation
│   └── tools/
│       ├── prompt-architect.md
│       ├── invoice-generator.md
│       └── debt-optimizer.md
│
├── .env.local                          # Local secrets (not committed)
├── .env.local.example                  # Template for env vars
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Live Routes

| Route | Description |
|---|---|
| `/` | Homepage — studio introduction and content index |
| `/about/` | About NexusDigitalLabs |
| `/contact/` | Contact page |
| `/privacy-policy/` | Privacy policy |
| `/articles/optimizing-ai-prompt-tokens-for-llms/` | Engineering article — token optimization |
| `/tools/prompt-architect/` | LLM prompt flattener & token optimizer |
| `/tools/invoice-generator/` | Freelancer PDF invoice generator |
| `/tools/debt-optimizer/` | Debt settlement & savings planner |
| `/games/` | Games lobby — username gate + leaderboard |
| `/games/2048/` | 2048 tile merge game |
| `/games/snake/` | Snake arcade game (HTML5 Canvas) |
| `/games/blackjack/` | Blackjack card game |
| `/api/counters` | Internal — page-view counter API (Supabase) |

---

## Tools

### Prompt Architect
> Advanced system prompt flattener optimized for Cursor, Gemini, and LLM workspaces.

- **Route:** `/tools/prompt-architect/`
- **Source:** `src/components/tools/PromptArchitectClient.tsx`
- **Docs:** [`docs/tools/prompt-architect.md`](docs/tools/prompt-architect.md)
- **Status:** Live ✅

### Freelancer Invoice Generator
> Professional A4 PDF invoice generator — dark split-pane, live preview, client-side PDF export.

- **Route:** `/tools/invoice-generator/`
- **Source:** `src/components/tools/InvoiceGeneratorClient.tsx`
- **Docs:** [`docs/tools/invoice-generator.md`](docs/tools/invoice-generator.md)
- **Status:** Live ✅

### Debt Settlement & Savings Planner
> Month-by-month snowball debt payoff engine with PDF export.

- **Route:** `/tools/debt-optimizer/`
- **Source:** `src/components/tools/DebtOptimizerClient.tsx`
- **Docs:** [`docs/tools/debt-optimizer.md`](docs/tools/debt-optimizer.md)
- **Status:** Live ✅

---

## Games

All games use a shared `useGameState` hook for username persistence and high scores via `localStorage`. A username gate modal appears on first visit to any game.

| Game | Route | Mechanic |
|---|---|---|
| 2048 | `/games/2048/` | Reactive 4×4 matrix, keyboard + swipe |
| Snake | `/games/snake/` | HTML5 Canvas + `requestAnimationFrame` loop |
| Blackjack | `/games/blackjack/` | Card engine, dealer AI, chip betting |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 16 (App Router) | RSC by default, file-based routing, Vercel-native |
| Language | TypeScript | Type safety across all components |
| Styling | Tailwind CSS | Utility-first, zero runtime CSS overhead |
| Hosting | Vercel | Zero-config Next.js deployment, global CDN |
| Analytics (public) | Supabase (`page_views` table) | Visible `// Views: X,XXX` counter in footer |
| Analytics (internal) | Umami (cookie-free) | GDPR/CCPA compliant, no consent banner |
| PDF export | `html2pdf.js` (CDN) | Client-side A4 PDF generation |
| Game state | `localStorage` | Username + high scores, never transmitted |

---

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

The `page_views` Supabase table schema:

```sql
create table page_views (
  page_path text primary key,
  count     int8 default 1
);
```

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

---

## Deployment

Push to `main` — Vercel auto-deploys on every commit. Add production environment variables in the Vercel Dashboard under **Settings → Environment Variables**.

```bash
git push origin main
```

---

## License

MIT — free to use, fork, and adapt.
