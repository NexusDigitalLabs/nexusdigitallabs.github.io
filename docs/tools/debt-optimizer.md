# Debt Settlement & Savings Optimizer

## Overview

A 100% client-side financial calculator that generates a month-by-month debt payoff runway using the **Avalanche** (highest APR first) or **Snowball** (lowest balance first) method. Once all debts are cleared, the tool automatically pivots 100% of the user's free cash flow into a compounding HYSA savings simulation.

## Live Route

```
https://nexusdigitallabs.dev/tools/debt-optimizer/
```

## Core Calculation Engine

All logic runs in the browser via pure JavaScript functions. No data ever leaves the client.

### Formulas

| Calculation | Formula |
|---|---|
| Free Cash Flow | `Income − Living Expenses` |
| Monthly Overage | `Free Cash Flow − Σ Minimum Payments` |
| Monthly Interest | `(Balance × APR%) ÷ 12` |
| HYSA Compounding | `(Savings + Free Cash Flow) × (1 + (rate/12))` |

### Algorithm Flow

1. **Validate** inputs — return an error state if FCF ≤ 0 or Overage < 0.
2. **Deep-clone** input debts (original state is never mutated).
3. **Each month — Debt Phase:**
   - Accrue monthly interest on every active debt (`BEFORE` payments).
   - Sort debts by strategy (avalanche → highest APR first; snowball → lowest balance first).
   - Pay minimum payments across **all** debts.
   - Apply all remaining budget (overage) to the priority debt (roll-down if paid off mid-month).
   - Flush sub-cent floating-point residuals (`< $0.01` → $0).
   - Remove cleared debts.
4. **Pivot Month:** When the last debt hits zero, flag `pivotMonth = true` and record `debtFreeMonth`.
5. **Each month — Savings Phase:** Compound `(savings + FCF) × (1 + monthlyRate)` for up to 36 months.

### Edge Case Defences

| Condition | Behaviour |
|---|---|
| Income ≤ Living Expenses | Returns empty runway + red warning banner |
| Σ Min Payments > Free Cash Flow | Returns empty runway + red warning banner |
| No debts entered | Returns empty runway + red warning banner |
| Floating-point residuals | Flushed at `< $0.01` per month |
| Runaway loop | Hard cap at `600` months (50-year ceiling) |

## Design System

Follows the project's minimalist design language with specific overrides for this tool:

- **Background:** `#F9FAFB` (page), `#FFFFFF` (cards/table)
- **Typography:** `Inter`, high-contrast `slate-900`
- **Form inputs:** `border-radius: 0`, `border: 1px solid #e2e8f0`, focus → `border: 1px solid #000`
- **Positive metrics:** Emerald `#4ade80` / `#16a34a` (savings values, pivot badge, HYSA compounding)
- **Warning state:** Red `#fef2f2` banner (not viable edge cases)
- **No pills, no heavy gradients**

## Layout

```
[Shared nav — nav.js]
[Page header — title, description, privacy badge]
  ┌─────────────────────────────┬──────────────────────────────────────┐
  │  LEFT PANEL (sticky 380px)  │  RIGHT PANEL (flex-1)                │
  │  ─────────────────────────  │  ─────────────────────────────────── │
  │  Income & Expenses          │  ┌─────┬─────┬──────────┬─────────┐  │
  │  HYSA Rate                  │  │ FCF │ Ovg │ Debt-Free│ Int Paid│  │
  │  Strategy Toggle            │  └─────┴─────┴──────────┴─────────┘  │
  │  Debt Cards (×N)            │  Debt Payoff Schedule strip          │
  │  Calculate Runway button    │  Month-by-Month Runway Grid          │
  │  SEO explainer              │  (scrollable, max-h: 520px)          │
  └─────────────────────────────┴──────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5, semantic elements |
| Styling | Tailwind CSS via CDN + inline `<style>` block |
| Logic | Vanilla JS (ES6+), JSDoc type annotations |
| Fonts | Inter via Google Fonts |
| Analytics | Umami (cookie-free) |
| PDF / Build | None — single static HTML file |

## Privacy

- Zero cookies, zero localStorage, zero network calls for data.
- All debt, income, and savings figures exist only in memory during the browser session.
- Compliant with GDPR/CCPA without requiring a cookie banner.

## Keywords

debt payoff calculator, avalanche method, snowball method, debt settlement, HYSA calculator, savings optimizer, free cash flow, debt-free date, financial runway, interest calculator, compound savings
