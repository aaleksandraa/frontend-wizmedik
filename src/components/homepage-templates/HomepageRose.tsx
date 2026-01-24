import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Search, MapPin, Calendar, Star, ChevronRight, Stethoscope, Heart, Brain, Eye, Baby, Bone } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

const specialtyIcons: Record<string, any> = {
  'Kardiologija': Heart, 'Neurologija': Brain, 'Oftalmologija': Eye,
  'Pedijatrija': Baby, 'Ortopedija': Bone, 'default': Stethoscope,
};

export function HomepageRose() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, gradRes, docRes] = await Promise.all([
          specialtiesAPI.getAll(), citiesAPI.getAll(), doctorsAPI.getAll({ limit: 6 })
        ]);
        setSpecijalnosti(specRes.data?.slice(0, 8) || []);
        setGradovi(gradRes.data?.slice(0, 6) || []);
        setFeaturedDoctors(docRes.data?.data?.slice(0, 6) || docRes.data?.slice(0, 6) || []);
      } catch (error) { console.error('Error:', error); }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery || location) navigate(`/doktori/${location || 'svi'}?pretraga=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5]">
      <Navbar />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#FFF0F0] via-[#FFF5F5] to-[#FCE4EC]">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[#F48FB1]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-[#EC407A]/10 rounded-full blur-3xl" />
        <div className="container relative mx-auto px-4 py-20 md:py-28">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-[#AD1457] mb-6">
              Brinemo o <span className="text-[#D81B60]">vašem zdravlju</span>
            </h1>
            <p className="text-xl text-[#EC407A] mb-10">Pronađite doktora koji razumije vaše potrebe.</p>
            <div className="bg-white rounded-2xl shadow-xl shadow-[#F48FB1]/15 p-4 md:p-6 max-w-3xl mx-auto border border-[#FCE4EC]">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#F48FB1]" />
                  <Input placeholder="Specijalnost ili doktor" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-12 h-14 text-lg border-[#FCE4EC] rounded-xl focus:border-[#EC407A]" />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#F48FB1]" />
                  <Input placeholder="Grad" value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="pl-12 h-14 text-lg border-[#FCE4EC] rounded-xl focus:border-[#EC407A]" />
                </div>
                <Button onClick={handleSearch} className="h-14 px-8 text-lg bg-[#D81B60] hover:bg-[#AD1457] rounded-xl">
                  <Search className="mr-2 h-5 w-5" />Pretraži
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-[#AD1457]">Specijalnosti</h2>
            <Button asChild variant="ghost" className="text-[#D81B60]"><Link to="/specijalnosti">Sve <ChevronRight className="ml-1 h-4 w-4" /></Link></Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specijalnosti.map((spec) => {
              const Icon = specialtyIcons[spec.naziv] || specialtyIcons.default;
              return (
                <Link key={spec.id} to={`/specijalnost/${spec.slug || spec.naziv.toLowerCase().replace(/\s+/g, '-')}`}>
                  <Card className="h-full border-[#FCE4EC] hover:shadow-lg hover:border-[#F48FB1] transition-all bg-gradient-to-br from-white to-[#FFF5F5]">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 mx-auto mb-3 bg-[#FCE4EC] rounded-xl flex items-center justify-center">
                        <Icon className="h-7 w-7 text-[#D81B60]" />
                      </div>
                      <h3 className="font-semibold text-[#AD1457]">{spec.naziv}</h3>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#FFF5F5]">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-[#AD1457] mb-10">Istaknuti doktori</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <Link key={doc.id} to={`/doktor/${doc.slug}`}>
                <Card className="h-full bg-white border-[#FCE4EC] hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14 border-2 border-[#FCE4EC]">
                        <AvatarImage src={doc.slika_profila} />
                        <AvatarFallback className="bg-[#FCE4EC] text-[#D81B60]">{doc.ime?.[0]}{doc.prezime?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#AD1457] truncate">Dr. {doc.ime} {doc.prezime}</h3>
                        <p className="text-[#D81B60] text-sm">{doc.specijalnost}</p>
                        <p className="text-[#F48FB1] text-sm flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{doc.grad}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#FCE4EC]">
                      {doc.ocjena > 0 ? <div className="flex items-center gap-1"><Star className="h-4 w-4 fill-[#FFB300] text-[#FFB300]" /><span className="font-semibold">{formatRating(doc.ocjena)}</span></div> : <span className="text-sm text-gray-400">Novi</span>}
                      <Button size="sm" className="bg-[#D81B60] hover:bg-[#AD1457]"><Calendar className="mr-1 h-4 w-4" />Zakaži</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-[#D81B60] to-[#EC407A]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Imate pitanje?</h2>
          <p className="text-white/90 mb-8">Besplatno postavite pitanje doktorima.</p>
          <Button asChild size="lg" className="bg-white text-[#D81B60] hover:bg-[#FCE4EC]"><Link to="/postavi-pitanje">Postavi pitanje</Link></Button>
        </div>
      </section>

      <footer className="bg-[#880E4F] text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div><h3 className="text-xl font-bold mb-3 text-[#F48FB1]">WizMedik</h3><p className="text-white/70">Vaš zdravstveni partner.</p></div>
            <div><h4 className="font-semibold mb-3">Linkovi</h4><ul className="space-y-2 text-white/70"><li><Link to="/specijalnosti" className="hover:text-[#F48FB1]">Specijalnosti</Link></li><li><Link to="/pitanja" className="hover:text-[#F48FB1]">Pitanja</Link></li></ul></div>
            <div><h4 className="font-semibold mb-3">Podrška</h4><ul className="space-y-2 text-white/70"><li><a href="#" className="hover:text-[#F48FB1]">Kontakt</a></li></ul></div>
            <div><h4 className="font-semibold mb-3">Kontakt</h4><p className="text-white/70">podrska@wizmedik.com</p></div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-6 text-center text-white/50">© 2024 WizMedik</div>
        </div>
      </footer>
    </div>
  );
}

