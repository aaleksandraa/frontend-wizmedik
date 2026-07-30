import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { citiesAPI, doctorsAPI, specialtiesAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { MapPin, Stethoscope } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ListingHeader, ListingGrid } from '@/components/ListingLayout';

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

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const slugToText = (value?: string): string => {
  if (!value) {
    return '';
  }

  const decoded = decodeURIComponent(value.replace(/\+/g, ' '));
  const withSpaces = decoded.replace(/-/g, ' ').trim();
  if (withSpaces === '') {
    return '';
  }

  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

export default function CitySpecialtyDoctors() {
  const { grad, specijalnost } = useParams<{ grad?: string; specijalnost?: string }>();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedCityName, setResolvedCityName] = useState('');
  const [resolvedSpecialtyName, setResolvedSpecialtyName] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);

      try {
        let cityName = slugToText(grad);
        let specialtyName = slugToText(specijalnost);

        if (grad) {
          try {
            const cityResponse = await citiesAPI.getBySlug(grad);
            if (cityResponse.data?.naziv) {
              cityName = cityResponse.data.naziv;
            }
          } catch (error) {
            console.error('Error resolving city slug:', error);
          }
        }

        if (specijalnost) {
          try {
            const specialtyResponse = await specialtiesAPI.getBySlug(specijalnost);
            if (specialtyResponse.data?.naziv) {
              specialtyName = specialtyResponse.data.naziv;
            }
          } catch (error) {
            console.error('Error resolving specialty slug:', error);
          }
        }

        setResolvedCityName(cityName);
        setResolvedSpecialtyName(specialtyName);

        const params: Record<string, string> = {};
        if (cityName) {
          params.grad = cityName;
        }
        if (specialtyName) {
          params.specijalnost = specialtyName;
        }

        const response = await doctorsAPI.getAll(params);
        const doctorsList = Array.isArray(response.data) ? response.data : (response.data?.data || []);

        const normalizedDoctors: Doctor[] = doctorsList
          .map((doctor: any) => ({
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
            slug: doctor.slug,
            slika_profila: doctor.slika_profila,
            slika_url: doctor.slika_url,
          }))
          .sort((a, b) => (b.ocjena || 0) - (a.ocjena || 0));

        setDoctors(normalizedDoctors);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchDoctors();
  }, [grad, specijalnost]);

  const canonicalUrl = useMemo(() => {
    if (grad && specijalnost) {
      return `${SITE_URL}/doktori/${encodeURIComponent(grad)}/${encodeURIComponent(specijalnost)}`;
    }
    if (specijalnost) {
      return `${SITE_URL}/doktori/specijalnost/${encodeURIComponent(specijalnost)}`;
    }
    if (grad) {
      return `${SITE_URL}/doktori/${encodeURIComponent(grad)}`;
    }
    return `${SITE_URL}/doktori`;
  }, [grad, specijalnost]);

  const pageTitle = useMemo(() => {
    if (resolvedSpecialtyName && resolvedCityName) {
      return `${resolvedSpecialtyName} u ${resolvedCityName} - doktori i online zakazivanje | WizMedik`;
    }
    if (resolvedSpecialtyName) {
      return `${resolvedSpecialtyName} - doktori specijalisti | WizMedik`;
    }
    if (resolvedCityName) {
      return `Doktori - ${resolvedCityName} | WizMedik`;
    }
    return 'Pretraga doktora | WizMedik';
  }, [resolvedCityName, resolvedSpecialtyName]);

  const pageDescription = useMemo(() => {
    if (resolvedSpecialtyName && resolvedCityName) {
      return `Pronađite ${resolvedSpecialtyName.toLowerCase()} doktore u gradu ${resolvedCityName}. Pregledajte profile, ocjene i zakazite termin online.`;
    }
    if (resolvedSpecialtyName) {
      return `Lista doktora specijalista iz oblasti ${resolvedSpecialtyName.toLowerCase()} sa mogucnoscu online zakazivanja termina.`;
    }
    if (resolvedCityName) {
      return `Pronađite doktore u gradu ${resolvedCityName}. Pregledajte profile, kontakt informacije i dostupnost termina.`;
    }
    return 'Pretrazite doktore po gradu i specijalnosti na platformi WizMedik.';
  }, [resolvedCityName, resolvedSpecialtyName]);

  const breadcrumbItems = useMemo(() => {
    if (resolvedSpecialtyName && resolvedCityName && grad && specijalnost) {
      return [
        { label: 'Doktori', href: '/doktori' },
        { label: resolvedCityName, href: `/doktori/${grad}` },
        { label: resolvedSpecialtyName },
      ];
    }

    if (resolvedCityName && grad) {
      return [
        { label: 'Doktori', href: '/doktori' },
        { label: resolvedCityName },
      ];
    }

    if (resolvedSpecialtyName && specijalnost) {
      return [
        { label: 'Doktori', href: '/doktori' },
        { label: resolvedSpecialtyName },
      ];
    }

    return [{ label: 'Doktori' }];
  }, [grad, resolvedCityName, resolvedSpecialtyName, specijalnost]);

  const structuredData = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: pageTitle.replace(' | WizMedik', ''),
      description: pageDescription,
      url: canonicalUrl,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: doctors.length,
        itemListElement: doctors.slice(0, 50).map((doctor, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Physician',
            name: `Dr. ${doctor.ime} ${doctor.prezime}`,
            medicalSpecialty: doctor.specijalnost,
            address: {
              '@type': 'PostalAddress',
              addressLocality: doctor.grad,
              addressCountry: 'BA',
            },
            url: `${SITE_URL}/doktor/${doctor.slug}`,
          },
        })),
      },
    };
  }, [canonicalUrl, doctors, pageDescription, pageTitle]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta
          name="keywords"
          content={`${resolvedSpecialtyName || 'doktori'}, ${resolvedCityName || 'Bosna i Hercegovina'}, online zakazivanje, zdravstvene usluge`}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50/80">
        <Navbar />

        <main className="container mx-auto px-4 py-2 md:py-4">
          <Breadcrumb items={breadcrumbItems} />

          <ListingHeader
            badge="Doktori"
            badgeIcon={resolvedCityName ? MapPin : Stethoscope}
            title={
              resolvedSpecialtyName && resolvedCityName
                ? `${resolvedSpecialtyName} u ${resolvedCityName}`
                : resolvedCityName
                  ? `Doktori — ${resolvedCityName}`
                  : resolvedSpecialtyName || 'Pretraga doktora'
            }
            description={pageDescription}
          />

          {loading ? (
            <ListingGrid>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
              ))}
            </ListingGrid>
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-[#0891b2]/10 bg-white py-16 text-center shadow-sm">
              <Stethoscope className="mx-auto mb-4 h-16 w-16 text-[#0891b2]/40 opacity-50" />
              <h2 className="mb-2 text-2xl font-semibold">Nema pronadjenih doktora</h2>
              <p className="mb-6 text-muted-foreground">
                {resolvedSpecialtyName && resolvedCityName
                  ? `Trenutno nemamo registrovanih ${resolvedSpecialtyName.toLowerCase()} doktora u gradu ${resolvedCityName}.`
                  : 'Pokusajte sa drugim kriterijima pretrage.'}
              </p>
              <Button className="rounded-full bg-[#0891b2] hover:bg-[#0e7490]" onClick={() => navigate('/')}>
                Nazad na pocetnu
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-muted-foreground">
                Pronađeno <span className="font-semibold text-[#0891b2]">{doctors.length}</span>{' '}
                {doctors.length === 1 ? 'doktor' : 'doktora'}
              </p>

              <ListingGrid>
                {doctors.map((doctor) => (
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
                      prihvata_online: doctor.prihvata_online,
                    }}
                  />
                ))}
              </ListingGrid>
            </>
          )}
        </main>
      </div>
    </>
  );
}
