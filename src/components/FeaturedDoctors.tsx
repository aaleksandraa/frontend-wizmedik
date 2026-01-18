import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { doctorsAPI } from "@/services/api";
import { DoctorCard } from "@/components/DoctorCard";
import { DoctorsMapView } from "@/components/DoctorsMapView";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Star, SlidersHorizontal, X, List, Map } from "lucide-react";

interface Doctor {
  id: string;
  ime: string;
  prezime: string;
  specijalnost: string;
  ocjena: number;
  broj_ocjena: number;
  lokacija: string;
  grad: string;
  telefon: string;
  prihvata_online: boolean;
}

interface DoctorCardProps {
  id: string;
  slug?: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  location: string;
  nextAvailable: string;
  phone: string;
  image: string;
  acceptsOnline: boolean;
  latitude?: number;
  longitude?: number;
}

export function FeaturedDoctors() {
  const [doctors, setDoctors] = useState<DoctorCardProps[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'reviews'>('rating');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedDoctors();
  }, []);

  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    if (specialtyParam) {
      setSelectedSpecialty(specialtyParam);
    }
  }, [searchParams]);

  useEffect(() => {
    filterDoctors();
  }, [doctors, searchTerm, selectedSpecialty, selectedCity, minRating, sortBy]);

  async function fetchFeaturedDoctors() {
    try {
      const response = await doctorsAPI.getAll({ sort_by: 'ocjena', sort_order: 'desc', per_page: 100 });
      const data = response.data.data || [];

      const formattedDoctors: DoctorCardProps[] = data.map((doctor: any) => ({
        id: doctor.id.toString(),
        slug: doctor.slug,
        name: `${doctor.ime} ${doctor.prezime}`,
        specialty: doctor.specijalnost,
        rating: doctor.ocjena || 0,
        reviewCount: doctor.broj_ocjena || 0,
        location: doctor.grad,
        nextAvailable: "Dostupno",
        phone: doctor.telefon,
        image: doctor.slika_profila || "/placeholder.svg",
        acceptsOnline: doctor.prihvata_online,
        latitude: doctor.latitude,
        longitude: doctor.longitude
      }));

      setDoctors(formattedDoctors);
      setFilteredDoctors(formattedDoctors);

      // Extract unique specialties and cities
      const uniqueSpecs = [...new Set(formattedDoctors.map(d => d.specialty))];
      const uniqueCities = [...new Set(formattedDoctors.map(d => d.location))];
      setSpecialties(uniqueSpecs);
      setCities(uniqueCities);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterDoctors() {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty && selectedSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === selectedSpecialty);
    }

    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(doctor => doctor.location === selectedCity);
    }

    if (minRating > 0) {
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }

    // Sort results
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        default:
          return 0;
      }
    });

    setFilteredDoctors(filtered);
  }

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('all');
    setSelectedCity('all');
    setMinRating(0);
    setSortBy('rating');
  };

  const hasActiveFilters = searchTerm || selectedSpecialty !== 'all' || selectedCity !== 'all' || minRating > 0;

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Pronađite svog doktora
            </h2>
            <p className="text-xl text-muted-foreground">
              Pretražite po specijalnosti, gradu ili imenu
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-card rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 bg-muted/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Pronađite svog doktora
          </h2>
          <p className="text-xl text-muted-foreground">
            Pretražite po specijalnosti, gradu, imenu ili ocjeni
          </p>
        </div>

        {/* Search and Filter Toggle */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretražite po imenu ili specijalnosti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filteri
              {hasActiveFilters && (
                <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Specijalnost</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sve specijalnosti" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve specijalnosti</SelectItem>
                      {specialties.map(spec => (
                        <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Grad</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Svi gradovi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi gradovi</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Minimalna ocjena</label>
                  <Select value={minRating.toString()} onValueChange={(val) => setMinRating(Number(val))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sve ocjene" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sve ocjene</SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center gap-1">
                          4+ <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </div>
                      </SelectItem>
                      <SelectItem value="4.5">
                        <div className="flex items-center gap-1">
                          4.5+ <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </div>
                      </SelectItem>
                      <SelectItem value="4.8">
                        <div className="flex items-center gap-1">
                          4.8+ <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Sortiraj po:</label>
                  <Select value={sortBy} onValueChange={(val) => setSortBy(val as 'rating' | 'name' | 'reviews')}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">Ocjena (najviša)</SelectItem>
                      <SelectItem value="reviews">Broj recenzija</SelectItem>
                      <SelectItem value="name">Ime (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="flex items-center gap-1">
                    <X className="h-4 w-4" />
                    Očisti filtere
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Pretraga: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {selectedSpecialty !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedSpecialty}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedSpecialty('all')} />
                </Badge>
              )}
              {selectedCity !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedCity}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedCity('all')} />
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {minRating}+ <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setMinRating(0)} />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* View Toggle and Results */}
        <Tabs defaultValue="list" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted-foreground">
              Pronađeno {filteredDoctors.length} od {doctors.length} doktora
              {sortBy && (
                <span className="text-xs ml-2">
                  • Sortirano po: {sortBy === 'rating' ? 'Ocjena' : sortBy === 'name' ? 'Ime' : 'Broj recenzija'}
                </span>
              )}
            </p>
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Lista
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Mapa
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-0">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <Filter className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nema rezultata
                </h3>
                <p className="text-muted-foreground">
                  Probajte sa drugim kriterijumima pretrage
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map" className="mt-0">
            {filteredDoctors.length === 0 ? (
              <div className="text-center py-16">
                <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Nema doktora za prikaz
                </h3>
                <p className="text-muted-foreground">
                  Probajte sa drugim kriterijumima pretrage
                </p>
              </div>
            ) : (
              <DoctorsMapView doctors={filteredDoctors} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
