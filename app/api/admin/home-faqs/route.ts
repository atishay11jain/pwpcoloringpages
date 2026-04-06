import { NextRequest, NextResponse } from 'next/server';
import { getAllHomeFAQsAdmin, createHomeFAQ } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const faqs = await getAllHomeFAQsAdmin();
    return NextResponse.json({ faqs });
  } catch (error: unknown) {
    console.error('Error fetching home FAQs:', error);
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, answer, sort_order, is_published } = body;

    if (!question || !answer) {
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const id = uuidv4();
    await createHomeFAQ({ id, question, answer, sort_order, is_published });
    return NextResponse.json({ id }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating home FAQ:', error);
    return NextResponse.json({ error: 'Failed to create FAQ' }, { status: 500 });
  }
}
