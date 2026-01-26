import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { doctorsAPI, appointmentsAPI, guestVisitsAPI, blogAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';
import { reviewsAPI, Recenzija } from '@/services/reviewsAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Star, Clock, Calendar, MessageSquare, Award, Building2, Briefcase, FileText, ArrowDown, Video } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { BookAppointmentForm } from '@/components/BookAppointmentForm';
import { GuestBookingDialog } from '@/components/GuestBookingDialog';
import { GuestVisitBookingDialog } from '@/components/GuestVisitBookingDialog';
import { LocationMapCard } from '@/components/LocationMapCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Helmet } from 'react-helmet-async';
import { ReviewCard } from '@/components/ReviewCard';
import { useTemplateSettings } from '@/hooks/useTemplateSettings';
import { DoctorTemplate, DoctorTemplateType } from '@/components/doctor-templates';
import { formatRating } from '@/utils/formatters';

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  telefon: string;
  email?: string;
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

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
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
  const [recenzije, setRecenzije] = useState<Recenzija[]>([]);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showGuestBooking, setShowGuestBooking] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const { doctorTemplate, modernCoverType, modernCoverValue } = useTemplateSettings();
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

  useEffect(() => {
    if (slug) {
      fetchDoctor();
    }
  }, [slug]);

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
      const response = await doctorsAPI.getServices(doctor.id);
      // Filter only services without category (uncategorized)
      const allServices = Array.isArray(response.data) ? response.data : [];
      const uncategorizedServices = allServices.filter((s: any) => !s.kategorija_id);
      setServices(uncategorizedServices);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]); // Set empty array on error
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
    if (showBooking || showGuestBooking) {
      fetchBookedSlots();
    }
  }, [showBooking, showGuestBooking, doctor?.id]);

  const fetchDoctor = async () => {
    if (!slug) return;

    try {
      const response = await doctorsAPI.getBySlug(slug);
      // Normalize the data - use snake_case if available
      const normalizedData = {
        ...response.data,
        kategorijeUsluga: response.data.kategorije_usluga || response.data.kategorijeUsluga
      };
      setDoctor(normalizedData);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      navigate('/');
    } finally {
      setLoading(false);
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

  const renderWorkingHours = (radnoVrijeme: any) => {
    if (!radnoVrijeme) {
      return <p className="text-sm text-muted-foreground">Radne sate molimo provjeriti telefonom</p>;
    }

    if (typeof radnoVrijeme === 'string') {
      return <p className="text-sm">{radnoVrijeme}</p>;
    }

    const dani = {
      ponedjeljak: 'Pon',
      utorak: 'Uto',
      srijeda: 'Sri',
      četvrtak: 'Čet',
      petak: 'Pet',
      subota: 'Sub',
      nedjelja: 'Ned'
    };

    return (
      <div className="space-y-1 text-sm">
        {Object.entries(dani).map(([key, label]) => {
          const day = radnoVrijeme[key];
          if (!day) return null;
          
          const radi = !day.closed && day.radi !== false;
          
          return (
            <div key={key} className="flex justify-between items-center">
              <span className="text-muted-foreground">{label}:</span>
              <span className={radi ? 'font-medium' : 'text-muted-foreground'}>
                {radi ? `${formatTime(day.open || day.od)} - ${formatTime(day.close || day.do)}` : 'Zatvoreno'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Remove seconds from time string (08:00:00 -> 08:00)
  const formatTime = (time: string) => time?.substring(0, 5) || time;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
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

  if (!doctor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Doktor nije pronađen</h2>
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

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Physician",
    "name": `Dr. ${doctor.ime} ${doctor.prezime}`,
    "medicalSpecialty": doctor.specijalnost,
    "telephone": doctor.telefon,
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
    "url": window.location.href,
    "description": doctor.opis || `${doctor.specijalnost} u ${doctor.grad}u`
  };

  // Non-classic templates
  if (doctorTemplate !== 'classic') {
    return (
      <>
        <Navbar />
        <Helmet>
          <title>Dr. {doctor.ime} {doctor.prezime} - {doctor.specijalnost} {doctor.grad} | WizMedik</title>
          <meta name="description" content={`Dr. ${doctor.ime} ${doctor.prezime}, ${doctor.specijalnost} u ${doctor.grad}u.`} />
        </Helmet>
        <DoctorTemplate
          template={doctorTemplate as DoctorTemplateType}
          doctor={doctor}
          services={services}
          recenzije={recenzije}
          ratingStats={ratingStats}
          guestVisits={guestVisits}
          onBookClick={() => setShowBooking(true)}
          onGuestBookClick={() => setShowGuestBooking(true)}
          onBookService={(serviceId: number) => {
            setSelectedServiceId(serviceId);
            if (user) {
              setShowBooking(true);
            } else {
              setShowGuestBooking(true);
            }
          }}
          onGuestVisitBook={(visit) => {
            setSelectedGuestVisit(visit);
            setShowGuestVisitBooking(true);
          }}
          isLoggedIn={!!user}
          coverType={modernCoverType}
          coverValue={modernCoverValue}
        />
        <Dialog open={showBooking} onOpenChange={(open) => { setShowBooking(open); if (!open) setSelectedServiceId(null); }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Zakaži termin</DialogTitle>
              <DialogDescription>Odaberite datum i vrijeme za vaš termin</DialogDescription>
            </DialogHeader>
            <BookAppointmentForm
              doctorId={doctor.id}
              doctorName={`Dr. ${doctor.ime} ${doctor.prezime}`}
              selectedServiceId={selectedServiceId}
              onSuccess={() => { setShowBooking(false); setSelectedServiceId(null); }}
            />
          </DialogContent>
        </Dialog>
        <GuestBookingDialog
          doctorId={doctor.id}
          doctorName={`Dr. ${doctor.ime} ${doctor.prezime}`}
          doctorData={doctor}
          services={services}
          bookedSlots={bookedSlots}
          selectedServiceId={selectedServiceId}
          open={showGuestBooking}
          onOpenChange={(open) => { setShowGuestBooking(open); if (!open) setSelectedServiceId(null); }}
        />
        {/* Guest Visit Booking Dialog for non-classic templates */}
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
        <Footer />
      </>
    );
  }

  // Classic template (original)
  return (
    <>
      <Navbar />
      <Helmet>
        <title>Dr. {doctor.ime} {doctor.prezime} - {doctor.specijalnost} {doctor.grad} | WizMedik</title>
        <meta name="description" content={`Dr. ${doctor.ime} ${doctor.prezime}, ${doctor.specijalnost} u ${doctor.grad}u. ${doctor.opis || 'Iskusan stručnjak sa dugogodišnjim iskustvom.'} Zakažite termin online.`} />
        <meta name="keywords" content={`${doctor.specijalnost} ${doctor.grad}, doktor ${doctor.grad}, ${doctor.specijalnost.toLowerCase()}, zdravstvo ${doctor.grad}, ${doctor.ime} ${doctor.prezime}`} />
        <meta property="og:title" content={`Dr. ${doctor.ime} ${doctor.prezime} - ${doctor.specijalnost}`} />
        <meta property="og:description" content={doctor.opis || `${doctor.specijalnost} u ${doctor.grad}u`} />
        <meta property="og:type" content="profile" />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Breadcrumb - closer to navbar */}
          <div className="mb-3 md:mb-6">
            <Breadcrumb items={[
              { label: 'Doktori', href: '/' },
              { label: doctor.specijalnost, href: `/doktori/specijalnost/${doctor.specijalnost.toLowerCase().replace(/\s+/g, '-')}` },
              { label: `Dr. ${doctor.ime} ${doctor.prezime}` }
            ]} />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 flex flex-col">
              {/* Doctor Info Card - Mobile Optimized */}
              <Card className="mb-6 md:mb-8 shadow-medium overflow-hidden">
                <CardHeader className="pb-4">
                  {/* Mobile Layout */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Avatar */}
                    <div className="flex justify-center sm:justify-start">
                      {doctor.slika_profila ? (
                        <img 
                          src={doctor.slika_profila} 
                          alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-primary shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl sm:text-2xl border-4 border-primary shadow-lg">
                          {doctor.ime[0]}{doctor.prezime[0]}
                        </div>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <CardTitle className="text-xl sm:text-2xl mb-1">
                        Dr. {doctor.ime} {doctor.prezime}
                      </CardTitle>
                      <p className="text-base sm:text-lg text-muted-foreground mb-3">{doctor.specijalnost}</p>
                      
                      {/* Rating & Badge - Single Row on Mobile */}
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                        {doctor.ocjena && doctor.broj_ocjena > 0 ? (
                          <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold text-sm">{doctor.ocjena}</span>
                            <span className="text-xs text-muted-foreground">({doctor.broj_ocjena})</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-full">
                            Nema recenzija
                          </span>
                        )}
                        <Badge 
                          variant={doctor.prihvata_online ? "default" : "outline"}
                          className={`text-xs ${doctor.prihvata_online ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          {doctor.prihvata_online ? "Online rezervacije" : "Samo telefon"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg">Kontakt informacije</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <span>{doctor.telefon}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <span>{doctor.lokacija}, {doctor.grad}</span>
                        </div>
                        {doctor.google_maps_link && (
                          <div className="flex items-center gap-3">
                            <a 
                              href={doctor.google_maps_link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-primary hover:underline"
                            >
                              <MapPin className="w-5 h-5" />
                              Otvori navigaciju
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* O doktoru Section - Separate Card */}
              {doctor.opis && (
                <Card className="mb-8 shadow-medium order-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      O doktoru
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm max-w-none text-muted-foreground mb-6"
                      dangerouslySetInnerHTML={{ __html: doctor.opis }}
                    />
                    
                    {/* Action Buttons below description - Responsive */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                      {doctor.prihvata_online && (
                        <Button 
                          onClick={() => setShowBooking(true)}
                          size="lg"
                          className="w-full sm:flex-1"
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Zakaži online
                        </Button>
                      )}
                      {doctor.telefon && (
                        <Button 
                          variant="outline"
                          size="lg"
                          className="w-full sm:flex-1"
                          asChild
                        >
                          <a href={`tel:${doctor.telefon}`}>
                            <Phone className="w-5 h-5 mr-2" />
                            Pozovite
                          </a>
                        </Button>
                      )}
                      {(doctor.kategorijeUsluga?.length > 0 || services.length > 0) && (
                        <Button 
                          variant="secondary"
                          size="lg"
                          className="w-full sm:flex-1"
                          onClick={() => {
                            const servicesSection = document.getElementById('usluge-section');
                            servicesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                        >
                          <Briefcase className="w-5 h-5 mr-2" />
                          Usluge
                          <ArrowDown className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Telemedicine Section */}
              {doctor.telemedicine_enabled && doctor.telemedicine_phone && (
                <Card className="mb-8 shadow-medium order-1 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Video className="w-5 h-5" />
                      Telemedicina - Video konsultacije
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-700">
                      Dr. {doctor.ime} {doctor.prezime} nudi mogućnost video konsultacija za određene usluge. 
                      Zakažite termin telefonom i dogovorite se za online pregled.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        variant="default"
                        size="lg"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        asChild
                      >
                        <a href={`tel:${doctor.telemedicine_phone}`}>
                          <Phone className="w-5 h-5 mr-2" />
                          Zakažite video poziv: {doctor.telemedicine_phone}
                        </a>
                      </Button>
                    </div>
                    <div className="bg-white/60 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-gray-900">Prednosti telemedicine:</p>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Konsultacije iz udobnosti vašeg doma</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Ušteda vremena - bez putovanja do ordinacije</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>Idealno za kontrolne preglede i savjete</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* YouTube Videos Section */}
              {doctor.youtube_linkovi && doctor.youtube_linkovi.length > 0 && (
                <Card className="mb-8 shadow-medium order-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      Video snimci
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {doctor.youtube_linkovi.map((video, index) => {
                        const videoId = getYouTubeVideoId(video.url);
                        if (!videoId) return null;
                        
                        return (
                          <div key={index} className="space-y-2">
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                              <iframe
                                src={`https://www.youtube.com/embed/${videoId}`}
                                title={video.naslov}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                              />
                            </div>
                            {video.naslov && (
                              <h4 className="font-medium text-sm">{video.naslov}</h4>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blog Posts Section - Savjeti */}
              {blogPosts.length > 0 && (
                <Card className="mb-8 shadow-medium order-1">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Savjeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {blogPosts.map((post) => (
                        <Link 
                          key={post.id} 
                          to={`/blog/${post.slug}`}
                          className="block p-4 bg-muted/30 rounded-lg border hover:shadow-md hover:border-primary/50 transition-all"
                        >
                          <div className="flex gap-4">
                            {post.thumbnail && (
                              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                                <img 
                                  src={fixImageUrl(post.thumbnail) || ''} 
                                  alt={post.naslov}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                                {post.naslov}
                              </h3>
                              {post.excerpt && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(post.created_at).toLocaleDateString('sr-Latn-BA', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })}
                                </span>
                                {post.categories && post.categories.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <Badge variant="outline" className="text-xs">
                                      {post.categories[0].naziv}
                                    </Badge>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    
                    {blogHasMore && (
                      <div className="mt-6 text-center">
                        <Button 
                          variant="outline" 
                          onClick={loadMoreBlogPosts}
                          disabled={loadingBlog}
                        >
                          {loadingBlog ? 'Učitavanje...' : 'Učitaj više članaka'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Mobile Action Buttons - REMOVED - Already shown in "O doktoru" section */}

              {/* Guest Visits Section */}
              {guestVisits.length > 0 && (
                <Card className="mb-8 shadow-medium border-l-4 border-l-blue-500 order-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-600" />
                      Gostovanja u klinikama
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Dr. {doctor.ime} {doctor.prezime} gostuje u sljedećim klinikama. Možete zakazati termin direktno.
                    </p>
                    <div className="space-y-4">
                      {guestVisits.map((visit) => (
                        <div key={visit.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Link 
                                to={`/klinika/${visit.klinika.slug}`}
                                className="font-semibold text-blue-700 hover:underline"
                              >
                                {visit.klinika.naziv}
                              </Link>
                              <Badge variant="outline" className="text-xs">Gostovanje</Badge>
                              {!visit.prihvata_online_rezervacije && (
                                <Badge variant="secondary" className="text-xs">Samo telefon</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatTime(visit.vrijeme_od)} - {formatTime(visit.vrijeme_do)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              {visit.klinika.lokacija}, {visit.klinika.grad}
                            </div>
                            {visit.usluge && visit.usluge.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {visit.usluge.slice(0, 3).map((usluga) => (
                                  <Badge key={usluga.id} variant="outline" className="text-xs bg-white">
                                    {usluga.naziv} {usluga.cijena && `- ${usluga.cijena} KM`}
                                  </Badge>
                                ))}
                                {visit.usluge.length > 3 && (
                                  <Badge variant="outline" className="text-xs bg-white">
                                    +{visit.usluge.length - 3} više
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          {visit.prihvata_online_rezervacije ? (
                            <Button
                              variant="medical"
                              size="sm"
                              onClick={() => {
                                setSelectedGuestVisit(visit);
                                setShowGuestVisitBooking(true);
                              }}
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Zakaži termin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => visit.klinika.telefon && window.open(`tel:${visit.klinika.telefon}`)}
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              {visit.klinika.telefon || 'Pozovite kliniku'}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services Section */}
              {(doctor.kategorijeUsluga?.length > 0 || services.length > 0) && (
                <Card id="usluge-section" className="mb-8 shadow-medium order-4 scroll-mt-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Usluge i cijene
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Services grouped by categories */}
                    {doctor.kategorijeUsluga && doctor.kategorijeUsluga.length > 0 ? (
                      <div className="space-y-6">
                        {doctor.kategorijeUsluga.map((kategorija: any) => (
                          <div key={kategorija.id}>
                            <div className="mb-4 pb-2 border-b-2 border-primary/20">
                              <h3 className="font-semibold text-lg text-primary">{kategorija.naziv}</h3>
                              {kategorija.opis && <p className="text-sm text-muted-foreground mt-1">{kategorija.opis}</p>}
                            </div>
                            {kategorija.usluge && kategorija.usluge.length > 0 ? (
                              <div className="space-y-3">
                                {kategorija.usluge.map((service: any) => (
                                  <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg border hover:shadow-sm transition-shadow gap-3">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-base mb-1">{service.naziv}</h4>
                                      {service.opis && (
                                        <p className="text-sm text-muted-foreground mb-2">{service.opis}</p>
                                      )}
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        <span>{service.trajanje_minuti} min</span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                      <div className="text-right">
                                        {service.cijena_popust ? (
                                          <div>
                                            <div className="text-muted-foreground line-through text-sm">{service.cijena} KM</div>
                                            <div className="text-green-600 font-bold text-xl">{service.cijena_popust} KM</div>
                                          </div>
                                        ) : (
                                          <div className="text-primary font-bold text-xl">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</div>
                                        )}
                                      </div>
                                      {doctor.prihvata_online && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setSelectedServiceId(service.id);
                                            if (user) {
                                              setShowBooking(true);
                                            } else {
                                              setShowGuestBooking(true);
                                            }
                                          }}
                                          className="whitespace-nowrap"
                                        >
                                          <Calendar className="w-4 h-4 mr-2" />
                                          Zakaži termin
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">Nema usluga u ovoj kategoriji</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* Uncategorized services */}
                    {services.length > 0 && (
                      <div className={doctor.kategorijeUsluga?.length > 0 ? 'mt-6 pt-6 border-t' : ''}>
                        {doctor.kategorijeUsluga?.length > 0 && (
                          <div className="mb-4 pb-2 border-b-2 border-primary/20">
                            <h3 className="font-semibold text-lg text-primary">Ostale usluge</h3>
                          </div>
                        )}
                        <div className="space-y-3">
                          {services.map((service: any) => (
                            <div key={service.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-muted/30 rounded-lg border hover:shadow-sm transition-shadow gap-3">
                              <div className="flex-1">
                                <h4 className="font-medium text-base mb-1">{service.naziv}</h4>
                                {service.opis && (
                                  <p className="text-sm text-muted-foreground mb-2">{service.opis}</p>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="w-4 h-4" />
                                  <span>{service.trajanje_minuti} min</span>
                                </div>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                <div className="text-right">
                                  {service.cijena_popust ? (
                                    <div>
                                      <div className="text-muted-foreground line-through text-sm">{service.cijena} KM</div>
                                      <div className="text-green-600 font-bold text-xl">{service.cijena_popust} KM</div>
                                    </div>
                                  ) : (
                                    <div className="text-primary font-bold text-xl">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</div>
                                  )}
                                </div>
                                {doctor.prihvata_online && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedServiceId(service.id);
                                      if (user) {
                                        setShowBooking(true);
                                      } else {
                                        setShowGuestBooking(true);
                                      }
                                    }}
                                    className="whitespace-nowrap"
                                  >
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Zakaži termin
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* No services at all */}
                    {!doctor.kategorijeUsluga?.length && services.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        Trenutno nema dostupnih usluga
                      </p>
                    )}

                    {!doctor.prihvata_online && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                          Za zakazivanje termina kontaktirajte doktora telefonom: <strong>{doctor.telefon}</strong>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Reviews Section */}
              <Card className="shadow-medium order-5">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Recenzije pacijenata
                    </CardTitle>
                    {user?.role === 'patient' && eligibleTermini.length > 0 && (
                      <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Award className="w-4 h-4 mr-2" />
                            Ostavi recenziju
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ostavi recenziju za Dr. {doctor.ime} {doctor.prezime}</DialogTitle>
                            <DialogDescription>Podijelite vaše iskustvo sa ovim doktorom</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmitReview} className="space-y-4">
                            <div>
                              <Label>Odaberite termin</Label>
                              <Select
                                value={newReview.termin_id.toString()}
                                onValueChange={(value) => setNewReview(prev => ({...prev, termin_id: parseInt(value)}))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Odaberite termin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eligibleTermini.map((termin) => (
                                    <SelectItem key={termin.id} value={termin.id.toString()}>
                                      {new Date(termin.datum_vrijeme).toLocaleDateString('sr-Latn-BA', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Ocjena</Label>
                              <Select
                                value={newReview.ocjena.toString()}
                                onValueChange={(value) => setNewReview(prev => ({...prev, ocjena: parseInt(value)}))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">⭐⭐⭐⭐⭐ Odličan</SelectItem>
                                  <SelectItem value="4">⭐⭐⭐⭐ Vrlo dobar</SelectItem>
                                  <SelectItem value="3">⭐⭐⭐ Dobar</SelectItem>
                                  <SelectItem value="2">⭐⭐ Prosječan</SelectItem>
                                  <SelectItem value="1">⭐ Loš</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="komentar">Komentar (opcionalno)</Label>
                              <Textarea
                                id="komentar"
                                placeholder="Podijelite vaše iskustvo..."
                                value={newReview.komentar}
                                onChange={(e) => setNewReview(prev => ({...prev, komentar: e.target.value}))}
                                rows={4}
                                maxLength={1000}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {newReview.komentar.length}/1000 karaktera
                              </p>
                            </div>
                            <Button type="submit" variant="medical" className="w-full">
                              Pošalji recenziju
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Rating Summary */}
                  {ratingStats && ratingStats.total > 0 && (
                    <div className="mb-8 pb-6 border-b">
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">
                            {formatRating(ratingStats.average)}
                          </div>
                          <div className="flex items-center justify-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < Math.round(ratingStats.average)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {ratingStats.total} {ratingStats.total === 1 ? 'recenzija' : 'recenzija'}
                          </p>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = ratingStats.distribution[rating as keyof typeof ratingStats.distribution];
                            const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm w-12 text-muted-foreground">{rating} ⭐</span>
                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-yellow-400 transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-sm w-12 text-right text-muted-foreground">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  {recenzije.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-semibold mb-2">Nema još recenzija</p>
                      <p className="text-muted-foreground mb-6">
                        Budite prvi koji će ocijeniti ovog doktora
                      </p>
                      {user?.role === 'patient' && eligibleTermini.length > 0 && (
                        <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                          <Award className="w-4 h-4 mr-2" />
                          Napišite recenziju
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {recenzije.map((recenzija) => (
                        <ReviewCard
                          key={recenzija.id}
                          recenzija={recenzija}
                          onUpdate={fetchRecenzije}
                          canRespond={user?.role === 'doctor' && user.email === doctor.email}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              {/* Map Card - Shows first on mobile for better UX */}
              <div className="lg:hidden">
                <LocationMapCard
                  naziv={`Dr. ${doctor.ime} ${doctor.prezime}`}
                  adresa={doctor.lokacija}
                  grad={doctor.grad}
                  latitude={doctor.latitude}
                  longitude={doctor.longitude}
                  googleMapsLink={doctor.google_maps_link}
                  markerColor="gold"
                />
              </div>

              {/* Booking Card */}
              <Card className="lg:sticky lg:top-8 shadow-medium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Zakažite termin</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {doctor.prihvata_online ? (
                    <>
                      {user ? (
                        <Dialog open={showBooking} onOpenChange={setShowBooking}>
                          <DialogTrigger asChild>
                            <Button variant="medical" className="w-full" size="lg">
                              <Calendar className="w-5 h-5 mr-2" />
                              Zakaži online
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>
                                Zakažite termin kod Dr. {doctor.ime} {doctor.prezime}
                              </DialogTitle>
                              <DialogDescription>Odaberite datum i vrijeme za vaš termin</DialogDescription>
                            </DialogHeader>
                            <BookAppointmentForm
                              doctorId={doctor.id}
                              doctorName={`${doctor.ime} ${doctor.prezime}`}
                              selectedServiceId={selectedServiceId}
                              onSuccess={() => { setShowBooking(false); setSelectedServiceId(null); }}
                            />
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <Button 
                          variant="medical" 
                          className="w-full" 
                          size="lg"
                          onClick={() => setShowGuestBooking(true)}
                        >
                          <Calendar className="w-5 h-5 mr-2" />
                          Zakaži termin
                        </Button>
                      )}

                      {!user && (
                        <GuestBookingDialog
                          open={showGuestBooking}
                          onOpenChange={setShowGuestBooking}
                          doctorId={doctor.id}
                          doctorName={`${doctor.ime} ${doctor.prezime}`}
                          doctorData={doctor}
                          services={services}
                          bookedSlots={bookedSlots}
                        />
                      )}
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-sm text-muted-foreground">
                        Ovaj doktor ne prima online rezervacije
                      </p>
                    </div>
                  )}
                  
                  <Button
                    variant="medical-outline"
                    className="w-full"
                    size="lg"
                    onClick={() => window.open(`tel:${doctor.telefon}`)}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    Pozovite {doctor.telefon}
                  </Button>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">Radno vrijeme</h4>
                    {renderWorkingHours(doctor.radno_vrijeme)}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-sm mb-2">Lokacija</h4>
                    <p className="text-sm text-muted-foreground">
                      {doctor.lokacija}, {doctor.grad}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Map Card - Desktop only (hidden on mobile, shown above) */}
              <div className="hidden lg:block">
                <LocationMapCard
                  naziv={`Dr. ${doctor.ime} ${doctor.prezime}`}
                  adresa={doctor.lokacija}
                  grad={doctor.grad}
                  latitude={doctor.latitude}
                  longitude={doctor.longitude}
                  googleMapsLink={doctor.google_maps_link}
                  markerColor="gold"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guest Visit Booking Dialog */}
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
      <Footer />
    </>
  );
}

