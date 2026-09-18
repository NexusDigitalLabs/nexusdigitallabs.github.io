import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FuelTrackerClient from '../FuelTrackerClient';

const useAuthMock = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({}),
}));

vi.mock('@/lib/profile', () => ({
  updateOwnPreferredCurrency: vi.fn().mockResolvedValue({ profile: null }),
}));

const signedOutAuth = {
  user: null,
  session: null,
  profile: null,
  loading: false,
  signOut: vi.fn(),
  setProfile: vi.fn(),
};

const signedInAuth = {
  user: { id: 'user-1' },
  session: null,
  profile: null,
  loading: false,
  signOut: vi.fn(),
  setProfile: vi.fn(),
};

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

type FetchHandler = (url: string, init?: RequestInit) => Response | Promise<Response> | undefined;

function mockFetchRouter(handlers: FetchHandler[]) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    for (const handler of handlers) {
      const result = await handler(url, init);
      if (result) return result;
    }
    return jsonResponse({ data: [] });
  });
  global.fetch = fetchMock;
  return fetchMock;
}

// Clear localStorage before each test so the component always starts fresh
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  useAuthMock.mockReturnValue(signedOutAuth);
  // Default: no fetch needed for no-code path (component goes to onboarding without fetching)
  global.fetch = vi.fn(() => new Promise(() => {})); // unresolved by default
});

// ── Onboarding screen ──────────────────────────────────────────────────────────

describe('FuelTrackerClient — onboarding screen', () => {
  it('renders the onboarding UI (Start Fresh mode)', async () => {
    render(<FuelTrackerClient />);
    // The component starts in 'loading', transitions to 'onboarding' via useEffect
    await waitFor(() => {
      expect(screen.getByText('Start Fresh')).toBeInTheDocument();
    });
  });

  it('shows "I Have a Code" toggle button', async () => {
    render(<FuelTrackerClient />);
    await waitFor(() => {
      expect(screen.getByText('I Have a Code')).toBeInTheDocument();
    });
  });

  it('shows the Fuel Tracker title in onboarding', async () => {
    render(<FuelTrackerClient />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /fuel tracker/i })).toBeInTheDocument();
    });
  });

  it('shows an error when "Create My Garage" is clicked without a nickname', async () => {
    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByRole('button', { name: /create my garage/i }));
    await user.click(screen.getByRole('button', { name: /create my garage/i }));

    expect(screen.getByText(/enter a nickname/i)).toBeInTheDocument();
  });

  it('shows a warning when @ is typed in the nickname field', async () => {
    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByPlaceholderText(/MyGarage/i));
    await user.type(screen.getByPlaceholderText(/MyGarage/i), 'user@email.com');

    expect(screen.getByText(/avoid using your email/i)).toBeInTheDocument();
  });
});

// ── "I Have a Code" flow ───────────────────────────────────────────────────────

describe('FuelTrackerClient — "I Have a Code" flow', () => {
  it('switches to the existing code input when "I Have a Code" is clicked', async () => {
    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByText('I Have a Code'));
    await user.click(screen.getByText('I Have a Code'));

    expect(screen.getByRole('button', { name: /load my data/i })).toBeInTheDocument();
  });

  it('shows "Enter your sync code" error when Load My Data is clicked with no input', async () => {
    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByText('I Have a Code'));
    await user.click(screen.getByText('I Have a Code'));
    await user.click(screen.getByRole('button', { name: /load my data/i }));

    expect(screen.getByText(/enter your sync code/i)).toBeInTheDocument();
  });

  it('shows "No garage found" error for an invalid code (API returns empty array)', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as Response);

    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByText('I Have a Code'));
    await user.click(screen.getByText('I Have a Code'));

    const codeInput = screen.getByPlaceholderText(/MyGarage-7X4P/i);
    await user.type(codeInput, 'wrongname-zzzz');
    await user.click(screen.getByRole('button', { name: /load my data/i }));

    await waitFor(() => {
      expect(screen.getByText(/no garage found/i)).toBeInTheDocument();
    });
  });

  it('shows "Could not connect" error when fetch throws a network error', async () => {
    // "Could not connect" only appears when fetch() itself rejects (catch block in handleExistingCode)
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByText('I Have a Code'));
    await user.click(screen.getByText('I Have a Code'));

    const codeInput = screen.getByPlaceholderText(/MyGarage-7X4P/i);
    await user.type(codeInput, 'test-abcd');
    await user.click(screen.getByRole('button', { name: /load my data/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not connect/i)).toBeInTheDocument();
    });
  });

  it('normalises submitted code to lowercase', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as Response);
    global.fetch = fetchMock;

    const user = userEvent.setup();
    render(<FuelTrackerClient />);

    await waitFor(() => screen.getByText('I Have a Code'));
    await user.click(screen.getByText('I Have a Code'));

    await user.type(screen.getByPlaceholderText(/MyGarage-7X4P/i), 'MYGARAGE-AB3X');
    await user.click(screen.getByRole('button', { name: /load my data/i }));

    await waitFor(() => {
      const calls = fetchMock.mock.calls as unknown[][];
      const codeCall = calls.find((c) =>
        typeof c[0] === 'string' && (c[0] as string).includes('mygarage-ab3x'),
      );
      expect(codeCall).toBeDefined();
    });
  });
});

// ── Loading state ──────────────────────────────────────────────────────────────

describe('FuelTrackerClient — loading state', () => {
  it('renders without crashing while in the loading skeleton state', () => {
    // Fetch never resolves — component stays in loading state
    global.fetch = vi.fn(() => new Promise(() => {}));
    // Simulate a stored code so init useEffect calls fetchVehicles (and hangs in loading)
    localStorage.setItem('ndl_fuel_code', 'testuser-abcd');
    render(<FuelTrackerClient />);
    expect(document.body).toBeTruthy();
  });
});

// ── Signed-in account restore + auto-claim ─────────────────────────────────────

describe('FuelTrackerClient — signed-in restore & auto-claim', () => {
  const vehicle = {
    id: 'v1',
    make: 'Toyota',
    model: 'Prius',
    year: 2020,
    fuel_type: 'Hybrid',
    nickname: 'Daily',
    user_code: 'mygarage-ab12',
    user_id: null as string | null,
  };

  it('shows "No linked garage" when signed in with no account garage and no local code', async () => {
    useAuthMock.mockReturnValue(signedInAuth);
    mockFetchRouter([
      (url) => {
        if (url.includes('resource=account')) {
          return jsonResponse({ data: [], code: null });
        }
      },
    ]);

    render(<FuelTrackerClient />);

    await waitFor(() => {
      expect(screen.getByText(/no linked garage found on this account/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /create my garage/i })).toBeInTheDocument();
  });

  it('restores a linked account garage without needing a local sync code', async () => {
    useAuthMock.mockReturnValue(signedInAuth);
    const linked = { ...vehicle, user_id: 'user-1' };
    mockFetchRouter([
      (url) => {
        if (url.includes('resource=account')) {
          return jsonResponse({ data: [linked], code: 'mygarage-ab12' });
        }
        if (url.includes('resource=fills')) {
          return jsonResponse({ data: [] });
        }
        if (url.includes('resource=claim_status')) {
          return jsonResponse({ claimed: true, is_owner: true, signed_in: true });
        }
      },
    ]);

    render(<FuelTrackerClient />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Daily/ })).toBeInTheDocument();
    });
    expect(localStorage.getItem('ndl_fuel_code')).toBe('mygarage-ab12');
    expect(localStorage.getItem('ndl_fuel_auth_lock')).toBe('mygarage-ab12');
  });

  it('auto-claims an unclaimed local garage when signed in', async () => {
    useAuthMock.mockReturnValue(signedInAuth);
    localStorage.setItem('ndl_fuel_code', 'mygarage-ab12');

    const fetchMock = mockFetchRouter([
      (url) => {
        if (url.includes('resource=account')) {
          return jsonResponse({ data: [], code: null });
        }
        if (url.includes('resource=vehicles')) {
          return jsonResponse({ data: [vehicle] });
        }
        if (url.includes('resource=fills')) {
          return jsonResponse({ data: [] });
        }
        if (url.includes('resource=claim_status')) {
          return jsonResponse({ claimed: false, is_owner: false, signed_in: true });
        }
      },
      (_url, init) => {
        if (init?.method === 'POST') {
          const body = JSON.parse(String(init.body)) as { resource?: string; code?: string };
          if (body.resource === 'claim' && body.code === 'mygarage-ab12') {
            return jsonResponse({ success: true, vehicles_updated: 1 });
          }
        }
      },
    ]);

    render(<FuelTrackerClient />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Daily/ })).toBeInTheDocument();
    });

    await waitFor(() => {
      const claimPost = fetchMock.mock.calls.find((call) => {
        const init = call[1] as RequestInit | undefined;
        if (init?.method !== 'POST') return false;
        try {
          const body = JSON.parse(String(init.body)) as { resource?: string };
          return body.resource === 'claim';
        } catch {
          return false;
        }
      });
      expect(claimPost).toBeDefined();
    });

    await waitFor(() => {
      expect(localStorage.getItem('ndl_fuel_auth_lock')).toBe('mygarage-ab12');
    });
  });

  it('does not set auth lock for an unclaimed garage when signed out', async () => {
    useAuthMock.mockReturnValue(signedOutAuth);
    localStorage.setItem('ndl_fuel_code', 'mygarage-ab12');

    mockFetchRouter([
      (url) => {
        if (url.includes('resource=vehicles')) {
          return jsonResponse({ data: [vehicle] });
        }
        if (url.includes('resource=fills')) {
          return jsonResponse({ data: [] });
        }
        if (url.includes('resource=claim_status')) {
          return jsonResponse({ claimed: false, is_owner: false, signed_in: false });
        }
      },
    ]);

    render(<FuelTrackerClient />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Daily/ })).toBeInTheDocument();
    });
    expect(localStorage.getItem('ndl_fuel_auth_lock')).toBeNull();
    expect(screen.queryByRole('dialog', { name: /sign in to unlock your garage/i })).not.toBeInTheDocument();
  });

  it('requires sign-in when a linked garage is opened while signed out', async () => {
    useAuthMock.mockReturnValue(signedOutAuth);
    localStorage.setItem('ndl_fuel_code', 'mygarage-ab12');

    mockFetchRouter([
      (url) => {
        if (url.includes('resource=vehicles')) {
          // Server-enforced lock (route.ts): claimed garage, no matching session
          // → withheld data, signalled explicitly via `locked`.
          return jsonResponse({ data: [], locked: true });
        }
      },
    ]);

    render(<FuelTrackerClient />);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /sign in to unlock your garage/i })).toBeInTheDocument();
    });
    expect(localStorage.getItem('ndl_fuel_auth_lock')).toBe('mygarage-ab12');
    expect(screen.queryByRole('button', { name: /Daily/ })).not.toBeInTheDocument();
  });
});
