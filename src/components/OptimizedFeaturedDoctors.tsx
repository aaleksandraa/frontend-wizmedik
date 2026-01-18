import { useState, useEffect } from "react";
import { DoctorCard } from "@/components/DoctorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Star, SlidersHorizontal, X } from "lucide-react";

interface Doctor {
  id: string;
  slug?: string;
  ime: string;
  prezime: string;
  specijalnost: string;
  ocjena: number;
  broj_ocjena: number;
  grad: string;
  telefon: string;
  slika_profila: string;
  prihvata_online: boolean;
  latitude?: number;
  longitude?: number;
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

interface Props {
  doctors: Doctor[];
  specialties: string[];
  cities: string[];
}

export function OptimizedFeaturedDoctors({ doctors: initialDoctors, specialties, cities }: Props) {
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorCardProps[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'reviews'>('rating');
  const [showFilters, setShowFilters] = useState(false);

  const doctors: DoctorCardProps[] = initialDoctors.map((doctor: Doctor) => ({
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

  useEffect(() => {
    filterDoctors();
  }, [searchTerm, selectedSpecialty, selectedCity, minRating, sortBy]);

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
                      <SelectItem value="4">4+ ⭐</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                      <SelectItem value="4.8">4.8+ ⭐</SelectItem>
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

        <p className="text-muted-foreground mb-6">
          Pronađeno {filteredDoctors.length} od {doctors.length} doktora
        </p>

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
      </div>
    </section>
  );
}
