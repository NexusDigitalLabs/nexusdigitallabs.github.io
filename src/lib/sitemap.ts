import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/data/articles';
import { GAMES, TOOLS } from '@/data/catalog';
import { LESSONS } from '@/data/academy';
import { absoluteSiteUrl, normalizeSitePath } from '@/lib/seo';

type SitemapEntry = MetadataRoute.Sitemap[number];

/** Absolute page URL with trailing slash (canonical policy via seo helpers). */
export function sitemapUrl(path: string): string {
  return absoluteSiteUrl(normalizeSitePath(path));
}

function entry(
  path: string,
  priority: number,
  changeFrequency: NonNullable<SitemapEntry['changeFrequency']>,
): SitemapEntry {
  return {
    url: sitemapUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  };
}

/**
 * Builds the public sitemap from SITE_URL + catalogs.
 * Static marketing/legal routes are listed here; tools/games/articles come from data catalogs.
 */
export function buildSitemapEntries(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    entry('/', 1.0, 'monthly'),
    entry('/about/', 0.6, 'yearly'),
    entry('/contact/', 0.5, 'yearly'),
    entry('/privacy-policy/', 0.3, 'yearly'),
    entry('/terms/', 0.3, 'yearly'),
    entry('/login/', 0.2, 'yearly'),
    entry('/articles/', 0.8, 'weekly'),
    entry('/games/', 0.8, 'monthly'),
    entry('/academy/', 0.8, 'weekly'),
  ];

  const articleRoutes = ARTICLES.map((a) =>
    entry(`/articles/${a.slug}/`, 0.7, 'monthly'),
  );
  const toolRoutes = TOOLS.map((t) => entry(t.href, 0.9, 'monthly'));
  const gameRoutes = GAMES.map((g) => entry(g.href, 0.7, 'monthly'));
  const lessonRoutes = LESSONS.filter((l) => l.status === 'ready').map((l) =>
    entry(`/academy/${l.slug}/`, 0.6, 'monthly'),
  );

  return [...staticRoutes, ...articleRoutes, ...toolRoutes, ...gameRoutes, ...lessonRoutes];
}
