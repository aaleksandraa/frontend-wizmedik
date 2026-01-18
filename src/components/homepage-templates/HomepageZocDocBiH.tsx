import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorCardSoft } from '@/components/cards/DoctorCardSoft';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { settingsAPI, doctorsAPI, specialtiesAPI, citiesAPI } from '@/services/api';
import { 
  Search, MapPin, Calendar, Star, ChevronRight, 
  Stethoscope, Heart, Brain, Eye, Baby, Bone, Users,
  Building2, Clock, Shield, CheckCircle, ArrowRight,
  FlaskConical, Droplet, Home as HomeIcon, TrendingUp
} from 'lucide-react';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart,
  'Neurologija': Brain,
  'Oftalmologija': Eye,
  'Pedijatrija': Baby,
  'Ortopedija': Bone,
  'default': Stethoscope,
};

export default function HomepageZocDocBiH() {
  const navigate = useNavigate();
  const { template: doctorTemplate } = useListingTemplate('doctors');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [specRes, citiesRes, doctorsRes] = await Promise.all([
        specialtiesAPI.getAll(),
        citiesAPI.getAll(),
        doctorsAPI.getAll({ limit: 8 })
      ]);
      setSpecialties(specRes.data?.slice(0, 12) || []);
      setCities(citiesRes.data || []);
      setDoctors(doctorsRes.data?.data || doctorsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let url = '/doktori';
    if (selectedCity) {
      url = `/doktori/${selectedCity}`;
    }
    if (searchQuery) {
      url += `?pretraga=${encodeURIComponent(searchQuery)}`;
    }
    navigate(url);
  };

  const filteredCities = cities.filter(city => 
    city.naziv.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const features = [
    { icon: Calendar, title: 'Brzo zakazivanje', desc: 'Zakažite pregled u par klikova' },
    { icon: Shield, title: 'Verificirani doktori', desc: 'Svi doktori su licencirani' },
    { icon: Star, title: 'Ocjene pacijenata', desc: 'Pročitajte iskustva drugih' },
    { icon: Clock, title: 'Dostupnost 24/7', desc: 'Pretražujte i zakažite bilo kada' }
  ];

  const quickLinks = [
    { icon: Stethoscope, label: 'Doktori', href: '/doktori', color: 'from-blue-500 to-blue-600' },
    { icon: Building2, label: 'Klinike', href: '/klinike', color: 'from-purple-500 to-purple-600' },
    { icon: FlaskConical, label: 'Laboratorije', href: '/laboratorije', color: 'from-emerald-500 to-emerald-600' },
    { icon: Droplet, label: 'Banje', href: '/banje', color: 'from-cyan-500 to-cyan-600' },
    { icon: HomeIcon, label: 'Domovi', href: '/domovi-njega', color: 'from-amber-500 to-amber-600' },
    { icon: MapPin, label: 'Gradovi', href: '/gradovi', color: 'from-rose-500 to-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section - ZocDoc Inspired */}
      <section className="relative bg-gradient-to-br from-[#f0f7f4] via-[#e8f5f1] to-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00856f] rounded-full blur-3xl max-md:w-48 max-md:h-48"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500 rounded-full blur-3xl max-md:w-64 max-md:h-64 max-md:-right-32"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Pronađite i zakažite pregled kod
                <span className="text-[#00856f] block mt-2">najboljeg doktora u BiH</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                Stotine doktora. Sve specijalnosti. Jednostavno zakazivanje.
              </p>
            </div>
            
            {/* Search Box - ZocDoc Style */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Specijalnost, doktor ili simptom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-14 pl-12 pr-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#00856f] focus:outline-none transition-colors"
                  />
                </div>

                {/* City Select with Autocomplete */}
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    placeholder="Grad ili lokacija..."
                    value={citySearchQuery}
                    onChange={(e) => setCitySearchQuery(e.target.value)}
                    onFocus={() => setCitySearchQuery('')}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full h-14 pl-12 pr-4 text-lg border-2 border-gray-200 rounded-xl focus:border-[#00856f] focus:outline-none transition-colors"
                  />
                  {citySearchQuery && filteredCities.length > 0 && (
                    <div className="absolute z-20 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {filteredCities.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setSelectedCity(city.slug);
                            setCitySearchQuery(city.naziv);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors text-lg"
                        >
                          {city.naziv}
                        </button>
                      ))}
                    </div>
                  )}
                  {!citySearchQuery && selectedCity && (
                    <div className="absolute inset-0 flex items-center pl-12 pointer-events-none">
                      <span className="text-lg text-gray-900">
                        {cities.find(c => c.slug === selectedCity)?.naziv || ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <Button 
                onClick={handleSearch}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-[#00856f] hover:bg-[#006d5b] rounded-xl"
              >
                <Search className="mr-2 h-5 w-5" />
                Pretražite doktore
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900">500+</div>
                <div className="text-gray-600">Doktora</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">100+</div>
                <div className="text-gray-600">Klinika</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">4.9</div>
                <div className="text-gray-600">Prosječna ocjena</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickLinks.map((link, idx) => (
              <Link key={idx} to={link.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <link.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{link.label}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Zašto wizMedik?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Najbrži i najsigurniji način da pronađete pravog doktora
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#00856f]/10 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-[#00856f]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Popularne specijalnosti
              </h2>
              <p className="text-gray-600">Pronađite doktora za vašu potrebu</p>
            </div>
            <Link to="/specijalnosti">
              <Button variant="outline" className="group">
                Sve specijalnosti
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {specialties.map((spec) => {
              const IconComponent = specialtyIcons[spec.naziv] || specialtyIcons.default;
              return (
                <Link key={spec.id} to={`/specijalnost/${spec.slug}`}>
                  <Card className="group cursor-pointer transition-all duration-300 border-2 border-transparent hover:border-[#00856f] hover:shadow-lg">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-[#00856f]/10 to-[#00856f]/5 flex items-center justify-center group-hover:from-[#00856f] group-hover:to-[#006d5b] transition-all duration-300">
                        {spec.icon_url ? (
                          spec.icon_url.startsWith('icon:') ? (
                            <span className="text-3xl">{spec.icon_url.replace('icon:', '')}</span>
                          ) : (
                            <img src={spec.icon_url} alt={spec.naziv} className="w-8 h-8 object-contain" />
                          )
                        ) : (
                          <IconComponent className="w-8 h-8 text-[#00856f] group-hover:text-white transition-colors duration-300" />
                        )}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{spec.naziv}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      {doctors.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1">
                  <Users className="w-3 h-3 mr-2" />
                  Istaknuti doktori
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  Najbolji doktori u BiH
                </h2>
                <p className="text-gray-600">Provjereni stručnjaci sa odličnim ocjenama</p>
              </div>
              <Link to="/doktori">
                <Button variant="outline" className="group">
                  Svi doktori
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {doctors.slice(0, 8).map((doctor) => (
                doctorTemplate === 'soft' ? (
                  <DoctorCardSoft key={doctor.id} doctor={doctor} />
                ) : (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                )
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#00856f] to-[#006d5b] text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Spremni za bolju zdravstvenu njegu?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Pridružite se hiljadama pacijenata koji su pronašli pravog doktora
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/doktori">
                <Button size="lg" className="bg-white text-[#00856f] hover:bg-gray-100 px-8 h-14 text-lg font-semibold">
                  Pronađi doktora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/registration-options">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 h-14 text-lg">
                  Registruj se kao doktor
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
