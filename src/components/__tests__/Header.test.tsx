import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';
import { ThemeProvider } from '../ThemeProvider';
import { AuthProvider } from '../AuthProvider';

// Header uses usePathname from next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserSupabaseClient: () => ({
    auth: {
      getSession: async () => ({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
      signOut: async () => ({ error: null }),
    },
  }),
}));

import { usePathname } from 'next/navigation';
const mockPathname = usePathname as ReturnType<typeof vi.fn>;

function renderHeader() {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </ThemeProvider>,
  );
}

describe('Header — structure', () => {
  it('renders the NexusDigitalLabs logo text', () => {
    renderHeader();
    expect(screen.getByText('NexusDigitalLabs')).toBeInTheDocument();
  });

  it('renders all 5 nav items', () => {
    renderHeader();
    expect(screen.getAllByRole('button', { name: /^tools$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /^articles$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('button', { name: /^games$/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('logo links to /', () => {
    renderHeader();
    const logoLink = screen.getAllByRole('link').find(
      (el) => el.getAttribute('href') === '/',
    );
    expect(logoLink).toBeDefined();
  });

  it('renders the hamburger menu button', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('renders the color theme radiogroup', () => {
    renderHeader();
    expect(screen.getByRole('radiogroup', { name: /color theme/i })).toBeInTheDocument();
  });

  it('renders a Sign in link when logged out', async () => {
    renderHeader();
    const link = await screen.findByRole('link', { name: /sign in/i });
    expect(link.getAttribute('href')).toMatch(/^\/login\/?$/);
  });
});

describe('Header — theme toggle', () => {
  it('exposes Light, Dark, and System options', () => {
    renderHeader();
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
  });

  it('switches to light theme when Light is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('radio', { name: /^light$/i }));
    expect(screen.getByRole('radio', { name: /^light$/i })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to dark theme when Dark is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('radio', { name: /^dark$/i }));
    expect(screen.getByRole('radio', { name: /^dark$/i })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});

describe('Header — mobile menu', () => {
  it('opens mobile drawer when hamburger is clicked', () => {
    renderHeader();
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
  });

  it('shows nav items in mobile drawer after opening', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getAllByRole('button', { name: /^games$/i }).length).toBeGreaterThan(1);
  });

  it('shows theme section in mobile drawer', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByText(/^theme$/i)).toBeInTheDocument();
  });

  it('closes mobile drawer when hamburger is clicked again', () => {
    renderHeader();
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);
    fireEvent.click(screen.getByRole('button', { name: /close menu/i }));
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });
});

describe('Header — active state badge', () => {
  it('shows "Prompt Architect" badge on the prompt architect page', () => {
    mockPathname.mockReturnValue('/tools/prompt-architect/');
    renderHeader();
    expect(screen.getByText('Prompt Architect')).toBeInTheDocument();
  });

  it('shows "Invoice Generator" badge on the invoice page', () => {
    mockPathname.mockReturnValue('/tools/invoice-generator/');
    renderHeader();
    expect(screen.getByText('Invoice Generator')).toBeInTheDocument();
  });

  it('shows no badge on the homepage', () => {
    mockPathname.mockReturnValue('/');
    renderHeader();
    expect(screen.queryByText(/prompt architect/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invoice generator/i)).not.toBeInTheDocument();
  });
});

describe('Header — snapshot', () => {
  it('matches snapshot on homepage', async () => {
    mockPathname.mockReturnValue('/');
    const { container } = renderHeader();
    await screen.findByRole('link', { name: /sign in/i });
    expect(container.firstChild).toMatchSnapshot();
  });
});
