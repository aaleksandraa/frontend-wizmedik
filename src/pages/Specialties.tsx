import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { specialtiesAPI, doctorsAPI, settingsAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Stethoscope } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SpecialtyTemplateClassic } from '@/components/specialty-templates/SpecialtyTemplateClassic';
import { SpecialtyTemplateGrid } from '@/components/specialty-templates/SpecialtyTemplateGrid';
import { SpecialtyTemplateList } from '@/components/specialty-templates/SpecialtyTemplateList';
import { SpecialtyTemplateCards } from '@/components/specialty-templates/SpecialtyTemplateCards';
import { SpecialtyTemplateModern } from '@/components/specialty-templates/SpecialtyTemplateModern';

interface Specialty {
  id: number;
  naziv: string;
  opis?: string;
  parent_id?: number;
  children?: Specialty[];
  doctorCount?: number;
}

export default function Specialties() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState('classic');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSpecialties();
    fetchTemplate();
  }, []);

  const fetchTemplate = async () => {
    try {
      const response = await settingsAPI.getSpecialtyTemplate();
      setTemplate(response.data.template || 'classic');
    } catch (error) {
      console.error('Error fetching template:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      // Use optimized endpoint that includes counts in a single query
      const response = await specialtiesAPI.getWithCounts();
      const specialtiesData = response.data || [];
      
      // Data is already organized with counts from backend
      setSpecialties(specialtiesData.map((spec: any) => ({
        ...spec,
        doctorCount: spec.doctor_count || 0,
        children: spec.children?.map((child: any) => ({
          ...child,
          doctorCount: child.doctor_count || 0
        })) || []
      })));
    } catch (error) {
      console.error('Error fetching specialties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Medicinske specijalnosti - MediBIH</title>
        <meta name="description" content="Pretražite sve medicinske specijalnosti dostupne u BiH. Pronađite doktore po specijalnosti - kardiologija, pedijatrija, neurologija i više." />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Stethoscope className="h-10 w-10 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Medicinske specijalnosti</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Pretražite sve medicinske specijalnosti i pronađite pravog stručnjaka za vaše potrebe
            </p>
          </div>

          {/* Specialties Templates */}
          {template === 'classic' && <SpecialtyTemplateClassic specialties={specialties} />}
          {template === 'grid' && <SpecialtyTemplateGrid specialties={specialties} />}
          {template === 'list' && <SpecialtyTemplateList specialties={specialties} />}
          {template === 'cards' && <SpecialtyTemplateCards specialties={specialties} />}
          {template === 'modern' && <SpecialtyTemplateModern specialties={specialties} />}

          {specialties.length === 0 && (
            <div className="text-center py-16">
              <Stethoscope className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nema dostupnih specijalnosti
              </h3>
              <p className="text-muted-foreground">
                Trenutno nema aktivnih specijalnosti u sistemu
              </p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
