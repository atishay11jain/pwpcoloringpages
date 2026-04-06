import { NextResponse } from 'next/server';
import { getSiteStats } from '@/lib/db';

export async function GET() {
  try {
    const stats = await getSiteStats();
    return NextResponse.json(stats, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    console.error('Error fetching site stats:', error);
    return NextResponse.json({ error: 'Failed to fetch site stats' }, { status: 500 });
  }
}
