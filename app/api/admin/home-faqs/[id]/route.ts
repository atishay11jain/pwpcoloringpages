import { NextRequest, NextResponse } from 'next/server';
import { getHomeFAQById, updateHomeFAQ, deleteHomeFAQ } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const faq = await getHomeFAQById(id);
    if (!faq) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ faq });
  } catch (error: unknown) {
    console.error('Error fetching home FAQ:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQ' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    await updateHomeFAQ(id, body);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating home FAQ:', error);
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteHomeFAQ(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting home FAQ:', error);
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
