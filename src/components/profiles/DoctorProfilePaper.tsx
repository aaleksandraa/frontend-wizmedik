import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { LocationMapCard } from '@/components/LocationMapCard';
import { ReviewCard } from '@/components/ReviewCard';
import { Recenzija } from '@/services/reviewsAPI';
import { getDaySchedule, isClosedDay, type WorkingHours } from '@/lib/booking-slots';
import { getWorkingHoursRows } from '@/lib/working-hours';
import { fixImageUrl } from '@/utils/imageUrl';
import { sanitizeRichText } from '@/utils/sanitize';
import { formatRating } from '@/utils/formatters';
import { Award, Calendar, ChevronDown, Clock, MapPin, Phone, Star, Video } from 'lucide-react';

interface ServiceItem {
  id: number;
  naziv: string;
  opis?: string;
  cijena?: number;
  cijena_popust?: number;
  trajanje_minuti?: number;
  kategorija?: string;
}

interface PublicDoctor {
  id: number;
  user_id?: number;
  ime: string;
  prezime: string;
  slug?: string;
  specijalnost?: string;
  telefon?: string;
  email?: string;
  public_email?: string;
  grad?: string;
  lokacija?: string;
  latitude?: number;
  longitude?: number;
  google_maps_link?: string;
  prihvata_online?: boolean;
  ocjena?: number;
  broj_ocjena?: number;
  opis?: string;
  youtube_linkovi?: Array<{ url: string; naslov?: string }>;
  slika_profila?: string;
  radno_vrijeme?: WorkingHours | string | null;
  telemedicine_enabled?: boolean;
  telemedicine_phone?: string;
  klinika_naziv?: string;
  klinika_adresa?: string;
  klinika?: { naziv?: string; slug?: string; adresa?: string; grad?: string; lokacija?: string };
  kategorijeUsluga?: Array<{
    id: number;
    naziv: string;
    opis?: string;
    usluge?: ServiceItem[];
  }>;
}

interface GuestVisit {
  id: number;
  datum: string;
  vrijeme_od: string;
  vrijeme_do: string;
  prihvata_online_rezervacije: boolean;
  usluge?: Array<{ id: number; naziv: string; cijena?: number }>;
  klinika: {
    naziv: string;
    lokacija?: string;
    grad?: string;
    slug?: string;
    telefon?: string;
  };
}

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

function plainText(value?: string) {
  return (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function priceLabel(service: ServiceItem) {
  if (service.cijena_popust) return `${service.cijena_popust} KM`;
  if (service.cijena) return `${service.cijena} KM`;
  return 'Na upit';
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

function youtubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function telHref(phone?: string) {
  const digits = (phone || '').replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : undefined;
}

export function DoctorProfilePaper({
  doctor,
  services,
  recenzije,
  ratingStats,
  guestVisits,
  blogPosts,
  blogHasMore,
  loadingBlog,
  onLoadMoreBlog,
  canReview,
  showReviewForm,
  onReviewForm,
  newReview,
  onReviewChange,
  eligibleTermini,
  onReviewsUpdate,
  onSubmitReview,
  canRespond,
  onBook,
  onBookService,
  selectedServiceId,
  onGuestVisitBook,
  onTrack,
}: {
  doctor: PublicDoctor;
  services: ServiceItem[];
  recenzije: Recenzija[];
  ratingStats: { average: number; total: number } | null;
  guestVisits: GuestVisit[];
  blogPosts: Array<{ id: number; slug: string; naslov: string; excerpt?: string }>;
  blogHasMore: boolean;
  loadingBlog: boolean;
  onLoadMoreBlog: () => void;
  canReview: boolean;
  showReviewForm: boolean;
  onReviewForm: (open: boolean) => void;
  newReview: { ocjena: number; komentar: string; termin_id: number };
  onReviewChange: (next: { ocjena: number; komentar: string; termin_id: number }) => void;
  eligibleTermini: Array<{ id: number; datum_vrijeme: string }>;
  onReviewsUpdate?: () => void;
  onSubmitReview: (event: React.FormEvent) => void;
  canRespond: boolean;
  onBook: () => void;
  onBookService: (serviceId: number) => void;
  selectedServiceId: number | null;
  onGuestVisitBook: (visit: GuestVisit) => void;
  onTrack: (channel: 'phone' | 'email' | 'map', placement: string) => void;
}) {
  const [bioOpen, setBioOpen] = useState(false);
  const fullName = `${doctor.ime} ${doctor.prezime}`.trim();
  const photo = fixImageUrl(doctor.slika_profila) || doctor.slika_profila;
  const initials = `${doctor.ime?.[0] || ''}${doctor.prezime?.[0] || ''}`;
  const biography = plainText(doctor.opis);
  const excerpt = biography.length > 160 ? `${biography.slice(0, 157).trim()}…` : biography;
  const longBio = biography.length > 320;
  const online = Boolean(doctor.prihvata_online);
  const phoneHref = telHref(doctor.telefon);
  const email = doctor.public_email || doctor.email;
  const status = openStatus(doctor.radno_vrijeme);
  const hourRows = doctor.radno_vrijeme && typeof doctor.radno_vrijeme === 'object'
    ? getWorkingHoursRows(doctor.radno_vrijeme)
    : [];
  const todayKey = ['nedjelja', 'ponedeljak', 'utorak', 'srijeda', 'cetvrtak', 'petak', 'subota'][new Date().getDay()];
  const ratingValue = ratingStats?.total ? ratingStats.average : doctor.ocjena;
  const ratingCount = ratingStats?.total || doctor.broj_ocjena || 0;
  const hasRatings = Boolean(ratingValue && ratingCount > 0);
  const mapsHref = doctor.google_maps_link
    || (doctor.latitude && doctor.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${doctor.latitude},${doctor.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Dr. ${fullName}, ${doctor.lokacija || ''}, ${doctor.grad || ''}`)}`);

  const pricedServices = useMemo(() => {
    const grouped = (doctor.kategorijeUsluga || []).flatMap((category) =>
      (category.usluge || []).map((service) => ({ ...service, kategorija: category.naziv }))
    );
    const extra = services.map((service) => ({
      ...service,
      kategorija: grouped.length > 0 ? 'Ostale usluge' : service.kategorija,
    }));
    return [...grouped, ...extra];
  }, [doctor.kategorijeUsluga, services]);

  const selected = pricedServices.find((service) => service.id === selectedServiceId);

  const places = useMemo(() => {
    const rows: Array<{ naziv: string; detalj: string; href?: string }> = [];
    const homeName = doctor.klinika?.naziv || doctor.klinika_naziv;
    const homeDetail = [
      doctor.klinika?.adresa || doctor.klinika?.lokacija || doctor.klinika_adresa || doctor.lokacija,
      doctor.klinika?.grad || doctor.grad,
    ].filter(Boolean).join(', ');
    if (homeName || homeDetail) {
      rows.push({
        naziv: homeName || 'Ordinacija',
        detalj: homeDetail,
        href: doctor.klinika?.slug ? `/klinika/${doctor.klinika.slug}` : undefined,
      });
    }
    guestVisits.forEach((visit) => {
      const name = visit.klinika?.naziv;
      if (!name || rows.some((row) => row.naziv === name)) return;
      rows.push({
        naziv: name,
        detalj: [visit.klinika.lokacija, visit.klinika.grad].filter(Boolean).join(', '),
        href: visit.klinika.slug ? `/klinika/${visit.klinika.slug}` : undefined,
      });
    });
    return rows;
  }, [doctor, guestVisits]);

  const jumps = [
    ...(biography ? [{ href: '#biografija', label: 'O doktoru' }] : []),
    ...(pricedServices.length > 0 ? [{ href: '#usluge', label: 'Usluge i cijene' }] : []),
    ...(recenzije.length > 0 ? [{ href: '#recenzije', label: 'Recenzije' }] : []),
    ...(guestVisits.length > 0 ? [{ href: '#gostovanja', label: 'Gostovanja u klinikama' }] : []),
    { href: '#lokacija', label: 'Lokacija' },
    ...(hourRows.length > 0 || typeof doctor.radno_vrijeme === 'string' ? [{ href: '#radno-vrijeme', label: 'Radno vrijeme' }] : []),
    ...(places.length > 0 ? [{ href: '#dostupan', label: 'Dostupan u' }] : []),
  ];
  const mobileJumps = [
    ...(pricedServices.length > 0 ? [{ href: '#usluge', label: 'Usluge' }] : []),
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
              <li><Link to="/doktori" className="hover:text-[#0e7490]">Doktori</Link></li>
              <li aria-hidden>/</li>
              <li className="text-[#1c2430]">Dr. {fullName}</li>
            </ol>
          </nav>

          <section className="rounded-[28px] border border-border bg-white p-5 shadow-[0_1px_2px_rgba(28,36,48,0.04)] md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {photo ? (
                <img
                  src={photo}
                  alt={`Dr. ${fullName}`}
                  className="h-28 w-28 shrink-0 rounded-2xl border border-[#d7efe8] object-cover md:h-36 md:w-36"
                />
              ) : (
                <div
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border border-[#d7efe8] bg-[#f3faf8] font-serif text-3xl text-[#0e7490] md:h-36 md:w-36 md:text-4xl"
                  aria-hidden
                >
                  {initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                {doctor.specijalnost && (
                  <p className="text-sm font-semibold tracking-wide text-[#0e7490]">{doctor.specijalnost}</p>
                )}
                <h1 className="mt-1 font-serif text-4xl leading-none tracking-tight text-[#17202a] md:text-5xl">
                  {fullName}
                </h1>
                {excerpt && (
                  <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#4b5563]">{excerpt}</p>
                )}
                <div className="mt-4 flex flex-col gap-1.5 text-sm text-[#374151]">
                  {doctor.grad && (
                    <p className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-[#0e7490]" />
                      {doctor.grad}
                    </p>
                  )}
                  {places.length > 0 && (
                    <p>
                      <span className="text-[#6b7280]">Dostupan u: </span>
                      {places.map((place) => place.naziv).join(' · ')}
                    </p>
                  )}
                  {status && (
                    <p className={`inline-flex items-center gap-2 ${status === 'Otvoreno' ? 'text-[#0e7490]' : 'text-[#6b7280]'}`}>
                      <Clock className="h-4 w-4" />
                      {status}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex w-full flex-col gap-3 border-t border-border pt-5 md:w-60 md:border-l md:border-t-0 md:pl-8 md:pt-0">
                {hasRatings && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8175]">
                      Pacijentska ocjena
                    </p>
                    <p className="mt-1 flex items-end gap-2">
                      <span className="font-serif text-4xl leading-none">{formatRating(ratingValue)}</span>
                      <span className="pb-1 text-sm text-[#6b7280]">{ratingCount} recenzija</span>
                    </p>
                    <Stars value={Math.round(Number(ratingValue) || 0)} />
                  </div>
                )}
                {online ? (
                  <Button className="h-11 rounded-full bg-[#0e7490] text-white hover:bg-[#0c657d]" onClick={onBook}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Zakažite termin
                  </Button>
                ) : (
                  <p className="rounded-2xl bg-background px-3 py-3 text-center text-sm leading-6 text-[#3f4a56]">
                    Ovaj doktor ne prima online rezervacije
                  </p>
                )}
                {phoneHref && (
                  <a
                    href={phoneHref}
                    onClick={() => onTrack('phone', 'profile_hero')}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    {doctor.telefon}
                  </a>
                )}
              </div>
            </div>
          </section>

          {jumps.length > 0 && (
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
          )}

          <div className="mt-4 flex flex-col gap-6 md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
            <div className="contents md:block md:space-y-6">
              {biography && (
                <section id="biografija" className="order-1 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">O doktoru</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-tight">Biografija</h2>
                  <div
                    className={`prose prose-sm mt-5 max-w-2xl text-[15px] leading-7 text-[#3f4a56] ${longBio && !bioOpen ? 'line-clamp-4' : ''}`}
                    dangerouslySetInnerHTML={{ __html: sanitizeRichText(doctor.opis || '') }}
                  />
                  {longBio && (
                    <button
                      type="button"
                      className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#0e7490]"
                      onClick={() => setBioOpen((open) => !open)}
                      aria-expanded={bioOpen}
                    >
                      {bioOpen ? 'Sakrij proširenu biografiju' : 'Prikaži cijelu biografiju'}
                      <ChevronDown className={`h-4 w-4 transition-transform ${bioOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </section>
              )}

              {pricedServices.length > 0 && (
                <section id="usluge" className="order-2 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">Ordinacija</p>
                  <h2 className="mt-2 font-serif text-3xl tracking-tight">Usluge i cijene</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b7280]">
                    {online
                      ? 'Odaberite uslugu i nastavite na zakazivanje.'
                      : 'Za termin pozovite ordinaciju. Online rezervacije nisu uključene.'}
                  </p>
                  <ul className="mt-6 divide-y divide-border">
                    {pricedServices.map((service) => (
                      <li key={`${service.kategorija || 'usluga'}-${service.id}`} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          {service.kategorija && (
                            <p className="text-xs font-medium text-[#0e7490]">{service.kategorija}</p>
                          )}
                          <p className="font-medium">{service.naziv}</p>
                          {service.opis && <p className="mt-0.5 text-sm text-[#6b7280]">{service.opis}</p>}
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          {service.trajanje_minuti ? (
                            <span className="text-sm text-[#6b7280]">{service.trajanje_minuti} min</span>
                          ) : null}
                          <span className="text-right font-semibold tabular-nums">
                            {service.cijena_popust && service.cijena ? (
                              <span className="mr-2 text-sm font-normal text-[#6b7280] line-through">{service.cijena} KM</span>
                            ) : null}
                            {priceLabel(service)}
                          </span>
                          {online && (
                            <button
                              type="button"
                              onClick={() => onBookService(service.id)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                                selectedServiceId === service.id ? 'bg-[#0e7490] text-white' : 'text-[#0e7490] hover:bg-[#f3faf8]'
                              }`}
                            >
                              Zakažite
                            </button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {guestVisits.length > 0 && (
                <section id="gostovanja" className="order-4 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <h2 className="font-serif text-3xl tracking-tight">Gostovanja u klinikama</h2>
                  <p className="mt-3 text-sm text-[#6b7280]">
                    Dr. {fullName} gostuje u sljedećim klinikama.
                  </p>
                  <ul className="mt-5 space-y-4">
                    {guestVisits.map((visit) => (
                      <li key={visit.id} className="rounded-2xl border border-border p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            {visit.klinika?.slug ? (
                              <Link to={`/klinika/${visit.klinika.slug}`} className="font-semibold text-[#0e7490] hover:underline">
                                {visit.klinika.naziv}
                              </Link>
                            ) : (
                              <p className="font-semibold">{visit.klinika?.naziv}</p>
                            )}
                            <p className="mt-1 text-sm text-[#374151]">
                              {new Date(visit.datum).toLocaleDateString('sr-Latn-BA', { weekday: 'long', day: 'numeric', month: 'long' })}
                              {' · '}
                              {String(visit.vrijeme_od || '').slice(0, 5)} - {String(visit.vrijeme_do || '').slice(0, 5)}
                            </p>
                            <p className="text-sm text-[#6b7280]">
                              {[visit.klinika?.lokacija, visit.klinika?.grad].filter(Boolean).join(', ')}
                            </p>
                          </div>
                          {visit.prihvata_online_rezervacije ? (
                            <Button className="rounded-full bg-[#0e7490] hover:bg-[#0c657d]" onClick={() => onGuestVisitBook(visit)}>
                              <Calendar className="mr-2 h-4 w-4" />
                              Zakažite termin
                            </Button>
                          ) : visit.klinika?.telefon ? (
                            <a
                              href={telHref(visit.klinika.telefon)}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-border px-4 text-sm font-medium"
                            >
                              Pozovite kliniku
                            </a>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {doctor.youtube_linkovi && doctor.youtube_linkovi.length > 0 && (
                <section id="video" className="order-5 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <h2 className="font-serif text-3xl tracking-tight">Video snimci</h2>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {doctor.youtube_linkovi.map((video, index) => {
                      const id = youtubeId(video.url);
                      if (!id) return null;
                      return (
                        <div key={`${id}-${index}`}>
                          <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
                            <iframe
                              src={`https://www.youtube.com/embed/${id}`}
                              title={video.naslov || 'Video'}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="absolute inset-0 h-full w-full"
                            />
                          </div>
                          {video.naslov && <p className="mt-2 text-sm font-medium">{video.naslov}</p>}
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {blogPosts.length > 0 && (
                <section id="savjeti" className="order-6 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <h2 className="font-serif text-3xl tracking-tight">Savjeti</h2>
                  <ul className="mt-5 space-y-4">
                    {blogPosts.map((post) => (
                      <li key={post.id}>
                        <Link to={`/blog/${post.slug}`} className="block rounded-2xl border border-border p-4 hover:bg-muted">
                          <p className="font-medium">{post.naslov}</p>
                          {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-[#6b7280]">{post.excerpt}</p>}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {blogHasMore && (
                    <Button variant="outline" className="mt-4 rounded-full" onClick={onLoadMoreBlog} disabled={loadingBlog}>
                      {loadingBlog ? 'Učitavanje...' : 'Učitaj više članaka'}
                    </Button>
                  )}
                </section>
              )}

              {(hasRatings || canReview) && (
                <section id="recenzije" className="order-10 scroll-mt-28 rounded-[28px] border border-border bg-white p-5 md:p-8">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0e7490]">Iskustva</p>
                      <h2 className="mt-2 font-serif text-3xl tracking-tight">Recenzije pacijenata</h2>
                    </div>
                    {canReview && (
                      <Dialog open={showReviewForm} onOpenChange={onReviewForm}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="rounded-full">
                            <Award className="mr-2 h-4 w-4" />
                            Ostavi recenziju
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Ostavi recenziju za Dr. {fullName}</DialogTitle>
                            <DialogDescription>Podijelite vaše iskustvo sa ovim doktorom</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={onSubmitReview} className="space-y-4">
                            <div>
                              <Label>Odaberite termin</Label>
                              <Select
                                value={newReview.termin_id ? String(newReview.termin_id) : undefined}
                                onValueChange={(value) => onReviewChange({ ...newReview, termin_id: parseInt(value, 10) })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Odaberite termin" />
                                </SelectTrigger>
                                <SelectContent>
                                  {eligibleTermini.map((termin) => (
                                    <SelectItem key={termin.id} value={String(termin.id)}>
                                      {new Date(termin.datum_vrijeme).toLocaleDateString('sr-Latn-BA', {
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                                      })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Ocjena</Label>
                              <Select
                                value={String(newReview.ocjena)}
                                onValueChange={(value) => onReviewChange({ ...newReview, ocjena: parseInt(value, 10) })}
                              >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5">5 — Odličan</SelectItem>
                                  <SelectItem value="4">4 — Vrlo dobar</SelectItem>
                                  <SelectItem value="3">3 — Dobar</SelectItem>
                                  <SelectItem value="2">2 — Prosječan</SelectItem>
                                  <SelectItem value="1">1 — Loš</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label htmlFor="komentar">Komentar (opcionalno)</Label>
                              <Textarea
                                id="komentar"
                                value={newReview.komentar}
                                onChange={(event) => onReviewChange({ ...newReview, komentar: event.target.value })}
                                rows={4}
                                maxLength={1000}
                              />
                            </div>
                            <Button type="submit" className="w-full rounded-full bg-[#0e7490] hover:bg-[#0c657d]">
                              Pošalji recenziju
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  {recenzije.length > 0 ? (
                    <div className="mt-6 space-y-4">
                      {recenzije.map((recenzija) => (
                        <ReviewCard
                          key={recenzija.id}
                          recenzija={recenzija}
                          onUpdate={onReviewsUpdate}
                          canRespond={canRespond}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-6 text-sm text-[#6b7280]">Budite prvi koji će ocijeniti ovog doktora.</p>
                  )}
                </section>
              )}
            </div>

            <aside id="zakazivanje" className="contents md:sticky md:top-24 md:block md:space-y-4">
              <section id="kontakt" className="order-3 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                <h2 className="font-serif text-2xl tracking-tight">Zakažite termin</h2>
                {online ? (
                  <>
                    {selected && (
                      <p className="mt-3 text-sm leading-6 text-[#5c6770]">
                        Odabrana usluga: <span className="font-medium text-[#1c2430]">{selected.naziv}</span>
                        {selected.trajanje_minuti ? ` · ${selected.trajanje_minuti} min` : ''}
                        {' · '}
                        {priceLabel(selected)}
                      </p>
                    )}
                    <Button className="mt-4 h-11 w-full rounded-full bg-[#0e7490] hover:bg-[#0c657d]" onClick={onBook}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Zakažite termin
                    </Button>
                  </>
                ) : (
                  <p className="mt-3 rounded-2xl bg-background px-3 py-3 text-sm leading-6 text-[#3f4a56]">
                    Ovaj doktor ne prima online rezervacije
                  </p>
                )}
                {phoneHref && (
                  <a
                    href={phoneHref}
                    onClick={() => onTrack('phone', 'booking_sidebar')}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                  >
                    <Phone className="h-4 w-4" />
                    Pozovite {doctor.telefon}
                  </a>
                )}
                {doctor.telemedicine_enabled && doctor.telemedicine_phone && (
                  <a
                    href={telHref(doctor.telemedicine_phone)}
                    onClick={() => onTrack('phone', 'telemedicine_cta')}
                    className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-border text-sm font-medium hover:bg-muted"
                  >
                    <Video className="h-4 w-4" />
                    Zakažite video poziv: {doctor.telemedicine_phone}
                  </a>
                )}
                {email && (
                  <a
                    href={`mailto:${email}`}
                    onClick={() => onTrack('email', 'booking_sidebar')}
                    className="mt-3 block text-center text-sm text-[#0e7490] hover:underline"
                  >
                    {email}
                  </a>
                )}
              </section>

              <div id="lokacija" className="order-7 scroll-mt-28 overflow-hidden rounded-[28px] border border-border bg-white">
                <LocationMapCard
                  naziv={`Dr. ${fullName}`}
                  adresa={doctor.lokacija || ''}
                  grad={doctor.grad || ''}
                  latitude={doctor.latitude}
                  longitude={doctor.longitude}
                  googleMapsLink={mapsHref}
                  markerColor="gold"
                  mapHeightClass="h-[220px]"
                  onDirectionsClick={() => onTrack('map', 'map_card')}
                />
              </div>

              {places.length > 0 && (
                <section id="dostupan" className="order-8 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                  <h2 className="font-medium">Dostupan u:</h2>
                  <ul className="mt-3 space-y-3 text-sm">
                    {places.map((place) => (
                      <li key={place.naziv} className="border-t border-border pt-3 first:border-t-0 first:pt-0">
                        {place.href ? (
                          <Link to={place.href} className="font-medium text-[#0e7490] hover:underline">{place.naziv}</Link>
                        ) : (
                          <p className="font-medium">{place.naziv}</p>
                        )}
                        {place.detalj && <p className="text-[#6b7280]">{place.detalj}</p>}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {(hourRows.length > 0 || typeof doctor.radno_vrijeme === 'string') && (
                <section id="radno-vrijeme" className="order-9 scroll-mt-28 rounded-[28px] border border-border bg-white p-5">
                  <h2 className="font-medium">Radno vrijeme</h2>
                  {typeof doctor.radno_vrijeme === 'string' ? (
                    <p className="mt-3 text-sm text-[#4b5563]">{doctor.radno_vrijeme}</p>
                  ) : (
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {hourRows.map((row) => (
                        <li
                          key={row.day}
                          className={`flex justify-between rounded-lg px-2 py-1 ${
                            row.day === todayKey ? 'bg-[#f3faf8] font-medium text-[#0e7490]' : 'text-[#4b5563]'
                          }`}
                        >
                          <span>{row.label}</span>
                          <span className="tabular-nums">{row.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              )}
            </aside>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-6xl gap-2">
          {phoneHref && (
            <a
              href={phoneHref}
              onClick={() => onTrack('phone', 'mobile_sticky_bar')}
              className="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-border text-sm font-medium"
            >
              Pozovite
            </a>
          )}
          {online ? (
            <button
              type="button"
              onClick={onBook}
              className="inline-flex h-12 flex-[1.4] items-center justify-center rounded-full bg-[#0e7490] text-sm font-medium text-white"
            >
              Zakažite termin
            </button>
          ) : (
            <a
              href={mapsHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onTrack('map', 'mobile_sticky_bar')}
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
