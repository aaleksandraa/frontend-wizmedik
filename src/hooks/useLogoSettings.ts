import { useState, useEffect } from 'react';
import axios from 'axios';
import { canUseFunctionalStorage } from '@/lib/cookie-consent';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const LOGO_SETTINGS_STORAGE_KEY = 'wm_logo_settings_cache_v1';

interface LogoSettings {
  logo_url: string | null;
  logo_enabled: boolean;
  logo_type: 'image' | 'text';
  logo_html: string | null;
  footer_logo_url: string | null;
  footer_logo_enabled: boolean;
  footer_logo_type: 'image' | 'text';
  show_heart_icon: boolean;
  show_heart_icon_header: boolean;
  logo_height_desktop: number;
  logo_height_mobile: number;
  footer_logo_height_desktop: number;
  footer_logo_height_mobile: number;
}

const defaultLogoSettings: LogoSettings = {
  logo_url: null,
  logo_enabled: true,
  logo_type: 'text',
  logo_html: null,
  footer_logo_url: null,
  footer_logo_enabled: true,
  footer_logo_type: 'text',
  show_heart_icon: true,
  show_heart_icon_header: true,
  logo_height_desktop: 70,
  logo_height_mobile: 50,
  footer_logo_height_desktop: 70,
  footer_logo_height_mobile: 50,
};

let logoSettingsCache: LogoSettings | null = null;
let logoSettingsPromise: Promise<LogoSettings> | null = null;

function normalizeSettings(settings?: Partial<LogoSettings> | null): LogoSettings {
  return {
    ...defaultLogoSettings,
    ...(settings ?? {}),
  };
}

function readPersistedSettings(): LogoSettings | null {
  if (logoSettingsCache) {
    return logoSettingsCache;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  if (!canUseFunctionalStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(LOGO_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LogoSettings>;
    const normalized = normalizeSettings(parsed);
    logoSettingsCache = normalized;
    return normalized;
  } catch (error) {
    console.warn('Failed to read cached logo settings:', error);
    return null;
  }
}

function persistSettings(settings: LogoSettings): void {
  logoSettingsCache = settings;

  if (typeof window === 'undefined') {
    return;
  }

  if (!canUseFunctionalStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(LOGO_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to persist logo settings:', error);
  }
}

async function loadLogoSettings(): Promise<LogoSettings> {
  if (logoSettingsCache) {
    return logoSettingsCache;
  }

  if (logoSettingsPromise) {
    return logoSettingsPromise;
  }

  logoSettingsPromise = axios
    .get(`${API_URL}/logo-settings`)
    .then((response) => {
      const normalized = normalizeSettings(response.data);
      persistSettings(normalized);
      return normalized;
    })
    .catch((error) => {
      console.error('Error fetching logo settings:', error);
      return readPersistedSettings() ?? defaultLogoSettings;
    })
    .finally(() => {
      logoSettingsPromise = null;
    });

  return logoSettingsPromise;
}

export function useLogoSettings() {
  const persistedSettings = readPersistedSettings();
  const [settings, setSettings] = useState<LogoSettings>(persistedSettings ?? defaultLogoSettings);
  const [loading, setLoading] = useState(!persistedSettings);

  useEffect(() => {
    let active = true;

    loadLogoSettings()
      .then((loadedSettings) => {
        if (!active) {
          return;
        }

        setSettings(loadedSettings);
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

  return { settings, loading };
}
