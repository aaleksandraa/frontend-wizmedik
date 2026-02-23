import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { blogAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/custom-select';
import { Calendar, BookOpen, ChevronRight, Loader2 } from 'lucide-react';
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
  opis?: string;
  posts_count: number;
}

interface Author {
  id: number;
  ime: string;
  prezime: string;
  slug: string;
  posts_count: number;
}

const SITE_URL = 'https://wizmedik.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/wizmedik-logo.png`;

export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [selectedAuthor, setSelectedAuthor] = useState(searchParams.get('author') || 'all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const postsPerPage = 10;
  const hasFilterParams = selectedCategory !== 'all' || selectedAuthor !== 'all';

  // Sync state with URL parameters when they change
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const authorParam = searchParams.get('author');
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory('all');
    }
    
    if (authorParam) {
      setSelectedAuthor(authorParam);
    } else {
      setSelectedAuthor('all');
    }
    
    // Scroll to top when URL params change (user clicked on category link)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    fetchPosts(1, true);
  }, [selectedCategory, selectedAuthor]);

  const fetchPosts = async (page: number = 1, reset: boolean = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await blogAPI.getPosts({
        category: selectedCategory !== 'all' ? selectedCategory : undefined,
        author: selectedAuthor !== 'all' ? selectedAuthor : undefined,
        page,
        per_page: postsPerPage
      });
      
      const newPosts = response.data.data || [];
      
      if (reset || page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(response.data.current_page < response.data.last_page);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
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

  const fetchAuthors = async () => {
    try {
      const response = await blogAPI.getAuthors();
      setAuthors(response.data || []);
    } catch (error) {
      console.error('Error fetching authors:', error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchPosts(nextPage, false);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (value !== 'all') {
      setSearchParams({ category: value });
    } else {
      setSearchParams({});
    }
  };

  const handleAuthorChange = (value: string) => {
    setSelectedAuthor(value);
    if (value !== 'all') {
      setSearchParams({ author: value });
    } else {
      setSearchParams({});
    }
  };

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "WizMedik Blog - Zdravstveni savjeti",
    "description": "Strucni zdravstveni savjeti od doktora u Bosni i Hercegovini",
    "url": `${SITE_URL}/blog`,
    "blogPost": posts.slice(0, 5).map(post => ({
      "@type": "BlogPosting",
      "headline": post.naslov,
      "description": post.excerpt,
      "author": { "@type": "Person", "name": post.autor_name },
      "datePublished": post.published_at,
      "url": `${SITE_URL}/blog/${post.slug}`
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
        <meta name="description" content="Citajte strucne zdravstvene savjete od doktora u BiH. Clanci o prevenciji, lijecenju i zdravom zivotu." />
        <meta name="keywords" content="zdravstveni savjeti, medicinski blog, doktor savjeti, zdravlje bih, prevencija bolesti" />
        <meta name="robots" content={hasFilterParams ? 'noindex, follow' : 'index, follow'} />
        <link rel="canonical" href={`${SITE_URL}/blog`} />
        <meta property="og:title" content="wizMedik Blog - Zdravstveni savjeti" />
        <meta property="og:description" content="Strucni zdravstveni savjeti od doktora u Bosni i Hercegovini" />
        <meta property="og:url" content={`${SITE_URL}/blog`} />
        <meta property="og:type" content="blog" />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="wizMedik Blog - Zdravstveni savjeti" />
        <meta name="twitter:description" content="Strucni zdravstveni savjeti od doktora u Bosni i Hercegovini" />
        <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
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
              StruÄni Älanci i savjeti od naÅ¡ih doktora za vaÅ¡e zdravlje i dobrobit
            </p>
          </div>
        </motion.div>
        
        <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          {/* Filters - Categories and Authors */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              {/* Category Filter */}
              <div className="flex-1">
                <CustomSelect
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  options={[
                    { value: 'all', label: 'Sve kategorije' },
                    ...categories.map(cat => ({
                      value: cat.slug,
                      label: `${cat.naziv} (${cat.posts_count})`
                    }))
                  ]}
                  placeholder="Sve kategorije"
                />
              </div>

              {/* Author Filter */}
              <div className="flex-1">
                <CustomSelect
                  value={selectedAuthor}
                  onChange={handleAuthorChange}
                  options={[
                    { value: 'all', label: 'Svi autori' },
                    ...authors.map(author => ({
                      value: author.slug,
                      label: `Dr. ${author.ime} ${author.prezime} (${author.posts_count})`
                    }))
                  ]}
                  placeholder="Svi autori"
                />
              </div>
            </div>
          </motion.div>

          {/* Latest Posts Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              {selectedCategory !== 'all' || selectedAuthor !== 'all' ? 'Filtrirani Älanci' : 'Najnoviji Älanci'}
            </h2>

            {/* Posts grid - Mobile: horizontal layout, Desktop: grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="h-24 md:h-96 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl md:rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-xl text-gray-600">Nema pronaÄ‘enih Älanaka</p>
                <p className="text-sm text-gray-500 mt-2">PokuÅ¡ajte promijeniti filter</p>
              </div>
            ) : (
              <>
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Load More Button */}
                {hasMore && (
                  <div className="flex justify-center mt-12">
                    <Button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      size="lg"
                      className="rounded-xl px-8"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          UÄitavanje...
                        </>
                      ) : (
                        <>
                          UÄitaj joÅ¡ Älanaka
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>

          {/* Categories Section - Only show when no filters active */}
          {selectedCategory === 'all' && selectedAuthor === 'all' && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-20"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-8">Pregledaj po kategorijama</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map(category => (
                  <Link key={category.id} to={`/blog?category=${category.slug}`}>
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                            {category.naziv}
                          </h3>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {category.posts_count}
                          </Badge>
                        </div>
                        {category.opis && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {category.opis}
                          </p>
                        )}
                        <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                          Pogledaj Älanke
                          <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}


