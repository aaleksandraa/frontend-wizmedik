import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, appointmentsAPI, servicesAPI, uploadAPI, clinicsAPI, specialtiesAPI, guestVisitsAPI, blogAPI, notifikacijeAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, Settings, Clock, DollarSign, Plus, Edit, Trash2, Save, Upload, 
  CalendarClock, XCircle, ChevronLeft, ChevronRight, User, Briefcase, MapPin,
  Phone, Mail, Star, TrendingUp, Building2, Check, X, FileText, Eye, GripVertical, FolderOpen, CalendarDays
} from 'lucide-react';
import { CalendarSyncSettings } from '@/components/CalendarSyncSettings';
import { format, isPast } from 'date-fns';
import { AddAppointmentForm } from '@/components/AddAppointmentForm';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MultiSelectSpecialties } from '@/components/MultiSelectSpecialties';
import { HierarchicalSpecialtiesSelect } from '@/components/HierarchicalSpecialtiesSelect';
import { SpecialtiesCheckboxList } from '@/components/SpecialtiesCheckboxList';
import { CitySelect } from '@/components/CitySelect';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DoctorProfile {
  id: number;
  user_id?: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  telefon: string;
  email?: string;
  account_email?: string;
  public_email?: string;
  grad: string;
  lokacija: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  opis?: string;
  youtube_linkovi?: Array<{ url: string; naslov: string }>;
  slika_profila?: string;
  klinika_id?: number;
  klinika_naziv?: string;
  klinika_adresa?: string;
  radno_vrijeme?: any;
  pauze?: any;
  odmori?: any;
  prihvata_online?: boolean;
  auto_potvrda?: boolean;
  slot_trajanje_minuti?: number;
  prihvata_ostalo?: boolean;
  telemedicine_enabled?: boolean;
  telemedicine_phone?: string;
  specijalnosti?: any[];
}

interface ServiceCategory {
  id: number;
  naziv: string;
  opis?: string;
  redoslijed: number;
  aktivan: boolean;
  usluge?: Service[];
}

interface Service {
  id: number;
  naziv: string;
  cijena: number;
  cijena_popust?: number;
  trajanje_minuti: number;
  opis?: string;
  aktivan: boolean;
  kategorija_id?: number;
  redoslijed: number;
}

interface Appointment {
  id: number;
  datum_vrijeme: string;
  razlog: string;
  napomene?: string;
  status: string;
  user_id?: string | null;
  guest_telefon?: string;
  guest_email?: string;
  usluga?: { naziv: string };
  user: { ime?: string; prezime?: string; telefon?: string; email?: string };
}

const MJESECI = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
const DANI = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

const getErrorMessage = (error: any): string => {
  if (error.response?.data?.errors) {
    return Object.values(error.response.data.errors).flat().join('\n');
  }
  return error.response?.data?.message || error.message || "Došlo je do greške";
};

// Sortable Category Component
function SortableKategorija({ kategorija, onEdit, onDelete, children }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: kategorija.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-muted/30 rounded-lg p-4 border-2 border-dashed">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <FolderOpen className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-semibold">{kategorija.naziv}</h3>
            {kategorija.opis && <p className="text-sm text-muted-foreground">{kategorija.opis}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(kategorija)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(kategorija.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

// Sortable Service Component
function SortableUsluga({ usluga, onEdit, onDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: usluga.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="bg-background rounded-lg p-3 border">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{usluga.naziv}</h4>
            <div className="flex items-center gap-4 text-sm mt-1">
              <span className="text-muted-foreground">
                {usluga.cijena_popust ? (
                  <><span className="line-through mr-1">{usluga.cijena} KM</span><span className="text-green-600 font-medium">{usluga.cijena_popust} KM</span></>
                ) : (
                  <span>{usluga.cijena ? `${usluga.cijena} KM` : 'Na upit'}</span>
                )}
              </span>
              <span className="text-muted-foreground">{usluga.trajanje_minuti} min</span>
              <Badge variant={usluga.aktivan ? "default" : "secondary"} className="text-xs">
                {usluga.aktivan ? "Aktivna" : "Neaktivna"}
              </Badge>
            </div>
            {usluga.opis && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{usluga.opis}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(usluga)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(usluga.id)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'kalendar';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [kategorije, setKategorije] = useState<ServiceCategory[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDoctor, setIsDoctor] = useState(false);

  const [showAddService, setShowAddService] = useState(false);
  const [showAddKategorija, setShowAddKategorija] = useState(false);
  const [showEditKategorija, setShowEditKategorija] = useState(false);
  const [editingKategorija, setEditingKategorija] = useState<ServiceCategory | null>(null);
  const [newKategorija, setNewKategorija] = useState({ naziv: '', opis: '', aktivan: true });
  const [showEditService, setShowEditService] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingServiceData, setEditingServiceData] = useState<Service | null>(null);
  
  const [clinics, setClinics] = useState<Array<{id: number; naziv: string; adresa: string}>>([]);
  const [specialties, setSpecialties] = useState<Array<{id: number; naziv: string}>>([]);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [guestVisits, setGuestVisits] = useState<any[]>([]);
  const [clinicInvitations, setClinicInvitations] = useState<any[]>([]);
  const [myClinicRequests, setMyClinicRequests] = useState<any[]>([]);
  const [showJoinClinic, setShowJoinClinic] = useState(false);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  const [clinicSearchResults, setClinicSearchResults] = useState<any[]>([]);
  const [selectedClinicToJoin, setSelectedClinicToJoin] = useState<any>(null);
  const [joinClinicMessage, setJoinClinicMessage] = useState('');
  const [showLeaveClinicDialog, setShowLeaveClinicDialog] = useState(false);
  
  // Blog state
  const [canWriteBlog, setCanWriteBlog] = useState(false);
  const [myBlogPosts, setMyBlogPosts] = useState<any[]>([]);
  const [blogCategories, setBlogCategories] = useState<any[]>([]);
  const [showBlogPostDialog, setShowBlogPostDialog] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<any>(null);
  const [blogPostForm, setBlogPostForm] = useState({ naslov: '', sadrzaj: '', excerpt: '', thumbnail: '', meta_title: '', meta_description: '', meta_keywords: '', category_ids: [] as number[] });

  const [newService, setNewService] = useState({
    naziv: '', cijena: null as number | null, cijena_popust: null as number | null,
    trajanje_minuti: 30, opis: '', aktivan: true, kategorija_id: null as number | null
  });

  const [workingHours, setWorkingHours] = useState({
    ponedjeljak: { radi: true, od: '08:00', do: '16:00' },
    utorak: { radi: true, od: '08:00', do: '16:00' },
    srijeda: { radi: true, od: '08:00', do: '16:00' },
    četvrtak: { radi: true, od: '08:00', do: '16:00' },
    petak: { radi: true, od: '08:00', do: '16:00' },
    subota: { radi: false, od: '08:00', do: '16:00' },
    nedjelja: { radi: false, od: '08:00', do: '16:00' }
  });

  const [breaks, setBreaks] = useState<Array<{ od: string; do: string }>>([]);
  const [holidays, setHolidays] = useState<Array<{ od: string; do: string; razlog: string }>>([]);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  useEffect(() => {
    if (user) checkDoctorStatus();
  }, [user]);

  // Handle URL params for tab and date navigation (from notifications)
  useEffect(() => {
    const tab = searchParams.get('tab');
    const date = searchParams.get('date');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    if (date) {
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        setSelectedDay(dateObj);
        setCalendarMonth(dateObj);
      }
      // Clear the date param after using it
      searchParams.delete('date');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams]);

  // Auto-mark notifications as read when tab changes
  useEffect(() => {
    const markNotificationsAsRead = async () => {
      const typesByTab: Record<string, string[]> = {
        'kalendar': ['termin_zakazan', 'termin_otkazan', 'termin_potvrden'],
        'gostovanja': ['gostovanje_poziv', 'gostovanje_potvrda', 'gostovanje_otkazano'],
        'klinika': ['klinika_poziv', 'doktor_zahtjev_prihvacen', 'doktor_zahtjev_odbijen'],
      };
      
      const types = typesByTab[activeTab];
      if (types && types.length > 0) {
        try {
          await notifikacijeAPI.markByTypeAsRead(types);
        } catch (error) {
          // Silently fail - not critical
        }
      }
    };
    
    if (user && isDoctor) {
      markNotificationsAsRead();
    }
  }, [activeTab, user, isDoctor]);

  useEffect(() => {
    if (isDoctor) {
      fetchDoctorData();
      fetchClinics();
      fetchSpecialties();
    }
  }, [isDoctor]);

  const checkDoctorStatus = async () => {
    if (!user) return;
    if (user.role === 'doctor' || user.role === 'admin') {
      setIsDoctor(true);
      return;
    }
    setLoading(false);
  };

  const fetchDoctorData = async () => {
    await Promise.all([fetchDoctorProfile(), fetchKategorije(), fetchServices(), fetchAppointments(), fetchGuestVisits(), fetchClinicInvitations()]);
    setLoading(false);
  };

  const fetchGuestVisits = async () => {
    try {
      const response = await guestVisitsAPI.getDoctorVisits({ upcoming: 'true' });
      setGuestVisits(response.data || []);
    } catch (error) {
      console.error('Error fetching guest visits:', error);
    }
  };

  const fetchClinicInvitations = async () => {
    try {
      const response = await guestVisitsAPI.getClinicInvitations();
      const allRequests = response.data || [];
      // Filter: clinic invitations are those initiated by clinic (or undefined for backwards compatibility)
      setClinicInvitations(allRequests.filter((r: any) => r.initiated_by === 'clinic' || !r.initiated_by));
      // My requests are those initiated by doctor
      setMyClinicRequests(allRequests.filter((r: any) => r.initiated_by === 'doctor'));
    } catch (error) {
      console.error('Error fetching clinic invitations:', error);
    }
  };

  const searchClinicsToJoin = async (query: string) => {
    if (query.length < 2) {
      setClinicSearchResults([]);
      return;
    }
    try {
      const response = await guestVisitsAPI.searchClinics({ search: query });
      setClinicSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching clinics:', error);
    }
  };

  const handleRequestToJoinClinic = async () => {
    if (!selectedClinicToJoin) return;
    try {
      await guestVisitsAPI.requestToJoinClinic({
        klinika_id: selectedClinicToJoin.id,
        poruka: joinClinicMessage || null
      });
      toast({ title: 'Uspjeh', description: 'Zahtjev uspješno poslan' });
      setShowJoinClinic(false);
      setSelectedClinicToJoin(null);
      setJoinClinicMessage('');
      setClinicSearchQuery('');
      setClinicSearchResults([]);
      fetchClinicInvitations();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće poslati zahtjev', variant: 'destructive' });
    }
  };

  const handleCancelClinicRequest = async (id: number) => {
    if (!confirm('Otkazati zahtjev?')) return;
    try {
      await guestVisitsAPI.cancelClinicRequest(id);
      toast({ title: 'Uspjeh', description: 'Zahtjev otkazan' });
      fetchClinicInvitations();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće otkazati', variant: 'destructive' });
    }
  };

  const handleRespondToInvitation = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await guestVisitsAPI.respondToInvitation(id, status);
      toast({ title: 'Uspjeh', description: status === 'accepted' ? 'Poziv prihvaćen' : 'Poziv odbijen' });
      fetchClinicInvitations();
      if (status === 'accepted') fetchDoctorProfile();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće odgovoriti', variant: 'destructive' });
    }
  };

  const handleLeaveClinic = async () => {
    try {
      await guestVisitsAPI.leaveClinic();
      toast({ title: 'Uspjeh', description: 'Napustili ste kliniku' });
      setShowLeaveClinicDialog(false);
      fetchDoctorProfile();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće napustiti kliniku', variant: 'destructive' });
    }
  };

  const fetchBlogData = async () => {
    try {
      const canWriteRes = await blogAPI.canDoctorsWrite();
      const canWrite = Boolean(canWriteRes.data?.can_write);
      setCanWriteBlog(canWrite);

      if (!canWrite) {
        setMyBlogPosts([]);
        setBlogCategories([]);
        return;
      }
    } catch (error) {
      console.error('Error fetching blog permission:', error);
      setCanWriteBlog(false);
      setMyBlogPosts([]);
      setBlogCategories([]);
      return;
    }

    try {
      const [postsRes, catsRes] = await Promise.all([
        blogAPI.getMyPosts(),
        blogAPI.getCategories()
      ]);

      setMyBlogPosts(postsRes.data || []);
      setBlogCategories(catsRes.data || []);
    } catch (error) {
      console.error('Error fetching doctor blog content:', error);
      setMyBlogPosts([]);
      setBlogCategories([]);
    }
  };

  useEffect(() => {
    if (isDoctor && activeTab === 'blog') {
      fetchBlogData();
    }
  }, [activeTab, isDoctor]);

  const resetBlogPostForm = () => {
    setBlogPostForm({ naslov: '', sadrzaj: '', excerpt: '', thumbnail: '', meta_title: '', meta_description: '', meta_keywords: '', category_ids: [] });
    setEditingBlogPost(null);
  };

  const openBlogPostDialog = (post?: any) => {
    if (post) {
      setEditingBlogPost(post);
      setBlogPostForm({
        naslov: post.naslov || '', sadrzaj: post.sadrzaj || '', excerpt: post.excerpt || '',
        thumbnail: post.thumbnail || '', meta_title: post.meta_title || '', meta_description: post.meta_description || '',
        meta_keywords: post.meta_keywords || '', category_ids: post.categories?.map((c: any) => c.id) || []
      });
    } else {
      resetBlogPostForm();
    }
    setShowBlogPostDialog(true);
  };

  const handleSaveBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlogPost) {
        await blogAPI.updatePost(editingBlogPost.id, blogPostForm);
        toast({ title: "Uspjeh", description: "Članak ažuriran" });
      } else {
        await blogAPI.createPost(blogPostForm);
        toast({ title: "Uspjeh", description: "Članak kreiran" });
      }
      setShowBlogPostDialog(false);
      resetBlogPostForm();
      fetchBlogData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleDeleteBlogPost = async (id: number) => {
    if (!confirm('Obrisati članak?')) return;
    try {
      await blogAPI.deletePost(id);
      toast({ title: "Uspjeh", description: "Članak obrisan" });
      fetchBlogData();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleRespondToVisit = async (id: number, status: 'confirmed' | 'cancelled') => {
    try {
      await guestVisitsAPI.respond(id, status);
      toast({ title: 'Uspjeh', description: status === 'confirmed' ? 'Gostovanje prihvaćeno' : 'Gostovanje odbijeno' });
      fetchGuestVisits();
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće odgovoriti na poziv', variant: 'destructive' });
    }
  };

  const handleCancelVisit = async (id: number) => {
    if (!confirm('Otkazati gostovanje?')) return;
    try {
      await guestVisitsAPI.cancel(id, 'Otkazano od strane doktora');
      toast({ title: 'Uspjeh', description: 'Gostovanje otkazano' });
      fetchGuestVisits();
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće otkazati', variant: 'destructive' });
    }
  };

  const fetchDoctorProfile = async () => {
    if (!user) return;
    try {
      const response = await doctorsAPI.getMyProfile();
      const data = response.data;
      if (data) {
        const normalizedProfile = {
          ...data,
          account_email: data.account_email || user.email || '',
          public_email: data.public_email ?? data.email ?? ''
        };
        setProfile(normalizedProfile);
        if (data.radno_vrijeme && typeof data.radno_vrijeme === 'object') {
          const transformed: any = {};
          Object.entries(data.radno_vrijeme).forEach(([day, schedule]: [string, any]) => {
            transformed[day] = { radi: !schedule.closed, od: schedule.open || '08:00', do: schedule.close || '16:00' };
          });
          setWorkingHours(transformed);
        }
        if (data.pauze && Array.isArray(data.pauze)) setBreaks(data.pauze);
        if (data.odmori && Array.isArray(data.odmori)) setHolidays(data.odmori);
        if (data.specijalnosti && Array.isArray(data.specijalnosti)) {
          setSelectedSpecialtyIds(data.specijalnosti.map((s: any) => s.id));
        }
      }
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
    }
  };

  const fetchServices = async () => {
    if (!user) return;
    try {
      const response = await servicesAPI.getMyServices();
      if (response.data) setServices(response.data);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchKategorije = async () => {
    try {
      const response = await doctorsAPI.dashboard.getKategorije();
      setKategorije(response.data || []);
    } catch (error) {
      console.error('Error fetching kategorije:', error);
    }
  };

  const addKategorija = async () => {
    if (!newKategorija.naziv.trim()) {
      toast({ title: "Greška", description: "Naziv kategorije je obavezan", variant: "destructive" });
      return;
    }
    try {
      await doctorsAPI.dashboard.createKategorija(newKategorija);
      toast({ title: "Uspjeh", description: "Kategorija dodana" });
      setShowAddKategorija(false);
      setNewKategorija({ naziv: '', opis: '', aktivan: true });
      fetchKategorije();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const saveEditedKategorija = async () => {
    if (!editingKategorija) return;
    try {
      await doctorsAPI.dashboard.updateKategorija(editingKategorija.id, editingKategorija);
      toast({ title: 'Uspjeh', description: 'Kategorija ažurirana' });
      setShowEditKategorija(false);
      setEditingKategorija(null);
      fetchKategorije();
    } catch (error: any) {
      toast({ title: 'Greška', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const deleteKategorija = async (id: number) => {
    if (!confirm('Obrisati kategoriju? Usluge u njoj će postati nekategorisane.')) return;
    try {
      await doctorsAPI.dashboard.deleteKategorija(id);
      toast({ title: "Uspjeh", description: "Kategorija obrisana" });
      fetchKategorije();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEndKategorije = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = kategorije.findIndex(k => k.id === active.id);
    const newIndex = kategorije.findIndex(k => k.id === over.id);

    const newKategorije = arrayMove(kategorije, oldIndex, newIndex);
    setKategorije(newKategorije);

    try {
      await doctorsAPI.dashboard.reorderKategorije({
        kategorije: newKategorije.map((k, idx) => ({ id: k.id, redoslijed: idx }))
      });
      toast({ title: "Uspjeh", description: "Redoslijed kategorija ažuriran" });
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
      fetchKategorije(); // Revert on error
    }
  };

  const handleDragEndUsluge = async (event: DragEndEvent, kategorijaId: number | null) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const kategorijaUsluge = kategorijaId 
      ? kategorije.find(k => k.id === kategorijaId)?.usluge || []
      : services.filter(s => !s.kategorija_id);

    const oldIndex = kategorijaUsluge.findIndex(u => u.id === active.id);
    const newIndex = kategorijaUsluge.findIndex(u => u.id === over.id);

    const newUsluge = arrayMove(kategorijaUsluge, oldIndex, newIndex);

    // Update local state
    if (kategorijaId) {
      setKategorije(prev => prev.map(k => 
        k.id === kategorijaId ? { ...k, usluge: newUsluge } : k
      ));
    } else {
      setServices(prev => {
        const categorized = prev.filter(s => s.kategorija_id);
        return [...categorized, ...newUsluge];
      });
    }

    try {
      await doctorsAPI.dashboard.reorderUsluge({
        usluge: newUsluge.map((u, idx) => ({ id: u.id, redoslijed: idx }))
      });
      toast({ title: "Uspjeh", description: "Redoslijed usluga ažuriran" });
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
      fetchKategorije(); // Revert on error
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await clinicsAPI.getAll();
      const list = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setClinics(list.map((c: any) => ({ id: c.id, naziv: c.naziv, adresa: c.adresa })));
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await specialtiesAPI.getAll();
      const hierarchicalData = response.data || [];
      
      // Flatten hierarchical data: parents with children nested -> flat array with parent_id
      const flatSpecialties: any[] = [];
      hierarchicalData.forEach((parent: any) => {
        // Add parent
        flatSpecialties.push({
          id: parent.id,
          naziv: parent.naziv,
          slug: parent.slug,
          parent_id: parent.parent_id || null
        });
        
        // Add children if they exist
        if (parent.children && Array.isArray(parent.children)) {
          parent.children.forEach((child: any) => {
            flatSpecialties.push({
              id: child.id,
              naziv: child.naziv,
              slug: child.slug,
              parent_id: parent.id
            });
          });
        }
      });
      
      setSpecialties(flatSpecialties);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  const fetchAppointments = async () => {
    if (!user) return;
    try {
      const response = await appointmentsAPI.getDoctorAppointments();
      const data = response.data || [];
      const formatted = data.map((apt: any) => {
        const isGuest = !apt.user_id || apt.guest_ime;
        return {
          ...apt,
          user: isGuest 
            ? { ime: apt.guest_ime || '', prezime: apt.guest_prezime || '' }
            : { ime: apt.user?.ime || '', prezime: apt.user?.prezime || '' }
        };
      });
      
      const toComplete = formatted.filter((apt: any) => isPast(new Date(apt.datum_vrijeme)) && apt.status === 'zakazan');
      if (toComplete.length > 0) {
        for (const apt of toComplete) {
          try { await appointmentsAPI.updateStatus(apt.id, 'završen'); } catch {}
        }
        const updated = await appointmentsAPI.getDoctorAppointments();
        setAppointments((updated.data || []).map((apt: any) => ({
          ...apt,
          user: !apt.user_id || apt.guest_ime 
            ? { ime: apt.guest_ime || '', prezime: apt.guest_prezime || '' }
            : { ime: apt.user?.ime || '', prezime: apt.user?.prezime || '' }
        })));
      } else {
        setAppointments(formatted);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const upcomingAppointments = appointments.filter(apt => !isPast(new Date(apt.datum_vrijeme)) && apt.status !== 'otkazan');
  const pastAppointments = appointments.filter(apt => isPast(new Date(apt.datum_vrijeme)) && apt.status !== 'otkazan');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'otkazan');
  const todayAppointments = appointments.filter(apt => {
    const today = new Date();
    const aptDate = new Date(apt.datum_vrijeme);
    return aptDate.toDateString() === today.toDateString() && apt.status !== 'otkazan';
  });


  const updateProfile = async () => {
    if (!profile || !user) return;
    const transformedWorkingHours: any = {};
    Object.entries(workingHours).forEach(([day, schedule]) => {
      transformedWorkingHours[day] = { closed: !schedule.radi, open: schedule.od, close: schedule.do };
    });

    const updateData: any = {
      telefon: profile.telefon, lokacija: profile.lokacija, opis: profile.opis || null,
      account_email: profile.account_email,
      public_email: profile.public_email || null,
      specialty_ids: selectedSpecialtyIds,
      prihvata_online: profile.prihvata_online, auto_potvrda: profile.auto_potvrda,
      slot_trajanje_minuti: profile.slot_trajanje_minuti,
      telemedicine_enabled: profile.telemedicine_enabled ?? false,
      telemedicine_phone: profile.telemedicine_phone || null,
      radno_vrijeme: transformedWorkingHours, pauze: breaks, odmori: holidays
    };
    if (profile.latitude) updateData.latitude = Number(profile.latitude);
    if (profile.longitude) updateData.longitude = Number(profile.longitude);
    if (profile.google_maps_link) updateData.google_maps_link = profile.google_maps_link;
    if (passwordForm.current_password || passwordForm.new_password || passwordForm.new_password_confirmation) {
      updateData.current_password = passwordForm.current_password;
      updateData.new_password = passwordForm.new_password;
      updateData.new_password_confirmation = passwordForm.new_password_confirmation;
    }

    try {
      await doctorsAPI.updateProfile(updateData);
      await refreshUser().catch(() => undefined);
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
      toast({ title: "Uspjeh", description: "Profil ažuriran" });
      setEditingProfile(false);
      fetchDoctorProfile();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: "Greška", description: "Molimo izaberite sliku", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Greška", description: "Slika ne može biti veća od 5MB", variant: "destructive" });
      return;
    }
    try {
      setUploadingImage(true);
      const response = await uploadAPI.uploadImage(file, 'doctors');
      await doctorsAPI.updateProfile({ slika_profila: response.data.url });
      toast({ title: "Uspjeh", description: "Slika ažurirana" });
      fetchDoctorProfile();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const addService = async () => {
    if (!profile) return;
    if (!newService.naziv.trim()) {
      toast({ title: "Greška", description: "Naziv je obavezan", variant: "destructive" });
      return;
    }
    try {
      await doctorsAPI.dashboard.createUsluga(newService);
      toast({ title: "Uspjeh", description: "Usluga dodana" });
      setShowAddService(false);
      setNewService({ naziv: '', cijena: null, cijena_popust: null, trajanje_minuti: 30, opis: '', aktivan: true, kategorija_id: null });
      fetchKategorije();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const saveEditedService = async () => {
    if (!editingServiceData) return;
    try {
      await doctorsAPI.dashboard.updateUsluga(editingServiceData.id, editingServiceData);
      toast({ title: 'Uspjeh', description: 'Usluga ažurirana' });
      setShowEditService(false);
      setEditingServiceData(null);
      fetchKategorije();
    } catch (error: any) {
      toast({ title: 'Greška', description: getErrorMessage(error), variant: 'destructive' });
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Obrisati uslugu?')) return;
    try {
      await doctorsAPI.dashboard.deleteUsluga(id);
      toast({ title: "Uspjeh", description: "Usluga obrisana" });
      fetchKategorije();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await appointmentsAPI.updateStatus(id, status);
      toast({ title: "Uspjeh", description: "Status ažuriran" });
      fetchAppointments();
    } catch (error: any) {
      toast({ title: "Greška", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isDoctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nema dozvole</h2>
            <p className="text-muted-foreground">Samo doktori mogu pristupiti ovoj stranici.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Profil nije pronađen</h2>
            <p className="text-muted-foreground">Kontaktirajte administratora.</p>
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
              {profile.slika_profila ? (
                <img src={profile.slika_profila} alt="" className="w-16 h-16 rounded-full object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-4 border-primary/20">
                  {profile.ime[0]}{profile.prezime[0]}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">Dr. {profile.ime} {profile.prezime}</h1>
                <p className="text-muted-foreground">{profile.specijalnost}</p>
              </div>
            </div>
            <Badge variant={profile.prihvata_online ? "default" : "secondary"} className="w-fit">
              {profile.prihvata_online ? "Online rezervacije aktivne" : "Online rezervacije neaktivne"}
            </Badge>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CalendarClock className="h-8 w-8 text-cyan-600" />
                  <div>
                    <p className="text-2xl font-bold">{todayAppointments.length}</p>
                    <p className="text-xs text-muted-foreground">Danas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                    <p className="text-xs text-muted-foreground">Predstojeći</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{services.filter(s => s.aktivan).length}</p>
                    <p className="text-xs text-muted-foreground">Usluga</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{pastAppointments.length}</p>
                    <p className="text-xs text-muted-foreground">Završenih</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


          {/* Clinic Invitations Alert */}
          {clinicInvitations.filter(i => i.status === 'pending').length > 0 && (
            <Card className="border-cyan-200 bg-cyan-50/50 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-cyan-600" />
                  Pozivi od klinika ({clinicInvitations.filter(i => i.status === 'pending').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {clinicInvitations.filter(i => i.status === 'pending').map(inv => (
                  <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      {inv.klinika?.slike?.[0] ? (
                        <img src={inv.klinika.slike[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-cyan-600" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{inv.klinika?.naziv}</p>
                        <p className="text-sm text-muted-foreground">{inv.klinika?.adresa}, {inv.klinika?.grad}</p>
                        {inv.poruka && <p className="text-sm text-muted-foreground mt-1 italic">"{inv.poruka}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRespondToInvitation(inv.id, 'rejected')}>
                        <X className="h-4 w-4 mr-1" /> Odbij
                      </Button>
                      <Button size="sm" onClick={() => handleRespondToInvitation(inv.id, 'accepted')}>
                        <Check className="h-4 w-4 mr-1" /> Prihvati
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* My Clinic Requests + Join Clinic Button */}
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Moji zahtjevi klinikama
                </CardTitle>
                <Dialog open={showJoinClinic} onOpenChange={setShowJoinClinic}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Pridruži se klinici</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Pridruži se klinici</DialogTitle>
                      <DialogDescription>Pretražite klinike i pošaljite zahtjev za pridruživanje</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Pretraži klinike</Label>
                        <Input 
                          placeholder="Unesite naziv ili grad..." 
                          value={clinicSearchQuery}
                          onChange={(e) => {
                            setClinicSearchQuery(e.target.value);
                            searchClinicsToJoin(e.target.value);
                          }}
                        />
                      </div>
                      {clinicSearchResults.length > 0 && !selectedClinicToJoin && (
                        <div className="max-h-48 overflow-y-auto border rounded-lg divide-y">
                          {clinicSearchResults.map(clinic => (
                            <div 
                              key={clinic.id} 
                              className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3"
                              onClick={() => {
                                setSelectedClinicToJoin(clinic);
                                setClinicSearchResults([]);
                              }}
                            >
                              {clinic.slike?.[0] ? (
                                <img src={clinic.slike[0]} alt="" className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{clinic.naziv}</p>
                                <p className="text-sm text-muted-foreground">{clinic.adresa}, {clinic.grad}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedClinicToJoin && (
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedClinicToJoin.slike?.[0] ? (
                                <img src={selectedClinicToJoin.slike[0]} alt="" className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{selectedClinicToJoin.naziv}</p>
                                <p className="text-sm text-muted-foreground">{selectedClinicToJoin.adresa}, {selectedClinicToJoin.grad}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedClinicToJoin(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label>Poruka (opcionalno)</Label>
                        <Textarea 
                          placeholder="Napišite kratku poruku klinici..."
                          value={joinClinicMessage}
                          onChange={(e) => setJoinClinicMessage(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button 
                        onClick={handleRequestToJoinClinic} 
                        disabled={!selectedClinicToJoin}
                        className="w-full"
                      >
                        Pošalji zahtjev
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {myClinicRequests.filter(r => r.status === 'pending').length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Nemate aktivnih zahtjeva</p>
              ) : (
                <div className="space-y-3">
                  {myClinicRequests.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {req.klinika?.slike?.[0] ? (
                          <img src={req.klinika.slike[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{req.klinika?.naziv}</p>
                          <p className="text-sm text-muted-foreground">{req.klinika?.adresa}, {req.klinika?.grad}</p>
                          <Badge variant="secondary" className="mt-1">Na čekanju</Badge>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => handleCancelClinicRequest(req.id)}>
                        <X className="h-4 w-4 mr-1" /> Otkaži
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="kalendar" className="flex-1 min-w-[80px]">
                <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
                Termini
              </TabsTrigger>
              <TabsTrigger value="usluge" className="flex-1 min-w-[80px]">
                <Briefcase className="h-4 w-4 mr-2 hidden sm:inline" />
                Usluge
              </TabsTrigger>
              <TabsTrigger value="gostovanja" className="flex-1 min-w-[80px]">
                <Building2 className="h-4 w-4 mr-2 hidden sm:inline" />
                Gostovanja
                {guestVisits.filter(g => g.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-1.5">
                    {guestVisits.filter(g => g.status === 'pending').length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="raspored" className="flex-1 min-w-[80px]">
                <Clock className="h-4 w-4 mr-2 hidden sm:inline" />
                Raspored
              </TabsTrigger>
              <TabsTrigger value="profil" className="flex-1 min-w-[80px]">
                <Settings className="h-4 w-4 mr-2 hidden sm:inline" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="calendar-sync" className="flex-1 min-w-[80px]">
                <CalendarDays className="h-4 w-4 mr-2 hidden sm:inline" />
                Kalendar Sync
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex-1 min-w-[80px]">
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                Blog
              </TabsTrigger>
            </TabsList>

            {/* APPOINTMENTS TAB */}
            <TabsContent value="kalendar" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Termini</h2>
                <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Ručno zakaži</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>Ručno zakazivanje</DialogTitle></DialogHeader>
                    {profile && (
                      <AddAppointmentForm
                        doctorId={profile.id}
                        services={services}
                        workingHours={workingHours}
                        breaks={breaks}
                        holidays={holidays}
                        bookedSlots={appointments.map(apt => ({ datum_vrijeme: apt.datum_vrijeme, trajanje_minuti: 30 }))}
                        slotDuration={profile.slot_trajanje_minuti || 30}
                        onSuccess={() => { setShowAddAppointment(false); fetchAppointments(); }}
                      />
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {/* Calendar View */}
              <Card>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-center">
                      <h3 className="font-semibold">{MJESECI[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}</h3>
                      <Button variant="ghost" size="sm" onClick={() => setCalendarMonth(new Date())}>Danas</Button>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 md:gap-2">
                    {DANI.map(day => (
                      <div key={day} className="text-center font-medium text-xs md:text-sm text-muted-foreground p-1 md:p-2">{day}</div>
                    ))}
                    {Array.from({ length: 42 }, (_, i) => {
                      const today = new Date();
                      const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
                      const startOffset = (firstDay.getDay() + 6) % 7;
                      const dayNum = i - startOffset + 1;
                      const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
                      
                      if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className="p-1 md:p-2"></div>;

                      const currentDate = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), dayNum);
                      const isToday = dayNum === today.getDate() && calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear();
                      const dayApts = appointments.filter(apt => {
                        const aptDate = new Date(apt.datum_vrijeme);
                        return aptDate.getDate() === dayNum && aptDate.getMonth() === calendarMonth.getMonth() && aptDate.getFullYear() === calendarMonth.getFullYear() && apt.status !== 'otkazan';
                      });

                      return (
                        <div 
                          key={i} 
                          className={`p-1 md:p-2 border rounded cursor-pointer hover:bg-accent transition text-center ${isToday ? 'bg-primary/10 border-primary' : ''} ${dayApts.length > 0 ? 'bg-secondary/20' : ''}`}
                          onClick={() => setSelectedDay(currentDate)}
                        >
                          <div className="text-xs md:text-sm font-medium">{dayNum}</div>
                          {dayApts.length > 0 && <Badge variant="secondary" className="text-xs px-1 mt-1 hidden md:inline-flex">{dayApts.length}</Badge>}
                          {dayApts.length > 0 && <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto mt-1 md:hidden"></div>}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Selected Day Appointments */}
              {selectedDay && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Termini za {format(selectedDay, 'dd.MM.yyyy')}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedDay(null)}><XCircle className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {appointments.filter(apt => new Date(apt.datum_vrijeme).toDateString() === selectedDay.toDateString() && apt.status !== 'otkazan')
                      .sort((a, b) => new Date(a.datum_vrijeme).getTime() - new Date(b.datum_vrijeme).getTime())
                      .map(apt => (
                        <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{apt.user.ime} {apt.user.prezime}</span>
                              {!apt.user_id && <Badge variant="outline" className="text-xs">Gost</Badge>}
                              <Badge variant={apt.status === 'potvrdjen' ? 'default' : 'secondary'} className="text-xs">{apt.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{format(new Date(apt.datum_vrijeme), 'HH:mm')} • {apt.razlog}</p>
                          </div>
                          <div className="flex gap-2">
                            {apt.status !== 'završen' && apt.status !== 'otkazan' && (
                              <Button size="sm" variant="secondary" onClick={() => updateAppointmentStatus(apt.id, 'završen')}>Završi</Button>
                            )}
                            {apt.status !== 'otkazan' && (
                              <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(apt.id, 'otkazan')}>Otkaži</Button>
                            )}
                          </div>
                        </div>
                      ))}
                    {appointments.filter(apt => new Date(apt.datum_vrijeme).toDateString() === selectedDay.toDateString() && apt.status !== 'otkazan').length === 0 && (
                      <p className="text-center text-muted-foreground py-4">Nema termina za ovaj dan</p>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Upcoming Appointments */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Predstojeći termini ({upcomingAppointments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingAppointments.slice(0, 5).map(apt => (
                    <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{apt.user.ime} {apt.user.prezime}</span>
                          <Badge variant={apt.status === 'potvrdjen' ? 'default' : 'secondary'} className="text-xs">{apt.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(apt.datum_vrijeme), 'dd.MM.yyyy HH:mm')} • {apt.razlog}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary" onClick={() => updateAppointmentStatus(apt.id, 'završen')}>Završi</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateAppointmentStatus(apt.id, 'otkazan')}>Otkaži</Button>
                      </div>
                    </div>
                  ))}
                  {upcomingAppointments.length === 0 && <p className="text-center text-muted-foreground py-4">Nema predstojećih termina</p>}
                </CardContent>
              </Card>
            </TabsContent>


            {/* SERVICES TAB */}
            <TabsContent value="usluge" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Usluge i kategorije</h2>
                <div className="flex gap-2">
                  <Dialog open={showAddKategorija} onOpenChange={setShowAddKategorija}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><FolderOpen className="h-4 w-4 mr-2" /> Nova kategorija</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Nova kategorija</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Naziv *</Label>
                          <Input value={newKategorija.naziv} onChange={(e) => setNewKategorija({...newKategorija, naziv: e.target.value})} placeholder="npr. Preventivni pregledi" />
                        </div>
                        <div>
                          <Label>Opis</Label>
                          <Textarea value={newKategorija.opis} onChange={(e) => setNewKategorija({...newKategorija, opis: e.target.value})} rows={2} placeholder="Kratak opis kategorije..." />
                        </div>
                        <Button onClick={addKategorija} className="w-full">Dodaj kategoriju</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog open={showAddService} onOpenChange={setShowAddService}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" /> Nova usluga</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Nova usluga</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Naziv *</Label>
                          <Input value={newService.naziv} onChange={(e) => setNewService({...newService, naziv: e.target.value})} />
                        </div>
                        <div>
                          <Label>Kategorija</Label>
                          <Select value={newService.kategorija_id?.toString() || 'none'} onValueChange={(val) => setNewService({...newService, kategorija_id: val === 'none' ? null : parseInt(val)})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Bez kategorije" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">Bez kategorije</SelectItem>
                              {kategorije.map(kat => (
                                <SelectItem key={kat.id} value={kat.id.toString()}>{kat.naziv}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Cijena (KM)</Label>
                            <Input type="number" value={newService.cijena || ''} onChange={(e) => setNewService({...newService, cijena: e.target.value ? parseFloat(e.target.value) : null})} />
                          </div>
                          <div>
                            <Label>Cijena sa popustom</Label>
                            <Input type="number" value={newService.cijena_popust || ''} onChange={(e) => setNewService({...newService, cijena_popust: e.target.value ? parseFloat(e.target.value) : null})} />
                          </div>
                        </div>
                        <div>
                          <Label>Trajanje (min) *</Label>
                          <Input type="number" value={newService.trajanje_minuti} onChange={(e) => setNewService({...newService, trajanje_minuti: parseInt(e.target.value) || 30})} />
                        </div>
                        <div>
                          <Label>Opis</Label>
                          <Textarea value={newService.opis} onChange={(e) => setNewService({...newService, opis: e.target.value})} rows={3} />
                        </div>
                        <Button onClick={addService} className="w-full">Dodaj uslugu</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Categories with Drag & Drop */}
              {kategorije.length > 0 && (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndKategorije}>
                  <SortableContext items={kategorije.map(k => k.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-4">
                      {kategorije.map(kategorija => (
                        <SortableKategorija 
                          key={kategorija.id} 
                          kategorija={kategorija}
                          onEdit={(kat: ServiceCategory) => { setEditingKategorija(kat); setShowEditKategorija(true); }}
                          onDelete={deleteKategorija}
                        >
                          {kategorija.usluge && kategorija.usluge.length > 0 ? (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndUsluge(e, kategorija.id)}>
                              <SortableContext items={kategorija.usluge.map(u => u.id)} strategy={verticalListSortingStrategy}>
                                <div className="space-y-2">
                                  {kategorija.usluge.map(usluga => (
                                    <SortableUsluga 
                                      key={usluga.id} 
                                      usluga={usluga}
                                      onEdit={(u: Service) => { setEditingServiceData(u); setShowEditService(true); }}
                                      onDelete={deleteService}
                                    />
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Nema usluga u ovoj kategoriji</p>
                          )}
                        </SortableKategorija>
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {/* Uncategorized Services */}
              {services.filter(s => !s.kategorija_id).length > 0 && (
                <div className="bg-muted/20 rounded-lg p-4 border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Usluge bez kategorije
                  </h3>
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndUsluge(e, null)}>
                    <SortableContext items={services.filter(s => !s.kategorija_id).map(u => u.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
                        {services.filter(s => !s.kategorija_id).map(usluga => (
                          <SortableUsluga 
                            key={usluga.id} 
                            usluga={usluga}
                            onEdit={(u: Service) => { setEditingServiceData(u); setShowEditService(true); }}
                            onDelete={deleteService}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {kategorije.length === 0 && services.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nema usluga</h3>
                    <p className="text-muted-foreground mb-4">Dodajte kategorije i usluge koje nudite</p>
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => setShowAddKategorija(true)}>
                        <FolderOpen className="h-4 w-4 mr-2" /> Dodaj kategoriju
                      </Button>
                      <Button onClick={() => setShowAddService(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Dodaj uslugu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Edit Category Dialog */}
              <Dialog open={showEditKategorija} onOpenChange={setShowEditKategorija}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Uredi kategoriju</DialogTitle></DialogHeader>
                  {editingKategorija && (
                    <div className="space-y-4">
                      <div>
                        <Label>Naziv *</Label>
                        <Input value={editingKategorija.naziv} onChange={(e) => setEditingKategorija({...editingKategorija, naziv: e.target.value})} />
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea value={editingKategorija.opis || ''} onChange={(e) => setEditingKategorija({...editingKategorija, opis: e.target.value})} rows={2} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={editingKategorija.aktivan} onCheckedChange={(checked) => setEditingKategorija({...editingKategorija, aktivan: checked})} />
                        <Label>Aktivna</Label>
                      </div>
                      <Button onClick={saveEditedKategorija} className="w-full">Sačuvaj</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Edit Service Dialog */}
              <Dialog open={showEditService} onOpenChange={setShowEditService}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Uredi uslugu</DialogTitle></DialogHeader>
                  {editingServiceData && (
                    <div className="space-y-4">
                      <div>
                        <Label>Naziv *</Label>
                        <Input value={editingServiceData.naziv} onChange={(e) => setEditingServiceData({...editingServiceData, naziv: e.target.value})} />
                      </div>
                      <div>
                        <Label>Kategorija</Label>
                        <Select value={editingServiceData.kategorija_id?.toString() || 'none'} onValueChange={(val) => setEditingServiceData({...editingServiceData, kategorija_id: val === 'none' ? null : parseInt(val)})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Bez kategorije" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Bez kategorije</SelectItem>
                            {kategorije.map(kat => (
                              <SelectItem key={kat.id} value={kat.id.toString()}>{kat.naziv}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Cijena (KM)</Label>
                          <Input type="number" value={editingServiceData.cijena ?? ''} onChange={(e) => setEditingServiceData({...editingServiceData, cijena: e.target.value ? parseFloat(e.target.value) : null as any})} />
                        </div>
                        <div>
                          <Label>Cijena sa popustom</Label>
                          <Input type="number" value={editingServiceData.cijena_popust ?? ''} onChange={(e) => setEditingServiceData({...editingServiceData, cijena_popust: e.target.value ? parseFloat(e.target.value) : undefined})} />
                        </div>
                      </div>
                      <div>
                        <Label>Trajanje (min) *</Label>
                        <Input type="number" value={editingServiceData.trajanje_minuti} onChange={(e) => setEditingServiceData({...editingServiceData, trajanje_minuti: parseInt(e.target.value) || 30})} />
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea value={editingServiceData.opis || ''} onChange={(e) => setEditingServiceData({...editingServiceData, opis: e.target.value})} rows={3} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={editingServiceData.aktivan} onCheckedChange={(checked) => setEditingServiceData({...editingServiceData, aktivan: checked})} />
                        <Label>Aktivna</Label>
                      </div>
                      <Button onClick={saveEditedService} className="w-full">Sačuvaj</Button>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* GOSTOVANJA TAB */}
            <TabsContent value="gostovanja" className="space-y-6">
              <h2 className="text-lg font-semibold">Moja gostovanja</h2>
              
              {/* Pending invitations */}
              {guestVisits.filter(g => g.status === 'pending').length > 0 && (
                <Card className="border-orange-200 bg-orange-50/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                      <CalendarClock className="h-4 w-4" /> Pozivi na čekanju
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {guestVisits.filter(g => g.status === 'pending').map(visit => (
                      <div key={visit.id} className="p-4 bg-white rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {visit.klinika?.slike?.[0] ? (
                            <img src={visit.klinika.slike[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{visit.klinika?.naziv}</p>
                            <p className="text-sm text-muted-foreground">{visit.klinika?.adresa}, {visit.klinika?.grad}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(visit.datum), 'dd.MM.yyyy.')}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{visit.vrijeme_od?.slice(0, 5)} - {visit.vrijeme_do?.slice(0, 5)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespondToVisit(visit.id, 'confirmed')}>
                            <Check className="h-4 w-4 mr-1" /> Prihvati
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRespondToVisit(visit.id, 'cancelled')}>
                            <X className="h-4 w-4 mr-1" /> Odbij
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Confirmed visits */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" /> Potvrđena gostovanja
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {guestVisits.filter(g => g.status === 'confirmed').length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Nema potvrđenih gostovanja</p>
                  ) : (
                    guestVisits.filter(g => g.status === 'confirmed').map(visit => (
                      <div key={visit.id} className="p-4 bg-muted/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {visit.klinika?.slike?.[0] ? (
                            <img src={visit.klinika.slike[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-green-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{visit.klinika?.naziv}</p>
                            <p className="text-sm text-muted-foreground">{visit.klinika?.adresa}, {visit.klinika?.grad}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(visit.datum), 'dd.MM.yyyy.')}</span>
                              <Clock className="h-3 w-3 ml-2" />
                              <span>{visit.vrijeme_od?.slice(0, 5)} - {visit.vrijeme_do?.slice(0, 5)}</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="destructive" onClick={() => handleCancelVisit(visit.id)}>
                          Otkaži
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* SCHEDULE TAB */}
            <TabsContent value="raspored" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Radno vrijeme</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(workingHours).map(([day, schedule]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                      <div className="flex items-center gap-4">
                        <span className="w-24 capitalize font-medium">{day}</span>
                        <Switch checked={schedule.radi} onCheckedChange={(checked) => setWorkingHours({...workingHours, [day]: {...schedule, radi: checked}})} />
                      </div>
                      {schedule.radi && (
                        <div className="flex items-center gap-2 ml-28 sm:ml-0">
                          <Input type="time" value={schedule.od} onChange={(e) => setWorkingHours({...workingHours, [day]: {...schedule, od: e.target.value}})} className="w-28" />
                          <span className="text-muted-foreground">-</span>
                          <Input type="time" value={schedule.do} onChange={(e) => setWorkingHours({...workingHours, [day]: {...schedule, do: e.target.value}})} className="w-28" />
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Pauze</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setBreaks([...breaks, { od: '12:00', do: '13:00' }])}>
                      <Plus className="h-4 w-4 mr-1" /> Dodaj
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {breaks.length === 0 && <p className="text-muted-foreground text-center py-4">Nema pauza</p>}
                  {breaks.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Input type="time" value={b.od} onChange={(e) => { const n = [...breaks]; n[i].od = e.target.value; setBreaks(n); }} className="w-28" />
                      <span>-</span>
                      <Input type="time" value={b.do} onChange={(e) => { const n = [...breaks]; n[i].do = e.target.value; setBreaks(n); }} className="w-28" />
                      <Button variant="ghost" size="sm" onClick={() => setBreaks(breaks.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Neradni dani</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setHolidays([...holidays, { od: new Date().toISOString().split('T')[0], do: new Date().toISOString().split('T')[0], razlog: '' }])}>
                      <Plus className="h-4 w-4 mr-1" /> Dodaj
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {holidays.length === 0 && <p className="text-muted-foreground text-center py-4">Nema neradnih dana</p>}
                  {holidays.map((h, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <DatePicker
                          date={h.od ? new Date(h.od) : undefined}
                          onSelect={(date) => {
                            const n = [...holidays];
                            n[i].od = date ? format(date, 'yyyy-MM-dd') : '';
                            setHolidays(n);
                          }}
                          placeholder="Od"
                          className="flex-1"
                        />
                        <DatePicker
                          date={h.do ? new Date(h.do) : undefined}
                          onSelect={(date) => {
                            const n = [...holidays];
                            n[i].do = date ? format(date, 'yyyy-MM-dd') : '';
                            setHolidays(n);
                          }}
                          placeholder="Do"
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input placeholder="Razlog" value={h.razlog} onChange={(e) => { const n = [...holidays]; n[i].razlog = e.target.value; setHolidays(n); }} className="flex-1" />
                        <Button variant="ghost" size="sm" onClick={() => setHolidays(holidays.filter((_, idx) => idx !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Button onClick={updateProfile} className="w-full" size="lg"><Save className="h-4 w-4 mr-2" /> Sačuvaj raspored</Button>
            </TabsContent>


            {/* PROFILE TAB */}
            <TabsContent value="profil" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Profil</CardTitle>
                    <Button
                      variant={editingProfile ? "secondary" : "outline"}
                      onClick={() => {
                        if (editingProfile) {
                          setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
                        }
                        setEditingProfile(!editingProfile);
                      }}
                    >
                      {editingProfile ? 'Otkaži' : 'Uredi'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex items-center gap-6 p-4 bg-muted/50 rounded-lg">
                    <div className="relative">
                      {profile.slika_profila ? (
                        <img src={profile.slika_profila} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-primary" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border-4 border-primary">
                          {profile.ime[0]}{profile.prezime[0]}
                        </div>
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    {editingProfile && (
                      <div>
                        <Button variant="outline" disabled={uploadingImage} onClick={() => document.getElementById('profile-image')?.click()}>
                          <Upload className="h-4 w-4 mr-2" /> {uploadingImage ? 'Uploadovanje...' : 'Promijeni sliku'}
                        </Button>
                        <input id="profile-image" type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} disabled={uploadingImage} />
                        <p className="text-xs text-muted-foreground mt-2">Max 5MB • JPG, PNG, WebP</p>
                      </div>
                    )}
                  </div>

                  {editingProfile ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Ime</Label>
                          <Input value={profile.ime} onChange={(e) => setProfile({...profile, ime: e.target.value})} />
                        </div>
                        <div>
                          <Label>Prezime</Label>
                          <Input value={profile.prezime} onChange={(e) => setProfile({...profile, prezime: e.target.value})} />
                        </div>
                        <div>
                          <Label>Telefon</Label>
                          <Input value={profile.telefon} onChange={(e) => setProfile({...profile, telefon: e.target.value})} />
                        </div>
                        <div>
                          <Label>Email za prijavu</Label>
                          <Input
                            type="email"
                            value={profile.account_email || ''}
                            onChange={(e) => setProfile({...profile, account_email: e.target.value})}
                            placeholder="vas-login@email.com"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Koristi se za prijavu i sistemske obavijesti.</p>
                        </div>
                        <div>
                          <Label>Javni email (opcionalno)</Label>
                          <Input
                            type="email"
                            value={profile.public_email || ''}
                            onChange={(e) => setProfile({...profile, public_email: e.target.value})}
                            placeholder="kontakt@email.com"
                          />
                          <p className="text-xs text-muted-foreground mt-1">Prikazuje se javno na profilu doktora.</p>
                        </div>
                        <div>
                          <Label>Lokacija (Adresa)</Label>
                          <Input value={profile.lokacija} onChange={(e) => setProfile({...profile, lokacija: e.target.value})} />
                        </div>
                        <div>
                          <Label>Grad</Label>
                          <CitySelect
                            value={profile.grad || ''}
                            onChange={(value) => setProfile({...profile, grad: value})}
                            showIcon={false}
                          />
                        </div>
                        <div>
                          <Label>Klinika</Label>
                          {profile.klinika_id ? (
                            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1">{profile.klinika_naziv || 'Povezana klinika'}</span>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="sm" 
                                className="text-destructive hover:text-destructive"
                                onClick={() => setShowLeaveClinicDialog(true)}
                              >
                                <X className="h-4 w-4 mr-1" /> Napusti
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground p-2">Niste povezani sa klinikom. Koristite "Pridruži se klinici" iznad.</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 rounded-lg border p-4">
                        <Label className="text-sm font-semibold">Promjena lozinke (opcionalno)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-xs text-muted-foreground">Trenutna lozinka</Label>
                            <Input
                              type="password"
                              value={passwordForm.current_password}
                              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                              placeholder="Unesite trenutnu"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Nova lozinka</Label>
                            <Input
                              type="password"
                              value={passwordForm.new_password}
                              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                              placeholder="Min 8 karaktera"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Potvrda nove lozinke</Label>
                            <Input
                              type="password"
                              value={passwordForm.new_password_confirmation}
                              onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                              placeholder="Ponovite novu lozinku"
                            />
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Lozinka se mijenja samo ako popunite sva 3 polja.
                        </p>
                      </div>
                      <div>
                        <Label>Specijalnosti</Label>
                        <SpecialtiesCheckboxList 
                          specialties={specialties} 
                          selectedIds={selectedSpecialtyIds} 
                          onChange={setSelectedSpecialtyIds} 
                        />
                      </div>
                      <div>
                        <Label>O doktoru (Opis)</Label>
                        <RichTextEditor 
                          value={profile.opis || ''} 
                          onChange={(value) => setProfile({...profile, opis: value})} 
                          rows={8}
                          placeholder="Unesite informacije o sebi, iskustvu, obrazovanju..."
                        />
                      </div>

                      {/* YouTube Video Links */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>YouTube Video Snimci</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const currentLinks = profile.youtube_linkovi || [];
                              setProfile({
                                ...profile,
                                youtube_linkovi: [...currentLinks, { url: '', naslov: '' }]
                              });
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj video
                          </Button>
                        </div>
                        {profile.youtube_linkovi && profile.youtube_linkovi.length > 0 ? (
                          <div className="space-y-3">
                            {profile.youtube_linkovi.map((video, index) => (
                              <div key={index} className="flex gap-2 items-start p-3 bg-muted/30 rounded-lg">
                                <div className="flex-1 space-y-2">
                                  <Input
                                    placeholder="Naslov videa"
                                    value={video.naslov}
                                    onChange={(e) => {
                                      const newLinks = [...(profile.youtube_linkovi || [])];
                                      newLinks[index] = { ...newLinks[index], naslov: e.target.value };
                                      setProfile({ ...profile, youtube_linkovi: newLinks });
                                    }}
                                  />
                                  <Input
                                    placeholder="YouTube URL (npr. https://www.youtube.com/watch?v=...)"
                                    value={video.url}
                                    onChange={(e) => {
                                      const newLinks = [...(profile.youtube_linkovi || [])];
                                      newLinks[index] = { ...newLinks[index], url: e.target.value };
                                      setProfile({ ...profile, youtube_linkovi: newLinks });
                                    }}
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newLinks = (profile.youtube_linkovi || []).filter((_, i) => i !== index);
                                    setProfile({ ...profile, youtube_linkovi: newLinks });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">
                            Nema dodanih video snimaka. Kliknite "Dodaj video" da dodate YouTube linkove.
                          </p>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Latitude</Label>
                          <Input type="number" step="0.000001" value={profile.latitude || ''} onChange={(e) => setProfile({...profile, latitude: parseFloat(e.target.value) || undefined})} />
                        </div>
                        <div>
                          <Label>Longitude</Label>
                          <Input type="number" step="0.000001" value={profile.longitude || ''} onChange={(e) => setProfile({...profile, longitude: parseFloat(e.target.value) || undefined})} />
                        </div>
                        <div>
                          <Label>Google Maps Link</Label>
                          <Input value={profile.google_maps_link || ''} onChange={(e) => setProfile({...profile, google_maps_link: e.target.value})} />
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Switch checked={profile.prihvata_online} onCheckedChange={(checked) => setProfile({...profile, prihvata_online: checked})} />
                          <Label>Online rezervacije</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={profile.auto_potvrda ?? false} onCheckedChange={(checked) => setProfile({...profile, auto_potvrda: checked})} />
                          <Label>Auto potvrda termina</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={profile.prihvata_ostalo ?? true} onCheckedChange={(checked) => setProfile({...profile, prihvata_ostalo: checked})} />
                          <Label>Dozvoli "Ostalo" uslugu</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={profile.telemedicine_enabled ?? false} onCheckedChange={(checked) => setProfile({...profile, telemedicine_enabled: checked})} />
                          <Label>Telemedicina (Video pozivi)</Label>
                        </div>
                      </div>
                      {profile.auto_potvrda && (
                        <p className="text-sm text-muted-foreground bg-green-50 p-2 rounded">
                          ✓ Svi novi termini će automatski biti potvrđeni bez potrebe za ručnom potvrdom.
                        </p>
                      )}
                      {profile.telemedicine_enabled && (
                        <div>
                          <Label>Telefon za telemedicinu</Label>
                          <Input 
                            value={profile.telemedicine_phone || ''} 
                            onChange={(e) => setProfile({...profile, telemedicine_phone: e.target.value})}
                            placeholder="Unesite broj telefona za video pozive"
                            className="max-w-md"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ovaj broj će biti prikazan pacijentima za zakazivanje video konsultacija
                          </p>
                        </div>
                      )}
                      <div>
                        <Label>Trajanje slota</Label>
                        <Select value={(profile.slot_trajanje_minuti || 30).toString()} onValueChange={(v) => setProfile({...profile, slot_trajanje_minuti: parseInt(v)})}>
                          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minuta</SelectItem>
                            <SelectItem value="30">30 minuta</SelectItem>
                            <SelectItem value="45">45 minuta</SelectItem>
                            <SelectItem value="60">60 minuta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={updateProfile} className="w-full"><Save className="h-4 w-4 mr-2" /> Sačuvaj profil</Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Ime:</span>
                          <span className="font-medium">{profile.ime} {profile.prezime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Specijalnost:</span>
                          <span className="font-medium">{profile.specijalnost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Lokacija:</span>
                          <span className="font-medium">{profile.grad}, {profile.lokacija}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Telefon:</span>
                          <span className="font-medium">{profile.telefon}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Email za prijavu:</span>
                          <span className="font-medium">{profile.account_email || user?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Javni email:</span>
                          <span className="font-medium">{profile.public_email || 'Nije postavljen'}</span>
                        </div>
                      </div>
                      {profile.klinika_naziv && (
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-medium">{profile.klinika_naziv}</p>
                          {profile.klinika_adresa && <p className="text-sm text-muted-foreground">{profile.klinika_adresa}</p>}
                        </div>
                      )}
                      {profile.opis && (
                        <div>
                          <Label className="text-muted-foreground">Opis</Label>
                          <p className="mt-1">{profile.opis}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* BLOG TAB */}
            <TabsContent value="blog" className="space-y-6">
              {!canWriteBlog ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Blog nije omogućen</h3>
                    <p className="text-muted-foreground">Administrator nije omogućio pisanje blog članaka za doktore.</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Moji članci ({myBlogPosts.length})</h2>
                    <Button onClick={() => navigate('/blog/editor')}>
                      <Plus className="h-4 w-4 mr-2" /> Novi članak
                    </Button>
                  </div>

                  {myBlogPosts.length === 0 ? (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nemate objavljenih članaka</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {myBlogPosts.map(post => (
                        <Card key={post.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold">{post.naslov}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.excerpt}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                    {post.status === 'published' ? 'Objavljeno' : 'Nacrt'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(post.created_at).toLocaleDateString('bs-BA')}
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => navigate(`/blog/editor/${post.slug}`)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteBlogPost(post.id)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                </>
              )}
            </TabsContent>

            {/* CALENDAR SYNC TAB */}
            <TabsContent value="calendar-sync" className="space-y-6">
              <CalendarSyncSettings />
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Leave Clinic Confirmation Dialog */}
      <AlertDialog open={showLeaveClinicDialog} onOpenChange={setShowLeaveClinicDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Napustiti kliniku?</AlertDialogTitle>
            <AlertDialogDescription>
              Da li ste sigurni da želite napustiti kliniku "{profile?.klinika_naziv}"? 
              Ova akcija će prekinuti vašu povezanost sa klinikom.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveClinic} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Napusti kliniku
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Footer />
    </>
  );
}
