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
    listcompact: () => <ListCompactCard doctor={doctor} settings={s} />,
    professional: () => <ProfessionalCard doctor={doctor} settings={s} />,
    elegant: () => <ElegantCard doctor={doctor} settings={s} />,
    bold: () => <BoldCard doctor={doctor} settings={s} />,
    horizontalinfo: () => <HorizontalInfoCard doctor={doctor} settings={s} />,
    horizontaldetail: () => <HorizontalDetailCard doctor={doctor} settings={s} />,
    timeline: () => <TimelineCard doctor={doctor} settings={s} />,
    badge: () => <BadgeCard doctor={doctor} settings={s} />,
    overlay: () => <OverlayCard doctor={doctor} settings={s} />,
    sidebar: () => <SidebarCard doctor={doctor} settings={s} />,
    testimonial: () => <TestimonialCard doctor={doctor} settings={s} />,
    pricing: () => <PricingCard doctor={doctor} settings={s} />,
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
            <Avatar className="h-14 w-14 ring-2 ring-primary">
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
              <Avatar className="h-14 w-14 ring-2 ring-offset-2 ring-primary">
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

// List Compact - Slika lijevo, info desno (kao što si opisala)
function ListCompactCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="flex items-start gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow">
        {/* Profile Image - Left */}
        <Avatar className="h-20 w-20 flex-shrink-0">
          <AvatarImage src={doctor.slika_profila} />
          <AvatarFallback className="text-lg" style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
            {doctor.ime?.[0]}{doctor.prezime?.[0]}
          </AvatarFallback>
        </Avatar>

        {/* Content - Right */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            Dr. {doctor.ime} {doctor.prezime}
          </h3>

          {/* Specialty */}
          {s.showSpecialty && doctor.specijalnost && (
            <p className="text-sm text-gray-600 mb-2">
              {doctor.specijalnost}
            </p>
          )}

          {/* Location */}
          {s.showLocation && doctor.grad && (
            <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
              <MapPin className="h-4 w-4" />
              <span>{doctor.grad}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <Link to={`/doktor/${doctor.slug}`}>
                O doktoru
              </Link>
            </Button>
            
            {s.showBookButton && (
              <Button
                asChild
                size="sm"
                className="text-xs"
                style={{ backgroundColor: s.primaryColor }}
              >
                <Link to={`/doktor/${doctor.slug}#zakazi`}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Zakaži termin
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// Professional - Korporativni stil
function ProfessionalCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-lg transition-all h-full border-t-4" style={{ borderTopColor: s.primaryColor }}>
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={doctor.slika_profila} />
                <AvatarFallback className="text-2xl" style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                  {doctor.ime?.[0]}{doctor.prezime?.[0]}
                </AvatarFallback>
              </Avatar>
              {s.showOnlineStatus && doctor.prihvata_online && (
                <div 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: s.accentColor }}
                >
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-xl mb-1">Dr. {doctor.ime} {doctor.prezime}</h3>
            
            {s.showSpecialty && (
              <div 
                className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-3"
                style={{ backgroundColor: `${s.primaryColor}15`, color: s.primaryColor }}
              >
                {doctor.specijalnost}
              </div>
            )}
            
            <div className="w-full space-y-2 mb-4">
              {s.showLocation && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                  <span>{doctor.grad}</span>
                </div>
              )}
              
              {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.round(doctor.ocjena!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{formatRating(doctor.ocjena)}</span>
                  <span className="text-xs text-muted-foreground">({doctor.broj_ocjena})</span>
                </div>
              )}
            </div>
            
            {s.showBookButton && (
              <Button 
                className="w-full font-semibold"
                style={{ backgroundColor: s.primaryColor }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Zakažite pregled
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Elegant - Sofisticirani dizajn
function ElegantCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="group relative h-full">
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl"
          style={{ backgroundColor: `${s.primaryColor}30` }}
        />
        <Card className="relative bg-white/95 backdrop-blur-sm rounded-2xl border-2 hover:border-primary/50 transition-all h-full overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ 
            background: `radial-gradient(circle, ${s.primaryColor}, transparent)`
          }} />
          
          <CardContent className="p-6 relative z-10">
            <div className="flex items-start gap-4 mb-4">
              <div className="relative">
                <Avatar className="h-16 w-16 ring-2 ring-offset-2 ring-primary/40">
                  <AvatarImage src={doctor.slika_profila} />
                  <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                    {doctor.ime?.[0]}{doctor.prezime?.[0]}
                  </AvatarFallback>
                </Avatar>
                {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                  <div 
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
                    style={{ backgroundColor: s.accentColor }}
                  >
                    {formatRating(doctor.ocjena)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-serif font-bold text-lg leading-tight mb-1">
                  Dr. {doctor.ime} {doctor.prezime}
                </h3>
                {s.showSpecialty && (
                  <p className="text-sm italic" style={{ color: s.primaryColor }}>
                    {doctor.specijalnost}
                  </p>
                )}
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {s.showLocation && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${s.primaryColor}10` }}
                  >
                    <MapPin className="h-4 w-4" style={{ color: s.primaryColor }} />
                  </div>
                  <span>{doctor.grad}</span>
                </div>
              )}
              
              {s.showPhone && doctor.telefon && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${s.primaryColor}10` }}
                  >
                    <Phone className="h-4 w-4" style={{ color: s.primaryColor }} />
                  </div>
                  <span>{doctor.telefon}</span>
                </div>
              )}
            </div>
            
            {s.showOnlineStatus && doctor.prihvata_online && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm" style={{ color: s.accentColor }}>
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Dostupno online zakazivanje</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}

// Bold - Hrabar i upečatljiv
function BoldCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div 
        className="relative rounded-xl overflow-hidden hover:scale-[1.02] transition-transform h-full"
        style={{ backgroundColor: s.primaryColor }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full -translate-y-1/2 translate-x-1/2" style={{ backgroundColor: 'white' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full translate-y-1/2 -translate-x-1/2" style={{ backgroundColor: 'white' }} />
        </div>
        
        <div className="relative z-10 p-6 text-white">
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/30 shrink-0">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback className="bg-white/20 text-white text-lg">
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h3 className="font-black text-xl leading-tight mb-1">
                Dr. {doctor.ime} {doctor.prezime}
              </h3>
              {s.showSpecialty && (
                <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                  {doctor.specijalnost}
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            {s.showLocation && (
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">{doctor.grad}</span>
              </div>
            )}
            
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Star className="h-5 w-5 fill-yellow-300 text-yellow-300" />
                  <span className="font-black text-lg">{formatRating(doctor.ocjena)}</span>
                </div>
                <span className="text-white/80 text-sm">({doctor.broj_ocjena} recenzija)</span>
              </div>
            )}
          </div>
          
          {s.showBookButton && (
            <Button 
              className="w-full bg-white font-black text-lg py-6 hover:bg-white/90"
              style={{ color: s.primaryColor }}
            >
              <Calendar className="h-5 w-5 mr-2" />
              ZAKAŽI ODMAH
            </Button>
          )}
          
          {s.showOnlineStatus && doctor.prihvata_online && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm font-bold">
              <CheckCircle className="h-4 w-4" />
              ONLINE BOOKING DOSTUPAN
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// Horizontal Info - Kao horizontal ali sa "Detaljnije" dugmetom, bez ocjena
function HorizontalInfoCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
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
                {s.showSpecialty && s.showLocation && <span>•</span>}
                {s.showLocation && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {doctor.grad}
                  </span>
                )}
              </div>
            </div>
            <div className="shrink-0">
              <Button size="sm" variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                Detaljnije
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Horizontal Detail - Kao horizontalinfo ali sa lokacijom u trećem redu i većom slikom
function HorizontalDetailCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-lg transition-all h-full">
        <CardContent className="p-4">
          {/* Desktop layout */}
          <div className="hidden sm:flex items-center gap-4">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base truncate">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-sm text-muted-foreground mt-0.5">{doctor.specijalnost}</p>
              )}
              {s.showLocation && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>{doctor.grad}</span>
                </div>
              )}
            </div>
            <div className="shrink-0">
              <Button size="sm" variant="ghost" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                Detaljnije
              </Button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="flex sm:hidden items-start gap-3">
            <Avatar className="h-16 w-16 shrink-0">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{doctor.specijalnost}</p>
              )}
              {s.showLocation && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground">{doctor.grad}</span>
                  <span className="ml-auto text-xs font-semibold text-gray-700">Detaljnije</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Timeline - Vertikalni timeline stil
function TimelineCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="relative pl-8 pb-8 hover:opacity-90 transition-opacity">
        {/* Timeline line */}
        <div 
          className="absolute left-3 top-0 bottom-0 w-0.5"
          style={{ backgroundColor: `${s.primaryColor}30` }}
        />
        
        {/* Timeline dot */}
        <div 
          className="absolute left-0 top-2 w-6 h-6 rounded-full border-4 border-white shadow-md"
          style={{ backgroundColor: s.primaryColor }}
        />
        
        <Card className="ml-4">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={doctor.slika_profila} />
                <AvatarFallback style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
                  {doctor.ime?.[0]}{doctor.prezime?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">Dr. {doctor.ime} {doctor.prezime}</h3>
                {s.showSpecialty && (
                  <p className="text-xs text-muted-foreground">{doctor.specijalnost}</p>
                )}
                {s.showLocation && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    {doctor.grad}
                  </div>
                )}
                {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{formatRating(doctor.ocjena)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
}

// Badge - Sa badge elementima
function BadgeCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-lg transition-all h-full overflow-hidden">
        <div className="relative">
          {/* Top badge */}
          {s.showOnlineStatus && doctor.prihvata_online && (
            <div 
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold text-white z-10"
              style={{ backgroundColor: s.accentColor }}
            >
              Online
            </div>
          )}
          
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-20 w-20 mb-3 ring-2 ring-offset-2" style={{ '--tw-ring-color': s.primaryColor } as React.CSSProperties}>
                <AvatarImage src={doctor.slika_profila} />
                <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                  {doctor.ime?.[0]}{doctor.prezime?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="font-bold mb-1">Dr. {doctor.ime} {doctor.prezime}</h3>
              
              {/* Badges row */}
              <div className="flex flex-wrap gap-1 justify-center mb-3">
                {s.showSpecialty && (
                  <Badge variant="secondary" className="text-xs">
                    {doctor.specijalnost}
                  </Badge>
                )}
                {s.showLocation && (
                  <Badge variant="outline" className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    {doctor.grad}
                  </Badge>
                )}
                {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                  <Badge style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }} className="text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    {formatRating(doctor.ocjena)}
                  </Badge>
                )}
              </div>
              
              {s.showBookButton && (
                <Button size="sm" className="w-full" style={{ backgroundColor: s.primaryColor }}>
                  <Calendar className="h-3 w-3 mr-1" />
                  Zakaži
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

// Overlay - Sa overlay efektom na hover
function OverlayCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="relative group h-full rounded-xl overflow-hidden">
        {/* Background image or color */}
        <div 
          className="absolute inset-0 transition-transform group-hover:scale-110"
          style={{ 
            background: doctor.slika_profila 
              ? `url(${doctor.slika_profila}) center/cover` 
              : `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})`
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content */}
        <div className="relative h-full p-5 flex flex-col justify-end text-white">
          <h3 className="font-bold text-lg mb-1">Dr. {doctor.ime} {doctor.prezime}</h3>
          {s.showSpecialty && (
            <p className="text-sm text-white/90 mb-2">{doctor.specijalnost}</p>
          )}
          
          <div className="flex items-center justify-between">
            {s.showLocation && (
              <span className="text-xs flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {doctor.grad}
              </span>
            )}
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold">{formatRating(doctor.ocjena)}</span>
              </div>
            )}
          </div>
          
          {/* Hidden button that appears on hover */}
          <Button 
            className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: s.primaryColor }}
          >
            Pogledaj profil
          </Button>
        </div>
      </div>
    </Link>
  );
}

// Sidebar - Kompaktan za sidebar
function SidebarCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <div className="p-3 hover:bg-muted/50 rounded-lg transition-all border border-transparent hover:border-border">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={doctor.slika_profila} />
            <AvatarFallback className="text-xs" style={{ backgroundColor: `${s.primaryColor}20`, color: s.primaryColor }}>
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">Dr. {doctor.ime} {doctor.prezime}</h4>
            {s.showSpecialty && (
              <p className="text-xs text-muted-foreground truncate">{doctor.specijalnost}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {s.showLocation && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {doctor.grad}
                </span>
              )}
              {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
                <span className="text-xs flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {formatRating(doctor.ocjena)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Testimonial - Kao testimonial kartica
function TestimonialCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-xl transition-all h-full">
        <CardContent className="p-6">
          {/* Quote icon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${s.primaryColor}15` }}
          >
            <svg className="w-5 h-5" style={{ color: s.primaryColor }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
          </div>
          
          <div className="flex items-start gap-4 mb-4">
            <Avatar className="h-14 w-14 shrink-0">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold">Dr. {doctor.ime} {doctor.prezime}</h3>
              {s.showSpecialty && (
                <p className="text-sm" style={{ color: s.primaryColor }}>{doctor.specijalnost}</p>
              )}
            </div>
          </div>
          
          {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.round(doctor.ocjena!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">{formatRating(doctor.ocjena)}</span>
              <span className="text-xs text-muted-foreground">({doctor.broj_ocjena} recenzija)</span>
            </div>
          )}
          
          {s.showLocation && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {doctor.grad}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Pricing - Kao pricing kartica
function PricingCard({ doctor, settings: s }: { doctor: NormalizedDoctor; settings: DoctorCardSettings }) {
  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="hover:shadow-xl hover:scale-[1.02] transition-all h-full border-2" style={{ borderColor: `${s.primaryColor}30` }}>
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-5 text-center" style={{ background: `linear-gradient(135deg, ${s.primaryColor}10, ${s.accentColor}10)` }}>
            <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-white shadow-lg">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback style={{ backgroundColor: s.primaryColor, color: 'white' }}>
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-bold text-lg">Dr. {doctor.ime} {doctor.prezime}</h3>
            {s.showSpecialty && (
              <p className="text-sm font-medium mt-1" style={{ color: s.primaryColor }}>
                {doctor.specijalnost}
              </p>
            )}
          </div>
          
          {/* Features */}
          <div className="p-5 space-y-3">
            {s.showLocation && (
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${s.accentColor}20` }}
                >
                  <MapPin className="h-3 w-3" style={{ color: s.accentColor }} />
                </div>
                <span>{doctor.grad}</span>
              </div>
            )}
            
            {s.showRating && doctor.ocjena && doctor.ocjena > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${s.accentColor}20` }}
                >
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
                <span>{formatRating(doctor.ocjena)} ocjena ({doctor.broj_ocjena})</span>
              </div>
            )}
            
            {s.showOnlineStatus && doctor.prihvata_online && (
              <div className="flex items-center gap-2 text-sm">
                <div 
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${s.accentColor}20` }}
                >
                  <CheckCircle className="h-3 w-3" style={{ color: s.accentColor }} />
                </div>
                <span>Online rezervacija</span>
              </div>
            )}
          </div>
          
          {/* CTA */}
          {s.showBookButton && (
            <div className="p-5 pt-0">
              <Button className="w-full font-semibold" style={{ backgroundColor: s.primaryColor }}>
                <Calendar className="h-4 w-4 mr-2" />
                Zakaži pregled
              </Button>
            </div>
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
  { id: 'listcompact', name: 'Lista Kompakt', description: 'Slika lijevo, info desno sa dugmićima' },
  { id: 'professional', name: 'Profesionalni', description: 'Korporativni stil sa zvjezdicama' },
  { id: 'elegant', name: 'Elegantni', description: 'Sofisticirani dizajn sa efektima' },
  { id: 'bold', name: 'Hrabri', description: 'Upečatljiv dizajn sa jakim bojama' },
  { id: 'horizontalinfo', name: 'Horizontalni Info', description: 'Široki layout sa "Detaljnije" dugmetom, bez ocjena' },
  { id: 'horizontaldetail', name: 'Horizontalni Detalj', description: 'Kao horizontalinfo ali sa lokacijom u trećem redu i većom slikom' },
  { id: 'timeline', name: 'Timeline', description: 'Vertikalni timeline stil sa linijom' },
  { id: 'badge', name: 'Badge', description: 'Sa badge elementima i online statusom' },
  { id: 'overlay', name: 'Overlay', description: 'Sa overlay efektom i hover animacijom' },
  { id: 'sidebar', name: 'Sidebar', description: 'Kompaktan za sidebar i male prostore' },
  { id: 'testimonial', name: 'Testimonial', description: 'Kao testimonial sa quote ikonom' },
  { id: 'pricing', name: 'Pricing', description: 'Kao pricing kartica sa features listom' },
];


