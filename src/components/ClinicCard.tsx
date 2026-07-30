import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Users, Building2, ChevronRight } from 'lucide-react';
import { useClinicCardSettings } from '@/hooks/useCardSettings';
import { formatNumber } from '@/utils/formatters';
import { fixImageUrl } from '@/utils/imageUrl';
import { ClinicListingCard } from '@/components/ClinicListingCard';

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: string[];
  radno_vrijeme: any;
  doktori?: any[];
  specijalnosti?: any[];
  slug?: string;
  distance?: number;
  ocjena?: number;
  broj_ocjena?: number;
}

interface ClinicCardProps {
  clinic: Clinic;
  variant?: string;
  compact?: boolean;
}

type ClinicCardVariant =
  | 'wizmedik'
  | 'classic'
  | 'modern'
  | 'compact'
  | 'horizontal'
  | 'minimal'
  | 'gradient';

export function ClinicCard({ clinic, variant: propVariant, compact = false }: ClinicCardProps) {
  const navigate = useNavigate();
  const { settings, loading } = useClinicCardSettings();
  const currentVariant = (propVariant || settings.variant) as ClinicCardVariant;
  const goToClinic = () => navigate(`/klinika/${clinic.slug || clinic.id}`);
  const mainImage = clinic.slike && clinic.slike.length > 0
    ? (fixImageUrl(clinic.slike[0]) || clinic.slike[0])
    : null;

  // Show skeleton while loading settings (only if no propVariant provided)
  if (loading && !propVariant) {
    return (
      <div className="flex animate-pulse items-stretch gap-4 rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
        <div className="h-[120px] w-[104px] shrink-0 rounded-2xl bg-slate-100 md:w-[112px]" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-4 w-3/4 rounded bg-slate-100" />
          <div className="h-3 w-1/2 rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
          <div className="h-10 w-24 rounded-full bg-slate-100" />
        </div>
      </div>
    );
  }

  // Default modern listing card (shares the design language with doctor cards)
  if (currentVariant === 'wizmedik' || currentVariant === 'classic') {
    return <ClinicListingCard clinic={clinic} compact={compact} />;
  }

  // Modern variant - clean design without working hours
  if (currentVariant === 'modern') {
    return (
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer" onClick={goToClinic}>
        <div className="relative">
          {settings.showImage && (
            <div className="h-40 bg-gradient-to-br from-primary to-primary/60 relative overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={clinic.naziv} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Building2 className="h-12 w-12 text-white/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-lg font-bold text-white">{clinic.naziv}</h3>
                <p className="text-white/80 text-sm flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {clinic.grad}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          {settings.showDescription && clinic.opis && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{clinic.opis}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {settings.showPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clinic.telefon}</span>}
              {settings.showDoctorsCount && clinic.doktori && clinic.doktori.length > 0 && (
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {clinic.doktori.length}</span>
              )}
            </div>
            <ChevronRight className="h-5 w-5 text-primary group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Card>
    );
  }

  // Compact variant - minimal info
  if (currentVariant === 'compact') {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer group" onClick={goToClinic}>
        <div className="flex items-center gap-4">
          {settings.showImage && (
            <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
              {mainImage ? (
                <img src={mainImage} alt={clinic.naziv} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="h-8 w-8 text-primary/60" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{clinic.naziv}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {clinic.grad}
            </p>
            {settings.showDoctorsCount && clinic.doktori && clinic.doktori.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">{clinic.doktori.length} doktora</p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </Card>
    );
  }

  // Horizontal variant - wide card
  if (currentVariant === 'horizontal') {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex flex-col md:flex-row">
          {settings.showImage && (
            <div 
              className="w-full md:w-48 h-40 md:h-auto bg-primary/10 shrink-0 cursor-pointer"
              onClick={goToClinic}
            >
              {mainImage ? (
                <img src={mainImage} alt={clinic.naziv} className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
              ) : (
                <div className="flex items-center justify-center h-full hover:bg-primary/20 transition-colors">
                  <Building2 className="h-12 w-12 text-primary/40" />
                </div>
              )}
            </div>
          )}
          <div className="p-4 flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 
                  className="font-bold text-lg text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={goToClinic}
                >
                  {clinic.naziv}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {clinic.adresa}, {clinic.grad}
                </p>
              </div>
              {settings.showDistance && clinic.distance && (
                <Badge variant="secondary">{formatNumber(clinic.distance)} km</Badge>
              )}
            </div>
            {settings.showDescription && clinic.opis && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{clinic.opis}</p>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {settings.showPhone && <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-primary" /> {clinic.telefon}</span>}
                {settings.showDoctorsCount && clinic.doktori && clinic.doktori.length > 0 && (
                  <span className="flex items-center gap-1"><Users className="h-4 w-4 text-primary" /> {clinic.doktori.length} doktora</span>
                )}
              </div>
              <Button variant="medical" size="sm" onClick={goToClinic}>Pogledaj</Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Minimal variant - text only
  if (currentVariant === 'minimal') {
    return (
      <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary" onClick={goToClinic}>
        <h3 className="font-semibold text-foreground mb-1">{clinic.naziv}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {clinic.grad}</span>
          {settings.showPhone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clinic.telefon}</span>}
          {settings.showDoctorsCount && clinic.doktori && clinic.doktori.length > 0 && (
            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {clinic.doktori.length} doktora</span>
          )}
        </div>
      </Card>
    );
  }

  // Gradient variant - colorful design
  if (currentVariant === 'gradient') {
    return (
      <Card 
        className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
        style={{ background: `linear-gradient(135deg, ${settings.primaryColor}15, ${settings.accentColor}15)` }}
        onClick={goToClinic}
      >
        <div className="p-5">
          <div className="flex items-start gap-4 mb-4">
            {settings.showImage && (
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
              >
                {mainImage ? (
                  <img src={mainImage} alt={clinic.naziv} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="h-7 w-7 text-white" />
                )}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground mb-1">{clinic.naziv}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> {clinic.grad}
              </p>
            </div>
          </div>
          {settings.showDescription && clinic.opis && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{clinic.opis}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {settings.showDoctorsCount && clinic.doktori && clinic.doktori.length > 0 && (
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {clinic.doktori.length}</span>
              )}
              {settings.showDistance && clinic.distance && (
                <span>{formatNumber(clinic.distance)} km</span>
              )}
            </div>
            <Button 
              size="sm" 
              style={{ background: `linear-gradient(135deg, ${settings.primaryColor}, ${settings.accentColor})` }}
              className="text-white border-0"
            >
              Pogledaj
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return <ClinicListingCard clinic={clinic} compact={compact} />;
}


