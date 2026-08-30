import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { isAdSenseAllowedPath, unloadAdSenseScript } from '@/lib/adsense-script';

export function AdSenseRouteCleanup() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (!isAdSenseAllowedPath(pathname)) {
      unloadAdSenseScript();
    }
  }, [pathname]);

  return null;
}
