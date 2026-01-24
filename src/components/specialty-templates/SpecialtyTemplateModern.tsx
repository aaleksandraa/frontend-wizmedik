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
  // doctorCount removed - not needed, slows down page load
}

interface Props {
  specialties: Specialty[];
}

const gradients = [
  "from-blue-500/10 to-cyan-500/10",
  "from-purple-500/10 to-pink-500/10",
  "from-green-500/10 to-emerald-500/10",
  "from-orange-500/10 to-red-500/10",
  "from-indigo-500/10 to-blue-500/10",
  "from-rose-500/10 to-pink-500/10",
];

export function SpecialtyTemplateModern({ specialties }: Props) {
  const all: Array<Specialty & { parentName?: string }> = [];
  specialties.forEach((parent) => {
    all.push({ ...parent, parentName: undefined });
    parent.children?.forEach((child) => {
      all.push({ ...child, parentName: parent.naziv });
    });
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {all.map((s, index) => {
        const gradient = gradients[index % gradients.length];

        return (
          <Link
            key={s.id}
            to={`/specijalnost/${s.slug}`}
            className="group block focus:outline-none"
            aria-label={`Otvori specijalnost: ${s.naziv}`}
          >
            <Card
              className={[
                "relative overflow-hidden h-full",
                "cursor-pointer",
                "bg-gradient-to-br",
                gradient,
                "border",
                "transition-all duration-200",
                "sm:hover:shadow-xl",
                "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                "motion-reduce:transition-none",
              ].join(" ")}
            >
              <div className="p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-background/80 border shadow-sm flex items-center justify-center overflow-hidden shrink-0 transition-transform sm:group-hover:scale-105 motion-reduce:transform-none">
                    <IconRenderer
                      iconUrl={s.icon_url}
                      alt={s.naziv}
                      className="w-5 h-5 sm:w-7 sm:h-7 text-primary"
                    />
                  </div>

                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary transition-colors sm:group-hover:bg-primary sm:group-hover:text-white">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-2">
                  {s.parentName && (
                    <Badge variant="outline" className="text-[11px] leading-4">
                      {s.parentName}
                    </Badge>
                  )}

                  <h3 className="font-semibold text-base sm:text-lg leading-snug">
                    {s.naziv}
                  </h3>

                  {s.opis && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {s.opis}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
