import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

const gradients = [
  'from-blue-500/10 to-cyan-500/10',
  'from-purple-500/10 to-pink-500/10',
  'from-green-500/10 to-emerald-500/10',
  'from-orange-500/10 to-red-500/10',
  'from-indigo-500/10 to-blue-500/10',
  'from-rose-500/10 to-pink-500/10',
];

export function SpecialtyTemplateModern({ specialties }: Props) {
  const navigate = useNavigate();

  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/specijalnost/${specialty.slug}`);
  };

  // Flatten all specialties with parent info
  const allSpecialties: Array<Specialty & { parentName?: string }> = [];
  specialties.forEach((parent, idx) => {
    allSpecialties.push({ ...parent, parentName: undefined });
    if (parent.children) {
      parent.children.forEach(child => {
        allSpecialties.push({ ...child, parentName: parent.naziv });
      });
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {allSpecialties.map((specialty, index) => {
        const gradient = gradients[index % gradients.length];
        
        return (
          <Card 
            key={specialty.id}
            className={`relative overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${gradient}`}
            onClick={() => handleSpecialtyClick(specialty)}
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden">
                  <IconRenderer iconUrl={specialty.icon_url} alt={specialty.naziv} className="w-7 h-7 text-primary" />
                </div>
              </div>
              
              <div className="space-y-2">
                {specialty.parentName && (
                  <Badge variant="outline" className="text-xs">
                    {specialty.parentName}
                  </Badge>
                )}
                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                  {specialty.naziv}
                </h3>
                {specialty.opis && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {specialty.opis}
                  </p>
                )}
              </div>
              
              <div className="flex items-center justify-end pt-2 border-t">
                <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center">
                  <span className="text-lg">→</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
