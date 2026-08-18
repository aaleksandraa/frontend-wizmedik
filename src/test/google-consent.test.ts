// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  mapPreferencesToGoogleConsent,
  updateGoogleConsent,
} from '@/config/google-consent';

describe('google consent mode', () => {
  beforeEach(() => {
    window.gtag = vi.fn();
  });

  it('maps banner preferences to Consent Mode v2 signals', () => {
    expect(
      mapPreferencesToGoogleConsent({
        functional: true,
        analytics: false,
        marketing: true,
      }),
    ).toEqual({
      analytics_storage: 'denied',
      functionality_storage: 'granted',
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    });
  });

  it('updates gtag consent when preferences are saved', () => {
    updateGoogleConsent({
      functional: false,
      analytics: true,
      marketing: false,
    });

    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
      functionality_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  });

  it('no-ops when gtag is unavailable', () => {
    delete window.gtag;

    updateGoogleConsent({
      functional: true,
      analytics: true,
      marketing: true,
    });

    expect(window.gtag).toBeUndefined();
  });
});
