import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { citiesAPI, doctorsAPI, clinicsAPI, laboratoriesAPI, spasAPI, domoviAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorCardSoft } from '@/components/cards/DoctorCardSoft';
import { ClinicCard } from '@/components/ClinicCard';
import { ClinicCardSoft } from '@/components/cards/ClinicCardSoft';
import { LaboratoryCardSoft } from '@/components/cards/LaboratoryCardSoft';
import SpaCardSoft from '@/components/cards/SpaCardSoft';
import CareHomeCardSoft from '@/components/cards/CareHomeCardSoft';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { Card as LaboratoryCard } from '@/components/ui/card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Hospital, PhoneCall, Users, Building2, Stethoscope, FlaskConical, Star, Droplet, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface City {
  id: number;
  naziv: string;
  slug: string;
  u_gradu?: string;
  opis: string;
  detaljni_opis: string;
  populacija?: string;
  broj_bolnica: number;
  broj_doktora: number;
  broj_klinika: number;
  hitna_pomoc: string;
  kljucne_tacke: Array<{ naziv: string; url?: string }>;
}

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija: string;
  telefon: string;
  ocjena?: number;
  broj_ocjena?: number;
  prihvata_online?: boolean;
  slika_profila?: string;
  slika_url?: string;
  slug: string;
}

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: string[];
  radno_vrijeme: any;
  doktori?: any[];
}

interface Laboratory {
  id: number;
  naziv: string;
  slug: string;
  opis?: string;
  grad: string;
  adresa: string;
  telefon: string;
  email: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  online_rezultati: boolean;
  prosjecno_vrijeme_rezultata?: string;
}

interface Spa {
  id: number;
  naziv: string;
  slug: string;
  opis: string;
  grad: string;
  adresa: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  broj_pregleda: number;
  medicinski_nadzor: boolean;
  fizijatar_prisutan: boolean;
  ima_smjestaj: boolean;
  online_rezervacija: boolean;
  online_upit: boolean;
  verifikovan: boolean;
  aktivan: boolean;
  featured_slika?: string;
  vrste?: any[];
  url: string;
  created_at: string;
  updated_at: string;
}

interface Dom {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  regija?: string;
  adresa: string;
  telefon?: string;
  email?: string;
  opis: string;
  tip_doma: {
    id: number;
    naziv: string;
    slug: string;
  };
  nivo_njege: {
    id: number;
    naziv: string;
    slug: string;
  };
  programi_njege: Array<{
    id: number;
    naziv: string;
    slug: string;
  }>;
  nurses_availability_label: string;
  doctor_availability_label: string;
  has_physiotherapist: boolean;
  has_physiatrist: boolean;
  emergency_protocol: boolean;
  formatted_price: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  featured_slika?: string;
  url: string;
}

export default function CityLanding() {
  const { grad } = useParams<{ grad: string }>();
  const navigate = useNavigate();
  const { template: doctorTemplate } = useListingTemplate('doctors');
  const { template: clinicTemplate } = useListingTemplate('clinics');
  const { template: labTemplate } = useListingTemplate('laboratories');

  // Fetch city data with aggressive caching (30 minutes)
  const { data: city, isLoading: cityLoading } = useQuery({
    queryKey: ['city', grad],
    queryFn: async () => {
      const response = await citiesAPI.getBySlug(grad!);
      const cityData = response.data;
      
      if (!cityData) return null;
      
      return {
        ...cityData,
        kljucne_tacke: Array.isArray(cityData.kljucne_tacke)
          ? cityData.kljucne_tacke.map((item: any) => 
              typeof item === 'string' ? { naziv: item, url: undefined } : item
            )
          : []
      } as City;
    },
    enabled: !!grad,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (formerly cacheTime)
  });

  // Fetch doctors with aggressive caching
  const { data: doctors = [], isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', city?.naziv],
    queryFn: async () => {
      const response = await doctorsAPI.getAll({ grad: city!.naziv });
      const doctorsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      return doctorsList
        .map((doctor: any) => ({
          id: doctor.id,
          ime: doctor.ime,
          prezime: doctor.prezime,
          specijalnost: doctor.specijalnost,
          grad: doctor.grad,
          lokacija: doctor.lokacija,
          telefon: doctor.telefon,
          ocjena: doctor.ocjena || 0,
          broj_ocjena: doctor.broj_ocjena || 0,
          prihvata_online: doctor.prihvata_online || false,
          slika_profila: doctor.slika_profila,
          slika_url: doctor.slika_url,
          slug: doctor.slug
        }))
        .sort((a: Doctor, b: Doctor) => (b.ocjena || 0) - (a.ocjena || 0));
    },
    enabled: !!city?.naziv,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Fetch clinics with aggressive caching
  const { data: clinics = [], isLoading: clinicsLoading } = useQuery({
    queryKey: ['clinics', city?.naziv],
    queryFn: async () => {
      const response = await clinicsAPI.getAll({ grad: city!.naziv });
      const clinicsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      
      return clinicsList.map((clinic: any) => ({
        ...clinic,
        slike: Array.isArray(clinic.slike) ? clinic.slike.filter((s): s is string => typeof s === 'string') : []
      }));
    },
    enabled: !!city?.naziv,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Fetch laboratories with aggressive caching
  const { data: laboratories = [], isLoading: laboratoriesLoading } = useQuery({
    queryKey: ['laboratories', city?.naziv],
    queryFn: async () => {
      const response = await laboratoriesAPI.getAll({ grad: city!.naziv });
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!city?.naziv,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Fetch spas with aggressive caching
  const { data: spas = [], isLoading: spasLoading } = useQuery({
    queryKey: ['spas', city?.naziv],
    queryFn: async () => {
      const response = await spasAPI.getByGrad(city!.naziv);
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!city?.naziv,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  // Fetch domovi with aggressive caching
  const { data: domovi = [], isLoading: domoviLoading } = useQuery({
    queryKey: ['domovi', city?.naziv],
    queryFn: async () => {
      const response = await domoviAPI.getByGrad(city!.naziv);
      return Array.isArray(response.data) ? response.data : (response.data?.data || []);
    },
    enabled: !!city?.naziv,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const loading = cityLoading || doctorsLoading || clinicsLoading || laboratoriesLoading || spasLoading || domoviLoading;
  const specialties = [...new Set(doctors.map(d => d.specijalnost))];

  if (!city && !cityLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Grad nije pronađen</h1>
          <Button onClick={() => navigate('/gradovi')}>Nazad na gradove</Button>
        </div>
      </div>
    );
  }

  if (loading || !city) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "City",
    "name": city.naziv,
    "description": city.opis,
    "containsPlace": doctors.map(doctor => ({
      "@type": "Physician",
      "name": `Dr. ${doctor.ime} ${doctor.prezime}`,
      "medicalSpecialty": doctor.specijalnost
    }))
  };

  return (
    <>
      <Helmet>
        <title>Doktori, klinike, laboratorije i domovi u {city.naziv}u - Zakažite pregled online | MediBIH</title>
        <meta name="description" content={`${city.detaljni_opis} Pronađite ${doctors.length} doktora, ${clinics.length} klinika, ${laboratories.length} laboratorija, ${spas.length} banja i ${domovi.length} domova za njegu ${city.u_gradu || `u ${city.naziv}u`}. Zakažite pregled online.`} />
        <meta name="keywords" content={`doktor ${city.naziv}, klinika ${city.naziv}, laboratorija ${city.naziv}, banja ${city.naziv}, dom za starije ${city.naziv}, pregled ${city.naziv}, zdravstvo ${city.naziv}, ljekari ${city.naziv}, analize ${city.naziv}`} />
        <meta property="og:title" content={`Doktori i klinike u ${city.naziv}u`} />
        <meta property="og:description" content={city.opis} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Gradovi', href: '/gradovi' },
            { label: city.naziv }
          ]} />

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Zdravstvo {city.u_gradu || `u ${city.naziv}u`}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground">
                  {city.opis}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Hospital className="w-6 h-6 text-medical-error flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{city.broj_bolnica}</p>
                    <p className="text-xs text-muted-foreground truncate">Bolnica</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Stethoscope className="w-6 h-6 text-accent flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{doctors.length}+</p>
                    <p className="text-xs text-muted-foreground truncate">Doktora</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-medical-success flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{clinics.length}+</p>
                    <p className="text-xs text-muted-foreground truncate">Klinika</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <FlaskConical className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{laboratories.length}+</p>
                    <p className="text-xs text-muted-foreground truncate">Lab.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Droplet className="w-6 h-6 text-teal-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{spas.length}</p>
                    <p className="text-xs text-muted-foreground truncate">Banja</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 flex items-center gap-3">
                  <Home className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground">{domovi.length}</p>
                    <p className="text-xs text-muted-foreground truncate">Domova</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </header>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>O zdravstvu {city.u_gradu || `u ${city.naziv}u`}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                {city.detaljni_opis}
              </p>
              
              {city.kljucne_tacke && city.kljucne_tacke.length > 0 && (
                <>
                  <h3 className="font-semibold text-lg mb-4">Ključne zdravstvene institucije i usluge:</h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {city.kljucne_tacke.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        {point.url ? (
                          <a 
                            href={point.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {point.naziv}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">{point.naziv}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <div className="mt-6 p-4 bg-medical-error/10 rounded-lg flex items-start gap-3">
                <PhoneCall className="w-6 h-6 text-medical-error mt-1 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Hitna medicinska pomoć</p>
                  <p className="text-medical-error text-2xl font-bold">{city.hitna_pomoc}</p>
                  <p className="text-sm text-muted-foreground">Dostupno 24/7</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {specialties.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Specijalnosti dostupne {city.u_gradu || `u ${city.naziv}u`}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty: string, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                      onClick={() => navigate(`/doktori/${grad}/${specialty.toLowerCase().replace(/\s+/g, '-')}`)}
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="doctors" className="w-full">
            <TabsList className="grid w-full max-w-5xl mx-auto grid-cols-5 mb-8">
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Doktori</span> ({doctors.length})
              </TabsTrigger>
              <TabsTrigger value="clinics" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">Klinike</span> ({clinics.length})
              </TabsTrigger>
              <TabsTrigger value="laboratories" className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4" />
                <span className="hidden sm:inline">Laboratorije</span> ({laboratories.length})
              </TabsTrigger>
              <TabsTrigger value="spas" className="flex items-center gap-2">
                <Droplet className="w-4 h-4" />
                <span className="hidden sm:inline">Banje</span> ({spas.length})
              </TabsTrigger>
              <TabsTrigger value="domovi" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Domovi</span> ({domovi.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="doctors">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : doctors.length === 0 ? (
                <Card className="p-12 text-center">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nema registrovanih doktora
                  </h3>
                  <p className="text-muted-foreground">
                    Trenutno nemamo doktora {city.u_gradu || `u ${city.naziv}u`}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map(doctor => (
                    doctorTemplate === 'soft' ? (
                      <DoctorCardSoft
                        key={doctor.id}
                        doctor={{
                          id: doctor.id,
                          slug: doctor.slug,
                          ime: doctor.ime,
                          prezime: doctor.prezime,
                          specijalnost: doctor.specijalnost,
                          grad: doctor.grad,
                          lokacija: doctor.lokacija,
                          ocjena: doctor.ocjena,
                          broj_ocjena: doctor.broj_ocjena,
                          slika_profila: doctor.slika_profila || doctor.slika_url,
                          opis: '',
                        }}
                      />
                    ) : (
                      <DoctorCard
                        key={doctor.id}
                        doctor={{
                          id: doctor.id,
                          slug: doctor.slug,
                          ime: doctor.ime,
                          prezime: doctor.prezime,
                        specijalnost: doctor.specijalnost,
                        grad: doctor.grad,
                        lokacija: doctor.lokacija,
                        telefon: doctor.telefon,
                        ocjena: doctor.ocjena,
                        broj_ocjena: doctor.broj_ocjena,
                        slika_profila: doctor.slika_profila,
                        prihvata_online: doctor.prihvata_online
                      }}
                    />
                    )
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="clinics">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : clinics.length === 0 ? (
                <Card className="p-12 text-center">
                  <Building2 className="w-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nema registrovanih klinika
                  </h3>
                  <p className="text-muted-foreground">
                    Trenutno nemamo klinika {city.u_gradu || `u ${city.naziv}u`}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clinics.map(clinic => (
                    clinicTemplate === 'soft' ? (
                      <ClinicCardSoft key={clinic.id} clinic={clinic} />
                    ) : (
                      <ClinicCard key={clinic.id} clinic={clinic} />
                    )
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="laboratories">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : laboratories.length === 0 ? (
                <Card className="p-12 text-center">
                  <FlaskConical className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nema registrovanih laboratorija
                  </h3>
                  <p className="text-muted-foreground">
                    Trenutno nemamo laboratorija {city.u_gradu || `u ${city.naziv}u`}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {laboratories.map(lab => (
                    labTemplate === 'soft' ? (
                      <LaboratoryCardSoft 
                        key={lab.id}
                        laboratory={lab}
                      />
                    ) : (
                      <LaboratoryCard 
                        key={lab.id} 
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/laboratorija/${lab.slug}`)}
                      >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{lab.naziv}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{lab.adresa}</span>
                            </div>
                            {lab.prosjecna_ocjena > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{Number(lab.prosjecna_ocjena).toFixed(1)}</span>
                                <span className="text-sm text-muted-foreground">
                                  ({lab.broj_recenzija} recenzija)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {lab.opis && (
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {lab.opis}
                          </p>
                        )}
                        <div className="space-y-2">
                          {lab.online_rezultati && (
                            <Badge variant="secondary" className="mr-2">
                              Online rezultati
                            </Badge>
                          )}
                          {lab.prosjecno_vrijeme_rezultata && (
                            <div className="text-sm text-muted-foreground">
                              Vrijeme rezultata: {lab.prosjecno_vrijeme_rezultata}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </LaboratoryCard>
                    )
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="spas">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : spas.length === 0 ? (
                <Card className="p-12 text-center">
                  <Droplet className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nema registrovanih banja
                  </h3>
                  <p className="text-muted-foreground">
                    Trenutno nemamo banja {city.u_gradu || `u ${city.naziv}u`}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {spas.map(spa => (
                    <SpaCardSoft key={spa.id} banja={spa} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="domovi">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              ) : domovi.length === 0 ? (
                <Card className="p-12 text-center">
                  <Home className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">
                    Nema registrovanih domova za njegu
                  </h3>
                  <p className="text-muted-foreground">
                    Trenutno nemamo domova za njegu {city.u_gradu || `u ${city.naziv}u`}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {domovi.map(dom => (
                    <CareHomeCardSoft key={dom.id} dom={dom} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
