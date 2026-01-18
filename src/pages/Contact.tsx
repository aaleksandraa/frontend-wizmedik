import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, ArrowRight, ShieldCheck, Clock, HelpCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function Contact() {
  return (
    <>
      <Helmet>
        <title>Kontakt | wizMedik</title>
        <meta
          name="description"
          content="Kontaktirajte wizMedik putem emaila info@wizmedik.com. Za brze odgovore pogledajte FAQ: najčešća pitanja o doktorima, klinikama, terminima i korištenju platforme."
        />
        <link rel="canonical" href="https://wizmedik.com/contact" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/12 via-background to-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 py-14 md:py-18 text-center relative">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              Podrška i informacije • wizMedik
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-bold tracking-tight">
              Kontaktirajte wizMedik
            </h1>

            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Najbrži način da nas dobijete je email. Pišite nam za podršku, prijedloge, ispravke podataka o ustanovama ili saradnju.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email Card (sa vremenom odgovora) */}
              <Card className="rounded-2xl border-gray-200/70">
                <CardContent className="p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0 w-full">
                      <h2 className="text-xl font-semibold">Email podrška</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pošaljite poruku na:
                      </p>

                      <a
                        href="mailto:info@wizmedik.com"
                        className="mt-3 inline-flex items-center gap-2 text-primary font-semibold hover:underline underline-offset-4 break-all"
                      >
                        info@wizmedik.com
                        <ArrowRight className="h-4 w-4 opacity-80" />
                      </a>

                      {/* Tipično vrijeme odgovora (premješteno ispod emaila) */}
                      <div className="mt-5 rounded-xl border bg-white p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          Tipično vrijeme odgovora
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Obično odgovaramo u roku od <span className="font-medium text-foreground">24–48h</span> radnim danima.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Card */}
              <Card className="rounded-2xl border-gray-200/70">
                <CardContent className="p-6 md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <HelpCircle className="h-5 w-5 text-primary" />
                    </div>

                    <div className="min-w-0 w-full">
                      <h2 className="text-xl font-semibold">Najčešća pitanja</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Prije slanja emaila, provjerite FAQ — možda je odgovor već tu.
                      </p>

                      <div className="mt-5">
                        <Link to="/faq" className="w-full block">
                          <Button className="w-full h-11 rounded-xl">
                            Otvori FAQ
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Korisni linkovi (centrirano) */}
            <div className="mt-8">
              <Card className="rounded-2xl border-gray-200/70">
                <CardContent className="p-6 md:p-7 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    Korisni linkovi
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2">
                    <Link
                      to="/doktori"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Doktori
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/klinike"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Klinike
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/specijalnosti"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Specijalnosti
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/laboratorije"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Laboratorije
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/banje"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Banje
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/domovi-njega"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Domovi njege
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/pitanja"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Pitanja
                    </Link>
                    <span className="text-muted-foreground/40">•</span>
                    <Link
                      to="/blog"
                      className="text-sm text-muted-foreground hover:text-primary hover:underline underline-offset-4"
                    >
                      Savjeti
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Za doktore i ustanove */}
            <div className="mt-6">
              <Card className="rounded-2xl border-gray-200/70">
                <CardContent className="p-6 md:p-7">
                  <h3 className="text-lg font-semibold">Za doktore i ustanove</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ako ste doktor, klinika, laboratorija, banja ili dom njege i želite ažurirati podatke ili aktivirati profil na wizMedik platformi,
                    javite se putem emaila. Navedite naziv ustanove i link postojeće stranice/profila (ako postoji) radi brže verifikacije.
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row gap-3">
                    <a href="mailto:info@wizmedik.com" className="sm:flex-1">
                      <Button variant="outline" className="w-full h-11 rounded-xl">
                        Pošalji email
                        <Mail className="h-4 w-4 ml-2" />
                      </Button>
                    </a>
                    <Link to="/faq" className="sm:flex-1">
                      <Button variant="secondary" className="w-full h-11 rounded-xl">
                        Pogledaj FAQ
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
