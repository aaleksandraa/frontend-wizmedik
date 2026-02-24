import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { citiesAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Users, Building2, ArrowRight, Search, X, Droplet, Home, FlaskConical } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface City {
  id: number;
  naziv: string;
  slug: string;
  opis: string;
  populacija?: string;
  broj_doktora: number;
  broj_klinika: number;
  broj_laboratorija: number;
  broj_banja: number;
  broj_domova: number;
}

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

export default function Cities() {
  const navigate = useNavigate();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCities();
  }, []);

  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return cities;
    const term = searchTerm.toLowerCase();
    return cities.filter(city => 
      city.naziv.toLowerCase().includes(term) ||
      city.opis?.toLowerCase().includes(term)
    );
  }, [cities, searchTerm]);

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getAll();
      setCities(response.data || []);
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Gradovi - Doktori i klinike po gradovima BiH | WizMedik</title>
        <meta name="description" content="Pronađite doktore i klinike u svim većim gradovima Bosne i Hercegovine. Sarajevo, Banja Luka, Tuzla, Mostar, Zenica i drugi." />
        <meta name="keywords" content="doktori BiH, klinike BiH, zdravstvo po gradovima, ljekari Sarajevo, ljekari Banja Luka" />
        <link rel="canonical" href={`${SITE_URL}/gradovi`} />
        <meta property="og:title" content="Gradovi - Doktori i klinike po gradovima BiH | WizMedik" />
        <meta property="og:description" content="PronaÄ‘ite doktore i klinike u svim veÄ‡im gradovima Bosne i Hercegovine." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/gradovi`} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gradovi - Doktori i klinike po gradovima BiH | WizMedik" />
        <meta name="twitter:description" content="PronaÄ‘ite doktore i klinike u svim veÄ‡im gradovima Bosne i Hercegovine." />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              Zdravstvo po gradovima
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pronađite doktore i klinike u svim većim gradovima Bosne i Hercegovine
            </p>
          </header>

          {/* Search Filter */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pretraži gradove..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10 h-12 text-lg"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Pronađeno {filteredCities.length} {filteredCities.length === 1 ? 'grad' : 'gradova'}
              </p>
            )}
          </div>

          {filteredCities.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nema rezultata</h3>
              <p className="text-muted-foreground">
                Nismo pronašli gradove koji odgovaraju "{searchTerm}"
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm('')}>
                Prikaži sve gradove
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCities.map((city) => (
                <Card 
                  key={city.slug}
                className="hover:shadow-strong transition-all duration-300 cursor-pointer group"
                onClick={() => navigate(`/grad/${city.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">{city.naziv}</CardTitle>
                  </div>
                  <p className="text-muted-foreground">
                    {city.opis}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 w-4" />
                        <span className="text-sm">Doktora</span>
                      </div>
                      <span className="font-semibold text-foreground">{city.broj_doktora}+</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-4 h-4" />
                        <span className="text-sm">Klinika</span>
                      </div>
                      <span className="font-semibold text-foreground">{city.broj_klinika}+</span>
                    </div>
                    {city.broj_laboratorija !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <FlaskConical className="w-4 h-4" />
                          <span className="text-sm">Laboratorija</span>
                        </div>
                        <span className="font-semibold text-foreground">{city.broj_laboratorija}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Droplet className="w-4 h-4" />
                        <span className="text-sm">Banja</span>
                      </div>
                      <span className="font-semibold text-foreground">{city.broj_banja || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Home className="w-4 h-4" />
                        <span className="text-sm">Domova za njegu</span>
                      </div>
                      <span className="font-semibold text-foreground">{city.broj_domova || 0}</span>
                    </div>
                  </div>
                  
                  <Button 
                    variant="medical" 
                    className="w-full group-hover:bg-primary-dark transition-colors"
                    onClick={() => navigate(`/grad/${city.slug}`)}
                  >
                    Pogledaj detaljnije
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
