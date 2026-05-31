import { hasConsentFor } from '@/lib/cookie-consent';

type ClarityValue = string | number | boolean | null | undefined;
type ClarityFn = {
  (...args: unknown[]): void;
  q?: unknown[][];
};

declare global {
  interface Window {
    clarity?: ClarityFn;
  }
}

const CLARITY_SCRIPT_ID = 'microsoft-clarity-script';
const CLARITY_COOKIE_NAMES = ['_clck', '_clsk'];

let initializedProjectId: string | null = null;
let linkTrackingAttached = false;

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function getProjectId(): string {
  return String(import.meta.env.VITE_CLARITY_PROJECT_ID || '').trim();
}

function canRunClarity(): boolean {
  if (!isBrowser() || !getProjectId() || !hasConsentFor('analytics')) {
    return false;
  }

  if (import.meta.env.MODE === 'development' && import.meta.env.VITE_CLARITY_DEBUG !== 'true') {
    return false;
  }

  return true;
}

function normalizeValue(value: ClarityValue): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return String(value).trim().slice(0, 128);
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

function cleanupClarityCookies(): void {
  if (!isBrowser()) {
    return;
  }

  const cookieNames = document.cookie
    .split(';')
    .map((entry) => entry.trim().split('=')[0])
    .filter(Boolean);

  cookieNames
    .filter((name) => CLARITY_COOKIE_NAMES.includes(name))
    .forEach((name) => deleteCookie(name));
}

function ensureClarityQueue(): void {
  if (!isBrowser() || window.clarity) {
    return;
  }

  const clarity: ClarityFn = (...args: unknown[]) => {
    clarity.q = clarity.q || [];
    clarity.q.push(args);
  };

  window.clarity = clarity;
}

function attachLinkTracking(): void {
  if (!isBrowser() || linkTrackingAttached) {
    return;
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      const href = anchor.getAttribute('href') || '';
      const normalizedHref = href.toLowerCase();

      if (normalizedHref.startsWith('tel:')) {
        trackClarityEvent('phone_click');
        return;
      }

      if (normalizedHref.startsWith('mailto:')) {
        trackClarityEvent('email_click');
        return;
      }

      if (
        normalizedHref.includes('google.com/maps') ||
        normalizedHref.includes('maps.google.') ||
        normalizedHref.includes('maps.app.goo.gl')
      ) {
        trackClarityEvent('map_click');
      }
    },
    true,
  );

  linkTrackingAttached = true;
}

function identifyStoredUser(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    const rawUser = window.localStorage.getItem('user');
    if (!rawUser) {
      return;
    }

    const parsed = JSON.parse(rawUser) as { analytics_id?: string };
    const analyticsId = normalizeValue(parsed?.analytics_id);
    if (analyticsId) {
      window.clarity?.('identify', analyticsId);
    }
  } catch {
    // Ignore malformed local auth cache.
  }
}

function inferPageType(path: string): string {
  if (path === '/') return 'home';
  if (path.startsWith('/auth') && path.includes('mode=register')) return 'registration';
  if (path.startsWith('/doktor/') || path.startsWith('/klinika/') || path.startsWith('/apoteka/')) return 'profile';
  if (path.startsWith('/laboratorija/') || path.startsWith('/banja/') || path.startsWith('/dom-njega/')) return 'profile';
  if (path.startsWith('/lijekovi/') && path !== '/lijekovi') return 'profile';
  if (path.startsWith('/register') || path === '/registration-options') return 'registration';
  if (path.startsWith('/admin')) return 'admin';
  if (path.includes('dashboard')) return 'dashboard';
  if (path.startsWith('/doktori') || path.startsWith('/klinike') || path.startsWith('/apoteke')) return 'listing';
  if (path.startsWith('/laboratorije') || path.startsWith('/banje') || path.startsWith('/domovi-njega')) return 'listing';
  if (path.startsWith('/lijekovi')) return 'listing';
  return 'content';
}

function inferEntityType(path: string): string {
  if (path.startsWith('/doktor/')) return 'doctor';
  if (path.startsWith('/klinika/')) return 'clinic';
  if (path.startsWith('/apoteka/')) return 'pharmacy';
  if (path.startsWith('/laboratorija/')) return 'laboratory';
  if (path.startsWith('/banja/')) return 'spa';
  if (path.startsWith('/dom-njega/')) return 'care_home';
  if (path.startsWith('/lijekovi/') && path !== '/lijekovi') return 'medicine';
  return 'none';
}

function inferRegistrationType(path: string): string {
  if (path.startsWith('/register/doctor')) return 'doctor';
  if (path.startsWith('/register/clinic')) return 'clinic';
  if (path.startsWith('/register/laboratory')) return 'laboratory';
  if (path.startsWith('/register/pharmacy')) return 'pharmacy';
  if (path.startsWith('/register/spa')) return 'spa';
  if (path.startsWith('/register/care-home')) return 'care_home';
  if (path.startsWith('/auth') && path.includes('mode=register')) return 'patient';
  if (path.startsWith('/register') || path === '/registration-options') return 'provider';
  return 'none';
}

export function initClarity(): void {
  const projectId = getProjectId();

  if (!canRunClarity()) {
    return;
  }

  ensureClarityQueue();
  attachLinkTracking();
  window.clarity?.('consent', true);
  identifyStoredUser();

  if (initializedProjectId === projectId || document.getElementById(CLARITY_SCRIPT_ID)) {
    initializedProjectId = projectId;
    return;
  }

  const script = document.createElement('script');
  script.id = CLARITY_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`;
  script.onerror = () => {
    console.error('Failed to load Microsoft Clarity.');
  };

  document.head.appendChild(script);
  initializedProjectId = projectId;
}

export function disableClarity(): void {
  if (!isBrowser()) {
    return;
  }

  window.clarity?.('consent', false);
  cleanupClarityCookies();
}

export function trackClarityEvent(eventName: string): void {
  if (!canRunClarity()) {
    return;
  }

  initClarity();
  const normalizedName = eventName.trim().replace(/[^a-zA-Z0-9_:-]/g, '_').slice(0, 64);
  if (!normalizedName) {
    return;
  }

  window.clarity?.('event', normalizedName);
}

export function setClarityTag(key: string, value: ClarityValue): void {
  if (!canRunClarity()) {
    return;
  }

  const normalizedKey = key.trim().replace(/[^a-zA-Z0-9_:-]/g, '_').slice(0, 64);
  const normalizedValue = normalizeValue(value);
  if (!normalizedKey || normalizedValue === null) {
    return;
  }

  initClarity();
  window.clarity?.('set', normalizedKey, normalizedValue);
}

export function setClarityTags(tags: Record<string, ClarityValue>): void {
  Object.entries(tags).forEach(([key, value]) => setClarityTag(key, value));
}

export function identifyClarityUser(analyticsId?: string | null): void {
  const normalizedId = normalizeValue(analyticsId);
  if (!normalizedId || !canRunClarity()) {
    return;
  }

  initClarity();
  window.clarity?.('identify', normalizedId);
}

export function trackClarityPageView(path = window.location.pathname): void {
  if (!canRunClarity()) {
    return;
  }

  const pageType = inferPageType(path);

  setClarityTags({
    page_type: pageType,
    entity_type: inferEntityType(path),
    registration_type: inferRegistrationType(path),
    city: 'none',
    specialty: 'none',
  });

  if (pageType === 'registration') {
    trackClarityEvent('registration_started');
  }

  trackClarityEvent('page_view');
}

export function trackClarityProfileView(
  entityType: string,
  options: { city?: string | null; specialty?: string | null } = {},
): void {
  setClarityTags({
    page_type: 'profile',
    entity_type: entityType,
    city: options.city || 'none',
    specialty: options.specialty || 'none',
  });
  trackClarityEvent('profile_viewed');
}
