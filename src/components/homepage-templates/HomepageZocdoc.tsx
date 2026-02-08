import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { 
  Search, MapPin, Calendar, Star, ChevronRight, 
  Stethoscope, Heart, Brain, Eye, Baby, Bone 
} from 'lucide-react';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart,
  'Neurologija': Brain,
  'Oftalmologija': Eye,
  'Pedijatrija': Baby,
  'Ortopedija': Bone,
  'default': Stethoscope,
};

const formatRating = (rating: any): string => {
  const num = parseFloat(rating);
  return isNaN(num) ? '0.0' : num.toFixed(1);
};

export function HomepageZocdoc() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [specRes, gradRes, docRes] = await Promise.all([
        specialtiesAPI.getAll(),
        citiesAPI.getAll(),
        doctorsAPI.getAll({ limit: 6 })
      ]);
      setSpecijalnosti(specRes.data?.slice(0, 8) || []);
      setGradovi(gradRes.data?.slice(0, 6) || []);
      setFeaturedDoctors(docRes.data?.data?.slice(0, 6) || docRes.data?.slice(0, 6) || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSearch = () => {
    if (searchQuery || location) {
      navigate(`/doktori/${location || 'svi'}?pretraga=${searchQuery}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - ZocDoc Style */}
      <section className="relative bg-gradient-to-b from-[#e0f2fe] to-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Pronađite i zakažite
              <span className="text-[#0891b2] block mt-2">najboljeg doktora</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Hiljade doktora. Stotine specijalnosti. Jedan klik do termina.
            </p>
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Specijalnost, doktor ili usluga"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 text-lg border-gray-200 rounded-xl"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Grad ili lokacija"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 text-lg border-gray-200 rounded-xl"
                  />
                </div>
                <Button 
                  onClick={handleSearch}
                  className="h-14 px-8 text-lg bg-[#0891b2] hover:bg-[#0891b2] rounded-xl"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Pretraži
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L60 45C120 40 240 30 360 35C480 40 600 60 720 65C840 70 960 60 1080 50C1200 40 1320 30 1380 25L1440 20V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0V50Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popularne specijalnosti</h2>
              <p className="text-gray-600 mt-2">Pronađite doktora po specijalnosti</p>
            </div>
            <Button asChild variant="ghost" className="text-[#0891b2] hover:text-[#0891b2]">
              <Link to="/specijalnosti">
                Sve specijalnosti <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specijalnosti.map((spec) => {
              const IconComponent = specialtyIcons[spec.naziv] || specialtyIcons.default;
              return (
                <Link 
                  key={spec.id} 
                  to={`/specijalnost/${spec.slug || spec.naziv.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group"
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:border-[#0891b2] cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-[#e0f2fe] rounded-2xl flex items-center justify-center group-hover:bg-[#0891b2] transition-colors">
                        <IconComponent className="h-8 w-8 text-[#0891b2] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{spec.naziv}</h3>
                      {spec.broj_doktora && (
                        <p className="text-sm text-gray-500 mt-1">{spec.broj_doktora} doktora</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Istaknuti doktori</h2>
              <p className="text-gray-600 mt-2">Najbolje ocijenjeni stručnjaci</p>
            </div>
            <Button asChild variant="ghost" className="text-[#0891b2] hover:text-[#0891b2]">
              <Link to="/doktori">
                Svi doktori <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doctor) => (
              <Link key={doctor.id} to={`/doktor/${doctor.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-[#e0f2fe]">
                        <AvatarImage src={doctor.slika_profila} />
                        <AvatarFallback className="bg-[#e0f2fe] text-[#0891b2]">
                          {doctor.ime?.[0]}{doctor.prezime?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          Dr. {doctor.ime} {doctor.prezime}
                        </h3>
                        <p className="text-[#0891b2] text-sm">{doctor.specijalnost}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{doctor.grad}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      {doctor.ocjena > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold">{formatRating(doctor.ocjena)}</span>
                          <span className="text-gray-500 text-sm">({doctor.broj_ocjena})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Novi doktor</span>
                      )}
                      <Button size="sm" className="bg-[#0891b2] hover:bg-[#0891b2]">
                        <Calendar className="mr-1 h-4 w-4" />
                        Zakaži
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Pretražite po gradu</h2>
            <p className="text-gray-600 mt-2">Pronađite doktore u vašem gradu</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gradovi.map((grad) => (
              <Link 
                key={grad.id} 
                to={`/grad/${grad.slug || grad.naziv.toLowerCase()}`}
                className="group"
              >
                <Card className="hover:shadow-md transition-all hover:border-[#0891b2]">
                  <CardContent className="p-4 text-center">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-[#0891b2]" />
                    <h3 className="font-semibold text-gray-900">{grad.naziv}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#0891b2]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Imate pitanje za doktora?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Postavite pitanje i dobijte odgovor od stručnih doktora potpuno besplatno.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-[#0891b2]">
            <Link to="/postavi-pitanje">
              Postavi pitanje
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">WizMedik</h3>
              <p className="text-gray-400">
                Vaš partner za zdravlje u Bosni i Hercegovini.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Linkovi</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/specijalnosti" className="hover:text-white">Specijalnosti</Link></li>
                <li><Link to="/gradovi" className="hover:text-white">Gradovi</Link></li>
                <li><Link to="/klinike" className="hover:text-white">Klinike</Link></li>
                <li><Link to="/pitanja" className="hover:text-white">Pitanja</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Podrška</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Pomoć</a></li>
                <li><a href="#" className="hover:text-white">Kontakt</a></li>
                <li><a href="#" className="hover:text-white">Privatnost</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <p className="text-gray-400">podrska@wizmedik.com</p>
              <p className="text-gray-400">+387 33 123 456</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            © 2024 WizMedik. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}

