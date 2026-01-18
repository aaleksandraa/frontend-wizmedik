import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, User, Phone, FileText, CalendarClock, Star, XCircle, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format, isPast, isFuture } from 'date-fns';
import { Link } from 'react-router-dom';
import { RateAppointmentDialog } from '@/components/RateAppointmentDialog';
import { Navbar } from '@/components/Navbar';

interface Appointment {
  id: number;
  datum_vrijeme: string;
  razlog: string;
  napomene?: string;
  status: string;
  doktor_id: number;
  doktor: {
    ime: string;
    prezime: string;
    specijalnost: string;
    telefon: string;
    lokacija: string;
    slug: string;
  };
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Rating dialog state
  const [showRating, setShowRating] = useState(false);
  const [ratingAppointment, setRatingAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    if (!user) return;

    try {
      const response = await appointmentsAPI.getMyAppointments();
      const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati termine",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'zakazan': return 'default';
      case 'potvrden': return 'secondary';
      case 'zavrshen': return 'outline';
      case 'otkazan': return 'destructive';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'zakazan': return 'Zakazan';
      case 'potvrden': return 'Potvrđen';
      case 'zavrshen': return 'Završen';
      case 'otkazan': return 'Otkazan';
      default: return status;
    }
  };

  const cancelAppointment = async (appointmentId: number) => {
    try {
      await appointmentsAPI.cancel(appointmentId);
      toast({
        title: "Uspjeh",
        description: "Termin je uspješno otkazan"
      });
      fetchAppointments();
    } catch (error) {
      toast({
        title: "Greška",
        description: "Nije moguće otkazati termin",
        variant: "destructive"
      });
    }
  };

  const canCancelAppointment = (status: string) => {
    return status !== 'otkazan' && status !== 'zavrshen';
  };

  const openRatingDialog = (appointment: Appointment) => {
    setRatingAppointment(appointment);
    setShowRating(true);
  };

  const getFilteredAppointments = (filter: 'upcoming' | 'past' | 'cancelled') => {
    const now = new Date();
    
    switch (filter) {
      case 'upcoming':
        return appointments.filter(apt => 
          (apt.status === 'zakazan' || apt.status === 'potvrden') && 
          isFuture(new Date(apt.datum_vrijeme))
        );
      case 'past':
        return appointments.filter(apt => 
          apt.status === 'zavrshen' || 
          (isPast(new Date(apt.datum_vrijeme)) && apt.status !== 'otkazan')
        );
      case 'cancelled':
        return appointments.filter(apt => apt.status === 'otkazan');
      default:
        return appointments;
    }
  };

  const upcomingCount = getFilteredAppointments('upcoming').length;
  const pastCount = getFilteredAppointments('past').length;
  const cancelledCount = getFilteredAppointments('cancelled').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dobrodošli, {user?.ime || user?.name || 'Korisniče'}!
          </h1>
          <p className="text-muted-foreground">Ovdje možete pregledati i upravljati svojim terminima</p>
        </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Predstoje ({upcomingCount})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Prošli ({pastCount})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Otkazani ({cancelledCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {getFilteredAppointments('upcoming').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground mb-2">Nemate predstojeće termine</p>
                <p className="text-muted-foreground mb-4">Zakažite novi termin kod doktora</p>
                <Link to="/doktori">
                  <Button variant="medical">Pronađi doktora</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            getFilteredAppointments('upcoming').map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={cancelAppointment}
                onRate={openRatingDialog}
                canCancel={canCancelAppointment(appointment.status)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {getFilteredAppointments('past').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <History className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Nemate prošlih termina</p>
              </CardContent>
            </Card>
          ) : (
            getFilteredAppointments('past').map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={cancelAppointment}
                onRate={openRatingDialog}
                canCancel={false}
                canRate={appointment.status === 'zavrshen'}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {getFilteredAppointments('cancelled').length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">Nemate otkazanih termina</p>
              </CardContent>
            </Card>
          ) : (
            getFilteredAppointments('cancelled').map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={cancelAppointment}
                onRate={openRatingDialog}
                canCancel={false}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Rating Dialog */}
      {ratingAppointment && user && (
        <RateAppointmentDialog
          open={showRating}
          onOpenChange={setShowRating}
          userId={user.id}
          appointmentId={ratingAppointment.id}
          doctorId={ratingAppointment.doktor_id}
          doctorName={`Dr. ${ratingAppointment.doktor.ime} ${ratingAppointment.doktor.prezime}`}
          onSuccess={fetchAppointments}
        />
      )}
      </div>
    </>
  );
}

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel: (id: number) => void;
  onRate: (appointment: Appointment) => void;
  canCancel: boolean;
  canRate?: boolean;
}

function AppointmentCard({ appointment, onCancel, onRate, canCancel, canRate }: AppointmentCardProps) {
  const { toast } = useToast();
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                Dr. {appointment.doktor.ime} {appointment.doktor.prezime}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{appointment.doktor.specijalnost}</p>
            </div>
          </div>
          <Badge variant={getStatusVariant(appointment.status)}>
            {getStatusText(appointment.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2">
          <div className="flex items-center text-sm">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.datum_vrijeme), 'dd.MM.yyyy.')}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(appointment.datum_vrijeme), 'HH:mm')}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{appointment.doktor.lokacija}</span>
          </div>
          <div className="flex items-center text-sm">
            <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>{appointment.doktor.telefon}</span>
          </div>
          <div className="flex items-start text-sm">
            <FileText className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
            <span>{appointment.razlog}</span>
          </div>
          {appointment.napomene && (
            <div className="flex items-start text-sm text-muted-foreground">
              <FileText className="mr-2 h-4 w-4 mt-0.5" />
              <span>{appointment.napomene}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {canCancel && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onCancel(appointment.id)}
                className="flex-1"
              >
                Otkaži
              </Button>
              <Link to={`/doktor/${appointment.doktor.slug}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Kontakt
                </Button>
              </Link>
            </>
          )}
          {canRate && (
            <Button
              variant="medical"
              size="sm"
              onClick={() => onRate(appointment)}
              className="flex-1"
            >
              <Star className="mr-2 h-4 w-4" />
              Ocijenite doktora
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'zakazan': return 'default';
    case 'potvrden': return 'secondary';
    case 'zavrshen': return 'outline';
    case 'otkazan': return 'destructive';
    default: return 'default';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'zakazan': return 'Zakazan';
    case 'potvrden': return 'Potvrđen';
    case 'zavrshen': return 'Završen';
    case 'otkazan': return 'Otkazan';
    default: return status;
  }
}
