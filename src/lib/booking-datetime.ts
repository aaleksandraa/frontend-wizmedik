import { format } from 'date-fns';

/** Local datetime string for Laravel (avoids UTC shift from Date#toISOString). */
export function formatBookingDateTime(date: Date, time: string): string {
  const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));
  const local = new Date(date);
  local.setHours(hours || 0, minutes || 0, 0, 0);
  return format(local, "yyyy-MM-dd'T'HH:mm:ss");
}

/** Best-effort human message from Axios / Laravel validation errors. */
export function getBookingErrorMessage(error: unknown, fallback: string): string {
  const response = (error as { response?: { data?: any } })?.response?.data;
  if (!response) return fallback;

  if (typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }

  if (typeof response.error === 'string' && response.error.trim()) {
    return response.error;
  }

  const errors = response.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors).flat().find((value) => typeof value === 'string');
    if (typeof first === 'string') return first;
  }

  return fallback;
}
