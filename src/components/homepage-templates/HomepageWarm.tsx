import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import {
  Search, MapPin, Calendar, Star, ChevronRight, ArrowRight,
  Stethoscope, Heart, Brain, Eye, Baby, Bone, Shield, Clock
} from 'lucide-react';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart,
  'Neurologija': Brain,
  'Oftalmologija': Eye,
  'Pedijatrija': Baby,
  'Ortopedija': Bone,
  'default': Stethoscope,
};

export function HomepageWarm() {
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
    <div className="min-h-screen bg-[#FFFBF5]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8E7] via-[#FFFBF5] to-[#FEF3E2]" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-[#F5D78E]/20 rounded-full blur-3xl max-md:w-64 max-md:h-64 max-md:-right-32" />
        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-[#E8C872]/20 rounded-full blur-3xl max-md:w-48 max-md:h-48 max-md:-left-24" />
        
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-2 bg-[#D4A853]/20 text-[#8B6914] rounded-full text-sm font-medium mb-6">
              🏥 Vaš zdravstveni partner
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-[#2D2A26] mb-6 leading-tight">
              Pronađite doktora
              <span className="text-[#C4941A] block mt-2">koji brine o vama</span>
            </h1>
            <p className="text-xl text-[#5C5650] mb-10 max-w-2xl mx-auto">
              Jednostavno zakazivanje pregleda kod najboljih ljekara u Bosni i Hercegovini.
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-xl shadow-[#D4A853]/10 p-4 md:p-6 max-w-3xl mx-auto border border-[#F0E6D3]">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B8A88A]" />
                  <Input
                    placeholder="Specijalnost ili ime doktora"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 text-lg border-[#E8DFD0] rounded-xl focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#B8A88A]" />
                  <Input
                    placeholder="Grad"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-14 text-lg border-[#E8DFD0] rounded-xl focus:border-[#D4A853] focus:ring-[#D4A853]/20"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  className="h-14 px-8 text-lg bg-[#C4941A] hover:bg-[#A67C15] rounded-xl shadow-lg shadow-[#C4941A]/25"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Pretraži
                </Button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-[#6B6560]">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#C4941A]" />
                <span>Verifikovani doktori</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#C4941A]" />
                <span>Brzo zakazivanje</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#C4941A]" />
                <span>Ocjene pacijenata</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#2D2A26]">Specijalnosti</h2>
              <p className="text-[#6B6560] mt-2">Odaberite oblast medicine</p>
            </div>
            <Button asChild variant="ghost" className="text-[#C4941A] hover:text-[#A67C15] hover:bg-[#FFF8E7]">
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
                  <Card className="h-full border-[#F0E6D3] hover:shadow-lg hover:shadow-[#D4A853]/10 transition-all hover:border-[#D4A853] cursor-pointer bg-gradient-to-br from-white to-[#FFFBF5]">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FFF8E7] to-[#FEF3E2] rounded-2xl flex items-center justify-center group-hover:from-[#C4941A] group-hover:to-[#D4A853] transition-all">
                        <IconComponent className="h-8 w-8 text-[#C4941A] group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-[#2D2A26]">{spec.naziv}</h3>
                      {spec.broj_doktora && (
                        <p className="text-sm text-[#8B8580] mt-1">{spec.broj_doktora} doktora</p>
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
      <section className="py-16 bg-gradient-to-b from-[#FFFBF5] to-[#FFF8E7]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-[#2D2A26]">Istaknuti doktori</h2>
              <p className="text-[#6B6560] mt-2">Najbolje ocijenjeni stručnjaci</p>
            </div>
            <Button asChild variant="ghost" className="text-[#C4941A] hover:text-[#A67C15] hover:bg-white">
              <Link to="/doktori">
                Svi doktori <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doctor) => (
              <Link key={doctor.id} to={`/doktor/${doctor.slug}`}>
                <Card className="h-full bg-white border-[#F0E6D3] hover:shadow-xl hover:shadow-[#D4A853]/10 transition-all cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-[#FEF3E2] ring-2 ring-[#D4A853]/20">
                        <AvatarImage src={doctor.slika_profila} />
                        <AvatarFallback className="bg-gradient-to-br from-[#FFF8E7] to-[#FEF3E2] text-[#C4941A] font-semibold">
                          {doctor.ime?.[0]}{doctor.prezime?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#2D2A26] truncate group-hover:text-[#C4941A] transition-colors">
                          Dr. {doctor.ime} {doctor.prezime}
                        </h3>
                        <p className="text-[#C4941A] text-sm font-medium">{doctor.specijalnost}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-[#8B8580]">
                          <MapPin className="h-4 w-4" />
                          <span className="truncate">{doctor.grad}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0E6D3]">
                      {doctor.ocjena > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-[#E8B931] text-[#E8B931]" />
                          <span className="font-semibold text-[#2D2A26]">{formatRating(doctor.ocjena)}</span>
                          <span className="text-[#8B8580] text-sm">({doctor.broj_ocjena})</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8B8580]">Novi doktor</span>
                      )}
                      <Button size="sm" className="bg-[#C4941A] hover:bg-[#A67C15] shadow-md shadow-[#C4941A]/20">
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
            <h2 className="text-3xl font-bold text-[#2D2A26]">Gradovi</h2>
            <p className="text-[#6B6560] mt-2">Pronađite doktore u vašem gradu</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gradovi.map((grad) => (
              <Link
                key={grad.id}
                to={`/grad/${grad.slug || grad.naziv.toLowerCase()}`}
                className="group"
              >
                <Card className="border-[#F0E6D3] hover:shadow-md hover:border-[#D4A853] transition-all bg-gradient-to-br from-white to-[#FFFBF5]">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 mx-auto mb-2 bg-[#FFF8E7] rounded-full flex items-center justify-center group-hover:bg-[#C4941A] transition-colors">
                      <MapPin className="h-5 w-5 text-[#C4941A] group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-semibold text-[#2D2A26]">{grad.naziv}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#C4941A] via-[#D4A853] to-[#C4941A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Imate pitanje za doktora?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Postavite pitanje i dobijte stručni odgovor potpuno besplatno.
          </p>
          <Button asChild size="lg" className="bg-white text-[#C4941A] hover:bg-[#FFFBF5] shadow-xl">
            <Link to="/postavi-pitanje">
              Postavi pitanje <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2D2A26] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-[#E8B931]">WizMedik</h3>
              <p className="text-[#A8A49E]">
                Vaš partner za zdravlje u Bosni i Hercegovini.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Linkovi</h4>
              <ul className="space-y-2 text-[#A8A49E]">
                <li><Link to="/specijalnosti" className="hover:text-[#E8B931] transition-colors">Specijalnosti</Link></li>
                <li><Link to="/gradovi" className="hover:text-[#E8B931] transition-colors">Gradovi</Link></li>
                <li><Link to="/klinike" className="hover:text-[#E8B931] transition-colors">Klinike</Link></li>
                <li><Link to="/pitanja" className="hover:text-[#E8B931] transition-colors">Pitanja</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Podrška</h4>
              <ul className="space-y-2 text-[#A8A49E]">
                <li><a href="#" className="hover:text-[#E8B931] transition-colors">Pomoć</a></li>
                <li><a href="#" className="hover:text-[#E8B931] transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-[#E8B931] transition-colors">Privatnost</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Kontakt</h4>
              <p className="text-[#A8A49E]">podrska@wizmedik.com</p>
              <p className="text-[#A8A49E]">+387 33 123 456</p>
            </div>
          </div>
          <div className="border-t border-[#3D3A36] mt-8 pt-8 text-center text-[#6B6560]">
            © 2024 WizMedik. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}

