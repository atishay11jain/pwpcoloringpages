/**
 * GET /api/coloring-books
 *
 * Public endpoint to fetch all coloring books for display on the home page
 */

import { NextResponse } from 'next/server';
import { getAllColoringBooks } from '@/lib/admin-db';
import { getPublicUrl } from '@/lib/r2';

export async function GET() {
  try {
    // Fetch all coloring books
    const books = await getAllColoringBooks();

    // Transform response to include public URLs
    const transformedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      description: book.description,
      imageUrl: book.cover_image_key ? getPublicUrl(book.cover_image_key) : null,
      amazonUrl: book.buy_url,
      status: book.status,
      sortOrder: book.sort_order,
    }));

    return NextResponse.json({
      books: transformedBooks,
      total: transformedBooks.length,
    });
  } catch (error) {
    console.error('Error fetching coloring books:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch coloring books',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
