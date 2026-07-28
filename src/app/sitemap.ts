import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/lib/sitemap';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
