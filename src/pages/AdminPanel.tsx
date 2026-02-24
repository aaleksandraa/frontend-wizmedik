import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, clinicsAPI, citiesAPI, specialtiesAPI, uploadAPI, blogAPI } from '@/services/api';
import { adminAPI } from '@/services/adminApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, Edit, Trash2, Users, Building2, Stethoscope, MapPin, Upload, Clock, 
  Palette, Settings, Search, LayoutGrid, List, ChevronRight, Phone, Mail,
  Globe, Image, X, Check, AlertCircle, FileText, Eye, Star, Shield, GripVertical,
  FlaskConical, Sparkles, Home, MessageSquare, User
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TemplateSettings } from '@/components/admin/TemplateSettings';
import { SpecialtyEditor } from '@/components/admin/SpecialtyEditor';
import { DoctorCardSettings } from '@/components/admin/DoctorCardSettings';
import { ClinicCardSettings } from '@/components/admin/ClinicCardSettings';
import { LegalSettings } from '@/components/admin/LegalSettings';
import { SpecialtyTemplateSettings } from '@/components/admin/SpecialtyTemplateSettings';
import { fixImageUrl } from '@/utils/imageUrl';
import { RegistrationSettings } from '@/components/admin/RegistrationSettings';
import { LogoSettings } from '@/components/admin/LogoSettings';
import HomepageSettings from '@/components/admin/HomepageSettings';
import { BlogTypographySettings } from '@/components/admin/BlogTypographySettings';
import { ListingTemplateSettings } from '@/components/admin/ListingTemplateSettings';
import Mkb10Manager from '@/components/admin/Mkb10Manager';
import { EntitiesManagement } from '@/components/admin/EntitiesManagement';
import MedicalCalendarManagement from '@/components/admin/MedicalCalendarManagement';
import { AdminProfileSettings } from '@/components/admin/AdminProfileSettings';
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

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  specijalnost: string;
  opis?: string;
  klinika_id?: number;
  specijalnost_id?: number;
  slika_url?: string;
  slika_profila?: string;
  grad: string;
  lokacija: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  radno_vrijeme?: any;
}

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  contact_email?: string;
  website?: string;
  slike: any[];
  radno_vrijeme: any;
  aktivan: boolean;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
}

interface Specialty {
  id: number;
  naziv: string;
  parent_id?: number;
  opis?: string;
  children?: Specialty[];
}

interface City {
  id: number;
  naziv: string;
  slug: string;
  u_gradu?: string;
  opis: string;
  detaljni_opis: string;
  populacija?: string;
  broj_bolnica: number;
  broj_doktora: number;
  broj_klinika: number;
  hitna_pomoc: string;
  kljucne_tacke: Array<{ naziv: string; url?: string }>;
  aktivan: boolean;
}

const getErrorMessage = (error: any): string => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    return Object.values(errors).flat().join('\n');
  }
  return error.response?.data?.message || error.message || "Došlo je do greške";
};

const normalizeCityLink = (value?: string): string | undefined => {
  const trimmed = (value || '').trim();
  return trimmed ? trimmed : undefined;
};

const normalizeCityKeyPoints = (
  value: unknown
): Array<{ naziv: string; url?: string }> => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: any) => {
      if (typeof item === 'string') {
        const naziv = item.trim();
        return naziv ? { naziv } : null;
      }

      if (!item || typeof item !== 'object') {
        return null;
      }

      const naziv = (item.naziv || item.name || '').toString().trim();
      const url = normalizeCityLink(item.url || item.link || '');

      if (!naziv) {
        return null;
      }

      return { naziv, ...(url ? { url } : {}) };
    })
    .filter(Boolean) as Array<{ naziv: string; url?: string }>;
};

// Sortable Specialty Item Component
function SortableSpecialtyItem({ 
  category, 
  onEdit, 
  onDelete, 
  onAddSubcategory,
  isSorting 
}: { 
  category: Specialty; 
  onEdit: (spec: Specialty) => void;
  onDelete: (id: number) => void;
  onAddSubcategory: (parentId: number) => void;
  isSorting: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'shadow-lg' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            {isSorting && (
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
              {category.children?.length || 0}
            </div>
            <div>
              <p className="font-semibold">{category.naziv}</p>
              {category.opis && <p className="text-sm text-muted-foreground">{category.opis}</p>}
            </div>
          </div>
          {!isSorting && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onAddSubcategory(category.id)}>
                <Plus className="h-4 w-4 mr-1" /> Pod
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(category)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="sm" onClick={() => onDelete(category.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {!isSorting && category.children && category.children.length > 0 && (
          <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20 space-y-2">
            {category.children.map((sub: any) => (
              <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">{sub.naziv}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(sub)}>
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(sub.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const defaultWorkingHours = {
  ponedeljak: { open: '08:00', close: '20:00', closed: false },
  utorak: { open: '08:00', close: '20:00', closed: false },
  sreda: { open: '08:00', close: '20:00', closed: false },
  četvrtak: { open: '08:00', close: '20:00', closed: false },
  petak: { open: '08:00', close: '20:00', closed: false },
  subota: { open: '09:00', close: '15:00', closed: false },
  nedelja: { open: '09:00', close: '15:00', closed: true }
};

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingClinic, setEditingClinic] = useState<Clinic | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showDoctorDialog, setShowDoctorDialog] = useState(false);
  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [showCityDialog, setShowCityDialog] = useState(false);
  
  const [doctorForm, setDoctorForm] = useState({
    ime: '', prezime: '', email: '', password: '', telefon: '', 
    specijalnost: '', specijalnost_id: '', klinika_id: '', opis: '',
    grad: '', lokacija: '', latitude: '', longitude: '', google_maps_link: '', slika_profila: '',
    radno_vrijeme: defaultWorkingHours
  });
  
  const [clinicForm, setClinicForm] = useState({
    naziv: '', opis: '', adresa: '', grad: '', telefon: '', email: '', password: '', 
    contact_email: '', website: '', latitude: '', longitude: '', google_maps_link: '', 
    slike: [] as string[], radno_vrijeme: defaultWorkingHours
  });

  const [cityForm, setCityForm] = useState({
    naziv: '', u_gradu: '', slug: '', opis: '', detaljni_opis: '', populacija: '',
    broj_bolnica: 0, hitna_pomoc: '124', kljucne_tacke: [] as Array<{ naziv: string; url?: string }>, aktivan: true
  });

  const [newKeyPoint, setNewKeyPoint] = useState({ naziv: '', url: '' });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isSortingSpecialties, setIsSortingSpecialties] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Blog state
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [blogSettings, setBlogSettings] = useState<any>({ doctors_can_write: false, homepage_display: 'latest', homepage_count: 3, featured_post_ids: [] });
  const [showBlogPostDialog, setShowBlogPostDialog] = useState(false);
  const [showBlogCategoryDialog, setShowBlogCategoryDialog] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<any>(null);
  const [editingBlogCategory, setEditingBlogCategory] = useState<any>(null);
  const [blogPostForm, setBlogPostForm] = useState({ naslov: '', sadrzaj: '', excerpt: '', thumbnail: '', meta_title: '', meta_description: '', meta_keywords: '', status: 'draft', category_ids: [] as number[] });
  const [blogCategoryForm, setBlogCategoryForm] = useState({ naziv: '', opis: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [doctorsRes, clinicsRes, specialtiesRes, citiesRes] = await Promise.all([
        adminAPI.getDoctors({ per_page: 1000 }),
        adminAPI.getClinics({ per_page: 1000 }),
        specialtiesAPI.getAll(), 
        adminAPI.getCities()
      ]);
      
      // Parse doctors response - handle both paginated and non-paginated responses
      let doctorsList = [];
      if (doctorsRes.data?.data && Array.isArray(doctorsRes.data.data)) {
        // Paginated response
        doctorsList = doctorsRes.data.data;
      } else if (Array.isArray(doctorsRes.data)) {
        // Direct array response
        doctorsList = doctorsRes.data;
      }
      console.log('✅ Doctors loaded:', doctorsList.length);
      setDoctors(doctorsList);
      
      // Parse clinics response
      let clinicsList = [];
      if (clinicsRes.data?.data && Array.isArray(clinicsRes.data.data)) {
        clinicsList = clinicsRes.data.data;
      } else if (Array.isArray(clinicsRes.data)) {
        clinicsList = clinicsRes.data;
      }
      console.log('✅ Clinics loaded:', clinicsList.length);
      setClinics(clinicsList);
      
      // Parse specialties response
      let specialtiesList = [];
      if (specialtiesRes.data?.data && Array.isArray(specialtiesRes.data.data)) {
        specialtiesList = specialtiesRes.data.data;
      } else if (Array.isArray(specialtiesRes.data)) {
        specialtiesList = specialtiesRes.data;
      }
      console.log('✅ Specialties loaded:', specialtiesList.length);
      setSpecialties(specialtiesList);
      
      // Parse cities response
      let citiesList = [];
      if (citiesRes.data?.data && Array.isArray(citiesRes.data.data)) {
        citiesList = citiesRes.data.data;
      } else if (Array.isArray(citiesRes.data)) {
        citiesList = citiesRes.data;
      }
      console.log('✅ Cities loaded:', citiesList.length);
      setCities(citiesList.map((city: any) => ({
        ...city,
        kljucne_tacke: normalizeCityKeyPoints(city.kljucne_tacke),
      })));
    } catch (error: any) {
      console.error('❌ Error fetching admin data:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast({ 
        title: "Greška pri učitavanju", 
        description: error.response?.data?.message || "Nije moguće učitati podatke. Pokušajte osvježiti stranicu.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (file: File, folder: 'doctors' | 'clinics' | 'cities') => {
    const response = await uploadAPI.uploadImage(file, folder);
    if (!response.data.url) throw new Error('URL not returned');
    return response.data.url;
  };

  const getAllSpecialties = (specs: Specialty[]): Specialty[] => {
    let result: Specialty[] = [];
    specs.forEach(spec => {
      result.push(spec);
      if (spec.children) result = result.concat(getAllSpecialties(spec.children));
    });
    return result;
  };

  const createSlug = (name: string): string => {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/č/g, 'c').replace(/ć/g, 'c').replace(/š/g, 's').replace(/ž/g, 'z')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  // Doctor handlers
  const resetDoctorForm = () => {
    setDoctorForm({
      ime: '', prezime: '', email: '', password: '', telefon: '', specijalnost: '', 
      specijalnost_id: '', klinika_id: '', opis: '', grad: '', lokacija: '', 
      latitude: '', longitude: '', google_maps_link: '', slika_profila: '', radno_vrijeme: defaultWorkingHours
    });
    setEditingDoctor(null);
  };

  const openDoctorDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setDoctorForm({
        ime: doctor.ime, prezime: doctor.prezime, email: doctor.email || '', password: '',
        telefon: doctor.telefon, specijalnost: doctor.specijalnost,
        specijalnost_id: doctor.specijalnost_id?.toString() || '',
        klinika_id: doctor.klinika_id?.toString() || '', opis: doctor.opis || '',
        grad: doctor.grad, lokacija: doctor.lokacija,
        latitude: doctor.latitude?.toString() || '', longitude: doctor.longitude?.toString() || '',
        google_maps_link: doctor.google_maps_link || '', slika_profila: doctor.slika_profila || '',
        radno_vrijeme: doctor.radno_vrijeme || defaultWorkingHours
      });
    } else {
      resetDoctorForm();
    }
    setShowDoctorDialog(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ime: doctorForm.ime, prezime: doctorForm.prezime, email: doctorForm.email,
        telefon: doctorForm.telefon, specijalnost: doctorForm.specijalnost,
        specijalnost_id: doctorForm.specijalnost_id ? parseInt(doctorForm.specijalnost_id) : null,
        klinika_id: doctorForm.klinika_id ? parseInt(doctorForm.klinika_id) : null,
        opis: doctorForm.opis, grad: doctorForm.grad, lokacija: doctorForm.lokacija,
        latitude: doctorForm.latitude ? parseFloat(doctorForm.latitude) : null,
        longitude: doctorForm.longitude ? parseFloat(doctorForm.longitude) : null,
        google_maps_link: doctorForm.google_maps_link || null,
        slika_profila: doctorForm.slika_profila || null, radno_vrijeme: doctorForm.radno_vrijeme,
        ...(doctorForm.password && { password: doctorForm.password })
      };
      if (editingDoctor) {
        await adminAPI.updateDoctor(editingDoctor.id, data);
        toast({ title: "Uspjeh", description: "Doktor ažuriran" });
      } else {
        await adminAPI.createDoctor({ ...data, password: doctorForm.password });
        toast({ title: "Uspjeh", description: "Doktor kreiran" });
      }
      setShowDoctorDialog(false);
      resetDoctorForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Obrisati doktora?')) return;
    try {
      await adminAPI.deleteDoctor(id);
      toast({ title: "Uspjeh", description: "Doktor obrisan" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };


  // Clinic handlers
  const resetClinicForm = () => {
    setClinicForm({
      naziv: '', opis: '', adresa: '', grad: '', telefon: '', email: '', password: '',
      contact_email: '', website: '', latitude: '', longitude: '', google_maps_link: '',
      slike: [], radno_vrijeme: defaultWorkingHours
    });
    setEditingClinic(null);
  };

  const openClinicDialog = (clinic?: Clinic) => {
    if (clinic) {
      setEditingClinic(clinic);
      setClinicForm({
        naziv: clinic.naziv, opis: clinic.opis || '', adresa: clinic.adresa, grad: clinic.grad,
        telefon: clinic.telefon, email: clinic.email || '', password: '',
        contact_email: clinic.contact_email || '', website: clinic.website || '',
        latitude: clinic.latitude?.toString() || '', longitude: clinic.longitude?.toString() || '',
        google_maps_link: clinic.google_maps_link || '',
        slike: Array.isArray(clinic.slike) ? clinic.slike : [],
        radno_vrijeme: clinic.radno_vrijeme || defaultWorkingHours
      });
    } else {
      resetClinicForm();
    }
    setShowClinicDialog(true);
  };

  const handleSaveClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        naziv: clinicForm.naziv, opis: clinicForm.opis, adresa: clinicForm.adresa,
        grad: clinicForm.grad, telefon: clinicForm.telefon, email: clinicForm.email,
        contact_email: clinicForm.contact_email, website: clinicForm.website,
        latitude: clinicForm.latitude ? parseFloat(clinicForm.latitude) : null,
        longitude: clinicForm.longitude ? parseFloat(clinicForm.longitude) : null,
        google_maps_link: clinicForm.google_maps_link || null,
        slike: clinicForm.slike, radno_vrijeme: clinicForm.radno_vrijeme
      };
      if (clinicForm.password) data.password = clinicForm.password;
      
      if (editingClinic) {
        await adminAPI.updateClinic(editingClinic.id, data);
        toast({ title: "Uspjeh", description: "Klinika ažurirana" });
      } else {
        await adminAPI.createClinic({ ...data, password: clinicForm.password });
        toast({ title: "Uspjeh", description: "Klinika kreirana" });
      }
      setShowClinicDialog(false);
      resetClinicForm();
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteClinic = async (id: number) => {
    if (!confirm('Obrisati kliniku?')) return;
    try {
      await adminAPI.deleteClinic(id);
      toast({ title: "Uspjeh", description: "Klinika obrisana" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  // City handlers
  const resetCityForm = () => {
    setCityForm({
      naziv: '', u_gradu: '', slug: '', opis: '', detaljni_opis: '', populacija: '',
      broj_bolnica: 0, hitna_pomoc: '124', kljucne_tacke: [], aktivan: true
    });
    setEditingCity(null);
    setNewKeyPoint({ naziv: '', url: '' });
  };

  const openCityDialog = (city?: City) => {
    console.log('Opening city dialog:', city);
    setNewKeyPoint({ naziv: '', url: '' }); // Reset new key point input
    if (city) {
      setEditingCity(city);
      const formData = {
        naziv: city.naziv, u_gradu: city.u_gradu || '', slug: city.slug, opis: city.opis || '',
        detaljni_opis: city.detaljni_opis || '', populacija: city.populacija || '',
        broj_bolnica: city.broj_bolnica || 0, hitna_pomoc: city.hitna_pomoc || '124',
        kljucne_tacke: normalizeCityKeyPoints(city.kljucne_tacke),
        aktivan: city.aktivan ?? true
      };
      console.log('Setting city form:', formData);
      setCityForm(formData);
    } else {
      resetCityForm();
    }
    setShowCityDialog(true);
  };

  const handleSaveCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug = createSlug(cityForm.naziv);
      const kljucneTacke = normalizeCityKeyPoints(cityForm.kljucne_tacke);
      const pendingNaziv = newKeyPoint.naziv.trim();
      const pendingUrl = normalizeCityLink(newKeyPoint.url);

      // If user typed a key point but didn't click "+" we still persist it on save.
      if (pendingNaziv) {
        const alreadyExists = kljucneTacke.some(
          (point) => point.naziv === pendingNaziv && (point.url || '') === (pendingUrl || '')
        );
        if (!alreadyExists) {
          kljucneTacke.push({ naziv: pendingNaziv, ...(pendingUrl ? { url: pendingUrl } : {}) });
        }
      }

      const data = { ...cityForm, slug, kljucne_tacke: kljucneTacke };
      
      console.log('Saving city:', { editingCity, data });
      
      if (editingCity) {
        const response = await adminAPI.updateCity(editingCity.id, data);
        console.log('Update response:', response);
        toast({ title: "Uspjeh", description: "Grad ažuriran" });
      } else {
        await adminAPI.createCity(data);
        toast({ title: "Uspjeh", description: "Grad kreiran" });
      }
      setShowCityDialog(false);
      resetCityForm();
      fetchData();
    } catch (error: any) {
      console.error('Save city error:', error);
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteCity = async (id: number) => {
    if (!confirm('Obrisati grad?')) return;
    try {
      await adminAPI.deleteCity(id);
      toast({ title: "Uspjeh", description: "Grad obrisan" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteSpecialty = async (id: number) => {
    if (!confirm('Obrisati specijalnost?')) return;
    try {
      await adminAPI.deleteSpecialty(id);
      toast({ title: "Uspjeh", description: "Specijalnost obrisana" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleEditSpecialty = async (specialty: Specialty) => {
    try {
      // Load full specialty data with all fields from admin endpoint
      const response = await adminAPI.getSpecialty(specialty.id);
      setEditingSpecialty(response.data);
    } catch (error: any) {
      toast({ title: "Greška", description: "Nije moguće učitati podatke specijalnosti", variant: "destructive" });
      console.error('Error loading specialty:', error);
    }
  };

  const addKeyPoint = () => {
    const naziv = newKeyPoint.naziv.trim();
    const url = normalizeCityLink(newKeyPoint.url);

    if (naziv) {
      setCityForm(prev => ({
        ...prev,
        kljucne_tacke: [...normalizeCityKeyPoints(prev.kljucne_tacke), { naziv, ...(url ? { url } : {}) }]
      }));
      setNewKeyPoint({ naziv: '', url: '' });
    }
  };

  // Blog handlers
  const fetchBlogData = async () => {
    try {
      const [postsRes, catsRes, settingsRes] = await Promise.all([
        blogAPI.adminGetPosts(),
        blogAPI.getCategories(),
        blogAPI.getSettings()
      ]);
      setBlogPosts(postsRes.data?.data || postsRes.data || []);
      setBlogCategories(catsRes.data || []);
      setBlogSettings(settingsRes.data || { doctors_can_write: false, homepage_display: 'latest', homepage_count: 3, featured_post_ids: [] });
    } catch (error) {
      console.error('Error fetching blog data:', error);
    }
  };

  const resetBlogPostForm = () => {
    setBlogPostForm({ naslov: '', sadrzaj: '', excerpt: '', thumbnail: '', meta_title: '', meta_description: '', meta_keywords: '', status: 'draft', category_ids: [] });
    setEditingBlogPost(null);
  };

  const openBlogPostDialog = (post?: any) => {
    if (post) {
      setEditingBlogPost(post);
      setBlogPostForm({
        naslov: post.naslov || '', sadrzaj: post.sadrzaj || '', excerpt: post.excerpt || '',
        thumbnail: post.thumbnail || '', meta_title: post.meta_title || '', meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '', status: post.status || 'draft',
        category_ids: post.categories?.map((c: any) => c.id) || []
      });
    } else {
      resetBlogPostForm();
    }
    setShowBlogPostDialog(true);
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting blog post:', blogPostForm);
    try {
      if (editingBlogPost) {
        await blogAPI.adminUpdatePost(editingBlogPost.id, blogPostForm);
        toast({ title: "Uspjeh", description: "Članak ažuriran" });
      } else {
        await blogAPI.adminCreatePost(blogPostForm);
        toast({ title: "Uspjeh", description: "Članak kreiran" });
      }
      setShowBlogPostDialog(false);
      resetBlogPostForm();
      fetchBlogData();
    } catch (error: any) {
      console.error('Blog post error:', error.response?.data);
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteBlogPost = async (id: number) => {
    if (!confirm('Obrisati članak?')) return;
    try {
      await blogAPI.adminDeletePost(id);
      toast({ title: "Uspjeh", description: "Članak obrisan" });
      fetchBlogData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const openBlogCategoryDialog = (cat?: any) => {
    if (cat) {
      setEditingBlogCategory(cat);
      setBlogCategoryForm({ naziv: cat.naziv || '', opis: cat.opis || '' });
    } else {
      setEditingBlogCategory(null);
      setBlogCategoryForm({ naziv: '', opis: '' });
    }
    setShowBlogCategoryDialog(true);
  };

  const handleSaveBlogCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlogCategory) {
        await blogAPI.adminUpdateCategory(editingBlogCategory.id, blogCategoryForm);
        toast({ title: "Uspjeh", description: "Kategorija ažurirana" });
      } else {
        await blogAPI.adminCreateCategory(blogCategoryForm);
        toast({ title: "Uspjeh", description: "Kategorija kreirana" });
      }
      setShowBlogCategoryDialog(false);
      fetchBlogData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteBlogCategory = async (id: number) => {
    if (!confirm('Obrisati kategoriju?')) return;
    try {
      await blogAPI.adminDeleteCategory(id);
      toast({ title: "Uspjeh", description: "Kategorija obrisana" });
      fetchBlogData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleSaveBlogSettings = async () => {
    try {
      await blogAPI.updateSettings(blogSettings);
      toast({ title: "Uspjeh", description: "Postavke sačuvane" });
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const toggleFeaturedPost = (postId: number) => {
    const featured = blogSettings.featured_post_ids || [];
    if (featured.includes(postId)) {
      setBlogSettings({ ...blogSettings, featured_post_ids: featured.filter((id: number) => id !== postId) });
    } else {
      setBlogSettings({ ...blogSettings, featured_post_ids: [...featured, postId] });
    }
  };

  // Specialty sorting handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSpecialties((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveSpecialtyOrder = async () => {
    try {
      const reorderedSpecialties = specialties.map((spec, index) => ({
        id: spec.id,
        sort_order: index
      }));

      await adminAPI.reorderSpecialties(reorderedSpecialties);
      toast({ title: "Uspjeh", description: "Redoslijed specijalnosti sačuvan" });
      setIsSortingSpecialties(false);
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const filteredDoctors = doctors.filter(d => 
    `${d.ime} ${d.prezime} ${d.specijalnost} ${d.grad}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredClinics = clinics.filter(c => 
    `${c.naziv} ${c.grad} ${c.adresa}`.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCities = cities.filter(c => 
    `${c.naziv} ${c.opis}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                Admin Panel
              </h1>
              <p className="text-muted-foreground mt-1">Upravljajte sadržajem platforme</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pretraži..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="hidden md:flex border rounded-lg p-1">
                <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Stethoscope className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{doctors.length}</p>
                    <p className="text-xs text-muted-foreground">Doktora</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{clinics.length}</p>
                    <p className="text-xs text-muted-foreground">Klinika</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <MapPin className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{cities.length}</p>
                    <p className="text-xs text-muted-foreground">Gradova</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{specialties.length}</p>
                    <p className="text-xs text-muted-foreground">Specijalnosti</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Main Tabs */}
          <Tabs defaultValue="doctors" className="space-y-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="doctors" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Stethoscope className="h-4 w-4 mr-2 hidden sm:inline" />
                Doktori
              </TabsTrigger>
              <TabsTrigger value="clinics" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Building2 className="h-4 w-4 mr-2 hidden sm:inline" />
                Klinike
              </TabsTrigger>
              <TabsTrigger value="cities" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <MapPin className="h-4 w-4 mr-2 hidden sm:inline" />
                Gradovi
              </TabsTrigger>
              <TabsTrigger value="specialties" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                Specijalnosti
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Palette className="h-4 w-4 mr-2 hidden sm:inline" />
                Templati
              </TabsTrigger>
              <TabsTrigger value="cards" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <LayoutGrid className="h-4 w-4 mr-2 hidden sm:inline" />
                Kartice
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 min-w-[100px] data-[state=active]:bg-background" onClick={() => fetchBlogData()}>
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="listing-templates" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <LayoutGrid className="h-4 w-4 mr-2 hidden sm:inline" />
                Listing
              </TabsTrigger>
              <TabsTrigger value="homepage" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Settings className="h-4 w-4 mr-2 hidden sm:inline" />
                Početna
              </TabsTrigger>
              <TabsTrigger value="legal" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Shield className="h-4 w-4 mr-2 hidden sm:inline" />
                Pravno
              </TabsTrigger>
              <TabsTrigger value="specialty-template" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Stethoscope className="h-4 w-4 mr-2 hidden sm:inline" />
                Spec. Postavke
              </TabsTrigger>
              <TabsTrigger value="registration" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Users className="h-4 w-4 mr-2 hidden sm:inline" />
                Registracija
              </TabsTrigger>
              <TabsTrigger value="logo" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Image className="h-4 w-4 mr-2 hidden sm:inline" />
                Logo
              </TabsTrigger>
              <TabsTrigger value="mkb10" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                MKB-10
              </TabsTrigger>
              <TabsTrigger value="laboratories" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <FlaskConical className="h-4 w-4 mr-2 hidden sm:inline" />
                Laboratorije
              </TabsTrigger>
              <TabsTrigger value="spas" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4 mr-2 hidden sm:inline" />
                Banje
              </TabsTrigger>
              <TabsTrigger value="care-homes" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Home className="h-4 w-4 mr-2 hidden sm:inline" />
                Domovi
              </TabsTrigger>
              <TabsTrigger value="questions" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <MessageSquare className="h-4 w-4 mr-2 hidden sm:inline" />
                Pitanja
              </TabsTrigger>
              <TabsTrigger value="medical-calendar" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
                Med. Kalendar
              </TabsTrigger>
              <TabsTrigger value="profile-settings" className="flex-1 min-w-[100px] data-[state=active]:bg-background">
                <User className="h-4 w-4 mr-2 hidden sm:inline" />
                Profil
              </TabsTrigger>
            </TabsList>

            {/* DOCTORS TAB */}
            <TabsContent value="doctors" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Doktori ({filteredDoctors.length})</h2>
                <Button onClick={() => openDoctorDialog()} className="gap-2">
                  <Plus className="h-4 w-4" /> Novi doktor
                </Button>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map(doctor => (
                    <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center justify-between'}>
                        <div className={viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1'}>
                          <div className="flex items-center gap-3">
                            {doctor.slika_profila ? (
                              <img src={doctor.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {doctor.ime[0]}{doctor.prezime[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Dr. {doctor.ime} {doctor.prezime}</p>
                              <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>
                            </div>
                          </div>
                          {viewMode === 'grid' && (
                            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                              <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {doctor.grad}</p>
                              <p className="flex items-center gap-2"><Mail className="h-3 w-3" /> {doctor.email}</p>
                            </div>
                          )}
                          {viewMode === 'list' && (
                            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {doctor.grad}</span>
                              <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {doctor.telefon}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 mt-3 md:mt-0">
                          <Button variant="outline" size="sm" onClick={() => openDoctorDialog(doctor)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteDoctor(doctor.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="col-span-full">
                    <CardContent className="p-8 text-center">
                      <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium mb-2">Nema doktora</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm ? 'Nema rezultata za vašu pretragu.' : 'Dodajte prvog doktora klikom na dugme iznad.'}
                      </p>
                      {!searchTerm && (
                        <Button onClick={() => openDoctorDialog()} className="gap-2">
                          <Plus className="h-4 w-4" /> Dodaj doktora
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* CLINICS TAB */}
            <TabsContent value="clinics" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Klinike ({filteredClinics.length})</h2>
                <Button onClick={() => openClinicDialog()} className="gap-2">
                  <Plus className="h-4 w-4" /> Nova klinika
                </Button>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {filteredClinics.map(clinic => (
                  <Card key={clinic.id} className="hover:shadow-md transition-shadow">
                    <CardContent className={viewMode === 'grid' ? 'p-4' : 'p-4 flex items-center justify-between'}>
                      <div className={viewMode === 'grid' ? '' : 'flex items-center gap-4 flex-1'}>
                        <div className="flex items-center gap-3">
                          {clinic.slike?.[0] ? (
                            <img src={clinic.slike[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-purple-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{clinic.naziv}</p>
                            <p className="text-sm text-muted-foreground">{clinic.grad}</p>
                          </div>
                        </div>
                        {viewMode === 'grid' && (
                          <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {clinic.adresa}</p>
                            <p className="flex items-center gap-2"><Phone className="h-3 w-3" /> {clinic.telefon}</p>
                          </div>
                        )}
                        {viewMode === 'list' && (
                          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {clinic.adresa}</span>
                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {clinic.telefon}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3 md:mt-0">
                        <Button variant="outline" size="sm" onClick={() => openClinicDialog(clinic)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClinic(clinic.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* CITIES TAB */}
            <TabsContent value="cities" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gradovi ({filteredCities.length})</h2>
                <Button onClick={() => openCityDialog()} className="gap-2">
                  <Plus className="h-4 w-4" /> Novi grad
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCities.map(city => (
                  <Card key={city.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{city.naziv}</h3>
                            {!city.aktivan && <Badge variant="secondary">Neaktivan</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{city.opis}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-semibold">{city.broj_bolnica}</p>
                          <p className="text-muted-foreground">Bolnica</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-semibold">{city.broj_doktora}</p>
                          <p className="text-muted-foreground">Doktora</p>
                        </div>
                        <div className="bg-muted/50 rounded p-2">
                          <p className="font-semibold">{city.broj_klinika}</p>
                          <p className="text-muted-foreground">Klinika</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openCityDialog(city)}>
                          <Edit className="h-4 w-4 mr-1" /> Uredi
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteCity(city.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* SPECIALTIES TAB */}
            <TabsContent value="specialties" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Specijalnosti ({specialties.length})</h2>
                <div className="flex gap-2">
                  {isSortingSpecialties ? (
                    <>
                      <Button variant="outline" onClick={() => {
                        setIsSortingSpecialties(false);
                        fetchData(); // Reset to original order
                      }}>
                        Otkaži
                      </Button>
                      <Button onClick={handleSaveSpecialtyOrder} className="gap-2">
                        <Check className="h-4 w-4" /> Sačuvaj redoslijed
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsSortingSpecialties(true)} className="gap-2">
                        <GripVertical className="h-4 w-4" /> Sortiraj
                      </Button>
                      <Button onClick={() => setEditingSpecialty({} as any)} className="gap-2">
                        <Plus className="h-4 w-4" /> Nova specijalnost
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={specialties.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                  disabled={!isSortingSpecialties}
                >
                  <div className="space-y-3">
                    {specialties.map(category => (
                      <SortableSpecialtyItem
                        key={category.id}
                        category={category}
                        onEdit={handleEditSpecialty}
                        onDelete={handleDeleteSpecialty}
                        onAddSubcategory={(parentId) => setEditingSpecialty({ parent_id: parentId } as any)}
                        isSorting={isSortingSpecialties}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </TabsContent>

            {/* TEMPLATES TAB */}
            <TabsContent value="templates">
              <TemplateSettings />
            </TabsContent>

            {/* CARDS TAB */}
            <TabsContent value="cards" className="space-y-6">
              <Tabs defaultValue="doctor-cards">
                <TabsList>
                  <TabsTrigger value="doctor-cards">Doktor kartice</TabsTrigger>
                  <TabsTrigger value="clinic-cards">Klinika kartice</TabsTrigger>
                </TabsList>
                <TabsContent value="doctor-cards" className="mt-4">
                  <DoctorCardSettings />
                </TabsContent>
                <TabsContent value="clinic-cards" className="mt-4">
                  <ClinicCardSettings />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* BLOG TAB */}
            <TabsContent value="blog" className="space-y-6">
              <Tabs defaultValue="posts">
                <TabsList>
                  <TabsTrigger value="posts">Članci</TabsTrigger>
                  <TabsTrigger value="categories">Kategorije</TabsTrigger>
                  <TabsTrigger value="settings">Postavke</TabsTrigger>
                  <TabsTrigger value="typography">Tipografija</TabsTrigger>
                </TabsList>

                {/* Blog Posts */}
                <TabsContent value="posts" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Članci ({blogPosts.length})</h2>
                    <Button onClick={() => navigate('/blog/editor')} className="gap-2">
                      <Plus className="h-4 w-4" /> Novi članak
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {blogPosts.map(post => (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            {post.thumbnail ? (
                              <img src={fixImageUrl(post.thumbnail) || ''} alt="" className="w-16 h-12 rounded object-cover" />
                            ) : (
                              <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{post.naslov}</p>
                                <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status === 'published' ? 'Objavljeno' : 'Nacrt'}</Badge>
                                {(blogSettings.featured_post_ids || []).includes(post.id) && <Badge variant="outline" className="text-yellow-600"><Star className="h-3 w-3 mr-1" />Istaknuto</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">{post.autor_name} • {post.views || 0} pregleda</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleFeaturedPost(post.id)} title={blogSettings.featured_post_ids?.includes(post.id) ? 'Ukloni iz istaknutih' : 'Dodaj u istaknute'}>
                              <Star className={`h-4 w-4 ${blogSettings.featured_post_ids?.includes(post.id) ? 'fill-yellow-500 text-yellow-500' : ''}`} />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/blog/editor/${post.slug}`)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteBlogPost(post.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {blogPosts.length === 0 && <p className="text-center text-muted-foreground py-8">Nema članaka</p>}
                  </div>
                </TabsContent>

                {/* Blog Categories */}
                <TabsContent value="categories" className="mt-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Kategorije ({blogCategories.length})</h2>
                      <p className="text-sm text-muted-foreground">Povucite i ispustite za promjenu redoslijeda</p>
                    </div>
                    <Button onClick={() => openBlogCategoryDialog()} className="gap-2">
                      <Plus className="h-4 w-4" /> Nova kategorija
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {blogCategories
                      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                      .map((cat, index) => (
                      <Card 
                        key={cat.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.effectAllowed = 'move';
                          e.dataTransfer.setData('text/plain', index.toString());
                          (e.target as HTMLElement).style.opacity = '0.5';
                        }}
                        onDragEnd={(e) => {
                          (e.target as HTMLElement).style.opacity = '1';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDrop={async (e) => {
                          e.preventDefault();
                          const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                          const toIndex = index;
                          
                          if (fromIndex === toIndex) return;
                          
                          const newCategories = [...blogCategories].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
                          const [movedItem] = newCategories.splice(fromIndex, 1);
                          newCategories.splice(toIndex, 0, movedItem);
                          
                          // Update sort_order for all categories
                          const updatedCategories = newCategories.map((cat, idx) => ({
                            id: cat.id,
                            sort_order: idx
                          }));
                          
                          try {
                            await blogAPI.adminUpdateCategoriesOrder(updatedCategories);
                            setBlogCategories(newCategories.map((cat, idx) => ({ ...cat, sort_order: idx })));
                            toast({ title: "Uspjeh", description: "Redoslijed kategorija ažuriran" });
                          } catch (error) {
                            toast({ title: "Greška", description: "Nije moguće ažurirati redoslijed", variant: "destructive" });
                          }
                        }}
                        className="cursor-move hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col gap-0.5">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                              </div>
                              <div>
                                <p className="font-medium">{cat.naziv}</p>
                                <p className="text-sm text-muted-foreground">{cat.posts_count || 0} članaka</p>
                                {cat.opis && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cat.opis}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => openBlogCategoryDialog(cat)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteBlogCategory(cat.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {/* Blog Settings */}
                <TabsContent value="settings" className="mt-4 space-y-6">
                  <Card>
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Doktori mogu pisati</p>
                          <p className="text-sm text-muted-foreground">Omogući doktorima da pišu članke</p>
                        </div>
                        <Switch checked={blogSettings.doctors_can_write} onCheckedChange={(checked) => setBlogSettings({ ...blogSettings, doctors_can_write: checked })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Prikaz na početnoj</Label>
                        <Select value={blogSettings.homepage_display} onValueChange={(v) => setBlogSettings({ ...blogSettings, homepage_display: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="latest">Najnoviji članci</SelectItem>
                            <SelectItem value="featured">Istaknuti članci</SelectItem>
                            <SelectItem value="none">Ne prikazuj</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Broj članaka na početnoj</Label>
                        <Select value={blogSettings.homepage_count?.toString()} onValueChange={(v) => setBlogSettings({ ...blogSettings, homepage_count: parseInt(v) })}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="6">6</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {blogSettings.homepage_display === 'featured' && (
                        <div className="space-y-2">
                          <Label>Istaknuti članci ({(blogSettings.featured_post_ids || []).length})</Label>
                          <p className="text-sm text-muted-foreground">Kliknite na zvjezdicu pored članka da ga dodate/uklonite</p>
                        </div>
                      )}
                      <Button onClick={handleSaveBlogSettings}>Sačuvaj postavke</Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Blog Typography */}
                <TabsContent value="typography" className="mt-4">
                  <BlogTypographySettings />
                </TabsContent>
              </Tabs>
            </TabsContent>

            {/* LISTING TEMPLATES TAB */}
            <TabsContent value="listing-templates" className="space-y-6">
              <ListingTemplateSettings />
            </TabsContent>

            {/* HOMEPAGE SETTINGS TAB */}
            <TabsContent value="homepage">
              <HomepageSettings />
            </TabsContent>

            {/* LEGAL SETTINGS TAB */}
            <TabsContent value="legal">
              <LegalSettings />
            </TabsContent>

            {/* SPECIALTY TEMPLATE TAB */}
            <TabsContent value="specialty-template">
              <SpecialtyTemplateSettings />
            </TabsContent>

            {/* REGISTRATION SETTINGS TAB */}
            <TabsContent value="registration">
              <RegistrationSettings />
            </TabsContent>

            {/* LOGO TAB */}
            <TabsContent value="logo">
              <LogoSettings />
            </TabsContent>

            {/* MKB-10 TAB */}
            <TabsContent value="mkb10">
              <Mkb10Manager />
            </TabsContent>

            {/* LABORATORIES TAB */}
            <TabsContent value="laboratories">
              <EntitiesManagement type="laboratories" />
            </TabsContent>

            {/* SPAS TAB */}
            <TabsContent value="spas">
              <EntitiesManagement type="spas" />
            </TabsContent>

            {/* CARE HOMES TAB */}
            <TabsContent value="care-homes">
              <EntitiesManagement type="care-homes" />
            </TabsContent>

            {/* QUESTIONS TAB */}
            <TabsContent value="questions">
              <EntitiesManagement type="questions" />
            </TabsContent>

            {/* MEDICAL CALENDAR TAB */}
            <TabsContent value="medical-calendar">
              <MedicalCalendarManagement />
            </TabsContent>

            {/* PROFILE SETTINGS TAB */}
            <TabsContent value="profile-settings">
              <AdminProfileSettings />
            </TabsContent>
          </Tabs>


          {/* DOCTOR DIALOG */}
          <Dialog open={showDoctorDialog} onOpenChange={setShowDoctorDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDoctor ? 'Uredi doktora' : 'Novi doktor'}</DialogTitle>
                <DialogDescription>Unesite podatke o doktoru</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveDoctor} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ime *</label>
                    <Input value={doctorForm.ime} onChange={(e) => setDoctorForm({...doctorForm, ime: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Prezime *</label>
                    <Input value={doctorForm.prezime} onChange={(e) => setDoctorForm({...doctorForm, prezime: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email *</label>
                    <Input type="email" value={doctorForm.email} onChange={(e) => setDoctorForm({...doctorForm, email: e.target.value})} required />
                  </div>
                  {!editingDoctor && (
                    <div>
                      <label className="text-sm font-medium">Lozinka *</label>
                      <Input type="password" value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} required />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium">Telefon *</label>
                    <Input value={doctorForm.telefon} onChange={(e) => setDoctorForm({...doctorForm, telefon: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Grad *</label>
                    <Select value={doctorForm.grad} onValueChange={(v) => setDoctorForm({...doctorForm, grad: v})}>
                      <SelectTrigger><SelectValue placeholder="Odaberi grad" /></SelectTrigger>
                      <SelectContent>
                        {cities.map(c => <SelectItem key={c.id} value={c.naziv}>{c.naziv}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Lokacija *</label>
                    <Input value={doctorForm.lokacija} onChange={(e) => setDoctorForm({...doctorForm, lokacija: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Specijalnost</label>
                    <Select value={doctorForm.specijalnost_id} onValueChange={(v) => {
                      const spec = getAllSpecialties(specialties).find(s => s.id.toString() === v);
                      setDoctorForm({...doctorForm, specijalnost_id: v, specijalnost: spec?.naziv || ''});
                    }}>
                      <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
                      <SelectContent>
                        {specialties.map(cat => (
                          <div key={cat.id}>
                            <SelectItem value={cat.id.toString()} className="font-semibold">{cat.naziv}</SelectItem>
                            {cat.children?.map(sub => (
                              <SelectItem key={sub.id} value={sub.id.toString()} className="pl-6">{sub.naziv}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Klinika</label>
                    <Select value={doctorForm.klinika_id} onValueChange={(v) => setDoctorForm({...doctorForm, klinika_id: v})}>
                      <SelectTrigger><SelectValue placeholder="Odaberi" /></SelectTrigger>
                      <SelectContent>
                        {clinics.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.naziv}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Opis</label>
                  <RichTextEditor 
                    value={doctorForm.opis} 
                    onChange={(value) => setDoctorForm({...doctorForm, opis: value})} 
                    rows={4} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Profilna slika</label>
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const url = await uploadImage(file, 'doctors');
                        setDoctorForm({...doctorForm, slika_profila: url});
                        toast({ title: "Slika uploadovana" });
                      } catch (err) {
                        toast({ title: "Greška", variant: "destructive" });
                      }
                    }
                  }} />
                  {doctorForm.slika_profila && <img src={doctorForm.slika_profila} alt="" className="w-20 h-20 rounded-lg object-cover mt-2" />}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingDoctor ? 'Sačuvaj' : 'Kreiraj'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowDoctorDialog(false)}>Otkaži</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* CLINIC DIALOG */}
          <Dialog open={showClinicDialog} onOpenChange={setShowClinicDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingClinic ? 'Uredi kliniku' : 'Nova klinika'}</DialogTitle>
                <DialogDescription>Unesite podatke o klinici</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveClinic} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Naziv *</label>
                    <Input value={clinicForm.naziv} onChange={(e) => setClinicForm({...clinicForm, naziv: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Grad *</label>
                    <Select value={clinicForm.grad} onValueChange={(v) => setClinicForm({...clinicForm, grad: v})}>
                      <SelectTrigger><SelectValue placeholder="Odaberi grad" /></SelectTrigger>
                      <SelectContent>
                        {cities.map(c => <SelectItem key={c.id} value={c.naziv}>{c.naziv}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Adresa *</label>
                    <Input value={clinicForm.adresa} onChange={(e) => setClinicForm({...clinicForm, adresa: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon *</label>
                    <Input value={clinicForm.telefon} onChange={(e) => setClinicForm({...clinicForm, telefon: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Login Email *</label>
                    <Input type="email" value={clinicForm.email} onChange={(e) => setClinicForm({...clinicForm, email: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">{editingClinic ? 'Nova lozinka' : 'Lozinka *'}</label>
                    <Input type="password" value={clinicForm.password} onChange={(e) => setClinicForm({...clinicForm, password: e.target.value})} required={!editingClinic} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Kontakt Email</label>
                    <Input type="email" value={clinicForm.contact_email} onChange={(e) => setClinicForm({...clinicForm, contact_email: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Website</label>
                    <Input value={clinicForm.website} onChange={(e) => setClinicForm({...clinicForm, website: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Opis</label>
                  <RichTextEditor 
                    value={clinicForm.opis} 
                    onChange={(value) => setClinicForm({...clinicForm, opis: value})} 
                    rows={4} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Slike</label>
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const url = await uploadImage(file, 'clinics');
                        setClinicForm({...clinicForm, slike: [...clinicForm.slike, url]});
                        toast({ title: "Slika uploadovana" });
                      } catch (err) {
                        toast({ title: "Greška", variant: "destructive" });
                      }
                    }
                  }} />
                  {clinicForm.slike.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {clinicForm.slike.map((img, i) => (
                        <div key={i} className="relative">
                          <img src={img} alt="" className="w-16 h-16 rounded object-cover" />
                          <button type="button" onClick={() => setClinicForm({...clinicForm, slike: clinicForm.slike.filter((_, idx) => idx !== i)})}
                            className="absolute -top-1 -right-1 bg-destructive text-white rounded-full p-0.5">
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingClinic ? 'Sačuvaj' : 'Kreiraj'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowClinicDialog(false)}>Otkaži</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* CITY DIALOG */}
          <Dialog open={showCityDialog} onOpenChange={setShowCityDialog}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCity ? 'Uredi grad' : 'Novi grad'}</DialogTitle>
                <DialogDescription>Unesite podatke o gradu</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveCity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Naziv *</label>
                    <Input value={cityForm.naziv} onChange={(e) => setCityForm({...cityForm, naziv: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">U gradu (npr. "u Sarajevu")</label>
                    <Input value={cityForm.u_gradu} onChange={(e) => setCityForm({...cityForm, u_gradu: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Populacija</label>
                    <Input value={cityForm.populacija} onChange={(e) => setCityForm({...cityForm, populacija: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Hitna pomoć</label>
                    <Input value={cityForm.hitna_pomoc} onChange={(e) => setCityForm({...cityForm, hitna_pomoc: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Kratak opis *</label>
                  <RichTextEditor 
                    value={cityForm.opis} 
                    onChange={(value) => setCityForm({...cityForm, opis: value})} 
                    rows={3} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Detaljan opis *</label>
                  <RichTextEditor 
                    value={cityForm.detaljni_opis} 
                    onChange={(value) => setCityForm({...cityForm, detaljni_opis: value})} 
                    rows={6} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Broj bolnica</label>
                    <Input type="number" value={cityForm.broj_bolnica} onChange={(e) => setCityForm({...cityForm, broj_bolnica: parseInt(e.target.value) || 0})} />
                  </div>
                  {editingCity && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Automatski izračunato:</p>
                      <p className="text-sm">Doktora: {editingCity.broj_doktora || 0} | Klinika: {editingCity.broj_klinika || 0}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium">Ključne tačke</label>
                  <div className="flex gap-2 mb-2">
                    <Input placeholder="Naziv" value={newKeyPoint.naziv} onChange={(e) => setNewKeyPoint({...newKeyPoint, naziv: e.target.value})} className="flex-1" />
                    <Input placeholder="URL (opciono)" value={newKeyPoint.url} onChange={(e) => setNewKeyPoint({...newKeyPoint, url: e.target.value})} className="flex-1" />
                    <Button type="button" variant="outline" onClick={addKeyPoint}><Plus className="h-4 w-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cityForm.kljucne_tacke.map((p, i) => (
                      <Badge key={i} variant="secondary" className="gap-2 py-1.5">
                        <span className="flex flex-col max-w-[220px]">
                          <span className="font-medium truncate">{p.naziv}</span>
                          {p.url && (
                            <span className="text-[11px] text-muted-foreground truncate">{p.url}</span>
                          )}
                        </span>
                        <button type="button" onClick={() => setCityForm(prev => ({...prev, kljucne_tacke: prev.kljucne_tacke.filter((_, idx) => idx !== i)}))}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="city-aktivan"
                    checked={cityForm.aktivan} 
                    onCheckedChange={(checked) => setCityForm(prev => ({...prev, aktivan: checked}))} 
                  />
                  <Label htmlFor="city-aktivan" className="text-sm cursor-pointer">Aktivan</Label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingCity ? 'Sačuvaj' : 'Kreiraj'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCityDialog(false)}>Otkaži</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* SPECIALTY EDITOR */}
          <SpecialtyEditor
            specialty={editingSpecialty}
            open={!!editingSpecialty}
            onClose={() => setEditingSpecialty(null)}
            onSaved={fetchData}
            allSpecialties={getAllSpecialties(specialties)}
          />

          {/* BLOG POST DIALOG */}
          <Dialog open={showBlogPostDialog} onOpenChange={setShowBlogPostDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlogPost ? 'Uredi članak' : 'Novi članak'}</DialogTitle>
                <DialogDescription>Unesite podatke o članku</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveBlogPost} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Naslov *</label>
                  <Input value={blogPostForm.naslov} onChange={(e) => setBlogPostForm({ ...blogPostForm, naslov: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Kratak opis (excerpt)</label>
                  <Textarea value={blogPostForm.excerpt} onChange={(e) => setBlogPostForm({ ...blogPostForm, excerpt: e.target.value })} rows={2} />
                </div>
                <div>
                  <label className="text-sm font-medium">Sadržaj *</label>
                  <Textarea value={blogPostForm.sadrzaj} onChange={(e) => setBlogPostForm({ ...blogPostForm, sadrzaj: e.target.value })} rows={10} required placeholder="Podržava HTML formatiranje..." />
                </div>
                <div>
                  <label className="text-sm font-medium">Thumbnail slika</label>
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const url = await uploadImage(file, 'doctors');
                        setBlogPostForm({ ...blogPostForm, thumbnail: url });
                        toast({ title: "Slika uploadovana" });
                      } catch (err) {
                        toast({ title: "Greška", variant: "destructive" });
                      }
                    }
                  }} />
                  {blogPostForm.thumbnail && <img src={fixImageUrl(blogPostForm.thumbnail) || ''} alt="" className="w-32 h-20 rounded object-cover mt-2" />}
                </div>
                <div>
                  <label className="text-sm font-medium">Kategorije</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {blogCategories.map(cat => (
                      <Badge key={cat.id} variant={blogPostForm.category_ids.includes(cat.id) ? "default" : "outline"} className="cursor-pointer"
                        onClick={() => {
                          if (blogPostForm.category_ids.includes(cat.id)) {
                            setBlogPostForm({ ...blogPostForm, category_ids: blogPostForm.category_ids.filter(id => id !== cat.id) });
                          } else {
                            setBlogPostForm({ ...blogPostForm, category_ids: [...blogPostForm.category_ids, cat.id] });
                          }
                        }}>
                        {cat.naziv}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={blogPostForm.status} onValueChange={(v) => setBlogPostForm({ ...blogPostForm, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nacrt</SelectItem>
                        <SelectItem value="published">Objavljeno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">SEO</p>
                  <Input placeholder="Meta naslov (max 70 karaktera)" value={blogPostForm.meta_title} onChange={(e) => setBlogPostForm({ ...blogPostForm, meta_title: e.target.value })} maxLength={70} />
                  <Textarea placeholder="Meta opis (max 160 karaktera)" value={blogPostForm.meta_description} onChange={(e) => setBlogPostForm({ ...blogPostForm, meta_description: e.target.value })} rows={2} maxLength={160} />
                  <Input placeholder="Ključne riječi (odvojene zarezom)" value={blogPostForm.meta_keywords} onChange={(e) => setBlogPostForm({ ...blogPostForm, meta_keywords: e.target.value })} />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingBlogPost ? 'Sačuvaj' : 'Kreiraj'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowBlogPostDialog(false)}>Otkaži</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* BLOG CATEGORY DIALOG */}
          <Dialog open={showBlogCategoryDialog} onOpenChange={setShowBlogCategoryDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingBlogCategory ? 'Uredi kategoriju' : 'Nova kategorija'}</DialogTitle>
                <DialogDescription>Unesite podatke o kategoriji</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSaveBlogCategory} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Naziv *</label>
                  <Input value={blogCategoryForm.naziv} onChange={(e) => setBlogCategoryForm({ ...blogCategoryForm, naziv: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">Opis</label>
                  <RichTextEditor 
                    value={blogCategoryForm.opis} 
                    onChange={(value) => setBlogCategoryForm({ ...blogCategoryForm, opis: value })} 
                    rows={3} 
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">{editingBlogCategory ? 'Sačuvaj' : 'Kreiraj'}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowBlogCategoryDialog(false)}>Otkaži</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Footer />
    </>
  );
}
