/**
 * GET /api/categories
 *
 * Fetches all published categories from the categories table with their coloring page counts.
 */

import { NextResponse } from 'next/server';
import { getPublishedCategoriesWithCount } from '@/lib/db';

// Cache response for 5 minutes on CDN, 1 minute in browser
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET() {
  try {
    const categories = await getPublishedCategoriesWithCount();

    return NextResponse.json({ categories }, { headers: CACHE_HEADERS });
  } catch (error) {
    console.error('Error fetching categories:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch categories',
        categories: [],
      },
      { status: 500 }
    );
  }
}
