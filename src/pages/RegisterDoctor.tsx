import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Shield,
  Stethoscope,
  Users,
  Wallet,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DoctorRegistrationForm } from '@/components/DoctorRegistrationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function RegisterDoctor() {
  const [showForm, setShowForm] = useState(false);

  const heroHighlights = useMemo(
    () => [
      { icon: BadgeCheck, text: '30 dana besplatno' },
      { icon: Wallet, text: '100 KM mjesečno nakon probnog perioda' },
      { icon: Calendar, text: 'Online zakazivanje po želji' },
      { icon: BookOpen, text: 'Usluge, cijene i savjeti na jednom mjestu' },
    ],
    []
  );

  const whatYouGetCards = useMemo(
    () => [
      {
        icon: Award,
        title: 'Profesionalan profil doktora',
        description: 'Predstavite svoju specijalnost, iskustvo i način rada na jasan i uredan način.',
      },
      {
        icon: Wallet,
        title: 'Usluge i cijene na jednom mjestu',
        description: 'Dodajte svoj cjenovnik kako bi pacijenti unaprijed znali šta nudite.',
      },
      {
        icon: Clock,
        title: 'Radno vrijeme i kontakt podaci',
        description: 'Telefon, email, web stranica i dostupnost ordinacije pregledno prikazani.',
      },
      {
        icon: MapPin,
        title: 'Lokacija ordinacije',
        description: 'Pomozite pacijentima da vas lakše pronađu prema gradu i adresi.',
      },
      {
        icon: Calendar,
        title: 'Opcionalno online zakazivanje',
        description: 'Ako želite, omogućite slanje upita i rezervaciju termina online.',
      },
      {
        icon: BookOpen,
        title: 'Savjeti i blog objave',
        description: 'Objavljujte stručne tekstove i dodatno gradite povjerenje.',
      },
    ],
    []
  );

  const profileSections = useMemo(
    () => [
      {
        icon: Award,
        title: 'Profesionalne informacije',
        items: [
          'ime i prezime doktora',
          'specijalnost i oblasti rada',
          'opis iskustva i stručnog fokusa',
          'fotografiju i osnovne podatke o praksi',
        ],
      },
      {
        icon: Wallet,
        title: 'Usluge i cjenovnik',
        items: [
          'pregled usluga koje nudite',
          'cijene pregleda, konsultacija i tretmana',
          'jasniji uvid za pacijente prije kontakta',
        ],
      },
      {
        icon: Phone,
        title: 'Kontakt i dostupnost',
        items: ['telefon', 'email', 'web stranicu', 'radno vrijeme', 'lokaciju ordinacije'],
      },
      {
        icon: Calendar,
        title: 'Online zakazivanje',
        items: [
          'opcionalna mogućnost online zakazivanja',
          'jednostavnije slanje upita i rezervacija termina',
          'manje poziva i lakša organizacija',
        ],
      },
      {
        icon: BookOpen,
        title: 'Stručni savjeti i blog objave',
        items: [
          'objavu edukativnih tekstova',
          'savjete za pacijente',
          'teme vezane za prevenciju, dijagnostiku i tretmane',
        ],
      },
    ],
    []
  );

  const discoveryItems = useMemo(
    () => [
      { icon: Search, title: 'Pretraga po specijalnosti' },
      { icon: MapPin, title: 'Pretraga po gradu i lokaciji' },
      { icon: Stethoscope, title: 'Pregled usluga koje nudite' },
      { icon: MessageSquare, title: 'Lakši kontakt sa doktorom' },
      { icon: Calendar, title: 'Opcionalno online zakazivanje' },
    ],
    []
  );

  const valueCards = useMemo(
    () => [
      {
        icon: Award,
        title: 'Profesionalno predstavljanje',
        description: 'Predstavite sebe, svoju praksu i usluge na uredan i profesionalan način.',
      },
      {
        icon: Users,
        title: 'Jasnije informacije za pacijente',
        description:
          'Pacijenti prije kontakta mogu vidjeti osnovne podatke, usluge, cijene, radno vrijeme i lokaciju.',
      },
      {
        icon: Clock,
        title: 'Manje administrativnih pitanja',
        description: 'Kada su informacije jasno prikazane, smanjuje se broj ponavljajućih pitanja telefonom i porukama.',
      },
      {
        icon: Calendar,
        title: 'Opcija online zakazivanja',
        description: 'Ako želite, pacijenti mogu slati zahtjeve za termin ili zakazivati online.',
      },
      {
        icon: BookOpen,
        title: 'Dodatno povjerenje kroz sadržaj',
        description: 'Objavom savjeta i stručnih tekstova gradite autoritet i povjerenje kod pacijenata.',
      },
    ],
    []
  );

  const blogBenefits = useMemo(
    () => [
      'edukaciju pacijenata',
      'predstavljanje vašeg pristupa radu',
      'pojašnjenje pregleda, tretmana i procedura',
      'jačanje profesionalnog imidža',
    ],
    []
  );

  const profileContactItems = useMemo(
    () => [
      { icon: Phone, label: 'Telefon i direktni kontakt' },
      { icon: Mail, label: 'Email za upite pacijenata' },
      { icon: Globe, label: 'Web stranica i dodatne informacije' },
      { icon: MapPin, label: 'Lokacija ordinacije i grad' },
    ],
    []
  );

  const pricingItems = useMemo(
    () => [
      'Profesionalan profil doktora',
      'Usluge, cijene i radno vrijeme',
      'Kontakt podaci i lokacija ordinacije',
      'Opcionalno online zakazivanje',
      'Objava stručnih savjeta i blog tekstova',
    ],
    []
  );

  const metaDescription =
    'Registrujte se kao doktor na wizMedik-u i predstavite svoju praksu profesionalno. Dodajte usluge, cijene, radno vrijeme, kontakt podatke, lokaciju i po želji uključite online zakazivanje. 30 dana besplatno, zatim 100 KM mjesečno.';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Registracija doktora | wizMedik',
    description: metaDescription,
    url: 'https://wizmedik.com/register/doctor',
  };

  if (showForm) {
    return (
      <>
        <Helmet>
          <title>Registracija doktora | wizMedik</title>
          <meta name="description" content={metaDescription} />
          <link rel="canonical" href="https://wizmedik.com/register/doctor" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="pt-20">
            <DoctorRegistrationForm />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Registracija doktora | wizMedik</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href="https://wizmedik.com/register/doctor" />
        <meta property="og:title" content="Registracija doktora | wizMedik" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/12 via-background to-background" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-20">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Za doktore i privatne prakse
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
                  Predstavite svoju praksu profesionalno na wizMedik-u
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                  Pacijenti vas mogu pronaći po specijalnosti, gradu i uslugama, pregledati vaše radno vrijeme,
                  kontakt podatke, lokaciju i cjenovnik, a po želji vam mogu poslati upit ili zakazati termin online.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="h-11 rounded-xl px-6" onClick={() => setShowForm(true)}>
                    Kreirajte profil doktora
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-11 rounded-xl px-6" asChild>
                    <Link to="/contact">
                      Kontaktirajte nas
                      <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {heroHighlights.map((item, index) => (
                    <span key={index} className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4 text-primary" />
                      {item.text}
                    </span>
                  ))}
                </div>
              </div>

              <Card className="rounded-2xl border-gray-200/70 bg-white/75 backdrop-blur">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-xl font-bold tracking-tight">Na profilu možete jasno prikazati</h2>
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    {whatYouGetCards.map((card, index) => (
                      <div key={index} className="rounded-xl border bg-white p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <card.icon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-medium leading-snug">{card.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl border-gray-200/70">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Šta wizMedik omogućava doktorima?</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  wizMedik je platforma na kojoj doktori mogu predstaviti svoju praksu na jasan, profesionalan i
                  pregledan način. Vaš profil može sadržavati ključne informacije koje pacijentima pomažu da vas lakše
                  pronađu i upoznaju vaše usluge prije nego što vas kontaktiraju.
                </p>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Bilo da želite samo profesionalno online prisustvo ili i opciju online zakazivanja, wizMedik vam daje
                  mogućnost da svoj profil prilagodite načinu rada vaše ordinacije ili privatne prakse.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Šta vaš profil može sadržavati</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                Konkretne informacije koje pomažu pacijentima da vas upoznaju prije prvog kontakta.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {profileSections.map((section, index) => (
                <Card key={index} className="rounded-2xl border-gray-200/70">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <section.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{section.title}</h3>
                    <ul className="mt-4 space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                Budite prisutni kada pacijenti pretražuju doktore
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Pacijenti na wizMedik-u mogu pretraživati doktore prema specijalnosti, gradu, lokaciji i vrsti usluge.
                To znači da vaš profil može biti prikazan korisnicima koji upravo traže uslugu koju nudite.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Na taj način wizMedik pomaže da vaše usluge budu vidljivije, a pacijentima olakšava pronalazak
                odgovarajućeg doktora.
              </p>
            </div>

            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {discoveryItems.map((item, index) => (
                <Card key={index} className="rounded-xl border-gray-200/70">
                  <CardContent className="p-5">
                    <item.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium leading-snug">{item.title}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Zašto biti prisutan na wizMedik-u</h2>
            </div>
            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {valueCards.map((card, index) => (
                <Card key={index} className="rounded-2xl border-gray-200/70">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{card.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 items-stretch">
              <Card className="rounded-2xl border-gray-200/70">
                <CardContent className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dijelite stručne savjete i gradite povjerenje</h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Kroz wizMedik možete objavljivati savjete, edukativne tekstove i blog objave za pacijente. To vam
                    omogućava da dodatno predstavite svoju stručnost, približite važne teme pacijentima i izgradite
                    profesionalan odnos povjerenja.
                  </p>
                  <div className="mt-5 space-y-2.5">
                    {blogBenefits.map((item, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-gray-200/70 bg-gradient-to-b from-primary/10 to-background">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl font-semibold">Kontakt i dostupnost na jednom mjestu</h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                    Kada pacijenti vide jasne informacije, lakše vas kontaktiraju i donose odluku o pregledu.
                  </p>
                  <div className="mt-5 space-y-3">
                    {profileContactItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 rounded-lg border bg-white/80 p-3">
                        <item.icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl border-gray-200/70">
              <CardContent className="p-6 md:p-8 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Online zakazivanje nije obavezno
                </div>
                <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight">Online zakazivanje je opcionalno</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Na wizMedik-u možete imati profesionalan profil i bez uključivanja online zakazivanja. Ako želite, ovu
                  opciju možete aktivirati kako bi pacijenti lakše slali zahtjeve za termin ili rezervisali pregled
                  online.
                </p>
                <p className="mt-3 text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  Na vama je da odaberete način rada koji najbolje odgovara vašoj ordinaciji ili privatnoj praksi.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Jednostavno i jasno</h2>
            </div>

            <Card className="mt-8 rounded-2xl border-primary/40 shadow-lg overflow-hidden">
              <div className="bg-primary/10 px-6 py-4 text-center">
                <p className="text-sm font-semibold text-primary">Registracija na wizMedik je jednostavna</p>
              </div>
              <CardContent className="p-7 md:p-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-white p-5 text-center">
                    <div className="text-sm font-semibold">Probni period</div>
                    <div className="mt-2 text-4xl font-bold">30 dana</div>
                    <p className="mt-1 text-sm text-muted-foreground">besplatno</p>
                  </div>
                  <div className="rounded-xl border bg-white p-5 text-center">
                    <div className="text-sm font-semibold">Nakon probnog perioda</div>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">100</span>
                      <span className="text-muted-foreground"> KM</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">mjesečno</p>
                  </div>
                </div>

                <p className="mt-6 text-sm text-muted-foreground text-center">
                  U okviru profila možete predstaviti svoje usluge, cijene, radno vrijeme, kontakt podatke, lokaciju i,
                  po želji, omogućiti online zakazivanje i objavu stručnih savjeta.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-2.5">
                  {pricingItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full h-11 rounded-xl mt-7" onClick={() => setShowForm(true)}>
                  Pokrenite 30 dana besplatno
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-14 md:py-20 border-t">
          <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl border-gray-200/70 bg-gradient-to-b from-primary/10 to-background">
              <CardContent className="p-8 md:p-10 text-center">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                  Predstavite svoju praksu na mjestu gdje vas pacijenti mogu lakše pronaći
                </h2>
                <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Kreirajte profil doktora na wizMedik-u i omogućite pacijentima da na jednom mjestu vide vaše usluge,
                  cijene, radno vrijeme, kontakt podatke i lokaciju, uz mogućnost objave stručnih savjeta i online
                  zakazivanja.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="h-11 rounded-xl px-8" onClick={() => setShowForm(true)}>
                    Kreirajte profil doktora
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl px-8" asChild>
                    <Link to="/contact">Kontaktirajte nas</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
