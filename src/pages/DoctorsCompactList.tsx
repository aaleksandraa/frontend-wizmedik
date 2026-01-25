import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DoctorCardCompact } from '@/components/DoctorCardCompact';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Stethoscope } from 'lucide-react';
import { doctorsAPI, citiesAPI, specialtiesAPI } from '@/services/api';
import { Helmet } from 'react-helmet-async';

interface Doctor {
  id: number;
  slug: string;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  slika_profila?: string;
  ocjena?: number;
  broj_ocjena?: number;
}

export default function DoctorsCompactList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('grad') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specijalnost') || '');

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [searchParams]);

  const fetchFilters = async () => {
    try {
      const [citiesRes, specialtiesRes] = await Promise.all([
        citiesAPI.getAll(),
        specialtiesAPI.getAll()
      ]);
      setCities(citiesRes.data || []);
      setSpecialties(specialtiesRes.data || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchParams.get('search')) params.search = searchParams.get('search');
      if (searchParams.get('grad')) params.grad = searchParams.get('grad');
      if (searchParams.get('specijalnost')) params.specijalnost = searchParams.get('specijalnost');

      const response = await doctorsAPI.getAll(params);
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params: any = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCity) params.grad = selectedCity;
    if (selectedSpecialty) params.specijalnost = selectedSpecialty;
    setSearchParams(params);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCity('');
    setSelectedSpecialty('');
    setSearchParams({});
  };

  return (
    <>
      <Helmet>
        <title>Pronađi doktora - Kompaktna lista</title>
        <meta name="description" content="Pretražite i pronađite doktore u vašem gradu" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pronađi doktora</h1>
          <p className="text-gray-600">Pretražite doktore po imenu, specijalnosti ili gradu</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Ime doktora..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
            </div>

            {/* City Filter */}
            <div>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Grad" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Svi gradovi</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.naziv}>
                      {city.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Filter */}
            <div>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Specijalnost" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sve specijalnosti</SelectItem>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.naziv}>
                      {specialty.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSearch} className="flex-1 md:flex-none">
              <Filter className="h-4 w-4 mr-2" />
              Pretraži
            </Button>
            <Button onClick={handleReset} variant="outline">
              Resetuj
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Učitavanje doktora...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-gray-600">Nema rezultata za zadatu pretragu.</p>
            <Button onClick={handleReset} variant="outline" className="mt-4">
              Resetuj filtere
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Pronađeno {doctors.length} doktora
            </div>
            <div className="space-y-3">
              {doctors.map((doctor) => (
                <DoctorCardCompact key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
