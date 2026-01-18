import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for static data (specialties, cities rarely change)
      staleTime: 30 * 60 * 1000, // 30 minutes for static data
      gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
      
      // Retry configuration
      retry: 1,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch configuration
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      networkMode: 'online',
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  doctors: {
    all: ['doctors'] as const,
    list: (filters?: Record<string, any>) => ['doctors', 'list', filters] as const,
    detail: (id: number | string) => ['doctors', 'detail', id] as const,
    services: (id: number) => ['doctors', id, 'services'] as const,
    slots: (id: number, date: string) => ['doctors', id, 'slots', date] as const,
  },
  clinics: {
    all: ['clinics'] as const,
    list: (filters?: Record<string, any>) => ['clinics', 'list', filters] as const,
    detail: (id: number | string) => ['clinics', 'detail', id] as const,
  },
  specialties: {
    all: ['specialties'] as const,
    list: () => ['specialties', 'list'] as const,
    detail: (slug: string) => ['specialties', 'detail', slug] as const,
  },
  cities: {
    all: ['cities'] as const,
    list: () => ['cities', 'list'] as const,
  },
  settings: {
    all: ['settings'] as const,
    homepage: () => ['settings', 'homepage'] as const,
    template: () => ['settings', 'template'] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: (filters?: Record<string, any>) => ['appointments', 'list', filters] as const,
    detail: (id: number) => ['appointments', 'detail', id] as const,
  },
};
