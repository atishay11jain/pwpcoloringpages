import { NextRequest, NextResponse } from 'next/server';
import { getAllSeasonalSpotlightsAdmin, createSeasonalSpotlight } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const spotlights = await getAllSeasonalSpotlightsAdmin();
    return NextResponse.json({ spotlights });
  } catch (error: unknown) {
    console.error('Error fetching spotlights:', error);
    return NextResponse.json({ error: 'Failed to fetch spotlights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { heading, category_slug, page_ids, is_active, sort_order } = body;

    if (!heading || !category_slug || !page_ids) {
      return NextResponse.json(
        { error: 'heading, category_slug, and page_ids are required' },
        { status: 400 }
      );
    }

    const id = uuidv4();
    await createSeasonalSpotlight({ id, heading, category_slug, page_ids, is_active, sort_order });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating spotlight:', error);
    return NextResponse.json({ error: 'Failed to create spotlight' }, { status: 500 });
  }
}
