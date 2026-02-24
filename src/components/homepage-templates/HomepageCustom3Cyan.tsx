import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomSelect } from '@/components/ui/custom-select';
import { DoctorCard } from '@/components/DoctorCard';
import CareHomeCardSoft from '@/components/cards/CareHomeCardSoft';
import SpaCardSoft from '@/components/cards/SpaCardSoft';
import { ClinicCard } from '@/components/ClinicCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useHomepageData } from '@/hooks/useHomepageData';
import { settingsAPI, specialtiesAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';
import { 
  Search, Heart, Users, Building2, MapPin, ArrowRight,
  HelpCircle, MessageCircle, Eye, CheckCircle2, Lightbulb,
  Stethoscope, Activity, FlaskConical, Droplet, Home
} from 'lucide-react';

interface SpecialtyCategory {
  id: number;
  naziv: string;
  slug: string;
  parent_id?: number | null;
  children?: SpecialtyCategory[];
}

export default function HomepageCustom3Cyan() {
  const navigate = useNavigate();
  const { data, loading } = useHomepageData();
  
  const [selectedType, setSelectedType] = useState('');
  const [selectedMainSpecialty, setSelectedMainSpecialty] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [currentWord, setCurrentWord] = useState(0);
  const [hierarchicalSpecialties, setHierarchicalSpecialties] = useState<SpecialtyCategory[]>([]);
  const [loadingHierarchicalSpecialties, setLoadingHierarchicalSpecialties] = useState(true);
  const [heroBgSettings, setHeroBgSettings] = useState({
    enabled: false,
    image: null as string | null,
    opacity: 20
  });

  // Animated words that change every 2 seconds
  const words = ['ljekara', 'kliniku', 'banju', 'dom', 'savjet'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Load hierarchical specialties (main categories + subcategories)
  useEffect(() => {
    let isMounted = true;

    const loadHierarchicalSpecialties = async () => {
      try {
        const response = await specialtiesAPI.getAll();
        if (!isMounted) {
          return;
        }

        const categories = Array.isArray(response.data)
          ? (response.data as SpecialtyCategory[])
          : [];
        setHierarchicalSpecialties(categories);
      } catch (error) {
        console.error('Error loading hierarchical specialties:', error);
      } finally {
        if (isMounted) {
          setLoadingHierarchicalSpecialties(false);
        }
      }
    };

    loadHierarchicalSpecialties();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load hero background settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await settingsAPI.getTemplates();
        setHeroBgSettings({
          enabled: response.data.custom3_hero_bg_enabled || false,
          image: response.data.custom3_hero_bg_image || null,
          opacity: response.data.custom3_hero_bg_opacity || 20
        });
      } catch (error) {
        console.error('Error loading hero background settings:', error);
      }
    };
    loadSettings();
  }, []);

  const doctors = data?.doctors || [];
  const clinics = data?.clinics || [];
  const homepageSpecialties = data?.specialties || [];
  const cities = data?.cities || []; // For display with doctor counts
  const allCities = data?.all_cities || []; // For dropdown filters
  const pitanja = data?.pitanja || [];
  const blogPosts = data?.blog_posts || [];
  const isDoctorSearch = !selectedType || selectedType === 'doktori';

  const groupedSpecialties = useMemo<SpecialtyCategory[]>(() => {
    if (hierarchicalSpecialties.length > 0) {
      return hierarchicalSpecialties;
    }

    return homepageSpecialties.map((specialty: any) => ({
      id: specialty.id,
      naziv: specialty.naziv,
      slug: specialty.slug,
      parent_id: specialty.parent_id || null,
      children: [],
    }));
  }, [hierarchicalSpecialties, homepageSpecialties]);

  const mainSpecialtyOptions = useMemo(
    () =>
      groupedSpecialties.map((specialty) => ({
        value: specialty.slug,
        label: specialty.naziv,
      })),
    [groupedSpecialties]
  );

  const selectedMainSpecialtyData = useMemo(
    () =>
      groupedSpecialties.find(
        (specialty) => specialty.slug === selectedMainSpecialty
      ) || null,
    [groupedSpecialties, selectedMainSpecialty]
  );

  const hasSubcategories = (selectedMainSpecialtyData?.children?.length || 0) > 0;

  const subSpecialtyOptions = useMemo(() => {
    if (!selectedMainSpecialtyData) {
      return [];
    }

    const parentOption = {
      value: selectedMainSpecialtyData.slug,
      label: `Opsta - ${selectedMainSpecialtyData.naziv}`,
    };

    if (!selectedMainSpecialtyData.children || selectedMainSpecialtyData.children.length === 0) {
      return [parentOption];
    }

    return [
      parentOption,
      ...selectedMainSpecialtyData.children.map((child) => ({
        value: child.slug,
        label: child.naziv,
      })),
    ];
  }, [selectedMainSpecialtyData]);

  // Debug: Log blog posts data
  console.log('Blog posts data:', data?.blog_posts);
  console.log('Blog posts length:', blogPosts.length);

  const filteredCities = allCities.filter((city: any) => 
    city.naziv.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isDoctorSearch) {
      setSelectedMainSpecialty('');
      setSelectedSpecialty('');
    }
  }, [isDoctorSearch]);

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-cyan-50">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
              <Heart className="absolute inset-0 m-auto w-8 h-8 text-cyan-500 animate-pulse" />
            </div>
            <p className="text-muted-foreground">Ucitavanje...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleMainSpecialtyChange = (parentSlug: string) => {
    setSelectedMainSpecialty(parentSlug);
    setSelectedSpecialty(parentSlug);
  };

  const handleSubSpecialtyChange = (specialtySlug: string) => {
    setSelectedSpecialty(specialtySlug);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const type = selectedType || 'doktori';
    let finalUrl = '/doktori';

    if (type === 'doktori') {
      if (selectedCity && selectedSpecialty) {
        finalUrl = `/doktori/${selectedCity}/${selectedSpecialty}`;
      } else if (selectedSpecialty) {
        finalUrl = `/doktori/specijalnost/${selectedSpecialty}`;
      } else if (selectedCity) {
        finalUrl = `/doktori/${selectedCity}`;
      } else {
        finalUrl = '/doktori';
      }
    } else if (type === 'klinike') {
      finalUrl = selectedCity ? `/klinike/${selectedCity}` : '/klinike';
    } else if (type === 'laboratorije') {
      finalUrl = selectedCity ? `/laboratorije/${selectedCity}` : '/laboratorije';
    } else if (type === 'banje') {
      finalUrl = selectedCity ? `/banje/${selectedCity}` : '/banje';
    } else if (type === 'domovi') {
      finalUrl = selectedCity ? `/domovi-njega/${selectedCity}` : '/domovi-njega';
    }

    navigate(finalUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-cyan-50">
      <Navbar />
      
      {/* Hero Section - Clean Centered Design */}
      <section className="relative py-20 lg:py-32 pb-32 lg:pb-40">
        {/* Background Image (if enabled) */}
        {heroBgSettings.enabled && heroBgSettings.image && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${heroBgSettings.image})`,
              opacity: heroBgSettings.opacity / 100
            }}
          />
        )}

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Heading with Animated Word */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Pronađite{' '}
              <span 
                key={currentWord}
                className="text-cyan-600 inline-block animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
              >
                {words[currentWord]}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 mb-12">
              Zakažite pregled kod najboljih u Bosni i Hercegovini
            </p>

            {/* Search Box - Clean White Card */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
              <form onSubmit={handleSearch} className="space-y-6">
                <div className={`grid grid-cols-1 md:grid-cols-2 ${hasSubcategories ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-4`}>
                  {/* Type Select */}
                  <div className="relative z-40">
                    <CustomSelect
                      label="Šta tražite?"
                      value={selectedType}
                      onChange={setSelectedType}
                      placeholder="Odaberite tip"
                      hideLabelOnMobile={true}
                      options={[
                        { value: 'doktori', label: 'Doktori' },
                        { value: 'klinike', label: 'Klinike' },
                        { value: 'laboratorije', label: 'Laboratorije' },
                        { value: 'banje', label: 'Banje i rehabilitacija' },
                        { value: 'domovi', label: 'Domovi za starija i bolesna lica' },
                      ]}
                    />
                  </div>

                  {/* Main specialty category */}
                  <div className="relative z-30">
                    <CustomSelect
                      label="Glavna oblast medicine"
                      value={selectedMainSpecialty}
                      onChange={handleMainSpecialtyChange}
                      placeholder={isDoctorSearch ? 'Odaberite glavnu oblast...' : 'Dostupno za doktore'}
                      disabled={!isDoctorSearch || loadingHierarchicalSpecialties || mainSpecialtyOptions.length === 0}
                      hideLabelOnMobile={true}
                      options={mainSpecialtyOptions}
                    />
                  </div>

                  {/* Subcategory / general option */}
                  {hasSubcategories && (
                    <div className="relative z-20">
                      <CustomSelect
                        label="Podkategorija (opcionalno)"
                        value={selectedSpecialty}
                        onChange={handleSubSpecialtyChange}
                        placeholder="Odaberite podkategoriju ili opstu opciju"
                        disabled={!isDoctorSearch || !selectedMainSpecialty}
                        hideLabelOnMobile={true}
                        options={subSpecialtyOptions}
                      />
                    </div>
                  )}

                  {/* City Select */}
                  <div className="relative z-10">
                    <CustomSelect
                      label="Grad"
                      value={selectedCity}
                      onChange={setSelectedCity}
                      placeholder="Odaberite grad"
                      hideLabelOnMobile={true}
                      options={allCities.map((city: any) => ({
                        value: city.slug,
                        label: city.naziv,
                      }))}
                    />
                  </div>
                </div>

                {isDoctorSearch && selectedMainSpecialty && hasSubcategories && (
                  <p className="text-xs text-gray-500 text-left">
                    Mozete izabrati opstu kategoriju ili jednu podkategoriju.
                  </p>
                )}

                {/* Search Button */}
                <Button 
                  type="submit"
                  size="lg" 
                  className="w-full h-14 text-lg font-semibold bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Pretražite
                </Button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="text-sm text-gray-600">
              <span className="font-medium">Verificirani </span>
              <Link to="/doktori" className="font-medium hover:text-cyan-600 transition-colors">doktori</Link>
              <span className="mx-2">/</span>
              <Link to="/klinike" className="hover:text-cyan-600 transition-colors">klinike</Link>
              <span className="mx-2">/</span>
              <Link to="/laboratorije" className="hover:text-cyan-600 transition-colors">laboratorije</Link>
              <span className="mx-2">/</span>
              <Link to="/banje" className="hover:text-cyan-600 transition-colors">banje</Link>
              <span className="mx-2">/</span>
              <Link to="/domovi-njega" className="hover:text-cyan-600 transition-colors">domovi</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Specialties - Quick Services Style */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Najpopularnije specijalnosti</h2>
            <p className="text-gray-600">Brzo pronađite doktora za vašu potrebu</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Stethoscope, label: 'Opšta medicina', href: '/specijalnost/opsta-medicina-i-porodicna-medicina', color: 'bg-cyan-100 text-cyan-600' },
              { icon: Heart, label: 'Kardiologija', href: '/specijalnost/kardiologija', color: 'bg-cyan-100 text-cyan-600' },
              { icon: Activity, label: 'Interna medicina', href: '/specijalnost/interna-medicina', color: 'bg-teal-100 text-teal-600' },
              { icon: FlaskConical, label: 'Laboratorije', href: '/laboratorije', color: 'bg-emerald-100 text-emerald-600' },
              { icon: Droplet, label: 'Banje', href: '/banje', color: 'bg-sky-100 text-sky-600' },
              { icon: Home, label: 'Domovi njege', href: '/domovi-njega', color: 'bg-indigo-100 text-indigo-600' },
            ].map((service, idx) => (
              <Link key={idx} to={service.href}>
                <Card className="group hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl ${service.color} flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{service.label}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/specijalnosti">
              <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                Sve specijalnosti
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section - Latest Health Tips */}
      {blogPosts && blogPosts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-cyan-50 via-cyan-50 to-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                <Lightbulb className="w-3 h-3 mr-2" />Zdravstveni savjeti
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Najnoviji savjeti</h2>
              <p className="text-gray-600">Stručni savjeti i informacije od naših doktora</p>
            </div>

            {/* Desktop: 3 columns with large images */}
            <div className="hidden md:grid md:grid-cols-3 gap-6">
              {blogPosts.slice(0, 3).map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200 overflow-hidden">
                    {post.slika_url && (
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={fixImageUrl(post.slika_url) || ''} 
                          alt={post.naslov}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {post.kategorija && (
                          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
                            {post.kategorija.naziv}
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">
                        {post.naslov}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {post.kratak_opis || post.sadrzaj?.substring(0, 150)}
                      </p>
                      {post.doktor && (
                        <p className="text-xs text-gray-500">
                          Dr. {post.doktor.ime} {post.doktor.prezime}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Mobile: Horizontal layout (small image left, text right) */}
            <div className="md:hidden space-y-4">
              {blogPosts.slice(0, 3).map((post: any) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-lg transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Small thumbnail on left */}
                        {post.slika_url && (
                          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                            <img 
                              src={fixImageUrl(post.slika_url) || ''} 
                              alt={post.naslov}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        
                        {/* Text content on right */}
                        <div className="flex-1 min-w-0">
                          {post.kategorija && (
                            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 mb-2">
                              {post.kategorija.naziv}
                            </Badge>
                          )}
                          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 text-sm">
                            {post.naslov}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">
                            {new Date(post.created_at).toLocaleDateString('de-DE')}
                          </p>
                          {post.doktor && (
                            <p className="text-xs text-gray-500">
                              Dr. {post.doktor.ime} {post.doktor.prezime}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link to="/blog">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Svi savjeti
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Questions Section */}
      {pitanja.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-cyan-50 via-cyan-50 to-teal-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <HelpCircle className="w-3 h-3 mr-2" />Pitanja i odgovori
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pitajte naše stručnjake</h2>
                <p className="text-gray-600 mt-2">Postavite pitanje i dobijte odgovor od verificiranih doktora</p>
              </div>
              <div className="flex gap-3">
                <Link to="/postavi-pitanje">
                  <Button className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                    <MessageCircle className="w-4 h-4" />Postavi pitanje
                  </Button>
                </Link>
                <Link to="/pitanja">
                  <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                    Sva pitanja
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {pitanja.slice(0, 4).map((pitanje: any) => (
                <Link key={pitanje.id} to={`/pitanja/${pitanje.slug}`}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-cyan-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-600 transition-colors">
                          <HelpCircle className="w-6 h-6 text-cyan-600 group-hover:text-white transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-cyan-700 transition-colors">{pitanje.naslov}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{pitanje.sadrzaj?.substring(0, 150)}...</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" />{pitanje.broj_odgovora || 0}</span>
                            <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{pitanje.broj_pregleda || 0}</span>
                            {pitanje.ima_prihvacen_odgovor && <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Odgovoreno</Badge>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Users className="w-3 h-3 mr-2" />Naši doktori
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Najbolji doktori u BiH</h2>
                <p className="text-gray-600 mt-2">Provjereni i licencirani zdravstveni stručnjaci</p>
              </div>
              <Link to="/doktori">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Svi doktori
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.slice(0, 6).map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Clinics */}
      {clinics.length > 0 && (
        <section className="py-16 bg-cyan-50/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Building2 className="w-3 h-3 mr-2" />Zdravstvene ustanove
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Klinike i ordinacije</h2>
                <p className="text-gray-600 mt-2">Moderne zdravstvene ustanove sa vrhunskom opremom</p>
              </div>
              <Link to="/klinike">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Sve klinike
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {clinics.slice(0, 4).map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banje Section */}
      {data.banje && data.banje.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Heart className="w-3 h-3 mr-2" />Rehabilitacija i oporavak
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Banje i rehabilitacioni centri</h2>
                <p className="text-gray-600 mt-2">Specijalizovani centri za oporavak i rehabilitaciju</p>
              </div>
              <Link to="/banje">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Sve banje
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.banje.slice(0, 4).map((banja: any) => (
                <SpaCardSoft key={banja.id} banja={banja} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Domovi Section */}
      {data.domovi && data.domovi.length > 0 && (
        <section className="py-16 bg-cyan-50/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1 border-cyan-200 text-cyan-700">
                  <Users className="w-3 h-3 mr-2" />Njega i briga
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Domovi za starija i bolesna lica</h2>
                <p className="text-gray-600 mt-2">Profesionalna njega i briga u sigurnom okruženju</p>
              </div>
              <Link to="/domovi-njega">
                <Button variant="outline" className="group border-cyan-200 text-cyan-700 hover:bg-cyan-50">
                  Svi domovi
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.domovi.slice(0, 4).map((dom: any) => (
                <CareHomeCardSoft key={dom.id} dom={dom} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Cities Section */}
      {allCities.length > 0 && (
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
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse overflow-hidden"></div>
          <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000 overflow-hidden"></div>

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
                    {filteredCities.map((city: any) => (
                      <Link
                        key={city.id}
                        to={`/grad/${city.slug}`}
                        className="flex items-center justify-between px-6 py-4 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/30 to-cyan-500/10 flex items-center justify-center group-hover:from-cyan-500 group-hover:to-cyan-600 transition-all">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg group-hover:text-cyan-400 transition-colors">
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

            <div className="text-center">
              <Link 
                to="/gradovi" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
              >
                <span className="text-lg">Pregledajte sve gradove</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-600 via-cyan-600 to-teal-600 p-8 md:p-16">
            <div className="absolute -top-48 -right-48 w-96 h-96 bg-white/10 rounded-full blur-3xl max-md:hidden"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl max-md:hidden"></div>
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Spremni ste za bolju zdravstvenu njegu?</h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Zakažite pregled kod najboljih doktora u Bosni i Hercegovini
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/doktori">
                  <Button size="lg" className="bg-white text-cyan-700 hover:bg-white/90 shadow-xl px-8 h-14 text-lg font-semibold">
                    Pronađi doktora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/registration-options">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-lg">
                    Registruj se kao doktor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

