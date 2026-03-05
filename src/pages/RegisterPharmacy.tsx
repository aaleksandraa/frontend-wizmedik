import { Helmet } from 'react-helmet-async';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { PharmacyRegistrationForm } from '@/components/PharmacyRegistrationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, Clock3, MapPin, Pill, ShieldCheck } from 'lucide-react';

const benefits = [
  {
    icon: Building2,
    title: 'Vise poslovnica',
    description: 'Jedan vlasnik moze upravljati sa vise apoteka na razlicitim adresama i gradovima.',
  },
  {
    icon: Clock3,
    title: 'Open now i dezurna',
    description: 'Podrska za radno vrijeme, izuzetke, dezurstva i prikaz apoteka koje rade trenutno.',
  },
  {
    icon: MapPin,
    title: 'Geo pretraga',
    description: 'Prikaz najblizih apoteka prema lokaciji korisnika i mapi.',
  },
  {
    icon: Pill,
    title: 'Posebne ponude',
    description: 'Popusti za penzionere, akcije i besplatne usluge kroz fleksibilan model ponuda.',
  },
  {
    icon: ShieldCheck,
    title: 'Admin verifikacija',
    description: 'Verifikovan profil povecava povjerenje i bolju vidljivost u pretrazi.',
  },
];

export default function RegisterPharmacy() {
  return (
    <>
      <Helmet>
        <title>Registracija apoteke | wizMedik</title>
        <meta
          name="description"
          content="Registrujte apoteku na wizMedik platformu i upravljajte poslovnicama, radnim vremenom, dezurstvima i posebnim ponudama."
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <Navbar />

        <section className="bg-gradient-to-r from-red-50 via-rose-50 to-white py-14">
          <div className="container mx-auto px-4 text-center">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border text-sm text-gray-700">
              <Pill className="w-4 h-4 text-red-600" />
              Registracija apoteke
            </p>
            <h1 className="text-3xl md:text-4xl font-bold mt-4 text-gray-900">
              Dodajte apoteku na wizMedik
            </h1>
            <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
              Profesionalni onboarding za vlasnike apoteka sa podrskom za vise poslovnica, SEO profile i napredne filtere pretrage.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto mb-10">
              {benefits.map((benefit) => (
                <Card key={benefit.title}>
                  <CardContent className="p-5">
                    <benefit.icon className="w-6 h-6 text-red-600 mb-3" />
                    <h3 className="font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <PharmacyRegistrationForm />
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

