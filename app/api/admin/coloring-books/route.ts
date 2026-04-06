import { NextRequest, NextResponse } from 'next/server';
import {
  getAllColoringBooks,
  createColoringBook,
} from '@/lib/admin-db';
import { getPublicUrl } from '@/lib/r2';

// GET /api/admin/coloring-books - Get all coloring books
export async function GET() {
  try {
    const books = await getAllColoringBooks();

    // Transform books to include public URLs for cover images
    const transformedBooks = books.map((book) => ({
      ...book,
      cover_image_key: book.cover_image_key ? getPublicUrl(book.cover_image_key) : null,
    }));

    return NextResponse.json({ books: transformedBooks });
  } catch (error: any) {
    console.error('Error fetching coloring books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coloring books', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/coloring-books - Create a new coloring book
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { title, description, cover_image_key, buy_url, status, sort_order } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const book = await createColoringBook({
      title,
      description,
      cover_image_key,
      buy_url,
      status,
      sort_order,
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coloring book:', error);
    return NextResponse.json(
      { error: 'Failed to create coloring book', details: error.message },
      { status: 500 }
    );
  }
}
