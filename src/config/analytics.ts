import ReactGA from 'react-ga4';
import { hasConsentFor } from '@/lib/cookie-consent';
import { setClarityTag, setClarityTags, trackClarityEvent } from '@/config/clarity';

/**
 * Initialize Google Analytics 4
 * 
 * Setup:
 * 1. Create GA4 property at https://analytics.google.com
 * 2. Get Measurement ID (G-XXXXXXXXXX)
 * 3. Add to .env files as VITE_GA_MEASUREMENT_ID
 */

let isInitialized = false;
let activeMeasurementId: string | null = null;
const trackedOnceEvents = new Set<string>();

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

export type ProfileEntityType =
  | 'doctor'
  | 'clinic'
  | 'laboratory'
  | 'pharmacy'
  | 'spa'
  | 'care_home'
  | 'medicine';

export type ContactClickType = 'phone' | 'email' | 'website' | 'map' | 'whatsapp';
export type RegistrationUserType =
  | 'patient'
  | 'doctor'
  | 'clinic'
  | 'laboratory'
  | 'pharmacy'
  | 'spa'
  | 'care_home';

export interface AnalyticsEntity {
  entity_type: ProfileEntityType;
  entity_id?: string | number | null;
  entity_name?: string | null;
  city?: string | null;
  profile_slug?: string | null;
  specialization?: string | null;
  doctor_id?: string | number | null;
  doctor_name?: string | null;
  clinic_id?: string | number | null;
  clinic_name?: string | null;
  laboratory_id?: string | number | null;
  laboratory_name?: string | null;
  pharmacy_id?: string | number | null;
  pharmacy_name?: string | null;
  spa_id?: string | number | null;
  spa_name?: string | null;
  care_home_id?: string | number | null;
  care_home_name?: string | null;
  medicine_id?: string | number | null;
  medicine_name?: string | null;
  atc_code?: string | null;
  fund_status?: string | null;
  is_24h?: boolean | null;
  is_on_duty?: boolean | null;
}

export interface AppointmentCompletedPayload {
  doctor_id: string | number;
  doctor_name: string;
  specialization?: string | null;
  city?: string | null;
  appointment_type?: string | null;
  booking_type?: 'patient' | 'guest' | 'guest_visit' | string;
  service_id?: string | number | null;
  service_name?: string | null;
}

function getMeasurementId(): string {
  return import.meta.env.VITE_GA_MEASUREMENT_ID;
}

function setAnalyticsDisabled(disabled: boolean): void {
  const measurementId = getMeasurementId();
  if (!measurementId || typeof window === 'undefined') {
    return;
  }

  const flagName = `ga-disable-${measurementId}`;
  (window as Record<string, unknown>)[flagName] = disabled;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return;
  }

  const host = window.location.hostname;
  const domains = [host];
  if (host.includes('.')) {
    domains.push(`.${host}`);
  }

  const base = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  document.cookie = base;
  domains.forEach((domain) => {
    document.cookie = `${base}; domain=${domain}`;
  });
}

function getCurrentPath(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return `${window.location.pathname}${window.location.search}`;
}

function normalizeEventName(eventName: string): string {
  return eventName
    .trim()
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 40);
}

function normalizeAnalyticsValue(value: AnalyticsValue): string | number | boolean | undefined {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed.slice(0, 100) : undefined;
  }

  return value;
}

function sanitizeParams(params: AnalyticsParams = {}): Record<string, string | number | boolean> {
  const sanitized: Record<string, string | number | boolean> = {};

  Object.entries(params).forEach(([rawKey, rawValue]) => {
    if (Object.keys(sanitized).length >= 25) {
      return;
    }

    const key = rawKey.trim().replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 40);
    const value = normalizeAnalyticsValue(rawValue);

    if (!key || value === undefined) {
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
}

function getEntityId(entity: AnalyticsEntity): string | number | null | undefined {
  return (
    entity.entity_id ??
    entity.doctor_id ??
    entity.clinic_id ??
    entity.laboratory_id ??
    entity.pharmacy_id ??
    entity.spa_id ??
    entity.care_home_id ??
    entity.medicine_id
  );
}

function getEntityName(entity: AnalyticsEntity): string | null | undefined {
  return (
    entity.entity_name ??
    entity.doctor_name ??
    entity.clinic_name ??
    entity.laboratory_name ??
    entity.pharmacy_name ??
    entity.spa_name ??
    entity.care_home_name ??
    entity.medicine_name
  );
}

function buildEntityParams(entity: AnalyticsEntity): AnalyticsParams {
  const entityId = getEntityId(entity);
  const entityName = getEntityName(entity);

  return {
    entity_type: entity.entity_type,
    entity_id: entityId,
    entity_name: entityName,
    city: entity.city,
    profile_slug: entity.profile_slug,
    specialization: entity.specialization,
    doctor_id: entity.doctor_id,
    doctor_name: entity.doctor_name,
    clinic_id: entity.clinic_id,
    clinic_name: entity.clinic_name,
    laboratory_id: entity.laboratory_id,
    laboratory_name: entity.laboratory_name,
    pharmacy_id: entity.pharmacy_id,
    pharmacy_name: entity.pharmacy_name,
    spa_id: entity.spa_id,
    spa_name: entity.spa_name,
    care_home_id: entity.care_home_id,
    care_home_name: entity.care_home_name,
    medicine_id: entity.medicine_id,
    medicine_name: entity.medicine_name,
    atc_code: entity.atc_code,
    fund_status: entity.fund_status,
    is_24h: entity.is_24h,
    is_on_duty: entity.is_on_duty,
  };
}

function canTrackGA(): boolean {
  return isInitialized && hasConsentFor('analytics');
}

export function trackGaEvent(eventName: string, params: AnalyticsParams = {}, options: { onceKey?: string } = {}) {
  if (!canTrackGA()) {
    return;
  }

  const normalizedEventName = normalizeEventName(eventName);
  if (!normalizedEventName) {
    return;
  }

  if (options.onceKey) {
    const dedupeKey = `${normalizedEventName}:${options.onceKey}`;
    if (trackedOnceEvents.has(dedupeKey)) {
      return;
    }
    trackedOnceEvents.add(dedupeKey);
  }

  ReactGA.event(normalizedEventName, sanitizeParams(params));
}

export function trackProfileView(entity: AnalyticsEntity) {
  const entityId = getEntityId(entity);
  const eventName = `${entity.entity_type}_profile_view`;
  const onceKey = entityId ? String(entityId) : entity.profile_slug || getEntityName(entity) || undefined;

  trackGaEvent(eventName, buildEntityParams(entity), { onceKey });
  setClarityTags({
    page_type: 'profile',
    entity_type: entity.entity_type,
    city: entity.city || 'none',
    specialty: entity.specialization || 'none',
  });
  trackClarityEvent('profile_viewed');
}

export function trackContactClick(type: ContactClickType, entity: AnalyticsEntity, placement = 'profile') {
  const eventName = `${type}_click`;

  trackGaEvent(eventName, {
    entity_type: entity.entity_type,
    entity_id: getEntityId(entity),
    entity_name: getEntityName(entity),
    city: entity.city,
    placement,
    page_path: getCurrentPath(),
  });
  setClarityTag('entity_type', entity.entity_type);
  trackClarityEvent(eventName);
}

export function trackContactSubmit(entity: AnalyticsEntity, formType: string) {
  trackGaEvent('contact_submit', {
    entity_type: entity.entity_type,
    entity_id: getEntityId(entity),
    entity_name: getEntityName(entity),
    city: entity.city,
    form_type: formType,
  });
  setClarityTags({ entity_type: entity.entity_type, form_type: formType });
  trackClarityEvent('contact_submit');
}

export function trackAppointmentCompleted(payload: AppointmentCompletedPayload) {
  trackGaEvent('appointment_completed', {
    doctor_id: payload.doctor_id,
    doctor_name: payload.doctor_name,
    specialization: payload.specialization,
    city: payload.city,
    appointment_type: payload.appointment_type,
    booking_type: payload.booking_type,
    service_id: payload.service_id,
    service_name: payload.service_name,
  });
  setClarityTag('entity_type', 'doctor');
  trackClarityEvent('booking_submitted');
}

export function trackSignUp(userType: RegistrationUserType | string, method = 'email') {
  trackGaEvent('sign_up', {
    registration_type: userType,
    method,
  });
  setClarityTag('registration_type', userType);
  trackClarityEvent('registration_submitted');
}

export const initGA = () => {
  const measurementId = getMeasurementId();
  const environment = import.meta.env.MODE;

  if (!hasConsentFor('analytics')) {
    return;
  }

  if (isInitialized && activeMeasurementId === measurementId) {
    setAnalyticsDisabled(false);
    return;
  }

  // Only initialize if measurement ID is provided
  if (!measurementId) {
    return;
  }

  // Don't track in development unless explicitly enabled
  if (environment === 'development' && !import.meta.env.VITE_GA_DEBUG) {
    console.log('Google Analytics disabled in development. Set VITE_GA_DEBUG=true to enable.');
    return;
  }

  try {
    setAnalyticsDisabled(false);
    ReactGA.initialize(measurementId, {
      gaOptions: {
        // Anonymize IP addresses for GDPR compliance
        anonymizeIp: true,
        // Cookie settings
        cookieFlags: 'SameSite=None;Secure',
      },
      gtagOptions: {
        // Send page views automatically
        send_page_view: false, // We'll send manually for better control
      },
    });

    isInitialized = true;
    activeMeasurementId = measurementId;
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
};

export const disableGA = () => {
  setAnalyticsDisabled(true);
  trackedOnceEvents.clear();

  if (typeof document !== 'undefined') {
    document.cookie
      .split(';')
      .map((entry) => entry.trim().split('=')[0])
      .filter(Boolean)
      .filter((name) => name === '_ga' || name.startsWith('_ga_') || name === '_gid' || name === '_gat')
      .forEach((name) => deleteCookie(name));
  }
};

/**
 * Track page view
 */
export const trackPageView = (path?: string, title?: string) => {
  if (!isInitialized || !hasConsentFor('analytics')) return;

  const page = path || window.location.pathname + window.location.search;
  const pageTitle = title || document.title;

  ReactGA.send({
    hitType: 'pageview',
    page,
    title: pageTitle,
  });

};

/**
 * Track custom event
 */
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (!isInitialized || !hasConsentFor('analytics')) return;

  ReactGA.event({
    category,
    action,
    label,
    value,
  });

};

/**
 * Track search
 */
export const trackSearch = (searchTerm: string, category?: string) => {
  trackEvent('Search', 'search_query', searchTerm);
  setClarityTag('search_category', category || 'general');
  trackClarityEvent('search_performed');
  
  // Also send as GA4 search event
  if (canTrackGA()) {
    trackGaEvent('search', {
      search_term: searchTerm,
      search_category: category,
    });
  }
};

/**
 * Track doctor profile view
 */
export const trackDoctorView = (doctorId: number, doctorName: string) => {
  trackEvent('Doctor', 'view_profile', doctorName, doctorId);
  trackProfileView({
    entity_type: 'doctor',
    entity_id: doctorId,
    entity_name: doctorName,
    doctor_id: doctorId,
    doctor_name: doctorName,
  });
};

/**
 * Track clinic profile view
 */
export const trackClinicView = (clinicId: number, clinicName: string) => {
  trackEvent('Clinic', 'view_profile', clinicName, clinicId);
  trackProfileView({
    entity_type: 'clinic',
    entity_id: clinicId,
    entity_name: clinicName,
    clinic_id: clinicId,
    clinic_name: clinicName,
  });
};

/**
 * Track appointment booking
 */
export const trackAppointmentBooking = (
  doctorId: number,
  doctorName: string,
  appointmentType: string
) => {
  trackEvent('Appointment', 'book', `${doctorName} - ${appointmentType}`, doctorId);
  setClarityTag('entity_type', 'doctor');
  trackClarityEvent('booking_started');
  
  if (canTrackGA()) {
    trackGaEvent('begin_checkout', {
      item_id: String(doctorId),
      item_name: doctorName,
      item_category: 'Appointment',
      appointment_type: appointmentType,
    });
  }
};

/**
 * Track appointment completion
 */
export const trackAppointmentComplete = (
  doctorId: number,
  doctorName: string,
  appointmentType: string
) => {
  trackEvent('Appointment', 'complete', `${doctorName} - ${appointmentType}`, doctorId);
  setClarityTag('entity_type', 'doctor');
  trackClarityEvent('booking_submitted');
  
  if (canTrackGA()) {
    trackAppointmentCompleted({
      doctor_id: doctorId,
      doctor_name: doctorName,
      appointment_type: appointmentType,
    });
  }
};

/**
 * Track user registration
 */
export const trackRegistration = (userType: string) => {
  trackEvent('User', 'register', userType);
  trackSignUp(userType);
};

/**
 * Track user login
 */
export const trackLogin = (userType: string) => {
  trackEvent('User', 'login', userType);
  
  if (canTrackGA()) {
    trackGaEvent('login', {
      method: 'email',
      user_type: userType,
    });
  }
};

/**
 * Track filter usage
 */
export const trackFilter = (
  filterType: string,
  filterValue: string,
  page: string
) => {
  trackEvent('Filter', `${page}_${filterType}`, filterValue);
  setClarityTags({ page_type: 'listing', filter_type: filterType, listing_type: page });
  trackClarityEvent('search_performed');
};

/**
 * Track specialty selection
 */
export const trackSpecialtyClick = (specialtyName: string, specialtyId: number) => {
  trackEvent('Specialty', 'click', specialtyName, specialtyId);
  
  if (canTrackGA()) {
    trackGaEvent('select_content', {
      content_type: 'specialty',
      content_id: String(specialtyId),
      content_name: specialtyName,
    });
  }
};

/**
 * Track city selection
 */
export const trackCityClick = (cityName: string) => {
  trackEvent('City', 'click', cityName);
  
  if (canTrackGA()) {
    trackGaEvent('select_content', {
      content_type: 'city',
      content_name: cityName,
    });
  }
};

/**
 * Track question posted
 */
export const trackQuestionPost = (questionTitle: string) => {
  trackEvent('Question', 'post', questionTitle);
  
  if (canTrackGA()) {
    trackGaEvent('generate_lead', {
      content_type: 'question',
      content_name: questionTitle,
    });
  }
};

/**
 * Track blog post view
 */
export const trackBlogView = (postId: number, postTitle: string) => {
  trackEvent('Blog', 'view', postTitle, postId);
  
  if (canTrackGA()) {
    trackGaEvent('view_item', {
      item_id: String(postId),
      item_name: postTitle,
      item_category: 'Blog',
    });
  }
};

/**
 * Track outbound link click
 */
export const trackOutboundLink = (url: string, label?: string) => {
  trackEvent('Outbound', 'click', label || url);
  
  if (canTrackGA()) {
    trackGaEvent('click', {
      link_url: url,
      link_text: label,
      outbound: true,
    });
  }
};

/**
 * Track phone call click
 */
export const trackPhoneCall = (phoneNumber: string, entityType: string, entityName: string) => {
  trackEvent('Contact', 'phone_call', `${entityType}: ${entityName}`, 0);
  void phoneNumber;
  trackContactClick('phone', {
    entity_type: entityType as ProfileEntityType,
    entity_name: entityName,
  });
};

/**
 * Track email click
 */
export const trackEmailClick = (email: string, entityType: string, entityName: string) => {
  trackEvent('Contact', 'email', `${entityType}: ${entityName}`, 0);
  void email;
  trackContactClick('email', {
    entity_type: entityType as ProfileEntityType,
    entity_name: entityName,
  });
};

/**
 * Track error
 */
export const trackError = (errorMessage: string, errorPage: string) => {
  trackEvent('Error', errorPage, errorMessage);
  
  if (canTrackGA()) {
    trackGaEvent('exception', {
      description: errorMessage,
      fatal: false,
    });
  }
};

export const trackRegistrationStarted = (userType: string) => {
  setClarityTag('registration_type', userType);
  trackClarityEvent('registration_started');
};

export const trackMapClick = (entityType: string) => {
  setClarityTag('entity_type', entityType);
  trackClarityEvent('map_click');
  trackGaEvent('map_click', {
    entity_type: entityType,
    page_path: getCurrentPath(),
  });
};

export const trackAdminEntitySaved = (entityType: string) => {
  setClarityTag('entity_type', entityType);
  trackClarityEvent('admin_entity_saved');
};

export const __analyticsTest = {
  reset: () => {
    isInitialized = false;
    activeMeasurementId = null;
    trackedOnceEvents.clear();
  },
  setInitialized: (value: boolean) => {
    isInitialized = value;
  },
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (!canTrackGA()) return;
  
  ReactGA.set(properties);
};

/**
 * Track timing (performance)
 */
export const trackTiming = (
  category: string,
  variable: string,
  value: number,
  label?: string
) => {
  if (!canTrackGA()) return;
  
  trackGaEvent('timing_complete', {
    name: variable,
    value,
    event_category: category,
    event_label: label,
  });
};

export default ReactGA;
