import type { Metadata } from 'next';

/**
 * Canonical public origin.
 * Policy (do not change without updating Vercel primary domain + sitemap tests):
 * - HTTPS apex only (`nexusdigitallabs.dev`) — never `www`
 * - No trailing slash on the origin itself
 * - Page paths always use a trailing slash (see `normalizeSitePath`)
 */
export const SITE_URL = 'https://nexusdigitallabs.dev';
export const SITE_NAME = 'NexusDigitalLabs';
export const KOFI_URL = 'https://ko-fi.com/nexusdigitallabs';
export const DEFAULT_OG_IMAGE = '/og-image.png';
/** Actual pixel size of public/og-image.png (a snapshot of the /og/home/ card). */
export const DEFAULT_OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;
/** Size of the per-page cards rendered by src/app/og/[...path]/route.tsx. */
export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;

/**
 * URL of a page's generated social card: `/og/<page path>` (home → `/og/home/`).
 * Pure string work on purpose — this file is imported by client components,
 * so the card registry (src/lib/og-cards.ts) must stay out of it.
 */
export function ogCardPath(pagePath: string): string {
  const path = normalizeSitePath(pagePath);
  return path === '/' ? '/og/home/' : `/og${path}`;
}

/** Inverse of ogCardPath for the route's `[...path]` segments. */
export function pagePathFromOgSegments(segments: string[]): string {
  return segments.length === 1 && segments[0] === 'home' ? '/' : normalizeSitePath(segments.join('/'));
}

export type PageSeoInput = {
  /** Page title (without site suffix — root template adds `— NexusDigitalLabs` unless absolute). */
  title: string;
  description: string;
  /** Absolute path including trailing slash, e.g. `/tools/fuel-tracker/`. */
  path: string;
  /** Absolute URL or site-relative path. Defaults to the page's generated card (ogCardPath). */
  image?: string;
  keywords?: string[];
  /** Use when the title should not use the root `%s — NexusDigitalLabs` template. */
  absoluteTitle?: boolean;
  type?: 'website' | 'article';
  /** Optional overrides if OG/Twitter copy should differ from the page description. */
  ogTitle?: string;
  ogDescription?: string;
};

/** Ensures a site path has a leading and trailing slash (`/` stays `/`). */
export function normalizeSitePath(path: string): string {
  if (!path || path === '/') return '/';
  const withLeading = path.startsWith('/') ? path : `/${path}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

/**
 * Resolves a path or absolute URL against SITE_URL.
 * Relative paths are joined as-is (call `normalizeSitePath` first for page URLs).
 */
export function absoluteSiteUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return `${SITE_URL}${path}`;
}

/**
 * Builds consistent Metadata for link previews (Facebook, LinkedIn, WhatsApp, X, etc.).
 * Always sets canonical URL, Open Graph, and Twitter large-image card with a shared image.
 */
export function pageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  absoluteTitle = false,
  type = 'website',
  ogTitle,
  ogDescription,
}: PageSeoInput): Metadata {
  const url = absoluteSiteUrl(normalizeSitePath(path));
  const imageUrl = absoluteSiteUrl(image ?? ogCardPath(path));
  // Custom images keep the legacy default size; generated cards are 1200×630.
  const imageSize = image ? DEFAULT_OG_IMAGE_SIZE : OG_CARD_SIZE;
  const socialTitle = ogTitle ?? title;
  const socialDescription = ogDescription ?? description;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords?.length ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type,
      siteName: SITE_NAME,
      url,
      title: socialTitle,
      description: socialDescription,
      images: [
        {
          url: imageUrl,
          width: imageSize.width,
          height: imageSize.height,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [imageUrl],
    },
  };
}
