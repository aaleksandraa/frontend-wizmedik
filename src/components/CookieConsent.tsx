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
    <>
      {/* Overlay/Backdrop - GDPR compliant dark background */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] animate-in fade-in duration-300"
        onClick={() => {}} // Prevent closing by clicking backdrop (GDPR requirement)
      />

      {/* Cookie Consent Modal - Centered on screen */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 border-b border-gray-200">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">
                  <Cookie className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Kolačići i Privatnost
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                    {settings.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!showCustomize ? (
                // Simple view - Quick accept/reject
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Koristimo kolačiće kako bismo poboljšali vaše iskustvo na našoj web stranici. 
                    Možete prihvatiti sve kolačiće, odbiti opcionalne ili prilagoditi svoje postavke.
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Više informacija:</span>
                    <Link 
                      to="/politika-privatnosti" 
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                    >
                      Politika privatnosti
                    </Link>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={handleAcceptAll}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      {settings.accept_button || 'Prihvati sve'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleRejectAll}
                      className="flex-1 border-2 font-semibold py-6 text-base hover:bg-gray-50"
                    >
                      <X className="h-5 w-5 mr-2" />
                      {settings.reject_button || 'Odbij opcionalne'}
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => setShowCustomize(true)}
                    className="w-full text-primary hover:text-primary/80 hover:bg-primary/5 font-medium"
                  >
                    Prilagodi postavke
                  </Button>
                </div>
              ) : (
                // Detailed view - Customize preferences (GDPR requirement)
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">
                    Odaberite koje vrste kolačića želite dozvoliti. Osnovni kolačići su neophodni za rad stranice.
                  </p>

                  {/* Essential Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Osnovni kolačići</h3>
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            Uvijek aktivni
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Neophodni za osnovne funkcije stranice kao što su navigacija i pristup sigurnim područjima. 
                          Stranica ne može pravilno funkcionisati bez ovih kolačića.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analytics Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Analitički kolačići</h3>
                          <button
                            onClick={() => togglePreference('analytics')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.analytics ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Pomažu nam da razumijemo kako posjetioci koriste stranicu prikupljanjem anonimnih podataka. 
                          Ovo nam omogućava da poboljšamo funkcionalnost i sadržaj.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Marketing Cookies */}
                  <div className="border border-gray-200 rounded-xl p-4 hover:border-primary/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Target className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">Marketing kolačići</h3>
                          <button
                            onClick={() => togglePreference('marketing')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences.marketing ? 'bg-primary' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Koriste se za prikazivanje relevantnih oglasa i mjerenje efikasnosti kampanja. 
                          Mogu pratiti vašu aktivnost na različitim web stranicama.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setShowCustomize(false)}
                      className="flex-1 border-2 font-medium"
                    >
                      Nazad
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold"
                    >
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Sačuvaj postavke
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Vaše postavke možete promijeniti u bilo kojem trenutku u{' '}
                <Link to="/politika-privatnosti" className="text-primary hover:underline font-medium">
                  Politici privatnosti
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
