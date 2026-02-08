import { useState, useEffect } from 'react';
import { settingsAPI } from '@/services/api';

interface DoctorCardSettings {
  variant: string;
  showRating: boolean;
  showLocation: boolean;
  showPhone: boolean;
  showSpecialty: boolean;
  showOnlineStatus: boolean;
  showBookButton: boolean;
  primaryColor: string;
  accentColor: string;
}

interface ClinicCardSettings {
  variant: string;
  showImage: boolean;
  showDescription: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showWorkingHours: boolean;
  showDoctorsCount: boolean;
  showDistance: boolean;
  primaryColor: string;
  accentColor: string;
}

const defaultDoctorSettings: DoctorCardSettings = {
  variant: 'classic',
  showRating: true,
  showLocation: true,
  showPhone: true,
  showSpecialty: true,
  showOnlineStatus: true,
  showBookButton: true,
  primaryColor: '#0891b2',
  accentColor: '#10b981',
};

const defaultClinicSettings: ClinicCardSettings = {
  variant: 'classic',
  showImage: true,
  showDescription: true,
  showAddress: true,
  showPhone: true,
  showEmail: false,
  showWebsite: false,
  showWorkingHours: true,
  showDoctorsCount: true,
  showDistance: true,
  primaryColor: '#0891b2',
  accentColor: '#8b5cf6',
};

// Cache settings with Promise to prevent race conditions
let doctorSettingsCache: DoctorCardSettings | null = null;
let clinicSettingsCache: ClinicCardSettings | null = null;
let doctorSettingsPromise: Promise<DoctorCardSettings> | null = null;
let clinicSettingsPromise: Promise<ClinicCardSettings> | null = null;

async function loadDoctorSettings(): Promise<DoctorCardSettings> {
  if (doctorSettingsCache) return doctorSettingsCache;
  if (doctorSettingsPromise) return doctorSettingsPromise;
  
  doctorSettingsPromise = (async () => {
    try {
      const response = await settingsAPI.getDoctorCardSettings();
      const newSettings = { ...defaultDoctorSettings, ...response.data };
      doctorSettingsCache = newSettings;
      return newSettings;
    } catch (error) {
      console.error('Error loading doctor card settings:', error);
      doctorSettingsCache = defaultDoctorSettings;
      return defaultDoctorSettings;
    }
  })();
  
  return doctorSettingsPromise;
}

async function loadClinicSettings(): Promise<ClinicCardSettings> {
  if (clinicSettingsCache) return clinicSettingsCache;
  if (clinicSettingsPromise) return clinicSettingsPromise;
  
  clinicSettingsPromise = (async () => {
    try {
      const response = await settingsAPI.getClinicCardSettings();
      const newSettings = { ...defaultClinicSettings, ...response.data };
      clinicSettingsCache = newSettings;
      return newSettings;
    } catch (error) {
      console.error('Error loading clinic card settings:', error);
      clinicSettingsCache = defaultClinicSettings;
      return defaultClinicSettings;
    }
  })();
  
  return clinicSettingsPromise;
}

export function useDoctorCardSettings() {
  const [settings, setSettings] = useState<DoctorCardSettings | null>(doctorSettingsCache);
  const [loading, setLoading] = useState(!doctorSettingsCache);

  useEffect(() => {
    if (doctorSettingsCache) {
      setSettings(doctorSettingsCache);
      setLoading(false);
      return;
    }
    
    loadDoctorSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings: settings || defaultDoctorSettings, loading };
}

export function useClinicCardSettings() {
  const [settings, setSettings] = useState<ClinicCardSettings | null>(clinicSettingsCache);
  const [loading, setLoading] = useState(!clinicSettingsCache);

  useEffect(() => {
    if (clinicSettingsCache) {
      setSettings(clinicSettingsCache);
      setLoading(false);
      return;
    }
    
    loadClinicSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  return { settings: settings || defaultClinicSettings, loading };
}

// Function to clear cache (call after saving settings in admin)
export function clearCardSettingsCache() {
  doctorSettingsCache = null;
  clinicSettingsCache = null;
  doctorSettingsPromise = null;
  clinicSettingsPromise = null;
}

// Preload settings at app startup to avoid flash
export async function preloadCardSettings() {
  await Promise.all([loadDoctorSettings(), loadClinicSettings()]);
}
