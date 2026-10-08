import '@testing-library/jest-dom';

// jsdom does not implement matchMedia — used by ThemeProvider / system theme.
// Guarded so files opting into `@vitest-environment node` can share this setup.
if (typeof window !== 'undefined') Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: query.includes('dark'),
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
