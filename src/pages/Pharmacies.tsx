import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CitySelect } from '@/components/CitySelect';
import { MapView } from '@/components/MapView';
import { pharmaciesAPI } from '@/services/api';
import { Clock3, MapPin, Navigation, Pill, Search, ShieldAlert, ShieldCheck } from 'lucide-react';

type PharmacyItem = {
  id: number;
  naziv: string;
  slug: string;
  adresa: string;
  grad_naziv: string;
  telefon?: string;
  profilna_slika_url?: string;
  kratki_opis?: string;
  latitude?: number;
  longitude?: number;
  distance_km?: number | null;
  status_label: string;
  open_now: boolean;
  is_dezurna: boolean;
  is_24h: boolean;
  has_pensioner_discount: boolean;
  active_actions_count: number;
  active_offers_count: number;
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const slugifySegment = (value: string): string => {
  return decodeURIComponent(value.replace(/\+/g, ' '))
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function Pharmacies() {
  const { grad } = useParams<{ grad?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(grad ? decodeURIComponent(grad).replace(/-/g, ' ') : (searchParams.get('grad') || ''));
  const [openNow, setOpenNow] = useState(searchParams.get('open_now') === '1');
  const [dutyNow, setDutyNow] = useState(searchParams.get('dezurna_now') === '1');
  const [is24h, setIs24h] = useState(searchParams.get('is_24h') === '1');
  const [pensioner, setPensioner] = useState(searchParams.get('pensioner_discount') === '1');
  const [hasActions, setHasActions] = useState(searchParams.get('has_actions') === '1');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (grad) {
      setCity(decodeURIComponent(grad).replace(/-/g, ' '));
    }
  }, [grad]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (city) params.set('grad', city);
    if (search) params.set('search', search);
    if (openNow) params.set('open_now', '1');
    if (dutyNow) params.set('dezurna_now', '1');
    if (is24h) params.set('is_24h', '1');
    if (pensioner) params.set('pensioner_discount', '1');
    if (hasActions) params.set('has_actions', '1');
    setSearchParams(params, { replace: true });
  }, [city, dutyNow, hasActions, is24h, openNow, pensioner, search, setSearchParams]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setApiError(null);
      try {
        const params: any = {
          sort: 'open_first',
          per_page: 100,
        };
        if (city) params.grad = city;
        if (search) params.search = search;
        if (openNow) params.open_now = 1;
        if (dutyNow) params.dezurna_now = 1;
        if (is24h) params.is_24h = 1;
        if (pensioner) params.pensioner_discount = 1;
        if (hasActions) params.has_actions = 1;
        if (geo) {
          params.lat = geo.lat;
          params.lng = geo.lng;
          params.radius_km = 25;
        }

        const response = await pharmaciesAPI.getAll(params);
        setItems(response.data?.data || []);
      } catch (error: any) {
        setApiError(error?.response?.data?.message || 'API apoteka trenutno nije dostupna.');
        setItems([]);
        console.error('Error loading pharmacies', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [city, dutyNow, geo, hasActions, is24h, openNow, pensioner, search]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setGeo({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  const selectedCitySlug = useMemo(() => {
    if (!city) return '';
    return slugifySegment(city);
  }, [city]);

  const onlyCityFilter = useMemo(
    () => !!selectedCitySlug && !search && !openNow && !dutyNow && !is24h && !pensioner && !hasActions && !geo,
    [selectedCitySlug, search, openNow, dutyNow, is24h, pensioner, hasActions, geo]
  );

  const canonicalUrl = useMemo(() => {
    if (onlyCityFilter) {
      return `${SITE_URL}/apoteke/${selectedCitySlug}`;
    }
    return `${SITE_URL}/apoteke`;
  }, [onlyCityFilter, selectedCitySlug]);

  const robotsContent = useMemo(() => {
    if (onlyCityFilter || (!search && !openNow && !dutyNow && !is24h && !pensioner && !hasActions && !geo)) {
      return 'index, follow';
    }
    return 'noindex, follow';
  }, [onlyCityFilter, search, openNow, dutyNow, is24h, pensioner, hasActions, geo]);

  const title = city ? `Apoteke - ${city}` : 'Apoteke';
  const description = city
    ? `Pronadjite otvorene i dezurne apoteke u gradu ${city}.`
    : 'Pronadjite otvorene, dezurne i najblize apoteke u Bosni i Hercegovini.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 10).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Pharmacy',
        name: item.naziv,
        url: `${SITE_URL}/apoteka/${item.slug}`,
        address: {
          '@type': 'PostalAddress',
          streetAddress: item.adresa,
          addressLocality: item.grad_naziv,
          addressCountry: 'BA',
        },
      },
    })),
  };

  return (
    <>
      <Helmet>
        <title>{title} | wizMedik</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | wizMedik`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content={robotsContent} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        <section className="py-10 bg-gradient-to-r from-red-50 to-white">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{title}</h1>
            <p className="text-gray-600 mb-6">{description}</p>

            <div className="bg-white rounded-2xl border p-4 space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    className="pl-9"
                    placeholder="Naziv apoteke ili adresa"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <CitySelect value={city} onChange={setCity} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant={openNow ? 'default' : 'outline'} size="sm" onClick={() => setOpenNow((v) => !v)}>
                  <Clock3 className="w-4 h-4 mr-1" />
                  Radi sada
                </Button>
                <Button variant={dutyNow ? 'default' : 'outline'} size="sm" onClick={() => setDutyNow((v) => !v)}>
                  <ShieldAlert className="w-4 h-4 mr-1" />
                  Dezurna
                </Button>
                <Button variant={is24h ? 'default' : 'outline'} size="sm" onClick={() => setIs24h((v) => !v)}>
                  24/7
                </Button>
                <Button variant={pensioner ? 'default' : 'outline'} size="sm" onClick={() => setPensioner((v) => !v)}>
                  <Pill className="w-4 h-4 mr-1" />
                  Popust penzioneri
                </Button>
                <Button variant={hasActions ? 'default' : 'outline'} size="sm" onClick={() => setHasActions((v) => !v)}>
                  Aktivne akcije
                </Button>
                <Button variant="outline" size="sm" onClick={useMyLocation}>
                  <Navigation className="w-4 h-4 mr-1" />
                  Najblize meni
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">{items.length} rezultata</p>
              <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'map')}>
                <TabsList>
                  <TabsTrigger value="list">Lista</TabsTrigger>
                  <TabsTrigger value="map">Mapa</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <Tabs value={view}>
              <TabsContent value="list">
                {loading ? (
                  <div className="text-gray-500">Ucitavanje...</div>
                ) : apiError ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-700">
                      <p className="font-medium">Trenutno nije moguce ucitati apoteke.</p>
                      <p className="text-sm text-gray-500 mt-2">{apiError}</p>
                    </CardContent>
                  </Card>
                ) : items.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-gray-600">
                      Nema rezultata za zadane filtere.
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                      <Link key={item.id} to={`/apoteka/${item.slug}`}>
                        <Card className="h-full hover:shadow-md transition-shadow">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-semibold text-gray-900 line-clamp-2">{item.naziv}</h3>
                              {item.profilna_slika_url ? (
                                <img
                                  src={item.profilna_slika_url}
                                  alt={item.naziv}
                                  className="w-12 h-12 rounded-md object-cover"
                                />
                              ) : null}
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{item.kratki_opis || item.adresa}</p>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{item.adresa}, {item.grad_naziv}</span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              <Badge variant={item.open_now ? 'default' : 'secondary'}>
                                {item.status_label}
                              </Badge>
                              {item.is_dezurna ? <Badge className="bg-orange-500 hover:bg-orange-600">Dezurna</Badge> : null}
                              {item.is_24h ? <Badge className="bg-blue-600 hover:bg-blue-700">24/7</Badge> : null}
                              {item.has_pensioner_discount ? <Badge variant="outline">Penzioneri</Badge> : null}
                              {item.active_offers_count > 0 ? <Badge variant="outline">Ponude {item.active_offers_count}</Badge> : null}
                              {item.active_actions_count > 0 ? <Badge variant="outline">Akcije {item.active_actions_count}</Badge> : null}
                            </div>
                            {item.distance_km !== null && item.distance_km !== undefined ? (
                              <p className="text-xs text-gray-500">{item.distance_km} km od vas</p>
                            ) : null}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="map">
                <MapView
                  itemType="apoteka"
                  itemIcon={<ShieldCheck className="w-4 h-4 text-red-600" />}
                  userLocation={geo ? { lat: geo.lat, lng: geo.lng } : null}
                  items={items.map((item) => ({
                    id: item.id,
                    naziv: item.naziv,
                    adresa: item.adresa,
                    grad: item.grad_naziv,
                    telefon: item.telefon,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    slug: item.slug,
                    distance: item.distance_km ?? undefined,
                  }))}
                  emptyMessage="Nema apoteka sa koordinatama"
                  height="560px"
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="pb-12">
          <div className="container mx-auto px-4 text-center">
            <Link to="/register/pharmacy">
              <Button size="lg">Registrujte svoju apoteku</Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
