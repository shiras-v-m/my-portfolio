import type { MetadataRoute } from 'next';

// Generate this metadata route at build time for static export.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://shiras.dev/sitemap.xml',
    host: 'https://shiras.dev',
  };
}
