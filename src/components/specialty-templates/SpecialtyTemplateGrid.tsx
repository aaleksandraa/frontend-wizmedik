import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconRenderer } from "./IconRenderer";
import { ArrowRight } from "lucide-react";

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

export function SpecialtyTemplateGrid({ specialties }: Props) {
  // Flatten all specialties (parent + children)
  const allSpecialties: Array<Specialty & { parentName?: string }> = [];
  specialties.forEach((parent) => {
    allSpecialties.push({ ...parent, parentName: undefined });
    parent.children?.forEach((child) => {
      allSpecialties.push({ ...child, parentName: parent.naziv });
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {allSpecialties.map((s) => (
        <Link
          key={s.id}
          to={`/specijalnost/${s.slug}`}
          className="block group focus:outline-none"
          aria-label={`Otvori specijalnost: ${s.naziv}`}
        >
          <Card
            className={[
              "p-4 sm:p-6 h-full",
              "cursor-pointer",
              "bg-gradient-to-br from-background to-primary/5",
              "transition-all",
              "sm:hover:shadow-lg",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "motion-reduce:transition-none",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors flex items-center justify-center overflow-hidden shrink-0">
                <IconRenderer iconUrl={s.icon_url} alt={s.naziv} className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
              </div>

              <div className="w-9 h-9 rounded-full bg-background/60 border flex items-center justify-center shrink-0">
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {s.parentName && (
                  <Badge variant="outline" className="text-[11px] leading-4">
                    {s.parentName}
                  </Badge>
                )}
                {typeof s.doctorCount === "number" && s.doctorCount > 0 && (
                  <Badge variant="secondary" className="text-[11px] leading-4">
                    {s.doctorCount} doktora
                  </Badge>
                )}
              </div>

              <h3 className="font-semibold text-base sm:text-lg leading-snug">
                {s.naziv}
              </h3>

              {s.opis && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {s.opis}
                </p>
              )}
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
