import { NextRequest, NextResponse } from 'next/server';
import { getCategoryBySlug, getRelatedCategories } from '@/lib/db';

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json({ relatedCategories: [] }, { headers: CACHE_HEADERS });
    }

    let relatedIds: string[] = [];
    if (category.related_categories) {
      try {
        relatedIds = JSON.parse(category.related_categories);
      } catch {
        relatedIds = [];
      }
    }

    if (!relatedIds.length) {
      return NextResponse.json({ relatedCategories: [] }, { headers: CACHE_HEADERS });
    }

    const relatedCategories = await getRelatedCategories(relatedIds);

    return NextResponse.json({ relatedCategories }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching related categories:', error);
    return NextResponse.json({ relatedCategories: [] }, { status: 500 });
  }
}
