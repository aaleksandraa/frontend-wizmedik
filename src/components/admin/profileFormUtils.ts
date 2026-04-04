export const namedWorkingDayLabels: Record<string, string> = {
  ponedeljak: 'Ponedjeljak',
  utorak: 'Utorak',
  srijeda: 'Srijeda',
  cetvrtak: 'Cetvrtak',
  petak: 'Petak',
  subota: 'Subota',
  nedjelja: 'Nedjelja',
};

export const namedWorkingDays = Object.keys(namedWorkingDayLabels);

const namedWorkingDayAliases: Record<string, string> = {
  ponedeljak: 'ponedeljak',
  ponedjeljak: 'ponedeljak',
  utorak: 'utorak',
  sreda: 'srijeda',
  srijeda: 'srijeda',
  cetvrtak: 'cetvrtak',
  'četvrtak': 'cetvrtak',
  petak: 'petak',
  subota: 'subota',
  nedelja: 'nedjelja',
  nedjelja: 'nedjelja',
};

export interface NamedWorkingDayValue {
  open: string;
  close: string;
  closed: boolean;
}

export type NamedWorkingHours = Record<string, NamedWorkingDayValue>;

const defaultDayHours = (day: string): NamedWorkingDayValue => ({
  open: '08:00',
  close: day === 'subota' ? '14:00' : '20:00',
  closed: day === 'nedjelja',
});

export const createDefaultNamedWorkingHours = (): NamedWorkingHours =>
  namedWorkingDays.reduce<NamedWorkingHours>((acc, day) => {
    acc[day] = defaultDayHours(day);
    return acc;
  }, {});

export const normalizeNamedWorkingHours = (value?: Record<string, any> | null): NamedWorkingHours =>
  namedWorkingDays.reduce<NamedWorkingHours>((acc, day) => {
    const incomingEntry = Object.entries(value ?? {}).find(([incomingDay]) => namedWorkingDayAliases[incomingDay] === day);
    const incoming = incomingEntry?.[1];
    const defaults = defaultDayHours(day);

    acc[day] = {
      open: typeof incoming?.open === 'string' && incoming.open ? incoming.open.slice(0, 5) : defaults.open,
      close: typeof incoming?.close === 'string' && incoming.close ? incoming.close.slice(0, 5) : defaults.close,
      closed: typeof incoming?.closed === 'boolean' ? incoming.closed : defaults.closed,
    };

    return acc;
  }, {});

export const parseTextList = (value: string): string[] =>
  value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const stringifyTextList = (values?: string[] | null): string =>
  Array.isArray(values) ? values.join(', ') : '';
