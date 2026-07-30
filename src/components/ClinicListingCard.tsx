import { Link } from 'react-router-dom';
import { Building2, Clock, Globe, MapPin, MessageSquare, Navigation, Phone, Star, Users } from 'lucide-react';
import { formatNumber, formatRating } from '@/utils/formatters';
import { fixImageUrl } from '@/utils/imageUrl';
import { useClinicCardSettings } from '@/hooks/useCardSettings';
import { getDaySchedule, isClosedDay, WorkingHours } from '@/lib/booking-slots';

export interface ClinicListingData {
  id?: number | string;
  slug?: string;
  naziv: string;
  opis?: string;
  adresa?: string;
  grad?: string;
  telefon?: string;
  email?: string;
  contact_email?: string;
  website?: string;
  slike?: string[];
  radno_vrijeme?: WorkingHours | null;
  doktori?: unknown[];
  broj_doktora?: number;
  specijalnosti?: Array<{ id?: number | string; naziv?: string }>;
  ocjena?: number | string;
  broj_ocjena?: number;
  distance?: number;
}

export interface ClinicListingCardSettings {
  showImage?: boolean;
  showDescription?: boolean;
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  showWebsite?: boolean;
  showWorkingHours?: boolean;
  showDoctorsCount?: boolean;
  showDistance?: boolean;
}

interface ClinicListingCardProps {
  clinic: ClinicListingData;
  compact?: boolean;
  settings?: ClinicListingCardSettings;
}

function normalizeClinic(clinic: ClinicListingData) {
  const images = Array.isArray(clinic.slike) ? clinic.slike.filter(Boolean) : [];
  const mainImage = images.length > 0 ? fixImageUrl(images[0]) || images[0] : null;
  const doctorCount = clinic.broj_doktora ?? (Array.isArray(clinic.doktori) ? clinic.doktori.length : 0);
  const specialties = (clinic.specijalnosti || [])
    .map((specialty) => specialty?.naziv)
    .filter((naziv): naziv is string => Boolean(naziv));

  return {
    slug: String(clinic.slug || clinic.id || ''),
    naziv: clinic.naziv,
    opis: clinic.opis?.trim(),
    adresa: clinic.adresa?.trim(),
    grad: clinic.grad?.trim(),
    telefon: clinic.telefon?.trim(),
    email: (clinic.contact_email || clinic.email || '').trim(),
    website: clinic.website?.trim(),
    mainImage,
    doctorCount,
    specialties,
    ocjena: clinic.ocjena ? Number(clinic.ocjena) : undefined,
    broj_ocjena: clinic.broj_ocjena,
    distance: clinic.distance,
    radno_vrijeme: clinic.radno_vrijeme || undefined,
  };
}

/** Compact "open today" hint so users see availability without opening the profile. */
function getTodayHours(workingHours: WorkingHours | undefined) {
  if (!workingHours || Object.keys(workingHours).length === 0) return null;

  const schedule = getDaySchedule(workingHours, new Date());
  if (!schedule) return null;
  if (isClosedDay(schedule)) return { open: false, label: 'Danas zatvoreno' };

  const from = schedule.open || schedule.od;
  const to = schedule.close || schedule.do;
  if (!from || !to) return null;

  if (from === '00:00' && ['23:59', '24:00', '00:00'].includes(to)) {
    return { open: true, label: 'Otvoreno 24h' };
  }

  return { open: true, label: `Danas ${from} - ${to}` };
}

function ClinicLogo({
  clinic,
  compact,
}: {
  clinic: ReturnType<typeof normalizeClinic>;
  compact: boolean;
}) {
  const frameClass = compact
    ? 'w-[88px] min-h-[104px]'
    : 'w-[104px] md:w-[112px] min-h-[120px] md:min-h-[128px]';

  if (clinic.mainImage) {
    return (
      <div className={`relative shrink-0 self-stretch ${frameClass}`}>
        <img
          src={clinic.mainImage}
          alt={clinic.naziv}
          loading="lazy"
          className="h-full w-full rounded-2xl bg-slate-100 object-cover ring-1 ring-slate-100"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center self-stretch rounded-2xl bg-gradient-to-br from-[#0891b2]/15 to-[#0891b2]/5 ring-1 ring-[#0891b2]/10 ${frameClass}`}
    >
      <Building2 className="h-8 w-8 text-[#0891b2]" />
    </div>
  );
}

function ClinicActionIcons({
  clinic,
  settings,
}: {
  clinic: ReturnType<typeof normalizeClinic>;
  settings: ClinicListingCardSettings;
}) {
  const hasPhone = settings.showPhone !== false && Boolean(clinic.telefon);
  const hasEmail = settings.showEmail !== false && Boolean(clinic.email);
  const hasWebsite = settings.showWebsite !== false && Boolean(clinic.website);

  if (!hasPhone && !hasEmail && !hasWebsite) {
    return null;
  }

  const outlineIconClass =
    'flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-colors hover:border-[#0891b2]/30 hover:bg-[#0891b2]/5 hover:text-[#0891b2]';

  const websiteHref = clinic.website?.startsWith('http')
    ? clinic.website
    : `https://${clinic.website}`;

  return (
    <div className="mt-auto flex items-center gap-2.5 pt-3">
      {hasPhone && (
        <a
          href={`tel:${clinic.telefon}`}
          onClick={(e) => e.stopPropagation()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0891b2] text-white shadow-sm transition-colors hover:bg-[#0e7490]"
          aria-label={`Pozovite ${clinic.telefon}`}
          title={clinic.telefon}
        >
          <Phone className="h-[18px] w-[18px]" />
        </a>
      )}
      {hasEmail && (
        <a
          href={`mailto:${clinic.email}`}
          onClick={(e) => e.stopPropagation()}
          className={outlineIconClass}
          aria-label={`Pošaljite email na ${clinic.email}`}
          title={clinic.email}
        >
          <MessageSquare className="h-[18px] w-[18px]" />
        </a>
      )}
      {hasWebsite && (
        <a
          href={websiteHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={outlineIconClass}
          aria-label="Otvorite web stranicu klinike"
          title={clinic.website}
        >
          <Globe className="h-[18px] w-[18px]" />
        </a>
      )}
    </div>
  );
}

export function ClinicListingCard({
  clinic: rawClinic,
  compact = false,
  settings: propSettings,
}: ClinicListingCardProps) {
  const { settings: hookSettings } = useClinicCardSettings();
  const cardSettings: ClinicListingCardSettings = {
    showImage: propSettings?.showImage ?? hookSettings.showImage,
    showDescription: propSettings?.showDescription ?? hookSettings.showDescription,
    showAddress: propSettings?.showAddress ?? hookSettings.showAddress,
    showPhone: propSettings?.showPhone ?? hookSettings.showPhone,
    showEmail: propSettings?.showEmail ?? hookSettings.showEmail,
    showWebsite: propSettings?.showWebsite ?? hookSettings.showWebsite,
    showWorkingHours: propSettings?.showWorkingHours ?? hookSettings.showWorkingHours,
    showDoctorsCount: propSettings?.showDoctorsCount ?? hookSettings.showDoctorsCount,
    showDistance: propSettings?.showDistance ?? hookSettings.showDistance,
  };

  const clinic = normalizeClinic(rawClinic);
  const profileUrl = `/klinika/${clinic.slug}`;
  const locationLabel = [clinic.adresa, clinic.grad].filter(Boolean).join(', ');
  const showRating = clinic.ocjena !== undefined && clinic.ocjena > 0;
  const specialtyLabel =
    clinic.specialties.slice(0, 2).join(' · ') || 'Zdravstvena ustanova';
  const todayHours = cardSettings.showWorkingHours !== false ? getTodayHours(clinic.radno_vrijeme) : null;
  const showDoctors = cardSettings.showDoctorsCount !== false && clinic.doctorCount > 0;
  const showDistance = cardSettings.showDistance !== false && typeof clinic.distance === 'number';
  const hasMeta = Boolean(todayHours) || showDoctors || showDistance;

  const cardClass = compact
    ? 'snap-start shrink-0 w-[300px] sm:w-[320px] md:w-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:border-[#0891b2]/20 hover:shadow-md'
    : 'h-full rounded-2xl border border-slate-100 bg-white p-4 md:p-5 shadow-sm transition-all hover:border-[#0891b2]/20 hover:shadow-[0_12px_32px_-12px_rgba(8,145,178,0.22)]';

  return (
    <Link to={profileUrl} className={`group block ${compact ? '' : 'h-full'}`}>
      <article className={`flex items-stretch gap-3.5 md:gap-4 ${cardClass}`}>
        {cardSettings.showImage !== false && <ClinicLogo clinic={clinic} compact={compact} />}

        <div className="flex min-w-0 flex-1 flex-col">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-base font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#0891b2] md:text-[17px]">
                  {clinic.naziv}
                </h3>
                <p className="mt-0.5 line-clamp-1 text-sm font-medium text-[#0891b2]">
                  {specialtyLabel}
                </p>
              </div>
              {showRating ? (
                <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-100">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {formatRating(clinic.ocjena)}
                </span>
              ) : null}
            </div>

            {cardSettings.showAddress !== false && locationLabel ? (
              <div className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0891b2]" />
                <span className="line-clamp-2 leading-snug">{locationLabel}</span>
              </div>
            ) : null}

            {!compact && cardSettings.showDescription !== false && clinic.opis ? (
              <p className="mt-2 line-clamp-2 text-sm leading-snug text-slate-500">{clinic.opis}</p>
            ) : null}

            {hasMeta ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {todayHours ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      todayHours.open
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {todayHours.label}
                  </span>
                ) : null}
                {showDoctors ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    <Users className="h-3 w-3" />
                    {clinic.doctorCount} {clinic.doctorCount === 1 ? 'doktor' : 'doktora'}
                  </span>
                ) : null}
                {showDistance ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                    <Navigation className="h-3 w-3" />
                    {formatNumber(clinic.distance)} km
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          <ClinicActionIcons clinic={clinic} settings={cardSettings} />
        </div>
      </article>
    </Link>
  );
}
