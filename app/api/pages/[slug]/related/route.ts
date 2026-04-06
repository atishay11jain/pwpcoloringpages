/**
 * GET /api/pages/[slug]/related?limit=6
 *
 * Returns related coloring pages in the same category.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getColoringPageBySlug, getRelatedColoringPages, getCategoryById } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get('limit') ?? '6'), 12);

    let page = await getColoringPageBySlug(slug);
    if (!page && slug.endsWith('-coloring-page')) {
      page = await getColoringPageBySlug(slug.replace(/-coloring-page$/, ''));
    }
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const [relatedPages, category] = await Promise.all([
      getRelatedColoringPages(page.category_id, page.id, limit),
      getCategoryById(page.category_id),
    ]);

    const pages = relatedPages.map(rp => ({
      id: rp.id,
      title: rp.title,
      slug: rp.slug,
      bwPreview: rp.bw_preview ? getPublicUrl(rp.bw_preview) : null,
      categoryName: category?.name ?? null,
    }));

    return NextResponse.json(
      { pages },
      { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
    );
  } catch (error) {
    console.error('Error fetching related pages:', error);
    return NextResponse.json({ error: 'Failed to fetch related pages' }, { status: 500 });
  }
}
