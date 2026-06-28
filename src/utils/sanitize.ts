import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows only safe HTML tags
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize rich text content (descriptions, articles) for safe rendering.
 * Keeps common formatting tags but strips scripts, event handlers and other
 * active content. Use this wherever rich HTML from the API is rendered via
 * dangerouslySetInnerHTML.
 */
export const sanitizeRichText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty ?? '', {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'srcset'],
    ADD_ATTR: ['target', 'rel'],
  });
};

/**
 * Sanitize user input - removes all HTML
 */
export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};
