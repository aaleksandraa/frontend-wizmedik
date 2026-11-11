import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeInternalPath } from '@/utils/navigation';
import { clinicsAPI, doctorsAPI, guestVisitsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { reviewsAPI as newReviewsAPI, Recenzija } from '@/services/reviewsAPI';
import { useAuth } from '@/contexts/AuthContext';
import { trackContactClick, trackProfileView } from '@/config/analytics';
import { ClinicProfilePaper } from '@/components/profiles/ClinicProfilePaper';

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  contact_email?: string;
  website?: string;
  google_maps_link?: string;
  slike: any;
  radno_vrijeme: any;
  aktivan: boolean;
  latitude?: number;
  longitude?: number;
  ocjena?: number;
  specijalnosti?: Array<{
    id: number;
    naziv: string;
    slug: string;
  }>;
}

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  opis?: string;
  slika_profila?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slug: string;
}

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const toAbsoluteUrl = (url?: string | null): string => {
  if (!url) return DEFAULT_OG_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const slugifySpecialtyName = (value: string): string => {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function ClinicProfile() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [recenzije, setRecenzije] = useState<Recenzija[]>([]);
  const [guestDoctors, setGuestDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const clinicSpecialties = useMemo(() => {
    if (Array.isArray(clinic?.specijalnosti) && clinic.specijalnosti.length > 0) {
      return clinic.specijalnosti;
    }

    const byDoctor = new Map<string, { id: number; naziv: string; slug: string }>();

    doctors.forEach((doctor) => {
      const specialtyName = (doctor.specijalnost || '').trim();
      if (!specialtyName) {
        return;
      }

      const specialtySlug = slugifySpecialtyName(specialtyName);
      if (!specialtySlug || byDoctor.has(specialtySlug)) {
        return;
      }

      byDoctor.set(specialtySlug, {
        id: -1,
        naziv: specialtyName,
        slug: specialtySlug,
      });
    });

    return Array.from(byDoctor.values());
  }, [clinic?.specijalnosti, doctors]);

  useEffect(() => {
    if (slug) {
      fetchClinicData();
    }
  }, [slug]);

  const fetchClinicData = async () => {
    try {
      const response = await clinicsAPI.getBySlug(slug!);
      const clinicData = response.data;

      const redirectTo = safeInternalPath(clinicData?.redirect_to);
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }
      
      if (!clinicData) {
        navigate('/klinike');
        return;
      }
      
      setClinic({
        ...clinicData,
        slike: Array.isArray(clinicData.slike) ? clinicData.slike : []
      });
      trackProfileView({
        entity_type: 'clinic',
        entity_id: clinicData.id,
        entity_name: clinicData.naziv,
        clinic_id: clinicData.id,
        clinic_name: clinicData.naziv,
        city: clinicData.grad,
        specialization: Array.isArray(clinicData.specijalnosti) && clinicData.specijalnosti.length > 0
          ? clinicData.specijalnosti[0]?.naziv
          : null,
        profile_slug: slug,
      });

      const doctorsResponse = await doctorsAPI.getAll({ klinika_id: clinicData.id });
      const doctorsList = Array.isArray(doctorsResponse.data) 
        ? doctorsResponse.data 
        : (doctorsResponse.data?.data || []);
      setDoctors(doctorsList);

      fetchRecenzije(clinicData.id);
      fetchGuestDoctors(clinicData.id);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati podatke o klinici",
        variant: "destructive"
      });
      navigate('/klinike');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecenzije = async (klinikaId: number) => {
    try {
      const response = await newReviewsAPI.getByKlinika(klinikaId);
      setRecenzije(response.data || []);
      
      // Refresh clinic data to get updated ratings
      const clinicResponse = await clinicsAPI.getBySlug(slug!);
      if (clinicResponse.data) {
        setClinic({
          ...clinicResponse.data,
          slike: Array.isArray(clinicResponse.data.slike) ? clinicResponse.data.slike : []
        });
      }
    } catch (error) {
      console.error('Error fetching recenzije:', error);
    }
  };

  const fetchGuestDoctors = async (klinikaId: number) => {
    try {
      const response = await guestVisitsAPI.getClinicSchedule(klinikaId);
      // Ensure response.data is an array
      const doctors = Array.isArray(response.data) ? response.data : [];
      setGuestDoctors(doctors);
    } catch (error) {
      console.error('Error fetching guest doctors:', error);
      setGuestDoctors([]); // Set empty array on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Klinika nije pronađena</h1>
        <Button onClick={() => navigate('/klinike')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Nazad na klinike
        </Button>
      </div>
    );
  }

  const clinicAnalyticsEntity = {
    entity_type: 'clinic' as const,
    entity_id: clinic.id,
    entity_name: clinic.naziv,
    clinic_id: clinic.id,
    clinic_name: clinic.naziv,
    city: clinic.grad,
    specialization: clinicSpecialties[0]?.naziv || undefined,
    profile_slug: slug || '',
  };
  const canonicalUrl = `${SITE_URL}/klinika/${slug || ''}`;
  const ogImage = clinic.slike && clinic.slike.length > 0
    ? toAbsoluteUrl(clinic.slike[0])
    : DEFAULT_OG_IMAGE;
  const specialtySummary = clinicSpecialties.slice(0, 3).map((specialty) => specialty.naziv).join(', ');
  const seoDescription = [
    `${clinic.naziv} u ${clinic.grad}.`,
    specialtySummary ? `Oblasti: ${specialtySummary}.` : '',
    clinic.opis || 'Profesionalna zdravstvena ustanova sa strucnim osobljem.',
  ]
    .filter(Boolean)
    .join(' ')
    .slice(0, 160);
  const seoKeywords = [
    `klinika ${clinic.grad}`,
    clinic.naziv,
    ...clinicSpecialties.slice(0, 5).map((specialty) => `${specialty.naziv} ${clinic.grad}`),
    'privatna klinika',
    'zdravstvene usluge',
    'online zakazivanje',
  ].join(', ');
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalClinic',
    name: clinic.naziv,
    description: clinic.opis || undefined,
    url: canonicalUrl,
    image: ogImage,
    telephone: clinic.telefon || undefined,
    email: clinic.contact_email || clinic.email || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.adresa,
      addressLocality: clinic.grad,
      addressCountry: 'BA',
    },
    medicalSpecialty: clinicSpecialties.length > 0
      ? clinicSpecialties.map((specialty) => specialty.naziv)
      : undefined,
    aggregateRating: clinic.ocjena ? {
      '@type': 'AggregateRating',
      ratingValue: clinic.ocjena,
      reviewCount: recenzije.length || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      <Helmet>
        <title>{clinic.naziv} - Klinika u {clinic.grad} | WizMedik</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={`${clinic.naziv} - ${clinic.grad}`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="business.business" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${clinic.naziv} - ${clinic.grad}`} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>
      <ClinicProfilePaper
        clinic={clinic}
        doctors={doctors}
        specialties={clinicSpecialties}
        guests={guestDoctors}
        recenzije={recenzije}
        canRespond={user?.role === 'clinic' && user.email === clinic.email}
        onReviewsUpdate={() => fetchRecenzije(clinic.id)}
        onTrack={(channel, placement) => trackContactClick(channel, clinicAnalyticsEntity, placement)}
      />
    </>
  );
}
