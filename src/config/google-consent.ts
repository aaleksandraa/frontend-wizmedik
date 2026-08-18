import type { CookieConsentPreferences } from '@/lib/cookie-consent';

export type GoogleConsentState = {
  analytics_storage: 'granted' | 'denied';
  functionality_storage: 'granted' | 'denied';
  ad_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
};

export const GOOGLE_CONSENT_DEFAULT: GoogleConsentState & {
  personalization_storage: 'denied';
  security_storage: 'granted';
  wait_for_update: number;
  ads_data_redaction: boolean;
} = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
  ads_data_redaction: true,
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function mapPreferencesToGoogleConsent(
  preferences: Pick<CookieConsentPreferences, 'functional' | 'analytics' | 'marketing'>,
): GoogleConsentState {
  return {
    analytics_storage: preferences.analytics ? 'granted' : 'denied',
    functionality_storage: preferences.functional ? 'granted' : 'denied',
    ad_storage: preferences.marketing ? 'granted' : 'denied',
    ad_user_data: preferences.marketing ? 'granted' : 'denied',
    ad_personalization: preferences.marketing ? 'granted' : 'denied',
  };
}

export function isGtagAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

export function updateGoogleConsent(
  preferences: Pick<CookieConsentPreferences, 'functional' | 'analytics' | 'marketing'>,
): void {
  if (!isGtagAvailable()) {
    return;
  }

  window.gtag?.('consent', 'update', mapPreferencesToGoogleConsent(preferences));
}

export function denyGoogleAnalyticsStorage(): void {
  if (!isGtagAvailable()) {
    return;
  }

  window.gtag?.('consent', 'update', {
    analytics_storage: 'denied',
  });
}
