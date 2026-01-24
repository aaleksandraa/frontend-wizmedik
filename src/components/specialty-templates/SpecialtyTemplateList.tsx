import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { IconRenderer } from "./IconRenderer";

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

export function SpecialtyTemplateList({ specialties }: Props) {
  return (
    <div className="space-y-4">
      {specialties.map((category) => (
        <div key={category.id} className="space-y-3">
          {/* Parent Category */}
          <Card className="p-4 sm:p-6 transition-shadow sm:hover:shadow-md border-l-4 border-l-primary">
            <div className="flex items-start justify-between gap-3">
              <Link
                to={`/specijalnost/${category.slug}`}
                className="flex items-center gap-3 flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                aria-label={`Otvori specijalnost: ${category.naziv}`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 transition-colors flex items-center justify-center shrink-0 overflow-hidden">
                  <IconRenderer iconUrl={category.icon_url} alt={category.naziv} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-base sm:text-lg leading-snug truncate">
                    {category.naziv}
                  </h3>

                  {category.opis && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.opis}
                    </p>
                  )}
                </div>
              </Link>

              <Button asChild variant="ghost" size="icon" className="shrink-0">
                <Link
                  to={`/specijalnost/${category.slug}`}
                  aria-label={`Pogledaj ${category.naziv}`}
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Sub-specialties */}
          {category.children && category.children.length > 0 && (
            <div className="space-y-2 sm:ml-6">
              {category.children.map((subspec) => (
                <Link
                  key={subspec.id}
                  to={`/specijalnost/${subspec.slug}`}
                  className="block focus:outline-none"
                  aria-label={`Otvori podspecijalnost: ${subspec.naziv}`}
                >
                  <Card className="p-3 sm:p-4 transition-shadow sm:hover:shadow-md hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 overflow-hidden">
                          <IconRenderer iconUrl={subspec.icon_url} alt={subspec.naziv} className="w-4 h-4 text-primary" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm sm:text-[15px] truncate">
                            {subspec.naziv}
                          </h4>

                          {subspec.opis && (
                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                              {subspec.opis}
                            </p>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
