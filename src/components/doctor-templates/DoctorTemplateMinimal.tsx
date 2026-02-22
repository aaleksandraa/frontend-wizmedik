import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Navbar } from '@/components/Navbar';
import { MapView } from '@/components/MapView';
import { MapPin, Phone, Star, Calendar, CheckCircle, Building2, MessageSquare, Mail, Clock } from 'lucide-react';
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

export function DoctorTemplateMinimal({ 
  doctor, services, recenzije, ratingStats, onBookClick, onGuestBookClick, onBookService, isLoggedIn,
  guestVisits = [],
  onGuestVisitBook
}: DoctorTemplateProps) {
  const specijalnostSlug = doctor.specijalnost?.toLowerCase().replace(/\s+/g, '-') || '';
  const publicEmail = doctor.public_email || doctor.email;
  
  // Remove seconds from time string (08:00:00 -> 08:00)
  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Avatar className="h-24 w-24 mx-auto mb-6 border-2 border-gray-100">
            <AvatarImage src={doctor.slika_profila} />
            <AvatarFallback className="text-2xl bg-gray-100 text-gray-600">
              {doctor.ime?.[0]}{doctor.prezime?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
            Dr. {doctor.ime} {doctor.prezime}
          </h1>
          
          <p className="text-lg text-gray-500 mb-4">{doctor.specijalnost}</p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-6 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {doctor.lokacija}, {doctor.grad}
            </span>
            {doctor.ocjena > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {formatRating(doctor.ocjena)}
              </span>
            )}
            {doctor.prihvata_online && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              size="lg" 
              className="px-8"
              onClick={isLoggedIn ? onBookClick : onGuestBookClick}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Zakaži termin
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}>
                <MessageSquare className="mr-2 h-5 w-5" />
                Postavi pitanje
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-10" />

        {/* About */}
        {doctor.opis && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">O meni</h2>
            <p className="text-gray-600 leading-relaxed">{doctor.opis}</p>
          </section>
        )}

        {/* Clinic */}
        {doctor.klinika && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Klinika</h2>
            <Link to={`/klinika/${doctor.klinika.slug}`} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
              <Building2 className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{doctor.klinika.naziv}</p>
                <p className="text-sm text-gray-500">{doctor.klinika.adresa}</p>
              </div>
            </Link>
          </section>
        )}

        {/* Guest Visits */}
        {guestVisits.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Gostovanja u klinikama</h2>
            <div className="space-y-3">
              {guestVisits.map((visit) => (
                <div key={visit.id} className="p-4 border border-cyan-100 bg-cyan-50/50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Link to={`/klinika/${visit.klinika.slug}`} className="font-medium text-cyan-700 hover:underline">
                          {visit.klinika.naziv}
                        </Link>
                        {!visit.prihvata_online_rezervacije && (
                          <Badge variant="secondary" className="text-xs">Samo telefon</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(visit.vrijeme_od)} - {formatTime(visit.vrijeme_do)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{visit.klinika.lokacija}, {visit.klinika.grad}</p>
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
          </section>
        )}

        {/* Contact */}
        <section className="mb-10">
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Kontakt</h2>
          <div className="space-y-3">
            {doctor.telefon && (
              <a href={`tel:${doctor.telefon}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{doctor.telefon}</span>
              </a>
            )}
            {publicEmail && (
              <a href={`mailto:${publicEmail}`} className="flex items-center gap-3 text-gray-600 hover:text-primary">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{publicEmail}</span>
              </a>
            )}
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400" />
              <span>{doctor.lokacija}, {doctor.grad}</span>
            </div>
          </div>
        </section>

        {/* Map */}
        {(doctor.latitude && doctor.longitude) && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Lokacija</h2>
            <div className="rounded-lg overflow-hidden h-48 border">
              <MapView 
                latitude={doctor.latitude} 
                longitude={doctor.longitude}
                markerLabel={`Dr. ${doctor.ime} ${doctor.prezime}`}
              />
            </div>
            {doctor.google_maps_link && (
              <a href={doctor.google_maps_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline mt-2 inline-block">
                Otvori u Google Maps →
              </a>
            )}
          </section>
        )}

        {/* Services */}
        {(doctor.kategorijeUsluga?.length > 0 || services.length > 0) && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Usluge</h2>
            
            {/* Services grouped by categories */}
            {doctor.kategorijeUsluga && doctor.kategorijeUsluga.length > 0 && (
              <div className="space-y-6">
                {doctor.kategorijeUsluga.map((kategorija: any) => (
                  <div key={kategorija.id}>
                    <div className="mb-3">
                      <h3 className="font-semibold text-gray-700">{kategorija.naziv}</h3>
                      {kategorija.opis && <p className="text-sm text-gray-500">{kategorija.opis}</p>}
                    </div>
                    <div className="space-y-4">
                      {kategorija.usluge?.map((service: any) => (
                        <div key={service.id} className="py-3 border-b border-gray-100">
                          <div className="flex justify-between items-start">
                            <span className="text-gray-700 font-medium">{service.naziv}</span>
                            <div className="text-right">
                              {service.cijena_popust ? (
                                <>
                                  <span className="text-gray-400 line-through text-sm mr-2">{service.cijena} KM</span>
                                  <span className="text-green-600 font-medium">{service.cijena_popust} KM</span>
                                </>
                              ) : (
                                <span className="text-gray-900 font-medium">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</span>
                              )}
                            </div>
                          </div>
                          {service.opis && (
                            <p className="text-sm text-gray-500 mt-1">{service.opis}</p>
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
                  <h3 className="font-semibold text-gray-700 mb-3">Ostale usluge</h3>
                )}
                <div className="space-y-4">
                  {services.filter((s: any) => !s.kategorija_id).map((service: any) => (
                    <div key={service.id} className="py-3 border-b border-gray-100">
                      <div className="flex justify-between items-start">
                        <span className="text-gray-700 font-medium">{service.naziv}</span>
                        <div className="text-right">
                          {service.cijena_popust ? (
                            <>
                              <span className="text-gray-400 line-through text-sm mr-2">{service.cijena} KM</span>
                              <span className="text-green-600 font-medium">{service.cijena_popust} KM</span>
                            </>
                          ) : (
                            <span className="text-gray-900 font-medium">{service.cijena ? `${service.cijena} KM` : 'Na upit'}</span>
                          )}
                        </div>
                      </div>
                      {service.opis && (
                        <p className="text-sm text-gray-500 mt-1">{service.opis}</p>
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
          </section>
        )}

        {/* Working Hours */}
        {doctor.radno_vrijeme && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">Radno vrijeme</h2>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(doctor.radno_vrijeme).map(([day, hours]: [string, any]) => (
                <div key={day} className="flex justify-between text-sm py-1">
                  <span className="capitalize text-gray-500">{day}</span>
                  <span className={!hours?.closed ? 'text-gray-700' : 'text-gray-400'}>
                    {!hours?.closed && hours?.open && hours?.close 
                      ? `${hours.open} - ${hours.close}` 
                      : 'Zatvoreno'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {recenzije.length > 0 && (
          <section className="mb-10">
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Recenzije ({ratingStats?.total || 0})
            </h2>
            <div className="space-y-6">
              {recenzije.slice(0, 3).map((r: any) => (
                <div key={r.id}>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.ocjena ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">
                      {new Date(r.created_at).toLocaleDateString('bs-BA')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{r.komentar}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <Separator className="my-10" />

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-500 mb-4">Imate pitanja ili želite zakazati termin?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              size="lg"
              onClick={isLoggedIn ? onBookClick : onGuestBookClick}
            >
              Zakaži termin
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to={`/postavi-pitanje?specijalnost=${specijalnostSlug}`}>
                Postavi pitanje
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

