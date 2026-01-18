import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, Building2, User, Mail, Lock, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySelect } from '@/components/CitySelect';

const registrationSchema = z.object({
  naziv: z.string().min(3, 'Naziv mora imati najmanje 3 karaktera'),
  ime: z.string().min(2, 'Ime kontakt osobe mora imati najmanje 2 karaktera'),
  email: z.string().email('Unesite validnu email adresu'),
  telefon: z.string().min(9, 'Unesite validan broj telefona'),
  password: z.string()
    .min(12, 'Lozinka mora imati najmanje 12 karaktera')
    .regex(/[A-Z]/, 'Lozinka mora sadržati veliko slovo')
    .regex(/[a-z]/, 'Lozinka mora sadržati malo slovo')
    .regex(/[0-9]/, 'Lozinka mora sadržati broj')
    .regex(/[^A-Za-z0-9]/, 'Lozinka mora sadržati specijalni karakter'),
  password_confirmation: z.string(),
  adresa: z.string().min(5, 'Adresa mora imati najmanje 5 karaktera'),
  grad: z.string().min(2, 'Grad mora imati najmanje 2 karaktera'),
  website: z.string().url('Unesite validnu URL adresu').optional().or(z.literal('')),
  message: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, 'Morate prihvatiti uslove korištenja'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Morate prihvatiti politiku privatnosti'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Lozinke se ne poklapaju',
  path: ['password_confirmation'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  { id: 1, title: 'Klinika', icon: Building2 },
  { id: 2, title: 'Kontakt Osoba', icon: User },
  { id: 3, title: 'Kontakt Info', icon: Mail },
  { id: 4, title: 'Sigurnost', icon: Lock },
  { id: 5, title: 'Lokacija', icon: MapPin },
];

export function ClinicRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as any);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1: return ['naziv'];
      case 2: return ['ime'];
      case 3: return ['email', 'telefon'];
      case 4: return ['password', 'password_confirmation'];
      case 5: return ['adresa', 'grad'];
      default: return [];
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/api/register/clinic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat().join(' ');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Greška prilikom registracije');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške. Pokušajte ponovo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Uspješno!</h2>
          <p className="text-lg text-gray-600 mb-2">
            Vaš zahtjev za registraciju je uspješno poslat.
          </p>
          <p className="text-gray-500 mb-6">
            Molimo provjerite vaš email za verifikaciju. Provjerite i spam folder ako ne vidite email.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              📧 Verifikacioni email je poslat na <strong>{watch('email')}</strong>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                  currentStep >= step.id 
                    ? 'bg-primary text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                }`}>
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                  currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Clinic Name */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Informacije o Klinici</h3>
              <div>
                <Label htmlFor="naziv">Naziv Klinike *</Label>
                <Input id="naziv" {...register('naziv')} className="mt-1" />
                {errors.naziv && <p className="text-sm text-red-600 mt-1">{errors.naziv.message}</p>}
              </div>
              <div>
                <Label htmlFor="website">Website (opciono)</Label>
                <Input id="website" {...register('website')} placeholder="https://www.vasa-klinika.ba" className="mt-1" />
                {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact Person */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Kontakt Osoba</h3>
              <div>
                <Label htmlFor="ime">Ime Kontakt Osobe *</Label>
                <Input id="ime" {...register('ime')} className="mt-1" />
                {errors.ime && <p className="text-sm text-red-600 mt-1">{errors.ime.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Kontakt Informacije</h3>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} className="mt-1" />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input id="telefon" {...register('telefon')} placeholder="+387 XX XXX XXX" className="mt-1" />
                {errors.telefon && <p className="text-sm text-red-600 mt-1">{errors.telefon.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 4: Security */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Sigurnost</h3>
              <div>
                <Label htmlFor="password">Lozinka *</Label>
                <Input id="password" type="password" {...register('password')} className="mt-1" />
                {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Minimalno 12 karaktera, uključujući velika i mala slova, brojeve i specijalne karaktere
                </p>
              </div>
              <div>
                <Label htmlFor="password_confirmation">Potvrdite Lozinku *</Label>
                <Input id="password_confirmation" type="password" {...register('password_confirmation')} className="mt-1" />
                {errors.password_confirmation && <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>}
              </div>
            </motion.div>
          )}

          {/* Step 5: Location & Terms */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Lokacija i Uslovi</h3>
              <div>
                <Label htmlFor="adresa">Adresa *</Label>
                <Input id="adresa" {...register('adresa')} className="mt-1" />
                {errors.adresa && <p className="text-sm text-red-600 mt-1">{errors.adresa.message}</p>}
              </div>
              <div>
                <Label htmlFor="grad">Grad *</Label>
                <CitySelect
                  value={watch('grad') || ''}
                  onChange={(value) => setValue('grad', value)}
                  error={!!errors.grad}
                  showIcon={false}
                />
                {errors.grad && <p className="text-sm text-red-600 mt-1">{errors.grad.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Dodatna Poruka (opciono)</Label>
                <Textarea id="message" {...register('message')} rows={4} className="mt-1" />
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms_accepted" 
                    onCheckedChange={(checked) => setValue('terms_accepted', checked as boolean)}
                  />
                  <label htmlFor="terms_accepted" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Prihvatam <a href="/terms-of-service" className="text-primary hover:underline" target="_blank">uslove korištenja</a> *
                  </label>
                </div>
                {errors.terms_accepted && <p className="text-sm text-red-600">{errors.terms_accepted.message}</p>}

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="privacy_accepted" 
                    onCheckedChange={(checked) => setValue('privacy_accepted', checked as boolean)}
                  />
                  <label htmlFor="privacy_accepted" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Prihvatam <a href="/privacy-policy" className="text-primary hover:underline" target="_blank">politiku privatnosti</a> *
                  </label>
                </div>
                {errors.privacy_accepted && <p className="text-sm text-red-600">{errors.privacy_accepted.message}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad
            </Button>
          )}
          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep} className="ml-auto">
              Sljedeće
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="ml-auto" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Slanje...
                </>
              ) : (
                'Pošalji Zahtjev'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
