import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FuelTrackerClient from '../FuelTrackerClient';

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    profile: null,
    loading: false,
    signOut: vi.fn(),
    setProfile: vi.fn(),
  }),
}));

// Clear localStorage before each test so the component always starts fresh
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
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
