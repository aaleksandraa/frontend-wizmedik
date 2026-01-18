import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { IconRenderer } from './IconRenderer';

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
  const navigate = useNavigate();

  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/specijalnost/${specialty.slug}`);
  };

  // Flatten all specialties (parent + children)
  const allSpecialties: Specialty[] = [];
  specialties.forEach(parent => {
    allSpecialties.push(parent);
    if (parent.children) {
      allSpecialties.push(...parent.children);
    }
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {allSpecialties.map(specialty => (
        <Card 
          key={specialty.id}
          className="p-6 hover:shadow-lg hover:scale-105 transition-all cursor-pointer group bg-gradient-to-br from-white to-primary/5"
          onClick={() => handleSpecialtyClick(specialty)}
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center overflow-hidden">
              <IconRenderer iconUrl={specialty.icon_url} alt={specialty.naziv} className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                {specialty.naziv}
              </h3>
              {specialty.opis && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {specialty.opis}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
