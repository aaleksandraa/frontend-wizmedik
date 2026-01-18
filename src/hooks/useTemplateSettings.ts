import { useState, useEffect } from 'react';
import { settingsAPI } from '@/services/api';

interface TemplateSettings {
  doctorTemplate: string;
  clinicTemplate: string;
  homepageTemplate: string;
  modernCoverType: 'gradient' | 'image';
  modernCoverValue: string;
  loading: boolean;
}

export function useTemplateSettings(): TemplateSettings {
  const [doctorTemplate, setDoctorTemplate] = useState('classic');
  const [clinicTemplate, setClinicTemplate] = useState('classic');
  const [homepageTemplate, setHomepageTemplate] = useState('classic');
  const [modernCoverType, setModernCoverType] = useState<'gradient' | 'image'>('gradient');
  const [modernCoverValue, setModernCoverValue] = useState('from-primary via-primary/90 to-primary/80');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getTemplates();
        setDoctorTemplate(response.data.doctor_profile_template || 'classic');
        setClinicTemplate(response.data.clinic_profile_template || 'classic');
        setHomepageTemplate(response.data.homepage_template || 'classic');
        setModernCoverType(response.data.modern_cover_type || 'gradient');
        setModernCoverValue(response.data.modern_cover_value || 'from-primary via-primary/90 to-primary/80');
      } catch (error) {
        console.error('Error loading template settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { doctorTemplate, clinicTemplate, homepageTemplate, modernCoverType, modernCoverValue, loading };
}
