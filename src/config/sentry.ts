import * as Sentry from '@sentry/react';
import { hasConsentFor } from '@/lib/cookie-consent';

/**
 * Initialize Sentry for error tracking
 * 
 * Setup:
 * 1. Create account at https://sentry.io
 * 2. Create new project (React)
 * 3. Copy DSN and add to .env files
 * 4. Set environment (development/production)
 */

export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE;
  const existingClient = Sentry.getClient();

  if (!hasConsentFor('functional')) {
    return;
  }

  if (existingClient) {
    return;
  }

  // Only initialize if DSN is provided
  if (!dsn) {
    return;
  }

  Sentry.init({
    dsn,
    environment,
    
    // Set sample rate based on environment
    // Production: 100% of errors, 10% of transactions
    // Development: 100% of errors, 100% of transactions
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    
    // Capture 100% of errors in both environments
    sampleRate: 1.0,
    
    // Enable performance monitoring
    integrations: [
      // Browser tracing for performance monitoring
      Sentry.browserTracingIntegration({
        // Track navigation and route changes
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/wizmedik\.com/,
          /^https:\/\/api\.wizmedik\.com/,
        ],
      }),
      
      // Replay sessions for debugging
      Sentry.replayIntegration({
        // Capture 10% of sessions in production, 100% in dev
        sessionSampleRate: environment === 'production' ? 0.1 : 1.0,
        // Capture 100% of sessions with errors
        errorSampleRate: 1.0,
        // Mask all text and input content for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filter out known non-critical errors
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignore network errors (handled by UI)
      if (error && typeof error === 'object' && 'message' in error) {
        const message = String(error.message).toLowerCase();
        if (
          message.includes('network error') ||
          message.includes('failed to fetch') ||
          message.includes('load failed')
        ) {
          return null;
        }
      }
      
      // Ignore ResizeObserver errors (browser quirk)
      if (event.message?.includes('ResizeObserver')) {
        return null;
      }
      
      return event;
    },
    
    // Add custom tags
    initialScope: {
      tags: {
        app: 'wizmedik-frontend',
      },
    },
    
    // Enable debug mode in development
    debug: environment === 'development',
    
    // Release tracking (set by CI/CD)
    release: import.meta.env.VITE_APP_VERSION || 'development',
  });
};

export const disableSentry = () => {
  const client = Sentry.getClient();
  if (!client) {
    return;
  }

  Sentry.setUser(null);

  try {
    void client.close(2000);
  } catch (error) {
    console.warn('Failed to close Sentry client cleanly:', error);
  }
};

/**
 * Capture custom error with context
 */
export const captureError = (
  error: Error,
  context?: Record<string, any>
) => {
  if (!Sentry.getClient() || !hasConsentFor('functional')) {
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
};

/**
 * Capture custom message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info',
  context?: Record<string, any>
) => {
  if (!Sentry.getClient() || !hasConsentFor('functional')) {
    return;
  }

  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Set user context for error tracking
 */
export const setUserContext = (user: {
  id: number;
  email?: string;
  role?: string;
}) => {
  if (!Sentry.getClient() || !hasConsentFor('functional')) {
    return;
  }

  Sentry.setUser({
    id: String(user.id),
    email: user.email,
    role: user.role,
  });
};

/**
 * Clear user context (on logout)
 */
export const clearUserContext = () => {
  if (!Sentry.getClient()) {
    return;
  }

  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (
  message: string,
  category: string,
  data?: Record<string, any>
) => {
  if (!Sentry.getClient() || !hasConsentFor('functional')) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

export default Sentry;
