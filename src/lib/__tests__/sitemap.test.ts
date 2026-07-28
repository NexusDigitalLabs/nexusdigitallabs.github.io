import { describe, expect, it } from 'vitest';
import { ARTICLES } from '@/data/articles';
import { GAMES, TOOLS } from '@/data/catalog';
import { SITE_URL } from '@/lib/seo';
import { buildSitemapEntries, sitemapUrl } from '@/lib/sitemap';

describe('sitemapUrl', () => {
  it('reuses seo helpers for apex + trailing-slash URLs', () => {
    expect(sitemapUrl('/')).toBe(`${SITE_URL}/`);
    expect(sitemapUrl('/about')).toBe(`${SITE_URL}/about/`);
    expect(sitemapUrl('/tools/fuel-tracker/')).toBe(`${SITE_URL}/tools/fuel-tracker/`);
  });
});

describe('buildSitemapEntries', () => {
  it('emits apex trailing-slash URLs for catalogs and static pages', () => {
    const entries = buildSitemapEntries();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/articles/`);
    expect(urls).toContain(`${SITE_URL}/games/`);
    expect(urls).toContain(`${SITE_URL}/login/`);

    for (const url of urls) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(url).not.toContain('://www.');
      expect(url.endsWith('/')).toBe(true);
    }

    for (const tool of TOOLS) {
      expect(urls).toContain(sitemapUrl(tool.href));
    }
    for (const game of GAMES) {
      expect(urls).toContain(sitemapUrl(game.href));
    }
    for (const article of ARTICLES) {
      expect(urls).toContain(sitemapUrl(`/articles/${article.slug}/`));
    }

    const expected =
      8 /* static */ + ARTICLES.length + TOOLS.length + GAMES.length;
    expect(entries).toHaveLength(expected);
  });
});
