import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { clinicsAPI, specialtiesAPI } from '@/services/api';
import { useAllCities } from '@/hooks/useAllCities';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ClinicCard } from '@/components/ClinicCard';
import { ClinicCardSoft } from '@/components/cards/ClinicCardSoft';
import { ListingFilters, ListingGrid, ListingHeader } from '@/components/ListingLayout';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { ClinicsMap } from '@/components/ClinicsMap';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Building2, Search, MapPin, Navigation, X, ArrowUpDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import {
  LISTING_PAGE_SIZE,
  LISTING_SEARCH_DEBOUNCE_MS,
  defaultListingPagination,
  listingSortParams,
  listingSpecialtyParam,
  parseLaravelPaginator,
} from '@/lib/listing-pagination';

interface SpecialtyNode {
  id: number;
  naziv: string;
  slug: string;
  parent_id?: number | null;
  children?: SpecialtyNode[];
}

interface ClinicSpecialty {
  id: number;
  naziv: string;
  slug: string;
  parent_id?: number | null;
}

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: any[];
  radno_vrijeme: any;
  broj_doktora?: number;
  specijalnosti?: ClinicSpecialty[];
  latitude?: number;
  longitude?: number;
  slug?: string;
  ocjena?: number;
  broj_ocjena?: number;
  distance?: number;
}

type SortOption = 'name' | 'rating' | 'distance';

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

const normalizeText = (value?: string | null): string => {
  return (value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

export default function Clinics() {
  const { grad, specijalnost } = useParams<{ grad?: string; specijalnost?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { template } = useListingTemplate('clinics');
  const { cities: allCities } = useAllCities();

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [pagination, setPagination] = useState(defaultListingPagination());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedParentSpecialty, setSelectedParentSpecialty] = useState('');
  const [selectedSubSpecialties, setSelectedSubSpecialties] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<SpecialtyNode[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [useUserLocation, setUseUserLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const requestIdRef = useRef(0);

  const hierarchicalSpecialties = useMemo(
    () => specialties.map((parent) => ({ ...parent, children: parent.children || [] })),
    [specialties]
  );

  const flatSpecialties = useMemo(() => {
    const items: SpecialtyNode[] = [];

    hierarchicalSpecialties.forEach((parent) => {
      items.push({ ...parent, children: undefined });
      (parent.children || []).forEach((child) => {
        items.push({ ...child, children: undefined });
      });
    });

    return items;
  }, [hierarchicalSpecialties]);

  const specialtyBySlug = useMemo(() => {
    const map = new Map<string, SpecialtyNode>();
    flatSpecialties.forEach((specialty) => map.set(specialty.slug, specialty));
    return map;
  }, [flatSpecialties]);

  const specialtyByName = useMemo(() => {
    const map = new Map<string, SpecialtyNode>();
    flatSpecialties.forEach((specialty) => map.set(normalizeText(specialty.naziv), specialty));
    return map;
  }, [flatSpecialties]);

  const resolveCityNameFromSlug = (cityValue: string) => {
    const decoded = decodeURIComponent(cityValue.replace(/\+/g, ' '));
    const matched = allCities.find(
      (city) => city.slug === decoded || normalizeText(city.naziv) === normalizeText(decoded)
    );

    if (matched?.naziv) {
      return matched.naziv;
    }

    return decoded.replace(/-/g, ' ').trim();
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, LISTING_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const response = await specialtiesAPI.getAll();
        const specialtiesList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };

    void fetchSpecialties();
  }, []);

  useEffect(() => {
    if (location.pathname !== '/klinike') {
      return;
    }

    const gradQuery = searchParams.get('grad');
    const specialtyQuery = searchParams.get('specijalnost');

    if (!gradQuery && !specialtyQuery) {
      return;
    }

    const citySlug = gradQuery ? slugifySegment(gradQuery) : '';
    const specialtySlug = specialtyQuery ? slugifySegment(specialtyQuery) : '';

    if (citySlug && specialtySlug) {
      navigate(`/klinike/${citySlug}/${specialtySlug}`, { replace: true });
      return;
    }

    if (specialtySlug) {
      navigate(`/klinike/specijalnost/${specialtySlug}`, { replace: true });
      return;
    }

    if (citySlug) {
      navigate(`/klinike/${citySlug}`, { replace: true });
    }
  }, [location.pathname, navigate, searchParams]);

  useEffect(() => {
    if (grad) {
      return;
    }

    setSelectedCity('');
    setCitySearch('');
  }, [grad]);

  useEffect(() => {
    if (!grad) {
      return;
    }

    const routeCityName = resolveCityNameFromSlug(grad);
    setSelectedCity(routeCityName);
    setCitySearch(routeCityName);
  }, [grad, allCities]);

  useEffect(() => {
    if (specijalnost) {
      return;
    }

    setSelectedParentSpecialty('');
    setSelectedSubSpecialties([]);
  }, [specijalnost]);

  useEffect(() => {
    if (!specijalnost) {
      return;
    }

    const exactParent = hierarchicalSpecialties.find((parent) => parent.slug === specijalnost);
    if (exactParent) {
      setSelectedParentSpecialty(exactParent.slug);
      setSelectedSubSpecialties([]);
      return;
    }

    const matchedParent = hierarchicalSpecialties.find((parent) =>
      (parent.children || []).some((child) => child.slug === specijalnost)
    );

    if (matchedParent) {
      setSelectedParentSpecialty(matchedParent.slug);
      setSelectedSubSpecialties([specijalnost]);
      return;
    }

    setSelectedParentSpecialty(specijalnost);
    setSelectedSubSpecialties([]);
  }, [hierarchicalSpecialties, specijalnost]);

  const selectedParentData = useMemo(() => {
    if (!selectedParentSpecialty) {
      return null;
    }

    return hierarchicalSpecialties.find((specialty) => specialty.slug === selectedParentSpecialty) || null;
  }, [hierarchicalSpecialties, selectedParentSpecialty]);

  const loadClinics = useCallback(async (pageToLoad = 1, append = false) => {
    const requestId = ++requestIdRef.current;

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setClinics([]);
      setPagination(defaultListingPagination());
    }

    try {
      const params: Record<string, string | number> = {
        page: pageToLoad,
        per_page: LISTING_PAGE_SIZE,
        ...listingSortParams(sortBy, 'naziv'),
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCity) params.grad = selectedCity;

      const specialtyParam = listingSpecialtyParam(selectedParentSpecialty, selectedSubSpecialties);
      if (specialtyParam) params.specijalnost = specialtyParam;

      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }

      const response = await clinicsAPI.getAll(params);
      if (requestId !== requestIdRef.current) return;

      const { list, pagination: nextPagination } = parseLaravelPaginator<Clinic>(response.data, pageToLoad);
      setPagination(nextPagination);
      setClinics((current) => {
        if (!append) return list;
        const currentIds = new Set(current.map((item) => item.id));
        return [...current, ...list.filter((item) => !currentIds.has(item.id))];
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error fetching clinics:', error);
      if (!append) {
        setClinics([]);
        setPagination(defaultListingPagination());
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [debouncedSearch, selectedCity, selectedParentSpecialty, selectedSubSpecialties, sortBy, userLocation]);

  useEffect(() => {
    void loadClinics(1, false);
  }, [loadClinics]);

  const routeSpecialtyData = useMemo(() => {
    if (!specijalnost) {
      return null;
    }

    const exact = specialtyBySlug.get(specijalnost);
    if (exact) {
      return exact;
    }

    return specialtyByName.get(normalizeText(specijalnost)) || null;
  }, [specijalnost, specialtyByName, specialtyBySlug]);

  const uniqueCities = useMemo(() => allCities.map((city) => city.naziv).sort(), [allCities]);

  const filteredCities = useMemo(() => {
    if (!citySearch) {
      return uniqueCities;
    }

    return uniqueCities.filter((city) => normalizeText(city).includes(normalizeText(citySearch)));
  }, [citySearch, uniqueCities]);

  const totalResults = pagination.total || clinics.length;
  const hasMoreResults = pagination.current_page < pagination.last_page;

  const pageTitle = useMemo(() => {
    if (selectedCity && selectedParentData?.naziv) {
      return `Klinike za ${selectedParentData.naziv} - ${selectedCity}`;
    }

    if (selectedParentData?.naziv) {
      return `Klinike za ${selectedParentData.naziv}`;
    }

    if (selectedCity) {
      return `Klinike - ${selectedCity}`;
    }

    return 'Klinike';
  }, [selectedCity, selectedParentData]);

  const canonicalUrl = useMemo(() => {
    if (grad && specijalnost) {
      return `${SITE_URL}/klinike/${grad}/${specijalnost}`;
    }

    if (specijalnost) {
      return `${SITE_URL}/klinike/specijalnost/${specijalnost}`;
    }

    if (grad) {
      return `${SITE_URL}/klinike/${grad}`;
    }

    return `${SITE_URL}/klinike`;
  }, [grad, specijalnost]);

  const seoTitle = useMemo(() => {
    const routeCityName = grad ? resolveCityNameFromSlug(grad) : '';
    const routeSpecialtyName = routeSpecialtyData?.naziv || '';

    if (routeCityName && routeSpecialtyName) {
      return `Klinike za ${routeSpecialtyName} - ${routeCityName} | WizMedik`;
    }

    if (routeSpecialtyName) {
      return `Klinike za ${routeSpecialtyName} | WizMedik`;
    }

    if (routeCityName) {
      return `Klinike - ${routeCityName} | WizMedik`;
    }

    return 'Klinike | WizMedik';
  }, [grad, routeSpecialtyData, allCities]);

  const seoDescription = useMemo(() => {
    const routeCityName = grad ? resolveCityNameFromSlug(grad) : '';
    const routeSpecialtyName = routeSpecialtyData?.naziv || '';

    if (routeCityName && routeSpecialtyName) {
      return `Pronadjite klinike za ${routeSpecialtyName.toLowerCase()} u ${routeCityName}. Uporedite profile, usluge, doktore i kontakt informacije na WizMedik platformi.`;
    }

    if (routeSpecialtyName) {
      return `Pronadjite klinike za ${routeSpecialtyName.toLowerCase()} u Bosni i Hercegovini. Uporedite profile, usluge, doktore i kontakt informacije.`;
    }

    if (routeCityName) {
      return `Pronadjite klinike u ${routeCityName}. Uporedite profile, usluge, doktore i kontakt informacije na WizMedik platformi.`;
    }

    return 'Pronadjite klinike u Bosni i Hercegovini. Uporedite profile, usluge, doktore i kontakt informacije na WizMedik platformi.';
  }, [grad, routeSpecialtyData, allCities]);

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: seoDescription,
      numberOfItems: totalResults,
      itemListElement: clinics.slice(0, 10).map((clinic, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'MedicalClinic',
          name: clinic.naziv,
          address: {
            '@type': 'PostalAddress',
            streetAddress: clinic.adresa,
            addressLocality: clinic.grad,
            addressCountry: 'BA',
          },
          telephone: clinic.telefon,
          medicalSpecialty: (clinic.specijalnosti || []).map((specialty) => specialty.naziv),
        },
      })),
    }),
    [clinics, pageTitle, seoDescription, totalResults]
  );

  const toggleLocation = () => {
    if (useUserLocation) {
      setUseUserLocation(false);
      setUserLocation(null);
      setSortBy('name');
      return;
    }

    if (!('geolocation' in navigator)) {
      window.alert('Vas browser ne podrzava geolokaciju.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUseUserLocation(true);
        setSortBy('distance');
      },
      () => {
        window.alert('Nije moguce pristupiti vasoj lokaciji.');
      }
    );
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCitySearch(city);
    setShowCitySuggestions(false);
  };

  const clearCity = () => {
    setSelectedCity('');
    setCitySearch('');
  };

  const handleParentSpecialtyChange = (value: string) => {
    setSelectedParentSpecialty(value === 'all' ? '' : value);
    setSelectedSubSpecialties([]);
  };

  const toggleSubSpecialty = (subSlug: string) => {
    setSelectedSubSpecialties((prev) =>
      prev.includes(subSlug) ? prev.filter((slug) => slug !== subSlug) : [...prev, subSlug]
    );
  };

  const selectAllSubSpecialties = () => {
    if (selectedParentData?.children) {
      setSelectedSubSpecialties(selectedParentData.children.map((child) => child.slug));
    }
  };

  const clearSubSpecialties = () => {
    setSelectedSubSpecialties([]);
  };

  const loadMoreButton = hasMoreResults ? (
    <div className="flex justify-center pt-2">
      <Button
        type="button"
        variant="outline"
        className="rounded-full border-[#0891b2]/30 text-[#0891b2] hover:bg-[#0891b2]/5"
        onClick={() => loadClinics(pagination.current_page + 1, true)}
        disabled={loadingMore}
      >
        {loadingMore ? 'Učitavanje...' : 'Učitaj još klinika'}
      </Button>
    </div>
  ) : null;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta
          name="keywords"
          content={`privatne klinike bih, klinika ${selectedCity || 'bosna i hercegovina'}, ${routeSpecialtyData?.naziv || 'zdravstvene usluge'}, medicinski centar`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50/80">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <ListingHeader
            badge="Klinike"
            badgeIcon={Building2}
            title={pageTitle}
            description="Pregledajte profile, usluge, tim doktora i kontakt informacije klinika."
          />

          <ListingFilters>
            <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0891b2]/60" />
                <Input
                  placeholder="Pretražite klinike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative w-full lg:w-56">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0891b2]/60 z-10" />
                <Input
                  placeholder="Unesite grad..."
                  value={citySearch}
                  onChange={(e) => {
                    setCitySearch(e.target.value);
                    setShowCitySuggestions(true);
                    if (!e.target.value) {
                      setSelectedCity('');
                    }
                  }}
                  onFocus={() => setShowCitySuggestions(true)}
                  onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                  className="pl-10 pr-8"
                />
                {selectedCity && (
                  <button
                    onClick={clearCity}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                {showCitySuggestions && filteredCities.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                    <div
                      className="px-3 py-2 hover:bg-muted cursor-pointer text-sm font-medium"
                      onMouseDown={() => handleCitySelect('')}
                    >
                      Svi gradovi
                    </div>
                    {filteredCities.map((city) => (
                      <div
                        key={city}
                        className={`px-3 py-2 hover:bg-muted cursor-pointer text-sm ${
                          selectedCity === city ? 'bg-primary/10' : ''
                        }`}
                        onMouseDown={() => handleCitySelect(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Select value={selectedParentSpecialty || 'all'} onValueChange={handleParentSpecialtyChange}>
                <SelectTrigger className="w-full lg:w-56">
                  <SelectValue placeholder="Sve specijalnosti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Sve specijalnosti</SelectItem>
                  {hierarchicalSpecialties.map((parent) => (
                    <SelectItem key={parent.id} value={parent.slug}>
                      {parent.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedParentData && selectedParentData.children && selectedParentData.children.length > 0 && (
                <div className="w-full lg:hidden flex flex-wrap gap-3">
                  {selectedParentData.children.map((child) => (
                    <div key={child.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-mobile-${child.id}`}
                        checked={selectedSubSpecialties.includes(child.slug)}
                        onCheckedChange={() => toggleSubSpecialty(child.slug)}
                      />
                      <Label htmlFor={`sub-mobile-${child.id}`} className="text-sm cursor-pointer">
                        {child.naziv}
                      </Label>
                    </div>
                  ))}
                </div>
              )}

              <Button onClick={toggleLocation} variant={useUserLocation ? 'default' : 'outline'} className="w-full lg:w-auto">
                <Navigation className={`h-4 w-4 mr-2 ${useUserLocation ? 'animate-pulse' : ''}`} />
                {useUserLocation ? 'Lokacija ukljucena' : 'Blizu mene'}
              </Button>
            </div>

            {selectedParentData && selectedParentData.children && selectedParentData.children.length > 0 && (
              <div className="hidden lg:block pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">Podkategorije: {selectedParentData.naziv}</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={selectAllSubSpecialties}>
                      Oznaci sve
                    </Button>
                    <Button variant="ghost" size="sm" onClick={clearSubSpecialties}>
                      Ponisti
                    </Button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4">
                  {selectedParentData.children.map((child) => (
                    <div key={child.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sub-${child.id}`}
                        checked={selectedSubSpecialties.includes(child.slug)}
                        onCheckedChange={() => toggleSubSpecialty(child.slug)}
                      />
                      <Label htmlFor={`sub-${child.id}`} className="text-sm cursor-pointer">
                        {child.naziv}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Pronađeno {totalResults} klinika
                {useUserLocation && ' • Lokacija aktivna'}
              </p>
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Po nazivu</SelectItem>
                    <SelectItem value="rating">Po ocjeni</SelectItem>
                    <SelectItem value="distance" disabled={!useUserLocation}>
                      Po udaljenosti
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            </div>
          </ListingFilters>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')} className="space-y-6">
            <TabsList className="grid w-full max-w-[300px] grid-cols-2 rounded-xl bg-white p-1 shadow-sm">
              <TabsTrigger value="list">
                <Building2 className="h-4 w-4 mr-2" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapPin className="h-4 w-4 mr-2" />
                Mapa
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              {loading && clinics.length === 0 ? (
                <ListingGrid>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex animate-pulse items-stretch gap-4 rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
                      <div className="h-[120px] w-[104px] shrink-0 rounded-2xl bg-slate-100 md:w-[112px]" />
                      <div className="flex-1 space-y-3 py-1">
                        <div className="h-4 w-3/4 rounded bg-slate-100" />
                        <div className="h-3 w-1/2 rounded bg-slate-100" />
                        <div className="h-3 w-2/3 rounded bg-slate-100" />
                        <div className="h-10 w-24 rounded-full bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </ListingGrid>
              ) : clinics.length > 0 ? (
                <div className="space-y-6">
                  <ListingGrid>
                    {clinics.map((clinic) =>
                      template === 'soft' ? (
                        <ClinicCardSoft key={clinic.id} clinic={clinic} />
                      ) : (
                        <ClinicCard key={clinic.id} clinic={clinic} />
                      )
                    )}
                  </ListingGrid>
                  {loadMoreButton}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#0891b2]/10 bg-white py-16 text-center shadow-sm">
                  <Building2 className="mx-auto mb-4 h-16 w-16 text-[#0891b2]/40" />
                  <h3 className="mb-2 text-xl font-semibold text-foreground">Nema rezultata</h3>
                  <p className="text-muted-foreground">Probajte sa drugim kriterijumima pretrage.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <div className="space-y-6">
                <ClinicsMap clinics={clinics} userLocation={userLocation} />
                {loadMoreButton}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
}
