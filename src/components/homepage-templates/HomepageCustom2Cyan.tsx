import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorCard } from '@/components/DoctorCard';
import { ClinicCard } from '@/components/ClinicCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useHomepageData } from '@/hooks/useHomepageData';
import { 
  Search, Users, Building2, Star, 
  Stethoscope, Heart, Shield, Clock, MapPin, ArrowRight,
  Activity, CheckCircle2, FlaskConical,
  Droplet, Home, MessageCircle, HelpCircle, Eye, Lightbulb
} from 'lucide-react';

export default function HomepageCustom2Cyan() {
  const navigate = useNavigate();
  const { data, loading } = useHomepageData();
  
  const [selectedType, setSelectedType] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
              <Heart className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  const doctors = data.doctors || [];
  const clinics = data.clinics || [];
  const specialties = data.specialties || [];
  const cities = data.cities || [];
  const pitanja = data.pitanja || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    let url = '/doktori';
    
    if (selectedType === 'klinike') url = '/klinike';
    else if (selectedType === 'laboratorije') url = '/laboratorije';
    else if (selectedType === 'banje') url = '/banje';
    else if (selectedType === 'domovi') url = '/domovi-njega';
    
    if (selectedSpecialty && selectedCity) {
      url = `${url}/${selectedCity}/${selectedSpecialty}`;
    } else if (selectedSpecialty) {
      url = selectedType === 'doktori' ? `/doktori/specijalnost/${selectedSpecialty}` : url;
    } else if (selectedCity) {
      url = `${url}/${selectedCity}`;
    }
    
    navigate(url);
  };

  const filteredCities = cities.filter((city: any) => 
    city.naziv.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const quickServices = [
    { icon: Stethoscope, label: 'Opšta medicina', href: '/specijalnost/opsta-medicina-i-porodicna-medicina', color: 'bg-cyan-100 text-cyan-600' },
    { icon: Heart, label: 'Kardiologija', href: '/specijalnost/kardiologija', color: 'bg-blue-100 text-blue-600' },
    { icon: Activity, label: 'Interna medicina', href: '/specijalnost/interna-medicina', color: 'bg-teal-100 text-teal-600' },
    { icon: FlaskConical, label: 'Laboratorije', href: '/laboratorije', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Droplet, label: 'Banje', href: '/banje', color: 'bg-sky-100 text-sky-600' },
    { icon: Home, label: 'Domovi njege', href: '/domovi-njega', color: 'bg-indigo-100 text-indigo-600' },
  ];

  const features = [
    { icon: Clock, title: 'Brzo zakazivanje', desc: 'Zakažite pregled u samo par klikova' },
    { icon: Shield, title: 'Verificirani doktori', desc: 'Svi doktori su provjereni i licencirani' },
    { icon: Star, title: 'Ocjene pacijenata', desc: 'Pročitajte iskustva drugih pacijenata' },
    { icon: MessageCircle, title: 'Pitajte doktora', desc: 'Postavite pitanje i dobijte stručni odgovor' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFCFC]">
      <Navbar />
      
      {/* Hero Section - ZocDoc Style with Cyan */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
          <svg viewBox="0 0 400 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M200 100C200 155.228 155.228 200 100 200C44.7715 200 0 155.228 0 100C0 44.7715 44.7715 0 100 0C155.228 0 200 44.7715 200 100Z" fill="#06B6D4" fillOpacity="0.1"/>
            <path d="M400 300C400 355.228 355.228 400 300 400C244.772 400 200 355.228 200 300C200 244.772 244.772 200 300 200C355.228 200 400 244.772 400 300Z" fill="#0891B2" fillOpacity="0.1"/>
            <path d="M300 550C300 577.614 277.614 600 250 600C222.386 600 200 577.614 200 550C200 522.386 222.386 500 250 500C277.614 500 300 522.386 300 550Z" fill="#14B8A6" fillOpacity="0.1"/>
          </svg>
        </div>

        <div className="container mx-auto px-4 py-16 lg:py-24 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 items-center">
              {/* Left Side - Text */}
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-center lg:text-left">
                  Pronađite ljekara<br />
                  <span className="text-cyan-600">privatne prakse</span><br />
                  za Vas
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 text-center lg:text-left">
                  Zakažite pregled kod najboljih doktora u Bosni i Hercegovini
                </p>

                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <form onSubmit={handleSearch} className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Type Select - FIRST */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                          Šta tražite?
                        </label>
                        <select 
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="">Odaberite tip</option>
                          <option value="doktori">Doktori</option>
                          <option value="klinike">Klinike</option>
                          <option value="laboratorije">Laboratorije</option>
                          <option value="banje">Banje i rehabilitacija</option>
                          <option value="domovi">Domovi za starija i bolesna lica</option>
                        </select>
                      </div>

                      {/* Specialty Select - SECOND */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                          Oblast medicine
                        </label>
                        <select 
                          value={selectedSpecialty}
                          onChange={(e) => setSelectedSpecialty(e.target.value)}
                          className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-cyan-500 transition-colors"
                        >
                          <option value="">Odaberite specijalnost</option>
                          {specialties.map((specialty) => (
                            <option key={specialty.id} value={specialty.slug}>
                              {specialty.naziv}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City Select - THIRD */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 block">
                          Grad
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={citySearchQuery}
                            onChange={(e) => setCitySearchQuery(e.target.value)}
                            onFocus={() => setCitySearchQuery('')}
                            placeholder="Pretražite grad..."
                            className="w-full h-12 px-4 rounded-lg border-2 border-gray-200 bg-white text-gray-900 focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                          {citySearchQuery && filteredCities.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                              {filteredCities.map((city) => (
                                <button
                                  key={city.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCity(city.slug);
                                    setCitySearchQuery(city.naziv);
                                  }}
                                  className="w-full px-4 py-3 text-left hover:bg-cyan-50 transition-colors"
                                >
                                  {city.naziv}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Search Button */}
                    <Button 
                      type="submit"
                      size="lg" 
                      className="w-full h-14 text-lg font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Pronađite doktora
                    </Button>
                  </form>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    <span>Verificirani doktori</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cyan-600" />
                    <span>Brzo zakazivanje</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Illustration */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-3xl transform rotate-3"></div>
                  <div className="relative bg-white rounded-3xl p-8 shadow-2xl">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 bg-cyan-50 rounded-xl">
                        <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center">
                          <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Dr. Ime Prezime</div>
                          <div className="text-sm text-gray-600">Kardiolog</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Brzo zakazivanje</div>
                          <div className="text-sm text-gray-600">Dostupni termini</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
                        <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">Ocjene pacijenata</div>
                          <div className="text-sm text-gray-600">4.8/5.0 prosječna ocjena</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Services */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Najpopularnije specijalnosti</h2>
            <p className="text-gray-600">Brzo pronađite doktora za vašu potrebu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickServices.map((service, idx) => (
              <Link key={idx} to={service.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${service.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{service.label}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/specijalnosti">
              <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                Sve specijalnosti
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-b from-white to-cyan-50/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
              <Heart className="w-3 h-3 mr-2" />Zašto WizMedik
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Zdravstvena njega kakvu zaslužujete</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Povezujemo vas s najboljim zdravstvenim stručnjacima</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group border-2 border-gray-100 hover:border-cyan-200 hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mb-4 group-hover:bg-cyan-600 transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-cyan-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Users className="w-3 h-3 mr-2" />Naši doktori
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Najbolji doktori u BiH</h2>
                <p className="text-gray-600 mt-2">Provjereni i licencirani zdravstveni stručnjaci</p>
              </div>
              <Link to="/doktori">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Svi doktori
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.slice(0, 6).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinics */}
      {clinics.length > 0 && (
        <section className="py-16 bg-cyan-50/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Building2 className="w-3 h-3 mr-2" />Zdravstvene ustanove
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Klinike i ordinacije</h2>
                <p className="text-gray-600 mt-2">Moderne zdravstvene ustanove sa vrhunskom opremom</p>
              </div>
              <Link to="/klinike">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Sve klinike
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clinics.slice(0, 4).map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cities Section - Zdravstvo u vašem gradu */}
      {cities.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative">
          {/* Medical Background Symbols */}
          <div className="absolute inset-0 opacity-5 overflow-hidden">
            <div className="absolute top-10 left-10 text-6xl">⚕️</div>
            <div className="absolute top-32 right-20 text-5xl">🏥</div>
            <div className="absolute bottom-20 left-32 text-7xl">💊</div>
            <div className="absolute bottom-32 right-10 text-6xl">🩺</div>
            <div className="absolute top-1/2 left-1/4 text-4xl">💉</div>
            <div className="absolute top-1/3 right-1/3 text-5xl">🔬</div>
            <div className="absolute bottom-1/3 left-2/3 text-4xl">❤️</div>
          </div>

          {/* Animated Pulse Circles */}
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse overflow-hidden"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 overflow-hidden"></div>

          <div className={`container mx-auto px-4 relative z-10 transition-all duration-300 ${citySearchQuery && filteredCities.length > 0 ? 'pb-96' : 'pb-0'}`}>
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 px-4 py-1 bg-white/10 text-white border-white/20">
                <MapPin className="w-3 h-3 mr-2" />Lokacije
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Zdravstvo u vašem gradu</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Pronađite doktore i klinike u svim većim gradovima Bosne i Hercegovine
              </p>
            </div>

            {/* City Search Box */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={citySearchQuery}
                  onChange={(e) => setCitySearchQuery(e.target.value)}
                  placeholder="Pretražite grad..."
                  className="w-full h-16 px-6 pr-12 rounded-2xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 text-lg"
                />
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                
                {/* Search Results Dropdown */}
                {citySearchQuery && filteredCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/20 rounded-2xl shadow-2xl max-h-96 overflow-y-auto backdrop-blur-lg">
                    {filteredCities.map((city: any) => (
                      <Link
                        key={city.id}
                        to={`/grad/${city.slug}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 flex items-center justify-center group-hover:from-cyan-500 group-hover:to-cyan-600 transition-all">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
                              {city.naziv}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {city.broj_doktora || 0}+ doktora dostupno
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* All Cities Link */}
            <div className="text-center">
              <Link 
                to="/gradovi" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
              >
                <span className="text-lg">Klikom ovdje pregledajte sve gradove</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Blog Posts Section */}
      {data.blog_posts && data.blog_posts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Lightbulb className="w-3 h-3 mr-2" />Zdravstveni savjeti
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Najnoviji članci</h2>
                <p className="text-gray-600 mt-2">Stručni savjeti i informacije od naših doktora</p>
              </div>
              <Link to="/blog">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Svi članci
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {data.blog_posts.slice(0, 3).map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200 overflow-hidden">
                    {post.slika_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={post.slika_url} 
                          alt={post.naslov}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.kategorija && (
                          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                            {post.kategorija.naziv}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('bs-BA')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                        {post.naslov}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {post.kratak_opis || post.sadrzaj?.substring(0, 150)}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions Section */}
      {pitanja.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <HelpCircle className="w-3 h-3 mr-2" />Pitanja i odgovori
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pitajte naše stručnjake</h2>
                <p className="text-gray-600 mt-2">Postavite pitanje i dobijte odgovor od verificiranih doktora</p>
              </div>
              <div className="flex gap-3">
                <Link to="/postavi-pitanje">
                  <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                    <MessageCircle className="w-4 h-4" />Postavi pitanje
                  </Button>
                </Link>
                <Link to="/pitanja">
                  <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                    Sva pitanja
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {pitanja.slice(0, 4).map((pitanje: any) => (
                <Link key={pitanje.id} to={`/pitanja/${pitanje.slug}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 transition-colors">
                          <HelpCircle className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">{pitanje.naslov}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pitanje.sadrzaj?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{pitanje.broj_odgovora || 0}</span>
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{pitanje.broj_pregleda || 0}</span>
                            {pitanje.ima_prihvacen_odgovor && <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Odgovoreno</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Card className="inline-block border-0 bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-7 h-7" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">Imate zdravstveno pitanje?</h3>
                    <p className="text-white/80 text-sm">Naši doktori su tu da vam pomognu</p>
                  </div>
                  <Link to="/postavi-pitanje">
                    <Button size="lg" className="bg-white text-cyan-600 hover:bg-white/90">
                      Postavi pitanje besplatno
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-blue-600 to-teal-600 p-8 md:p-16">
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full blur-3xl max-md:hidden"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl max-md:hidden"></div>
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Spremni ste za bolju zdravstvenu njegu?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Zakažite pregled kod najboljih doktora u Bosni i Hercegovini
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/doktori">
                  <Button size="lg" className="bg-white text-cyan-700 hover:bg-white/90 shadow-xl px-8 h-14 text-lg font-semibold">
                    Pronađi doktora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/registration-options">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
                    Registruj se kao doktor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
