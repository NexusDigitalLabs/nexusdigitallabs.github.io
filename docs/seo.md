# SEO & canonical URLs

Canonical public origin for NexusDigitalLabs:

**`https://nexusdigitallabs.dev`** (HTTPS apex, trailing slashes on page paths)

## Policy

| Rule | Detail |
|------|--------|
| Host | Apex only — never `www` in canonicals, sitemap, or `metadataBase` |
| Paths | Always trailing slash (`/about/`, not `/about`) |
| Origin constant | `SITE_URL` in `src/lib/seo.ts` — no trailing slash on the origin itself |
| Hosting | Vercel primary domain = apex; `www` must **308** → apex |
| Framework | `trailingSlash: true` in `next.config.ts` |

Changing host or slash policy requires updating **all** of: Vercel Domains, `SITE_URL`, `trailingSlash`, unit tests, and this doc.

## Source of truth

| Piece | Location |
|-------|----------|
| `SITE_URL`, path helpers, `pageMetadata` | `src/lib/seo.ts` |
| Sitemap builder | `src/lib/sitemap.ts` → `src/app/sitemap.ts` (`/sitemap.xml`) |
| `robots.txt` sitemap line | `public/robots.txt` |
| Root `metadataBase` | `src/app/layout.tsx` (uses `SITE_URL`) |
| Guards | `src/lib/__tests__/seo.test.ts`, `src/lib/__tests__/sitemap.test.ts` |

Tools / games / articles in the sitemap come from `src/data/catalog.ts` and `src/data/articles.ts`. Add catalog entries when shipping new public pages so the sitemap stays in sync.

## Why GSC “Page with redirect” appeared

Google Search Console property was apex, but Vercel had been redirecting apex → `www`, and Next was redirecting trailing-slash URLs → non-slash. Sitemap/canonicals pointed at apex + slash URLs, so crawls hit redirects and those URLs were marked **Page with redirect** (not indexed under that exact URL).

## Verification curls (production)

After deploy + Vercel domain settings:

```bash
# Apex serves content (no host redirect)
curl -sI https://nexusdigitallabs.dev/ | head -8
# expect: HTTP/2 200

# www redirects to apex
curl -sI https://www.nexusdigitallabs.dev/ | head -8
# expect: HTTP/2 308
# Location: https://nexusdigitallabs.dev/

# Trailing slash is canonical
curl -sI https://nexusdigitallabs.dev/about | head -8
# expect: 308 → /about/

curl -sI https://nexusdigitallabs.dev/about/ | head -8
# expect: HTTP/2 200

# Sitemap uses apex + trailing slashes
curl -s https://nexusdigitallabs.dev/sitemap.xml | head -40
```

## Local checks

```bash
npm test -- src/lib/__tests__/seo.test.ts src/lib/__tests__/sitemap.test.ts
```

After `npm run build && npm start`, repeat the trailing-slash curls against `http://localhost:3000`.

## Google Search Console

1. Use (or keep) the property **`https://nexusdigitallabs.dev/`**.
2. After deploy, open the indexing report; “Page with redirect” on intentional apex URLs should clear as Google recrawls.
3. Optional: add `www` as a separate property only for monitoring — do not treat www as the canonical host.
