import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Check for existing subscriber
    const existing = await query<{ id: string; is_active: number }>(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = ?',
      [trimmed]
    );

    if (existing.length > 0) {
      if (existing[0].is_active) {
        return NextResponse.json({ error: 'This email is already subscribed' }, { status: 409 });
      }
      // Re-activate previously unsubscribed email
      await query(
        'UPDATE newsletter_subscribers SET is_active = TRUE, subscribed_at = CURRENT_TIMESTAMP WHERE email = ?',
        [trimmed]
      );
      return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 200 });
    }

    await query(
      'INSERT INTO newsletter_subscribers (id, email) VALUES (?, ?)',
      [uuidv4(), trimmed]
    );

    return NextResponse.json({ message: 'Successfully subscribed!' }, { status: 201 });
  } catch (error: unknown) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 });
  }
}
