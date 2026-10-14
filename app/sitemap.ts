import type { MetadataRoute } from 'next';

// Generate this metadata route at build time for static export.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://shiras.dev/',
      lastModified: new Date('2026-10-13T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://shiras.dev/propose/',
      lastModified: new Date('2026-10-13T00:00:00.000Z'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
