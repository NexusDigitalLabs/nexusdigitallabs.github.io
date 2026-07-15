import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactBody = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  website?: unknown; // honeypot — must stay empty
};

function trimStr(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

/**
 * POST /api/contact
 * Sends a contact enquiry via Resend. Does not expose CONTACT_TO_EMAIL to the client.
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail =
      process.env.CONTACT_FROM_EMAIL ?? 'NexusDigitalLabs <hello@nexusdigitallabs.dev>';

    if (!apiKey || !toEmail) {
      console.error('[/api/contact] Missing RESEND_API_KEY or CONTACT_TO_EMAIL');
      return NextResponse.json(
        { error: 'Contact form is temporarily unavailable.' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as ContactBody;

    // Honeypot: bots fill hidden fields; humans leave them blank.
    if (trimStr(body.website, 100)) {
      return NextResponse.json({ ok: true });
    }

    const name = trimStr(body.name, 120);
    const email = trimStr(body.email, 200);
    const subject = trimStr(body.subject, 200) || `Contact from ${name || 'website'}`;
    const message = trimStr(body.message, 5000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Please fill in your name, email, and message.' },
        { status: 400 }
      );
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Subject: ${subject}`,
        '',
        message,
      ].join('\n'),
    });

    if (error) {
      console.error('[/api/contact] Resend error', error);
      return NextResponse.json(
        { error: 'Could not send your message. Please try again later.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/contact POST]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
