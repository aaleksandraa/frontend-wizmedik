import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  ChevronDown,
  Clock,
  MapPin,
  Navigation,
  Phone,
  Star,
} from 'lucide-react';

const PHONE_DISPLAY = '033 210 440';
const PHONE_HREF = 'tel:+38733210440';
const ADDRESS = 'Zmaja od Bosne 7';
const CITY = 'Sarajevo';
const MAPS_HREF = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `Poliklinika Medica, ${ADDRESS}, ${CITY}`
)}`;

const prihvataOnline = false;

const services = [
  { id: 1, naziv: 'Prvi pregled', opis: 'Razgovor, pregled i plan daljnje obrade.', trajanje: '40 min', cijena: '80 KM' },
  { id: 2, naziv: 'Kontrolni pregled', opis: 'Praćenje terapije i nalaza.', trajanje: '20 min', cijena: '50 KM' },
  { id: 3, naziv: 'Ultrazvuk srca', opis: 'Ehokardiografija u ordinaciji.', trajanje: '30 min', cijena: '70 KM' },
  { id: 4, naziv: 'Holter monitoring', opis: '24-satno snimanje ritma.', trajanje: '24 h', cijena: '90 KM' },
  { id: 5, naziv: 'EKG', opis: 'Snimanje u ordinaciji, nalaz isti dan.', trajanje: '15 min', cijena: '25 KM' },
];

const places = [
  { naziv: 'Poliklinika Medica', detalj: `${ADDRESS}, ${CITY}` },
  { naziv: 'Klinički centar', detalj: `${CITY} · petkom` },
];

const hours = [
  { day: 1, label: 'Ponedjeljak', value: '08:00–16:00' },
  { day: 2, label: 'Utorak', value: '08:00–16:00' },
  { day: 3, label: 'Srijeda', value: '08:00–16:00' },
  { day: 4, label: 'Četvrtak', value: '08:00–16:00' },
  { day: 5, label: 'Petak', value: '08:00–16:00' },
  { day: 6, label: 'Subota', value: '09:00–13:00' },
  { day: 0, label: 'Nedjelja', value: 'Zatvoreno' },
];

const reviews: Array<{ ime: string; datum: string; ocjena: number; tekst: string }> = [];

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
        />
      ))}
    </span>
  );
}

export default function DoctorProfilePreview() {
  const [bioOpen, setBioOpen] = useState(false);
  const [serviceId, setServiceId] = useState<number>(services[0].id);
  const [asked, setAsked] = useState(false);
  const today = new Date().getDay();
  const selected = services.find((service) => service.id === serviceId) ?? services[0];
  const todayHours = hours.find((row) => row.day === today);
  const hasRatings = reviews.length > 0;
  const openNow = Boolean(todayHours && todayHours.value !== 'Zatvoreno');

  const jumps = useMemo(
    () => [
      { href: '#usluge', label: 'Usluge i cijene' },
      ...(hasRatings ? [{ href: '#recenzije', label: 'Recenzije' }] : []),
      { href: '#lokacija', label: 'Lokacija' },
      { href: '#radno-vrijeme', label: 'Radno vrijeme' },
      { href: '#dostupan', label: 'Dostupan u' },
    ],
    [hasRatings]
  );

  const requestTermin = (id?: number) => {
    if (!prihvataOnline) return;
    if (id) setServiceId(id);
    setAsked(true);
    if (window.innerWidth < 768) {
      document.getElementById('zakazivanje')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      <Helmet>
        <title>Test — novi profil doktora | WizMedik</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <main className="min-h-screen bg-background pb-28 text-[#1c2430] md:pb-16">
        <div className="border-b border-border bg-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 text-sm text-[#5c6770] sm:flex-row sm:items-center sm:justify-between">
            <p>
              Test primjer novog profila. Postojeći profil na{' '}
              <span className="font-medium text-[#1c2430]">/doktor/...</span> ostaje nepromijenjen.
            </p>
            <Link to="/doktori" className="font-medium text-[#0e7490] hover:underline">
              Nazad na doktore
            </Link>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
          <nav className="mb-5 text-sm text-[#6b7280]" aria-label="Putanja">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-[#0e7490]">Početna</Link></li>
              <li aria-hidden>/</li>
              <li><Link to="/doktori" className="hover:text-[#0e7490]">Doktori</Link></li>
              <li aria-hidden>/</li>
              <li className="text-[#1c2430]">Dr. Lejla Hadžić</li>
            </ol>
          </nav>

          <section className="rounded-[28px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(28,36,48,0.04)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div
                className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-[#d7efe8] bg-[#f3faf8] font-serif text-3xl text-[#0e7490] md:h-36 md:w-36 md:text-4xl"
                aria-hidden
              >
                LH
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-wide text-[#0e7490]">Kardiologija</p>
                <h1 className="mt-1 font-serif text-4xl leading-none tracking-tight text-[#17202a] md:text-5xl">
                  Lejla Hadžić
                </h1>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#4b5563]">
                  Prevencija srčanih bolesti, ultrazvuk srca i praćenje povišenog krvnog pritiska.
                </p>
                <div className="mt-4 flex flex-col gap-1.5 text-sm text-[#374151]">
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#0e7490]" />
                    {CITY}
                  </p>
                  <p>
                    <span className="text-[#6b7280]">Dostupan u: </span>
                    {places.map((place) => place.naziv).join(' · ')}
                  </p>
                  <p className={`inline-flex items-center gap-2 ${openNow ? 'text-[#0e7490]' : 'text-[#6b7280]'}`}>
                    <Clock className="h-4 w-4" />
                    {openNow ? 'Otvoreno' : 'Zatvoreno'}
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 border-t border-[#eeeae3] pt-5 md:w-60 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                {hasRatings && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8175]">
                      Pacijentska ocjena
                    </p>
                    <p className="mt-1 flex items-end gap-2">
                      <span className="font-serif text-4xl leading-none">4,9</span>
                      <span className="pb-1 text-sm text-[#6b7280]">{reviews.length} recenzija</span>
                    </p>
                    <Stars value={5} />
                  </div>
                )}
                {prihvataOnline ? (
                  <Button
                    className="h-11 rounded-full bg-[#0e7490] text-white hover:bg-[#0c657d]"
                    onClick={() => requestTermin()}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Zakažite termin
                  </Button>
                ) : (
                  <p className="rounded-2xl bg-background px-3 py-3 text-center text-sm leading-6 text-[#3f4a56]">
                    Ovaj doktor ne prima online rezervacije
                  </p>
                )}
                <a
                  href={PHONE_HREF}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                >
                  <Phone className="h-4 w-4" />
                  {PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </section>

          <nav
            className="sticky top-16 z-30 -mx-4 mt-6 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur md:static md:mx-0 md:overflow-visible md:bg-transparent md:px-0 md:py-0"
            aria-label="Dijelovi profila"
          >
            <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
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

          <div className="mt-4 grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              <section id="biografija" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">O doktoru</p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Biografija</h2>
                <div className="mt-5 max-w-2xl space-y-4 text-[15px] leading-7 text-[#3f4a56]">
                  <p>
                    Dr. Lejla Hadžić je specijalista kardiologije. Radi u Poliklinici Medica u Sarajevu,
                    a petkom prima i na gostovanju u Kliničkom centru. Fokus rada joj je rano prepoznavanje
                    srčanih tegoba i praćenje pacijenata s povišenim pritiskom.
                  </p>
                  <p>
                    Pregled obuhvata razgovor, mjerenje pritiska, EKG i, kada je potrebno, ultrazvuk srca.
                    Nalaz i sljedeći korak dobijate na istom terminu.
                  </p>
                  {bioOpen && (
                    <p>
                      Specijalizaciju je završila u Sarajevu, uz kraća usavršavanja iz ehokardiografije.
                      Na profilu su navedene samo usluge i cijene koje ordinacija potvrđuje. Za hitna stanja
                      nazovite hitnu pomoć, a za redovan termin pozovite ordinaciju.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0e7490]"
                  onClick={() => setBioOpen((open) => !open)}
                  aria-expanded={bioOpen}
                >
                  {bioOpen ? 'Sakrij proširenu biografiju' : 'Prikaži cijelu biografiju'}
                  <ChevronDown className={`h-4 w-4 transition-transform ${bioOpen ? 'rotate-180' : ''}`} />
                </button>
              </section>

              <section id="usluge" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">Ordinacija</p>
                <h2 className="mt-2 font-serif text-3xl tracking-tight">Usluge i cijene</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
                  {prihvataOnline
                    ? 'Odaberite uslugu i nastavite na zakazivanje.'
                    : 'Za termin pozovite ordinaciju. Online rezervacije nisu uključene.'}
                </p>
                <ul className="mt-6 divide-y divide-border">
                  {services.map((service) => {
                    const active = prihvataOnline && service.id === serviceId;
                    return (
                      <li key={service.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-medium">{service.naziv}</p>
                          <p className="mt-0.5 text-sm text-[#6b7280]">{service.opis}</p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span className="text-sm text-[#6b7280]">{service.trajanje}</span>
                          <span className="w-16 text-right font-semibold tabular-nums">{service.cijena}</span>
                          {prihvataOnline && (
                            <button
                              type="button"
                              onClick={() => requestTermin(service.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                active ? 'bg-[#0e7490] text-white' : 'text-[#0e7490] hover:bg-[#f3faf8]'
                              }`}
                            >
                              Zakažite
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {hasRatings && (
                <section id="recenzije" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">Iskustva</p>
                      <h2 className="mt-2 font-serif text-3xl tracking-tight">Recenzije pacijenata</h2>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-5">
                    {reviews.map((review) => (
                      <li key={review.ime} className="border-t border-border pt-5 first:border-t-0 first:pt-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium">{review.ime}</p>
                          <Stars value={review.ocjena} />
                        </div>
                        <p className="mt-2 text-[15px] leading-7 text-[#3f4a56]">{review.tekst}</p>
                        <p className="mt-2 text-xs text-[#8a8175]">{review.datum}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <aside id="zakazivanje" className="space-y-4 md:sticky md:top-24">
              <section className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-serif text-2xl tracking-tight">Zakažite termin</h2>
                {prihvataOnline ? (
                  <>
                    <p className="mt-3 text-sm leading-6 text-[#5c6770]">
                      Odabrana usluga: <span className="font-medium text-[#1c2430]">{selected.naziv}</span>
                      {' · '}
                      {selected.trajanje}
                      {' · '}
                      {selected.cijena}
                    </p>
                    <Button
                      className="mt-4 h-11 w-full rounded-full bg-[#0e7490] hover:bg-[#0c657d]"
                      onClick={() => requestTermin()}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Zakažite termin
                    </Button>
                    {asked && (
                      <p className="mt-3 rounded-2xl bg-[#f3faf8] px-3 py-3 text-sm leading-6 text-[#0f5163]">
                        U ovom testu termin se ne šalje. Na pravom profilu ovdje se otvara postojeći obrazac za zakazivanje.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="mt-3 rounded-2xl bg-background px-3 py-3 text-sm leading-6 text-[#3f4a56]">
                    Ovaj doktor ne prima online rezervacije
                  </p>
                )}
                <a
                  href={PHONE_HREF}
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                >
                  <Phone className="h-4 w-4" />
                  Pozovite {PHONE_DISPLAY}
                </a>
              </section>

              <section id="lokacija" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="flex items-center gap-2 font-medium">
                  <MapPin className="h-4 w-4 text-[#0e7490]" />
                  Lokacija
                </h2>
                <p className="mt-3 text-sm leading-6 text-[#3f4a56]">
                  {ADDRESS}, {CITY}
                </p>
                <a
                  href={MAPS_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0e7490] text-sm font-medium text-white hover:bg-[#0c657d]"
                >
                  <Navigation className="h-4 w-4" />
                  Vodi me do lokacije
                </a>
              </section>

              <section id="dostupan" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-medium">Dostupan u:</h2>
                <ul className="mt-3 space-y-3 text-sm">
                  {places.map((place) => (
                    <li key={place.naziv} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                      <p className="font-medium">{place.naziv}</p>
                      <p className="text-[#6b7280]">{place.detalj}</p>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="radno-vrijeme" className="scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-medium">Radno vrijeme</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {hours.map((row) => (
                    <li
                      key={row.label}
                      className={`flex justify-between rounded-lg px-2 py-1 ${
                        row.day === today ? 'bg-[#f3faf8] font-medium text-[#0e7490]' : 'text-[#4b5563]'
                      }`}
                    >
                      <span>{row.label}</span>
                      <span className="tabular-nums">{row.value}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          <a
            href={PHONE_HREF}
            className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium"
          >
            Pozovite
          </a>
          {prihvataOnline ? (
            <button
              type="button"
              onClick={() => requestTermin()}
              className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[#0e7490] text-sm font-medium text-white"
            >
              Zakažite termin
            </button>
          ) : (
            <a
              href={MAPS_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[#0e7490] text-sm font-medium text-white"
            >
              Vodi me do lokacije
            </a>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
