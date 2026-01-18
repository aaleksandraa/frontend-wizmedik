import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { clinicDashboardAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, ChevronLeft, ChevronRight, Plus, Clock, User, Phone, Mail, X, Stethoscope
} from 'lucide-react';

interface ClinicDoctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  slika_profila?: string;
}

interface GuestVisit {
  id: number;
  doktor_id: number;
  datum: string;
  status: string;
  doktor: {
    id: number;
    ime: string;
    prezime: string;
    specijalnost: string;
  };
}

interface Appointment {
  id: number;
  datum_vrijeme: string;
  status: string;
  razlog?: string;
  napomene?: string;
  trajanje_minuti: number;
  guest_ime?: string;
  guest_prezime?: string;
  guest_telefon?: string;
  guest_email?: string;
  doktor: {
    id: number;
    ime: string;
    prezime: string;
    specijalnost: string;
    slika_profila?: string;
  };
  user?: {
    id: number;
    ime: string;
    prezime: string;
    telefon?: string;
    email?: string;
  };
  usluga?: {
    id: number;
    naziv: string;
    trajanje_minuti: number;
  };
}

interface Props {
  clinicDoctors: ClinicDoctor[];
  guestVisits: GuestVisit[];
  onRefresh: () => void;
}

const MJESECI = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni', 'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];

export function ClinicCalendar({ clinicDoctors, guestVisits, onRefresh }: Props) {
  const { toast } = useToast();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all');
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]);
  const [loadingDay, setLoadingDay] = useState(false);
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState({
    doktor_id: '',
    datum: '',
    vrijeme: '09:00',
    trajanje_minuti: 30,
    guest_ime: '',
    guest_prezime: '',
    guest_telefon: '',
    guest_email: '',
    razlog: '',
    napomene: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Get all doctors (clinic + guest) with their available dates
  const allDoctors = [
    ...clinicDoctors.map(d => ({ ...d, type: 'stalni' as const, guestDates: [] as string[] })),
    ...guestVisits
      .filter(v => v.status === 'confirmed')
      .reduce((acc, v) => {
        const existing = acc.find(d => d.id === v.doktor.id);
        if (existing) {
          existing.guestDates.push(v.datum);
        } else {
          acc.push({ ...v.doktor, type: 'gostujuci' as const, guestDates: [v.datum] });
        }
        return acc;
      }, [] as Array<{ id: number; ime: string; prezime: string; specijalnost: string; type: 'gostujuci'; guestDates: string[] }>)
  ];

  // Get selected doctor info
  const selectedDoctor = appointmentForm.doktor_id 
    ? allDoctors.find(d => d.id.toString() === appointmentForm.doktor_id)
    : null;

  // Check if selected date is valid for guest doctor
  const isDateValidForDoctor = () => {
    if (!selectedDoctor || selectedDoctor.type === 'stalni') return true;
    if (!appointmentForm.datum) return true;
    return selectedDoctor.guestDates.includes(appointmentForm.datum);
  };

  // Fetch calendar data when month changes
  useEffect(() => {
    fetchCalendarData();
  }, [calendarMonth]);

  const fetchCalendarData = async () => {
    try {
      const res = await clinicDashboardAPI.getCalendarData({
        month: calendarMonth.getMonth() + 1,
        year: calendarMonth.getFullYear()
      });
      setCalendarData(res.data || {});
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const fetchDayAppointments = async (date: string) => {
    setLoadingDay(true);
    try {
      const params: any = { date };
      if (selectedDoctorFilter !== 'all') {
        params.doktor_id = selectedDoctorFilter;
      }
      const res = await clinicDashboardAPI.getAppointmentsByDate(params);
      setDayAppointments(res.data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoadingDay(false);
    }
  };

  const handleDayClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    fetchDayAppointments(dateStr);
  };

  useEffect(() => {
    if (selectedDate) {
      fetchDayAppointments(selectedDate);
    }
  }, [selectedDoctorFilter]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!appointmentForm.doktor_id) errors.doktor_id = 'Odaberite doktora';
    if (!appointmentForm.datum) errors.datum = 'Odaberite datum';
    if (!appointmentForm.guest_ime.trim()) errors.guest_ime = 'Ime je obavezno';
    if (!appointmentForm.guest_prezime.trim()) errors.guest_prezime = 'Prezime je obavezno';
    if (!appointmentForm.guest_telefon.trim()) errors.guest_telefon = 'Telefon je obavezan';
    
    // Validate date for guest doctors
    if (selectedDoctor && selectedDoctor.type === 'gostujuci' && appointmentForm.datum) {
      if (!selectedDoctor.guestDates.includes(appointmentForm.datum)) {
        errors.datum = `Gostujući doktor je dostupan samo na: ${selectedDoctor.guestDates.map(d => format(new Date(d), 'dd.MM.yyyy.')).join(', ')}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddAppointment = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const datumVrijeme = `${appointmentForm.datum} ${appointmentForm.vrijeme}:00`;
      await clinicDashboardAPI.createManualAppointment({
        doktor_id: parseInt(appointmentForm.doktor_id),
        datum_vrijeme: datumVrijeme,
        trajanje_minuti: appointmentForm.trajanje_minuti,
        guest_ime: appointmentForm.guest_ime,
        guest_prezime: appointmentForm.guest_prezime,
        guest_telefon: appointmentForm.guest_telefon,
        guest_email: appointmentForm.guest_email || null,
        razlog: appointmentForm.razlog || null,
        napomene: appointmentForm.napomene || null
      });
      toast({ title: 'Uspjeh', description: 'Termin uspješno dodan' });
      setShowAddAppointment(false);
      resetForm();
      fetchCalendarData();
      if (selectedDate) fetchDayAppointments(selectedDate);
      onRefresh();
    } catch (error: any) {
      toast({ 
        title: 'Greška', 
        description: error.response?.data?.message || 'Nije moguće dodati termin', 
        variant: 'destructive' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setAppointmentForm({
      doktor_id: '',
      datum: selectedDate || '',
      vrijeme: '09:00',
      trajanje_minuti: 30,
      guest_ime: '',
      guest_prezime: '',
      guest_telefon: '',
      guest_email: '',
      razlog: '',
      napomene: ''
    });
    setFormErrors({});
  };

  const openAddDialog = () => {
    resetForm();
    if (selectedDate) {
      setAppointmentForm(prev => ({ ...prev, datum: selectedDate }));
    }
    setShowAddAppointment(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'zakazan': return <Badge variant="secondary">Zakazan</Badge>;
      case 'potvrden': return <Badge variant="default">Potvrđen</Badge>;
      case 'zavrshen': return <Badge className="bg-green-500">Završen</Badge>;
      case 'otkazan': return <Badge variant="destructive">Otkazan</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await clinicDashboardAPI.updateAppointmentStatus(id, status);
      toast({ title: 'Uspjeh', description: 'Status ažuriran' });
      if (selectedDate) fetchDayAppointments(selectedDate);
      fetchCalendarData();
    } catch (error: any) {
      toast({ title: 'Greška', description: error.response?.data?.message || 'Greška', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={selectedDoctorFilter} onValueChange={setSelectedDoctorFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Svi doktori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi doktori</SelectItem>
              {allDoctors.map(doc => (
                <SelectItem key={`${doc.type}-${doc.id}`} value={doc.id.toString()}>
                  Dr. {doc.ime} {doc.prezime} {doc.type === 'gostujuci' ? '(gost)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" /> Dodaj termin
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
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
              {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map(day => (
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
                const dateStr = currentDate.toISOString().split('T')[0];
                const isToday = dayNum === today.getDate() && calendarMonth.getMonth() === today.getMonth() && calendarMonth.getFullYear() === today.getFullYear();
                const isSelected = dateStr === selectedDate;
                const appointmentCount = calendarData[dateStr] || 0;
                const hasGuestVisit = guestVisits.some(v => v.datum === dateStr && v.status === 'confirmed');

                return (
                  <div 
                    key={i} 
                    onClick={() => handleDayClick(dateStr)}
                    className={`p-1 md:p-2 border rounded text-center min-h-[60px] cursor-pointer transition-all hover:border-primary/50
                      ${isToday ? 'bg-primary/10 border-primary' : ''} 
                      ${isSelected ? 'ring-2 ring-primary' : ''}
                      ${appointmentCount > 0 ? 'bg-blue-50 border-blue-200' : ''}
                      ${hasGuestVisit ? 'bg-green-50 border-green-200' : ''}
                    `}
                  >
                    <div className="text-xs md:text-sm font-medium">{dayNum}</div>
                    {appointmentCount > 0 && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs px-1">
                          {appointmentCount} termin{appointmentCount > 1 ? 'a' : ''}
                        </Badge>
                      </div>
                    )}
                    {hasGuestVisit && appointmentCount === 0 && (
                      <div className="mt-1">
                        <div className="text-xs text-green-600">Gost</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Day Details */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {selectedDate ? format(new Date(selectedDate), 'dd.MM.yyyy.') : 'Odaberite dan'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedDate ? (
              <p className="text-muted-foreground text-sm">Kliknite na dan u kalendaru za prikaz termina</p>
            ) : loadingDay ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : dayAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nema termina za ovaj dan</p>
                <Button variant="outline" size="sm" className="mt-4" onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-1" /> Dodaj termin
                </Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {dayAppointments.map(apt => (
                    <div key={apt.id} className="p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(apt.datum_vrijeme), 'HH:mm')}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({apt.trajanje_minuti} min)
                          </span>
                        </div>
                        {getStatusBadge(apt.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-3 w-3 text-muted-foreground" />
                          <span>Dr. {apt.doktor.ime} {apt.doktor.prezime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {apt.user 
                              ? `${apt.user.ime} ${apt.user.prezime}`
                              : `${apt.guest_ime} ${apt.guest_prezime}`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{apt.user?.telefon || apt.guest_telefon || '-'}</span>
                        </div>
                        {apt.razlog && (
                          <p className="text-muted-foreground mt-1">{apt.razlog}</p>
                        )}
                      </div>

                      {apt.status === 'zakazan' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(apt.id, 'potvrden')}>
                            Potvrdi
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleUpdateStatus(apt.id, 'otkazan')}>
                            Otkaži
                          </Button>
                        </div>
                      )}
                      {apt.status === 'potvrden' && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" onClick={() => handleUpdateStatus(apt.id, 'zavrshen')}>
                            Završi
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Appointment Dialog */}
      <Dialog open={showAddAppointment} onOpenChange={setShowAddAppointment}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj termin ručno</DialogTitle>
            <DialogDescription>Unesite podatke za novi termin (telefonska rezervacija ili walk-in)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Doktor *</Label>
              <Select 
                value={appointmentForm.doktor_id} 
                onValueChange={(val) => { 
                  const doc = allDoctors.find(d => d.id.toString() === val);
                  // If guest doctor and has only one date, auto-select it
                  const newDatum = doc?.type === 'gostujuci' && doc.guestDates.length === 1 
                    ? doc.guestDates[0] 
                    : appointmentForm.datum;
                  setAppointmentForm({ ...appointmentForm, doktor_id: val, datum: newDatum }); 
                  setFormErrors({ ...formErrors, doktor_id: '', datum: '' }); 
                }}
              >
                <SelectTrigger className={formErrors.doktor_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Odaberi doktora" />
                </SelectTrigger>
                <SelectContent>
                  {allDoctors.map(doc => (
                    <SelectItem key={`${doc.type}-${doc.id}`} value={doc.id.toString()}>
                      Dr. {doc.ime} {doc.prezime} {doc.type === 'gostujuci' ? '(gost)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.doktor_id && <p className="text-xs text-red-500 mt-1">{formErrors.doktor_id}</p>}
              {selectedDoctor?.type === 'gostujuci' && (
                <p className="text-xs text-blue-600 mt-1">
                  Gostujući doktor - dostupan: {selectedDoctor.guestDates.map(d => format(new Date(d), 'dd.MM.yyyy.')).join(', ')}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Datum *</Label>
                {selectedDoctor?.type === 'gostujuci' ? (
                  <Select 
                    value={appointmentForm.datum} 
                    onValueChange={(val) => { setAppointmentForm({ ...appointmentForm, datum: val }); setFormErrors({ ...formErrors, datum: '' }); }}
                  >
                    <SelectTrigger className={formErrors.datum ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Odaberi datum" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedDoctor.guestDates.map(d => (
                        <SelectItem key={d} value={d}>
                          {format(new Date(d), 'dd.MM.yyyy.')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <DatePicker
                    date={appointmentForm.datum ? new Date(appointmentForm.datum) : undefined}
                    onSelect={(date) => {
                      setAppointmentForm({ 
                        ...appointmentForm, 
                        datum: date ? format(date, 'yyyy-MM-dd') : '' 
                      });
                      setFormErrors({ ...formErrors, datum: '' });
                    }}
                    placeholder="Odaberite datum"
                    className={formErrors.datum ? 'border-red-500' : ''}
                  />
                )}
                {formErrors.datum && <p className="text-xs text-red-500 mt-1">{formErrors.datum}</p>}
              </div>
              <div>
                <Label>Vrijeme *</Label>
                <Input 
                  type="time" 
                  value={appointmentForm.vrijeme}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, vrijeme: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Trajanje (min)</Label>
              <Select 
                value={appointmentForm.trajanje_minuti.toString()} 
                onValueChange={(val) => setAppointmentForm({ ...appointmentForm, trajanje_minuti: parseInt(val) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minuta</SelectItem>
                  <SelectItem value="30">30 minuta</SelectItem>
                  <SelectItem value="45">45 minuta</SelectItem>
                  <SelectItem value="60">60 minuta</SelectItem>
                  <SelectItem value="90">90 minuta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ime pacijenta *</Label>
                <Input 
                  value={appointmentForm.guest_ime}
                  onChange={(e) => { setAppointmentForm({ ...appointmentForm, guest_ime: e.target.value }); setFormErrors({ ...formErrors, guest_ime: '' }); }}
                  className={formErrors.guest_ime ? 'border-red-500' : ''}
                />
                {formErrors.guest_ime && <p className="text-xs text-red-500 mt-1">{formErrors.guest_ime}</p>}
              </div>
              <div>
                <Label>Prezime pacijenta *</Label>
                <Input 
                  value={appointmentForm.guest_prezime}
                  onChange={(e) => { setAppointmentForm({ ...appointmentForm, guest_prezime: e.target.value }); setFormErrors({ ...formErrors, guest_prezime: '' }); }}
                  className={formErrors.guest_prezime ? 'border-red-500' : ''}
                />
                {formErrors.guest_prezime && <p className="text-xs text-red-500 mt-1">{formErrors.guest_prezime}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Telefon *</Label>
                <Input 
                  value={appointmentForm.guest_telefon}
                  onChange={(e) => { setAppointmentForm({ ...appointmentForm, guest_telefon: e.target.value }); setFormErrors({ ...formErrors, guest_telefon: '' }); }}
                  className={formErrors.guest_telefon ? 'border-red-500' : ''}
                />
                {formErrors.guest_telefon && <p className="text-xs text-red-500 mt-1">{formErrors.guest_telefon}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <Input 
                  type="email"
                  value={appointmentForm.guest_email}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, guest_email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Razlog posjete</Label>
              <Textarea 
                value={appointmentForm.razlog}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, razlog: e.target.value })}
                rows={2}
              />
            </div>

            <Button onClick={handleAddAppointment} className="w-full" disabled={submitting}>
              {submitting ? 'Dodavanje...' : 'Dodaj termin'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
