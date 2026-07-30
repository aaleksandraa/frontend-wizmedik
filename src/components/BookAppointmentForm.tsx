import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, appointmentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AppointmentConfirmation } from '@/components/AppointmentConfirmation';
import { BookingServiceSelect } from '@/components/booking/BookingServiceSelect';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { BookingSteps } from '@/components/booking/BookingSteps';
import { trackAppointmentCompleted } from '@/config/analytics';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  OTHER_SERVICE_VALUE,
  findServiceById,
  formatServicePrice,
} from '@/lib/booking-services';
import { formatBookingDateTime, getBookingErrorMessage } from '@/lib/booking-datetime';

interface BookAppointmentFormProps {
  doctorId: number;
  doctorName: string;
  selectedServiceId?: number | null;
  onSuccess: () => void;
}

type WizardStep = 'service' | 'datetime' | 'confirm';

const STEPS = [
  { id: 'service', label: 'Usluga' },
  { id: 'datetime', label: 'Termin' },
  { id: 'confirm', label: 'Potvrda' },
];

export function BookAppointmentForm({
  doctorId,
  doctorName,
  selectedServiceId,
  onSuccess,
}: BookAppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<string>(
    selectedServiceId?.toString() || ''
  );
  const [otherService, setOtherService] = useState('');
  const [note, setNote] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);
  const [wizardStep, setWizardStep] = useState<WizardStep>(
    selectedServiceId ? 'datetime' : 'service'
  );

  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId.toString());
      setWizardStep('datetime');
    }
  }, [selectedServiceId]);

  useEffect(() => {
    fetchDoctorData();
    fetchBookedSlots();
  }, [doctorId]);

  const fetchDoctorData = async () => {
    try {
      const response = await doctorsAPI.getById(doctorId);
      setDoctorData(response.data);

      const doctorCategories =
        response.data.kategorijeUsluga || response.data.kategorije_usluga || [];
      setCategories(Array.isArray(doctorCategories) ? doctorCategories : []);
      setServices(Array.isArray(response.data.usluge) ? response.data.usluge : []);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await doctorsAPI.getBookedSlots(doctorId);
      setBookedSlots(response.data?.booked_slots || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const slotDuration = doctorData?.slot_trajanje_minuti || 30;
  const selectedServiceData = findServiceById(selectedService, services, categories);
  const serviceLabel =
    selectedService === OTHER_SERVICE_VALUE ? otherService : selectedServiceData?.naziv;
  const serviceReady =
    !!selectedService &&
    (selectedService !== OTHER_SERVICE_VALUE || otherService.trim().length > 0);
  const datetimeReady = !!selectedDate && !!selectedTime;
  const effectiveSlotDuration = selectedServiceData?.trajanje_minuti || slotDuration;

  const completedSteps = [
    ...(serviceReady ? ['service'] : []),
    ...(datetimeReady ? ['datetime'] : []),
  ];

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setSelectedDate(undefined);
    setSelectedTime('');
    if (value !== OTHER_SERVICE_VALUE) {
      setOtherService('');
      setWizardStep('datetime');
    }
  };

  const goToStep = (stepId: string) => {
    if (stepId === 'service') {
      setWizardStep('service');
      return;
    }
    if (stepId === 'datetime' && serviceReady) {
      setWizardStep('datetime');
      return;
    }
    if (stepId === 'confirm' && serviceReady && datetimeReady) {
      setWizardStep('confirm');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !selectedTime || !serviceReady) return;

    const razlog =
      selectedService === OTHER_SERVICE_VALUE ? otherService : selectedServiceData?.naziv || '';

    if (!razlog) {
      toast({
        title: 'Greška',
        description: 'Molimo izaberite uslugu ili unesite razlog posjete.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await appointmentsAPI.create({
        doktor_id: doctorId,
        datum_vrijeme: formatBookingDateTime(selectedDate, selectedTime),
        razlog,
        napomene: note || null,
        usluga_id: selectedService === OTHER_SERVICE_VALUE ? null : parseInt(selectedService, 10),
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
        booking_type: 'patient',
        service_id: selectedService === OTHER_SERVICE_VALUE ? null : selectedService,
        service_name: razlog,
      });

      setShowConfirmation(true);
      await fetchBookedSlots();
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

  if (!doctorData) {
    return (
      <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Učitavanje...
      </div>
    );
  }

  if (showConfirmation && bookedAppointment) {
    return (
      <AppointmentConfirmation
        appointment={bookedAppointment}
        onClose={() => {
          setShowConfirmation(false);
          setBookedAppointment(null);
          setSelectedTime('');
          setWizardStep('service');
          onSuccess();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <BookingSteps
        steps={STEPS}
        current={wizardStep}
        completed={completedSteps}
        onStepClick={goToStep}
      />

      {wizardStep !== 'service' && serviceLabel && (
        <BookingSummary
          date={selectedDate}
          time={selectedTime}
          serviceName={serviceLabel}
          price={selectedServiceData ? formatServicePrice(selectedServiceData) : undefined}
        />
      )}

      {wizardStep === 'service' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Šta vam treba?</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Odaberite uslugu ispod.</p>
          </div>

          <BookingServiceSelect
            services={services}
            categories={categories}
            value={selectedService}
            onChange={handleServiceChange}
            allowOther={!!doctorData.prihvata_ostalo}
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
              onClick={() => setWizardStep('datetime')}
            >
              Nastavi na termin
            </Button>
          )}
        </div>
      )}

      {wizardStep === 'datetime' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Kada želite doći?</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Izaberite dan, pa slobodno vrijeme.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2 text-xs"
              onClick={() => setWizardStep('service')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Usluga
            </Button>
          </div>

          <TimeSlotPicker
            workingHours={doctorData.radno_vrijeme || {}}
            breaks={doctorData.pauze || []}
            holidays={doctorData.odmori || []}
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
              onClick={() => setWizardStep('confirm')}
            >
              Nastavi na potvrdu
            </Button>
          </div>
        </div>
      )}

      {wizardStep === 'confirm' && (
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Potvrdite termin</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">Provjerite podatke i potvrdite.</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1 px-2 text-xs"
              onClick={() => setWizardStep('datetime')}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Termin
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="napomene" className="text-sm font-semibold">
              Napomena <span className="font-normal text-muted-foreground">(opcionalno)</span>
            </Label>
            <Textarea
              id="napomene"
              placeholder="Kratko opišite simptome ili dodatne informacije..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="rounded-xl"
            />
          </div>

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
              disabled={!serviceReady || !datetimeReady || loading}
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
  );
}
