import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { specialtiesAPI, citiesAPI, doctorsAPI, blogAPI, clinicsAPI, laboratoriesAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CustomSelect } from '@/components/ui/custom-select';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  ChevronRight, 
  Stethoscope, 
  Clock, 
  Building2,
  FlaskConical,
  Heart,
  Activity,
  Baby,
  Brain,
  Sparkles,
  TrendingUp,
  Award,
  Users,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const healthTopics = [
  {
    id: 'zdravlje-djece',
    title: 'Zdravlje djece',
    icon: '👶',
    color: 'from-pink-100 to-rose-100',
    iconBg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    articles: 24
  },
  {
    id: 'dijabetes',
    title: 'Dijabetes',
    icon: '📅',
    color: 'from-cyan-100 to-indigo-100',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    articles: 18
  },
  {
    id: 'visok-pritisak',
    title: 'Visok tlak',
    icon: '❤️',
    color: 'from-red-100 to-orange-100',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    articles: 21
  },
  {
    id: 'psihicko-zdravlje',
    title: 'Psihičko zdravlje',
    icon: '🧠',
    color: 'from-purple-100 to-violet-100',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    articles: 32
  }
];

export function HomepageSoft() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('doktori');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [specijalnosti, setSpecijalnosti] = useState<any[]>([]);
  const [gradovi, setGradovi] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [laboratories, setLaboratories] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [stats, setStats] = useState({ doctors: 0, clinics: 0, cities: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [specRes, gradRes, docRes, clinicRes, labRes, blogRes] = await Promise.all([
        specialtiesAPI.getAll(),
        citiesAPI.getAll(),
        doctorsAPI.getAll({ limit: 6 }),
        clinicsAPI.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        laboratoriesAPI.getAll({ limit: 6 }).catch(() => ({ data: [] })),
        blogAPI.getHomepagePosts().catch(() => ({ data: [] })),
      ]);
      
      setSpecijalnosti(specRes.data || []);
      setGradovi(gradRes.data || []);
      setDoctors(docRes.data?.data || docRes.data || []);
      setClinics(clinicRes.data?.data || clinicRes.data || []);
      setLaboratories(labRes.data?.data || labRes.data || []);
      setBlogPosts(blogRes.data?.slice(0, 3) || []);
      
      setStats({
        doctors: docRes.data?.total || docRes.data?.length || 5000,
        clinics: clinicRes.data?.total || clinicRes.data?.length || 500,
        cities: gradRes.data?.length || 100
      });
    } catch (error) { 
      console.error('Error:', error); 
    }
  };

  const handleSearch = () => {
    if (activeTab === 'doktori') {
      if (selectedCity && selectedSpecialty) {
        navigate(`/doktori/${selectedCity}/${selectedSpecialty}`);
        return;
      }
      if (selectedSpecialty) {
        navigate(`/doktori/specijalnost/${selectedSpecialty}`);
        return;
      }
      if (selectedCity) {
        navigate(`/doktori/${selectedCity}`);
        return;
      }
      navigate('/doktori');
      return;
    }

    if (activeTab === 'klinike') {
      navigate(selectedCity ? `/klinike/${selectedCity}` : '/klinike');
      return;
    }

    if (activeTab === 'laboratoriji') {
      navigate(selectedCity ? `/laboratorije/${selectedCity}` : '/laboratorije');
      return;
    }

    navigate('/doktori');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-purple-50 to-pink-50 opacity-60" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl max-md:w-48 max-md:h-48 max-md:-left-24" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl max-md:w-64 max-md:h-64 max-md:-right-32" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center mb-12"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm text-gray-700 font-medium">Vaše zdravlje, naša briga</span>
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Pronađite <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-purple-600">idealnog</span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">zdravstvenog stručnjaka</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Pretražite tisuće doktora, klinika i laboratorija. Zakažite termin online, brzo i jednostavno.
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-100"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-2xl h-14">
                <TabsTrigger 
                  value="doktori" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 text-base"
                >
                  <Stethoscope className="w-5 h-5" />
                  Doktori
                </TabsTrigger>
                <TabsTrigger 
                  value="klinike" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 text-base"
                >
                  <Building2 className="w-5 h-5" />
                  Klinike
                </TabsTrigger>
                <TabsTrigger 
                  value="laboratoriji" 
                  className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2 text-base"
                >
                  <FlaskConical className="w-5 h-5" />
                  Laboratoriji
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid md:grid-cols-3 gap-4">
              <CustomSelect
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder="Odaberite grad"
                options={gradovi.map((grad) => ({
                  value: grad.slug,
                  label: grad.naziv,
                }))}
                className="h-14"
              />

              {activeTab === 'doktori' && (
                <CustomSelect
                  value={selectedSpecialty}
                  onChange={setSelectedSpecialty}
                  placeholder="Odaberite specijalnost"
                  options={specijalnosti.map((spec) => ({
                    value: spec.slug,
                    label: spec.naziv,
                  }))}
                  className="h-14"
                />
              )}

              <Button 
                onClick={handleSearch}
                className={`h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-semibold shadow-lg hover:shadow-xl transition-all ${activeTab === 'doktori' ? '' : 'md:col-span-2'}`}
              >
                <Search className="w-5 h-5 mr-2" />
                Pretraži
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stats.doctors >= 1000 ? Math.floor(stats.doctors / 1000) + '000+' : stats.doctors + '+'}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Doktora</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {stats.clinics >= 100 ? Math.floor(stats.clinics / 100) + '00+' : stats.clinics + '+'}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Klinika</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                {stats.cities >= 100 ? Math.floor(stats.cities / 10) + '0+' : stats.cities + '+'}
              </div>
              <div className="text-gray-600 text-sm md:text-base">Gradova</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Health Topics Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Istaknute teme</h2>
            <p className="text-xl text-gray-600">Pročitajte savjete naših stručnjaka</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {healthTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/blog?category=${topic.id}`}>
                  <Card className={`hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 overflow-hidden bg-gradient-to-br ${topic.color} group cursor-pointer`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-20 h-20 mx-auto mb-4 ${topic.iconBg} rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <span className="text-4xl">{topic.icon}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-gray-800">{topic.title}</h3>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-3">
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        <span>{topic.articles} članaka</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Specialties */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Popularne specijalnosti</h2>
            <p className="text-xl text-gray-600">Pronađite stručnjaka za vaše potrebe</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specijalnosti.slice(0, 12).map((spec, index) => (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={'/specijalnost/' + spec.slug}>
                  <Card className="hover:shadow-xl hover:-translate-y-1 transition-all border-0 shadow-md bg-white">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl flex items-center justify-center">
                        <span className="text-3xl">{spec.ikona || '🏥'}</span>
                      </div>
                      <h3 className="font-semibold text-sm">{spec.naziv}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Istaknuti doktori</h2>
              <p className="text-gray-600">Najbolje ocijenjeni stručnjaci</p>
            </div>
            <Link to="/doktori">
              <Button variant="outline" className="border-2 hover:border-purple-500 hover:text-purple-600 rounded-xl">
                Svi doktori <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={'/doktor/' + doctor.slug}>
                  <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden border-0 shadow-md group">
                    <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 p-6 text-center relative">
                      <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg">
                        <AvatarImage src={doctor.slika_profila} />
                        <AvatarFallback className="bg-white text-purple-600 text-2xl font-bold">
                          {doctor.ime?.[0]}{doctor.prezime?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {doctor.verifikovan && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-white text-purple-600 border-0 shadow-sm">
                            <Award className="w-3 h-3 mr-1" />
                            Verifikovan
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-bold text-xl mb-1 group-hover:text-purple-600 transition-colors">Dr. {doctor.ime} {doctor.prezime}</h3>
                      <p className="text-purple-600 font-medium mb-3">{doctor.specijalnost}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <MapPin className="h-4 w-4" />
                        {doctor.grad}
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        {doctor.ocjena > 0 ? (
                          <div className="flex items-center gap-1">
                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            <span className="font-bold text-lg">{Number(doctor.ocjena).toFixed(1)}</span>
                            <span className="text-sm text-gray-500">({doctor.broj_ocjena})</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Novi doktor</span>
                        )}
                        <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                          <Calendar className="mr-1 h-4 w-4" />
                          Zakaži
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold mb-2">Zdravstveni savjeti</h2>
              <p className="text-gray-600">Najnoviji članci od naših stručnjaka</p>
            </div>
            <Link to="/blog">
              <Button variant="outline" className="border-2 hover:border-purple-500 hover:text-purple-600 rounded-xl">
                Svi članci <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={'/blog/' + post.slug}>
                    <Card className="hover:shadow-2xl hover:-translate-y-2 transition-all overflow-hidden border-0 shadow-md h-full group">
                      {post.thumbnail ? (
                        <div className="aspect-video overflow-hidden">
                          <img 
                            src={fixImageUrl(post.thumbnail) || ''} 
                            alt={post.naslov} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100 flex items-center justify-center">
                          <Stethoscope className="h-16 w-16 text-purple-300" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <h3 className="font-bold text-xl line-clamp-2 mb-3 group-hover:text-purple-600 transition-colors">
                          {post.naslov}
                        </h3>
                        <p className="text-gray-600 line-clamp-3 text-sm mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {post.reading_time || 5} min
                          </span>
                          <span className="text-purple-600 font-medium group-hover:underline">
                            Pročitaj više →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center border-0 shadow-md">
              <Stethoscope className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Uskoro dolaze zdravstveni savjeti</p>
            </Card>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Zašto odabrati wizMedik?</h2>
            <p className="text-xl text-gray-600">Vaše zdravlje je naš prioritet</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Provjereni stručnjaci',
                description: 'Svi naši doktori su verifikovani i imaju potrebne licence',
                gradient: 'from-cyan-500 to-cyan-500'
              },
              {
                icon: Calendar,
                title: 'Brzo zakazivanje',
                description: 'Zakažite termin online u samo nekoliko klikova',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: Shield,
                title: 'Sigurnost podataka',
                description: 'Vaši podaci su zaštićeni i potpuno sigurni',
                gradient: 'from-pink-500 to-rose-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center p-8 hover:shadow-xl transition-all border-0 shadow-md h-full group">
                  <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Spremni za bolju brigu o zdravlju?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Pridružite se hiljadama zadovoljnih pacijenata koji su pronašli svog idealnog doktora
            </p>
            <Link to="/doktori">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-gray-50 h-14 px-10 text-lg font-semibold shadow-xl rounded-2xl">
                Započni pretragu
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
