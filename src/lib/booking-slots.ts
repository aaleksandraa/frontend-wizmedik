import {
  addDays,
  addMinutes,
  endOfDay,
  format,
  isAfter,
  isBefore,
  isWithinInterval,
  parse,
  startOfDay,
} from 'date-fns';

export interface DaySchedule {
  radi?: boolean;
  closed?: boolean;
  od?: string;
  do?: string;
  open?: string;
  close?: string;
}

export interface WorkingHours {
  [day: string]: DaySchedule;
}

export interface BreakPeriod {
  od: string;
  do: string;
}

export interface HolidayPeriod {
  od: string;
  do: string;
  razlog?: string;
}

export interface BookedSlot {
  datum_vrijeme: string;
  trajanje_minuti?: number;
}

export interface SlotAvailability {
  available: string[];
  total: number;
}

export interface SlotRules {
  workingHours: WorkingHours;
  breaks: BreakPeriod[];
  holidays: HolidayPeriod[];
  bookedSlots: BookedSlot[];
  slotDuration: number;
}

export const DAY_NAMES = [
  'nedjelja',
  'ponedjeljak',
  'utorak',
  'srijeda',
  'četvrtak',
  'petak',
  'subota',
];

// Some profiles store Serbian-style day keys, so both spellings are accepted.
const DAY_ALIASES: Record<string, string[]> = {
  nedjelja: ['nedjelja', 'nedelja'],
  ponedjeljak: ['ponedjeljak', 'ponedeljak'],
  utorak: ['utorak'],
  srijeda: ['srijeda', 'sreda'],
  četvrtak: ['četvrtak', 'cetvrtak'],
  petak: ['petak'],
  subota: ['subota'],
};

export function getDaySchedule(
  workingHours: WorkingHours | undefined,
  date: Date
): DaySchedule | undefined {
  if (!workingHours) return undefined;

  const canonical = DAY_NAMES[date.getDay()];
  for (const key of DAY_ALIASES[canonical] || [canonical]) {
    if (workingHours[key]) return workingHours[key];
  }

  return undefined;
}

export function isClosedDay(schedule: DaySchedule | undefined): boolean {
  if (!schedule) return true;
  return schedule.closed === true || schedule.radi === false;
}

export function isHoliday(holidays: HolidayPeriod[] | undefined, date: Date): boolean {
  if (!Array.isArray(holidays)) return false;

  return holidays.some((holiday) => {
    if (!holiday?.od || !holiday?.do) return false;
    return isWithinInterval(date, {
      start: startOfDay(new Date(holiday.od)),
      end: endOfDay(new Date(holiday.do)),
    });
  });
}

/** Earliest bookable day: appointments always start from tomorrow. */
export function getFirstBookableDate(): Date {
  return startOfDay(addDays(new Date(), 1));
}

export function isDateBookable(date: Date, rules: SlotRules): boolean {
  if (isBefore(startOfDay(date), getFirstBookableDate())) return false;

  const schedule = getDaySchedule(rules.workingHours, date);
  if (isClosedDay(schedule)) return false;

  return !isHoliday(rules.holidays, date);
}

export function getSlotAvailability(date: Date, rules: SlotRules): SlotAvailability {
  const empty: SlotAvailability = { available: [], total: 0 };

  const { workingHours, breaks, bookedSlots, slotDuration } = rules;
  if (!workingHours || Object.keys(workingHours).length === 0) return empty;

  const schedule = getDaySchedule(workingHours, date);
  if (isClosedDay(schedule) || isHoliday(rules.holidays, date)) return empty;

  const startTimeStr = schedule?.open || schedule?.od;
  const endTimeStr = schedule?.close || schedule?.do;
  if (!startTimeStr || !endTimeStr) return empty;

  const dateStr = format(date, 'yyyy-MM-dd');
  const startTime = parse(startTimeStr, 'HH:mm', date);
  const endTime = parse(endTimeStr, 'HH:mm', date);
  const safeBreaks = Array.isArray(breaks) ? breaks : [];
  const safeBookings = Array.isArray(bookedSlots) ? bookedSlots : [];

  const available: string[] = [];
  let total = 0;
  let currentSlot = startTime;

  while (isBefore(currentSlot, endTime)) {
    const slotEnd = addMinutes(currentSlot, slotDuration);
    if (isAfter(slotEnd, endTime)) break;

    const overlapsBreak = safeBreaks.some((breakItem) => {
      if (!breakItem?.od || !breakItem?.do) return false;
      const breakStart = parse(breakItem.od, 'HH:mm', date);
      const breakEnd = parse(breakItem.do, 'HH:mm', date);
      return (
        isWithinInterval(currentSlot, { start: breakStart, end: breakEnd }) ||
        isWithinInterval(slotEnd, { start: breakStart, end: breakEnd }) ||
        (isBefore(currentSlot, breakStart) && isAfter(slotEnd, breakEnd))
      );
    });

    if (overlapsBreak) {
      currentSlot = addMinutes(currentSlot, slotDuration);
      continue;
    }

    total += 1;

    const slotStart = new Date(date);
    slotStart.setHours(currentSlot.getHours(), currentSlot.getMinutes(), 0, 0);
    const slotFinish = addMinutes(slotStart, slotDuration);

    const isBooked = safeBookings.some((booking) => {
      const bookingStart = new Date(booking.datum_vrijeme);
      if (format(bookingStart, 'yyyy-MM-dd') !== dateStr) return false;

      const bookingEnd = addMinutes(bookingStart, booking.trajanje_minuti || slotDuration);

      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotFinish > bookingStart && slotFinish <= bookingEnd) ||
        (slotStart <= bookingStart && slotFinish >= bookingEnd)
      );
    });

    if (!isBooked) {
      available.push(format(currentSlot, 'HH:mm'));
    }

    currentSlot = addMinutes(currentSlot, slotDuration);
  }

  return { available, total };
}

/** Upcoming days the doctor actually works, used for the quick date strip. */
export function getUpcomingBookableDays(rules: SlotRules, limit = 14, lookahead = 60): Date[] {
  const days: Date[] = [];
  const start = getFirstBookableDate();

  for (let offset = 0; offset < lookahead && days.length < limit; offset += 1) {
    const date = addDays(start, offset);
    if (isDateBookable(date, rules)) {
      days.push(date);
    }
  }

  return days;
}

export type SlotPeriod = 'morning' | 'afternoon' | 'evening';

export const SLOT_PERIOD_LABELS: Record<SlotPeriod, string> = {
  morning: 'Jutro',
  afternoon: 'Popodne',
  evening: 'Veče',
};

export function getSlotPeriod(slot: string): SlotPeriod {
  const hour = Number(slot.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

export function groupSlotsByPeriod(slots: string[]): Array<{ period: SlotPeriod; slots: string[] }> {
  const order: SlotPeriod[] = ['morning', 'afternoon', 'evening'];
  const grouped = new Map<SlotPeriod, string[]>();

  slots.forEach((slot) => {
    const period = getSlotPeriod(slot);
    grouped.set(period, [...(grouped.get(period) || []), slot]);
  });

  return order
    .filter((period) => (grouped.get(period) || []).length > 0)
    .map((period) => ({ period, slots: grouped.get(period) || [] }));
}
