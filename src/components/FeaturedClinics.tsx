import { useState, useEffect } from 'react';
import { clinicsAPI } from '@/services/api';
import { ClinicCard } from './ClinicCard';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

interface Clinic {
  id: number;
  naziv: string;
  opis?: string;
  adresa: string;
  grad: string;
  telefon: string;
  email?: string;
  website?: string;
  slike: string[];
  radno_vrijeme: any;
  doktori?: any[];
}

export function FeaturedClinics() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await clinicsAPI.getAll({ limit: 6 });
      
      // Handle paginated response
      const clinicsList = Array.isArray(response.data) 
        ? response.data 
        : (response.data?.data || []);

      const clinicsData: Clinic[] = clinicsList.map((clinic: any) => ({
        ...clinic,
        slike: Array.isArray(clinic.slike) ? clinic.slike.filter((s): s is string => typeof s === 'string') : []
      }));
      
      setClinics(clinicsData);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 px-4 bg-muted/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
            <div className="h-6 bg-muted rounded w-96 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-96 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

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
