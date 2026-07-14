import { describe, expect, it } from 'vitest';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_SIZE, SITE_URL, pageMetadata } from '@/lib/seo';

describe('pageMetadata', () => {
  it('sets canonical, Open Graph, and Twitter large-image fields', () => {
    const meta = pageMetadata({
      title: 'Fuel Tracker',
      description: 'Track fill-ups and efficiency.',
      path: '/tools/fuel-tracker',
    });

    expect(meta.alternates).toEqual({
      canonical: `${SITE_URL}/tools/fuel-tracker/`,
    });
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      siteName: 'NexusDigitalLabs',
      url: `${SITE_URL}/tools/fuel-tracker/`,
      title: 'Fuel Tracker',
      description: 'Track fill-ups and efficiency.',
    });
    expect(meta.openGraph?.images).toEqual([
      {
        url: `${SITE_URL}${DEFAULT_OG_IMAGE}`,
        width: DEFAULT_OG_IMAGE_SIZE.width,
        height: DEFAULT_OG_IMAGE_SIZE.height,
        alt: 'Fuel Tracker',
      },
    ]);
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: 'Fuel Tracker',
      description: 'Track fill-ups and efficiency.',
      images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
    });
  });

  it('supports absolute titles and article type', () => {
    const meta = pageMetadata({
      title: 'Custom Absolute Title',
      description: 'Body',
      path: '/articles/example/',
      absoluteTitle: true,
      type: 'article',
      ogTitle: 'OG Title',
      ogDescription: 'OG Desc',
      image: 'https://cdn.example/custom.png',
    });

    expect(meta.title).toEqual({ absolute: 'Custom Absolute Title' });
    expect(meta.openGraph).toMatchObject({
      type: 'article',
      title: 'OG Title',
      description: 'OG Desc',
    });
    expect(meta.openGraph?.images).toEqual([
      {
        url: 'https://cdn.example/custom.png',
        width: DEFAULT_OG_IMAGE_SIZE.width,
        height: DEFAULT_OG_IMAGE_SIZE.height,
        alt: 'OG Title',
      },
    ]);
  });
});
