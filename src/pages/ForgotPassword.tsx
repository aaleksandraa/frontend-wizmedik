import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/password/forgot', { email });
      setSent(true);
      toast.success('Link za resetovanje lozinke je poslan na vaš email');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri slanju emaila');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-card shadow-strong">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-8 w-8 text-primary mr-2" />
            <h1 className="text-2xl font-bold text-foreground">MediBIH</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Zaboravljena lozinka
          </h2>
          <p className="text-muted-foreground">
            Unesite email adresu i poslaćemo vam link za resetovanje lozinke
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-foreground">
              Link za resetovanje lozinke je poslan na <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Provjerite vaš inbox i spam folder. Link će isteći za 60 minuta.
            </p>
            <Link to="/auth">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Nazad na prijavu
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                Email adresa
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vasa@email.com"
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              variant="medical"
              disabled={submitting}
            >
              {submitting ? 'Slanje...' : 'Pošalji link za resetovanje'}
            </Button>

            <div className="text-center">
              <Link to="/auth">
                <Button variant="ghost" className="text-primary hover:text-primary-dark">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nazad na prijavu
                </Button>
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
