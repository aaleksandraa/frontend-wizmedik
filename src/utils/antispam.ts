// Anti-spam utilities for registration forms

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

const RATE_LIMIT_STORAGE_KEY = 'registration_attempts';
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

/**
 * Check if user has exceeded rate limit for registration attempts
 */
export function checkRateLimit(formType: string): { allowed: boolean; remainingAttempts: number; resetTime?: number } {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const data: Record<string, RateLimitEntry> = stored ? JSON.parse(stored) : {};
    
    const now = Date.now();
    const entry = data[formType];

    if (!entry) {
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    // Check if window has expired
    if (now - entry.firstAttempt > WINDOW_MS) {
      // Reset the counter
      delete data[formType];
      localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
      return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
    }

    // Check if exceeded limit
    if (entry.count >= MAX_ATTEMPTS) {
      const resetTime = entry.firstAttempt + WINDOW_MS;
      return { 
        allowed: false, 
        remainingAttempts: 0,
        resetTime 
      };
    }

    return { 
      allowed: true, 
      remainingAttempts: MAX_ATTEMPTS - entry.count 
    };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }
}

/**
 * Record a registration attempt
 */
export function recordAttempt(formType: string): void {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const data: Record<string, RateLimitEntry> = stored ? JSON.parse(stored) : {};
    
    const now = Date.now();
    const entry = data[formType];

    if (!entry || now - entry.firstAttempt > WINDOW_MS) {
      // New window
      data[formType] = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      // Increment counter
      data[formType] = {
        ...entry,
        count: entry.count + 1,
        lastAttempt: now,
      };
    }

    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Record attempt error:', error);
  }
}

/**
 * Format time remaining until rate limit resets
 */
export function formatTimeRemaining(resetTime: number): string {
  const now = Date.now();
  const remaining = Math.max(0, resetTime - now);
  
  const minutes = Math.floor(remaining / (60 * 1000));
  const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
  
  if (minutes > 0) {
    return `${minutes} minuta`;
  }
  return `${seconds} sekundi`;
}

/**
 * Generate honeypot field name (changes daily to avoid bot detection)
 */
export function getHoneypotFieldName(): string {
  const date = new Date().toISOString().split('T')[0];
  return `field_${btoa(date).substring(0, 8)}`;
}

/**
 * Validate honeypot field (should be empty)
 */
export function validateHoneypot(value: string): boolean {
  return value === '' || value === undefined || value === null;
}

/**
 * Calculate form submission time (detect too-fast submissions)
 */
export function calculateSubmissionTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Check if submission is suspiciously fast (likely a bot)
 */
export function isSuspiciouslyFast(submissionTime: number): boolean {
  // Human users typically take at least 5 seconds to fill a form
  const MIN_SUBMISSION_TIME = 5000; // 5 seconds
  return submissionTime < MIN_SUBMISSION_TIME;
}

/**
 * Detect if user is using autofill (not necessarily spam, but good to know)
 */
export function detectAutofill(formData: Record<string, any>): boolean {
  // Check if all fields were filled very quickly
  // This is a simple heuristic - can be improved
  const filledFields = Object.values(formData).filter(v => v && v.toString().length > 0);
  return filledFields.length > 5; // If more than 5 fields filled, might be autofill
}

/**
 * Generate a simple client-side token to verify form submission
 */
export function generateFormToken(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return btoa(`${timestamp}-${random}`);
}

/**
 * Validate form token (basic check)
 */
export function validateFormToken(token: string): boolean {
  try {
    const decoded = atob(token);
    const [timestamp] = decoded.split('-');
    const age = Date.now() - parseInt(timestamp);
    
    // Token should be used within 1 hour
    return age < 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimits(): void {
  try {
    const stored = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    if (!stored) return;

    const data: Record<string, RateLimitEntry> = JSON.parse(stored);
    const now = Date.now();
    
    Object.keys(data).forEach(key => {
      if (now - data[key].firstAttempt > WINDOW_MS) {
        delete data[key];
      }
    });

    localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
