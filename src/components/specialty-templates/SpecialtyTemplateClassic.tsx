import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface Specialty {
  id: number;
  naziv: string;
  opis?: string;
  slug: string;
  icon_url?: string;
  parent_id?: number;
  children?: Specialty[];
  // doctorCount removed - not needed, slows down page load
}

interface Props {
  specialties: Specialty[];
}

export function SpecialtyTemplateClassic({ specialties }: Props) {
  return (
    <div className="space-y-12 sm:space-y-16">
      {specialties.map((category) => (
        <section key={category.id} className="space-y-4 sm:space-y-5">
          {/* Header with title, description, and clickable arrow */}
          <div className="space-y-2">
            <Link
              to={`/specijalnost/${category.slug}`}
              className="group flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg w-fit"
              aria-label={`Otvori specijalnost: ${category.naziv}`}
            >
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {category.naziv}
              </h2>
              <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
            </Link>

            {category.opis && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                {category.opis}
              </p>
            )}
          </div>

          {/* Sub-specialties grid - removed main category card */}
          {category.children && category.children.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {category.children.map((subspec) => (
                <Link
                  key={subspec.id}
                  to={`/specijalnost/${subspec.slug}`}
                  className="block focus:outline-none"
                  aria-label={`Otvori podspecijalnost: ${subspec.naziv}`}
                >
                  <Card className="p-4 sm:p-5 transition-shadow sm:hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 h-full">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-sm sm:text-base min-w-0 truncate">
                        {subspec.naziv}
                      </h3>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>

                    {subspec.opis && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {subspec.opis}
                      </p>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
