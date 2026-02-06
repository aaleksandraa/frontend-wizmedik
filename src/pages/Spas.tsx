import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, MapPin, Droplet, Heart, Bed, Calendar, X, CheckCircle, HelpCircle, BookOpen, List } from 'lucide-react';
import { spasAPI } from '@/services/api';
import { useAllCities } from '@/hooks/useAllCities';
import { Banja, BanjaFilters, VrstaBanje, Indikacija } from '@/types/spa';
import SpaCardSoft from '@/components/cards/SpaCardSoft';
import { MapView } from '@/components/MapView';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export default function Spas() {
  const { grad } = useParams<{ grad?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cities: allCities } = useAllCities(); // Get all cities from database
  const [banje, setBanje] = useState<Banja[]>([]);
  const [vrste, setVrste] = useState<VrstaBanje[]>([]);
  const [indikacije, setIndikacije] = useState<Record<string, Indikacija[]>>({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [gradInput, setGradInput] = useState(() => {
    const gradParam = searchParams.get('grad') || '';
    return gradParam ? decodeURIComponent(gradParam.replace(/\+/g, ' ')) : '';
  });
  const [showGradSuggestions, setShowGradSuggestions] = useState(false);
  
  const [filters, setFilters] = useState<BanjaFilters>({
    search: searchParams.get('search') || '',
    grad: (() => {
      const gradParam = searchParams.get('grad') || '';
      return gradParam ? decodeURIComponent(gradParam.replace(/\+/g, ' ')) : '';
    })(),
    vrsta_id: searchParams.get('vrsta_id') ? Number(searchParams.get('vrsta_id')) : undefined,
    indikacija_id: searchParams.get('indikacija_id') ? Number(searchParams.get('indikacija_id')) : undefined,
    medicinski_nadzor: searchParams.get('medicinski_nadzor') === 'true',
    ima_smjestaj: searchParams.get('ima_smjestaj') === 'true',
    online_rezervacija: searchParams.get('online_rezervacija') === 'true',
    sort_by: (searchParams.get('sort_by') as any) || 'naziv',
    sort_order: (searchParams.get('sort_order') as any) || 'asc',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadBanje();
  }, [filters]);

  // Set gradInput when filters.grad is loaded from URL
  useEffect(() => {
    if (filters.grad) {
      setGradInput(filters.grad);
    }
  }, [filters.grad]);

  // Convert allCities to gradovi format for compatibility
  const gradovi = useMemo(() => 
    allCities.map(city => ({ grad: city.naziv, broj_banja: 0 })),
    [allCities]
  );

  const filteredGradovi = gradovi.filter(g => 
    g.grad.toLowerCase().includes(gradInput.toLowerCase())
  );

  const handleGradSelect = (selectedGrad: string) => {
    setGradInput(selectedGrad);
    updateFilters({ grad: selectedGrad });
    setShowGradSuggestions(false);
  };

  const clearGrad = () => {
    setGradInput('');
    updateFilters({ grad: '' });
  };

  const loadData = async () => {
    try {
      const response = await spasAPI.getFilterOptions();
      const data = response.data.data || response.data;
      
      setVrste(data.vrste || []);
      
      // Group indikacije by kategorija
      const indikacijeByKategorija: Record<string, Indikacija[]> = {};
      (data.indikacije || []).forEach((ind: Indikacija) => {
        const kat = ind.kategorija || 'Ostalo';
        if (!indikacijeByKategorija[kat]) {
          indikacijeByKategorija[kat] = [];
        }
        indikacijeByKategorija[kat].push(ind);
      });
      setIndikacije(indikacijeByKategorija);
      
      // Cities are now loaded via useAllCities hook
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadBanje = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      // Remove empty values and false booleans (only send true values for boolean filters)
      Object.keys(params).forEach(key => {
        const value = params[key as keyof BanjaFilters];
        if (value === '' || value === undefined || value === false) {
          delete params[key as keyof BanjaFilters];
        }
      });
      
      const response = await spasAPI.getAll(params);
      setBanje(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading banje:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<BanjaFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== '' && value !== undefined && value !== false) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      grad: '',
      vrsta_id: undefined,
      indikacija_id: undefined,
      medicinski_nadzor: false,
      ima_smjestaj: false,
      online_rezervacija: false,
      sort_by: 'naziv',
      sort_order: 'asc',
    });
    setSearchParams({});
  };

  const activeFiltersCount = [
    filters.grad,
    filters.vrsta_id,
    filters.indikacija_id,
    filters.medicinski_nadzor,
    filters.ima_smjestaj,
    filters.online_rezervacija,
  ].filter(Boolean).length;

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Dynamic page title
  const pageTitle = useMemo(() => {
    let title = 'Banje';
    if (filters.grad) title += ` - ${filters.grad}`;
    return title;
  }, [filters.grad]);

  return (
    <>
      <Helmet>
        <title>{pageTitle} | WizMedik</title>
        <meta name="description" content="Pregledajte profile, zakažite termin online ili kontaktirajte." />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              {/* Icon above title on mobile */}
              <Droplet className="w-12 h-12 mx-auto mb-4 md:hidden" />
              
              <div className="flex items-center justify-center gap-3 mb-4">
                <Droplet className="w-12 h-12 hidden md:block" />
                <h1 className="text-4xl md:text-5xl font-bold">
                  {pageTitle}
                </h1>
              </div>
              <p className="text-xl text-blue-100 mb-8">
                Pregledajte profile, zakažite termin online ili kontaktirajte.
              </p>
              
              {/* Link to Indikacije page */}
              <div className="mb-6">
                <Link 
                  to="/banje/indikacije-terapije" 
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors text-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  Saznajte koja stanja se liječe u banjama →
                </Link>
              </div>

              {/* Search Bar */}
              <div className="bg-white rounded-2xl shadow-2xl p-2 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Pretražite banje..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="pl-12 h-12 border-0 focus-visible:ring-0 text-gray-900"
                  />
                </div>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="h-12 px-6 bg-white hover:bg-gray-50 text-gray-900 border-gray-200"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filteri
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Grad */}
                <div className="relative">
                  <Label className="mb-2 block">Grad</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder="Unesite grad..."
                      value={gradInput}
                      onChange={(e) => {
                        setGradInput(e.target.value);
                        setShowGradSuggestions(true);
                        if (!e.target.value) updateFilters({ grad: '' });
                      }}
                      onFocus={() => setShowGradSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowGradSuggestions(false), 200)}
                      className="pl-10 pr-8"
                    />
                    {filters.grad && (
                      <button
                        onClick={clearGrad}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {showGradSuggestions && filteredGradovi.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-auto">
                      <div
                        className="px-3 py-2 hover:bg-muted cursor-pointer text-sm font-medium"
                        onMouseDown={() => handleGradSelect('')}
                      >
                        Svi gradovi
                      </div>
                      {filteredGradovi.map(g => (
                        <div
                          key={g.grad}
                          className={`px-3 py-2 hover:bg-muted cursor-pointer text-sm ${filters.grad === g.grad ? 'bg-primary/10' : ''}`}
                          onMouseDown={() => handleGradSelect(g.grad)}
                        >
                          {g.grad} ({g.broj_banja})
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vrsta */}
                <div>
                  <Label className="mb-2 block">Vrsta banje</Label>
                  <Select 
                    value={filters.vrsta_id?.toString() || 'all'} 
                    onValueChange={(value) => updateFilters({ vrsta_id: value === 'all' ? undefined : Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sve vrste" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve vrste</SelectItem>
                      {vrste.map((v) => (
                        <SelectItem key={v.id} value={v.id.toString()}>
                          {v.naziv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Indikacija */}
                <div>
                  <Label className="mb-2 block">Indikacija</Label>
                  <Select 
                    value={filters.indikacija_id?.toString() || 'all'} 
                    onValueChange={(value) => updateFilters({ indikacija_id: value === 'all' ? undefined : Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sve indikacije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve indikacije</SelectItem>
                      {Object.entries(indikacije).map(([kategorija, items]) => (
                        <div key={kategorija}>
                          {items.map((i) => (
                            <SelectItem key={i.id} value={i.id.toString()}>
                              {i.naziv}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div>
                  <Label className="mb-2 block">Sortiraj</Label>
                  <Select 
                    value={filters.sort_by} 
                    onValueChange={(value) => updateFilters({ sort_by: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="naziv">Naziv</SelectItem>
                      <SelectItem value="grad">Grad</SelectItem>
                      <SelectItem value="prosjecna_ocjena">Ocjena</SelectItem>
                      <SelectItem value="broj_recenzija">Broj recenzija</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medicinski_nadzor"
                    checked={filters.medicinski_nadzor}
                    onCheckedChange={(checked) => updateFilters({ medicinski_nadzor: checked as boolean })}
                  />
                  <Label htmlFor="medicinski_nadzor" className="cursor-pointer flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Medicinski nadzor
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ima_smjestaj"
                    checked={filters.ima_smjestaj}
                    onCheckedChange={(checked) => updateFilters({ ima_smjestaj: checked as boolean })}
                  />
                  <Label htmlFor="ima_smjestaj" className="cursor-pointer flex items-center gap-2">
                    <Bed className="w-4 h-4 text-blue-500" />
                    Sa smještajem
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="online_rezervacija"
                    checked={filters.online_rezervacija}
                    onCheckedChange={(checked) => updateFilters({ online_rezervacija: checked as boolean })}
                  />
                  <Label htmlFor="online_rezervacija" className="cursor-pointer flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    Online rezervacija
                  </Label>
                </div>

                {activeFiltersCount > 0 && (
                  <Button
                    onClick={clearFilters}
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Očisti filtere
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="container mx-auto px-4 py-12">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'map')} className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-gray-600">
                Pronađeno <span className="font-semibold text-gray-900">{banje.length}</span> banja
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
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-56 w-full rounded-2xl" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  ))}
                </div>
              ) : banje.length === 0 ? (
                <div className="text-center py-16">
                  <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nema rezultata
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Pokušajte promijeniti filtere pretrage
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Očisti filtere
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {banje.map((banja) => (
                    <SpaCardSoft key={banja.id} banja={banja} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="map">
              <MapView
                items={banje.map(b => ({
                  id: b.id,
                  naziv: b.naziv,
                  adresa: b.adresa,
                  grad: b.grad,
                  telefon: b.telefon,
                  latitude: b.latitude,
                  longitude: b.longitude,
                  slug: b.slug,
                }))}
                itemType="banja"
                itemIcon={<Droplet className="h-5 w-5 text-blue-500" />}
                emptyMessage="Nema banja sa GPS koordinatama"
                height="550px"
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Edukativni sadržaj */}
        <div className="container mx-auto px-4 py-16 space-y-12">
          {/* Uvodni blok */}
          <Card className="border-2 border-blue-100">
            <CardHeader>
              <CardTitle className="text-3xl flex items-center gap-3">
                <Droplet className="w-8 h-8 text-blue-600" />
                Banje i rehabilitacija
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                Banjsko i rehabilitaciono liječenje predstavlja važan dio savremene zdravstvene zaštite. 
                Ovaj oblik terapije koristi prirodne ljekovite faktore poput termalnih i mineralnih voda, 
                ljekovitog blata i klimatskih uslova u kombinaciji sa medicinski vođenim rehabilitacionim programima.
              </p>
              <p>
                Banje i rehabilitacioni centri često se preporučuju kao nastavak liječenja, oporavak nakon 
                operacija ili povreda, kao i kod hroničnih oboljenja koja zahtijevaju dugoročnu terapiju i 
                očuvanje funkcionalnosti organizma.
              </p>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-lg mb-3 text-blue-900">
                  Cilj banjskog i rehabilitacionog liječenja nije samo ublažavanje simptoma, već:
                </h3>
                <ul className="space-y-2">
                  {[
                    'poboljšanje pokretljivosti i funkcionalnosti',
                    'smanjenje bola',
                    'ubrzanje oporavka',
                    'unapređenje kvaliteta života'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Kada se preporučuje */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Kada se preporučuje banjsko i rehabilitaciono liječenje</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Banjsko i rehabilitaciono liječenje najčešće se preporučuje:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  'nakon završenog akutnog bolničkog liječenja',
                  'u fazi oporavka poslije operacija ili povreda',
                  'kod hroničnih oboljenja lokomotornog sistema',
                  'kao podrška kod neuroloških, respiratornih i kardiovaskularnih stanja',
                  'kod dugotrajnih bolnih sindroma i smanjene pokretljivosti'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-gray-600 mt-4 italic">
                U većini slučajeva, optimalan efekat se postiže kada je rehabilitacija planirana i prilagođena 
                individualnom zdravstvenom stanju, uz prethodnu ili paralelnu konsultaciju sa ljekarom.
              </p>
            </CardContent>
          </Card>

          {/* Ko može imati korist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Ko može imati korist od banjskog i rehabilitacionog liječenja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'osobe sa hroničnim bolovima u zglobovima i kičmi',
                  'pacijente u postoperativnom oporavku',
                  'osobe nakon sportskih povreda',
                  'pacijente sa određenim neurološkim stanjima',
                  'osobe sa respiratornim problemima',
                  'starije osobe sa smanjenom pokretljivošću',
                  'osobe kojima je potreban kontrolisan i postepen povratak fizičkoj aktivnosti'
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <strong>Važno:</strong> Svaka terapija ima svoje indikacije i kontraindikacije, te se preporučuje individualna procjena.
              </p>
            </CardContent>
          </Card>

          {/* Vrste banja */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Vrste banja</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    naziv: 'Termalne banje',
                    opis: 'Koriste prirodno toplu vodu, bogatu mineralima. Najčešće se primjenjuju kod reumatskih oboljenja, bolnih sindroma i rehabilitacije lokomotornog sistema.'
                  },
                  {
                    naziv: 'Mineralne banje',
                    opis: 'Temelje terapiju na mineralnom sastavu vode. Koriste se kroz kupke, obloge ili druge balneoterapijske postupke.'
                  },
                  {
                    naziv: 'Sumporne banje',
                    opis: 'Posebna vrsta mineralnih banja, često povezane sa terapijom kožnih i reumatskih oboljenja.'
                  },
                  {
                    naziv: 'Klimatske banje',
                    opis: 'Primarni terapijski faktor je klima – nadmorska visina, kvalitet zraka i mikroklimatski uslovi. Često se koriste kod respiratornih stanja i oporavka.'
                  },
                  {
                    naziv: 'Banje sa ljekovitim blatom',
                    opis: 'Primjenjuju ljekovito blato u obliku obloga ili kupki, najčešće kod degenerativnih oboljenja zglobova i hroničnih bolova.'
                  },
                  {
                    naziv: 'Rehabilitacioni centri',
                    opis: 'Ustanove fokusirane na medicinsku rehabilitaciju uz stručni tim (fizijatar, fizioterapeuti), sa individualno prilagođenim programima.'
                  },
                  {
                    naziv: 'Lječilišta',
                    opis: 'Specijalizovane ustanove koje kombinuju prirodne terapijske faktore i medicinski nadzor u cilju liječenja i oporavka.'
                  }
                ].map((vrsta, i) => (
                  <div key={i} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <h4 className="font-semibold text-lg text-gray-900 mb-2">{vrsta.naziv}</h4>
                    <p className="text-sm text-gray-600">{vrsta.opis}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                Često postavljana pitanja
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Da li je za banjsko liječenje potreban uput ljekara?</AccordionTrigger>
                  <AccordionContent>
                    U mnogim slučajevima preporučuje se prethodna konsultacija sa ljekarom, posebno kod hroničnih 
                    ili složenih zdravstvenih stanja.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger>Koliko traje banjsko ili rehabilitaciono liječenje?</AccordionTrigger>
                  <AccordionContent>
                    Trajanje terapije zavisi od zdravstvenog stanja i individualnog plana, a može trajati od 
                    nekoliko dana do više sedmica.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger>Da li su banje namijenjene samo starijim osobama?</AccordionTrigger>
                  <AccordionContent>
                    Ne. Banjsko i rehabilitaciono liječenje koriste osobe svih životnih dobi, uključujući 
                    sportiste i osobe u postoperativnom oporavku.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger>Da li sve banje nude iste terapije?</AccordionTrigger>
                  <AccordionContent>
                    Ne. Terapije zavise od prirodnih resursa, opreme i stručnog kadra ustanove.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger>Mogu li se termini rezervisati online?</AccordionTrigger>
                  <AccordionContent>
                    Dostupnost online rezervacije zavisi od konkretne banje ili rehabilitacionog centra. 
                    Na našoj platformi možete filtrirati banje koje nude online rezervaciju.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
}
