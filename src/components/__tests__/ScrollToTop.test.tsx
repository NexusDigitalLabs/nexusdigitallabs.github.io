import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from '@/components/ScrollToTop';

const pathname = vi.fn(() => '/about/');

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}));

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.scrollTo = vi.fn();
  });

  it('scrolls to the top when the pathname changes', () => {
    const { rerender } = render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalled();

    pathname.mockReturnValue('/tools/fuel-tracker/');
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );
  });
});
