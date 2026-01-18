import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Droplet, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { CitySelect } from '@/components/CitySelect';

export default function RegisterSpa() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vrste, setVrste] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    naziv: '',
    grad: '',
    adresa: '',
    telefon: '',
    email: '', // Javni email - prikazuje se na profilu
    account_email: '', // Email za nalog - za prijavu
    website: '',
    opis: '',
    kontakt_ime: '',
    kontakt_prezime: '',
    password: '',
    password_confirmation: '',
    vrste: [] as number[],
    medicinski_nadzor: false,
    ima_smjestaj: false,
    napomena: '',
    prihvatam_uslove: false,
  });

  useEffect(() => {
    fetchVrste();
  }, []);

  const fetchVrste = async () => {
    try {
      const response = await api.get('/banje/filter-options');
      if (response.data.success) {
        setVrste(response.data.data.vrste || []);
      }
    } catch (error) {
      console.error('Error fetching vrste:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.prihvatam_uslove) {
      toast({
        title: 'Greška',
        description: 'Morate prihvatiti uslove korištenja',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/register/spa', formData);
      setSubmitted(true);
      toast({
        title: 'Uspješno',
        description: 'Vaš zahtjev za registraciju je poslan. Kontaktiraćemo vas uskoro.',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri slanju zahtjeva',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVrsta = (id: number) => {
    setFormData(prev => ({
      ...prev,
      vrste: prev.vrste.includes(id)
        ? prev.vrste.filter(v => v !== id)
        : [...prev.vrste, id]
    }));
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Zahtjev poslan!</h2>
              <p className="text-muted-foreground mb-6">
                Vaš zahtjev za registraciju banje je uspješno poslan. 
                Naš tim će pregledati vaše podatke i kontaktirati vas u najkraćem roku.
              </p>
              <Button onClick={() => navigate('/')}>Nazad na početnu</Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Registracija banje - wizMedik</title>
        <meta name="description" content="Registrujte vašu banju na wizMedik platformi" />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Droplet className="h-10 w-10 text-cyan-600" />
              <h1 className="text-3xl font-bold">Registracija banje</h1>
            </div>
            <p className="text-muted-foreground">
              Popunite formu ispod da registrujete vašu banju na našoj platformi
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Podaci o banji</CardTitle>
              <CardDescription>Unesite osnovne informacije o vašoj banji</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="naziv">Naziv banje *</Label>
                    <Input
                      id="naziv"
                      value={formData.naziv}
                      onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                      placeholder="npr. Banja Vrućica"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresa">Adresa *</Label>
                    <Input
                      id="adresa"
                      value={formData.adresa}
                      onChange={(e) => setFormData({ ...formData, adresa: e.target.value })}
                      placeholder="npr. Banjska ulica 1"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grad">Grad *</Label>
                    <CitySelect
                      value={formData.grad}
                      onChange={(value) => setFormData({ ...formData, grad: value })}
                      showIcon={false}
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      placeholder="+387 xx xxx xxx"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email za javnost *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@banja.ba"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ovaj email će biti prikazan na vašem profilu
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://www.banja.ba"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="opis">Opis banje *</Label>
                  <Textarea
                    id="opis"
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    placeholder="Opišite vašu banju, usluge koje nudite, specijalizacije..."
                    rows={4}
                    required
                  />
                </div>

                {/* Vrste */}
                {vrste.length > 0 && (
                  <div>
                    <Label className="mb-3 block">Vrsta banje</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vrste.map((vrsta) => (
                        <label key={vrsta.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.vrste.includes(vrsta.id)}
                            onCheckedChange={() => toggleVrsta(vrsta.id)}
                          />
                          <span className="text-sm">{vrsta.naziv}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.medicinski_nadzor}
                      onCheckedChange={(checked) => setFormData({ ...formData, medicinski_nadzor: !!checked })}
                    />
                    <span>Medicinski nadzor</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.ima_smjestaj}
                      onCheckedChange={(checked) => setFormData({ ...formData, ima_smjestaj: !!checked })}
                    />
                    <span>Ima smještaj</span>
                  </label>
                </div>

                {/* Contact Person */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Kontakt osoba i pristup nalogu</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="kontakt_ime">Ime *</Label>
                      <Input
                        id="kontakt_ime"
                        value={formData.kontakt_ime}
                        onChange={(e) => setFormData({ ...formData, kontakt_ime: e.target.value })}
                        placeholder="Vaše ime"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="kontakt_prezime">Prezime *</Label>
                      <Input
                        id="kontakt_prezime"
                        value={formData.kontakt_prezime}
                        onChange={(e) => setFormData({ ...formData, kontakt_prezime: e.target.value })}
                        placeholder="Vaše prezime"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3">Podaci za pristup profilu</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Unesite email adresu i lozinku koje ćete koristiti za prijavu na vaš profil.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="account_email">Email za prijavu *</Label>
                        <Input
                          id="account_email"
                          type="email"
                          value={formData.account_email}
                          onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                          placeholder="vas.email@gmail.com"
                          required
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          Ovaj email koristite za prijavu. Može biti različit od javnog emaila.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Lozinka *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Minimalno 12 karaktera"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="password_confirmation">Potvrdi lozinku *</Label>
                          <Input
                            id="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            placeholder="Ponovi lozinku"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      Lozinka mora sadržavati velika i mala slova, brojeve i specijalne karaktere.
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="napomena">Dodatne napomene</Label>
                  <Textarea
                    id="napomena"
                    value={formData.napomena}
                    onChange={(e) => setFormData({ ...formData, napomena: e.target.value })}
                    placeholder="Bilo kakve dodatne informacije..."
                    rows={3}
                  />
                </div>

                {/* Terms */}
                <div className="border-t pt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                      checked={formData.prihvatam_uslove}
                      onCheckedChange={(checked) => setFormData({ ...formData, prihvatam_uslove: !!checked })}
                      className="mt-1"
                    />
                    <span className="text-sm text-muted-foreground">
                      Prihvatam uslove korištenja i politiku privatnosti. Razumijem da će moji podaci 
                      biti pregledani od strane administratora prije odobravanja registracije.
                    </span>
                  </label>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Slanje...
                    </>
                  ) : (
                    'Pošalji zahtjev za registraciju'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
}
