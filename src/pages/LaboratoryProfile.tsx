import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { 
  FlaskConical, MapPin, Phone, Mail, Clock, Star, 
  CheckCircle, Search, Package, Image as ImageIcon,
  Calendar, Download, AlertCircle, Globe, ExternalLink, X, Navigation
} from 'lucide-react';
import { laboratoriesAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { LocationMapCard } from '@/components/LocationMapCard';

interface Laboratory {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  adresa: string;
  telefon: string;
  email: string;
  website?: string;
  opis: string;
  featured_slika?: string;
  profilna_slika?: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  verified: boolean;
  active: boolean;
  online_rezultati: boolean;
  radno_vrijeme?: any;
  galerija?: string[];
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
}

interface Analiza {
  id: number;
  naziv: string;
  kategorija: { naziv: string; slug: string };
  cijena: number;
  akcijska_cijena?: number;
  opis?: string;
  vrijeme_rezultata?: string;
  priprema?: string;
}

interface Paket {
  id: number;
  naziv: string;
  opis?: string;
  cijena: number;
  ustedite: number;
  prikazi_ustedite: boolean;
  analize_ids: number[];
  analize?: Analiza[];
}

export default function LaboratoryProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [analize, setAnalize] = useState<Analiza[]>([]);
  const [paketi, setPaketi] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchAnaliza, setSearchAnaliza] = useState('');
  const [selectedKategorija, setSelectedKategorija] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchLaboratory();
    }
  }, [slug]);

  const fetchLaboratory = async () => {
    setLoading(true);
    try {
      const labRes = await laboratoriesAPI.getBySlug(slug!);
      const lab = labRes.data;
      setLaboratory(lab);

      // Fetch analyses and packages
      const [analizeRes, paketiRes] = await Promise.all([
        laboratoriesAPI.getAnalize(lab.id),
        laboratoriesAPI.getPaketi(lab.id),
      ]);

      const analizeData = analizeRes.data.analize || analizeRes.data || [];
      const paketiData = paketiRes.data.paketi || paketiRes.data || [];
      
      // Map analize_ids to actual analize objects for each paket
      const paketiWithAnalize = paketiData.map((paket: Paket) => ({
        ...paket,
        analize: (paket.analize_ids || [])
          .map((id: number) => analizeData.find((a: Analiza) => a.id === id))
          .filter(Boolean) // Remove undefined values
      }));
      
      setAnalize(analizeData);
      setPaketi(paketiWithAnalize);
    } catch (error) {
      console.error('Error fetching laboratory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnalize = analize.filter((analiza) => {
    const matchesSearch = analiza.naziv.toLowerCase().includes(searchAnaliza.toLowerCase());
    const matchesKategorija = !selectedKategorija || analiza.kategorija.slug === selectedKategorija;
    return matchesSearch && matchesKategorija;
  });

  const kategorije = Array.from(new Set(analize.map(a => a.kategorija.slug)))
    .map(slug => analize.find(a => a.kategorija.slug === slug)?.kategorija)
    .filter(Boolean);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>
        <Footer />
      </>
    );
  }

  if (!laboratory) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <FlaskConical className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Laboratorija nije pronađena</h2>
          <p className="text-gray-600 mb-8">Tražena laboratorija ne postoji ili je uklonjena</p>
          <Link to="/laboratorije">
            <Button>Nazad na listu</Button>
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const dani = ['ponedeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota', 'nedjelja'];

  return (
    <>
      <Helmet>
        <title>{laboratory.naziv} - Laboratorija | wizMedik</title>
        <meta name="description" content={laboratory.opis || `${laboratory.naziv} - Medicinska laboratorija u ${laboratory.grad}u`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Navbar />

        {/* Hero Section with Featured Image */}
        <section className="relative pt-16 md:pt-20">
          {laboratory.featured_slika ? (
            <div className="h-48 md:h-64 overflow-hidden">
              <img
                src={laboratory.featured_slika}
                alt={laboratory.naziv}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            </div>
          ) : (
            <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5" />
          )}

          <div className="container mx-auto px-4">
            <div className="relative -mt-20 md:-mt-24">
              <Card className="shadow-2xl border-2">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Profile Image - Use Featured Image */}
                    <div className="flex-shrink-0">
                      {laboratory.featured_slika ? (
                        <img
                          src={laboratory.featured_slika}
                          alt={laboratory.naziv}
                          className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover shadow-xl ring-4 ring-white"
                        />
                      ) : (
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-xl ring-4 ring-white">
                          <FlaskConical className="w-12 h-12 md:w-14 md:h-14 text-white" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {laboratory.naziv}
                          </h1>
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            {laboratory.verified && (
                              <Badge className="gap-1 text-xs">
                                <CheckCircle className="w-3 h-3" />
                                Verifikovano
                              </Badge>
                            )}
                            {laboratory.online_rezultati && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <Download className="w-3 h-3" />
                                Online rezultati
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating */}
                      {laboratory.broj_recenzija > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span className="text-lg md:text-xl font-bold text-gray-900">{Number(laboratory.prosjecna_ocjena).toFixed(1)}</span>
                          </div>
                          <span className="text-sm text-gray-600">
                            ({laboratory.broj_recenzija} {laboratory.broj_recenzija === 1 ? 'recenzija' : 'recenzija'})
                          </span>
                        </div>
                      )}

                      {/* Contact Info - FIXED ALIGNMENT */}
                      <div className="grid gap-2 md:gap-3">
                        <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                          <span className="break-words">{laboratory.adresa}, {laboratory.grad}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                          <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                          <a href={`tel:${laboratory.telefon}`} className="hover:text-primary transition-colors">
                            {laboratory.telefon}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                          <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                          <a href={`mailto:${laboratory.email}`} className="hover:text-primary transition-colors break-all">
                            {laboratory.email}
                          </a>
                        </div>
                        {laboratory.website && (
                          <div className="flex items-center gap-3 text-sm md:text-base text-gray-700">
                            <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                            <a 
                              href={laboratory.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="hover:text-primary transition-colors flex items-center gap-1"
                            >
                              Web stranica
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 md:py-8">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="analize" className="space-y-4 md:space-y-6">
              <TabsList className="grid w-full grid-cols-4 max-w-2xl">
                <TabsTrigger value="analize" className="text-xs md:text-sm">Analize</TabsTrigger>
                <TabsTrigger value="paketi" className="text-xs md:text-sm">Paketi</TabsTrigger>
                <TabsTrigger value="info" className="text-xs md:text-sm">Info</TabsTrigger>
                <TabsTrigger value="galerija" className="text-xs md:text-sm">Galerija</TabsTrigger>
              </TabsList>

              {/* Analize Tab */}
              <TabsContent value="analize" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FlaskConical className="w-5 h-5" />
                      Analize ({analize.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input
                          placeholder="Pretraži analize..."
                          value={searchAnaliza}
                          onChange={(e) => setSearchAnaliza(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Categories Filter */}
                    {kategorije.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant={selectedKategorija === '' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedKategorija('')}
                          className="rounded-full"
                        >
                          Sve
                        </Button>
                        {kategorije.map((kat) => (
                          <Button
                            key={kat!.slug}
                            variant={selectedKategorija === kat!.slug ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedKategorija(kat!.slug)}
                            className="rounded-full"
                          >
                            {kat!.naziv}
                          </Button>
                        ))}
                      </div>
                    )}

                    {/* Analize List */}
                    {filteredAnalize.length === 0 ? (
                      <div className="text-center py-12">
                        <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Nema analiza</p>
                      </div>
                    ) : (
                      <div className="grid gap-4">
                        {filteredAnalize.map((analiza) => (
                          <motion.div
                            key={analiza.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-gray-900">{analiza.naziv}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {analiza.kategorija.naziv}
                                  </Badge>
                                </div>
                                {analiza.opis && (
                                  <p className="text-sm text-gray-600 mb-2">{analiza.opis}</p>
                                )}
                                <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                                  {analiza.vrijeme_rezultata && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{analiza.vrijeme_rezultata}</span>
                                    </div>
                                  )}
                                  {analiza.priprema && (
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="w-4 h-4" />
                                      <span>{analiza.priprema}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right ml-4">
                                {analiza.akcijska_cijena ? (
                                  <>
                                    <div className="text-sm text-gray-500 line-through">
                                      {Number(analiza.cijena).toFixed(2)} KM
                                    </div>
                                    <div className="text-xl font-bold text-primary">
                                      {Number(analiza.akcijska_cijena).toFixed(2)} KM
                                    </div>
                                    <Badge variant="destructive" className="text-xs mt-1">Akcija</Badge>
                                  </>
                                ) : (
                                  <div className="text-xl font-bold text-gray-900">
                                    {Number(analiza.cijena).toFixed(2)} KM
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Paketi Tab - REDESIGNED */}
              <TabsContent value="paketi" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Paketi Analiza ({paketi.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paketi.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Nema dostupnih paketa</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-6">
                        {paketi.map((paket) => (
                          <motion.div
                            key={paket.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 h-full">
                              <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{paket.naziv}</h3>
                                    {paket.opis && (
                                      <p className="text-sm text-gray-600 mb-3">{paket.opis}</p>
                                    )}
                                  </div>
                                </div>

                                {/* Price Section */}
                                <div className="mb-4 pb-4 border-b">
                                  <div className="flex items-center gap-3">
                                    <div className="text-3xl font-bold text-primary">
                                      {Number(paket.cijena).toFixed(2)} KM
                                    </div>
                                    {paket.prikazi_ustedite && paket.ustedite > 0 && (
                                      <Badge variant="destructive" className="text-sm">
                                        Uštedite {Number(paket.ustedite).toFixed(2)} KM
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Analyses List */}
                                <div className="space-y-3 mb-4">
                                  <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-primary" />
                                    Uključene analize ({(paket.analize || []).length}):
                                  </p>
                                  <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                                    {(paket.analize || []).map((analiza) => (
                                      <div 
                                        key={analiza.id} 
                                        className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                      >
                                        <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900">{analiza.naziv}</p>
                                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                                            <span>{analiza.kategorija.naziv}</span>
                                            <span>•</span>
                                            <span className="font-medium">{Number(analiza.cijena).toFixed(2)} KM</span>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Contact Button */}
                                <Button className="w-full" size="lg">
                                  <Phone className="w-4 h-4 mr-2" />
                                  Kontaktiraj
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>O Laboratoriji</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {laboratory.opis && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Opis</h3>
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">{laboratory.opis}</p>
                      </div>
                    )}

                    {/* Working Hours */}
                    {laboratory.radno_vrijeme && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          Radno Vrijeme
                        </h3>
                        <div className="space-y-2">
                          {dani.map((dan) => {
                            const rv = laboratory.radno_vrijeme?.[dan];
                            return (
                              <div key={dan} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                                <span className="font-medium text-gray-700 capitalize">{dan}</span>
                                {rv?.closed ? (
                                  <span className="text-gray-500">Zatvoreno</span>
                                ) : rv?.open && rv?.close ? (
                                  <span className="text-gray-900 font-medium">{rv.open} - {rv.close}</span>
                                ) : (
                                  <span className="text-gray-400">Nije postavljeno</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Location Map */}
                <LocationMapCard
                  naziv={laboratory.naziv}
                  adresa={laboratory.adresa}
                  grad={laboratory.grad}
                  latitude={laboratory.latitude}
                  longitude={laboratory.longitude}
                  googleMapsLink={laboratory.google_maps_link}
                  markerColor="violet"
                />
              </TabsContent>

              {/* Galerija Tab - REDESIGNED */}
              <TabsContent value="galerija">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Galerija ({laboratory.galerija?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!laboratory.galerija || laboratory.galerija.length === 0 ? (
                      <div className="text-center py-12">
                        <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">Nema slika u galeriji</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {laboratory.galerija.map((slika: string, index: number) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                            onClick={() => setSelectedImage(slika)}
                          >
                            <img
                              src={slika}
                              alt={`${laboratory.naziv} - Slika ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                              <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Image Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={selectedImage}
              alt="Prikaz slike"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        <Footer />
      </div>
    </>
  );
}
