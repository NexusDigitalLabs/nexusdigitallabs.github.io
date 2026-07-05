# Prompt Architect & Token Counter

**A lightweight, live-metric prompt cleaning utility for modern LLM and AI-agent workspaces.**

### **[→ Open Live Tool](https://nexusdigitallabs.github.io/prompt-architect/)**

---

## Overview

Prompt Architect is a free, fully client-side web utility for engineers and developers who work daily with large language models. It gives you instant token counts, live cost estimates, and one-click text optimizations — entirely in your browser. No data leaves your device. No backend. No tracking.

---

## Features

- **Live Token Counter** — estimates GPT-style BPE tokens in real time as you type, with ~95–98% accuracy against tiktoken for standard English text
- **Remove Extra Whitespace** — collapses consecutive spaces, trims each line, and reduces excessive blank lines while preserving intentional paragraph structure
- **Flatten to Single Line** — converts multi-line prompts into a compact single-line string safe for JSON payloads, environment variables, and API request bodies
- **Trim & Normalize** — strips leading whitespace per line and converts tabs to spaces without altering newline structure
- **API Cost Estimator** — live input cost projections across GPT-4o, GPT-4o mini, Claude 3.5 Sonnet, and Gemini 1.5 Pro
- **Token Savings Badge** — shows the exact token delta between your original and optimized prompt
- **Chain Optimizations** — use "Use Output as Input" to stack multiple transformations in sequence
- **Copy to Clipboard** — one-click copy with visual confirmation and legacy browser fallback

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

- Zero `fetch()` calls with user data
- Zero cookies or `localStorage` writes
- Zero third-party ad or tracking pixels
- Anonymised page-view metrics via [Umami](https://umami.is) (cookie-free, no personal data)
- No GDPR or CCPA consent banner required

---

## Deployment

This project is a single `index.html` file. Deploy anywhere that serves static files:

```bash
# GitHub Pages — push to main, enable Pages in repo Settings
git push origin main
```

For local development:

```bash
python3 -m http.server 3000
# Open http://localhost:3000
```

---

## License

MIT — free to use, fork, and adapt.
