import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { specialtiesAPI } from "@/services/api";
import { queryKeys } from "@/lib/queryClient";
import { Navbar } from "@/components/Navbar";
import { DoctorCard } from "@/components/DoctorCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Stethoscope,
  Users,
  Award,
  Clock,
  Play,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Badge } from "@/components/ui/badge";

const slugToName = (slug: string): string => {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/Opsta/g, "Opšta")
    .replace(/Decja/g, "Dečja")
    .replace(/Zenska/g, "Ženska");
};

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija: string;
  telefon: string;
  ocjena?: number;
  broj_ocjena?: number;
  prihvata_online?: boolean;
  opis?: string;
  slug: string;
  slika_profila?: string;
  slika_url?: string;
}

const getYouTubeEmbedUrl = (url: string): string => {
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
};

// Mobile-first prose styling (requires Tailwind Typography plugin)
const PROSE_CLASS = [
  "prose prose-sm sm:prose-base max-w-none",
  "prose-headings:leading-snug prose-headings:scroll-mt-24",
  "prose-h2:text-lg sm:prose-h2:text-2xl",
  "prose-h3:text-base sm:prose-h3:text-xl",
  "prose-h4:text-sm sm:prose-h4:text-lg",
  "prose-p:leading-relaxed prose-p:my-3",
  "prose-ul:my-3 prose-ol:my-3",
  "prose-li:my-1",
  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
  "prose-img:rounded-xl prose-img:shadow-sm",
  "prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground",
].join(" ");

// Keep rich text safe + avoid SEO issue with multiple H1
const sanitizeRichText = (html: string) => {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "h1"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "hr",
      "code",
      "pre",
      "span",
      "img",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
  });
};

export default function SpecialtyLanding() {
  const { naziv } = useParams<{ naziv: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 12;

  useEffect(() => {
    setCurrentPage(1);
  }, [naziv]);

  const canonicalUrl = useMemo(() => {
    return `${window.location.origin}${location.pathname}`;
  }, [location.pathname]);

  const { data: specialtySettings } = useQuery({
    queryKey: ["specialty-settings"],
    queryFn: async () => {
      const apiBase =
        import.meta.env.VITE_API_URL || "http://localhost:8000/api";
      const response = await fetch(`${apiBase}/settings/specialty-template`);
      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: specialtyInfo,
    isLoading: loadingSpecialty,
    isError,
  } = useQuery({
    queryKey: queryKeys.specialties.detail(naziv || ""),
    queryFn: async () => {
      const response = await specialtiesAPI.getBySlug(naziv || "");
      return response.data;
    },
    enabled: !!naziv,
    staleTime: 30 * 24 * 60 * 60 * 1000,
    gcTime: 60 * 24 * 60 * 60 * 1000,
  });

  const specialtyName = specialtyInfo?.naziv || slugToName(naziv || "");

  const specialty = useMemo(() => {
    return {
      naziv: specialtyInfo?.naziv || specialtyName,
      opis:
        specialtyInfo?.opis ||
        `Dijagnostika i liječenje u oblasti ${specialtyName.toLowerCase()}`,
      detaljniOpis:
        specialtyInfo?.detaljan_opis ||
        specialtyInfo?.opis ||
        `Pronađite kvalifikovane ${specialtyName.toLowerCase()} specijaliste u Bosni i Hercegovini. Naši stručnjaci pružaju vrhunsku zdravstvenu njegu sa modernom opremom i individualnim pristupom svakom pacijentu.`,
    };
  }, [specialtyInfo, specialtyName]);

  // DB-driven sections
  const dbYoutubeLinks = specialtyInfo?.prikazi_video_savjete
    ? specialtyInfo?.youtube_linkovi || []
    : [];
  const dbFaq = specialtyInfo?.prikazi_faq ? specialtyInfo?.faq || [] : [];
  const dbUsluge = specialtyInfo?.prikazi_usluge
    ? specialtyInfo?.usluge || []
    : [];

  const defaultFaqs = useMemo(
    () => [
      {
        question: `Kada trebam posjetiti ${specialtyName.toLowerCase()} specijalista?`,
        answer:
          "Preporučujemo posetu kod specijaliste ako imate specifične simptome ili na preporuku vašeg ljekara opšte prakse. Redovne preventivne kontrole su također važne za rano otkrivanje potencijalnih problema.",
      },
      {
        question: "Kako se pripremiti za pregled?",
        answer:
          "Ponesite prethodne medicinske nalaze, listu lijekova koje trenutno koristite, zdravstvenu knjižicu i listu pitanja koja želite postaviti ljekaru. Ako imate alergije ili hronične bolesti, obavezno to navedite.",
      },
      {
        question: "Koliko traje pregled?",
        answer:
          "Trajanje pregleda zavisi od vrste pregleda i kompleksnosti vašeg stanja, ali obično traje između 20-45 minuta. Prvi pregled može trajati duže zbog detaljne anamneze.",
      },
      {
        question: "Da li je potrebno zakazivanje?",
        answer:
          "Preporučujemo zakazivanje termina kako biste izbjegli čekanje. Možete zakazati online preko naše platforme ili telefonom direktno kod ordinacije.",
      },
    ],
    [specialtyName]
  );

  const defaultUsluge = useMemo(
    () => [
      { naziv: "Stručni pregledi i konsultacije" },
      { naziv: "Moderna dijagnostika" },
      { naziv: "Individualni pristup svakom pacijentu" },
      { naziv: "Online zakazivanje termina" },
      { naziv: "Brzi termini i fleksibilno radno vrijeme" },
      { naziv: "Kvalitetna zdravstvena njega" },
    ],
    []
  );

  const displayFaqs = useMemo(() => {
    if (dbFaq.length > 0) {
      return dbFaq.map((f: any) => ({ question: f.pitanje, answer: f.odgovor }));
    }
    return defaultFaqs;
  }, [dbFaq, defaultFaqs]);

  const displayUsluge = useMemo(() => {
    if (dbUsluge.length > 0) return dbUsluge;
    return defaultUsluge;
  }, [dbUsluge, defaultUsluge]);

  // Doctors
  const allDoctors: Doctor[] = specialtyInfo?.doktori || [];
  const totalDoctors = allDoctors.length;
  const totalPages = Math.max(1, Math.ceil(totalDoctors / doctorsPerPage));

  const doctors = useMemo(() => {
    const sorted = [...allDoctors].sort(
      (a: any, b: any) => (b.ocjena || 0) - (a.ocjena || 0)
    );

    const startIndex = (currentPage - 1) * doctorsPerPage;
    const endIndex = startIndex + doctorsPerPage;

    return sorted.slice(startIndex, endIndex).map((doctor: any) => ({
      id: doctor.id,
      ime: doctor.ime,
      prezime: doctor.prezime,
      specijalnost: doctor.specijalnost,
      grad: doctor.grad,
      lokacija: doctor.lokacija,
      telefon: doctor.telefon,
      ocjena: doctor.ocjena || 0,
      broj_ocjena: doctor.broj_ocjena || 0,
      prihvata_online: doctor.prihvata_online || false,
      opis: doctor.opis,
      slug: doctor.slug,
      slika_profila: doctor.slika_profila,
      slika_url: doctor.slika_url,
    }));
  }, [allDoctors, currentPage]);

  const loading = loadingSpecialty;

  // SEO
  const seoTitle =
    specialtyInfo?.meta_title ||
    `${specialty.naziv} - Specijalisti i pregledi | WizMedik`;
  const seoDescription =
    specialtyInfo?.meta_description ||
    `${specialty.detaljniOpis} Pronađite najbolje ${specialty.naziv.toLowerCase()} specijaliste u BiH.`;
  const seoKeywords =
    specialtyInfo?.meta_keywords ||
    `${specialty.naziv}, ${specialty.naziv.toLowerCase()} specijalista, zdravstvo BiH`;

  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: specialty.naziv,
      description: specialty.opis,
      url: canonicalUrl,
      about: {
        "@type": "Thing",
        name: specialty.naziv,
        description: specialty.detaljniOpis,
      },
    };
  }, [specialty, canonicalUrl]);

  const faqStructuredData = useMemo(() => {
    if (!displayFaqs?.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: displayFaqs.map((faq: any) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    };
  }, [displayFaqs]);

  const breadcrumbStructuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Specijalnosti",
          item: `${window.location.origin}/specijalnosti`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: specialty.naziv,
          item: canonicalUrl,
        },
      ],
    };
  }, [canonicalUrl, specialty.naziv]);

  const doctorsItemListStructuredData = useMemo(() => {
    if (!allDoctors?.length) return null;

    const max = 50;
    const items = allDoctors.slice(0, max).map((d: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: `${d.ime} ${d.prezime}`,
      url: `${window.location.origin}/doktor/${d.slug}`,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Specijalisti za ${specialty.naziv}`,
      itemListElement: items,
    };
  }, [allDoctors, specialty.naziv]);

  const onPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const onNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  const renderPagination = () => {
    if (totalDoctors <= doctorsPerPage) return null;

    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let p = start; p <= end; p++) pages.push(p);

    return (
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Stranica <span className="font-medium text-foreground">{currentPage}</span> od{" "}
          <span className="font-medium text-foreground">{totalPages}</span> · Ukupno{" "}
          <span className="font-medium text-foreground">{totalDoctors}</span> specijalista
        </p>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onPrevPage} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prethodna
          </Button>

          <div className="flex items-center gap-1">
            {start > 1 && (
              <>
                <Button
                  variant={1 === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(1)}
                >
                  1
                </Button>
                {start > 2 && <span className="px-1 text-muted-foreground">…</span>}
              </>
            )}

            {pages.map((p) => (
              <Button
                key={p}
                variant={p === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}

            {end < totalPages && (
              <>
                {end < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
                <Button
                  variant={totalPages === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(totalPages)}
                >
                  {totalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onNextPage}
            disabled={currentPage === totalPages}
          >
            Sljedeća
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />

        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        {specialtyInfo?.og_image && (
          <meta property="og:image" content={specialtyInfo.og_image} />
        )}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbStructuredData)}</script>
        {faqStructuredData && (
          <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>
        )}
        {doctorsItemListStructuredData && (
          <script type="application/ld+json">{JSON.stringify(doctorsItemListStructuredData)}</script>
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-2 md:py-4">
          <Breadcrumb
            items={[
              { label: "Specijalnosti", href: "/specijalnosti" },
              { label: specialty.naziv },
            ]}
          />

          {/* Header */}
          <header className="mt-2 mb-6 md:mb-8">
  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
    <div className="hidden sm:flex w-14 h-14 bg-primary text-white rounded-2xl items-center justify-center shrink-0">
      <Stethoscope className="w-7 h-7" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-snug">
          {specialty.naziv}
        </h1>

        {totalDoctors > 0 && (
          <Badge variant="secondary" className="text-[11px] leading-4">
            {totalDoctors} specijalista
          </Badge>
        )}
      </div>

      <p className="mt-1 text-sm sm:text-base text-muted-foreground leading-relaxed">
        {specialty.opis}
      </p>
    </div>
  </div>

            {/* Optional Stats */}
            {specialtySettings?.show_stats === true && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">{totalDoctors}+</p>
                      <p className="text-sm text-muted-foreground">Specijalista</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <Award className="w-8 h-8 text-accent" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">4.7</p>
                      <p className="text-sm text-muted-foreground">Prosječna ocjena</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <Clock className="w-8 h-8 text-medical-success" />
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-foreground">24/7</p>
                      <p className="text-sm text-muted-foreground">Online zakazivanje</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </header>

          {isError && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Došlo je do greške pri učitavanju specijalnosti. Pokušajte ponovo.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Parent category */}
          {specialtyInfo?.parent && (
            <Card className="mb-8 bg-muted/40">
              <CardContent className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Dio specijalnosti</p>
                  <p className="text-sm text-foreground font-medium">{specialtyInfo.parent.naziv}</p>
                </div>

                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <Link to={`/specijalnost/${specialtyInfo.parent.slug}`} className="gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Otvori parent specijalnost
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Subcategories */}
          {specialtyInfo?.children && specialtyInfo.children.length > 0 && (
            <Card className="mb-8 sm:mb-10">
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">Podspecijalnosti</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {specialtyInfo.children.map((child: any) => (
                    <Link
                      key={child.id}
                      to={`/specijalnost/${child.slug}`}
                      className="block focus:outline-none"
                      aria-label={`Otvori podspecijalnost: ${child.naziv}`}
                    >
                      <Card className="p-4 transition-shadow sm:hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm sm:text-[15px] text-foreground leading-snug">
                              {child.naziv}
                            </h3>
                            {child.opis && (
                              <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                                {child.opis}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uvodni tekst */}
          {specialtyInfo?.uvodni_tekst && (
            <Card className="mb-8 sm:mb-10 bg-primary/5">
              <CardContent className="pt-6">
                <div
                  className={PROSE_CLASS}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(specialtyInfo.uvodni_tekst),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* About */}
          <Card className="mb-8 sm:mb-10">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">O specijalnosti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed">
                {specialtyInfo?.detaljan_opis || specialty.detaljniOpis}
              </p>

              <h3 className="mt-6 font-semibold text-sm sm:text-base mb-3">
                Usluge koje pružamo
              </h3>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayUsluge.map((usluga: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <span className="text-foreground font-medium text-sm sm:text-[15px]">
                        {usluga.naziv || usluga}
                      </span>
                      {usluga.opis && (
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {usluga.opis}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* YouTube */}
          {dbYoutubeLinks.length > 0 && (
            <Card className="mb-8 sm:mb-10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Play className="w-5 h-5 text-red-500" />
                  Savjeti iz oblasti {specialty.naziv}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {dbYoutubeLinks.map((video: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="aspect-video rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(video.url)}
                          title={video.naslov}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground text-sm sm:text-[15px]">
                          {video.naslov}
                        </h4>
                        {video.opis && (
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {video.opis}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* FAQ */}
          <Card className="mb-8 sm:mb-10">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Često postavljana pitanja</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {displayFaqs.map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-sm sm:text-[15px]">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Clinics CTA */}
          <section className="mb-8 sm:mb-10">
            <Card className="p-4 sm:p-6 bg-gradient-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold mb-1">
                    Klinike sa {specialty.naziv} uslugama
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pogledajte klinike koje nude usluge {specialty.naziv.toLowerCase()} specijalnosti
                  </p>
                </div>
                <Button
                  variant="medical"
                  onClick={() => navigate(`/klinike/specijalnost/${naziv?.toLowerCase()}`)}
                  className="w-full sm:w-auto"
                >
                  Pogledajte klinike
                </Button>
              </div>
            </Card>
          </section>

          {/* Doctors */}
          <section>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">
                Naši {specialty.naziv} specijalisti
              </h2>
              <p className="text-sm text-muted-foreground">
                Sortirano po ocjeni (najbolje prvo)
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 sm:h-96 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <Card className="p-8 sm:p-12 text-center">
                <Stethoscope className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="text-base sm:text-xl font-semibold mb-2">
                  Trenutno nemamo registrovanih specijalista
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Radimo na dodavanju novih {specialty.naziv.toLowerCase()} specijalista
                </p>
                <Button variant="medical" onClick={() => navigate("/")}>
                  Nazad na početnu
                </Button>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {doctors.map((doctor) => (
                    <DoctorCard
                      key={doctor.id}
                      doctor={{
                        id: doctor.id,
                        slug: doctor.slug,
                        ime: doctor.ime,
                        prezime: doctor.prezime,
                        specijalnost: doctor.specijalnost,
                        grad: doctor.grad,
                        lokacija: doctor.lokacija,
                        telefon: doctor.telefon,
                        ocjena: doctor.ocjena,
                        broj_ocjena: doctor.broj_ocjena,
                        slika_profila: doctor.slika_profila || doctor.slika_url,
                        prihvata_online: doctor.prihvata_online,
                      }}
                    />
                  ))}
                </div>

                {renderPagination()}
              </>
            )}
          </section>

          {/* Zaključni tekst */}
          {specialtyInfo?.zakljucni_tekst && (
            <Card className="mt-8 sm:mt-10 bg-muted/40">
              <CardContent className="pt-6">
                <div
                  className={PROSE_CLASS}
                  dangerouslySetInnerHTML={{
                    __html: sanitizeRichText(specialtyInfo.zakljucni_tekst),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {/* Ask question CTA */}
          <Card className="mt-8 sm:mt-10 p-5 sm:p-8 bg-primary text-white text-center">
            <h3 className="text-lg sm:text-2xl font-bold mb-2">
              Imate pitanje iz oblasti {specialty.naziv}?
            </h3>
            <p className="text-sm sm:text-base text-white/85 mb-5 leading-relaxed">
              Postavite pitanje i dobijte besplatan odgovor od naših stručnjaka
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                navigate(`/postavi-pitanje?specijalnost=${encodeURIComponent(specialty.naziv)}`)
              }
              className="w-full sm:w-auto"
            >
              Postavi pitanje
            </Button>
          </Card>
        </main>
      </div>
    </>
  );
}
