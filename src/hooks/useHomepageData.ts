import { useState, useEffect } from 'react';
import { homepageAPI } from '@/services/api';

interface HomepageData {
  settings: {
    doctor_profile_template: string;
    clinic_profile_template: string;
    homepage_template: string;
    modern_cover_type: 'gradient' | 'image';
    modern_cover_value: string;
  };
  specialties: Array<{
    id: number;
    naziv: string;
    slug: string;
    doctor_count: number;
  }>;
  doctors: Array<any>;
  clinics: Array<any>;
  banje?: Array<any>;
  domovi?: Array<any>;
  cities?: Array<any>; // Top cities with doctor counts for display
  all_cities?: Array<any>; // ALL cities for dropdown filters
  pitanja?: Array<any>;
  blog_posts?: Array<any>;
  filters: {
    specialties: string[];
    cities: string[];
  };
}

export function useHomepageData() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Add cache busting to force fresh data
        const response = await homepageAPI.getData();
        console.log('Homepage API response:', response.data);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
