import { useState, useEffect } from 'react';
import { settingsAPI } from '@/services/api';

type ListingType = 'doctors' | 'clinics' | 'cities' | 'laboratories';
type TemplateType = 'default' | 'soft';

export const useListingTemplate = (type: ListingType) => {
  const [template, setTemplate] = useState<TemplateType>('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplate();
  }, [type]);

  const fetchTemplate = async () => {
    try {
      const response = await settingsAPI.getListingTemplate(type);
      setTemplate(response.data.template || 'default');
    } catch (error) {
      console.error('Error fetching listing template:', error);
      setTemplate('default');
    } finally {
      setLoading(false);
    }
  };

  return { template, loading };
};
