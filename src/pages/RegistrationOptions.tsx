import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, Building2, FlaskConical, Droplet, Home, 
  ArrowRight, CheckCircle2, Users, Calendar, TrendingUp 
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RegistrationOptions() {
  const registrationTypes = [
    {
      icon: Stethoscope,
      title: 'Doktor',
      description: 'Registrujte se kao doktor i proširite svoju praksu. Omogućite pacijentima da vas pronađu i zakažu preglede online.',
      link: '/register/doctor',
      color: 'from-blue-500 to-blue-600',
      benefits: [
        'Online zakazivanje termina',
        'Upravljanje radnim vremenom',
        'Profil sa recenzijama',
        'Pisanje blog članaka'
      ]
    },
    {
      icon: Building2,
      title: 'Klinika',
      description: 'Registrujte svoju kliniku ili ordinaciju. Povećajte vidljivost i olakšajte pacijentima pristup vašim uslugama.',
      link: '/register/clinic',
      color: 'from-purple-500 to-purple-600',
      benefits: [
        'Upravljanje doktorima',
        'Kalendar termina',
        'Galerija prostora',
        'Detaljne informacije o uslugama'
      ]
    },
    {
      icon: FlaskConical,
      title: 'Laboratorija',
      description: 'Registrujte laboratoriju i omogućite pacijentima da pregledaju vaše analize i pakete usluga.',
      link: '/register/laboratory',
      color: 'from-emerald-500 to-emerald-600',
      benefits: [
        'Katalog analiza',
        'Paketi usluga',
        'Cjenovnik',
        'Online upiti'
      ]
    },
    {
      icon: Droplet,
      title: 'Banja i rehabilitacija',
      description: 'Registrujte banju ili rehabilitacioni centar. Predstavite svoje terapije i pakete tretmana.',
      link: '/register/spa',
      color: 'from-cyan-500 to-cyan-600',
      benefits: [
        'Prikaz terapija',
        'Paketi tretmana',
        'Indikacije i kontraindikacije',
        'Rezervacije'
      ]
    },
    {
      icon: Home,
      title: 'Dom za starija i bolesna lica',
      description: 'Registrujte dom za njegu. Omogućite porodicama da saznaju više o vašim uslugama i smještajnim kapacitetima.',
      link: '/register/care-home',
      color: 'from-amber-500 to-amber-600',
      benefits: [
        'Prikaz smještaja',
        'Usluge njege',
        'Stručno osoblje',
        'Kontakt informacije'
      ]
    }
  ];

  const platformBenefits = [
    {
      icon: Users,
      title: 'Veća vidljivost',
      description: 'Dosegnite hiljade potencijalnih pacijenata koji traže zdravstvene usluge'
    },
    {
      icon: Calendar,
      title: 'Efikasno upravljanje',
      description: 'Moderan sistem za upravljanje terminima i pacijentima'
    },
    {
      icon: TrendingUp,
      title: 'Rast prakse',
      description: 'Povećajte broj pacijenata i razvijte svoju praksu'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Registracija - MediBIH</title>
        <meta name="description" content="Registrujte se na MediBIH platformu kao doktor, klinika, laboratorija, banja ili dom za njegu. Proširite svoju praksu i dosegnite više pacijenata." />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-blue-700 py-20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center text-white">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-white/20">
              Pridružite se platformi
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Odaberite tip registracije
            </h1>
            <p className="text-xl text-white/90 mb-8">
              Postanite dio najveće zdravstvene platforme u Bosni i Hercegovini
            </p>
          </div>
        </div>
      </section>

      {/* Registration Types */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {registrationTypes.map((type, idx) => (
              <Card key={idx} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <type.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{type.title}</CardTitle>
                  <CardDescription className="text-base">{type.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {type.benefits.map((benefit, bidx) => (
                      <div key={bidx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={type.link}>
                    <Button className="w-full group-hover:bg-primary group-hover:text-white" variant="outline">
                      Registruj se
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform Benefits */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Zašto se registrovati na MediBIH?
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Naša platforma vam pruža sve alate potrebne za uspješno upravljanje vašom praksom
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {platformBenefits.map((benefit, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary to-blue-700">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Imate pitanja?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Kontaktirajte nas i rado ćemo vam pomoći sa procesom registracije
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Kontaktirajte nas
                </Button>
              </Link>
              <Link to="/faq">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Često postavljana pitanja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
