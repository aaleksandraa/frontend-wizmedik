import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { DatePicker } from '@/components/ui/date-picker';
import { 
  MapPin, Phone, Mail, Globe, Clock, Heart, Shield, Activity, 
  Users, Home, Star, ChevronLeft, CheckCircle, Navigation, Send
} from 'lucide-react';
import { LocationMapCard } from '@/components/LocationMapCard';
import { domoviAPI } from '@/services/api';
import { DomUpitFormData } from '@/types/careHome';
import { toast } from 'sonner';

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
  online_upit?: boolean;
  tip_doma: { id: number; naziv: string; slug: string };
  nivo_njege: { id: number; naziv: string; slug: string };
  programi_njege: Array<{ id: number; naziv: string; slug: string }>;
  medicinske_usluge: Array<{ id: number; naziv: string; slug: string }>;
  smjestaj_uslovi: Array<{ id: number; naziv: string; kategorija: string }>;
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
  slike?: string[];
  radno_vrijeme?: Record<string, { open: string; close: string; closed?: boolean }>;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
}

export default function CareHomeProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [dom, setDom] = useState<Dom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUpitForm, setShowUpitForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [upitForm, setUpitForm] = useState<DomUpitFormData>({
    ime: '',
    email: '',
    telefon: '',
    poruka: '',
    opis_potreba: '',
    zelja_posjeta: '',
    tip: 'upit',
  });

  useEffect(() => {
    fetchDom();
  }, [slug]);

  const fetchDom = async () => {
    try {
      setLoading(true);
      const response = await domoviAPI.getBySlug(slug!);
      if (response.data.success) {
        setDom(response.data.data);
      } else {
        setError('Dom nije pronađen');
      }
    } catch (err) {
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleUpitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dom) return;

    setSubmitting(true);
    try {
      await domoviAPI.posaljiUpit(dom.id, upitForm);
      toast.success('Upit je uspješno poslat!');
      setShowUpitForm(false);
      setUpitForm({
        ime: '',
        email: '',
        telefon: '',
        poruka: '',
        opis_potreba: '',
        zelja_posjeta: '',
        tip: 'upit',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri slanju upita');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full mb-6" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !dom) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{error || 'Dom nije pronađen'}</h2>
              <Link to="/domovi-njega">
                <Button>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Nazad na listu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{dom.naziv} - Dom za njegu | wizMedik</title>
        <meta name="description" content={dom.opis?.substring(0, 160)} />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Početna</Link>
              <span>/</span>
              <Link to="/domovi-njega" className="hover:text-primary">Domovi za njegu</Link>
              <span>/</span>
              <span className="text-foreground">{dom.naziv}</span>
            </nav>
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">{dom.naziv}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {dom.adresa}, {dom.grad}
                  </span>
                  {Number(dom.prosjecna_ocjena) > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(dom.prosjecna_ocjena).toFixed(1)} ({dom.broj_recenzija || 0} recenzija)
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {dom.tip_doma?.naziv && <Badge variant="secondary">{dom.tip_doma.naziv}</Badge>}
                {dom.nivo_njege?.naziv && <Badge variant="outline">{dom.nivo_njege.naziv}</Badge>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Featured Image */}
              {dom.featured_slika && (
                <Card>
                  <CardContent className="p-0">
                    <img 
                      src={dom.featured_slika} 
                      alt={dom.naziv}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>O domu</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{dom.opis}</p>
                </CardContent>
              </Card>

              {/* Care Programs */}
              {dom.programi_njege?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Programi njege
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {dom.programi_njege.map(program => (
                        <Badge key={program.id} variant="secondary">
                          {program.naziv}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medical Services */}
              {dom.medicinske_usluge?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Medicinske usluge
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dom.medicinske_usluge.map(usluga => (
                        <div key={usluga.id} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{usluga.naziv}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Accommodation */}
              {dom.smjestaj_uslovi?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Uslovi smještaja
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {dom.smjestaj_uslovi.map(uslov => (
                        <div key={uslov.id} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{uslov.naziv}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Kontakt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dom.telefon && (
                    <a href={`tel:${dom.telefon}`} className="flex items-center gap-3 hover:text-primary">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <span>{dom.telefon}</span>
                    </a>
                  )}
                  {dom.email && (
                    <a href={`mailto:${dom.email}`} className="flex items-center gap-3 hover:text-primary">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <span>{dom.email}</span>
                    </a>
                  )}
                  {dom.website && (
                    <a href={dom.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary">
                      <Globe className="h-5 w-5 text-muted-foreground" />
                      <span>Web stranica</span>
                    </a>
                  )}
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{dom.adresa}, {dom.grad}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Staff Availability */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Osoblje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Medicinske sestre</span>
                    <Badge variant="outline">{dom.nurses_availability_label}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doktor</span>
                    <Badge variant="outline">{dom.doctor_availability_label}</Badge>
                  </div>
                  {dom.has_physiotherapist && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Fizioterapeut</span>
                    </div>
                  )}
                  {dom.has_physiatrist && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Fizijatar</span>
                    </div>
                  )}
                  {dom.emergency_protocol && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>Protokol za hitne slučajeve</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pricing */}
              {dom.formatted_price && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cijena</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">{dom.formatted_price}</p>
                  </CardContent>
                </Card>
              )}

              {/* Location Map */}
              <LocationMapCard
                naziv={dom.naziv}
                adresa={dom.adresa}
                grad={dom.grad}
                latitude={dom.latitude}
                longitude={dom.longitude}
                googleMapsLink={dom.google_maps_link}
                markerColor="green"
              />

              {/* Action Button */}
              {dom.online_upit && (
                <Button 
                  onClick={() => setShowUpitForm(!showUpitForm)} 
                  className="w-full"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Pošalji upit
                </Button>
              )}

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
                        <Label htmlFor="opis_potreba">Opis potreba</Label>
                        <Textarea
                          id="opis_potreba"
                          rows={3}
                          value={upitForm.opis_potreba}
                          onChange={(e) => setUpitForm({ ...upitForm, opis_potreba: e.target.value })}
                          placeholder="Opišite potrebe za njegom..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="zelja_posjeta">Želja za posjetom</Label>
                        <DatePicker
                          date={upitForm.zelja_posjeta ? new Date(upitForm.zelja_posjeta) : undefined}
                          onSelect={(date) => setUpitForm({ 
                            ...upitForm, 
                            zelja_posjeta: date ? format(date, 'yyyy-MM-dd') : '' 
                          })}
                          placeholder="Odaberite datum posjete"
                          minDate={new Date()}
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
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  );
}
