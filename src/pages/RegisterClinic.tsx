import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  Calendar,
  TrendingUp,
  Shield,
  BarChart3,
  Star,
  Smartphone,
  Settings,
  Globe,
  ArrowRight,
  BadgeCheck,
  Zap,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ClinicRegistrationForm } from '@/components/ClinicRegistrationForm';

export default function RegisterClinic() {
  const [showForm, setShowForm] = useState(false);

  // Hooks MORAJU biti prije bilo kakvog early return-a!
  const benefits = useMemo(
    () => [
      {
        icon: Users,
        title: 'Upravljanje timom',
        description: 'Centralno upravljanje sa više doktora i medicinskog osoblja, uz jasne uloge i pristupe.',
      },
      {
        icon: Calendar,
        title: 'Jedinstveno zakazivanje',
        description: 'Termini i rasporedi na jednom mjestu — za sve doktore u klinici.',
      },
      {
        icon: BarChart3,
        title: 'Izvještaji i uvidi',
        description: 'Praćenje učinka i popunjenosti kroz vrijeme — brže odluke, bolja organizacija.',
      },
      {
        icon: TrendingUp,
        title: 'Bolja efikasnost',
        description: 'Smanjite prazne termine i optimizujte kapacitete kroz automatizaciju procesa.',
      },
      {
        icon: Shield,
        title: 'Sigurnost i privatnost',
        description: 'Fokus na zaštiti podataka i sigurnom radu sistema za zdravstvene ustanove.',
      },
      {
        icon: Globe,
        title: 'Online prisutnost',
        description: 'Profesionalni profil klinike na wizMedik platformi, spreman za pacijente.',
      },
    ],
    []
  );

  const features = useMemo(
    () => [
      {
        icon: Settings,
        title: 'Centralizovani dashboard',
        description: 'Uvid u doktore, termine i osnovne postavke klinike — sve na jednom mjestu.',
      },
      {
        icon: Users,
        title: 'Upravljanje osobljem',
        description: 'Dodajte doktore, definišite uloge i pratite performanse kroz vrijeme.',
      },
      {
        icon: BarChart3,
        title: 'Pregled učinka',
        description: 'Pratite popunjenost i trendove kako biste bolje planirali kapacitete.',
      },
      {
        icon: Smartphone,
        title: 'Moderan pristup',
        description: 'Jednostavno korištenje za tim i pacijente — jasno, brzo i pregledno.',
      },
    ],
    []
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Registracija klinike | wizMedik',
    description:
      'Registrujte kliniku na wizMedik platformi. 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM).',
    url: 'https://wizmedik.com/register/clinic',
  };

  // Early return POSLIJE svih hooks!
  if (showForm) {
    return (
      <>
        <Helmet>
          <title>Registracija klinike | wizMedik</title>
          <meta
            name="description"
            content="Registrujte kliniku na wizMedik platformi. 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM)."
          />
          <link rel="canonical" href="https://wizmedik.com/register/clinic" />
        </Helmet>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="pt-20">
            <ClinicRegistrationForm />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Registracija klinike | wizMedik</title>
        <meta
          name="description"
          content="Registrujte kliniku na wizMedik platformi: 30 dana besplatno, zatim 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM). Centralizovano zakazivanje i upravljanje timom."
        />
        <link rel="canonical" href="https://wizmedik.com/register/clinic" />
        <meta property="og:title" content="Registracija klinike | wizMedik" />
        <meta
          property="og:description"
          content="30 dana besplatno. Nakon toga 30 KM mjesečno ili 240 KM godišnje (ušteda 120 KM). Registrujte kliniku na wizMedik platformi."
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
                  <Building2 className="h-3.5 w-3.5" />
                  Za klinike i zdravstvene ustanove
                </div>

                <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
                  Registrujte kliniku na wizMedik platformi
                </h1>

                <p className="mt-4 text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl">
                  Objedinite zakazivanje i upravljanje timom doktora u jednom sistemu — uz profesionalni profil klinike i veću dostupnost pacijentima.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Button size="lg" className="h-11 rounded-xl px-6" onClick={() => setShowForm(true)}>
                    Registrujte kliniku
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>

                  <Button size="lg" variant="outline" className="h-11 rounded-xl px-6" asChild>
                    <Link to="/contact">
                      Zakaži demo
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

              {/* Proof card */}
              <div className="hidden lg:block">
                <Card className="rounded-2xl border-gray-200/70 bg-white/70 backdrop-blur">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">100+</div>
                          <div className="text-sm text-muted-foreground">Ustanova na platformi</div>
                        </div>
                      </div>

                      <div className="h-px flex-1 bg-gray-200/70" />

                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">+50%</div>
                          <div className="text-sm text-muted-foreground">Bolja popunjenost</div>
                        </div>
                      </div>

                      <div className="h-px flex-1 bg-gray-200/70" />

                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Star className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">4.9/5</div>
                          <div className="text-sm text-muted-foreground">Ocjena podrške</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Brže zakazivanje</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Pacijenti biraju online, manje poziva na recepciju.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Upravljanje timom</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Jedno mjesto za doktore, termine i osnovne postavke.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Sigurnost</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Fokus na zaštiti podataka i stabilnom radu sistema.
                        </p>
                      </div>
                      <div className="rounded-xl border bg-white p-4">
                        <div className="text-sm font-semibold">Profil klinike</div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Vidljivost na platformi i više upita pacijenata.
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
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Zašto wizMedik za vašu kliniku?</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                Fokus na efikasnosti, vidljivosti i upravljanju — bez komplikacija.
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

            <div className="mt-10 rounded-2xl border bg-white p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">Spremni da krenete?</p>
                <p className="text-sm text-muted-foreground">Aktivirajte kliniku — 30 dana besplatno.</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <Button className="h-11 rounded-xl w-full md:w-auto" onClick={() => setShowForm(true)}>
                  Registrujte kliniku
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button variant="outline" className="h-11 rounded-xl w-full md:w-auto" asChild>
                  <Link to="/contact">Zakaži demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">Moćne funkcionalnosti</h2>
              <p className="mt-3 text-base md:text-lg text-muted-foreground">
                Sve što vam treba za efikasno upravljanje klinikom.
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

        {/* PRICING (single plan + savings) */}
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
                  <h3 className="text-2xl font-bold text-center">wizMedik za Klinike</h3>
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
                      <div className="mt-1 text-xs text-primary font-semibold">
                        Uštedite 120 KM
                      </div>
                    </div>
                  </div>

                  <div className="mt-7">
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {[
                        'Centralizovano zakazivanje',
                        'Upravljanje timom doktora',
                        'Profesionalni profil klinike',
                        'Email podrška',
                      ].map((f, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Button className="w-full h-11 rounded-xl mt-7" onClick={() => setShowForm(true)}>
                      Registrujte kliniku
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
                Imate pitanja prije registracije?{' '}
                <Link to="/contact" className="text-primary font-semibold hover:underline underline-offset-4">
                  Zakaži demo
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
                  Spremni za digitalnu transformaciju?
                </h2>
                <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Aktivirajte profil klinike na wizMedik platformi i unaprijedite zakazivanje, vidljivost i upravljanje timom.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="h-11 rounded-xl px-8" onClick={() => setShowForm(true)}>
                    Započnite probni period
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Button variant="outline" className="h-11 rounded-xl px-8" asChild>
                    <Link to="/contact">Zakaži demo</Link>
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
