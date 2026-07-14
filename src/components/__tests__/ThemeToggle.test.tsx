import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import ThemeToggle from '../ThemeToggle';
import { THEME_STORAGE_KEY } from '@/lib/theme';

function ThemeProbe() {
  const { theme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="pref">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('throws when useTheme is used outside a provider', () => {
    expect(() => render(<ThemeProbe />)).toThrow(/ThemeProvider/);
  });

  it('defaults to system preference and applies a resolved theme', async () => {
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId('pref').textContent).toBe('system');
    expect(['light', 'dark']).toContain(screen.getByTestId('resolved').textContent);
    expect(['light', 'dark']).toContain(document.documentElement.getAttribute('data-theme'));
  });

  it('persists an explicit theme choice', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <ThemeProbe />
      </ThemeProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('radio', { name: /^light$/i }));

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(screen.getByTestId('pref').textContent).toBe('light');
    expect(screen.getByTestId('resolved').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders Light, Dark, and System radios', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    expect(screen.getByRole('radiogroup', { name: /color theme/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^light$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^dark$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^system$/i })).toBeInTheDocument();
  });

  it('shows labels when showLabels is true', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showLabels />
      </ThemeProvider>,
    );

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('marks the selected theme as aria-checked', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );

    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('radio', { name: /^dark$/i }));
    expect(screen.getByRole('radio', { name: /^dark$/i })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: /^light$/i })).toHaveAttribute('aria-checked', 'false');
  });
});
