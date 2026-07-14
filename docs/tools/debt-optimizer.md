# Debt Settlement & Savings Planner

**A simple, free debt payoff planner with month-by-month repayment runway and PDF export.**

### [→ Open Live Tool](https://nexusdigitallabs.dev/tools/debt-optimizer/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)

---

## Overview

A 100% client-side financial planner that generates a month-by-month debt payoff runway using the **Snowball** method (lowest outstanding balance first). Enter your income, monthly expenses, and debts — get your debt-free date and a downloadable PDF plan.

---

## Route

```
/tools/debt-optimizer/
```

---

## Source

```
src/app/tools/debt-optimizer/page.tsx           ← Server component (metadata, JSON-LD)
src/components/tools/DebtOptimizerClient.tsx    ← Interactive client component
```

---

## Core Calculation Engine

All logic runs client-side in pure TypeScript. No data ever leaves the browser.

### Inputs

| Input | Description |
|---|---|
| Monthly Net Income | After-tax take-home pay |
| Monthly Expenses | Addable line items (rent, groceries, utilities, etc.) |
| Loans / Credit Cards | Name, total loan amount / credit limit, outstanding balance, minimum monthly payment |
| Currency | Selectable from 10 currencies |

### Key Calculations

| Calculation | Formula |
|---|---|
| Free Cash Flow | `Income − Σ Monthly Expenses` |
| Monthly Overage | `Free Cash Flow − Σ Minimum Payments` |
| Debt Payoff Order | Snowball — lowest outstanding balance first |

### Algorithm Flow

1. **Validate** — return an error if FCF ≤ 0, no debts entered, or total minimums exceed FCF.
2. **Sort debts** by outstanding balance ascending (snowball).
3. **Each month:**
   - Pay minimums on all debts.
   - Apply remaining budget (overage) to the priority debt (lowest outstanding).
   - Flush sub-unit floating-point residuals (< 1 unit → 0).
   - Remove cleared debts.
4. **Record** each month's total outstanding, debt count, and payment applied.
5. **Cap** at 600 months (50-year ceiling) to prevent infinite loops.

### Edge Case Defences

| Condition | Behaviour |
|---|---|
| Income ≤ Total Expenses | Empty runway + red warning banner |
| Σ Min Payments > Free Cash Flow | Empty runway + red warning banner |
| No debts entered | Empty runway + red warning banner |
| Floating-point residuals | Flushed at < 1 unit per month |
| Runaway loop | Hard cap at 600 months |

---

## Amount Input Behaviour

All currency inputs format with **comma separators while typing**, preserving cursor position via `useLayoutEffect` for a stable, native-feel experience.

---

## PDF Export

The "Download PDF" button (enabled after calculation) renders a hidden `div` containing the full plan — summary metrics, expense table, debt table, and runway — then captures it with `html2pdf.js` at A4 portrait format.

---

## Design System

Follows the project's minimalist design language:

- **Background:** `#F9FAFB` (page), `#FFFFFF` (cards/table)
- **Typography:** `Inter`, high-contrast `slate-900`
- **Form inputs:** `border-radius: 0`, `border: 1px solid #e2e8f0`, focus → `border: 1px solid #000`
- **Positive metrics:** Emerald `#4ade80` / `#16a34a` (debt-free date, paid-off labels)
- **Warning state:** Red `#fef2f2` banner
- **No pills, no heavy gradients**

---

## Layout

```
[Global Header — Header.tsx]
[Page header — title, description, privacy badge]
┌─────────────────────────────┬──────────────────────────────────────┐
│  LEFT PANEL (sticky 380px)  │  RIGHT PANEL (flex-1)                │
│  ─────────────────────────  │  ─────────────────────────────────── │
│  Currency selector          │  ┌─────┬──────────┬──────────┬─────┐ │
│  Monthly Net Income         │  │ FCF │ Overage  │Debt-Free │Total│ │
│  Monthly Expenses (+ Add)   │  └─────┴──────────┴──────────┴─────┘ │
│  FCF preview strip          │  Payoff order (lowest balance first) │
│  Loans & Credit Cards (+Add)│  Month-by-Month Runway Grid          │
│  Calculate Plan button      │  (scrollable, max-h: 480px)          │
│  Download PDF button        │                                      │
└─────────────────────────────┴──────────────────────────────────────┘
[Global Footer — Footer.tsx]
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Rendering | Server Component wrapper + `'use client'` interactive component |
| PDF export | `html2pdf.js` via CDN (`next/script`, `strategy="lazyOnload"`) |
| Analytics | Umami (cookie-free) + Supabase page-view counter |
| Hosting | Vercel |

---

## Privacy

- Zero cookies, zero `localStorage` writes for financial data.
- All debt, income, and expense figures exist only in React state during the browser session.
- Username gate in `/games/` is the only `localStorage` usage in the project (unrelated to this tool).
- Compliant with GDPR/CCPA without requiring a cookie banner.

---

## Keywords

debt payoff calculator, snowball method, debt settlement planner, loan payoff, credit card payoff, monthly budget, financial planner, free cash flow calculator, debt-free date
