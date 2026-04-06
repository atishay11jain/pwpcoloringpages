/**
 * GET /api/pages/[slug]
 *
 * Fetches a single coloring page by its slug with assets.
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getColoringPageWithAssets,
  getRelatedCategories,
  getCategoryById,
  type ColoringPageAsset,
} from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

// Cache for 5 minutes
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export interface SinglePageResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  categoryName: string | null;
  categorySlug: string | null;
  possibleCategories: { name: string; slug: string }[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  ageRange: string | null;
  assets: {
    mode: 'bw' | 'color';
    thumbnailUrl: string | null;
    jpegUrl: string | null;
    pdfUrl: string | null;
  }[];
  isPopular: boolean;
  ratingSum: number;
  ratingCount: number;
  printingTips: string | null;
  meta: {
    title: string | null;
    description: string | null;
    keywords: string | null;
  };
  updatedAt: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Try the slug as-is first; if not found, strip a trailing '-coloring-page' suffix and retry
    let page = await getColoringPageWithAssets(slug);
    if (!page && slug.endsWith('-coloring-page')) {
      page = await getColoringPageWithAssets(slug.replace(/-coloring-page$/, ''));
    }

    if (!page) {
      return NextResponse.json(
        { error: 'Coloring page not found' },
        { status: 404 }
      );
    }

    // Parse possible_categories JSON string (array of category IDs)
    let possibleCategoryIds: string[] = [];
    if (page.possible_categories) {
      try {
        possibleCategoryIds = JSON.parse(page.possible_categories);
      } catch (e) {
        console.error('Failed to parse possible_categories:', e);
      }
    }

    // Fetch primary category and possible category details in parallel
    const [primaryCategory, relatedCats] = await Promise.all([
      getCategoryById(page.category_id),
      possibleCategoryIds.length > 0 ? getRelatedCategories(possibleCategoryIds) : Promise.resolve([]),
    ]);

    const possibleCategories = relatedCats.map(c => ({ name: c.name, slug: c.slug }));

    // Transform response - convert R2 keys to public URLs
    const response: SinglePageResponse = {
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.description,
      categoryId: page.category_id,
      categoryName: primaryCategory?.name ?? null,
      categorySlug: primaryCategory?.slug ?? null,
      possibleCategories,
      difficulty: page.difficulty,
      ageRange: page.age_range,
      assets: page.assets.map((asset: ColoringPageAsset) => ({
        mode: asset.mode,
        thumbnailUrl: asset.thumbnail_url ? getPublicUrl(asset.thumbnail_url) : null,
        jpegUrl: asset.jpeg_url ? getPublicUrl(asset.jpeg_url) : null,
        pdfUrl: asset.pdf_url ? getPublicUrl(asset.pdf_url) : null,
      })),
      isPopular: Boolean(page.is_popular),
      ratingSum: page.rating_sum ?? 0,
      ratingCount: page.rating_count ?? 0,
      printingTips: page.printing_tips ?? null,
      meta: {
        title: page.meta_title,
        description: page.meta_description,
        keywords: page.meta_keywords,
      },
      updatedAt: page.updated_at,
    };

    return NextResponse.json(response, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching page:', error);

    return NextResponse.json(
      { error: 'Failed to fetch coloring page' },
      { status: 500 }
    );
  }
}
