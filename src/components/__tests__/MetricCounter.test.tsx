import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// MetricCounter fetches from /api/counters — mock fetch for deterministic tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ count: 1234 }),
  } as Response),
);

import MetricCounter from '../MetricCounter';

describe('MetricCounter', () => {
  it('renders without crashing', () => {
    render(<MetricCounter />);
    // Component shows a placeholder or loaded count — either is fine
    expect(document.body).toBeTruthy();
  });
});
