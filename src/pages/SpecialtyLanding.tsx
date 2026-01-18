import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DOMPurify from 'dompurify';
import { useParams, useNavigate } from 'react-router-dom';
import { specialtiesAPI } from '@/services/api';
import { queryKeys } from '@/lib/queryClient';
import { Navbar } from '@/components/Navbar';
import { DoctorCard } from '@/components/DoctorCard';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Stethoscope, Users, Award, Clock, Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const slugToName = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/Opsta/g, 'Opšta')
    .replace(/Decja/g, 'Dečja')
    .replace(/Zenska/g, 'Ženska');
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
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : url;
};

const specialtyData: Record<string, {
  naziv: string;
  opis: string;
  detaljniOpis: string;
  faqs: Array<{ question: string; answer: string }>;
  keyPoints: string[];
}> = {
  'kardiologija': {
    naziv: 'Kardiologija',
    opis: 'Dijagnostika i liječenje bolesti srca i krvnih sudova',
    detaljniOpis: 'Kardiologija je grana medicine koja se bavi dijagnosticiranjem i liječenjem bolesti srca i krvnih sudova. Naši kardiolozi su specijalizirani za tretman različitih stanja uključujući aritmije, srčanu insuficijenciju, koronarnu bolest srca i hipertenziju.',
    keyPoints: ['EKG i Holter monitoring', 'Ultrazvuk srca (ehokardiografija)', 'Test opterećenja', 'Preventivne kontrole', 'Liječenje visokog krvnog pritiska', 'Rehabilitacija nakon infarkta'],
    faqs: [
      { question: 'Kada trebam posjetiti kardiologa?', answer: 'Trebali biste posjetiti kardiologa ako imate bol u grudima, otežano disanje, nepravilan rad srca, visok krvni pritisak ili pozitivnu porodičnu istoriju srčanih bolesti.' },
      { question: 'Kako se pripremiti za kardiološki pregled?', answer: 'Ponesите listu svih lijekova koje uzimate, rezultate prethodnih pregleda, i budite spremni razgovarati o vašim simptomima i životnim navikama.' },
      { question: 'Koliko često trebam ići na kontrole?', answer: 'Frekvencija kontrola zavisi od vašeg stanja. Osobe sa dijagnosticiranim srčanim problemima obično trebaju kontrole svakih 3-6 mjeseci.' }
    ]
  },
  'pedijatrija': {
    naziv: 'Pedijatrija',
    opis: 'Zdravstvena zaštita djece od rođenja do adolescencije',
    detaljniOpis: 'Pedijatrija se bavi sveukupnim zdravljem, razvojem i liječenjem djece. Naši pedijatri pružaju preventivnu njegu, dijagnostiku i liječenje akutnih i hroničnih bolesti kod djece.',
    keyPoints: ['Redovne kontrole razvoja', 'Vakcinacija', 'Liječenje akutnih infekcija', 'Praćenje rasta i razvoja', 'Savjetovanje o ishrani', 'Liječenje hroničnih stanja kod djece'],
    faqs: [
      { question: 'Kada dijete treba prvu kontrolu?', answer: 'Prva kontrola kod pedijatra obično je u prvoj sedmici života. Nakon toga slijede redovne kontrole prema kalendaru razvoja djeteta.' },
      { question: 'Kako često dijete treba dolaziti na kontrole?', answer: 'U prvoj godini života preporučuju se mjesečne kontrole, zatim kontrole svakih 3-6 mjeseci do treće godine, i godišnje nakon toga.' },
      { question: 'Šta da ponesem na kontrolu?', answer: 'Ponesите zdravstvenu knjižicu djeteta, listu pitanja koja imate, i evidenciju o ishrani i spavanju ako je dijete mlado.' }
    ]
  },
  'ortopedija': {
    naziv: 'Ortopedija',
    opis: 'Dijagnostika i liječenje bolesti i povreda mišićno-koštanog sistema',
    detaljniOpis: 'Ortopedija se bavi prevencijom, dijagnozom i liječenjem poremećaja kostiju, zglobova, ligamenata, tetiva i mišića.',
    keyPoints: ['Liječenje preloma', 'Artoskopske operacije', 'Zamjena zglobova', 'Liječenje sportskih povreda', 'Korekcija deformiteta', 'Fizikalna terapija'],
    faqs: [
      { question: 'Koje su najčešće ortopedske povrede?', answer: 'Najčešće su prelomi kostiju, istegnuća, iščašenja zglobova, sportske povrede ligamenata i artritične promjene.' },
      { question: 'Da li je potrebna operacija za sve ortopedske probleme?', answer: 'Ne, mnogi ortopedski problemi se mogu riješiti konzervativnim liječenjem kao što su fizikalna terapija, lijekovi i odmor.' },
      { question: 'Koliko traje oporavak nakon ortopedske operacije?', answer: 'Vrijeme oporavka varira od nekoliko sedmica do nekoliko mjeseci, zavisno od tipa operacije i vašeg općeg zdravlja.' }
    ]
  }
};

export default function SpecialtyLanding() {
  const { naziv } = useParams<{ naziv: string }>();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const doctorsPerPage = 12;

  const specialtyKey = naziv?.toLowerCase() || '';
  
  // Fetch specialty settings
  const { data: specialtySettings } = useQuery({
    queryKey: ['specialty-settings'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/settings/specialty-template`);
      const data = await response.json();
      console.log('Specialty settings loaded:', data);
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch specialty info with React Query
  const { data: specialtyInfo, isLoading: loadingSpecialty } = useQuery({
    queryKey: queryKeys.specialties.detail(naziv || ''),
    queryFn: async () => {
      const response = await specialtiesAPI.getBySlug(naziv || '');
      console.log('Specialty data loaded:', response.data);
      return response.data;
    },
    enabled: !!naziv,
    staleTime: 30 * 24 * 60 * 60 * 1000, // 30 days - specialty data rarely changes
    gcTime: 60 * 24 * 60 * 60 * 1000, // 60 days
  });

  const hardcodedSpecialty = specialtyData[specialtyKey];
  const specialtyName = hardcodedSpecialty?.naziv || slugToName(naziv || '');

  // Get all doctors from specialty info
  const allDoctors = specialtyInfo?.doktori || [];
  const totalDoctors = allDoctors.length;
  const totalPages = Math.ceil(totalDoctors / doctorsPerPage);
  
  // Paginate doctors
  const startIndex = (currentPage - 1) * doctorsPerPage;
  const endIndex = startIndex + doctorsPerPage;
  const doctors = allDoctors
    .sort((a: any, b: any) => (b.ocjena || 0) - (a.ocjena || 0))
    .slice(startIndex, endIndex)
    .map((doctor: any) => ({
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
      slika_profila: doctor.slika_profila
    }));

  const loading = loadingSpecialty;

  const specialty = hardcodedSpecialty || {
    naziv: specialtyInfo?.naziv || specialtyName,
    opis: specialtyInfo?.opis || `Dijagnostika i liječenje u oblasti ${specialtyName.toLowerCase()}`,
    detaljniOpis: specialtyInfo?.detaljan_opis || specialtyInfo?.opis || `Pronađite kvalifikovane ${specialtyName.toLowerCase()} specijaliste u BiH.`,
    keyPoints: ['Stručni pregledi', 'Moderna dijagnostika', 'Individualni pristup', 'Online zakazivanje', 'Brzi termini', 'Kvalitetna usluga'],
    faqs: [
      { question: `Kada trebam posjetiti ${specialtyName.toLowerCase()} specijalista?`, answer: 'Preporučujemo posetu kod specijaliste ako imate specifične simptome ili na preporuku vašeg ljekara opšte prakse.' },
      { question: 'Kako se pripremiti za pregled?', answer: 'Ponesите prethodne medicinske nalaze, listu lijekova koje koristite i zdravstvenu knjižicu.' },
      { question: 'Koliko traje pregled?', answer: 'Trajanje pregleda zavisi od vrste pregleda, ali obično traje između 20-45 minuta.' }
    ]
  };

  // Get custom data from database if available
  const dbYoutubeLinks = specialtyInfo?.prikazi_video_savjete ? (specialtyInfo?.youtube_linkovi || []) : [];
  const dbFaq = specialtyInfo?.prikazi_faq ? (specialtyInfo?.faq || []) : [];
  const dbUsluge = specialtyInfo?.prikazi_usluge ? (specialtyInfo?.usluge || []) : [];
  const displayFaqs = dbFaq.length > 0 ? dbFaq.map((f: any) => ({ question: f.pitanje, answer: f.odgovor })) : specialty.faqs;
  const displayUsluge = dbUsluge.length > 0 ? dbUsluge : specialty.keyPoints.map((k: string) => ({ naziv: k }));

  // SEO data
  const seoTitle = specialtyInfo?.meta_title || `${specialty.naziv} - Specijalisti i pregledi | MediBIH`;
  const seoDescription = specialtyInfo?.meta_description || `${specialty.detaljniOpis} Pronađite najbolje ${specialty.naziv.toLowerCase()} specijaliste u BiH.`;
  const seoKeywords = specialtyInfo?.meta_keywords || `${specialty.naziv}, ${specialty.naziv.toLowerCase()} specijalista, zdravstvo BiH`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalSpecialty",
    "name": specialty.naziv,
    "description": specialty.opis,
    "relevantSpecialty": specialty.detaljniOpis
  };

  const faqStructuredData = displayFaqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": displayFaqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
    }))
  } : null;

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <meta name="keywords" content={seoKeywords} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        {specialtyInfo?.og_image && <meta property="og:image" content={specialtyInfo.og_image} />}
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        {faqStructuredData && <script type="application/ld+json">{JSON.stringify(faqStructuredData)}</script>}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: 'Specijalnosti', href: '/specijalnosti' },
            { label: specialty.naziv }
          ]} />

          <header className="mb-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center">
                <Stethoscope className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">{specialty.naziv}</h1>
                <p className="text-xl text-muted-foreground">{specialty.opis}</p>
              </div>
            </div>

            {/* Stats Section - Conditionally rendered */}
            {specialtySettings?.show_stats === true && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <Users className="w-10 h-10 text-primary" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">{totalDoctors}+</p>
                      <p className="text-muted-foreground">Specijalista</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <Award className="w-10 h-10 text-accent" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">4.7</p>
                      <p className="text-muted-foreground">Prosječna ocjena</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 flex items-center gap-4">
                    <Clock className="w-10 h-10 text-medical-success" />
                    <div>
                      <p className="text-3xl font-bold text-foreground">24/7</p>
                      <p className="text-muted-foreground">Online zakazivanje</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </header>

          {/* Parent category link if this is a subcategory */}
          {specialtyInfo?.parent && (
            <Card className="mb-8 bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-2">Dio specijalnosti:</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/specijalnost/${specialtyInfo.parent.slug}`)}
                  className="gap-2"
                >
                  <Stethoscope className="w-4 h-4" />
                  {specialtyInfo.parent.naziv}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Subcategories section */}
          {specialtyInfo?.children && specialtyInfo.children.length > 0 && (
            <Card className="mb-12">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {specialtyInfo.children.map((child: any) => (
                    <Card 
                      key={child.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary"
                      onClick={() => navigate(`/specijalnost/${child.slug}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{child.naziv}</h3>
                            {child.opis && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{child.opis}</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uvodni tekst iz baze */}
          {specialtyInfo?.uvodni_tekst && (
            <Card className="mb-12 bg-primary/5">
              <CardContent className="pt-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(specialtyInfo.uvodni_tekst) }} />
              </CardContent>
            </Card>
          )}

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>O specijalnosti</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                {specialtyInfo?.detaljan_opis || specialty.detaljniOpis}
              </p>
              
              <h3 className="font-semibold text-lg mb-4">Usluge koje pružamo:</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayUsluge.map((usluga: any, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-foreground font-medium">{usluga.naziv || usluga}</span>
                      {usluga.opis && <p className="text-sm text-muted-foreground">{usluga.opis}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* YouTube Savjeti */}
          {dbYoutubeLinks.length > 0 && (
            <Card className="mb-12">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-500" />
                  Savjeti iz oblasti {specialty.naziv}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dbYoutubeLinks.map((video: any, index: number) => (
                    <div key={index} className="space-y-3">
                      <div className="aspect-video rounded-lg overflow-hidden bg-black">
                        <iframe
                          src={getYouTubeEmbedUrl(video.url)}
                          title={video.naslov}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{video.naslov}</h4>
                        {video.opis && <p className="text-sm text-muted-foreground">{video.opis}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Često postavljana pitanja</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {displayFaqs.map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          <section className="mb-12">
            <Card className="p-6 bg-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Klinike sa {specialty.naziv} uslugama</h3>
                  <p className="text-muted-foreground">Pogledajte sve klinike koje nude usluge {specialty.naziv.toLowerCase()} specijalnosti</p>
                </div>
                <Button variant="medical" onClick={() => navigate(`/klinike/specijalnost/${naziv?.toLowerCase()}`)}>
                  Pogledajte klinike
                </Button>
              </div>
            </Card>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Naši {specialty.naziv} specijalisti</h2>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-96 bg-muted rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : doctors.length === 0 ? (
              <Card className="p-12 text-center">
                <Stethoscope className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Trenutno nemamo registrovanih specijalista</h3>
                <p className="text-muted-foreground mb-6">Radimo na dodavanju novih {specialty.naziv.toLowerCase()} specijalista</p>
                <Button variant="medical" onClick={() => navigate('/')}>Nazad na početnu</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {doctors.map(doctor => (
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
                      prihvata_online: doctor.prihvata_online
                    }}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Zaključni tekst iz baze */}
          {specialtyInfo?.zakljucni_tekst && (
            <Card className="mt-12 bg-muted/50">
              <CardContent className="pt-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(specialtyInfo.zakljucni_tekst) }} />
              </CardContent>
            </Card>
          )}

          {/* Postavi pitanje CTA */}
          <Card className="mt-12 p-8 bg-primary text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Imate pitanje iz oblasti {specialty.naziv}?</h3>
            <p className="text-white/80 mb-6">Postavite pitanje i dobijte besplatan odgovor od naših stručnjaka</p>
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate(`/postavi-pitanje?specijalnost=${encodeURIComponent(specialty.naziv)}`)}
            >
              Postavi pitanje
            </Button>
          </Card>
        </main>
      </div>
    </>
  );
}

