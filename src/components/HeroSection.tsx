import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { specialtiesAPI, citiesAPI } from "@/services/api";

interface Specialty {
  id: number;
  naziv: string;
  slug: string;
}

interface City {
  id: number;
  naziv: string;
  slug: string;
}

export function HeroSection() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specialtiesRes, citiesRes] = await Promise.all([
          specialtiesAPI.getAll(),
          citiesAPI.getAll()
        ]);
        setSpecialties(specialtiesRes.data || []);
        setCities(citiesRes.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = () => {
    // Build search URL based on selections
    let url = '';
    
    if (selectedType === 'doktori') {
      if (selectedSpecialty && selectedCity) {
        url = `/doktori/${selectedCity}/${selectedSpecialty}`;
      } else if (selectedSpecialty) {
        url = `/doktori/specijalnost/${selectedSpecialty}`;
      } else if (selectedCity) {
        url = `/doktori/${selectedCity}`;
      } else {
        url = '/doktori';
      }
    } else if (selectedType === 'klinike') {
      if (selectedSpecialty) {
        url = `/klinike/specijalnost/${selectedSpecialty}`;
      } else {
        url = '/klinike';
      }
    } else if (selectedType === 'laboratorije') {
      url = '/laboratorije';
    } else if (selectedType === 'banje') {
      url = '/banje';
    } else if (selectedType === 'domovi') {
      url = '/domovi-njega';
    } else {
      // Default to doctors if no type selected
      url = '/doktori';
    }
    
    navigate(url);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/95 via-primary to-primary/90 text-white py-24 px-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            Pronađite ljekara privatne prakse za<br />Vas i zakažite pregled
          </h1>
          <p className="text-lg md:text-xl opacity-95 max-w-3xl mx-auto">
            WizMedik je nacionalni servis za zakazivanje pregleda u privatnoj praksi
          </p>
        </div>
        
        {/* Search Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Type Select - FIRST */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                Šta tražite?
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Odaberite tip" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doktori">Doktori</SelectItem>
                  <SelectItem value="klinike">Klinike</SelectItem>
                  <SelectItem value="laboratorije">Laboratorije</SelectItem>
                  <SelectItem value="banje">Banje i rehabilitacija</SelectItem>
                  <SelectItem value="domovi">Domovi za starija i bolesna lica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Specialty Select - SECOND */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                Oblast
              </label>
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty} disabled={loading}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Odaberite specijalnost" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.id} value={specialty.slug}>
                      {specialty.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City Select - THIRD */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block">
                Mjesto
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={loading}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Odaberite grad" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.slug}>
                      {city.naziv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={handleSearch}
            size="lg" 
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
          >
            <Search className="mr-2 h-5 w-5" />
            Pretražite
          </Button>

          {/* Contact Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Telefon za zakazivanje: <span className="font-semibold text-foreground">+387 33 123 456</span>
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-12 text-center">
          <p className="text-white/95 text-lg font-medium">
            Brzo, jednostavno i pouzdano zakazivanje pregleda u privatnoj praksi
          </p>
        </div>
      </div>
    </section>
  );
}