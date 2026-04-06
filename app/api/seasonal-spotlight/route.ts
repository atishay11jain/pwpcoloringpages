import { NextResponse } from 'next/server';
import { getActiveSeasonalSpotlight, getColoringPageBySlug } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

export async function GET() {
  try {
    const spotlight = await getActiveSeasonalSpotlight();
    if (!spotlight) {
      return NextResponse.json({ spotlight: null });
    }

    // Parse page_ids and fetch pages
    const pageIds: string[] = JSON.parse(spotlight.page_ids || '[]');

    // Fetch pages by their IDs using a direct query approach
    const { query } = await import('@/lib/db');
    const pages = pageIds.length > 0
      ? await query<{ id: string; title: string; slug: string; bw_preview: string | null }>(
          `SELECT id, title, slug, bw_preview FROM coloring_pages WHERE id IN (${pageIds.map(() => '?').join(',')})`,
          pageIds
        )
      : [];

    const pagesWithUrls = pages.map((p) => ({
      ...p,
      imageUrl: p.bw_preview ? getPublicUrl(p.bw_preview) : null,
    }));

    return NextResponse.json({
      spotlight: {
        ...spotlight,
        pages: pagesWithUrls,
      },
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Error fetching seasonal spotlight:', error);
    return NextResponse.json({ spotlight: null }, { status: 500 });
  }
}
