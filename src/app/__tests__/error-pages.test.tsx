import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NotFound from '../not-found';
import ErrorPage from '../error';

describe('NotFound', () => {
  it('explains the problem and links to the main sections', () => {
    render(<NotFound />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/couldn’t find that page/i);
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => (a.getAttribute('href') ?? '').replace(/\/$/, ''));
    for (const href of ['/#tools', '/articles', '/games', '/academy', '']) {
      expect(hrefs, href || '/').toContain(href);
    }
  });
});

describe('ErrorPage', () => {
  it('offers a retry without showing the raw error', () => {
    const reset = vi.fn();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    render(<ErrorPage error={new Error('PrismaClientKnownRequestError: secret detail')} reset={reset} />);

    expect(screen.queryByText(/secret detail/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
