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

  it('renders the color theme radiogroup inside the mobile menu', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('radiogroup', { name: /color theme/i })).toBeInTheDocument();
  });

  it('renders a Sign in link when logged out', async () => {
    renderHeader();
    const link = await screen.findByRole('link', { name: /sign in/i });
    expect(link.getAttribute('href')).toMatch(/^\/login\/?$/);
  });
});

describe('Header — theme toggle', () => {
  it('exposes Light, Dark, and System options in the mobile menu', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('radio', { name: /light/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /dark/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /system/i })).toBeInTheDocument();
  });

  it('switches to light theme when Light is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    fireEvent.click(screen.getByRole('radio', { name: /^light$/i }));
    expect(screen.getByRole('radio', { name: /^light$/i })).toHaveAttribute('aria-checked', 'true');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('switches to dark theme when Dark is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
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

  it('is a modal side panel that hides from assistive tech when closed', () => {
    renderHeader();
    expect(screen.queryByRole('dialog', { name: /menu/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(screen.getByRole('dialog', { name: /menu/i })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: /open menu/i })).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes on Escape and unlocks page scroll', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: /menu/i })).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe('');
  });

  it('closes when the backdrop is tapped', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    const backdrop = screen.getByRole('dialog', { name: /menu/i }).previousElementSibling as HTMLElement;
    fireEvent.click(backdrop);
    expect(screen.queryByRole('dialog', { name: /menu/i })).not.toBeInTheDocument();
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

describe('Header — active nav item', () => {
  const current = () =>
    screen.queryAllByRole('link').concat(screen.queryAllByRole('button')).filter((el) => el.getAttribute('aria-current') === 'page');

  it('marks FreelanceOS active on its page and hides the duplicate badge', () => {
    mockPathname.mockReturnValue('/freelanceos/');
    renderHeader();
    expect(current().map((el) => el.textContent)).toEqual(['FreelanceOS']);
    // No context badge repeating it outside the navigation.
    expect(screen.getAllByText('FreelanceOS').filter((el) => !el.closest('nav'))).toHaveLength(0);
  });

  it('marks the section active on sub-pages and keeps the tool badge', () => {
    mockPathname.mockReturnValue('/tools/invoice-generator/');
    renderHeader();
    expect(current().map((el) => el.textContent)).toEqual(['Tools']);
    expect(screen.getByText('Invoice Generator')).toBeInTheDocument();
  });

  it('marks nothing active on the homepage', () => {
    mockPathname.mockReturnValue('/');
    renderHeader();
    expect(current()).toHaveLength(0);
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
