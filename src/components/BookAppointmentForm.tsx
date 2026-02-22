import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doctorsAPI, appointmentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { AppointmentConfirmation } from '@/components/AppointmentConfirmation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookAppointmentFormProps {
  doctorId: number;
  doctorName: string;
  selectedServiceId?: number | null;
  onSuccess: () => void;
}

const ALL_CATEGORIES_VALUE = 'all-categories';

export function BookAppointmentForm({ doctorId, doctorName, selectedServiceId, onSuccess }: BookAppointmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<string>(selectedServiceId?.toString() || '');
  const [otherService, setOtherService] = useState('');
  const [formData, setFormData] = useState({
    napomene: ''
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  // Update selected service when prop changes
  useEffect(() => {
    if (selectedServiceId) {
      setSelectedService(selectedServiceId.toString());
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

      const doctorCategories = response.data.kategorijeUsluga || response.data.kategorije_usluga || [];
      setCategories(Array.isArray(doctorCategories) ? doctorCategories : []);

      // Fallback source for services in case /doctors/{id}/services is unavailable
      const doctorServices = Array.isArray(response.data.usluge) ? response.data.usluge : [];
      setServices(doctorServices);
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    }
  };

  // Get filtered services based on selected category
  const getFilteredServices = () => {
    if (!selectedCategory) {
      // Show all services if no category selected
      return services;
    }
    
    // Find category and return its services
    const category = categories.find(c => c.id.toString() === selectedCategory);
    return category?.usluge || [];
  };

  const fetchBookedSlots = async () => {
    try {
      const response = await doctorsAPI.getBookedSlots(doctorId);
      setBookedSlots(response.data?.booked_slots || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedDate || !selectedTime) return;

    // Find service from all sources (categories or uncategorized)
    let selectedServiceData;
    if (selectedCategory) {
      const category = categories.find(c => c.id.toString() === selectedCategory);
      selectedServiceData = category?.usluge?.find((s: any) => s.id.toString() === selectedService);
    } else {
      selectedServiceData = services.find((s: any) => s.id.toString() === selectedService);
    }
    
    const razlog = selectedService === 'ostalo' ? otherService : selectedServiceData?.naziv || '';
    
    if (!razlog) {
      toast({
        title: "Greška",
        description: "Molimo izaberite uslugu ili unesite razlog posjete.",
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
      
      await appointmentsAPI.create({
        doktor_id: doctorId,
        datum_vrijeme: datumVrijeme.toISOString(),
        razlog: razlog,
        napomene: formData.napomene,
        trajanje_minuti: trajanje,
        cijena: cijena,
        usluga_id: selectedService === 'ostalo' ? null : parseInt(selectedService)
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
      
      setShowConfirmation(true);
      await fetchBookedSlots();
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

  if (!doctorData) {
    return <div>Učitavanje...</div>;
  }

  // Show confirmation screen after successful booking
  if (showConfirmation && bookedAppointment) {
    return (
      <AppointmentConfirmation
        appointment={bookedAppointment}
        onClose={() => {
          setShowConfirmation(false);
          setBookedAppointment(null);
          setSelectedTime('');
          onSuccess();
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              const category = categories.find(c => c.id.toString() === normalizedCategory);
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
        <Label>Usluga</Label>
        <Select 
          value={selectedService || (getFilteredServices().length > 0 ? getFilteredServices()[0].id.toString() : "")} 
          onValueChange={setSelectedService}
        >
          <SelectTrigger>
            <SelectValue placeholder="Izaberite uslugu" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {getFilteredServices().length > 0 ? (
              <>
                {getFilteredServices().map((service: any) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.naziv} - {service.cijena ? `${service.cijena} KM` : 'Cijena po dogovoru'} ({service.trajanje_minuti} min)
                  </SelectItem>
                ))}
                {!selectedCategory && doctorData.prihvata_ostalo && (
                  <SelectItem value="ostalo">Ostalo</SelectItem>
                )}
              </>
            ) : (
              <SelectItem value="no-services" disabled>
                Nema dostupnih usluga
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {selectedService === 'ostalo' && (
        <div>
          <Label htmlFor="otherService">Razlog posjete</Label>
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
        workingHours={doctorData.radno_vrijeme || {}}
        breaks={doctorData.pauze || []}
        holidays={doctorData.odmori || []}
        bookedSlots={bookedSlots}
        slotDuration={doctorData.slot_trajanje_minuti || 30}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
      />

      <div>
        <Label htmlFor="napomene">Dodatne napomene (opcionalno)</Label>
        <Textarea
          id="napomene"
          name="napomene"
          placeholder="Bilo koje dodatne informacije..."
          value={formData.napomene}
          onChange={(e) => setFormData({ napomene: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          variant="medical" 
          disabled={loading || !selectedDate || !selectedTime || !selectedService}
          className="flex-1"
        >
          {loading ? 'Zakazujem...' : 'Zakaži termin'}
        </Button>
      </div>
    </form>
  );
}
