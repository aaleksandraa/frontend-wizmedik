import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/MapView';
import { MapPin, Phone, Star, Clock, Calendar, CheckCircle, Award, Building2, MessageSquare, Mail } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

import type { GuestVisit } from './index';

interface DoctorTemplateProps {
  doctor: any;
  services: any[];
  recenzije: any[];
  ratingStats: any;
  onBookClick: () => void;
  onGuestBookClick: () => void;
  onBookService?: (serviceId: number) => void;
  onGuestVisitBook?: (visit: GuestVisit) => void;
  guestVisits?: GuestVisit[];
  isLoggedIn: boolean;
  coverType?: 'gradient' | 'image';
  coverValue?: string;
}

export function DoctorTemplateModern({ 
  doctor, services, recenzije, ratingStats, onBookClick, onGuestBookClick, onBookService, isLoggedIn,
  coverType = 'gradient',
  coverValue = 'from-primary via-primary/90 to-primary/80',
  guestVisits = [],
  onGuestVisitBook
}: DoctorTemplateProps) {
  const specijalnostSlug = doctor.specijalnost?.toLowerCase().replace(/\s+/g, '-') || '';
  const publicEmail = doctor.public_email || doctor.email;
  
  // Remove seconds from time string (08:00:00 -> 08:00)
  const formatTime = (time: string) => time.substring(0, 5);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className={`text-white ${coverType === 'gradient' ? `bg-gradient-to-br ${coverValue}` : ''}`}
        style={coverType === 'image' && coverValue ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${coverValue})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {}}
      >
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-2xl">
              <AvatarImage src={doctor.slika_profila} />
              <AvatarFallback className="text-4xl bg-white/20">
                {doctor.ime?.[0]}{doctor.prezime?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2 flex-wrap">
                <Badge className="bg-white/20 text-white border-0">
                  {doctor.specijalnost}
                </Badge>
                {doctor.prihvata_online && (
                  <Badge className="bg-green-500 text-white border-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Online booking
                  </Badge>
                )}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold mb-2">
                Dr. {doctor.ime} {doctor.prezime}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start gap-4 text-white/90 mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {doctor.lokacija}, {doctor.grad}
                </span>
                {doctor.ocjena > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {formatRating(doctor.ocjena)} ({doctor.broj_ocjena})
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start flex-wrap">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="shadow-lg"
                  onClick={isLoggedIn ? onBookClick : onGuestBookClick}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Zakaži Termin
                </Button>
                <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20">
                  <Link to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Postavi Pitanje
                  </Link>
                </Button>
                {doctor.telefon && (
                  <Button asChild size="lg" variant="outline" className="bg-white/10 border-white/30 hover:bg-white/20">
                    <a href={`tel:${doctor.telefon}`}>
                      <Phone className="mr-2 h-5 w-5" />
                      {doctor.telefon}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {doctor.opis && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary" />
                    O doktoru
                  </h2>
                  <p className="text-gray-600 leading-relaxed">{doctor.opis}</p>
                </CardContent>
              </Card>
            )}

            {/* Clinic */}
            {doctor.klinika && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Klinika
                  </h2>
                  <Link to={`/klinika/${doctor.klinika.slug}`} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    {doctor.klinika.slika && (
                      <img src={doctor.klinika.slika} alt={doctor.klinika.naziv} className="w-16 h-16 rounded-lg object-cover" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.klinika.naziv}</h3>
                      <p className="text-sm text-gray-600">{doctor.klinika.adresa}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Guest Visits */}
            {guestVisits.length > 0 && (
              <Card className="border-l-4 border-l-cyan-500">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-cyan-600" />
                    Gostovanja u klinikama
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Dr. {doctor.ime} {doctor.prezime} gostuje u sljedećim klinikama.
                  </p>
                  <div className="space-y-3">
                    {guestVisits.map((visit) => (
                      <div key={visit.id} className="p-4 bg-cyan-50 rounded-lg border border-cyan-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <Link to={`/klinika/${visit.klinika.slug}`} className="font-semibold text-cyan-700 hover:underline">
                                {visit.klinika.naziv}
                              </Link>
                              <Badge variant="outline" className="text-xs">Gostovanje</Badge>
                              {!visit.prihvata_online_rezervacije && (
                                <Badge variant="secondary" className="text-xs">Samo telefon</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { weekday: 'short', day: 'numeric', month: 'short' })}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatTime(visit.vrijeme_od)} - {formatTime(visit.vrijeme_do)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <MapPin className="h-4 w-4" />
                              {visit.klinika.lokacija}, {visit.klinika.grad}
                            </div>
                          </div>
                          {visit.prihvata_online_rezervacije ? (
                            <Button size="sm" onClick={() => onGuestVisitBook?.(visit)}>
                              <Calendar className="h-4 w-4 mr-1" />
                              Zakaži
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => visit.klinika.telefon && window.open(`tel:${visit.klinika.telefon}`)}>
                              <Phone className="h-4 w-4 mr-1" />
                              {visit.klinika.telefon || 'Pozovi'}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location Map */}
            {(doctor.latitude && doctor.longitude) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    Lokacija
                  </h2>
                  <div className="rounded-lg overflow-hidden h-64">
                    <MapView 
                      latitude={doctor.latitude} 
                      longitude={doctor.longitude}
                      markerLabel={`Dr. ${doctor.ime} ${doctor.prezime}`}
                    />
                  </div>
                  <p className="mt-3 text-gray-600">{doctor.lokacija}, {doctor.grad}</p>
                  {doctor.google_maps_link && (
                    <Button asChild variant="outline" className="mt-3">
                      <a href={doctor.google_maps_link} target="_blank" rel="noopener noreferrer">
                        Otvori u Google Maps
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Services */}
            {(doctor.kategorijeUsluga?.length > 0 || services.length > 0) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Usluge</h2>
                  
                  {/* Services grouped by categories */}
                  {doctor.kategorijeUsluga && doctor.kategorijeUsluga.length > 0 && (
                    <div className="space-y-6">
                      {doctor.kategorijeUsluga.map((kategorija: any) => (
                        <div key={kategorija.id}>
                          <div className="mb-3">
                            <h3 className="font-semibold text-lg">{kategorija.naziv}</h3>
                            {kategorija.opis && <p className="text-sm text-gray-500">{kategorija.opis}</p>}
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {kategorija.usluge?.map((service: any) => (
                              <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-medium">{service.naziv}</span>
                                  <div className="text-right">
                                    {service.cijena_popust ? (
                                      <>
                                        <span className="text-gray-400 line-through text-sm mr-2">{service.cijena} KM</span>
                                        <span className="text-green-600 font-semibold">{service.cijena_popust} KM</span>
                                      </>
                                    ) : (
                                      <span className="text-primary font-semibold">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</span>
                                    )}
                                  </div>
                                </div>
                                {service.opis && (
                                  <p className="text-sm text-gray-500 mt-1">{service.opis}</p>
                                )}
                                <div className="flex justify-between items-center mt-3">
                                  <span className="text-xs text-gray-400">{service.trajanje_minuti} min</span>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => onBookService?.(service.id)}
                                    className="text-xs"
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Rezerviši
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Uncategorized services */}
                  {services.filter((s: any) => !s.kategorija_id).length > 0 && (
                    <div className={doctor.kategorijeUsluga?.length > 0 ? 'mt-6' : ''}>
                      {doctor.kategorijeUsluga?.length > 0 && (
                        <h3 className="font-semibold text-lg mb-3">Ostale usluge</h3>
                      )}
                      <div className="grid sm:grid-cols-2 gap-3">
                        {services.filter((s: any) => !s.kategorija_id).map((service: any) => (
                          <div key={service.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{service.naziv}</span>
                              <div className="text-right">
                                {service.cijena_popust ? (
                                  <>
                                    <span className="text-gray-400 line-through text-sm mr-2">{service.cijena} KM</span>
                                    <span className="text-green-600 font-semibold">{service.cijena_popust} KM</span>
                                  </>
                                ) : (
                                  <span className="text-primary font-semibold">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</span>
                                )}
                              </div>
                            </div>
                            {service.opis && (
                              <p className="text-sm text-gray-500 mt-1">{service.opis}</p>
                            )}
                            <div className="flex justify-between items-center mt-3">
                              <span className="text-xs text-gray-400">{service.trajanje_minuti} min</span>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => onBookService?.(service.id)}
                                className="text-xs"
                              >
                                <Calendar className="w-3 h-3 mr-1" />
                                Rezerviši
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {recenzije.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Recenzije ({ratingStats?.total || 0})</h2>
                  <div className="space-y-4">
                    {recenzije.slice(0, 5).map((r: any) => (
                      <div key={r.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < r.ocjena ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('bs-BA')}</span>
                        </div>
                        <p className="text-gray-600">{r.komentar}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Radno vrijeme
                </h3>
                {doctor.radno_vrijeme && Object.entries(doctor.radno_vrijeme).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between py-2 border-b last:border-0 text-sm">
                    <span className="capitalize">{day}</span>
                    <span className={!hours?.closed ? 'text-gray-900' : 'text-gray-400'}>
                      {!hours?.closed && hours?.open && hours?.close 
                        ? `${hours.open} - ${hours.close}` 
                        : 'Zatvoreno'}
                    </span>
                  </div>
                ))}
                
                <div className="space-y-3 mt-6">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={isLoggedIn ? onBookClick : onGuestBookClick}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Zakaži Termin
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Postavi Pitanje
                    </Link>
                  </Button>
                </div>

                {/* Contact Info */}
                <div className="mt-6 pt-6 border-t space-y-3">
                  {doctor.telefon && (
                    <a href={`tel:${doctor.telefon}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                      <Phone className="h-4 w-4" />
                      {doctor.telefon}
                    </a>
                  )}
                  {publicEmail && (
                    <a href={`mailto:${publicEmail}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
                      <Mail className="h-4 w-4" />
                      {publicEmail}
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

