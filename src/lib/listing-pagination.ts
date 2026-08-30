export type ListingPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export const LISTING_PAGE_SIZE = 12;
export const LISTING_SEARCH_DEBOUNCE_MS = 300;

export function listingSortParams(
  sortBy: 'name' | 'rating' | 'distance',
  nameColumn: 'ime' | 'naziv'
): Record<string, string> {
  if (sortBy === 'distance') {
    return { sort_by: 'distance' };
  }

  if (sortBy === 'rating') {
    return { sort_by: 'ocjena', sort_order: 'desc' };
  }

  return { sort_by: nameColumn, sort_order: 'asc' };
}

export function listingSpecialtyParam(parent: string, subValues: string[]): string | undefined {
  if (subValues.length > 0) {
    return subValues.join(',');
  }

  return parent || undefined;
}

export const defaultListingPagination = (perPage = LISTING_PAGE_SIZE): ListingPagination => ({
  current_page: 1,
  last_page: 1,
  per_page: perPage,
  total: 0,
});

export function parseWrappedListingPaginator<T>(
  payload: unknown,
  fallbackPage = 1,
  fallbackPerPage = LISTING_PAGE_SIZE
): { list: T[]; pagination: ListingPagination } {
  const body = payload && typeof payload === 'object' ? (payload as Record<string, any>) : {};
  const list = Array.isArray(body?.data)
    ? body.data
    : Array.isArray(body?.data?.data)
      ? body.data.data
      : [];

  const pag = body?.pagination && typeof body.pagination === 'object' ? body.pagination : {};

  return {
    list,
    pagination: {
      current_page: Number(pag.current_page || fallbackPage),
      last_page: Number(pag.last_page || 1),
      per_page: Number(pag.per_page || fallbackPerPage),
      total: Number(pag.total || body?.filters?.total_count || list.length || 0),
    },
  };
}

export function parseLaravelPaginator<T>(
  payload: unknown,
  fallbackPage = 1,
  fallbackPerPage = LISTING_PAGE_SIZE
): { list: T[]; pagination: ListingPagination } {
  const body = payload && typeof payload === 'object' ? (payload as Record<string, any>) : {};
  const paginator = Array.isArray(body?.data?.data) ? body.data : body;
  const list = Array.isArray(paginator?.data)
    ? paginator.data
    : Array.isArray(body?.data)
      ? body.data
      : Array.isArray(payload)
        ? payload
        : [];

  return {
    list,
    pagination: {
      current_page: Number(paginator?.current_page || fallbackPage),
      last_page: Number(paginator?.last_page || 1),
      per_page: Number(paginator?.per_page || fallbackPerPage),
      total: Number(paginator?.total || list.length || 0),
    },
  };
}
