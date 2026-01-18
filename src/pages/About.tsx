import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, Target, Users, Award, TrendingUp, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Pacijent na Prvom Mjestu',
      description: 'Sve što radimo fokusirano je na poboljšanje iskustva pacijenata i njihovu sigurnost'
    },
    {
      icon: Shield,
      title: 'Provjerene Informacije',
      description: 'Stručni sadržaj kreiraju isključivo doktori i zdravstveni profesionalci'
    },
    {
      icon: Award,
      title: 'Kvalitet i Pouzdanost',
      description: 'Moderna tehnologija sa naglaskom na sigurnost podataka i brzinu rada'
    },
    {
      icon: TrendingUp,
      title: 'Kontinuirano Unapređenje',
      description: 'Dugoročna misija poboljšanja zdravstvenog sistema kroz digitalizaciju'
    }
  ];

  const stats = [
    { number: '500+', label: 'Doktora' },
    { number: '100+', label: 'Klinika' },
    { number: '50,000+', label: 'Pacijenata' },
    { number: '100,000+', label: 'Zakazanih Termina' }
  ];

  return (
    <>
      <Helmet>
        <title>O wizMedik - Savremena digitalna zdravstvena platforma u BiH</title>
        <meta name="description" content="wizMedik je savremena digitalna zdravstvena platforma osnovana 2026. godine. Povezujemo pacijente sa doktorima, klinikama, banjama, domovima njege i laboratorijama. Provjerene medicinske informacije od stručnjaka." />
        <meta name="keywords" content="wizMedik, o nama, digitalna zdravstvena platforma, zdravstvo BiH, online zakazivanje, medicinske informacije, doktori BiH" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />

        {/* Hero */}
        <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">O wizMedik</h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Savremena digitalna zdravstvena platforma za sve građane Bosne i Hercegovine
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold mb-6">Naša Priča</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                wizMedik je savremena digitalna zdravstvena platforma osnovana 2026. godine s jasnom vizijom: 
                učiniti zdravstvene usluge dostupnijim, preglednijim i efikasnijim za sve građane Bosne i Hercegovine. 
                Nastali smo kao odgovor na stvarnu potrebu pacijenata za pouzdanim informacijama, lakšim pristupom 
                zdravstvenim ustanovama i jednostavnim načinom zakazivanja pregleda.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Na jednoj platformi objedinjavamo različite segmente zdravstvenog sistema i omogućavamo pacijentima 
                da brzo i sigurno pronađu odgovarajuću zdravstvenu uslugu. Putem wizMedik platforme moguće je 
                informisati se i zakazati usluge kod doktora i klinika, kao i pronaći banje i rehabilitacione centre, 
                domove za starija i bolesna lica te laboratorije i dijagnostičke ustanove.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 mt-8">Provjerene Medicinske Informacije</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Poseban fokus stavljamo na tačne i provjerene medicinske informacije. Zbog toga wizMedik sadrži i 
                stručni blog, čiji sadržaj kreiraju isključivo doktori i zdravstveni profesionalci. Kroz edukativne 
                članke, savjete i objašnjenja, pacijentima pružamo pouzdane informacije koje im pomažu da bolje 
                razumiju svoje zdravlje i donesu informisane odluke.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 mt-8">Pitanja i Odgovori</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Dodatna vrijednost platforme je sekcija Pitanja i odgovori, gdje korisnici mogu postaviti pitanja 
                vezana za svoje zdravstvene tegobe, terapije ili prevenciju. Na ova pitanja odgovaraju isključivo 
                doktori iz odgovarajućih medicinskih oblasti i specijalnosti, čime osiguravamo stručnost, relevantnost 
                i visok nivo povjerenja u dobijene odgovore.
              </p>
              
              <h3 className="text-2xl font-bold mb-4 mt-8">Tehnologija i Sigurnost</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                wizMedik je izgrađen korištenjem savremenih tehnologija, s posebnim naglaskom na sigurnost podataka, 
                brzinu rada i jednostavno korisničko iskustvo. Naš cilj je stvoriti digitalno okruženje u kojem se 
                pacijenti osjećaju sigurno, informisano i podržano, a zdravstveni radnici imaju profesionalan prostor 
                za dijeljenje znanja i komunikaciju s pacijentima.
              </p>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Naša misija je dugoročna: postepeno unapređivati način na koji se zdravstvene usluge predstavljaju, 
                pretražuju i koriste u Bosni i Hercegovini, te graditi platformu koja će biti pouzdan partner i 
                pacijentima i zdravstvenim stručnjacima.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12">
              <Card>
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Naša Misija</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Postepeno unapređivati način na koji se zdravstvene usluge predstavljaju, pretražuju i 
                    koriste u Bosni i Hercegovini. Omogućiti svim građanima brz i jednostavan pristup 
                    kvalitetnoj zdravstvenoj njezi kroz modernu digitalnu platformu koja povezuje pacijente 
                    sa najboljim zdravstvenim profesionalcima i pruža provjerene medicinske informacije.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Naša Vizija</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Graditi platformu koja će biti pouzdan partner i pacijentima i zdravstvenim stručnjacima. 
                    Postati vodeća zdravstvena platforma u regionu, prepoznata po inovativnosti, kvalitetu 
                    usluge, stručnom sadržaju i doprinosu poboljšanju zdravstvenog sistema kroz digitalizaciju 
                    i modernizaciju.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Naše Vrijednosti</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Principi koji vode naš rad i odluke
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <value.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary-dark text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">wizMedik u Brojkama</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl font-bold mb-2">{stat.number}</div>
                  <div className="text-white/80">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
