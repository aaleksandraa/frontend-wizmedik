import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

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

export function SpecialtyTemplateClassic({ specialties }: Props) {
  const navigate = useNavigate();

  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/specijalnost/${specialty.slug}`);
  };

  return (
    <div className="space-y-8">
      {specialties.map(category => (
        <div key={category.id}>
          <h2 className="text-2xl font-bold mb-4 text-foreground">{category.naziv}</h2>
          {category.opis && (
            <p className="text-muted-foreground mb-4">{category.opis}</p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Main Category Card */}
            <Card 
              className="p-6 hover:shadow-medium transition-all cursor-pointer group"
              onClick={() => handleSpecialtyClick(category)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {category.naziv}
                </h3>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Card>

            {/* Sub-specialties */}
            {category.children?.map(subspec => (
              <Card 
                key={subspec.id}
                className="p-6 hover:shadow-medium transition-all cursor-pointer group"
                onClick={() => handleSpecialtyClick(subspec)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {subspec.naziv}
                  </h3>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                {subspec.opis && (
                  <p className="text-sm text-muted-foreground">{subspec.opis}</p>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
