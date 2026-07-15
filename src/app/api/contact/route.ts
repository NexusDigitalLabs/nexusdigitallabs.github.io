import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Soft in-memory rate limit (per serverless instance). */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

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

function clientKey(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

/**
 * POST /api/contact
 * Sends a contact enquiry via Resend. Does not expose CONTACT_TO_EMAIL to the client.
 */
export async function POST(request: NextRequest) {
  try {
    if (rateLimited(clientKey(request))) {
      return NextResponse.json(
        { error: 'Too many messages. Please wait a minute and try again.' },
        { status: 429 }
      );
    }

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
