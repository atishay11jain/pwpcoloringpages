import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, subject, message } = body;

    // Basic validation
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'A valid full name is required.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Please select a subject.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 20) {
      return NextResponse.json({ error: 'Message must be at least 20 characters.' }, { status: 400 });
    }

    if (message.trim().length > 1000) {
      return NextResponse.json({ error: 'Message must be under 1000 characters.' }, { status: 400 });
    }

    // Log the contact submission (replace with email/DB integration as needed)
    console.log('[Contact Form]', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      subject,
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Message received. We\'ll be in touch soon!' }, { status: 200 });
  } catch (error: unknown) {
    console.error('[Contact API Error]', error);
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
