export const WORKING_DAY_ORDER = [
  'ponedeljak',
  'utorak',
  'srijeda',
  'cetvrtak',
  'petak',
  'subota',
  'nedjelja',
] as const;

export type WorkingDayKey = (typeof WORKING_DAY_ORDER)[number];

export const WORKING_DAY_LABELS: Record<WorkingDayKey, string> = {
  ponedeljak: 'Ponedjeljak',
  utorak: 'Utorak',
  srijeda: 'Srijeda',
  cetvrtak: 'Četvrtak',
  petak: 'Petak',
  subota: 'Subota',
  nedjelja: 'Nedjelja',
};

const WORKING_DAY_ALIASES: Record<string, WorkingDayKey> = {
  ponedeljak: 'ponedeljak',
  ponedjeljak: 'ponedeljak',
  utorak: 'utorak',
  sreda: 'srijeda',
  srijeda: 'srijeda',
  cetvrtak: 'cetvrtak',
  četvrtak: 'cetvrtak',
  petak: 'petak',
  subota: 'subota',
  nedelja: 'nedjelja',
  nedjelja: 'nedjelja',
};

export interface WorkingDayHours {
  open?: string;
  close?: string;
  od?: string;
  do?: string;
  closed?: boolean;
  radi?: boolean;
}

export function getCanonicalWorkingDay(day: string): WorkingDayKey | undefined {
  return WORKING_DAY_ALIASES[day];
}

export function getWorkingDayLabel(day: string): string {
  const canonical = getCanonicalWorkingDay(day);
  return canonical ? WORKING_DAY_LABELS[canonical] : day;
}

export function getDayHours(
  hours: Record<string, WorkingDayHours> | null | undefined,
  canonicalDay: WorkingDayKey
): WorkingDayHours | undefined {
  if (!hours) {
    return undefined;
  }

  for (const [key, value] of Object.entries(hours)) {
    if (WORKING_DAY_ALIASES[key] === canonicalDay) {
      return value;
    }
  }

  return hours[canonicalDay];
}

function trimTime(value?: string): string {
  return typeof value === 'string' ? value.slice(0, 5) : '';
}

export function isClosedWorkingDay(hours?: WorkingDayHours | null): boolean {
  if (!hours) {
    return true;
  }

  if (hours.closed === true || hours.radi === false) {
    return true;
  }

  return !trimTime(hours.open || hours.od) || !trimTime(hours.close || hours.do);
}

export function formatWorkingHoursRange(hours?: WorkingDayHours | null): string {
  if (isClosedWorkingDay(hours)) {
    return 'Zatvoreno';
  }

  return `${trimTime(hours?.open || hours?.od)} - ${trimTime(hours?.close || hours?.do)}`;
}

export function getWorkingHoursRows(hours?: Record<string, WorkingDayHours> | null) {
  return WORKING_DAY_ORDER.map((day) => {
    const dayHours = getDayHours(hours, day);

    return {
      day,
      label: WORKING_DAY_LABELS[day],
      hours: dayHours,
      closed: isClosedWorkingDay(dayHours),
      text: formatWorkingHoursRange(dayHours),
    };
  });
}
