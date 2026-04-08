import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { clinicsAPI, specialtiesAPI } from '@/services/api';
import { useAllCities } from '@/hooks/useAllCities';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ClinicCard } from '@/components/ClinicCard';
import { ClinicCardSoft } from '@/components/cards/ClinicCardSoft';
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

interface DoctorSummary {
  id: number;
  specijalnost?: string;
  specijalnost_id?: number | null;
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
  doktori?: DoctorSummary[];
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
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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

  const specialtyById = useMemo(() => {
    const map = new Map<number, SpecialtyNode>();
    flatSpecialties.forEach((specialty) => map.set(specialty.id, specialty));
    return map;
  }, [flatSpecialties]);

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
    const fetchClinics = async () => {
      try {
        const response = await clinicsAPI.getAll({ limit: 1000 });
        const clinicsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setClinics(clinicsList);
      } catch (error) {
        console.error('Error fetching clinics:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSpecialties = async () => {
      try {
        const response = await specialtiesAPI.getAll();
        const specialtiesList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setSpecialties(specialtiesList);
      } catch (error) {
        console.error('Error fetching specialties:', error);
      }
    };

    fetchClinics();
    fetchSpecialties();
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
    const routeCityName = grad ? resolveCityNameFromSlug(grad) : '';
    setSelectedCity(routeCityName);
    setCitySearch(routeCityName);

    if (!specijalnost) {
      setSelectedParentSpecialty('');
      setSelectedSubSpecialties([]);
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
  }, [grad, hierarchicalSpecialties, specijalnost, allCities]);

  const selectedParentData = useMemo(() => {
    if (!selectedParentSpecialty) {
      return null;
    }

    return hierarchicalSpecialties.find((specialty) => specialty.slug === selectedParentSpecialty) || null;
  }, [hierarchicalSpecialties, selectedParentSpecialty]);

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

  const getClinicSpecialtySlugs = (clinic: Clinic): string[] => {
    const slugs = new Set<string>();

    const attachSpecialty = (specialty?: SpecialtyNode | ClinicSpecialty | null) => {
      if (!specialty?.slug) {
        return;
      }

      slugs.add(specialty.slug);

      if (specialty.parent_id) {
        const parent = specialtyById.get(specialty.parent_id);
        if (parent?.slug) {
          slugs.add(parent.slug);
        }
      }
    };

    (clinic.specijalnosti || []).forEach((specialty) => attachSpecialty(specialty));

    (clinic.doktori || []).forEach((doctor) => {
      if (doctor.specijalnost_id) {
        attachSpecialty(specialtyById.get(doctor.specijalnost_id));
      }

      if (doctor.specijalnost) {
        attachSpecialty(specialtyByName.get(normalizeText(doctor.specijalnost)));
      }
    });

    return Array.from(slugs);
  };

  const getClinicSearchTerms = (clinic: Clinic): string[] => {
    const terms = new Set<string>();

    const addTerm = (value?: string | null) => {
      const normalized = (value || '').trim();
      if (normalized !== '') {
        terms.add(normalized);
      }
    };

    (clinic.specijalnosti || []).forEach((specialty) => {
      addTerm(specialty.naziv);

      if (specialty.parent_id) {
        addTerm(specialtyById.get(specialty.parent_id)?.naziv);
      }
    });

    (clinic.doktori || []).forEach((doctor) => {
      addTerm(doctor.specijalnost);

      if (doctor.specijalnost_id) {
        const specialty = specialtyById.get(doctor.specijalnost_id);
        addTerm(specialty?.naziv);
        if (specialty?.parent_id) {
          addTerm(specialtyById.get(specialty.parent_id)?.naziv);
        }
      }
    });

    return Array.from(terms);
  };

  useEffect(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedCity = normalizeText(selectedCity);

    const filtered = clinics
      .map((clinic) => ({
        ...clinic,
        distance:
          userLocation && clinic.latitude && clinic.longitude
            ? calculateDistance(userLocation.lat, userLocation.lng, clinic.latitude, clinic.longitude)
            : undefined,
      }))
      .filter((clinic) => {
        if (
          normalizedSearch &&
          ![
            clinic.naziv,
            clinic.opis,
            clinic.adresa,
            clinic.grad,
            clinic.telefon,
            ...getClinicSearchTerms(clinic),
          ]
            .filter(Boolean)
            .some((value) => normalizeText(String(value)).includes(normalizedSearch))
        ) {
          return false;
        }

        if (normalizedCity && normalizeText(clinic.grad) !== normalizedCity) {
          return false;
        }

        if (!selectedParentData) {
          return true;
        }

        const clinicSpecialtySlugs = getClinicSpecialtySlugs(clinic);

        if (selectedSubSpecialties.length > 0) {
          return selectedSubSpecialties.some((slug) => clinicSpecialtySlugs.includes(slug));
        }

        if (clinicSpecialtySlugs.includes(selectedParentData.slug)) {
          return true;
        }

        return (selectedParentData.children || []).some((child) => clinicSpecialtySlugs.includes(child.slug));
      });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.ocjena || 0) - (a.ocjena || 0);
        case 'distance':
          if (!useUserLocation) {
            return 0;
          }
          return (a.distance || Number.MAX_SAFE_INTEGER) - (b.distance || Number.MAX_SAFE_INTEGER);
        case 'name':
        default:
          return a.naziv.localeCompare(b.naziv);
      }
    });

    setFilteredClinics(filtered);
  }, [
    clinics,
    searchTerm,
    selectedCity,
    selectedParentData,
    selectedSubSpecialties,
    sortBy,
    useUserLocation,
    userLocation,
    specialtyById,
    specialtyByName,
  ]);

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
  }, [grad, routeSpecialtyData]);

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
  }, [grad, routeSpecialtyData]);

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      description: seoDescription,
      numberOfItems: filteredClinics.length,
      itemListElement: filteredClinics.slice(0, 10).map((clinic, index) => ({
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
    [filteredClinics, pageTitle, seoDescription]
  );

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <div className="md:hidden mb-4">
              <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
            </div>

            <div className="hidden md:flex items-center justify-center gap-3 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">{pageTitle}</h1>
            </div>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Pregledajte profile, usluge, tim doktora i kontakt informacije klinika.
            </p>
          </div>

          <div className="mb-8 space-y-4 bg-card p-4 rounded-lg border">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretrazite klinike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="relative w-full lg:w-56">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
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

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Pronadjeno {filteredClinics.length} klinika
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

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'map')} className="space-y-6">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
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
              {filteredClinics.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredClinics.map((clinic) =>
                    template === 'soft' ? (
                      <ClinicCardSoft key={clinic.id} clinic={clinic} />
                    ) : (
                      <ClinicCard key={clinic.id} clinic={clinic} />
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nema rezultata</h3>
                  <p className="text-muted-foreground">Probajte sa drugim kriterijumima pretrage.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <ClinicsMap clinics={filteredClinics} userLocation={userLocation} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
}
