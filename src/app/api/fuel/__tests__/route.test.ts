import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}));

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseAuthClient: async () => ({
    auth: { getUser: mockGetUser },
  }),
}));

function chainResolve(result: { data?: unknown; error?: unknown }) {
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn(self);
  chain.insert = vi.fn(self);
  chain.delete = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.not = vi.fn(self);
  chain.limit = vi.fn(self);
  chain.order = vi.fn(() => Promise.resolve(result));
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  // terminal eq (delete) often ends without order
  chain.then = undefined;
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  mockRpc.mockResolvedValue({ data: null, error: null });
  mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));
});

import { GET, POST, DELETE } from '../route';

describe('GET /api/fuel', () => {
  it('returns 400 when code is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel?resource=vehicles');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing code/i);
  });

  it('returns 400 for invalid resource', async () => {
    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=unknown');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid resource/i);
  });

  it('returns vehicle list for resource=vehicles', async () => {
    const vehicles = [{ id: 'v1', make: 'Toyota', model: 'Corolla', user_code: 'test-abc1' }];
    mockFrom.mockImplementation(() => chainResolve({ data: vehicles, error: null }));

    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=vehicles');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual(vehicles);
  });

  it('returns 400 for resource=fills when vehicleId is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=fills');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns claim_status for a sync code', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockFrom.mockImplementation(() =>
      chainResolve({ data: { user_id: 'user-1' }, error: null })
    );

    const req = new NextRequest(
      'http://localhost/api/fuel?code=test-abc1&resource=claim_status'
    );
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({
      claimed: true,
      is_owner: true,
      signed_in: true,
    });
    expect(json).not.toHaveProperty('owner_id');
  });

  it('returns 401 for resource=account when signed out', async () => {
    const req = new NextRequest('http://localhost/api/fuel?resource=account');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns account garage and sync code when signed in', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    const vehicles = [
      { id: 'v1', make: 'Toyota', model: 'Corolla', user_code: 'garage-ab12', user_id: 'user-1' },
      { id: 'v2', make: 'Honda', model: 'Civic', user_code: 'garage-ab12', user_id: 'user-1' },
    ];
    mockFrom.mockImplementation(() => chainResolve({ data: vehicles, error: null }));

    const req = new NextRequest('http://localhost/api/fuel?resource=account');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.code).toBe('garage-ab12');
    expect(json.data).toHaveLength(2);
  });
});

describe('POST /api/fuel', () => {
  it('returns 400 when code is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({ resource: 'vehicle' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid resource', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({ resource: 'unknown', code: 'test-abc1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid resource/i);
  });

  it('creates a vehicle and returns it', async () => {
    const created = {
      id: 'v1',
      make: 'Toyota',
      model: 'Corolla',
      year: 2020,
      fuel_type: 'petrol',
      user_code: 'test-abc1',
    };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      // 1st: ownerIdForCode maybeSingle → null
      // 2nd: insert
      if (call === 1) return chainResolve({ data: null, error: null });
      return chainResolve({ data: created, error: null });
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({
        resource: 'vehicle',
        code: 'test-abc1',
        make: 'Toyota',
        model: 'Corolla',
        year: '2020',
        fuelType: 'petrol',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.make).toBe('Toyota');
  });

  it('creates a fill-up and returns it', async () => {
    const created = {
      id: 'f1',
      vehicle_id: 'v1',
      odometer: 10500,
      litres: 35,
      price_per_litre: 2.1,
    };
    mockFrom.mockImplementation(() => chainResolve({ data: created, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({
        resource: 'fill',
        code: 'test-abc1',
        vehicleId: 'v1',
        fillDate: '2026-01-15',
        odometer: '10500',
        litres: '35',
        pricePerLitre: '2.10',
        isPartial: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.litres).toBe(35);
  });

  it('returns 401 when claiming without a session', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({ resource: 'claim', code: 'test-abc1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('claims a garage for the signed-in user', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: { ok: true, vehicles_updated: 2 },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({ resource: 'claim', code: 'test-abc1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.vehicles_updated).toBe(2);
    expect(mockRpc).toHaveBeenCalledWith('claim_fuel_garage', {
      p_user_code: 'test-abc1',
      p_user_id: 'user-1',
    });
  });

  it('returns 409 when garage is claimed by another account', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: { ok: false, error: 'already_claimed' },
      error: null,
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({ resource: 'claim', code: 'test-abc1' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/fuel', () => {
  it('returns 400 for invalid resource', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'unknown' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('rejects fill delete without sync code', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'fill', id: 'f1' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('deletes a fill only when it belongs to the sync code', async () => {
    const ownership = chainResolve({ data: { id: 'f1' }, error: null });
    const del = chainResolve({ data: null, error: null });
    del.eq = vi.fn(() => del);
    // Terminal delete: last .eq should resolve
    let eqCount = 0;
    del.eq = vi.fn(() => {
      eqCount += 1;
      if (eqCount >= 2) return Promise.resolve({ error: null });
      return del;
    });

    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      return call === 1 ? ownership : del;
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'fill', id: 'f1', code: 'test-abc1' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('returns 404 when fill does not belong to sync code', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'fill', id: 'f1', code: 'test-abc1' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(404);
  });

  it('deletes all user data by code and returns success', async () => {
    const c = chainResolve({ data: null, error: null });
    c.eq = vi.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockImplementation(() => c);

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'user', code: 'test-abc1' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
