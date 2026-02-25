import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, User, Mail, Lock, Briefcase, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { specialtiesAPI, legalAPI } from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { CitySelect } from '@/components/CitySelect';
import { SpecialtyMultiSelect } from '@/components/SpecialtyMultiSelect';
import { cn } from '@/lib/utils';

const registrationSchema = z.object({
  ime: z.string().min(2, 'Ime mora imati najmanje 2 karaktera'),
  prezime: z.string().min(2, 'Prezime mora imati najmanje 2 karaktera'),
  email: z.string().email('Unesite validnu email adresu'),
  telefon: z.string().min(9, 'Unesite validan broj telefona'),
  password: z.string()
    .min(12, 'Lozinka mora imati najmanje 12 karaktera')
    .regex(/[A-Z]/, 'Lozinka mora sadržati najmanje jedno veliko slovo (A-Z)')
    .regex(/[a-z]/, 'Lozinka mora sadržati najmanje jedno malo slovo (a-z)')
    .regex(/[0-9]/, 'Lozinka mora sadržati najmanje jedan broj (0-9)')
    .regex(/[^A-Za-z0-9]/, 'Lozinka mora sadržati najmanje jedan specijalni karakter (!@#$%^&*)'),
  password_confirmation: z.string().min(1, 'Potvrdite lozinku'),
  specialty_ids: z.array(z.number()).min(1, 'Odaberite najmanje jednu specijalnost'),
  adresa: z.string().min(5, 'Adresa mora imati najmanje 5 karaktera'),
  grad: z.string().min(2, 'Grad mora imati najmanje 2 karaktera'),
  message: z.string().optional(),
  terms_accepted: z.boolean().refine(val => val === true, 'Morate prihvatiti uslove korištenja'),
  privacy_accepted: z.boolean().refine(val => val === true, 'Morate prihvatiti politiku privatnosti'),
}).refine(data => data.password === data.password_confirmation, {
  message: 'Lozinke se ne poklapaju',
  path: ['password_confirmation'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const steps = [
  { id: 1, title: 'Lični Podaci', icon: User },
  { id: 2, title: 'Kontakt', icon: Mail },
  { id: 3, title: 'Sigurnost', icon: Lock },
  { id: 4, title: 'Profesionalno', icon: Briefcase },
  { id: 5, title: 'Lokacija', icon: MapPin },
];

export function DoctorRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepValidationAttempted, setStepValidationAttempted] = useState<Record<number, boolean>>({});
  const [showTermsContent, setShowTermsContent] = useState(false);
  const [showPrivacyContent, setShowPrivacyContent] = useState(false);

  const { data: specialties, isLoading: specialtiesLoading, isError: specialtiesError } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtiesAPI.getAll(),
    retry: 3,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: termsData, isLoading: termsLoading } = useQuery({
    queryKey: ['legal-inline', 'terms-of-service'],
    queryFn: () => legalAPI.getTermsOfService(),
    enabled: showTermsContent,
    staleTime: 5 * 60 * 1000,
  });

  const { data: privacyData, isLoading: privacyLoading } = useQuery({
    queryKey: ['legal-inline', 'privacy-policy'],
    queryFn: () => legalAPI.getPrivacyPolicy(),
    enabled: showPrivacyContent,
    staleTime: 5 * 60 * 1000,
  });

  const { register, handleSubmit, formState: { errors, touchedFields, isSubmitted }, setValue, watch, trigger, clearErrors } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange',
    defaultValues: {
      ime: '',
      prezime: '',
      email: '',
      telefon: '',
      password: '',
      password_confirmation: '',
      specialty_ids: [],
      adresa: '',
      grad: '',
      message: '',
      terms_accepted: false,
      privacy_accepted: false,
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    setStepValidationAttempted(prev => ({ ...prev, [currentStep]: true }));
    const isValid = await trigger(fieldsToValidate as any);
    
    if (!isValid) {
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (currentStep < steps.length) {
      const nextStepNumber = currentStep + 1;
      clearErrors(getFieldsForStep(nextStepNumber) as any);
      setCurrentStep(nextStepNumber);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1: return ['ime', 'prezime'];
      case 2: return ['email', 'telefon'];
      case 3: return ['password', 'password_confirmation'];
      case 4: return ['specialty_ids'];
      case 5: return ['adresa', 'grad', 'terms_accepted', 'privacy_accepted'];
      default: return [];
    }
  };

  const shouldShowStep5Error = (field: keyof RegistrationFormData) => {
    if (!errors[field]) return false;
    const touched = Boolean(touchedFields[field]);
    return touched || Boolean(stepValidationAttempted[5]) || isSubmitted;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${API_URL}/register/doctor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors with detailed display
        if (result.errors) {
          const errorMessages = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Greška prilikom registracije');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Došlo je do greške. Pokušajte ponovo.');
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitInvalid = () => {
    setStepValidationAttempted(prev => ({ ...prev, [currentStep]: true }));
    const firstError = document.querySelector('[data-error="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-800">
              📧 Verifikacioni email je poslat na <strong>{watch('email')}</strong>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading state while specialties are loading
  if (specialtiesLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-gray-600">Učitavanje forme...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* API Error Alert */}
      {specialtiesError && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-bold mb-2">Greška pri učitavanju podataka</div>
            <p className="text-sm">
              Trenutno ne možemo učitati listu specijalnosti. Molimo osvježite stranicu ili pokušajte kasnije.
            </p>
          </AlertDescription>
        </Alert>
      )}

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
        <Alert className="mb-6 bg-red-600 text-white border-red-700">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            <div className="font-bold mb-2">⚠️ Greške u formi:</div>
            <div className="whitespace-pre-line text-sm">{error}</div>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit, onSubmitInvalid)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Personal Info */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Lični Podaci</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ime">Ime *</Label>
                  <Input 
                    id="ime" 
                    {...register('ime')} 
                    className="mt-1"
                    data-error={!!errors.ime}
                  />
                  {errors.ime && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{errors.ime.message}</p>
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="prezime">Prezime *</Label>
                  <Input 
                    id="prezime" 
                    {...register('prezime')} 
                    className="mt-1"
                    data-error={!!errors.prezime}
                  />
                  {errors.prezime && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{errors.prezime.message}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Contact */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Kontakt Informacije</h3>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register('email')} 
                  className="mt-1"
                  data-error={!!errors.email}
                />
                {errors.email && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.email.message}</p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input 
                  id="telefon" 
                  {...register('telefon')} 
                  placeholder="+387 XX XXX XXX" 
                  className="mt-1"
                  data-error={!!errors.telefon}
                />
                {errors.telefon && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.telefon.message}</p>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">
                  Primjer: +387 61 123 456 ili 061/123-456
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 3: Security */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Sigurnost</h3>
              <div>
                <Label htmlFor="password">Lozinka *</Label>
                <Input 
                  id="password" 
                  type="password" 
                  {...register('password')} 
                  className="mt-1"
                  data-error={!!errors.password}
                />
                {errors.password && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.password.message}</p>
                  </div>
                )}
                <div className="mt-2 space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Lozinka mora sadržati:</p>
                  <ul className="text-xs space-y-1">
                    <li className={cn(
                      "flex items-center gap-1.5",
                      watch('password')?.length >= 12 ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        watch('password')?.length >= 12 ? "bg-green-600" : "bg-muted-foreground/30"
                      )} />
                      Najmanje 12 karaktera
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[A-Z]/.test(watch('password') || '') ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[A-Z]/.test(watch('password') || '') ? "bg-green-600" : "bg-muted-foreground/30"
                      )} />
                      Jedno veliko slovo (A-Z)
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[a-z]/.test(watch('password') || '') ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[a-z]/.test(watch('password') || '') ? "bg-green-600" : "bg-muted-foreground/30"
                      )} />
                      Jedno malo slovo (a-z)
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[0-9]/.test(watch('password') || '') ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[0-9]/.test(watch('password') || '') ? "bg-green-600" : "bg-muted-foreground/30"
                      )} />
                      Jedan broj (0-9)
                    </li>
                    <li className={cn(
                      "flex items-center gap-1.5",
                      /[^A-Za-z0-9]/.test(watch('password') || '') ? "text-green-600" : "text-muted-foreground"
                    )}>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        /[^A-Za-z0-9]/.test(watch('password') || '') ? "bg-green-600" : "bg-muted-foreground/30"
                      )} />
                      Jedan specijalni karakter (!@#$%^&*)
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <Label htmlFor="password_confirmation">Potvrdite Lozinku *</Label>
                <Input 
                  id="password_confirmation" 
                  type="password" 
                  {...register('password_confirmation')} 
                  className="mt-1"
                  data-error={!!errors.password_confirmation}
                />
                {errors.password_confirmation && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.password_confirmation.message}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Step 4: Professional */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-4"
            >
              <h3 className="text-2xl font-bold mb-6">Profesionalne Informacije</h3>
              <SpecialtyMultiSelect
                specialties={(specialties as any)?.data || []}
                selectedIds={watch('specialty_ids') || []}
                onChange={(ids) => setValue('specialty_ids', ids, { shouldValidate: true })}
                error={errors.specialty_ids?.message}
              />
              <div>
                <Label htmlFor="message">Dodatna Poruka (opciono)</Label>
                <Textarea id="message" {...register('message')} rows={4} className="mt-1" />
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
                <Input 
                  id="adresa" 
                  {...register('adresa')} 
                  className="mt-1"
                  data-error={shouldShowStep5Error('adresa')}
                  placeholder="Ulica i broj"
                />
                {shouldShowStep5Error('adresa') && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.adresa.message}</p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="grad">Grad *</Label>
                <div data-error={shouldShowStep5Error('grad')}>
                  <CitySelect
                    value={watch('grad') || ''}
                    onChange={(value) => setValue('grad', value, { shouldValidate: true, shouldTouch: true })}
                    error={shouldShowStep5Error('grad')}
                    showIcon={false}
                  />
                </div>
                {shouldShowStep5Error('grad') && (
                  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600 font-medium">{errors.grad.message}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="space-y-2">
                  <div className="flex items-start space-x-2" data-error={shouldShowStep5Error('terms_accepted')}>
                    <Checkbox 
                      id="terms_accepted" 
                      checked={Boolean(watch('terms_accepted'))}
                      onCheckedChange={(checked) => setValue('terms_accepted', checked === true, { shouldValidate: true, shouldTouch: true })}
                    />
                    <div className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <label htmlFor="terms_accepted">Prihvatam </label>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setShowTermsContent((prev) => !prev)}
                      >
                        uslove korištenja
                      </button>
                      <span> *</span>
                    </div>
                  </div>
                  {showTermsContent && (
                    <div className="ml-6 p-4 bg-muted/30 border rounded-md">
                      <p className="text-sm font-semibold mb-3">
                        {termsData?.data?.title || 'Uslovi korištenja'}
                      </p>
                      {termsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Učitavanje uslova...
                        </div>
                      ) : termsData?.data?.content ? (
                        <div
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(termsData.data.content) }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Sadržaj nije dostupan.</p>
                      )}
                    </div>
                  )}
                  {shouldShowStep5Error('terms_accepted') && (
                    <div className="ml-6 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{errors.terms_accepted.message}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2" data-error={shouldShowStep5Error('privacy_accepted')}>
                    <Checkbox 
                      id="privacy_accepted" 
                      checked={Boolean(watch('privacy_accepted'))}
                      onCheckedChange={(checked) => setValue('privacy_accepted', checked === true, { shouldValidate: true, shouldTouch: true })}
                    />
                    <div className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      <label htmlFor="privacy_accepted">Prihvatam </label>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        onClick={() => setShowPrivacyContent((prev) => !prev)}
                      >
                        politiku privatnosti
                      </button>
                      <span> *</span>
                    </div>
                  </div>
                  {showPrivacyContent && (
                    <div className="ml-6 p-4 bg-muted/30 border rounded-md">
                      <p className="text-sm font-semibold mb-3">
                        {privacyData?.data?.title || 'Politika privatnosti'}
                      </p>
                      {privacyLoading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Učitavanje politike privatnosti...
                        </div>
                      ) : privacyData?.data?.content ? (
                        <div
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(privacyData.data.content) }}
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">Sadržaj nije dostupan.</p>
                      )}
                    </div>
                  )}
                  {shouldShowStep5Error('privacy_accepted') && (
                    <div className="ml-6 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600 font-medium">{errors.privacy_accepted.message}</p>
                    </div>
                  )}
                </div>
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
