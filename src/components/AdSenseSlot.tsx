import { useEffect, useRef } from 'react';
import { useAdSenseSettings } from '@/contexts/AdSenseContext';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSenseSlotProps {
  className?: string;
}

export function AdSenseSlot({ className }: AdSenseSlotProps) {
  const { settings, loading } = useAdSenseSettings();
  const { preferences } = useCookieConsent();
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  const shouldShowAd = !loading && settings.enabled && preferences.marketing;

  useEffect(() => {
    if (!shouldShowAd || !adRef.current || pushedRef.current) {
      return;
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (error) {
      console.error('AdSense push error:', error);
    }
  }, [shouldShowAd]);

  if (!shouldShowAd) {
    return null;
  }

  return (
    <div className={className ?? 'container mx-auto px-4 py-6'}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-lg border border-slate-200 bg-slate-50/50">
        <ins
          ref={adRef}
          className="adsbygoogle block min-h-[90px] w-full"
          style={{ display: 'block' }}
          data-ad-client={settings.client}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
