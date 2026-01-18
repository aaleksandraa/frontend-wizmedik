import { useState, useEffect } from 'react';
import { format, parse, addMinutes, isAfter, isBefore, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkingHours {
  [key: string]: {
    radi: boolean;
    od: string;
    do: string;
  };
}

interface Break {
  od: string;
  do: string;
}

interface Holiday {
  od: string;
  do: string;
  razlog?: string;
}

interface BookedSlot {
  datum_vrijeme: string;
  trajanje_minuti: number;
}

interface TimeSlotPickerProps {
  workingHours: WorkingHours;
  breaks: Break[];
  holidays: Holiday[];
  bookedSlots: BookedSlot[];
  slotDuration: number;
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
}

const dayNames = ['nedjelja', 'ponedjeljak', 'utorak', 'srijeda', 'četvrtak', 'petak', 'subota'];

export function TimeSlotPicker({
  workingHours,
  breaks,
  holidays,
  bookedSlots,
  slotDuration,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect
}: TimeSlotPickerProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      calculateAvailableSlots(selectedDate);
    }
  }, [selectedDate, workingHours, breaks, holidays, bookedSlots, slotDuration]);

  const calculateAvailableSlots = (date: Date) => {
    // Check if workingHours is empty or null
    if (!workingHours || Object.keys(workingHours).length === 0) {
      setAvailableSlots([]);
      return;
    }

    const dayName = dayNames[date.getDay()];
    const daySchedule = workingHours[dayName];

    // Check if day is closed (support both 'closed' and 'radi' formats)
    const isClosed = daySchedule?.closed === true || daySchedule?.radi === false;
    if (!daySchedule || isClosed) {
      setAvailableSlots([]);
      return;
    }

    // Check if date is a holiday
    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays.some(holiday => {
      const holidayStart = startOfDay(new Date(holiday.od));
      const holidayEnd = endOfDay(new Date(holiday.do));
      return isWithinInterval(date, { start: holidayStart, end: holidayEnd });
    });

    if (isHoliday) {
      setAvailableSlots([]);
      return;
    }

    // Generate all possible slots (support both 'open/close' and 'od/do' formats)
    const slots: string[] = [];
    const startTimeStr = daySchedule.open || daySchedule.od;
    const endTimeStr = daySchedule.close || daySchedule.do;
    
    if (!startTimeStr || !endTimeStr) {
      setAvailableSlots([]);
      return;
    }
    
    const startTime = parse(startTimeStr, 'HH:mm', date);
    const endTime = parse(endTimeStr, 'HH:mm', date);

    let currentSlot = startTime;
    while (isBefore(currentSlot, endTime)) {
      const slotTimeStr = format(currentSlot, 'HH:mm');
      const slotEnd = addMinutes(currentSlot, slotDuration);

      // Check if slot end is within working hours
      if (isAfter(slotEnd, endTime)) break;

      // Check if slot overlaps with breaks
      const overlapWithBreak = breaks.some(breakItem => {
        const breakStart = parse(breakItem.od, 'HH:mm', date);
        const breakEnd = parse(breakItem.do, 'HH:mm', date);
        return (
          (isWithinInterval(currentSlot, { start: breakStart, end: breakEnd }) ||
          isWithinInterval(slotEnd, { start: breakStart, end: breakEnd }) ||
          (isBefore(currentSlot, breakStart) && isAfter(slotEnd, breakEnd)))
        );
      });

      if (overlapWithBreak) {
        currentSlot = addMinutes(currentSlot, slotDuration);
        continue;
      }

      // Check if slot is already booked
      const isBooked = Array.isArray(bookedSlots) && bookedSlots.some(booking => {
        const bookingStart = new Date(booking.datum_vrijeme);
        // Use trajanje_minuti from booking, fallback to slotDuration
        const bookingDuration = booking.trajanje_minuti || slotDuration;
        const bookingEnd = addMinutes(bookingStart, bookingDuration);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(currentSlot.getHours(), currentSlot.getMinutes(), 0, 0);
        const slotEndDateTime = addMinutes(slotDateTime, slotDuration);

        // Check if this slot overlaps with the booking
        // Slot is booked if:
        // 1. Slot starts during the booking (but not exactly at booking end)
        // 2. Slot ends during the booking (but not exactly at booking start)
        // 3. Slot completely contains the booking
        const slotStartsDuringBooking = slotDateTime >= bookingStart && slotDateTime < bookingEnd;
        const slotEndsDuringBooking = slotEndDateTime > bookingStart && slotEndDateTime <= bookingEnd;
        const slotContainsBooking = slotDateTime <= bookingStart && slotEndDateTime >= bookingEnd;

        return (
          format(bookingStart, 'yyyy-MM-dd') === dateStr &&
          (slotStartsDuringBooking || slotEndsDuringBooking || slotContainsBooking)
        );
      });

      if (!isBooked) {
        slots.push(slotTimeStr);
      }

      currentSlot = addMinutes(currentSlot, slotDuration);
    }

    setAvailableSlots(slots);
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  const isDateDisabled = (date: Date): boolean => {
    if (date < minDate) return true;

    const dayName = dayNames[date.getDay()];
    const daySchedule = workingHours[dayName];
    const isClosed = daySchedule?.closed === true || daySchedule?.radi === false;
    if (!daySchedule || isClosed) return true;

    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays.some(holiday => {
      const holidayStart = startOfDay(new Date(holiday.od));
      const holidayEnd = endOfDay(new Date(holiday.do));
      return isWithinInterval(date, { start: holidayStart, end: holidayEnd });
    });

    return isHoliday;
  };

  const getDayClassName = (date: Date): string => {
    if (date < minDate) return '';
    
    const dayName = dayNames[date.getDay()];
    const daySchedule = workingHours[dayName];
    const isClosed = daySchedule?.closed === true || daySchedule?.radi === false;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays.some(holiday => {
      const holidayStart = startOfDay(new Date(holiday.od));
      const holidayEnd = endOfDay(new Date(holiday.do));
      return isWithinInterval(date, { start: holidayStart, end: holidayEnd });
    });

    if (!daySchedule || isClosed || isHoliday) {
      return 'text-muted-foreground line-through';
    }

    const dayBookings = Array.isArray(bookedSlots) ? bookedSlots.filter(booking => {
      const bookingDate = new Date(booking.datum_vrijeme);
      return format(bookingDate, 'yyyy-MM-dd') === dateStr;
    }) : [];

    if (!daySchedule.open || !daySchedule.close) {
      if (!daySchedule.od || !daySchedule.do) return 'text-green-600';
    }

    const startTimeStr = daySchedule.open || daySchedule.od;
    const endTimeStr = daySchedule.close || daySchedule.do;
    
    if (!startTimeStr || !endTimeStr) return 'text-green-600';

    const startTime = parse(startTimeStr, 'HH:mm', date);
    const endTime = parse(endTimeStr, 'HH:mm', date);
    let totalSlots = 0;
    let currentSlot = startTime;

    while (isBefore(currentSlot, endTime)) {
      const slotEnd = addMinutes(currentSlot, slotDuration);
      if (isAfter(slotEnd, endTime)) break;

      const overlapWithBreak = breaks.some(breakItem => {
        const breakStart = parse(breakItem.od, 'HH:mm', date);
        const breakEnd = parse(breakItem.do, 'HH:mm', date);
        return (
          isWithinInterval(currentSlot, { start: breakStart, end: breakEnd }) ||
          isWithinInterval(slotEnd, { start: breakStart, end: breakEnd }) ||
          (isBefore(currentSlot, breakStart) && isAfter(slotEnd, breakEnd))
        );
      });

      if (!overlapWithBreak) {
        totalSlots++;
      }

      currentSlot = addMinutes(currentSlot, slotDuration);
    }

    const bookedCount = dayBookings.length;

    if (bookedCount >= totalSlots) {
      return 'text-red-600 font-semibold';
    }

    return 'text-green-600';
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Datum</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, 'd. MMMM yyyy.', { locale: bs }) : <span>Izaberite datum</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                onDateSelect(date);
                onTimeSelect('');
                if (date) setOpen(false);
              }}
              disabled={isDateDisabled}
              initialFocus
              locale={bs}
              weekStartsOn={1}
              className={cn("p-3 pointer-events-auto")}
              modifiers={{
                available: (date) => {
                  const className = getDayClassName(date);
                  return className === 'text-green-600';
                },
                fullyBooked: (date) => {
                  const className = getDayClassName(date);
                  return className === 'text-red-600 font-semibold';
                },
                closed: (date) => {
                  const className = getDayClassName(date);
                  return className === 'text-muted-foreground line-through';
                }
              }}
              modifiersClassNames={{
                available: 'text-green-600',
                fullyBooked: 'text-red-600 font-semibold',
                closed: 'text-muted-foreground line-through'
              }}
            />
            {/* Calendar Legend */}
            <div className="px-3 pb-3 pt-2 border-t border-border">
              <div className="text-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-600"></div>
                  <span className="text-muted-foreground">Dostupni termini</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-600"></div>
                  <span className="text-muted-foreground">Popunjeno</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span className="text-muted-foreground">Zatvoreno</span>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {selectedDate && (
        <div>
          <Label>Dostupni termini</Label>
          {!workingHours || Object.keys(workingHours).length === 0 ? (
            <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Doktor nema definisano radno vrijeme. Molimo kontaktirajte direktno telefonom.
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="mt-2 p-4 bg-muted/50 rounded-lg border border-dashed">
              <p className="text-sm text-muted-foreground text-center">
                Nema dostupnih termina za izabrani datum.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTime === slot ? "default" : "outline"}
                  size="sm"
                  onClick={() => onTimeSelect(slot)}
                  className={cn(
                    "text-sm transition-all",
                    selectedTime === slot && "ring-2 ring-primary ring-offset-2"
                  )}
                >
                  {slot}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
