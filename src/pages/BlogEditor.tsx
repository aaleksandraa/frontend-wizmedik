import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ArrowLeft, Save, Eye, X, Plus, Loader2 } from 'lucide-react';
import { blogAPI, uploadAPI } from '@/services/api';
import { fixImageUrl } from '@/utils/imageUrl';

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [postId, setPostId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    naslov: '',
    slug: '',
    excerpt: '',
    sadrzaj: '',
    thumbnail: '',
    kategorije: [] as number[],
    tags: '',
    meta_description: '',
    reading_time: 5,
    published: false
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  useEffect(() => {
    loadCategories();
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('Unesite naziv kategorije');
      return;
    }

    setCreatingCategory(true);
    try {
      const response = await blogAPI.adminCreateCategory({
        naziv: newCategoryName.trim()
      });

      // Backend vraća direktno kategoriju, ne { data: kategorija }
      const newCategory = response.data;
      
      // Dodaj novu kategoriju u listu i automatski je označi
      setCategories(prev => [...prev, newCategory]);
      setFormData(prev => ({
        ...prev,
        kategorije: [...prev.kategorije, newCategory.id]
      }));

      toast.success('Kategorija uspješno kreirana');
      setNewCategoryName('');
      setShowNewCategoryDialog(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri kreiranju kategorije');
    } finally {
      setCreatingCategory(false);
    }
  };

  const loadPost = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const response = await blogAPI.getPostBySlug(slug);
      const post = response.data.post || response.data; // Handle both formats
      setPostId(post.id); // Save post ID for updates
      setFormData({
        naslov: post.naslov || '',
        slug: post.slug || '',
        excerpt: post.excerpt || '',
        sadrzaj: post.sadrzaj || '',
        thumbnail: post.thumbnail || '',
        kategorije: post.categories?.map((c: any) => c.id) || [],
        tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''),
        meta_description: post.meta_description || '',
        reading_time: post.reading_time || 5,
        published: post.status === 'published'
      });
    } catch (error) {
      toast.error('Greška pri učitavanju posta');
      navigate('/my-blog-posts');
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await uploadAPI.uploadImage(file, 'blog');
      setFormData(prev => ({ ...prev, thumbnail: response.data.url }));
      toast.success('Slika uspješno uploadovana');
    } catch (error) {
      toast.error('Greška pri uploadu slike');
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      naslov: value,
      slug: generateSlug(value)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    // Validations
    if (!formData.naslov || !formData.sadrzaj) {
      toast.error('Naslov i sadržaj su obavezni');
      return;
    }

    if (formData.naslov.length < 10) {
      toast.error('Naslov mora imati najmanje 10 karaktera');
      return;
    }

    if (formData.naslov.length > 200) {
      toast.error('Naslov ne može biti duži od 200 karaktera');
      return;
    }

    if (formData.excerpt && formData.excerpt.length > 300) {
      toast.error('Kratak opis ne može biti duži od 300 karaktera');
      return;
    }

    if (formData.meta_description && formData.meta_description.length > 160) {
      toast.error('Meta opis ne može biti duži od 160 karaktera');
      return;
    }

    if (publish && !formData.thumbnail) {
      toast.error('Thumbnail slika je obavezna za objavu');
      return;
    }

    if (publish && formData.kategorije.length === 0) {
      toast.error('Odaberite najmanje jednu kategoriju');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        status: publish ? 'published' : 'draft',
        category_ids: formData.kategorije,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (postId) {
        // Use saved post ID
        await blogAPI.adminUpdatePost(postId, data);
        toast.success('Post uspješno ažuriran');
      } else {
        await blogAPI.adminCreatePost(data);
        toast.success('Post uspješno kreiran');
      }
      
      navigate('/my-blog-posts');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Greška pri čuvanju posta');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/my-blog-posts')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Nazad
            </Button>
            <h1 className="text-3xl font-bold">
              {slug ? 'Uredi Blog Post' : 'Novi Blog Post'}
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Sačuvaj kao draft
            </Button>
            <Button
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              <Eye className="h-4 w-4 mr-2" />
              {saving ? 'Čuvanje...' : 'Objavi'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Osnovne informacije</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="naslov">Naslov *</Label>
                  <Input
                    id="naslov"
                    value={formData.naslov}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Unesite naslov blog posta"
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.naslov.length}/200 karaktera
                  </p>
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="url-friendly-naslov"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    URL: /blog/{formData.slug || 'url-friendly-naslov'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="excerpt">Kratak opis</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 300) {
                        setFormData(prev => ({ ...prev, excerpt: value }));
                      }
                    }}
                    placeholder="Kratak opis koji će se prikazati na listi postova"
                    rows={3}
                    maxLength={300}
                  />
                  <p className={`text-xs mt-1 ${formData.excerpt.length > 250 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                    {300 - formData.excerpt.length} karaktera preostalo
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sadržaj *</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  content={formData.sadrzaj}
                  onChange={(content) => setFormData(prev => ({ ...prev, sadrzaj: content }))}
                  placeholder="Počnite pisati..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail slika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.thumbnail && (
                  <div className="relative">
                    <img
                      src={fixImageUrl(formData.thumbnail) || ''}
                      alt="Thumbnail"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <div>
                  <Label htmlFor="thumbnail">Upload thumbnail</Label>
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploadovanje...</p>}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Kategorije</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewCategoryDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nova
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nema kategorija. Kreirajte prvu kategoriju.
                  </p>
                ) : (
                  categories.map((cat: any) => (
                    <div key={cat.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`cat-${cat.id}`}
                        checked={formData.kategorije.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              kategorije: [...prev.kategorije, cat.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              kategorije: prev.kategorije.filter(id => id !== cat.id)
                            }));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor={`cat-${cat.id}`} className="cursor-pointer">
                        {cat.naziv}
                      </Label>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tagovi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="tags">Tagovi (odvojeni zarezom)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 200) {
                      setFormData(prev => ({ ...prev, tags: value }));
                    }
                  }}
                  placeholder="zdravlje, savjeti, prevencija"
                  maxLength={200}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.tags.split(',').filter(t => t.trim()).length} tagova • {200 - formData.tags.length} karaktera preostalo
                </p>
              </CardContent>
            </Card>

            {/* Reading Time */}
            <Card>
              <CardHeader>
                <CardTitle>Vrijeme čitanja</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="reading_time">Minuta</Label>
                <Input
                  id="reading_time"
                  type="number"
                  min="1"
                  value={formData.reading_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, reading_time: parseInt(e.target.value) || 5 }))}
                />
              </CardContent>
            </Card>

            {/* Meta Description */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Meta opis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label htmlFor="meta_description">Meta opis</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 160) {
                      setFormData(prev => ({ ...prev, meta_description: value }));
                    }
                  }}
                  placeholder="Kratak opis za pretraživače (preporučeno 150-160 karaktera)"
                  rows={3}
                  maxLength={160}
                />
                <div className="flex justify-between items-center">
                  <p className={`text-xs ${
                    formData.meta_description.length < 120 
                      ? 'text-orange-600' 
                      : formData.meta_description.length > 160 
                      ? 'text-red-600' 
                      : 'text-green-600'
                  }`}>
                    {formData.meta_description.length < 120 && 'Prekratko - dodajte još karaktera'}
                    {formData.meta_description.length >= 120 && formData.meta_description.length <= 160 && 'Optimalna dužina ✓'}
                    {formData.meta_description.length > 160 && 'Predugačko - skratite'}
                  </p>
                  <p className={`text-xs font-medium ${
                    formData.meta_description.length > 150 ? 'text-orange-600' : 'text-muted-foreground'
                  }`}>
                    {160 - formData.meta_description.length} preostalo
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Publish Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status objave</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData(prev => ({ ...prev, published: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="published" className="cursor-pointer">
                    Objavljeno
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {formData.published ? 'Post će biti vidljiv svima' : 'Post će biti sačuvan kao draft'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Dialog za novu kategoriju */}
      <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova kategorija</DialogTitle>
            <DialogDescription>
              Kreirajte novu kategoriju za blog postove
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-category-name">Naziv kategorije</Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="npr. Zdravlje, Savjeti, Prevencija..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateCategory();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowNewCategoryDialog(false);
                setNewCategoryName('');
              }}
            >
              Otkaži
            </Button>
            <Button
              type="button"
              onClick={handleCreateCategory}
              disabled={creatingCategory || !newCategoryName.trim()}
            >
              {creatingCategory && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kreiraj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
