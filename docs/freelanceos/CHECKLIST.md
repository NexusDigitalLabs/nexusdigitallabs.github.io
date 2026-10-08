# FreelanceOS — Build Checklist

**Goal:** a freelancer goes from *"I got a client"* to *"I did the work and got paid"* — then asks an AI assistant questions about their business.

**Second goal:** the AI layer is built to the standard on the AI Engineer roadmap (Python · APIs · Agents · RAG · Evals · Safety · CI/CD · Deploy), so the project doubles as a portfolio case study.

Legend: `[AI: …]` marks items that map to the AI Engineer roadmap. **★** marks the MVP cut — ship those before anything else.

---

## Decisions to make first

- [x] Product location: `/app` in this Next.js app, with its own layout (subdomain later if needed)
- [x] Launch model: **free beta first**; billing only after traction (see Phase 12)
- [x] Future billing provider: **Paddle** (merchant of record, supports Sri Lankan sellers, handles global VAT/GST, USD payouts by wire). Stripe is not available in Sri Lanka; RevenueCat is app-store only.
- [x] Money model: amounts stored as integer minor units + ISO currency code; dashboard totals per currency (no FX in v1).
- [x] AI service location: **AWS Lambda** (Python, FastAPI + Lambda Web Adapter, function URL, response streaming), within the always-free tier
  - [ ] AWS Budget alert ($1 / $5) set before first deploy
- [ ] Anthropic API account created, **monthly spend limit set**, separate dev/prod keys.
- [ ] Working name stays "FreelanceOS" until the 20-user milestone.

---

## Phase 0 — Foundation `[AI: Core — Git, CI/CD]`

Already in repo: Next.js 16, TypeScript, Tailwind v4, Supabase Auth + SSR middleware, RLS migrations, Resend, Vitest, Playwright.

- [x] ★ `/app` route group with authenticated shell layout (sidebar: Dashboard, Clients, Projects, Time, Expenses, Invoices, AI, Settings)
- [x] ★ Add shadcn/ui (Tailwind v4 compatible; tokens scoped to `.fos-app` so the public site is unaffected)
- [x] ★ Migration: `organizations`, `org_members (org_id, user_id, role)` — `012_freelanceos_organizations.sql`
  - [x] **Run it in Supabase → SQL Editor** (manual step)
- [x] ★ Auto-create a personal organization on first visit to `/app` (`ensure_personal_org()` RPC)
- [x] ★ RLS helper `is_org_member(org_id)` used by every business table (+ `has_org_role`)
- [x] ★ Zod schemas shared by forms and server actions
- [x] ★ Server-side authorization helper (`requireOrg()`), never trust client-sent `org_id`
- [x] Error boundary + loading skeleton for `/app`
- [ ] Structured server logging
- [x] GitHub Actions: lint (FreelanceOS paths) + Vitest on every PR `[AI: CI/CD]`
  - [ ] Widen to full-repo lint + `tsc` once pre-existing errors are fixed
- [x] Env var docs (`.env.local.example`)

## Phase 1 — Core business

- [x] ★ **Clients:** table + RLS, list/search, create/edit/archive, detail page (projects; revenue/outstanding placeholders until invoicing)
- [x] **Run `013_freelanceos_clients_projects.sql` in Supabase** (manual step)
- [x] ★ **Projects:** table + RLS, billing type (hourly / fixed / milestone / retainer), rate, budget, status, dates, notes
- [x] ★ Project detail page (hours / expenses / invoices placeholders until those modules ship)
- [x] **Settings:** business profile (name, email, address, tax ID, default currency, default tax %, invoice prefix, payment details)
- [x] ★ **Dashboard v1:** open projects, active clients, recent activity (trigger-written `activity_log`), data-driven getting-started
- [x] `plan` column on organizations (`beta` for everyone now) + one `getEntitlements(org)` helper; limits read from it, so paid plans are a config change later
- [x] Unit tests for limits, schemas, money, search sanitizing; RLS tested on local Postgres

## Phase 2 — Money

- [x] ★ **Invoices:** `invoices`, `invoice_items`, `payments` tables + RLS — `014_freelanceos_invoices.sql`
  - [x] **Run `014_freelanceos_invoices.sql` in Supabase** (manual step)
  - [ ] **Run `015_freelanceos_invoice_number_width.sql` in Supabase** (fixes numbers past 9999)
- [x] ★ Sequential numbering per organization (race-safe, DB-side; assigned on send, so deleted drafts leave no gaps)
- [x] ★ Invoice builder: line items, tax %, discount, currency, due date, notes (live totals; DB recomputes on save)
- [x] ★ Prefill line items from project rate/price (tracked time comes with Phase 3)
- [x] ★ PDF generation — shared `InvoiceSheet` component now used by both the public tool and FreelanceOS
- [ ] Business logo upload (Supabase Storage, org-scoped policies) — printed on invoice PDFs
- [x] ★ Statuses: draft → sent → paid / overdue (overdue derived from due date); sent invoices locked + snapshotted; void
- [x] ★ Record payment manually (full/partial, never above balance) — *no payment collection in v1*
- [ ] Email invoice via Resend (PDF attached or secure link)
- [ ] **Expenses:** table + RLS, categories, project link, monthly view
- [x] ★ **Dashboard v2:** revenue this month, outstanding, due soon (per currency) — expenses card comes with Expenses
- [x] Unit tests for totals, tax, discount, rounding; numbering + locking tested on local Postgres; TS/SQL math parity checked on 2,000 random invoices
- [ ] Funnel: link from the public invoice generator → "save & track this in FreelanceOS"

> **Milestone: usable product.** Put it in front of 3–5 freelancers before continuing.

## Phase 3 — Time

- [ ] `time_entries` table + RLS (billable flag, description, duration)
- [ ] Start/stop timer (one active timer per user, survives refresh)
- [ ] Manual entry + edit
- [ ] Daily/weekly view per project
- [ ] Project hours and labour value feed the dashboard and invoices

## Phase 4 — AI service foundation `[AI: Python, APIs, LLMs]`

- [ ] Python service (FastAPI) in `ai-service/` with its own README, tests and lockfile
- [ ] Auth between Next.js and AI service (signed request carrying `org_id` and `user_id` from the server, never from the browser)
- [ ] Claude client with model routing: small model for classify/extract, larger model for reasoning/writing
- [ ] Prompt caching on system prompt + tool definitions
- [ ] Streaming responses to the chat UI
- [ ] `ai_conversations`, `ai_messages`, `ai_usage` tables (tokens, cost, latency, model, per request)
- [ ] Monthly AI action caps per org enforced before calling the model — **required even in free beta** (you pay for every call); beta default ~100/month
- [ ] Tracing: Langfuse or LangSmith `[AI: Evals / observability]`
- [ ] AI disclaimer in the UI ("verify AI-generated information")

## Phase 5 — Business Q&A agent `[AI: Agents — LangGraph]`

- [ ] Read-only, org-scoped tools — tenancy enforced *inside each tool*:
  - [ ] `get_revenue(period, client?)`
  - [ ] `list_invoices(status?, overdue?)`
  - [ ] `project_profitability(project_id)`
  - [ ] `top_clients(period)`
  - [ ] `expenses_summary(period, category?)`
- [ ] LangGraph agent: question → tool calls → grounded answer with figures from tool output only
- [ ] Chat UI in `/app/assistant`
- [ ] "Ask AI" entry points on dashboard, client and project pages

## Phase 6 — Evals `[AI: Evals]` — the portfolio differentiator

- [ ] Seeded eval organization with known data (fixed revenue, overdue invoices, etc.)
- [ ] Golden Q&A set (30+ questions) with exact expected numbers
- [ ] Tool-selection accuracy check (did it call the right tool with the right args?)
- [ ] Refusal/grounding checks (no invented numbers; "I don't have that data")
- [ ] Cross-tenant leak test (agent in org A can never see org B data)
- [ ] Eval runner in CI; recorded responses for PRs, live run nightly via Batch API
- [ ] Eval report: accuracy, cost/query, p50/p95 latency — tracked over time

## Phase 7 — Workflow agent with human approval `[AI: Agents]`

- [ ] **Invoice-chasing agent:** find overdue → draft reminder (tone by days overdue) → **user approves/edits** → send via Resend → log activity
- [ ] LangGraph interrupt/resume for the approval step
- [ ] Agent never sends without explicit approval
- [ ] Evals: draft quality (LLM judge rubric), correct invoice/amount/due date in every draft

## Phase 8 — Pipelines + RAG `[AI: RAG, Pipelines]`

- [ ] **Receipt pipeline:** upload (Supabase Storage, type/size validated) → vision extraction → structured expense → category → user confirms
- [ ] Receipt extraction eval set (~30 receipts, field-level accuracy)
- [ ] **Document RAG:** upload contracts/briefs → chunk → embed → pgvector (org-scoped, RLS)
- [ ] Ask questions about documents with citations ("payment terms with ABC?")
- [ ] Retrieval evals (hit rate / recall on a labelled question set)
- [ ] **Prompt-injection defence:** document/email text treated as data, never instructions; test cases in evals

## Phase 9 — Proposals

- [ ] `proposals`, `proposal_items` tables + RLS
- [ ] Templates + PDF (shared renderer with invoices)
- [ ] AI proposal drafting grounded in past proposals (RAG) and client/project context
- [ ] Send to client, accept/reject link, convert accepted proposal → project + invoice

## Phase 10 — Safe & fast `[AI: Keep It Safe & Fast]`

- [ ] Rate limiting on AI and auth-sensitive endpoints
- [ ] PII minimisation in prompts (only fields the tool needs)
- [ ] Audit log for important actions (invoice sent, payment recorded, deletion, AI-sent email)
- [ ] Data export (CSV/JSON) and account/org deletion
- [ ] Cost dashboard: spend per org, per model, per feature
- [ ] Latency budget: first token < 2s for chat
- [ ] Security review of RLS policies and server actions

## Phase 11 — Polish & launch `[AI: Deploy It]`

- [ ] Onboarding (business profile → first client → first invoice)
- [ ] Empty, loading and error states everywhere
- [ ] Mobile-responsive pass + accessibility pass
- [ ] Pricing page, Terms, Privacy (AI processing disclosed)
- [ ] "Free during beta" messaging + feedback channel (in-app link)
- [ ] Analytics events: signup, onboarding_completed, client_created, project_created, invoice_created, invoice_sent, invoice_paid, expense_created, ai_used, proposal_created, subscription_started, subscription_cancelled
- [ ] Production deploy of web app + AI service, env separation, monitoring/alerts
- [ ] Recruit first **20 real freelancers**; track funnel drop-off

## Phase 12 — Monetization (only after traction)

Trigger: ~20 active freelancers using it weekly and asking for more.

- [ ] Interview beta users: what would they pay for? Validate Free / $9 / $19 split
- [ ] Paddle approval prerequisites live: pricing page, Terms, Privacy, Refund policy
- [ ] Paddle checkout + webhooks → `organizations.plan`
- [ ] Turn on free-tier limits (3 clients, 2 active projects, 5 invoices/month) via `getEntitlements`
- [ ] "Founding member" offer for beta users (discount or lifetime perk), announced in advance
- [ ] Move hosting to a plan that allows commercial use (Vercel Hobby does not; Vercel Pro or another host)
- [ ] Check foreign-income tax treatment with a Sri Lankan accountant

## Portfolio deliverables

- [ ] Architecture diagram (Next.js ↔ AI service ↔ Supabase ↔ Claude)
- [ ] Case study article on the NDL site (`/articles`): problem, architecture, tradeoffs, eval results
- [ ] Public eval report (accuracy, cost, latency over time)
- [ ] 2-minute demo video (Q&A agent + approval-gated reminder agent)
- [ ] Optional: open-source the eval harness or receipt pipeline

---

## Backlog — deliberately not in v1

Accounting / bank integrations · QuickBooks / Xero · payroll · team management · complex tax · native mobile app · marketplace · CRM automation · Slack / Gmail integrations · online payment collection (Stripe Connect) · client portal · recurring invoices · FX conversion
