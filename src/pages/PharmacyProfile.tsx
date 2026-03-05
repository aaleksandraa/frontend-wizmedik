import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { LocationMapCard } from '@/components/LocationMapCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fixImageUrl } from '@/utils/imageUrl';
import { pharmaciesAPI } from '@/services/api';
import {
  Clock3,
  ExternalLink,
  Image as ImageIcon,
  Mail,
  MapPin,
  Navigation,
  Phone,
  Pill,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  Accessibility,
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
  4: 'Cetvrtak',
  5: 'Petak',
  6: 'Subota',
  7: 'Nedjelja',
};

const toAbsoluteUrl = (value?: string | null): string => {
  if (!value) return DEFAULT_OG_IMAGE;
  const fixed = fixImageUrl(value) || value;
  if (fixed.startsWith('http://') || fixed.startsWith('https://')) return fixed;
  return `${SITE_URL}${fixed.startsWith('/') ? '' : '/'}${fixed}`;
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('bs-BA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatDateOnly = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('bs-BA', { dateStyle: 'medium' }).format(date);
};

export default function PharmacyProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [pharmacy, setPharmacy] = useState<PharmacyProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const response = await pharmaciesAPI.getBySlug(slug);
        setPharmacy(response.data);
      } catch (error) {
        console.error('Error loading pharmacy profile', error);
        setPharmacy(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug]);

  const city = pharmacy?.grad_naziv || 'Bosna i Hercegovina';
  const canonicalUrl = pharmacy ? `${SITE_URL}/apoteka/${pharmacy.slug}` : `${SITE_URL}/apoteka`;
  const primaryImage = toAbsoluteUrl(pharmacy?.profilna_slika_url || pharmacy?.galerija_slike?.[0] || null);
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
      .map((item) => toAbsoluteUrl(item));
    return Array.from(new Set(all));
  }, [pharmacy]);

  const hoursByDay = useMemo(() => {
    const map = new Map<number, PharmacyHour>();
    (pharmacy?.radno_vrijeme || []).forEach((item) => map.set(item.day_of_week, item));
    return [1, 2, 3, 4, 5, 6, 7].map((day) => ({
      day,
      label: dayLabels[day],
      item: map.get(day),
    }));
  }, [pharmacy]);

  const schemaData = useMemo(() => {
    if (!pharmacy?.schema_ready) return null;
    return {
      '@context': 'https://schema.org',
      ...pharmacy.schema_ready,
      url: canonicalUrl,
      image: primaryImage,
    };
  }, [pharmacy, canonicalUrl, primaryImage]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-12 w-2/3" />
          <Skeleton className="h-72 w-full" />
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
          <h1 className="text-2xl font-bold mb-2">Apoteka nije pronadjena</h1>
          <p className="text-gray-600 mb-6">Profil ne postoji ili nije javno dostupan.</p>
          <Link to="/apoteke">
            <Button>Nazad na listu apoteka</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${pharmacy.naziv} - Apoteka u ${city} | wizMedik`}</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={`${pharmacy.naziv} - Apoteka`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={primaryImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${pharmacy.naziv} - Apoteka`} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={primaryImage} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        {schemaData ? <script type="application/ld+json">{JSON.stringify(schemaData)}</script> : null}
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <section className="pt-5">
          <div className="container mx-auto px-4">
            <Card className="border shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="shrink-0">
                    <img
                      src={primaryImage}
                      alt={pharmacy.naziv}
                      className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border"
                    />
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{pharmacy.naziv}</h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={pharmacy.status.open_now ? 'default' : 'secondary'}>
                          {pharmacy.status.status_label}
                        </Badge>
                        {pharmacy.status.is_dezurna ? (
                          <Badge className="bg-orange-500 hover:bg-orange-600">
                            <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                            Dezurna
                          </Badge>
                        ) : null}
                        {pharmacy.is_24h ? (
                          <Badge className="bg-blue-600 hover:bg-blue-700">24/7</Badge>
                        ) : null}
                        {pharmacy.status.next_change_at ? (
                          <Badge variant="outline">
                            Promjena: {formatDateTime(pharmacy.status.next_change_at)}
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {(pharmacy.ocjena || 0) > 0 ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-semibold">{Number(pharmacy.ocjena).toFixed(1)}</span>
                        <span className="text-gray-600">({pharmacy.broj_ocjena || 0} ocjena)</span>
                      </div>
                    ) : null}

                    <div className="space-y-1.5 text-sm text-gray-700">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 text-red-600" />
                        <span>
                          {pharmacy.adresa}, {city}
                          {pharmacy.postanski_broj ? `, ${pharmacy.postanski_broj}` : ''}
                        </span>
                      </div>
                      {pharmacy.telefon ? (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 mt-0.5 text-red-600" />
                          <a href={`tel:${pharmacy.telefon}`} className="hover:underline">
                            {pharmacy.telefon}
                          </a>
                        </div>
                      ) : null}
                      {pharmacy.email ? (
                        <div className="flex items-start gap-2">
                          <Mail className="w-4 h-4 mt-0.5 text-red-600" />
                          <a href={`mailto:${pharmacy.email}`} className="hover:underline">
                            {pharmacy.email}
                          </a>
                        </div>
                      ) : null}
                      {pharmacy.firma?.website ? (
                        <div className="flex items-start gap-2">
                          <ExternalLink className="w-4 h-4 mt-0.5 text-red-600" />
                          <a
                            href={pharmacy.firma.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            Web stranica
                          </a>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {pharmacy.ima_dostavu ? (
                        <Badge variant="outline">
                          <Truck className="w-3.5 h-3.5 mr-1" />
                          Dostava
                        </Badge>
                      ) : null}
                      {pharmacy.ima_parking ? <Badge variant="outline">Parking</Badge> : null}
                      {pharmacy.pristup_invalidima ? (
                        <Badge variant="outline">
                          <Accessibility className="w-3.5 h-3.5 mr-1" />
                          Pristup invalidima
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-6">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="ponude" className="space-y-4">
              <TabsList className="grid w-full md:w-auto md:inline-grid md:grid-cols-4">
                <TabsTrigger value="ponude">Ponude</TabsTrigger>
                <TabsTrigger value="radno-vrijeme">Radno vrijeme</TabsTrigger>
                <TabsTrigger value="info">Info</TabsTrigger>
                <TabsTrigger value="galerija">Galerija</TabsTrigger>
              </TabsList>

              <TabsContent value="ponude" className="space-y-4">
                <div className="grid lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Posebne ponude</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(pharmacy.active_offers || []).length === 0 ? (
                        <p className="text-sm text-gray-500">Trenutno nema aktivnih posebnih ponuda.</p>
                      ) : (
                        pharmacy.active_offers?.map((offer) => (
                          <div key={offer.id} className="border rounded-lg p-3 space-y-1">
                            <p className="font-semibold text-sm">{offer.title}</p>
                            {offer.description ? (
                              <p className="text-sm text-gray-600">{offer.description}</p>
                            ) : null}
                            <div className="flex flex-wrap gap-1.5 text-xs">
                              {offer.target_group ? <Badge variant="outline">{offer.target_group}</Badge> : null}
                              {offer.discount_percent ? <Badge variant="outline">-{offer.discount_percent}%</Badge> : null}
                              {offer.discount_amount ? <Badge variant="outline">-{offer.discount_amount} KM</Badge> : null}
                              {offer.service_name ? <Badge variant="outline">{offer.service_name}</Badge> : null}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Popusti</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(pharmacy.active_discounts || []).length === 0 ? (
                        <p className="text-sm text-gray-500">Trenutno nema aktivnih popusta.</p>
                      ) : (
                        pharmacy.active_discounts?.map((discount) => (
                          <div key={discount.id} className="border rounded-lg p-3 space-y-1">
                            <p className="font-semibold text-sm capitalize">{discount.tip}</p>
                            <p className="text-sm text-gray-700">
                              {discount.discount_percent
                                ? `${discount.discount_percent}% popusta`
                                : `${discount.discount_amount || 0} KM popusta`}
                            </p>
                            {discount.min_purchase ? (
                              <p className="text-xs text-gray-500">Minimalna kupovina: {discount.min_purchase} KM</p>
                            ) : null}
                            {discount.uslovi ? <p className="text-xs text-gray-500">{discount.uslovi}</p> : null}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Akcije</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {(pharmacy.active_actions || []).length === 0 ? (
                        <p className="text-sm text-gray-500">Trenutno nema aktivnih akcija.</p>
                      ) : (
                        pharmacy.active_actions?.map((action) => (
                          <div key={action.id} className="border rounded-lg p-3 space-y-1">
                            <p className="font-semibold text-sm">{action.naslov}</p>
                            {action.opis ? <p className="text-sm text-gray-600">{action.opis}</p> : null}
                            {action.promo_code ? (
                              <Badge variant="secondary">Promo kod: {action.promo_code}</Badge>
                            ) : null}
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="radno-vrijeme" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Clock3 className="w-5 h-5" />
                      Sedmicno radno vrijeme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {hoursByDay.map((entry) => (
                      <div key={entry.day} className="flex items-center justify-between py-2 px-3 rounded-lg border">
                        <span className="font-medium">{entry.label}</span>
                        {!entry.item || entry.item.closed ? (
                          <span className="text-gray-500">Zatvoreno</span>
                        ) : (
                          <span className="font-medium">
                            {entry.item.open_time || '--:--'} - {entry.item.close_time || '--:--'}
                          </span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {(pharmacy.radno_vrijeme_izuzeci || []).length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Izuzeci radnog vremena</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {pharmacy.radno_vrijeme_izuzeci?.map((exception) => (
                        <div key={exception.id} className="flex items-center justify-between gap-3 border rounded-lg p-3">
                          <div>
                            <p className="font-medium">{formatDateOnly(exception.date)}</p>
                            {exception.reason ? <p className="text-xs text-gray-500">{exception.reason}</p> : null}
                          </div>
                          {exception.closed ? (
                            <Badge variant="secondary">Zatvoreno</Badge>
                          ) : (
                            <Badge variant="outline">
                              {exception.open_time || '--:--'} - {exception.close_time || '--:--'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : null}
              </TabsContent>

              <TabsContent value="info" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">O apoteci</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-gray-700">
                    {pharmacy.kratki_opis ? <p>{pharmacy.kratki_opis}</p> : null}
                    {pharmacy.firma?.opis ? <p>{pharmacy.firma.opis}</p> : null}
                    {!pharmacy.kratki_opis && !pharmacy.firma?.opis ? (
                      <p className="text-gray-500">Nije dodat detaljan opis apoteke.</p>
                    ) : null}
                  </CardContent>
                </Card>

                <LocationMapCard
                  naziv={pharmacy.naziv}
                  adresa={pharmacy.adresa}
                  grad={city}
                  latitude={pharmacy.latitude || undefined}
                  longitude={pharmacy.longitude || undefined}
                  googleMapsLink={pharmacy.google_maps_link || undefined}
                  markerColor="orange"
                />
              </TabsContent>

              <TabsContent value="galerija">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Galerija ({images.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {images.length === 0 ? (
                      <div className="py-10 text-center">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Nema slika u galeriji.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {images.map((image, index) => (
                          <button
                            key={`${image}-${index}`}
                            type="button"
                            className="aspect-square rounded-lg overflow-hidden border group"
                            onClick={() => setSelectedImage(image)}
                          >
                            <img
                              src={image}
                              alt={`${pharmacy.naziv} ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="pb-10">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/apoteke">
              <Button variant="outline">Sve apoteke</Button>
            </Link>
            {pharmacy.google_maps_link || pharmacy.latitude ? (
              <a
                href={
                  pharmacy.google_maps_link ||
                  `https://www.google.com/maps/dir/?api=1&destination=${pharmacy.latitude},${pharmacy.longitude}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button>
                  <Navigation className="w-4 h-4 mr-2" />
                  Otvori navigaciju
                </Button>
              </a>
            ) : null}
            <Link to="/register/pharmacy">
              <Button variant="secondary">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Registrujte apoteku
              </Button>
            </Link>
          </div>
        </section>

        {selectedImage ? (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            role="button"
            tabIndex={0}
          >
            <button
              type="button"
              className="absolute top-5 right-5 text-white hover:text-gray-300"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-7 h-7" />
            </button>
            <img
              src={selectedImage}
              alt="Galerija"
              className="max-w-full max-h-full object-contain"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        ) : null}

        <Footer />
      </div>
    </>
  );
}
