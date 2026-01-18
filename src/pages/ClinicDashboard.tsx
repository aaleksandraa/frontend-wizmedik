import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { clinicDashboardAPI, specialtiesAPI, uploadAPI, citiesAPI, notifikacijeAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/hooks/use-toast';
import { 
  Building2, Calendar, Users, Settings, Plus, Search, MapPin, Stethoscope,
  Clock, ChevronLeft, ChevronRight, X, UserPlus, CalendarDays, Trash2, Edit, Upload, Loader2, Check, Key, Image as ImageIcon, Star
} from 'lucide-react';
import { format } from 'date-fns';
import { Navbar } from '@/components/Navbar';
import { ClinicCalendar } from '@/components/clinic/ClinicCalendar';

interface ClinicProfile {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  contact_email?: string;
  website?: string;
  slike: string[];
  radno_vrijeme?: Record<string, { open: string; close: string; closed: boolean }>;
  pauze?: Array<{ od: string; do: string }>;
  odmori?: Array<{ od: string; do: string; razlog: string }>;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  specijalnosti?: number[];
}

interface City {
  id: number;
  naziv: string;
  slug: string;
}

interface GuestVisit {
  id: number;
  doktor_id: number;
  datum: string;
  vrijeme_od: string;
  vrijeme_do: string;
  slot_trajanje_minuti: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  napomena?: string;
  doktor: {
    id: number;
    ime: string;
    prezime: string;
    specijalnost: string;
    slika_profila?: string;
    slug: string;
  };
}

interface SearchDoctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  slika_profila?: string;
}

interface ClinicDoctor {
  id: number;
  ime: string;
  prezime: string;
  email: string;
  telefon: string;
  specijalnost: string;
  specijalnost_id?: number;
  opis?: string;
  slika_profila?: string;
  slug: string;
}

interface Specialty {
  id: number;
  naziv: string;
  children?: Specialty[];
}

interface DoctorInvitation {
  id: number;
  doktor_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  poruka?: string;
  odgovor?: string;
  created_at: string;
  doktor: {
    id: number;
    ime: string;
    prezime: string;
    specijalnost: string;
    slika_profila?: string;
    slug: string;
  };
}

const MJESECI = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

export default function ClinicDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'kalendar';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState<ClinicProfile | null>(null);
  const [guestVisits, setGuestVisits] = useState<GuestVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchDoctor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<SearchDoctor | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const [guestForm, setGuestForm] = useState({
    datum: '',
    vrijeme_od: '08:00',
    vrijeme_do: '16:00',
    slot_trajanje_minuti: 30,
    napomena: ''
  });

  // Stalni doktori state
  const [clinicDoctors, setClinicDoctors] = useState<ClinicDoctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<ClinicDoctor | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    ime: '', prezime: '', email: '', password: '', telefon: '',
    specijalnost: '', specijalnost_id: '', opis: '', slika_profila: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile enhancements state
  const [cities, setCities] = useState<City[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<number[]>([]);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Gallery state
  const [uploadingGalleryImage, setUploadingGalleryImage] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Pozivi postojećim doktorima
  const [invitations, setInvitations] = useState<DoctorInvitation[]>([]);
  const [doctorRequests, setDoctorRequests] = useState<DoctorInvitation[]>([]);
  const [showInviteDoctor, setShowInviteDoctor] = useState(false);
  const [existingDoctorSearch, setExistingDoctorSearch] = useState('');
  const [existingDoctorResults, setExistingDoctorResults] = useState<SearchDoctor[]>([]);
  const [selectedExistingDoctor, setSelectedExistingDoctor] = useState<SearchDoctor | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  // Pauze i neradni dani
  const [breaks, setBreaks] = useState<Array<{ od: string; do: string }>>([]);
  const [holidays, setHolidays] = useState<Array<{ od: string; do: string; razlog: string }>>([]);

  useEffect(() => {
    if (user?.role === 'clinic') {
      fetchData();
      fetchSpecialties();
      fetchCities();
    } else {
      setLoading(false);
    }
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
        'gostujuci': ['gostovanje_poziv', 'gostovanje_potvrda', 'gostovanje_otkazano'],
        'doktori': ['doktor_zahtjev', 'klinika_poziv_prihvacen', 'klinika_poziv_odbijen'],
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
    
    if (user?.role === 'clinic') {
      markNotificationsAsRead();
    }
  }, [activeTab, user]);

  const fetchSpecialties = async () => {
    try {
      const res = await specialtiesAPI.getAll();
      setSpecialties(res.data?.data || res.data || []);
    } catch (error) {
      console.error('Error fetching specialties:', error);
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

  const getAllSpecialties = (specs: Specialty[]): Specialty[] => {
    let result: Specialty[] = [];
    specs.forEach(spec => {
      result.push(spec);
      if (spec.children) result = result.concat(getAllSpecialties(spec.children));
    });
    return result;
  };

  const fetchData = async () => {
    try {
      const [profileRes, guestRes, doctorsRes, invitationsRes, doctorRequestsRes] = await Promise.all([
        clinicDashboardAPI.getProfile(),
        clinicDashboardAPI.getGuestDoctors({ upcoming: 'true' }),
        clinicDashboardAPI.getDoctors(),
        clinicDashboardAPI.getInvitations(),
        clinicDashboardAPI.getDoctorRequests()
      ]);
      const profileData = profileRes.data;
      setProfile(profileData);
      
      // Set selected specialties if they exist
      if (profileData.specijalnosti_ids) {
        setSelectedSpecialties(profileData.specijalnosti_ids);
      }
      
      // Set breaks and holidays if they exist
      if (profileData.pauze && Array.isArray(profileData.pauze)) {
        setBreaks(profileData.pauze);
      }
      if (profileData.odmori && Array.isArray(profileData.odmori)) {
        setHolidays(profileData.odmori);
      }
      
      setInvitations((invitationsRes.data || []).filter((i: any) => i.initiated_by === 'clinic'));
      setDoctorRequests(doctorRequestsRes.data || []);
      setGuestVisits(guestRes.data || []);
      setClinicDoctors(doctorsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stalni doktori handlers
  const resetDoctorForm = () => {
    setDoctorForm({ ime: '', prezime: '', email: '', password: '', telefon: '', specijalnost: '', specijalnost_id: '', opis: '', slika_profila: '' });
    setEditingDoctor(null);
    setFormErrors({});
  };

  const openDoctorDialog = (doctor?: ClinicDoctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setDoctorForm({
        ime: doctor.ime, prezime: doctor.prezime, email: doctor.email, password: '',
        telefon: doctor.telefon, specijalnost: doctor.specijalnost,
        specijalnost_id: doctor.specijalnost_id?.toString() || '',
        opis: doctor.opis || '', slika_profila: doctor.slika_profila || ''
      });
    } else {
      resetDoctorForm();
    }
    setShowAddDoctor(true);
  };

  const validateDoctorForm = () => {
    const errors: Record<string, string> = {};
    if (!doctorForm.ime.trim()) errors.ime = 'Ime je obavezno';
    if (!doctorForm.prezime.trim()) errors.prezime = 'Prezime je obavezno';
    if (!doctorForm.email.trim()) errors.email = 'Email je obavezan';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(doctorForm.email)) errors.email = 'Unesite ispravan email';
    if (!editingDoctor && !doctorForm.password) errors.password = 'Lozinka je obavezna';
    else if (!editingDoctor && doctorForm.password.length < 8) errors.password = 'Lozinka mora imati najmanje 8 karaktera';
    if (!doctorForm.telefon.trim()) errors.telefon = 'Telefon je obavezan';
    if (!doctorForm.specijalnost) errors.specijalnost = 'Specijalnost je obavezna';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingImage(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'doctors');
      setDoctorForm({ ...doctorForm, slika_profila: response.data.url });
      toast({ title: 'Uspjeh', description: 'Slika uploadovana' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće uploadovati sliku', variant: 'destructive' });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveDoctor = async () => {
    if (!validateDoctorForm()) return;
    
    try {
      const data: any = {
        ime: doctorForm.ime, prezime: doctorForm.prezime, email: doctorForm.email,
        telefon: doctorForm.telefon, specijalnost: doctorForm.specijalnost,
        specijalnost_id: doctorForm.specijalnost_id ? parseInt(doctorForm.specijalnost_id) : null,
        opis: doctorForm.opis || null, slika_profila: doctorForm.slika_profila || null
      };
      if (doctorForm.password) data.password = doctorForm.password;

      if (editingDoctor) {
        await clinicDashboardAPI.updateDoctor(editingDoctor.id, data);
        toast({ title: 'Uspjeh', description: 'Doktor ažuriran' });
      } else {
        await clinicDashboardAPI.addDoctor(data);
        toast({ title: 'Uspjeh', description: 'Doktor dodan' });
      }
      setShowAddDoctor(false);
      resetDoctorForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće sačuvati', variant: 'destructive' });
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Obrisati doktora?')) return;
    try {
      await clinicDashboardAPI.removeDoctor(id);
      toast({ title: 'Uspjeh', description: 'Doktor uklonjen' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće obrisati', variant: 'destructive' });
    }
  };

  // Pozivi postojećim doktorima
  const searchExistingDoctors = async (query: string) => {
    if (query.length < 2) {
      setExistingDoctorResults([]);
      return;
    }
    try {
      const response = await clinicDashboardAPI.searchExistingDoctors({ search: query });
      setExistingDoctorResults(response.data || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
    }
  };

  const handleInviteDoctor = async () => {
    if (!selectedExistingDoctor) {
      toast({ title: 'Greška', description: 'Odaberite doktora', variant: 'destructive' });
      return;
    }
    try {
      await clinicDashboardAPI.inviteDoctor({
        doktor_id: selectedExistingDoctor.id,
        poruka: inviteMessage || null
      });
      toast({ title: 'Uspjeh', description: 'Poziv poslan doktoru' });
      setShowInviteDoctor(false);
      setSelectedExistingDoctor(null);
      setExistingDoctorSearch('');
      setInviteMessage('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće poslati poziv', variant: 'destructive' });
    }
  };

  const handleCancelInvitation = async (id: number) => {
    if (!confirm('Otkazati poziv?')) return;
    try {
      await clinicDashboardAPI.cancelInvitation(id);
      toast({ title: 'Uspjeh', description: 'Poziv otkazan' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće otkazati', variant: 'destructive' });
    }
  };

  const handleRespondToDoctorRequest = async (id: number, status: 'accepted' | 'rejected') => {
    try {
      await clinicDashboardAPI.respondToDoctorRequest(id, status);
      toast({ title: 'Uspjeh', description: status === 'accepted' ? 'Zahtjev prihvaćen' : 'Zahtjev odbijen' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Nije moguće odgovoriti', variant: 'destructive' });
    }
  };

  const searchDoctors = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await clinicDashboardAPI.searchDoctors({ search: query });
      setSearchResults(response.data || []);
    } catch (error) {
      console.error('Error searching doctors:', error);
    }
  };

  const handleAddGuestDoctor = async () => {
    if (!selectedDoctor || !guestForm.datum) {
      toast({ title: 'Greška', description: 'Odaberite doktora i datum', variant: 'destructive' });
      return;
    }
    try {
      await clinicDashboardAPI.addGuestDoctor({
        doktor_id: selectedDoctor.id,
        ...guestForm
      });
      toast({ title: 'Uspjeh', description: 'Poziv za gostovanje poslan' });
      setShowAddGuest(false);
      resetGuestForm();
      fetchData();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.error || 'Nije moguće dodati gostovanje', 
        variant: 'destructive' 
      });
    }
  };

  const handleCancelGuestVisit = async (id: number) => {
    if (!confirm('Otkazati gostovanje?')) return;
    try {
      await clinicDashboardAPI.cancelGuestDoctor(id, 'Otkazano od strane klinike');
      toast({ title: 'Uspjeh', description: 'Gostovanje otkazano' });
      fetchData();
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće otkazati', variant: 'destructive' });
    }
  };

  const resetGuestForm = () => {
    setSelectedDoctor(null);
    setSearchQuery('');
    setSearchResults([]);
    setGuestForm({ datum: '', vrijeme_od: '08:00', vrijeme_do: '16:00', slot_trajanje_minuti: 30, napomena: '' });
  };

  const updateProfile = async () => {
    if (!profile) return;
    try {
      const updateData = {
        ...profile,
        specijalnosti: selectedSpecialties,
        pauze: breaks,
        odmori: holidays
      };
      await clinicDashboardAPI.updateProfile(updateData);
      toast({ title: 'Uspjeh', description: 'Profil ažuriran' });
      setEditingProfile(false);
      fetchData(); // Refresh to get updated data
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće ažurirati profil', variant: 'destructive' });
    }
  };

  const updateRadnoVrijeme = (dan: string, field: string, value: any) => {
    if (!profile) return;
    setProfile({
      ...profile,
      radno_vrijeme: {
        ...profile.radno_vrijeme,
        [dan]: {
          ...profile.radno_vrijeme?.[dan],
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
      await clinicDashboardAPI.changePassword(passwordForm);
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

  // Gallery functions
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
      const response = await uploadAPI.uploadImage(file, 'clinics');
      const newImages = [...(profile?.slike || []), response.data.url];
      
      await clinicDashboardAPI.updateProfile({ slike: newImages });
      
      setProfile({ ...profile!, slike: newImages });
      toast({ title: 'Uspjeh', description: 'Slika dodana u galeriju' });
      
      // Reset input
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
      const newImages = (profile?.slike || []).filter(img => img !== imageUrl);
      await clinicDashboardAPI.updateProfile({ slike: newImages });
      
      setProfile({ ...profile!, slike: newImages });
      toast({ title: 'Uspjeh', description: 'Slika obrisana' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće obrisati sliku', variant: 'destructive' });
    }
  };

  const handleSetProfileImage = async (imageUrl: string) => {
    try {
      // Move selected image to first position
      const otherImages = (profile?.slike || []).filter(img => img !== imageUrl);
      const newImages = [imageUrl, ...otherImages];
      
      await clinicDashboardAPI.updateProfile({ slike: newImages });
      
      setProfile({ ...profile!, slike: newImages });
      toast({ title: 'Uspjeh', description: 'Profilna slika postavljena' });
    } catch (error) {
      toast({ title: 'Greška', description: 'Nije moguće postaviti profilnu sliku', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="secondary">Na čekanju</Badge>;
      case 'confirmed': return <Badge variant="default">Potvrđeno</Badge>;
      case 'cancelled': return <Badge variant="destructive">Otkazano</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user?.role !== 'clinic') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Building2 className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nema dozvole</h2>
            <p className="text-muted-foreground">Samo klinike mogu pristupiti ovoj stranici.</p>
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
              {profile?.slike?.[0] ? (
                <img src={profile.slike[0]} alt="" className="w-16 h-16 rounded-lg object-cover border-4 border-primary/20" />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{profile?.naziv}</h1>
                <p className="text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {profile?.grad}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{clinicDoctors.length}</p>
                    <p className="text-xs text-muted-foreground">Stalnih doktora</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{guestVisits.filter(g => g.status === 'confirmed').length}</p>
                    <p className="text-xs text-muted-foreground">Gostovanja</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-8 w-8 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">{guestVisits.filter(g => g.status === 'pending').length}</p>
                    <p className="text-xs text-muted-foreground">Na čekanju</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{clinicDoctors.length + new Set(guestVisits.filter(g => g.status === 'confirmed').map(g => g.doktor_id)).size}</p>
                    <p className="text-xs text-muted-foreground">Ukupno doktora</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Doctor Requests Alert */}
          {doctorRequests.filter(r => r.status === 'pending').length > 0 && (
            <Card className="border-green-200 bg-green-50/50 mb-6">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                  Zahtjevi doktora ({doctorRequests.filter(r => r.status === 'pending').length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {doctorRequests.filter(r => r.status === 'pending').map(req => (
                  <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 bg-white rounded-lg border">
                    <div className="flex items-center gap-3">
                      {req.doktor?.slika_profila ? (
                        <img src={req.doktor.slika_profila} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                          {req.doktor?.ime?.[0]}{req.doktor?.prezime?.[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">Dr. {req.doktor?.ime} {req.doktor?.prezime}</p>
                        <p className="text-sm text-muted-foreground">{req.doktor?.specijalnost}</p>
                        {req.poruka && <p className="text-sm text-muted-foreground mt-1 italic">"{req.poruka}"</p>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRespondToDoctorRequest(req.id, 'rejected')}>
                        <X className="h-4 w-4 mr-1" /> Odbij
                      </Button>
                      <Button size="sm" onClick={() => handleRespondToDoctorRequest(req.id, 'accepted')}>
                        <Check className="h-4 w-4 mr-1" /> Prihvati
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
              <TabsTrigger value="doktori" className="flex-1 min-w-[100px]">
                <Stethoscope className="h-4 w-4 mr-2 hidden sm:inline" />
                Doktori
              </TabsTrigger>
              <TabsTrigger value="gostujuci" className="flex-1 min-w-[100px]">
                <UserPlus className="h-4 w-4 mr-2 hidden sm:inline" />
                Gostujući
              </TabsTrigger>
              <TabsTrigger value="kalendar" className="flex-1 min-w-[100px]">
                <Calendar className="h-4 w-4 mr-2 hidden sm:inline" />
                Kalendar
              </TabsTrigger>
              <TabsTrigger value="galerija" className="flex-1 min-w-[100px]">
                <ImageIcon className="h-4 w-4 mr-2 hidden sm:inline" />
                Galerija
              </TabsTrigger>
              <TabsTrigger value="profil" className="flex-1 min-w-[100px]">
                <Settings className="h-4 w-4 mr-2 hidden sm:inline" />
                Profil
              </TabsTrigger>
            </TabsList>

            {/* CLINIC DOCTORS TAB */}
            <TabsContent value="doktori" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Stalni doktori ({clinicDoctors.length})</h2>
                <div className="flex gap-2">
                  {/* Pozovi postojećeg doktora */}
                  <Dialog open={showInviteDoctor} onOpenChange={(open) => { 
                    setShowInviteDoctor(open); 
                    if (!open) { setSelectedExistingDoctor(null); setExistingDoctorSearch(''); setInviteMessage(''); setExistingDoctorResults([]); }
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline"><UserPlus className="h-4 w-4 mr-2" /> Pozovi postojećeg</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Pozovi postojećeg doktora</DialogTitle>
                        <DialogDescription>Pronađite doktora koji već ima profil i pošaljite mu poziv da se pridruži vašoj klinici</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!selectedExistingDoctor ? (
                          <div>
                            <Label>Pretraži doktore</Label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="Ime, prezime ili specijalnost..."
                                value={existingDoctorSearch}
                                onChange={(e) => { setExistingDoctorSearch(e.target.value); searchExistingDoctors(e.target.value); }}
                                className="pl-9"
                              />
                            </div>
                            {existingDoctorResults.length > 0 && (
                              <div className="mt-2 border rounded-lg max-h-60 overflow-auto">
                                {existingDoctorResults.map(doc => (
                                  <div
                                    key={doc.id}
                                    className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3 border-b last:border-0"
                                    onClick={() => { setSelectedExistingDoctor(doc); setExistingDoctorResults([]); }}
                                  >
                                    {doc.slika_profila ? (
                                      <img src={doc.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                        {doc.ime[0]}{doc.prezime[0]}
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-medium">Dr. {doc.ime} {doc.prezime}</p>
                                      <p className="text-sm text-muted-foreground">{doc.specijalnost} • {doc.grad}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {selectedExistingDoctor.slika_profila ? (
                                <img src={selectedExistingDoctor.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                  {selectedExistingDoctor.ime[0]}{selectedExistingDoctor.prezime[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">Dr. {selectedExistingDoctor.ime} {selectedExistingDoctor.prezime}</p>
                                <p className="text-sm text-muted-foreground">{selectedExistingDoctor.specijalnost}</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedExistingDoctor(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        <div>
                          <Label>Poruka (opciono)</Label>
                          <Textarea
                            value={inviteMessage}
                            onChange={(e) => setInviteMessage(e.target.value)}
                            placeholder="Napišite poruku doktoru..."
                            rows={3}
                          />
                        </div>
                        <Button onClick={handleInviteDoctor} className="w-full" disabled={!selectedExistingDoctor}>
                          Pošalji poziv
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Dodaj novog doktora */}
                  <Dialog open={showAddDoctor} onOpenChange={(open) => { setShowAddDoctor(open); if (!open) resetDoctorForm(); }}>
                    <DialogTrigger asChild>
                      <Button><Plus className="h-4 w-4 mr-2" /> Dodaj novog</Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{editingDoctor ? 'Uredi doktora' : 'Dodaj novog doktora'}</DialogTitle>
                      <DialogDescription>
                        {editingDoctor ? 'Ažurirajte podatke doktora' : 'Unesite podatke za novog doktora koji će raditi u klinici'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Ime *</Label>
                          <Input 
                            value={doctorForm.ime} 
                            onChange={(e) => { setDoctorForm({ ...doctorForm, ime: e.target.value }); setFormErrors({ ...formErrors, ime: '' }); }}
                            className={formErrors.ime ? 'border-red-500' : ''}
                          />
                          {formErrors.ime && <p className="text-xs text-red-500 mt-1">{formErrors.ime}</p>}
                        </div>
                        <div>
                          <Label>Prezime *</Label>
                          <Input 
                            value={doctorForm.prezime} 
                            onChange={(e) => { setDoctorForm({ ...doctorForm, prezime: e.target.value }); setFormErrors({ ...formErrors, prezime: '' }); }}
                            className={formErrors.prezime ? 'border-red-500' : ''}
                          />
                          {formErrors.prezime && <p className="text-xs text-red-500 mt-1">{formErrors.prezime}</p>}
                        </div>
                      </div>
                      <div>
                        <Label>Email (za login) *</Label>
                        <Input 
                          type="email" 
                          value={doctorForm.email} 
                          onChange={(e) => { setDoctorForm({ ...doctorForm, email: e.target.value }); setFormErrors({ ...formErrors, email: '' }); }}
                          className={formErrors.email ? 'border-red-500' : ''}
                        />
                        {formErrors.email && <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <Label>Lozinka {editingDoctor ? '(ostavite prazno za zadržavanje)' : '*'}</Label>
                        <Input 
                          type="password" 
                          value={doctorForm.password} 
                          onChange={(e) => { setDoctorForm({ ...doctorForm, password: e.target.value }); setFormErrors({ ...formErrors, password: '' }); }}
                          className={formErrors.password ? 'border-red-500' : ''}
                        />
                        {formErrors.password && <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>}
                      </div>
                      <div>
                        <Label>Telefon *</Label>
                        <Input 
                          value={doctorForm.telefon} 
                          onChange={(e) => { setDoctorForm({ ...doctorForm, telefon: e.target.value }); setFormErrors({ ...formErrors, telefon: '' }); }}
                          className={formErrors.telefon ? 'border-red-500' : ''}
                        />
                        {formErrors.telefon && <p className="text-xs text-red-500 mt-1">{formErrors.telefon}</p>}
                      </div>
                      <div>
                        <Label>Specijalnost *</Label>
                        <Select value={doctorForm.specijalnost_id} onValueChange={(val) => {
                          const spec = getAllSpecialties(specialties).find(s => s.id.toString() === val);
                          setDoctorForm({ ...doctorForm, specijalnost_id: val, specijalnost: spec?.naziv || '' });
                          setFormErrors({ ...formErrors, specijalnost: '' });
                        }}>
                          <SelectTrigger className={formErrors.specijalnost ? 'border-red-500' : ''}><SelectValue placeholder="Odaberi specijalnost" /></SelectTrigger>
                          <SelectContent>
                            {getAllSpecialties(specialties).map(spec => (
                              <SelectItem key={spec.id} value={spec.id.toString()}>{spec.naziv}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.specijalnost && <p className="text-xs text-red-500 mt-1">{formErrors.specijalnost}</p>}
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea value={doctorForm.opis} onChange={(e) => setDoctorForm({ ...doctorForm, opis: e.target.value })} rows={3} />
                      </div>
                      <div>
                        <Label>Slika profila</Label>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <div className="flex items-center gap-3">
                          {doctorForm.slika_profila ? (
                            <div className="relative">
                              <img src={doctorForm.slika_profila} alt="Preview" className="w-16 h-16 rounded-full object-cover border" />
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="icon" 
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => setDoctorForm({ ...doctorForm, slika_profila: '' })}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed">
                              <Upload className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingImage}
                          >
                            {uploadingImage ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Učitavanje...</> : 'Odaberi sliku'}
                          </Button>
                        </div>
                      </div>
                      <Button onClick={handleSaveDoctor} className="w-full" disabled={uploadingImage}>
                        {editingDoctor ? 'Sačuvaj izmjene' : 'Dodaj doktora'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                </div>
              </div>

              {clinicDoctors.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nema stalnih doktora</h3>
                    <p className="text-muted-foreground mb-4">Dodajte doktore koji rade u vašoj klinici</p>
                    <Button onClick={() => setShowAddDoctor(true)}><Plus className="h-4 w-4 mr-2" /> Dodaj doktora</Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {clinicDoctors.map(doctor => (
                    <Card key={doctor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {doctor.slika_profila ? (
                              <img src={doctor.slika_profila} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {doctor.ime[0]}{doctor.prezime[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Dr. {doctor.ime} {doctor.prezime}</p>
                              <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>
                              <p className="text-xs text-muted-foreground">{doctor.email} • {doctor.telefon}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openDoctorDialog(doctor)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDoctor(doctor.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Poslani pozivi */}
              {invitations.filter(i => i.status === 'pending').length > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Poslani pozivi ({invitations.filter(i => i.status === 'pending').length})
                  </h3>
                  <div className="space-y-3">
                    {invitations.filter(i => i.status === 'pending').map(inv => (
                      <Card key={inv.id} className="border-yellow-200 bg-yellow-50/50">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              {inv.doktor?.slika_profila ? (
                                <img src={inv.doktor.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-semibold">
                                  {inv.doktor?.ime?.[0]}{inv.doktor?.prezime?.[0]}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">Dr. {inv.doktor?.ime} {inv.doktor?.prezime}</p>
                                <p className="text-sm text-muted-foreground">{inv.doktor?.specijalnost}</p>
                                <Badge variant="secondary" className="mt-1">Čeka odgovor</Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleCancelInvitation(inv.id)}>
                              Otkaži poziv
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* GUEST DOCTORS TAB */}
            <TabsContent value="gostujuci" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gostujući doktori</h2>
                <Dialog open={showAddGuest} onOpenChange={(open) => { setShowAddGuest(open); if (!open) resetGuestForm(); }}>
                  <DialogTrigger asChild>
                    <Button><Plus className="h-4 w-4 mr-2" /> Dodaj gostovanje</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Pozovi doktora na gostovanje</DialogTitle>
                      <DialogDescription>Pronađite doktora i odaberite datum i vrijeme gostovanja</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!selectedDoctor ? (
                        <div>
                          <Label>Pretraži doktore</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Ime, prezime ili specijalnost..."
                              value={searchQuery}
                              onChange={(e) => { setSearchQuery(e.target.value); searchDoctors(e.target.value); }}
                              className="pl-9"
                            />
                          </div>
                          {searchResults.length > 0 && (
                            <div className="mt-2 border rounded-lg max-h-60 overflow-auto">
                              {searchResults.map(doc => (
                                <div
                                  key={doc.id}
                                  className="p-3 hover:bg-muted cursor-pointer flex items-center gap-3 border-b last:border-0"
                                  onClick={() => { setSelectedDoctor(doc); setSearchResults([]); }}
                                >
                                  {doc.slika_profila ? (
                                    <img src={doc.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                      {doc.ime[0]}{doc.prezime[0]}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-medium">Dr. {doc.ime} {doc.prezime}</p>
                                    <p className="text-sm text-muted-foreground">{doc.specijalnost} • {doc.grad}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedDoctor.slika_profila ? (
                              <img src={selectedDoctor.slika_profila} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {selectedDoctor.ime[0]}{selectedDoctor.prezime[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Dr. {selectedDoctor.ime} {selectedDoctor.prezime}</p>
                              <p className="text-sm text-muted-foreground">{selectedDoctor.specijalnost}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedDoctor(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      <div>
                        <Label>Datum gostovanja *</Label>
                        <DatePicker
                          date={guestForm.datum ? new Date(guestForm.datum) : undefined}
                          onSelect={(date) => setGuestForm({ 
                            ...guestForm, 
                            datum: date ? format(date, 'yyyy-MM-dd') : '' 
                          })}
                          placeholder="Odaberite datum"
                          minDate={new Date()}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vrijeme od</Label>
                          <Input
                            type="time"
                            value={guestForm.vrijeme_od}
                            onChange={(e) => setGuestForm({ ...guestForm, vrijeme_od: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Vrijeme do</Label>
                          <Input
                            type="time"
                            value={guestForm.vrijeme_do}
                            onChange={(e) => setGuestForm({ ...guestForm, vrijeme_do: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Trajanje termina (min)</Label>
                        <Input
                          type="number"
                          value={guestForm.slot_trajanje_minuti}
                          onChange={(e) => setGuestForm({ ...guestForm, slot_trajanje_minuti: parseInt(e.target.value) || 30 })}
                          min={10}
                          max={120}
                        />
                      </div>

                      <div>
                        <Label>Napomena (opciono)</Label>
                        <Textarea
                          value={guestForm.napomena}
                          onChange={(e) => setGuestForm({ ...guestForm, napomena: e.target.value })}
                          placeholder="Dodatne informacije za doktora..."
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleAddGuestDoctor} className="w-full" disabled={!selectedDoctor || !guestForm.datum}>
                        Pošalji poziv
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Guest visits list */}
              <div className="space-y-4">
                {guestVisits.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nema gostujućih doktora</h3>
                      <p className="text-muted-foreground mb-4">Pozovite specijaliste da gostuju u vašoj klinici</p>
                      <Button onClick={() => setShowAddGuest(true)}>
                        <Plus className="h-4 w-4 mr-2" /> Dodaj gostovanje
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  guestVisits.map(visit => (
                    <Card key={visit.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {visit.doktor.slika_profila ? (
                              <img src={visit.doktor.slika_profila} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                {visit.doktor.ime[0]}{visit.doktor.prezime[0]}
                              </div>
                            )}
                            <div>
                              <p className="font-medium">Dr. {visit.doktor.ime} {visit.doktor.prezime}</p>
                              <p className="text-sm text-muted-foreground">{visit.doktor.specijalnost}</p>
                              <div className="flex items-center gap-2 mt-1 text-sm">
                                <CalendarDays className="h-3 w-3" />
                                <span>{format(new Date(visit.datum), 'dd.MM.yyyy.')}</span>
                                <Clock className="h-3 w-3 ml-2" />
                                <span>{visit.vrijeme_od?.slice(0, 5)} - {visit.vrijeme_do?.slice(0, 5)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(visit.status)}
                            {visit.status !== 'cancelled' && (
                              <Button variant="destructive" size="sm" onClick={() => handleCancelGuestVisit(visit.id)}>
                                Otkaži
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>


            {/* CALENDAR TAB */}
            <TabsContent value="kalendar" className="space-y-6">
              <ClinicCalendar 
                clinicDoctors={clinicDoctors}
                guestVisits={guestVisits}
                onRefresh={fetchData}
              />
            </TabsContent>

            {/* GALLERY TAB */}
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
                  {profile?.slike && profile.slike.length > 0 ? (
                    <>
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Profilna slika:</strong> Prva slika u galeriji se koristi kao profilna slika klinike.
                          Kliknite na <Star className="h-3 w-3 inline" /> da postavite sliku kao profilnu.
                        </p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {profile.slike.map((imageUrl, index) => (
                          <div
                            key={index}
                            className={`relative group rounded-lg overflow-hidden border-2 ${
                              index === 0 ? 'border-primary shadow-lg' : 'border-gray-200'
                            }`}
                          >
                            <div className="aspect-square relative">
                              <img
                                src={imageUrl}
                                alt={`Slika ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-current" />
                                  Profilna
                                </div>
                              )}
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {index !== 0 && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleSetProfileImage(imageUrl)}
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
                        Dodajte slike vaše klinike da bi pacijenti mogli vidjeti vaš prostor
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
                  <p>• <strong>Profilna slika:</strong> Prva slika u galeriji se automatski koristi kao profilna slika na rezultatima pretrage</p>
                  <p>• <strong>Kvalitet:</strong> Koristite slike visokog kvaliteta (preporučeno 1200x800px ili veće)</p>
                  <p>• <strong>Veličina:</strong> Maksimalna veličina slike je 5MB</p>
                  <p>• <strong>Format:</strong> Podržani formati: JPG, PNG, GIF</p>
                  <p>• <strong>Sadržaj:</strong> Dodajte slike čekaonice, ordinacija, opreme, osoblja (uz dozvolu)</p>
                </CardContent>
              </Card>
            </TabsContent>

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
                        <Button variant="outline" onClick={() => setEditingProfile(false)}>Odustani</Button>
                        <Button onClick={updateProfile}>Sačuvaj</Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Naziv *</Label>
                          <Input
                            value={profile.naziv}
                            onChange={(e) => setProfile({ ...profile, naziv: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Grad *</Label>
                          <Select
                            value={profile.grad}
                            onValueChange={(value) => setProfile({ ...profile, grad: value })}
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
                          <p className="text-xs text-muted-foreground mt-1">
                            Grad mora biti odabran iz liste da bi filteri radili ispravno
                          </p>
                        </div>
                        <div>
                          <Label>Adresa *</Label>
                          <Input
                            value={profile.adresa}
                            onChange={(e) => setProfile({ ...profile, adresa: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Telefon *</Label>
                          <Input
                            value={profile.telefon}
                            onChange={(e) => setProfile({ ...profile, telefon: e.target.value })}
                            disabled={!editingProfile}
                          />
                        </div>
                        <div>
                          <Label>Kontakt Email (javni)</Label>
                          <Input
                            type="email"
                            value={profile.contact_email || ''}
                            onChange={(e) => setProfile({ ...profile, contact_email: e.target.value })}
                            disabled={!editingProfile}
                            placeholder="email@klinika.ba"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Ovaj email će biti prikazan na javnom profilu klinike
                          </p>
                        </div>
                        <div>
                          <Label>Website</Label>
                          <Input
                            value={profile.website || ''}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            disabled={!editingProfile}
                            placeholder="https://www.klinika.ba"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Opis</Label>
                        <Textarea
                          value={profile.opis || ''}
                          onChange={(e) => setProfile({ ...profile, opis: e.target.value })}
                          disabled={!editingProfile}
                          rows={4}
                          placeholder="Opišite vašu kliniku, usluge koje nudite..."
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Google Maps Link</Label>
                          <Input
                            value={profile.google_maps_link || ''}
                            onChange={(e) => setProfile({ ...profile, google_maps_link: e.target.value })}
                            disabled={!editingProfile}
                            placeholder="https://maps.google.com/..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Latitude</Label>
                            <Input
                              type="number"
                              step="any"
                              value={profile.latitude || ''}
                              onChange={(e) => setProfile({ ...profile, latitude: parseFloat(e.target.value) || undefined })}
                              disabled={!editingProfile}
                            />
                          </div>
                          <div>
                            <Label>Longitude</Label>
                            <Input
                              type="number"
                              step="any"
                              value={profile.longitude || ''}
                              onChange={(e) => setProfile({ ...profile, longitude: parseFloat(e.target.value) || undefined })}
                              disabled={!editingProfile}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Radno Vrijeme */}
              <Card>
                <CardHeader>
                  <CardTitle>Radno Vrijeme</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile && (
                    <div className="space-y-3">
                      {['ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota', 'nedelja'].map((dan) => (
                        <div key={dan} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border rounded-lg">
                          <div className="w-32">
                            <Label className="capitalize font-medium">{dan}</Label>
                          </div>
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={profile.radno_vrijeme?.[dan]?.open || '08:00'}
                              onChange={(e) => updateRadnoVrijeme(dan, 'open', e.target.value)}
                              disabled={!editingProfile || profile.radno_vrijeme?.[dan]?.closed}
                              className="w-32"
                            />
                            <span className="text-muted-foreground">-</span>
                            <Input
                              type="time"
                              value={profile.radno_vrijeme?.[dan]?.close || '16:00'}
                              onChange={(e) => updateRadnoVrijeme(dan, 'close', e.target.value)}
                              disabled={!editingProfile || profile.radno_vrijeme?.[dan]?.closed}
                              className="w-32"
                            />
                            <label className="flex items-center gap-2 ml-4">
                              <input
                                type="checkbox"
                                checked={profile.radno_vrijeme?.[dan]?.closed || false}
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

              {/* Pauze */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Pauze</CardTitle>
                    {editingProfile && (
                      <Button variant="outline" size="sm" onClick={() => setBreaks([...breaks, { od: '12:00', do: '13:00' }])}>
                        <Plus className="h-4 w-4 mr-1" /> Dodaj
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {breaks.length === 0 && <p className="text-muted-foreground text-center py-4">Nema pauza</p>}
                  {breaks.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                      <Input 
                        type="time" 
                        value={b.od} 
                        onChange={(e) => { const n = [...breaks]; n[i].od = e.target.value; setBreaks(n); }} 
                        disabled={!editingProfile}
                        className="w-28" 
                      />
                      <span>-</span>
                      <Input 
                        type="time" 
                        value={b.do} 
                        onChange={(e) => { const n = [...breaks]; n[i].do = e.target.value; setBreaks(n); }} 
                        disabled={!editingProfile}
                        className="w-28" 
                      />
                      {editingProfile && (
                        <Button variant="ghost" size="sm" onClick={() => setBreaks(breaks.filter((_, idx) => idx !== i))}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Neradni dani */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Neradni dani</CardTitle>
                    {editingProfile && (
                      <Button variant="outline" size="sm" onClick={() => setHolidays([...holidays, { od: new Date().toISOString().split('T')[0], do: new Date().toISOString().split('T')[0], razlog: '' }])}>
                        <Plus className="h-4 w-4 mr-1" /> Dodaj
                      </Button>
                    )}
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
                          disabled={!editingProfile}
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
                          disabled={!editingProfile}
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="Razlog" 
                          value={h.razlog} 
                          onChange={(e) => { const n = [...holidays]; n[i].razlog = e.target.value; setHolidays(n); }} 
                          disabled={!editingProfile}
                          className="flex-1" 
                        />
                        {editingProfile && (
                          <Button variant="ghost" size="sm" onClick={() => setHolidays(holidays.filter((_, idx) => idx !== i))}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Specijalnosti */}
              <Card>
                <CardHeader>
                  <CardTitle>Specijalnosti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Odaberite specijalnosti koje vaša klinika nudi</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-96 overflow-y-auto p-4 border rounded-lg bg-muted/20">
                      {getAllSpecialties(specialties).map((spec) => (
                        <label key={spec.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedSpecialties.includes(spec.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSpecialties([...selectedSpecialties, spec.id]);
                              } else {
                                setSelectedSpecialties(selectedSpecialties.filter(id => id !== spec.id));
                              }
                            }}
                            disabled={!editingProfile}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{spec.naziv}</span>
                        </label>
                      ))}
                    </div>
                    {selectedSpecialties.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-2">Odabrane specijalnosti ({selectedSpecialties.length}):</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedSpecialties.map(id => {
                            const spec = getAllSpecialties(specialties).find(s => s.id === id);
                            return spec ? (
                              <Badge key={id} variant="secondary">{spec.naziv}</Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
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
          </Tabs>
        </div>
      </div>
    </>
  );
}
