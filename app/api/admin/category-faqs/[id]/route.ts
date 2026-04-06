import { NextRequest, NextResponse } from 'next/server';
import {
  getCategoryFAQById,
  updateCategoryFAQ,
  deleteCategoryFAQ,
} from '@/lib/admin-db';

// GET /api/admin/category-faqs/[id] - Get a specific FAQ
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faq = await getCategoryFAQById(id);

    if (!faq) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ faq });
  } catch (error: any) {
    console.error('Error fetching FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQ', details: error.message },
      { status: 500 }
    );
  }
}

// PUT/PATCH /api/admin/category-faqs/[id] - Update a FAQ
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    await updateCategoryFAQ(id, body);

    const updatedFaq = await getCategoryFAQById(id);

    return NextResponse.json({ faq: updatedFaq });
  } catch (error: any) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ', details: error.message },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

// DELETE /api/admin/category-faqs/[id] - Delete a FAQ
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCategoryFAQ(id);

    return NextResponse.json({ message: 'FAQ deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ', details: error.message },
      { status: 500 }
    );
  }
}
