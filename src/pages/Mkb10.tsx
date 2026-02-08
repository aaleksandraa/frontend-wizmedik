import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Search, BookOpen, ChevronRight, FileText, Activity, Heart,
  Brain, Eye, Ear, Wind, Utensils, Bone, Baby, AlertTriangle,
  Bug, Droplet, Zap, Filter, Layers, HelpCircle, Bookmark,
  AlertOctagon, ClipboardList, Loader2, X, Home, ChevronDown
} from 'lucide-react';
import api from '@/services/api';

interface Kategorija {
  id: number;
  kod_od: string;
  kod_do: string;
  naziv: string;
  opis?: string;
  boja?: string;
  ikona?: string;
  dijagnoze_count: number;
}

interface Dijagnoza {
  id: number;
  kod: string;
  naziv: string;
  naziv_lat?: string;
  opis?: string;
  kategorija?: {
    id: number;
    kod_od: string;
    naziv: string;
  };
}

interface Statistika {
  ukupno_kategorija: number;
  ukupno_dijagnoza: number;
}

interface Mkb10Settings {
  show_category_name_in_tabs: boolean;
}

const ikonaMap: { [key: string]: React.ReactNode } = {
  'bug': <Bug className="h-5 w-5" aria-hidden="true" />,
  'activity': <Activity className="h-5 w-5" aria-hidden="true" />,
  'droplet': <Droplet className="h-5 w-5" aria-hidden="true" />,
  'zap': <Zap className="h-5 w-5" aria-hidden="true" />,
  'brain': <Brain className="h-5 w-5" aria-hidden="true" />,
  'cpu': <Brain className="h-5 w-5" aria-hidden="true" />,
  'eye': <Eye className="h-5 w-5" aria-hidden="true" />,
  'ear': <Ear className="h-5 w-5" aria-hidden="true" />,
  'heart': <Heart className="h-5 w-5" aria-hidden="true" />,
  'wind': <Wind className="h-5 w-5" aria-hidden="true" />,
  'utensils': <Utensils className="h-5 w-5" aria-hidden="true" />,
  'layers': <Layers className="h-5 w-5" aria-hidden="true" />,
  'bone': <Bone className="h-5 w-5" aria-hidden="true" />,
  'filter': <Filter className="h-5 w-5" aria-hidden="true" />,
  'baby': <Baby className="h-5 w-5" aria-hidden="true" />,
  'dna': <Activity className="h-5 w-5" aria-hidden="true" />,
  'help-circle': <HelpCircle className="h-5 w-5" aria-hidden="true" />,
  'alert-triangle': <AlertTriangle className="h-5 w-5" aria-hidden="true" />,
  'bookmark': <Bookmark className="h-5 w-5" aria-hidden="true" />,
  'alert-octagon': <AlertOctagon className="h-5 w-5" aria-hidden="true" />,
  'clipboard-list': <ClipboardList className="h-5 w-5" aria-hidden="true" />,
};

// FAQ podaci za SEO
const faqData = [
  {
    pitanje: "Šta je MKB-10 klasifikacija?",
    odgovor: "MKB-10 (Međunarodna klasifikacija bolesti, deseta revizija) je međunarodni standard za klasifikaciju bolesti i zdravstvenih problema. Koristi se u cijelom svijetu za statističke svrhe, praćenje zdravstvenog stanja populacije i medicinsku dokumentaciju."
  },
  {
    pitanje: "Kako pronaći šifru bolesti u MKB-10?",
    odgovor: "Šifru bolesti možete pronaći na dva načina: 1) Pretragom po nazivu bolesti ili simptoma u polje za pretragu, 2) Pregledanjem kategorija - odaberite odgovarajuću kategoriju (npr. bolesti srca su u kategoriji I00-I99) i pronađite specifičnu dijagnozu."
  },
  {
    pitanje: "Koliko kategorija ima MKB-10?",
    odgovor: "MKB-10 ima 22 glavne kategorije koje pokrivaju sve vrste bolesti, od zaraznih bolesti (A00-B99) do faktora koji utiču na zdravstveno stanje (Z00-Z99). Svaka kategorija sadrži specifične dijagnoze sa jedinstvenim šiframa."
  },
  {
    pitanje: "Zašto ljekari koriste MKB-10 šifre?",
    odgovor: "Ljekari koriste MKB-10 šifre za preciznu dokumentaciju dijagnoza, komunikaciju sa drugim zdravstvenim radnicima, izvještavanje zdravstvenim fondovima i osiguravajućim društvima, te za statističko praćenje bolesti."
  },
  {
    pitanje: "Koja je razlika između MKB-10 i MKB-11?",
    odgovor: "MKB-11 je novija verzija klasifikacije objavljena 2019. godine. Donosi modernizovanu strukturu, nove dijagnoze i bolju usklađenost sa savremenom medicinskom praksom. Većina zemalja još uvijek koristi MKB-10, dok se prelazak na MKB-11 postepeno uvodi."
  }
];

export default function Mkb10() {
  const [kategorije, setKategorije] = useState<Kategorija[]>([]);
  const [dijagnoze, setDijagnoze] = useState<Dijagnoza[]>([]);
  const [statistika, setStatistika] = useState<Statistika | null>(null);
  const [settings, setSettings] = useState<Mkb10Settings>({ show_category_name_in_tabs: true });
  const [loading, setLoading] = useState(true);
  const [loadingDijagnoze, setLoadingDijagnoze] = useState(false);
  const [activeKategorija, setActiveKategorija] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Dijagnoza[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedDijagnoza, setSelectedDijagnoza] = useState<Dijagnoza | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeKategorija) {
      loadDijagnoze(parseInt(activeKategorija));
    }
  }, [activeKategorija]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const loadData = async () => {
    try {
      const [katRes, statRes] = await Promise.all([
        api.get('/mkb10/kategorije'),
        api.get('/mkb10/statistika'),
      ]);
      
      // Učitaj settings odvojeno sa boljim error handlingom
      try {
        const settingsRes = await api.get('/mkb10/settings');
        console.log('MKB10 settings response:', settingsRes.data);
        if (settingsRes.data.success && settingsRes.data.data) {
          setSettings(settingsRes.data.data);
        }
      } catch (settingsError) {
        console.error('Greška pri učitavanju MKB10 settings:', settingsError);
        // Koristi default vrijednost
        setSettings({ show_category_name_in_tabs: true });
      }
      
      if (katRes.data.success) {
        setKategorije(katRes.data.data);
        if (katRes.data.data.length > 0) {
          setActiveKategorija(katRes.data.data[0].id.toString());
        }
      }
      if (statRes.data.success) {
        setStatistika(statRes.data.data);
      }
    } catch (error) {
      console.error('Greška pri učitavanju:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDijagnoze = async (kategorijaId: number) => {
    setLoadingDijagnoze(true);
    try {
      const res = await api.get('/mkb10/dijagnoze', {
        params: { kategorija_id: kategorijaId, per_page: 100 }
      });
      if (res.data.success) {
        setDijagnoze(res.data.data.data || []);
      }
    } catch (error) {
      console.error('Greška pri učitavanju dijagnoza:', error);
    } finally {
      setLoadingDijagnoze(false);
    }
  };

  const performSearch = async () => {
    setSearching(true);
    try {
      const res = await api.get('/mkb10/pretraga', { params: { q: searchTerm } });
      if (res.data.success) {
        setSearchResults(res.data.data);
      }
    } catch (error) {
      console.error('Greška pri pretrazi:', error);
    } finally {
      setSearching(false);
    }
  };

  const getIkona = (ikona?: string) => {
    if (!ikona) return <FileText className="h-5 w-5" aria-hidden="true" />;
    return ikonaMap[ikona] || <FileText className="h-5 w-5" aria-hidden="true" />;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const activeKat = kategorije.find(k => k.id.toString() === activeKategorija);

  // Schema.org strukturirani podaci
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalWebPage",
        "@id": "https://wizmedik.com/mkb-10#webpage",
        "url": "https://wizmedik.com/mkb-10",
        "name": "MKB-10 Šifarnik bolesti - Međunarodna klasifikacija bolesti",
        "description": "Kompletna MKB-10 klasifikacija bolesti na srpskom jeziku. Pretražujte preko 14.000 dijagnoza po šifri ili nazivu. Besplatna online baza medicinskih dijagnoza.",
        "inLanguage": "sr-Latn-BA",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://wizmedik.com/#website",
          "url": "https://wizmedik.com",
          "name": "WizMedik",
          "description": "Zdravstveni portal Bosne i Hercegovine"
        },
        "about": {
          "@type": "MedicalCode",
          "codingSystem": "ICD-10",
          "name": "Međunarodna klasifikacija bolesti - deseta revizija"
        },
        "specialty": {
          "@type": "MedicalSpecialty",
          "name": "Medicinska klasifikacija"
        },
        "audience": {
          "@type": "MedicalAudience",
          "audienceType": "Ljekari, medicinske sestre, zdravstveni radnici, pacijenti"
        },
        "lastReviewed": new Date().toISOString().split('T')[0],
        "reviewedBy": {
          "@type": "Organization",
          "name": "WizMedik"
        }
      },
      {
        "@type": "Dataset",
        "@id": "https://wizmedik.com/mkb-10#dataset",
        "name": "MKB-10 Baza dijagnoza",
        "description": `Kompletna baza MKB-10 dijagnoza sa ${statistika?.ukupno_kategorija || 22} kategorija i ${statistika?.ukupno_dijagnoza?.toLocaleString() || '14.000+'} dijagnoza`,
        "keywords": ["MKB-10", "ICD-10", "dijagnoze", "bolesti", "medicinska klasifikacija", "šifre bolesti"],
        "license": "https://creativecommons.org/licenses/by/4.0/",
        "creator": {
          "@type": "Organization",
          "name": "Svjetska zdravstvena organizacija (WHO)"
        },
        "distribution": {
          "@type": "DataDownload",
          "encodingFormat": "text/html",
          "contentUrl": "https://wizmedik.com/mkb-10"
        }
      },
      {
        "@type": "BreadcrumbList",
        "@id": "https://wizmedik.com/mkb-10#breadcrumb",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Početna",
            "item": "https://wizmedik.com"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "MKB-10 Šifarnik bolesti",
            "item": "https://wizmedik.com/mkb-10"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": "https://wizmedik.com/mkb-10#faq",
        "mainEntity": faqData.map(faq => ({
          "@type": "Question",
          "name": faq.pitanje,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.odgovor
          }
        }))
      }
    ]
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-gray-50 p-8" role="main">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-12 w-96 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-96" />
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        {/* Osnovni meta tagovi */}
        <title>MKB-10 Šifarnik bolesti | Međunarodna klasifikacija bolesti - WizMedik</title>
        <meta name="description" content="Kompletna MKB-10 klasifikacija bolesti na srpskom jeziku. Pretražujte preko 14.000 dijagnoza po šifri ili nazivu. Besplatna online baza medicinskih dijagnoza sa 22 kategorije." />
        <meta name="keywords" content="MKB-10, MKB 10, ICD-10, šifarnik bolesti, klasifikacija bolesti, dijagnoze, medicinske šifre, bolesti, zdravlje, medicina, A00-B99, zarazne bolesti, tumori, kardiovaskularne bolesti" />
        <meta name="author" content="WizMedik" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href="https://wizmedik.com/mkb-10" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://wizmedik.com/mkb-10" />
        <meta property="og:title" content="MKB-10 Šifarnik bolesti | Međunarodna klasifikacija bolesti" />
        <meta property="og:description" content="Kompletna MKB-10 klasifikacija bolesti na srpskom jeziku. Pretražujte preko 14.000 dijagnoza po šifri ili nazivu." />
        <meta property="og:image" content="https://wizmedik.com/images/mkb10-og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="sr_BA" />
        <meta property="og:site_name" content="WizMedik" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://wizmedik.com/mkb-10" />
        <meta name="twitter:title" content="MKB-10 Šifarnik bolesti | Međunarodna klasifikacija bolesti" />
        <meta name="twitter:description" content="Kompletna MKB-10 klasifikacija bolesti na srpskom jeziku. Pretražujte preko 14.000 dijagnoza." />
        <meta name="twitter:image" content="https://wizmedik.com/images/mkb10-twitter.jpg" />
        
        {/* Dodatni SEO meta tagovi */}
        <meta name="language" content="sr-Latn-BA" />
        <meta name="geo.region" content="BA" />
        <meta name="geo.placename" content="Bosna i Hercegovina" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-indigo-50" role="main">
        {/* Breadcrumbs navigacija */}
        <nav aria-label="Breadcrumb" className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <Link to="/" className="text-muted-foreground hover:text-primary flex items-center" itemProp="item">
                  <Home className="h-4 w-4 mr-1" aria-hidden="true" />
                  <span itemProp="name">Početna</span>
                </Link>
                <meta itemProp="position" content="1" />
              </li>
              <li className="text-muted-foreground">/</li>
              <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                <span className="text-foreground font-medium" itemProp="name">MKB-10 Šifarnik bolesti</span>
                <meta itemProp="position" content="2" />
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero sekcija sa semantičkim HTML */}
        <header className="bg-gradient-to-r from-cyan-600 to-indigo-700 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="h-10 w-10" aria-hidden="true" />
              <h1 className="text-3xl md:text-4xl font-bold">
                MKB-10 Šifarnik bolesti
              </h1>
            </div>
            <p className="text-cyan-100 text-lg max-w-3xl">
              <strong>Međunarodna klasifikacija bolesti</strong> - deseta revizija (ICD-10). 
              Kompletna baza medicinskih dijagnoza na srpskom jeziku. 
              Pretražujte dijagnoze po šifri ili nazivu bolesti.
            </p>

            {/* Statistika sa semantičkim oznakama */}
            {statistika && (
              <div className="flex flex-wrap gap-6 mt-6" role="group" aria-label="Statistika MKB-10 baze">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold">{statistika.ukupno_kategorija}</span>
                  <span className="text-cyan-200 ml-2">kategorija</span>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <span className="text-2xl font-bold">{statistika.ukupno_dijagnoza.toLocaleString()}</span>
                  <span className="text-cyan-200 ml-2">dijagnoza</span>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Glavni sadržaj */}
        <article className="max-w-7xl mx-auto px-4 py-8">
          {/* Uvodni tekst za SEO */}
          <section className="mb-8 max-w-none" aria-labelledby="intro-heading">
            <h2 id="intro-heading" className="sr-only">O MKB-10 klasifikaciji</h2>
            <p className="text-muted-foreground leading-relaxed text-base max-w-none">
              <strong>MKB-10</strong> (Međunarodna klasifikacija bolesti, deseta revizija) je standardizovani sistem 
              za klasifikaciju bolesti i zdravstvenih problema koji koriste ljekari i zdravstvene ustanove širom svijeta. 
              Ova klasifikacija omogućava precizno kodiranje dijagnoza, što je neophodno za medicinsku dokumentaciju, 
              statističko praćenje i komunikaciju između zdravstvenih radnika.
            </p>
          </section>

          {/* Pretraga */}
          <section aria-labelledby="search-heading" className="mb-8">
            <h2 id="search-heading" className="sr-only">Pretraga dijagnoza</h2>
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <label htmlFor="mkb10-search" className="sr-only">Pretražite MKB-10 dijagnoze</label>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
                  <Input
                    id="mkb10-search"
                    placeholder="Pretražite po šifri ili nazivu dijagnoze (npr. A00 ili kolera)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10 h-12 text-lg"
                    aria-describedby="search-help"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={clearSearch}
                      aria-label="Obriši pretragu"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
                <p id="search-help" className="text-xs text-muted-foreground mt-2">
                  Unesite najmanje 2 karaktera za pretragu. Možete pretraživati po MKB-10 šifri (npr. J06.9) ili nazivu bolesti.
                </p>

                {/* Rezultati pretrage */}
                {searchTerm.length >= 2 && (
                  <div className="mt-4" role="region" aria-live="polite" aria-label="Rezultati pretrage">
                    {searching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
                        <span className="ml-2">Pretraživanje...</span>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        <p className="text-sm text-muted-foreground mb-2">
                          Pronađeno <strong>{searchResults.length}</strong> rezultata za "{searchTerm}"
                        </p>
                        {searchResults.map((dijagnoza) => (
                          <div
                            key={dijagnoza.id}
                            className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => setSelectedDijagnoza(dijagnoza)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && setSelectedDijagnoza(dijagnoza)}
                          >
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="font-mono shrink-0">
                                {dijagnoza.kod}
                              </Badge>
                              <div>
                                <p className="font-medium">{dijagnoza.naziv}</p>
                                {dijagnoza.naziv_lat && (
                                  <p className="text-sm text-muted-foreground italic">
                                    {dijagnoza.naziv_lat}
                                  </p>
                                )}
                                {dijagnoza.kategorija && (
                                  <p className="text-xs text-cyan-600 mt-1">
                                    Kategorija: {dijagnoza.kategorija.kod_od} - {dijagnoza.kategorija.naziv}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Nema rezultata za "{searchTerm}". Pokušajte sa drugim pojmom.
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Kategorije i dijagnoze */}
          {!searchTerm && (
            <section aria-labelledby="categories-heading">
              <h2 id="categories-heading" className="text-2xl font-bold mb-6">
                Kategorije MKB-10 klasifikacije
              </h2>
              
              <Tabs value={activeKategorija} onValueChange={setActiveKategorija}>
                <ScrollArea className="w-full">
                  <TabsList 
                    className={`h-auto bg-transparent p-0 mb-6 ${
                      settings.show_category_name_in_tabs 
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2' 
                        : 'flex flex-wrap gap-2'
                    }`}
                    aria-label="MKB-10 kategorije"
                  >
                    {kategorije.map((kat) => (
                      <TabsTrigger
                        key={kat.id}
                        value={kat.id.toString()}
                        className={`data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-3 py-2 rounded-lg border ${
                          settings.show_category_name_in_tabs ? 'w-full justify-start' : ''
                        }`}
                        style={{
                          borderColor: kat.boja || '#e5e7eb',
                          backgroundColor: activeKategorija === kat.id.toString() ? kat.boja : 'white',
                        }}
                        aria-label={`${kat.kod_od}-${kat.kod_do}: ${kat.naziv}`}
                      >
                        <span className={`flex items-center gap-2 ${settings.show_category_name_in_tabs ? 'w-full' : ''}`}>
                          {getIkona(kat.ikona)}
                          <span className="font-mono text-xs shrink-0">{kat.kod_od}-{kat.kod_do}</span>
                          {settings.show_category_name_in_tabs && (
                            <span className="text-xs truncate flex-1 text-left">{kat.naziv}</span>
                          )}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>

                {kategorije.map((kat) => (
                  <TabsContent key={kat.id} value={kat.id.toString()}>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      {/* Lijeva strana - Info o kategoriji i podkategorije */}
                      <aside className="lg:col-span-1 space-y-4">
                        <Card style={{ borderTopColor: kat.boja, borderTopWidth: '4px' }}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2" style={{ color: kat.boja }}>
                              {getIkona(kat.ikona)}
                              <span className="font-mono font-bold">{kat.kod_od}-{kat.kod_do}</span>
                            </div>
                            <CardTitle className="text-lg">{kat.naziv}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {kat.opis && (
                              <p className="text-sm text-muted-foreground mb-3">{kat.opis}</p>
                            )}
                            <div className="text-sm">
                              <span><strong>{kat.dijagnoze_count}</strong> dijagnoza</span>
                            </div>
                          </CardContent>
                        </Card>
                      </aside>

                      {/* Desna strana - Lista dijagnoza */}
                      <div className="lg:col-span-3">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <span>Dijagnoze u kategoriji {kat.kod_od}-{kat.kod_do}</span>
                              <Badge variant="secondary">{dijagnoze.length}</Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {loadingDijagnoze ? (
                              <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
                                <span className="sr-only">Učitavanje dijagnoza...</span>
                              </div>
                            ) : dijagnoze.length > 0 ? (
                              <ScrollArea className="h-[600px]">
                                <ul className="space-y-2 pr-4" role="list" aria-label="Lista dijagnoza">
                                  {dijagnoze.map((dij) => (
                                    <li key={dij.id}>
                                      <div
                                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                                        onClick={() => setSelectedDijagnoza(dij)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && setSelectedDijagnoza(dij)}
                                        aria-label={`${dij.kod}: ${dij.naziv}`}
                                      >
                                        <div className="flex items-start gap-3">
                                          <Badge 
                                            variant="outline" 
                                            className="font-mono shrink-0 group-hover:bg-primary group-hover:text-primary-foreground"
                                          >
                                            {dij.kod}
                                          </Badge>
                                          <div className="flex-1 min-w-0">
                                            <p className="font-medium">{dij.naziv}</p>
                                            {dij.naziv_lat && (
                                              <p className="text-sm text-muted-foreground italic truncate">
                                                {dij.naziv_lat}
                                              </p>
                                            )}
                                          </div>
                                          <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              </ScrollArea>
                            ) : (
                              <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                                <p>Nema dijagnoza u ovoj kategoriji</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>
          )}

          {/* Pregled svih kategorija za SEO */}
          <section className="mt-12" aria-labelledby="all-categories-heading">
            <h2 id="all-categories-heading" className="text-2xl font-bold mb-6">
              Sve MKB-10 kategorije bolesti
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {kategorije.map((kat) => (
                <Card 
                  key={kat.id} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setActiveKategorija(kat.id.toString())}
                  style={{ borderLeftColor: kat.boja, borderLeftWidth: '4px' }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div style={{ color: kat.boja }}>
                        {getIkona(kat.ikona)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm font-bold" style={{ color: kat.boja }}>
                          {kat.kod_od}-{kat.kod_do}
                        </p>
                        <h3 className="font-medium text-sm line-clamp-2">{kat.naziv}</h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {kat.dijagnoze_count} dijagnoza
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* FAQ sekcija za SEO */}
          <section className="mt-12" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-bold mb-6">
              Često postavljana pitanja o MKB-10
            </h2>
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">
                        <span className="font-medium">{faq.pitanje}</span>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.odgovor}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>

          {/* Dodatni SEO sadržaj */}
          <section className="mt-12 max-w-none" aria-labelledby="about-mkb10">
            <h2 id="about-mkb10" className="text-2xl font-bold mb-4">
              O Međunarodnoj klasifikaciji bolesti MKB-10
            </h2>
            <div className="bg-cyan-50 rounded-lg p-6 text-muted-foreground max-w-none">
              <p className="mb-4">
                <strong>Međunarodna klasifikacija bolesti (MKB)</strong>, poznata i kao ICD (International Classification of Diseases), 
                je globalni standard za dijagnostičku klasifikaciju koji je razvila Svjetska zdravstvena organizacija (WHO). 
                Deseta revizija (MKB-10) je trenutno najšire korištena verzija u zdravstvenim sistemima širom svijeta.
              </p>
              <p className="mb-4">
                MKB-10 klasifikacija se koristi za:
              </p>
              <ul className="list-disc list-inside mb-4 space-y-1">
                <li>Standardizovano kodiranje dijagnoza u medicinskoj dokumentaciji</li>
                <li>Statističko praćenje morbiditeta i mortaliteta</li>
                <li>Komunikaciju između zdravstvenih ustanova</li>
                <li>Izvještavanje zdravstvenim fondovima i osiguravajućim društvima</li>
                <li>Epidemiološka istraživanja i javnozdravstveno planiranje</li>
              </ul>
              <p>
                Naša baza sadrži kompletnu MKB-10 klasifikaciju na srpskom jeziku (ijekavica), 
                uključujući sve kategorije i pojedinačne dijagnoze sa šiframa i opisima.
              </p>
            </div>
          </section>
        </article>

        {/* Modal za detalje dijagnoze */}
        {selectedDijagnoza && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDijagnoza(null)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dijagnoza-title"
          >
            <Card 
              className="max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="font-mono text-lg mb-2">{selectedDijagnoza.kod}</Badge>
                    <CardTitle id="dijagnoza-title" className="text-xl">{selectedDijagnoza.naziv}</CardTitle>
                    {selectedDijagnoza.naziv_lat && (
                      <p className="text-muted-foreground italic mt-1">{selectedDijagnoza.naziv_lat}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDijagnoza(null)}
                    aria-label="Zatvori"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDijagnoza.kategorija && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kategorija</p>
                    <p>{selectedDijagnoza.kategorija.kod_od} - {selectedDijagnoza.kategorija.naziv}</p>
                  </div>
                )}
                {selectedDijagnoza.opis && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Opis</p>
                    <p>{selectedDijagnoza.opis}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
