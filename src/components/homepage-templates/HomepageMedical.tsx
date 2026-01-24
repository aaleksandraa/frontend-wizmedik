import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI, blogAPI, clinicsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { useSmartSearch } from '@/hooks/useSmartSearch';
import { 
  Search, MapPin, Calendar, Star, ChevronRight, Play,
  Stethoscope, Heart, Brain, Eye, Baby, Bone, Clock, Users, Building2
} from 'lucide-react';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart, 'Neurologija': Brain, 'Oftalmologija': Eye,
  'Pedijatrija': Baby, 'Ortopedija': Bone, 'default': Stethoscope,
};

export function HomepageMedical() {
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [specRes, gradRes, docRes, blogRes, clinicRes] = await Promise.all([
        specialtiesAPI.getAll(),
        citiesAPI.getAll(),
        doctorsAPI.getAll({ limit: 8 }),
        blogAPI.getHomepagePosts().catch(() => ({ data: [] })),
        clinicsAPI.getAll({ limit: 4 }),
      ]);
      setSpecijalnosti(specRes.data?.slice(0, 8) || []);
      setGradovi(gradRes.data?.filter((g: any) => g.u_gradu)?.slice(0, 6) || gradRes.data?.slice(0, 6) || []);
      setDoctors(docRes.data?.data?.slice(0, 8) || docRes.data?.slice(0, 8) || []);
      setBlogPosts(blogRes.data?.slice(0, 4) || []);
      setClinics(clinicRes.data?.data?.slice(0, 4) || clinicRes.data?.slice(0, 4) || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
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
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-white/20 text-white mb-6 px-4 py-2">🏥 #1 Medicinska platforma u BiH</Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Vaše zdravlje je naš prioritet
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Pronađite najboljeg doktora, zakažite termin online i dobijte stručne savjete - sve na jednom mjestu.
            </p>
            
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-2xl p-4 md:p-6 max-w-2xl mx-auto">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                  <Input
                    placeholder="Pretraži doktore, specijalnosti... (npr. ortoped, srce)"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="pl-12 h-14 text-lg border-gray-200 rounded-xl"
                  />
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
                <Button onClick={handleSearch} size="lg" className="h-14 px-8 bg-blue-600 hover:bg-blue-700 rounded-xl">
                  Pretraži
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <span className="text-sm text-gray-500">Popularno:</span>
                {['Kardiolog', 'Dermatolog', 'Stomatolog', 'Ginekolog'].map(term => (
                  <Link key={term} to={`/doktori/specijalnost/${term.toLowerCase()}`} className="text-sm text-blue-600 hover:underline">{term}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><div className="text-3xl font-bold text-blue-600">{doctors.length * 50}+</div><div className="text-gray-600">Doktora</div></div>
            <div><div className="text-3xl font-bold text-blue-600">{clinics.length * 25}+</div><div className="text-gray-600">Klinika</div></div>
            <div><div className="text-3xl font-bold text-blue-600">{specijalnosti.length * 5}+</div><div className="text-gray-600">Specijalnosti</div></div>
            <div><div className="text-3xl font-bold text-blue-600">50K+</div><div className="text-gray-600">Zadovoljnih pacijenata</div></div>
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Popularne specijalnosti</h2>
              <p className="text-gray-600 mt-2">Odaberite specijalnost i pronađite stručnjaka</p>
            </div>
            <Button asChild variant="outline"><Link to="/specijalnosti">Sve specijalnosti <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specijalnosti.map((spec) => {
              const IconComponent = specialtyIcons[spec.naziv] || specialtyIcons.default;
              return (
                <Link key={spec.id} to={`/specijalnost/${spec.slug}`} className="group">
                  <Card className="h-full hover:shadow-lg transition-all hover:border-blue-500 cursor-pointer bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                        <IconComponent className="h-8 w-8 text-blue-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-semibold text-gray-900">{spec.naziv}</h3>
                      <p className="text-sm text-gray-500 mt-1">{spec.broj_doktora || Math.floor(Math.random() * 50) + 10} doktora</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Cities */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Najpopularniji gradovi</h2>
            <p className="text-gray-600 mt-2">Pronađite doktore u vašem gradu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {gradovi.map((grad) => (
              <Link key={grad.id} to={`/grad/${grad.slug}`} className="group">
                <Card className="hover:shadow-lg transition-all hover:border-blue-500 overflow-hidden">
                  <div className="h-24 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <CardContent className="p-4 text-center">
                    <h3 className="font-semibold text-gray-900">{grad.naziv}</h3>
                    <p className="text-sm text-gray-500">{grad.broj_doktora || Math.floor(Math.random() * 100) + 20} doktora</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
            <Button asChild variant="outline"><Link to="/doktori">Svi doktori <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((doctor) => (
              <Link key={doctor.id} to={`/doktor/${doctor.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <Avatar className="h-20 w-20 mx-auto border-4 border-blue-100">
                        <AvatarImage src={doctor.slika_profila} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">{doctor.ime?.[0]}{doctor.prezime?.[0]}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-gray-900 mt-3">Dr. {doctor.ime} {doctor.prezime}</h3>
                      <p className="text-blue-600 text-sm">{doctor.specijalnost}</p>
                      <div className="flex items-center justify-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPin className="h-3 w-3" /><span>{doctor.grad}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      {doctor.ocjena > 0 ? (
                        <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" /><span className="font-semibold">{formatRating(doctor.ocjena)}</span></div>
                      ) : <span className="text-sm text-gray-500">Novi</span>}
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Calendar className="mr-1 h-4 w-4" />Zakaži</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Health Tips */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Zdravstveni savjeti</h2>
              <p className="text-gray-600 mt-2">Najnoviji članci i savjeti naših stručnjaka</p>
            </div>
            <Button asChild variant="outline"><Link to="/blog">Svi članci <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          {blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {blogPosts.map((post) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer overflow-hidden">
                    {post.thumbnail ? (
                      <img src={post.thumbnail} alt={post.naslov} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <Stethoscope className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="secondary" className="mb-2">Zdravlje</Badge>
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{post.naslov}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <Clock className="h-3 w-3" /><span>{post.reading_time || 5} min čitanja</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Stethoscope className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Uskoro dolaze zdravstveni savjeti</p>
            </div>
          )}
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Video savjeti</h2>
            <p className="text-gray-400 mt-2">Pogledajte korisne video materijale naših stručnjaka</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Kako prepoznati simptome srčanih bolesti', duration: '5:32', views: '12K' },
              { title: 'Pravilna ishrana za zdravo srce', duration: '8:15', views: '8.5K' },
              { title: 'Važnost redovnih pregleda', duration: '4:48', views: '15K' },
            ].map((video, i) => (
              <Card key={i} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all cursor-pointer overflow-hidden group">
                <div className="relative h-48 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></div>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-white line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{video.views} pregleda</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clinics Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Istaknute klinike</h2>
              <p className="text-gray-600 mt-2">Najbolje zdravstvene ustanove</p>
            </div>
            <Button asChild variant="outline"><Link to="/klinike">Sve klinike <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {clinics.map((clinic) => (
              <Link key={clinic.id} to={`/klinika/${clinic.slug}`}>
                <Card className="h-full hover:shadow-lg transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{clinic.naziv}</h3>
                    <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" /><span>{clinic.grad}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <Users className="h-3 w-3" /><span>{clinic.broj_doktora || 5} doktora</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Imate pitanje za doktora?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">Postavite pitanje i dobijte odgovor od stručnih doktora potpuno besplatno.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary"><Link to="/postavi-pitanje">Postavi pitanje</Link></Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10"><Link to="/pitanja">Pregledaj pitanja</Link></Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div><h3 className="text-xl font-bold mb-4">WizMedik</h3><p className="text-gray-400">Vaš partner za zdravlje u Bosni i Hercegovini.</p></div>
            <div><h4 className="font-semibold mb-4">Linkovi</h4><ul className="space-y-2 text-gray-400"><li><Link to="/specijalnosti" className="hover:text-white">Specijalnosti</Link></li><li><Link to="/gradovi" className="hover:text-white">Gradovi</Link></li><li><Link to="/klinike" className="hover:text-white">Klinike</Link></li><li><Link to="/blog" className="hover:text-white">Blog</Link></li></ul></div>
            <div><h4 className="font-semibold mb-4">Podrška</h4><ul className="space-y-2 text-gray-400"><li><a href="#" className="hover:text-white">Pomoć</a></li><li><a href="#" className="hover:text-white">Kontakt</a></li><li><a href="#" className="hover:text-white">Privatnost</a></li></ul></div>
            <div><h4 className="font-semibold mb-4">Kontakt</h4><p className="text-gray-400">podrska@wizmedik.com</p><p className="text-gray-400">+387 33 123 456</p></div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">© 2024 WizMedik. Sva prava zadržana.</div>
        </div>
      </footer>
    </div>
  );
}

