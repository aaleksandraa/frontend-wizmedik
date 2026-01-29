import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://wizmedik.com/api';

export default function VerifyEmail() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [autoApproved, setAutoApproved] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`${API_URL}/verify-email/${token}`);
      
      setStatus('success');
      setMessage(response.data.message || 'Email je uspješno verifikovan!');
      setAutoApproved(response.data.auto_approved || false);
      
      // Redirect to login after 5 seconds if auto-approved
      if (response.data.auto_approved) {
        setTimeout(() => {
          navigate('/auth');
        }, 5000);
      }
    } catch (error: any) {
      setStatus('error');
      
      if (error.response?.data?.message) {
        setMessage(error.response.data.message);
      } else if (error.response?.status === 404) {
        setMessage('Link za verifikaciju nije validan ili je istekao.');
      } else if (error.response?.status === 400) {
        setMessage('Email je već verifikovan.');
      } else {
        setMessage('Došlo je do greške prilikom verifikacije emaila. Molimo pokušajte ponovo.');
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Verifikacija Emaila | wizMedik</title>
        <meta name="description" content="Verifikacija email adrese za wizMedik platformu" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />

        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Verifikacija Emaila
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {status === 'loading' && (
                <div className="text-center py-8">
                  <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Verifikujem email adresu...</p>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Uspješno!
                  </h3>
                  <p className="text-gray-600 mb-6">{message}</p>
                  
                  {autoApproved ? (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-600">
                        Vaš nalog je automatski odobren. Možete se prijaviti.
                      </p>
                      <Button onClick={() => navigate('/auth')} className="w-full">
                        Prijavi se
                      </Button>
                      <p className="text-xs text-gray-500">
                        Bićete automatski preusmjereni za 5 sekundi...
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                          <strong>Sljedeći korak:</strong> Vaš zahtjev za registraciju će biti pregledan od strane administratora. 
                          Dobićete email obavještenje kada vaš nalog bude odobren.
                        </p>
                      </div>
                      <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                        Nazad na početnu
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {status === 'error' && (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Greška
                  </h3>
                  <p className="text-gray-600 mb-6">{message}</p>
                  
                  <div className="space-y-3">
                    <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
                      Prijavi se
                    </Button>
                    <Button onClick={() => navigate('/contact')} variant="ghost" className="w-full">
                      Kontaktiraj podršku
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Footer />
      </div>
    </>
  );
}
