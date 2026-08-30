const ADSENSE_SCRIPT_ID = 'google-adsense-script';

const ADSENSE_ALLOWED_PATHS = [/^\/apoteka\//, /^\/lijekovi\//];

export function isAdSenseAllowedPath(pathname: string): boolean {
  return ADSENSE_ALLOWED_PATHS.some((pattern) => pattern.test(pathname));
}

export function loadAdSenseScript(client: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => resolve();
    document.head.appendChild(script);
  });
}

export function unloadAdSenseScript(): void {
  document.getElementById(ADSENSE_SCRIPT_ID)?.remove();

  document
    .querySelectorAll(
      'ins.adsbygoogle-noablate, iframe[id^="google_ads_iframe"], div[id^="google_ads_iframe"], div.aswift_'
    )
    .forEach((element) => element.remove());

  delete (window as Window & { adsbygoogle?: unknown[] }).adsbygoogle;
}
