import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ───────────────────────────────────────────────────────
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    from: () => ({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    }),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  // Default chain: every call returns an object with the full chain
  const chain: Record<string, unknown> = {};
  const self = () => chain;
  chain.select = vi.fn(self);
  chain.insert = vi.fn(self);
  chain.delete = vi.fn(self);
  chain.eq = vi.fn(self);
  chain.order = vi.fn(self);
  chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
  chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
});

import { GET, POST, DELETE } from '../route';

// ── GET /api/fuel ──────────────────────────────────────────────────────────────
describe('GET /api/fuel', () => {
  it('returns 400 when code is missing', async () => {
    const req = new NextRequest('http://localhost/api/fuel?resource=vehicles');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing code/i);
  });

  it('returns 400 for invalid resource', async () => {
    mockSelect.mockReturnValue({
      eq: () => ({ order: () => ({ data: [], error: null }) }),
    });
    const req = new NextRequest('http://localhost/api/fuel?code=test-abc1&resource=unknown');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid resource/i);
  });

  it('returns vehicle list for resource=vehicles', async () => {
    const vehicles = [{ id: 'v1', make: 'Toyota', model: 'Corolla', user_code: 'test-abc1' }];
    mockSelect.mockReturnValue({
      eq: () => ({ order: () => Promise.resolve({ data: vehicles, error: null }) }),
    });

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
});

// ── POST /api/fuel ─────────────────────────────────────────────────────────────
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
    const created = { id: 'v1', make: 'Toyota', model: 'Corolla', year: 2020, fuel_type: 'petrol', user_code: 'test-abc1' };
    mockInsert.mockReturnValue({
      select: () => ({ single: () => Promise.resolve({ data: created, error: null }) }),
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({
        resource: 'vehicle',
        code: 'test-abc1',
        make: 'Toyota', model: 'Corolla', year: '2020', fuelType: 'petrol',
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.make).toBe('Toyota');
  });

  it('creates a fill-up and returns it', async () => {
    const created = { id: 'f1', vehicle_id: 'v1', odometer: 10500, litres: 35, price_per_litre: 2.10 };
    mockInsert.mockReturnValue({
      select: () => ({ single: () => Promise.resolve({ data: created, error: null }) }),
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'POST',
      body: JSON.stringify({
        resource: 'fill', code: 'test-abc1', vehicleId: 'v1',
        fillDate: '2026-01-15', odometer: '10500', litres: '35',
        pricePerLitre: '2.10', isPartial: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.litres).toBe(35);
  });
});

// ── DELETE /api/fuel ───────────────────────────────────────────────────────────
describe('DELETE /api/fuel', () => {
  it('returns 400 for invalid resource', async () => {
    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'unknown' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(400);
  });

  it('deletes a fill and returns success', async () => {
    mockDelete.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    const req = new NextRequest('http://localhost/api/fuel', {
      method: 'DELETE',
      body: JSON.stringify({ resource: 'fill', id: 'f1' }),
    });
    const res = await DELETE(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('deletes all user data by code and returns success', async () => {
    mockDelete.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

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
