// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
  applyCookieConsentSideEffects,
  createCookieConsentRecord,
  DEFAULT_COOKIE_PREFERENCES,
} from '@/lib/cookie-consent';

describe('cookie consent side effects', () => {
  beforeEach(() => {
    delete (window as Record<string, unknown>)['ga-disable-G-TEST12345'];
  });

  it('does not set ga-disable flags when analytics consent is absent', () => {
    const record = createCookieConsentRecord(DEFAULT_COOKIE_PREFERENCES, 'rejected_optional', 'banner');

    applyCookieConsentSideEffects(record);

    expect((window as Record<string, unknown>)['ga-disable-G-TEST12345']).toBeUndefined();
  });
});
