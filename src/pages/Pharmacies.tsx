import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
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
import { fixImageUrl } from '@/utils/imageUrl';
import { formatCityLabel, resolvePharmacySeoCityName, slugifyCitySegment } from '@/utils/pharmacySeo';
import { useAllCities } from '@/hooks/useAllCities';
import { Clock3, MapPin, Navigation, Pill, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import type { AxiosError } from 'axios';

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

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type PharmacyQueryParams = {
  sort: 'distance' | 'open_first';
  per_page: number;
  page: number;
  grad?: string;
  search?: string;
  open_now?: 1;
  dezurna_now?: 1;
  is_24h?: 1;
  pensioner_discount?: 1;
  has_actions?: 1;
  lat?: number;
  lng?: number;
};

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;
const PHARMACIES_PAGE_SIZE = 20;

const defaultPagination: PaginationMeta = {
  current_page: 1,
  last_page: 1,
  per_page: PHARMACIES_PAGE_SIZE,
  total: 0,
};

const toAbsoluteImageUrl = (value?: string | null): string | null => {
  const fixed = fixImageUrl(value);

  if (!fixed) return null;
  if (fixed.startsWith('http://') || fixed.startsWith('https://') || fixed.startsWith('data:')) return fixed;

  return `${SITE_URL}${fixed.startsWith('/') ? '' : '/'}${fixed}`;
};

export default function Pharmacies() {
  const { grad } = useParams<{ grad?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cities } = useAllCities();

  const [items, setItems] = useState<PharmacyItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(defaultPagination);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [dutyFallbackApplied, setDutyFallbackApplied] = useState(false);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(grad ? formatCityLabel(grad) : formatCityLabel(searchParams.get('grad') || ''));
  const [openNow, setOpenNow] = useState(searchParams.get('open_now') === '1');
  const [dutyNow, setDutyNow] = useState(searchParams.get('dezurna_now') === '1');
  const [is24h, setIs24h] = useState(searchParams.get('is_24h') === '1');
  const [pensioner, setPensioner] = useState(searchParams.get('pensioner_discount') === '1');
  const [hasActions, setHasActions] = useState(searchParams.get('has_actions') === '1');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (grad) {
      setCity(formatCityLabel(grad));
      return;
    }

    const queryCity = searchParams.get('grad');
    setCity(queryCity ? formatCityLabel(queryCity) : '');
  }, [grad, searchParams]);

  const hasSerializableFilters = useMemo(
    () => !!search || openNow || dutyNow || is24h || pensioner || hasActions,
    [search, openNow, dutyNow, is24h, pensioner, hasActions]
  );

  const selectedCitySlug = useMemo(() => {
    if (!city) return '';
    return slugifyCitySegment(city);
  }, [city]);

  useEffect(() => {
    if (!selectedCitySlug || cities.length === 0) return;

    const matchedCity = cities.find((cityOption) => {
      return (
        slugifyCitySegment(cityOption.slug || '') === selectedCitySlug ||
        slugifyCitySegment(cityOption.naziv) === selectedCitySlug
      );
    });
    const officialCityName = matchedCity?.naziv?.trim();

    if (officialCityName && officialCityName !== city && slugifyCitySegment(city) === selectedCitySlug) {
      setCity(officialCityName);
    }
  }, [cities, city, selectedCitySlug]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCitySlug && hasSerializableFilters) {
      params.set('grad', selectedCitySlug);
    }
    if (search) params.set('search', search);
    if (openNow) params.set('open_now', '1');
    if (dutyNow) params.set('dezurna_now', '1');
    if (is24h) params.set('is_24h', '1');
    if (pensioner) params.set('pensioner_discount', '1');
    if (hasActions) params.set('has_actions', '1');

    const nextPath = selectedCitySlug ? `/apoteke/${selectedCitySlug}` : '/apoteke';
    const nextSearch = params.toString();
    const nextUrl = nextSearch ? `${nextPath}?${nextSearch}` : nextPath;
    const currentUrl = `${location.pathname}${location.search}`;

    if (currentUrl !== nextUrl) {
      navigate(nextUrl, { replace: true });
    }
  }, [
    selectedCitySlug,
    hasSerializableFilters,
    search,
    openNow,
    dutyNow,
    is24h,
    pensioner,
    hasActions,
    location.pathname,
    location.search,
    navigate,
  ]);

  const loadPharmacies = useCallback(async (pageToLoad = 1, append = false) => {
    const requestId = ++requestIdRef.current;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setItems([]);
      setPagination(defaultPagination);
      setDutyFallbackApplied(false);
    }
    setApiError(null);

    try {
      const params: PharmacyQueryParams = {
        sort: geo ? 'distance' : 'open_first',
        per_page: PHARMACIES_PAGE_SIZE,
        page: pageToLoad,
      };
      if (selectedCitySlug) params.grad = selectedCitySlug;
      if (search) params.search = search;
      if (openNow) params.open_now = 1;
      if (dutyNow) params.dezurna_now = 1;
      if (is24h) params.is_24h = 1;
      if (pensioner) params.pensioner_discount = 1;
      if (hasActions) params.has_actions = 1;
      if (geo) {
        params.lat = geo.lat;
        params.lng = geo.lng;
      }

      const response = await pharmaciesAPI.getAll(params);
      if (requestId !== requestIdRef.current) return;

      const payload = response.data || {};
      const paginationPayload = Array.isArray(payload?.data?.data) ? payload.data : payload;
      const list = Array.isArray(paginationPayload?.data)
        ? paginationPayload.data
        : Array.isArray(payload?.data)
          ? payload.data
          : [];
      const nextPagination = {
        current_page: Number(paginationPayload?.current_page || pageToLoad),
        last_page: Number(paginationPayload?.last_page || 1),
        per_page: Number(paginationPayload?.per_page || PHARMACIES_PAGE_SIZE),
        total: Number(paginationPayload?.total || list.length || 0),
      };

      setPagination(nextPagination);
      setDutyFallbackApplied(Boolean(paginationPayload?.filter_meta?.duty_fallback_applied));
      setItems((current) => {
        if (!append) return list;
        const currentIds = new Set(current.map((item) => item.id));
        return [...current, ...list.filter((item: PharmacyItem) => !currentIds.has(item.id))];
      });
    } catch (error: unknown) {
      if (requestId !== requestIdRef.current) return;
      const apiMessage = (error as AxiosError<{ message?: string }>)?.response?.data?.message;
      setApiError(apiMessage || 'API apoteka trenutno nije dostupna.');
      if (!append) {
        setItems([]);
        setPagination(defaultPagination);
        setDutyFallbackApplied(false);
      }
      console.error('Error loading pharmacies', error);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [dutyNow, geo, hasActions, is24h, openNow, pensioner, search, selectedCitySlug]);

  useEffect(() => {
    loadPharmacies(1, false);
  }, [loadPharmacies]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((position) => {
      setGeo({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    });
  };

  const seoCityName = useMemo(() => {
    return resolvePharmacySeoCityName(items, cities, selectedCitySlug);
  }, [cities, items, selectedCitySlug]);

  const totalResults = pagination.total || items.length;
  const hasMoreResults = pagination.current_page < pagination.last_page;

  const onlyCityFilter = useMemo(
    () => !!selectedCitySlug && !search && !openNow && !dutyNow && !is24h && !pensioner && !hasActions && !geo,
    [selectedCitySlug, search, openNow, dutyNow, is24h, pensioner, hasActions, geo]
  );

  const dutyCitySeoPage = useMemo(
    () => !!selectedCitySlug && dutyNow && !search && !openNow && !is24h && !pensioner && !hasActions && !geo,
    [selectedCitySlug, dutyNow, search, openNow, is24h, pensioner, hasActions, geo]
  );

  const twentyFourHourCitySeoPage = useMemo(
    () => !!selectedCitySlug && is24h && !search && !openNow && !dutyNow && !pensioner && !hasActions && !geo,
    [selectedCitySlug, is24h, search, openNow, dutyNow, pensioner, hasActions, geo]
  );

  const canonicalUrl = useMemo(() => {
    if (dutyCitySeoPage) {
      return `${SITE_URL}/apoteke/${selectedCitySlug}?grad=${encodeURIComponent(selectedCitySlug)}&dezurna_now=1`;
    }
    if (twentyFourHourCitySeoPage) {
      return `${SITE_URL}/apoteke/${selectedCitySlug}?grad=${encodeURIComponent(selectedCitySlug)}&is_24h=1`;
    }
    if (onlyCityFilter) {
      return `${SITE_URL}/apoteke/${selectedCitySlug}`;
    }
    return `${SITE_URL}/apoteke`;
  }, [dutyCitySeoPage, onlyCityFilter, selectedCitySlug, twentyFourHourCitySeoPage]);

  const robotsContent = useMemo(() => {
    if (
      dutyCitySeoPage ||
      twentyFourHourCitySeoPage ||
      onlyCityFilter ||
      (!search && !openNow && !dutyNow && !is24h && !pensioner && !hasActions && !geo)
    ) {
      return 'index, follow';
    }
    return 'noindex, follow';
  }, [dutyCitySeoPage, twentyFourHourCitySeoPage, onlyCityFilter, search, openNow, dutyNow, is24h, pensioner, hasActions, geo]);

  const title = dutyCitySeoPage
    ? `Dežurna apoteka - ${seoCityName}`
    : twentyFourHourCitySeoPage
      ? `Apoteka 24h - ${seoCityName}`
    : seoCityName
      ? `Apoteke - ${seoCityName}`
      : 'Apoteke';
  const description = dutyCitySeoPage
    ? `Pronađite dežurne apoteke za ${seoCityName}. Dostupni su telefon, lokacija, status dežurstva i radno vrijeme na jednom mjestu.`
    : twentyFourHourCitySeoPage
      ? `Pronađite apoteke koje rade 24h za ${seoCityName}. Dostupni su telefon, lokacija i radno vrijeme na jednom mjestu.`
    : seoCityName
      ? `Pronađite otvorene, dežurne i 24h apoteke za ${seoCityName}.`
      : 'Pronađite otvorene, dežurne, 24h i najbliže apoteke u Bosni i Hercegovini.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: title,
    description,
    numberOfItems: totalResults,
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
                <CitySelect
                  value={city}
                  onChange={setCity}
                  showAllOption
                  allOptionLabel="Svi gradovi"
                />
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
                <Button variant={geo ? 'default' : 'outline'} size="sm" onClick={useMyLocation}>
                  <Navigation className="w-4 h-4 mr-1" />
                  {geo ? 'Najblize meni ukljuceno' : 'Najblize meni'}
                </Button>
                {geo ? (
                  <Button variant="outline" size="sm" onClick={() => setGeo(null)}>
                    Prikazi sve
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            {!loading && !apiError && dutyFallbackApplied && items.length > 0 ? (
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Trenutno nema evidentiranih dezurnih apoteka. Prikazane su apoteke koje rade sada prema svom radnom vremenu.
              </div>
            ) : null}

            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {loading ? 'Ucitavanje...' : `Prikazano ${items.length} od ${totalResults} rezultata`}
              </p>
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
                      {dutyFallbackApplied
                        ? 'Trenutno nema evidentiranih dezurnih niti otvorenih apoteka prema unesenom radnom vremenu.'
                        : 'Nema rezultata za zadane filtere.'}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((item) => {
                        const imageUrl = toAbsoluteImageUrl(item.profilna_slika_url);

                        return (
                          <Link key={item.id} to={`/apoteka/${item.slug}`}>
                            <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                              <CardContent className="p-4 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                  <h3 className="font-semibold text-gray-900 line-clamp-2">{item.naziv}</h3>
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.naziv}
                                      className="w-12 h-12 rounded-md object-cover"
                                      onError={(event) => {
                                        event.currentTarget.style.display = 'none';
                                      }}
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
                                  {item.has_pensioner_discount ? (
                                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                      <Pill className="w-3.5 h-3.5 mr-1" />
                                      Popust za penzionere
                                    </Badge>
                                  ) : null}
                                  {item.active_offers_count > 0 ? <Badge variant="outline">Ponude {item.active_offers_count}</Badge> : null}
                                  {item.active_actions_count > 0 ? <Badge variant="outline">Akcije {item.active_actions_count}</Badge> : null}
                                </div>
                                {item.distance_km !== null && item.distance_km !== undefined ? (
                                  <p className="text-xs text-gray-500">{item.distance_km} km od vas</p>
                                ) : null}
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>

                    {hasMoreResults ? (
                      <div className="flex justify-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => loadPharmacies(pagination.current_page + 1, true)}
                          disabled={loadingMore}
                        >
                          {loadingMore ? 'Ucitavanje...' : 'Ucitaj jos apoteka'}
                        </Button>
                      </div>
                    ) : null}
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
