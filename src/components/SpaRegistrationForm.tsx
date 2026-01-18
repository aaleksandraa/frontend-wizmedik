import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { 
  Droplet, Building2, MapPin, Phone, Mail, Lock, 
  ArrowRight, ArrowLeft, CheckCircle, Loader2 
} from 'lucide-react';
import { registrationAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';

interface FormData {
  // Step 1: Basic Info
  naziv: string;
  email: string;
  telefon: string;
  
  // Step 2: Location
  adresa: string;
  grad: string;
  
  // Step 3: Contact Person
  kontakt_ime: string;
  kontakt_prezime: string;
  
  // Step 4: Account
  password: string;
  password_confirmation: string;
  
  // Step 5: Additional
  message?: string;
}

const STEPS = [
  { id: 1, title: 'Osnovne Informacije', icon: Droplet },
  { id: 2, title: 'Lokacija', icon: MapPin },
  { id: 3, title: 'Kontakt Osoba', icon: Building2 },
  { id: 4, title: 'Nalog', icon: Lock },
  { id: 5, title: 'Dodatno', icon: CheckCircle },
];

export function SpaRegistrationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    naziv: '',
    email: '',
    telefon: '',
    adresa: '',
    grad: '',
    kontakt_ime: '',
    kontakt_prezime: '',
    password: '',
    password_confirmation: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    switch (step) {
      case 1:
        if (!formData.naziv.trim()) newErrors.naziv = 'Naziv je obavezan';
        if (!formData.email.trim()) newErrors.email = 'Email je obavezan';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Nevažeći email format';
        if (!formData.telefon.trim()) newErrors.telefon = 'Telefon je obavezan';
        break;
      case 2:
        if (!formData.adresa.trim()) newErrors.adresa = 'Adresa je obavezna';
        if (!formData.grad.trim()) newErrors.grad = 'Grad je obavezan';
        break;
      case 3:
        if (!formData.kontakt_ime.trim()) newErrors.kontakt_ime = 'Ime je obavezno';
        if (!formData.kontakt_prezime.trim()) newErrors.kontakt_prezime = 'Prezime je obavezno';
        break;
      case 4:
        if (!formData.password) newErrors.password = 'Lozinka je obavezna';
        else if (formData.password.length < 12) newErrors.password = 'Lozinka mora imati najmanje 12 karaktera';
        if (formData.password !== formData.password_confirmation) {
          newErrors.password_confirmation = 'Lozinke se ne poklapaju';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      await registrationAPI.registerSpa({
        ...formData,
        prihvatam_uslove: true,
      });
      
      toast({
        title: 'Uspješno!',
        description: 'Zahtjev za registraciju je poslat. Provjerite email za verifikaciju.',
      });

      navigate('/auth', { 
        state: { 
          message: 'Registracija uspješna! Provjerite email za verifikaciju.' 
        } 
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Došlo je do greške prilikom registracije',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Korak {currentStep} od {STEPS.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <StepIcon className="w-6 h-6" />
                  )}
                </div>
                <span className="text-xs mt-2 text-center hidden md:block max-w-[80px]">
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 w-8 md:w-16 mx-2 transition-all ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const CurrentIcon = STEPS[currentStep - 1].icon;
              return <CurrentIcon className="w-5 h-5" />;
            })()}
            {STEPS[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Unesite osnovne informacije o banji'}
            {currentStep === 2 && 'Gdje se nalazi vaša banja?'}
            {currentStep === 3 && 'Ko je kontakt osoba?'}
            {currentStep === 4 && 'Kreirajte nalog za pristup'}
            {currentStep === 5 && 'Dodatne informacije (opciono)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="naziv">Naziv Banje *</Label>
                    <Input
                      id="naziv"
                      placeholder="npr. Banja Vrućica"
                      value={formData.naziv}
                      onChange={(e) => updateFormData('naziv', e.target.value)}
                      className={errors.naziv ? 'border-red-500' : ''}
                    />
                    {errors.naziv && <p className="text-sm text-red-500">{errors.naziv}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="info@banja.ba"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="telefon"
                        type="tel"
                        placeholder="+387 53 123 456"
                        value={formData.telefon}
                        onChange={(e) => updateFormData('telefon', e.target.value)}
                        className={`pl-10 ${errors.telefon ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.telefon && <p className="text-sm text-red-500">{errors.telefon}</p>}
                  </div>
                </>
              )}

              {/* Step 2: Location */}
              {currentStep === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="adresa">Adresa *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                      <Textarea
                        id="adresa"
                        placeholder="Ulica i broj"
                        value={formData.adresa}
                        onChange={(e) => updateFormData('adresa', e.target.value)}
                        className={`pl-10 ${errors.adresa ? 'border-red-500' : ''}`}
                        rows={3}
                      />
                    </div>
                    {errors.adresa && <p className="text-sm text-red-500">{errors.adresa}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grad">Grad *</Label>
                    <Input
                      id="grad"
                      placeholder="npr. Teslić"
                      value={formData.grad}
                      onChange={(e) => updateFormData('grad', e.target.value)}
                      className={errors.grad ? 'border-red-500' : ''}
                    />
                    {errors.grad && <p className="text-sm text-red-500">{errors.grad}</p>}
                  </div>
                </>
              )}

              {/* Step 3: Contact Person */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="kontakt_ime">Ime Kontakt Osobe *</Label>
                    <Input
                      id="kontakt_ime"
                      placeholder="npr. Marko"
                      value={formData.kontakt_ime}
                      onChange={(e) => updateFormData('kontakt_ime', e.target.value)}
                      className={errors.kontakt_ime ? 'border-red-500' : ''}
                    />
                    {errors.kontakt_ime && <p className="text-sm text-red-500">{errors.kontakt_ime}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kontakt_prezime">Prezime Kontakt Osobe *</Label>
                    <Input
                      id="kontakt_prezime"
                      placeholder="npr. Marković"
                      value={formData.kontakt_prezime}
                      onChange={(e) => updateFormData('kontakt_prezime', e.target.value)}
                      className={errors.kontakt_prezime ? 'border-red-500' : ''}
                    />
                    {errors.kontakt_prezime && <p className="text-sm text-red-500">{errors.kontakt_prezime}</p>}
                    <p className="text-sm text-gray-500">
                      Osoba koja će biti odgovorna za upravljanje nalogom
                    </p>
                  </div>
                </>
              )}

              {/* Step 4: Account */}
              {currentStep === 4 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Lozinka *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Minimalno 12 karaktera"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Potvrdi Lozinku *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password_confirmation"
                        type="password"
                        placeholder="Ponovi lozinku"
                        value={formData.password_confirmation}
                        onChange={(e) => updateFormData('password_confirmation', e.target.value)}
                        className={`pl-10 ${errors.password_confirmation ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.password_confirmation && (
                      <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                    )}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Sigurnost:</strong> Koristite jaku lozinku sa kombinacijom velikih i malih slova, brojeva i specijalnih karaktera.
                    </p>
                  </div>
                </>
              )}

              {/* Step 5: Additional */}
              {currentStep === 5 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="message">Dodatna Poruka (Opciono)</Label>
                    <Textarea
                      id="message"
                      placeholder="Napišite dodatne informacije ili pitanja..."
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Gotovo!</h4>
                    <p className="text-sm text-green-800">
                      Nakon slanja zahtjeva, dobićete email za verifikaciju. Nakon verifikacije, admin će pregledati vaš zahtjev i odobriti ga u najkraćem roku.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || loading}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Nazad
            </Button>

            {currentStep < STEPS.length ? (
              <Button onClick={handleNext} disabled={loading} className="gap-2">
                Dalje
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Slanje...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Pošalji Zahtjev
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
