import { NextResponse } from 'next/server';
import { getHomeFAQs } from '@/lib/db';

export async function GET() {
  try {
    const faqs = await getHomeFAQs();
    return NextResponse.json({ faqs }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Error fetching home FAQs:', error);
    return NextResponse.json({ faqs: [] }, { status: 500 });
  }
}
