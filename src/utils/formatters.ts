/**
 * Safely format a rating value to fixed decimal places
 * Handles both string and number types from database
 */
export const formatRating = (rating: number | string | undefined | null): string => {
  if (!rating) return '0.0';
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  return isNaN(numRating) ? '0.0' : numRating.toFixed(1);
};

/**
 * Safely format any numeric value to fixed decimal places
 * Handles both string and number types from database
 */
export const formatNumber = (value: number | string | undefined | null, decimals: number = 1): string => {
  if (!value) return '0.0';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(numValue) ? '0.0' : numValue.toFixed(decimals);
};
