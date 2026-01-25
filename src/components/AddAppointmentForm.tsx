import { useState } from 'react';
import { appointmentsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { TimeSlotPicker } from '@/components/TimeSlotPicker';
import { SearchableServiceSelect } from '@/components/SearchableServiceSelect';

interface AddAppointmentFormProps {
  doctorId: number;
  services: Array<{ id: number; naziv: string; cijena: number | null; trajanje_minuti: number }>;
  workingHours: any;
  breaks: any[];
  holidays: any[];
  bookedSlots: any[];
  slotDuration: number;
  onSuccess: () => void;
}

export function AddAppointmentForm({
  doctorId,
  services,
  workingHours,
  breaks,
  holidays,
  bookedSlots,
  slotDuration,
  onSuccess
}: AddAppointmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientSurname, setPatientSurname] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime || !selectedService) {
      toast({
        title: "Greška",
        description: "Molimo popunite sve obavezna polja.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(':');
      const appointmentDateTime = new Date(selectedDate);
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const selectedServiceData = services.find((s: any) => s.id.toString() === selectedService);
      const duration = selectedServiceData?.trajanje_minuti || slotDuration;
      const price = selectedServiceData?.cijena || null;

      await appointmentsAPI.createGuest({
        doktor_id: doctorId,
        datum_vrijeme: appointmentDateTime.toISOString(),
        razlog: selectedServiceData?.naziv || '',
        napomene: notes,
        trajanje_minuti: duration,
        cijena: price,
        usluga_id: parseInt(selectedService),
        guest_ime: patientName,
        guest_prezime: patientSurname,
        guest_telefon: patientPhone,
        guest_email: patientEmail || null
      });

      toast({
        title: "Termin uspješno zakazan",
        description: `Termin je zakazan za ${selectedDate.toLocaleDateString('bs-BA', { day: 'numeric', month: 'long', year: 'numeric' })} u ${selectedTime}.`
      });

      setSelectedDate(undefined);
      setSelectedTime('');
      setSelectedService('');
      setPatientEmail('');
      setPatientName('');
      setPatientSurname('');
      setPatientPhone('');
      setNotes('');

      onSuccess();
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Greška",
        description: error.response?.data?.message || "Došlo je do greške pri zakazivanju termina.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientName">Ime pacijenta *</Label>
          <Input
            id="patientName"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            placeholder="Unesite ime"
            required
          />
        </div>
        <div>
          <Label htmlFor="patientSurname">Prezime pacijenta *</Label>
          <Input
            id="patientSurname"
            value={patientSurname}
            onChange={(e) => setPatientSurname(e.target.value)}
            placeholder="Unesite prezime"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="patientPhone">Telefon *</Label>
          <Input
            id="patientPhone"
            type="tel"
            value={patientPhone}
            onChange={(e) => setPatientPhone(e.target.value)}
            placeholder="+387 XX XXX XXX"
            required
          />
        </div>
        <div>
          <Label htmlFor="patientEmail">Email (opcionalno)</Label>
          <Input
            id="patientEmail"
            type="email"
            value={patientEmail}
            onChange={(e) => setPatientEmail(e.target.value)}
            placeholder="email@primjer.com"
          />
        </div>
      </div>

      <div>
        <Label>Usluga *</Label>
        <SearchableServiceSelect
          services={services}
          value={selectedService}
          onValueChange={setSelectedService}
          placeholder="Izaberite uslugu"
        />
      </div>

      <TimeSlotPicker
        workingHours={workingHours}
        breaks={breaks}
        holidays={holidays}
        bookedSlots={bookedSlots}
        slotDuration={slotDuration}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateSelect={setSelectedDate}
        onTimeSelect={setSelectedTime}
      />

      <div>
        <Label htmlFor="notes">Napomene</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Dodatne napomene..."
          rows={3}
        />
      </div>

      <Button
        type="submit"
        variant="medical"
        disabled={loading || !selectedDate || !selectedTime || !selectedService || !patientName || !patientSurname || !patientPhone}
        className="w-full"
      >
        {loading ? 'Zakazujem...' : 'Zakaži termin'}
      </Button>
    </form>
  );
}
