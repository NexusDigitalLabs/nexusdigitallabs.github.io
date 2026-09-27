import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockFrom = vi.fn();
const mockRpc = vi.fn();
const mockGetUser = vi.fn();
const mockDeleteUser = vi.fn();

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    from: (...args: unknown[]) => mockFrom(...args),
    rpc: (...args: unknown[]) => mockRpc(...args),
    auth: { admin: { deleteUser: (...args: unknown[]) => mockDeleteUser(...args) } },
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
  chain.update = vi.fn(self);
  chain.order = vi.fn(() => Promise.resolve(result));
  chain.single = vi.fn(() => Promise.resolve(result));
  chain.maybeSingle = vi.fn(() => Promise.resolve(result));
  // terminal eq (delete) often ends without order
  chain.then = undefined;
  return chain;
}

// The route's in-memory rate limiter buckets by client IP and persists across
// tests in this file (it's module-level state, not reset per test). Give
// every request added below its own key via x-forwarded-for so a growing
// test suite never trips WRITE_RATE_MAX/READ_RATE_MAX on an unrelated test —
// mirrors api/contact's __tests__/route.test.ts, which does the same.
let clientKeyCounter = 0;
function uniqueClientHeaders(): HeadersInit {
  clientKeyCounter += 1;
  return { 'x-forwarded-for': `test-client-${clientKeyCounter}` };
}

/** For `.select('id', { count: 'exact', head: true }).eq(...)`, which resolves
 * directly off the final `.eq()` rather than `.single()`/`.maybeSingle()`. */
function countChain(count: number | null) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => Promise.resolve({ count, error: null }));
  return chain;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
  mockRpc.mockResolvedValue({ data: null, error: null });
  mockDeleteUser.mockResolvedValue({ data: {}, error: null });
  mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));
});

import { GET, POST, DELETE, PATCH } from '../route';

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

  it('returns 400 for resource=reminders when vehicleId is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=reminders');
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('returns reminders for a vehicle', async () => {
    const reminders = [{ id: 'r1', vehicle_id: 'v1', title: 'Oil change', due_type: 'date', due_date: '2026-12-01' }];
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      // 1st: claim-lock's ownerIdForCode maybeSingle → unclaimed
      // 2nd: vehicleBelongsToCode maybeSingle → found
      // 3rd: reminders list
      if (call === 1) return chainResolve({ data: null, error: null });
      if (call === 2) return chainResolve({ data: { id: 'v1' }, error: null });
      return chainResolve({ data: reminders, error: null });
    });

    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=reminders&vehicleId=v1');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toEqual(reminders);
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

  it('creates a first vehicle and returns it', async () => {
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
      // 1st: ownerIdForCode maybeSingle → null (unclaimed)
      // 2nd: vehicle count → 0 (no cap check needed for the 1st vehicle)
      // 3rd: insert
      if (call === 1) return chainResolve({ data: null, error: null });
      if (call === 2) return countChain(0);
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

  describe('free-tier vehicle cap', () => {
    function postVehicle(body: Record<string, unknown>) {
      return POST(
        new NextRequest('http://localhost/api/fuel', {
          method: 'POST',
          headers: uniqueClientHeaders(),
          body: JSON.stringify({
            resource: 'vehicle', code: 'test-abc1', make: 'Honda', model: 'Civic', ...body,
          }),
        })
      );
    }

    it('allows a 2nd vehicle for an anonymous garage that sends no RevenueCat id (old app version, fail open)', async () => {
      // No revenueCatAppUserId in the body at all — e.g. a pre-update app
      // build. Genuinely can't verify anything here, so this must not block,
      // by design (see hasProEntitlement's header comment): a version-skew
      // window is the tradeoff for never locking out a real payer on an old
      // build. What actually closes the anonymous-path gap is the app
      // sending a real id (always true once RevenueCat is configured
      // client-side, whether the caller is Pro or not) plus
      // REVENUECAT_SECRET_API_KEY being set server-side — see the tests
      // below for that path.
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: null, error: null }); // unclaimed
        if (call === 2) return countChain(1); // already has 1 vehicle
        return chainResolve({ data: { id: 'v2' }, error: null }); // insert
      });

      const res = await postVehicle({});
      expect(res.status).toBe(200);
    });

    it('allows a 2nd vehicle for a claimed garage with an active pro_entitlements row', async () => {
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: { user_id: 'user-1' }, error: null }); // claimed
        if (call === 2) return countChain(1);
        if (call === 3) return chainResolve({ data: { is_pro: true }, error: null }); // pro_entitlements
        return chainResolve({ data: { id: 'v2' }, error: null }); // insert
      });

      const res = await postVehicle({});
      expect(res.status).toBe(200);
    });

    it('blocks a 2nd vehicle for a claimed garage explicitly revoked in pro_entitlements', async () => {
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: { user_id: 'user-1' }, error: null });
        if (call === 2) return countChain(1);
        return chainResolve({ data: { is_pro: false }, error: null }); // explicitly revoked
      });

      const res = await postVehicle({});
      expect(res.status).toBe(403);
    });

    it('allows a 2nd vehicle for a claimed garage with no pro_entitlements row yet (ambiguous → fail open)', async () => {
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: { user_id: 'user-1' }, error: null });
        if (call === 2) return countChain(1);
        if (call === 3) return chainResolve({ data: null, error: null }); // no row
        return chainResolve({ data: { id: 'v2' }, error: null });
      });

      const res = await postVehicle({});
      expect(res.status).toBe(200);
    });

    it('allows an anonymous 2nd vehicle when REVENUECAT_SECRET_API_KEY is not configured (fail open)', async () => {
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: null, error: null });
        if (call === 2) return countChain(1);
        return chainResolve({ data: { id: 'v2' }, error: null });
      });

      const res = await postVehicle({ revenueCatAppUserId: '$RCAnonymousID:abc' });
      expect(res.status).toBe(200);
    });

    it('blocks an anonymous 2nd vehicle when RevenueCat reports no active entitlement', async () => {
      vi.stubEnv('REVENUECAT_SECRET_API_KEY', 'rc-secret-test');
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: null, error: null });
        return countChain(1);
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ subscriber: { entitlements: {} } }),
        })
      );

      const res = await postVehicle({ revenueCatAppUserId: '$RCAnonymousID:abc' });
      expect(res.status).toBe(403);
    });

    it('allows an anonymous 2nd vehicle when RevenueCat reports an active entitlement', async () => {
      vi.stubEnv('REVENUECAT_SECRET_API_KEY', 'rc-secret-test');
      let call = 0;
      mockFrom.mockImplementation(() => {
        call += 1;
        if (call === 1) return chainResolve({ data: null, error: null });
        if (call === 2) return countChain(1);
        return chainResolve({ data: { id: 'v2' }, error: null });
      });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ subscriber: { entitlements: { odova_pro: { expires_date: null } } } }),
        })
      );

      const res = await postVehicle({ revenueCatAppUserId: '$RCAnonymousID:abc' });
      expect(res.status).toBe(200);
    });
  });

  describe('resource=delete_account', () => {
    it('returns 401 when signed out', async () => {
      const req = new NextRequest('http://localhost/api/fuel', {
        method: 'POST',
        headers: uniqueClientHeaders(),
        body: JSON.stringify({ resource: 'delete_account' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it('deletes the signed-in user and returns success', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });

      const req = new NextRequest('http://localhost/api/fuel', {
        method: 'POST',
        headers: uniqueClientHeaders(),
        body: JSON.stringify({ resource: 'delete_account' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(mockDeleteUser).toHaveBeenCalledWith('user-1');
    });
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

describe('PATCH /api/fuel', () => {
  it('returns 400 when id or code is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'vehicle', code: 'test-abc1' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid resource', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'unknown', id: 'v1', code: 'test-abc1' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when the vehicle does not belong to the sync code', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'vehicle', id: 'v1', code: 'test-abc1', make: 'Toyota' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it('returns 400 when a vehicle patch has no fields to update', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'v1' }, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'vehicle', id: 'v1', code: 'test-abc1' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('updates a vehicle and returns it', async () => {
    const updated = { id: 'v1', make: 'Toyota', model: 'Camry', user_code: 'test-abc1' };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      // 1st: vehicleBelongsToCode maybeSingle → found
      // 2nd: update
      if (call === 1) return chainResolve({ data: { id: 'v1' }, error: null });
      return chainResolve({ data: updated, error: null });
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'vehicle', id: 'v1', code: 'test-abc1', make: 'Toyota', model: 'Camry' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.model).toBe('Camry');
  });

  it('rejects an empty make on a vehicle patch', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'v1' }, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'vehicle', id: 'v1', code: 'test-abc1', make: '  ' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });

  it('returns 404 when the fill does not belong to the sync code', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'fill', id: 'f1', code: 'test-abc1', litres: 40 }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it('updates a fill and returns it', async () => {
    const updated = { id: 'f1', vehicle_id: 'v1', litres: 42.5, odometer: 11230 };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainResolve({ data: { id: 'f1' }, error: null });
      return chainResolve({ data: updated, error: null });
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'fill', id: 'f1', code: 'test-abc1', litres: '42.5' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.litres).toBe(42.5);
  });

  it('rejects a non-numeric odometer on a fill patch', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'f1' }, error: null }));

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'PATCH',
      headers: uniqueClientHeaders(),
      body: JSON.stringify({ resource: 'fill', id: 'f1', code: 'test-abc1', odometer: 'not-a-number' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
  });
});

describe('resource=reminder', () => {
  function req(method: string, body: Record<string, unknown>) {
    return new NextRequest('http://localhost/api/fuel', {
      method,
      headers: uniqueClientHeaders(),
      body: JSON.stringify(body),
    });
  }

  it('POST returns 400 when title is missing', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'v1' }, error: null }));
    const res = await POST(
      req('POST', { resource: 'reminder', code: 'test-abc1', vehicleId: 'v1', dueType: 'date', dueDate: '2026-12-01' })
    );
    expect(res.status).toBe(400);
  });

  it('POST returns 400 for an invalid dueType', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'v1' }, error: null }));
    const res = await POST(
      req('POST', { resource: 'reminder', code: 'test-abc1', vehicleId: 'v1', title: 'Oil change', dueType: 'never' })
    );
    expect(res.status).toBe(400);
  });

  it('POST returns 400 when dueType=date has no dueDate', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: { id: 'v1' }, error: null }));
    const res = await POST(
      req('POST', { resource: 'reminder', code: 'test-abc1', vehicleId: 'v1', title: 'Oil change', dueType: 'date' })
    );
    expect(res.status).toBe(400);
  });

  it('POST creates a date-based reminder', async () => {
    const created = { id: 'r1', vehicle_id: 'v1', title: 'Oil change', due_type: 'date', due_date: '2026-12-01' };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainResolve({ data: { id: 'v1' }, error: null }); // vehicleBelongsToCode
      return chainResolve({ data: created, error: null }); // insert
    });

    const res = await POST(
      req('POST', {
        resource: 'reminder', code: 'test-abc1', vehicleId: 'v1', title: 'Oil change',
        dueType: 'date', dueDate: '2026-12-01',
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.title).toBe('Oil change');
  });

  it('POST creates a recurring odometer-based reminder', async () => {
    const created = {
      id: 'r2', vehicle_id: 'v1', title: 'Tyre rotation', due_type: 'odometer',
      due_odometer: 15000, recurrence_interval_km: 10000,
    };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainResolve({ data: { id: 'v1' }, error: null });
      return chainResolve({ data: created, error: null });
    });

    const res = await POST(
      req('POST', {
        resource: 'reminder', code: 'test-abc1', vehicleId: 'v1', title: 'Tyre rotation',
        dueType: 'odometer', dueOdometer: '15000', recurrenceIntervalKm: '10000',
      })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.recurrence_interval_km).toBe(10000);
  });

  it('PATCH returns 404 when the reminder does not belong to the sync code', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));
    const res = await PATCH(req('PATCH', { resource: 'reminder', id: 'r1', code: 'test-abc1', title: 'New title' }));
    expect(res.status).toBe(404);
  });

  it('PATCH marks a reminder complete', async () => {
    const updated = { id: 'r1', title: 'Oil change', completed_at: '2026-09-27T00:00:00.000Z' };
    let call = 0;
    mockFrom.mockImplementation(() => {
      call += 1;
      if (call === 1) return chainResolve({ data: { id: 'r1' }, error: null }); // reminderBelongsToCode
      return chainResolve({ data: updated, error: null }); // update
    });

    const res = await PATCH(
      req('PATCH', { resource: 'reminder', id: 'r1', code: 'test-abc1', completedAt: '2026-09-27T00:00:00.000Z' })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.completed_at).toBe('2026-09-27T00:00:00.000Z');
  });

  it('DELETE returns 404 when the reminder does not belong to the sync code', async () => {
    mockFrom.mockImplementation(() => chainResolve({ data: null, error: null }));
    const res = await DELETE(req('DELETE', { resource: 'reminder', id: 'r1', code: 'test-abc1' }));
    expect(res.status).toBe(404);
  });

  it('DELETE removes a reminder', async () => {
    const ownership = chainResolve({ data: { id: 'r1' }, error: null });
    const del = chainResolve({ data: null, error: null });
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

    const res = await DELETE(req('DELETE', { resource: 'reminder', id: 'r1', code: 'test-abc1' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
