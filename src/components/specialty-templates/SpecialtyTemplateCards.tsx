import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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

export function SpecialtyTemplateCards({ specialties }: Props) {
  const navigate = useNavigate();

  const handleSpecialtyClick = (specialty: Specialty) => {
    navigate(`/specijalnost/${specialty.slug}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {specialties.map(category => (
        <Card key={category.id} className="overflow-hidden hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center overflow-hidden">
                  <IconRenderer iconUrl={category.icon_url} alt={category.naziv} className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">{category.naziv}</CardTitle>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleSpecialtyClick(category)}
                className="hover:bg-primary hover:text-white"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {category.opis && (
              <p className="text-muted-foreground mb-4">{category.opis}</p>
            )}
            
            {category.children && category.children.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground mb-3">
                  Podspecijalnosti:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {category.children.map(subspec => (
                    <div
                      key={subspec.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer group transition-colors"
                      onClick={() => handleSpecialtyClick(subspec)}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <IconRenderer iconUrl={subspec.icon_url} alt={subspec.naziv} className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="font-medium text-sm group-hover:text-primary transition-colors">
                          {subspec.naziv}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              className="w-full mt-4"
              onClick={() => handleSpecialtyClick(category)}
            >
              Pogledaj sve specijaliste
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
