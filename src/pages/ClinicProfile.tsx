import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { clinicsAPI, doctorsAPI, guestVisitsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Clock, Star, MessageSquare, Calendar, UserPlus } from 'lucide-react';
import { MapView } from '@/components/MapView';
import { Helmet } from 'react-helmet-async';
import { reviewsAPI as newReviewsAPI, Recenzija } from '@/services/reviewsAPI';
import { ReviewCard } from '@/components/ReviewCard';
import { useAuth } from '@/contexts/AuthContext';
import { ImageLightbox } from '@/components/ImageLightbox';

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

  useEffect(() => {
    if (slug) {
      fetchClinicData();
    }
  }, [slug]);

  const fetchClinicData = async () => {
    try {
      const response = await clinicsAPI.getBySlug(slug!);
      const clinicData = response.data;
      
      if (!clinicData) {
        navigate('/klinike');
        return;
      }
      
      setClinic({
        ...clinicData,
        slike: Array.isArray(clinicData.slike) ? clinicData.slike : []
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

  const renderWorkingHours = (radno_vrijeme: any) => {
    if (!radno_vrijeme) return null;

    const days = ['ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota', 'nedelja'];
    const dayNames = {
      ponedeljak: 'Ponedeljak',
      utorak: 'Utorak', 
      sreda: 'Sreda',
      četvrtak: 'Četvrtak',
      petak: 'Petak',
      subota: 'Subota',
      nedelja: 'Nedelja'
    };

    return (
      <div className="space-y-2">
        {days.map(day => {
          const hours = radno_vrijeme[day];
          return (
            <div key={day} className="flex justify-between items-center">
              <span className="font-medium">{dayNames[day as keyof typeof dayNames]}</span>
              <span className={`${hours?.closed ? 'text-red-500' : 'text-green-600'}`}>
                {hours?.closed ? 'Zatvoreno' : `${hours?.open} - ${hours?.close}`}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getCurrentStatus = (radno_vrijeme: any) => {
    if (!radno_vrijeme) return { status: 'Nepoznato', color: 'gray' };

    const now = new Date();
    const currentDay = now.getDay();
    const dayMapping = ['nedelja', 'ponedeljak', 'utorak', 'sreda', 'četvrtak', 'petak', 'subota'];
    const today = dayMapping[currentDay];
    
    const todayHours = radno_vrijeme[today];
    if (!todayHours || todayHours.closed) {
      return { status: 'Zatvoreno', color: 'red' };
    }

    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = parseInt(todayHours.open.replace(':', ''));
    const closeTime = parseInt(todayHours.close.replace(':', ''));

    if (currentTime >= openTime && currentTime <= closeTime) {
      return { status: 'Otvoreno', color: 'green' };
    } else {
      return { status: 'Zatvoreno', color: 'red' };
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

  const currentStatus = getCurrentStatus(clinic.radno_vrijeme);

  return (
    <>
      <Helmet>
        <title>{clinic.naziv} - Klinika u {clinic.grad} | MediBIH</title>
        <meta name="description" content={`${clinic.naziv} u ${clinic.grad}u. ${clinic.opis || 'Profesionalna zdravstvena ustanova sa stručnim osobljem.'} Zakažite termin online.`} />
        <meta property="og:title" content={`${clinic.naziv} - ${clinic.grad}`} />
        <meta property="og:description" content={clinic.opis || `Profesionalna zdravstvena ustanova u ${clinic.grad}u`} />
        <meta property="og:type" content="business.business" />
        {clinic.slike && clinic.slike.length > 0 && (
          <meta property="og:image" content={clinic.slike[0]} />
        )}
        <link rel="canonical" href={window.location.href} />
      </Helmet>
      <Navbar />
      <div className="min-h-screen bg-gradient-primary">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" onClick={() => navigate('/klinike')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad
            </Button>
            <h1 className="text-3xl font-bold">{clinic.naziv}</h1>
            <Badge variant={currentStatus.color === 'green' ? 'default' : 'destructive'}>
              {currentStatus.status}
            </Badge>
          </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {clinic.slike && clinic.slike.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Galerija</h2>
                <div className="space-y-4">
                  <div 
                    className="aspect-video rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => {
                      setLightboxIndex(selectedImage);
                      setLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={clinic.slike[selectedImage]} 
                      alt={`${clinic.naziv} ${selectedImage + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {clinic.slike.map((img: string, idx: number) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${clinic.naziv} thumbnail ${idx + 1}`}
                        className={`w-full h-16 object-cover rounded cursor-pointer border-2 ${
                          selectedImage === idx ? 'border-primary' : 'border-transparent'
                        }`}
                        onClick={() => setSelectedImage(idx)}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {clinic.opis && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">O klinici</h2>
                <p className="text-muted-foreground leading-relaxed">{clinic.opis}</p>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Naši doktori</h2>
              {doctors.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {doctors.map(doctor => (
                    <Card key={doctor.id} className="p-4">
                      <div className="flex gap-4">
                        {doctor.slika_profila ? (
                          <img 
                            src={doctor.slika_profila} 
                            alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {doctor.ime[0]}{doctor.prezime[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">Dr. {doctor.ime} {doctor.prezime}</h4>
                          <p className="text-sm text-muted-foreground">{doctor.specijalnost}</p>
                          {doctor.opis && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doctor.opis}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {doctor.ocjena && (
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span>{doctor.ocjena}</span>
                                {doctor.broj_ocjena && <span>({doctor.broj_ocjena})</span>}
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                            onClick={() => navigate(`/doktor/${doctor.slug}`)}
                          >
                            Vidi profil
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Trenutno nema dostupnih doktora u ovoj klinici.</p>
              )}
            </Card>

            {/* Guest Doctors Section */}
            {guestDoctors.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Gostujući specijalisti
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Specijalisti koji povremeno ordiniraju u našoj klinici
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  {guestDoctors.map(visit => (
                    <Card key={visit.id} className="p-4 border-primary/20">
                      <div className="flex gap-4">
                        {visit.doktor?.slika_profila ? (
                          <img 
                            src={visit.doktor.slika_profila} 
                            alt={`Dr. ${visit.doktor.ime} ${visit.doktor.prezime}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                            {visit.doktor?.ime?.[0]}{visit.doktor?.prezime?.[0]}
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold">Dr. {visit.doktor?.ime} {visit.doktor?.prezime}</h4>
                          <p className="text-sm text-muted-foreground">{visit.doktor?.specijalnost}</p>
                          <div className="flex items-center gap-2 mt-2 text-sm">
                            <Calendar className="h-3 w-3 text-primary" />
                            <span className="font-medium">{new Date(visit.datum).toLocaleDateString('bs-BA', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{visit.vrijeme_od} - {visit.vrijeme_do}</span>
                          </div>
                          {visit.doktor?.ocjena && (
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span>{visit.doktor.ocjena}</span>
                            </div>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-3 w-full"
                            onClick={() => navigate(`/doktor/${visit.doktor?.slug}`)}
                          >
                            Zakaži termin
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Kontakt informacije</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium">Adresa</p>
                    <p className="text-muted-foreground">{clinic.adresa}</p>
                    <p className="text-muted-foreground">{clinic.grad}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Telefon</p>
                    <p className="text-muted-foreground">{clinic.telefon}</p>
                  </div>
                </div>

                {clinic.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground">{clinic.contact_email}</p>
                    </div>
                  </div>
                )}

                {clinic.google_maps_link && (
                  <div className="flex items-center gap-3">
                    <a 
                      href={clinic.google_maps_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <MapPin className="w-5 h-5" />
                      Otvori navigaciju
                    </a>
                  </div>
                )}

                {clinic.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a 
                        href={clinic.website.startsWith('http') ? clinic.website : `https://${clinic.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {clinic.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {clinic.radno_vrijeme && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Radno vrijeme
                </h2>
                {renderWorkingHours(clinic.radno_vrijeme)}
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lokacija na mapi
              </h2>
              {clinic.latitude && clinic.longitude ? (
                <>
                  <MapView
                    latitude={clinic.latitude}
                    longitude={clinic.longitude}
                    markerLabel={clinic.naziv}
                    className="h-[400px]"
                  />
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {clinic.adresa}, {clinic.grad}
                    </p>
                    {clinic.google_maps_link && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(clinic.google_maps_link, '_blank')}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Vodi me do...
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
                  <p className="text-muted-foreground">Lokacija nije dostupna</p>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Rezervišite termin</h2>
              <p className="text-muted-foreground mb-4">
                Kontaktirajte nas za zakazivanje termina ili izaberite doktora iz liste.
              </p>
              <div className="space-y-2">
                <Button variant="medical" className="w-full" onClick={() => {
                  window.location.href = `tel:${clinic.telefon}`;
                }}>
                  <Phone className="h-4 w-4 mr-2" />
                  Pozovite sada
                </Button>
                {clinic.contact_email && (
                  <Button variant="outline" className="w-full" onClick={() => {
                    window.location.href = `mailto:${clinic.contact_email}`;
                  }}>
                    <Mail className="h-4 w-4 mr-2" />
                    Pošaljite email
                  </Button>
                 )}
               </div>
             </Card>
           </div>
         </div>

         {/* Recenzije sekcija */}
         <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Recenzije ({recenzije.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recenzije.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Još nema recenzija. Budite prvi koji će ocijeniti!
                </p>
              ) : (
                <div className="space-y-4">
                  {recenzije.map((recenzija) => (
                    <ReviewCard
                      key={recenzija.id}
                      recenzija={recenzija}
                      onUpdate={() => clinic && fetchRecenzije(clinic.id)}
                      canRespond={user?.role === 'clinic' && user.email === clinic?.email}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
         </div>
       </div>
      </div>
      <Footer />

      {/* Image Lightbox */}
      {clinic && clinic.slike && clinic.slike.length > 0 && (
        <ImageLightbox
          images={clinic.slike}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
     </>
   );
}
