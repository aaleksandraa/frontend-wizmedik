import { ClinicCard } from './ClinicCard';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

interface Clinic {
  id: number;
  slug: string;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: string[];
  radno_vrijeme: any;
}

interface Props {
  clinics: Clinic[];
}

export function OptimizedFeaturedClinics({ clinics }: Props) {
  const navigate = useNavigate();

  if (clinics.length === 0) return null;

  return (
    <section className="py-16 px-4 bg-muted/10">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Istaknute klinike
          </h2>
          <p className="text-xl text-muted-foreground">
            Pronađite najbolje zdravstvene ustanove u vašem gradu
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {clinics.map(clinic => (
            <ClinicCard key={clinic.id} clinic={clinic} />
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="medical" 
            size="lg"
            onClick={() => navigate('/klinike')}
          >
            <Building2 className="w-5 h-5 mr-2" />
            Pogledajte sve klinike
          </Button>
        </div>
      </div>
    </section>
  );
}
