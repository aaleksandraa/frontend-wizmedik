import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
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

export function SpecialtyTemplateList({ specialties }: Props) {
  const navigate = useNavigate();

  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/specijalnost/${specialty.slug}`);
  };

  return (
    <div className="space-y-4">
      {specialties.map(category => (
        <div key={category.id} className="space-y-3">
          {/* Parent Category */}
          <Card className="p-6 hover:shadow-md transition-all cursor-pointer group border-l-4 border-l-primary">
            <div 
              className="flex items-center justify-between"
              onClick={() => handleSpecialtyClick(category)}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <IconRenderer iconUrl={category.icon_url} alt={category.naziv} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">
                    {category.naziv}
                  </h3>
                  {category.opis && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.opis}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="group-hover:text-primary">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Sub-specialties */}
          {category.children && category.children.length > 0 && (
            <div className="ml-8 space-y-2">
              {category.children.map(subspec => (
                <Card 
                  key={subspec.id}
                  className="p-4 hover:shadow-md transition-all cursor-pointer group hover:border-primary/50"
                  onClick={() => handleSpecialtyClick(subspec)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-md bg-primary/5 group-hover:bg-primary/10 transition-colors flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <IconRenderer iconUrl={subspec.icon_url} alt={subspec.naziv} className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {subspec.naziv}
                        </h4>
                        {subspec.opis && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {subspec.opis}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
