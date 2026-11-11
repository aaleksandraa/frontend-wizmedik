import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { LocationMapCard } from '@/components/LocationMapCard';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ReviewCard } from '@/components/ReviewCard';
import { Recenzija } from '@/services/reviewsAPI';
import { getDaySchedule, isClosedDay, type WorkingHours } from '@/lib/booking-slots';
import { getWorkingHoursRows } from '@/lib/working-hours';
import { fixImageUrl } from '@/utils/imageUrl';
import { Clock, Globe, Mail, MapPin, Phone, Star, UserPlus } from 'lucide-react';

interface Specialty {
  id?: number;
  naziv: string;
  slug: string;
}

interface ClinicDoctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost?: string;
  opis?: string;
  slika_profila?: string;
  ocjena?: number;
  broj_ocjena?: number;
  slug?: string;
}

interface ClinicData {
  id: number;
  naziv: string;
  opis?: string;
  adresa?: string;
  grad?: string;
  telefon?: string;
  email?: string;
  contact_email?: string;
  website?: string;
  google_maps_link?: string;
  slike?: string[];
  radno_vrijeme?: WorkingHours | string | null;
  latitude?: number;
  longitude?: number;
}

interface GuestVisitCard {
  id: number;
  datum?: string;
  vrijeme_od?: string;
  vrijeme_do?: string;
  doktor?: {
    ime?: string;
    prezime?: string;
    specijalnost?: string;
    slika_profila?: string;
    ocjena?: number;
    slug?: string;
  };
}

function openStatus(radnoVrijeme: WorkingHours | string | null | undefined): string | null {
  if (!radnoVrijeme || typeof radnoVrijeme !== 'object') return null;
  const now = new Date();
  const todayHours = getDaySchedule(radnoVrijeme, now);
  if (isClosedDay(todayHours)) return 'Zatvoreno';
  const open = String(todayHours?.open || todayHours?.od || '').slice(0, 5);
  const close = String(todayHours?.close || todayHours?.do || '').slice(0, 5);
  if (!open || !close) return 'Zatvoreno';
  const currentTime = now.getHours() * 100 + now.getMinutes();
  const openTime = parseInt(open.replace(':', ''), 10);
  const closeTime = parseInt(close.replace(':', ''), 10);
  if (Number.isNaN(openTime) || Number.isNaN(closeTime)) return 'Nepoznato';
  return currentTime >= openTime && currentTime <= closeTime ? 'Otvoreno' : 'Zatvoreno';
}

function telHref(phone?: string) {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : undefined;
}

export function ClinicProfilePaper({
  clinic,
  doctors,
  specialties,
  guests,
  recenzije,
  canRespond,
  onReviewsUpdate,
  onTrack,
}: {
  clinic: ClinicData;
  doctors: ClinicDoctor[];
  specialties: Specialty[];
  guests: GuestVisitCard[];
  recenzije: Recenzija[];
  canRespond: boolean;
  onReviewsUpdate: () => void;
  onTrack: (channel: 'phone' | 'email' | 'map' | 'website', placement: string) => void;
}) {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);

  const gallery = useMemo(
    () => (Array.isArray(clinic.slike) ? clinic.slike : [])
      .map((image) => fixImageUrl(image) || image)
      .filter(Boolean),
    [clinic.slike]
  );
  const visibleDoctors = specialtyFilter
    ? doctors.filter((doctor) => doctor.specijalnost === specialtyFilter)
    : doctors;
  const status = openStatus(clinic.radno_vrijeme);
  const hourRows = clinic.radno_vrijeme && typeof clinic.radno_vrijeme === 'object'
    ? getWorkingHoursRows(clinic.radno_vrijeme)
    : [];
  const todayName = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'][new Date().getDay()];
  const email = clinic.contact_email || clinic.email;
  const phoneHref = telHref(clinic.telefon);
  const mapsHref = clinic.google_maps_link
    || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinic.naziv}, ${clinic.adresa || ''}, ${clinic.grad || ''}`)}`;
  const websiteHref = clinic.website
    ? (clinic.website.startsWith('http') ? clinic.website : `https://${clinic.website}`)
    : '';

  const jumps = [
    ...(clinic.opis ? [{ href: '#o-klinici', label: 'O klinici' }] : []),
    { href: '#doktori', label: 'Naši doktori' },
    ...(guests.length > 0 ? [{ href: '#gosti', label: 'Gostujući specijalisti' }] : []),
    ...(recenzije.length > 0 ? [{ href: '#recenzije', label: 'Recenzije' }] : []),
    { href: '#kontakt', label: 'Kontakt informacije' },
    ...(hourRows.length > 0 ? [{ href: '#radno-vrijeme', label: 'Radno vrijeme' }] : []),
    { href: '#lokacija', label: 'Lokacija' },
  ];
  const mobileJumps = [
    { href: '#doktori', label: 'Doktori' },
    { href: '#kontakt', label: 'Kontakt' },
    { href: '#lokacija', label: 'Lokacija' },
    ...(recenzije.length > 0 ? [{ href: '#recenzije', label: 'Recenzije' }] : []),
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background pb-28 text-[#1c2430] md:pb-16">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <nav className="mb-5 text-sm text-[#6b7280]" aria-label="Putanja">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-[#0e7490]">Početna</Link></li>
              <li aria-hidden>/</li>
              <li><Link to="/klinike" className="hover:text-[#0e7490]">Klinike</Link></li>
              <li aria-hidden>/</li>
              <li className="text-[#1c2430]">{clinic.naziv}</li>
            </ol>
          </nav>

          <section className="rounded-[28px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(28,36,48,0.04)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {gallery[0] && (
                <img
                  src={gallery[0]}
                  alt={clinic.naziv}
                  className="h-28 w-28 shrink-0 rounded-2xl border border-[#d7efe8] object-cover md:h-36 md:w-36"
                />
              )}
              <div className="min-w-0 flex-1">
                {clinic.grad && (
                  <p className="text-sm font-semibold tracking-wide text-[#0e7490]">{clinic.grad}</p>
                )}
                <h1 className="mt-1 font-serif text-4xl leading-none tracking-tight text-[#17202a] md:text-5xl">
                  {clinic.naziv}
                </h1>
                {specialties.length > 0 && (
                  <p className="mt-3 text-[15px] leading-relaxed text-[#4b5563]">
                    {specialties.map((specialty) => specialty.naziv).join(' · ')}
                  </p>
                )}
                {status && (
                  <p className={`mt-4 inline-flex items-center gap-2 text-sm ${status === 'Otvoreno' ? 'text-[#0e7490]' : 'text-[#6b7280]'}`}>
                    <Clock className="h-4 w-4" />
                    {status}
                  </p>
                )}
              </div>
              <div className="flex w-full flex-col gap-3 border-t border-border pt-5 md:w-64 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <h2 className="font-serif text-2xl tracking-tight">Rezervišite termin</h2>
                <p className="text-sm leading-6 text-[#5c6770]">
                  Kontaktirajte nas za zakazivanje termina ili izaberite doktora iz liste.
                </p>
                {phoneHref && (
                  <a
                    href={phoneHref}
                    onClick={() => onTrack('phone', 'profile_hero')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0e7490] text-sm font-medium text-white hover:bg-[#0c657d]"
                  >
                    <Phone className="h-4 w-4" />
                    Pozovite sada
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    onClick={() => onTrack('email', 'profile_hero')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                  >
                    <Mail className="h-4 w-4" />
                    Pošaljite email
                  </a>
                )}
              </div>
            </div>
          </section>

          <nav
            className="sticky top-16 z-30 -mx-4 mt-6 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:overflow-visible md:bg-transparent md:px-0 md:py-0"
            aria-label="Dijelovi profila"
          >
            <ul className="flex w-max gap-2 md:hidden">
              {mobileJumps.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-full border border-border bg-white px-3 text-sm font-medium text-[#0e7490] hover:bg-[#f3faf8]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <ul className="hidden w-auto flex-wrap gap-2 md:flex">
              {jumps.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-full border border-border bg-white px-3 text-sm font-medium text-[#0e7490] hover:bg-[#f3faf8]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
            <div className="contents md:block md:space-y-6">
              {gallery.length > 0 && (
                <section id="galerija" className="order-1 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8" aria-label="Slike klinike">
                  <button
                    type="button"
                    className="block w-full overflow-hidden rounded-2xl"
                    onClick={() => {
                      setLightboxIndex(selectedImage);
                      setLightboxOpen(true);
                    }}
                  >
                    <img
                      src={gallery[selectedImage] || gallery[0]}
                      alt={`${clinic.naziv} ${selectedImage + 1}`}
                      className="aspect-video w-full object-cover"
                    />
                  </button>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {gallery.map((image, index) => (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setSelectedImage(index)}
                        className={`overflow-hidden rounded-xl border-2 ${
                          selectedImage === index ? 'border-[#0e7490]' : 'border-transparent'
                        }`}
                      >
                        <img src={image} alt={`${clinic.naziv} thumbnail ${index + 1}`} className="h-16 w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {clinic.opis && (
                <section id="o-klinici" className="order-2 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <h2 className="font-serif text-3xl tracking-tight">O klinici</h2>
                  <p className="mt-5 max-w-2xl whitespace-pre-line text-[15px] leading-7 text-[#3f4a56]">{clinic.opis}</p>
                </section>
              )}

              <section id="doktori" className="order-3 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                <h2 className="font-serif text-3xl tracking-tight">Naši doktori</h2>
                {specialties.length > 0 && (
                  <div className="mt-5">
                    <h3 className="text-sm font-medium text-[#6b7280]">Specijalnosti klinike</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {specialties.map((specialty) => {
                        const active = specialtyFilter === specialty.naziv;
                        return (
                          <button
                            key={`${specialty.slug}-${specialty.naziv}`}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setSpecialtyFilter((current) => (current === specialty.naziv ? null : specialty.naziv))}
                            className={`inline-flex h-8 items-center rounded-full px-3 text-sm font-medium ${
                              active
                                ? 'bg-[#0e7490] text-white'
                                : 'bg-[#f3faf8] text-[#0e7490] hover:bg-[#0e7490] hover:text-white'
                            }`}
                          >
                            {specialty.naziv}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {visibleDoctors.length > 0 ? (
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">
                    {visibleDoctors.map((doctor) => {
                      const photo = fixImageUrl(doctor.slika_profila) || doctor.slika_profila;
                      return (
                        <li key={doctor.id} className="rounded-2xl border border-border p-4">
                          <div className="flex gap-4">
                            {photo ? (
                              <img
                                src={photo}
                                alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                                className="h-16 w-16 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3faf8] font-serif text-lg text-[#0e7490]">
                                {doctor.ime?.[0]}{doctor.prezime?.[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold">Dr. {doctor.ime} {doctor.prezime}</h4>
                              {doctor.specijalnost && <p className="text-sm text-[#6b7280]">{doctor.specijalnost}</p>}
                              {doctor.opis && <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">{doctor.opis}</p>}
                              {doctor.ocjena ? (
                                <p className="mt-2 flex items-center gap-1 text-sm">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span>{doctor.ocjena}</span>
                                  {doctor.broj_ocjena ? <span>({doctor.broj_ocjena})</span> : null}
                                </p>
                              ) : null}
                              {doctor.slug && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 w-full rounded-full"
                                  onClick={() => navigate(`/doktor/${doctor.slug}`)}
                                >
                                  Vidi profil
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-4 text-[#6b7280]">Trenutno nema dostupnih doktora u ovoj klinici.</p>
                )}
              </section>

              {guests.length > 0 && (
                <section id="gosti" className="order-5 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <h2 className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                    <UserPlus className="h-6 w-6 text-[#0e7490]" />
                    Gostujući specijalisti
                  </h2>
                  <p className="mt-3 text-sm text-[#6b7280]">
                    Specijalisti koji povremeno ordiniraju u našoj klinici
                  </p>
                  <ul className="mt-5 grid gap-4 md:grid-cols-2">
                    {guests.map((visit) => {
                      const photo = fixImageUrl(visit.doktor?.slika_profila) || visit.doktor?.slika_profila;
                      return (
                        <li key={visit.id} className="rounded-2xl border border-border p-4">
                          <div className="flex gap-4">
                            {photo ? (
                              <img src={photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3faf8] font-serif text-lg text-[#0e7490]">
                                {visit.doktor?.ime?.[0]}{visit.doktor?.prezime?.[0]}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold">Dr. {visit.doktor?.ime} {visit.doktor?.prezime}</h4>
                              <p className="text-sm text-[#6b7280]">{visit.doktor?.specijalnost}</p>
                              {visit.datum && (
                                <p className="mt-2 text-sm font-medium">
                                  {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                              )}
                              <p className="text-sm text-[#6b7280]">{String(visit.vrijeme_od || '').slice(0, 5)} - {String(visit.vrijeme_do || '').slice(0, 5)}</p>
                              {visit.doktor?.ocjena ? (
                                <p className="mt-1 flex items-center gap-1 text-sm">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span>{visit.doktor.ocjena}</span>
                                </p>
                              ) : null}
                              {visit.doktor?.slug && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-3 w-full rounded-full"
                                  onClick={() => navigate(`/doktor/${visit.doktor.slug}`)}
                                >
                                  Zakaži termin
                                </Button>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              <section id="recenzije" className="order-9 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                <h2 className="font-serif text-3xl tracking-tight">Recenzije ({recenzije.length})</h2>
                {recenzije.length === 0 ? (
                  <p className="py-8 text-center text-[#6b7280]">
                    Još nema recenzija. Budite prvi koji će ocijeniti!
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {recenzije.map((recenzija) => (
                      <ReviewCard
                        key={recenzija.id}
                        recenzija={recenzija}
                        onUpdate={onReviewsUpdate}
                        canRespond={canRespond}
                      />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="contents md:sticky md:top-24 md:block md:space-y-4">
              <section id="kontakt" className="order-4 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-medium">Kontakt informacije</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                    <div>
                      <dt className="font-medium">Adresa</dt>
                      {clinic.adresa && <dd className="text-[#6b7280]">{clinic.adresa}</dd>}
                      {clinic.grad && <dd className="text-[#6b7280]">{clinic.grad}</dd>}
                    </div>
                  </div>
                  {clinic.telefon && (
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                      <div>
                        <dt className="font-medium">Telefon</dt>
                        <dd className="text-[#6b7280]">{clinic.telefon}</dd>
                      </div>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-start gap-3">
                      <Mail className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                      <div>
                        <dt className="font-medium">Email</dt>
                        <dd className="text-[#6b7280]">{email}</dd>
                      </div>
                    </div>
                  )}
                  <div>
                    <a
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrack('map', 'profile_contact_info')}
                      className="inline-flex items-center gap-2 font-medium text-[#0e7490] hover:underline"
                    >
                      <MapPin className="h-4 w-4" />
                      Otvori navigaciju
                    </a>
                  </div>
                  {websiteHref && (
                    <div className="flex items-start gap-3">
                      <Globe className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                      <div>
                        <dt className="font-medium">Website</dt>
                        <dd>
                          <a
                            href={websiteHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onTrack('website', 'profile_contact_info')}
                            className="text-[#0e7490] hover:underline"
                          >
                            {clinic.website}
                          </a>
                        </dd>
                      </div>
                    </div>
                  )}
                </dl>
              </section>

              {hourRows.length > 0 && (
                <section id="radno-vrijeme" className="order-6 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                  <h2 className="flex items-center gap-2 font-medium">
                    <Clock className="h-4 w-4" />
                    Radno vrijeme
                  </h2>
                  <ul className="mt-3 space-y-1.5 text-sm">
                    {hourRows.map((row) => (
                      <li
                        key={row.day}
                        className={`flex items-center justify-between rounded-lg px-2 py-1 ${
                          row.label === todayName ? 'bg-[#f3faf8]' : ''
                        }`}
                      >
                        <span className="font-medium">{row.label}</span>
                        <span className={row.closed ? 'text-red-500' : 'text-green-600'}>{row.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div id="lokacija" className="order-7 scroll-mt-28 overflow-hidden rounded-[28px] border border-border bg-white">
                <LocationMapCard
                  naziv={clinic.naziv}
                  adresa={clinic.adresa || ''}
                  grad={clinic.grad || ''}
                  latitude={clinic.latitude}
                  longitude={clinic.longitude}
                  googleMapsLink={mapsHref}
                  markerColor="orange"
                  mapHeightClass="h-[220px]"
                  onDirectionsClick={() => onTrack('map', 'map_card')}
                />
              </div>

              <section id="rezervacija" className="order-8 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-medium">Rezervišite termin</h2>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                  Kontaktirajte nas za zakazivanje termina ili izaberite doktora iz liste.
                </p>
                <div className="mt-4 space-y-2">
                  {phoneHref && (
                    <a
                      href={phoneHref}
                      onClick={() => onTrack('phone', 'booking_card')}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0e7490] text-sm font-medium text-white hover:bg-[#0c657d]"
                    >
                      <Phone className="h-4 w-4" />
                      Pozovite sada
                    </a>
                  )}
                  {email && (
                    <a
                      href={`mailto:${email}`}
                      onClick={() => onTrack('email', 'booking_card')}
                      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                    >
                      <Mail className="h-4 w-4" />
                      Pošaljite email
                    </a>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      {(phoneHref || mapsHref) && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl gap-2">
            {phoneHref && (
              <a
                href={phoneHref}
                onClick={() => onTrack('phone', 'mobile_sticky_bar')}
                className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium"
              >
                Pozovite sada
              </a>
            )}
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack('map', 'mobile_sticky_bar')}
              className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[#0e7490] text-sm font-medium text-white"
            >
              Vodi me do lokacije
            </a>
          </div>
        </div>
      )}
      <Footer />
      {gallery.length > 0 && (
        <ImageLightbox
          images={gallery}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
