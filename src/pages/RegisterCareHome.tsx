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
import { Home, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { CitySelect } from '@/components/CitySelect';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormError } from '@/components/ui/form-error';
import { validateEmail, validatePhone, validatePassword, validatePasswordConfirmation, validateRequired, validateUrl } from '@/utils/validation';
import { HoneypotField } from '@/components/HoneypotField';
import { checkRateLimit, recordAttempt, formatTimeRemaining, validateHoneypot, calculateSubmissionTime, isSuspiciouslyFast } from '@/utils/antispam';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterCareHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filterOptions, setFilterOptions] = useState<any>(null);
  const [honeypot, setHoneypot] = useState('');
  const [formStartTime] = useState(Date.now());
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const [backendErrors, setBackendErrors] = useState<Record<string, string[]>>({});

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

  // Setup validation
  const { errors, touched, validateField, validateAllFields, setFieldTouched } = useFormValidation({
    naziv: (value) => validateRequired(value, 'Naziv doma'),
    adresa: (value) => validateRequired(value, 'Adresa'),
    grad: (value) => validateRequired(value, 'Grad'),
    telefon: (value) => validatePhone(value),
    email: (value) => validateEmail(value),
    website: (value) => validateUrl(value),
    opis: (value) => validateRequired(value, 'Opis'),
    kontakt_ime: (value) => validateRequired(value, 'Ime kontakt osobe'),
    account_email: (value) => validateEmail(value),
    password: (value) => validatePassword(value),
    password_confirmation: (value, formData) => validatePasswordConfirmation(formData?.password || '', value),
  });

  // Check rate limit on mount
  useEffect(() => {
    const rateLimit = checkRateLimit('care-home');
    if (!rateLimit.allowed && rateLimit.resetTime) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetTime);
      setRateLimitError(`Previše pokušaja registracije. Pokušajte ponovo za ${timeRemaining}.`);
    }
  }, []);

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
    setBackendErrors({});

    // Check rate limit
    const rateLimit = checkRateLimit('care-home');
    if (!rateLimit.allowed && rateLimit.resetTime) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetTime);
      setRateLimitError(`Previše pokušaja registracije. Pokušajte ponovo za ${timeRemaining}.`);
      toast({
        title: 'Previše pokušaja',
        description: `Molimo sačekajte ${timeRemaining} prije ponovnog pokušaja.`,
        variant: 'destructive',
      });
      return;
    }

    // Honeypot check (anti-spam)
    if (!validateHoneypot(honeypot)) {
      console.warn('Honeypot triggered - possible bot');
      // Don't show error to user, just silently fail
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        toast({
          title: 'Greška',
          description: 'Došlo je do greške. Molimo pokušajte ponovo.',
          variant: 'destructive',
        });
      }, 2000);
      return;
    }

    // Check submission time (anti-spam)
    const submissionTime = calculateSubmissionTime(formStartTime);
    if (isSuspiciouslyFast(submissionTime)) {
      console.warn('Suspiciously fast submission - possible bot');
      toast({
        title: 'Greška',
        description: 'Molimo popunite formu pažljivo.',
        variant: 'destructive',
      });
      return;
    }

    // Validate all fields
    if (!validateAllFields(formData)) {
      toast({
        title: 'Greška',
        description: 'Molimo ispravite greške u formi',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.prihvatam_uslove) {
      toast({
        title: 'Greška',
        description: 'Morate prihvatiti uslove korištenja',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    recordAttempt('care-home');

    try {
      await api.post('/register/care-home', formData);
      setSubmitted(true);
      toast({
        title: 'Uspješno',
        description: 'Vaš zahtjev za registraciju je poslan. Kontaktiraćemo vas uskoro.',
      });
    } catch (error: any) {
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
        const firstError = Object.values(error.response.data.errors)[0];
        toast({
          title: 'Greška validacije',
          description: Array.isArray(firstError) ? firstError[0] : 'Molimo provjerite unesene podatke',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Greška',
          description: error.response?.data?.message || 'Greška pri slanju zahtjeva',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value, formData);
    }
  };

  const handleFieldBlur = (field: string) => {
    setFieldTouched(field);
    validateField(field, formData[field as keyof typeof formData], formData);
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
                {/* Honeypot field (anti-spam) */}
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                {/* Rate limit warning */}
                {rateLimitError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{rateLimitError}</AlertDescription>
                  </Alert>
                )}

                {/* Backend errors */}
                {Object.keys(backendErrors).length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        {Object.entries(backendErrors).map(([field, messages]) => (
                          <div key={field}>
                            <strong>{field}:</strong> {Array.isArray(messages) ? messages.join(', ') : messages}
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="naziv">Naziv doma *</Label>
                    <Input
                      id="naziv"
                      name="naziv"
                      value={formData.naziv}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('naziv')}
                      placeholder='npr. Dom za starije "Sunce"'
                      className={touched.naziv && errors.naziv ? 'border-red-500' : ''}
                      required
                    />
                    <FormError error={touched.naziv ? errors.naziv : undefined} />
                  </div>
                  <div>
                    <Label htmlFor="adresa">Adresa *</Label>
                    <Input
                      id="adresa"
                      name="adresa"
                      value={formData.adresa}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('adresa')}
                      placeholder="Ulica i broj"
                      className={touched.adresa && errors.adresa ? 'border-red-500' : ''}
                      required
                    />
                    <FormError error={touched.adresa ? errors.adresa : undefined} />
                  </div>
                  <div>
                    <Label htmlFor="grad">Grad *</Label>
                    <CitySelect
                      value={formData.grad}
                      onChange={(value) => {
                        setFormData({ ...formData, grad: value });
                        if (touched.grad) validateField('grad', value, formData);
                      }}
                      showIcon={false}
                    />
                    <FormError error={touched.grad ? errors.grad : undefined} />
                  </div>
                  <div>
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('telefon')}
                      placeholder="+387 xx xxx xxx"
                      className={touched.telefon && errors.telefon ? 'border-red-500' : ''}
                      required
                    />
                    <FormError error={touched.telefon ? errors.telefon : undefined} />
                  </div>
                  <div>
                    <Label htmlFor="email">Email za javnost *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="info@dom.ba"
                      className={touched.email && errors.email ? 'border-red-500' : ''}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ovaj email će biti prikazan na vašem profilu
                    </p>
                    <FormError error={touched.email ? errors.email : undefined} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('website')}
                      placeholder="wizmedik.com"
                      className={touched.website && errors.website ? 'border-red-500' : ''}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Možete unijeti bez https://
                    </p>
                    <FormError error={touched.website ? errors.website : undefined} />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="opis">Opis doma *</Label>
                  <Textarea
                    id="opis"
                    name="opis"
                    value={formData.opis}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('opis')}
                    placeholder="Opišite vaš dom, usluge koje nudite, kapacitet..."
                    rows={4}
                    className={touched.opis && errors.opis ? 'border-red-500' : ''}
                    required
                  />
                  <FormError error={touched.opis ? errors.opis : undefined} />
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
                      name="kontakt_ime"
                      value={formData.kontakt_ime}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('kontakt_ime')}
                      placeholder="Vaše ime i prezime"
                      className={touched.kontakt_ime && errors.kontakt_ime ? 'border-red-500' : ''}
                      required
                    />
                    <FormError error={touched.kontakt_ime ? errors.kontakt_ime : undefined} />
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
                          name="account_email"
                          type="email"
                          value={formData.account_email}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('account_email')}
                          placeholder="vas.email@gmail.com"
                          className={touched.account_email && errors.account_email ? 'border-red-500' : ''}
                          required
                        />
                        <p className="text-xs text-purple-600 mt-1">
                          Ovaj email koristite za prijavu. Može biti različit od javnog emaila.
                        </p>
                        <FormError error={touched.account_email ? errors.account_email : undefined} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="password">Lozinka *</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur('password')}
                            placeholder="Minimalno 12 karaktera"
                            className={touched.password && errors.password ? 'border-red-500' : ''}
                            required
                          />
                          <FormError error={touched.password ? errors.password : undefined} />
                        </div>
                        <div>
                          <Label htmlFor="password_confirmation">Potvrdi lozinku *</Label>
                          <Input
                            id="password_confirmation"
                            name="password_confirmation"
                            type="password"
                            value={formData.password_confirmation}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur('password_confirmation')}
                            placeholder="Ponovi lozinku"
                            className={touched.password_confirmation && errors.password_confirmation ? 'border-red-500' : ''}
                            required
                          />
                          <FormError error={touched.password_confirmation ? errors.password_confirmation : undefined} />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-purple-600 mt-2">
                      Lozinka mora imati 12+ karaktera, velika i mala slova, brojeve i specijalne karaktere.
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

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  disabled={loading || Object.keys(errors).length > 0}
                >
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
