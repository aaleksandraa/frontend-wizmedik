import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LocationInput } from '@/components/LocationInput';
import api from '@/services/api';
import {
  Home, Eye, Star, MessageSquare, Users, Settings, Activity,
  Mail, Phone, Clock, CheckCircle, Edit, Save
} from 'lucide-react';

interface DomStats {
  dom: {
    broj_pregleda: number;
    prosjecna_ocjena: number;
    broj_recenzija: number;
    verifikovan: boolean;
    aktivan: boolean;
  };
  upiti: {
    ukupno: number;
    novi: number;
    procitani: number;
    odgovoreni: number;
    zatvoreni: number;
    ovaj_mjesec: number;
  };
  recenzije: {
    ukupno: number;
    odobrene: number;
    na_cekanju: number;
    ovaj_mjesec: number;
  };
}

interface Upit {
  id: number;
  ime: string;
  email: string;
  telefon?: string;
  poruka: string;
  tip: string;
  status: string;
  created_at: string;
}

interface Recenzija {
  id: number;
  ime: string;
  ocjena: number;
  komentar: string;
  odobreno: boolean;
  created_at: string;
}

export default function CareHomeDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DomStats | null>(null);
  const [dom, setDom] = useState<any>(null);
  const [upiti, setUpiti] = useState<Upit[]>([]);
  const [recenzije, setRecenzije] = useState<Recenzija[]>([]);
  const [activeTab, setActiveTab] = useState('pregled');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, domRes, upitiRes, recenzijeRes] = await Promise.all([
        api.get('/dom-dashboard/statistike'),
        api.get('/dom-dashboard/moj-dom'),
        api.get('/dom-dashboard/upiti'),
        api.get('/dom-dashboard/recenzije'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (domRes.data.success) setDom(domRes.data.data);
      if (upitiRes.data.success) setUpiti(upitiRes.data.data);
      if (recenzijeRes.data.success) setRecenzije(recenzijeRes.data.data);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri učitavanju podataka',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUpitStatus = async (id: number, status: string) => {
    try {
      await api.patch(`/dom-dashboard/upiti/${id}`, { status });
      toast({ title: 'Uspješno', description: 'Status upita je ažuriran' });
      loadDashboardData();
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri ažuriranju statusa', variant: 'destructive' });
    }
  };

  const saveDomChanges = async () => {
    try {
      setSaving(true);
      await api.put('/dom-dashboard/moj-dom', dom);
      toast({ title: 'Uspješno', description: 'Podaci su sačuvani' });
      setEditing(false);
    } catch (error) {
      toast({ title: 'Greška', description: 'Greška pri čuvanju podataka', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!dom) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Home className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Nemate registrovan dom</h2>
              <p className="text-muted-foreground mb-4">
                Kontaktirajte administratora za registraciju vašeg doma.
              </p>
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
        <title>Dashboard - {dom.naziv} | wizMedik</title>
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dom.naziv}</h1>
              <p className="text-muted-foreground">Dashboard za upravljanje domom</p>
            </div>
            <div className="flex gap-2">
              {dom.verifikovan ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" /> Verificiran
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Clock className="h-3 w-3 mr-1" /> Na čekanju
                </Badge>
              )}
              <Link to={`/dom-njega/${dom.slug}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" /> Pogledaj profil
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pregledi</p>
                      <p className="text-2xl font-bold">{stats.dom.broj_pregleda}</p>
                    </div>
                    <Eye className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ocjena</p>
                      <p className="text-2xl font-bold">
                        {Number(stats.dom.prosjecna_ocjena).toFixed(1)}/5
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Novi upiti</p>
                      <p className="text-2xl font-bold">{stats.upiti.novi}</p>
                    </div>
                    <MessageSquare className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recenzije</p>
                      <p className="text-2xl font-bold">{stats.recenzije.ukupno}</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="pregled">
                <Activity className="h-4 w-4 mr-2" /> Pregled
              </TabsTrigger>
              <TabsTrigger value="upiti">
                <MessageSquare className="h-4 w-4 mr-2" /> Upiti ({stats?.upiti.novi || 0})
              </TabsTrigger>
              <TabsTrigger value="recenzije">
                <Star className="h-4 w-4 mr-2" /> Recenzije
              </TabsTrigger>
              <TabsTrigger value="postavke">
                <Settings className="h-4 w-4 mr-2" /> Postavke
              </TabsTrigger>
            </TabsList>

            {/* Pregled Tab */}
            <TabsContent value="pregled">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Posljednji upiti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upiti.slice(0, 5).map(upit => (
                      <div key={upit.id} className="flex items-center justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{upit.ime}</p>
                          <p className="text-sm text-muted-foreground">{upit.email}</p>
                        </div>
                        <Badge variant={upit.status === 'novi' ? 'default' : 'secondary'}>
                          {upit.status}
                        </Badge>
                      </div>
                    ))}
                    {upiti.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Nema upita</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Posljednje recenzije</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {recenzije.slice(0, 5).map(recenzija => (
                      <div key={recenzija.id} className="py-3 border-b last:border-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">{recenzija.ime}</p>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1">{recenzija.ocjena}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{recenzija.komentar}</p>
                      </div>
                    ))}
                    {recenzije.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">Nema recenzija</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Upiti Tab */}
            <TabsContent value="upiti">
              <Card>
                <CardHeader>
                  <CardTitle>Svi upiti</CardTitle>
                  <CardDescription>Upravljajte upitima korisnika</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upiti.map(upit => (
                      <div key={upit.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-semibold">{upit.ime}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center"><Mail className="h-3 w-3 mr-1" />{upit.email}</span>
                              {upit.telefon && <span className="flex items-center"><Phone className="h-3 w-3 mr-1" />{upit.telefon}</span>}
                            </div>
                          </div>
                          <Select value={upit.status} onValueChange={(v) => updateUpitStatus(upit.id, v)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="novi">Novi</SelectItem>
                              <SelectItem value="procitan">Pročitan</SelectItem>
                              <SelectItem value="odgovoren">Odgovoren</SelectItem>
                              <SelectItem value="zatvoren">Zatvoren</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm">{upit.poruka}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(upit.created_at).toLocaleDateString('bs-BA')}
                        </p>
                      </div>
                    ))}
                    {upiti.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nema upita</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recenzije Tab */}
            <TabsContent value="recenzije">
              <Card>
                <CardHeader>
                  <CardTitle>Sve recenzije</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recenzije.map(recenzija => (
                      <div key={recenzija.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{recenzija.ime}</p>
                            {recenzija.odobreno ? (
                              <Badge className="bg-green-100 text-green-800">Odobrena</Badge>
                            ) : (
                              <Badge variant="secondary">Na čekanju</Badge>
                            )}
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < recenzija.ocjena ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm">{recenzija.komentar}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(recenzija.created_at).toLocaleDateString('bs-BA')}
                        </p>
                      </div>
                    ))}
                    {recenzije.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Nema recenzija</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Postavke Tab */}
            <TabsContent value="postavke">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Postavke doma</CardTitle>
                      <CardDescription>Uredite informacije o vašem domu</CardDescription>
                    </div>
                    {editing ? (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditing(false)}>Odustani</Button>
                        <Button onClick={saveDomChanges} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" /> {saving ? 'Čuvanje...' : 'Sačuvaj'}
                        </Button>
                      </div>
                    ) : (
                      <Button onClick={() => setEditing(true)}>
                        <Edit className="h-4 w-4 mr-2" /> Uredi
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Naziv</Label>
                      <Input
                        value={dom.naziv}
                        onChange={(e) => setDom({ ...dom, naziv: e.target.value })}
                        disabled={!editing || dom.verifikovan}
                      />
                      {dom.verifikovan && <p className="text-xs text-muted-foreground mt-1">Naziv se ne može mijenjati nakon verifikacije</p>}
                    </div>
                    <div>
                      <Label>Grad</Label>
                      <Input
                        value={dom.grad}
                        onChange={(e) => setDom({ ...dom, grad: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label>Adresa</Label>
                      <Input
                        value={dom.adresa}
                        onChange={(e) => setDom({ ...dom, adresa: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label>Telefon</Label>
                      <Input
                        value={dom.telefon || ''}
                        onChange={(e) => setDom({ ...dom, telefon: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        value={dom.email || ''}
                        onChange={(e) => setDom({ ...dom, email: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                    <div>
                      <Label>Website</Label>
                      <Input
                        value={dom.website || ''}
                        onChange={(e) => setDom({ ...dom, website: e.target.value })}
                        disabled={!editing}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Opis</Label>
                    <Textarea
                      value={dom.opis}
                      onChange={(e) => setDom({ ...dom, opis: e.target.value })}
                      disabled={!editing}
                      rows={4}
                    />
                  </div>
                  
                  {/* Location Input */}
                  <LocationInput
                    latitude={dom.latitude}
                    longitude={dom.longitude}
                    googleMapsLink={dom.google_maps_link}
                    onLocationChange={(data) => {
                      setDom({
                        ...dom,
                        latitude: data.latitude ?? undefined,
                        longitude: data.longitude ?? undefined,
                        google_maps_link: data.google_maps_link ?? undefined,
                      });
                    }}
                    disabled={!editing}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </>
  );
}
