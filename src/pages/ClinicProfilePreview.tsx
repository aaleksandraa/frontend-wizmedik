import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { LocationMapCard } from '@/components/LocationMapCard';
import { ImageLightbox } from '@/components/ImageLightbox';
import { ReviewCard } from '@/components/ReviewCard';
import { Recenzija } from '@/services/reviewsAPI';
import { getDaySchedule, isClosedDay } from '@/lib/booking-slots';
import { getWorkingHoursRows } from '@/lib/working-hours';
import { Clock, Globe, Mail, MapPin, Phone, Star, UserPlus } from 'lucide-react';

const PHONE = '033 210 440';
const EMAIL = 'info@poliklinika-medica.ba';
const WEBSITE = 'www.poliklinika-medica.ba';
const ADDRESS = 'Zmaja od Bosne 7';
const CITY = 'Sarajevo';
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Poliklinika%20Medica%20Sarajevo';

function swatch(label: string, fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="640"><rect width="100%" height="100%" fill="${fill}"/><text x="50%" y="52%" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#0e7490">${label}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const gallery = [
  swatch('Ulaz', '#e7f4f2'),
  swatch('Čekaonica', '#f3f6ea'),
  swatch('Ordinacija', '#eef3f8'),
  swatch('Hodnik', '#f7f1e8'),
];

const hours = {
  ponedeljak: { open: '08:00', close: '16:00' },
  utorak: { open: '08:00', close: '16:00' },
  srijeda: { open: '08:00', close: '16:00' },
  cetvrtak: { open: '08:00', close: '16:00' },
  petak: { open: '08:00', close: '16:00' },
  subota: { open: '09:00', close: '13:00' },
  nedjelja: { closed: true },
};

const specialties = [
  { naziv: 'Kardiologija', slug: 'kardiologija' },
  { naziv: 'Interna medicina', slug: 'interna-medicina' },
];

const doctors = [
  {
    id: 1,
    ime: 'Lejla',
    prezime: 'Hadžić',
    specijalnost: 'Kardiologija',
    opis: 'Prevencija srčanih bolesti, ultrazvuk srca i praćenje povišenog krvnog pritiska.',
    slika: swatch('LH', '#f3faf8'),
    ocjena: 4.9,
    broj_ocjena: 86,
  },
  {
    id: 2,
    ime: 'Amar',
    prezime: 'Begić',
    specijalnost: 'Interna medicina',
    opis: 'Opći internistički pregled i tumačenje laboratorijskih nalaza.',
    slika: '',
    ocjena: undefined as number | undefined,
    broj_ocjena: undefined as number | undefined,
  },
];

const guests = [
  {
    id: 1,
    datum: '2026-11-13T09:00:00',
    vrijeme_od: '09:00',
    vrijeme_do: '13:00',
    doktor: {
      ime: 'Edin',
      prezime: 'Međedović',
      specijalnost: 'Ginekologija i akušerstvo',
      ocjena: undefined as number | undefined,
      slika: '',
    },
  },
];

const recenzije: Recenzija[] = [
  {
    id: 1,
    user_id: 1,
    termin_id: 1,
    recenziran_type: 'klinika',
    recenziran_id: 1,
    ocjena: 5,
    komentar: 'Čekaonica uredna, a termin je počeo na vrijeme.',
    created_at: '2026-10-12T10:00:00',
    updated_at: '2026-10-12T10:00:00',
    user: { id: 1, ime: 'Amina', prezime: 'K.' },
  },
];

function currentStatus(radnoVrijeme: typeof hours) {
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

const jumps = [
  { href: '#o-klinici', label: 'O klinici' },
  { href: '#doktori', label: 'Naši doktori' },
  { href: '#gosti', label: 'Gostujući specijalisti' },
  { href: '#recenzije', label: 'Recenzije' },
  { href: '#kontakt', label: 'Kontakt informacije' },
  { href: '#radno-vrijeme', label: 'Radno vrijeme' },
  { href: '#lokacija', label: 'Lokacija' },
];

export default function ClinicProfilePreview() {
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null);
  const visibleDoctors = specialtyFilter
    ? doctors.filter((doctor) => doctor.specijalnost === specialtyFilter)
    : doctors;
  const status = currentStatus(hours);
  const hourRows = getWorkingHoursRows(hours);
  const todayName = ['Nedjelja', 'Ponedjeljak', 'Utorak', 'Srijeda', 'Četvrtak', 'Petak', 'Subota'][new Date().getDay()];

  return (
    <>
      <Helmet>
        <title>Test — novi profil klinike | WizMedik</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-[#f6f4ef] pb-28 text-[#1c2430] md:pb-16">
        <div className="border-b border-[#e7e1d6] bg-[#fffdf8]">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-sm text-[#5c6770] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Test primjer novog profila klinike. Postojeći profil na{' '}
              <span className="font-medium text-[#1c2430]">/klinika/...</span> ostaje nepromijenjen.
            </p>
            <Link to="/klinike" className="font-medium text-[#0e7490] hover:underline">
              Nazad na klinike
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <nav className="mb-5 text-sm text-[#6b7280]" aria-label="Putanja">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-[#0e7490]">Početna</Link></li>
              <li aria-hidden>/</li>
              <li><Link to="/klinike" className="hover:text-[#0e7490]">Klinike</Link></li>
              <li aria-hidden>/</li>
              <li className="text-[#1c2430]">Poliklinika Medica</li>
            </ol>
          </nav>

          <section className="rounded-[28px] border border-[#e6e0d6] bg-white p-5 shadow-[0_1px_2px_rgba(28,36,48,0.04)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <img
                src={gallery[0]}
                alt="Poliklinika Medica"
                className="h-28 w-28 shrink-0 rounded-2xl border border-[#d7efe8] object-cover md:h-36 md:w-36"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-wide text-[#0e7490]">{CITY}</p>
                <h1 className="mt-1 font-serif text-4xl leading-none tracking-tight text-[#17202a] md:text-5xl">
                  Poliklinika Medica
                </h1>
                <p className={`mt-4 inline-flex items-center gap-2 text-sm ${status === 'Otvoreno' ? 'text-[#0e7490]' : 'text-[#6b7280]'}`}>
                  <Clock className="h-4 w-4" />
                  {status}
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 border-t border-[#eeeae3] pt-5 md:w-64 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                <h2 className="font-serif text-2xl tracking-tight">Rezervišite termin</h2>
                <p className="text-sm leading-6 text-[#5c6770]">
                  Kontaktirajte nas za zakazivanje termina ili izaberite doktora iz liste.
                </p>
                <a
                  href={`tel:+38733210440`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0e7490] text-sm font-medium text-white hover:bg-[#0c657d]"
                >
                  <Phone className="h-4 w-4" />
                  Pozovite sada
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#d9d3c8] text-sm font-medium hover:bg-[#faf8f4]"
                >
                  <Mail className="h-4 w-4" />
                  Pošaljite email
                </a>
              </div>
            </div>
          </section>

          <nav
            className="sticky top-16 z-30 -mx-4 mt-6 overflow-x-auto bg-[#f6f4ef]/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:overflow-visible md:bg-transparent md:px-0 md:py-0"
            aria-label="Dijelovi profila"
          >
            <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
              {jumps.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="inline-flex h-9 items-center rounded-full border border-[#e6e0d6] bg-white px-3 text-sm font-medium text-[#0e7490] hover:bg-[#f3faf8]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <section id="galerija" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5 md:p-8" aria-label="Slike klinike">
                <button
                  type="button"
                  className="block w-full overflow-hidden rounded-2xl"
                  onClick={() => {
                    setLightboxIndex(selectedImage);
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={gallery[selectedImage]}
                    alt={`Poliklinika Medica ${selectedImage + 1}`}
                    className="aspect-video w-full object-cover"
                  />
                </button>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {gallery.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(index)}
                      className={`overflow-hidden rounded-xl border-2 ${
                        selectedImage === index ? 'border-[#0e7490]' : 'border-transparent'
                      }`}
                    >
                      <img src={image} alt={`Poliklinika Medica thumbnail ${index + 1}`} className="h-16 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </section>

              <section id="o-klinici" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5 md:p-8">
                <h2 className="font-serif text-3xl tracking-tight">O klinici</h2>
                <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#3f4a56]">
                  Poliklinika Medica u Sarajevu prima pacijente na kardiološke i internističke preglede.
                  Termine dogovarate telefonom ili emailom, a doktora birate sa liste ispod.
                </p>
              </section>

              <section id="doktori" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5 md:p-8">
                <h2 className="font-serif text-3xl tracking-tight">Naši doktori</h2>
                <div className="mt-5">
                  <h3 className="text-sm font-medium text-[#6b7280]">Specijalnosti klinike</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {specialties.map((specialty) => {
                      const active = specialtyFilter === specialty.naziv;
                      return (
                        <button
                          key={specialty.slug}
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
                {visibleDoctors.length > 0 ? (
                  <ul className="mt-6 grid gap-4 md:grid-cols-2">
                    {visibleDoctors.map((doctor) => (
                      <li key={doctor.id} className="rounded-2xl border border-[#efeae2] p-4">
                        <div className="flex gap-4">
                          {doctor.slika ? (
                            <img
                              src={doctor.slika}
                              alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                              className="h-16 w-16 rounded-2xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3faf8] font-serif text-lg text-[#0e7490]">
                              {doctor.ime[0]}{doctor.prezime[0]}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold">Dr. {doctor.ime} {doctor.prezime}</h4>
                            <p className="text-sm text-[#6b7280]">{doctor.specijalnost}</p>
                            {doctor.opis && <p className="mt-1 line-clamp-2 text-xs text-[#6b7280]">{doctor.opis}</p>}
                            {doctor.ocjena && (
                              <p className="mt-2 flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                <span>{doctor.ocjena}</span>
                                {doctor.broj_ocjena && <span>({doctor.broj_ocjena})</span>}
                              </p>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3 w-full rounded-full"
                              onClick={() => navigate('/test/profil-doktora')}
                            >
                              Vidi profil
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-[#6b7280]">Trenutno nema dostupnih doktora u ovoj klinici.</p>
                )}
              </section>

              <section id="gosti" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5 md:p-8">
                <h2 className="flex items-center gap-2 font-serif text-3xl tracking-tight">
                  <UserPlus className="h-6 w-6 text-[#0e7490]" />
                  Gostujući specijalisti
                </h2>
                <p className="mt-3 text-sm text-[#6b7280]">
                  Specijalisti koji povremeno ordiniraju u našoj klinici
                </p>
                <ul className="mt-5 grid gap-4 md:grid-cols-2">
                  {guests.map((visit) => (
                    <li key={visit.id} className="rounded-2xl border border-[#efeae2] p-4">
                      <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f3faf8] font-serif text-lg text-[#0e7490]">
                          {visit.doktor.ime[0]}{visit.doktor.prezime[0]}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold">Dr. {visit.doktor.ime} {visit.doktor.prezime}</h4>
                          <p className="text-sm text-[#6b7280]">{visit.doktor.specijalnost}</p>
                          <p className="mt-2 text-sm font-medium">
                            {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </p>
                          <p className="text-sm text-[#6b7280]">{visit.vrijeme_od} - {visit.vrijeme_do}</p>
                          {visit.doktor.ocjena && (
                            <p className="mt-1 flex items-center gap-1 text-sm">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              <span>{visit.doktor.ocjena}</span>
                            </p>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full rounded-full"
                            onClick={() => navigate('/test/profil-doktora')}
                          >
                            Zakaži termin
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="recenzije" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5 md:p-8">
                <h2 className="font-serif text-3xl tracking-tight">Recenzije ({recenzije.length})</h2>
                {recenzije.length === 0 ? (
                  <p className="py-8 text-center text-[#6b7280]">
                    Još nema recenzija. Budite prvi koji će ocijeniti!
                  </p>
                ) : (
                  <div className="mt-5 space-y-4">
                    {recenzije.map((recenzija) => (
                      <ReviewCard key={recenzija.id} recenzija={recenzija} />
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="space-y-4 md:sticky md:top-24">
              <section id="kontakt" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5">
                <h2 className="font-medium">Kontakt informacije</h2>
                <dl className="mt-4 space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                    <div>
                      <dt className="font-medium">Adresa</dt>
                      <dd className="text-[#6b7280]">{ADDRESS}</dd>
                      <dd className="text-[#6b7280]">{CITY}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                    <div>
                      <dt className="font-medium">Telefon</dt>
                      <dd className="text-[#6b7280]">{PHONE}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                    <div>
                      <dt className="font-medium">Email</dt>
                      <dd className="text-[#6b7280]">{EMAIL}</dd>
                    </div>
                  </div>
                  <div>
                    <a href={MAPS} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-medium text-[#0e7490] hover:underline">
                      <MapPin className="h-4 w-4" />
                      Otvori navigaciju
                    </a>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-[#0e7490]" />
                    <div>
                      <dt className="font-medium">Website</dt>
                      <dd>
                        <a href={`https://${WEBSITE}`} target="_blank" rel="noopener noreferrer" className="text-[#0e7490] hover:underline">
                          {WEBSITE}
                        </a>
                      </dd>
                    </div>
                  </div>
                </dl>
              </section>

              <section id="radno-vrijeme" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5">
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

              <div id="lokacija" className="scroll-mt-28 overflow-hidden rounded-[28px] border border-[#e6e0d6] bg-white">
                <LocationMapCard
                  naziv="Poliklinika Medica"
                  adresa={ADDRESS}
                  grad={CITY}
                  latitude={43.8563}
                  longitude={18.4131}
                  googleMapsLink={MAPS}
                  markerColor="orange"
                  mapHeightClass="h-[220px]"
                />
              </div>

              <section id="rezervacija" className="scroll-mt-28 rounded-[28px] border border-[#e6e0d6] bg-white p-5">
                <h2 className="font-medium">Rezervišite termin</h2>
                <p className="mt-3 text-sm leading-6 text-[#6b7280]">
                  Kontaktirajte nas za zakazivanje termina ili izaberite doktora iz liste.
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href="tel:+38733210440"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0e7490] text-sm font-medium text-white hover:bg-[#0c657d]"
                  >
                    <Phone className="h-4 w-4" />
                    Pozovite sada
                  </a>
                  <a
                    href={`mailto:${EMAIL}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#d9d3c8] text-sm font-medium hover:bg-[#faf8f4]"
                  >
                    <Mail className="h-4 w-4" />
                    Pošaljite email
                  </a>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e6e0d6] bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          <a
            href="tel:+38733210440"
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#d9d3c8] text-sm font-medium"
          >
            Pozovite sada
          </a>
          <a
            href={MAPS}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[#0e7490] text-sm font-medium text-white"
          >
            Vodi me do lokacije
          </a>
        </div>
      </div>
      <Footer />
      <ImageLightbox
        images={gallery}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
