import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  doctorCount?: number;
}

interface Props {
  specialties: Specialty[];
}

export function SpecialtyTemplateCards({ specialties }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {specialties.map((category) => (
        <Card
          key={category.id}
          className="overflow-hidden border bg-background transition-shadow sm:hover:shadow-lg motion-reduce:transition-none"
        >
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <div className="flex items-start justify-between gap-3">
              {/* Title area as a link */}
              <Link
                to={`/specijalnost/${category.slug}`}
                className="flex items-center gap-3 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md"
                aria-label={`Otvori specijalnost: ${category.naziv}`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary text-white flex items-center justify-center overflow-hidden shrink-0">
                  <IconRenderer
                    iconUrl={category.icon_url}
                    alt={category.naziv}
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                  />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-base sm:text-lg leading-snug truncate">
                    {category.naziv}
                  </CardTitle>

                  {typeof category.doctorCount === "number" && category.doctorCount > 0 && (
                    <div className="mt-1">
                      <Badge variant="secondary" className="text-[11px] leading-4">
                        {category.doctorCount} doktora
                      </Badge>
                    </div>
                  )}
                </div>
              </Link>

              {/* CTA icon (also link) */}
              <Link
                to={`/specijalnost/${category.slug}`}
                className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-background/60 border transition-colors sm:hover:bg-primary sm:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label={`Pogledaj sve specijaliste: ${category.naziv}`}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </CardHeader>

          <CardContent className="pt-4 sm:pt-6">
            {category.opis && (
              <p className="text-sm sm:text-[15px] text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                {category.opis}
              </p>
            )}

            {category.children && category.children.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2">
                  Podspecijalnosti
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {category.children.map((subspec) => (
                    <Link
                      key={subspec.id}
                      to={`/specijalnost/${subspec.slug}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      aria-label={`Otvori podspecijalnost: ${subspec.naziv}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <IconRenderer
                          iconUrl={subspec.icon_url}
                          alt={subspec.naziv}
                          className="w-4 h-4 text-primary shrink-0"
                        />
                        <span className="font-medium text-sm truncate">{subspec.naziv}</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button asChild className="w-full">
                <Link to={`/specijalnost/${category.slug}`}>
                  Pogledaj sve specijaliste
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
