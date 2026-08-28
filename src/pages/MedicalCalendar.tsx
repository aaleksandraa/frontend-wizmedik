import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  Clock,
  Search,
  SlidersHorizontal,
  Tag,
  X,
} from 'lucide-react';
import axios from 'axios';
import { SEO } from '@/components/SEO';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ListingFilters, ListingHeader } from '@/components/ListingLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CalendarEvent {
  id: number;
  date: string;
  end_date?: string;
  title: string;
  description?: string;
  type: 'day' | 'week' | 'month' | 'campaign';
  category?: string;
  color: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const MONTH_NAMES = [
  'Januar',
  'Februar',
  'Mart',
  'April',
  'Maj',
  'Juni',
  'Juli',
  'August',
  'Septembar',
  'Oktobar',
  'Novembar',
  'Decembar',
];

const TYPE_LABELS: Record<string, string> = {
  day: 'Dan',
  week: 'Sedmica',
  month: 'Mjesec',
  campaign: 'Kampanja',
};

const CATEGORY_LABELS: Record<string, string> = {
  cancer: 'Rak',
  'mental-health': 'Mentalno zdravlje',
  cardiovascular: 'Kardiovaskularno',
  'infectious-disease': 'Zarazne bolesti',
  prevention: 'Prevencija',
  'womens-health': 'Žensko zdravlje',
  'mens-health': 'Muško zdravlje',
  disability: 'Invaliditet',
  'elderly-care': 'Njega starijih',
  'maternal-health': 'Majčinsko zdravlje',
  'healthcare-workers': 'Zdravstveni radnici',
  'general-health': 'Opšte zdravlje',
};

function getSarajevoDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Sarajevo',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date);

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return {
    year: value('year'),
    month: value('month') - 1,
    day: value('day'),
  };
}

function parseEventDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return { year, month: month - 1, day };
}

function formatEventDate(value: string) {
  const { day, month, year } = parseEventDate(value);
  return `${day}. ${MONTH_NAMES[month]} ${year}`;
}

function formatDateRange(start: string, end?: string) {
  if (!end || end === start) {
    return formatEventDate(start);
  }
  return `${formatEventDate(start)} – ${formatEventDate(end)}`;
}

const TODAY = getSarajevoDate();

export default function MedicalCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(TODAY.year);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [openMonths, setOpenMonths] = useState<number[]>(
    selectedYear === TODAY.year ? [TODAY.month] : []
  );
  const [filtersOpen, setFiltersOpen] = useState(false);
  const didScrollRef = useRef(false);

  const yearOptions = useMemo(
    () => [TODAY.year - 1, TODAY.year, TODAY.year + 1],
    []
  );

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/medical-calendar`, {
          params: { year: selectedYear },
        });
        setEvents(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${API_URL}/medical-calendar/categories/list`);
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    void fetchEvents();
    void fetchCategories();
  }, [selectedYear]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const eventDate = parseEventDate(event.date);
      if (selectedMonth !== null && eventDate.month !== selectedMonth) {
        return false;
      }
      if (selectedType !== 'all' && event.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== 'all' && event.category !== selectedCategory) {
        return false;
      }
      if (
        query &&
        !event.title.toLowerCase().includes(query) &&
        !event.description?.toLowerCase().includes(query)
      ) {
        return false;
      }
      return true;
    });
  }, [events, selectedMonth, selectedType, selectedCategory, searchQuery]);

  const groupedEvents = useMemo(() => {
    const grouped: Record<number, CalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const month = parseEventDate(event.date).month;
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(event);
    });
    return grouped;
  }, [filteredEvents]);

  const monthsWithEvents = useMemo(
    () =>
      Object.keys(groupedEvents)
        .map(Number)
        .sort((a, b) => a - b),
    [groupedEvents]
  );

  const hasActiveFilters =
    selectedMonth !== null ||
    selectedType !== 'all' ||
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '';

  const defaultOpenMonth = useCallback(() => {
    if (selectedMonth !== null) {
      return [selectedMonth];
    }
    if (selectedYear === TODAY.year && monthsWithEvents.includes(TODAY.month)) {
      return [TODAY.month];
    }
    if (selectedYear === TODAY.year) {
      const next = monthsWithEvents.find((month) => month >= TODAY.month);
      return next !== undefined ? [next] : monthsWithEvents.slice(-1);
    }
    return monthsWithEvents.slice(0, 1);
  }, [monthsWithEvents, selectedMonth, selectedYear]);

  useEffect(() => {
    setOpenMonths(defaultOpenMonth());
    didScrollRef.current = false;
  }, [defaultOpenMonth]);

  useEffect(() => {
    if (loading || didScrollRef.current) {
      return;
    }

    const monthToShow = openMonths[0];
    if (monthToShow === undefined) {
      return;
    }

    didScrollRef.current = true;
    const frame = window.requestAnimationFrame(() => {
      const chip = document.querySelector(`[data-month-chip="${monthToShow}"]`) as HTMLElement | null;
      const scroller = chip?.parentElement;
      if (chip && scroller) {
        scroller.scrollTo({
          left: chip.offsetLeft - scroller.clientWidth / 2 + chip.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
      document
        .getElementById(`calendar-month-${monthToShow}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [loading, openMonths]);

  const toggleMonth = (month: number) => {
    setOpenMonths((current) =>
      current.includes(month) ? current.filter((item) => item !== month) : [...current, month]
    );
  };

  const focusMonth = (month: number) => {
    setOpenMonths([month]);
    window.requestAnimationFrame(() => {
      const chip = document.querySelector(`[data-month-chip="${month}"]`) as HTMLElement | null;
      const scroller = chip?.parentElement;
      if (chip && scroller) {
        scroller.scrollTo({
          left: chip.offsetLeft - scroller.clientWidth / 2 + chip.offsetWidth / 2,
          behavior: 'smooth',
        });
      }
      document
        .getElementById(`calendar-month-${month}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const resetFilters = () => {
    setSelectedMonth(null);
    setSelectedType('all');
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const calendarSchema = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `Medicinski kalendar ${selectedYear}`,
      description: `Kalendar zdravlja ${selectedYear} sa svjetskim danima zdravlja i kampanjama.`,
      url: 'https://wizmedik.com/medicinski-kalendar',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: filteredEvents.length,
        itemListElement: filteredEvents.slice(0, 30).map((event, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: event.title,
          description: event.description || '',
          startDate: event.date,
          endDate: event.end_date || event.date,
        })),
      },
    }),
    [filteredEvents, selectedYear]
  );

  return (
    <>
      <SEO
        title={`Medicinski kalendar ${selectedYear} - Kalendar zdravlja ${selectedYear}`}
        description={`Kompletan medicinski kalendar za ${selectedYear}. Svjetski dan zdravlja ${selectedYear}, zdravstvene kampanje i edukativni datumi za ustanove, ordinacije i javnost.`}
        keywords={`medicinski kalendar ${selectedYear}, kalendar zdravlja ${selectedYear}, svjetski dan zdravlja ${selectedYear}, zdravstvene kampanje ${selectedYear}, medicinski događaji ${selectedYear}`}
        url="/medicinski-kalendar"
        canonical="/medicinski-kalendar"
        structuredData={calendarSchema}
      />
      <div className="min-h-screen bg-slate-50/80">
        <Navbar />

        <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <ListingHeader
            badge="Kalendar zdravlja"
            badgeIcon={CalendarDays}
            title={`Medicinski kalendar ${selectedYear}`}
            description="Svjetski, evropski i tematski dani, sedmice i mjeseci posvećeni zdravlju. Korisno za edukaciju, kampanje, ordinacije i škole."
            action={
              <div className="flex rounded-full border border-[#0891b2]/15 bg-white p-1 shadow-sm">
                {yearOptions.map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setSelectedYear(year)}
                    className={cn(
                      'min-h-10 min-w-[4.25rem] rounded-full px-3 text-sm font-semibold transition-colors',
                      selectedYear === year
                        ? 'bg-[#0891b2] text-white'
                        : 'text-slate-600 hover:bg-[#0891b2]/5'
                    )}
                  >
                    {year}
                  </button>
                ))}
              </div>
            }
          />

          <ListingFilters>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0891b2]/60" />
                  <Input
                    placeholder="Pretražite dane i kampanje..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="h-11 rounded-xl border-[#0891b2]/15 pl-10 text-base md:h-10 md:text-sm"
                  />
                </div>
                <Button
                  type="button"
                  variant={filtersOpen ? 'default' : 'outline'}
                  className={cn(
                    'h-11 w-11 shrink-0 rounded-xl md:hidden',
                    filtersOpen ? 'bg-[#0891b2] hover:bg-[#0e7490]' : 'border-[#0891b2]/30 text-[#0891b2]'
                  )}
                  onClick={() => setFiltersOpen((open) => !open)}
                  aria-expanded={filtersOpen}
                  aria-label="Prikaži filtere"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3', filtersOpen ? 'grid' : 'hidden md:grid')}>
                <Select
                  value={selectedMonth === null ? 'all' : String(selectedMonth)}
                  onValueChange={(value) => setSelectedMonth(value === 'all' ? null : Number(value))}
                >
                  <SelectTrigger className="h-11 rounded-xl md:h-10">
                    <SelectValue placeholder="Svi mjeseci" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi mjeseci</SelectItem>
                    {MONTH_NAMES.map((month, index) => (
                      <SelectItem key={month} value={String(index)}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="h-11 rounded-xl md:h-10">
                    <SelectValue placeholder="Svi tipovi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi tipovi</SelectItem>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 rounded-xl md:h-10">
                    <SelectValue placeholder="Sve kategorije" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve kategorije</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {CATEGORY_LABELS[category] || category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <p>
                  Pronađeno <span className="font-semibold text-[#0891b2]">{filteredEvents.length}</span>{' '}
                  {filteredEvents.length === 1 ? 'događaj' : 'događaja'}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex min-h-9 items-center gap-1 font-medium text-[#0891b2]"
                  >
                    <X className="h-4 w-4" />
                    Resetuj
                  </button>
                )}
              </div>
            </div>
          </ListingFilters>

          {!loading && monthsWithEvents.length > 0 && (
            <div className="sticky top-20 z-20 -mx-4 mb-4 border-b border-[#0891b2]/10 bg-slate-50/95 px-4 py-2 backdrop-blur-md md:static md:mx-0 md:mb-5 md:rounded-2xl md:border md:px-3 md:py-3">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-hide">
                {monthsWithEvents.map((month) => {
                  const isCurrent = selectedYear === TODAY.year && month === TODAY.month;
                  const isOpen = openMonths.includes(month);

                  return (
                    <button
                      key={month}
                      type="button"
                      data-month-chip={month}
                      onClick={() => focusMonth(month)}
                      className={cn(
                        'min-h-10 shrink-0 snap-start rounded-full px-3.5 text-sm font-medium transition-colors',
                        isOpen
                          ? 'bg-[#0891b2] text-white shadow-sm'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-[#0891b2]/5',
                        isCurrent && !isOpen && 'ring-[#0891b2]/40 text-[#0e7490]'
                      )}
                    >
                      {MONTH_NAMES[month]}
                      {isCurrent ? ' · danas' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-2xl border border-[#0891b2]/10 bg-white py-16 text-center shadow-sm">
              <CalendarDays className="mx-auto mb-4 h-14 w-14 text-[#0891b2]/40" />
              <h2 className="mb-2 text-xl font-semibold">Nema događaja</h2>
              <p className="text-muted-foreground">Probajte sa drugim filterima ili godinom.</p>
            </div>
          ) : (
            <div className="space-y-2.5 md:space-y-3">
              {monthsWithEvents.map((month) => {
                const monthEvents = groupedEvents[month] || [];
                const isOpen = openMonths.includes(month);
                const isCurrent = selectedYear === TODAY.year && month === TODAY.month;

                return (
                  <section
                    key={month}
                    id={`calendar-month-${month}`}
                    className={cn(
                      'scroll-mt-[10.5rem] overflow-hidden rounded-2xl border bg-white shadow-sm transition-colors md:scroll-mt-24',
                      isCurrent ? 'border-[#0891b2]/30' : 'border-slate-100',
                      !isOpen && 'shadow-none'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMonth(month)}
                      aria-expanded={isOpen}
                      className={cn(
                        'flex w-full min-h-[52px] items-center gap-3 px-4 py-3 text-left md:min-h-[56px] md:px-5',
                        isOpen ? 'bg-[#0891b2] text-white' : 'bg-white text-slate-800',
                        isCurrent && !isOpen && 'bg-[#0891b2]/5'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-semibold md:text-lg">
                            {MONTH_NAMES[month]} {selectedYear}
                          </h2>
                          {isCurrent && (
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                                isOpen ? 'bg-white/15 text-white' : 'bg-[#0891b2]/10 text-[#0e7490]'
                              )}
                            >
                              Ovaj mjesec
                            </span>
                          )}
                        </div>
                        <p className={cn('text-xs md:text-sm', isOpen ? 'text-white/80' : 'text-slate-500')}>
                          {monthEvents.length} {monthEvents.length === 1 ? 'događaj' : 'događaja'}
                        </p>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 shrink-0 transition-transform duration-200',
                          isOpen ? 'rotate-180 text-white' : 'text-slate-400'
                        )}
                      />
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100">
                        {monthEvents.map((event) => {
                          const eventDate = parseEventDate(event.date);
                          const isToday =
                            selectedYear === TODAY.year &&
                            eventDate.month === TODAY.month &&
                            eventDate.day === TODAY.day;

                          return (
                            <article key={event.id} className="px-4 py-3.5 md:px-5 md:py-4">
                              <div className="flex gap-3">
                                <div
                                  className="mt-1 h-10 w-1 shrink-0 rounded-full"
                                  style={{ backgroundColor: event.color || '#0891b2' }}
                                  aria-hidden
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                    <h3 className="text-[15px] font-semibold leading-snug text-slate-900 md:text-base">
                                      {event.title}
                                    </h3>
                                    <span
                                      className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
                                      style={{ backgroundColor: event.color || '#0891b2' }}
                                    >
                                      {TYPE_LABELS[event.type]}
                                    </span>
                                    {isToday && (
                                      <Badge className="bg-emerald-600 hover:bg-emerald-600">Danas</Badge>
                                    )}
                                  </div>
                                  <div className="mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 md:text-sm">
                                    <span className="inline-flex items-center gap-1">
                                      <Clock className="h-3.5 w-3.5 shrink-0" />
                                      {formatDateRange(event.date, event.end_date)}
                                    </span>
                                    {event.category && (
                                      <span className="inline-flex items-center gap-1">
                                        <Tag className="h-3.5 w-3.5 shrink-0" />
                                        {CATEGORY_LABELS[event.category] || event.category}
                                      </span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <p className="text-sm leading-relaxed text-slate-600">{event.description}</p>
                                  )}
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
