import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { pitanjaAPI, specialtiesAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MessageSquare, Search, Plus, CheckCircle2, Clock, ChevronRight, Calendar, ChevronDown } from 'lucide-react';

export default function Pitanja() {
  const [pitanja, setPitanja] = useState<any[]>([]);
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [popularniTagovi, setPopularniTagovi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pretraga, setPretraga] = useState('');
  const [selectedSpecijalnost, setSelectedSpecijalnost] = useState<string>('all');
  const [filter, setFilter] = useState<'sve' | 'odgovorena' | 'neodgovorena'>('sve');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { loadData(); }, [selectedSpecijalnost, filter, currentPage, pretraga]);
  useEffect(() => { loadSpecijalnosti(); loadPopularneTagove(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: any = { page: currentPage };
      if (selectedSpecijalnost && selectedSpecijalnost !== 'all') {
        if (selectedSpecijalnost.startsWith('parent-')) {
          const parentId = selectedSpecijalnost.replace('parent-', '');
          const parent = hierarchicalSpecijalnosti.find(p => p.id.toString() === parentId);
          const childIds = parent?.children?.map((c: any) => c.id) || [];
          params.specijalnost_ids = [parseInt(parentId), ...childIds].join(',');
        } else {
          params.specijalnost_id = selectedSpecijalnost;
        }
      }
      if (filter === 'odgovorena') params.odgovoreno = true;
      else if (filter === 'neodgovorena') params.odgovoreno = false;
      if (pretraga) params.pretraga = pretraga;
      const response = await pitanjaAPI.getPitanja(params);
      setPitanja(response.data.data);
      setTotalPages(response.data.last_page);
    } catch (error) {
      toast.error('Greška pri učitavanju pitanja');
    } finally {
      setLoading(false);
    }
  };

  const loadSpecijalnosti = async () => {
    try {
      const response = await specialtiesAPI.getAll();
      setSpecijalnosti(response.data);
    } catch (error) {}
  };

  // Hierarchical specialties - group by parent
  const hierarchicalSpecijalnosti = useMemo(() => {
    const parents = specijalnosti.filter(s => !s.parent_id);
    const children = specijalnosti.filter(s => s.parent_id);
    
    return parents.map(parent => ({
      ...parent,
      children: children.filter(c => c.parent_id === parent.id)
    }));
  }, [specijalnosti]);

  const loadPopularneTagove = async () => {
    try {
      const response = await pitanjaAPI.getPopularneTagove();
      setPopularniTagovi(response.data.slice(0, 10));
    } catch (error) {}
  };

  const MJESECI = ['januar', 'februar', 'mart', 'april', 'maj', 'juni', 'juli', 'august', 'septembar', 'oktobar', 'novembar', 'decembar'];

  const formatDatum = (datum: string) => {
    const date = new Date(datum);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Danas';
    if (days === 1) return 'Juče';
    if (days < 7) return `Prije ${days} dana`;
    return `${MJESECI[date.getMonth()]}, ${date.getFullYear()}.`;
  };

  return (
    <>
      <Helmet>
        <title>Medicinska Pitanja i Odgovori - MediBIH</title>
        <meta name="description" content="Pregledajte medicinska pitanja i odgovore od stručnih doktora" />
      </Helmet>
      <Navbar />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-2xl md:text-4xl font-bold mb-3">Medicinska Pitanja</h1>
              <p className="text-white/90 mb-6 text-sm md:text-base">Postavite pitanje i dobijte odgovor od stručnih doktora</p>
              <Button asChild size="lg" variant="secondary" className="shadow-lg">
                <Link to="/postavi-pitanje">
                  <Plus className="mr-2 h-5 w-5" />
                  Postavi Pitanje
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Pretražite pitanja..."
                  value={pretraga}
                  onChange={(e) => setPretraga(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && loadData()}
                  className="pl-10 h-11"
                />
              </div>
              <Select value={selectedSpecijalnost} onValueChange={setSelectedSpecijalnost}>
                <SelectTrigger className="w-full md:w-56 h-11">
                  <SelectValue placeholder="Specijalnost" />
                </SelectTrigger>
                <SelectContent className="max-h-96">
                  <SelectItem value="all">Sve specijalnosti</SelectItem>
                  {hierarchicalSpecijalnosti.map((parent) => (
                    <div key={parent.id}>
                      <SelectItem value={`parent-${parent.id}`} className="font-semibold bg-muted/50">
                        {parent.naziv} {parent.children?.length > 0 && `(sve)`}
                      </SelectItem>
                      {parent.children?.map((child: any) => (
                        <SelectItem key={child.id} value={child.id.toString()} className="pl-6 text-sm">
                          └ {child.naziv}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden md:flex gap-1 bg-gray-100 p-1 rounded-lg">
                {[
                  { value: 'sve', label: 'Sve' },
                  { value: 'odgovorena', label: 'Odgovorena', icon: CheckCircle2 },
                  { value: 'neodgovorena', label: 'Čeka', icon: Clock }
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as any)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                      filter === f.value ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.icon && <f.icon className="h-4 w-4" />}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            
            {popularniTagovi.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                <span className="text-sm text-gray-500">Popularno:</span>
                {popularniTagovi.map((tag) => (
                  <Badge 
                    key={tag.tag} 
                    variant="secondary" 
                    className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => { setPretraga(tag.tag); setCurrentPage(1); }}
                  >
                    {tag.tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Questions List */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-gray-500">Učitavanje...</p>
            </div>
          ) : pitanja.length === 0 ? (
            <Card className="py-16 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Nema pitanja za prikaz</p>
              <Button asChild className="mt-4">
                <Link to="/postavi-pitanje">Postavi prvo pitanje</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {pitanja.map((pitanje) => (
                <Card key={pitanje.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    {/* Question Header */}
                    <div className="p-4 md:p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <Badge variant="outline" className="text-xs shrink-0">
                              {pitanje.specijalnost?.naziv}
                            </Badge>
                            {pitanje.je_odgovoreno ? (
                              <Badge className="bg-green-500 text-xs shrink-0">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Odgovoreno
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                Čeka odgovor
                              </Badge>
                            )}
                          </div>
                          <Link to={`/pitanja/${pitanje.slug}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2 text-base md:text-lg">
                              {pitanje.naslov}
                            </h3>
                          </Link>
                        </div>
                        <Link to={`/pitanja/${pitanje.slug}`} className="shrink-0">
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </Link>
                      </div>
                      
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {pitanje.sadrzaj}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{pitanje.ime_korisnika}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDatum(pitanje.created_at)}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {pitanje.odgovori?.length || 0}
                        </span>
                      </div>
                      
                      {pitanje.tagovi && pitanje.tagovi.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {pitanje.tagovi.map((tag: string) => (
                            <Badge 
                              key={tag} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-primary hover:text-white"
                              onClick={(e) => { 
                                e.preventDefault();
                                e.stopPropagation();
                                setPretraga(tag); 
                                setCurrentPage(1);
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {/* Doctor Answer Preview */}
                    {pitanje.odgovori && pitanje.odgovori.length > 0 && (
                      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-t p-4 md:p-5">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-white shadow-sm shrink-0">
                            <AvatarImage src={pitanje.odgovori[0].doktor?.slika_profila} />
                            <AvatarFallback className="bg-primary text-white text-sm">
                              {pitanje.odgovori[0].doktor?.user?.ime?.[0]}{pitanje.odgovori[0].doktor?.user?.prezime?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">
                                Dr. {pitanje.odgovori[0].doktor?.user?.ime} {pitanje.odgovori[0].doktor?.user?.prezime}
                              </span>
                              {pitanje.odgovori[0].doktor?.specijalnosti?.[0] && (
                                <span className="text-xs text-primary font-medium">
                                  {pitanje.odgovori[0].doktor?.specijalnosti[0].naziv}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                              {pitanje.odgovori[0].sadrzaj}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button asChild variant="outline" size="sm" className="h-8 text-xs">
                                <Link to={`/doktor/${pitanje.odgovori[0].doktor?.slug}`}>
                                  Pogledaj Profil
                                </Link>
                              </Button>
                              <Button asChild size="sm" className="h-8 text-xs">
                                <Link to={`/doktor/${pitanje.odgovori[0].doktor?.slug}#booking`}>
                                  Rezerviši Termin
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Prethodna
                  </Button>
                  <span className="flex items-center px-4 text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Sljedeća
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
