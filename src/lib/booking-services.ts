export interface BookingService {
  id: number | string;
  naziv: string;
  cijena?: number | string | null;
  trajanje_minuti?: number | null;
}

export interface BookingServiceCategory {
  id: number | string;
  naziv: string;
  usluge?: BookingService[];
}

export interface ServiceGroup {
  key: string;
  label: string | null;
  services: BookingService[];
}

export const OTHER_SERVICE_VALUE = 'ostalo';

/**
 * Flattens categorised and uncategorised services into one ordered list of groups
 * so the whole catalogue fits in a single dropdown.
 */
export function buildServiceGroups(
  services: BookingService[] | undefined,
  categories: BookingServiceCategory[] | undefined
): ServiceGroup[] {
  const safeServices = Array.isArray(services) ? services : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  const groups: ServiceGroup[] = [];
  const categorisedIds = new Set<string>();

  safeCategories.forEach((category) => {
    const categoryServices = Array.isArray(category.usluge) ? category.usluge : [];
    if (categoryServices.length === 0) return;

    categoryServices.forEach((service) => categorisedIds.add(String(service.id)));
    groups.push({
      key: `category-${category.id}`,
      label: category.naziv,
      services: categoryServices,
    });
  });

  const uncategorised = safeServices.filter((service) => !categorisedIds.has(String(service.id)));
  if (uncategorised.length > 0) {
    groups.push({
      key: 'uncategorised',
      label: groups.length > 0 ? 'Ostale usluge' : null,
      services: uncategorised,
    });
  }

  return groups;
}

export function findServiceById(
  id: string,
  services: BookingService[] | undefined,
  categories: BookingServiceCategory[] | undefined
): BookingService | undefined {
  if (!id || id === OTHER_SERVICE_VALUE) return undefined;

  for (const group of buildServiceGroups(services, categories)) {
    const match = group.services.find((service) => String(service.id) === id);
    if (match) return match;
  }

  return undefined;
}

export function formatServicePrice(service: BookingService | undefined): string {
  if (!service) return '';
  const price = service.cijena;
  if (price === null || price === undefined || price === '') return 'Cijena po dogovoru';
  return `${price} KM`;
}

export function formatServiceDuration(
  service: BookingService | undefined,
  fallbackMinutes: number
): string {
  const minutes = service?.trajanje_minuti || fallbackMinutes;
  return `${minutes} min`;
}
