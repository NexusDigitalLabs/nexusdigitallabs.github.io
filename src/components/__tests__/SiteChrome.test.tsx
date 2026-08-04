import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SiteChrome from '../SiteChrome';

const usePathnameMock = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('@/components/Header', () => ({
  default: () => <header data-testid="site-header">Header</header>,
}));

vi.mock('@/components/Footer', () => ({
  default: () => <footer data-testid="site-footer">Footer</footer>,
}));

vi.mock('@/components/ThemeToggle', () => ({
  default: () => <button type="button">Toggle theme</button>,
}));

beforeEach(() => {
  usePathnameMock.mockReturnValue('/');
});

describe('SiteChrome', () => {
  it('renders header and footer on public routes', () => {
    render(
      <SiteChrome>
        <div>Page</div>
      </SiteChrome>,
    );
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('site-footer')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('hides header and footer on /p/ routes but keeps theme toggle', () => {
    usePathnameMock.mockReturnValue('/p/portfolio/');
    render(
      <SiteChrome>
        <div>Portfolio</div>
      </SiteChrome>,
    );
    expect(screen.queryByTestId('site-header')).not.toBeInTheDocument();
    expect(screen.queryByTestId('site-footer')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /toggle theme/i })).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });
});
