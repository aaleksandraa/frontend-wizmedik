/**
 * Early Google Consent Mode v2 bootstrap.
 * Loaded synchronously from index.html before gtag.js.
 * Keys must stay aligned with frontend/src/lib/cookie-consent.ts.
 */
(function () {
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
    security_storage: 'granted',
    wait_for_update: 500,
    ads_data_redaction: true,
  });

  try {
    var raw = localStorage.getItem('wm_cookie_consent_v2');
    if (!raw) {
      return;
    }

    var record = JSON.parse(raw);
    if (!record || record.version !== 3) {
      return;
    }

    if (record.expiresAt && new Date(record.expiresAt).getTime() < Date.now()) {
      return;
    }

    var preferences = record.preferences || {};
    gtag('consent', 'update', {
      analytics_storage: preferences.analytics ? 'granted' : 'denied',
      functionality_storage: preferences.functional ? 'granted' : 'denied',
      ad_storage: preferences.marketing ? 'granted' : 'denied',
      ad_user_data: preferences.marketing ? 'granted' : 'denied',
      ad_personalization: preferences.marketing ? 'granted' : 'denied',
    });
  } catch (_error) {
    // Ignore malformed consent records during bootstrap.
  }
})();
