import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsAPI, specialtiesAPI } from '@/services/api';
import { useAllCities } from '@/hooks/useAllCities';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorCardSoft } from '@/components/cards/DoctorCardSoft';
import { MapView } from '@/components/MapView';
import { DoctorsMapSplitView } from '@/components/DoctorsMapSplitView';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Search, MapPin, Navigation, X, ArrowUpDown, List, Map, LayoutGrid } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DoctorListingHeader, DoctorListingFilters, DoctorListingGrid } from '@/components/DoctorListingLayout';

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  specijalnost_id?: number;
  grad: string;
  lokacija: string;
  telefon: string;
  opis?: string;
  slika_profila?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slug: string;
  latitude?: number;
  longitude?: number;
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

export default function Doctors() {
  const { template } = useListingTemplate('doctors');
  const { cities: allCities } = useAllCities(); // Get all cities from database
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const gradParam = searchParams.get('grad') || '';
    return gradParam ? decodeURIComponent(gradParam.replace(/\+/g, ' ')) : '';
  });
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedParentSpecialty, setSelectedParentSpecialty] = useState<string>('');
  const [selectedSubSpecialties, setSelectedSubSpecialties] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [useUserLocation, setUseUserLocation] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'split'>('list');
  const [splitViewEnabled, setSplitViewEnabled] = useState(true);

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
    fetchSplitViewSetting();
  }, []);

  const hierarchicalSpecialties = useMemo(() => {
    return specialties.map((parent: any) => ({
      ...parent,
      children: parent.children || []
    }));
  }, [specialties]);

  // Normalize legacy query URLs to clean SEO routes.
  useEffect(() => {
    if (location.pathname !== '/doktori') {
      return;
    }

    const textSearch = searchParams.get('pretraga');
    if (textSearch) {
      setSearchTerm(decodeURIComponent(textSearch.replace(/\+/g, ' ')));
      return;
    }

    const gradParam = searchParams.get('grad');
    const specParam = searchParams.get('specijalnost');
    if (!gradParam && !specParam) {
      return;
    }

    const decodedGrad = gradParam
      ? decodeURIComponent(gradParam.replace(/\+/g, ' ')).replace(/-/g, ' ').trim()
      : '';
    const cityMatch = decodedGrad
      ? allCities.find(
          (city) =>
            city.slug === decodedGrad.toLowerCase() ||
            city.naziv.toLowerCase() === decodedGrad.toLowerCase()
        )
      : null;
    const citySlug = decodedGrad ? (cityMatch?.slug || slugifySegment(decodedGrad)) : '';

    const specialtySlug = specParam ? slugifySegment(specParam) : '';

    if (citySlug && specialtySlug) {
      navigate(`/doktori/${citySlug}/${specialtySlug}`, { replace: true });
      return;
    }
    if (citySlug) {
      navigate(`/doktori/${citySlug}`, { replace: true });
      return;
    }
    if (specialtySlug) {
      navigate(`/doktori/specijalnost/${specialtySlug}`, { replace: true });
    }
  }, [allCities, location.pathname, navigate, searchParams]);

  // Update filters when URL params change
  useEffect(() => {
    const gradParam = searchParams.get('grad') || '';
    const specialnostParam = searchParams.get('specijalnost') || '';
    
    if (gradParam) {
      const decodedGrad = decodeURIComponent(gradParam.replace(/\+/g, ' '));
      setSelectedCity(decodedGrad);
      setCitySearch(decodedGrad);
    }
    
    if (specialnostParam && hierarchicalSpecialties.length > 0) {
      const decodedSpecijalnost = decodeURIComponent(specialnostParam.replace(/\+/g, ' '));
      // Find specialty by slug
      const foundSpecialty = hierarchicalSpecialties.find(spec => 
        spec.slug === decodedSpecijalnost || 
        spec.naziv.toLowerCase().replace(/\s+/g, '-') === decodedSpecijalnost
      );
      if (foundSpecialty) {
        setSelectedParentSpecialty(foundSpecialty.id.toString());
      }
    }
  }, [searchParams, hierarchicalSpecialties]);

  // Set citySearch when selectedCity is loaded from URL
  useEffect(() => {
    if (selectedCity) {
      setCitySearch(selectedCity);
    }
  }, [selectedCity]);

  const fetchDoctors = async () => {
    try {
      const response = await doctorsAPI.getAll();
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setDoctors(list);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await specialtiesAPI.getAll();
      setSpecialties(response.data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchSplitViewSetting = async () => {
    try {
      const response = await doctorsAPI.getTemplates();
      setSplitViewEnabled(response.data.doctors_split_view_enabled !== false);
    } catch (error) {
      console.error('Error fetching split view setting:', error);
    }
  };

  const selectedParentData = useMemo(() => {
    if (!selectedParentSpecialty) return null;
    return hierarchicalSpecialties.find(s => s.id.toString() === selectedParentSpecialty);
  }, [selectedParentSpecialty, hierarchicalSpecialties]);

  const selectedCitySlug = useMemo(() => {
    if (!selectedCity) {
      return '';
    }

    const matched = allCities.find((city) =>
      city.naziv.toLowerCase() === selectedCity.toLowerCase() ||
      city.slug === selectedCity.toLowerCase()
    );

    if (matched?.slug) {
      return matched.slug;
    }

    return slugifySegment(selectedCity);
  }, [allCities, selectedCity]);

  const canonicalUrl = useMemo(() => {
    if (selectedCitySlug && selectedParentData?.slug) {
      return `${SITE_URL}/doktori/${selectedCitySlug}/${selectedParentData.slug}`;
    }
    if (selectedParentData?.slug) {
      return `${SITE_URL}/doktori/specijalnost/${selectedParentData.slug}`;
    }
    if (selectedCitySlug) {
      return `${SITE_URL}/doktori/${selectedCitySlug}`;
    }
    return `${SITE_URL}/doktori`;
  }, [selectedCitySlug, selectedParentData]);

  const seoTitle = useMemo(() => {
    let title = 'Doktori';
    if (selectedParentData?.naziv) title += ` - ${selectedParentData.naziv}`;
    if (selectedCity) title += ` u ${selectedCity}`;
    return `${title} | WizMedik`;
  }, [selectedCity, selectedParentData]);

  const seoDescription = useMemo(() => {
    let desc = 'Pronadite doktore i specijaliste u Bosni i Hercegovini';
    if (selectedParentData?.naziv) desc = `Pronadite ${selectedParentData.naziv.toLowerCase()} doktore u Bosni i Hercegovini`;
    if (selectedCity) desc += `, grad ${selectedCity}`;
    desc += '. Uporedite profile, ocjene i dostupnost termina.';
    return desc;
  }, [selectedCity, selectedParentData]);

  // Use all cities from database instead of extracting from doctors
  const uniqueCities = useMemo(() => {
    return allCities.map(city => city.naziv).sort();
  }, [allCities]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return uniqueCities;
    return uniqueCities.filter(city => city.toLowerCase().includes(citySearch.toLowerCase()));
  }, [uniqueCities, citySearch]);


  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedCity, selectedParentSpecialty, selectedSubSpecialties, userLocation, useUserLocation, sortBy, hierarchicalSpecialties]);

  const toggleLocation = () => {
    if (useUserLocation) {
      setUseUserLocation(false);
      setUserLocation(null);
      setSortBy('name');
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            setUseUserLocation(true);
            setSortBy('distance');
          },
          () => alert('Nije moguće pristupiti vašoj lokaciji.')
        );
      } else {
        alert('Vaš browser ne podržava geolokaciju.');
      }
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const filterDoctors = () => {
    let filtered = doctors.map(doc => ({
      ...doc,
      distance: userLocation && doc.latitude && doc.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, doc.latitude, doc.longitude)
        : undefined
    }));

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        `${d.ime} ${d.prezime}`.toLowerCase().includes(term) ||
        d.specijalnost?.toLowerCase().includes(term) ||
        d.lokacija?.toLowerCase().includes(term)
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(d => d.grad?.toLowerCase() === selectedCity.toLowerCase());
    }

    if (selectedParentSpecialty) {
      const parentId = parseInt(selectedParentSpecialty);
      const subIds = selectedSubSpecialties.map(id => parseInt(id));
      
      filtered = filtered.filter(doc => {
        const docSpecId = doc.specijalnost_id;
        if (!docSpecId) return false;
        
        if (subIds.length > 0) {
          return subIds.includes(docSpecId);
        }
        if (docSpecId === parentId) return true;
        const parent = hierarchicalSpecialties.find(s => s.id === parentId);
        if (parent?.children) {
          return parent.children.some((child: any) => child.id === docSpecId);
        }
        return false;
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return `${a.ime} ${a.prezime}`.localeCompare(`${b.ime} ${b.prezime}`);
        case 'rating': return (b.ocjena || 0) - (a.ocjena || 0);
        case 'distance': return useUserLocation ? (a.distance || 999) - (b.distance || 999) : 0;
        default: return 0;
      }
    });

    setFilteredDoctors(filtered);
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

  const toggleSubSpecialty = (subId: string) => {
    setSelectedSubSpecialties(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": selectedParentData?.naziv
      ? `${selectedParentData.naziv} doktori${selectedCity ? ` - ${selectedCity}` : ''}`
      : selectedCity
        ? `Doktori - ${selectedCity}`
        : "Doktori u Bosni i Hercegovini",
    "description": seoDescription,
    "numberOfItems": filteredDoctors.length,
    "itemListElement": filteredDoctors.slice(0, 10).map((doctor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Physician",
        "name": `Dr. ${doctor.ime} ${doctor.prezime}`,
        "medicalSpecialty": doctor.specijalnost,
        "address": { "@type": "PostalAddress", "addressLocality": doctor.grad, "addressCountry": "BA" }
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`doktor bih, doktor ${selectedCity || 'sarajevo'}, ${selectedParentData?.naziv || 'specijalist'}, online zakazivanje`} />
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
          <DoctorListingHeader
            badge="Doktori"
            badgeIcon={Stethoscope}
            title={selectedCity ? `Doktori — ${selectedCity}` : 'Doktori u Bosni i Hercegovini'}
            description={
              selectedCity
                ? 'Pregledajte profile, zakažite termin online ili kontaktirajte.'
                : 'Pronađite najboljeg doktora za vaše potrebe — kardiolozi, pedijatri, ginekolozi i drugi specijalisti.'
            }
          />

        <DoctorListingFilters>
          <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#0891b2]/60" />
              <Input
                placeholder="Pretražite doktore..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl border-[#0891b2]/15 focus-visible:ring-[#0891b2]/30"
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
                  if (!e.target.value) setSelectedCity('');
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                className="pl-10 pr-8 rounded-xl border-[#0891b2]/15 focus-visible:ring-[#0891b2]/30"
              />
              {selectedCity && (
                <button onClick={clearCity} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              )}
              {showCitySuggestions && filteredCities.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                  <div className="px-3 py-2 hover:bg-muted cursor-pointer text-sm font-medium" onMouseDown={() => handleCitySelect('')}>
                    Svi gradovi
                  </div>
                  {filteredCities.map(city => (
                    <div key={city} className={`px-3 py-2 hover:bg-muted cursor-pointer text-sm ${selectedCity === city ? 'bg-primary/10' : ''}`} onMouseDown={() => handleCitySelect(city)}>
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
                {hierarchicalSpecialties.map((parent: any) => (
                  <SelectItem key={parent.id} value={parent.id.toString()}>{parent.naziv}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedParentData && selectedParentData.children?.length > 0 && (
              <div className="w-full lg:hidden flex flex-wrap gap-3">
                {selectedParentData.children.map((child: any) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sub-mobile-${child.id}`}
                      checked={selectedSubSpecialties.includes(child.id.toString())}
                      onCheckedChange={() => toggleSubSpecialty(child.id.toString())}
                    />
                    <Label htmlFor={`sub-mobile-${child.id}`} className="text-sm cursor-pointer">{child.naziv}</Label>
                  </div>
                ))}
              </div>
            )}

            <Button onClick={toggleLocation} variant={useUserLocation ? "default" : "outline"} className={`w-full lg:w-auto rounded-full ${useUserLocation ? 'bg-[#0891b2] hover:bg-[#0e7490]' : 'border-[#0891b2]/30 text-[#0891b2] hover:bg-[#0891b2]/5'}`}>
              <Navigation className={`h-4 w-4 mr-2 ${useUserLocation ? 'animate-pulse' : ''}`} />
              {useUserLocation ? 'Lokacija uključena' : 'Blizu mene'}
            </Button>
          </div>

          {selectedParentData && selectedParentData.children?.length > 0 && (
            <div className="hidden lg:block pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Podkategorije: {selectedParentData.naziv}</Label>
              </div>
              <div className="flex flex-wrap gap-4">
                {selectedParentData.children.map((child: any) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sub-${child.id}`}
                      checked={selectedSubSpecialties.includes(child.id.toString())}
                      onCheckedChange={() => toggleSubSpecialty(child.id.toString())}
                    />
                    <Label htmlFor={`sub-${child.id}`} className="text-sm cursor-pointer">{child.naziv}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-[#0891b2]/10 pt-4">
            <p className="text-sm text-muted-foreground">
              Pronađeno <span className="font-semibold text-[#0891b2]">{filteredDoctors.length}</span> doktora
              {useUserLocation && ' • Lokacija aktivna'}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Po imenu</SelectItem>
                  <SelectItem value="rating">Po ocjeni</SelectItem>
                  <SelectItem value="distance" disabled={!useUserLocation}>Po udaljenosti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          </div>
        </DoctorListingFilters>

        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map' | 'split')} className="space-y-6">
          <TabsList className={`grid w-full rounded-xl bg-white p-1 shadow-sm ${splitViewEnabled ? 'max-w-[450px] grid-cols-3' : 'max-w-[300px] grid-cols-2'}`}>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              Lista
            </TabsTrigger>
            {splitViewEnabled && (
              <TabsTrigger value="split">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Lista + Mapa
              </TabsTrigger>
            )}
            <TabsTrigger value="map">
              <Map className="h-4 w-4 mr-2" />
              Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {filteredDoctors.length > 0 ? (
              <DoctorListingGrid>
                {filteredDoctors.map(doctor => (
                  template === 'soft' ? (
                    <DoctorCardSoft key={doctor.id} doctor={doctor} />
                  ) : (
                    <DoctorCard key={doctor.id} doctor={doctor} />
                  )
                ))}
              </DoctorListingGrid>
            ) : (
              <div className="rounded-2xl border border-[#0891b2]/10 bg-white py-16 text-center shadow-sm">
                <Stethoscope className="mx-auto mb-4 h-16 w-16 text-[#0891b2]/40" />
                <h3 className="mb-2 text-xl font-semibold text-foreground">Nema rezultata</h3>
                <p className="text-muted-foreground">Probajte sa drugim kriterijumima pretrage</p>
              </div>
            )}
          </TabsContent>

          {splitViewEnabled && (
            <TabsContent value="split">
              {filteredDoctors.length > 0 ? (
                <DoctorsMapSplitView doctors={filteredDoctors} userLocation={userLocation} />
              ) : (
                <div className="text-center py-16">
                  <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">Nema rezultata</h3>
                  <p className="text-muted-foreground">Probajte sa drugim kriterijumima pretrage</p>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="map">
            <MapView
              items={filteredDoctors.map(doctor => ({
                id: doctor.id,
                naziv: `Dr. ${doctor.ime} ${doctor.prezime}`,
                adresa: doctor.lokacija || '',
                grad: doctor.grad,
                telefon: doctor.telefon,
                latitude: doctor.latitude,
                longitude: doctor.longitude,
                slug: doctor.slug,
                distance: doctor.distance,
              }))}
              userLocation={userLocation}
              itemType="doktor"
              itemIcon={<Stethoscope className="h-5 w-5 text-primary" />}
              emptyMessage="Nema doktora sa GPS koordinatama"
              height="550px"
            />
          </TabsContent>
        </Tabs>
        </main>
      </div>
      <Footer />
    </>
  );
}

