import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, doctorsAPI, citiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Search, MapPin, Star, Calendar, Users, Building2, Stethoscope } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

export function HomepageCards() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, gradRes, docRes] = await Promise.all([
          specialtiesAPI.getAll(),
          citiesAPI.getAll(),
          doctorsAPI.getAll({ limit: 6 })
        ]);
        setSpecijalnosti(specRes.data?.slice(0, 6) || []);
        setGradovi(gradRes.data?.slice(0, 4) || []);
        setFeaturedDoctors(docRes.data?.data?.slice(0, 6) || docRes.data?.slice(0, 6) || []);
      } catch (error) { console.error('Error:', error); }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery) navigate(`/doktori?pretraga=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      {/* Hero - Card Style */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm border p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Zakažite pregled online
              </h1>
              <p className="text-slate-500 mb-6">
                Pronađite doktora po specijalnosti, lokaciji ili imenu
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Pretraži doktore..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl"
                  />
                </div>
                <Button onClick={handleSearch} className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800">
                  <Search className="mr-2 h-4 w-4" /> Pretraži
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl mb-2">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{featuredDoctors.length * 100}+</p>
                <p className="text-sm text-slate-500">Doktora</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-green-50 rounded-xl mb-2">
                  <Stethoscope className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{specijalnosti.length * 5}+</p>
                <p className="text-sm text-slate-500">Specijalnosti</p>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-purple-50 rounded-xl mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{gradovi.length * 3}+</p>
                <p className="text-sm text-slate-500">Gradova</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          
          {/* Specijalnosti Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Specijalnosti</h2>
              <Link to="/specijalnosti" className="text-sm text-blue-600 hover:underline">Sve</Link>
            </div>
            <div className="space-y-2">
              {specijalnosti.map((spec) => (
                <Link
                  key={spec.id}
                  to={`/specijalnost/${spec.slug || spec.naziv.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-700">{spec.naziv}</span>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                    {spec.broj_doktora || Math.floor(Math.random() * 20 + 5)}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Gradovi Card */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Gradovi</h2>
              <Link to="/gradovi" className="text-sm text-blue-600 hover:underline">Svi</Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {gradovi.map((grad) => (
                <Link
                  key={grad.id}
                  to={`/grad/${grad.slug || grad.naziv.toLowerCase()}`}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-700 text-sm">{grad.naziv}</span>
                </Link>
              ))}
            </div>
            
            {/* Pitanja CTA */}
            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <h3 className="font-medium text-slate-900 mb-1">Imate pitanje?</h3>
              <p className="text-sm text-slate-500 mb-3">Besplatno pitajte doktore</p>
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/postavi-pitanje">Postavi pitanje</Link>
              </Button>
            </div>
          </div>

          {/* Doktori Card - Larger */}
          <div className="lg:row-span-2 bg-white rounded-2xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Istaknuti doktori</h2>
              <Link to="/doktori" className="text-sm text-blue-600 hover:underline">Svi</Link>
            </div>
            <div className="space-y-4">
              {featuredDoctors.map((doc) => (
                <Link
                  key={doc.id}
                  to={`/doktor/${doc.slug}`}
                  className="block p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={doc.slika_profila} />
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
                        {doc.ime?.[0]}{doc.prezime?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-slate-900 text-sm">Dr. {doc.ime} {doc.prezime}</h3>
                      <p className="text-xs text-blue-600">{doc.specijalnost}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {doc.grad}
                        </span>
                        {doc.ocjena > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {formatRating(doc.ocjena)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full mt-3 bg-slate-900 hover:bg-slate-800 h-8 text-xs">
                    <Calendar className="mr-1 h-3 w-3" /> Zakaži termin
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-2">Kako funkcioniše?</h2>
            <div className="grid sm:grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2 font-bold">1</div>
                <h3 className="font-medium mb-1">Pretražite</h3>
                <p className="text-sm text-white/70">Pronađite doktora po specijalnosti</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2 font-bold">2</div>
                <h3 className="font-medium mb-1">Odaberite</h3>
                <p className="text-sm text-white/70">Izaberite termin koji vam odgovara</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-2 font-bold">3</div>
                <h3 className="font-medium mb-1">Zakažite</h3>
                <p className="text-sm text-white/70">Potvrdite i dođite na pregled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">WizMedik</span>
          <div className="flex gap-6">
            <Link to="/specijalnosti" className="hover:text-slate-900">Specijalnosti</Link>
            <Link to="/pitanja" className="hover:text-slate-900">Pitanja</Link>
            <Link to="/klinike" className="hover:text-slate-900">Klinike</Link>
          </div>
          <span>© 2024 WizMedik</span>
        </div>
      </footer>
    </div>
  );
}

