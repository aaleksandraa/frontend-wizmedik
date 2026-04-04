import { useEffect, useState } from 'react';
import { homepageAPI } from '@/services/api';

export interface HomepageData {
  settings: {
    doctor_profile_template: string;
    clinic_profile_template: string;
    homepage_template: string;
    modern_cover_type: 'gradient' | 'image';
    modern_cover_value: string;
    custom3_hero_bg_enabled?: boolean;
    custom3_hero_bg_image?: string | null;
    custom3_hero_bg_opacity?: number;
    navbar_style?: string;
  };
  specialties: Array<{
    id: number;
    naziv: string;
    slug: string;
    doctor_count?: number;
  }>;
  doctors: Array<any>;
  clinics: Array<any>;
  banje: Array<any>;
  domovi: Array<any>;
  cities: Array<any>;
  all_cities: Array<any>;
  pitanja: Array<any>;
  blog_posts: Array<any>;
  blog_posts_latest: Array<any>;
  blog_posts_featured: Array<any>;
  filters: {
    specialties: string[];
    cities: string[];
  };
}

const HOMEPAGE_DATA_STORAGE_KEY = 'wm_homepage_data_cache_v1';

export const defaultHomepageData: HomepageData = {
  settings: {
    doctor_profile_template: 'classic',
    clinic_profile_template: 'classic',
    homepage_template: 'classic',
    modern_cover_type: 'gradient',
    modern_cover_value: 'from-primary via-primary/90 to-primary/80',
    custom3_hero_bg_enabled: false,
    custom3_hero_bg_image: null,
    custom3_hero_bg_opacity: 20,
    navbar_style: 'auto',
  },
  specialties: [],
  doctors: [],
  clinics: [],
  banje: [],
  domovi: [],
  cities: [],
  all_cities: [],
  pitanja: [],
  blog_posts: [],
  blog_posts_latest: [],
  blog_posts_featured: [],
  filters: {
    specialties: [],
    cities: [],
  },
};

let homepageDataCache: HomepageData | null = null;
let homepageDataPromise: Promise<HomepageData> | null = null;

function normalizeHomepageData(payload?: Partial<HomepageData> | null): HomepageData {
  return {
    ...defaultHomepageData,
    ...payload,
    settings: {
      ...defaultHomepageData.settings,
      ...(payload?.settings ?? {}),
    },
    specialties: Array.isArray(payload?.specialties) ? payload.specialties : defaultHomepageData.specialties,
    doctors: Array.isArray(payload?.doctors) ? payload.doctors : defaultHomepageData.doctors,
    clinics: Array.isArray(payload?.clinics) ? payload.clinics : defaultHomepageData.clinics,
    banje: Array.isArray(payload?.banje) ? payload.banje : defaultHomepageData.banje,
    domovi: Array.isArray(payload?.domovi) ? payload.domovi : defaultHomepageData.domovi,
    cities: Array.isArray(payload?.cities) ? payload.cities : defaultHomepageData.cities,
    all_cities: Array.isArray(payload?.all_cities) ? payload.all_cities : defaultHomepageData.all_cities,
    pitanja: Array.isArray(payload?.pitanja) ? payload.pitanja : defaultHomepageData.pitanja,
    blog_posts: Array.isArray(payload?.blog_posts) ? payload.blog_posts : defaultHomepageData.blog_posts,
    blog_posts_latest: Array.isArray(payload?.blog_posts_latest)
      ? payload.blog_posts_latest
      : defaultHomepageData.blog_posts_latest,
    blog_posts_featured: Array.isArray(payload?.blog_posts_featured)
      ? payload.blog_posts_featured
      : defaultHomepageData.blog_posts_featured,
    filters: {
      ...defaultHomepageData.filters,
      ...(payload?.filters ?? {}),
      specialties: Array.isArray(payload?.filters?.specialties)
        ? payload.filters.specialties
        : defaultHomepageData.filters.specialties,
      cities: Array.isArray(payload?.filters?.cities)
        ? payload.filters.cities
        : defaultHomepageData.filters.cities,
    },
  };
}

function readPersistedHomepageData(): HomepageData | null {
  if (homepageDataCache) {
    return homepageDataCache;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(HOMEPAGE_DATA_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<HomepageData>;
    const normalized = normalizeHomepageData(parsed);
    homepageDataCache = normalized;
    return normalized;
  } catch {
    return null;
  }
}

function persistHomepageData(data: HomepageData): void {
  homepageDataCache = data;

  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(HOMEPAGE_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Session storage persistence is best-effort only.
  }
}

async function loadHomepageData(): Promise<HomepageData> {
  if (homepageDataCache) {
    return homepageDataCache;
  }

  if (homepageDataPromise) {
    return homepageDataPromise;
  }

  homepageDataPromise = homepageAPI
    .getData()
    .then((response) => {
      const normalized = normalizeHomepageData(response.data);
      persistHomepageData(normalized);
      return normalized;
    })
    .catch((error) => {
      console.error('Error fetching homepage data:', error);
      return readPersistedHomepageData() ?? defaultHomepageData;
    })
    .finally(() => {
      homepageDataPromise = null;
    });

  return homepageDataPromise;
}

export function useHomepageData() {
  const persistedData = readPersistedHomepageData();
  const [data, setData] = useState<HomepageData>(persistedData ?? defaultHomepageData);
  const [loading, setLoading] = useState(!persistedData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let active = true;

    loadHomepageData()
      .then((loadedData) => {
        if (!active) {
          return;
        }

        setData(loadedData);
        setError(null);
      })
      .catch((err) => {
        if (!active) {
          return;
        }

        setError(err as Error);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { data, loading, error };
}
