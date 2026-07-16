# Prompt Architect

**Advanced system prompt flattener and token optimizer for LLM workspaces.**

### [→ Open Live Tool](https://nexusdigitallabs.dev/tools/prompt-architect/)

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-React%20%2F%20Next.js-000000?style=flat-square&logo=next.js)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)

---

## Overview

**Prompt Architect** is a free, fully client-side web utility for AI engineers, developers, and automation builders who work daily with large language models (LLMs). It delivers instant GPT token counts, live API cost estimates, and one-click prompt optimizations — entirely in the browser. No backend, no data transmission, no consent banner required.

Built for use with **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Google Gemini 1.5 Pro**, and any other transformer-based LLM API.

Global support CTA: the root layout includes the lightweight `KofiTipLink` floating button on this and all future tool pages. Do not add Ko-fi widget scripts; see [`docs/support.md`](../support.md).

---

## Route

```
/tools/prompt-architect/
```

---

## Source

```
src/app/tools/prompt-architect/page.tsx       ← Server component (metadata, JSON-LD)
src/components/tools/PromptArchitectClient.tsx ← Interactive client component
```

---

## Features

| Feature | Description |
|---|---|
| Live Token Counter | Estimates GPT-style BPE tokens in real time as you type (~95–98% accuracy vs. tiktoken) |
| Whitespace Stripper | Collapses consecutive spaces, trims each line, reduces excessive blank lines |
| Single-Line Flattener | Converts multi-line prompts into a compact single-line string safe for JSON payloads |
| Trim & Normalize | Strips leading whitespace per line and converts tabs to spaces |
| API Cost Estimator | Live input cost projections across GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, and Gemini 1.5 Pro |
| Token Savings Badge | Shows exact token delta between original and optimized prompt |
| Chain Optimizations | "Use Output as Input" to stack multiple transformations in sequence |
| Copy to Clipboard | One-click copy with visual confirmation |
| Keyboard Accessible | Fully navigable via keyboard with visible focus rings |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Rendering | Server Component wrapper + `'use client'` interactive component |
| Analytics | Umami (cookie-free) + Supabase page-view counter |
| Hosting | Vercel |

---

## Privacy

This tool is **privacy-safe by architecture**:

- Zero `fetch()` calls transmitting user input
- Zero cookies or `localStorage` writes
- All token estimation and transformation runs entirely in the browser
- Anonymised page-view metrics only via Umami and Supabase counter

---

## Why Prompt Architect?

Every token sent to an LLM API costs money. Redundant whitespace, stray newlines, and verbose phrasing silently inflate token counts on every API call. For high-volume pipelines — RAG systems, chatbots, document summarization — a **10–20% token reduction** compounds into significant monthly savings.

---

## Keywords

`prompt engineering` · `token counter` · `GPT-4 token optimizer` · `LLM prompt builder` · `AI prompt optimizer` · `tiktoken alternative` · `reduce token usage` · `prompt whitespace cleaner` · `API cost estimator` · `OpenAI cost calculator` · `Claude token counter` · `Gemini token estimator`
