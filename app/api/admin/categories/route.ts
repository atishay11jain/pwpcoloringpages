import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategories,
  createCategory,
  generateSlug,
} from '@/lib/admin-db';

// GET /api/admin/categories - Get all categories
export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, description, title, meta_title, meta_description, keywords, intro_text, related_categories, is_published, sort_order } = body;

    if (!name || !title) {
      return NextResponse.json(
        { error: 'Name and title are required' },
        { status: 400 }
      );
    }

    // Generate slug from name if not provided
    const slug = body.slug || generateSlug(name);

    const category = await createCategory({
      name,
      slug,
      description,
      title,
      meta_title,
      meta_description,
      keywords,
      intro_text,
      related_categories,
      is_published,
      sort_order,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category', details: error.message },
      { status: 500 }
    );
  }
}
