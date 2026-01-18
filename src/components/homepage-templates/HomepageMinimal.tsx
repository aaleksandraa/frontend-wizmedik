import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, doctorsAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Search, MapPin, Star, ArrowRight, Phone } from 'lucide-react';
import { formatRating } from '@/utils/formatters';

export function HomepageMinimal() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [specRes, docRes] = await Promise.all([
          specialtiesAPI.getAll(),
          doctorsAPI.getAll({ limit: 4 })
        ]);
        setSpecijalnosti(specRes.data?.slice(0, 6) || []);
        setFeaturedDoctors(docRes.data?.data?.slice(0, 4) || docRes.data?.slice(0, 4) || []);
      } catch (error) { console.error('Error:', error); }
    };
    loadData();
  }, []);

  const handleSearch = () => {
    if (searchQuery) navigate(`/doktori?pretraga=${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero - Ultra Simple */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Pronađite doktora
          </h1>
          <p className="text-lg text-gray-500 mb-8">
            Brzo i jednostavno zakazivanje pregleda
          </p>
          
          <div className="flex gap-2 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Pretraži..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button onClick={handleSearch} className="h-12 px-6">
              Traži
            </Button>
          </div>
        </div>
      </section>

      {/* Specijalnosti - Simple List */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">Specijalnosti</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {specijalnosti.map((spec) => (
              <Link
                key={spec.id}
                to={`/specijalnost/${spec.slug || spec.naziv.toLowerCase().replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-700 hover:border-gray-400 hover:text-gray-900 transition-colors text-sm"
              >
                {spec.naziv}
              </Link>
            ))}
            <Link to="/specijalnosti" className="px-4 py-2 text-primary hover:underline text-sm flex items-center gap-1">
              Sve <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Doktori - Clean List */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Doktori</h2>
            <Link to="/doktori" className="text-primary text-sm hover:underline flex items-center gap-1">
              Svi doktori <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          
          <div className="space-y-3">
            {featuredDoctors.map((doc) => (
              <Link
                key={doc.id}
                to={`/doktor/${doc.slug}`}
                className="flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={doc.slika_profila} />
                  <AvatarFallback className="bg-gray-100 text-gray-600">{doc.ime?.[0]}{doc.prezime?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">Dr. {doc.ime} {doc.prezime}</h3>
                  <p className="text-sm text-gray-500">{doc.specijalnost}</p>
                </div>
                <div className="text-right hidden sm:block">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">{doc.grad}</span>
                  </div>
                  {doc.ocjena > 0 && (
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-600">{formatRating(doc.ocjena)}</span>
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-gray-300" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Simple */}
      <section className="py-12 px-4 bg-gray-900">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Imate pitanje?</h2>
          <p className="text-gray-400 mb-6">Besplatno postavite pitanje doktorima</p>
          <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
            <Link to="/postavi-pitanje">Postavi pitanje</Link>
          </Button>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-gray-900">MediBIH</span>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/specijalnosti" className="hover:text-gray-900">Specijalnosti</Link>
            <Link to="/pitanja" className="hover:text-gray-900">Pitanja</Link>
            <a href="tel:+38733123456" className="hover:text-gray-900 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Kontakt
            </a>
          </div>
          <span className="text-sm text-gray-400">© 2024</span>
        </div>
      </footer>
    </div>
  );
}

