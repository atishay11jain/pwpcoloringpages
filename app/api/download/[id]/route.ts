/**
 * GET /api/download/[id]
 *
 * Streams a coloring page file for download with proper Content-Disposition headers.
 *
 * Query Parameters:
 * - format: 'jpeg' | 'pdf' (default: 'jpeg')
 * - mode:   'bw' | 'color' (default: 'bw')
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getPublicUrl } from '@/lib/r2';

interface PageRecord {
  id: string;
  title: string;
}

interface AssetRecord {
  jpeg_url: string | null;
  pdf_url: string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') ?? 'jpeg') as 'jpeg' | 'pdf';
    const mode = (searchParams.get('mode') ?? 'bw') as 'bw' | 'color';

    if (!['jpeg', 'pdf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid format. Use "jpeg" or "pdf"' }, { status: 400 });
    }
    if (!['bw', 'color'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode. Use "bw" or "color"' }, { status: 400 });
    }

    // Get page title
    const pages = await query<PageRecord>(
      'SELECT id, title FROM coloring_pages WHERE id = ?',
      [id]
    );

    if (pages.length === 0) {
      return NextResponse.json({ error: 'Coloring page not found' }, { status: 404 });
    }

    const page = pages[0];

    // Get asset URLs from coloring_page_assets
    const assets = await query<AssetRecord>(
      'SELECT jpeg_url, pdf_url FROM coloring_page_assets WHERE coloring_page_id = ? AND mode = ?',
      [id, mode]
    );

    if (assets.length === 0) {
      return NextResponse.json({ error: 'Asset not found for this page and mode' }, { status: 404 });
    }

    const asset = assets[0];
    const rawUrl = format === 'pdf' ? asset.pdf_url : asset.jpeg_url;

    if (!rawUrl) {
      return NextResponse.json({ error: `${format.toUpperCase()} not available for this page` }, { status: 404 });
    }

    // If the stored value is a relative R2 key, resolve it to a full URL
    const fileUrl = rawUrl.startsWith('http') ? rawUrl : getPublicUrl(rawUrl);

    // Generate filename
    const sanitizedTitle = page.title.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();
    const extension = format === 'pdf' ? 'pdf' : 'jpg';
    const filename = `${sanitizedTitle}-${mode}.${extension}`;

    // Fetch and stream the file so the browser downloads instead of opening it
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch file from storage' }, { status: 502 });
    }

    const contentType = format === 'pdf' ? 'application/pdf' : 'image/jpeg';
    return new NextResponse(fileResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('Error processing download:', error);
    return NextResponse.json({ error: 'Failed to process download' }, { status: 500 });
  }
}
