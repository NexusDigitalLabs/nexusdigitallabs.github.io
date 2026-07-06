# NexusDigitalLabs

**Engineering minimalist web utilities, developer tools, and high-performance software.**

### [→ Visit nexusdigitallabs.dev](https://nexusdigitallabs.dev/)

![GitHub Pages](https://img.shields.io/badge/Deployed-GitHub%20Pages-brightgreen?style=flat-square&logo=github)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Built With](https://img.shields.io/badge/Built%20With-Vanilla%20JS-f7df1e?style=flat-square&logo=javascript)
![Privacy](https://img.shields.io/badge/Privacy-No%20Cookies%20%7C%20No%20Tracking-blueviolet?style=flat-square)
![Analytics](https://img.shields.io/badge/Analytics-Umami%20(Cookie--Free)-orange?style=flat-square)

---

## About

NexusDigitalLabs is a software studio that builds zero-bloat, highly focused digital products engineered for speed, privacy, and utility. This repository is the monorepo powering the entire `nexusdigitallabs.dev` domain — the homepage, all production utility tools, and all engineering articles — served as a fully static site via GitHub Pages.

Every page is a self-contained HTML file. No framework, no build pipeline, no server.

---

## Repository Structure

```
nexusdigitallabs.github.io/
│
├── index.html                          # Homepage — studio landing page
│
├── tools/                              # Production utility tools
│   └── prompt-architect/
│       └── index.html                  # /tools/prompt-architect/
│
├── articles/                           # Engineering logs & long-form articles
│   └── optimizing-ai-prompt-tokens-for-llms/
│       └── index.html                  # /articles/optimizing-ai-prompt-tokens-for-llms/
│
├── about/
│   └── index.html                      # /about/
├── contact/
│   └── index.html                      # /contact/
├── privacy-policy/
│   └── index.html                      # /privacy-policy/
│
├── docs/                               # Internal documentation
│   └── tools/
│       └── prompt-architect.md         # Tool spec & feature reference
│
├── CNAME                               # Custom domain: nexusdigitallabs.dev
├── sitemap.xml                         # XML sitemap for search engines
├── robots.txt                          # Crawler directives
├── favicon.png                         # Site favicon
├── og-image.png                        # Default Open Graph share image
├── .nojekyll                           # Disables Jekyll processing on GitHub Pages
└── googlef445b64816b591eb.html         # Google Search Console verification
```

---

## Live Routes

| Route | Description |
|---|---|
| `/` | Homepage — studio introduction and content index |
| `/tools/prompt-architect/` | Prompt Architect — LLM prompt flattener & token optimizer |
| `/articles/optimizing-ai-prompt-tokens-for-llms/` | Engineering article — token optimization deep-dive |
| `/about/` | About NexusDigitalLabs |
| `/contact/` | Contact page |
| `/privacy-policy/` | Privacy policy |

---

## Tools

### Prompt Architect
> Advanced system prompt flattener optimized for Cursor, Gemini, and LLM workspaces.

- **Route:** `/tools/prompt-architect/`
- **Source:** `tools/prompt-architect/index.html`
- **Docs:** [`docs/tools/prompt-architect.md`](docs/tools/prompt-architect.md)
- **Status:** Coming Soon

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

This entire site is **privacy-safe by architecture**:

- Zero `fetch()` calls transmitting user data
- Zero cookies or `localStorage` writes
- Zero third-party ad or tracking pixels
- Anonymised page-view metrics via [Umami](https://umami.is) — cookie-free, no personal data collected
- No GDPR or CCPA consent banner required

---

## Local Development

```bash
# Serve from repo root — all pretty URLs resolve via directory index.html files
python3 -m http.server 3000
# Open http://localhost:3000
```

---

## Deployment

This repository is deployed automatically via GitHub Pages on every push to `main`. The `CNAME` file configures the custom domain `nexusdigitallabs.dev`. The `.nojekyll` file disables Jekyll processing so all file paths are served as-is.

```bash
git push origin main
```

---

## License

MIT — free to use, fork, and adapt.
