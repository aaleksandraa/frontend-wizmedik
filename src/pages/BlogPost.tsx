import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, settingsAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Calendar, ArrowLeft, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { fixImageUrl } from '@/utils/imageUrl';

const bosnianMonths = [
  'Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
  'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'
];

const formatBosnianDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = bosnianMonths[date.getMonth()];
  const year = date.getFullYear();
  return `${day}. ${month} ${year}.`;
};

interface BlogPostData {
  id: number;
  naslov: string;
  slug: string;
  excerpt: string;
  sadrzaj: string;
  thumbnail: string | null;
  autor_name: string;
  reading_time: number;
  views: number;
  published_at: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  categories: Array<{ id: number; naziv: string; slug: string }>;
  doktor?: {
    id: number;
    ime: string;
    prezime: string;
    specijalnost: string;
    slug: string;
    slika_profila?: string;
    opis?: string;
  };
}

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typography, setTypography] = useState({
    h1_size: '28',
    h2_size: '24',
    h3_size: '20',
    p_size: '19',
    p_line_height: '34',
    p_color: '#555',
  });

  useEffect(() => {
    if (slug) fetchPost();
    fetchTypography();

    // Listen for typography updates
    const handleTypographyUpdate = (e: any) => {
      setTypography(e.detail);
    };
    window.addEventListener('blogTypographyUpdated', handleTypographyUpdate);
    return () => window.removeEventListener('blogTypographyUpdated', handleTypographyUpdate);
  }, [slug]);

  const fetchTypography = async () => {
    try {
      const response = await settingsAPI.getBlogTypography();
      setTypography(response.data);
    } catch (error) {
      console.error('Error fetching typography:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await blogAPI.getPost(slug!);
      setPost(response.data.post);
      setRelated(response.data.related || []);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: post?.naslov, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
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

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Članak nije pronađen</h1>
          <Link to="/blog"><Button>Nazad na blog</Button></Link>
        </div>
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.naslov,
    "description": post.meta_description || post.excerpt,
    "image": post.thumbnail,
    "author": {
      "@type": post.doktor ? "Physician" : "Organization",
      "name": post.autor_name,
      ...(post.doktor && { "medicalSpecialty": post.doktor.specijalnost })
    },
    "publisher": {
      "@type": "Organization",
      "name": "WizMedik",
      "logo": { "@type": "ImageObject", "url": "https://wizmedik.com/logo.png" }
    },
    "datePublished": post.published_at,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://wizmedik.com/blog/${post.slug}` }
  };

  return (
    <>
      <Helmet>
        <title>{post.meta_title || post.naslov} | WizMedik Blog</title>
        <meta name="description" content={post.meta_description || post.excerpt} />
        {post.meta_keywords && <meta name="keywords" content={post.meta_keywords} />}
        <link rel="canonical" href={`https://wizmedik.com/blog/${post.slug}`} />
        <meta property="og:title" content={post.naslov} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://wizmedik.com/blog/${post.slug}`} />
        {post.thumbnail && <meta property="og:image" content={fixImageUrl(post.thumbnail) || ''} />}
        <meta property="article:published_time" content={post.published_at} />
        <meta property="article:author" content={post.autor_name} />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-5xl mx-auto px-4 py-2 md:py-4">
          <article>
            {/* Header - ultra compact structure */}
            <header className="mb-6 md:mb-8">
              {/* Breadcrumb */}
              <Breadcrumb items={[
                { label: 'Blog', href: '/blog' },
                { label: post.naslov }
              ]} />
              
              {/* Title - minimal gap */}
              <h1 className="text-3xl md:text-4xl font-bold mt-1 mb-2">{post.naslov}</h1>
              
              {/* Date and Category - perfectly aligned in same line */}
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{formatBosnianDate(post.published_at)}</span>
                </div>
                {post.categories.length > 0 && (
                  <>
                    <span className="text-muted-foreground/50 text-sm">•</span>
                    <Link to={`/blog?category=${post.categories[0].slug}`} className="inline-flex">
                      <Badge variant="secondary" className="hover:bg-primary/20 transition-colors text-sm py-0.5 px-2">
                        {post.categories[0].naziv}
                      </Badge>
                    </Link>
                  </>
                )}
              </div>

              {/* Author - only show if doctor */}
              {post.doktor && (
                <Link to={`/doktor/${post.doktor.slug}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-4">
                      {post.doktor.slika_profila ? (
                        <img src={post.doktor.slika_profila} alt="" className="w-14 h-14 rounded-full object-cover" />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {post.doktor.ime[0]}{post.doktor.prezime[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold">Dr. {post.doktor.ime} {post.doktor.prezime}</p>
                        <p className="text-sm text-muted-foreground">{post.doktor.specijalnost}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </header>

            {/* Thumbnail */}
            {post.thumbnail && (
              <div className="mb-8 rounded-lg overflow-hidden">
                <img src={fixImageUrl(post.thumbnail) || ''} alt={post.naslov} className="w-full h-auto" />
              </div>
            )}

            {/* Content */}
            <style>{`
              .blog-content {
                max-width: 100% !important;
              }
              .blog-content h1 {
                font-size: ${typography.h1_size}px !important;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                line-height: 1.3;
              }
              .blog-content h2 {
                font-size: ${typography.h2_size}px !important;
                font-weight: 700;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                line-height: 1.4;
              }
              .blog-content h3 {
                font-size: ${typography.h3_size}px !important;
                font-weight: 600;
                margin-top: 1rem;
                margin-bottom: 0.25rem;
                line-height: 1.4;
              }
              .blog-content p {
                font-size: ${typography.p_size}px !important;
                line-height: ${typography.p_line_height}px !important;
                color: ${typography.p_color} !important;
                margin: 1rem 0;
              }
              .blog-content h2 + p,
              .blog-content h3 + p {
                margin-top: 0 !important;
              }
              .blog-content ul,
              .blog-content ol {
                margin: 0.75rem 0;
                padding-left: 1.5rem;
              }
              .blog-content ul li,
              .blog-content ol li {
                margin: 0.25rem 0;
                font-size: ${typography.p_size}px !important;
                line-height: ${typography.p_line_height}px !important;
                color: ${typography.p_color} !important;
              }
              .blog-content img {
                max-width: 100%;
                height: auto;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
              }
              .blog-content blockquote {
                border-left: 4px solid #0891b2;
                padding-left: 1rem;
                margin: 1.5rem 0;
                font-style: italic;
                color: #64748b;
              }
              .blog-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              .blog-content table th,
              .blog-content table td {
                border: 1px solid #e2e8f0;
                padding: 0.75rem;
                text-align: left;
              }
              .blog-content table th {
                background-color: #f8fafc;
                font-weight: 600;
              }
              .blog-content a {
                color: #0891b2;
                text-decoration: underline;
              }
              .blog-content a:hover {
                color: #0891b2;
              }
              .blog-content hr {
                margin: 2rem 0;
                border: none;
                border-top: 1px solid #e2e8f0;
              }
            `}</style>
            <div 
              className="blog-content prose prose-lg w-full mb-8"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.sadrzaj) }}
            />

            {/* Share */}
            <div className="flex items-center gap-4 py-6 border-t">
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" /> Podijeli
              </Button>
              <Link to="/blog">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Nazad na blog
                </Button>
              </Link>
            </div>
          </article>

          {/* Related posts */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Slični članci</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map(r => (
                  <Link key={r.id} to={`/blog/${r.slug}`}>
                    <Card className="h-full hover:shadow-md transition-shadow">
                      {r.thumbnail && (
                        <div className="aspect-video overflow-hidden">
                          <img src={fixImageUrl(r.thumbnail) || ''} alt={r.naslov} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-2">{r.naslov}</h3>
                        <p className="text-sm text-muted-foreground mt-2">{r.reading_time} min čitanja</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

