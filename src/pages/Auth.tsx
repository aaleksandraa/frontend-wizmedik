import { useState, useEffect } from 'react';
import { Navigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Mail, 
  Lock, 
  User, 
  Phone,
  ArrowRight,
  Stethoscope,
  Building2,
  FlaskConical,
  Sparkles,
  Home,
  UserPlus,
  LogIn,
  Eye,
  EyeOff
} from 'lucide-react';
import { CitySelect } from '@/components/CitySelect';
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormError } from '@/components/ui/form-error';
import { validateEmail, validateRequired, validatePhone } from '@/utils/validation';

type RegistrationType = 'patient' | 'provider';

interface ProviderOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const providerOptions: ProviderOption[] = [
  {
    id: 'doctor',
    title: 'Doktor',
    description: 'Registrujte svoju privatnu praksu',
    icon: <Stethoscope className="w-6 h-6" />,
    href: '/register/doctor',
    color: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
  },
  {
    id: 'clinic',
    title: 'Klinika',
    description: 'Registrujte zdravstvenu ustanovu',
    icon: <Building2 className="w-6 h-6" />,
    href: '/register/clinic',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
  },
  {
    id: 'laboratory',
    title: 'Laboratorija',
    description: 'Registrujte dijagnostički laboratorij',
    icon: <FlaskConical className="w-6 h-6" />,
    href: '/register/laboratory',
    color: 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
  },
  {
    id: 'spa',
    title: 'Banja',
    description: 'Registrujte banjsko-lječilište',
    icon: <Sparkles className="w-6 h-6" />,
    href: '/register/spa',
    color: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-100'
  },
  {
    id: 'care-home',
    title: 'Dom za njegu',
    description: 'Registrujte dom za njegu starijih',
    icon: <Home className="w-6 h-6" />,
    href: '/register/care-home',
    color: 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
  }
];

export default function Auth() {
  const { user, signIn, signUp, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const [isLogin, setIsLogin] = useState(mode !== 'register');
  const [registrationType, setRegistrationType] = useState<RegistrationType>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    ime: '',
    prezime: '',
    telefon: '',
    grad: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Setup validation for registration
  const { errors, touched, validateField, validateAllFields, setFieldTouched, clearErrors } = useFormValidation({
    ime: (value) => !isLogin ? validateRequired(value, 'Ime') : null,
    prezime: (value) => !isLogin ? validateRequired(value, 'Prezime') : null,
    email: (value) => validateEmail(value),
    password: (value) => {
      if (!value) return 'Lozinka je obavezna';
      if (!isLogin && value.length < 8) return 'Lozinka mora imati najmanje 8 karaktera';
      return null;
    },
    telefon: (value) => {
      if (!value) return null; // Optional
      return validatePhone(value);
    },
  });

  // Clear errors when switching between login/register
  useEffect(() => {
    clearErrors();
  }, [isLogin, clearErrors]);

  // Redirect if already authenticated
  if (!loading && user) {
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      sessionStorage.removeItem('redirectAfterLogin');
      return <Navigate to={redirectUrl} replace />;
    }
    
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'doctor':
        return <Navigate to="/doctor-dashboard" replace />;
      case 'clinic':
        return <Navigate to="/clinic-dashboard" replace />;
      case 'laboratory':
        return <Navigate to="/laboratory-dashboard" replace />;
      case 'spa_manager':
        return <Navigate to="/spa-dashboard" replace />;
      case 'care_home_manager':
        return <Navigate to="/care-home-dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form if registering
    if (!isLogin && registrationType === 'patient') {
      if (!validateAllFields(formData)) {
        return;
      }
    }

    setSubmitting(true);

    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
      } else {
        await signUp(formData.email, formData.password, formData.ime, formData.prezime, 'patient', {
          telefon: formData.telefon,
          grad: formData.grad
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field if touched
    if (touched[name]) {
      validateField(name, value, formData);
    }
  };

  const handleFieldBlur = (field: string) => {
    setFieldTouched(field);
    validateField(field, formData[field as keyof typeof formData], formData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="p-2 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <span className="text-2xl font-bold text-foreground">WizMedik</span>
          </Link>
        </div>

        <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {isLogin ? 'Dobrodošli nazad' : 'Kreirajte račun'}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? 'Prijavite se za pristup vašem računu' 
                : registrationType === 'patient' 
                  ? 'Registrujte se kao pacijent'
                  : 'Odaberite tip ustanove za registraciju'
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            {/* Registration Type Toggle (only for register mode) */}
            {!isLogin && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRegistrationType('patient')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                      registrationType === 'patient'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Pacijent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegistrationType('provider')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                      registrationType === 'provider'
                        ? 'bg-background shadow-sm text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    Pružatelj usluga
                  </button>
                </div>
              </div>
            )}

            {/* Provider Options */}
            {!isLogin && registrationType === 'provider' ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Odaberite tip ustanove koju želite registrovati
                </p>
                {providerOptions.map((option) => (
                  <Link
                    key={option.id}
                    to={option.href}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${option.color}`}
                  >
                    <div className="flex-shrink-0">
                      {option.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{option.title}</h3>
                      <p className="text-sm opacity-80">{option.description}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 flex-shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              /* Login / Patient Registration Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="ime">
                          Ime <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="ime"
                            name="ime"
                            type="text"
                            required
                            value={formData.ime}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur('ime')}
                            placeholder="Ime"
                            className={`pl-10 ${touched.ime && errors.ime ? 'border-red-500' : ''}`}
                          />
                        </div>
                        <FormError error={touched.ime ? errors.ime : undefined} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prezime">
                          Prezime <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="prezime"
                          name="prezime"
                          type="text"
                          required
                          value={formData.prezime}
                          onChange={handleInputChange}
                          onBlur={() => handleFieldBlur('prezime')}
                          placeholder="Prezime"
                          className={touched.prezime && errors.prezime ? 'border-red-500' : ''}
                        />
                        <FormError error={touched.prezime ? errors.prezime : undefined} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="telefon">Telefon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="telefon"
                            name="telefon"
                            type="tel"
                            value={formData.telefon}
                            onChange={handleInputChange}
                            onBlur={() => handleFieldBlur('telefon')}
                            placeholder="+387..."
                            className={`pl-10 ${touched.telefon && errors.telefon ? 'border-red-500' : ''}`}
                          />
                        </div>
                        <FormError error={touched.telefon ? errors.telefon : undefined} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grad">Grad</Label>
                        <CitySelect
                          value={formData.grad}
                          onChange={(value) => setFormData(prev => ({ ...prev, grad: value }))}
                          placeholder="Odaberite grad"
                          showIcon={true}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email adresa <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('email')}
                      placeholder="vasa@email.com"
                      className={`pl-10 ${touched.email && errors.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  <FormError error={touched.email ? errors.email : undefined} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">
                      Lozinka <span className="text-red-500">*</span>
                    </Label>
                    {isLogin && (
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:underline"
                      >
                        Zaboravljena lozinka?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleFieldBlur('password')}
                      placeholder="••••••••"
                      className={`pl-10 pr-10 ${touched.password && errors.password ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FormError error={touched.password ? errors.password : undefined} />
                  {!isLogin && !errors.password && (
                    <p className="text-xs text-muted-foreground">
                      Minimalno 8 karaktera
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-11" 
                  variant="medical"
                  disabled={submitting || (!isLogin && Object.keys(errors).length > 0)}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Učitavam...
                    </span>
                  ) : isLogin ? (
                    <span className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Prijavi se
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4" />
                      Registruj se
                    </span>
                  )}
                </Button>
              </form>
            )}

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {isLogin ? 'Nemate račun?' : 'Već imate račun?'}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setRegistrationType('patient');
                }}
                className="w-full"
              >
                {isLogin ? (
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Kreirajte račun
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Prijavite se
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Prijavom prihvatate naše{' '}
          <Link to="/uslovi-koristenja" className="text-primary hover:underline">
            Uslove korištenja
          </Link>
          {' '}i{' '}
          <Link to="/politika-privatnosti" className="text-primary hover:underline">
            Politiku privatnosti
          </Link>
        </p>
      </div>
    </div>
  );
}
