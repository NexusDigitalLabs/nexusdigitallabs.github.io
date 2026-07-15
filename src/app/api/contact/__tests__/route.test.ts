import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '../route';

const sendMock = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

function makeReq(body: unknown, ip = '127.0.0.1') {
  return new NextRequest('http://localhost/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/contact', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = {
      ...env,
      RESEND_API_KEY: 're_test',
      CONTACT_TO_EMAIL: 'inbox@example.com',
      CONTACT_FROM_EMAIL: 'Hello <hello@nexusdigitallabs.dev>',
    };
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: 'msg_1' }, error: null });
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns 503 when env is missing', async () => {
    delete process.env.RESEND_API_KEY;
    const res = await POST(makeReq({ name: 'A', email: 'a@b.co', message: 'Hi' }, '10.0.0.1'));
    expect(res.status).toBe(503);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await POST(makeReq({ name: '', email: 'a@b.co', message: 'Hi' }, '10.0.0.2'));
    expect(res.status).toBe(400);
  });

  it('returns ok and skips send when honeypot is filled', async () => {
    const res = await POST(
      makeReq({ name: 'Bot', email: 'bot@b.co', message: 'spam', website: 'http://spam' }, '10.0.0.3')
    );
    expect(res.status).toBe(200);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('sends via Resend with replyTo set to the visitor', async () => {
    const res = await POST(
      makeReq(
        {
          name: 'Dilan',
          email: 'visitor@example.com',
          subject: 'Hello',
          message: 'Need a tool',
        },
        '10.0.0.4'
      )
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ['inbox@example.com'],
        replyTo: 'visitor@example.com',
        subject: 'Hello',
      })
    );
  });

  it('returns 502 when Resend fails', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'boom' } });
    const res = await POST(
      makeReq({ name: 'Dilan', email: 'visitor@example.com', message: 'Need a tool' }, '10.0.0.5')
    );
    expect(res.status).toBe(502);
  });

  it('returns 429 when rate limit is exceeded', async () => {
    const body = {
      name: 'Dilan',
      email: 'visitor@example.com',
      message: 'Need a tool',
    };
    let lastStatus = 0;
    for (let i = 0; i < 6; i += 1) {
      const res = await POST(makeReq(body, '10.0.0.99'));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
