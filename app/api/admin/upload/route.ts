/**
 * POST /api/admin/upload
 *
 * Upload a new coloring page with B&W and/or Color images.
 * Each image is processed into multiple sizes (thumbnail, preview, JPEG, PDF) and stored in R2.
 * Protected route - requires admin authentication.
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { auth } from '@/lib/auth';
import {
  createColoringPage,
  createOrUpdateAsset,
  generateSlug,
  getCategoryById,
} from '@/lib/admin-db';
import { uploadImage, uploadPdf, getPublicUrl } from '@/lib/r2';
import {
  processImageSet,
  validateImageFile,
  imageToPdf,
} from '@/lib/image-processor';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const bwFile = formData.get('bw_file') as File | null;
    const colorFile = formData.get('color_file') as File | null;
    const title = formData.get('title') as string;
    const userSlug = formData.get('slug') as string | null;
    const description = formData.get('description') as string | null;
    const categoryId = formData.get('category_id') as string;
    const possibleCategoriesStr = formData.get('possible_categories') as string | null;
    const difficulty = formData.get('difficulty') as 'Easy' | 'Medium' | 'Hard' | '';
    const ageRange = formData.get('age_range') as string | null;
    const metaTitle = formData.get('meta_title') as string | null;
    const metaDescription = formData.get('meta_description') as string | null;
    const printingTips = formData.get('printing_tips') as string | null;
    const isPopular = formData.get('is_popular') === 'true';
    const generatePdf = formData.get('generatePdf') === 'true';
    const sortOrderRaw = formData.get('sort_order') as string | null;
    const sortOrder = sortOrderRaw ? parseInt(sortOrderRaw, 10) : 0;

    // Validate required fields
    if (!bwFile && !colorFile) {
      return NextResponse.json(
        { error: 'At least one image file (B&W or Color) is required' },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!userSlug) {
      return NextResponse.json(
        { error: 'Slug is required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    // Fetch category to get the slug for storage path
    const category = await getCategoryById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate files
    if (bwFile) {
      const validation = validateImageFile({
        size: bwFile.size,
        type: bwFile.type,
        name: bwFile.name,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { error: `B&W image: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    if (colorFile) {
      const validation = validateImageFile({
        size: colorFile.size,
        type: colorFile.type,
        name: colorFile.name,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { error: `Color image: ${validation.error}` },
          { status: 400 }
        );
      }
    }

    // Parse possible categories
    let possibleCategories: string[] = [];
    try {
      if (possibleCategoriesStr) {
        possibleCategories = JSON.parse(possibleCategoriesStr);
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid possible_categories format' },
        { status: 400 }
      );
    }

    // Use provided slug for the page
    const slug = userSlug.trim();
    const baseSlug = slug; // Use the slug for file paths
    const uniqueId = uuidv4().substring(0, 8);

    // Process and upload B&W image if provided
    let bwPreviewUrl: string | null = null;
    let bwAssetData: { thumbnail_url: string; jpeg_url: string; pdf_url?: string } | null = null;
    if (bwFile) {
      const arrayBuffer = await bwFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image into multiple sizes
      const processed = await processImageSet(buffer);

      // Define storage keys for B&W - using category slug for readability
      const bwBasePath = `bw/${category.slug}/${baseSlug}-${uniqueId}`;
      const bwThumbnailKey = `${bwBasePath}/thumb.webp`;
      const bwPreviewKey = `${bwBasePath}/preview.webp`;
      const bwOriginalKey = `${bwBasePath}/original.jpg`;
      const bwPdfKey = `${bwBasePath}/print.pdf`;

      // Upload all versions to R2 in parallel
      const bwUploadPromises = [
        uploadImage(bwThumbnailKey, processed.thumbnail.buffer, 'webp'),
        uploadImage(bwPreviewKey, processed.preview.buffer, 'webp'),
        uploadImage(bwOriginalKey, processed.original.buffer, 'jpeg'),
      ];

      // Optionally generate and upload PDF
      if (generatePdf) {
        const pdfBuffer = await imageToPdf(buffer);
        bwUploadPromises.push(uploadPdf(bwPdfKey, pdfBuffer));
      }

      await Promise.all(bwUploadPromises);

      // Store keys for preview
      bwPreviewUrl = bwPreviewKey;

      // Store asset data for later creation (after page is created)
      bwAssetData = {
        thumbnail_url: bwThumbnailKey,
        jpeg_url: bwOriginalKey,
        pdf_url: generatePdf ? bwPdfKey : undefined,
      };
    }

    // Process and upload Color image if provided
    let colorPreviewUrl: string | null = null;
    let colorAssetData: { thumbnail_url: string; jpeg_url: string; pdf_url?: string } | null = null;
    if (colorFile) {
      const arrayBuffer = await colorFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Process image into multiple sizes
      const processed = await processImageSet(buffer);

      // Define storage keys for Color - using category slug for readability
      const colorBasePath = `color/${category.slug}/${baseSlug}-${uniqueId}`;
      const colorThumbnailKey = `${colorBasePath}/thumb.webp`;
      const colorPreviewKey = `${colorBasePath}/preview.webp`;
      const colorOriginalKey = `${colorBasePath}/original.jpg`;
      const colorPdfKey = `${colorBasePath}/print.pdf`;

      // Upload all versions to R2 in parallel
      const colorUploadPromises = [
        uploadImage(colorThumbnailKey, processed.thumbnail.buffer, 'webp'),
        uploadImage(colorPreviewKey, processed.preview.buffer, 'webp'),
        uploadImage(colorOriginalKey, processed.original.buffer, 'jpeg'),
      ];

      // Optionally generate and upload PDF
      if (generatePdf) {
        const pdfBuffer = await imageToPdf(buffer);
        colorUploadPromises.push(uploadPdf(colorPdfKey, pdfBuffer));
      }

      await Promise.all(colorUploadPromises);

      // Store keys for preview
      colorPreviewUrl = colorPreviewKey;

      // Store asset data for later creation (after page is created)
      colorAssetData = {
        thumbnail_url: colorThumbnailKey,
        jpeg_url: colorOriginalKey,
        pdf_url: generatePdf ? colorPdfKey : undefined,
      };
    }

    // Create coloring page record FIRST (so foreign key constraint is satisfied)
    const page = await createColoringPage({
      title,
      slug,
      description: description || undefined,
      category_id: categoryId,
      possible_categories: possibleCategories.length > 0 ? possibleCategories : undefined,
      difficulty: difficulty || undefined,
      age_range: ageRange || undefined,
      bw_preview: bwPreviewUrl || undefined,
      color_preview: colorPreviewUrl || undefined,
      is_popular: isPopular,
      sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      meta_title: metaTitle || undefined,
      meta_description: metaDescription || undefined,
      printing_tips: printingTips || undefined,
    });

    // Now create asset records using the ACTUAL page ID from the database
    if (bwAssetData) {
      await createOrUpdateAsset({
        coloring_page_id: page.id, // Use page.id, not pageId
        mode: 'bw',
        ...bwAssetData,
      });
    }

    if (colorAssetData) {
      await createOrUpdateAsset({
        coloring_page_id: page.id, // Use page.id, not pageId
        mode: 'color',
        ...colorAssetData,
      });
    }

    // Return success response
    return NextResponse.json({
      success: true,
      page: {
        id: page.id, // Use the actual ID from the database
        title: page.title,
        slug: page.slug,
        category_id: page.category_id,
        has_bw: !!bwFile,
        has_color: !!colorFile,
        bw_preview: page.bw_preview,
        color_preview: page.color_preview,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);

    return NextResponse.json(
      {
        error: 'Failed to upload coloring page',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upload
 *
 * Returns upload configuration and limits
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSizeFormatted: '10MB',
    supportedFormats: ['JPEG', 'PNG', 'WebP'],
    supportsDualUpload: true,
    processedFormats: ['thumbnail (400x400 WebP)', 'preview (800x800 WebP)', 'original (2000x2000 JPEG)', 'PDF'],
  });
}
