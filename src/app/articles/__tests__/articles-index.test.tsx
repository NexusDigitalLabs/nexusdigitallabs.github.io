import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ArticlesIndexPage from '../page';

// Next.js Link renders an <a> tag in test environments
// No extra mocking needed for static server components.

describe('Articles index page', () => {
  it('renders the page heading', () => {
    render(<ArticlesIndexPage />);
    expect(screen.getByRole('heading', { name: /articles/i, level: 1 })).toBeInTheDocument();
  });

  it('renders at least 12 article entries', () => {
    render(<ArticlesIndexPage />);
    const links = screen.getAllByText(/read article/i);
    expect(links.length).toBeGreaterThanOrEqual(12);
  });

  it('contains the fuel tracker article', () => {
    render(<ArticlesIndexPage />);
    expect(screen.getByText(/track your car/i)).toBeInTheDocument();
  });

  it('contains the debt optimizer article', () => {
    render(<ArticlesIndexPage />);
    expect(screen.getByText(/avalanche vs snowball/i)).toBeInTheDocument();
  });

  it('contains the blackjack strategy article', () => {
    render(<ArticlesIndexPage />);
    expect(screen.getByText(/blackjack basic strategy/i)).toBeInTheDocument();
  });

  it('all article links point to /articles/.../ paths', () => {
    render(<ArticlesIndexPage />);
    const articleLinks = screen.getAllByRole('link').filter(
      (el) => el.getAttribute('href')?.startsWith('/articles/'),
    );
    expect(articleLinks.length).toBeGreaterThanOrEqual(12);
  });
});
