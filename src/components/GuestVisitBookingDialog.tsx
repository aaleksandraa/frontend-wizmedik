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
import { sr } from 'date-fns/locale';

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
        napomena: user ? undefined : guestData.napomena
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
          ime: guestData.ime,
          prezime: guestData.prezime,
          email: guestData.email,
          telefon: guestData.telefon,
          napomena: guestData.napomena
        });
      }

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
    return format(date, 'EEEE, d. MMMM yyyy.', { locale: sr });
  };

  const formatTime = (time: string) => {
    // Remove seconds from time string (08:00:00 -> 08:00)
    return time.substring(0, 5);
  };


  if (bookingSuccess && bookingDetails) {
    const selectedService = services.find(s => s.id === selectedServiceId);
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Zakaži termin kod {doctorName}</DialogTitle>
          <DialogDescription>
            Gostovanje u klinici {guestVisit.klinika.naziv}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Guest visit info banner */}
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Building2 className="w-5 h-5 text-cyan-600 mt-0.5" />
              <div>
                <p className="font-medium text-cyan-800">Termin u gostujućoj klinici</p>
                <p className="text-sm text-cyan-700">
                  {guestVisit.klinika.naziv} - {guestVisit.klinika.lokacija}, {guestVisit.klinika.grad}
                </p>
              </div>
            </div>
          </div>

          {/* Date info */}
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">{formatDate(guestVisit.datum)}</p>
              <p className="text-sm text-muted-foreground">
                Radno vrijeme: {formatTime(guestVisit.vrijeme_od)} - {formatTime(guestVisit.vrijeme_do)}
              </p>
            </div>
          </div>

          {/* Service selection */}
          {services.length > 0 && (
            <div>
              <Label>Usluga (opcionalno)</Label>
              <Select
                value={selectedServiceId?.toString() || ''}
                onValueChange={(val) => setSelectedServiceId(val ? parseInt(val) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Odaberite uslugu" />
                </SelectTrigger>
                <SelectContent>
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
          <div>
            <Label className="mb-2 block">Odaberite vrijeme</Label>
            {loadingSlots ? (
              <div className="text-center py-4 text-muted-foreground">
                Učitavanje slobodnih termina...
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nema slobodnih termina za ovaj datum
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedSlot === slot ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSlot(slot)}
                    className="text-sm"
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            )}
          </div>


          {/* Guest booking form (if not logged in) */}
          {!user && (
            <div className="space-y-3 pt-4 border-t">
              <p className="text-sm font-medium">Vaši podaci</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="ime">Ime *</Label>
                  <Input
                    id="ime"
                    value={guestData.ime}
                    onChange={(e) => setGuestData(prev => ({ ...prev, ime: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prezime">Prezime *</Label>
                  <Input
                    id="prezime"
                    value={guestData.prezime}
                    onChange={(e) => setGuestData(prev => ({ ...prev, prezime: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestData.email}
                  onChange={(e) => setGuestData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  value={guestData.telefon}
                  onChange={(e) => setGuestData(prev => ({ ...prev, telefon: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="napomena">Napomena (opcionalno)</Label>
                <Textarea
                  id="napomena"
                  value={guestData.napomena}
                  onChange={(e) => setGuestData(prev => ({ ...prev, napomena: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
          )}

          <Button
            variant="medical"
            className="w-full"
            onClick={handleBooking}
            disabled={loading || !selectedSlot || (!user && (!guestData.ime || !guestData.prezime || !guestData.email || !guestData.telefon))}
          >
            {loading ? 'Zakazivanje...' : 'Zakaži termin'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
