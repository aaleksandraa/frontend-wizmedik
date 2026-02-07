import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
  doktori?: any[];
  latitude?: number;
  longitude?: number;
  slug?: string;
  ocjena?: number;
  distance?: number;
}

type SortOption = 'name' | 'rating' | 'distance';

export default function Clinics() {
  const { grad, specijalnost } = useParams<{ grad?: string; specijalnost?: string }>();
  const [searchParams] = useSearchParams();
  const { template } = useListingTemplate('clinics');
  const { cities: allCities } = useAllCities(); // Get all cities from database
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    const gradParam = grad || searchParams.get('grad') || '';
    return gradParam ? decodeURIComponent(gradParam.replace(/\+/g, ' ')) : '';
  });
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedParentSpecialty, setSelectedParentSpecialty] = useState<string>(specijalnost || '');
  const [selectedSubSpecialties, setSelectedSubSpecialties] = useState<string[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number; lng: number} | null>(null);
  const [useLocation, setUseLocation] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const fetchClinics = async () => {
    try {
      const response = await clinicsAPI.getAll();
      const clinicsList = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);
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
      setSpecialties(response.data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  // API already returns top-level specialties with children included
  const hierarchicalSpecialties = useMemo(() => {
    return specialties.map((parent: any) => ({
      ...parent,
      children: parent.children || []
    }));
  }, [specialties]);

  useEffect(() => {
    fetchClinics();
    fetchSpecialties();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    if (grad) {
      setSelectedCity(grad);
      setCitySearch(grad);
    }
    if (specijalnost) {
      setSelectedParentSpecialty(specijalnost);
    }
  }, [grad, specijalnost]);

  // Set citySearch when selectedCity is loaded from URL
  useEffect(() => {
    if (selectedCity) {
      setCitySearch(selectedCity);
    }
  }, [selectedCity]);

  useEffect(() => {
    filterClinics();
  }, [filterClinics]);

  const selectedParentData = useMemo(() => {
    if (!selectedParentSpecialty) return null;
    return hierarchicalSpecialties.find(s => s.id.toString() === selectedParentSpecialty);
  }, [selectedParentSpecialty, hierarchicalSpecialties]);

  // Use all cities from database instead of extracting from clinics
  const uniqueCities = useMemo(() => {
    return allCities.map(city => city.naziv).sort();
  }, [allCities]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return uniqueCities;
    return uniqueCities.filter(city => 
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [uniqueCities, citySearch]);

  const toggleLocation = () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
      setSortBy('name');
    } else {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            setUseLocation(true);
            setSortBy('distance');
          },
          (error) => {
            console.error('Error getting location:', error);
            alert('Nije moguće pristupiti vašoj lokaciji.');
          }
        );
      } else {
        alert('Vaš browser ne podržava geolokaciju.');
      }
    }
  };

  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  const filterClinics = useCallback(() => {
    let filtered = clinics.map(clinic => ({
      ...clinic,
      distance: userLocation && clinic.latitude && clinic.longitude
        ? calculateDistance(userLocation.lat, userLocation.lng, clinic.latitude, clinic.longitude)
        : undefined
    }));

    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.opis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.adresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(clinic => clinic.grad === selectedCity);
    }

    // Filter by specialty
    if (selectedParentSpecialty) {
      const parentId = parseInt(selectedParentSpecialty);
      const subIds = selectedSubSpecialties.map(id => parseInt(id));
      
      filtered = filtered.filter(clinic => {
        if (!clinic.doktori || clinic.doktori.length === 0) return false;
        
        return clinic.doktori.some((doctor: any) => {
          const docSpecId = doctor.specijalnost_id || doctor.specijalnost?.id;
          if (!docSpecId) return false;
          
          // If sub-specialties selected, check those
          if (subIds.length > 0) {
            return subIds.includes(docSpecId);
          }
          // Otherwise check parent and all its children
          if (docSpecId === parentId) return true;
          const parent = hierarchicalSpecialties.find(s => s.id === parentId);
          if (parent?.children) {
            return parent.children.some((child: any) => child.id === docSpecId);
          }
          return false;
        });
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.naziv.localeCompare(b.naziv);
        case 'rating':
          return (b.ocjena || 0) - (a.ocjena || 0);
        case 'distance':
          if (!useLocation) return 0;
          return (a.distance || 999) - (b.distance || 999);
        default:
          return 0;
      }
    });

    setFilteredClinics(filtered);
  }, [clinics, searchTerm, selectedCity, selectedParentSpecialty, selectedSubSpecialties, userLocation, useLocation, sortBy, hierarchicalSpecialties, calculateDistance]);

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
      prev.includes(subId) 
        ? prev.filter(id => id !== subId)
        : [...prev, subId]
    );
  };

  const selectAllSubSpecialties = () => {
    if (selectedParentData?.children) {
      const allIds = selectedParentData.children.map((c: any) => c.id.toString());
      setSelectedSubSpecialties(allIds);
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

  // Dynamic page title
  const pageTitle = useMemo(() => {
    let title = 'Klinike';
    if (selectedCity) title += ` - ${selectedCity}`;
    return title;
  }, [selectedCity]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Privatne klinike u Bosni i Hercegovini",
    "description": "Lista privatnih klinika i zdravstvenih ustanova u BiH",
    "numberOfItems": filteredClinics.length,
    "itemListElement": filteredClinics.slice(0, 10).map((clinic, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MedicalClinic",
        "name": clinic.naziv,
        "address": { "@type": "PostalAddress", "streetAddress": clinic.adresa, "addressLocality": clinic.grad, "addressCountry": "BA" },
        "telephone": clinic.telefon
      }
    }))
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle} | WizMedik</title>
        <meta name="description" content="Pregledajte profile, zakažite termin online ili kontaktirajte." />
        <meta name="keywords" content="privatne klinike bih, klinika sarajevo, klinika banja luka, zdravstvene ustanove, poliklinika, medicinski centar" />
        <link rel="canonical" href="https://wizmedik.com/klinike" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content="Pregledajte profile, zakažite termin online ili kontaktirajte." />
        <meta property="og:url" content="https://wizmedik.com/klinike" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            {/* Mobile: No icon, smaller font */}
            <div className="md:hidden mb-4">
              <h1 className="text-2xl font-bold text-foreground">
                {pageTitle}
              </h1>
            </div>
            
            {/* Desktop: Icon + larger font */}
            <div className="hidden md:flex items-center justify-center gap-3 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                {pageTitle}
              </h1>
            </div>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Pregledajte profile, zakažite termin online ili kontaktirajte.
            </p>
          </div>

        {/* Filters */}
        <div className="mb-8 space-y-4 bg-card p-4 rounded-lg border">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretražite klinike..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* City Autocomplete */}
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
                  {filteredCities.map(city => (
                    <div
                      key={city}
                      className={`px-3 py-2 hover:bg-muted cursor-pointer text-sm ${selectedCity === city ? 'bg-primary/10' : ''}`}
                      onMouseDown={() => handleCitySelect(city)}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Parent Specialty */}
            <Select value={selectedParentSpecialty || 'all'} onValueChange={handleParentSpecialtyChange}>
              <SelectTrigger className="w-full lg:w-56">
                <SelectValue placeholder="Sve specijalnosti" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve specijalnosti</SelectItem>
                {hierarchicalSpecialties.map((parent: any) => (
                  <SelectItem key={parent.id} value={parent.id.toString()}>
                    {parent.naziv}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sub-specialties checkboxes - mobile: inline after specialty */}
            {selectedParentData && selectedParentData.children?.length > 0 && (
              <div className="w-full lg:hidden flex flex-wrap gap-3">
                {selectedParentData.children.map((child: any) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sub-mobile-${child.id}`}
                      checked={selectedSubSpecialties.includes(child.id.toString())}
                      onCheckedChange={() => toggleSubSpecialty(child.id.toString())}
                    />
                    <Label htmlFor={`sub-mobile-${child.id}`} className="text-sm cursor-pointer">
                      {child.naziv}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {/* Location Toggle */}
            <Button 
              onClick={toggleLocation}
              variant={useLocation ? "default" : "outline"}
              className="w-full lg:w-auto"
            >
              <Navigation className={`h-4 w-4 mr-2 ${useLocation ? 'animate-pulse' : ''}`} />
              {useLocation ? 'Lokacija uključena' : 'Blizu mene'}
            </Button>
          </div>

          {/* Sub-specialties checkboxes - desktop: separate row */}
          {selectedParentData && selectedParentData.children?.length > 0 && (
            <div className="hidden lg:block pt-4 border-t">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Podkategorije: {selectedParentData.naziv}</Label>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={selectAllSubSpecialties}>
                    Označi sve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSubSpecialties}>
                    Poništi
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {selectedParentData.children.map((child: any) => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`sub-${child.id}`}
                      checked={selectedSubSpecialties.includes(child.id.toString())}
                      onCheckedChange={() => toggleSubSpecialty(child.id.toString())}
                    />
                    <Label htmlFor={`sub-${child.id}`} className="text-sm cursor-pointer">
                      {child.naziv}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sort */}
          <div className="flex items-center justify-between pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Pronađeno {filteredClinics.length} klinika
              {useLocation && ' • Lokacija aktivna'}
            </p>
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Po nazivu</SelectItem>
                  <SelectItem value="rating">Po ocjeni</SelectItem>
                  <SelectItem value="distance" disabled={!useLocation}>Po udaljenosti</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')} className="space-y-6">
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
                {filteredClinics.map(clinic => (
                  template === 'soft' ? (
                    <ClinicCardSoft key={clinic.id} clinic={clinic} />
                  ) : (
                    <ClinicCard key={clinic.id} clinic={clinic} />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">Nema rezultata</h3>
                <p className="text-muted-foreground">Probajte sa drugim kriterijumima pretrage</p>
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
