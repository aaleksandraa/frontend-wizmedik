import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { safeInternalPath } from '@/utils/navigation';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { LocationMapCard } from '@/components/LocationMapCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fixImageUrl } from '@/utils/imageUrl';
import { pharmaciesAPI } from '@/services/api';
import { trackContactClick, trackProfileView } from '@/config/analytics';
import {
  Accessibility,
  BadgePercent,
  Building2,
  Camera,
  ChevronRight,
  CircleParking,
  Clock3,
  ExternalLink,
  Gift,
  ImageIcon,
  Info,
  Mail,
  MapPin,
  Megaphone,
  Navigation,
  Phone,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  X,
} from 'lucide-react';

type PharmacyStatus = {
  open_now: boolean;
  is_dezurna: boolean;
  is_24h: boolean;
  status_label: string;
  next_change_at: string | null;
};

type PharmacyHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
};

type PharmacyHourException = {
  id: number;
  date: string;
  open_time: string | null;
  close_time: string | null;
  closed: boolean;
  reason?: string | null;
};

type PharmacyDiscount = {
  id: number;
  tip: 'penzioneri' | 'studenti' | 'porodicni' | 'svi';
  discount_percent?: number | null;
  discount_amount?: number | null;
  min_purchase?: number | null;
  uslovi?: string | null;
};

type PharmacyAction = {
  id: number;
  naslov: string;
  opis?: string | null;
  image_url?: string | null;
  promo_code?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
};

type PharmacyOffer = {
  id: number;
  offer_type: string;
  title: string;
  description?: string | null;
  target_group?: string | null;
  discount_percent?: number | null;
  discount_amount?: number | null;
  service_name?: string | null;
  conditions_json?: Record<string, unknown> | null;
};

type PharmacyProfileResponse = {
  id: number;
  naziv: string;
  slug: string;
  adresa: string;
  grad_naziv?: string | null;
  postanski_broj?: string | null;
  telefon?: string | null;
  email?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  kratki_opis?: string | null;
  profilna_slika_url?: string | null;
  galerija_slike?: string[] | null;
  google_maps_link?: string | null;
  website?: string | null;
  ima_dostavu: boolean;
  ima_parking: boolean;
  pristup_invalidima: boolean;
  is_24h: boolean;
  ocjena?: number | null;
  broj_ocjena?: number;
  status: PharmacyStatus;
  radno_vrijeme?: PharmacyHour[];
  radno_vrijeme_izuzeci?: PharmacyHourException[];
  active_discounts?: PharmacyDiscount[];
  active_actions?: PharmacyAction[];
  active_offers?: PharmacyOffer[];
  firma?: {
    naziv_brenda?: string | null;
    opis?: string | null;
    website?: string | null;
  };
  schema_ready?: Record<string, unknown>;
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const dayLabels: Record<number, string> = {
  1: 'Ponedjeljak',
  2: 'Utorak',
  3: 'Srijeda',
  4: 'Četvrtak',
  5: 'Petak',
  6: 'Subota',
  7: 'Nedjelja',
};

const shortDayLabels: Record<number, string> = {
  1: 'Pon',
  2: 'Uto',
  3: 'Sri',
  4: 'Čet',
  5: 'Pet',
  6: 'Sub',
  7: 'Ned',
};

const discountTypeLabels: Record<PharmacyDiscount['tip'], string> = {
  penzioneri: 'Penzioneri',
  studenti: 'Studenti',
  porodicni: 'Porodični',
  svi: 'Svi kupci',
};

const targetGroupLabels: Record<string, string> = {
  svi: 'Svi kupci',
  penzioneri: 'Penzioneri',
  studenti: 'Studenti',
  djeca: 'Djeca',
  hronicni_bolesnici: 'Hronični bolesnici',
};

const toAbsoluteUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const fixed = fixImageUrl(value) || value;
  if (fixed.startsWith('http://') || fixed.startsWith('https://')) return fixed;
  return `${SITE_URL}${fixed.startsWith('/') ? '' : '/'}${fixed}`;
};

const normalizeExternalUrl = (value?: string | null): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const formatDateOnly = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium' }).format(date);
};

const formatTimeOnly = (value?: string | null): string => {
  if (!value) return '--:--';

  const normalized = value.trim();
  const timeMatch = normalized.match(/^(\d{2}:\d{2})(?::\d{2})?$/);

  return timeMatch ? timeMatch[1] : normalized;
};

const getTodayDayNumber = (): number => {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 7 : jsDay;
};

const formatDiscountValue = (item: PharmacyDiscount | PharmacyOffer): string | null => {
  if (item.discount_percent) return `-${item.discount_percent}%`;
  if (item.discount_amount) return `-${item.discount_amount} KM`;
  return null;
};

export default function PharmacyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [pharmacy, setPharmacy] = useState<PharmacyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await pharmaciesAPI.getBySlug(slug);
        const payload = response.data;
        const redirectTo = safeInternalPath(payload?.redirect_to);
        if (redirectTo) {
          setPharmacy(null);
          navigate(redirectTo, { replace: true });
          return;
        }

        setPharmacy(payload);
        trackProfileView({
          entity_type: 'pharmacy',
          entity_id: payload?.id,
          entity_name: payload?.naziv,
          pharmacy_id: payload?.id,
          pharmacy_name: payload?.naziv,
          city: payload?.grad_naziv,
          profile_slug: payload?.slug || slug,
          is_24h: payload?.is_24h,
          is_on_duty: payload?.status?.is_dezurna,
        });
      } catch (error) {
        console.error('Error loading pharmacy profile', error);
        setPharmacy(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate, slug]);

  const city = pharmacy?.grad_naziv || 'Bosna i Hercegovina';
  const canonicalUrl = pharmacy ? `${SITE_URL}/apoteka/${pharmacy.slug}` : `${SITE_URL}/apoteka`;
  const primaryImage = toAbsoluteUrl(pharmacy?.profilna_slika_url || pharmacy?.galerija_slike?.[0] || null);
  const seoImage = primaryImage || DEFAULT_OG_IMAGE;
  const seoDescription = useMemo(() => {
    if (!pharmacy) {
      return 'Profil apoteke na wizMedik platformi.';
    }
    return (
      pharmacy.kratki_opis ||
      `${pharmacy.naziv} u gradu ${city}. Provjerite radno vrijeme, status rada, lokaciju i aktivne ponude.`
    ).slice(0, 160);
  }, [pharmacy, city]);

  const images = useMemo(() => {
    if (!pharmacy) return [] as string[];
    const all = [pharmacy.profilna_slika_url, ...(pharmacy.galerija_slike || [])]
      .filter(Boolean)
      .map((item) => toAbsoluteUrl(item))
      .filter((item): item is string => Boolean(item));
    return Array.from(new Set(all));
  }, [pharmacy]);

  const hoursByDay = useMemo(() => {
    const map = new Map<number, PharmacyHour>();
    (pharmacy?.radno_vrijeme || []).forEach((item) => map.set(item.day_of_week, item));
    return [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      day,
      label: dayLabels[day],
      shortLabel: shortDayLabels[day],
      item: map.get(day),
    }));
  }, [pharmacy]);

  const schemaData = useMemo(() => {
    if (!pharmacy?.schema_ready) return null;
    return {
      '@context': 'https://schema.org',
      ...pharmacy.schema_ready,
      url: canonicalUrl,
      image: seoImage,
    };
  }, [pharmacy, canonicalUrl, seoImage]);

  const hasPensionerDiscount = useMemo(() => {
    if (!pharmacy) return false;

    const pensionerDiscount = (pharmacy.active_discounts || []).some(
      (discount) => discount.tip === 'penzioneri'
    );
    const pensionerOffer = (pharmacy.active_offers || []).some(
      (offer) => offer.target_group === 'penzioneri'
    );

    return pensionerDiscount || pensionerOffer;
  }, [pharmacy]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-5">
          <Skeleton className="h-[420px] w-full rounded-lg" />
          <div className="grid md:grid-cols-4 gap-3">
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
          <Skeleton className="h-72 w-full rounded-lg" />
        </div>
        <Footer />
      </>
    );
  }

  if (!pharmacy) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Pill className="w-14 h-14 mx-auto text-gray-300 mb-3" />
          <h1 className="text-2xl font-bold mb-2">Apoteka nije pronađena</h1>
          <p className="text-gray-600 mb-6">Profil ne postoji ili nije javno dostupan.</p>
          <Link to="/apoteke">
            <Button>Nazad na listu apoteka</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const pharmacyAnalyticsEntity = {
    entity_type: 'pharmacy' as const,
    entity_id: pharmacy.id,
    entity_name: pharmacy.naziv,
    pharmacy_id: pharmacy.id,
    pharmacy_name: pharmacy.naziv,
    city,
    profile_slug: pharmacy.slug,
    is_24h: pharmacy.is_24h,
    is_on_duty: pharmacy.status.is_dezurna,
  };

  const websiteUrl = normalizeExternalUrl(pharmacy.website || pharmacy.firma?.website);
  const mapsLink =
    pharmacy.google_maps_link ||
    (pharmacy.latitude && pharmacy.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${pharmacy.naziv}, ${pharmacy.adresa}, ${city}`)}`);
  const displayAddress = `${pharmacy.adresa}, ${city}${pharmacy.postanski_broj ? `, ${pharmacy.postanski_broj}` : ''}`;
  const today = hoursByDay.find((entry) => entry.day === getTodayDayNumber());
  const todayHours =
    pharmacy.is_24h
      ? 'Otvoreno 0-24'
      : today?.item && !today.item.closed
        ? `${formatTimeOnly(today.item.open_time)} - ${formatTimeOnly(today.item.close_time)}`
        : 'Zatvoreno';
  const statusClass = pharmacy.status.open_now
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';
  const statusBadgeClass = pharmacy.status.open_now
    ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
    : 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50';
  const statusDotClass = pharmacy.status.open_now ? 'bg-emerald-500' : 'bg-rose-500';
  const hasActiveOffers = (pharmacy.active_offers || []).length > 0;
  const hasActiveDiscounts = (pharmacy.active_discounts || []).length > 0;
  const hasActiveActions = (pharmacy.active_actions || []).length > 0;
  const hasAnyBenefits = hasActiveOffers || hasActiveDiscounts || hasActiveActions;
  const hasHourExceptions = (pharmacy.radno_vrijeme_izuzeci || []).length > 0;
  const ratingValue = Number(pharmacy.ocjena || 0);

  const featureCards = [
    {
      show: true,
      icon: Clock3,
      title: pharmacy.status.open_now ? 'Trenutno otvoreno' : 'Status rada',
      description: pharmacy.is_24h ? 'Non-stop apoteka dostupna 0-24.' : `Danas: ${todayHours}`,
      className: pharmacy.status.open_now ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50',
    },
    {
      show: pharmacy.ima_dostavu,
      icon: Truck,
      title: 'Dostava lijekova',
      description: 'Označeno u profilu apoteke.',
      className: 'text-cyan-700 bg-cyan-50',
    },
    {
      show: pharmacy.ima_parking,
      icon: CircleParking,
      title: 'Parking',
      description: 'Dostupan parking za posjetioce.',
      className: 'text-blue-700 bg-blue-50',
    },
    {
      show: pharmacy.pristup_invalidima,
      icon: Accessibility,
      title: 'Pristup invalidima',
      description: 'Objekat ima označen pristupačan ulaz.',
      className: 'text-violet-700 bg-violet-50',
    },
    {
      show: pharmacy.status.is_dezurna,
      icon: ShieldAlert,
      title: 'Dežurna apoteka',
      description: 'Apoteka je trenutno u režimu dežurstva.',
      className: 'text-amber-700 bg-amber-50',
    },
    {
      show: hasPensionerDiscount,
      icon: BadgePercent,
      title: 'Popust za penzionere',
      description: 'Aktivna pogodnost za penzionere.',
      className: 'text-emerald-700 bg-emerald-50',
    },
  ].filter((item) => item.show).slice(0, 4);

  const serviceTiles = [
    {
      show: pharmacy.ima_dostavu,
      icon: Truck,
      title: 'Dostava',
      description: 'Dostava je označena kao dostupna.',
    },
    {
      show: pharmacy.is_24h || pharmacy.status.is_dezurna,
      icon: ShieldCheck,
      title: pharmacy.is_24h ? 'Non-stop rad' : 'Dežurstvo',
      description: pharmacy.is_24h ? 'Rad 24 sata dnevno.' : 'Trenutno aktivno dežurstvo.',
    },
    {
      show: hasActiveDiscounts,
      icon: BadgePercent,
      title: 'Popusti',
      description: `${pharmacy.active_discounts?.length || 0} aktivnih popusta.`,
    },
    {
      show: hasActiveActions,
      icon: Megaphone,
      title: 'Akcije',
      description: `${pharmacy.active_actions?.length || 0} aktivnih akcija.`,
    },
    {
      show: hasActiveOffers,
      icon: Gift,
      title: 'Posebne ponude',
      description: `${pharmacy.active_offers?.length || 0} aktivnih ponuda.`,
    },
  ].filter((item) => item.show);
  const hasServiceTiles = serviceTiles.length > 0;

  return (
    <>
      <Helmet>
        <title>{`${pharmacy.naziv} - Apoteka u ${city} | wizMedik`}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={`${pharmacy.naziv} - Apoteka`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={seoImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pharmacy.naziv} - Apoteka`} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={seoImage} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        {schemaData ? <script type="application/ld+json">{JSON.stringify(schemaData)}</script> : null}
      </Helmet>

      <div className="min-h-screen bg-[#f6f8fb]">
        <Navbar />

        <main className="pb-12">
          <section className="pt-4 md:pt-6">
            <div className="container mx-auto px-4">
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(380px,0.92fr)]">
                  <div className="relative aspect-video bg-slate-100">
                    {primaryImage ? (
                      <button
                        type="button"
                        className="block h-full w-full"
                        onClick={() => setSelectedImage(primaryImage)}
                      >
                        <img
                          src={primaryImage}
                          alt={pharmacy.naziv}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-cyan-50">
                        <div className="text-center text-slate-500">
                          <Building2 className="mx-auto mb-3 h-14 w-14 text-slate-300" />
                          <p className="font-medium">{pharmacy.naziv}</p>
                        </div>
                      </div>
                    )}

                    {images.length > 1 ? (
                      <button
                        type="button"
                        className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-slate-950/80 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-slate-950"
                        onClick={() => setSelectedImage(images[0])}
                      >
                        <ImageIcon className="h-4 w-4" />
                        {images.length} slika
                      </button>
                    ) : null}
                  </div>

                  <div className="flex flex-col justify-center p-5 md:p-8">
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <Badge className={statusBadgeClass}>
                        <span className={`mr-2 h-2 w-2 rounded-full ${statusDotClass}`} />
                        {pharmacy.status.status_label}
                      </Badge>
                      {pharmacy.status.is_dezurna ? (
                        <Badge className="border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50">
                          <ShieldAlert className="mr-1 h-3.5 w-3.5" />
                          Dežurna
                        </Badge>
                      ) : null}
                      {pharmacy.is_24h ? (
                        <Badge className="border border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-50">24/7</Badge>
                      ) : null}
                    </div>

                    <h1 className="text-3xl font-bold leading-tight text-slate-950 md:text-4xl">
                      {pharmacy.naziv}
                    </h1>

                    {ratingValue > 0 ? (
                      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= Math.round(ratingValue)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-semibold text-slate-900">{ratingValue.toFixed(1)}</span>
                          <span>({pharmacy.broj_ocjena || 0} ocjena)</span>
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-6 space-y-3 text-sm text-slate-700">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span className="pt-1.5">{displayAddress}</span>
                      </div>
                      {pharmacy.telefon ? (
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                            <Phone className="h-4 w-4" />
                          </span>
                          <a
                            href={`tel:${pharmacy.telefon}`}
                            className="pt-1.5 font-medium text-slate-900 hover:text-cyan-700"
                            onClick={() => trackContactClick('phone', pharmacyAnalyticsEntity, 'profile_hero_info')}
                          >
                            {pharmacy.telefon}
                          </a>
                        </div>
                      ) : null}
                      {pharmacy.ima_dostavu ? (
                        <div className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700">
                            <Truck className="h-4 w-4" />
                          </span>
                          <span className="pt-1.5">Dostava lijekova označena kao dostupna</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {pharmacy.telefon ? (
                        <Button asChild className="h-12 bg-cyan-700 text-white hover:bg-cyan-800">
                          <a
                            href={`tel:${pharmacy.telefon}`}
                            onClick={() => trackContactClick('phone', pharmacyAnalyticsEntity, 'profile_hero_cta')}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Pozovi
                          </a>
                        </Button>
                      ) : null}
                      <Button asChild className="h-12 bg-emerald-600 text-white hover:bg-emerald-700">
                        <a
                          href={mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackContactClick('map', pharmacyAnalyticsEntity, 'profile_hero_cta')}
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Navigacija
                        </a>
                      </Button>
                      {websiteUrl ? (
                        <Button asChild variant="outline" className="h-12 border-slate-200 bg-white">
                          <a
                            href={websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => trackContactClick('website', pharmacyAnalyticsEntity, 'profile_hero_cta')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Web
                          </a>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {featureCards.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {featureCards.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={feature.title}
                        className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${feature.className}`}>
                            <Icon className="h-5 w-5" />
                          </span>
                          <div>
                            <p className="font-semibold text-slate-950">{feature.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </section>

          <section className="pt-6">
            <div className="container mx-auto px-4">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="space-y-5">
                  {(pharmacy.kratki_opis || pharmacy.firma?.opis) ? (
                    <Card className="rounded-lg border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Info className="h-5 w-5 text-cyan-700" />
                          O apoteci
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm leading-6 text-slate-700">
                        {pharmacy.kratki_opis ? <p>{pharmacy.kratki_opis}</p> : null}
                        {pharmacy.firma?.opis ? <p>{pharmacy.firma.opis}</p> : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  {hasServiceTiles ? (
                    <Card className="rounded-lg border-slate-200 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="text-base">Usluge i pogodnosti</CardTitle>
                        <Badge variant="outline">{serviceTiles.length} stavki</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 md:grid-cols-2">
                          {serviceTiles.map((service) => {
                            const Icon = service.icon;
                            return (
                              <div
                                key={service.title}
                                className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50/40"
                              >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-cyan-50 text-cyan-700">
                                  <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                  <p className="font-semibold text-slate-950">{service.title}</p>
                                  <p className="mt-1 text-sm leading-5 text-slate-600">{service.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}

                  {hasAnyBenefits ? (
                    <Card className="rounded-lg border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="text-base">Aktivne pogodnosti</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-5">
                        {hasActiveOffers ? (
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <Gift className="h-4 w-4 text-emerald-700" />
                              Posebne ponude
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {pharmacy.active_offers?.map((offer) => (
                                <div key={offer.id} className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="font-semibold text-slate-950">{offer.title}</p>
                                    {formatDiscountValue(offer) ? (
                                      <Badge className="bg-emerald-600">{formatDiscountValue(offer)}</Badge>
                                    ) : null}
                                  </div>
                                  {offer.description ? (
                                    <p className="mt-2 text-sm text-slate-600">{offer.description}</p>
                                  ) : null}
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {offer.target_group ? (
                                      <Badge variant="outline">{targetGroupLabels[offer.target_group] || offer.target_group}</Badge>
                                    ) : null}
                                    {offer.service_name ? <Badge variant="outline">{offer.service_name}</Badge> : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {hasActiveDiscounts ? (
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <BadgePercent className="h-4 w-4 text-cyan-700" />
                              Popusti
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {pharmacy.active_discounts?.map((discount) => (
                                <div key={discount.id} className="rounded-lg border border-cyan-100 bg-cyan-50/50 p-4">
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="font-semibold text-slate-950">{discountTypeLabels[discount.tip]}</p>
                                    {formatDiscountValue(discount) ? (
                                      <Badge className="bg-cyan-700">{formatDiscountValue(discount)}</Badge>
                                    ) : null}
                                  </div>
                                  {discount.min_purchase ? (
                                    <p className="mt-2 text-sm text-slate-600">Minimalna kupovina: {discount.min_purchase} KM</p>
                                  ) : null}
                                  {discount.uslovi ? <p className="mt-2 text-sm text-slate-600">{discount.uslovi}</p> : null}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {hasActiveActions ? (
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <Megaphone className="h-4 w-4 text-amber-700" />
                              Akcije
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                              {pharmacy.active_actions?.map((action) => (
                                <div key={action.id} className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                                  <p className="font-semibold text-slate-950">{action.naslov}</p>
                                  {action.opis ? <p className="mt-2 text-sm text-slate-600">{action.opis}</p> : null}
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {action.promo_code ? <Badge variant="outline">Promo kod: {action.promo_code}</Badge> : null}
                                    {action.ends_at ? <Badge variant="outline">Do {formatDateOnly(action.ends_at)}</Badge> : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  ) : null}

                  <div className={hasHourExceptions ? 'grid gap-5 xl:grid-cols-[0.95fr_1.05fr]' : 'grid gap-5'}>
                    <Card className="rounded-lg border-slate-200 shadow-sm">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Clock3 className="h-5 w-5 text-cyan-700" />
                          Radno vrijeme
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className={`rounded-lg border px-4 py-3 ${statusClass}`}>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold">Danas je {today?.label || 'danas'}</p>
                              <p className="text-sm">{todayHours}</p>
                            </div>
                            <ChevronRight className="h-5 w-5" />
                          </div>
                        </div>

                        {pharmacy.is_24h ? (
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                            Ova apoteka radi non-stop, 0-24 svaki dan.
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            {hoursByDay.map((entry) => (
                              <div
                                key={entry.day}
                                className="grid grid-cols-[90px_1fr] items-center gap-3 rounded-md border border-slate-200 px-3 py-2 text-sm"
                              >
                                <span className="font-medium text-slate-800">{entry.label}</span>
                                {!entry.item || entry.item.closed ? (
                                  <span className="text-right text-slate-500">Zatvoreno</span>
                                ) : (
                                  <span className="text-right font-medium text-slate-950">
                                    {formatTimeOnly(entry.item.open_time)} - {formatTimeOnly(entry.item.close_time)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {hasHourExceptions ? (
                      <Card className="rounded-lg border-slate-200 shadow-sm">
                        <CardHeader>
                          <CardTitle className="text-base">Izuzeci radnog vremena</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {pharmacy.radno_vrijeme_izuzeci?.map((exception) => (
                            <div key={exception.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
                              <div>
                                <p className="font-medium text-slate-950">{formatDateOnly(exception.date)}</p>
                                {exception.reason ? <p className="text-xs text-slate-500">{exception.reason}</p> : null}
                              </div>
                              {exception.closed ? (
                                <Badge variant="secondary">Zatvoreno</Badge>
                              ) : (
                                <Badge variant="outline">
                                  {formatTimeOnly(exception.open_time)} - {formatTimeOnly(exception.close_time)}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>

                  {images.length > 0 ? (
                    <Card className="rounded-lg border-slate-200 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Camera className="h-5 w-5 text-cyan-700" />
                          Galerija
                        </CardTitle>
                        <Badge variant="outline">{images.length}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                          {images.slice(0, 8).map((image, index) => (
                            <button
                              key={`${image}-${index}`}
                              type="button"
                              className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                              onClick={() => setSelectedImage(image)}
                            >
                              <img
                                src={image}
                                alt={`${pharmacy.naziv} ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                              {index === 7 && images.length > 8 ? (
                                <span className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-lg font-semibold text-white">
                                  +{images.length - 8}
                                </span>
                              ) : null}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </div>

                <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                  <LocationMapCard
                    naziv={pharmacy.naziv}
                    adresa={pharmacy.adresa}
                    grad={city}
                    latitude={pharmacy.latitude || undefined}
                    longitude={pharmacy.longitude || undefined}
                    googleMapsLink={pharmacy.google_maps_link || undefined}
                    markerColor="orange"
                    mapHeightClass="h-[230px]"
                    onDirectionsClick={() => trackContactClick('map', pharmacyAnalyticsEntity, 'map_card')}
                  />

                  <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Kontakt</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                      {pharmacy.telefon ? (
                        <a
                          href={`tel:${pharmacy.telefon}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-cyan-200 hover:bg-cyan-50"
                          onClick={() => trackContactClick('phone', pharmacyAnalyticsEntity, 'profile_contact_card')}
                        >
                          <Phone className="h-4 w-4 text-cyan-700" />
                          <span className="font-medium text-slate-950">{pharmacy.telefon}</span>
                        </a>
                      ) : null}
                      {pharmacy.email ? (
                        <a
                          href={`mailto:${pharmacy.email}`}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-cyan-200 hover:bg-cyan-50"
                          onClick={() => trackContactClick('email', pharmacyAnalyticsEntity, 'profile_contact_card')}
                        >
                          <Mail className="h-4 w-4 text-cyan-700" />
                          <span className="font-medium text-slate-950">{pharmacy.email}</span>
                        </a>
                      ) : null}
                      {websiteUrl ? (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 transition hover:border-cyan-200 hover:bg-cyan-50"
                          onClick={() => trackContactClick('website', pharmacyAnalyticsEntity, 'profile_contact_card')}
                        >
                          <ExternalLink className="h-4 w-4 text-cyan-700" />
                          <span className="font-medium text-slate-950">Web stranica</span>
                        </a>
                      ) : null}
                      <div className="flex items-start gap-3 rounded-lg border border-slate-200 p-3">
                        <MapPin className="mt-0.5 h-4 w-4 text-cyan-700" />
                        <span className="text-slate-700">{displayAddress}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-lg border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-base">Ocjene</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ratingValue > 0 ? (
                        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
                          <div className="flex items-end gap-3">
                            <span className="text-4xl font-bold text-slate-950">{ratingValue.toFixed(1)}</span>
                            <span className="pb-1 text-sm text-slate-600">/ 5</span>
                          </div>
                          <div className="mt-3 flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= Math.round(ratingValue)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="mt-2 text-sm text-slate-600">Na osnovu {pharmacy.broj_ocjena || 0} ocjena.</p>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-slate-200 p-5 text-sm text-slate-500">
                          Ocjene još nisu dostupne za ovu apoteku.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </aside>
              </div>
            </div>
          </section>

          <section className="pt-8">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">Pregledajte i druge apoteke</p>
                  <p className="text-sm text-slate-600">Filtrirajte po gradu, dežurstvu, statusu rada i pogodnostima.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link to="/apoteke">
                    <Button variant="outline" className="w-full sm:w-auto">Sve apoteke</Button>
                  </Link>
                  <Link to="/register/pharmacy">
                    <Button className="w-full bg-slate-950 text-white hover:bg-slate-800 sm:w-auto">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Registrujte apoteku
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {selectedImage ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setSelectedImage(null)}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className="absolute right-5 top-5 text-white transition hover:text-slate-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="h-7 w-7" />
            </button>
            <img
              src={selectedImage}
              alt="Galerija"
              className="max-h-full max-w-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        ) : null}

        <Footer />
      </div>
    </>
  );
}
