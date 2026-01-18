/**
 * Sentry Error Tracking Configuration
 * 
 * Tracks errors, performance, and user interactions
 */

import * as Sentry from '@sentry/react';

export const initSentry = () => {
  // Only initialize in production
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      
      // Performance Monitoring
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring - 10% of transactions
      tracesSampleRate: 0.1,
      
      // Session Replay - 10% of sessions
      replaysSessionSampleRate: 0.1,
      
      // Session Replay - 100% of sessions with errors
      replaysOnErrorSampleRate: 1.0,
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Filter out sensitive data
      beforeSend(event, hint) {
        // Remove sensitive data from breadcrumbs
        if (event.breadcrumbs) {
          event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
            if (breadcrumb.data) {
              // Remove passwords, tokens, etc.
              const sanitized = { ...breadcrumb.data };
              ['password', 'token', 'authorization', 'cookie'].forEach(key => {
                if (sanitized[key]) {
                  sanitized[key] = '[Filtered]';
                }
              });
              return { ...breadcrumb, data: sanitized };
            }
            return breadcrumb;
          });
        }
        
        // Remove sensitive data from request
        if (event.request?.data) {
          const sanitized = { ...event.request.data };
          ['password', 'token', 'authorization'].forEach(key => {
            if (sanitized[key]) {
              sanitized[key] = '[Filtered]';
            }
          });
          event.request.data = sanitized;
        }
        
        return event;
      },
      
      // Ignore certain errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        // Network errors
        'NetworkError',
        'Network request failed',
        // User cancelled actions
        'AbortError',
        'User cancelled',
      ],
    });
  }
};

// Set user context
export const setSentryUser = (user: { id: number; email: string; uloga: string }) => {
  Sentry.setUser({
    id: user.id.toString(),
    email: user.email,
    role: user.uloga,
  });
};

// Clear user context on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};

// Capture custom error
export const captureError = (error: Error, context?: Record<string, any>) => {
  Sentry.captureException(error, {
    extra: context,
  });
};

// Capture custom message
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  Sentry.captureMessage(message, level);
};

// Add breadcrumb
export const addBreadcrumb = (message: string, category: string, data?: Record<string, any>) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};
