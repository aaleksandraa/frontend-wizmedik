import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import api from '@/services/api';
import { toast } from 'sonner';

const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{12,}$/;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Nevazeci link za resetovanje lozinke');
    }
  }, [token, email]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      toast.error('Lozinke se ne podudaraju');
      return;
    }

    if (!passwordPolicy.test(password)) {
      toast.error('Lozinka mora imati najmanje 12 karaktera, veliko i malo slovo, broj i specijalni znak');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/password/reset', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(true);
      toast.success('Lozinka je uspjesno resetovana');
      setTimeout(() => navigate('/auth'), 3000);
    } catch (requestError: any) {
      toast.error(requestError.response?.data?.message || 'Greska pri resetovanju lozinke');
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
            <h1 className="text-2xl font-bold text-foreground">WizMedik</h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Resetovanje lozinke</h2>
        </div>

        {error ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <p className="text-foreground">{error}</p>
            <Link to="/forgot-password">
              <Button variant="outline" className="mt-4">
                Zatrazite novi link
              </Button>
            </Link>
          </div>
        ) : success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <p className="text-foreground">Vasa lozinka je uspjesno resetovana.</p>
            <p className="text-sm text-muted-foreground">
              Preusmjeravamo vas na stranicu za prijavu...
            </p>
            <Link to="/auth">
              <Button variant="medical" className="mt-4">
                Prijavi se
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2 text-foreground">
                Nova lozinka
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="********"
                  className="pl-10"
                  minLength={12}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Najmanje 12 karaktera, veliko i malo slovo, broj i specijalni znak.
              </p>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-medium mb-2 text-foreground">
                Potvrdite lozinku
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password_confirmation"
                  type="password"
                  required
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  placeholder="********"
                  className="pl-10"
                  minLength={12}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" variant="medical" disabled={submitting}>
              {submitting ? 'Resetovanje...' : 'Resetuj lozinku'}
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
