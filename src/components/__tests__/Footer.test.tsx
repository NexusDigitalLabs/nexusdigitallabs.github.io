import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// MetricCounter fetches from /api/counters — mock fetch so Footer renders cleanly
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ count: 9999 }),
  } as Response),
);

import Footer from '../Footer';

describe('Footer — structure', () => {
  it('renders the NexusDigitalLabs brand name', () => {
    render(<Footer />);
    expect(screen.getByText('NexusDigitalLabs')).toBeInTheDocument();
  });

  it('renders the "Company" column with About, Contact, Privacy Policy, Terms of Use', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /terms of use/i })).toBeInTheDocument();
  });

  it('renders the "Tools" column with core and new developer tools', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /prompt architect/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /json engine/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /svg studio/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /env formatter/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /prompt packager/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /invoice generator/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /debt optimizer/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /fuel tracker/i })).toBeInTheDocument();
  });

  it('renders the "Games" column with all game links', () => {
    render(<Footer />);
    expect(screen.getByRole('link', { name: /all games/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^2048$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /snake/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blackjack/i })).toBeInTheDocument();
  });

  it('renders the privacy tagline', () => {
    render(<Footer />);
    expect(screen.getByText(/privacy-first · optional accounts/i)).toBeInTheDocument();
  });

  it('renders the copyright notice with current year', () => {
    render(<Footer />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it('all tool links point to correct /tools/... paths', () => {
    render(<Footer />);
    const promptLink = screen.getByRole('link', { name: /prompt architect/i });
    // Next.js Link may drop trailing slashes in jsdom — match either form
    expect(promptLink.getAttribute('href')).toMatch(/\/tools\/prompt-architect\/?$/);
    const invoiceLink = screen.getByRole('link', { name: /invoice generator/i });
    expect(invoiceLink.getAttribute('href')).toMatch(/\/tools\/invoice-generator\/?$/);
  });

  it('no GitHub links are present', () => {
    render(<Footer />);
    const links = screen.getAllByRole('link');
    const githubLinks = links.filter((el) =>
      el.getAttribute('href')?.includes('github'),
    );
    expect(githubLinks.length).toBe(0);
  });
});

describe('Footer — snapshot', () => {
  it('matches snapshot', () => {
    const { container } = render(<Footer />);
    expect(container.firstChild).toMatchSnapshot();
  });
});
