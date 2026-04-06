import { NextRequest, NextResponse } from 'next/server';
import {
  getColoringBookById,
  updateColoringBook,
  deleteColoringBook,
} from '@/lib/admin-db';
import { getPublicUrl } from '@/lib/r2';

// GET /api/admin/coloring-books/[id] - Get a single coloring book
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getColoringBookById(id);

    if (!book) {
      return NextResponse.json({ error: 'Coloring book not found' }, { status: 404 });
    }

    // Keep cover_image_key as the raw storage key; expose URL separately for display
    const transformedBook = {
      ...book,
      cover_image_url: book.cover_image_key ? getPublicUrl(book.cover_image_key) : null,
    };

    return NextResponse.json({ book: transformedBook });
  } catch (error: any) {
    console.error('Error fetching coloring book:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coloring book', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coloring-books/[id] - Update a coloring book
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const book = await getColoringBookById(id);
    if (!book) {
      return NextResponse.json({ error: 'Coloring book not found' }, { status: 404 });
    }

    // Destructure only columns that exist in the coloring_books table schema
    const { title, description, cover_image_key, buy_url, status, sort_order,
            rating, rating_count } = body;
    const dbUpdates = Object.fromEntries(
      Object.entries({ title, description, cover_image_key, buy_url, status, sort_order,
                       rating, rating_count })
        .filter(([, v]) => v !== undefined)
    );

    await updateColoringBook(id, dbUpdates);

    const updated = await getColoringBookById(id);
    if (!updated) {
      return NextResponse.json({ error: 'Coloring book not found' }, { status: 404 });
    }

    // Keep cover_image_key as the raw storage key; expose URL separately for display
    const transformedBook = {
      ...updated,
      cover_image_url: updated.cover_image_key ? getPublicUrl(updated.cover_image_key) : null,
    };

    return NextResponse.json({ book: transformedBook });
  } catch (error: any) {
    console.error('Error updating coloring book:', error);
    return NextResponse.json(
      { error: 'Failed to update coloring book', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coloring-books/[id] - Delete a coloring book
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getColoringBookById(id);

    if (!book) {
      return NextResponse.json({ error: 'Coloring book not found' }, { status: 404 });
    }

    await deleteColoringBook(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coloring book:', error);
    return NextResponse.json(
      { error: 'Failed to delete coloring book', details: error.message },
      { status: 500 }
    );
  }
}
