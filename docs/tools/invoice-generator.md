# Freelancer Invoice Generator

**Professional A4 PDF invoice generator — dark split-pane UI with live preview and client-side PDF export.**

### [→ Open Live Tool](https://nexusdigitallabs.dev/tools/invoice-generator/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)

---

## Overview

A browser-based invoice generator for freelancers and small studios. Fill in your issuer details, client info, line items, tax, discount, and bank wire details — see a live A4 paper preview update in real time, then download a vector-quality PDF. Default is local-only; signed-in users can optionally enable a cloud draft.

---

## Route

```
/tools/invoice-generator/
```

---

## Source

```
src/app/tools/invoice-generator/page.tsx           ← Server component (metadata, JSON-LD)
src/components/tools/InvoiceGeneratorClient.tsx    ← Interactive client component
```

---

## Features

| Feature | Description |
|---|---|
| Live A4 preview | Invoice sheet renders in real time as you type, scaled to fit the preview pane |
| Currency selector | USD, EUR, GBP, AUD, CAD, LKR, SGD, AED |
| Dynamic line items | Add / remove rows with description, qty/hrs, and rate |
| Tax & discount | Configurable tax label + rate, and flat discount percentage |
| Bank wire details | Bank name, account name/number, SWIFT/BIC, IBAN |
| Payment notes | Free-text notes block (payment terms, thank-you message) |
| PDF download | Client-side A4 portrait PDF via `html2pdf.js` at 2× canvas scale |
| Auto invoice number | Pre-filled with `INV-YYYYMM-001` based on today's date |
| Auto due date | Pre-filled to 30 days from today |

---

## Layout

```
[Global Header — Header.tsx]
┌──────────────────────────────┬──────────────────────────────────────────┐
│  LEFT PANE (420px dark)      │  RIGHT PANE (flex-1 dark)                │
│  ─────────────────────────── │  ──────────────────────────────────────── │
│  Invoice Details             │  [ Download PDF ] [ A4 · Portrait ]       │
│  · Invoice number            │                                            │
│  · Currency                  │  ┌────────────────────────────────────┐   │
│  · Invoice date / Due date   │  │  Live A4 Invoice Preview           │   │
│  ─────────────────────────── │  │  (white paper, scaled to fit pane) │   │
│  From — Issuer               │  │  · Issuer logo + address           │   │
│  To — Client                 │  │  · INVOICE header + number         │   │
│  ─────────────────────────── │  │  · Bill To block                   │   │
│  Line Items (+ Add Row)      │  │  · Line items table                │   │
│  ─────────────────────────── │  │  · Subtotal / Discount / Tax       │   │
│  Tax & Discount              │  │  · Total Due                       │   │
│  ─────────────────────────── │  │  · Bank Transfer Details           │   │
│  Bank Details                │  │  · Notes                           │   │
│  ─────────────────────────── │  └────────────────────────────────────┘   │
│  Payment Notes               │                                            │
└──────────────────────────────┴──────────────────────────────────────────┘
```

---

## PDF Generation

- The invoice preview is rendered as **React JSX** (not `innerHTML`) for type safety.
- A `useRef` on the invoice sheet DOM element is passed to `html2pdf().from(el)`.
- Before PDF capture, the `transform: scale()` is temporarily reset to native 794px width for clean vector capture.
- After capture, scale is restored.
- PDF options: A4 portrait, 2× `html2canvas` scale, JPEG quality 0.98, 12mm horizontal margins.

---

## Totals Calculation

```
Subtotal  = Σ (qty × rate) for all line items
Discount  = Subtotal × (discountPct / 100)
Tax       = (Subtotal − Discount) × (taxPct / 100)
Total Due = Subtotal − Discount + Tax
```

---

## Design System

- **Left pane:** Dark background (`#07090f`), dark form inputs (`rgba(15,23,42,0.8)`), slate borders
- **Right pane:** Near-black background (`#0d1117`), white invoice paper with dramatic drop shadow
- **Invoice sheet:** Clean white (`#ffffff`), Inter typography, `#111827` high-contrast text
- **Download button:** `#2563eb` blue with glow shadow
- **No border-radius on invoice elements** — sharp geometric print aesthetic

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + inline `style` props for invoice sheet |
| Rendering | Server Component wrapper + `'use client'` interactive component |
| PDF export | `html2pdf.js` via CDN (`next/script`, `strategy="lazyOnload"`) |
| Scaling | `ResizeObserver` on preview pane, `transform: scale()` on invoice sheet |
| Analytics | Umami (cookie-free) + Supabase page-view counter |
| Hosting | Vercel |

---

## Privacy

- Zero cookies, zero `localStorage` writes.
- By default, invoice fields live in React state for the session. Optional signed-in cloud draft stores form JSON under the user account (see `docs/auth.md`).
- Sitewide privacy (auth cookies, analytics) is covered by the Privacy Policy.

---

## Keywords

invoice generator, freelancer invoice, PDF invoice maker, free invoice tool, client billing, bank wire invoice, tax invoice, A4 invoice, professional invoice template
