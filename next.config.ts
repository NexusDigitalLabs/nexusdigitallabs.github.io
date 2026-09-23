import type { NextConfig } from 'next';
import withPWAInit from '@ducanh2912/next-pwa';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const projectRoot = dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  fallbacks: {
    document: '/',
  },
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // Canonical URL shape: always trailing slash (matches sitemap + pageMetadata).
  // Without this, Next serves /about as 200 and 308s /about/ → /about, which
  // conflicts with SITE_URL canonicals and triggers GSC "Page with redirect".
  trailingSlash: true,
  // Pin the tracing root — multiple lockfiles exist above this project.
  outputFileTracingRoot: projectRoot,
  // next-pwa injects a webpack plugin; also pin turbopack.root so a parent
  // lockfile (e.g. ~/pnpm-lock.yaml) doesn't make Turbopack resolve modules
  // from the wrong workspace and break the React Client Manifest (Safari error
  // about global-error.js).
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    // Baseline security headers — safe, non-breaking defaults only. A full
    // Content-Security-Policy is deliberately NOT set here: this site loads
    // GTM, AdSense, Supabase, Umami, and Ko-fi from various origins, and a
    // CSP needs each of those enumerated and tested carefully or it breaks
    // the very integrations this config supports. Add one separately, with
    // its own testing pass, rather than folding it in here.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/p/df-resume-2026',
        destination: '/p/portfolio/',
        permanent: true,
      },
      {
        source: '/p/df-resume-2026/',
        destination: '/p/portfolio/',
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);
