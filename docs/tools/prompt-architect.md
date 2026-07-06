# Prompt Architect

**Advanced system prompt flattener and token optimizer for LLM workspaces.**

### [→ Open Live Tool](https://nexusdigitallabs.dev/tools/prompt-architect/)

![Status](https://img.shields.io/badge/Status-Coming%20Soon-yellow?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JS-f7df1e?style=flat-square&logo=javascript)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)

---

## Overview

**Prompt Architect** is a free, fully client-side web utility for AI engineers, developers, and automation builders who work daily with large language models (LLMs). It delivers instant GPT token counts, live API cost estimates, and one-click prompt optimizations — entirely in the browser. No backend, no data transmission, no consent banner required.

Built for use with **OpenAI GPT-4o**, **Anthropic Claude 3.5**, **Google Gemini 1.5 Pro**, and any other transformer-based LLM API.

---

## Route

```
/tools/prompt-architect/
```

Source: `tools/prompt-architect/index.html`

---

## Planned Features

| Feature | Description |
|---|---|
| Live Token Counter | Estimates GPT-style BPE tokens in real time as you type (~95–98% accuracy vs. tiktoken) |
| Whitespace Stripper | Collapses consecutive spaces, trims each line, reduces excessive blank lines while preserving paragraph structure |
| Single-Line Flattener | Converts multi-line prompts into a compact single-line string safe for JSON payloads and API request bodies |
| Trim & Normalize | Strips leading whitespace per line and converts tabs to spaces without altering newline structure |
| API Cost Estimator | Live input cost projections across GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, and Gemini 1.5 Pro |
| Token Savings Badge | Shows the exact token delta between original and optimized prompt |
| Chain Optimizations | "Use Output as Input" to stack multiple transformations in sequence |
| Copy to Clipboard | One-click copy with visual confirmation and legacy browser fallback |
| Keyboard Accessible | Fully navigable via keyboard with visible focus rings and ARIA labels |

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Vanilla JS (ES6+) | Zero bundle overhead, instant load |
| Styling | Tailwind CSS via CDN | No build step required |
| Analytics | Umami (cookie-free) | GDPR/CCPA compliant, no consent banner |
| Hosting | GitHub Pages | Zero-cost static deployment |
| Data storage | None | 100% client-side, no localStorage, no cookies |

---

## Privacy

This tool is **privacy-safe by architecture**:

- Zero `fetch()` calls transmitting user data
- Zero cookies or `localStorage` writes
- Zero third-party ad or tracking pixels
- Anonymised page-view metrics via [Umami](https://umami.is) — cookie-free, no personal data collected
- No GDPR or CCPA consent banner required

---

## Why Prompt Architect?

Every token sent to an LLM API costs money. Redundant whitespace, stray newlines, and verbose phrasing silently inflate token counts on every API call. For high-volume pipelines — RAG systems, chatbots, document summarization workflows — a **10–20% token reduction** compounds into hundreds of dollars in monthly savings.

Prompt Architect gives you the measurement and transformation tools to engineer leaner, faster, and cheaper prompts before they ever reach your API endpoint.

---

## Local Development

```bash
# Serve from repo root
python3 -m http.server 3000
# Open http://localhost:3000/tools/prompt-architect/
```

---

## Keywords

`prompt engineering` · `token counter` · `ChatGPT token counter` · `GPT-4 token optimizer` · `LLM prompt builder` · `AI prompt optimizer` · `tiktoken alternative` · `reduce token usage` · `prompt whitespace cleaner` · `API cost estimator` · `OpenAI cost calculator` · `Claude token counter` · `Gemini token estimator` · `prompt flattening tool` · `free token counter`
