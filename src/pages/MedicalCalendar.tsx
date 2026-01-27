import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Tag, Clock, MapPin } from 'lucide-react';
import axios from 'axios';
import { SEO } from '../components/SEO';

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

const MedicalCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const monthNames = [
    'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
    'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
  ];

  const typeLabels: Record<string, string> = {
    day: 'Dan',
    week: 'Sedmica',
    month: 'Mjesec',
    campaign: 'Kampanja'
  };

  const categoryLabels: Record<string, string> = {
    'cancer': 'Rak',
    'mental-health': 'Mentalno zdravlje',
    'cardiovascular': 'Kardiovaskularno',
    'infectious-disease': 'Zarazne bolesti',
    'prevention': 'Prevencija',
    'womens-health': 'Žensko zdravlje',
    'mens-health': 'Muško zdravlje',
    'disability': 'Invaliditet',
    'elderly-care': 'Njega starijih',
    'maternal-health': 'Majčinsko zdravlje',
    'healthcare-workers': 'Zdravstveni radnici',
    'general-health': 'Opšte zdravlje'
  };

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, [selectedYear]);

  useEffect(() => {
    filterEvents();
  }, [events, selectedMonth, selectedType, selectedCategory, searchQuery]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/medical-calendar`, {
        params: { year: selectedYear }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/medical-calendar/categories/list`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (selectedMonth !== null) {
      filtered = filtered.filter(event => {
        const eventMonth = new Date(event.date).getMonth();
        return eventMonth === selectedMonth;
      });
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    setFilteredEvents(filtered);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatDateRange = (start: string, end?: string) => {
    if (!end) return formatDate(start);
    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  const groupEventsByMonth = () => {
    const grouped: Record<number, CalendarEvent[]> = {};
    filteredEvents.forEach(event => {
      const month = new Date(event.date).getMonth();
      if (!grouped[month]) grouped[month] = [];
      grouped[month].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByMonth();

  return (
    <>
      <SEO
        title="Medicinski Kalendar 2026 - Svjetski Dani Zdravlja"
        description="Kompletni medicinski kalendar za 2026. godinu sa svjetskim danima zdravlja, kampanjama i edukativnim događajima. Korisno za zdravstvene ustanove, ordinacije i edukaciju."
        keywords="medicinski kalendar, svjetski dani zdravlja, zdravstvene kampanje, medicinski događaji 2026"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Calendar className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">Medicinski Kalendar {selectedYear}</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Svjetski, evropski i tematski dani, sedmice i mjeseci posvećeni zdravlju.
              Korisno za edukaciju, kampanje, objave, ordinacije i škole.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Pretraži događaje..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Month Filter */}
              <select
                value={selectedMonth === null ? 'all' : selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value === 'all' ? null : parseInt(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Svi mjeseci</option>
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Svi tipovi</option>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Sve kategorije</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {categoryLabels[category] || category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>Pronađeno: {filteredEvents.length} događaja</span>
              {(selectedMonth !== null || selectedType !== 'all' || selectedCategory !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedMonth(null);
                    setSelectedType('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Resetuj filtere
                </button>
              )}
            </div>
          </div>

          {/* Events List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Učitavanje kalendara...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600">Nema događaja za odabrane filtere</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEvents).map(([month, monthEvents]) => (
                <div key={month} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white">
                      {monthNames[parseInt(month)]} {selectedYear}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {monthEvents.map(event => (
                      <div
                        key={event.id}
                        className="border-l-4 pl-4 py-3 hover:bg-gray-50 transition-colors rounded-r-lg"
                        style={{ borderColor: event.color }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <span
                                className="px-3 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: event.color }}
                              >
                                {typeLabels[event.type]}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDateRange(event.date, event.end_date)}
                              </span>
                              {event.category && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-4 h-4" />
                                  {categoryLabels[event.category] || event.category}
                                </span>
                              )}
                            </div>
                            {event.description && (
                              <p className="text-gray-700 leading-relaxed">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MedicalCalendar;
