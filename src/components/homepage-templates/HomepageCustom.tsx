import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DoctorCard } from '@/components/DoctorCard';
import { DoctorCardSoft } from '@/components/cards/DoctorCardSoft';
import { ClinicCard } from '@/components/ClinicCard';
import { ClinicCardSoft } from '@/components/cards/ClinicCardSoft';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useListingTemplate } from '@/hooks/useListingTemplate';
import { useHomepageData } from '@/hooks/useHomepageData';
import { 
  Search, Users, Building2, Star, 
  Stethoscope, Heart, Shield, Clock, MapPin, ArrowRight,
  Sparkles, Activity, CheckCircle2, FlaskConical,
  Droplet, Home, TrendingUp, MessageCircle, HelpCircle, Eye, Lightbulb
} from 'lucide-react';

export default function HomepageCustom() {
  const navigate = useNavigate();
  const { template: doctorTemplate } = useListingTemplate('doctors');
  const { template: clinicTemplate } = useListingTemplate('clinics');
  const { data, loading } = useHomepageData();
  
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              <Heart className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">Učitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  const settings = data.homepage_custom_settings || {};
  const doctors = data.doctors || [];
  const clinics = data.clinics || [];
  const specialties = data.specialties || [];
  const cities = data.cities || [];
  const pitanja = data.pitanja || [];
  const stats = {
    doctors: doctors.length,
    clinics: clinics.length,
    patients: 2500,
    appointments: 8000,
  };

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
    { icon: Stethoscope, label: 'Doktori', href: '/doktori', color: 'from-blue-500 to-blue-600', count: stats.doctors },
    { icon: Building2, label: 'Klinike', href: '/klinike', color: 'from-purple-500 to-purple-600', count: stats.clinics },
    { icon: FlaskConical, label: 'Laboratorije', href: '/laboratorije', color: 'from-emerald-500 to-emerald-600' },
    { icon: Droplet, label: 'Banje', href: '/banje', color: 'from-cyan-500 to-cyan-600' },
    { icon: Home, label: 'Domovi njege', href: '/domovi-njega', color: 'from-amber-500 to-amber-600' },
    { icon: MapPin, label: 'Gradovi', href: '/gradovi', color: 'from-rose-500 to-rose-600' },
  ];

  const features = [
    { icon: Clock, title: 'Brzo zakazivanje', desc: 'Zakažite pregled u samo par klikova, 24/7' },
    { icon: Shield, title: 'Verificirani doktori', desc: 'Svi doktori su provjereni i licencirani' },
    { icon: Star, title: 'Ocjene pacijenata', desc: 'Pročitajte iskustva drugih pacijenata' },
    { icon: MessageCircle, title: 'Pitajte doktora', desc: 'Postavite pitanje i dobijte stručni odgovor' },
  ];

  const healthTips = [
    { icon: Heart, title: 'Redovni pregledi', desc: 'Preventivni pregledi su ključ dobrog zdravlja', color: 'text-red-500 bg-red-50' },
    { icon: Activity, title: 'Fizička aktivnost', desc: '30 minuta vježbanja dnevno čini čuda', color: 'text-green-500 bg-green-50' },
    { icon: Lightbulb, title: 'Mentalno zdravlje', desc: 'Briga o mentalnom zdravlju je jednako važna', color: 'text-yellow-500 bg-yellow-50' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      {settings.hero_enabled && (
        <section ref={heroRef} className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-blue-700 overflow-hidden">
            <div className="absolute top-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse max-md:w-48 max-md:h-48 max-md:-left-24"></div>
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse delay-1000 max-md:w-64 max-md:h-64 max-md:-right-32"></div>
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="relative container mx-auto px-4 py-20 lg:py-28">
            <div className="max-w-5xl mx-auto">
              <div className="text-white text-center space-y-6 mb-12">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Pronađite ljekara privatne prakse za<br className="hidden md:block" />Vas i zakažite pregled
                </h1>
                
                <p className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
                  MediBIH je nacionalni servis za zakazivanje pregleda u privatnoj praksi
                </p>
              </div>

              {/* Search Box */}
              <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Type Select - FIRST */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">
                      Šta tražite?
                    </label>
                    <select 
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
                    <label className="text-sm font-medium text-muted-foreground block">
                      Oblast
                    </label>
                    <select 
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Odaberite specijalnost</option>
                      {specialties.map((specialty) => (
                        <option key={specialty.id} value={specialty.slug}>
                          {specialty.naziv}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City Select with Search - THIRD */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground block">
                      Mjesto
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={citySearchQuery}
                        onChange={(e) => setCitySearchQuery(e.target.value)}
                        onFocus={() => setCitySearchQuery('')}
                        placeholder="Pretražite grad..."
                        className="w-full h-12 px-4 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      {citySearchQuery && filteredCities.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredCities.map((city) => (
                            <button
                              key={city.id}
                              type="button"
                              onClick={() => {
                                setSelectedCity(city.slug);
                                setCitySearchQuery(city.naziv);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
                              style={{ minHeight: '44px' }}
                            >
                              {city.naziv}
                            </button>
                          ))}
                        </div>
                      )}
                      {!citySearchQuery && selectedCity && (
                        <div className="absolute inset-0 flex items-center px-4 pointer-events-none">
                          <span className="text-foreground">
                            {cities.find(c => c.slug === selectedCity)?.naziv || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <Button 
                  onClick={handleSearch}
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Pretražite
                </Button>
              </div>

              {/* Tagline */}
              <div className="mt-12 text-center">
                <p className="text-white/95 text-lg font-medium">
                  Brzo, jednostavno i pouzdano zakazivanje pregleda u privatnoj praksi
                </p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
            </svg>
          </div>
        </section>
      )}

      {/* Quick Services */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickServices.map((service, idx) => (
              <Link key={idx} to={service.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{service.label}</h3>
                    {service.count && <p className="text-sm text-gray-500">{service.count}+ dostupno</p>}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-1"><Heart className="w-3 h-3 mr-2 text-red-500" />Zašto MediBIH</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Zdravstvena njega kakvu zaslužujete</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Povezujemo vas s najboljim zdravstvenim stručnjacima u Bosni i Hercegovini</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Card key={idx} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white">
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                    <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      {settings.specialties_enabled && specialties.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1"><Stethoscope className="w-3 h-3 mr-2" />Specijalnosti</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{settings.specialties_title || 'Pronađite specijaliste'}</h2>
                {settings.specialties_subtitle && <p className="text-gray-600 mt-2">{settings.specialties_subtitle}</p>}
              </div>
              <Link to="/specijalnosti"><Button variant="outline" className="group">Sve specijalnosti<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {specialties.slice(0, settings.specialties_count || 12).map((spec) => (
                <Link key={spec.id} to={`/specijalnost/${spec.slug}`}>
                  <Card className={`group cursor-pointer transition-all duration-300 border-2 hover:border-primary hover:shadow-lg ${activeSpecialty === spec.id ? 'border-primary shadow-lg' : 'border-transparent'}`}
                    onMouseEnter={() => setActiveSpecialty(spec.id)} onMouseLeave={() => setActiveSpecialty(null)}>
                    <CardContent className="p-4 text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                        {spec.icon_url ? (spec.icon_url.startsWith('icon:') ? <span className="text-3xl">{spec.icon_url.replace('icon:', '')}</span> : <img src={spec.icon_url} alt={spec.naziv} className="w-8 h-8 object-contain" />) : <Stethoscope className="w-8 h-8 text-primary group-hover:text-white transition-colors duration-300" />}
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm line-clamp-2">{spec.naziv}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {settings.doctors_enabled && doctors.length > 0 && (
        <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1"><Users className="w-3 h-3 mr-2" />Naši doktori</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{settings.doctors_title || 'Najbolji doktori'}</h2>
                {settings.doctors_subtitle && <p className="text-gray-600 mt-2">{settings.doctors_subtitle}</p>}
              </div>
              {settings.doctors_show_view_all && <Link to="/doktori"><Button variant="outline" className="group">Svi doktori<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.slice(0, settings.doctors_count || 6).map((doctor) => (
                doctorTemplate === 'soft' ? <DoctorCardSoft key={doctor.id} doctor={doctor} /> : <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinics */}
      {settings.clinics_enabled && clinics.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1"><Building2 className="w-3 h-3 mr-2" />Zdravstvene ustanove</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{settings.clinics_title || 'Klinike i ordinacije'}</h2>
                {settings.clinics_subtitle && <p className="text-gray-600 mt-2">{settings.clinics_subtitle}</p>}
              </div>
              {settings.clinics_show_view_all && <Link to="/klinike"><Button variant="outline" className="group">Sve klinike<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clinics.slice(0, settings.clinics_count || 4).map((clinic) => (
                clinicTemplate === 'soft' ? <ClinicCardSoft key={clinic.id} clinic={clinic} /> : <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Questions Section */}
      {pitanja.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 bg-white"><HelpCircle className="w-3 h-3 mr-2 text-indigo-500" />Pitanja i odgovori</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pitajte naše stručnjake</h2>
                <p className="text-gray-600 mt-2">Postavite pitanje i dobijte odgovor od verificiranih doktora</p>
              </div>
              <div className="flex gap-3">
                <Link to="/postavi-pitanje"><Button className="gap-2"><MessageCircle className="w-4 h-4" />Postavi pitanje</Button></Link>
                <Link to="/pitanja"><Button variant="outline" className="group">Sva pitanja<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {pitanja.slice(0, 4).map((pitanje: any) => (
                <Link key={pitanje.id} to={`/pitanja/${pitanje.slug}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{pitanje.naslov}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pitanje.sadrzaj?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{pitanje.broj_odgovora || 0} odgovora</span>
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{pitanje.broj_pregleda || 0} pregleda</span>
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
              <Card className="inline-block border-0 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"><MessageCircle className="w-7 h-7" /></div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-semibold text-lg">Imate zdravstveno pitanje?</h3>
                    <p className="text-white/80 text-sm">Naši doktori su tu da vam pomognu</p>
                  </div>
                  <Link to="/postavi-pitanje"><Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90">Postavi pitanje besplatno</Button></Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Health Tips */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 px-4 py-1"><Lightbulb className="w-3 h-3 mr-2 text-yellow-500" />Zdravstveni savjeti</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Brinite o svom zdravlju</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Korisni savjeti za održavanje dobrog zdravlja</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {healthTips.map((tip, idx) => (
              <Card key={idx} className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${tip.color} flex items-center justify-center mb-4`}><tip.icon className="w-7 h-7" /></div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-gray-600 text-sm">{tip.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Link to="/blog"><Button variant="outline" size="lg" className="group"><TrendingUp className="w-5 h-5 mr-2" />Pročitajte više na našem blogu<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button></Link>
          </div>
        </div>
      </section>

      {/* Cities */}
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
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse overflow-hidden"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000 overflow-hidden"></div>

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
                    {filteredCities.map((city) => (
                      <Link
                        key={city.id}
                        to={`/grad/${city.slug}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center group-hover:from-primary group-hover:to-primary/80 transition-all">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg group-hover:text-primary transition-colors">
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



      {/* Blog - Removed for performance, can be added back if needed */}

      {/* CTA */}
      {settings.cta_enabled && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-blue-700 p-8 md:p-16">
              <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full blur-3xl max-md:hidden"></div>
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl max-md:hidden"></div>
              <div className="relative text-center max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm mb-6"><Sparkles className="w-4 h-4 text-yellow-300" /><span>Započnite danas</span></div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{settings.cta_title || 'Spremni ste za bolju zdravstvenu njegu?'}</h2>
                {settings.cta_subtitle && <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">{settings.cta_subtitle}</p>}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={settings.cta_button_link || '/doktori'}><Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-xl px-8 h-14 text-lg font-semibold">{settings.cta_button_text || 'Pronađi doktora'}<ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
                  <Link to="/registration-options"><Button size="lg" variant="outline" className="border-white/30 text-slate-900 bg-white hover:bg-white/90 px-8 h-14 text-lg">Registruj se kao doktor</Button></Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
