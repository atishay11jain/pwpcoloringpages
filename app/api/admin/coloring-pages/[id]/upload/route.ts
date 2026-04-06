import { NextRequest, NextResponse } from 'next/server';
import {
  getColoringPageById,
  getCategoryById,
  updateColoringPage,
  createOrUpdateAsset,
} from '@/lib/admin-db';
import { processImageSet } from '@/lib/image-processor';
import { uploadImage, getPublicUrl } from '@/lib/r2';
import { v4 as uuidv4 } from 'uuid';

// POST /api/admin/coloring-pages/[id]/upload - Upload and process images
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await getColoringPageById(id);

    if (!page) {
      return NextResponse.json({ error: 'Coloring page not found' }, { status: 404 });
    }

    // Fetch category to get the slug for storage path
    const category = await getCategoryById(page.category_id);
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const mode = formData.get('mode') as 'bw' | 'color';
    const imageFile = formData.get('image') as File;

    if (!mode || !imageFile) {
      return NextResponse.json(
        { error: 'Mode and image file are required' },
        { status: 400 }
      );
    }

    if (mode !== 'bw' && mode !== 'color') {
      return NextResponse.json(
        { error: 'Mode must be either "bw" or "color"' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Process image into multiple sizes
    const processedImages = await processImageSet(buffer);

    // Generate unique keys for this image set - using category slug for readability
    const uniqueId = uuidv4().substring(0, 8);
    const baseKey = `${mode}/${category.slug}/${page.slug}-${uniqueId}`;

    // Upload all processed images to R2
    const [thumbnailUpload, previewUpload, originalUpload] = await Promise.all([
      uploadImage(`${baseKey}/thumb.webp`, processedImages.thumbnail.buffer, 'webp'),
      uploadImage(`${baseKey}/preview.webp`, processedImages.preview.buffer, 'webp'),
      uploadImage(`${baseKey}/original.jpg`, processedImages.original.buffer, 'jpeg'),
    ]);

    // Create or update asset record
    const asset = await createOrUpdateAsset({
      coloring_page_id: id,
      mode,
      thumbnail_url: thumbnailUpload.key,
      jpeg_url: originalUpload.key,
    });

    // Update the coloring page preview field (store full URL, not storage key)
    const previewField = mode === 'bw' ? 'bw_preview' : 'color_preview';
    await updateColoringPage(id, {
      [previewField]: thumbnailUpload.url,
    });

    return NextResponse.json({
      asset,
      urls: {
        thumbnail: thumbnailUpload.url,
        preview: previewUpload.url,
        original: originalUpload.url,
      },
      message: `${mode.toUpperCase()} image uploaded and processed successfully`,
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image', details: error.message },
      { status: 500 }
    );
  }
}
