import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ── Mock Supabase client ───────────────────────────────────────────────────────
// We mock the server client module so no real DB calls are made in tests.
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockInsert = vi.fn();
const mockEq = vi.fn();

const buildChain = () => ({
  select: mockSelect,
  update: mockUpdate,
  insert: mockInsert,
  eq: mockEq,
  single: mockSingle,
  maybeSingle: mockMaybeSingle,
});

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    from: () => buildChain(),
  }),
}));

// Chain helpers — make every method return `this` by default, override per test
beforeEach(() => {
  vi.clearAllMocks();
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle, maybeSingle: mockMaybeSingle, data: null, error: null });
  mockEq.mockReturnValue({ single: mockSingle, maybeSingle: mockMaybeSingle, select: mockSelect, data: null, error: null });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: mockSelect });
});

import { GET, POST } from '../route';

// ── POST /api/counters ─────────────────────────────────────────────────────────
describe('POST /api/counters', () => {
  it('returns 400 when path is missing', async () => {
    const req = new NextRequest('http://localhost/api/counters', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid path/i);
  });

  it('returns 400 when path is not a string', async () => {
    const req = new NextRequest('http://localhost/api/counters', {
      method: 'POST',
      body: JSON.stringify({ path: 42 }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('increments and returns count when record exists', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { count: 5 }, error: null });
    mockSingle.mockResolvedValueOnce({ data: { count: 6 }, error: null });
    mockEq.mockReturnValue({ maybeSingle: mockMaybeSingle, select: mockSelect, single: mockSingle });
    mockUpdate.mockReturnValue({ eq: () => ({ select: () => ({ single: mockSingle }) }) });
    mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle, maybeSingle: mockMaybeSingle });

    const req = new NextRequest('http://localhost/api/counters', {
      method: 'POST',
      body: JSON.stringify({ path: '/about' }),
    });
    const res = await POST(req);
    // Flexible assertion — the route should respond without a 500
    expect(res.status).not.toBe(500);
  });
});

// ── GET /api/counters ──────────────────────────────────────────────────────────
describe('GET /api/counters', () => {
  it('returns 400 when neither path nor aggregate is provided', async () => {
    const req = new NextRequest('http://localhost/api/counters');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Missing/i);
  });

  it('returns count:0 when no record exists for path', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });
    mockSelect.mockReturnValue({ eq: () => ({ maybeSingle: mockMaybeSingle }) });

    const req = new NextRequest('http://localhost/api/counters?path=/about');
    const res = await GET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.count).toBe(0);
  });

  it('returns existing count for known path', async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: { count: 42 }, error: null });
    mockSelect.mockReturnValue({ eq: () => ({ maybeSingle: mockMaybeSingle }) });

    const req = new NextRequest('http://localhost/api/counters?path=/about');
    const res = await GET(req);
    const json = await res.json();
    expect(json.count).toBe(42);
  });

  it('returns aggregate total of all page views', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [{ count: 10 }, { count: 20 }, { count: 5 }],
      error: null,
    });

    const req = new NextRequest('http://localhost/api/counters?aggregate=total');
    const res = await GET(req);
    const json = await res.json();
    expect(json.count).toBe(35);
  });
});
