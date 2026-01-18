import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { blogAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, Search, Edit, Trash2, Eye, FileText, Calendar, 
  Filter, X, CheckCircle, Clock 
} from 'lucide-react';
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';

interface BlogPost {
  id: number;
  naslov: string;
  slug: string;
  excerpt: string;
  thumbnail: string | null;
  status: 'draft' | 'published';
  published_at: string;
  reading_time: number;
  autor_name: string;
  categories: Array<{ id: number; naziv: string }>;
}

export default function MyBlogPosts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [postsRes, catsRes] = await Promise.all([
        isAdmin ? blogAPI.adminGetPosts() : blogAPI.getMyPosts(),
        blogAPI.getCategories()
      ]);
      
      setPosts(postsRes.data?.data || postsRes.data || []);
      setCategories(catsRes.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Greška pri učitavanju postova');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, naslov: string) => {
    if (!confirm(`Da li ste sigurni da želite obrisati članak "${naslov}"?`)) {
      return;
    }

    try {
      await blogAPI.adminDeletePost(id);
      toast.success('Članak uspješno obrisan');
      fetchData();
    } catch (error) {
      toast.error('Greška pri brisanju članka');
    }
  };

  const handleEdit = (slug: string) => {
    navigate(`/blog/editor/${slug}`);
  };

  const handleView = (slug: string) => {
    window.open(`/blog/${slug}`, '_blank');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.naslov.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
                           post.categories.some(cat => cat.id.toString() === selectedCategory);
    
    const matchesStatus = selectedStatus === 'all' || post.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sr-RS', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Moji Blog Postovi | wizMedik</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                {isAdmin ? 'Svi Blog Postovi' : 'Moji Blog Postovi'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'članak' : 'članaka'}
              </p>
            </div>
            <Button onClick={() => navigate('/blog/editor')} size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novi članak
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pretraži po naslovu ili sadržaju..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sve kategorije" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Sve kategorije</SelectItem>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.naziv}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Svi statusi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Svi statusi</SelectItem>
                      <SelectItem value="published">Objavljeno</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={clearFilters}
                      title="Očisti filtere"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Active Filters */}
              {(searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Aktivni filteri:
                  </span>
                  {searchTerm && (
                    <Badge variant="secondary">
                      Pretraga: "{searchTerm}"
                    </Badge>
                  )}
                  {selectedCategory !== 'all' && (
                    <Badge variant="secondary">
                      Kategorija: {categories.find(c => c.id.toString() === selectedCategory)?.naziv}
                    </Badge>
                  )}
                  {selectedStatus !== 'all' && (
                    <Badge variant="secondary">
                      Status: {selectedStatus === 'published' ? 'Objavljeno' : 'Draft'}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nema pronađenih članaka</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                    ? 'Pokušajte promijeniti filtere pretrage'
                    : 'Počnite pisati svoj prvi članak'}
                </p>
                {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
                  <Button onClick={() => navigate('/blog/editor')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Kreiraj članak
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Thumbnail */}
                  {post.thumbnail ? (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <img 
                        src={post.thumbnail} 
                        alt={post.naslov}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <FileText className="h-16 w-16 text-primary/30" />
                    </div>
                  )}

                  <CardContent className="p-4">
                    {/* Status & Categories */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status === 'published' ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Objavljeno</>
                        ) : (
                          <><Clock className="h-3 w-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                      {post.categories.slice(0, 2).map(cat => (
                        <Badge key={cat.id} variant="outline">
                          {cat.naziv}
                        </Badge>
                      ))}
                      {post.categories.length > 2 && (
                        <Badge variant="outline">
                          +{post.categories.length - 2}
                        </Badge>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {post.naslov}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(post.published_at)}
                      </span>
                      <span>{post.reading_time} min</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post.slug)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Uredi
                      </Button>
                      {post.status === 'published' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(post.slug)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(post.id, post.naslov)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
}
