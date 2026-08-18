// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  gtag: vi.fn(),
}));

vi.mock('@/config/google-consent', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/config/google-consent')>();
  return {
    ...actual,
    isGtagAvailable: vi.fn(() => true),
  };
});

vi.mock('@/config/clarity', () => ({
  setClarityTag: vi.fn(),
  setClarityTags: vi.fn(),
  trackClarityEvent: vi.fn(),
}));

import { isGtagAvailable } from '@/config/google-consent';
import {
  __analyticsTest,
  trackContactClick,
  trackGaEvent,
  trackPageView,
  trackProfileView,
} from '@/config/analytics';

const isGtagAvailableMock = vi.mocked(isGtagAvailable);

describe('analytics GA4 service', () => {
  beforeEach(() => {
    mocks.gtag.mockClear();
    window.gtag = mocks.gtag;
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST12345');
    vi.stubEnv('VITE_GA_DEBUG', 'true');
    vi.stubEnv('MODE', 'production');
    isGtagAvailableMock.mockReturnValue(true);
    __analyticsTest.reset();
  });

  it('sends GA4 events even without analytics cookie consent when gtag is available', () => {
    trackGaEvent('phone_click', { entity_type: 'doctor' });

    expect(mocks.gtag).toHaveBeenCalledWith('event', 'phone_click', {
      entity_type: 'doctor',
    });
  });

  it('sends sanitized GA4 event names and params', () => {
    trackGaEvent('doctor profile view!', {
      doctor_name: 'Dr. Test',
      empty: '',
      nil: null,
      very_long_value: 'a'.repeat(140),
    });

    expect(mocks.gtag).toHaveBeenCalledWith('event', 'doctor_profile_view_', {
      doctor_name: 'Dr. Test',
      very_long_value: 'a'.repeat(100),
    });
  });

  it('does not send events when gtag is unavailable', () => {
    isGtagAvailableMock.mockReturnValue(false);

    trackGaEvent('phone_click', { entity_type: 'doctor' });

    expect(mocks.gtag).not.toHaveBeenCalled();
  });

  it('sends page views through gtag page_view event', () => {
    trackPageView('/doktori', 'Doktori');

    expect(mocks.gtag).toHaveBeenCalledWith(
      'event',
      'page_view',
      expect.objectContaining({
        page_path: '/doktori',
        page_title: 'Doktori',
      }),
    );
  });

  it('does not send phone or email PII for contact clicks', () => {
    trackContactClick('phone', {
      entity_type: 'doctor',
      entity_id: 10,
      entity_name: 'Dr. Privacy',
      city: 'Sarajevo',
    });

    expect(mocks.gtag).toHaveBeenCalledWith(
      'event',
      'phone_click',
      expect.not.objectContaining({
        phone_number: expect.anything(),
        phone: expect.anything(),
        email: expect.anything(),
        link_url: expect.anything(),
      }),
    );
  });

  it('deduplicates profile views per entity and event', () => {
    const entity = {
      entity_type: 'doctor' as const,
      entity_id: 99,
      entity_name: 'Dr. Once',
      doctor_id: 99,
      doctor_name: 'Dr. Once',
      city: 'Tuzla',
      specialization: 'Kardiologija',
    };

    trackProfileView(entity);
    trackProfileView(entity);

    expect(mocks.gtag).toHaveBeenCalledTimes(1);
    expect(mocks.gtag).toHaveBeenCalledWith('event', 'doctor_profile_view', expect.objectContaining({
      doctor_id: 99,
      doctor_name: 'Dr. Once',
      city: 'Tuzla',
      specialization: 'Kardiologija',
    }));
  });
});
