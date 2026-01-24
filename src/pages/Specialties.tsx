import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { specialtiesAPI, settingsAPI } from "@/services/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Stethoscope } from "lucide-react";
import { Helmet } from "react-helmet-async";

import { SpecialtyTemplateClassic } from "@/components/specialty-templates/SpecialtyTemplateClassic";
import { SpecialtyTemplateGrid } from "@/components/specialty-templates/SpecialtyTemplateGrid";
import { SpecialtyTemplateList } from "@/components/specialty-templates/SpecialtyTemplateList";
import { SpecialtyTemplateCards } from "@/components/specialty-templates/SpecialtyTemplateCards";
import { SpecialtyTemplateModern } from "@/components/specialty-templates/SpecialtyTemplateModern";

interface Specialty {
  id: number;
  naziv: string;
  opis?: string;
  slug?: string;
  parent_id?: number;
  children?: Specialty[];
  doctorCount?: number;
}

export default function Specialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState("classic");
  const location = useLocation();

  const canonicalUrl = useMemo(() => {
    return `${window.location.origin}${location.pathname}`;
  }, [location.pathname]);

  useEffect(() => {
    fetchSpecialties();
    fetchTemplate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await settingsAPI.getSpecialtyTemplate();
      setTemplate(response.data.template || "classic");
    } catch (error) {
      console.error("Error fetching template:", error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const response = await specialtiesAPI.getWithCounts();
      const specialtiesData = response.data || [];

      setSpecialties(
        specialtiesData.map((spec: any) => ({
          ...spec,
          doctorCount: spec.doctor_count || 0,
          children:
            spec.children?.map((child: any) => ({
              ...child,
              doctorCount: child.doctor_count || 0,
            })) || [],
        }))
      );
    } catch (error) {
      console.error("Error fetching specialties:", error);
    } finally {
      setLoading(false);
    }
  };

  const itemListStructuredData = useMemo(() => {
    if (!specialties?.length) return null;

    const listItems = specialties.map((s: any, idx: number) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: s.naziv,
      url: s.slug
        ? `${window.location.origin}/specijalnost/${s.slug}`
        : `${window.location.origin}/specijalnosti`,
    }));

    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Medicinske specijalnosti",
      itemListElement: listItems,
    };
  }, [specialties]);

  if (loading) {
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

  const seoTitle = "Medicinske specijalnosti - wizMedik";
  const seoDescription =
    "Pretražite sve medicinske specijalnosti dostupne u BiH. Pronađite doktore po specijalnosti - kardiologija, pedijatrija, neurologija i više.";

  return (
    <>
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />

        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />

        {itemListStructuredData && (
          <script type="application/ld+json">
            {JSON.stringify(itemListStructuredData)}
          </script>
        )}
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
          <header className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                Medicinske specijalnosti
              </h1>
            </div>

            <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Pretražite sve medicinske specijalnosti i pronađite pravog stručnjaka za vaše potrebe.
            </p>
          </header>

          {template === "classic" && <SpecialtyTemplateClassic specialties={specialties as any} />}
          {template === "grid" && <SpecialtyTemplateGrid specialties={specialties as any} />}
          {template === "list" && <SpecialtyTemplateList specialties={specialties as any} />}
          {template === "cards" && <SpecialtyTemplateCards specialties={specialties as any} />}
          {template === "modern" && <SpecialtyTemplateModern specialties={specialties as any} />}

          {specialties.length === 0 && (
            <div className="text-center py-12 sm:py-16">
              <Stethoscope className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <h3 className="text-base sm:text-xl font-semibold text-foreground mb-2">
                Nema dostupnih specijalnosti
              </h3>
              <p className="text-sm text-muted-foreground">
                Trenutno nema aktivnih specijalnosti u sistemu.
              </p>
            </div>
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}
