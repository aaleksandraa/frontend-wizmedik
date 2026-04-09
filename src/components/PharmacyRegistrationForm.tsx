import { useState } from 'react';
import DOMPurify from 'dompurify';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CitySelect } from '@/components/CitySelect';
import { useToast } from '@/components/ui/use-toast';
import { legalAPI, registrationAPI } from '@/services/api';
import { Loader2 } from 'lucide-react';

type FormState = {
  naziv_brenda: string;
  pravni_naziv: string;
  broj_licence: string;
  ime: string;
  email: string;
  account_email: string;
  telefon: string;
  website: string;
  opis: string;
  branch_naziv: string;
  adresa: string;
  grad: string;
  grad_id: string;
  postanski_broj: string;
  latitude: string;
  longitude: string;
  google_maps_link: string;
  is_24h: boolean;
  kratki_opis: string;
  password: string;
  password_confirmation: string;
  message: string;
  prihvatam_uslove: boolean;
};

const initialState: FormState = {
  naziv_brenda: '',
  pravni_naziv: '',
  broj_licence: '',
  ime: '',
  email: '',
  account_email: '',
  telefon: '',
  website: '',
  opis: '',
  branch_naziv: '',
  adresa: '',
  grad: '',
  grad_id: '',
  postanski_broj: '',
  latitude: '',
  longitude: '',
  google_maps_link: '',
  is_24h: false,
  kratki_opis: '',
  password: '',
  password_confirmation: '',
  message: '',
  prihvatam_uslove: false,
};

export function PharmacyRegistrationForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [showTermsContent, setShowTermsContent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: termsData, isLoading: termsLoading } = useQuery({
    queryKey: ['legal-inline', 'pharmacy-terms-of-service'],
    queryFn: () => legalAPI.getTermsOfService(),
    enabled: showTermsContent,
    staleTime: 5 * 60 * 1000,
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.account_email || !form.password) {
      toast({
        title: 'Greska',
        description: 'Email za prijavu i lozinka su obavezni.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.prihvatam_uslove) {
      toast({
        title: 'Greska',
        description: 'Morate prihvatiti uslove koristenja.',
        variant: 'destructive',
      });
      return;
    }

    if (!form.grad_id) {
      toast({
        title: 'Greska',
        description: 'Molimo odaberite grad iz ponudjene liste.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        grad_id: form.grad_id ? Number(form.grad_id) : undefined,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      };

      await registrationAPI.registerPharmacy(payload);
      toast({
        title: 'Uspjesno',
        description: 'Zahtjev je poslan. Provjerite email za verifikaciju.',
      });

      navigate('/auth', {
        state: {
          message: 'Registracija apoteke je uspjesna. Provjerite email za verifikaciju.',
        },
      });
    } catch (error: any) {
      toast({
        title: 'Greska',
        description: error.response?.data?.message || 'Registracija nije uspjela.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Registracija apoteke</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="rounded-xl border p-4 space-y-4 bg-gray-50/60">
              <h3 className="font-semibold text-gray-900">Podaci o apoteci</h3>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Naziv brenda *</Label>
                  <Input value={form.naziv_brenda} onChange={(e) => setField('naziv_brenda', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Pravni naziv</Label>
                  <Input value={form.pravni_naziv} onChange={(e) => setField('pravni_naziv', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Broj licence</Label>
                  <Input value={form.broj_licence} onChange={(e) => setField('broj_licence', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Kontakt osoba *</Label>
                  <Input value={form.ime} onChange={(e) => setField('ime', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Telefon *</Label>
                  <Input value={form.telefon} onChange={(e) => setField('telefon', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Javni email *</Label>
                  <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Website</Label>
                  <Input value={form.website} onChange={(e) => setField('website', e.target.value)} placeholder="https://..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Opis apoteke</Label>
                  <Textarea value={form.opis} onChange={(e) => setField('opis', e.target.value)} rows={3} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Naziv poslovnice</Label>
                  <Input value={form.branch_naziv} onChange={(e) => setField('branch_naziv', e.target.value)} placeholder="Glavna poslovnica" />
                </div>
                <div className="space-y-2">
                  <Label>Grad *</Label>
                  <CitySelect
                    value={form.grad}
                    valueId={form.grad_id}
                    onChange={(value) => setField('grad', value)}
                    onSelectCity={(city) => setField('grad_id', city ? String(city.id) : '')}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Adresa poslovnice *</Label>
                  <Input value={form.adresa} onChange={(e) => setField('adresa', e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Postanski broj</Label>
                  <Input value={form.postanski_broj} onChange={(e) => setField('postanski_broj', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Google Maps link</Label>
                  <Input value={form.google_maps_link} onChange={(e) => setField('google_maps_link', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input value={form.latitude} onChange={(e) => setField('latitude', e.target.value)} placeholder="43.8563" />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input value={form.longitude} onChange={(e) => setField('longitude', e.target.value)} placeholder="18.4131" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Kratki opis poslovnice</Label>
                  <Textarea value={form.kratki_opis} onChange={(e) => setField('kratki_opis', e.target.value)} rows={2} />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_24h}
                  onChange={(e) => setField('is_24h', e.target.checked)}
                />
                Poslovnica radi 24/7
              </label>
            </div>

            <div className="rounded-xl border p-4 space-y-4 bg-white">
              <h3 className="font-semibold text-gray-900">Podaci o korisnickom pristupu</h3>
              <p className="text-sm text-gray-600">
                Ovaj email i lozinka koriste se za prijavu na dashboard.
              </p>

              <div className="space-y-2">
                <Label>Email za prijavu *</Label>
                <Input
                  type="email"
                  value={form.account_email}
                  onChange={(e) => setField('account_email', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Lozinka *</Label>
                <Input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Potvrda lozinke *</Label>
                <Input
                  type="password"
                  value={form.password_confirmation}
                  onChange={(e) => setField('password_confirmation', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Dodatna poruka</Label>
                <Textarea value={form.message} onChange={(e) => setField('message', e.target.value)} rows={3} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.prihvatam_uslove}
                  onChange={(e) => setField('prihvatam_uslove', e.target.checked)}
                  required
                />
                <span>
                  Prihvatam{' '}
                  <button
                    type="button"
                    className="text-primary hover:underline"
                    onClick={() => setShowTermsContent((prev) => !prev)}
                  >
                    uslove koristenja
                  </button>{' '}
                  *{' '}
                  <Link to="/uslovi-koristenja" target="_blank" className="text-primary hover:underline">
                    (otvori stranicu)
                  </Link>
                </span>
              </label>
              {showTermsContent ? (
                <div className="ml-6 p-4 bg-muted/30 border rounded-md">
                  <p className="text-sm font-semibold mb-2">
                    {termsData?.data?.title || 'Uslovi koristenja'}
                  </p>
                  {termsLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Ucitavanje uslova...
                    </div>
                  ) : termsData?.data?.content ? (
                    <div
                      className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsData.data.content) }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Sadrzaj nije dostupan.</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Slanje...
                </>
              ) : (
                'Posalji zahtjev'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
