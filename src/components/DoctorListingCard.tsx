import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, ArrowUpRight, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatRating } from '@/utils/formatters';

const BRAND = '#0891b2';

export interface DoctorListingData {
  id?: number | string;
  slug: string;
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
  name?: string;
  specialty?: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  acceptsOnline?: boolean;
}

function normalizeDoctor(doctor: DoctorListingData) {
  const nameParts = doctor.name?.split(' ') || [];
  return {
    slug: doctor.slug,
    ime: doctor.ime || nameParts[0] || '',
    prezime: doctor.prezime || nameParts.slice(1).join(' ') || '',
    specijalnost: doctor.specijalnost || doctor.specialty || '',
    grad: doctor.grad || doctor.location || '',
    lokacija: doctor.lokacija,
    ocjena: doctor.ocjena ?? doctor.rating,
    broj_ocjena: doctor.broj_ocjena ?? doctor.reviewCount,
    slika_profila: doctor.slika_profila || doctor.image,
    prihvata_online: doctor.prihvata_online ?? doctor.acceptsOnline,
  };
}

interface DoctorListingCardProps {
  doctor: DoctorListingData;
  compact?: boolean;
  showBookButton?: boolean;
}

export function DoctorListingCard({
  doctor: rawDoctor,
  compact = false,
  showBookButton = true,
}: DoctorListingCardProps) {
  const doctor = normalizeDoctor(rawDoctor);
  const initials = `${doctor.ime?.[0] || ''}${doctor.prezime?.[0] || ''}`;
  const profileUrl = `/doktor/${doctor.slug}`;

  if (compact) {
    return (
      <Link to={profileUrl} className="group block snap-start shrink-0 w-[260px] sm:w-[280px] md:w-auto">
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0891b2]/10 bg-white shadow-[0_4px_24px_-8px_rgba(8,145,178,0.12)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-12px_rgba(8,145,178,0.22)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#0891b2]/5">
            {doctor.slika_profila ? (
              <img
                src={doctor.slika_profila}
                alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0891b2]/20 to-[#0891b2]/5 text-3xl font-bold text-[#0891b2]">
                {initials}
              </div>
            )}
            <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#0891b2] shadow-md transition-transform group-hover:scale-110">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-[#0891b2] transition-colors">
              Dr. {doctor.ime} {doctor.prezime}
            </h3>
            <p className="mt-1 text-sm text-[#0891b2] font-medium line-clamp-1">{doctor.specijalnost}</p>
            {doctor.ocjena && doctor.ocjena > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold">{formatRating(doctor.ocjena)}</span>
                {doctor.broj_ocjena ? (
                  <span className="text-xs text-gray-500">({doctor.broj_ocjena})</span>
                ) : null}
              </div>
            )}
            <div className="mt-auto pt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#0891b2]" />
              <span className="line-clamp-1">{doctor.lokacija || doctor.grad}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={profileUrl} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#0891b2]/10 bg-white shadow-[0_4px_24px_-8px_rgba(8,145,178,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_-16px_rgba(8,145,178,0.28)]">
        <div className="relative h-1.5 bg-gradient-to-r from-[#0891b2] to-[#22d3ee]" />

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start gap-4">
            {doctor.slika_profila ? (
              <img
                src={doctor.slika_profila}
                alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                className="h-20 w-20 shrink-0 rounded-2xl border-2 border-[#0891b2]/15 object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-[#0891b2]/15 bg-[#0891b2]/10 text-xl font-bold text-[#0891b2]">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold text-gray-900 group-hover:text-[#0891b2] transition-colors">
                    Dr. {doctor.ime} {doctor.prezime}
                  </h3>
                  {doctor.specijalnost && (
                    <Badge className="mt-1.5 border-0 bg-[#0891b2]/10 text-[#0891b2] hover:bg-[#0891b2]/15 font-normal">
                      {doctor.specijalnost}
                    </Badge>
                  )}
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0891b2]/10 text-[#0891b2] transition-colors group-hover:bg-[#0891b2] group-hover:text-white">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>

              {doctor.ocjena && doctor.ocjena > 0 ? (
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-gray-900">{formatRating(doctor.ocjena)}</span>
                  {doctor.broj_ocjena ? (
                    <span className="text-xs text-gray-500">({doctor.broj_ocjena})</span>
                  ) : null}
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-400">Još nema recenzija</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4 shrink-0 text-[#0891b2]" />
            <span className="truncate">{doctor.lokacija ? `${doctor.lokacija}, ` : ''}{doctor.grad}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {doctor.prihvata_online && (
              <Badge className="border-0 bg-emerald-50 text-emerald-700 font-normal">
                <CheckCircle className="mr-1 h-3 w-3" />
                Online rezervacije
              </Badge>
            )}
          </div>

          {showBookButton && (
            <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0891b2] py-2.5 text-sm font-medium text-white shadow-sm transition-colors group-hover:bg-[#0e7490]">
              <Calendar className="h-4 w-4" />
              Pogledaj profil
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export { BRAND as DOCTOR_BRAND_COLOR };
