import { describe, expect, it } from 'vitest';
import { formatCityLabel, resolvePharmacySeoCityName } from '../utils/pharmacySeo';

describe('pharmacy SEO city names', () => {
  it('formats a lowercase city slug as a readable city label', () => {
    expect(formatCityLabel('tuzla')).toBe('Tuzla');
  });

  it('uses the city list to resolve diacritics from a slug', () => {
    const cityName = resolvePharmacySeoCityName(
      [],
      [{ naziv: 'Modriča', slug: 'modrica' }],
      'modrica'
    );

    expect(cityName).toBe('Modriča');
  });

  it('does not return a lowercase slug for a duty page with no pharmacy results', () => {
    const cityName = resolvePharmacySeoCityName([], [], 'tuzla');

    expect(cityName).toBe('Tuzla');
    expect(cityName).not.toBe('tuzla');
  });
});
