import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import KofiTipLink from '../KofiTipLink';
import { setConsent } from '@/lib/consent';

const HREF = 'https://ko-fi.com/nexusdigitallabs';
const usePathnameMock = vi.fn(() => '/');

vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

beforeEach(() => {
  usePathnameMock.mockReturnValue('/');
  window.localStorage.clear();
});

describe('KofiTipLink — floating', () => {
  // The floating widget and the cookie consent banner both pin to the
  // bottom-right on mobile — it stays hidden until a consent choice has
  // been made so the two never overlap. Most tests below pre-grant consent
  // to exercise the widget's own rendering; the last two cover the gating
  // itself.
  it('renders the persistent tip jar link once consent is resolved', () => {
    setConsent('granted');
    render(<KofiTipLink variant="floating" href={HREF} />);
    const link = screen.getByRole('link', { name: /buy me a coffee/i });
    expect(link).toHaveAttribute('href', HREF);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has no dismiss control', () => {
    setConsent('granted');
    render(<KofiTipLink variant="floating" href={HREF} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('uses accent styling with rounded corners', () => {
    setConsent('granted');
    render(<KofiTipLink variant="floating" href={HREF} />);
    const link = screen.getByRole('link', { name: /buy me a coffee/i });
    expect(link.style.borderRadius).toBe('12px');
    expect(link.style.background).toContain('var(--ndl-accent)');
  });

  it('hides on private portfolio routes under /p/', () => {
    setConsent('granted');
    usePathnameMock.mockReturnValue('/p/portfolio/');
    render(<KofiTipLink variant="floating" href={HREF} />);
    expect(screen.queryByRole('link', { name: /buy me a coffee/i })).not.toBeInTheDocument();
  });

  it('stays hidden while the consent banner has not been answered yet', () => {
    render(<KofiTipLink variant="floating" href={HREF} />);
    expect(screen.queryByRole('link', { name: /buy me a coffee/i })).not.toBeInTheDocument();
  });

  it('appears live, without remounting, once consent is granted', () => {
    render(<KofiTipLink variant="floating" href={HREF} />);
    expect(screen.queryByRole('link', { name: /buy me a coffee/i })).not.toBeInTheDocument();

    act(() => setConsent('granted'));

    expect(screen.getByRole('link', { name: /buy me a coffee/i })).toBeInTheDocument();
  });
});

describe('KofiTipLink — inline', () => {
  it('renders button variant with href prop', () => {
    render(<KofiTipLink href={HREF} />);
    expect(screen.getByRole('link', { name: /buy me a coffee/i })).toHaveAttribute('href', HREF);
  });

  it('renders card variant', () => {
    render(<KofiTipLink variant="card" href={HREF} />);
    expect(screen.getByRole('link', { name: /buy me a coffee/i })).toHaveAttribute('href', HREF);
  });
});
