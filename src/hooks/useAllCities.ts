import { useState, useEffect } from 'react';
import { citiesAPI } from '@/services/api';

interface City {
  id: number;
  naziv: string;
  slug: string;
}

export function useAllCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await citiesAPI.getAll();
        setCities(response.data || []);
      } catch (err) {
        console.error('Error fetching cities:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  return { cities, loading, error };
}
