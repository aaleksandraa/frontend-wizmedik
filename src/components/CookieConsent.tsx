import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { legalAPI } from '@/services/api';
import { Cookie, X, Shield, BarChart3, Target, CheckCircle2 } from 'lucide-react';

interface CookieSettings {
  enabled: boolean;
  text: string;
  accept_button: string;
  reject_button: string;
}

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsent() {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (consent) return;

    // Fetch cookie settings
    const fetchSettings = async () => {
      try {
        const response = await legalAPI.getCookieSettings();
        const data = response.data;
        if (data.enabled) {
          setSettings(data);
          setVisible(true);
        }
      } catch (error: any) {
        // Silently fail if endpoint doesn't exist (404) or other errors
        // Cookie consent is optional feature
        if (error.response?.status !== 404) {
          console.error('Error fetching cookie settings:', error);
        }
      }
    };

    fetchSettings();
  }, []);

  const handleAcceptAll = () => {
    const consent = {
      status: 'accepted',
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setVisible(false);
  };

  const handleRejectAll = () => {
    const consent = {
      status: 'rejected',
      essential: true, // Essential cookies always enabled
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setVisible(false);
  };

  const handleSavePreferences = () => {
    const consent = {
      status: 'customized',
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consent));
    setVisible(false);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'essential') return; // Cannot disable essential cookies
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!visible || !settings) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 animate-in slide-in-from-bottom duration-300"
      style={{ zIndex: 99999 }}
    >
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {!showCustomize ? (
            // Compact view - Single line on desktop
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Left side - Message */}
              <div className="flex items-center gap-3 flex-1">
                <Cookie className="h-5 w-5 text-primary flex-shrink-0 hidden sm:block" />
                <p className="text-sm text-gray-700">
                  Koristimo kolačiće za poboljšanje vašeg iskustva.{' '}
                  <Link 
                    to="/politika-privatnosti" 
                    className="text-primary hover:underline font-medium"
                  >
                    Saznajte više
                  </Link>
                </p>
              </div>

              {/* Right side - Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomize(true)}
                  className="text-gray-600 hover:text-gray-900 text-sm"
                >
                  Postavke
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="text-sm"
                >
                  Odbij
                </Button>
                <Button
                  size="sm"
                  onClick={handleAcceptAll}
                  className="bg-primary hover:bg-primary/90 text-white text-sm"
                >
                  Prihvati sve
                </Button>
              </div>
            </div>
          ) : (
            // Detailed view - Customize preferences
            <div className="py-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Postavke kolačića</h3>
                <button
                  onClick={() => setShowCustomize(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {/* Essential Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Osnovni</p>
                      <p className="text-xs text-gray-500">Neophodni za rad stranice</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    Uvijek aktivni
                  </span>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Analitički</p>
                      <p className="text-xs text-gray-500">Anonimni podaci za poboljšanje</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      preferences.analytics ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.analytics ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Marketing</p>
                      <p className="text-xs text-gray-500">Relevantni oglasi</p>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePreference('marketing')}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      preferences.marketing ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        preferences.marketing ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomize(false)}
                  className="flex-1 text-sm"
                >
                  Nazad
                </Button>
                <Button
                  size="sm"
                  onClick={handleSavePreferences}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white text-sm"
                >
                  Sačuvaj
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
