import { Link } from 'react-router-dom';
import { MapPin, Star, Phone, Calendar, MessageSquare } from 'lucide-react';
import { formatRating } from '@/utils/formatters';
import { useDoctorCardSettings } from '@/hooks/useCardSettings';

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
  email?: string;
  public_email?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slika_profila?: string;
  prihvata_online?: boolean;
  name?: string;
  specialty?: string;
  location?: string;
  phone?: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  acceptsOnline?: boolean;
}

export interface DoctorListingCardSettings {
  showRating?: boolean;
  showLocation?: boolean;
  showPhone?: boolean;
  showSpecialty?: boolean;
  showBookButton?: boolean;
}

function normalizeDoctor(doctor: DoctorListingData) {
  const nameParts = doctor.name?.split(' ') || [];
  const contactEmail = (doctor.public_email || doctor.email || '').trim();

  return {
    slug: doctor.slug,
    ime: doctor.ime || nameParts[0] || '',
    prezime: doctor.prezime || nameParts.slice(1).join(' ') || '',
    specijalnost: doctor.specijalnost || doctor.specialty || '',
    grad: doctor.grad || doctor.location || '',
    lokacija: doctor.lokacija,
    telefon: (doctor.telefon || doctor.phone || '').trim(),
    email: contactEmail,
    ocjena: doctor.ocjena ?? doctor.rating,
    broj_ocjena: doctor.broj_ocjena ?? doctor.reviewCount,
    slika_profila: doctor.slika_profila || doctor.image,
    prihvata_online: doctor.prihvata_online ?? doctor.acceptsOnline,
  };
}

interface DoctorListingCardProps {
  doctor: DoctorListingData;
  compact?: boolean;
  settings?: DoctorListingCardSettings;
}

function DoctorAvatar({
  doctor,
  initials,
  compact = false,
}: {
  doctor: ReturnType<typeof normalizeDoctor>;
  initials: string;
  compact?: boolean;
}) {
  const frameClass = compact
    ? 'w-[88px] min-h-[104px]'
    : 'w-[104px] md:w-[112px] min-h-[120px] md:min-h-[128px]';

  if (doctor.slika_profila) {
    return (
      <div className={`relative shrink-0 self-stretch ${frameClass}`}>
        <img
          src={doctor.slika_profila}
          alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
          className="h-full w-full rounded-2xl object-cover bg-slate-100 ring-1 ring-slate-100"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center self-stretch rounded-2xl bg-gradient-to-br from-[#0891b2]/15 to-[#0891b2]/5 text-xl font-bold text-[#0891b2] ring-1 ring-[#0891b2]/10 ${frameClass}`}
    >
      {initials}
    </div>
  );
}

function DoctorActionIcons({
  doctor,
  profileUrl,
  settings,
}: {
  doctor: ReturnType<typeof normalizeDoctor>;
  profileUrl: string;
  settings: DoctorListingCardSettings;
}) {
  const hasPhone = settings.showPhone !== false && Boolean(doctor.telefon);
  const hasEmail = Boolean(doctor.email);
  const hasBooking = settings.showBookButton !== false && Boolean(doctor.prihvata_online);

  if (!hasPhone && !hasEmail && !hasBooking) {
    return null;
  }

  const outlineIconClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-[#0891b2]/30 hover:bg-[#0891b2]/5 hover:text-[#0891b2]';

  return (
    <div className="mt-auto flex items-center gap-2.5 pt-3">
      {hasPhone && (
        <a
          href={`tel:${doctor.telefon}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0891b2] text-white shadow-sm transition-colors hover:bg-[#0e7490]"
          aria-label={`Pozovite ${doctor.telefon}`}
          title={doctor.telefon}
        >
          <Phone className="h-[18px] w-[18px]" />
        </a>
      )}
      {hasBooking && (
        <Link
          to={`${profileUrl}#zakazi`}
          onClick={(e) => e.stopPropagation()}
          className={outlineIconClass}
          aria-label="Zakaži termin online"
          title="Online zakazivanje"
        >
          <Calendar className="h-[18px] w-[18px]" />
        </Link>
      )}
      {hasEmail && (
        <a
          href={`mailto:${doctor.email}`}
          onClick={(e) => e.stopPropagation()}
          className={outlineIconClass}
          aria-label={`Pošaljite email na ${doctor.email}`}
          title={doctor.email}
        >
          <MessageSquare className="h-[18px] w-[18px]" />
        </a>
      )}
    </div>
  );
}

export function DoctorListingCard({
  doctor: rawDoctor,
  compact = false,
  settings: propSettings,
}: DoctorListingCardProps) {
  const { settings: hookSettings } = useDoctorCardSettings();
  const cardSettings: DoctorListingCardSettings = {
    showRating: propSettings?.showRating ?? hookSettings.showRating,
    showLocation: propSettings?.showLocation ?? hookSettings.showLocation,
    showPhone: propSettings?.showPhone ?? hookSettings.showPhone,
    showSpecialty: propSettings?.showSpecialty ?? hookSettings.showSpecialty,
    showBookButton: propSettings?.showBookButton ?? hookSettings.showBookButton,
  };

  const doctor = normalizeDoctor(rawDoctor);
  const initials = `${doctor.ime?.[0] || ''}${doctor.prezime?.[0] || ''}`;
  const profileUrl = `/doktor/${doctor.slug}`;
  const locationLabel = [doctor.lokacija, doctor.grad].filter(Boolean).join(', ');
  const showRating = cardSettings.showRating !== false && doctor.ocjena && doctor.ocjena > 0;

  const cardClass = compact
    ? 'snap-start shrink-0 w-[300px] sm:w-[320px] md:w-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-[#0891b2]/20 hover:shadow-md'
    : 'h-full rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm transition-all hover:border-[#0891b2]/20 hover:shadow-[0_12px_32px_-12px_rgba(8,145,178,0.22)]';

  return (
    <Link to={profileUrl} className={`group block ${compact ? '' : 'h-full'}`}>
      <article className={`flex items-stretch gap-3.5 md:gap-4 ${cardClass}`}>
        <DoctorAvatar doctor={doctor} initials={initials} compact={compact} />

        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#0891b2] md:text-[17px]">
                  Dr. {doctor.ime} {doctor.prezime}
                </h3>
                {cardSettings.showSpecialty !== false && doctor.specijalnost ? (
                  <p className="mt-0.5 line-clamp-1 text-sm font-medium text-[#0891b2]">
                    {doctor.specijalnost}
                  </p>
                ) : null}
              </div>
              {showRating ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {formatRating(doctor.ocjena!)}
                </span>
              ) : null}
            </div>

            {cardSettings.showLocation !== false && locationLabel ? (
              <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0891b2]" />
                <span className="line-clamp-2 leading-snug">{locationLabel}</span>
              </div>
            ) : null}
          </div>

          <DoctorActionIcons doctor={doctor} profileUrl={profileUrl} settings={cardSettings} />
        </div>
      </article>
    </Link>
  );
}

export { BRAND as DOCTOR_BRAND_COLOR };
