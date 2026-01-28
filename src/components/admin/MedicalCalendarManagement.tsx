import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Plus, Edit2, Trash2, Search, X, Save } from 'lucide-react';
import api from '@/services/api';

interface CalendarEvent {
  id?: number;
  date: string;
  end_date?: string;
  title: string;
  description?: string;
  type: 'day' | 'week' | 'month' | 'campaign';
  category?: string;
  color: string;
  is_active: boolean;
  sort_order: number;
}

const MedicalCalendarManagement: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterActive, setFilterActive] = useState('all');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryValue, setNewCategoryValue] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState([
    { value: 'cancer', label: 'Rak' },
    { value: 'mental-health', label: 'Mentalno zdravlje' },
    { value: 'cardiovascular', label: 'Kardiovaskularno' },
    { value: 'infectious-disease', label: 'Zarazne bolesti' },
    { value: 'prevention', label: 'Prevencija' },
    { value: 'womens-health', label: 'Žensko zdravlje' },
    { value: 'mens-health', label: 'Muško zdravlje' },
    { value: 'disability', label: 'Invaliditet' },
    { value: 'elderly-care', label: 'Njega starijih' },
    { value: 'maternal-health', label: 'Majčinsko zdravlje' },
    { value: 'healthcare-workers', label: 'Zdravstveni radnici' },
    { value: 'general-health', label: 'Opšte zdravlje' },
    { value: 'neurological', label: 'Neurološko' },
    { value: 'respiratory', label: 'Respiratorno' },
    { value: 'metabolic', label: 'Metaboličko' },
    { value: 'nutrition', label: 'Ishrana' },
    { value: 'bone-health', label: 'Zdravlje kostiju' }
  ]);

  const [formData, setFormData] = useState<CalendarEvent>({
    date: '',
    end_date: '',
    title: '',
    description: '',
    type: 'day',
    category: '',
    color: '#3b82f6',
    is_active: true,
    sort_order: 0
  });

  const typeOptions = [
    { value: 'day', label: 'Dan' },
    { value: 'week', label: 'Sedmica' },
    { value: 'month', label: 'Mjesec' },
    { value: 'campaign', label: 'Kampanja' }
  ];

  const colorPresets = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#64748b', '#dc2626', '#9333ea'
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsList();
  }, [events, searchQuery, filterType, filterActive]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/admin/medical-calendar', {
        params: { per_page: 1000 }
      });
      
      // Laravel paginate vraća {data: [], current_page, ...}
      const eventsData = response.data.data || response.data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Niste autorizovani. Molimo prijavite se ponovo.');
      } else if (error.response?.status === 403) {
        setError('Nemate admin privilegije za pristup ovoj stranici.');
      } else {
        setError('Greška pri učitavanju podataka.');
      }
      
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsList = () => {
    let filtered = [...events];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.description?.toLowerCase().includes(query)
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    if (filterActive !== 'all') {
      filtered = filtered.filter(event =>
        filterActive === 'active' ? event.is_active : !event.is_active
      );
    }

    setFilteredEvents(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent?.id) {
        await api.put(`/admin/medical-calendar/${editingEvent.id}`, formData);
      } else {
        await api.post('/admin/medical-calendar', formData);
      }

      fetchEvents();
      closeModal();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(error.response?.data?.message || 'Greška pri čuvanju događaja');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Da li ste sigurni da želite obrisati ovaj događaj?')) return;

    try {
      await api.delete(`/admin/medical-calendar/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Greška pri brisanju događaja');
    }
  };

  const openModal = (event?: CalendarEvent) => {
    try {
      if (event) {
        setEditingEvent(event);
        
        // Ensure all fields are properly set
        const formDataToSet = {
          date: event.date || '',
          end_date: event.end_date || '',
          title: event.title || '',
          description: event.description || '',
          type: event.type || 'day',
          category: event.category || '',
          color: event.color || '#3b82f6',
          is_active: event.is_active !== undefined ? event.is_active : true,
          sort_order: event.sort_order || 0
        };
        
        setFormData(formDataToSet);
      } else {
        setEditingEvent(null);
        setFormData({
          date: '',
          end_date: '',
          title: '',
          description: '',
          type: 'day',
          category: '',
          color: '#3b82f6',
          is_active: true,
          sort_order: 0
        });
      }
      
      setShowModal(true);
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setShowNewCategoryInput(false);
    setNewCategoryValue('');
    setNewCategoryLabel('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    // Ako je već u ISO formatu (YYYY-MM-DD), vrati direktno
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // Inače konvertuj
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addNewCategory = () => {
    if (newCategoryValue && newCategoryLabel) {
      setCategories([...categories, {
        value: newCategoryValue,
        label: newCategoryLabel
      }]);
      setFormData({ ...formData, category: newCategoryValue });
      setShowNewCategoryInput(false);
      setNewCategoryValue('');
      setNewCategoryLabel('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-800">Greška</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <p className="mt-2 text-xs text-red-600">Provjerite browser console (F12) za više detalja.</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Medicinski Kalendar</h2>
            <p className="text-sm text-gray-600">Ukupno: {events.length} događaja</p>
          </div>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Dodaj događaj
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pretraži..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Svi tipovi</option>
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Svi statusi</option>
            <option value="active">Aktivni</option>
            <option value="inactive">Neaktivni</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Učitavanje...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-2">
              {events.length === 0 ? 'Nema događaja u bazi' : 'Nema rezultata za odabrane filtere'}
            </p>
            {events.length === 0 && (
              <p className="text-sm text-gray-500">
                Pokrenite seeder: php artisan db:seed --class=MedicalCalendarSeeder
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naziv</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tip</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategorija</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Akcije</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(event.date)}
                      {event.end_date && ` - ${formatDate(event.end_date)}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {typeOptions.find(t => t.value === event.type)?.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {categories.find(c => c.value === event.category)?.label || event.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {event.is_active ? 'Aktivan' : 'Neaktivan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openModal(event);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        title="Uredi događaj"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (event.id) {
                            handleDelete(event.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Obriši događaj"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal - Rendered using Portal to escape parent overflow */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div 
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            style={{ zIndex: 10000 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingEvent ? 'Uredi događaj' : 'Dodaj novi događaj'}
                </h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum početka *
                    </label>
                    <input
                      type="date"
                      required
                      value={formatDateForInput(formData.date)}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Datum kraja
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.end_date || '')}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Naziv *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Opis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tip *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {typeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategorija
                    </label>
                    <div className="space-y-2">
                      <select
                        value={formData.category || ''}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewCategoryInput(true);
                          } else {
                            setFormData({ ...formData, category: e.target.value });
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Bez kategorije</option>
                        {categories.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                        <option value="__new__">+ Dodaj novu kategoriju</option>
                      </select>
                      
                      {showNewCategoryInput && (
                        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 space-y-2">
                          <input
                            type="text"
                            placeholder="Slug (npr. 'public-health')"
                            value={newCategoryValue}
                            onChange={(e) => setNewCategoryValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Naziv (npr. 'Javno zdravlje')"
                            value={newCategoryLabel}
                            onChange={(e) => setNewCategoryLabel(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={addNewCategory}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                            >
                              Dodaj
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowNewCategoryInput(false);
                                setNewCategoryValue('');
                                setNewCategoryLabel('');
                              }}
                              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
                            >
                              Otkaži
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boja
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {colorPresets.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData({ ...formData, color })}
                          className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-400"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Aktivan
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-5 h-5" />
                    Sačuvaj
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Otkaži
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MedicalCalendarManagement;
