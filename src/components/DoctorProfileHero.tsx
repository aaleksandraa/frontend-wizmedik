import { Link } from 'react-router-dom';
import { Phone, Star, MessageSquare, Video, MapPin, Calendar, Users, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatRating } from '@/utils/formatters';

interface DoctorProfileHeroProps {
  doctor: {
    ime: string;
    prezime: string;
    specijalnost: string;
    slika_profila?: string;
    telefon: string;
    grad: string;
    lokacija: string;
    ocjena?: number;
    broj_ocjena?: number;
    prihvata_online?: boolean;
    telemedicine_enabled?: boolean;
    telemedicine_phone?: string;
  };
  serviceCount: number;
  onBookClick: () => void;
  onPhoneClick?: () => void;
  onTelemedicineClick?: () => void;
}

export function DoctorProfileHero({
  doctor,
  serviceCount,
  onBookClick,
  onPhoneClick,
  onTelemedicineClick,
}: DoctorProfileHeroProps) {
  const specijalnostSlug = doctor.specijalnost?.toLowerCase().replace(/\s+/g, '-') || '';
  const initials = `${doctor.ime?.[0] || ''}${doctor.prezime?.[0] || ''}`;

  const stats = [
    {
      icon: Star,
      value: doctor.ocjena && doctor.broj_ocjena ? formatRating(doctor.ocjena) : '—',
      label: 'Ocjena',
    },
    {
      icon: Users,
      value: doctor.broj_ocjena ? `${doctor.broj_ocjena}+` : '—',
      label: 'Recenzija',
    },
    {
      icon: Briefcase,
      value: serviceCount > 0 ? `${serviceCount}` : '—',
      label: serviceCount === 1 ? 'Usluga' : 'Usluge',
    },
  ];

  return (
    <div className="relative mb-6 md:mb-10">
      {/* Gradient hero — full bleed */}
      <div className="relative overflow-hidden rounded-b-[2rem] md:rounded-b-[2.5rem] bg-gradient-to-br from-[#0891b2] via-[#0e7490] to-[#155e75]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
        </div>

        <div className="container relative mx-auto px-4 pb-28 pt-6 md:pb-32 md:pt-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
            {/* Portrait */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-[1.75rem] bg-white/20 blur-xl" />
              {doctor.slika_profila ? (
                <img
                  src={doctor.slika_profila}
                  alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                  className="relative h-36 w-36 rounded-[1.75rem] border-4 border-white/90 object-cover shadow-2xl md:h-44 md:w-44"
                />
              ) : (
                <div className="relative flex h-36 w-36 items-center justify-center rounded-[1.75rem] border-4 border-white/90 bg-white/20 text-3xl font-bold text-white shadow-2xl md:h-44 md:w-44 md:text-4xl">
                  {initials}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:pb-2 md:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <Badge className="border-0 bg-white/20 text-white hover:bg-white/25">
                  {doctor.specijalnost}
                </Badge>
                <Badge
                  className={`border-0 ${
                    doctor.prihvata_online
                      ? 'bg-emerald-500/90 text-white'
                      : 'bg-white/15 text-white/90'
                  }`}
                >
                  {doctor.prihvata_online ? 'Online rezervacije' : 'Samo telefon'}
                </Badge>
              </div>

              <h1 className="mb-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
                Dr. {doctor.ime} {doctor.prezime}
              </h1>

              <div className="mb-4 flex flex-wrap items-center justify-center gap-3 text-white/90 md:justify-start">
                {doctor.ocjena && doctor.broj_ocjena ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
                    <span className="font-semibold">{formatRating(doctor.ocjena)}</span>
                    <span className="text-white/70">({doctor.broj_ocjena})</span>
                  </span>
                ) : (
                  <span className="text-sm text-white/70">Još nema recenzija</span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4" />
                  {doctor.lokacija}, {doctor.grad}
                </span>
              </div>

              {/* Quick actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
                {doctor.prihvata_online && (
                  <Button
                    size="lg"
                    onClick={onBookClick}
                    className="rounded-full bg-white text-[#0891b2] shadow-lg hover:bg-white/95"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Zakaži termin
                  </Button>
                )}
                {doctor.telefon && (
                  <a
                    href={`tel:${doctor.telefon}`}
                    onClick={onPhoneClick}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                    aria-label="Pozovite doktora"
                  >
                    <Phone className="h-5 w-5" />
                  </a>
                )}
                <Link
                  to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                  aria-label="Postavi pitanje"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                {doctor.telemedicine_enabled && doctor.telemedicine_phone && (
                  <a
                    href={`tel:${doctor.telemedicine_phone}`}
                    onClick={onTelemedicineClick}
                    className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 transition-colors hover:bg-white/25"
                    aria-label="Video konsultacija"
                  >
                    <Video className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar — overlaps hero */}
      <div className="container relative mx-auto -mt-20 px-4 md:-mt-24">
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-[#0891b2]/10 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(8,145,178,0.25)] md:gap-4 md:p-5">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center md:flex-row md:gap-3 md:text-left">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0891b2]/10 text-[#0891b2]">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground md:text-xl">{value}</p>
                <p className="text-xs text-muted-foreground md:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
