import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Brain, Eye, Bone, Baby, Stethoscope, Pill, Activity } from "lucide-react";

const iconMap: { [key: string]: any } = {
  "Kardiologija": Heart,
  "Neurologija": Brain,
  "Oftalmologija": Eye,
  "Ortopedija": Bone,
  "Pedijatrija": Baby,
  "Opća medicina": Stethoscope,
  "Opšta medicina": Stethoscope,
  "Opšta i interna medicina": Stethoscope,
  "Farmacija": Pill,
  "Urgentna medicina": Activity,
};

const colorMap: { [key: string]: string } = {
  "Kardiologija": "bg-red-500",
  "Neurologija": "bg-purple-500",
  "Oftalmologija": "bg-cyan-500",
  "Ortopedija": "bg-orange-500",
  "Pedijatrija": "bg-pink-500",
  "Opća medicina": "bg-green-500",
  "Opšta medicina": "bg-green-500",
  "Opšta i interna medicina": "bg-green-500",
  "Farmacija": "bg-indigo-500",
  "Urgentna medicina": "bg-red-600",
};

interface Specialty {
  id: number;
  naziv: string;
  slug: string;
  doctor_count: number;
}

interface Props {
  specialties: Specialty[];
}

export function OptimizedSpecialtiesSection({ specialties }: Props) {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Medicinske specijalnosti
          </h2>
          <p className="text-xl text-muted-foreground">
            Pronađite stručnjaka za vaše zdravstvene potrebe
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {specialties.map((specialty) => {
            const Icon = iconMap[specialty.naziv] || Stethoscope;
            const color = colorMap[specialty.naziv] || "bg-primary";
            
            return (
              <Card 
                key={specialty.id} 
                className="p-6 text-center hover:shadow-medium transition-all duration-300 cursor-pointer group bg-gradient-card"
                onClick={() => navigate(`/specijalnost/${specialty.slug}`)}
              >
                <div className={`${color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{specialty.naziv}</h3>
                <p className="text-sm text-muted-foreground">{specialty.doctor_count} doktora</p>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/specijalnosti')}
          >
            Pogledajte sve specijalnosti
          </Button>
        </div>
      </div>
    </section>
  );
}
