import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { specialtiesAPI, doctorsAPI } from "@/services/api";
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
  "Farmacija": Pill,
  "Urgentna medicina": Activity,
};

// Helper function to convert specialty name to URL slug
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/č/g, 'c')
    .replace(/ć/g, 'c')
    .replace(/š/g, 's')
    .replace(/ž/g, 'z')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

const colorMap: { [key: string]: string } = {
  "Kardiologija": "bg-red-500",
  "Neurologija": "bg-purple-500",
  "Oftalmologija": "bg-cyan-500",
  "Ortopedija": "bg-orange-500",
  "Pedijatrija": "bg-pink-500",
  "Opća medicina": "bg-green-500",
  "Farmacija": "bg-indigo-500",
  "Urgentna medicina": "bg-red-600",
};

export function SpecialtiesSection() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpecialties();
  }, []);

  const fetchSpecialties = async () => {
    try {
      const [specialtiesResponse, doctorsResponse] = await Promise.all([
        specialtiesAPI.getAll(),
        doctorsAPI.getAll()
      ]);

      const specialtiesData = specialtiesResponse.data?.filter((s: any) => !s.parent_id).slice(0, 8) || [];
      
      // Handle paginated doctors response
      const doctorsList = Array.isArray(doctorsResponse.data) 
        ? doctorsResponse.data 
        : (doctorsResponse.data?.data || []);

      const doctorCounts: { [key: string]: number } = {};
      doctorsList.forEach((doc: any) => {
        doctorCounts[doc.specijalnost] = (doctorCounts[doc.specijalnost] || 0) + 1;
      });

      const formatted = specialtiesData.map((spec: any) => ({
        name: spec.naziv,
        icon: iconMap[spec.naziv] || Stethoscope,
        color: colorMap[spec.naziv] || "bg-primary",
        count: doctorCounts[spec.naziv] || 0
      }));

      setSpecialties(formatted);
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
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
            const urlSlug = createSlug(specialty.name);
            const handleClick = () => {
              navigate(`/specijalnost/${urlSlug}`);
            };
            
            return (
              <Card 
                key={specialty.name} 
                className="p-6 text-center hover:shadow-medium transition-all duration-300 cursor-pointer group bg-gradient-card"
                onClick={handleClick}
              >
                <div className={`${specialty.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <specialty.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-foreground">{specialty.name}</h3>
                <p className="text-sm text-muted-foreground">{specialty.count} doktora</p>
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