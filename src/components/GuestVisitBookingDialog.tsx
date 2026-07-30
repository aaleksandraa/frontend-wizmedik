import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentsAPI, doctorsAPI } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AppointmentConfirmation } from '@/components/AppointmentConfirmation';
import { Calendar, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { bs } from 'date-fns/locale';
import { trackAppointmentCompleted } from '@/config/analytics';
import { cn } from '@/lib/utils';

interface GuestVisitService {
  id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  trajanje_minuti: number;
}

interface GuestVisit {
  id: number;
  datum: string;
  vrijeme_od: string;
  vrijeme_do: string;
  slot_trajanje_minuti: number;
  prihvata_online_rezervacije: boolean;
  usluge: GuestVisitService[];
  klinika: {
    id: number;
    naziv: string;
    lokacija: string;
    grad: string;
    slug: string;
    google_maps_link?: string;
    telefon?: string;
  };
}

interface GuestVisitBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: number;
  doctorName: string;
  guestVisit: GuestVisit;
}

const NO_SPECIFIC_SERVICE_VALUE = 'no-specific-service';

export function GuestVisitBookingDialog({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  guestVisit
}: GuestVisitBookingDialogProps) {
  // Use services from guest visit
  const services = guestVisit.usluge || [];
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  // Guest booking fields
  const [guestData, setGuestData] = useState({
    ime: '',
    prezime: '',
    email: '',
    telefon: '',
    napomena: ''
  });


  useEffect(() => {
    if (open && guestVisit) {
      fetchAvailableSlots();
      setSelectedSlot(null);
      setBookingSuccess(false);
      setBookingDetails(null);
    }
  }, [open, guestVisit]);

  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      // Get booked slots for this doctor on this date
      const response = await doctorsAPI.getBookedSlots(doctorId, {
        start_date: guestVisit.datum,
        end_date: guestVisit.datum
      });
      
      const bookedSlots = response.data?.booked_slots || [];
      const bookedTimes = bookedSlots.map((slot: any) => {
        const date = new Date(slot.datum_vrijeme);
        return format(date, 'HH:mm');
      });

      // Generate available slots based on guest visit time range
      const slots = generateTimeSlots(
        guestVisit.vrijeme_od,
        guestVisit.vrijeme_do,
        guestVisit.slot_trajanje_minuti,
        bookedTimes
      );
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    duration: number,
    bookedTimes: string[]
  ): string[] => {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    while (currentMinutes + duration <= endMinutes) {
      const hours = Math.floor(currentMinutes / 60);
      const mins = currentMinutes % 60;
      const timeStr = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      
      if (!bookedTimes.includes(timeStr)) {
        slots.push(timeStr);
      }
      
      currentMinutes += duration;
    }
    
    return slots;
  };

  const handleBooking = async () => {
    if (!selectedSlot) {
      toast({
        variant: "destructive",
          title: "Greška",
        description: "Molimo odaberite termin"
      });
      return;
    }

    setLoading(true);
    try {
      const dateTime = `${guestVisit.datum} ${selectedSlot}:00`;
      
      const bookingData: any = {
        doktor_id: doctorId,
        datum_vrijeme: dateTime,
        gostovanje_id: guestVisit.id,
        klinika_id: guestVisit.klinika.id,
        napomene: user ? undefined : guestData.napomena
      };

      if (selectedServiceId) {
        bookingData.usluga_id = selectedServiceId;
      }

      let response;
      if (user) {
        response = await appointmentsAPI.create(bookingData);
      } else {
        response = await appointmentsAPI.createGuest({
          ...bookingData,
          guest_ime: guestData.ime,
          guest_prezime: guestData.prezime,
          guest_email: guestData.email,
          guest_telefon: guestData.telefon,
          napomene: guestData.napomena
        });
      }

      const selectedService = services.find((service) => service.id === selectedServiceId);
      trackAppointmentCompleted({
        doctor_id: doctorId,
        doctor_name: doctorName,
        city: guestVisit.klinika.grad,
        appointment_type: 'guest_visit',
        booking_type: user ? 'patient' : 'guest',
        service_id: selectedServiceId,
        service_name: selectedService?.naziv,
      });

      setBookingSuccess(true);
      setBookingDetails({
        datum: guestVisit.datum,
        vrijeme: selectedSlot,
        klinika: guestVisit.klinika
      });

      toast({
        title: "Uspješno zakazano!",
        description: "Termin je uspješno zakazan u gostujućoj klinici."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: error.response?.data?.error || "Greška pri zakazivanju termina"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'EEEE, d. MMMM yyyy.', { locale: bs });
  };

  const formatTime = (time: string) => {
    // Remove seconds from time string (08:00:00 -> 08:00)
    return time.substring(0, 5);
  };


  if (bookingSuccess && bookingDetails) {
    const selectedService = services.find(s => s.id === selectedServiceId);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg rounded-2xl p-4 sm:p-6">
          <AppointmentConfirmation
            appointment={{
              doctorName,
              date: new Date(bookingDetails.datum),
              time: bookingDetails.vrijeme,
              location: bookingDetails.klinika.lokacija,
              address: `${bookingDetails.klinika.lokacija}, ${bookingDetails.klinika.grad}`,
              phone: bookingDetails.klinika.telefon,
              serviceName: selectedService?.naziv,
              isGuestVisit: true,
              clinicName: bookingDetails.klinika.naziv,
            }}
            onClose={() => onOpenChange(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-lg rounded-2xl p-4 sm:p-6">
        <DialogHeader className="pr-8 text-left">
          <DialogTitle className="text-lg">Zakaži termin kod {doctorName}</DialogTitle>
          <DialogDescription>
            Gostovanje u klinici {guestVisit.klinika.naziv}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest visit info banner */}
          <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-600" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-cyan-900">Termin u gostujućoj klinici</p>
                <p className="text-xs text-cyan-700">
                  {guestVisit.klinika.naziv} · {guestVisit.klinika.lokacija}, {guestVisit.klinika.grad}
                </p>
              </div>
            </div>
          </div>

          {/* Date info */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
            <Calendar className="h-4 w-4 flex-shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-sm font-medium">{formatDate(guestVisit.datum)}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(guestVisit.vrijeme_od)} - {formatTime(guestVisit.vrijeme_do)}
              </p>
            </div>
          </div>

          {/* Service selection */}
          {services.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Usluga (opcionalno)</Label>
              <Select
                value={selectedServiceId?.toString() || NO_SPECIFIC_SERVICE_VALUE}
                onValueChange={(value) => {
                  if (value === NO_SPECIFIC_SERVICE_VALUE) {
                    setSelectedServiceId(null);
                    return;
                  }

                  const parsedId = parseInt(value, 10);
                  setSelectedServiceId(Number.isNaN(parsedId) ? null : parsedId);
                }}
              >
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Odaberite uslugu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_SPECIFIC_SERVICE_VALUE}>-- Bez specifične usluge --</SelectItem>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id.toString()}>
                      {service.naziv} {service.cijena && `- ${service.cijena} KM`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Time slots */}
          <div className="space-y-2">
            <Label className="block text-sm font-semibold">Odaberite vrijeme</Label>
            {loadingSlots ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 py-4 text-center text-sm text-muted-foreground">
                Učitavanje slobodnih termina...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/40 py-4 text-center text-sm text-muted-foreground">
                Nema slobodnih termina za ovaj datum
              </div>
            ) : (
              <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'rounded-xl border py-2.5 text-sm font-medium tabular-nums transition-all',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      selectedSlot === slot
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>


          {/* Guest booking form (if not logged in) */}
          {!user && (
            <div className="space-y-3 border-t pt-4">
              <p className="text-sm font-semibold">Vaši podaci</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="ime" className="text-xs text-muted-foreground">Ime *</Label>
                  <Input
                    id="ime"
                    value={guestData.ime}
                    onChange={(e) => setGuestData(prev => ({ ...prev, ime: e.target.value }))}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prezime" className="text-xs text-muted-foreground">Prezime *</Label>
                  <Input
                    id="prezime"
                    value={guestData.prezime}
                    onChange={(e) => setGuestData(prev => ({ ...prev, prezime: e.target.value }))}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="telefon" className="text-xs text-muted-foreground">Telefon *</Label>
                  <Input
                    id="telefon"
                    type="tel"
                    inputMode="tel"
                    value={guestData.telefon}
                    onChange={(e) => setGuestData(prev => ({ ...prev, telefon: e.target.value }))}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs text-muted-foreground">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    value={guestData.email}
                    onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                    className="h-11 rounded-xl"
                    required
                  />
                </div>
              </div>
              <Textarea
                id="napomena"
                placeholder="Napomena (opcionalno)..."
                value={guestData.napomena}
                onChange={(e) => setGuestData(prev => ({ ...prev, napomena: e.target.value }))}
                rows={2}
                className="rounded-xl"
              />
            </div>
          )}

          <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 pb-1 pt-3 backdrop-blur sm:-mx-6 sm:px-6">
            <Button
              variant="medical"
              className="h-12 w-full rounded-xl text-base"
              onClick={handleBooking}
              disabled={loading || !selectedSlot || (!user && (!guestData.ime || !guestData.prezime || !guestData.email || !guestData.telefon))}
            >
              {loading ? 'Zakazujem...' : 'Potvrdi termin'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

