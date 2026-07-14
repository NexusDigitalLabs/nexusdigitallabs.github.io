import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Header from '../Header';

// Header uses usePathname from next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

import { usePathname } from 'next/navigation';
const mockPathname = usePathname as ReturnType<typeof vi.fn>;

describe('Header — structure', () => {
  it('renders the NexusDigitalLabs logo text', () => {
    render(<Header />);
    expect(screen.getByText('NexusDigitalLabs')).toBeInTheDocument();
  });

  it('renders all 5 nav links', () => {
    render(<Header />);
    expect(screen.getAllByRole('link', { name: /tools/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /articles/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /games/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /about/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /contact/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('logo links to /', () => {
    render(<Header />);
    const logoLink = screen.getAllByRole('link').find(
      (el) => el.getAttribute('href') === '/',
    );
    expect(logoLink).toBeDefined();
  });

  it('renders the hamburger menu button', () => {
    render(<Header />);
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });
});

describe('Header — mobile menu', () => {
  it('opens mobile drawer when hamburger is clicked', () => {
    render(<Header />);
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn);
    // After opening, button label changes to "Close menu"
    expect(screen.getByRole('button', { name: /close menu/i })).toBeInTheDocument();
  });

  it('shows nav links in mobile drawer after opening', () => {
    render(<Header />);
    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    // Mobile nav links appear in drawer
    const allGameLinks = screen.getAllByRole('link', { name: /games/i });
    expect(allGameLinks.length).toBeGreaterThan(1); // desktop + mobile
  });

  it('closes mobile drawer when hamburger is clicked again', () => {
    render(<Header />);
    const menuBtn = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(menuBtn); // open
    fireEvent.click(screen.getByRole('button', { name: /close menu/i })); // close
    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });
});

describe('Header — active state badge', () => {
  it('shows "Prompt Architect" badge on the prompt architect page', () => {
    mockPathname.mockReturnValue('/tools/prompt-architect/');
    render(<Header />);
    expect(screen.getByText('Prompt Architect')).toBeInTheDocument();
  });

  it('shows "Invoice Generator" badge on the invoice page', () => {
    mockPathname.mockReturnValue('/tools/invoice-generator/');
    render(<Header />);
    expect(screen.getByText('Invoice Generator')).toBeInTheDocument();
  });

  it('shows no badge on the homepage', () => {
    mockPathname.mockReturnValue('/');
    render(<Header />);
    expect(screen.queryByText(/prompt architect/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invoice generator/i)).not.toBeInTheDocument();
  });
});

describe('Header — snapshot', () => {
  it('matches snapshot on homepage', () => {
    mockPathname.mockReturnValue('/');
    const { container } = render(<Header />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
