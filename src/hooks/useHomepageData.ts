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
  blog_posts_latest?: Array<any>;
  blog_posts_featured?: Array<any>;
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
        
        // Validate response data
        if (!response.data) {
          throw new Error('No data received from API');
        }
        
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
        setError(err as Error);
        // Set empty data structure to prevent undefined errors
        setData({
          settings: {
            doctor_profile_template: 'classic',
            clinic_profile_template: 'classic',
            homepage_template: 'classic',
            modern_cover_type: 'gradient',
            modern_cover_value: 'from-primary via-primary/90 to-primary/80',
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
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error };
}
