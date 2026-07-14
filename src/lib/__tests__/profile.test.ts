import { describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { ensureProfile, updateOwnPreferredCurrency } from '@/lib/profile';

function mockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'ada@example.com',
    user_metadata: { full_name: 'Ada Lovelace', avatar_url: 'https://example.com/a.png' },
    identities: [],
    app_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    ...overrides,
  } as User;
}

describe('ensureProfile', () => {
  it('inserts a profile when none exists', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const existingSelect = vi.fn(() => ({ eq: () => ({ maybeSingle }) }));

    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'ada@example.com',
        display_name: 'Ada Lovelace',
        avatar_url: 'https://example.com/a.png',
        preferred_currency: 'USD',
      },
      error: null,
    });
    const insertSelect = vi.fn(() => ({ single }));
    const insert = vi.fn(() => ({ select: insertSelect }));

    const from = vi.fn((table: string) => {
      expect(table).toBe('profiles');
      return { select: existingSelect, insert };
    });

    const result = await ensureProfile({ from } as never, mockUser());

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        display_name: 'Ada Lovelace',
        preferred_currency: 'USD',
      })
    );
    expect(result.error).toBeNull();
    expect(result.profile?.display_name).toBe('Ada Lovelace');
  });

  it('updates email/avatar but preserves an existing display_name', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'old@example.com',
        display_name: 'Custom Name',
        avatar_url: 'https://example.com/old.png',
        preferred_currency: 'LKR',
      },
      error: null,
    });
    const existingSelect = vi.fn(() => ({ eq: () => ({ maybeSingle }) }));

    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'ada@example.com',
        display_name: 'Custom Name',
        avatar_url: 'https://example.com/a.png',
        preferred_currency: 'LKR',
      },
      error: null,
    });
    const updateSelect = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select: updateSelect }));
    const update = vi.fn(() => ({ eq }));

    const from = vi.fn(() => ({ select: existingSelect, update }));

    const result = await ensureProfile({ from } as never, mockUser());

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'ada@example.com',
        avatar_url: 'https://example.com/a.png',
      })
    );
    expect(update.mock.calls[0][0]).not.toHaveProperty('display_name');
    expect(result.profile?.display_name).toBe('Custom Name');
    expect(result.profile?.preferred_currency).toBe('LKR');
  });
});

describe('updateOwnPreferredCurrency', () => {
  it('stores a normalized currency preference', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'ada@example.com',
        display_name: 'Ada',
        avatar_url: null,
        preferred_currency: 'LKR',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    const result = await updateOwnPreferredCurrency({ from } as never, 'user-1', 'LKR');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ preferred_currency: 'LKR' })
    );
    expect(result.error).toBeNull();
    expect(result.profile?.preferred_currency).toBe('LKR');
  });

  it('falls back to USD for unknown codes', async () => {
    const single = vi.fn().mockResolvedValue({
      data: {
        id: 'user-1',
        email: 'ada@example.com',
        display_name: 'Ada',
        avatar_url: null,
        preferred_currency: 'USD',
      },
      error: null,
    });
    const select = vi.fn(() => ({ single }));
    const eq = vi.fn(() => ({ select }));
    const update = vi.fn(() => ({ eq }));
    const from = vi.fn(() => ({ update }));

    await updateOwnPreferredCurrency({ from } as never, 'user-1', 'NOT_A_CODE');

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ preferred_currency: 'USD' })
    );
  });
});
