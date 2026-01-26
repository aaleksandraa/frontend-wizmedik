import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAllCities } from '@/hooks/useAllCities';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LaboratoryCardSoft } from '@/components/cards/LaboratoryCardSoft';
import { MapView } from '@/components/MapView';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { 
  FlaskConical, Search, MapPin, Phone, Star, 
  CheckCircle, TrendingUp, X, ChevronDown, List
} from 'lucide-react';
import { laboratoriesAPI } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Laboratory {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  adresa: string;
  telefon: string;
  email: string;
  opis: string;
  featured_slika?: string;
  profilna_slika?: string;
  ocjena: number;
  broj_ocjena: number;
  broj_pregleda: number;
  verified: boolean;
  active: boolean;
  analize_count?: number;
  paketi_count?: number;
  latitude?: number;
  longitude?: number;
}

interface KategorijaAnalize {
  id: number;
  naziv: string;
  slug: string;
  opis?: string;
  ikona?: string;
  boja?: string;
  aktivne_analize_count?: number;
}

export default function Laboratories() {
  const { grad } = useParams<{ grad?: string }>();
  const { template } = useListingTemplate('laboratories');
  const { cities: allCities } = useAllCities(); // Get all cities from database
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [kategorije, setKategorije] = useState<KategorijaAnalize[]>([]);
  
  // Filter states from URL params (prioritize URL path param over query param)
  const [selectedGrad, setSelectedGrad] = useState(grad || searchParams.get('grad') || '');
  const [selectedKategorija, setSelectedKategorija] = useState(searchParams.get('kategorija') || '');
  
  // Popover states
  const [gradOpen, setGradOpen] = useState(false);
  const [kategorijaOpen, setKategorijaOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  // Debounce search
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Convert allCities to gradovi format for compatibility
  const gradovi = useMemo(() => {
    return allCities.map(city => ({
      grad: city.naziv,
      broj_laboratorija: 0 // We don't need count for filter dropdown
    }));
  }, [allCities]);

  // Load initial data (kategorije) - only once
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const kategorijeRes = await laboratoriesAPI.getKategorije();
        setKategorije(kategorijeRes.data || []);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    loadInitialData();
  }, []);

  // Update filter when URL param changes
  useEffect(() => {
    if (grad) {
      setSelectedGrad(grad);
    }
  }, [grad]);

  // Load laboratories when filters change
  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        const params: any = {};
        if (selectedGrad) params.grad = selectedGrad;
        if (selectedKategorija) params.kategorija = selectedKategorija;

        const labsRes = await laboratoriesAPI.getAll(params);
        setLaboratories(labsRes.data.data || labsRes.data);
      } catch (error) {
        console.error('Error fetching laboratories:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchLaboratories();
  }, [selectedGrad, selectedKategorija]);

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGrad) params.set('grad', selectedGrad);
    if (selectedKategorija) params.set('kategorija', selectedKategorija);
    setSearchParams(params, { replace: true });
  }, [selectedGrad, selectedKategorija, setSearchParams]);

  // Debounced search filter
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  }, []);

  // Filter laboratories by search term (client-side for instant feedback)
  const filteredLaboratories = useMemo(() => {
    if (!searchTerm.trim()) return laboratories;
    const term = searchTerm.toLowerCase();
    return laboratories.filter((lab) =>
      lab.naziv.toLowerCase().includes(term) ||
      lab.grad.toLowerCase().includes(term) ||
      lab.adresa?.toLowerCase().includes(term)
    );
  }, [laboratories, searchTerm]);

  // Get selected category name for display
  const selectedKategorijaName = useMemo(() => {
    if (!selectedKategorija) return '';
    const kat = kategorije.find(k => k.slug === selectedKategorija);
    return kat?.naziv || '';
  }, [selectedKategorija, kategorije]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSelectedGrad('');
    setSelectedKategorija('');
    setSearchTerm('');
  }, []);

  const hasActiveFilters = selectedGrad || selectedKategorija || searchTerm;

  // SEO meta description
  const metaDescription = useMemo(() => {
    let desc = 'Pronađite medicinske laboratorije';
    if (selectedGrad) desc += ` u gradu ${selectedGrad}`;
    if (selectedKategorijaName) desc += ` - ${selectedKategorijaName} analize`;
    desc += '. Pregled analiza, cijene, radno vrijeme i online rezultati.';
    return desc;
  }, [selectedGrad, selectedKategorijaName]);

  // Page title
  const pageTitle = useMemo(() => {
    let title = 'Laboratorije';
    if (selectedGrad) title += ` ${selectedGrad}`;
    if (selectedKategorijaName) title += ` - ${selectedKategorijaName}`;
    return `${title} - wizMedik`;
  }, [selectedGrad, selectedKategorijaName]);

  // JSON-LD structured data for SEO
  const jsonLd = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": selectedGrad ? `Laboratorije u ${selectedGrad}u` : "Medicinske laboratorije",
    "description": metaDescription,
    "numberOfItems": filteredLaboratories.length,
    "itemListElement": filteredLaboratories.slice(0, 10).map((lab, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "MedicalBusiness",
        "name": lab.naziv,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": lab.adresa,
          "addressLocality": lab.grad,
          "addressCountry": "BA"
        },
        "telephone": lab.telefon,
        "url": `${window.location.origin}/laboratorija/${lab.slug}`,
        ...(lab.ocjena > 0 && {
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": lab.ocjena,
            "reviewCount": lab.broj_ocjena
          }
        })
      }
    }))
  }), [filteredLaboratories, selectedGrad, metaDescription]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`laboratorije, medicinske analize, ${selectedGrad || 'Bosna i Hercegovina'}, ${selectedKategorijaName || 'biohemija, hematologija, mikrobiologija'}`} />
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
        <link rel="canonical" href={`${window.location.origin}/laboratorije${selectedGrad ? `?grad=${selectedGrad}` : ''}`} />
        {selectedGrad && <meta name="robots" content="index, follow" />}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        {/* Hero Section - Compact */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-10 md:py-14">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="max-w-4xl mx-auto text-center"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {selectedGrad ? `Laboratorije u ${selectedGrad}u` : 'Medicinske Laboratorije'}
              </h1>
              <p className="text-gray-600 mb-6">
                {selectedKategorijaName 
                  ? `${selectedKategorijaName} analize i dijagnostika`
                  : 'Pregled analiza, paketa i cijena'}
              </p>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-3xl mx-auto">
                <div className="flex flex-col gap-4">
                  {/* Main Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Pretraži laboratorije po nazivu ili adresi..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 h-12 rounded-xl text-base"
                    />
                  </div>

                  {/* Filters Row */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* City Filter - Autocomplete */}
                    <Popover open={gradOpen} onOpenChange={setGradOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={gradOpen}
                          className="h-11 justify-between rounded-xl flex-1 min-w-[180px]"
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className={selectedGrad ? 'text-gray-900' : 'text-gray-500'}>
                              {selectedGrad || 'Odaberi grad'}
                            </span>
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Pretraži gradove..." />
                          <CommandList>
                            <CommandEmpty>Nema rezultata.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value=""
                                onSelect={() => {
                                  setSelectedGrad('');
                                  setGradOpen(false);
                                }}
                              >
                                <span className={!selectedGrad ? 'font-medium' : ''}>Svi gradovi</span>
                              </CommandItem>
                              {gradovi.map((gradObj) => (
                                <CommandItem
                                  key={gradObj.grad}
                                  value={gradObj.grad}
                                  onSelect={(value) => {
                                    setSelectedGrad(value === selectedGrad ? '' : gradObj.grad);
                                    setGradOpen(false);
                                  }}
                                >
                                  <span className={selectedGrad === gradObj.grad ? 'font-medium' : ''}>
                                    {gradObj.grad}
                                  </span>
                                  <span className="ml-auto text-xs text-gray-400">
                                    ({gradObj.broj_laboratorija})
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Category Filter - Autocomplete */}
                    <Popover open={kategorijaOpen} onOpenChange={setKategorijaOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={kategorijaOpen}
                          className="h-11 justify-between rounded-xl flex-1 min-w-[180px]"
                        >
                          <div className="flex items-center gap-2">
                            <FlaskConical className="w-4 h-4 text-gray-500" />
                            <span className={selectedKategorija ? 'text-gray-900' : 'text-gray-500'}>
                              {selectedKategorijaName || 'Vrsta analize'}
                            </span>
                          </div>
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Pretraži kategorije..." />
                          <CommandList>
                            <CommandEmpty>Nema rezultata.</CommandEmpty>
                            <CommandGroup>
                              <CommandItem
                                value=""
                                onSelect={() => {
                                  setSelectedKategorija('');
                                  setKategorijaOpen(false);
                                }}
                              >
                                <span className={!selectedKategorija ? 'font-medium' : ''}>Sve kategorije</span>
                              </CommandItem>
                              {kategorije.map((kat) => (
                                <CommandItem
                                  key={kat.id}
                                  value={kat.naziv}
                                  onSelect={() => {
                                    setSelectedKategorija(kat.slug === selectedKategorija ? '' : kat.slug);
                                    setKategorijaOpen(false);
                                  }}
                                >
                                  <span className={selectedKategorija === kat.slug ? 'font-medium' : ''}>
                                    {kat.naziv}
                                  </span>
                                  {kat.aktivne_analize_count !== undefined && (
                                    <span className="ml-auto text-xs text-gray-400">
                                      ({kat.aktivne_analize_count})
                                    </span>
                                  )}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        onClick={clearFilters}
                        className="h-11 px-4 rounded-xl text-gray-600 hover:text-gray-900"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Očisti
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Active Filters Display */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white border-b"
            >
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Aktivni filteri:</span>
                  {selectedGrad && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <MapPin className="w-3 h-3" />
                      {selectedGrad}
                      <button
                        onClick={() => setSelectedGrad('')}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedKategorijaName && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <FlaskConical className="w-3 h-3" />
                      {selectedKategorijaName}
                      <button
                        onClick={() => setSelectedKategorija('')}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {searchTerm && (
                    <Badge variant="secondary" className="gap-1 pr-1">
                      <Search className="w-3 h-3" />
                      "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Laboratories List */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedGrad ? `Laboratorije u ${selectedGrad}u` : 'Sve Laboratorije'}
                {selectedKategorijaName && ` - ${selectedKategorijaName}`}
              </h2>
              <p className="text-sm text-gray-500">
                {filteredLaboratories.length} rezultata
              </p>
            </div>

            {/* View Mode Tabs */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')} className="space-y-6">
              <TabsList className="grid w-full max-w-[300px] grid-cols-2">
                <TabsTrigger value="list">
                  <List className="h-4 w-4 mr-2" />
                  Lista
                </TabsTrigger>
                <TabsTrigger value="map">
                  <MapPin className="h-4 w-4 mr-2" />
                  Mapa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list">
                {initialLoading ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i}>
                        <CardContent className="p-6">
                          <Skeleton className="h-40 w-full mb-4 rounded-lg" />
                          <Skeleton className="h-5 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredLaboratories.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FlaskConical className="w-12 h-12 text-gray-300 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Nema laboratorija
                      </h3>
                      <p className="text-gray-500 text-center max-w-md text-sm">
                        {hasActiveFilters
                          ? 'Pokušajte promijeniti filter ili pretragu'
                          : 'Trenutno nema dostupnih laboratorija'}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="mt-4"
                        >
                          Očisti filtere
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLaboratories.map((lab, index) => (
                      template === 'soft' ? (
                        <motion.div
                          key={lab.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                        >
                          <LaboratoryCardSoft laboratory={{
                            ...lab,
                            prosjecna_ocjena: lab.ocjena,
                            broj_recenzija: lab.broj_ocjena,
                            verifikovan: lab.verified,
                            broj_analiza: lab.analize_count,
                            broj_paketa: lab.paketi_count,
                          }} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={lab.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                    >
                      <Link to={`/laboratorija/${lab.slug}`}>
                        <Card className="h-full hover:shadow-lg transition-all duration-200 group overflow-hidden">
                        {/* Featured Image */}
                        {lab.featured_slika ? (
                          <div className="h-40 overflow-hidden">
                            <img
                              src={lab.featured_slika}
                              alt={lab.naziv}
                              loading="lazy"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="h-40 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <FlaskConical className="w-12 h-12 text-primary/30" />
                          </div>
                        )}

                        <CardContent className="p-5">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-base font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                                {lab.naziv}
                              </h3>
                              {lab.verified && (
                                <Badge variant="secondary" className="mt-1 gap-1 text-xs">
                                  <CheckCircle className="w-3 h-3" />
                                  Verifikovano
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Rating */}
                          {lab.broj_ocjena > 0 && (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-gray-900 text-sm">{lab.ocjena.toFixed(1)}</span>
                              </div>
                              <span className="text-xs text-gray-500">
                                ({lab.broj_ocjena})
                              </span>
                            </div>
                          )}

                          {/* Location */}
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm line-clamp-1">{lab.adresa}, {lab.grad}</span>
                          </div>

                          {/* Contact */}
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm">{lab.telefon}</span>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-4 pt-3 border-t">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FlaskConical className="w-3.5 h-3.5" />
                              <span>{lab.analize_count || 0} analiza</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <TrendingUp className="w-3.5 h-3.5" />
                              <span>{lab.broj_pregleda} pregleda</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                  )
                ))}
              </div>
            )}
              </TabsContent>

              <TabsContent value="map">
                <MapView
                  items={filteredLaboratories.map(lab => ({
                    id: lab.id,
                    naziv: lab.naziv,
                    adresa: lab.adresa,
                    grad: lab.grad,
                    telefon: lab.telefon,
                    latitude: lab.latitude,
                    longitude: lab.longitude,
                    slug: lab.slug,
                  }))}
                  itemType="laboratorija"
                  itemIcon={<FlaskConical className="h-5 w-5 text-primary" />}
                  emptyMessage="Nema laboratorija sa GPS koordinatama"
                  height="550px"
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-xl mx-auto"
            >
              <FlaskConical className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Imate laboratoriju?
              </h2>
              <p className="text-gray-600 mb-6">
                Registrujte svoju laboratoriju i povećajte vidljivost
              </p>
              <Link to="/register/laboratory">
                <Button size="lg" className="rounded-xl bg-gradient-to-r from-primary to-primary/80">
                  Registruj Laboratoriju
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
