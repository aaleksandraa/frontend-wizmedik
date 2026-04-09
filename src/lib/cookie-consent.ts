export type CookieConsentCategory = 'essential' | 'functional' | 'analytics' | 'marketing';

export type CookieConsentStatus = 'accepted_all' | 'rejected_optional' | 'customized';

export interface CookieConsentPreferences {
  essential: true;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentRecord {
  version: number;
  status: CookieConsentStatus;
  preferences: CookieConsentPreferences;
  savedAt: string;
  expiresAt: string;
  source: 'banner' | 'settings' | 'migration';
}

export interface CookieCategoryDefinition {
  key: CookieConsentCategory;
  title: string;
  shortDescription: string;
  description: string;
  isRequired: boolean;
}

export interface CookieTechnologyDefinition {
  id: string;
  name: string;
  category: CookieConsentCategory;
  provider: string;
  storage: 'cookie' | 'localStorage' | 'sessionStorage' | 'browser storage' | 'sdk';
  duration: string;
  purpose: string;
  required: boolean;
  status: 'active' | 'conditional' | 'planned';
}

const COOKIE_CONSENT_STORAGE_KEY = 'wm_cookie_consent_v2';
const LEGACY_COOKIE_CONSENT_STORAGE_KEY = 'cookie_consent';
export const COOKIE_CONSENT_UPDATED_EVENT = 'wizmedik:cookie-consent-updated';
export const COOKIE_CONSENT_VERSION = 3;
export const COOKIE_CONSENT_TTL_DAYS = 180;

export const DEFAULT_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  functional: false,
  analytics: false,
  marketing: false,
};

export const ACCEPT_ALL_COOKIE_PREFERENCES: CookieConsentPreferences = {
  essential: true,
  functional: true,
  analytics: true,
  marketing: true,
};

export const COOKIE_CATEGORIES: CookieCategoryDefinition[] = [
  {
    key: 'essential',
    title: 'Neophodni kolacici',
    shortDescription: 'Potrebni za prijavu, sigurnost i osnovni rad platforme.',
    description:
      'Ovi kolacici i lokalni zapisi su potrebni da bi prijava, sigurnost, antispam zastita i spremanje vase odluke o kolacicima uopste radili.',
    isRequired: true,
  },
  {
    key: 'functional',
    title: 'Funkcionalni i dijagnosticki',
    shortDescription: 'Pamte preference interfejsa i poboljsavaju stabilnost aplikacije.',
    description:
      'Koristimo ih za cuvanje pojedinih preferenci interfejsa, privremeni performance cache i, ako je konfigurisan, dijagnosticki alat za otkrivanje gresaka.',
    isRequired: false,
  },
  {
    key: 'analytics',
    title: 'Analitika',
    shortDescription: 'Mjerenje koristenja sajta i performansi stranica.',
    description:
      'Analitika nam pomaze da razumijemo koje stranice i funkcije korisnici koriste, ali se ne aktivira bez vaseg pristanka.',
    isRequired: false,
  },
  {
    key: 'marketing',
    title: 'Marketing',
    shortDescription: 'Rezervisano za buduce marketinske alate i remarketing.',
    description:
      'Trenutno ne aktiviramo marketinske trackere. Kada uvedemo Meta/Facebook Pixel ili dataset integracije, ova kategorija ce se koristiti samo uz poseban pristanak.',
    isRequired: false,
  },
];

const hasConfiguredAnalytics = Boolean(import.meta.env.VITE_GA_MEASUREMENT_ID);
const hasConfiguredSentry = Boolean(import.meta.env.VITE_SENTRY_DSN);

export const COOKIE_TECHNOLOGIES: CookieTechnologyDefinition[] = [
  {
    id: 'wm_cookie_consent_v2',
    name: 'wm_cookie_consent_v2',
    category: 'essential',
    provider: 'wizMedik',
    storage: 'localStorage',
    duration: '6 mjeseci',
    purpose: 'Pamti vasu odluku o kolacicima i omogucava da vas ne pitamo pri svakoj posjeti.',
    required: true,
    status: 'active',
  },
  {
    id: 'auth_token',
    name: 'auth_token',
    category: 'essential',
    provider: 'wizMedik',
    storage: 'localStorage',
    duration: 'Do odjave ili brisanja pregledaca',
    purpose: 'Omogucava prijavu i pristup zasticenim dijelovima platforme.',
    required: true,
    status: 'active',
  },
  {
    id: 'user',
    name: 'user',
    category: 'essential',
    provider: 'wizMedik',
    storage: 'localStorage',
    duration: 'Do odjave ili brisanja pregledaca',
    purpose: 'Lokalno cuva osnovne podatke prijavljenog korisnika radi brzeg ucitavanja interfejsa.',
    required: true,
    status: 'active',
  },
  {
    id: 'redirectAfterLogin',
    name: 'redirectAfterLogin',
    category: 'essential',
    provider: 'wizMedik',
    storage: 'sessionStorage',
    duration: 'Do zatvaranja taba ili browser sesije',
    purpose: 'Vraca korisnika na trazenu stranicu nakon uspjesne prijave.',
    required: true,
    status: 'active',
  },
  {
    id: 'registration_attempts',
    name: 'registration_attempts',
    category: 'essential',
    provider: 'wizMedik',
    storage: 'localStorage',
    duration: '1 sat',
    purpose: 'Ogranicava prevelik broj pokusaja slanja registracijskih formi i pomaze antispam zastiti.',
    required: true,
    status: 'active',
  },
  {
    id: 'sidebar:state',
    name: 'sidebar:state',
    category: 'functional',
    provider: 'wizMedik',
    storage: 'cookie',
    duration: '7 dana',
    purpose: 'Pamti da li je administratorski ili dashboard sidebar otvoren ili sklopljen.',
    required: false,
    status: 'conditional',
  },
  {
    id: 'wm_homepage_data_cache_v1',
    name: 'wm_homepage_data_cache_v1',
    category: 'functional',
    provider: 'wizMedik',
    storage: 'sessionStorage',
    duration: 'Do zatvaranja taba ili browser sesije',
    purpose: 'Privremeno cuva podatke pocetne stranice radi brzeg ponovnog ucitavanja.',
    required: false,
    status: 'conditional',
  },
  {
    id: 'wm_logo_settings_cache_v1',
    name: 'wm_logo_settings_cache_v1',
    category: 'functional',
    provider: 'wizMedik',
    storage: 'sessionStorage',
    duration: 'Do zatvaranja taba ili browser sesije',
    purpose: 'Privremeno cuva vizuelne postavke logotipa da bi se interfejs brze renderovao.',
    required: false,
    status: 'conditional',
  },
  {
    id: 'sentry_browser_sdk',
    name: 'Sentry Browser SDK i Replay',
    category: 'functional',
    provider: 'Sentry',
    storage: 'browser storage',
    duration: hasConfiguredSentry
      ? 'Sesija pregledaca i period koji definise Sentry servis'
      : 'Trenutno nije konfigurisan',
    purpose:
      'Dijagnostika gresaka i performansi. Ako je aktiviran, pomaze timu da otkrije i popravi tehnicke probleme.',
    required: false,
    status: hasConfiguredSentry ? 'conditional' : 'planned',
  },
  {
    id: 'ga4',
    name: '_ga i _ga_<container-id>',
    category: 'analytics',
    provider: 'Google Analytics 4',
    storage: 'cookie',
    duration: 'Do 2 godine',
    purpose:
      'Anonimno razlikuje korisnike i sesije radi mjerenja posjeta, ponasanja na stranicama i performansi sajta.',
    required: false,
    status: hasConfiguredAnalytics ? 'conditional' : 'planned',
  },
  {
    id: 'meta_pixel',
    name: '_fbp / _fbc i Meta Pixel / Dataset',
    category: 'marketing',
    provider: 'Meta Platforms',
    storage: 'cookie',
    duration: 'Obicno do 90 dana, zavisno od konfiguracije',
    purpose:
      'Buduci marketinski i remarketing alati. Trenutno nisu aktivni na sajtu i nece se ukljuciti bez marketing pristanka.',
    required: false,
    status: 'planned',
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function emitConsentUpdate(record: CookieConsentRecord | null): void {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, {
      detail: record,
    }),
  );
}

export function createCookieConsentRecord(
  preferences: CookieConsentPreferences,
  status: CookieConsentStatus,
  source: CookieConsentRecord['source'],
): CookieConsentRecord {
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + COOKIE_CONSENT_TTL_DAYS);

  return {
    version: COOKIE_CONSENT_VERSION,
    status,
    preferences: {
      essential: true,
      functional: Boolean(preferences.functional),
      analytics: Boolean(preferences.analytics),
      marketing: Boolean(preferences.marketing),
    },
    savedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    source,
  };
}

function migrateLegacyConsent(raw: string): CookieConsentRecord | null {
  try {
    const parsed = JSON.parse(raw) as {
      status?: string;
      analytics?: boolean;
      marketing?: boolean;
      timestamp?: string;
    };

    const migrated = createCookieConsentRecord(
      {
        essential: true,
        functional: false,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      },
      parsed.status === 'accepted'
        ? 'accepted_all'
        : parsed.status === 'rejected'
          ? 'rejected_optional'
          : 'customized',
      'migration',
    );

    if (parsed.timestamp) {
      migrated.savedAt = parsed.timestamp;
    }

    return migrated;
  } catch {
    return null;
  }
}

export function readCookieConsentRecord(): CookieConsentRecord | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CookieConsentRecord;
      if (parsed?.version !== COOKIE_CONSENT_VERSION) {
        window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
        return null;
      }
      if (parsed?.expiresAt && new Date(parsed.expiresAt).getTime() < Date.now()) {
        window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
        return null;
      }
      return parsed;
    }

    const legacy = window.localStorage.getItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
    if (!legacy) {
      return null;
    }

    const migrated = migrateLegacyConsent(legacy);
    if (!migrated) {
      return null;
    }

    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(migrated));
    window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
    return migrated;
  } catch {
    return null;
  }
}

export function saveCookieConsentRecord(record: CookieConsentRecord): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(record));
  window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
  emitConsentUpdate(record);
}

export function clearCookieConsentRecord(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_COOKIE_CONSENT_STORAGE_KEY);
  emitConsentUpdate(null);
}

export function getCookieConsentPreferences(): CookieConsentPreferences | null {
  return readCookieConsentRecord()?.preferences ?? null;
}

export function hasConsentFor(category: Exclude<CookieConsentCategory, 'essential'>): boolean {
  const preferences = getCookieConsentPreferences();
  if (!preferences) {
    return false;
  }

  return Boolean(preferences[category]);
}

export function canUseFunctionalStorage(): boolean {
  return hasConsentFor('functional');
}

function deleteCookie(name: string): void {
  if (!isBrowser()) {
    return;
  }

  const host = window.location.hostname;
  const domains = [host];
  if (host.includes('.')) {
    domains.push(`.${host}`);
  }

  const cookieBase = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  document.cookie = cookieBase;
  domains.forEach((domain) => {
    document.cookie = `${cookieBase}; domain=${domain}`;
  });
}

function clearFunctionalArtifacts(): void {
  if (!isBrowser()) {
    return;
  }

  deleteCookie('sidebar:state');

  const storageKeys = ['wm_homepage_data_cache_v1', 'wm_logo_settings_cache_v1'];
  storageKeys.forEach((key) => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Ignore best-effort cleanup failures.
    }
  });
}

function clearAnalyticsArtifacts(): void {
  if (!isBrowser()) {
    return;
  }

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (measurementId) {
    const disableFlag = `ga-disable-${measurementId}`;
    (window as Record<string, unknown>)[disableFlag] = true;
  }

  const cookieNames = document.cookie
    .split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter(Boolean);

  cookieNames
    .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat')
    .forEach((name) => deleteCookie(name));
}

function clearMarketingArtifacts(): void {
  deleteCookie('_fbp');
  deleteCookie('_fbc');
}

export function applyCookieConsentSideEffects(record: CookieConsentRecord | null): void {
  if (!record) {
    clearFunctionalArtifacts();
    clearAnalyticsArtifacts();
    clearMarketingArtifacts();
    return;
  }

  if (!record.preferences.functional) {
    clearFunctionalArtifacts();
  }

  if (!record.preferences.analytics) {
    clearAnalyticsArtifacts();
  }

  if (!record.preferences.marketing) {
    clearMarketingArtifacts();
  }
}

export function shouldHardReloadAfterConsentChange(
  previousRecord: CookieConsentRecord | null,
  nextRecord: CookieConsentRecord,
): boolean {
  if (!previousRecord) {
    return false;
  }

  return (
    previousRecord.preferences.functional !== nextRecord.preferences.functional ||
    previousRecord.preferences.analytics !== nextRecord.preferences.analytics ||
    previousRecord.preferences.marketing !== nextRecord.preferences.marketing
  );
}

export function getCookieTechnologiesByCategory(category: CookieConsentCategory): CookieTechnologyDefinition[] {
  return COOKIE_TECHNOLOGIES.filter((item) => item.category === category);
}

export function getCookieStatusLabel(item: CookieTechnologyDefinition): string {
  if (item.status === 'planned') {
    return 'Trenutno nije aktivno';
  }

  if (item.required) {
    return 'Uvijek aktivno';
  }

  return 'Aktivira se nakon pristanka';
}

export function formatConsentDate(date: string | null | undefined): string {
  if (!date) {
    return 'Nije dostupno';
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return 'Nije dostupno';
  }

  return parsed.toLocaleString('bs-BA');
}
