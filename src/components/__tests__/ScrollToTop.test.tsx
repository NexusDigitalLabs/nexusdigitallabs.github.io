import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import ScrollToTop from '@/components/ScrollToTop';
import { HOME_SECTION_INTENT_KEY } from '@/lib/scroll';

const pathname = vi.fn(() => '/about/');

vi.mock('next/navigation', () => ({
  usePathname: () => pathname(),
}));

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    window.scrollTo = vi.fn();
    sessionStorage.clear();
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('scrolls to the top when the pathname changes without a hash', () => {
    const { rerender } = render(<ScrollToTop />);
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );

    pathname.mockReturnValue('/tools/fuel-tracker/');
    rerender(<ScrollToTop />);

    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );
  });

  it('scrolls to the matching section when a hash is present on home', () => {
    const el = document.createElement('section');
    el.id = 'tools';
    el.scrollIntoView = vi.fn();
    document.body.appendChild(el);
    window.history.replaceState(null, '', '/#tools');

    pathname.mockReturnValue('/');
    render(<ScrollToTop />);
    vi.runAllTimers();

    expect(el.scrollIntoView).toHaveBeenCalled();
    el.remove();
  });

  it('prefers section intent over a stale #tools hash', () => {
    const tools = document.createElement('section');
    tools.id = 'tools';
    tools.scrollIntoView = vi.fn();
    const articles = document.createElement('section');
    articles.id = 'articles';
    articles.scrollIntoView = vi.fn();
    document.body.append(tools, articles);

    window.history.replaceState(null, '', '/#tools');
    sessionStorage.setItem(HOME_SECTION_INTENT_KEY, 'articles');

    pathname.mockReturnValue('/');
    render(<ScrollToTop />);
    vi.runAllTimers();

    expect(articles.scrollIntoView).toHaveBeenCalled();
    expect(tools.scrollIntoView).not.toHaveBeenCalled();
    expect(window.location.hash).toBe('#articles');

    tools.remove();
    articles.remove();
  });

  it('clears a stale hash when top intent is set', () => {
    window.history.replaceState(null, '', '/#tools');
    sessionStorage.setItem(HOME_SECTION_INTENT_KEY, '__top__');

    pathname.mockReturnValue('/');
    render(<ScrollToTop />);

    expect(window.location.hash).toBe('');
    expect(window.scrollTo).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );
  });
});
