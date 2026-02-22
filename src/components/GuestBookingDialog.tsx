import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AppointmentConfirmation } from '@/components/AppointmentConfirmation';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, UserPlus, LogIn, ArrowLeft, Stethoscope, Clock, Shield } from 'lucide-react';

interface GuestBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctorId: number;
  doctorName: string;
  doctorData: any;
  services: any[];
  bookedSlots: any[];
  selectedServiceId?: number | null;
}

const ALL_CATEGORIES_VALUE = 'all-categories';

export function GuestBookingDialog({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  doctorData,
  services,
  bookedSlots,
  selectedServiceId
}: GuestBookingDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'choice' | 'guest' | 'login' | 'success'>('choice');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>(selectedServiceId?.toString() || '');
  const [otherService, setOtherService] = useState('');
  
  const [guestData, setGuestData] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    email: '',
    napomene: ''
  });

  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  
  // Extract categories from doctorData
  const categories = doctorData?.kategorijeUsluga || [];
  
  // Get filtered services based on selected category
  const getFilteredServices = () => {
    if (!selectedCategory) {
      // Show all services if no category selected
      return services;
    }
    
    // Find category and return its services
    const category = categories.find((c: any) => c.id.toString() === selectedCategory);
    return category?.usluge || [];
  };

  // Update selected service when prop changes
  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId.toString());
    }
  }, [selectedServiceId]);

  const handleGuestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedService) return;

    // Find service from all sources (categories or uncategorized)
    let selectedServiceData;
    if (selectedCategory) {
      const category = categories.find((c: any) => c.id.toString() === selectedCategory);
      selectedServiceData = category?.usluge?.find((s: any) => s.id.toString() === selectedService);
    } else {
      selectedServiceData = services.find((s: any) => s.id.toString() === selectedService);
    }
    
    const razlog = selectedService === 'ostalo' ? otherService : selectedServiceData?.naziv || '';
    
    if (!razlog || !guestData.ime || !guestData.prezime || !guestData.telefon) {
      toast({
        title: "Greška",
        description: "Molimo popunite sva obavezna polja.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const datumVrijeme = new Date(selectedDate);
      datumVrijeme.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const trajanje = selectedServiceData?.trajanje_minuti || doctorData?.slot_trajanje_minuti || 30;
      const cijena = selectedServiceData?.cijena || null;
      
      await appointmentsAPI.createGuest({
        doktor_id: doctorId,
        datum_vrijeme: datumVrijeme.toISOString(),
        razlog: razlog,
        napomene: guestData.napomene,
        trajanje_minuti: trajanje,
        cijena: cijena,
        usluga_id: selectedService === 'ostalo' ? null : parseInt(selectedService),
        ime: guestData.ime,
        prezime: guestData.prezime,
        telefon: guestData.telefon,
        email: guestData.email || null
      });

      // Set booked appointment details for confirmation screen
      setBookedAppointment({
        doctorName,
        specialty: doctorData?.specijalnost,
        date: selectedDate,
        time: selectedTime,
        location: doctorData?.lokacija || '',
        address: doctorData?.grad ? `${doctorData.lokacija}, ${doctorData.grad}` : doctorData?.lokacija,
        phone: doctorData?.telefon,
        serviceName: selectedServiceData?.naziv || (selectedService === 'ostalo' ? otherService : undefined),
      });
      
      setStep('success');
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Greška",
        description: error.response?.data?.message || "Došlo je do greške pri zakazivanju termina. Pokušajte ponovo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state after close
    setTimeout(() => {
      setStep('choice');
      setBookedAppointment(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedCategory('');
      setSelectedService(selectedServiceId?.toString() || '');
      setOtherService('');
      setGuestData({ ime: '', prezime: '', telefon: '', email: '', napomene: '' });
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
      else onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step !== 'success' && (
          <DialogHeader>
            <DialogTitle>
              {step === 'choice' && 'Zakažite termin'}
              {step === 'guest' && 'Zakazivanje kao gost'}
            </DialogTitle>
          </DialogHeader>
        )}

        {step === 'choice' && (
          <div className="py-2">
            {/* Doctor Info Header */}
            <div className="text-center mb-6 pb-6 border-b">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Stethoscope className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{doctorName}</h3>
              {doctorData?.specijalnost && (
                <p className="text-sm text-muted-foreground">{doctorData.specijalnost}</p>
              )}
            </div>

            <p className="text-center text-muted-foreground mb-6">
              Kako želite zakazati termin?
            </p>

            <div className="space-y-3">
              {/* Guest Option - Highlighted */}
              <button
                onClick={() => setStep('guest')}
                className="w-full p-4 rounded-xl border-2 border-primary bg-primary/5 hover:bg-primary/10 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Zakaži kao gost</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Brzo zakazivanje bez registracije
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Najbrže</span>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Login Option */}
              <button
                onClick={() => {
                  // Save current location for redirect after login
                  sessionStorage.setItem('redirectAfterLogin', location.pathname);
                  navigate('/auth?mode=login');
                }}
                className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    <LogIn className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Prijavi se</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Već imaš nalog? Prijavi se za praćenje termina
                    </p>
                  </div>
                </div>
              </button>
              
              {/* Register Option */}
              <button
                onClick={() => {
                  // Save current location for redirect after registration
                  sessionStorage.setItem('redirectAfterLogin', location.pathname);
                  navigate('/auth?mode=register');
                }}
                className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all group text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 transition-colors">
                    <UserPlus className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">Kreiraj profil</div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Registruj se za praćenje svih termina
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-3 h-3 text-green-600" />
                      <span className="text-xs text-green-600">Besplatno</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-center text-muted-foreground">
                Sa nalogom možeš pratiti sve termine, dobijati podsjetnike i ostavljati recenzije
              </p>
            </div>
          </div>
        )}

        {step === 'guest' && (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep('choice')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nazad
            </Button>
            <form onSubmit={handleGuestBooking} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ime">Ime *</Label>
                  <Input
                    id="ime"
                    value={guestData.ime}
                    onChange={(e) => setGuestData({ ...guestData, ime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prezime">Prezime *</Label>
                  <Input
                    id="prezime"
                    value={guestData.prezime}
                    onChange={(e) => setGuestData({ ...guestData, prezime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="telefon">Telefon *</Label>
                <Input
                  id="telefon"
                  type="tel"
                  value={guestData.telefon}
                  onChange={(e) => setGuestData({ ...guestData, telefon: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email (opcionalno)</Label>
                <Input
                  id="email"
                  type="email"
                  value={guestData.email}
                  onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                />
              </div>

              {/* Category selection (if categories exist) */}
              {categories.length > 0 && (
                <div>
                  <Label>Kategorija usluga</Label>
                  <Select 
                    value={selectedCategory || ALL_CATEGORIES_VALUE}
                    onValueChange={(value) => {
                      const normalizedCategory = value === ALL_CATEGORIES_VALUE ? '' : value;
                      setSelectedCategory(normalizedCategory);
                      // Set first service from new category instead of empty string
                      const category = categories.find((c: any) => c.id.toString() === normalizedCategory);
                      const firstService = category?.usluge?.[0];
                      setSelectedService(firstService ? firstService.id.toString() : '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sve kategorije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CATEGORIES_VALUE}>Sve usluge</SelectItem>
                      {categories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.naziv} ({category.usluge?.length || 0})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label>Usluga *</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite uslugu" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {getFilteredServices().map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {service.naziv} - {service.cijena ? `${service.cijena} KM` : 'Cijena po dogovoru'} ({service.trajanje_minuti} min)
                      </SelectItem>
                    ))}
                    {!selectedCategory && doctorData?.prihvata_ostalo && (
                      <SelectItem value="ostalo">Ostalo</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedService === 'ostalo' && (
                <div>
                  <Label htmlFor="otherService">Razlog posjete *</Label>
                  <Input
                    id="otherService"
                    value={otherService}
                    onChange={(e) => setOtherService(e.target.value)}
                    placeholder="Opišite razlog vaše posjete..."
                    required
                  />
                </div>
              )}

              <TimeSlotPicker
                workingHours={doctorData?.radno_vrijeme || {}}
                breaks={doctorData?.pauze || []}
                holidays={doctorData?.odmori || []}
                bookedSlots={bookedSlots}
                slotDuration={doctorData?.slot_trajanje_minuti || 30}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onDateSelect={setSelectedDate}
                onTimeSelect={setSelectedTime}
              />

              <div>
                <Label htmlFor="napomene">Dodatne napomene (opcionalno)</Label>
                <Textarea
                  id="napomene"
                  placeholder="Bilo koje dodatne informacije..."
                  value={guestData.napomene}
                  onChange={(e) => setGuestData({ ...guestData, napomene: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                variant="medical" 
                disabled={loading || !selectedDate || !selectedTime || !selectedService}
                className="w-full"
              >
                {loading ? 'Zakazujem...' : 'Zakaži termin'}
              </Button>
            </form>
          </div>
        )}

        {step === 'success' && bookedAppointment && (
          <AppointmentConfirmation
            appointment={bookedAppointment}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
