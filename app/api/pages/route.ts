/**
 * GET /api/pages
 *
 * Fetches paginated coloring pages with optional filters.
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - pageSize: Items per page (default: 6, max: 50)
 * - categorySlug: Filter by category slug (e.g., 'spiderman', 'animals')
 * - categoryId: Filter by category ID
 * - type: Filter by type ('bw' | 'color')
 * - popular: Filter popular pages only ('true')
 * - search: Search in title and description
 */

import { NextRequest, NextResponse } from 'next/server';
import { getColoringPages, getRecentColoringPages, type ColoringPage } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

// Cache response for 5 minutes on CDN, 1 minute in browser
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export interface ColoringPageResponse {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  categoryId: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | null;
  ageRange: string | null;
  images: {
    bwPreview: string | null;
    colorPreview: string | null;
  };
  isPopular: boolean;
}

export interface PaginatedResponse {
  data: ColoringPageResponse[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function transformPage(page: ColoringPage): ColoringPageResponse {
  return {
    id: page.id,
    title: page.title,
    slug: page.slug,
    description: page.description,
    categoryId: page.category_id,
    difficulty: page.difficulty,
    ageRange: page.age_range,
    images: {
      bwPreview: page.bw_preview ? getPublicUrl(page.bw_preview) : null,
      colorPreview: page.color_preview ? getPublicUrl(page.color_preview) : null,
    },
    isPopular: Boolean(page.is_popular),
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
    const pageSize = Math.min(50, Math.max(1, parseInt(searchParams.get('pageSize') ?? '6', 10)));
    const categorySlug = searchParams.get('categorySlug') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;
    const type = searchParams.get('type') as 'bw' | 'color' | null;
    const popular = searchParams.get('popular') === 'true' ? true : undefined;
    const search = searchParams.get('search') ?? undefined;
    const sort = searchParams.get('sort');
    const ageRange = searchParams.get('ageRange') ?? undefined;

    // Handle sort=recent: return pages ordered purely by updated_at DESC
    if (sort === 'recent') {
      const recentPages = await getRecentColoringPages(pageSize);
      const response: PaginatedResponse = {
        data: recentPages.map(transformPage),
        pagination: {
          page: 1,
          pageSize,
          total: recentPages.length,
          totalPages: 1,
          hasMore: false,
        },
      };
      return NextResponse.json(response, { headers: CACHE_HEADERS });
    }

    // Fetch pages from database
    const result = await getColoringPages({
      page,
      pageSize,
      categorySlug,
      categoryId,
      type: type ?? undefined,
      popular,
      search,
      ageRange,
    });

    // Transform response
    const response: PaginatedResponse = {
      data: result.data.map(transformPage),
      pagination: {
        page: result.page,
        pageSize: result.pageSize,
        total: result.total,
        totalPages: result.totalPages,
        hasMore: result.page < result.totalPages,
      },
    };

    return NextResponse.json(response, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching pages:', error);

    // Return empty response with error status
    return NextResponse.json(
      {
        error: 'Failed to fetch coloring pages',
        data: [],
        pagination: { page: 1, pageSize: 6, total: 0, totalPages: 0, hasMore: false },
      },
      { status: 500 }
    );
  }
}
