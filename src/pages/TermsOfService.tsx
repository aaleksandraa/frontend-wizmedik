import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import DOMPurify from 'dompurify';
import { legalAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  const [title, setTitle] = useState('Uslovi korištenja');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await legalAPI.getTermsOfService();
        setTitle(response.data.title || 'Uslovi korištenja');
        setContent(response.data.content || '');
      } catch (error) {
        console.error('Error fetching terms of service:', error);
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
        <meta name="description" content="Uslovi korištenja platforme WizMedik." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <FileText className="h-8 w-8 text-primary" />
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
