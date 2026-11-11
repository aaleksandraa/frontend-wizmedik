import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { doctorsAPI, appointmentsAPI, guestVisitsAPI, blogAPI } from '@/services/api';
import { reviewsAPI, Recenzija } from '@/services/reviewsAPI';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { BookAppointmentForm } from '@/components/BookAppointmentForm';
import { GuestBookingDialog } from '@/components/GuestBookingDialog';
import { GuestVisitBookingDialog } from '@/components/GuestVisitBookingDialog';
import { Helmet } from 'react-helmet-async';
import { DoctorProfilePaper } from '@/components/profiles/DoctorProfilePaper';
import { safeInternalPath } from '@/utils/navigation';
import { trackClarityEvent } from '@/config/clarity';
import { trackContactClick, trackProfileView } from '@/config/analytics';
import {
  classifyDoctorLoadError,
  classifyDoctorPayload,
  profileShell,
  reconcileSeoSnapshot,
  snapshotMatchesSlug,
  type SeoSnapshotPhase,
} from '@/lib/seo-snapshot';

interface Doctor {
  id: number;
  user_id?: number;
  ime: string;
  prezime: string;
  slug?: string;
  specijalnost: string;
  telefon: string;
  email?: string;
  public_email?: string;
  grad: string;
  lokacija: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  prihvata_online?: boolean;
  ocjena?: number;
  broj_ocjena?: number;
  opis?: string;
  youtube_linkovi?: Array<{ url: string; naslov: string }>;
  slika_profila?: string;
  radno_vrijeme?: any;
  klinika_naziv?: string;
  klinika_adresa?: string;
  klinika?: { naziv?: string; slug?: string; adresa?: string; grad?: string; lokacija?: string };
  telemedicine_enabled?: boolean;
  telemedicine_phone?: string;
  kategorijeUsluga?: Array<{
    id: number;
    naziv: string;
    opis?: string;
    usluge?: Array<{
      id: number;
      naziv: string;
      opis?: string;
      cijena?: number;
      cijena_popust?: number;
      trajanje_minuti: number;
    }>;
  }>;
}

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

const toAbsoluteUrl = (url?: string | null): string => {
  if (!url) return DEFAULT_OG_IMAGE;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

interface RatingStats {
  average: number;
  total: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface EligibleTermin {
  id: number;
  datum_vrijeme: string;
  doktor_id: number;
  status: string;
}

interface GuestVisitService {
  id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  trajanje_minuti: number;
}

interface GuestVisit {
  id: number;
  datum: string;
  vrijeme_od: string;
  vrijeme_do: string;
  slot_trajanje_minuti: number;
  prihvata_online_rezervacije: boolean;
  usluge: GuestVisitService[];
  klinika: {
    id: number;
    naziv: string;
    lokacija: string;
    grad: string;
    slug: string;
    google_maps_link?: string;
    telefon?: string;
  };
}

export default function DoctorProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loadStatus, setLoadStatus] = useState<SeoSnapshotPhase>('loading');
  const [loadedSlug, setLoadedSlug] = useState(slug);
  const requestRef = useRef(0);
  const [recenzije, setRecenzije] = useState<Recenzija[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showGuestBooking, setShowGuestBooking] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [eligibleTermini, setEligibleTermini] = useState<EligibleTermin[]>([]);
  const [newReview, setNewReview] = useState({
    ocjena: 5,
    komentar: '',
    termin_id: 0
  });
  const [guestVisits, setGuestVisits] = useState<GuestVisit[]>([]);
  const [selectedGuestVisit, setSelectedGuestVisit] = useState<GuestVisit | null>(null);
  const [showGuestVisitBooking, setShowGuestVisitBooking] = useState(false);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [blogPage, setBlogPage] = useState(1);
  const [blogHasMore, setBlogHasMore] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);

  if (slug !== loadedSlug) {
    setLoadedSlug(slug);
    setDoctor(null);
    setLoading(true);
    setLoadStatus('loading');
  }

  useEffect(() => {
    if (!slug) return;
    const requestId = ++requestRef.current;
    void fetchDoctor(slug, requestId);
  }, [slug]);

  useLayoutEffect(() => {
    const doctorName = doctor ? `Dr. ${doctor.ime} ${doctor.prezime}`.trim() : '';
    reconcileSeoSnapshot({
      slug,
      phase: loading ? 'loading' : loadStatus,
      doctorName,
    });
  }, [slug, loading, loadStatus, doctor]);

  useEffect(() => {
    if (doctor?.id) {
      const loadData = async () => {
        // Fetch samo najvažnije podatke paralelno
        await Promise.all([
          fetchRecenzije(),
          fetchServices(),
          fetchGuestVisits(),
          fetchBlogPosts()
        ]);
        
        // Fetch eligible termini samo za pacijente (manje kritično)
        if (user?.role === 'patient') {
          fetchEligibleTermini();
        }
      };
      
      loadData();
    }
  }, [doctor?.id, user?.role]);

  const fetchServices = async () => {
    if (!doctor?.id) return;
    try {
      const response = await doctorsAPI.getById(doctor.id);
      // Filter only services without category (uncategorized)
      const allServices = Array.isArray(response.data?.usluge) ? response.data.usluge : [];
      const uncategorizedServices = allServices.filter((s: any) => !s.kategorija_id);
      setServices(uncategorizedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
    }
  };

  const fetchGuestVisits = async () => {
    if (!doctor?.id) return;
    try {
      const response = await guestVisitsAPI.getDoctorPublicVisits(doctor.id);
      // Ensure response.data is an array
      const visits = Array.isArray(response.data) ? response.data : [];
      setGuestVisits(visits);
    } catch (error) {
      console.error('Error fetching guest visits:', error);
      setGuestVisits([]); // Set empty array on error
    }
  };

  const fetchBlogPosts = async (page = 1) => {
    if (!slug) return;
    
    setLoadingBlog(true);
    try {
      const response = await blogAPI.getDoctorPosts(slug);
      const posts = response.data?.data || response.data || [];
      
      if (page === 1) {
        setBlogPosts(posts.slice(0, 3)); // Show first 3 posts
        setBlogHasMore(posts.length > 3);
      } else {
        setBlogPosts(posts);
        setBlogHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogPosts([]);
      setBlogHasMore(false);
    } finally {
      setLoadingBlog(false);
    }
  };

  const loadMoreBlogPosts = () => {
    setBlogPage(2);
    fetchBlogPosts(2);
  };

  const fetchBookedSlots = async () => {
    if (!doctor?.id) return;
    try {
      const response = await doctorsAPI.getBookedSlots(doctor.id);
      setBookedSlots(response.data?.booked_slots || []);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  // Fetch booked slots samo kada se otvori booking dialog
  useEffect(() => {
    if (showBooking || showGuestBooking || showGuestVisitBooking) {
      fetchBookedSlots();
      trackClarityEvent('booking_started');
    }
  }, [showBooking, showGuestBooking, showGuestVisitBooking, doctor?.id]);

  const fetchDoctor = async (requestedSlug: string, requestId: number) => {
    setLoading(true);
    setLoadStatus('loading');
    setDoctor(null);

    try {
      const response = await doctorsAPI.getBySlug(requestedSlug);
      if (requestRef.current !== requestId) return;

      const redirectTo = safeInternalPath(response.data?.redirect_to);
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
        return;
      }

      const normalizedData = {
        ...response.data,
        kategorijeUsluga: response.data?.kategorije_usluga || response.data?.kategorijeUsluga
      };

      if (classifyDoctorPayload(normalizedData) !== 'ready') {
        setDoctor(null);
        setLoadStatus('unavailable');
        return;
      }

      setDoctor(normalizedData);
      setLoadStatus('ready');
      trackProfileView({
        entity_type: 'doctor',
        entity_id: normalizedData.id,
        entity_name: `Dr. ${normalizedData.ime} ${normalizedData.prezime}`,
        doctor_id: normalizedData.id,
        doctor_name: `Dr. ${normalizedData.ime} ${normalizedData.prezime}`,
        city: normalizedData.grad,
        specialization: normalizedData.specijalnost,
        profile_slug: normalizedData.slug || requestedSlug,
      });
    } catch (error) {
      if (requestRef.current !== requestId) return;
      console.error('Error fetching doctor:', error);
      setDoctor(null);
      setLoadStatus(classifyDoctorLoadError(error));
    } finally {
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    }
  };

  const fetchRecenzije = async () => {
    if (!doctor?.id) return;

    try {
      // Fetch recenzije i stats u jednom pozivu
      const [recenzijeResponse, statsResponse] = await Promise.all([
        reviewsAPI.getByDoktor(doctor.id),
        reviewsAPI.getRatingStats('doktor', doctor.id)
      ]);
      
      setRecenzije(recenzijeResponse.data || []);
      setRatingStats(statsResponse.data);
      
      // Refresh doctor data samo za ocjenu (ne ponovo fetch-uj sve)
      if (doctor.ocjena !== statsResponse.data.average) {
        setDoctor(prev => prev ? {
          ...prev,
          ocjena: statsResponse.data.average,
          broj_ocjena: statsResponse.data.total
        } : null);
      }
    } catch (error) {
      console.error('Error fetching recenzije:', error);
    }
  };

  const fetchEligibleTermini = async () => {
    if (!doctor?.id || !user) return;

    try {
      const response = await appointmentsAPI.getMyAppointments();
      const eligible = response.data.filter(
        (t: any) => 
          t.doktor_id === doctor.id && 
          t.status === 'završen' && 
          new Date(t.datum_vrijeme) < new Date() &&
          !t.recenzija_id // Termin nema recenziju
      );
      setEligibleTermini(eligible);
    } catch (error) {
      console.error('Error fetching eligible termini:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.termin_id) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: "Molimo odaberite termin"
      });
      return;
    }

    try {
      await reviewsAPI.create({
        termin_id: newReview.termin_id,
        recenziran_type: 'App\\Models\\Doktor',
        recenziran_id: doctor!.id,
        ocjena: newReview.ocjena,
        komentar: newReview.komentar
      });

      toast({
        title: "Uspjeh",
        description: "Recenzija uspješno dodana"
      });

      setShowReviewForm(false);
      setNewReview({ ocjena: 5, komentar: '', termin_id: 0 });
      
      // Refresh recenzije (što će refresh-ati i stats)
      await fetchRecenzije();
      await fetchEligibleTermini();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Greška",
        description: error.response?.data?.error || "Greška pri dodavanju recenzije"
      });
    }
  };

  const shell = profileShell(loading ? 'loading' : loadStatus, snapshotMatchesSlug(slug));

  if (shell === 'snapshot-only') {
    return null;
  }

  if (shell === 'skeleton') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse" role="status" aria-label="Učitavanje profila doktora">
              <div className="h-8 bg-muted rounded w-64 mb-8"></div>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="h-64 bg-muted rounded mb-6"></div>
                  <div className="h-48 bg-muted rounded"></div>
                </div>
                <div className="h-96 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (shell === 'unavailable' || shell === 'unavailable-with-snapshot') {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <p role="alert" className="text-lg font-semibold mb-2">Detaljni profil trenutno nije dostupan</p>
              <p className="text-muted-foreground mb-6">
                {shell === 'unavailable-with-snapshot'
                  ? 'Osnovni javni podaci iznad ostaju prikazani. Zakazivanje i ostale interaktivne informacije nisu učitane.'
                  : 'Podaci o doktoru nisu učitani. Pokušajte ponovo ili pregledajte listu doktora.'}
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="medical"
                  onClick={() => {
                    if (!slug) return;
                    const requestId = ++requestRef.current;
                    void fetchDoctor(slug, requestId);
                  }}
                >
                  Pokušaj ponovo
                </Button>
                <Link to="/doktori">Lista doktora</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!doctor || shell === 'not-found') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h1 className="text-2xl font-bold mb-2">Doktor nije pronađen</h1>
            <p className="text-muted-foreground mb-6">
              Doktor koji tražite ne postoji ili je uklonjen.
            </p>
            <Link to="/">
              <Button variant="medical">Nazad na početnu</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileSlug = doctor.slug || slug || '';
  const doctorAnalyticsEntity = {
    entity_type: 'doctor' as const,
    entity_id: doctor.id,
    entity_name: `Dr. ${doctor.ime} ${doctor.prezime}`,
    doctor_id: doctor.id,
    doctor_name: `Dr. ${doctor.ime} ${doctor.prezime}`,
    city: doctor.grad,
    specialization: doctor.specijalnost,
    profile_slug: profileSlug,
  };
  const canonicalUrl = `${SITE_URL}/doktor/${profileSlug}`;
  const ogImage = toAbsoluteUrl(doctor.slika_profila);
  const seoDescription = `${doctor.opis || `${doctor.specijalnost} u ${doctor.grad}u`}`.slice(0, 160);

  const handleBookClick = () => {
    if (user) {
      setShowBooking(true);
    } else {
      setShowGuestBooking(true);
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": `Dr. ${doctor.ime} ${doctor.prezime}`,
    "medicalSpecialty": doctor.specijalnost,
    "telephone": doctor.telefon,
    "email": doctor.public_email || doctor.email || undefined,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": doctor.lokacija,
      "addressLocality": doctor.grad,
      "addressCountry": "BA"
    },
    "aggregateRating": doctor.ocjena && doctor.broj_ocjena ? {
      "@type": "AggregateRating",
      "ratingValue": doctor.ocjena,
      "reviewCount": doctor.broj_ocjena,
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "url": canonicalUrl,
    "image": ogImage,
    "description": seoDescription
  };

  return (
    <>
      <Helmet>
        <title>Dr. {doctor.ime} {doctor.prezime} - {doctor.specijalnost} {doctor.grad} | WizMedik</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={`${doctor.specijalnost} ${doctor.grad}, doktor ${doctor.grad}, ${doctor.specijalnost?.toLowerCase?.() || ''}, zdravstvo ${doctor.grad}, ${doctor.ime} ${doctor.prezime}`} />
        <meta property="og:title" content={`Dr. ${doctor.ime} ${doctor.prezime} - ${doctor.specijalnost}`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`Dr. ${doctor.ime} ${doctor.prezime} - ${doctor.specijalnost}`} />
        <meta name="twitter:description" content={seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        <link rel="canonical" href={canonicalUrl} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <DoctorProfilePaper
        doctor={doctor}
        services={services}
        recenzije={recenzije}
        ratingStats={ratingStats}
        guestVisits={guestVisits}
        blogPosts={blogPosts}
        blogHasMore={blogHasMore}
        loadingBlog={loadingBlog}
        onLoadMoreBlog={loadMoreBlogPosts}
        canReview={user?.role === 'patient' && eligibleTermini.length > 0}
        showReviewForm={showReviewForm}
        onReviewForm={setShowReviewForm}
        newReview={newReview}
        onReviewChange={setNewReview}
        eligibleTermini={eligibleTermini}
        onReviewsUpdate={fetchRecenzije}
        onSubmitReview={handleSubmitReview}
        canRespond={user?.role === 'doctor' && user.id === doctor.user_id}
        onBook={handleBookClick}
        onBookService={(serviceId) => {
          setSelectedServiceId(serviceId);
          handleBookClick();
        }}
        selectedServiceId={selectedServiceId}
        onGuestVisitBook={(visit) => {
          setSelectedGuestVisit(visit as GuestVisit);
          setShowGuestVisitBooking(true);
        }}
        onTrack={(channel, placement) => trackContactClick(channel, doctorAnalyticsEntity, placement)}
      />

      <Dialog open={showBooking} onOpenChange={(open) => { setShowBooking(open); if (!open) setSelectedServiceId(null); }}>
        <DialogContent className="w-[calc(100%-1.5rem)] max-w-xl rounded-2xl p-4 sm:p-6">
          <DialogHeader className="pr-8 text-left">
            <DialogTitle className="text-lg">Zakaži termin</DialogTitle>
            <DialogDescription className="line-clamp-1">
              Dr. {doctor.ime} {doctor.prezime}
              {doctor.specijalnost ? ` · ${doctor.specijalnost}` : ''}
            </DialogDescription>
          </DialogHeader>
          <BookAppointmentForm
            doctorId={doctor.id}
            doctorName={`${doctor.ime} ${doctor.prezime}`}
            selectedServiceId={selectedServiceId}
            onSuccess={() => { setShowBooking(false); setSelectedServiceId(null); }}
          />
        </DialogContent>
      </Dialog>

      <GuestBookingDialog
        open={showGuestBooking}
        onOpenChange={(open) => { setShowGuestBooking(open); if (!open) setSelectedServiceId(null); }}
        doctorId={doctor.id}
        doctorName={`${doctor.ime} ${doctor.prezime}`}
        doctorData={doctor}
        services={services}
        bookedSlots={bookedSlots}
        selectedServiceId={selectedServiceId}
      />

      {selectedGuestVisit && (
        <GuestVisitBookingDialog
          open={showGuestVisitBooking}
          onOpenChange={(open) => {
            setShowGuestVisitBooking(open);
            if (!open) setSelectedGuestVisit(null);
          }}
          doctorId={doctor.id}
          doctorName={`Dr. ${doctor.ime} ${doctor.prezime}`}
          guestVisit={selectedGuestVisit}
        />
      )}
    </>
  );
}
