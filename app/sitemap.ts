import type { MetadataRoute } from 'next';
import { getPublishedCategoriesWithCount, getColoringPages } from '@/lib/db';

const BASE_URL = 'https://pwpcoloringpages.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages — use real dates, not `now`, so Google's change-detection signal is meaningful
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/free-coloring-pages`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/coloring-books`,
      lastModified: new Date('2026-04-04'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date('2025-04-01'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date('2025-04-01'),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date('2025-04-01'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Category pages
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await getPublishedCategoriesWithCount();
    categoryPages = categories.map((cat) => ({
      url: `${BASE_URL}/${cat.slug}-coloring-pages`,
      lastModified: new Date(cat.updated_at ?? now),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    // DB unavailable — skip category URLs
  }

  // Individual coloring pages (paginated fetch, up to 2000 pages)
  let coloringPageEntries: MetadataRoute.Sitemap = [];
  try {
    const PAGE_SIZE = 200;
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const result = await getColoringPages({ page, pageSize: PAGE_SIZE });
      const entries: MetadataRoute.Sitemap = result.data.map((p) => ({
        url: `${BASE_URL}/${p.slug}-coloring-page`,
        lastModified: new Date(p.updated_at ?? now),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
      coloringPageEntries = [...coloringPageEntries, ...entries];
      hasMore = result.data.length === PAGE_SIZE;
      page++;
      // Safety cap at 2000 pages
      if (coloringPageEntries.length >= 2000) break;
    }
  } catch {
    // DB unavailable — skip coloring page URLs
  }

  return [...staticPages, ...categoryPages, ...coloringPageEntries];
}
