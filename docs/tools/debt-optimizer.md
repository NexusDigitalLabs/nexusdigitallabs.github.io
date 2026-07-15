# Debt Settlement & Savings Planner

**Compare Short, Medium, and Long plans to clear debt while building savings — free, client-side, with PDF export.**

### [→ Open Live Tool](https://nexusdigitallabs.dev/tools/debt-optimizer/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)

---

## Overview

A 100% client-side financial planner that turns your free cash flow into **three settlement strategies** — Short, Medium, and Long. You do **not** enter monthly payments for credit cards or loans. The engine splits surplus between debt payoff (snowball) and savings, then shows a month-by-month runway and a downloadable PDF.

---

## Route

```
/tools/debt-optimizer/
```

---

## Source

```
src/app/tools/debt-optimizer/page.tsx           ← Server component (metadata, JSON-LD, SEO)
src/components/tools/DebtOptimizerClient.tsx    ← Interactive client component
src/lib/debt-engine.ts                          ← Multi-plan calculation engine
```

---

## Core Calculation Engine

All planning math runs client-side in pure TypeScript (`src/lib/debt-engine.ts`). Default is local-only; optional signed-in cloud draft is documented in `docs/auth.md`.

### Inputs

| Input | Description |
|---|---|
| Monthly Net Income | After-tax take-home pay |
| Monthly Expenses | Addable line items (rent, groceries, utilities, etc.) |
| Loans / Credit Cards | Name, total amount / credit limit, outstanding balance — **no monthly payment field** |
| Currency | Selectable from 10 currencies |

### Free Cash Flow

```
Free Cash Flow = Income − Σ Monthly Expenses
```

This surplus is allocated between **debt repayment** and **savings** according to the selected plan.

### Plan Splits

| Plan | To debts | To savings | Intent |
|---|---|---|---|
| **Short** | 90% | 10% | Aggressive payoff, small savings buffer |
| **Medium** | 70% | 30% | Balanced payoff + meaningful savings |
| **Long** | 50% | 50% | Steady payoff, stronger savings cushion |

### Algorithm Flow

1. **Validate** — fail if FCF ≤ 0 or no debts with outstanding balance.
2. For **each plan**:
   - Compute monthly debt budget and monthly savings from FCF × split %.
   - Sort active debts by outstanding ascending (**snowball**).
   - Each month: apply the full debt budget to lowest balances first; add savings to a running total.
   - Record runway rows (outstanding, payment, cumulative saved).
   - Stop when all debts clear (or at a 600-month cap).
3. Return all three plans so the UI can compare them side by side.

### Key Outputs (per plan)

| Output | Description |
|---|---|
| Monthly debt budget | Amount applied to debts each month |
| Monthly savings | Amount set aside each month |
| Debt-free month | First month when all balances reach zero |
| Total saved by debt-free | Cumulative savings at payoff |
| Runway | Month-by-month detail for the selected plan |

### Edge Case Defences

| Condition | Behaviour |
|---|---|
| Income ≤ Total Expenses | Empty plans + red warning |
| No debts / all outstanding zero | Empty plans + red warning |
| Debt budget too small | Individual plan marked non-viable |
| Floating-point residuals | Flushed at &lt; 1 unit per month |
| Runaway loop | Hard cap at 600 months |

---

## Amount Input Behaviour

All currency inputs format with **comma separators while typing**, preserving cursor position via `useLayoutEffect` for a stable, native-feel experience.

---

## PDF Export

The Download PDF button (enabled after a viable calculation) exports the **selected plan**, including:

- Summary metrics (income, FCF, debt-free date, savings)
- Comparison table of all three plan options
- Expenses and debt tables (no monthly payment column)
- Month-by-month runway with debt payment and cumulative savings

Captured with `html2pdf.js` at A4 portrait.

---

## Design System

Matches the dark site shell:

- Page / card surfaces on dark slate with low-contrast borders
- Accent blue for selected plan cards
- Emerald for positive metrics (debt-free date, savings)
- Warning state: red banner on invalid inputs
- PDF content stays white for print legibility

---

## Layout

```
[Global Header]
[Page header — title + privacy badge]
┌─────────────────────────────┬──────────────────────────────────────┐
│  LEFT PANEL (sticky)        │  RIGHT PANEL                         │
│  Currency                   │  FCF / Total debt / Debt-free strip  │
│  Income                     │  Short | Medium | Long plan cards    │
│  Expenses (+)               │  Selected plan metrics               │
│  FCF preview                │  Payoff order                        │
│  Debts: name, limit,        │  Month-by-month runway               │
│         outstanding         │  (debt + cumulative savings)         │
│  Calculate / Download PDF   │                                      │
└─────────────────────────────┴──────────────────────────────────────┘
[SEO block + FAQ]
[Global Footer]
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + inline dark tokens |
| Engine | `src/lib/debt-engine.ts` |
| PDF | `html2pdf.js` via CDN |
| Hosting | Vercel |

---

## Privacy

- Zero cookies / `localStorage` for financial data.
- All figures exist only in React state for the session.
- Default planning stays in the browser; optional cloud draft when signed in.
- Sitewide privacy (auth cookies, analytics) is covered by the Privacy Policy.

---

## Keywords

debt payoff calculator, short medium long debt plan, debt savings planner, snowball method, credit card payoff without minimum payment, free cash flow calculator, debt-free date
