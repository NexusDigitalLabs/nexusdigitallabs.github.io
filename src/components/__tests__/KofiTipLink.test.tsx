import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import KofiTipLink from '../KofiTipLink';

const HREF = 'https://ko-fi.com/nexusdigitallabs';

describe('KofiTipLink — floating', () => {
  it('renders the persistent tip jar link', () => {
    render(<KofiTipLink variant="floating" href={HREF} />);
    const link = screen.getByRole('link', { name: /buy me a coffee/i });
    expect(link).toHaveAttribute('href', HREF);
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('has no dismiss control', () => {
    render(<KofiTipLink variant="floating" href={HREF} />);
    expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
  });

  it('uses accent styling with rounded corners', () => {
    render(<KofiTipLink variant="floating" href={HREF} />);
    const link = screen.getByRole('link', { name: /buy me a coffee/i });
    expect(link.style.borderRadius).toBe('12px');
    expect(link.style.background).toContain('var(--ndl-accent)');
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
