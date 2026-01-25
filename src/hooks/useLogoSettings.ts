import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface LogoSettings {
  logo_url: string | null;
  logo_enabled: boolean;
  logo_type: 'image' | 'text';
  footer_logo_url: string | null;
  footer_logo_enabled: boolean;
  footer_logo_type: 'image' | 'text';
  show_heart_icon: boolean;
  show_heart_icon_header: boolean;
}

export function useLogoSettings() {
  const [settings, setSettings] = useState<LogoSettings>({
    logo_url: null,
    logo_enabled: true,
    logo_type: 'text',
    footer_logo_url: null,
    footer_logo_enabled: true,
    footer_logo_type: 'text',
    show_heart_icon: true,
    show_heart_icon_header: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API_URL}/logo-settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching logo settings:', error);
      // Use defaults on error
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
