import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AuthGate from '@/components/AuthGate';

const useAuthMock = vi.fn();

vi.mock('@/components/AuthProvider', () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => '/account/',
}));

describe('AuthGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows a loading skeleton while auth is resolving', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: true,
      session: null,
      profile: null,
      signOut: vi.fn(),
      setProfile: vi.fn(),
    });

    render(
      <AuthGate>
        <p>Secret panel</p>
      </AuthGate>
    );

    expect(screen.getByLabelText(/checking sign-in/i)).toBeInTheDocument();
    expect(screen.queryByText('Secret panel')).not.toBeInTheDocument();
  });

  it('renders children when signed in', () => {
    useAuthMock.mockReturnValue({
      user: { id: 'u1' },
      loading: false,
      session: null,
      profile: null,
      signOut: vi.fn(),
      setProfile: vi.fn(),
    });

    render(
      <AuthGate>
        <p>Secret panel</p>
      </AuthGate>
    );

    expect(screen.getByText('Secret panel')).toBeInTheDocument();
  });

  it('blocks with sign-in CTA when signed out', () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      session: null,
      profile: null,
      signOut: vi.fn(),
      setProfile: vi.fn(),
    });

    render(
      <AuthGate
        variant="page"
        title="Sign in to unlock your garage"
        description="Your fuel history is still saved."
        next="/tools/fuel-tracker/"
      >
        <p>Secret panel</p>
      </AuthGate>
    );

    expect(screen.getByRole('dialog', { name: /sign in to unlock your garage/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /sign in to continue/i });
    expect(link.getAttribute('href')).toMatch(
      /^\/login\/?\?next=%2Ftools%2Ffuel-tracker%2F$/
    );
    expect(screen.queryByText('Secret panel')).not.toBeInTheDocument();
  });
});
