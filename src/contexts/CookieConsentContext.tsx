import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { legalAPI } from '@/services/api';
import {
  ACCEPT_ALL_COOKIE_PREFERENCES,
  CookieConsentPreferences,
  CookieConsentRecord,
  COOKIE_CONSENT_UPDATED_EVENT,
  DEFAULT_COOKIE_PREFERENCES,
  applyCookieConsentSideEffects,
  createCookieConsentRecord,
  readCookieConsentRecord,
  saveCookieConsentRecord,
  shouldHardReloadAfterConsentChange,
} from '@/lib/cookie-consent';
import { disableGA, initGA } from '@/config/analytics';
import { disableSentry, initSentry } from '@/config/sentry';

interface CookieBannerSettings {
  enabled: boolean;
  text: string;
  accept_button: string;
  reject_button: string;
}

interface CookieConsentContextValue {
  consentRecord: CookieConsentRecord | null;
  preferences: CookieConsentPreferences;
  settings: CookieBannerSettings;
  loadingSettings: boolean;
  hasDecision: boolean;
  isPreferencesOpen: boolean;
  setPreferencesOpen: (open: boolean) => void;
  openPreferences: () => void;
  acceptAll: (source?: CookieConsentRecord['source']) => boolean;
  rejectOptional: (source?: CookieConsentRecord['source']) => boolean;
  savePreferences: (preferences: CookieConsentPreferences, source?: CookieConsentRecord['source']) => boolean;
}

const defaultSettings: CookieBannerSettings = {
  enabled: true,
  text:
    'Koristimo kolacice i slicne tehnologije za rad platforme, funkcionalne preference i, uz vas pristanak, analitiku i buduce marketinske alate.',
  accept_button: 'Prihvati sve',
  reject_button: 'Odbij opcione',
};

const CookieConsentContext = createContext<CookieConsentContextValue | undefined>(undefined);

function normalizeSettings(payload?: Partial<CookieBannerSettings> | null): CookieBannerSettings {
  return {
    ...defaultSettings,
    ...(payload ?? {}),
  };
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consentRecord, setConsentRecord] = useState<CookieConsentRecord | null>(() => readCookieConsentRecord());
  const [settings, setSettings] = useState<CookieBannerSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [isPreferencesOpen, setPreferencesOpen] = useState(false);

  useEffect(() => {
    let active = true;

    legalAPI
      .getCookieSettings()
      .then((response) => {
        if (!active) {
          return;
        }

        setSettings(normalizeSettings(response.data));
      })
      .catch((error) => {
        if (error?.response?.status !== 404) {
          console.error('Error fetching cookie settings:', error);
        }

        if (active) {
          setSettings(defaultSettings);
        }
      })
      .finally(() => {
        if (active) {
          setLoadingSettings(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    applyCookieConsentSideEffects(consentRecord);
  }, [consentRecord]);

  useEffect(() => {
    if (consentRecord?.preferences.functional) {
      initSentry();
      return;
    }

    disableSentry();
  }, [consentRecord?.preferences.functional]);

  useEffect(() => {
    if (consentRecord?.preferences.analytics) {
      initGA();
      return;
    }

    disableGA();
  }, [consentRecord?.preferences.analytics]);

  useEffect(() => {
    const syncConsent = () => {
      setConsentRecord(readCookieConsentRecord());
    };

    const handleCustomEvent = () => syncConsent();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key.includes('cookie_consent') || event.key.includes('wm_cookie_consent_v2')) {
        syncConsent();
      }
    };

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleCustomEvent as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, handleCustomEvent as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const persistPreferences = (
    preferences: CookieConsentPreferences,
    status: CookieConsentRecord['status'],
    source: CookieConsentRecord['source'],
  ): boolean => {
    const nextRecord = createCookieConsentRecord(preferences, status, source);
    const shouldReload = shouldHardReloadAfterConsentChange(consentRecord, nextRecord);

    saveCookieConsentRecord(nextRecord);
    setConsentRecord(nextRecord);
    setPreferencesOpen(false);

    if (shouldReload && typeof window !== 'undefined') {
      window.setTimeout(() => window.location.reload(), 120);
    }

    return shouldReload;
  };

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      consentRecord,
      preferences: consentRecord?.preferences ?? ACCEPT_ALL_COOKIE_PREFERENCES,
      settings,
      loadingSettings,
      hasDecision: Boolean(consentRecord),
      isPreferencesOpen,
      setPreferencesOpen,
      openPreferences: () => setPreferencesOpen(true),
      acceptAll: (source = 'banner') =>
        persistPreferences(ACCEPT_ALL_COOKIE_PREFERENCES, 'accepted_all', source),
      rejectOptional: (source = 'banner') =>
        persistPreferences(DEFAULT_COOKIE_PREFERENCES, 'rejected_optional', source),
      savePreferences: (preferences, source = 'settings') =>
        persistPreferences(
          {
            essential: true,
            functional: Boolean(preferences.functional),
            analytics: Boolean(preferences.analytics),
            marketing: Boolean(preferences.marketing),
          },
          'customized',
          source,
        ),
    }),
    [consentRecord, settings, loadingSettings, isPreferencesOpen],
  );

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }

  return context;
}
