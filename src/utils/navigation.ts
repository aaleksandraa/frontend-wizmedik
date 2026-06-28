/**
 * Open-redirect protection helpers.
 *
 * Values like `redirect_to` (from API responses) or `redirectAfterLogin`
 * (from storage) must never send the user to an external origin. These helpers
 * only accept same-origin, absolute in-app paths (e.g. "/doktor/ime-slug").
 */

/**
 * Returns a safe internal path (starting with a single "/") or null if the
 * input is missing, malformed, or points to another origin.
 */
export function safeInternalPath(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const trimmed = value.trim();
  if (trimmed === '') return null;

  // Reject control characters / whitespace that could be used to obfuscate.
  if (/[\u0000-\u001F\u007F\\]/.test(trimmed)) return null;

  // Must be an absolute in-app path, not protocol-relative ("//host")
  // and not a scheme ("http:", "javascript:", "data:", etc.).
  if (!trimmed.startsWith('/')) return null;
  if (trimmed.startsWith('//')) return null;
  if (trimmed.startsWith('/\\')) return null;
  if (/^\/+[^/]*:/.test(trimmed)) return null;

  return trimmed;
}

/**
 * Convenience: returns the safe path or the provided fallback (default "/").
 */
export function safeInternalPathOr(value: unknown, fallback = '/'): string {
  return safeInternalPath(value) ?? fallback;
}
