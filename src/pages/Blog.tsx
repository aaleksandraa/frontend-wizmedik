import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Calendar, Clock, User, ChevronLeft, ChevronRight, BookOpen, TrendingUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { fixImageUrl } from '@/utils/imageUrl';

interface BlogPost {
  id: number;
  naslov: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  autor_name: string;
  reading_time: number;
  published_at: string;
  categories: Array<{ id: number; naziv: string; slug: string }>;
  doktor?: { ime: string; prezime: string; slug: string; slika_profila?: string };
}

interface Category {
  id: number;
  naziv: string;
  slug: string;
  posts_count: number;
}

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await blogAPI.getPosts({
        category: selectedCategory || undefined,
        search: searchTerm || undefined,
        page: currentPage,
        per_page: 12
      });
      setPosts(response.data.data || []);
      setTotalPages(response.data.last_page || 1);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setCurrentPage(1);
    setSearchParams(slug ? { category: slug } : {});
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "WizMedik Blog - Zdravstveni savjeti",
    "description": "Stručni zdravstveni savjeti od doktora u Bosni i Hercegovini",
    "url": "https://wizmedik.com/blog",
    "blogPost": posts.slice(0, 5).map(post => ({
      "@type": "BlogPosting",
      "headline": post.naslov,
      "description": post.excerpt,
      "author": { "@type": "Person", "name": post.autor_name },
      "datePublished": post.published_at,
      "url": `https://wizmedik.com/blog/${post.slug}`
    }))
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <>
      <Helmet>
        <title>Blog - Zdravstveni savjeti od doktora | wizMedik</title>
        <meta name="description" content="Čitajte stručne zdravstvene savjete od doktora u BiH. Članci o prevenciji, liječenju i zdravom životu." />
        <meta name="keywords" content="zdravstveni savjeti, medicinski blog, doktor savjeti, zdravlje bih, prevencija bolesti" />
        <link rel="canonical" href="https://wizmedik.ba/blog" />
        <meta property="og:title" content="wizMedik Blog - Zdravstveni savjeti" />
        <meta property="og:description" content="Stručni zdravstveni savjeti od doktora u Bosni i Hercegovini" />
        <meta property="og:url" content="https://wizmedik.ba/blog" />
        <meta property="og:type" content="blog" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <Navbar />
        
        {/* Hero Section - Mobile Optimized */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-6 md:py-16 px-4"
        >
          <div className="max-w-7xl mx-auto text-center">
            {/* Icon - Desktop only */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="hidden md:inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-2xl shadow-lg mb-6"
            >
              <BookOpen className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent mb-2 md:mb-4">
              Zdravstveni savjeti
            </h1>
            <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto">
              Stručni članci i savjeti od naših doktora za vaše zdravlje i dobrobit
            </p>
          </div>
        </motion.div>
        
        <main className="max-w-7xl mx-auto px-4 py-12">
          {/* Search and filters */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Pretražite članke..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-gray-200 focus:border-primary shadow-sm"
                />
              </div>
              <Button type="submit" className="h-12 px-8 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
                <Search className="w-4 h-4 mr-2" />
                Traži
              </Button>
            </form>
          </motion.div>

          {/* Categories */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-gray-900">Kategorije</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={!selectedCategory ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform"
                onClick={() => handleCategoryChange('')}
              >
                Sve kategorije
              </Badge>
              {categories.map(cat => (
                <Badge
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 rounded-full text-sm hover:scale-105 transition-transform"
                  onClick={() => handleCategoryChange(cat.slug)}
                >
                  {cat.naziv} <span className="ml-1 opacity-70">({cat.posts_count})</span>
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Posts grid - Mobile: horizontal layout, Desktop: grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-24 md:h-96 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl md:rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xl text-gray-600">Nema pronađenih članaka</p>
              <p className="text-sm text-gray-500 mt-2">Pokušajte promijeniti filter ili pretragu</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8"
            >
              {posts.map(post => (
                <motion.div key={post.id} variants={itemVariants}>
                  <Link to={`/blog/${post.slug}`}>
                    {/* Mobile: Horizontal layout (image left, text right) */}
                    <Card className="md:hidden h-full hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl border-0 shadow-sm hover:scale-[1.02] group">
                      <div className="flex gap-3 p-3">
                        {/* Image - Left side, square */}
                        {post.thumbnail ? (
                          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                            <img 
                              src={fixImageUrl(post.thumbnail) || ''} 
                              alt={post.naslov} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-primary/30" />
                          </div>
                        )}
                        
                        {/* Content - Right side */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          {/* Categories */}
                          <div className="flex flex-wrap gap-1 mb-1">
                            {post.categories.slice(0, 1).map(cat => (
                              <Badge key={cat.id} variant="secondary" className="text-[10px] rounded-full px-2 py-0.5 bg-primary/10 text-primary border-0">
                                {cat.naziv}
                              </Badge>
                            ))}
                          </div>
                          
                          {/* Title */}
                          <h2 className="font-semibold text-sm line-clamp-2 text-gray-900 group-hover:text-primary transition-colors mb-1">
                            {post.naslov}
                          </h2>
                          
                          {/* Meta info */}
                          <div className="flex items-center gap-2 text-[10px] text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-2.5 w-2.5" />
                              {format(new Date(post.published_at), 'dd.MM.yyyy')}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {post.reading_time} min
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Desktop: Vertical card layout (original) */}
                    <Card className="hidden md:block h-full hover:shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl border-0 shadow-md hover:-translate-y-1 group">
                      {post.thumbnail ? (
                        <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                          <img 
                            src={fixImageUrl(post.thumbnail) || ''} 
                            alt={post.naslov} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          />
                        </div>
                      ) : (
                        <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center">
                          <BookOpen className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {post.categories.slice(0, 2).map(cat => (
                            <Badge key={cat.id} variant="secondary" className="text-xs rounded-full px-3 py-1 bg-primary/10 text-primary border-0">
                              {cat.naziv}
                            </Badge>
                          ))}
                        </div>
                        <h2 className="font-bold text-xl mb-3 line-clamp-2 text-gray-900 group-hover:text-primary transition-colors">
                          {post.naslov}
                        </h2>
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {post.doktor ? (
                            <div className="flex items-center gap-2">
                              {post.doktor.slika_profila ? (
                                <img 
                                  src={post.doktor.slika_profila} 
                                  alt={`Dr. ${post.doktor.ime} ${post.doktor.prezime}`}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-xs font-medium">
                                  {post.doktor.ime[0]}{post.doktor.prezime[0]}
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-700">
                                Dr. {post.doktor.ime} {post.doktor.prezime}
                              </span>
                            </div>
                          ) : (
                            <div></div>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(post.published_at), 'dd.MM.yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {post.reading_time} min
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center items-center gap-3 mt-12"
            >
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="rounded-xl border-gray-200 hover:border-primary hover:bg-primary/5"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Prethodna
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10 h-10 rounded-xl"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="rounded-xl border-gray-200 hover:border-primary hover:bg-primary/5"
              >
                Sljedeća
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
