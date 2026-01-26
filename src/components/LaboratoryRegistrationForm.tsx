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
  FlaskConical, Building2, MapPin, Phone, Mail, Lock, 
  ArrowRight, ArrowLeft, CheckCircle, Loader2 
} from 'lucide-react';
import { registrationAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySelect } from '@/components/CitySelect';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormError } from '@/components/ui/form-error';
import { validateEmail, validatePhone, validatePassword, validatePasswordConfirmation, validateRequired } from '@/utils/validation';

interface FormData {
  // Step 1: Basic Info
  naziv: string;
  email: string; // Public email for profile
  telefon: string;
  
  // Step 2: Location
  adresa: string;
  grad: string;
  
  // Step 3: Contact Person
  ime: string;
  
  // Step 4: Account
  account_email: string; // Email for login
  password: string;
  password_confirmation: string;
  
  // Step 5: Additional
  message?: string;
}

const STEPS = [
  { id: 1, title: 'Osnovne Informacije', icon: FlaskConical },
  { id: 2, title: 'Lokacija', icon: MapPin },
  { id: 3, title: 'Kontakt Osoba', icon: Building2 },
  { id: 4, title: 'Nalog', icon: Lock },
  { id: 5, title: 'Dodatno', icon: CheckCircle },
];

export function LaboratoryRegistrationForm() {
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
    ime: '',
    account_email: '',
    password: '',
    password_confirmation: '',
    message: '',
  });

  // Setup validation
  const { errors, touched, validateField, validateAllFields, setFieldTouched } = useFormValidation({
    naziv: (value) => validateRequired(value, 'Naziv'),
    email: (value) => validateEmail(value),
    telefon: (value) => validatePhone(value),
    adresa: (value) => validateRequired(value, 'Adresa'),
    grad: (value) => validateRequired(value, 'Grad'),
    ime: (value) => validateRequired(value, 'Ime kontakt osobe'),
    account_email: (value) => validateEmail(value),
    password: (value) => validatePassword(value),
    password_confirmation: (value, formData) => validatePasswordConfirmation(formData?.password || '', value),
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Validate field if touched
    if (touched[field]) {
      validateField(field, value, formData);
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    setFieldTouched(field);
    validateField(field, formData[field], formData);
  };

  const validateStep = (step: number): boolean => {
    const fieldsToValidate: (keyof FormData)[] = [];

    switch (step) {
      case 1:
        fieldsToValidate.push('naziv', 'email', 'telefon');
        break;
      case 2:
        fieldsToValidate.push('adresa', 'grad');
        break;
      case 3:
        fieldsToValidate.push('ime');
        break;
      case 4:
        fieldsToValidate.push('account_email', 'password', 'password_confirmation');
        break;
    }

    // Mark fields as touched and validate
    fieldsToValidate.forEach(field => {
      setFieldTouched(field);
      validateField(field, formData[field], formData);
    });

    // Check if any of the fields have errors
    return fieldsToValidate.every(field => !errors[field]);
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
    // Validate all fields before submit
    if (!validateAllFields(formData)) {
      toast({
        title: 'Greška',
        description: 'Molimo ispravite greške u formi',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await registrationAPI.registerLaboratory(formData);
      
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
            {currentStep === 1 && 'Unesite osnovne informacije o laboratoriji'}
            {currentStep === 2 && 'Gdje se nalazi vaša laboratorija?'}
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
                    <Label htmlFor="naziv">Naziv Laboratorije *</Label>
                    <Input
                      id="naziv"
                      name="naziv"
                      placeholder="npr. Laboratorija Sarajevo"
                      value={formData.naziv}
                      onChange={(e) => updateFormData('naziv', e.target.value)}
                      onBlur={() => handleFieldBlur('naziv')}
                      className={touched.naziv && errors.naziv ? 'border-red-500' : ''}
                    />
                    <FormError error={touched.naziv ? errors.naziv : undefined} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email za javnost *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="info@laboratorija.ba"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        onBlur={() => handleFieldBlur('email')}
                        className={`pl-10 ${touched.email && errors.email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <FormError error={touched.email ? errors.email : undefined} />
                    <p className="text-xs text-gray-500">Ovaj email će biti prikazan na vašem profilu</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="telefon"
                        name="telefon"
                        type="tel"
                        placeholder="+387 33 123 456"
                        value={formData.telefon}
                        onChange={(e) => updateFormData('telefon', e.target.value)}
                        onBlur={() => handleFieldBlur('telefon')}
                        className={`pl-10 ${touched.telefon && errors.telefon ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <FormError error={touched.telefon ? errors.telefon : undefined} />
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
                        name="adresa"
                        placeholder="Ulica i broj"
                        value={formData.adresa}
                        onChange={(e) => updateFormData('adresa', e.target.value)}
                        onBlur={() => handleFieldBlur('adresa')}
                        className={`pl-10 ${touched.adresa && errors.adresa ? 'border-red-500' : ''}`}
                        rows={3}
                      />
                    </div>
                    <FormError error={touched.adresa ? errors.adresa : undefined} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="grad">Grad *</Label>
                    <CitySelect
                      value={formData.grad}
                      onChange={(value) => {
                        updateFormData('grad', value);
                        if (touched.grad) validateField('grad', value, formData);
                      }}
                      showIcon={false}
                    />
                    <FormError error={touched.grad ? errors.grad : undefined} />
                  </div>
                </>
              )}

              {/* Step 3: Contact Person */}
              {currentStep === 3 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ime">Ime i Prezime Kontakt Osobe *</Label>
                    <Input
                      id="ime"
                      name="ime"
                      placeholder="npr. Marko Marković"
                      value={formData.ime}
                      onChange={(e) => updateFormData('ime', e.target.value)}
                      onBlur={() => handleFieldBlur('ime')}
                      className={touched.ime && errors.ime ? 'border-red-500' : ''}
                    />
                    <FormError error={touched.ime ? errors.ime : undefined} />
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
                    <Label htmlFor="account_email">Email za prijavu *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="account_email"
                        name="account_email"
                        type="email"
                        placeholder="vas.email@gmail.com"
                        value={formData.account_email}
                        onChange={(e) => updateFormData('account_email', e.target.value)}
                        onBlur={() => handleFieldBlur('account_email')}
                        className={`pl-10 ${touched.account_email && errors.account_email ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <FormError error={touched.account_email ? errors.account_email : undefined} />
                    <p className="text-xs text-gray-500">Ovaj email koristite za prijavu. Može biti različit od javnog emaila.</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Lozinka *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Minimalno 12 karaktera"
                        value={formData.password}
                        onChange={(e) => updateFormData('password', e.target.value)}
                        onBlur={() => handleFieldBlur('password')}
                        className={`pl-10 ${touched.password && errors.password ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <FormError error={touched.password ? errors.password : undefined} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirmation">Potvrdi Lozinku *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        id="password_confirmation"
                        name="password_confirmation"
                        type="password"
                        placeholder="Ponovi lozinku"
                        value={formData.password_confirmation}
                        onChange={(e) => updateFormData('password_confirmation', e.target.value)}
                        onBlur={() => handleFieldBlur('password_confirmation')}
                        className={`pl-10 ${touched.password_confirmation && errors.password_confirmation ? 'border-red-500' : ''}`}
                      />
                    </div>
                    <FormError error={touched.password_confirmation ? errors.password_confirmation : undefined} />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Sigurnost:</strong> Lozinka mora imati 12+ karaktera, velika i mala slova, brojeve i specijalne karaktere.
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
              <Button 
                onClick={handleNext} 
                disabled={loading || (currentStep === 4 && Object.keys(errors).length > 0)} 
                className="gap-2"
              >
                Dalje
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={loading || Object.keys(errors).length > 0} 
                className="gap-2"
              >
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
