import { useMemo, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { bs } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarDays, CalendarX2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  BookedSlot,
  BreakPeriod,
  HolidayPeriod,
  SLOT_PERIOD_LABELS,
  SlotRules,
  WorkingHours,
  getSlotAvailability,
  getUpcomingBookableDays,
  groupSlotsByPeriod,
  isDateBookable,
} from '@/lib/booking-slots';

interface TimeSlotPickerProps {
  workingHours: WorkingHours;
  breaks: BreakPeriod[];
  holidays: HolidayPeriod[];
  bookedSlots: BookedSlot[];
  slotDuration: number;
  selectedDate: Date | undefined;
  selectedTime: string;
  onDateSelect: (date: Date | undefined) => void;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotPicker({
  workingHours,
  breaks,
  holidays,
  bookedSlots,
  slotDuration,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
}: TimeSlotPickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const rules: SlotRules = useMemo(
    () => ({ workingHours, breaks, holidays, bookedSlots, slotDuration }),
    [workingHours, breaks, holidays, bookedSlots, slotDuration]
  );

  const hasWorkingHours = !!workingHours && Object.keys(workingHours).length > 0;

  const quickDays = useMemo(() => getUpcomingBookableDays(rules), [rules]);

  const dayAvailability = useMemo(
    () =>
      quickDays.map((date) => ({
        date,
        freeCount: getSlotAvailability(date, rules).available.length,
      })),
    [quickDays, rules]
  );

  const slotGroups = useMemo(
    () => (selectedDate ? groupSlotsByPeriod(getSlotAvailability(selectedDate, rules).available) : []),
    [selectedDate, rules]
  );

  const availableCount = slotGroups.reduce((sum, group) => sum + group.slots.length, 0);

  const selectDate = (date: Date | undefined) => {
    onDateSelect(date);
    onTimeSelect('');
  };

  if (!hasWorkingHours) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-5 text-center">
        <CalendarX2 className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Doktor nema definisano radno vrijeme. Kontaktirajte ordinaciju telefonom.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">Dan</span>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 gap-1.5 px-2 text-xs">
                <CalendarDays className="h-4 w-4" />
                Drugi datum
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  selectDate(date);
                  if (date) setCalendarOpen(false);
                }}
                disabled={(date) => !isDateBookable(date, rules)}
                locale={bs}
                weekStartsOn={1}
                initialFocus
                className="pointer-events-auto p-3"
              />
            </PopoverContent>
          </Popover>
        </div>

        {dayAvailability.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
            Trenutno nema slobodnih dana u sljedećih 60 dana.
          </div>
        ) : (
          <div className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {dayAvailability.map(({ date, freeCount }) => {
              const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
              const isFull = freeCount === 0;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={isFull}
                  onClick={() => selectDate(date)}
                  className={cn(
                    'flex min-w-[4.25rem] flex-shrink-0 snap-start flex-col items-center gap-0.5 rounded-2xl border px-3 py-2.5 transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5',
                    isFull && 'cursor-not-allowed opacity-40 hover:border-border hover:bg-background'
                  )}
                >
                  <span
                    className={cn(
                      'text-[11px] font-medium uppercase',
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}
                  >
                    {format(date, 'EEE', { locale: bs })}
                  </span>
                  <span className="text-lg font-semibold leading-none">{format(date, 'd')}</span>
                  <span
                    className={cn(
                      'text-[11px]',
                      isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'
                    )}
                  >
                    {format(date, 'MMM', { locale: bs })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground">Vrijeme</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {slotDuration} min
              {availableCount > 0 && <span aria-hidden>·</span>}
              {availableCount > 0 && <span>{availableCount} slobodno</span>}
            </span>
          </div>

          {availableCount === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
              Nema slobodnih termina za {format(selectedDate, 'd. MMMM', { locale: bs })}. Izaberite
              drugi dan.
            </div>
          ) : (
            <div className="space-y-3">
              {slotGroups.map(({ period, slots }) => (
                <div key={period} className="space-y-2">
                  {slotGroups.length > 1 && (
                    <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {SLOT_PERIOD_LABELS[period]}
                    </span>
                  )}
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => onTimeSelect(slot)}
                        className={cn(
                          'rounded-xl border py-2.5 text-sm font-medium tabular-nums transition-all',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          selectedTime === slot
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-border bg-background hover:border-primary/50 hover:bg-primary/5'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
