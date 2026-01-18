import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/MapView';
import { MapPin, Phone, Star, Calendar, CheckCircle, Clock, Mail, Building2, MessageSquare } from 'lucide-react';
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
}

export function DoctorTemplateCard({ 
  doctor, services, recenzije, ratingStats, onBookClick, onGuestBookClick, onBookService, isLoggedIn,
  guestVisits = [],
  onGuestVisitBook
}: DoctorTemplateProps) {
  const specijalnostSlug = doctor.specijalnost?.toLowerCase().replace(/\s+/g, '-') || '';
  
  // Remove seconds from time string (08:00:00 -> 08:00)
  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Main Card */}
        <Card className="overflow-hidden shadow-xl mb-8">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white/20 shadow-xl">
                <AvatarImage src={doctor.slika_profila} />
                <AvatarFallback className="text-3xl bg-primary">
                  {doctor.ime?.[0]}{doctor.prezime?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  Dr. {doctor.ime} {doctor.prezime}
                </h1>
                <p className="text-white/80 text-lg mb-3">{doctor.specijalnost}</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {doctor.prihvata_online && (
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online booking
                    </Badge>
                  )}
                  {doctor.ocjena > 0 && (
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      {formatRating(doctor.ocjena)} ({doctor.broj_ocjena} recenzija)
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-white text-slate-800 hover:bg-gray-100 shadow-lg"
                    onClick={isLoggedIn ? onBookClick : onGuestBookClick}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Zakaži
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Link to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}>
                      <MessageSquare className="mr-2 h-5 w-5" />
                      Pitanje
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-0">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
              <div className="p-4 md:p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <MapPin className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Lokacija</p>
                  <p className="font-semibold truncate">{doctor.grad}</p>
                  <p className="text-sm text-gray-600 truncate">{doctor.lokacija}</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Phone className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefon</p>
                  <p className="font-semibold">{doctor.telefon || 'N/A'}</p>
                </div>
              </div>
              
              <div className="p-4 md:p-6 flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full shrink-0">
                  <Mail className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-semibold truncate">{doctor.email || 'N/A'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* About */}
          {doctor.opis && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800">O doktoru</h2>
                <p className="text-gray-600 leading-relaxed">{doctor.opis}</p>
              </CardContent>
            </Card>
          )}

          {/* Working Hours */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Radno vrijeme
              </h2>
              <div className="space-y-2">
                {doctor.radno_vrijeme && Object.entries(doctor.radno_vrijeme).map(([day, hours]: [string, any]) => (
                  <div key={day} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-600">{day}</span>
                    <span className={!hours?.closed ? 'font-medium' : 'text-gray-400'}>
                      {!hours?.closed && hours?.open && hours?.close 
                        ? `${hours.open} - ${hours.close}` 
                        : 'Zatvoreno'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clinic */}
          {doctor.klinika && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Klinika
                </h2>
                <Link to={`/klinika/${doctor.klinika.slug}`} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <h3 className="font-semibold">{doctor.klinika.naziv}</h3>
                  <p className="text-sm text-gray-600">{doctor.klinika.adresa}</p>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Guest Visits */}
          {guestVisits.length > 0 && (
            <Card className="md:col-span-2 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Gostovanja u klinikama
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {guestVisits.map((visit) => (
                    <div key={visit.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Link to={`/klinika/${visit.klinika.slug}`} className="font-semibold text-blue-700 hover:underline">
                          {visit.klinika.naziv}
                        </Link>
                        {!visit.prihvata_online_rezervacije && (
                          <Badge variant="secondary" className="text-xs">Samo telefon</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(visit.vrijeme_od)} - {formatTime(visit.vrijeme_do)}
                        </span>
                      </div>
                      {visit.prihvata_online_rezervacije ? (
                        <Button size="sm" className="w-full" onClick={() => onGuestVisitBook?.(visit)}>
                          <Calendar className="h-4 w-4 mr-1" />
                          Zakaži termin
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full" onClick={() => visit.klinika.telefon && window.open(`tel:${visit.klinika.telefon}`)}>
                          <Phone className="h-4 w-4 mr-1" />
                          {visit.klinika.telefon || 'Pozovi kliniku'}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Map */}
          {(doctor.latitude && doctor.longitude) && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Lokacija
                </h2>
                <div className="rounded-lg overflow-hidden h-48">
                  <MapView 
                    latitude={doctor.latitude} 
                    longitude={doctor.longitude}
                    markerLabel={`Dr. ${doctor.ime} ${doctor.prezime}`}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Services */}
          {(doctor.kategorijeUsluga?.length > 0 || services.length > 0) && (
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">Usluge i cijene</h2>
                
                {/* Services grouped by categories */}
                {doctor.kategorijeUsluga && doctor.kategorijeUsluga.length > 0 && (
                  <div className="space-y-6">
                    {doctor.kategorijeUsluga.map((kategorija: any) => (
                      <div key={kategorija.id}>
                        <div className="mb-3">
                          <h3 className="font-semibold text-base text-gray-700">{kategorija.naziv}</h3>
                          {kategorija.opis && <p className="text-sm text-gray-500">{kategorija.opis}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {kategorija.usluge?.map((service: any) => (
                            <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-gray-700 font-medium">{service.naziv}</span>
                                <div className="text-right">
                                  {service.cijena_popust ? (
                                    <div className="flex flex-col items-end">
                                      <span className="text-gray-400 line-through text-xs">{service.cijena} KM</span>
                                      <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700">{service.cijena_popust} KM</Badge>
                                    </div>
                                  ) : (
                                    <Badge variant="secondary" className="font-semibold">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</Badge>
                                  )}
                                </div>
                              </div>
                              {service.opis && (
                                <p className="text-xs text-gray-500 mt-1">{service.opis}</p>
                              )}
                              <div className="flex justify-between items-center mt-2">
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
                      <h3 className="font-semibold text-base text-gray-700 mb-3">Ostale usluge</h3>
                    )}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.filter((s: any) => !s.kategorija_id).map((service: any) => (
                        <div key={service.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-gray-700 font-medium">{service.naziv}</span>
                            <div className="text-right">
                              {service.cijena_popust ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-gray-400 line-through text-xs">{service.cijena} KM</span>
                                  <Badge variant="secondary" className="font-semibold bg-green-100 text-green-700">{service.cijena_popust} KM</Badge>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="font-semibold">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</Badge>
                              )}
                            </div>
                          </div>
                          {service.opis && (
                            <p className="text-xs text-gray-500 mt-1">{service.opis}</p>
                          )}
                          <div className="flex justify-between items-center mt-2">
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
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Recenzije</h2>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-lg">{ratingStats?.average?.toFixed(1)}</span>
                    <span className="text-gray-500">({ratingStats?.total} recenzija)</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {recenzije.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < r.ocjena ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <p className="text-gray-600 text-sm line-clamp-3">{r.komentar}</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString('bs-BA')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

