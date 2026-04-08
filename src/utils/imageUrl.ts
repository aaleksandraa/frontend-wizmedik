/**
 * Fix image URLs to use correct API subdomain
 * 
 * Backend sometimes returns URLs with wrong domain (wizmedik.com instead of api.wizmedik.com)
 * This function fixes those URLs to point to the correct API subdomain
 */
export function fixImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const normalized = url.trim();

  if (!normalized) return null;
  
  // If URL already points to api.wizmedik.com, return as is
  if (normalized.includes('api.wizmedik.com')) {
    return normalized;
  }
  
  // If URL points to wizmedik.com/storage, fix it to api.wizmedik.com/storage
  if (normalized.includes('wizmedik.com/storage')) {
    return normalized.replace('wizmedik.com/storage', 'api.wizmedik.com/storage');
  }
  
  // If URL is relative (starts with /storage), prepend API URL
  if (normalized.startsWith('/storage')) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    // Remove /api from the end if present
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return baseUrl + normalized;
  }

  // If only the public disk path is stored (e.g. clinics/image.webp), expand it.
  if (
    !normalized.startsWith('http://') &&
    !normalized.startsWith('https://') &&
    !normalized.startsWith('data:')
  ) {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiUrl.replace(/\/api$/, '');
    return `${baseUrl}/storage/${normalized.replace(/^\/+/, '')}`;
  }
  
  // Return original URL if no fix needed
  return normalized;
}
