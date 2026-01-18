import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { LaboratoryRegistrationForm } from '@/components/LaboratoryRegistrationForm';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FlaskConical, CheckCircle, TrendingUp, Users, 
  Clock, Shield, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';

const benefits = [
  {
    icon: Users,
    title: 'Povećana Vidljivost',
    description: 'Dosegnite hiljade potencijalnih pacijenata koji traže laboratorijske usluge',
  },
  {
    icon: TrendingUp,
    title: 'Rast Poslovanja',
    description: 'Povećajte broj analiza i proširite svoju klijentelu',
  },
  {
    icon: Clock,
    title: 'Online Rezultati',
    description: 'Omogućite pacijentima da preuzmu rezultate online',
  },
  {
    icon: Shield,
    title: 'Verifikovan Profil',
    description: 'Dobijte verifikovan badge koji gradi povjerenje',
  },
  {
    icon: Zap,
    title: 'Brza Registracija',
    description: 'Jednostavan proces registracije u 5 koraka',
  },
  {
    icon: CheckCircle,
    title: 'Besplatno',
    description: 'Registracija i korištenje platforme je potpuno besplatno',
  },
];

export default function RegisterLaboratory() {
  return (
    <>
      <Helmet>
        <title>Registracija Laboratorije - wizMedik</title>
        <meta name="description" content="Registrujte svoju medicinsku laboratoriju na wizMedik platformi i povećajte vidljivost. Besplatna registracija." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-16">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                <FlaskConical className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-gray-700">Registracija Laboratorije</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pridružite se wizMedik Platformi
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Povećajte vidljivost vaše laboratorije i dosegnite više pacijenata
              </p>
            </motion.div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Zašto Registrovati Laboratoriju?
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="h-full hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Icon className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {benefit.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {benefit.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <LaboratoryRegistrationForm />
          </div>
        </section>

        {/* Info Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <Card>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Kako Funkcioniše Proces?
                  </h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Popunite Formular</h4>
                        <p className="text-gray-600 text-sm">
                          Unesite osnovne informacije o vašoj laboratoriji u 5 jednostavnih koraka
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Verifikujte Email</h4>
                        <p className="text-gray-600 text-sm">
                          Dobićete email sa linkom za verifikaciju. Kliknite na link ili unesite kod
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Admin Pregled</h4>
                        <p className="text-gray-600 text-sm">
                          Naš tim će pregledati vaš zahtjev i odobriti ga u roku od 24-48 sati
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Počnite sa Radom</h4>
                        <p className="text-gray-600 text-sm">
                          Nakon odobrenja, prijavite se i počnite dodavati analize, pakete i galeriju
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Napomena:</strong> Već imate nalog? <Link to="/auth" className="underline hover:text-blue-900">Prijavite se ovdje</Link>
                    </p>
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
