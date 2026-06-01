import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  event: vi.fn(),
}));

vi.mock('react-ga4', () => ({
  default: {
    initialize: vi.fn(),
    send: vi.fn(),
    event: mocks.event,
    set: vi.fn(),
  },
}));

vi.mock('@/lib/cookie-consent', () => ({
  hasConsentFor: vi.fn(),
}));

vi.mock('@/config/clarity', () => ({
  setClarityTag: vi.fn(),
  setClarityTags: vi.fn(),
  trackClarityEvent: vi.fn(),
}));

import { hasConsentFor } from '@/lib/cookie-consent';
import {
  __analyticsTest,
  trackContactClick,
  trackGaEvent,
  trackProfileView,
} from '@/config/analytics';

const hasConsentForMock = vi.mocked(hasConsentFor);

describe('analytics GA4 service', () => {
  beforeEach(() => {
    mocks.event.mockClear();
    hasConsentForMock.mockReturnValue(true);
    __analyticsTest.reset();
    __analyticsTest.setInitialized(true);
  });

  it('does not send events without analytics consent', () => {
    hasConsentForMock.mockReturnValue(false);

    trackGaEvent('phone_click', { entity_type: 'doctor' });

    expect(mocks.event).not.toHaveBeenCalled();
  });

  it('sends sanitized GA4 event names and params', () => {
    trackGaEvent('doctor profile view!', {
      doctor_name: 'Dr. Test',
      empty: '',
      nil: null,
      very_long_value: 'a'.repeat(140),
    });

    expect(mocks.event).toHaveBeenCalledWith('doctor_profile_view_', {
      doctor_name: 'Dr. Test',
      very_long_value: 'a'.repeat(100),
    });
  });

  it('does not send phone or email PII for contact clicks', () => {
    trackContactClick('phone', {
      entity_type: 'doctor',
      entity_id: 10,
      entity_name: 'Dr. Privacy',
      city: 'Sarajevo',
    });

    expect(mocks.event).toHaveBeenCalledWith(
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

    expect(mocks.event).toHaveBeenCalledTimes(1);
    expect(mocks.event).toHaveBeenCalledWith('doctor_profile_view', expect.objectContaining({
      doctor_id: 99,
      doctor_name: 'Dr. Once',
      city: 'Tuzla',
      specialization: 'Kardiologija',
    }));
  });
});
