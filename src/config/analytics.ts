import ReactGA from 'react-ga4';
import { hasConsentFor } from '@/lib/cookie-consent';

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
  
  // Also send as GA4 search event
  if (isInitialized) {
    ReactGA.event('search', {
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
  
  if (isInitialized) {
    ReactGA.event('view_item', {
      item_id: String(doctorId),
      item_name: doctorName,
      item_category: 'Doctor',
    });
  }
};

/**
 * Track clinic profile view
 */
export const trackClinicView = (clinicId: number, clinicName: string) => {
  trackEvent('Clinic', 'view_profile', clinicName, clinicId);
  
  if (isInitialized) {
    ReactGA.event('view_item', {
      item_id: String(clinicId),
      item_name: clinicName,
      item_category: 'Clinic',
    });
  }
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
  
  if (isInitialized) {
    ReactGA.event('begin_checkout', {
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
  
  if (isInitialized) {
    ReactGA.event('purchase', {
      transaction_id: `apt_${Date.now()}`,
      value: 0, // Set actual value if applicable
      currency: 'BAM',
      items: [{
        item_id: String(doctorId),
        item_name: doctorName,
        item_category: 'Appointment',
        appointment_type: appointmentType,
      }],
    });
  }
};

/**
 * Track user registration
 */
export const trackRegistration = (userType: string) => {
  trackEvent('User', 'register', userType);
  
  if (isInitialized) {
    ReactGA.event('sign_up', {
      method: 'email',
      user_type: userType,
    });
  }
};

/**
 * Track user login
 */
export const trackLogin = (userType: string) => {
  trackEvent('User', 'login', userType);
  
  if (isInitialized) {
    ReactGA.event('login', {
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
};

/**
 * Track specialty selection
 */
export const trackSpecialtyClick = (specialtyName: string, specialtyId: number) => {
  trackEvent('Specialty', 'click', specialtyName, specialtyId);
  
  if (isInitialized) {
    ReactGA.event('select_content', {
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
  
  if (isInitialized) {
    ReactGA.event('select_content', {
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
  
  if (isInitialized) {
    ReactGA.event('generate_lead', {
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
  
  if (isInitialized) {
    ReactGA.event('view_item', {
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
  
  if (isInitialized) {
    ReactGA.event('click', {
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
  
  if (isInitialized) {
    ReactGA.event('generate_lead', {
      contact_method: 'phone',
      entity_type: entityType,
      entity_name: entityName,
      phone_number: phoneNumber,
    });
  }
};

/**
 * Track email click
 */
export const trackEmailClick = (email: string, entityType: string, entityName: string) => {
  trackEvent('Contact', 'email', `${entityType}: ${entityName}`, 0);
  
  if (isInitialized) {
    ReactGA.event('generate_lead', {
      contact_method: 'email',
      entity_type: entityType,
      entity_name: entityName,
      email,
    });
  }
};

/**
 * Track error
 */
export const trackError = (errorMessage: string, errorPage: string) => {
  trackEvent('Error', errorPage, errorMessage);
  
  if (isInitialized) {
    ReactGA.event('exception', {
      description: errorMessage,
      fatal: false,
    });
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (!isInitialized || !hasConsentFor('analytics')) return;
  
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
  if (!isInitialized || !hasConsentFor('analytics')) return;
  
  ReactGA.event('timing_complete', {
    name: variable,
    value,
    event_category: category,
    event_label: label,
  });
};

export default ReactGA;
