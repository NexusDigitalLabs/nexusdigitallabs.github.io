import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredConsent, setConsent, reapplyStoredConsent, CONSENT_CHANGED_EVENT,
} from '../consent';

function dataLayer(): unknown[] {
  return (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
}

describe('consent', () => {
  beforeEach(() => {
    window.localStorage.clear();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer = [];
  });

  describe('getStoredConsent', () => {
    it('returns null when nothing is stored', () => {
      expect(getStoredConsent()).toBeNull();
    });

    it('returns the stored value', () => {
      window.localStorage.setItem('ndl_ad_consent', 'granted');
      expect(getStoredConsent()).toBe('granted');
    });

    it('returns null for a corrupted/unexpected stored value', () => {
      window.localStorage.setItem('ndl_ad_consent', 'yes-please');
      expect(getStoredConsent()).toBeNull();
    });
  });

  describe('setConsent', () => {
    it('persists the choice to localStorage', () => {
      setConsent('granted');
      expect(getStoredConsent()).toBe('granted');
    });

    it('pushes a gtag consent update in the arguments-array shape', () => {
      setConsent('denied');
      const last = dataLayer().at(-1) as unknown[];
      expect(last[0]).toBe('consent');
      expect(last[1]).toBe('update');
      expect(last[2]).toEqual({
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
      });
    });

    it('dispatches CONSENT_CHANGED_EVENT with the new state', () => {
      const handler = vi.fn();
      window.addEventListener(CONSENT_CHANGED_EVENT, handler);
      setConsent('granted');
      expect(handler).toHaveBeenCalledTimes(1);
      expect((handler.mock.calls[0][0] as CustomEvent).detail).toBe('granted');
      window.removeEventListener(CONSENT_CHANGED_EVENT, handler);
    });
  });

  describe('reapplyStoredConsent', () => {
    it('returns null and pushes nothing when no choice was ever stored', () => {
      const result = reapplyStoredConsent();
      expect(result).toBeNull();
      expect(dataLayer()).toHaveLength(0);
    });

    it('re-pushes a previously stored choice and returns it', () => {
      window.localStorage.setItem('ndl_ad_consent', 'granted');
      const result = reapplyStoredConsent();
      expect(result).toBe('granted');
      const last = dataLayer().at(-1) as unknown[];
      expect(last[2]).toMatchObject({ ad_storage: 'granted' });
    });
  });
});
