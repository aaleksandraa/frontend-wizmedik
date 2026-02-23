import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  structuredData?: any;
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;
}

export function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  structuredData,
  noindex = false,
  nofollow = false,
  canonical,
}: SEOProps) {
  const baseUrl = 'https://wizmedik.com';
  const defaultTitle = 'WizMedik - Pronađite Doktora, Kliniku, Laboratoriju | Zdravstveni Portal';
  const defaultDescription = 'WizMedik je vodeći zdravstveni portal u BiH. Pronađite doktore, klinike, laboratorije, banje i domove njege. Zakažite pregled online, čitajte zdravstvene savjete i postavite pitanja stručnjacima.';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  const defaultKeywords = 'doktor, klinika, laboratorija, banja, dom njege, zdravstvo, BiH, Bosna i Hercegovina, zakazivanje, pregled, zdravstveni savjeti';

  const resolvedPath = typeof window !== 'undefined'
    ? `${window.location.pathname}${window.location.search}`
    : '/';
  const fullTitle = title ? `${title} | WizMedik` : defaultTitle;
  const fullDescription = description || defaultDescription;
  const fullImage = image ? (image.startsWith('http') ? image : `${baseUrl}${image}`) : defaultImage;
  const fullUrl = url ? `${baseUrl}${url}` : `${baseUrl}${resolvedPath}`;
  const fullKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  const canonicalUrl = canonical ? `${baseUrl}${canonical}` : fullUrl;

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  const robotsMeta = robotsContent.length > 0 ? robotsContent.join(', ') : 'index, follow';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      <meta name="keywords" content={fullKeywords} />
      <meta name="robots" content={robotsMeta} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="WizMedik" />
      <meta property="og:locale" content="bs_BA" />

      {/* Article specific */}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={fullImage} />

      {/* Additional SEO */}
      <meta name="author" content={author || 'WizMedik'} />
      <meta name="language" content="Bosnian" />
      <meta name="geo.region" content="BA" />
      <meta name="geo.placename" content="Bosna i Hercegovina" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Helper functions for structured data

export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'WizMedik',
  url: 'https://wizmedik.com',
  logo: 'https://wizmedik.com/logo.png',
  description: 'Vodeći zdravstveni portal u Bosni i Hercegovini',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'BA',
  },
  sameAs: [
    'https://www.facebook.com/wizmedik',
    'https://www.instagram.com/wizmedik',
    'https://twitter.com/wizmedik',
  ],
});

export const createDoctorSchema = (doctor: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Physician',
  name: `${doctor.ime} ${doctor.prezime}`,
  image: doctor.slika ? `https://wizmedik.com${doctor.slika}` : undefined,
  description: doctor.opis,
  url: `https://wizmedik.com/doktor/${doctor.slug}`,
  telephone: doctor.telefon,
  email: doctor.public_email || doctor.email,
  address: doctor.adresa ? {
    '@type': 'PostalAddress',
    streetAddress: doctor.adresa,
    addressLocality: doctor.grad?.naziv,
    addressCountry: 'BA',
  } : undefined,
  medicalSpecialty: doctor.specijalnost?.naziv,
  aggregateRating: doctor.prosjecna_ocjena ? {
    '@type': 'AggregateRating',
    ratingValue: doctor.prosjecna_ocjena,
    reviewCount: doctor.broj_recenzija || 0,
    bestRating: 5,
    worstRating: 1,
  } : undefined,
});

export const createClinicSchema = (clinic: any) => ({
  '@context': 'https://schema.org',
  '@type': 'MedicalClinic',
  name: clinic.naziv,
  image: clinic.logo ? `https://wizmedik.com${clinic.logo}` : undefined,
  description: clinic.opis,
  url: `https://wizmedik.com/klinika/${clinic.slug}`,
  telephone: clinic.telefon,
  email: clinic.email,
  address: {
    '@type': 'PostalAddress',
    streetAddress: clinic.adresa,
    addressLocality: clinic.grad?.naziv,
    addressCountry: 'BA',
  },
  aggregateRating: clinic.prosjecna_ocjena ? {
    '@type': 'AggregateRating',
    ratingValue: clinic.prosjecna_ocjena,
    reviewCount: clinic.broj_recenzija || 0,
    bestRating: 5,
    worstRating: 1,
  } : undefined,
  openingHoursSpecification: clinic.radno_vrijeme ? parseWorkingHours(clinic.radno_vrijeme) : undefined,
});

export const createBlogPostSchema = (post: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.naslov,
  description: post.excerpt || post.sadrzaj?.substring(0, 160),
  image: post.thumbnail ? `https://wizmedik.com${post.thumbnail}` : undefined,
  datePublished: post.created_at,
  dateModified: post.updated_at,
  author: {
    '@type': 'Person',
    name: post.author?.ime && post.author?.prezime 
      ? `${post.author.ime} ${post.author.prezime}`
      : 'WizMedik',
  },
  publisher: createOrganizationSchema(),
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `https://wizmedik.com/blog/${post.slug}`,
  },
  articleSection: post.category?.naziv,
  keywords: post.tags?.join(', '),
});

export const createQuestionSchema = (question: any) => ({
  '@context': 'https://schema.org',
  '@type': 'QAPage',
  mainEntity: {
    '@type': 'Question',
    name: question.naslov,
    text: question.sadrzaj,
    answerCount: question.odgovori?.length || 0,
    dateCreated: question.created_at,
    author: {
      '@type': 'Person',
      name: question.korisnik?.ime || 'Anonimni korisnik',
    },
    acceptedAnswer: question.odgovori?.[0] ? {
      '@type': 'Answer',
      text: question.odgovori[0].sadrzaj,
      dateCreated: question.odgovori[0].created_at,
      upvoteCount: question.odgovori[0].broj_lajkova || 0,
      author: {
        '@type': 'Person',
        name: question.odgovori[0].doktor 
          ? `Dr. ${question.odgovori[0].doktor.ime} ${question.odgovori[0].doktor.prezime}`
          : 'WizMedik',
      },
    } : undefined,
  },
});

export const createBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `https://wizmedik.com${item.url}`,
  })),
});

export const createSearchActionSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: 'https://wizmedik.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://wizmedik.com/doktori?pretraga={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
});

// Helper to parse working hours
function parseWorkingHours(radnoVrijeme: any) {
  if (!radnoVrijeme) return undefined;
  
  const daysMap: Record<string, string> = {
    'ponedeljak': 'Monday',
    'utorak': 'Tuesday',
    'srijeda': 'Wednesday',
    'cetvrtak': 'Thursday',
    'petak': 'Friday',
    'subota': 'Saturday',
    'nedjelja': 'Sunday',
  };
  
  return Object.entries(radnoVrijeme).map(([day, hours]: [string, any]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: daysMap[day] || day,
    opens: hours.od,
    closes: hours.do,
  }));
}
