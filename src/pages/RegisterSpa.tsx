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
import { Droplet, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import api from '@/services/api';
import { CitySelect } from '@/components/CitySelect';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormError } from '@/components/ui/form-error';
import { validateEmail, validatePhone, validatePassword, validatePasswordConfirmation, validateRequired, validateUrl } from '@/utils/validation';
import { HoneypotField } from '@/components/HoneypotField';
import { checkRateLimit, recordAttempt, formatTimeRemaining, validateHoneypot, calculateSubmissionTime, isSuspiciouslyFast } from '@/utils/antispam';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function RegisterSpa() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [vrste, setVrste] = useState<any[]>([]);
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

  // Setup validation
  const { errors, touched, validateField, validateAllFields, setFieldTouched } = useFormValidation({
    naziv: (value) => validateRequired(value, 'Naziv banje'),
    adresa: (value) => validateRequired(value, 'Adresa'),
    grad: (value) => validateRequired(value, 'Grad'),
    telefon: (value) => validatePhone(value),
    email: (value) => validateEmail(value),
    website: (value) => validateUrl(value),
    opis: (value) => validateRequired(value, 'Opis'),
    kontakt_ime: (value) => validateRequired(value, 'Ime'),
    kontakt_prezime: (value) => validateRequired(value, 'Prezime'),
    account_email: (value) => validateEmail(value),
    password: (value) => validatePassword(value),
    password_confirmation: (value, formData) => validatePasswordConfirmation(formData?.password || '', value),
  });

  useEffect(() => {
    const rateLimit = checkRateLimit('spa');
    if (!rateLimit.allowed && rateLimit.resetTime) {
      const timeRemaining = formatTimeRemaining(rateLimit.resetTime);
      setRateLimitError(`Previše pokušaja registracije. Pokušajte ponovo za ${timeRemaining}.`);
    }
  }, []);

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
    setBackendErrors({});

    const rateLimit = checkRateLimit('spa');
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

    if (!validateHoneypot(honeypot)) {
      console.warn('Honeypot triggered');
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

    const submissionTime = calculateSubmissionTime(formStartTime);
    if (isSuspiciouslyFast(submissionTime)) {
      toast({
        title: 'Greška',
        description: 'Molimo popunite formu pažljivo.',
        variant: 'destructive',
      });
      return;
    }

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
    recordAttempt('spa');

    try {
      await api.post('/register/spa', formData);
      setSubmitted(true);
      toast({
        title: 'Uspješno',
        description: 'Vaš zahtjev za registraciju je poslan. Kontaktiraćemo vas uskoro.',
      });
    } catch (error: any) {
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        setBackendErrors(error.response.data.errors);
        
        // Scroll to top to show error summary
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        const errorCount = Object.keys(error.response.data.errors).length;
        toast({
          title: `❌ ${errorCount} ${errorCount === 1 ? 'greška' : 'greške'} u formi`,
          description: 'Molimo pogledajte crvena polja i ispravite greške',
          variant: 'destructive',
          duration: 8000,
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
    
    // Clear backend error for this field when user starts typing
    if (backendErrors[name]) {
      setBackendErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (touched[name]) {
      validateField(name, value, formData);
    }
  };

  const handleFieldBlur = (field: string) => {
    setFieldTouched(field);
    validateField(field, formData[field as keyof typeof formData], formData);
  };

  // Helper function to get user-friendly field labels
  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      naziv: 'Naziv banje',
      adresa: 'Adresa',
      grad: 'Grad',
      telefon: 'Telefon',
      email: 'Email za javnost',
      account_email: 'Email za prijavu',
      website: 'Website',
      opis: 'Opis',
      kontakt_ime: 'Ime',
      kontakt_prezime: 'Prezime',
      password: 'Lozinka',
      password_confirmation: 'Potvrda lozinke',
    };
    return labels[field] || field;
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
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 flex items-center justify-center p-4">
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

      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-cyan-50 py-12">
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
                {/* Honeypot field (anti-spam) */}
                <HoneypotField value={honeypot} onChange={setHoneypot} />

                {/* Rate limit warning */}
                {rateLimitError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{rateLimitError}</AlertDescription>
                  </Alert>
                )}

                {/* Backend errors - PROMINENT DISPLAY */}
                {Object.keys(backendErrors).length > 0 && (
                  <div className="bg-red-600 text-white p-6 rounded-lg border-2 border-red-700 shadow-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-6 w-6 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-3">Greške u formi - molimo ispravite:</h3>
                        <div className="space-y-3">
                          {Object.entries(backendErrors).map(([field, messages]) => (
                            <div key={field} className="bg-red-700 p-3 rounded">
                              <div className="font-semibold text-base mb-1">
                                📌 {getFieldLabel(field)}
                              </div>
                              <div className="text-sm">
                                {Array.isArray(messages) ? messages.map((msg, i) => (
                                  <div key={i}>• {msg}</div>
                                )) : messages}
                              </div>
                              {/* Special treatment for password errors */}
                              {field === 'password' && messages.toString().includes('sigurnosnim probojima') && (
                                <div className="mt-2 text-xs bg-red-800 p-2 rounded">
                                  💡 Koristite sigurniju lozinku, npr: <code className="bg-red-900 px-1 py-0.5 rounded">W!zm3d!k#S3cur3$2025</code>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="naziv">Naziv banje *</Label>
                    <Input
                      id="naziv"
                      name="naziv"
                      value={formData.naziv}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('naziv')}
                      placeholder="npr. Banja Vrućica"
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
                      placeholder="npr. Banjska ulica 1"
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
                      className={`${touched.telefon && errors.telefon ? 'border-red-500' : ''} ${backendErrors.telefon ? 'border-red-600 border-2' : ''}`}
                      required
                    />
                    <FormError error={touched.telefon ? errors.telefon : undefined} />
                    {backendErrors.telefon && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                        <strong>Greška:</strong> {Array.isArray(backendErrors.telefon) ? backendErrors.telefon.join(', ') : backendErrors.telefon}
                      </div>
                    )}
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
                      placeholder="info@banja.ba"
                      className={`${touched.email && errors.email ? 'border-red-500' : ''} ${backendErrors.email ? 'border-red-600 border-2' : ''}`}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ovaj email će biti prikazan na vašem profilu
                    </p>
                    <FormError error={touched.email ? errors.email : undefined} />
                    {backendErrors.email && (
                      <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                        <strong>Greška:</strong> {Array.isArray(backendErrors.email) ? backendErrors.email.join(', ') : backendErrors.email}
                      </div>
                    )}
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
                  <Label htmlFor="opis">Opis banje *</Label>
                  <Textarea
                    id="opis"
                    name="opis"
                    value={formData.opis}
                    onChange={handleInputChange}
                    onBlur={() => handleFieldBlur('opis')}
                    placeholder="Opišite vašu banju, usluge koje nudite, specijalizacije..."
                    rows={4}
                    className={touched.opis && errors.opis ? 'border-red-500' : ''}
                    required
                  />
                  <FormError error={touched.opis ? errors.opis : undefined} />
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
                        name="kontakt_ime"
                        value={formData.kontakt_ime}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('kontakt_ime')}
                        placeholder="Vaše ime"
                        className={touched.kontakt_ime && errors.kontakt_ime ? 'border-red-500' : ''}
                        required
                      />
                      <FormError error={touched.kontakt_ime ? errors.kontakt_ime : undefined} />
                    </div>
                    <div>
                      <Label htmlFor="kontakt_prezime">Prezime *</Label>
                      <Input
                        id="kontakt_prezime"
                        name="kontakt_prezime"
                        value={formData.kontakt_prezime}
                        onChange={handleInputChange}
                        onBlur={() => handleFieldBlur('kontakt_prezime')}
                        placeholder="Vaše prezime"
                        className={touched.kontakt_prezime && errors.kontakt_prezime ? 'border-red-500' : ''}
                        required
                      />
                      <FormError error={touched.kontakt_prezime ? errors.kontakt_prezime : undefined} />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
                    <h4 className="font-medium text-cyan-900 mb-3">Podaci za pristup profilu</h4>
                    <p className="text-sm text-cyan-700 mb-4">
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
                          className={`${touched.account_email && errors.account_email ? 'border-red-500' : ''} ${backendErrors.account_email ? 'border-red-600 border-2' : ''}`}
                          required
                        />
                        <p className="text-xs text-cyan-600 mt-1">
                          Ovaj email koristite za prijavu. Može biti različit od javnog emaila.
                        </p>
                        <FormError error={touched.account_email ? errors.account_email : undefined} />
                        {backendErrors.account_email && (
                          <div className="mt-2 p-3 bg-red-100 border-2 border-red-400 rounded text-red-700 text-sm font-medium">
                            <strong>⚠️ Greška:</strong> {Array.isArray(backendErrors.account_email) ? backendErrors.account_email.join(', ') : backendErrors.account_email}
                          </div>
                        )}
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
                            className={`${touched.password && errors.password ? 'border-red-500' : ''} ${backendErrors.password ? 'border-red-600 border-2 bg-red-50' : ''}`}
                            required
                          />
                          <FormError error={touched.password ? errors.password : undefined} />
                          {backendErrors.password && (
                            <div className="mt-2 p-3 bg-red-600 text-white rounded-lg border-2 border-red-700 shadow-md">
                              <div className="flex items-start gap-2">
                                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-bold text-sm mb-1">🔒 PROBLEM SA LOZINKOM:</div>
                                  <div className="text-sm">
                                    {Array.isArray(backendErrors.password) ? backendErrors.password.map((msg, i) => (
                                      <div key={i} className="mb-1">• {msg}</div>
                                    )) : backendErrors.password}
                                  </div>
                                  <div className="mt-2 text-xs bg-red-700 p-2 rounded">
                                    💡 Koristite sigurniju lozinku, npr: <code className="bg-red-800 px-1 py-0.5 rounded">W!zm3d!k#S3cur3$2025</code> ili <code className="bg-red-800 px-1 py-0.5 rounded">Tr!b3$m0j@P@ssw0rd</code>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
                            className={`${touched.password_confirmation && errors.password_confirmation ? 'border-red-500' : ''} ${backendErrors.password_confirmation ? 'border-red-600 border-2' : ''}`}
                            required
                          />
                          <FormError error={touched.password_confirmation ? errors.password_confirmation : undefined} />
                          {backendErrors.password_confirmation && (
                            <div className="mt-2 p-2 bg-red-100 border border-red-400 rounded text-red-700 text-sm">
                              <strong>Greška:</strong> {Array.isArray(backendErrors.password_confirmation) ? backendErrors.password_confirmation.join(', ') : backendErrors.password_confirmation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-cyan-600 mt-2">
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
