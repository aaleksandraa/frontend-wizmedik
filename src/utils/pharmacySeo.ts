export type PharmacySeoCity = {
  naziv: string;
  slug: string;
};

export type PharmacySeoItem = {
  grad_naziv?: string | null;
};

export const slugifyCitySegment = (value: string): string => {
  return decodeURIComponent(value.replace(/\+/g, ' '))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export const formatCityLabel = (value: string): string => {
  return decodeURIComponent(value.replace(/\+/g, ' '))
    .replace(/-/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const resolvePharmacySeoCityName = (
  items: PharmacySeoItem[],
  cities: PharmacySeoCity[],
  selectedCitySlug: string
): string => {
  const apiCityName = items
    .find((item) => item.grad_naziv && item.grad_naziv.trim() !== '')
    ?.grad_naziv
    ?.trim();

  if (apiCityName) return apiCityName;

  const cityFromList = cities.find((city) => {
    const citySlug = city.slug?.trim();
    return slugifyCitySegment(citySlug || '') === selectedCitySlug || slugifyCitySegment(city.naziv) === selectedCitySlug;
  });

  if (cityFromList?.naziv?.trim()) {
    return cityFromList.naziv.trim();
  }

  return selectedCitySlug ? formatCityLabel(selectedCitySlug) : '';
};
