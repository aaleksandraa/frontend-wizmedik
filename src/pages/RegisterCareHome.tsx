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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Home, CheckCircle, Loader2 } from 'lucide-react';
import api from '@/services/api';
import { CitySelect } from '@/components/CitySelect';

export default function RegisterCareHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>(null);

  const [formData, setFormData] = useState({
    naziv: '',
    grad: '',
    adresa: '',
    telefon: '',
    email: '', // Javni email - prikazuje se na profilu
    account_email: '', // Email za nalog - za prijavu
    website: '',
    opis: '',
    tip_doma_id: '',
    nivo_njege_id: '',
    programi_njege: [] as number[],
    nurses_availability: 'shifts',
    doctor_availability: 'on_call',
    has_physiotherapist: false,
    has_physiatrist: false,
    emergency_protocol: false,
    kontakt_ime: '',
    password: '',
    password_confirmation: '',
    napomena: '',
    prihvatam_uslove: false,
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get('/domovi-njega/filter-options');
      if (response.data.success) {
        setFilterOptions(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
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
      await api.post('/register/care-home', formData);
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

  const toggleProgram = (id: number) => {
    setFormData(prev => ({
      ...prev,
      programi_njege: prev.programi_njege.includes(id)
        ? prev.programi_njege.filter(p => p !== id)
        : [...prev.programi_njege, id]
    }));
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Zahtjev poslan!</h2>
              <p className="text-muted-foreground mb-6">
                Vaš zahtjev za registraciju doma je uspješno poslan. 
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
        <title>Registracija doma za njegu - wizMedik</title>
        <meta name="description" content="Registrujte vaš dom za njegu na wizMedik platformi" />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="h-10 w-10 text-purple-600" />
              <h1 className="text-3xl font-bold">Registracija doma za njegu</h1>
            </div>
            <p className="text-muted-foreground">
              Popunite formu ispod da registrujete vaš dom za njegu na našoj platformi
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Podaci o domu</CardTitle>
              <CardDescription>Unesite osnovne informacije o vašem domu</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="naziv">Naziv doma *</Label>
                    <Input
                      id="naziv"
                      value={formData.naziv}
                      onChange={(e) => setFormData({ ...formData, naziv: e.target.value })}
                      placeholder='npr. Dom za starije "Sunce"'
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="adresa">Adresa *</Label>
                    <Input
                      id="adresa"
                      value={formData.adresa}
                      onChange={(e) => setFormData({ ...formData, adresa: e.target.value })}
                      placeholder="Ulica i broj"
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
                      placeholder="info@dom.ba"
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
                      placeholder="https://www.dom.ba"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="opis">Opis doma *</Label>
                  <Textarea
                    id="opis"
                    value={formData.opis}
                    onChange={(e) => setFormData({ ...formData, opis: e.target.value })}
                    placeholder="Opišite vaš dom, usluge koje nudite, kapacitet..."
                    rows={4}
                    required
                  />
                </div>

                {/* Type and Level */}
                {filterOptions && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tip doma *</Label>
                      <Select
                        value={formData.tip_doma_id}
                        onValueChange={(value) => setFormData({ ...formData, tip_doma_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberite tip doma" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.tipovi_domova?.map((tip: any) => (
                            <SelectItem key={tip.id} value={tip.id.toString()}>
                              {tip.naziv}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nivo njege *</Label>
                      <Select
                        value={formData.nivo_njege_id}
                        onValueChange={(value) => setFormData({ ...formData, nivo_njege_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Odaberite nivo njege" />
                        </SelectTrigger>
                        <SelectContent>
                          {filterOptions.nivoi_njege?.map((nivo: any) => (
                            <SelectItem key={nivo.id} value={nivo.id.toString()}>
                              {nivo.naziv}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Programs */}
                {filterOptions?.programi_njege?.length > 0 && (
                  <div>
                    <Label className="mb-3 block">Programi njege</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {filterOptions.programi_njege.map((program: any) => (
                        <label key={program.id} className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={formData.programi_njege.includes(program.id)}
                            onCheckedChange={() => toggleProgram(program.id)}
                          />
                          <span className="text-sm">{program.naziv}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Staff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Dostupnost medicinskih sestara</Label>
                    <Select
                      value={formData.nurses_availability}
                      onValueChange={(value) => setFormData({ ...formData, nurses_availability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24_7">24/7</SelectItem>
                        <SelectItem value="shifts">Smjene</SelectItem>
                        <SelectItem value="on_demand">Po potrebi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Dostupnost ljekara</Label>
                    <Select
                      value={formData.doctor_availability}
                      onValueChange={(value) => setFormData({ ...formData, doctor_availability: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="permanent">Stalno</SelectItem>
                        <SelectItem value="periodic">Periodično</SelectItem>
                        <SelectItem value="on_call">Po pozivu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.has_physiotherapist}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_physiotherapist: !!checked })}
                    />
                    <span>Fizioterapeut</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.has_physiatrist}
                      onCheckedChange={(checked) => setFormData({ ...formData, has_physiatrist: !!checked })}
                    />
                    <span>Fizijatar</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={formData.emergency_protocol}
                      onCheckedChange={(checked) => setFormData({ ...formData, emergency_protocol: !!checked })}
                    />
                    <span>Protokol za hitne slučajeve</span>
                  </label>
                </div>

                {/* Contact Person */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">Kontakt osoba i pristup nalogu</h3>
                  <div>
                    <Label htmlFor="kontakt_ime">Ime i prezime *</Label>
                    <Input
                      id="kontakt_ime"
                      value={formData.kontakt_ime}
                      onChange={(e) => setFormData({ ...formData, kontakt_ime: e.target.value })}
                      placeholder="Vaše ime i prezime"
                      required
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">Podaci za pristup profilu</h4>
                    <p className="text-sm text-purple-700 mb-4">
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
                        <p className="text-xs text-purple-600 mt-1">
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
                    <p className="text-xs text-purple-600 mt-2">
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
