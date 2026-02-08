import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, Phone, Mail, Globe, Heart, Bed, Calendar, 
  Droplet, Clock, CheckCircle, Send, MessageSquare, ArrowLeft,
  Shield, Navigation
} from 'lucide-react';
import { spasAPI } from '@/services/api';
import { Banja, BanjaUpitFormData } from '@/types/spa';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { ImageLightbox } from '@/components/ImageLightbox';
import { LocationMapCard } from '@/components/LocationMapCard';
import { toast } from 'sonner';

export default function SpaProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [banja, setBanja] = useState<Banja | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpitForm, setShowUpitForm] = useState(false);
  // Review functionality disabled for now
  // const [showRecenzijaForm, setShowRecenzijaForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const [upitForm, setUpitForm] = useState<BanjaUpitFormData>({
    ime: '',
    email: '',
    telefon: '',
    poruka: '',
    datum_dolaska: '',
    broj_osoba: undefined,
    tip: 'upit',
  });

  // Review form disabled for now
  // const [recenzijaForm, setRecenzijaForm] = useState<BanjaRecenzijaFormData>({
  //   ocjena: 5,
  //   komentar: '',
  //   ime: '',
  // });

  useEffect(() => {
    if (slug) {
      loadBanja();
    }
  }, [slug]);

  // Helper function to normalize image URLs
  const normalizeImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/storage/')) {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      return `${API_BASE}${url}`;
    }
    return url;
  };

  const loadBanja = async () => {
    setLoading(true);
    try {
      const response = await spasAPI.getBySlug(slug!);
      // API returns { success: true, data: {...} }
      setBanja(response.data.data || response.data);
    } catch (error) {
      console.error('Error loading banja:', error);
      toast.error('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleUpitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banja) return;

    setSubmitting(true);
    try {
      await spasAPI.posaljiUpit(banja.id, upitForm);
      toast.success('Upit je uspješno poslat!');
      setShowUpitForm(false);
      setUpitForm({
        ime: '',
        email: '',
        telefon: '',
        poruka: '',
        datum_dolaska: '',
        broj_osoba: undefined,
        tip: 'upit',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri slanju upita');
    } finally {
      setSubmitting(false);
    }
  };

  // Review submit handler disabled for now
  // const handleRecenzijaSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!banja) return;

  //   setSubmitting(true);
  //   try {
  //     await spasAPI.dodajRecenziju(banja.id, recenzijaForm);
  //     toast.success('Recenzija je poslata na odobrenje!');
  //     setShowRecenzijaForm(false);
  //     setRecenzijaForm({
  //       ocjena: 5,
  //       komentar: '',
  //       ime: '',
  //     });
  //   } catch (error: any) {
  //     toast.error(error.response?.data?.message || 'Greška pri slanju recenzije');
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!banja) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Banja nije pronađena</h2>
          <Link to="/banje">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nazad na listu
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{banja.meta_title || `${banja.naziv} - Banje i Rehabilitacija`}</title>
        <meta name="description" content={banja.meta_description || banja.opis} />
        {banja.meta_keywords && <meta name="keywords" content={banja.meta_keywords} />}
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Image */}
        <div className="relative h-96 bg-gradient-to-br from-cyan-600 to-teal-600">
          {banja.featured_slika ? (
            <img
              src={normalizeImageUrl(banja.featured_slika)}
              alt={banja.naziv}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Droplet className="w-32 h-32 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-6 left-6">
            <Link to="/banje">
              <Button variant="secondary" size="sm" className="shadow-lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Nazad
              </Button>
            </Link>
          </div>

          {/* Badges */}
          <div className="absolute top-6 right-6 flex flex-col gap-2">
            {banja.verifikovan && (
              <Badge className="bg-green-500 text-white shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                Verifikovano
              </Badge>
            )}
            {banja.medicinski_nadzor && (
              <Badge className="text-white shadow-lg" style={{ backgroundColor: '#0891b2' }}>
                <Heart className="w-3 h-3 mr-1" />
                Medicinski nadzor
              </Badge>
            )}
          </div>

          {/* Title */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {banja.naziv}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-lg">{banja.grad}</span>
                </div>
                {/* Rating - Disabled for now, can be enabled later */}
                {/* {banja.broj_recenzija > 0 && (
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{Number(banja.prosjecna_ocjena).toFixed(1)}</span>
                    <span className="text-sm">({banja.broj_recenzija} recenzija)</span>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>O banjii</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {banja.detaljni_opis || banja.opis}
                  </p>
                </CardContent>
              </Card>

              {/* Gallery */}
              {banja.galerija && banja.galerija.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Galerija</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {banja.galerija.map((slika, index) => (
                        <div 
                          key={index} 
                          className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer"
                          onClick={() => {
                            setLightboxIndex(index);
                            setLightboxOpen(true);
                          }}
                        >
                          <img
                            src={normalizeImageUrl(slika)}
                            alt={`${banja.naziv} - slika ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Vrste */}
              {banja.vrste && banja.vrste.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vrste banja</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {banja.vrste.map((vrsta) => (
                        <Badge key={vrsta.id} variant="secondary" className="text-sm py-2 px-4">
                          {vrsta.naziv}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Indikacije */}
              {banja.indikacije && banja.indikacije.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Indikacije</CardTitle>
                    <CardDescription>Medicinske indikacije za liječenje</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {banja.indikacije.map((indikacija) => (
                        <div key={indikacija.id} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-gray-900">{indikacija.naziv}</p>
                            {indikacija.pivot?.prioritet === 1 && (
                              <Badge variant="outline" className="text-xs mt-1">Glavna</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Terapije */}
              {((banja.terapije && banja.terapije.length > 0) || (banja.customTerapije && banja.customTerapije.length > 0)) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Terapije i usluge</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {banja.terapije && banja.terapije.map((terapija) => (
                        <div key={`standard-${terapija.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Droplet className="w-5 h-5" style={{ color: '#0891b2' }} />
                            <span className="font-medium text-gray-900">{terapija.naziv}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {terapija.pivot?.trajanje_minuta && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {terapija.pivot.trajanje_minuta} min
                              </span>
                            )}
                            {terapija.pivot?.cijena && (
                              <span className="font-semibold text-gray-900">
                                {terapija.pivot.cijena} KM
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {banja.customTerapije && banja.customTerapije.map((terapija) => (
                        <div key={`custom-${terapija.id}`} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <Droplet className="w-5 h-5 text-purple-500" />
                              <span className="font-medium text-gray-900">{terapija.naziv}</span>
                            </div>
                            {terapija.opis && (
                              <p className="text-sm text-gray-600 mt-1 ml-8">{terapija.opis}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            {terapija.trajanje_minuta && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {terapija.trajanje_minuta} min
                              </span>
                            )}
                            {terapija.cijena && (
                              <span className="font-semibold text-gray-900">
                                {terapija.cijena} KM
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Paketi */}
              {banja.paketi && banja.paketi.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paketi i programi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {banja.paketi.map((paket) => (
                        <div key={paket.id} className="border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-lg text-gray-900 mb-2">{paket.naziv}</h4>
                          {paket.opis && (
                            <p className="text-sm text-gray-600 mb-3">{paket.opis}</p>
                          )}
                          <div className="flex items-center justify-between">
                            {paket.trajanje_dana && (
                              <span className="text-sm text-gray-600">
                                {paket.trajanje_dana} dana
                              </span>
                            )}
                            {paket.cijena && (
                              <span className="text-lg font-bold" style={{ color: '#0891b2' }}>
                                {paket.cijena} KM
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recenzije - Disabled for now, can be enabled later */}
              {/* {banja.recenzije && banja.recenzije.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recenzije</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {banja.recenzije.map((recenzija) => (
                        <div key={recenzija.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {recenzija.user?.name || recenzija.ime || 'Anonimno'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < recenzija.ocjena
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {recenzija.komentar && (
                            <p className="text-gray-700">{recenzija.komentar}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(recenzija.created_at).toLocaleDateString('bs-BA')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )} */}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Kontakt informacije</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Adresa</p>
                      <p className="font-medium text-gray-900">{banja.adresa}</p>
                      <p className="text-sm text-gray-600">{banja.grad}</p>
                    </div>
                  </div>

                  {banja.telefon && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Telefon</p>
                        <a href={`tel:${banja.telefon}`} className="font-medium hover:underline" style={{ color: '#0891b2' }}>
                          {banja.telefon}
                        </a>
                      </div>
                    </div>
                  )}

                  {banja.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a href={`mailto:${banja.email}`} className="font-medium hover:underline" style={{ color: '#0891b2' }}>
                          {banja.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {banja.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a 
                          href={banja.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:underline" style={{ color: '#0891b2' }}
                        >
                          Posjeti website
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Features Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Karakteristike</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {banja.ima_smjestaj && (
                    <div className="flex items-center gap-3">
                      <Bed className="w-5 h-5" style={{ color: '#0891b2' }} />
                      <div>
                        <p className="font-medium text-gray-900">Smještaj</p>
                        {banja.broj_kreveta && (
                          <p className="text-sm text-gray-600">{banja.broj_kreveta} kreveta</p>
                        )}
                      </div>
                    </div>
                  )}

                  {banja.online_rezervacija && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-green-500" />
                      <p className="font-medium text-gray-900">Online rezervacija</p>
                    </div>
                  )}

                  {banja.fizijatar_prisutan && (
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-red-500" />
                      <p className="font-medium text-gray-900">Fizijatar prisutan</p>
                    </div>
                  )}

                  {banja.medicinsko_osoblje && (
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="font-medium text-gray-900">Medicinsko osoblje</p>
                        <p className="text-sm text-gray-600 whitespace-pre-line">{banja.medicinsko_osoblje}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Working Hours Card */}
              {banja.radno_vrijeme && Object.keys(banja.radno_vrijeme).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Radno Vrijeme
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {['ponedeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota', 'nedjelja'].map((dan) => {
                        const rv = banja.radno_vrijeme[dan];
                        if (!rv) return null;
                        
                        return (
                          <div key={dan} className="flex justify-between items-center py-2 border-b last:border-0">
                            <span className="font-medium capitalize">{dan}</span>
                            {rv.closed ? (
                              <span className="text-red-600">Zatvoreno</span>
                            ) : (
                              <span className="text-gray-700">
                                {rv.open} - {rv.close}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Location Map Card */}
              <LocationMapCard
                naziv={banja.naziv}
                adresa={banja.adresa}
                grad={banja.grad}
                latitude={banja.latitude}
                longitude={banja.longitude}
                googleMapsLink={banja.google_maps_link}
                markerColor="blue"
              />

              {/* Action Buttons */}
              <div className="space-y-3">
                {banja.online_upit && (
                  <Button 
                    onClick={() => setShowUpitForm(!showUpitForm)} 
                    className="w-full"
                    size="lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Pošalji upit
                  </Button>
                )}

                {/* Review button - Disabled for now, can be enabled later */}
                {/* <Button 
                  onClick={() => setShowRecenzijaForm(!showRecenzijaForm)} 
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Ostavi recenziju
                </Button> */}
              </div>

              {/* Upit Form */}
              {showUpitForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Pošalji upit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUpitSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="ime">Ime i prezime *</Label>
                        <Input
                          id="ime"
                          value={upitForm.ime}
                          onChange={(e) => setUpitForm({ ...upitForm, ime: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={upitForm.email}
                          onChange={(e) => setUpitForm({ ...upitForm, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="telefon">Telefon</Label>
                        <Input
                          id="telefon"
                          value={upitForm.telefon}
                          onChange={(e) => setUpitForm({ ...upitForm, telefon: e.target.value })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="datum_dolaska">Datum dolaska</Label>
                        <DatePicker
                          date={upitForm.datum_dolaska ? new Date(upitForm.datum_dolaska) : undefined}
                          onSelect={(date) => setUpitForm({ 
                            ...upitForm, 
                            datum_dolaska: date ? format(date, 'yyyy-MM-dd') : '' 
                          })}
                          placeholder="Odaberite datum dolaska"
                          minDate={new Date()}
                        />
                      </div>

                      <div>
                        <Label htmlFor="broj_osoba">Broj osoba</Label>
                        <Input
                          id="broj_osoba"
                          type="number"
                          min="1"
                          value={upitForm.broj_osoba || ''}
                          onChange={(e) => setUpitForm({ ...upitForm, broj_osoba: e.target.value ? Number(e.target.value) : undefined })}
                        />
                      </div>

                      <div>
                        <Label htmlFor="poruka">Poruka *</Label>
                        <Textarea
                          id="poruka"
                          rows={4}
                          value={upitForm.poruka}
                          onChange={(e) => setUpitForm({ ...upitForm, poruka: e.target.value })}
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? 'Slanje...' : 'Pošalji upit'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Recenzija Form - Disabled for now, can be enabled later */}
              {/* {showRecenzijaForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Ostavi recenziju</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRecenzijaSubmit} className="space-y-4">
                      <div>
                        <Label>Ocjena *</Label>
                        <div className="flex gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setRecenzijaForm({ ...recenzijaForm, ocjena: rating })}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`w-8 h-8 ${
                                  rating <= recenzijaForm.ocjena
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="rec_ime">Vaše ime</Label>
                        <Input
                          id="rec_ime"
                          value={recenzijaForm.ime}
                          onChange={(e) => setRecenzijaForm({ ...recenzijaForm, ime: e.target.value })}
                          placeholder="Opciono"
                        />
                      </div>

                      <div>
                        <Label htmlFor="komentar">Komentar</Label>
                        <Textarea
                          id="komentar"
                          rows={4}
                          value={recenzijaForm.komentar}
                          onChange={(e) => setRecenzijaForm({ ...recenzijaForm, komentar: e.target.value })}
                          placeholder="Podijelite svoje iskustvo..."
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? 'Slanje...' : 'Pošalji recenziju'}
                      </Button>

                      <p className="text-xs text-gray-500">
                        Recenzija će biti vidljiva nakon odobrenja administratora.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              )} */}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Image Lightbox */}
      {banja && banja.galerija && (
        <ImageLightbox
          images={banja.galerija.map(normalizeImageUrl)}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
