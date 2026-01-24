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
    <div className="space-y-8 sm:space-y-10">
      {specialties.map((category) => (
        <section key={category.id} className="space-y-3 sm:space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
            {category.naziv}
          </h2>

          {category.opis && (
            <p className="text-sm sm:text-[15px] text-muted-foreground leading-relaxed max-w-3xl">
              {category.opis}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Main category */}
            <Link
              to={`/specijalnost/${category.slug}`}
              className="block focus:outline-none"
              aria-label={`Otvori specijalnost: ${category.naziv}`}
            >
              <Card className="p-4 sm:p-5 transition-shadow sm:hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base sm:text-[15px] truncate">
                      {category.naziv}
                    </h3>
                    {category.opis && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                        {category.opis}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            </Link>

            {/* Sub-specialties */}
            {category.children?.map((subspec) => (
              <Link
                key={subspec.id}
                to={`/specijalnost/${subspec.slug}`}
                className="block focus:outline-none"
                aria-label={`Otvori podspecijalnost: ${subspec.naziv}`}
              >
                <Card className="p-4 sm:p-5 transition-shadow sm:hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-semibold text-sm sm:text-[15px] min-w-0 truncate">
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
        </section>
      ))}
    </div>
  );
}
