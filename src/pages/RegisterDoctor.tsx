import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Stethoscope,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Shield,
  CheckCircle2,
  Star,
  Smartphone,
  BarChart3,
  MessageSquare,
  Award,
  ArrowRight,
  BadgeCheck,
  Zap,
  Wallet,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { DoctorRegistrationForm } from '@/components/DoctorRegistrationForm';

export default function RegisterDoctor() {
  const [showForm, setShowForm] = useState(false);

  // Hooks MORAJU biti prije bilo kakvog early return-a!
  const benefits = useMemo(
    () => [
      {
        icon: Users,
        title: 'Više pacijenata',
        description: 'Budite vidljivi pacijentima koji traže vašu specijalnost u vašem gradu i okolini.',
      },
      {
        icon: Calendar,
        title: 'Online zakazivanje',
        description: 'Automatizujte zakazivanje termina i rasteretite administraciju.',
      },
      {
        icon: Clock,
        title: 'Manje poziva, više pregleda',
        description: 'Smanjite broj poziva i poruka za termine — pacijenti biraju slobodan termin online.',
      },
      {
        icon: TrendingUp,
        title: 'Bolja popunjenost rasporeda',
        description: 'Optimizujte raspored i smanjite prazne termine kroz pregled i planiranje.',
      },
      {
        icon: Shield,
        title: 'Sigurnost podataka',
        description: 'Fokus na privatnosti i sigurnom radu sistema za zdravstvene profesionalce.',
      },
      {
        icon: Star,
        title: 'Reputacija i povjerenje',
        description: 'Profesionalan profil i povratne informacije pomažu pacijentima da odaberu baš vas.',
      },
    ],
    []
  );

  const features = useMemo(
    () => [
      {
        icon: Smartphone,
        title: 'Jednostavno na svim uređajima',
        description: 'Upravljajte terminima i profilom brzo i pregledno — na telefonu ili računaru.',
      },
      {
        icon: MessageSquare,
        title: 'Notifikacije i komunikacija',
        description: 'Pregled upita i obavještenja na jednom mjestu.',
      },
      {
        icon: BarChart3,
        title: 'Uvid u potražnju',
        description: 'Pratite trendove: pregledi profila, upiti i interesovanje pacijenata.',
      },
      {
        icon: Award,
        title: 'Profesionalni profil',
        description: 'Specijalnosti, usluge, lokacija, kontakt i jasno predstavljanje pacijentima.',
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      { number: '500+', label: 'Doktora' },
      { number: '50,000+', label: 'Pacijenata' },
      { number: '100,000+', label: 'Zakazanih termina' },
      { number: '4.8/5', label: 'Prosječna ocjena' },
    ],
    []
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Registracija doktora | wizMedik',
    description:
      'Registrujte se kao doktor na wizMedik platformi. 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM).',
    url: 'https://wizmedik.com/register/doctor',
  };

  // Early return POSLIJE svih hooks!
  if (showForm) {
    return (
      <>
        <Helmet>
          <title>Registracija doktora | wizMedik</title>
          <meta
            name="description"
            content="Registrujte se kao doktor na wizMedik platformi. 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM)."
          />
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
        <meta
          name="description"
          content="Registrujte se kao doktor na wizMedik platformi: 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM). Online zakazivanje, profesionalan profil i veća vidljivost pacijentima."
        />
        <link rel="canonical" href="https://wizmedik.com/register/doctor" />
        <meta property="og:title" content="Registracija doktora | wizMedik" />
        <meta
          property="og:description"
          content="30 dana besplatno. Nakon toga 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM). Registrujte se kao doktor na wizMedik platformi."
        />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* HERO */}
        <section className="relative overflow-hidden border-b">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/12 via-background to-background" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          </div>

        <div className="relative max-w-7xl mx-auto px-4 py-14 md:py-18">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Za doktore i zdravstvene profesionalce
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
                  Povećajte vidljivost i zakazivanje — uz profesionalan profil na wizMedik
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Učinite da vas pacijenti lakše pronađu, omogućite online zakazivanje i rasteretite administraciju.
                  wizMedik je mjesto gdje pacijenti traže doktore po specijalnosti i lokaciji.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="h-11 rounded-xl px-6" onClick={() => setShowForm(true)}>
                    Registrujte se
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button size="lg" variant="outline" className="h-11 rounded-xl px-6" asChild>
                    <Link to="/contact">
                      Kontakt
                      <ArrowRight className="h-4 w-4 ml-2 opacity-70" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    30 dana besplatno
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    Bez obaveza
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Sigurnost podataka
                  </span>
                </div>
              </div>

              {/* Stats (proof) */}
              <div className="hidden lg:block">
                <Card className="rounded-2xl border-gray-200/70 bg-white/70 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-2 gap-6">
                      {stats.map((s, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-4xl font-bold mb-2">{s.number}</div>
                          <div className="text-sm text-muted-foreground">{s.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Online zakazivanje</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Manje poziva, jasniji raspored.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Vidljiv profil</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Pacijenti vas nalaze po specijalnosti.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Notifikacije</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Obavještenja i upiti na jednom mjestu.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Pouzdan sistem</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Fokus na stabilnosti i sigurnosti.
                        </p>
                      </div>
                    </div>

                    <div className="mt-7">
                      <Button className="w-full h-11 rounded-xl" onClick={() => setShowForm(true)}>
                        Pokreni registraciju
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                      <p className="mt-3 text-xs text-muted-foreground text-center">
                        Potrebno je ~2 minute. Email potvrda stiže odmah.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Zašto doktori biraju wizMedik?</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                Praktican sistem za više termina, manje administracije i bolju dostupnost pacijentima.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, idx) => (
                <Card key={idx} className="rounded-2xl border-gray-200/70 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{b.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CTA strip */}
            <div className="mt-10 rounded-2xl border bg-white p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Krenite danas</p>
                <p className="text-sm text-muted-foreground">Registracija je brza, a probni period traje 30 dana.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button className="h-11 rounded-xl w-full md:w-auto" onClick={() => setShowForm(true)}>
                  Registrujte se
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" className="h-11 rounded-xl w-full md:w-auto" asChild>
                  <Link to="/contact">Kontakt</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Funkcionalnosti koje olakšavaju praksu</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                Fokus na onome što vam treba: profil, zakazivanje i komunikacija.
              </p>
            </div>

            <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((f, idx) => (
                <Card key={idx} className="rounded-2xl border-gray-200/70 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                      <f.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* PRICING (single plan like clinics) */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Jednostavan cjenovnik</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                30 dana besplatno. Nakon toga birate mjesečno ili godišnje plaćanje.
              </p>
            </div>

            <div className="mt-10 max-w-3xl mx-auto">
              <Card className="rounded-2xl border-primary/40 shadow-lg overflow-hidden">
                <div className="bg-primary/10 px-6 py-4">
                  <div className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
                    <Wallet className="h-4 w-4" />
                    30 dana besplatno
                  </div>
                </div>

                <CardContent className="p-7 md:p-8">
                  <h3 className="text-2xl font-bold text-center">wizMedik za Doktore</h3>
                  <p className="mt-2 text-center text-sm text-muted-foreground">
                    Godišnje plaćanje donosi uštedu od <span className="font-semibold text-foreground">120 KM</span>.
                  </p>

                  <div className="mt-7 grid sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-white p-5 text-center">
                      <div className="text-sm font-semibold">Mjesečno</div>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">30</span>
                        <span className="text-muted-foreground"> KM</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">po mjesecu</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Ukupno godišnje: <span className="font-medium text-foreground">360 KM</span>
                      </div>
                    </div>

                    <div className="rounded-xl border bg-white p-5 text-center">
                      <div className="text-sm font-semibold">Godišnje</div>
                      <div className="mt-2">
                        <span className="text-4xl font-bold">240</span>
                        <span className="text-muted-foreground"> KM</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">plaćanje za 12 mjeseci</div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Efektivno: <span className="font-medium text-foreground">20 KM/mj</span>
                      </div>
                      <div className="mt-1 text-xs text-primary font-semibold">Uštedite 120 KM</div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        'Profesionalni profil doktora',
                        'Online zakazivanje termina',
                        'Notifikacije i upiti',
                        'Email podrška',
                      ].map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full h-11 rounded-xl mt-7" onClick={() => setShowForm(true)}>
                      Registrujte se
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>

                    <p className="mt-3 text-xs text-muted-foreground text-center">
                      30 dana besplatno • Bez obaveza • Otkaži bilo kada
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground">
                Pitanja prije registracije?{' '}
                <Link to="/contact" className="text-primary font-semibold hover:underline underline-offset-4">
                  Kontaktirajte nas
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-14 md:py-18 border-t">
          <div className="max-w-5xl mx-auto px-4">
            <Card className="rounded-2xl border-gray-200/70 bg-gradient-to-b from-primary/10 to-background">
              <CardContent className="p-8 md:p-10 text-center">
                <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                  Spremni da unaprijedite praksu?
                </h2>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Registrujte se na wizMedik i omogućite pacijentima da vas brže pronađu i zakažu termin online.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="h-11 rounded-xl px-8" onClick={() => setShowForm(true)}>
                    Započnite probni period
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl px-8" asChild>
                    <Link to="/contact">Kontakt</Link>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  30 dana besplatno • 30 KM/mj • ili 240 KM godišnje (ušteda 120 KM)
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
