import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, doctorsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Search, MapPin, Star, Calendar, ArrowRight } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

export function HomepageBold() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          specialtiesAPI.getAll(),
          doctorsAPI.getAll({ limit: 3 })
        ]);
        setSpecijalnosti(specRes.data?.slice(0, 4) || []);
        setFeaturedDoctors(docRes.data?.data?.slice(0, 3) || docRes.data?.slice(0, 3) || []);
      } catch (error) { console.error('Error:', error); }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery) navigate(`/doktori?pretraga=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero - Bold & Dark */}
      <section className="min-h-[70vh] flex items-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20" />
        <div className="max-w-5xl mx-auto w-full relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
              Vaše zdravlje.
              <br />
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Naša misija.
              </span>
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Pronađite najboljeg doktora u par sekundi.
            </p>
            
            <div className="flex gap-3 max-w-lg">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  placeholder="Specijalnost, doktor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-12 h-14 bg-white/10 border-white/20 text-white placeholder:text-gray-500 rounded-xl"
                />
              </div>
              <Button onClick={handleSearch} className="h-14 px-8 bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-xl">
                Traži
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Specijalnosti - Big Cards */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold">Specijalnosti</h2>
            <Link to="/specijalnosti" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
              Sve <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {specijalnosti.map((spec, i) => (
              <Link
                key={spec.id}
                to={`/specijalnost/${spec.slug || spec.naziv.toLowerCase().replace(/\s+/g, '-')}`}
                className={`p-6 rounded-2xl transition-all hover:scale-105 ${
                  i === 0 ? 'bg-gradient-to-br from-violet-500 to-violet-700' :
                  i === 1 ? 'bg-gradient-to-br from-cyan-500 to-cyan-700' :
                  i === 2 ? 'bg-gradient-to-br from-pink-500 to-pink-700' :
                  'bg-gradient-to-br from-amber-500 to-amber-700'
                }`}
              >
                <h3 className="font-bold text-lg">{spec.naziv}</h3>
                {spec.broj_doktora && <p className="text-white/70 text-sm mt-1">{spec.broj_doktora} doktora</p>}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Doktori - Horizontal Scroll */}
      <section className="py-16 px-4 bg-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold">Top doktori</h2>
            <Link to="/doktori" className="text-gray-400 hover:text-white flex items-center gap-1 text-sm">
              Svi <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {featuredDoctors.map((doc) => (
              <Link
                key={doc.id}
                to={`/doktor/${doc.slug}`}
                className="bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/15 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-16 w-16 ring-2 ring-white/20">
                    <AvatarImage src={doc.slika_profila} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-cyan-500 text-white font-bold">
                      {doc.ime?.[0]}{doc.prezime?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">Dr. {doc.ime} {doc.prezime}</h3>
                    <p className="text-gray-400 text-sm">{doc.specijalnost}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {doc.grad}
                  </span>
                  {doc.ocjena > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      {formatRating(doc.ocjena)}
                    </span>
                  )}
                </div>
                
                <Button className="w-full mt-4 bg-white/10 hover:bg-white/20 group-hover:bg-gradient-to-r group-hover:from-violet-500 group-hover:to-cyan-500">
                  <Calendar className="mr-2 h-4 w-4" /> Zakaži
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Imate pitanje?</h2>
          <p className="text-gray-400 mb-8">Dobijte besplatan odgovor od stručnjaka</p>
          <Button asChild size="lg" className="bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-600 hover:to-cyan-600 rounded-xl px-8">
            <Link to="/postavi-pitanje">Postavi pitanje <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">WizMedik</span>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link to="/specijalnosti" className="hover:text-white">Specijalnosti</Link>
            <Link to="/pitanja" className="hover:text-white">Pitanja</Link>
            <Link to="/klinike" className="hover:text-white">Klinike</Link>
          </div>
          <span className="text-sm text-gray-600">© 2024 WizMedik</span>
        </div>
      </footer>
    </div>
  );
}

