import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUpsert = vi.fn();
const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({ from: mockFrom }),
}));

import { POST } from '../route';

const SECRET = 'test-webhook-secret';
const VALID_USER_ID = '11111111-1111-1111-1111-111111111111';

function makeReq(body: unknown, authHeader = `Bearer ${SECRET}`) {
  return new NextRequest('http://localhost/api/revenuecat-webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(authHeader ? { Authorization: authHeader } : {}) },
    body: JSON.stringify(body),
  });
}

describe('POST /api/revenuecat-webhook', () => {
  const env = process.env;

  beforeEach(() => {
    process.env = { ...env, REVENUECAT_WEBHOOK_SECRET: SECRET };
    mockFrom.mockClear();
    mockUpsert.mockReset();
    mockUpsert.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    process.env = env;
  });

  it('returns 500 when the webhook secret is not configured', async () => {
    delete process.env.REVENUECAT_WEBHOOK_SECRET;
    const res = await POST(makeReq({ event: { type: 'INITIAL_PURCHASE', app_user_id: VALID_USER_ID } }));
    expect(res.status).toBe(500);
  });

  it('rejects a missing or wrong Authorization header', async () => {
    const res = await POST(
      makeReq({ event: { type: 'INITIAL_PURCHASE', app_user_id: VALID_USER_ID } }, 'Bearer wrong')
    );
    expect(res.status).toBe(401);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new NextRequest('http://localhost/api/revenuecat-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SECRET}` },
      body: '{not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when event.type or app_user_id is missing', async () => {
    const res = await POST(makeReq({ event: { type: 'INITIAL_PURCHASE' } }));
    expect(res.status).toBe(400);
  });

  it('skips (200, no write) a non-account (non-UUID) app_user_id', async () => {
    const res = await POST(
      makeReq({ event: { type: 'INITIAL_PURCHASE', app_user_id: '$RCAnonymousID:abc123' } })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, skipped: 'non-account app_user_id' });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('grants entitlement on INITIAL_PURCHASE', async () => {
    const res = await POST(
      makeReq({ event: { type: 'INITIAL_PURCHASE', app_user_id: VALID_USER_ID, product_id: 'odova_pro_unlock' } })
    );
    expect(res.status).toBe(200);
    expect(mockFrom).toHaveBeenCalledWith('pro_entitlements');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: VALID_USER_ID, is_pro: true, product_id: 'odova_pro_unlock' }),
      { onConflict: 'user_id' }
    );
  });

  it('grants entitlement on NON_RENEWING_PURCHASE (the actual Odova product type)', async () => {
    const res = await POST(
      makeReq({ event: { type: 'NON_RENEWING_PURCHASE', app_user_id: VALID_USER_ID } })
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ is_pro: true }), expect.anything());
  });

  it('revokes entitlement on CANCELLATION', async () => {
    const res = await POST(makeReq({ event: { type: 'CANCELLATION', app_user_id: VALID_USER_ID } }));
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ is_pro: false }), expect.anything());
  });

  it('handles TRANSFER by revoking the old owner and granting the new one', async () => {
    const oldId = '22222222-2222-2222-2222-222222222222';
    const res = await POST(
      makeReq({
        event: {
          type: 'TRANSFER',
          app_user_id: VALID_USER_ID,
          transferred_from: [oldId],
          transferred_to: [VALID_USER_ID],
        },
      })
    );
    expect(res.status).toBe(200);
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: oldId, is_pro: false }), expect.anything());
    expect(mockUpsert).toHaveBeenCalledWith(expect.objectContaining({ user_id: VALID_USER_ID, is_pro: true }), expect.anything());
  });

  it('accepts an unhandled event.type as a no-op', async () => {
    const res = await POST(makeReq({ event: { type: 'BILLING_ISSUE', app_user_id: VALID_USER_ID } }));
    expect(res.status).toBe(200);
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it('returns 500 when the Supabase write fails', async () => {
    mockUpsert.mockResolvedValue({ error: { message: 'boom' } });
    const res = await POST(makeReq({ event: { type: 'INITIAL_PURCHASE', app_user_id: VALID_USER_ID } }));
    expect(res.status).toBe(500);
  });
});
