import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AndroidAppBanner from '../AndroidAppBanner';

describe('AndroidAppBanner', () => {
  it('links to the Odova Play listing with an attribution referrer', () => {
    render(<AndroidAppBanner />);
    const link = screen.getByRole('link', { name: /get it on google play/i });
    const href = link.getAttribute('href') ?? '';
    expect(href).toContain('id=dev.nexusdigitallabs.odova');
    expect(href).toContain('utm_campaign%3Dfuel_tracker');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
