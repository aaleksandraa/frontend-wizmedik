import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Helmet } from 'react-helmet-async';
import { legalAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const [title, setTitle] = useState('Politika privatnosti');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

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
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">{title}</h1>
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
      </div>
    </>
  );
}

