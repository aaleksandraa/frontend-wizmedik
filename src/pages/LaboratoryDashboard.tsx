import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LocationInput } from '@/components/LocationInput';
import { 
  FlaskConical, BarChart3, Settings, Image as ImageIcon,
  Clock, Package, Loader2, Plus, Edit, Trash2, Upload, X, Star, Key, GripVertical
} from 'lucide-react';
import axios from 'axios';
import { citiesAPI, uploadAPI } from '@/services/api';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface Laboratory {
  id: number;
  naziv: string;
  email: string;
  telefon: string;
  telefon_2?: string;
  adresa: string;
  grad: string;
  postanski_broj?: string;
  opis?: string;
  kratak_opis?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  featured_slika?: string;
  galerija?: string[];
  radno_vrijeme?: Record<string, { open: string; close: string; closed: boolean }>;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_pregleda: number;
  online_rezultati?: boolean;
  prosjecno_vrijeme_rezultata?: string;
}

interface Statistics {
  ukupno_analiza: number;
  aktivne_analize: number;
  analize_na_akciji: number;
  ukupno_paketa: number;
  broj_pregleda: number;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_slika: number;
}

interface City {
  id: number;
  naziv: string;
  slug: string;
}

interface Category {
  id: number;
  naziv: string;
  slug: string;
  opis?: string;
  ikona?: string;
  boja?: string;
}

interface Analysis {
  id: number;
  naziv: string;
  kategorija_id: number;
  kategorija?: Category;
  cijena: number;
  akcijska_cijena?: number;
  opis?: string;
  priprema?: string;
  vrijeme_rezultata?: string;
  aktivan: boolean;
}

interface Package {
  id: number;
  naziv: string;
  opis?: string;
  cijena: number;
  ustedite: number;
  prikazi_ustedite: boolean;
  analize_ids: number[];
  analize?: Analysis[];
  aktivan: boolean;
  redoslijed: number;
}

// Sortable Analysis Item Component
function SortableAnalysisItem({ analysis, onEdit, onDelete }: { analysis: Analysis; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: analysis.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium">{analysis.naziv}</p>
              {!analysis.aktivan && <Badge variant="secondary">Neaktivna</Badge>}
              {analysis.akcijska_cijena && <Badge variant="destructive">Akcija</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{analysis.kategorija?.naziv}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-semibold text-primary">
                {analysis.akcijska_cijena ? (
                  <>
                    <span className="line-through text-muted-foreground mr-2">{analysis.cijena} KM</span>
                    {analysis.akcijska_cijena} KM
                  </>
                ) : (
                  `${analysis.cijena} KM`
                )}
              </span>
              {analysis.vrijeme_rezultata && (
                <span className="text-muted-foreground">• {analysis.vrijeme_rezultata}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sortable Package Item Component
function SortablePackageItem({ pkg, analyses, onEdit, onDelete }: { pkg: Package; analyses: Analysis[]; onEdit: () => void; onDelete: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pkg.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`hover:shadow-md transition-shadow ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-lg">{pkg.naziv}</p>
              {!pkg.aktivan && <Badge variant="secondary">Neaktivan</Badge>}
            </div>
            {pkg.opis && <p className="text-sm text-muted-foreground mb-2">{pkg.opis}</p>}
            <div className="flex items-center gap-4 mb-3">
              <span className="text-2xl font-bold text-primary">{pkg.cijena} KM</span>
              {pkg.prikazi_ustedite && pkg.ustedite > 0 && (
                <Badge variant="destructive">Uštedite {Number(pkg.ustedite).toFixed(2)} KM</Badge>
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium mb-1">Uključene analize ({pkg.analize_ids.length}):</p>
              <div className="flex flex-wrap gap-1">
                {pkg.analize_ids.map(id => {
                  const analysis = analyses.find(a => a.id === id);
                  return analysis ? (
                    <Badge key={id} variant="outline" className="text-xs">{analysis.naziv}</Badge>
                  ) : null;
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LaboratoryDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [laboratory, setLaboratory] = useState<Laboratory | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  
  // Cities
  const [cities, setCities] = useState<City[]>([]);
  
  // Analyses
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddAnalysis, setShowAddAnalysis] = useState(false);
  const [editingAnalysis, setEditingAnalysis] = useState<Analysis | null>(null);
  const [analysisForm, setAnalysisForm] = useState({
    naziv: '',
    kategorija_id: '',
    cijena: '',
    akcijska_cijena: '',
    opis: '',
    priprema: '',
    vrijeme_rezultata: '',
    aktivan: true
  });
  
  // Packages
  const [packages, setPackages] = useState<Package[]>([]);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [packageForm, setPackageForm] = useState({
    naziv: '',
    opis: '',
    cijena: '',
    analize_ids: [] as number[],
    prikazi_ustedite: true
  });
  
  // Gallery
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  
  // Password change
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user?.role === 'laboratory') {
      fetchData();
      fetchCities();
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      const [profileRes, statsRes, analyzesRes, packagesRes] = await Promise.all([
        axios.get(${API_URL}/laboratory/profile', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(${API_URL}/laboratory/statistics', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(${API_URL}/laboratory/analize', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(${API_URL}/laboratory/paketi', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      
      setLaboratory(profileRes.data);
      setStatistics(statsRes.data);
      setAnalyses(analyzesRes.data || []);
      setPackages(packagesRes.data || []);

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
  
  const fetchCities = async () => {
    try {
      const res = await citiesAPI.getAll();
      setCities(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const res = await axios.get(${API_URL}/laboratorije/kategorije/all');
      setCategories(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Profile handlers
  const updateProfile = async () => {
    if (!laboratory) return;
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(${API_URL}/laboratory/profile', laboratory, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Uspjeh', description: 'Profil ažuriran' });
      setEditingProfile(false);
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće ažurirati profil', 
        variant: 'destructive' 
      });
    }
  };

  const updateRadnoVrijeme = (dan: string, field: string, value: any) => {
    if (!laboratory) return;
    setLaboratory({
      ...laboratory,
      radno_vrijeme: {
        ...laboratory.radno_vrijeme,
        [dan]: {
          ...laboratory.radno_vrijeme?.[dan],
          [field]: value
        }
      }
    });
  };

  const handleChangePassword = async () => {
    if (!passwordForm.new_password || !passwordForm.current_password) {
      toast({ title: 'Greška', description: 'Popunite sva polja', variant: 'destructive' });
      return;
    }
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast({ title: 'Greška', description: 'Lozinke se ne poklapaju', variant: 'destructive' });
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast({ title: 'Greška', description: 'Lozinka mora imati najmanje 8 karaktera', variant: 'destructive' });
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(${API_URL}/laboratory/change-password', passwordForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Uspjeh', description: 'Lozinka promijenjena' });
      setShowChangePassword(false);
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće promijeniti lozinku', 
        variant: 'destructive' 
      });
    }
  };

  // Analysis handlers
  const resetAnalysisForm = () => {
    setAnalysisForm({
      naziv: '',
      kategorija_id: '',
      cijena: '',
      akcijska_cijena: '',
      opis: '',
      priprema: '',
      vrijeme_rezultata: '',
      aktivan: true
    });
    setEditingAnalysis(null);
  };

  const openAnalysisDialog = (analysis?: Analysis) => {
    if (analysis) {
      setEditingAnalysis(analysis);
      setAnalysisForm({
        naziv: analysis.naziv,
        kategorija_id: analysis.kategorija_id.toString(),
        cijena: analysis.cijena.toString(),
        akcijska_cijena: analysis.akcijska_cijena?.toString() || '',
        opis: analysis.opis || '',
        priprema: analysis.priprema || '',
        vrijeme_rezultata: analysis.vrijeme_rezultata || '',
        aktivan: analysis.aktivan
      });
    } else {
      resetAnalysisForm();
    }
    setShowAddAnalysis(true);
  };

  const handleSaveAnalysis = async () => {
    if (!analysisForm.naziv || !analysisForm.kategorija_id || !analysisForm.cijena) {
      toast({ title: 'Greška', description: 'Popunite obavezna polja', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const data = {
        naziv: analysisForm.naziv,
        kategorija_id: parseInt(analysisForm.kategorija_id),
        cijena: parseFloat(analysisForm.cijena),
        akcijska_cijena: analysisForm.akcijska_cijena ? parseFloat(analysisForm.akcijska_cijena) : null,
        opis: analysisForm.opis || null,
        priprema: analysisForm.priprema || null,
        vrijeme_rezultata: analysisForm.vrijeme_rezultata || null,
        aktivan: analysisForm.aktivan
      };

      if (editingAnalysis) {
        await axios.put(`${API_URL}/laboratory/analize/${editingAnalysis.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Uspjeh', description: 'Analiza ažurirana' });
      } else {
        await axios.post(${API_URL}/laboratory/analize', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Uspjeh', description: 'Analiza dodana' });
      }
      
      setShowAddAnalysis(false);
      resetAnalysisForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće sačuvati analizu', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeleteAnalysis = async (id: number) => {
    if (!confirm('Obrisati analizu?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/laboratory/analize/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Uspjeh', description: 'Analiza obrisana' });
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće obrisati analizu', 
        variant: 'destructive' 
      });
    }
  };

  // Package handlers
  const resetPackageForm = () => {
    setPackageForm({
      naziv: '',
      opis: '',
      cijena: '',
      analize_ids: [],
      prikazi_ustedite: true
    });
    setEditingPackage(null);
  };

  const openPackageDialog = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setPackageForm({
        naziv: pkg.naziv,
        opis: pkg.opis || '',
        cijena: pkg.cijena.toString(),
        analize_ids: pkg.analize_ids,
        prikazi_ustedite: pkg.prikazi_ustedite ?? true
      });
    } else {
      resetPackageForm();
    }
    setShowAddPackage(true);
  };

  const handleSavePackage = async () => {
    if (!packageForm.naziv || !packageForm.cijena || packageForm.analize_ids.length < 2) {
      toast({ title: 'Greška', description: 'Popunite sva polja i odaberite najmanje 2 analize', variant: 'destructive' });
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const data = {
        naziv: packageForm.naziv,
        opis: packageForm.opis || null,
        cijena: parseFloat(packageForm.cijena),
        analize_ids: packageForm.analize_ids,
        prikazi_ustedite: packageForm.prikazi_ustedite
      };

      if (editingPackage) {
        await axios.put(`${API_URL}/laboratory/paketi/${editingPackage.id}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Uspjeh', description: 'Paket ažuriran' });
      } else {
        await axios.post(${API_URL}/laboratory/paketi', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast({ title: 'Uspjeh', description: 'Paket kreiran' });
      }
      
      setShowAddPackage(false);
      resetPackageForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće sačuvati paket', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeletePackage = async (id: number) => {
    if (!confirm('Obrisati paket?')) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_URL}/laboratory/paketi/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast({ title: 'Uspjeh', description: 'Paket obrisan' });
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće obrisati paket', 
        variant: 'destructive' 
      });
    }
  };

  // Gallery handlers
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Greška', description: 'Odaberite sliku (JPG, PNG, GIF)', variant: 'destructive' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Greška', description: 'Slika ne smije biti veća od 5MB', variant: 'destructive' });
      return;
    }

    setUploadingGalleryImage(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'laboratories');
      const newImages = [...(laboratory?.galerija || []), response.data.url];
      
      const token = localStorage.getItem('auth_token');
      await axios.put(${API_URL}/laboratory/profile', 
        { galerija: newImages }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLaboratory({ ...laboratory!, galerija: newImages });
      toast({ title: 'Uspjeh', description: 'Slika dodana u galeriju' });
      
      if (galleryInputRef.current) {
        galleryInputRef.current.value = '';
      }
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće uploadovati sliku', variant: 'destructive' });
    } finally {
      setUploadingGalleryImage(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string) => {
    if (!confirm('Obrisati sliku iz galerije?')) return;
    
    try {
      const newImages = (laboratory?.galerija || []).filter(img => img !== imageUrl);
      const token = localStorage.getItem('auth_token');
      await axios.put(${API_URL}/laboratory/profile', 
        { galerija: newImages }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLaboratory({ ...laboratory!, galerija: newImages });
      toast({ title: 'Uspjeh', description: 'Slika obrisana' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće obrisati sliku', variant: 'destructive' });
    }
  };

  const handleSetFeaturedImage = async (imageUrl: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put(${API_URL}/laboratory/profile', 
        { featured_slika: imageUrl }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setLaboratory({ ...laboratory!, featured_slika: imageUrl });
      toast({ title: 'Uspjeh', description: 'Profilna slika postavljena' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće postaviti profilnu sliku', variant: 'destructive' });
    }
  };

  // Drag and drop handlers
  const handleAnalysisDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = analyses.findIndex((item) => item.id === active.id);
      const newIndex = analyses.findIndex((item) => item.id === over.id);

      const newAnalyses = arrayMove(analyses, oldIndex, newIndex);
      setAnalyses(newAnalyses);

      // Update redoslijed on backend
      try {
        const token = localStorage.getItem('auth_token');
        const updates = newAnalyses.map((analysis, index) => ({
          id: analysis.id,
          redoslijed: index
        }));

        await axios.put(${API_URL}/laboratory/analize/reorder', 
          { analyses: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({ title: 'Uspjeh', description: 'Redoslijed analiza ažuriran' });
      } catch (error) {
        toast({ title: 'Greška', description: 'Nije moguće ažurirati redoslijed', variant: 'destructive' });
        // Revert on error
        fetchData();
      }
    }
  };

  const handlePackageDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = packages.findIndex((item) => item.id === active.id);
      const newIndex = packages.findIndex((item) => item.id === over.id);

      const newPackages = arrayMove(packages, oldIndex, newIndex);
      setPackages(newPackages);

      // Update redoslijed on backend
      try {
        const token = localStorage.getItem('auth_token');
        const updates = newPackages.map((pkg, index) => ({
          id: pkg.id,
          redoslijed: index
        }));

        await axios.put(${API_URL}/laboratory/paketi/reorder', 
          { packages: updates },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast({ title: 'Uspjeh', description: 'Redoslijed paketa ažuriran' });
      } catch (error) {
        toast({ title: 'Greška', description: 'Nije moguće ažurirati redoslijed', variant: 'destructive' });
        // Revert on error
        fetchData();
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user?.role !== 'laboratory') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <FlaskConical className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nema dozvole</h2>
            <p className="text-muted-foreground">Samo laboratorije mogu pristupiti ovoj stranici.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              {laboratory?.featured_slika || laboratory?.galerija?.[0] ? (
                <img 
                  src={laboratory.featured_slika || laboratory.galerija![0]} 
                  alt="" 
                  className="w-16 h-16 rounded-lg object-cover border-4 border-primary/20" 
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <FlaskConical className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{laboratory?.naziv}</h1>
                <p className="text-muted-foreground">{laboratory?.grad}</p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ukupno Analiza</CardTitle>
                <FlaskConical className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.ukupno_analiza || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {statistics?.aktivne_analize || 0} aktivnih
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Paketi</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.ukupno_paketa || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Kreirani paketi
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pregledi</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{statistics?.broj_pregleda || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Ukupno pregleda profila
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ocjena</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
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
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="profil" className="space-y-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="profil" className="flex-1 min-w-[100px]">
                <Settings className="h-4 w-4 mr-2 hidden sm:inline" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="analize" className="flex-1 min-w-[100px]">
                <FlaskConical className="h-4 w-4 mr-2 hidden sm:inline" />
                Analize
              </TabsTrigger>
              <TabsTrigger value="paketi" className="flex-1 min-w-[100px]">
                <Package className="h-4 w-4 mr-2 hidden sm:inline" />
                Paketi
              </TabsTrigger>
              <TabsTrigger value="galerija" className="flex-1 min-w-[100px]">
                <ImageIcon className="h-4 w-4 mr-2 hidden sm:inline" />
                Galerija
              </TabsTrigger>
              <TabsTrigger value="radno-vrijeme" className="flex-1 min-w-[100px]">
                <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
                Radno Vrijeme
              </TabsTrigger>
            </TabsList>

            {/* PROFILE TAB */}
            <TabsContent value="profil" className="space-y-6">
              {/* Osnovni Podaci */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Osnovni Podaci</CardTitle>
                    {!editingProfile ? (
                      <Button variant="outline" onClick={() => setEditingProfile(true)}>Uredi</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setEditingProfile(false); fetchData(); }}>Odustani</Button>
                        <Button onClick={updateProfile}>Sačuvaj</Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {laboratory && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Naziv *</Label>
                          <Input
                            value={laboratory.naziv}
                            onChange={(e) => setLaboratory({ ...laboratory, naziv: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Grad *</Label>
                          <Select
                            value={laboratory.grad}
                            onValueChange={(value) => setLaboratory({ ...laboratory, grad: value })}
                            disabled={!editingProfile}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Odaberite grad" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.naziv}>
                                  {city.naziv}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Adresa *</Label>
                          <Input
                            value={laboratory.adresa}
                            onChange={(e) => setLaboratory({ ...laboratory, adresa: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Telefon *</Label>
                          <Input
                            value={laboratory.telefon}
                            onChange={(e) => setLaboratory({ ...laboratory, telefon: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Telefon 2</Label>
                          <Input
                            value={laboratory.telefon_2 || ''}
                            onChange={(e) => setLaboratory({ ...laboratory, telefon_2: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={laboratory.email || ''}
                            onChange={(e) => setLaboratory({ ...laboratory, email: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Website</Label>
                          <Input
                            value={laboratory.website || ''}
                            onChange={(e) => setLaboratory({ ...laboratory, website: e.target.value })}
                            disabled={!editingProfile}
                            placeholder="https://www.laboratorija.ba"
                          />
                        </div>
                        <div>
                          <Label>Postanski Broj</Label>
                          <Input
                            value={laboratory.postanski_broj || ''}
                            onChange={(e) => setLaboratory({ ...laboratory, postanski_broj: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea
                          value={laboratory.opis || ''}
                          onChange={(e) => setLaboratory({ ...laboratory, opis: e.target.value })}
                          disabled={!editingProfile}
                          rows={4}
                          placeholder="Opišite vašu laboratoriju, usluge koje nudite..."
                        />
                      </div>
                      
                      {/* Location Input */}
                      <LocationInput
                        latitude={laboratory.latitude}
                        longitude={laboratory.longitude}
                        googleMapsLink={laboratory.google_maps_link}
                        onLocationChange={(data) => {
                          setLaboratory({
                            ...laboratory,
                            latitude: data.latitude ?? undefined,
                            longitude: data.longitude ?? undefined,
                            google_maps_link: data.google_maps_link ?? undefined,
                          });
                        }}
                        disabled={!editingProfile}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Korisnički Nalog */}
              <Card>
                <CardHeader>
                  <CardTitle>Korisnički Nalog</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email za prijavu</Label>
                    <Input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email za prijavu se ne može mijenjati. Kontaktirajte administratora za promjenu.
                    </p>
                  </div>
                  <div>
                    <Button variant="outline" onClick={() => setShowChangePassword(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      Promijeni Lozinku
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Dialog */}
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Promjena Lozinke</DialogTitle>
                    <DialogDescription>
                      Unesite trenutnu lozinku i novu lozinku
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Trenutna Lozinka *</Label>
                      <Input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <Label>Nova Lozinka *</Label>
                      <Input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        placeholder="••••••••"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Najmanje 8 karaktera
                      </p>
                    </div>
                    <div>
                      <Label>Potvrdi Novu Lozinku *</Label>
                      <Input
                        type="password"
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => {
                        setShowChangePassword(false);
                        setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
                      }} className="flex-1">
                        Odustani
                      </Button>
                      <Button onClick={handleChangePassword} className="flex-1">
                        Sačuvaj
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* ANALIZE TAB */}
            <TabsContent value="analize" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Analize ({analyses.length})</h2>
                <Dialog open={showAddAnalysis} onOpenChange={(open) => { setShowAddAnalysis(open); if (!open) resetAnalysisForm(); }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Dodaj Analizu</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingAnalysis ? 'Uredi Analizu' : 'Dodaj Novu Analizu'}</DialogTitle>
                      <DialogDescription>
                        {editingAnalysis ? 'Ažurirajte podatke analize' : 'Unesite podatke za novu analizu'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Naziv *</Label>
                        <Input
                          value={analysisForm.naziv}
                          onChange={(e) => setAnalysisForm({ ...analysisForm, naziv: e.target.value })}
                          placeholder="Npr. Kompletna krvna slika"
                        />
                      </div>
                      <div>
                        <Label>Kategorija *</Label>
                        <Select value={analysisForm.kategorija_id} onValueChange={(val) => setAnalysisForm({ ...analysisForm, kategorija_id: val })}>
                          <SelectTrigger><SelectValue placeholder="Odaberi kategoriju" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>{cat.naziv}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cijena (KM) *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={analysisForm.cijena}
                            onChange={(e) => setAnalysisForm({ ...analysisForm, cijena: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label>Akcijska Cijena (KM)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={analysisForm.akcijska_cijena}
                            onChange={(e) => setAnalysisForm({ ...analysisForm, akcijska_cijena: e.target.value })}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea
                          value={analysisForm.opis}
                          onChange={(e) => setAnalysisForm({ ...analysisForm, opis: e.target.value })}
                          rows={3}
                          placeholder="Kratak opis analize..."
                        />
                      </div>
                      <div>
                        <Label>Priprema</Label>
                        <Textarea
                          value={analysisForm.priprema}
                          onChange={(e) => setAnalysisForm({ ...analysisForm, priprema: e.target.value })}
                          rows={2}
                          placeholder="Npr. Dolazak na tašte"
                        />
                      </div>
                      <div>
                        <Label>Vrijeme Rezultata</Label>
                        <Input
                          value={analysisForm.vrijeme_rezultata}
                          onChange={(e) => setAnalysisForm({ ...analysisForm, vrijeme_rezultata: e.target.value })}
                          placeholder="Npr. 24h, 2-3 dana"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={analysisForm.aktivan}
                          onChange={(e) => setAnalysisForm({ ...analysisForm, aktivan: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label>Aktivna (vidljiva na profilu)</Label>
                      </div>
                      <Button onClick={handleSaveAnalysis} className="w-full">
                        {editingAnalysis ? 'Sačuvaj Izmjene' : 'Dodaj Analizu'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {analyses.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FlaskConical className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nema analiza</h3>
                    <p className="text-muted-foreground mb-4">Dodajte analize koje vaša laboratorija nudi</p>
                    <Button onClick={() => setShowAddAnalysis(true)}><Plus className="h-4 w-4 mr-2" /> Dodaj Analizu</Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Savjet:</strong> Povucite <GripVertical className="h-4 w-4 inline" /> za promjenu redoslijeda prikaza analiza na profilu.
                    </p>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleAnalysisDragEnd}
                  >
                    <SortableContext
                      items={analyses.map(a => a.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {analyses.map(analysis => (
                          <SortableAnalysisItem
                            key={analysis.id}
                            analysis={analysis}
                            onEdit={() => openAnalysisDialog(analysis)}
                            onDelete={() => handleDeleteAnalysis(analysis.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </TabsContent>

            {/* PAKETI TAB */}
            <TabsContent value="paketi" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Paketi Analiza ({packages.length})</h2>
                <Dialog open={showAddPackage} onOpenChange={(open) => { setShowAddPackage(open); if (!open) resetPackageForm(); }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Kreiraj Paket</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingPackage ? 'Uredi Paket' : 'Kreiraj Novi Paket'}</DialogTitle>
                      <DialogDescription>
                        Kreirajte paket analiza sa popustom. Odaberite najmanje 2 analize.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Naziv Paketa *</Label>
                        <Input
                          value={packageForm.naziv}
                          onChange={(e) => setPackageForm({ ...packageForm, naziv: e.target.value })}
                          placeholder="Npr. Osnovni Check-up"
                        />
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea
                          value={packageForm.opis}
                          onChange={(e) => setPackageForm({ ...packageForm, opis: e.target.value })}
                          rows={3}
                          placeholder="Kratak opis paketa..."
                        />
                      </div>
                      <div>
                        <Label>Cijena Paketa (KM) *</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={packageForm.cijena}
                          onChange={(e) => setPackageForm({ ...packageForm, cijena: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <Label>Odaberite Analize (min. 2) *</Label>
                        <div className="border rounded-lg p-4 max-h-96 overflow-y-auto space-y-2">
                          {analyses.filter(a => a.aktivan).map(analysis => (
                            <label key={analysis.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={packageForm.analize_ids.includes(analysis.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPackageForm({ ...packageForm, analize_ids: [...packageForm.analize_ids, analysis.id] });
                                  } else {
                                    setPackageForm({ ...packageForm, analize_ids: packageForm.analize_ids.filter(id => id !== analysis.id) });
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-sm">{analysis.naziv}</p>
                                <p className="text-xs text-muted-foreground">{analysis.kategorija?.naziv} • {analysis.cijena} KM</p>
                              </div>
                            </label>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Odabrano: {packageForm.analize_ids.length} analiza
                        </p>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <input
                          type="checkbox"
                          id="prikazi_ustedite"
                          checked={packageForm.prikazi_ustedite}
                          onChange={(e) => setPackageForm({ ...packageForm, prikazi_ustedite: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <Label htmlFor="prikazi_ustedite" className="cursor-pointer">
                          Prikaži "Uštedite" badge na profilu (preporučeno)
                        </Label>
                      </div>
                      <Button onClick={handleSavePackage} className="w-full" disabled={packageForm.analize_ids.length < 2}>
                        {editingPackage ? 'Sačuvaj Izmjene' : 'Kreiraj Paket'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {packages.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nema paketa</h3>
                    <p className="text-muted-foreground mb-4">Kreirajte pakete analiza sa popustom</p>
                    <Button onClick={() => setShowAddPackage(true)}><Plus className="h-4 w-4 mr-2" /> Kreiraj Paket</Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Savjet:</strong> Povucite <GripVertical className="h-4 w-4 inline" /> za promjenu redoslijeda prikaza paketa na profilu.
                    </p>
                  </div>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handlePackageDragEnd}
                  >
                    <SortableContext
                      items={packages.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {packages.map(pkg => (
                          <SortablePackageItem
                            key={pkg.id}
                            pkg={pkg}
                            analyses={analyses}
                            onEdit={() => openPackageDialog(pkg)}
                            onDelete={() => handleDeletePackage(pkg.id)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </>
              )}
            </TabsContent>

            {/* GALERIJA TAB */}
            <TabsContent value="galerija" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Galerija Slika</CardTitle>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={galleryInputRef}
                        accept="image/*"
                        onChange={handleGalleryImageUpload}
                        className="hidden"
                      />
                      <Button
                        onClick={() => galleryInputRef.current?.click()}
                        disabled={uploadingGalleryImage}
                      >
                        {uploadingGalleryImage ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Učitavanje...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Dodaj Sliku
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {laboratory?.galerija && laboratory.galerija.length > 0 ? (
                    <>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Profilna slika:</strong> Kliknite na <Star className="h-3 w-3 inline" /> da postavite sliku kao profilnu.
                          Profilna slika se prikazuje na rezultatima pretrage.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {laboratory.galerija.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={`relative group rounded-lg overflow-hidden border-2 ${
                              laboratory.featured_slika === imageUrl ? 'border-primary shadow-lg' : 'border-gray-200'
                            }`}
                          >
                            <div className="aspect-square relative">
                              <img
                                src={imageUrl}
                                alt={`Slika ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {laboratory.featured_slika === imageUrl && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Profilna
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {laboratory.featured_slika !== imageUrl && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetFeaturedImage(imageUrl)}
                                    title="Postavi kao profilnu"
                                  >
                                    <Star className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteImage(imageUrl)}
                                  title="Obriši sliku"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nema slika u galeriji</h3>
                      <p className="text-muted-foreground mb-4">
                        Dodajte slike vaše laboratorije da bi pacijenti mogli vidjeti vaš prostor
                      </p>
                      <Button onClick={() => galleryInputRef.current?.click()}>
                        <Upload className="h-4 w-4 mr-2" />
                        Dodaj Prvu Sliku
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips Card */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-base">Savjeti za Galeriju</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• <strong>Profilna slika:</strong> Postavite najbolju sliku kao profilnu za prikaz na rezultatima pretrage</p>
                  <p>• <strong>Kvalitet:</strong> Koristite slike visokog kvaliteta (preporučeno 1200x800px ili veće)</p>
                  <p>• <strong>Veličina:</strong> Maksimalna veličina slike je 5MB</p>
                  <p>• <strong>Format:</strong> Podržani formati: JPG, PNG, GIF</p>
                  <p>• <strong>Sadržaj:</strong> Dodajte slike čekaonice, laboratorije, opreme, osoblja (uz dozvolu)</p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* RADNO VRIJEME TAB */}
            <TabsContent value="radno-vrijeme" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Radno Vrijeme</CardTitle>
                    {!editingProfile ? (
                      <Button variant="outline" onClick={() => setEditingProfile(true)}>Uredi</Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => { setEditingProfile(false); fetchData(); }}>Odustani</Button>
                        <Button onClick={updateProfile}>Sačuvaj</Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {laboratory && (
                    <div className="space-y-3">
                      {['ponedeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota', 'nedjelja'].map((dan) => (
                        <div key={dan} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                          <div className="w-32">
                            <Label className="capitalize font-medium">{dan}</Label>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={laboratory.radno_vrijeme?.[dan]?.open || '08:00'}
                              onChange={(e) => updateRadnoVrijeme(dan, 'open', e.target.value)}
                              disabled={!editingProfile || laboratory.radno_vrijeme?.[dan]?.closed}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              value={laboratory.radno_vrijeme?.[dan]?.close || '16:00'}
                              onChange={(e) => updateRadnoVrijeme(dan, 'close', e.target.value)}
                              disabled={!editingProfile || laboratory.radno_vrijeme?.[dan]?.closed}
                              className="w-32"
                            />
                            <label className="flex items-center gap-2 ml-4">
                              <input
                                type="checkbox"
                                checked={laboratory.radno_vrijeme?.[dan]?.closed || false}
                                onChange={(e) => updateRadnoVrijeme(dan, 'closed', e.target.checked)}
                                disabled={!editingProfile}
                                className="w-4 h-4"
                              />
                              <span className="text-sm">Zatvoreno</span>
                            </label>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
