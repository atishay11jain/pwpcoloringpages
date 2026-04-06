import { NextRequest, NextResponse } from 'next/server';
import {
  getColoringPageById,
  updateColoringPage,
  deleteColoringPage,
  getAssetsByPageId,
} from '@/lib/admin-db';

// GET /api/admin/coloring-pages/[id] - Get a single coloring page with assets
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await getColoringPageById(id);

    if (!page) {
      return NextResponse.json({ error: 'Coloring page not found' }, { status: 404 });
    }

    // Get associated assets
    const assets = await getAssetsByPageId(id);

    return NextResponse.json({ page, assets });
  } catch (error: any) {
    console.error('Error fetching coloring page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch coloring page', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coloring-pages/[id] - Update a coloring page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const page = await getColoringPageById(id);
    if (!page) {
      return NextResponse.json({ error: 'Coloring page not found' }, { status: 404 });
    }

    await updateColoringPage(id, body);

    const updated = await getColoringPageById(id);
    const assets = await getAssetsByPageId(id);

    return NextResponse.json({ page: updated, assets });
  } catch (error: any) {
    console.error('Error updating coloring page:', error);
    return NextResponse.json(
      { error: 'Failed to update coloring page', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/coloring-pages/[id] - Delete a coloring page
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const page = await getColoringPageById(id);

    if (!page) {
      return NextResponse.json({ error: 'Coloring page not found' }, { status: 404 });
    }

    await deleteColoringPage(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting coloring page:', error);
    return NextResponse.json(
      { error: 'Failed to delete coloring page', details: error.message },
      { status: 500 }
    );
  }
}
