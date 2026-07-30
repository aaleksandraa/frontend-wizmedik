import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AppointmentConfirmation } from '@/components/AppointmentConfirmation';
import { BookingServiceSelect } from '@/components/booking/BookingServiceSelect';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingSteps } from '@/components/booking/BookingSteps';
import { appointmentsAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, LogIn, Zap } from 'lucide-react';
import { trackAppointmentCompleted } from '@/config/analytics';
import {
  OTHER_SERVICE_VALUE,
  findServiceById,
  formatServicePrice,
} from '@/lib/booking-services';
import { formatBookingDateTime, getBookingErrorMessage } from '@/lib/booking-datetime';

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

type FlowStep = 'choice' | 'service' | 'datetime' | 'details' | 'success';

const BOOKING_STEPS = [
  { id: 'service', label: 'Usluga' },
  { id: 'datetime', label: 'Termin' },
  { id: 'details', label: 'Podaci' },
];

export function GuestBookingDialog({
  open,
  onOpenChange,
  doctorId,
  doctorName,
  doctorData,
  services,
  bookedSlots,
  selectedServiceId,
}: GuestBookingDialogProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<FlowStep>('choice');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<string>(
    selectedServiceId?.toString() || ''
  );
  const [otherService, setOtherService] = useState('');
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  const [guestData, setGuestData] = useState({
    ime: '',
    prezime: '',
    telefon: '',
    email: '',
    napomene: '',
  });

  const categories = doctorData?.kategorijeUsluga || doctorData?.kategorije_usluga || [];
  const slotDuration = doctorData?.slot_trajanje_minuti || 30;
  const selectedServiceData = findServiceById(selectedService, services, categories);
  const serviceLabel =
    selectedService === OTHER_SERVICE_VALUE ? otherService : selectedServiceData?.naziv;
  const serviceReady =
    !!selectedService &&
    (selectedService !== OTHER_SERVICE_VALUE || otherService.trim().length > 0);
  const datetimeReady = !!selectedDate && !!selectedTime;
  const detailsReady =
    guestData.ime.trim().length > 0 &&
    guestData.prezime.trim().length > 0 &&
    guestData.telefon.trim().length > 0;
  const effectiveSlotDuration = selectedServiceData?.trajanje_minuti || slotDuration;

  const completedSteps = [
    ...(serviceReady ? ['service'] : []),
    ...(datetimeReady ? ['datetime'] : []),
  ];

  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId.toString());
    }
  }, [selectedServiceId]);

  const goToAuth = (mode: 'login' | 'register') => {
    sessionStorage.setItem('redirectAfterLogin', location.pathname);
    navigate(`/auth?mode=${mode}`);
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setSelectedDate(undefined);
    setSelectedTime('');
    if (value !== OTHER_SERVICE_VALUE) {
      setOtherService('');
      setStep('datetime');
    }
  };

  const goToBookingStep = (stepId: string) => {
    if (stepId === 'service') {
      setStep('service');
      return;
    }
    if (stepId === 'datetime' && serviceReady) {
      setStep('datetime');
      return;
    }
    if (stepId === 'details' && serviceReady && datetimeReady) {
      setStep('details');
    }
  };

  const handleGuestBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !serviceReady || !detailsReady) return;

    const razlog =
      selectedService === OTHER_SERVICE_VALUE ? otherService : selectedServiceData?.naziv || '';

    setLoading(true);
    try {
      await appointmentsAPI.createGuest({
        doktor_id: doctorId,
        datum_vrijeme: formatBookingDateTime(selectedDate, selectedTime),
        razlog,
        napomene: guestData.napomene || null,
        usluga_id: selectedService === OTHER_SERVICE_VALUE ? null : parseInt(selectedService, 10),
        guest_ime: guestData.ime.trim(),
        guest_prezime: guestData.prezime.trim(),
        guest_telefon: guestData.telefon.trim(),
        guest_email: guestData.email.trim() || null,
      });

      setBookedAppointment({
        doctorName,
        specialty: doctorData?.specijalnost,
        date: selectedDate,
        time: selectedTime,
        location: doctorData?.lokacija || '',
        address: doctorData?.grad
          ? `${doctorData.lokacija}, ${doctorData.grad}`
          : doctorData?.lokacija,
        phone: doctorData?.telefon,
        serviceName: razlog,
      });
      trackAppointmentCompleted({
        doctor_id: doctorId,
        doctor_name: doctorName,
        specialization: doctorData?.specijalnost,
        city: doctorData?.grad,
        appointment_type: 'online_booking',
        booking_type: 'guest',
        service_id: selectedService === OTHER_SERVICE_VALUE ? null : selectedService,
        service_name: razlog,
      });

      setStep('success');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Greška',
        description: getBookingErrorMessage(
          error,
          'Došlo je do greške pri zakazivanju termina. Pokušajte ponovo.'
        ),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('choice');
      setBookedAppointment(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedService(selectedServiceId?.toString() || '');
      setOtherService('');
      setGuestData({ ime: '', prezime: '', telefon: '', email: '', napomene: '' });
    }, 300);
  };

  const inBooking = step === 'service' || step === 'datetime' || step === 'details';

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else onOpenChange(isOpen);
      }}
    >
      <DialogContent className="flex max-h-[min(92vh,820px)] w-[calc(100%-1.5rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-2xl p-0">
        {step !== 'success' && (
          <DialogHeader className="shrink-0 space-y-1 border-b border-border px-4 py-4 pr-12 text-left sm:px-6">
            <DialogTitle className="text-lg">Zakažite termin</DialogTitle>
            <DialogDescription className="line-clamp-1">
              {doctorName}
              {doctorData?.specijalnost ? ` · ${doctorData.specijalnost}` : ''}
            </DialogDescription>
          </DialogHeader>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
          {step === 'choice' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Možete zakazati odmah, bez kreiranja naloga.
              </p>

              <button
                type="button"
                onClick={() => setStep(selectedServiceId ? 'datetime' : 'service')}
                className="group flex w-full items-center gap-3 rounded-2xl border-2 border-primary bg-primary/5 p-4 text-left transition-colors hover:bg-primary/10"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Zap className="h-5 w-5 text-primary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">Nastavi bez registracije</span>
                  <span className="block text-sm text-muted-foreground">
                    Usluga → termin → vaši podaci
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => goToAuth('login')}
                className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left transition-colors hover:bg-muted/60"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                  <LogIn className="h-5 w-5 text-muted-foreground" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">Prijavi se</span>
                  <span className="block text-sm text-muted-foreground">
                    Pratite termine i primajte podsjetnike
                  </span>
                </span>
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Nemate nalog?{' '}
                <button
                  type="button"
                  onClick={() => goToAuth('register')}
                  className="font-medium text-primary underline-offset-2 hover:underline"
                >
                  Registrujte se besplatno
                </button>
              </p>
            </div>
          )}

          {inBooking && (
            <form onSubmit={handleGuestBooking} className="space-y-5">
              <BookingSteps
                steps={BOOKING_STEPS}
                current={step}
                completed={completedSteps}
                onStepClick={goToBookingStep}
              />

              {step !== 'service' && serviceLabel && (
                <BookingSummary
                  date={selectedDate}
                  time={selectedTime}
                  serviceName={serviceLabel}
                  price={selectedServiceData ? formatServicePrice(selectedServiceData) : undefined}
                />
              )}

              {step === 'service' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Šta vam treba?</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">Odaberite uslugu ispod.</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2 text-xs"
                      onClick={() => setStep('choice')}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Nazad
                    </Button>
                  </div>

                  <BookingServiceSelect
                    services={services}
                    categories={categories}
                    value={selectedService}
                    onChange={handleServiceChange}
                    allowOther={!!doctorData?.prihvata_ostalo}
                    otherReason={otherService}
                    onOtherReasonChange={setOtherService}
                    slotDuration={slotDuration}
                  />

                  {selectedService === OTHER_SERVICE_VALUE && (
                    <Button
                      type="button"
                      variant="medical"
                      disabled={!serviceReady}
                      className="h-12 w-full rounded-xl text-base"
                      onClick={() => setStep('datetime')}
                    >
                      Nastavi na termin
                    </Button>
                  )}
                </div>
              )}

              {step === 'datetime' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Kada želite doći?</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Izaberite dan, pa slobodno vrijeme.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2 text-xs"
                      onClick={() => setStep('service')}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Usluga
                    </Button>
                  </div>

                  <TimeSlotPicker
                    workingHours={doctorData?.radno_vrijeme || {}}
                    breaks={doctorData?.pauze || []}
                    holidays={doctorData?.odmori || []}
                    bookedSlots={bookedSlots}
                    slotDuration={effectiveSlotDuration}
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    onDateSelect={setSelectedDate}
                    onTimeSelect={setSelectedTime}
                  />

                  <div className="sticky bottom-0 -mx-4 border-t border-border bg-background/95 px-4 pb-1 pt-3 backdrop-blur sm:-mx-6 sm:px-6">
                    <Button
                      type="button"
                      variant="medical"
                      disabled={!datetimeReady}
                      className="h-12 w-full rounded-xl text-base"
                      onClick={() => setStep('details')}
                    >
                      Nastavi na podatke
                    </Button>
                  </div>
                </div>
              )}

              {step === 'details' && (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Vaši podaci</h3>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        Da vas možemo kontaktirati oko termina.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 shrink-0 gap-1 px-2 text-xs"
                      onClick={() => setStep('datetime')}
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Termin
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="ime" className="text-xs text-muted-foreground">
                        Ime *
                      </Label>
                      <Input
                        id="ime"
                        autoComplete="given-name"
                        value={guestData.ime}
                        onChange={(e) => setGuestData({ ...guestData, ime: e.target.value })}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="prezime" className="text-xs text-muted-foreground">
                        Prezime *
                      </Label>
                      <Input
                        id="prezime"
                        autoComplete="family-name"
                        value={guestData.prezime}
                        onChange={(e) => setGuestData({ ...guestData, prezime: e.target.value })}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="telefon" className="text-xs text-muted-foreground">
                        Telefon *
                      </Label>
                      <Input
                        id="telefon"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={guestData.telefon}
                        onChange={(e) => setGuestData({ ...guestData, telefon: e.target.value })}
                        className="h-12 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs text-muted-foreground">
                        Email (opcionalno)
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        value={guestData.email}
                        onChange={(e) => setGuestData({ ...guestData, email: e.target.value })}
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <Textarea
                    placeholder="Napomena za doktora (opcionalno)..."
                    value={guestData.napomene}
                    onChange={(e) => setGuestData({ ...guestData, napomene: e.target.value })}
                    rows={2}
                    className="rounded-xl"
                  />

                  <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-border bg-background/95 px-4 pb-1 pt-3 backdrop-blur sm:-mx-6 sm:px-6">
                    <BookingSummary
                      date={selectedDate}
                      time={selectedTime}
                      serviceName={serviceLabel}
                      price={selectedServiceData ? formatServicePrice(selectedServiceData) : undefined}
                    />
                    <Button
                      type="submit"
                      variant="medical"
                      disabled={!serviceReady || !datetimeReady || !detailsReady || loading}
                      className="h-12 w-full rounded-xl text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Zakazujem...
                        </>
                      ) : (
                        'Potvrdi termin'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}

          {step === 'success' && bookedAppointment && (
            <AppointmentConfirmation appointment={bookedAppointment} onClose={handleClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
