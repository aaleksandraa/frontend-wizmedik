import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Helmet } from "react-helmet-async";
import { servicePagesAPI, settingsAPI } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope } from "lucide-react";

interface ServicePage {
  id: number;
  naziv: string;
  slug: string;
  kratki_opis?: string;
  sadrzaj?: string;
  status: "draft" | "published";
  is_indexable: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_image?: string;
  url_path: string;
  specialty?: {
    id: number;
    naziv: string;
    slug: string;
  };
  updated_at?: string;
}

const sanitizeRichText = (html: string) => {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h1",
      "h2",
      "h3",
      "h4",
      "hr",
      "code",
      "pre",
      "span",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title"],
  });
};

const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const formatServiceContent = (raw?: string): string => {
  const text = (raw || "").trim();

  if (!text) {
    return "<p>Sadrzaj ce biti uskoro dostupan.</p>";
  }

  if (/<\/?[a-z][\s\S]*>/i.test(text)) {
    return text;
  }

  return text
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br />")}</p>`)
    .join("");
};

export default function SpecialtyServicePage() {
  const { specijalnost, usluga } = useParams<{
    specijalnost: string;
    usluga: string;
  }>();
  const location = useLocation();

  const canonicalFallback = useMemo(
    () => `${window.location.origin}${location.pathname}`,
    [location.pathname]
  );

  const [typography, setTypography] = useState({
    h1_size: "28",
    h2_size: "24",
    h3_size: "20",
    p_size: "19",
    p_line_height: "34",
    p_color: "#555",
  });

  useEffect(() => {
    const fetchTypography = async () => {
      try {
        const response = await settingsAPI.getBlogTypography();
        setTypography(response.data);
      } catch {
        // keep defaults
      }
    };

    fetchTypography();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["specialty-service-page", specijalnost, usluga],
    queryFn: async () => {
      const response = await servicePagesAPI.getByPath(
        specijalnost || "",
        usluga || ""
      );
      return response.data as ServicePage;
    },
    enabled: !!specijalnost && !!usluga,
    staleTime: 30 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary" />
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-2xl mx-auto">
              <CardContent className="pt-6 text-center">
                <h1 className="text-xl font-bold mb-2">Stranica nije pronadjena</h1>
                <p className="text-muted-foreground">
                  Trazena usluga nije dostupna ili nije objavljena.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
        <Footer />
      </>
    );
  }

  const title =
    data.meta_title ||
    `${data.naziv} | ${data.specialty?.naziv || "Specijalnost"} | wizMedik`;
  const description =
    data.meta_description ||
    data.kratki_opis ||
    `Saznajte sve detalje o usluzi ${data.naziv}.`;
  const canonicalUrl = data.canonical_url || canonicalFallback;
  const robots = data.is_indexable ? "index, follow" : "noindex, follow";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: data.naziv,
    description,
    url: canonicalUrl,
    about: {
      "@type": "MedicalSpecialty",
      name: data.specialty?.naziv || "Medicinska usluga",
    },
  };

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Specijalnosti",
        item: `${window.location.origin}/specijalnosti`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: data.specialty?.naziv || "Specijalnost",
        item: `${window.location.origin}/specijalnost/${
          data.specialty?.slug || specijalnost
        }`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: data.naziv,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        {data.meta_keywords && <meta name="keywords" content={data.meta_keywords} />}
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl} />
        {data.og_image && <meta property="og:image" content={data.og_image} />}

        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 py-4 md:py-8">
          <Breadcrumb
            items={[
              { label: "Specijalnosti", href: "/specijalnosti" },
              {
                label: data.specialty?.naziv || "Specijalnost",
                href: `/specijalnost/${data.specialty?.slug || specijalnost}`,
              },
              { label: data.naziv },
            ]}
          />

          <header className="mt-4 mb-6 md:mb-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="hidden sm:flex w-14 h-14 bg-primary text-white rounded-2xl items-center justify-center shrink-0">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">{data.naziv}</h1>
                {data.kratki_opis && (
                  <p className="mt-2 text-muted-foreground leading-relaxed">{data.kratki_opis}</p>
                )}
              </div>
            </div>
          </header>

          <Card>
            <CardContent className="pt-6">
              <style>{`
                .service-content {
                  max-width: 100% !important;
                }
                .service-content h1 {
                  font-size: ${typography.h2_size}px !important;
                  font-weight: 700;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  line-height: 1.3;
                }
                .service-content h2 {
                  font-size: ${typography.h3_size}px !important;
                  font-weight: 700;
                  margin-top: 1.5rem;
                  margin-bottom: 0.75rem;
                  line-height: 1.4;
                }
                .service-content h3 {
                  font-size: ${typography.h3_size}px !important;
                  font-weight: 600;
                  margin-top: 1rem;
                  margin-bottom: 0.25rem;
                  line-height: 1.4;
                }
                .service-content p {
                  font-size: ${typography.p_size}px !important;
                  line-height: ${typography.p_line_height}px !important;
                  color: ${typography.p_color} !important;
                  margin: 1rem 0;
                }
                .service-content ul,
                .service-content ol {
                  margin: 0.75rem 0;
                  padding-left: 1.5rem;
                }
                .service-content li {
                  margin: 0.25rem 0;
                  font-size: ${typography.p_size}px !important;
                  line-height: ${typography.p_line_height}px !important;
                  color: ${typography.p_color} !important;
                }
                .service-content img {
                  max-width: 100%;
                  height: auto;
                  margin: 1.5rem 0;
                  border-radius: 0.5rem;
                }
                .service-content blockquote {
                  border-left: 4px solid #0891b2;
                  padding-left: 1rem;
                  margin: 1.5rem 0;
                  font-style: italic;
                  color: #64748b;
                }
                .service-content a {
                  color: #0891b2;
                  text-decoration: underline;
                }
              `}</style>

              <article
                className="service-content prose prose-sm sm:prose-base max-w-none prose-headings:leading-tight prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: sanitizeRichText(formatServiceContent(data.sadrzaj)),
                }}
              />
            </CardContent>
          </Card>

          {data.specialty?.slug && (
            <section className="mt-8">
              <Card className="p-4 sm:p-6 bg-gradient-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-base sm:text-lg font-semibold mb-1">
                      Trazite doktora za ovu uslugu?
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Pogledajte listu dostupnih doktora za oblast {data.specialty.naziv.toLowerCase()}.
                    </p>
                  </div>
                  <Button
                    variant="medical"
                    onClick={() =>
                      (window.location.href = `/doktori/specijalnost/${data.specialty?.slug}`)
                    }
                    className="w-full sm:w-auto"
                  >
                    Pogledaj doktore
                  </Button>
                </div>
              </Card>
            </section>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
