import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { legalAPI } from '@/services/api';
import { Cookie, X } from 'lucide-react';

interface CookieSettings {
  enabled: boolean;
  text: string;
  accept_button: string;
  reject_button: string;
}

export function CookieConsent() {
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [visible, setVisible] = useState(false);

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
      } catch (error) {
        console.error('Error fetching cookie settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie_consent', 'rejected');
    setVisible(false);
  };

  if (!visible || !settings) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex p-3 bg-primary/10 rounded-full flex-shrink-0">
              <Cookie className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                {settings.text}{' '}
                <Link to="/politika-privatnosti" className="text-primary hover:underline font-medium">
                  Politika privatnosti
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleReject}
              className="order-2 sm:order-1"
            >
              {settings.reject_button}
            </Button>
            <Button
              onClick={handleAccept}
              className="order-1 sm:order-2 bg-primary hover:bg-primary/90"
            >
              {settings.accept_button}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
