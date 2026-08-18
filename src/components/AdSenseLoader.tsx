import { useEffect } from 'react';
import { useAdSenseSettings } from '@/contexts/AdSenseContext';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

const ADSENSE_SCRIPT_ID = 'google-adsense-script';

export function AdSenseLoader() {
  const { settings, loading } = useAdSenseSettings();
  const { preferences } = useCookieConsent();

  const shouldLoadScript = !loading && settings.enabled && preferences.marketing;

  useEffect(() => {
    if (!shouldLoadScript) {
      return;
    }

    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(settings.client)}`;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }, [shouldLoadScript, settings.client]);

  return null;
}
