import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorsAPI, specialtiesAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { MapPin, Stethoscope } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija: string;
  telefon: string;
  email?: string;
  ocjena?: number;
  broj_ocjena?: number;
  prihvata_online?: boolean;
  opis?: string;
  radno_vrijeme?: any;
  slug: string;
  slika_profila?: string;
  slika_url?: string;
}

const cityNames: Record<string, string> = {
  'sarajevo': 'Sarajevo',
  'banja-luka': 'Banja Luka',
  'tuzla': 'Tuzla',
  'zenica': 'Zenica',
  'mostar': 'Mostar',
  'bijeljina': 'Bijeljina',
  'doboj': 'Doboj',
  'prijedor': 'Prijedor',
  'trebinje': 'Trebinje',
  'modrica': 'Modrica',
  'foca': 'Foča'
};

const specialtyNames: Record<string, string> = {
  'kardiologija': 'Kardiologija',
  'pedijatrija': 'Pedijatrija',
  'ortopedija': 'Ortopedija',
  'neurologija': 'Neurologija',
  'oftalmologija': 'Oftalmologija',
  'opsta-medicina': 'Opšta medicina',
  'hirurgija': 'Hirurgija',
  'ginekologija': 'Ginekologija i akušerstvo',
  'psihijatrija': 'Psihijatrija',
  'orl': 'ORL',
  'dermatologija': 'Dermatologija',
  'stomatologija': 'Stomatologija'
};

export default function CitySpecialtyDoctors() {
  const { grad, specijalnost } = useParams<{ grad: string; specijalnost: string }>();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const cityName = grad ? cityNames[grad.toLowerCase()] || grad : '';
  const specialtyName = specijalnost ? specialtyNames[specijalnost.toLowerCase()] || specijalnost : '';

  useEffect(() => {
    fetchDoctors();
  }, [grad, specijalnost]);

  const fetchDoctors = async () => {
    try {
      let doctorsData: Doctor[] = [];

      if (specijalnost && !grad) {
        const specialtyResponse = await specialtiesAPI.getBySlug(specijalnost);
        const specialtyData = specialtyResponse.data;
        
        if (specialtyData && specialtyData.doktori) {
          doctorsData = specialtyData.doktori.map((doctor: any) => ({
            id: doctor.id,
            ime: doctor.ime,
            prezime: doctor.prezime,
            specijalnost: doctor.specijalnost,
            grad: doctor.grad,
            lokacija: doctor.lokacija,
            telefon: doctor.telefon,
            email: doctor.email,
            ocjena: doctor.ocjena || 0,
            broj_ocjena: doctor.broj_ocjena || 0,
            prihvata_online: doctor.prihvata_online || false,
            opis: doctor.opis,
            radno_vrijeme: doctor.radno_vrijeme,
            slug: doctor.slug
          }));
        }
      } else {
        const params: any = {};
        
        if (cityName) {
          params.grad = cityName;
        }
        if (specialtyName) {
          params.specijalnost = specialtyName;
        }

        const response = await doctorsAPI.getAll(params);
        const doctorsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        doctorsData = doctorsList.map((doctor: any) => ({
          id: doctor.id,
          ime: doctor.ime,
          prezime: doctor.prezime,
          specijalnost: doctor.specijalnost,
          grad: doctor.grad,
          lokacija: doctor.lokacija,
          telefon: doctor.telefon,
          email: doctor.email,
          ocjena: doctor.ocjena || 0,
          broj_ocjena: doctor.broj_ocjena || 0,
          prihvata_online: doctor.prihvata_online || false,
          opis: doctor.opis,
          radno_vrijeme: doctor.radno_vrijeme,
          slug: doctor.slug
        }));
      }

      setDoctors(doctorsData.sort((a, b) => (b.ocjena || 0) - (a.ocjena || 0)));
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": doctors.map((doctor, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Physician",
        "name": `Dr. ${doctor.ime} ${doctor.prezime}`,
        "medicalSpecialty": doctor.specijalnost,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": doctor.grad,
          "addressCountry": "BA"
        },
        "aggregateRating": doctor.ocjena && doctor.broj_ocjena ? {
          "@type": "AggregateRating",
          "ratingValue": doctor.ocjena,
          "reviewCount": doctor.broj_ocjena
        } : undefined
      }
    }))
  };

  const pageTitle = specialtyName && cityName 
    ? `${specialtyName} ${cityName} - Pronađite najboljeg doktora`
    : specialtyName 
    ? `${specialtyName} - Doktori specijalisti`
    : cityName
    ? `Doktori u ${cityName}u`
    : 'Pretraga doktora';

  const pageDescription = specialtyName && cityName
    ? `Pronađite najboljeg ${specialtyName.toLowerCase()} specijalista u ${cityName}u. Pregledajte ocjene pacijenata i zakažite termin online.`
    : specialtyName
    ? `Lista doktora specijalista iz oblasti ${specialtyName.toLowerCase()}. Zakažite pregled kod stručnjaka sa najboljim ocjenama.`
    : cityName
    ? `Svi doktori u ${cityName}u. Pregledajte profile, ocjene pacijenata i zakažite termin online.`
    : 'Pretražite doktore po gradu i specijalnosti.';

  return (
    <>
      <Helmet>
        <title>{pageTitle} | WizMedik</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={`${specialtyName} ${cityName}, doktor ${cityName}, ${specialtyName?.toLowerCase()}, zdravstvo ${cityName}, pregled ${cityName}, specijalist ${specialtyName?.toLowerCase()}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-2 md:py-4">
          <Breadcrumb items={[
            ...(cityName && specialtyName 
              ? [
                  { label: specialtyName, href: `/specijalnost/${specijalnost}` },
                  { label: cityName }
                ]
              : cityName 
              ? [{ label: `Doktori u ${cityName}u` }]
              : specialtyName
              ? [{ label: specialtyName }]
              : []
            )
          ]} />

          <header className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              {specialtyName && cityName && (
                <>
                  <Stethoscope className="inline w-8 h-8 mr-2 text-primary" />
                  {specialtyName} u {cityName}u
                </>
              )}
              {!specialtyName && cityName && (
                <>
                  <MapPin className="inline w-8 h-8 mr-2 text-primary" />
                  Doktori u {cityName}u
                </>
              )}
              {specialtyName && !cityName && (
                <>
                  <Stethoscope className="inline w-8 h-8 mr-2 text-primary" />
                  {specialtyName}
                </>
              )}
            </h1>
            <p className="text-xl text-muted-foreground">
              {pageDescription}
            </p>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-16">
              <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-semibold mb-2">Nema pronađenih doktora</h2>
              <p className="text-muted-foreground mb-6">
                {specialtyName && cityName
                  ? `Trenutno nemamo registrovanih ${specialtyName.toLowerCase()} specijalista u ${cityName}u.`
                  : 'Pokušajte sa drugim kriterijima pretrage.'}
              </p>
              <Button variant="medical" onClick={() => navigate('/')}>
                Nazad na početnu
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-lg text-muted-foreground">
                  Pronađeno <span className="font-semibold text-foreground">{doctors.length}</span> {doctors.length === 1 ? 'doktor' : 'doktora'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
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
                      slika_profila: doctor.slika_profila || doctor.slika_url,
                      prihvata_online: doctor.prihvata_online
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
