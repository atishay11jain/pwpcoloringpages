import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCategoryFAQs,
  createCategoryFAQ,
  getCategoryFAQs,
} from '@/lib/admin-db';

// GET /api/admin/category-faqs - Get all FAQs or FAQs for a specific category
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');

    if (categoryId) {
      const faqs = await getCategoryFAQs(categoryId);
      return NextResponse.json({ faqs });
    } else {
      const faqs = await getAllCategoryFAQs();
      return NextResponse.json({ faqs });
    }
  } catch (error: any) {
    console.error('Error fetching category FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/category-faqs - Create a new FAQ
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { category_id, question, answer, sort_order, is_published } = body;

    if (!category_id || !question || !answer) {
      return NextResponse.json(
        { error: 'Category ID, question, and answer are required' },
        { status: 400 }
      );
    }

    const faq = await createCategoryFAQ({
      category_id,
      question,
      answer,
      sort_order,
      is_published,
    });

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ', details: error.message },
      { status: 500 }
    );
  }
}
