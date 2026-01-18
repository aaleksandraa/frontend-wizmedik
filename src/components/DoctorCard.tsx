import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Star, Phone, Calendar, CheckCircle } from 'lucide-react';
import { useDoctorCardSettings } from '@/hooks/useCardSettings';
import { formatRating } from '@/utils/formatters';

export interface DoctorCardSettings {
  variant: string;
  showRating: boolean;
  showLocation: boolean;
  showPhone: boolean;
  showSpecialty: boolean;
  showOnlineStatus: boolean;
  showBookButton: boolean;
  primaryColor: string;
  accentColor: string;
}

interface DoctorData {
  id: number | string;
  slug: string;
  // New format
  ime?: string;
  prezime?: string;
  specijalnost?: string;
  grad?: string;
  lokacija?: string;
  telefon?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slika_profila?: string;
  prihvata_online?: boolean;
  // Old format (for backwards compatibility)
  name?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  acceptsOnline?: boolean;
}

interface DoctorCardProps {
  doctor: DoctorData;
  settings?: DoctorCardSettings;
}

interface NormalizedDoctor {
  id: number | string;
  slug: string;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija?: string;
  telefon?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slika_profila?: string;
  prihvata_online?: boolean;
}

// Normalize doctor data to handle both formats
function normalizeDoctor(doctor: DoctorData): NormalizedDoctor {
  const nameParts = doctor.name?.split(' ') || [];
  return {
    id: doctor.id,
    slug: doctor.slug,
    ime: doctor.ime || nameParts[0] || '',
    prezime: doctor.prezime || nameParts.slice(1).join(' ') || '',
    specijalnost: doctor.specijalnost || doctor.specialty || '',
    grad: doctor.grad || doctor.location || '',
    lokacija: doctor.lokacija,
    telefon: doctor.telefon || doctor.phone,
    ocjena: doctor.ocjena ?? doctor.rating,
    broj_ocjena: doctor.broj_ocjena ?? doctor.reviewCount,
    slika_profila: doctor.slika_profila || doctor.image,
    prihvata_online: doctor.prihvata_online ?? doctor.acceptsOnline,
  };
}

const defaultSettings: DoctorCardSettings = {
  variant: 'classic',
  showRating: true,
  showLocation: true,
  showPhone: true,
  showSpecialty: true,
  showOnlineStatus: true,
  showBookButton: true,
  primaryColor: '#0ea5e9',
  accentColor: '#10b981',
};

export function DoctorCard({ doctor: rawDoctor, settings: propSettings }: DoctorCardProps) {
  const { settings: hookSettings, loading } = useDoctorCardSettings();
  const s = { ...defaultSettings, ...(propSettings || hookSettings) };
  const doctor = normalizeDoctor(rawDoctor);

  // Show skeleton while loading settings (only if no propSettings provided)
  if (loading && !propSettings) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <div className="p-6 space-y-3">
          <div className="flex justify-center"><div className="w-20 h-20 bg-gray-200 rounded-full" /></div>
          <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
        </div>
      </Card>
    );
  }
  
  const variants: Record<string, () => JSX.Element> = {
    classic: () => <ClassicCard doctor={doctor} settings={s} />,
    modern: () => <ModernCard doctor={doctor} settings={s} />,
    compact: () => <CompactCard doctor={doctor} settings={s} />,
    horizontal: () => <HorizontalCard doctor={doctor} settings={s} />,
    gradient: () => <GradientCard doctor={doctor} settings={s} />,
    minimal: () => <MinimalCard doctor={doctor} settings={s} />,
    bordered: () => <BorderedCard doctor={doctor} settings={s} />,
    shadow: () => <ShadowCard doctor={doctor} settings={s} />,
    rounded: () => <RoundedCard doctor={doctor} settings={s} />,
    flat: () => <FlatCard doctor={doctor} settings={s} />,
    glassmorphism: () => <GlassmorphismCard doctor={doctor} settings={s} />,
    neon: () => <NeonCard doctor={doctor} settings={s} />,
    cardstack: () => <CardStackCard doctor={doctor} settings={s} />,
    splitcolor: () => <SplitColorCard doctor={doctor} settings={s} />,
    neumorphism: () => <NeumorphismCard doctor={doctor} settings={s} />,
    magazine: () => <MagazineCard doctor={doctor} settings={s} />,
  };

  const VariantComponent = variants[s.variant] || variants.classic;
  return <VariantComponent />;
}

// Classic - Original design
function ClassicCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-lg transition-all duration-300 h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2" style={{ borderColor: s.primaryColor }}>
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && <p className="text-muted-foreground text-sm">{doctor.specijalnost}</p>}
              {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{formatRating(doctor.ocjena)}</span>
                  <span className="text-xs text-muted-foreground">({doctor.broj_ocjena})</span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {s.showLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                <span className="truncate">{doctor.lokacija || doctor.grad}</span>
              </div>
            )}
            {s.showPhone && doctor.telefon && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" style={{ color: s.primaryColor }} />
                <span>{doctor.telefon}</span>
              </div>
            )}
          </div>
          {s.showOnlineStatus && doctor.prihvata_online && (
            <Badge className="mt-3" style={{ backgroundColor: s.accentColor }}>
              <CheckCircle className="h-3 w-3 mr-1" /> Online booking
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}


// Modern - Clean with accent bar
function ModernCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-xl transition-all duration-300 h-full overflow-hidden">
        <div className="h-1" style={{ backgroundColor: s.primaryColor }} />
        <CardContent className="p-5">
          <div className="text-center">
            <Avatar className="h-20 w-20 mx-auto mb-3 ring-4 ring-offset-2 ring-primary/30">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback className="text-xl" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && (
              <Badge variant="secondary" className="mt-1">{doctor.specijalnost}</Badge>
            )}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t space-y-2">
            {s.showLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                <span className="truncate">{doctor.grad}</span>
              </div>
            )}
          </div>
          {s.showBookButton && (
            <Button className="w-full mt-4" style={{ backgroundColor: s.primaryColor }}>
              <Calendar className="h-4 w-4 mr-2" /> Zakaži
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Compact - Small footprint
function CompactCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-md transition-all h-full">
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white', fontSize: '0.75rem' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm truncate">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && <p className="text-xs text-muted-foreground truncate">{doctor.specijalnost}</p>}
            </div>
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Horizontal - Wide layout
function HorizontalCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-lg transition-all h-full">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">Dr. {doctor.ime} {doctor.prezime}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                {s.showSpecialty && <span>{doctor.specijalnost}</span>}
                {s.showLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {doctor.grad}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{formatRating(doctor.ocjena)}</span>
                </div>
              )}
              {s.showBookButton && (
                <Button size="sm" style={{ backgroundColor: s.primaryColor }}>Zakaži</Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Gradient - Colorful header
function GradientCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-xl transition-all h-full overflow-hidden">
        <div 
          className="h-20 flex items-end justify-center pb-10"
          style={{ background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})` }}
        >
        </div>
        <CardContent className="p-4 -mt-10 relative">
          <Avatar className="h-16 w-16 mx-auto border-4 border-white shadow-lg">
            <AvatarImage src={doctor.slika_profila} />
            <AvatarFallback className="text-lg" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="text-center mt-2">
            <h3 className="font-bold">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
            {s.showLocation && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <MapPin className="h-3 w-3" /> {doctor.grad}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


// Minimal - Ultra clean
function MinimalCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="p-4 hover:bg-muted/50 rounded-lg transition-all h-full border border-transparent hover:border-border">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={doctor.slika_profila} />
            <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between mt-3 text-sm">
          {s.showLocation && (
            <span className="text-muted-foreground">{doctor.grad}</span>
          )}
          {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatRating(doctor.ocjena)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Bordered - Accent border
function BorderedCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card 
        className="hover:shadow-lg transition-all h-full border-l-4"
        style={{ borderLeftColor: s.primaryColor }}
      >
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-sm" style={{ color: s.primaryColor }}>{doctor.specijalnost}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                {s.showLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {doctor.grad}
                  </span>
                )}
                {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {formatRating(doctor.ocjena)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Shadow - Elevated look
function ShadowCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all h-full p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-20 w-20 shadow-md">
            <AvatarImage src={doctor.slika_profila} />
            <AvatarFallback className="text-xl" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-bold text-lg mt-3">Dr. {doctor.ime} {doctor.prezime}</h3>
          {s.showSpecialty && (
            <span 
              className="text-sm px-3 py-1 rounded-full mt-1"
              style={{ backgroundColor: `${s.primaryColor}15`, color: s.primaryColor }}
            >
              {doctor.specijalnost}
            </span>
          )}
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {s.showLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {doctor.grad}
              </span>
            )}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <span className="flex items-center gap-1 font-medium text-foreground">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {formatRating(doctor.ocjena)}
              </span>
            )}
          </div>
          {s.showBookButton && (
            <Button className="w-full mt-4" variant="outline" style={{ borderColor: s.primaryColor, color: s.primaryColor }}>
              Zakaži termin
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Rounded - Soft corners
function RoundedCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div 
        className="rounded-3xl p-5 hover:scale-[1.02] transition-all h-full"
        style={{ backgroundColor: `${s.primaryColor}08`, border: `1px solid ${s.primaryColor}20` }}
      >
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 rounded-2xl">
            <AvatarImage src={doctor.slika_profila} className="rounded-2xl" />
            <AvatarFallback className="rounded-2xl" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
        </div>
        {s.showLocation && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground" style={{ borderColor: `${s.primaryColor}20` }}>
            <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
            {doctor.grad}
          </div>
        )}
      </div>
    </Link>
  );
}

// Flat - No shadows, clean
function FlatCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="border rounded-lg p-4 hover:bg-muted/30 transition-all h-full">
        <div className="flex gap-3">
          <Avatar className="h-12 w-12 rounded-lg shrink-0">
            <AvatarImage src={doctor.slika_profila} className="rounded-lg" />
            <AvatarFallback className="rounded-lg" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">Dr. {doctor.ime} {doctor.prezime}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              {s.showSpecialty && <span className="truncate">{doctor.specijalnost}</span>}
              {s.showSpecialty && s.showLocation && <span>•</span>}
              {s.showLocation && <span>{doctor.grad}</span>}
            </div>
          </div>
          {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{formatRating(doctor.ocjena)}</span>
            </div>
          )}
        </div>
        {s.showOnlineStatus && doctor.prihvata_online && (
          <div className="mt-3 flex items-center gap-1 text-xs" style={{ color: s.accentColor }}>
            <CheckCircle className="h-3 w-3" /> Prihvata online rezervacije
          </div>
        )}
      </div>
    </Link>
  );
}

// Glassmorphism - Modern glass effect
function GlassmorphismCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div 
        className="rounded-2xl p-5 backdrop-blur-md border hover:shadow-xl transition-all h-full relative overflow-hidden"
        style={{ 
          backgroundColor: `${s.primaryColor}15`,
          borderColor: `${s.primaryColor}30`
        }}
      >
        {/* Decorative blur circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30" style={{ backgroundColor: s.accentColor }} />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: s.primaryColor }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-2 ring-white/50">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-sm font-medium" style={{ color: s.primaryColor }}>{doctor.specijalnost}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            {s.showLocation && (
              <span className="text-sm flex items-center gap-1">
                <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                {doctor.grad}
              </span>
            )}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/50">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Neon - Bold and vibrant
function NeonCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div 
        className="rounded-xl p-5 hover:scale-[1.02] transition-all h-full relative overflow-hidden"
        style={{ 
          backgroundColor: '#0a0a0a',
          boxShadow: `0 0 20px ${s.primaryColor}40`
        }}
      >
        {/* Neon glow effect */}
        <div 
          className="absolute inset-0 opacity-20 blur-xl"
          style={{ background: `radial-gradient(circle at 30% 30%, ${s.primaryColor}, transparent 70%)` }}
        />
        
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 ring-2" style={{ ringColor: s.primaryColor }}>
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-white">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-sm" style={{ color: s.accentColor }}>{doctor.specijalnost}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between text-white/80 text-sm">
            {s.showLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                {doctor.grad}
              </span>
            )}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: `${s.primaryColor}30` }}>
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-white">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
          
          {s.showBookButton && (
            <Button 
              className="w-full mt-4 font-semibold"
              style={{ 
                backgroundColor: s.primaryColor,
                boxShadow: `0 0 15px ${s.primaryColor}60`
              }}
            >
              Zakaži termin
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
}

// Card Stack - Layered look
function CardStackCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="relative h-full group">
        {/* Background cards */}
        <div 
          className="absolute inset-0 rounded-lg transform translate-x-2 translate-y-2 transition-transform group-hover:translate-x-3 group-hover:translate-y-3"
          style={{ backgroundColor: `${s.accentColor}20` }}
        />
        <div 
          className="absolute inset-0 rounded-lg transform translate-x-1 translate-y-1 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"
          style={{ backgroundColor: `${s.primaryColor}20` }}
        />
        
        {/* Main card */}
        <Card className="relative bg-white shadow-lg hover:shadow-xl transition-all">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-offset-2" style={{ ringColor: s.primaryColor }}>
                <AvatarImage src={doctor.slika_profila} />
                <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                  {doctor.ime?.[0]}{doctor.prezime?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-bold">Dr. {doctor.ime} {doctor.prezime}</h3>
                {s.showSpecialty && (
                  <Badge style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
                    {doctor.specijalnost}
                  </Badge>
                )}
                {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{formatRating(doctor.ocjena)}</span>
                  </div>
                )}
              </div>
            </div>
            {s.showLocation && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                {doctor.grad}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}

// Split Color - Two-tone design
function SplitColorCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all h-full">
        <div className="flex h-full">
          {/* Left colored section */}
          <div 
            className="w-2/5 p-4 flex flex-col items-center justify-center text-white"
            style={{ background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})` }}
          >
            <Avatar className="h-16 w-16 ring-4 ring-white/30 mb-2">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback className="bg-white/20 text-white text-lg">
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
                <span className="font-bold">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
          
          {/* Right content section */}
          <CardContent className="w-3/5 p-4 flex flex-col justify-center">
            <h3 className="font-bold text-sm leading-tight">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && (
              <p className="text-xs mt-1" style={{ color: s.primaryColor }}>{doctor.specijalnost}</p>
            )}
            {s.showLocation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="h-3 w-3" />
                {doctor.grad}
              </div>
            )}
            {s.showOnlineStatus && doctor.prihvata_online && (
              <Badge className="mt-2 text-xs" style={{ backgroundColor: s.accentColor }}>
                <CheckCircle className="h-3 w-3 mr-1" /> Online
              </Badge>
            )}
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

// Neumorphism - Soft UI
function NeumorphismCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div 
        className="rounded-2xl p-5 transition-all h-full"
        style={{ 
          backgroundColor: '#e8e8e8',
          boxShadow: '8px 8px 16px #d1d1d1, -8px -8px 16px #ffffff'
        }}
      >
        <div className="flex items-center gap-4">
          <div 
            className="rounded-full p-1"
            style={{ boxShadow: 'inset 4px 4px 8px #d1d1d1, inset -4px -4px 8px #ffffff' }}
          >
            <Avatar className="h-14 w-14">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && (
              <p className="text-sm text-gray-600">{doctor.specijalnost}</p>
            )}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {s.showLocation && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
              {doctor.grad}
            </span>
          )}
          {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
            <div 
              className="flex items-center gap-1 px-3 py-1 rounded-full"
              style={{ boxShadow: 'inset 2px 2px 4px #d1d1d1, inset -2px -2px 4px #ffffff' }}
            >
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-800">{formatRating(doctor.ocjena)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Magazine - Editorial style
function MagazineCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="overflow-hidden hover:shadow-xl transition-all h-full">
        <div className="relative h-32" style={{ backgroundColor: `${s.primaryColor}10` }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <Avatar className="h-24 w-24 ring-4 ring-white shadow-lg">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback className="text-2xl" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
          </div>
          {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
            <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-md flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-bold">{formatRating(doctor.ocjena)}</span>
            </div>
          )}
        </div>
        <CardContent className="p-5 text-center">
          <h3 className="font-bold text-xl mb-1">Dr. {doctor.ime} {doctor.prezime}</h3>
          {s.showSpecialty && (
            <p className="text-sm font-medium mb-3" style={{ color: s.primaryColor }}>
              {doctor.specijalnost}
            </p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {s.showLocation && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {doctor.grad}
              </span>
            )}
            {s.showPhone && doctor.telefon && (
              <span className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {doctor.telefon}
              </span>
            )}
          </div>
          {s.showBookButton && (
            <Button 
              className="w-full mt-4"
              style={{ backgroundColor: s.primaryColor }}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Zakaži pregled
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

export const DOCTOR_CARD_VARIANTS = [
  { id: 'classic', name: 'Klasični', description: 'Tradicionalni prikaz sa svim informacijama' },
  { id: 'modern', name: 'Moderni', description: 'Čist dizajn sa akcentnom linijom' },
  { id: 'compact', name: 'Kompaktni', description: 'Mali footprint za liste' },
  { id: 'horizontal', name: 'Horizontalni', description: 'Široki layout za rezultate' },
  { id: 'gradient', name: 'Gradient', description: 'Šareni header sa gradijentom' },
  { id: 'minimal', name: 'Minimalni', description: 'Ultra jednostavan dizajn' },
  { id: 'bordered', name: 'Sa ivicom', description: 'Akcentna lijeva ivica' },
  { id: 'shadow', name: 'Sa sjenkom', description: 'Izdignuti izgled sa sjenkom' },
  { id: 'rounded', name: 'Zaobljeni', description: 'Meki uglovi i boje' },
  { id: 'flat', name: 'Ravni', description: 'Bez sjenki, čist dizajn' },
  { id: 'glassmorphism', name: 'Glassmorphism', description: 'Moderni stakleni efekat' },
  { id: 'neon', name: 'Neon', description: 'Smeli i vibrantni dizajn' },
  { id: 'cardstack', name: 'Slojeviti', description: 'Višeslojni izgled' },
  { id: 'splitcolor', name: 'Podijeljeni', description: 'Dvobojni dizajn' },
  { id: 'neumorphism', name: 'Neumorphism', description: 'Meki UI sa sjenama' },
  { id: 'magazine', name: 'Magazinski', description: 'Uređivački stil' },
];

