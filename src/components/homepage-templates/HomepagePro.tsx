import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI, blogAPI, clinicsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { ClinicCard } from '@/components/ClinicCard';
import { DoctorCard } from '@/components/DoctorCard';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { 
  Search, MapPin, ChevronRight, Play,
  Stethoscope, Heart, Brain, Eye, Baby, Bone, Clock
} from 'lucide-react';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart, 'Neurologija': Brain, 'Oftalmologija': Eye,
  'Pedijatrija': Baby, 'Ortopedija': Bone, 'default': Stethoscope,
};

const specialtyDescriptions: Record<string, string> = {
  'Kardiologija': 'Srce i krvni sudovi',
  'Neurologija': 'Mozak i živčani sistem',
  'Oftalmologija': 'Oči i vid',
  'Pedijatrija': 'Zdravlje djece',
  'Ortopedija': 'Kosti i zglobovi',
  'Dermatologija': 'Koža i kosa',
  'Ginekologija': 'Žensko zdravlje',
  'Stomatologija': 'Zubi i usna šupljina',
  'Urologija': 'Urinarni sistem',
  'Psihijatrija': 'Mentalno zdravlje',
};

export function HomepagePro() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { search, getSuggestions } = useSmartSearch();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [specRes, gradRes, docRes, blogRes, clinicRes] = await Promise.all([
        specialtiesAPI.getAll(),
        citiesAPI.getAll(),
        doctorsAPI.getAll({ limit: 8 }),
        blogAPI.getHomepagePosts().catch(() => ({ data: [] })),
        clinicsAPI.getAll({ limit: 6 }),
      ]);
      setSpecijalnosti(specRes.data?.slice(0, 8) || []);
      setGradovi(gradRes.data?.filter((g: any) => g.u_gradu)?.slice(0, 6) || gradRes.data?.slice(0, 6) || []);
      setDoctors(docRes.data?.data?.slice(0, 8) || docRes.data?.slice(0, 8) || []);
      setBlogPosts(blogRes.data?.slice(0, 4) || []);
      setClinics(clinicRes.data?.data?.slice(0, 6) || clinicRes.data?.slice(0, 6) || []);
    } catch (error) { console.error('Error:', error); }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      const sugg = getSuggestions(value, 5);
      setSuggestions(sugg);
      setShowSuggestions(sugg.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = () => {
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      const result = search(searchQuery);
      navigate(result.redirect);
    } else {
      navigate('/doktori');
    }
  };

  const handleSuggestionClick = (spec: any) => {
    setShowSuggestions(false);
    setSearchQuery(spec.naziv);
    navigate(`/doktori/specijalnost/${spec.slug}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="bg-white/20 text-white mb-6 px-4 py-2 text-sm">🏥 #1 Medicinska platforma u BiH</Badge>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Vaše zdravlje je naš prioritet
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Pronađite najboljeg doktora, zakažite termin online i dobijte stručne savjete.
            </p>
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    placeholder="Pretraži doktore, specijalnosti... (npr. ortoped, srce, zubar)"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 h-12 md:h-14 text-base md:text-lg border-gray-200 rounded-xl text-gray-900"
                  />
                  {/* Suggestions dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                      {suggestions.map((spec) => (
                        <div
                          key={spec.id}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 text-left"
                          onMouseDown={() => handleSuggestionClick(spec)}
                        >
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium text-gray-900">{spec.naziv}</div>
                            <div className="text-xs text-gray-500">Specijalnost</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleSearch} size="lg" className="h-12 md:h-14 px-6 md:px-8 bg-blue-600 hover:bg-blue-700 rounded-xl">
                  <Search className="h-5 w-5 mr-2" />Pretraži
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center items-center">
                <span className="text-sm text-gray-500">Popularno:</span>
                <Link to="/doktori/specijalnost/kardiologija" className="text-sm text-blue-600 hover:underline">Kardiolog</Link>
                <Link to="/doktori/specijalnost/dermatologija" className="text-sm text-blue-600 hover:underline">Dermatolog</Link>
                <Link to="/doktori/specijalnost/stomatologija" className="text-sm text-blue-600 hover:underline">Stomatolog</Link>
                <Link to="/doktori/specijalnost/ginekologija" className="text-sm text-blue-600 hover:underline">Ginekolog</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Bar */}
      <section className="bg-white border-b py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div><div className="text-2xl md:text-3xl font-bold text-blue-600">{doctors.length * 50}+</div><div className="text-sm md:text-base text-gray-600">Doktora</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-blue-600">{clinics.length * 25}+</div><div className="text-sm md:text-base text-gray-600">Klinika</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-blue-600">{specijalnosti.length * 5}+</div><div className="text-sm md:text-base text-gray-600">Specijalnosti</div></div>
            <div><div className="text-2xl md:text-3xl font-bold text-blue-600">50K+</div><div className="text-sm md:text-base text-gray-600">Pacijenata</div></div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Popularne specijalnosti</h2>
              <p className="text-gray-600 mt-1 md:mt-2">Odaberite specijalnost i pronađite stručnjaka</p>
            </div>
            <Button asChild variant="outline" className="w-fit"><Link to="/specijalnosti">Sve specijalnosti <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
            {specijalnosti.map((spec) => {
              const IconComponent = specialtyIcons[spec.naziv] || specialtyIcons.default;
              const description = specialtyDescriptions[spec.naziv] || 'Stručna medicinska njega';
              return (
                <Link key={spec.id} to={'/doktori/specijalnost/' + spec.slug} className="group">
                  <Card className="h-full hover:shadow-lg transition-all hover:border-blue-500 cursor-pointer bg-white">
                    <CardContent className="p-4 md:p-6 text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-blue-50 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <IconComponent className="h-6 w-6 md:h-8 md:w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm md:text-base">{spec.naziv}</h3>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">{description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Najpopularniji gradovi</h2>
            <p className="text-gray-600 mt-1 md:mt-2">Pronađite doktore u vašem gradu</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {gradovi.map((grad) => (
              <Link key={grad.id} to={'/grad/' + grad.slug} className="group">
                <Card className="hover:shadow-lg transition-all hover:border-blue-500 overflow-hidden">
                  <div className="h-20 md:h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <MapPin className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <CardContent className="p-3 md:p-4 text-center">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">{grad.naziv}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors - Uses DoctorCard with selected template */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Istaknuti doktori</h2>
              <p className="text-gray-600 mt-1 md:mt-2">Najbolje ocijenjeni stručnjaci</p>
            </div>
            <Button asChild variant="outline" className="w-fit"><Link to="/doktori">Svi doktori <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {doctors.slice(0, 4).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>


      {/* Featured Clinics - Uses ClinicCard with selected template */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Istaknute klinike</h2>
              <p className="text-gray-600 mt-1 md:mt-2">Najbolje zdravstvene ustanove</p>
            </div>
            <Button asChild variant="outline" className="w-fit"><Link to="/klinike">Sve klinike <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {clinics.map((clinic) => (
              <ClinicCard key={clinic.id} clinic={clinic} />
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Health Tips */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Zdravstveni savjeti</h2>
              <p className="text-gray-600 mt-1 md:mt-2">Najnoviji članci naših stručnjaka</p>
            </div>
            <Button asChild variant="outline" className="w-fit"><Link to="/blog">Svi članci <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          {blogPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} to={'/blog/' + post.slug}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer overflow-hidden group">
                    <div className="relative h-36 md:h-40 overflow-hidden">
                      {post.thumbnail ? (
                        <img src={post.thumbnail} alt={post.naslov} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                          <Stethoscope className="h-10 w-10 md:h-12 md:w-12 text-white/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2 text-xs">Zdravlje</Badge>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm md:text-base">{post.naslov}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" /><span>{post.reading_time || 5} min</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 md:py-12 bg-white rounded-xl">
              <Stethoscope className="h-10 w-10 md:h-12 md:w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Uskoro dolaze zdravstveni savjeti</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-12 md:py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white">Video savjeti</h2>
            <p className="text-gray-400 mt-1 md:mt-2">Korisni video materijali naših stručnjaka</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {[
              { title: 'Kako prepoznati simptome srčanih bolesti', duration: '5:32', views: '12K' },
              { title: 'Pravilna ishrana za zdravo srce', duration: '8:15', views: '8.5K' },
              { title: 'Važnost redovnih pregleda', duration: '4:48', views: '15K' },
            ].map((video, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all cursor-pointer overflow-hidden group">
                <div className="relative h-40 md:h-48 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-6 w-6 md:h-8 md:w-8 text-white ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white line-clamp-2 text-sm md:text-base">{video.title}</h3>
                  <p className="text-xs md:text-sm text-gray-400 mt-2">{video.views} pregleda</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 md:mb-6">Imate pitanje za doktora?</h2>
          <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8 max-w-2xl mx-auto">Postavite pitanje i dobijte odgovor od stručnih doktora potpuno besplatno.</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto"><Link to="/postavi-pitanje">Postavi pitanje</Link></Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10"><Link to="/pitanja">Pregledaj pitanja</Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-xl font-bold mb-4">WizMedik</h3>
              <p className="text-gray-400 text-sm">Vaš partner za zdravlje u Bosni i Hercegovini.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4">Linkovi</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/specijalnosti" className="hover:text-white transition-colors">Specijalnosti</Link></li>
                <li><Link to="/gradovi" className="hover:text-white transition-colors">Gradovi</Link></li>
                <li><Link to="/klinike" className="hover:text-white transition-colors">Klinike</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4">Podrška</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/pitanja" className="hover:text-white transition-colors">Pitanja</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privatnost</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4">Kontakt</h4>
              <p className="text-gray-400 text-sm">podrska@wizmedik.com</p>
              <p className="text-gray-400 text-sm">+387 33 123 456</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 md:pt-8 text-center text-gray-500 text-sm">
            © 2024 WizMedik. Sva prava zadržana.
          </div>
        </div>
      </footer>
    </div>
  );
}
