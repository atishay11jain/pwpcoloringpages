import { NextRequest, NextResponse } from 'next/server';
import {
  getAllColoringPages,
  getCategoryById,
  createColoringPage,
  generateSlug,
} from '@/lib/admin-db';
import { getPublicUrl } from '@/lib/r2';

function toFullUrl(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return getPublicUrl(value);
}

// GET /api/admin/coloring-pages - Get all coloring pages
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category_id = searchParams.get('category_id') || undefined;
    const is_popular = searchParams.get('is_popular');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const { pages, total } = await getAllColoringPages({
      category_id,
      is_popular: is_popular === 'true' ? true : is_popular === 'false' ? false : undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    // Enhance pages with category information and normalize preview URLs
    const enhancedPages = await Promise.all(
      pages.map(async (page) => {
        const category = await getCategoryById(page.category_id);
        return {
          ...page,
          bw_preview: toFullUrl(page.bw_preview),
          color_preview: toFullUrl(page.color_preview),
          category: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
          } : null,
        };
      })
    );

    return NextResponse.json({ pages: enhancedPages, total });
  } catch (error: any) {
    console.error('Error fetching coloring pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coloring pages', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/coloring-pages - Create a new coloring page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category_id,
      possible_categories,
      difficulty,
      age_range,
      bw_preview,
      color_preview,
      is_popular,
      sort_order,
      meta_title,
      meta_description,
      meta_keywords,
    } = body;

    if (!title || !category_id) {
      return NextResponse.json(
        { error: 'Title and category_id are required' },
        { status: 400 }
      );
    }

    // Generate slug from title if not provided
    const slug = body.slug || generateSlug(title);

    const page = await createColoringPage({
      title,
      slug,
      description,
      category_id,
      possible_categories,
      difficulty,
      age_range,
      bw_preview,
      color_preview,
      is_popular,
      sort_order: typeof sort_order === 'number' ? sort_order : 0,
      meta_title,
      meta_description,
      meta_keywords,
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coloring page:', error);
    return NextResponse.json(
      { error: 'Failed to create coloring page', details: error.message },
      { status: 500 }
    );
  }
}
