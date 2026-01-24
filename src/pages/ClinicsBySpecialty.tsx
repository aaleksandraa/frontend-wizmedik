import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clinicsAPI, doctorsAPI, specialtiesAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Breadcrumb } from '@/components/Breadcrumb';
import { ClinicCard } from '@/components/ClinicCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: any[];
  radno_vrijeme: any;
  doktori?: any[];
}

const slugToName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Opsta/g, 'Opšta')
    .replace(/Decja/g, 'Dečja')
    .replace(/Zenska/g, 'Ženska');
};

export default function ClinicsBySpecialty() {
  const { specijalnost } = useParams<{ specijalnost: string }>();
  const navigate = useNavigate();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [filteredClinics, setFilteredClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const specialtyName = specijalnost ? slugToName(specijalnost) : '';

  useEffect(() => {
    fetchClinics();
  }, [specijalnost]);

  useEffect(() => {
    filterClinics();
  }, [clinics, searchTerm, selectedCity]);

  const fetchClinics = async () => {
    try {
      // Fetch specialty by slug to get clinics from pivot table
      const specialtyResponse = await specialtiesAPI.getBySlug(specijalnost || '');
      const specialtyData = specialtyResponse.data;

      if (specialtyData && specialtyData.klinike) {
        // Get clinics from the specialty's clinics relationship (pivot table)
        const clinicsFromSpecialty = specialtyData.klinike || [];
        
        const clinicsData = clinicsFromSpecialty.map((clinic: any) => ({
          id: clinic.id,
          naziv: clinic.naziv,
          opis: clinic.opis,
          adresa: clinic.adresa,
          grad: clinic.grad,
          telefon: clinic.telefon,
          email: clinic.email,
          website: clinic.website,
          slike: clinic.slike || [],
          radno_vrijeme: clinic.radno_vrijeme,
          doktori: clinic.doktori || []
        }));

        setClinics(clinicsData);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClinics = () => {
    let filtered = clinics;

    if (searchTerm) {
      filtered = filtered.filter(clinic =>
        clinic.naziv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.opis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clinic.adresa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCity && selectedCity !== 'all') {
      filtered = filtered.filter(clinic => clinic.grad === selectedCity);
    }

    setFilteredClinics(filtered);
  };

  const uniqueCities = [...new Set(clinics.map(clinic => clinic.grad))];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Klinike - ${specialtyName}`,
    "description": `Pronađite klinike koje nude usluge ${specialtyName.toLowerCase()} specijalnosti u Bosni i Hercegovini`,
    "numberOfItems": filteredClinics.length,
    "itemListElement": filteredClinics.map((clinic, index) => ({
      "@type": "MedicalClinic",
      "position": index + 1,
      "name": clinic.naziv,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": clinic.adresa,
        "addressLocality": clinic.grad,
        "addressCountry": "BA"
      },
      "telephone": clinic.telefon,
      "medicalSpecialty": specialtyName
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{specialtyName} - Klinike | WizMedik</title>
        <meta name="description" content={`Pronađite najbolje klinike koje nude usluge ${specialtyName.toLowerCase()} specijalnosti u Bosni i Hercegovini. Pregled svih klinika sa stručnim osobljem.`} />
        <meta name="keywords" content={`${specialtyName}, klinike, zdravstvo BiH, ${specialtyName.toLowerCase()} klinika`} />
        <meta property="og:title" content={`${specialtyName} - Klinike`} />
        <meta property="og:description" content={`Klinike koje nude usluge ${specialtyName.toLowerCase()} specijalnosti`} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Klinike', href: '/klinike' },
            { label: specialtyName }
          ]} />

          <header className="text-center mb-12 mt-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Building2 className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">
                {specialtyName} - Klinike
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pronađite klinike sa stručnim {specialtyName.toLowerCase()} osobljem
            </p>
          </header>

          <div className="mb-8 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretražite klinike..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Svi gradovi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi gradovi</SelectItem>
                {uniqueCities.filter(city => city && city.trim() !== '').map(city => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-6">
            <p className="text-muted-foreground">
              Pronađeno {filteredClinics.length} {filteredClinics.length === 1 ? 'klinika' : 'klinika'}
            </p>
          </div>

          {filteredClinics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClinics.map(clinic => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nema dostupnih klinika
              </h3>
              <p className="text-muted-foreground mb-6">
                Trenutno nemamo registrovanih klinika za {specialtyName.toLowerCase()} specijalnost.
              </p>
              <button 
                onClick={() => navigate('/klinike')}
                className="text-primary hover:underline"
              >
                Pogledajte sve klinike
              </button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
