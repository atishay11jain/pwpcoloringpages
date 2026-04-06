/**
 * Admin API for managing individual coloring pages
 *
 * PUT /api/admin/pages/[id] - Update a page
 * DELETE /api/admin/pages/[id] - Delete a page
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { query, updateColoringPage, deleteColoringPage } from '@/lib/db';
import { deleteFiles } from '@/lib/r2';

interface PageRecord {
  id: string;
}

interface AssetRecord {
  thumbnail_url: string | null;
  jpeg_url: string | null;
  pdf_url: string | null;
}

/**
 * PUT /api/admin/pages/[id]
 * Update a coloring page's metadata
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Validate page exists
    const pages = await query<{ id: string }>(
      'SELECT id FROM coloring_pages WHERE id = ?',
      [id]
    );

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Extract updatable fields
    const updates: Record<string, unknown> = {};

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.category_id !== undefined) updates.category_id = body.category_id;
    if (body.type !== undefined) updates.type = body.type;
    if (body.is_featured !== undefined) updates.is_featured = body.is_featured;
    if (body.is_published !== undefined) updates.is_published = body.is_published;
    if (body.meta_title !== undefined) updates.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description;
    if (body.keywords !== undefined) updates.keywords = body.keywords;

    // Update the page
    await updateColoringPage(id, updates);

    return NextResponse.json({
      success: true,
      message: 'Page updated successfully',
    });
  } catch (error) {
    console.error('Update error:', error);

    return NextResponse.json(
      { error: 'Failed to update page' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/pages/[id]
 * Delete a coloring page and its associated files
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check page exists
    const pages = await query<PageRecord>(
      'SELECT id FROM coloring_pages WHERE id = ?',
      [id]
    );

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    // Fetch asset URLs from the assets table
    const assets = await query<AssetRecord>(
      'SELECT thumbnail_url, jpeg_url, pdf_url FROM coloring_page_assets WHERE coloring_page_id = ?',
      [id]
    );

    // Extract R2 keys from full URLs by stripping the public base URL
    const publicBase = process.env.CLOUDFLARE_R2_PUBLIC_URL ?? '';
    const keysToDelete: string[] = [];
    for (const asset of assets) {
      for (const url of [asset.thumbnail_url, asset.jpeg_url, asset.pdf_url]) {
        if (url) {
          const key = publicBase ? url.replace(`${publicBase}/`, '') : url;
          keysToDelete.push(key);
        }
      }
    }

    // Delete files from R2 (don't fail if files don't exist)
    if (keysToDelete.length > 0) {
      try {
        await deleteFiles(keysToDelete);
      } catch (fileError) {
        console.warn('Error deleting files from R2:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete from database (CASCADE deletes coloring_page_assets automatically)
    await deleteColoringPage(id);

    return NextResponse.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    console.error('Delete error:', error);

    return NextResponse.json(
      { error: 'Failed to delete page' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/pages/[id]
 * Get a single page with all details (including unpublished)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    const pages = await query<PageRecord & {
      title: string;
      slug: string;
      description: string | null;
      category_id: string | null;
      type: 'bw' | 'color';
      download_count: number;
      view_count: number;
      is_featured: number;
      is_published: number;
      meta_title: string | null;
      meta_description: string | null;
      keywords: string | null;
      updated_at: string;
    }>(
      'SELECT * FROM coloring_pages WHERE id = ?',
      [id]
    );

    if (pages.length === 0) {
      return NextResponse.json(
        { error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: pages[0] });
  } catch (error) {
    console.error('Get page error:', error);

    return NextResponse.json(
      { error: 'Failed to get page' },
      { status: 500 }
    );
  }
}
