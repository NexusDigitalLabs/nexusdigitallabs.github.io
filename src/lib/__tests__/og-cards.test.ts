import { describe, it, expect } from 'vitest';
import { FALLBACK_CARD, ogCardFor, ogCardPaths } from '@/lib/og-cards';
import { buildSitemapEntries } from '@/lib/sitemap';
import { SITE_URL } from '@/lib/seo';

describe('og cards', () => {
  it('gives every sitemap page its own preview card', () => {
    const missing = buildSitemapEntries()
      .map((e) => e.url.replace(SITE_URL, ''))
      .filter((path) => !ogCardFor(path));
    expect(missing).toEqual([]);
  });

  it('cards are unique per page (no two pages share a title)', () => {
    const titles = ogCardPaths().map((p) => ogCardFor(p)!.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('uses valid hex accents and non-empty text', () => {
    for (const path of ogCardPaths()) {
      const card = ogCardFor(path)!;
      expect(card.accent, path).toMatch(/^#[0-9a-f]{6}$/i);
      expect(card.title.trim(), path).not.toBe('');
      expect(card.description.trim(), path).not.toBe('');
    }
  });

  it('never has a card for the private app', () => {
    expect(ogCardPaths().some((p) => p.startsWith('/app/'))).toBe(false);
    expect(FALLBACK_CARD).toBe(ogCardFor('/'));
  });
});
