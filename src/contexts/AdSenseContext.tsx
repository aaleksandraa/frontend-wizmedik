import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { settingsAPI } from '@/services/api';

export interface AdSenseSettings {
  enabled: boolean;
  client: string;
}

interface AdSenseContextValue {
  settings: AdSenseSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const DEFAULT_ADSENSE_CLIENT = 'ca-pub-1407310093643341';

const defaultSettings: AdSenseSettings = {
  enabled: false,
  client: DEFAULT_ADSENSE_CLIENT,
};

const AdSenseContext = createContext<AdSenseContextValue | undefined>(undefined);

export function AdSenseProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AdSenseSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await settingsAPI.getAdSenseSettings();
      setSettings({
        enabled: Boolean(data?.enabled),
        client: data?.client || DEFAULT_ADSENSE_CLIENT,
      });
    } catch (error) {
      console.error('Error fetching AdSense settings:', error);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings: fetchSettings,
    }),
    [settings, loading],
  );

  return <AdSenseContext.Provider value={value}>{children}</AdSenseContext.Provider>;
}

export function useAdSenseSettings() {
  const context = useContext(AdSenseContext);
  if (!context) {
    throw new Error('useAdSenseSettings must be used within AdSenseProvider');
  }
  return context;
}
