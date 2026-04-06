import { NextRequest, NextResponse } from 'next/server';
import { getSeasonalSpotlightById, updateSeasonalSpotlight, deleteSeasonalSpotlight } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const spotlight = await getSeasonalSpotlightById(id);
    if (!spotlight) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ spotlight });
  } catch (error: unknown) {
    console.error('Error fetching spotlight:', error);
    return NextResponse.json({ error: 'Failed to fetch spotlight' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateSeasonalSpotlight(id, body);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating spotlight:', error);
    return NextResponse.json({ error: 'Failed to update spotlight' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteSeasonalSpotlight(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting spotlight:', error);
    return NextResponse.json({ error: 'Failed to delete spotlight' }, { status: 500 });
  }
}
