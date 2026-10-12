import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import OdovaAppPrompt from '../OdovaAppPrompt';

describe('OdovaAppPrompt', () => {
  it('renders nothing when no feature is requested', () => {
    const { container } = render(<OdovaAppPrompt feature={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('explains the vehicles limit and links to the Play listing with a campaign tag', () => {
    render(<OdovaAppPrompt feature="vehicles" onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/more vehicles/i);
    const link = screen.getByRole('link', { name: /get it on google play/i });
    expect(link.getAttribute('href')).toContain('id=dev.nexusdigitallabs.odova');
    expect(link.getAttribute('href')).toContain('fuel_tracker_vehicles');
  });

  it('explains CSV export and tags the install source separately', () => {
    render(<OdovaAppPrompt feature="export" onClose={() => {}} />);
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/csv export/i);
    expect(screen.getByRole('link', { name: /google play/i }).getAttribute('href')).toContain('fuel_tracker_export');
  });

  it('closes from the button and the Escape key', () => {
    const onClose = vi.fn();
    render(<OdovaAppPrompt feature="vehicles" onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /not now/i }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
