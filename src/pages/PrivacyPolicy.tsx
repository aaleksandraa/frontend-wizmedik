import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { legalAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const [title, setTitle] = useState('Politika privatnosti');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { openPreferences } = useCookieConsent();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await legalAPI.getPrivacyPolicy();
        setTitle(response.data.title || 'Politika privatnosti');
        setContent(response.data.content || '');
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  return (
    <>
      <Helmet>
        <title>{title} - WizMedik</title>
        <meta name="description" content="Politika privatnosti - saznajte kako prikupljamo i koristimo vaše podatke." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>

            <Button onClick={openPreferences} variant="outline" className="rounded-xl">
              Postavke kolacica i privatnosti
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 md:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : content ? (
                <div 
                  className="prose prose-gray max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                />
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Sadržaj nije dostupan.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
}

