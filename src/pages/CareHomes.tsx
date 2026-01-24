import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Filter, MapPin, Shield, Activity, Users, Home as HomeIcon, X, ChevronRight, Phone, Star, CheckCircle, BookOpen, List } from 'lucide-react';
import CareHomeCardSoft from '@/components/cards/CareHomeCardSoft';
import { MapView } from '@/components/MapView';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface Dom {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  regija?: string;
  adresa: string;
  telefon?: string;
  email?: string;
  website?: string;
  opis: string;
  tip_doma: {
    id: number;
    naziv: string;
    slug: string;
  };
  nivo_njege: {
    id: number;
    naziv: string;
    slug: string;
  };
  programi_njege: Array<{
    id: number;
    naziv: string;
    slug: string;
  }>;
  medicinsk_usluge: Array<{
    id: number;
    naziv: string;
    slug: string;
  }>;
  smjestaj_uslovi: Array<{
    id: number;
    naziv: string;
    kategorija: string;
  }>;
  nurses_availability: string;
  nurses_availability_label: string;
  doctor_availability: string;
  doctor_availability_label: string;
  has_physiotherapist: boolean;
  has_physiatrist: boolean;
  emergency_protocol: boolean;
  pricing_mode: string;
  formatted_price: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_pregleda: number;
  featured_slika?: string;
  url: string;
  latitude?: number;
  longitude?: number;
}

interface FilterOptions {
  gradovi: string[];
  regije: string[];
  tipovi_domova: Array<{ id: number; naziv: string; slug: string; opis: string }>;
  nivoi_njege: Array<{ id: number; naziv: string; slug: string; opis: string }>;
  programi_njege: Array<{ id: number; naziv: string; slug: string; opis: string }>;
  medicinske_usluge: Array<{ id: number; naziv: string; slug: string; opis: string }>;
  smjestaj_uslovi: Array<{ id: number; naziv: string; slug: string; kategorija: string; opis: string }>;
}

export default function CareHomes() {
  const { grad } = useParams<{ grad?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [domovi, setDomovi] = useState<Dom[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter states (prioritize URL path param over query param)
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [gradInput, setGradInput] = useState(grad || searchParams.get('grad') || '');
  const [selectedGrad, setSelectedGrad] = useState(grad || searchParams.get('grad') || '');
  const [selectedTipDoma, setSelectedTipDoma] = useState(searchParams.get('tip_doma') || '');
  const [selectedNivoNjege, setSelectedNivoNjege] = useState(searchParams.get('nivo_njege') || '');
  const [selectedProgrami, setSelectedProgrami] = useState<string[]>(
    searchParams.get('programi_njege')?.split(',').filter(Boolean) || []
  );

  // Autocomplete for cities
  const filteredGradovi = useMemo(() => {
    if (!filterOptions || !gradInput) return filterOptions?.gradovi || [];
    return filterOptions.gradovi.filter(grad =>
      grad.toLowerCase().includes(gradInput.toLowerCase())
    );
  }, [filterOptions, gradInput]);

  const [showGradSuggestions, setShowGradSuggestions] = useState(false);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchDomovi();
  }, [selectedGrad, selectedTipDoma, selectedNivoNjege, selectedProgrami, search]);

  // Update filter when URL param changes
  useEffect(() => {
    if (grad) {
      setSelectedGrad(grad);
      setGradInput(grad);
    }
  }, [grad]);

  const fetchFilterOptions = async () => {
    try {
      const response = await fetch('/api/domovi-njega/filter-options');
      const data = await response.json();
      if (data.success) {
        setFilterOptions(data.data);
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchDomovi = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (selectedGrad) params.set('grad', selectedGrad);
      if (selectedTipDoma) params.set('tip_doma', selectedTipDoma);
      if (selectedNivoNjege) params.set('nivo_njege', selectedNivoNjege);
      if (selectedProgrami.length > 0) params.set('programi_njege', selectedProgrami.join(','));

      const url = `/api/domovi-njega?${params}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setDomovi(data.data);
      }
      
      // Update URL
      setSearchParams(params);
    } catch (error) {
      console.error('Error fetching domovi:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setGradInput('');
    setSelectedGrad('');
    setSelectedTipDoma('');
    setSelectedNivoNjege('');
    setSelectedProgrami([]);
    setSearchParams({});
  };

  const handleGradSelect = (grad: string) => {
    setGradInput(grad);
    setSelectedGrad(grad);
    setShowGradSuggestions(false);
  };

  const toggleProgram = (programId: string) => {
    setSelectedProgrami(prev =>
      prev.includes(programId)
        ? prev.filter(id => id !== programId)
        : [...prev, programId]
    );
  };

  const activeFiltersCount = [
    selectedGrad,
    selectedTipDoma,
    selectedNivoNjege,
    ...selectedProgrami
  ].filter(Boolean).length;

  // SEO: Dynamic title and description based on filters
  const seoTitle = useMemo(() => {
    const parts = ['Domovi za starija i bolesna lica'];
    if (selectedGrad) parts.push(`u ${selectedGrad}u`);
    if (selectedTipDoma) {
      const tip = filterOptions?.tipovi_domova.find(t => t.slug === selectedTipDoma);
      if (tip) parts.push(`- ${tip.naziv}`);
    }
    parts.push('| WizMedik');
    return parts.join(' ');
  }, [selectedGrad, selectedTipDoma, filterOptions]);

  const seoDescription = useMemo(() => {
    let desc = 'Pronađite kvalitetne domove za starija i bolesna lica';
    if (selectedGrad) desc += ` u ${selectedGrad}u`;
    desc += ' u Bosni i Hercegovini. ';
    if (selectedNivoNjege) {
      const nivo = filterOptions?.nivoi_njege.find(n => n.slug === selectedNivoNjege);
      if (nivo) desc += `${nivo.naziv} njega. `;
    }
    desc += 'Uporedite cijene, usluge, medicinski kadar i smještajne uslove. Besplatna pretraga i kontakt.';
    return desc;
  }, [selectedGrad, selectedNivoNjege, filterOptions]);

  // SEO: Structured Data for listing page
  const structuredData = useMemo(() => {
    const baseUrl = window.location.origin;
    
    // Main WebPage schema
    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": seoTitle,
      "description": seoDescription,
      "url": window.location.href,
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": domovi.slice(0, 10).map((dom, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "LocalBusiness",
            "@id": `${baseUrl}/dom-njega/${dom.slug}`,
            "name": dom.naziv,
            "description": dom.opis?.substring(0, 160),
            "address": {
              "@type": "PostalAddress",
              "streetAddress": dom.adresa,
              "addressLocality": dom.grad,
              "addressCountry": "BA"
            },
            ...(dom.telefon && { "telephone": dom.telefon }),
            ...(dom.prosjecna_ocjena > 0 && {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": dom.prosjecna_ocjena,
                "reviewCount": dom.broj_recenzija,
                "bestRating": "5",
                "worstRating": "1"
              }
            }),
            "url": `${baseUrl}/dom-njega/${dom.slug}`
          }
        })),
        "numberOfItems": domovi.length
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Početna",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Domovi za njegu",
            "item": `${baseUrl}/domovi-njega`
          }
        ]
      }
    };

    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Kako odabrati pravi dom za starije osobe?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Pri odabiru doma za starije osobe, važno je razmotriti: nivo potrebne njege, lokaciju, dostupnost medicinskog osoblja 24/7, kvalitet smještaja, programe aktivnosti, te cijenu i način plaćanja. Preporučujemo posjet domu prije donošenja odluke."
          }
        },
        {
          "@type": "Question",
          "name": "Koliko košta smještaj u domu za starije?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Cijene smještaja u domovima za starije u BiH variraju od 800 do 2500 KM mjesečno, ovisno o nivou njege, lokaciji i uslugama. Osnovni smještaj je jeftiniji, dok specijalizirana njega (demencija, palijativna njega) košta više."
          }
        },
        {
          "@type": "Question",
          "name": "Koje usluge nude domovi za starije osobe?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Domovi za starije nude: smještaj i ishranu, medicinsku njegu, fizioterapiju, radnu terapiju, socijalne aktivnosti, pomoć pri svakodnevnim aktivnostima, te specijalizirane programe za demenciju i Alzheimerovu bolest."
          }
        },
        {
          "@type": "Question",
          "name": "Da li domovi primaju osobe sa demencijom?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Mnogi domovi u BiH imaju specijalizirane odjele za osobe sa demencijom i Alzheimerovom bolešću. Ovi odjeli imaju obučeno osoblje i prilagođene prostore za sigurnu njegu osoba sa kognitivnim poremećajima."
          }
        }
      ]
    };

    return [webPageSchema, faqSchema];
  }, [domovi, seoTitle, seoDescription]);

  // SEO: Canonical URL
  const canonicalUrl = useMemo(() => {
    const baseUrl = `${window.location.origin}/domovi-njega`;
    const params = new URLSearchParams();
    if (selectedGrad) params.set('grad', selectedGrad);
    if (selectedTipDoma) params.set('tip_doma', selectedTipDoma);
    if (selectedNivoNjege) params.set('nivo_njege', selectedNivoNjege);
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }, [selectedGrad, selectedTipDoma, selectedNivoNjege]);

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`domovi za starije ${selectedGrad || 'BiH'}, dom za njegu, starački dom, njega starijih osoba, dom za bolesne, palijativna njega, demencija njega, alzheimer dom, gerontološki centar, smještaj starijih osoba`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="WizMedik" />
        <meta property="og:locale" content="bs_BA" />
        <meta property="og:image" content={`${window.location.origin}/og-domovi-njega.jpg`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
        
        {/* Canonical */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Structured Data */}
        {structuredData.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section with SEO-optimized content */}
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Breadcrumb - hidden on mobile */}
            <nav aria-label="Breadcrumb" className="mb-6 hidden md:block">
              <ol className="flex items-center gap-2 text-sm text-white/80">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">Početna</Link>
                </li>
                <ChevronRight className="h-4 w-4" />
                <li aria-current="page" className="text-white font-medium">
                  Domovi za njegu
                </li>
              </ol>
            </nav>
            
            <div className="text-center">
              {/* Icon above title on mobile */}
              <HomeIcon className="h-12 w-12 mx-auto mb-4 md:hidden" aria-hidden="true" />
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <HomeIcon className="h-12 w-12 hidden md:block" aria-hidden="true" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  Domovi za starija i bolesna lica
                  {selectedGrad && <span className="block text-2xl md:text-3xl mt-2 font-normal opacity-90">u {selectedGrad}u</span>}
                </h1>
              </div>
              <p className="text-xl opacity-90 max-w-3xl mx-auto mb-8">
                Pronađite kvalitetnu njegu i smještaj za vaše najdraže. Uporedite {domovi.length > 0 ? domovi.length : ''} verificiranih domova u Bosni i Hercegovini.
              </p>
              
              {/* Link to Vodic page */}
              <div className="mb-6">
                <Link 
                  to="/domovi-njega/vodic" 
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Vodič: Tipovi domova, nivoi njege i programi →
                </Link>
              </div>
              
              {/* Quick stats - hidden on mobile */}
              <div className="hidden md:flex flex-wrap justify-center gap-6 mt-8">
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Verificirani domovi</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Star className="h-5 w-5" />
                  <span>Recenzije korisnika</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                  <Phone className="h-5 w-5" />
                  <span>Besplatan kontakt</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8" id="rezultati">
          {/* Filters Toggle for Mobile */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="w-full"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filteri {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filteri
                    </h2>
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-1" />
                        Očisti
                      </Button>
                    )}
                  </div>

                  {/* Search */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Pretraga</label>
                    <Input
                      placeholder="Pretražite domove..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* City Autocomplete */}
                  <div className="relative">
                    <label className="text-sm font-medium mb-2 block">Grad</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Unesite grad..."
                        value={gradInput}
                        onChange={(e) => {
                          setGradInput(e.target.value);
                          setShowGradSuggestions(true);
                          if (!e.target.value) setSelectedGrad('');
                        }}
                        onFocus={() => setShowGradSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowGradSuggestions(false), 200)}
                        className="pl-10"
                      />
                    </div>
                    {showGradSuggestions && filteredGradovi.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                        {filteredGradovi.map(grad => (
                          <div
                            key={grad}
                            className="px-3 py-2 hover:bg-muted cursor-pointer text-sm"
                            onMouseDown={() => handleGradSelect(grad)}
                          >
                            {grad}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Accordion Filters */}
                  <Accordion type="multiple" className="w-full">
                    {/* Tip doma */}
                    <AccordionItem value="tip">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <HomeIcon className="h-4 w-4" />
                          Tip doma
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {filterOptions?.tipovi_domova.map(tip => (
                            <label
                              key={tip.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                                selectedTipDoma === tip.slug ? 'bg-primary/10' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="tip_doma"
                                checked={selectedTipDoma === tip.slug}
                                onChange={() => setSelectedTipDoma(tip.slug)}
                                className="accent-primary"
                              />
                              <span className="text-sm">{tip.naziv}</span>
                            </label>
                          ))}
                          {selectedTipDoma && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTipDoma('')}
                              className="w-full mt-2"
                            >
                              Poništi izbor
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Nivo njege */}
                    <AccordionItem value="nivo">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Nivo njege
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {filterOptions?.nivoi_njege.map(nivo => (
                            <label
                              key={nivo.id}
                              className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                                selectedNivoNjege === nivo.slug ? 'bg-primary/10' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name="nivo_njege"
                                checked={selectedNivoNjege === nivo.slug}
                                onChange={() => setSelectedNivoNjege(nivo.slug)}
                                className="accent-primary"
                              />
                              <span className="text-sm">{nivo.naziv}</span>
                            </label>
                          ))}
                          {selectedNivoNjege && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedNivoNjege('')}
                              className="w-full mt-2"
                            >
                              Poništi izbor
                            </Button>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    {/* Programi njege */}
                    <AccordionItem value="programi">
                      <AccordionTrigger className="text-sm font-medium">
                        <span className="flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Programi njege
                        </span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {filterOptions?.programi_njege.map(program => (
                            <label
                              key={program.id}
                              className="flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted"
                            >
                              <input
                                type="checkbox"
                                checked={selectedProgrami.includes(program.id.toString())}
                                onChange={() => toggleProgram(program.id.toString())}
                                className="accent-primary"
                              />
                              <span className="text-sm">{program.naziv}</span>
                            </label>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </aside>

            {/* Results */}
            <div className="flex-1">
              {/* Active Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedGrad && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {selectedGrad}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setSelectedGrad('');
                          setGradInput('');
                        }}
                      />
                    </Badge>
                  )}
                  {selectedTipDoma && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <HomeIcon className="h-3 w-3" />
                      {filterOptions?.tipovi_domova.find(t => t.slug === selectedTipDoma)?.naziv}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedTipDoma('')} />
                    </Badge>
                  )}
                  {selectedNivoNjege && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Shield className="h-3 w-3" />
                      {filterOptions?.nivoi_njege.find(n => n.slug === selectedNivoNjege)?.naziv}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedNivoNjege('')} />
                    </Badge>
                  )}
                  {selectedProgrami.map(programId => {
                    const program = filterOptions?.programi_njege.find(p => p.id.toString() === programId);
                    return program ? (
                      <Badge key={programId} variant="secondary" className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {program.naziv}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => toggleProgram(programId)} />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Results with Tabs */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')} className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    Pronađeno <span className="font-semibold text-foreground">{domovi.length}</span> domova
                  </p>
                  <TabsList className="grid w-[200px] grid-cols-2">
                    <TabsTrigger value="list">
                      <List className="h-4 w-4 mr-2" />
                      Lista
                    </TabsTrigger>
                    <TabsTrigger value="map">
                      <MapPin className="h-4 w-4 mr-2" />
                      Mapa
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="list">
                  {/* Loading State */}
                  {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                          <CardContent className="p-6">
                            <Skeleton className="h-48 w-full mb-4" />
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <Skeleton className="h-20 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : domovi.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {domovi.map(dom => (
                        <CareHomeCardSoft key={dom.id} dom={dom} />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Nema rezultata</h3>
                        <p className="text-muted-foreground mb-4">
                          Nismo pronašli domove koji odgovaraju vašim kriterijima.
                        </p>
                        <Button onClick={clearFilters}>Očisti filtere</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="map">
                  <MapView
                    items={domovi.map(dom => ({
                      id: dom.id,
                      naziv: dom.naziv,
                      adresa: dom.adresa,
                      grad: dom.grad,
                      telefon: dom.telefon,
                      latitude: dom.latitude,
                      longitude: dom.longitude,
                      slug: dom.slug,
                    }))}
                    itemType="dom-njega"
                    itemIcon={<HomeIcon className="h-5 w-5 text-green-600" />}
                    emptyMessage="Nema domova sa GPS koordinatama"
                    height="550px"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>

        {/* FAQ Section for SEO */}
        <section className="bg-white py-16 border-t" aria-labelledby="faq-heading">
          <div className="max-w-4xl mx-auto px-4">
            <h2 id="faq-heading" className="text-3xl font-bold text-center mb-8">
              Često postavljana pitanja o domovima za njegu
            </h2>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq-1">
                <AccordionTrigger className="text-left font-medium">
                  Kako odabrati pravi dom za starije osobe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Pri odabiru doma za starije osobe, važno je razmotriti nekoliko ključnih faktora:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Nivo potrebne njege (osnovna, pojačana, specijalizirana)</li>
                    <li>Lokacija i blizina porodici</li>
                    <li>Dostupnost medicinskog osoblja 24/7</li>
                    <li>Kvalitet smještaja i opremljenost</li>
                    <li>Programi aktivnosti i socijalizacije</li>
                    <li>Cijena i način plaćanja</li>
                  </ul>
                  <p className="mt-2">Preporučujemo posjet domu i razgovor sa osobljem prije donošenja konačne odluke.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-2">
                <AccordionTrigger className="text-left font-medium">
                  Koliko košta smještaj u domu za starije?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Cijene smještaja u domovima za starije u Bosni i Hercegovini variraju ovisno o više faktora:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Osnovni smještaj: 800 - 1200 KM mjesečno</li>
                    <li>Pojačana njega: 1200 - 1800 KM mjesečno</li>
                    <li>Specijalizirana njega (demencija, palijativa): 1500 - 2500 KM mjesečno</li>
                  </ul>
                  <p className="mt-2">Cijene zavise od lokacije, nivoa njege, tipa sobe (jednokrevetna/višekrevetna) i dodatnih usluga.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-3">
                <AccordionTrigger className="text-left font-medium">
                  Koje usluge nude domovi za starije osobe?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Domovi za starije osobe u BiH tipično nude sljedeće usluge:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Smještaj i puna pansionska ishrana</li>
                    <li>24-satna medicinska njega i nadzor</li>
                    <li>Fizioterapija i rehabilitacija</li>
                    <li>Radna i okupaciona terapija</li>
                    <li>Socijalne i rekreativne aktivnosti</li>
                    <li>Pomoć pri svakodnevnim aktivnostima (kupanje, oblačenje, hranjenje)</li>
                    <li>Specijalizirani programi za demenciju i Alzheimerovu bolest</li>
                    <li>Palijativna njega</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-4">
                <AccordionTrigger className="text-left font-medium">
                  Da li domovi primaju osobe sa demencijom?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Da, mnogi domovi u Bosni i Hercegovini imaju specijalizirane odjele za osobe sa demencijom i Alzheimerovom bolešću. Ovi odjeli karakteriše:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Posebno obučeno osoblje za rad sa osobama sa kognitivnim poremećajima</li>
                    <li>Sigurni i prilagođeni prostori koji sprječavaju lutanje</li>
                    <li>Strukturirane dnevne aktivnosti koje stimuliraju pamćenje</li>
                    <li>Pojačan nadzor i individualizirana njega</li>
                  </ul>
                  <p className="mt-2">Koristite filter "Programi njege" da pronađete domove sa specijaliziranom njegom za demenciju.</p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="faq-5">
                <AccordionTrigger className="text-left font-medium">
                  Kako mogu posjetiti dom prije donošenja odluke?
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  <p>Većina domova nudi mogućnost posjete i razgledanja prostora. Preporučujemo:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Kontaktirajte dom telefonom ili putem naše platforme</li>
                    <li>Zakažite termin za obilazak u vrijeme kada su aktivnosti u toku</li>
                    <li>Pripremite pitanja o njezi, osoblju, aktivnostima i cijenama</li>
                    <li>Obratite pažnju na čistoću, atmosferu i odnos osoblja prema štićenicima</li>
                    <li>Pitajte za probni boravak ako je moguć</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* SEO Content Section */}
        <section className="bg-gray-50 py-12 border-t" aria-labelledby="info-heading">
          <div className="max-w-4xl mx-auto px-4">
            <h2 id="info-heading" className="text-2xl font-bold mb-6">
              Domovi za starije i bolesne osobe u Bosni i Hercegovini
            </h2>
            <div className="prose prose-gray max-w-none">
              <p>
                WizMedik vam pomaže pronaći idealan dom za njegu vaših najdražih. Naša platforma okuplja verificirane domove za starije i bolesne osobe širom Bosne i Hercegovine, omogućavajući vam da uporedite usluge, cijene i recenzije na jednom mjestu.
              </p>
              <p>
                Bilo da tražite dom sa osnovnom njegom za samostalne starije osobe, pojačanu njegu za one kojima je potrebna svakodnevna pomoć, ili specijaliziranu njegu za osobe sa demencijom i Alzheimerovom bolešću - na pravom ste mjestu.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">Zašto koristiti WizMedik za pronalazak doma?</h3>
              <ul className="list-disc list-inside space-y-2">
                <li>Svi domovi su verificirani i provjereni</li>
                <li>Detaljne informacije o uslugama, osoblju i cijenama</li>
                <li>Autentične recenzije od porodica štićenika</li>
                <li>Jednostavno filtriranje po lokaciji, tipu njege i uslugama</li>
                <li>Besplatan kontakt sa domovima</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}