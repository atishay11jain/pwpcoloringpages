import { NextRequest, NextResponse } from 'next/server';
import { getColoringBookById, updateColoringBook } from '@/lib/admin-db';
import { processImageSet } from '@/lib/image-processor';
import { uploadImage, generateBookKeys } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

// POST /api/admin/coloring-books/[id]/upload - Upload cover image
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const book = await getColoringBookById(id);

    if (!book) {
      return NextResponse.json({ error: 'Coloring book not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image
    const processedImages = await processImageSet(buffer);

    // Generate storage keys using book title and ID
    // Structure: coloring-books/{book-title-slug}-{bookId}/{uniqueId}
    const uniqueId = uuidv4().substring(0, 8);
    const bookKeys = generateBookKeys({
      bookId: id,
      bookTitle: book.title,
      uniqueId: uniqueId,
    });

    // Upload cover image (use preview size for covers)
    const coverUpload = await uploadImage(
      bookKeys.coverKey,
      processedImages.preview.buffer,
      'webp'
    );

    // Update coloring book with cover image key
    await updateColoringBook(id, {
      cover_image_key: coverUpload.key,
    });

    return NextResponse.json({
      url: coverUpload.url,
      message: 'Cover image uploaded successfully',
    });
  } catch (error: any) {
    console.error('Error uploading cover image:', error);
    return NextResponse.json(
      { error: 'Failed to upload cover image', details: error.message },
      { status: 500 }
    );
  }
}
