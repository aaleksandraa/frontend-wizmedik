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
import { useAuth } from '@/contexts/AuthContext';

export default function BlogEditor() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!user) return;

    loadCategories();
    if (slug) {
      loadPost();
    }
  }, [slug, user, isAdmin]);

  const loadCategories = async () => {
    try {
      const response = await blogAPI.getCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!isAdmin) {
      toast.error('Samo administrator moze kreirati nove kategorije');
      return;
    }

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

  const toPlainText = (value: string) =>
    (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const withMetaDescriptionFallback = () => {
    const explicitMeta = (formData.meta_description || '').trim();
    if (explicitMeta) {
      return explicitMeta.slice(0, 160);
    }

    const excerptText = toPlainText(formData.excerpt || '');
    if (excerptText) {
      return excerptText.slice(0, 160);
    }

    return '';
  };

  const validateForm = (publish: boolean) => {
    const nextErrors: Record<string, string> = {};
    const title = (formData.naslov || '').trim();
    const content = toPlainText(formData.sadrzaj || '');
    const excerpt = (formData.excerpt || '').trim();
    const metaDescription = (formData.meta_description || '').trim();

    if (!title) {
      nextErrors.naslov = 'Naslov je obavezan.';
    } else if (title.length < 10) {
      nextErrors.naslov = 'Naslov mora imati najmanje 10 karaktera.';
    } else if (title.length > 200) {
      nextErrors.naslov = 'Naslov ne može biti duži od 200 karaktera.';
    }

    if (!content) {
      nextErrors.sadrzaj = 'Sadržaj je obavezan.';
    }

    if (excerpt.length > 300) {
      nextErrors.excerpt = 'Kratak opis ne može biti duži od 300 karaktera.';
    }

    if (metaDescription.length > 160) {
      nextErrors.meta_description = 'SEO meta opis ne može biti duži od 160 karaktera.';
    }

    if (publish && !formData.thumbnail) {
      nextErrors.thumbnail = 'Thumbnail slika je obavezna za objavu.';
    }

    if (publish && formData.kategorije.length === 0) {
      nextErrors.kategorije = 'Odaberite najmanje jednu kategoriju.';
    }

    return nextErrors;
  };

  const getApiErrorMessage = (error: any) => {
    const payload = error?.response?.data;
    if (payload?.message) return payload.message;
    if (payload?.error) return payload.error;
    if (payload?.errors && typeof payload.errors === 'object') {
      const firstKey = Object.keys(payload.errors)[0];
      const firstValue = payload.errors[firstKey];
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return firstValue[0];
      }
    }
    return 'Greška pri čuvanju posta';
  };

  const mapServerValidationErrors = (error: any) => {
    const payload = error?.response?.data;
    if (!payload?.errors || typeof payload.errors !== 'object') {
      return {};
    }

    const mapped: Record<string, string> = {};
    Object.entries(payload.errors).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        const normalizedKey = key.startsWith('category_ids') ? 'kategorije' : key;
        mapped[normalizedKey] = value[0];
      }
    });

    return mapped;
  };

  const loadPost = async () => {
    if (!slug) return;
    setLoading(true);
    try {
      let post: any;

      if (isAdmin) {
        const response = await blogAPI.getPostBySlug(slug);
        post = response.data.post || response.data; // Handle both formats
      } else {
        const response = await blogAPI.getMyPosts();
        const myPosts = response.data || [];
        post = myPosts.find((p: any) => p.slug === slug);
      }

      if (!post) {
        throw new Error('Post nije pronadjen');
      }

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

    setFieldErrors(prev => ({ ...prev, thumbnail: '' }));
    setSubmitError('');
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
    setFieldErrors(prev => ({ ...prev, naslov: '' }));
    setSubmitError('');
    setFormData(prev => ({
      ...prev,
      naslov: value,
      slug: generateSlug(value)
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    const nextErrors = validateForm(publish);
    setFieldErrors(nextErrors);
    setSubmitError('');

    if (Object.keys(nextErrors).length > 0) {
      setSubmitError('Provjerite obavezna polja i ispravite greske prije objave.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        status: publish ? 'published' : 'draft',
        category_ids: formData.kategorije,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        meta_description: withMetaDescriptionFallback(),
      };

      if (postId) {
        if (isAdmin) {
          await blogAPI.adminUpdatePost(postId, data);
        } else {
          await blogAPI.updatePost(postId, data);
        }
        toast.success('Post uspjesno azuriran');
      } else {
        if (isAdmin) {
          await blogAPI.adminCreatePost(data);
        } else {
          await blogAPI.createPost(data);
        }
        toast.success('Post uspjesno kreiran');
      }

      navigate('/my-blog-posts');
    } catch (error: any) {
      const serverFieldErrors = mapServerValidationErrors(error);
      if (Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(prev => ({ ...prev, ...serverFieldErrors }));
      }

      const message = getApiErrorMessage(error);
      setSubmitError(message);
      toast.error(message);
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

        {submitError && (
          <div className="mb-6 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

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
                  {fieldErrors.naslov && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.naslov}</p>
                  )}
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
                      setFieldErrors(prev => ({ ...prev, excerpt: '' }));
                      setSubmitError('');
                      if (value.length <= 300) {
                        setFormData(prev => ({ ...prev, excerpt: value }));
                      }
                    }}
                    placeholder="Kratak opis koji će se prikazati na listi postova"
                    rows={3}
                    maxLength={300}
                  />
                  {fieldErrors.excerpt && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.excerpt}</p>
                  )}
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
                  onChange={(content) => {
                    setFieldErrors(prev => ({ ...prev, sadrzaj: '' }));
                    setSubmitError('');
                    setFormData(prev => ({ ...prev, sadrzaj: content }));
                  }}
                  placeholder="Počnite pisati..."
                />
                {fieldErrors.sadrzaj && (
                  <p className="text-xs text-destructive mt-2">{fieldErrors.sadrzaj}</p>
                )}
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
                      onClick={() => {
                        setFieldErrors(prev => ({ ...prev, thumbnail: '' }));
                        setSubmitError('');
                        setFormData(prev => ({ ...prev, thumbnail: '' }));
                      }}
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
                  {fieldErrors.thumbnail && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.thumbnail}</p>
                  )}
                  {uploading && <p className="text-sm text-muted-foreground mt-1">Uploadovanje...</p>}
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Kategorije</CardTitle>
                {isAdmin && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewCategoryDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nova
                  </Button>
                )}
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
                          setFieldErrors(prev => ({ ...prev, kategorije: '' }));
                          setSubmitError('');
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
                {fieldErrors.kategorije && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.kategorije}</p>
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
                    setFieldErrors(prev => ({ ...prev, meta_description: '' }));
                    setSubmitError('');
                    if (value.length <= 160) {
                      setFormData(prev => ({ ...prev, meta_description: value }));
                    }
                  }}
                  placeholder="Kratak opis za pretraživače (preporučeno 150-160 karaktera)"
                  rows={3}
                  maxLength={160}
                />
                {fieldErrors.meta_description && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.meta_description}</p>
                )}
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


