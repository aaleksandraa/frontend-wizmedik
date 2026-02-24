import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI, blogAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Search, MapPin, Calendar, Star, ChevronRight, Play, ArrowRight, Stethoscope, Clock, Sparkles } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

export function HomepageModern() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [specRes, gradRes, docRes, blogRes] = await Promise.all([
        specialtiesAPI.getAll(), citiesAPI.getAll(), doctorsAPI.getAll({ limit: 6 }),
        blogAPI.getHomepagePosts().catch(() => ({ data: [] })),
      ]);
      setSpecijalnosti(specRes.data?.slice(0, 6) || []);
      setGradovi(gradRes.data?.slice(0, 8) || []);
      setDoctors(docRes.data?.data?.slice(0, 6) || docRes.data?.slice(0, 6) || []);
      setBlogPosts(blogRes.data?.slice(0, 3) || []);
    } catch (error) { console.error('Error:', error); }
  };

  const handleSearch = () => { navigate('/doktori?pretraga=' + encodeURIComponent(searchQuery)); };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <Badge className="bg-white/20 text-white mb-6 px-4 py-2"><Sparkles className="w-4 h-4 mr-2 inline" />Online konsultacije</Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">Zdravlje na <span className="text-emerald-200">prvom mjestu</span></h1>
              <p className="text-xl text-white/80 mb-8 max-w-lg">Povezite se sa najboljim doktorima u BiH.</p>
              <Link to="/doktori"><Button size="lg" className="bg-white text-emerald-700 h-14 px-8">Pronadji doktora <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
            </div>
            <div className="bg-white rounded-3xl shadow-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Pretrazi doktore</h2>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input placeholder="Specijalnost ili ime" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-14 rounded-xl" />
              </div>
              <Button onClick={handleSearch} className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 rounded-xl"><Search className="mr-2 h-5 w-5" />Pretrazi</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Pronađite strucnjaka</h2>
            <p className="text-xl text-gray-600">Odaberite specijalnost</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {specijalnosti.map((spec) => (
              <Link key={spec.id} to={'/specijalnost/' + spec.slug}>
                <Card className="hover:shadow-xl hover:-translate-y-1 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 mx-auto mb-4 bg-emerald-50 rounded-2xl flex items-center justify-center"><span className="text-2xl">{spec.ikona || ''}</span></div>
                    <h3 className="font-semibold text-sm">{spec.naziv}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-10">Najpopularniji gradovi</h2>
          <div className="grid grid-cols-2 md:grid-cols-8 gap-4">
            {gradovi.map((grad) => (
              <Link key={grad.id} to={'/grad/' + grad.slug}>
                <div className="bg-white rounded-2xl p-4 text-center hover:shadow-lg transition-all">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center"><MapPin className="h-6 w-6 text-white" /></div>
                  <h3 className="font-medium text-sm">{grad.naziv}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Istaknuti doktori</h2>
            <Link to="/doktori"><Button variant="ghost">Svi doktori <ChevronRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <Link key={doctor.id} to={'/doktor/' + doctor.slug}>
                <Card className="hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-center">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-white">
                      <AvatarImage src={doctor.slika_profila} />
                      <AvatarFallback className="bg-white text-emerald-600 text-2xl">{doctor.ime?.[0]}{doctor.prezime?.[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg">Dr. {doctor.ime} {doctor.prezime}</h3>
                    <p className="text-emerald-600">{doctor.specijalnost}</p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500"><MapPin className="h-4 w-4" />{doctor.grad}</div>
                    <div className="flex justify-between mt-4 pt-4 border-t">
                      {doctor.ocjena > 0 ? <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />{formatRating(doctor.ocjena)}</div> : <span className="text-sm text-gray-500">Novi</span>}
                      <Button size="sm" className="bg-emerald-600"><Calendar className="mr-1 h-4 w-4" />Zakazi</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-bold">Najnoviji savjeti</h2>
            <Link to="/blog"><Button variant="ghost">Svi clanci <ChevronRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
          {blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} to={'/blog/' + post.slug}>
                  <Card className="hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                    {post.thumbnail ? <img src={fixImageUrl(post.thumbnail) || ''} alt={post.naslov} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center"><Stethoscope className="h-16 w-16 text-white/30" /></div>}
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg line-clamp-2 mb-2">{post.naslov}</h3>
                      <p className="text-gray-600 line-clamp-2 text-sm">{post.excerpt}</p>
                      <div className="flex items-center gap-1 mt-4 text-xs text-gray-500"><Clock className="h-3 w-3" />{post.reading_time || 5} min</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : <Card className="p-12 text-center"><Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-4" /><p className="text-gray-500">Uskoro dolaze savjeti</p></Card>}
        </div>
      </section>

      <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Video savjeti</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[{ title: 'Prevencija srcanih bolesti', duration: '6:24' }, { title: 'Zdrava ishrana', duration: '8:45' }, { title: 'Mentalno zdravlje', duration: '5:12' }].map((video, i) => (
              <div key={i} className="group cursor-pointer">
                <div className="relative rounded-2xl overflow-hidden aspect-video bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform"><Play className="h-8 w-8 text-white ml-1" /></div>
                  <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">{video.duration}</span>
                </div>
                <h3 className="font-semibold text-white mt-4">{video.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Spremni za bolju brigu o zdravlju?</h2>
          <Link to="/doktori"><Button size="lg" className="bg-white text-emerald-700 h-14 px-10">Zapocni pretragu <ArrowRight className="ml-2 h-5 w-5" /></Button></Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div><h3 className="text-2xl font-bold mb-4">WizMedik</h3><p className="text-gray-400">Vas partner za zdravlje.</p></div>
            <div><h4 className="font-semibold mb-4">Navigacija</h4><ul className="space-y-2 text-gray-400"><li><Link to="/doktori" className="hover:text-white">Doktori</Link></li><li><Link to="/klinike" className="hover:text-white">Klinike</Link></li></ul></div>
            <div><h4 className="font-semibold mb-4">Podrska</h4><ul className="space-y-2 text-gray-400"><li><Link to="/pitanja" className="hover:text-white">Pitanja</Link></li></ul></div>
            <div><h4 className="font-semibold mb-4">Kontakt</h4><p className="text-gray-400">podrska@wizmedik.com</p></div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-500">2024 WizMedik</div>
        </div>
      </footer>
    </div>
  );
}

