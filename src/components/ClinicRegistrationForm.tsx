import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  Mail,
  Lock,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySelect } from '@/components/CitySelect';
import { specialtiesAPI } from '@/services/api';
import { SpecialtyMultiSelect } from '@/components/SpecialtyMultiSelect';

interface Specialty {
  id: number;
  naziv: string;
  parent_id?: number | null;
  children?: Specialty[];
}

const registrationSchema = z
  .object({
    naziv: z.string().min(3, 'Naziv mora imati najmanje 3 karaktera'),
    ime: z.string().min(2, 'Ime kontakt osobe mora imati najmanje 2 karaktera'),
    email: z.string().email('Unesite validnu email adresu'),
    telefon: z.string().min(9, 'Unesite validan broj telefona'),
    password: z
      .string()
      .min(12, 'Lozinka mora imati najmanje 12 karaktera')
      .regex(/[A-Z]/, 'Lozinka mora sadrzati veliko slovo')
      .regex(/[a-z]/, 'Lozinka mora sadrzati malo slovo')
      .regex(/[0-9]/, 'Lozinka mora sadrzati broj')
      .regex(/[^A-Za-z0-9]/, 'Lozinka mora sadrzati specijalni karakter'),
    password_confirmation: z.string(),
    adresa: z.string().min(5, 'Adresa mora imati najmanje 5 karaktera'),
    grad: z.string().min(2, 'Grad mora imati najmanje 2 karaktera'),
    website: z.string().url('Unesite validnu URL adresu').optional().or(z.literal('')),
    specialty_ids: z.array(z.number()).min(1, 'Odaberite najmanje jednu specijalnost'),
    message: z.string().optional(),
    terms_accepted: z.boolean().refine((val) => val === true, 'Morate prihvatiti uslove koristenja'),
    privacy_accepted: z.boolean().refine((val) => val === true, 'Morate prihvatiti politiku privatnosti'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Lozinke se ne poklapaju',
    path: ['password_confirmation'],
  });

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  { id: 1, title: 'Klinika', icon: Building2 },
  { id: 2, title: 'Kontakt osoba', icon: User },
  { id: 3, title: 'Kontakt info', icon: Mail },
  { id: 4, title: 'Sigurnost', icon: Lock },
  { id: 5, title: 'Lokacija', icon: MapPin },
];

export function ClinicRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      naziv: '',
      ime: '',
      email: '',
      telefon: '',
      password: '',
      password_confirmation: '',
      adresa: '',
      grad: '',
      website: '',
      specialty_ids: [],
      message: '',
      terms_accepted: false,
      privacy_accepted: false,
    },
  });

  useEffect(() => {
    let isMounted = true;

    const loadSpecialties = async () => {
      try {
        const response = await specialtiesAPI.getAll();
        if (!isMounted) return;

        const specialtiesList = Array.isArray(response.data)
          ? response.data
          : (response.data?.data || []);

        setSpecialties(specialtiesList);
      } catch (fetchError) {
        console.error('Error fetching clinic specialties:', fetchError);
      } finally {
        if (isMounted) {
          setLoadingSpecialties(false);
        }
      }
    };

    loadSpecialties();

    return () => {
      isMounted = false;
    };
  }, []);

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['naziv', 'website', 'specialty_ids'];
      case 2:
        return ['ime'];
      case 3:
        return ['email', 'telefon'];
      case 4:
        return ['password', 'password_confirmation'];
      case 5:
        return ['adresa', 'grad', 'terms_accepted', 'privacy_accepted'];
      default:
        return [];
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate as never);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/register/clinic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(errorMessages);
        }

        throw new Error(result.message || 'Greska prilikom registracije');
      }

      setSuccess(true);
    } catch (submitError: any) {
      setError(submitError.message || 'Doslo je do greske. Pokusajte ponovo.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
          <h2 className="text-3xl font-bold mb-4">Uspjesno!</h2>
          <p className="text-lg text-gray-600 mb-2">Vas zahtjev za registraciju je uspjesno poslat.</p>
          <p className="text-gray-500 mb-6">
            Molimo provjerite vas email za verifikaciju. Provjerite i spam folder ako ne vidite email.
          </p>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-800">
              Verifikacioni email je poslat na <strong>{watch('email')}</strong>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                    currentStep >= step.id ? 'bg-primary text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  <step.icon className="w-6 h-6" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.id ? 'text-primary' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all ${
                    currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-600 text-white border-red-700">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <div className="font-bold mb-2">Greske u formi:</div>
            <div className="whitespace-pre-line text-sm">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Informacije o klinici</h3>
              <div>
                <Label htmlFor="naziv">Naziv klinike *</Label>
                <Input id="naziv" {...register('naziv')} className="mt-1" />
                {errors.naziv && <p className="text-sm text-red-600 mt-1">{errors.naziv.message}</p>}
              </div>
              <div>
                <Label htmlFor="website">Website (opciono)</Label>
                <Input
                  id="website"
                  {...register('website')}
                  placeholder="https://www.vasa-klinika.ba"
                  className="mt-1"
                />
                {errors.website && <p className="text-sm text-red-600 mt-1">{errors.website.message}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  <Label>Oblasti i specijalnosti *</Label>
                </div>
                <SpecialtyMultiSelect
                  specialties={specialties}
                  selectedIds={watch('specialty_ids') || []}
                  onChange={(ids) => setValue('specialty_ids', ids, { shouldDirty: true, shouldValidate: true })}
                  error={errors.specialty_ids?.message}
                />
                {loadingSpecialties && (
                  <p className="text-sm text-muted-foreground">Ucitavanje specijalnosti...</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Kontakt osoba</h3>
              <div>
                <Label htmlFor="ime">Ime kontakt osobe *</Label>
                <Input id="ime" {...register('ime')} className="mt-1" />
                {errors.ime && <p className="text-sm text-red-600 mt-1">{errors.ime.message}</p>}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Kontakt informacije</h3>
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
                  Minimalno 12 karaktera, ukljucujuci velika i mala slova, brojeve i specijalne karaktere
                </p>
              </div>
              <div>
                <Label htmlFor="password_confirmation">Potvrdite lozinku *</Label>
                <Input
                  id="password_confirmation"
                  type="password"
                  {...register('password_confirmation')}
                  className="mt-1"
                />
                {errors.password_confirmation && (
                  <p className="text-sm text-red-600 mt-1">{errors.password_confirmation.message}</p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 5 && (
            <motion.div
              key="step5"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Lokacija i uslovi</h3>
              <div>
                <Label htmlFor="adresa">Adresa *</Label>
                <Input id="adresa" {...register('adresa')} className="mt-1" />
                {errors.adresa && <p className="text-sm text-red-600 mt-1">{errors.adresa.message}</p>}
              </div>
              <div>
                <Label htmlFor="grad">Grad *</Label>
                <CitySelect
                  value={watch('grad') || ''}
                  onChange={(value) => setValue('grad', value, { shouldDirty: true, shouldValidate: true })}
                  error={!!errors.grad}
                  showIcon={false}
                />
                {errors.grad && <p className="text-sm text-red-600 mt-1">{errors.grad.message}</p>}
              </div>
              <div>
                <Label htmlFor="message">Dodatna poruka (opciono)</Label>
                <Textarea id="message" {...register('message')} rows={4} className="mt-1" />
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms_accepted"
                    checked={watch('terms_accepted')}
                    onCheckedChange={(checked) =>
                      setValue('terms_accepted', checked as boolean, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                  <label htmlFor="terms_accepted" className="text-sm leading-none">
                    Prihvatam <a href="/terms-of-service" className="text-primary hover:underline" target="_blank" rel="noreferrer">uslove koristenja</a> *
                  </label>
                </div>
                {errors.terms_accepted && (
                  <p className="text-sm text-red-600">{errors.terms_accepted.message}</p>
                )}

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy_accepted"
                    checked={watch('privacy_accepted')}
                    onCheckedChange={(checked) =>
                      setValue('privacy_accepted', checked as boolean, { shouldDirty: true, shouldValidate: true })
                    }
                  />
                  <label htmlFor="privacy_accepted" className="text-sm leading-none">
                    Prihvatam <a href="/privacy-policy" className="text-primary hover:underline" target="_blank" rel="noreferrer">politiku privatnosti</a> *
                  </label>
                </div>
                {errors.privacy_accepted && (
                  <p className="text-sm text-red-600">{errors.privacy_accepted.message}</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between pt-6 border-t">
          <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 1}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Nazad
          </Button>

          {currentStep < steps.length ? (
            <Button type="button" onClick={nextStep}>
              Dalje
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Slanje...
                </>
              ) : (
                'Posalji zahtjev'
              )}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
