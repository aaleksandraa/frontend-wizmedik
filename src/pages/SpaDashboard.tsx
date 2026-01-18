import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { LocationInput } from '@/components/LocationInput';
import { 
  Droplet, BarChart3, Settings, Image as ImageIcon,
  Clock, Package, Heart, Loader2, Star, Upload, X,
  Save, Plus, Trash2, Edit, MapPin, Phone, Mail, Globe, Stethoscope, CheckCircle, GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Spa {
  id: number;
  naziv: string;
  email: string;
  telefon: string;
  adresa: string;
  grad: string;
  regija?: string;
  opis?: string;
  detaljni_opis?: string;
  website?: string;
  medicinsko_osoblje?: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_pregleda: number;
  medicinski_nadzor: boolean;
  fizijatar_prisutan: boolean;
  ima_smjestaj: boolean;
  broj_kreveta?: number;
  online_rezervacija: boolean;
  online_upit: boolean;
  featured_slika?: string;
  galerija?: string[];
  radno_vrijeme?: any;
  aktivan: boolean;
  verifikovan: boolean;
  vrste?: VrstaBanje[];
  indikacije?: Indikacija[];
  terapije?: Terapija[];
  customTerapije?: CustomTerapija[];
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
}

interface VrstaBanje {
  id: number;
  naziv: string;
  slug: string;
}

interface Indikacija {
  id: number;
  naziv: string;
  slug: string;
  kategorija?: string;
  pivot?: {
    prioritet?: number;
  };
}

interface Terapija {
  id: number;
  naziv: string;
  slug: string;
  pivot?: {
    cijena?: number;
    trajanje_minuta?: number;
    redoslijed?: number;
  };
}

interface CustomTerapija {
  id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  trajanje_minuta?: number;
  redoslijed: number;
  aktivan: boolean;
}

interface Statistics {
  broj_pregleda: number;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  ukupno_upita: number;
  novi_upiti: number;
  procitani_upiti: number;
  odgovoreni_upiti: number;
  recenzije_na_cekanju: number;
  odobrene_recenzije: number;
  status: {
    aktivan: boolean;
    verifikovan: boolean;
  };
}

interface Paket {
  id: number;
  naziv: string;
  opis?: string;
  trajanje_dana?: number;
  cijena: number;
  ukljuceno?: string[];
  aktivan: boolean;
  redoslijed?: number;
}

export default function SpaDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [spa, setSpa] = useState<Spa | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [paketi, setPaketi] = useState<Paket[]>([]);
  
  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Spa>>({});
  
  // Available options (taxonomies)
  const [availableVrste, setAvailableVrste] = useState<VrstaBanje[]>([]);
  const [availableIndikacije, setAvailableIndikacije] = useState<Indikacija[]>([]);
  const [availableTerapije, setAvailableTerapije] = useState<Terapija[]>([]);
  
  // Selected values
  const [selectedVrste, setSelectedVrste] = useState<number[]>([]);
  const [selectedIndikacije, setSelectedIndikacije] = useState<number[]>([]);
  const [selectedTerapije, setSelectedTerapije] = useState<number[]>([]);
  const [terapijeCijena, setTerapijeCijena] = useState<{[key: number]: number}>({});
  const [terapijeTrajanje, setTerapijeTrajanje] = useState<{[key: number]: number}>({});
  
  // Gallery states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Package dialog
  const [paketDialog, setPaketDialog] = useState(false);
  const [editingPaket, setEditingPaket] = useState<Paket | null>(null);
  const [paketData, setPaketData] = useState<Partial<Paket>>({});
  
  // Custom terapije
  const [customTerapije, setCustomTerapije] = useState<CustomTerapija[]>([]);
  const [customTerapijaDialog, setCustomTerapijaDialog] = useState(false);
  const [editingCustomTerapija, setEditingCustomTerapija] = useState<CustomTerapija | null>(null);
  const [customTerapijaData, setCustomTerapijaData] = useState<Partial<CustomTerapija>>({});
  
  // Working hours
  const [radnoVrijeme, setRadnoVrijeme] = useState<any>({});

  const dani = ['ponedeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota', 'nedjelja'];
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const [profileRes, statsRes, paketiRes, vrsteRes, indikacijeRes, terapijeRes, customTerapijeRes] = await Promise.all([
        axios.get('http://localhost:8000/api/spa/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/paketi', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/vrste/available', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/indikacije/available', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/terapije/available', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/spa/custom-terapije', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Backend now returns properly formatted URLs via model accessors
      const spaData = profileRes.data;

      setSpa(spaData);
      setEditData(spaData);
      setRadnoVrijeme(spaData.radno_vrijeme || {});
      setStatistics(statsRes.data);
      setPaketi(paketiRes.data);
      
      // Set available options
      setAvailableVrste(vrsteRes.data);
      setAvailableIndikacije(indikacijeRes.data);
      setAvailableTerapije(terapijeRes.data);
      setCustomTerapije(customTerapijeRes.data);
      
      // Set selected values from spa data
      if (spaData.vrste) {
        setSelectedVrste(spaData.vrste.map((v: VrstaBanje) => v.id));
      }
      if (spaData.indikacije) {
        setSelectedIndikacije(spaData.indikacije.map((i: Indikacija) => i.id));
      }
      if (spaData.terapije) {
        setSelectedTerapije(spaData.terapije.map((t: Terapija) => t.id));
        // Set prices and durations
        const cijene: {[key: number]: number} = {};
        const trajanja: {[key: number]: number} = {};
        spaData.terapije.forEach((t: Terapija) => {
          if (t.pivot?.cijena) cijene[t.id] = t.pivot.cijena;
          if (t.pivot?.trajanje_minuta) trajanja[t.id] = t.pivot.trajanje_minuta;
        });
        setTerapijeCijena(cijene);
        setTerapijeTrajanje(trajanja);
      }

    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Nije moguće učitati podatke',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      // Prepare terapije data with prices and durations
      const terapijeData: number[] = [];
      const terapijeCijenaArray: number[] = [];
      const terapijeTrajanjeArray: number[] = [];
      
      selectedTerapije.forEach(id => {
        terapijeData.push(id);
        terapijeCijenaArray.push(terapijeCijena[id] || 0);
        terapijeTrajanjeArray.push(terapijeTrajanje[id] || 0);
      });
      
      // Filter out relationship data and only send editable fields
      const dataToSend = {
        naziv: editData.naziv,
        grad: editData.grad,
        regija: editData.regija,
        adresa: editData.adresa,
        telefon: editData.telefon,
        email: editData.email,
        website: editData.website,
        opis: editData.opis,
        detaljni_opis: editData.detaljni_opis,
        medicinsko_osoblje: editData.medicinsko_osoblje,
        medicinski_nadzor: editData.medicinski_nadzor,
        fizijatar_prisutan: editData.fizijatar_prisutan,
        ima_smjestaj: editData.ima_smjestaj,
        broj_kreveta: editData.broj_kreveta,
        online_rezervacija: editData.online_rezervacija,
        online_upit: editData.online_upit,
        radno_vrijeme: radnoVrijeme,
        vrste: selectedVrste,
        indikacije: selectedIndikacije,
        terapije: terapijeData,
        terapije_cijena: terapijeCijenaArray,
        terapije_trajanje: terapijeTrajanjeArray,
      };

      const response = await axios.put(
        'http://localhost:8000/api/spa/profile',
        dataToSend,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSpa(response.data.banja);
      setEditData(response.data.banja);
      setEditMode(false);
      
      toast({
        title: 'Uspjeh',
        description: 'Profil uspješno ažuriran',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri ažuriranju profila',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const uploadFeaturedImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post(
        'http://localhost:8000/api/spa/featured-image',
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      setSpa(prev => prev ? { ...prev, featured_slika: response.data.url } : null);
      
      toast({
        title: 'Uspjeh',
        description: 'Profilna slika uspješno ažurirana',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Greška pri upload-u slike',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const uploadGalleryImage = async (file: File) => {
    setUploadingImage(true);
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading image to spa gallery...', file.name);

      const response = await axios.post(
        'http://localhost:8000/api/spa/galerija',
        formData,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
      );

      console.log('Upload response:', response.data);

      // Backend now returns properly formatted URLs
      setSpa(prev => prev ? { ...prev, galerija: response.data.galerija } : null);
      
      toast({
        title: 'Uspjeh',
        description: 'Slika uspješno dodana',
      });
    } catch (error: any) {
      console.error('Upload error:', error.response?.data || error.message);
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri upload-u slike',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const deleteGalleryImage = async (url: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      console.log('Deleting image:', url);
      
      const response = await axios.delete(
        'http://localhost:8000/api/spa/galerija',
        { 
          headers: { Authorization: `Bearer ${token}` },
          data: { url }
        }
      );

      console.log('Delete response:', response.data);

      // Backend now returns properly formatted URLs
      setSpa(prev => prev ? { ...prev, galerija: response.data.galerija } : null);
      
      toast({
        title: 'Uspjeh',
        description: 'Slika uspješno obrisana',
      });
    } catch (error: any) {
      console.error('Delete error:', error.response?.data || error.message);
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri brisanju slike',
        variant: 'destructive',
      });
    }
  };

  const setFeaturedImage = async (url: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      
      console.log('Setting featured image:', url);
      
      const response = await axios.post(
        'http://localhost:8000/api/spa/set-featured',
        { image_url: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Set featured response:', response.data);

      // Backend returns properly formatted URL
      setSpa(prev => prev ? { ...prev, featured_slika: response.data.featured_slika } : null);
      
      toast({
        title: 'Uspjeh',
        description: 'Profilna slika uspješno postavljena',
      });
    } catch (error: any) {
      console.error('Set featured error:', error.response?.data || error.message);
      toast({
        title: 'Greška',
        description: error.response?.data?.message || 'Greška pri postavljanju profilne slike',
        variant: 'destructive',
      });
    }
  };

  const savePaket = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (editingPaket) {
        await axios.put(
          `http://localhost:8000/api/spa/paketi/${editingPaket.id}`,
          paketData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:8000/api/spa/paketi',
          paketData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchData();
      setPaketDialog(false);
      setEditingPaket(null);
      setPaketData({});
      
      toast({
        title: 'Uspjeh',
        description: editingPaket ? 'Paket uspješno ažuriran' : 'Paket uspješno kreiran',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Greška pri čuvanju paketa',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deletePaket = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj paket?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `http://localhost:8000/api/spa/paketi/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchData();
      
      toast({
        title: 'Uspjeh',
        description: 'Paket uspješno obrisan',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Greška pri brisanju paketa',
        variant: 'destructive',
      });
    }
  };

  const saveCustomTerapija = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      
      if (editingCustomTerapija) {
        await axios.put(
          `http://localhost:8000/api/spa/custom-terapije/${editingCustomTerapija.id}`,
          customTerapijaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:8000/api/spa/custom-terapije',
          customTerapijaData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchData();
      setCustomTerapijaDialog(false);
      setEditingCustomTerapija(null);
      setCustomTerapijaData({});
      
      toast({
        title: 'Uspjeh',
        description: editingCustomTerapija ? 'Terapija uspješno ažurirana' : 'Terapija uspješno kreirana',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Greška pri čuvanju terapije',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomTerapija = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovu terapiju?')) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(
        `http://localhost:8000/api/spa/custom-terapije/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchData();
      
      toast({
        title: 'Uspjeh',
        description: 'Terapija uspješno obrisana',
      });
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: 'Greška pri brisanju terapije',
        variant: 'destructive',
      });
    }
  };

  const handleTerapijeDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const allTerapije = [
      ...selectedTerapije.map(id => {
        const terapija = availableTerapije.find(t => t.id === id);
        return {
          id,
          type: 'standard' as const,
          naziv: terapija?.naziv || '',
          redoslijed: terapija?.pivot?.redoslijed || 0
        };
      }),
      ...customTerapije.map(ct => ({
        id: ct.id,
        type: 'custom' as const,
        naziv: ct.naziv,
        redoslijed: ct.redoslijed
      }))
    ];

    const oldIndex = allTerapije.findIndex(t => `${t.type}-${t.id}` === active.id);
    const newIndex = allTerapije.findIndex(t => `${t.type}-${t.id}` === over.id);

    const reordered = arrayMove(allTerapije, oldIndex, newIndex);

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(
        'http://localhost:8000/api/spa/reorder-terapije',
        {
          terapije: reordered.map((t, index) => ({
            id: t.id,
            type: t.type,
            redoslijed: index
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      await fetchData();
      
      toast({
        title: 'Uspjeh',
        description: 'Redoslijed terapija ažuriran',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Greška pri ažuriranju redoslijeda',
        variant: 'destructive',
      });
    }
  };

  const handlePaketiDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = paketi.findIndex(p => p.id === active.id);
    const newIndex = paketi.findIndex(p => p.id === over.id);

    const reordered = arrayMove(paketi, oldIndex, newIndex);
    setPaketi(reordered);

    try {
      const token = localStorage.getItem('auth_token');
      await axios.post(
        'http://localhost:8000/api/spa/reorder-paketi',
        {
          paketi: reordered.map((p, index) => ({
            id: p.id,
            redoslijed: index
          }))
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({
        title: 'Uspjeh',
        description: 'Redoslijed paketa ažuriran',
      });
    } catch (error) {
      toast({
        title: 'Greška',
        description: 'Greška pri ažuriranju redoslijeda',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!spa) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Banja nije pronađena</h2>
          <p className="text-muted-foreground">Nemate registrovanu banju.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dashboard - {spa.naziv}
          </h1>
          <p className="text-muted-foreground">Dobrodošli, {user?.name}!</p>
          <div className="flex items-center gap-2 mt-2">
            {spa.verifikovan ? (
              <span className="text-sm text-green-600 font-medium">✓ Verifikovano</span>
            ) : (
              <span className="text-sm text-yellow-600 font-medium">⚠ Čeka verifikaciju</span>
            )}
            {spa.aktivan ? (
              <span className="text-sm text-green-600 font-medium">• Aktivno</span>
            ) : (
              <span className="text-sm text-gray-600 font-medium">• Neaktivno</span>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pregledi</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.broj_pregleda || 0}</div>
              <p className="text-xs text-muted-foreground">Ukupno pregleda profila</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ocjena</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics?.prosjecna_ocjena ? Number(statistics.prosjecna_ocjena).toFixed(1) : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                {statistics?.broj_recenzija || 0} recenzija
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paketi</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paketi.length}</div>
              <p className="text-xs text-muted-foreground">Kreirani paketi</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upiti</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics?.ukupno_upita || 0}</div>
              <p className="text-xs text-muted-foreground">
                {statistics?.novi_upiti || 0} novih
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="profil" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profil" className="gap-2">
              <Settings className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="terapije" className="gap-2">
              <Stethoscope className="h-4 w-4" />
              Terapije i Usluge
            </TabsTrigger>
            <TabsTrigger value="paketi" className="gap-2">
              <Package className="h-4 w-4" />
              Paketi
            </TabsTrigger>
            <TabsTrigger value="galerija" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Galerija
            </TabsTrigger>
            <TabsTrigger value="radno-vrijeme" className="gap-2">
              <Clock className="h-4 w-4" />
              Radno Vrijeme
            </TabsTrigger>
          </TabsList>

          {/* Profil Tab */}
          <TabsContent value="profil">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profil Banje</CardTitle>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)} variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Uredi
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button onClick={() => { setEditMode(false); setEditData(spa); }} variant="outline">
                        Otkaži
                      </Button>
                      <Button onClick={updateProfile} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Sačuvaj
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Naziv</Label>
                    {editMode ? (
                      <Input
                        value={editData.naziv || ''}
                        onChange={(e) => setEditData({ ...editData, naziv: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.naziv}</p>
                    )}
                  </div>
                  <div>
                    <Label>Grad</Label>
                    {editMode ? (
                      <Input
                        value={editData.grad || ''}
                        onChange={(e) => setEditData({ ...editData, grad: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.grad}</p>
                    )}
                  </div>
                  <div>
                    <Label>Email</Label>
                    {editMode ? (
                      <Input
                        type="email"
                        value={editData.email || ''}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.email}</p>
                    )}
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    {editMode ? (
                      <Input
                        value={editData.telefon || ''}
                        onChange={(e) => setEditData({ ...editData, telefon: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.telefon}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label>Adresa</Label>
                    {editMode ? (
                      <Input
                        value={editData.adresa || ''}
                        onChange={(e) => setEditData({ ...editData, adresa: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.adresa}</p>
                    )}
                  </div>
                  <div>
                    <Label>Website</Label>
                    {editMode ? (
                      <Input
                        value={editData.website || ''}
                        onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                      />
                    ) : (
                      <p className="mt-1">{spa.website || 'Nije postavljeno'}</p>
                    )}
                  </div>
                </div>

                {/* Location Input */}
                {editMode && (
                  <LocationInput
                    latitude={editData.latitude}
                    longitude={editData.longitude}
                    googleMapsLink={editData.google_maps_link}
                    onLocationChange={(data) => {
                      setEditData({
                        ...editData,
                        latitude: data.latitude ?? undefined,
                        longitude: data.longitude ?? undefined,
                        google_maps_link: data.google_maps_link ?? undefined,
                      });
                    }}
                    disabled={!editMode}
                  />
                )}

                {/* Medicinsko osoblje */}
                <div>
                  <Label>Medicinsko osoblje</Label>
                  {editMode ? (
                    <Textarea
                      value={editData.medicinsko_osoblje || ''}
                      onChange={(e) => setEditData({ ...editData, medicinsko_osoblje: e.target.value })}
                      rows={3}
                      placeholder="Npr: Fizijatar, Balneolog, Medicinska sestra..."
                    />
                  ) : (
                    <p className="mt-1 whitespace-pre-line">{spa.medicinsko_osoblje || 'Nije postavljeno'}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label>Opis</Label>
                  {editMode ? (
                    <Textarea
                      value={editData.opis || ''}
                      onChange={(e) => setEditData({ ...editData, opis: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="mt-1 whitespace-pre-line">{spa.opis}</p>
                  )}
                </div>

                {/* Features */}
                {editMode && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Karakteristike</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>Medicinski nadzor</Label>
                        <Switch
                          checked={editData.medicinski_nadzor || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, medicinski_nadzor: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Fizijatar prisutan</Label>
                        <Switch
                          checked={editData.fizijatar_prisutan || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, fizijatar_prisutan: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Ima smještaj</Label>
                        <Switch
                          checked={editData.ima_smjestaj || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, ima_smjestaj: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Online rezervacija</Label>
                        <Switch
                          checked={editData.online_rezervacija || false}
                          onCheckedChange={(checked) => setEditData({ ...editData, online_rezervacija: checked })}
                        />
                      </div>
                    </div>
                    {editData.ima_smjestaj && (
                      <div>
                        <Label>Broj kreveta</Label>
                        <Input
                          type="number"
                          value={editData.broj_kreveta || ''}
                          onChange={(e) => setEditData({ ...editData, broj_kreveta: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paketi Tab */}
          <TabsContent value="paketi">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Paketi Terapija</CardTitle>
                  <Button onClick={() => { setPaketDialog(true); setPaketData({}); setEditingPaket(null); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Dodaj Paket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {paketi.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Nema paketa</p>
                    <p className="text-muted-foreground mb-4">Kreirajte pakete terapija sa popustom</p>
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePaketiDragEnd}
                  >
                    <SortableContext
                      items={paketi.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="grid gap-4">
                        {paketi.map((paket) => (
                          <SortablePaketItem
                            key={paket.id}
                            paket={paket}
                            onEdit={() => {
                              setEditingPaket(paket);
                              setPaketData(paket);
                              setPaketDialog(true);
                            }}
                            onDelete={() => deletePaket(paket.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Terapije i Usluge Tab */}
          <TabsContent value="terapije">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Terapije i Usluge</CardTitle>
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Sačuvaj
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Vrste Banja */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Vrste Banja</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableVrste.map((vrsta) => (
                      <div key={vrsta.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`vrsta-${vrsta.id}`}
                          checked={selectedVrste.includes(vrsta.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedVrste([...selectedVrste, vrsta.id]);
                            } else {
                              setSelectedVrste(selectedVrste.filter(id => id !== vrsta.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`vrsta-${vrsta.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {vrsta.naziv}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Indikacije */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Indikacije za Liječenje</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Odaberite medicinske indikacije za koje je vaša banja pogodna
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableIndikacije.map((indikacija) => (
                      <div key={indikacija.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`indikacija-${indikacija.id}`}
                          checked={selectedIndikacije.includes(indikacija.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIndikacije([...selectedIndikacije, indikacija.id]);
                            } else {
                              setSelectedIndikacije(selectedIndikacije.filter(id => id !== indikacija.id));
                            }
                          }}
                        />
                        <label
                          htmlFor={`indikacija-${indikacija.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {indikacija.naziv}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Terapije */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Terapije i Usluge</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Odaberite terapije koje nudite i unesite cijenu i trajanje
                  </p>
                  <div className="space-y-4">
                    {availableTerapije.map((terapija) => {
                      const isSelected = selectedTerapije.includes(terapija.id);
                      return (
                        <div key={terapija.id} className="border rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id={`terapija-${terapija.id}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTerapije([...selectedTerapije, terapija.id]);
                                } else {
                                  setSelectedTerapije(selectedTerapije.filter(id => id !== terapija.id));
                                  const newCijene = { ...terapijeCijena };
                                  const newTrajanja = { ...terapijeTrajanje };
                                  delete newCijene[terapija.id];
                                  delete newTrajanja[terapija.id];
                                  setTerapijeCijena(newCijene);
                                  setTerapijeTrajanje(newTrajanja);
                                }
                              }}
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={`terapija-${terapija.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer block mb-3"
                              >
                                {terapija.naziv}
                              </label>
                              {isSelected && (
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  <div>
                                    <Label className="text-xs">Cijena (KM)</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      value={terapijeCijena[terapija.id] || ''}
                                      onChange={(e) => setTerapijeCijena({
                                        ...terapijeCijena,
                                        [terapija.id]: parseFloat(e.target.value) || 0
                                      })}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">Trajanje (minuta)</Label>
                                    <Input
                                      type="number"
                                      placeholder="0"
                                      value={terapijeTrajanje[terapija.id] || ''}
                                      onChange={(e) => setTerapijeTrajanje({
                                        ...terapijeTrajanje,
                                        [terapija.id]: parseInt(e.target.value) || 0
                                      })}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Terapije */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-base font-semibold">Ostale Terapije</Label>
                    <Button
                      size="sm"
                      onClick={() => {
                        setCustomTerapijaDialog(true);
                        setEditingCustomTerapija(null);
                        setCustomTerapijaData({});
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Dodaj Terapiju
                    </Button>
                  </div>
                  
                  {customTerapije.length > 0 ? (
                    <div className="space-y-2">
                      {customTerapije.map((ct) => (
                        <div key={ct.id} className="border rounded-lg p-4 bg-purple-50 border-purple-200">
                          <div className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="font-medium">{ct.naziv}</div>
                              {ct.opis && (
                                <div className="text-sm text-muted-foreground">{ct.opis}</div>
                              )}
                              <div className="flex items-center gap-4 mt-1 text-sm">
                                {ct.cijena && <span>{ct.cijena} KM</span>}
                                {ct.trajanje_minuta && <span>{ct.trajanje_minuta} min</span>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingCustomTerapija(ct);
                                  setCustomTerapijaData(ct);
                                  setCustomTerapijaDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteCustomTerapija(ct.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nema custom terapija. Kliknite "Dodaj Terapiju" da dodate novu.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Galerija Tab */}
          <TabsContent value="galerija">
            <Card>
              <CardHeader>
                <CardTitle>Galerija</CardTitle>
              </CardHeader>
              <CardContent>
                {spa.galerija && spa.galerija.length > 0 ? (
                  <>
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Profilna slika:</strong> Kliknite na <Star className="h-3 w-3 inline" /> da postavite sliku kao profilnu.
                        Profilna slika se prikazuje na rezultatima pretrage.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {spa.galerija.map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`relative group rounded-lg overflow-hidden border-2 ${
                            spa.featured_slika === imageUrl ? 'border-primary shadow-lg' : 'border-gray-200'
                          }`}
                        >
                          <div className="aspect-square relative">
                            <img
                              src={imageUrl}
                              alt={`Slika ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {spa.featured_slika === imageUrl && (
                              <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                <Star className="h-3 w-3 fill-current" />
                                Profilna
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {spa.featured_slika !== imageUrl && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => setFeaturedImage(imageUrl)}
                                  title="Postavi kao profilnu"
                                >
                                  <Star className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteGalleryImage(imageUrl)}
                                title="Obriši sliku"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                        <div className="text-center">
                          {uploadingImage ? (
                            <Loader2 className="w-8 h-8 mx-auto mb-2 text-primary animate-spin" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Dodaj sliku</span>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={(e) => e.target.files?.[0] && uploadGalleryImage(e.target.files[0])}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Nema slika u galeriji</p>
                    <p className="text-muted-foreground mb-4">Dodajte slike da prikažete vašu banju</p>
                    <label className="inline-block">
                      <Button variant="outline" disabled={uploadingImage} asChild>
                        <span>
                          {uploadingImage ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Upload className="mr-2 h-4 w-4" />
                          )}
                          Dodaj prvu sliku
                        </span>
                      </Button>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => e.target.files?.[0] && uploadGalleryImage(e.target.files[0])}
                      />
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radno Vrijeme Tab */}
          <TabsContent value="radno-vrijeme">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Radno Vrijeme</CardTitle>
                  <Button onClick={updateProfile} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Sačuvaj
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dani.map((dan) => (
                    <div key={dan} className="flex items-center gap-4">
                      <div className="w-32 font-medium capitalize">{dan}</div>
                      <Switch
                        checked={!radnoVrijeme[dan]?.closed}
                        onCheckedChange={(checked) => {
                          setRadnoVrijeme({
                            ...radnoVrijeme,
                            [dan]: { ...radnoVrijeme[dan], closed: !checked }
                          });
                        }}
                      />
                      {!radnoVrijeme[dan]?.closed && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={radnoVrijeme[dan]?.open || ''}
                            onChange={(e) => {
                              setRadnoVrijeme({
                                ...radnoVrijeme,
                                [dan]: { ...radnoVrijeme[dan], open: e.target.value }
                              });
                            }}
                            className="w-32"
                          />
                          <span>-</span>
                          <Input
                            type="time"
                            value={radnoVrijeme[dan]?.close || ''}
                            onChange={(e) => {
                              setRadnoVrijeme({
                                ...radnoVrijeme,
                                [dan]: { ...radnoVrijeme[dan], close: e.target.value }
                              });
                            }}
                            className="w-32"
                          />
                        </div>
                      )}
                      {radnoVrijeme[dan]?.closed && (
                        <span className="text-muted-foreground">Zatvoreno</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Paket Dialog */}
        <Dialog open={paketDialog} onOpenChange={setPaketDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPaket ? 'Uredi Paket' : 'Novi Paket'}</DialogTitle>
              <DialogDescription>
                Kreirajte paket terapija sa posebnom cijenom
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Naziv</Label>
                <Input
                  value={paketData.naziv || ''}
                  onChange={(e) => setPaketData({ ...paketData, naziv: e.target.value })}
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={paketData.opis || ''}
                  onChange={(e) => setPaketData({ ...paketData, opis: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Trajanje (dana)</Label>
                  <Input
                    type="number"
                    value={paketData.trajanje_dana || ''}
                    onChange={(e) => setPaketData({ ...paketData, trajanje_dana: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Cijena (KM)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paketData.cijena || ''}
                    onChange={(e) => setPaketData({ ...paketData, cijena: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaketDialog(false)}>
                Otkaži
              </Button>
              <Button onClick={savePaket} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sačuvaj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Custom Terapija Dialog */}
        <Dialog open={customTerapijaDialog} onOpenChange={setCustomTerapijaDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCustomTerapija ? 'Uredi Terapiju' : 'Nova Terapija'}</DialogTitle>
              <DialogDescription>
                Dodajte custom terapiju koja nije u standardnoj listi
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Naziv *</Label>
                <Input
                  value={customTerapijaData.naziv || ''}
                  onChange={(e) => setCustomTerapijaData({ ...customTerapijaData, naziv: e.target.value })}
                  placeholder="Npr: Specijalna masaža"
                />
              </div>
              <div>
                <Label>Opis</Label>
                <Textarea
                  value={customTerapijaData.opis || ''}
                  onChange={(e) => setCustomTerapijaData({ ...customTerapijaData, opis: e.target.value })}
                  rows={3}
                  placeholder="Kratak opis terapije..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cijena (KM)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={customTerapijaData.cijena || ''}
                    onChange={(e) => setCustomTerapijaData({ ...customTerapijaData, cijena: parseFloat(e.target.value) || undefined })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Trajanje (minuta)</Label>
                  <Input
                    type="number"
                    value={customTerapijaData.trajanje_minuta || ''}
                    onChange={(e) => setCustomTerapijaData({ ...customTerapijaData, trajanje_minuta: parseInt(e.target.value) || undefined })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomTerapijaDialog(false)}>
                Otkaži
              </Button>
              <Button onClick={saveCustomTerapija} disabled={saving || !customTerapijaData.naziv}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sačuvaj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              alt="Preview"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </>
  );
}

// Sortable Paket Item Component
function SortablePaketItem({
  paket,
  onEdit,
  onDelete,
}: {
  paket: Paket;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: paket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-4">
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing pt-1">
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{paket.naziv}</h3>
          {paket.opis && <p className="text-sm text-muted-foreground mt-1">{paket.opis}</p>}
          <div className="flex items-center gap-4 mt-2 text-sm">
            {paket.trajanje_dana && <span>Trajanje: {paket.trajanje_dana} dana</span>}
            <span className="font-bold text-primary">{paket.cijena} KM</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
