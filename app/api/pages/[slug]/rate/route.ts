/**
 * POST /api/pages/[slug]/rate
 *
 * Submit a star rating (1–5) for a coloring page.
 * Deduplicates via sha256-hashed IP address.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getColoringPageBySlug, submitPageRating } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be an integer between 1 and 5' }, { status: 400 });
    }

    let page = await getColoringPageBySlug(slug);
    if (!page && slug.endsWith('-coloring-page')) {
      page = await getColoringPageBySlug(slug.replace(/-coloring-page$/, ''));
    }
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    // Hash IP for privacy — salt prevents rainbow-table lookup
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const salt = process.env.RATE_SALT ?? 'pwp-rate-salt';
    const ipHash = createHash('sha256').update(ip + salt).digest('hex');

    const result = await submitPageRating(page.id, rating, ipHash);

    if (result.isDuplicate) {
      return NextResponse.json(
        { error: 'You have already rated this page' },
        { status: 409 }
      );
    }

    const ratingValue =
      result.newCount > 0 ? Math.round((result.newSum / result.newCount) * 10) / 10 : 0;

    return NextResponse.json({
      success: true,
      ratingValue,
      reviewCount: result.newCount,
    });
  } catch (error) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 });
  }
}
