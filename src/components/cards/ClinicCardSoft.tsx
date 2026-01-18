import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Clock, Building2, ChevronRight, Users } from 'lucide-react';

interface Clinic {
  id: number;
  naziv: string;
  grad: string;
  adresa: string;
  telefon?: string;
  slug?: string;
  opis?: string;
  slike?: string[];
  radno_vrijeme?: any;
  broj_doktora?: number;
}

interface ClinicCardSoftProps {
  clinic: Clinic;
}

export function ClinicCardSoft({ clinic }: ClinicCardSoftProps) {
  const mainImage = clinic.slike && clinic.slike.length > 0 ? clinic.slike[0] : null;
  const hasMultipleImages = clinic.slike && clinic.slike.length > 1;

  return (
    <Link to={`/klinika/${clinic.slug || clinic.id}`}>
      <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 rounded-3xl h-full">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" 
             style={{ padding: '2px' }}>
          <div className="h-full w-full bg-white rounded-3xl" />
        </div>

        <CardContent className="relative p-0">
          {/* Image Section */}
          <div className="relative h-48 overflow-hidden rounded-t-3xl bg-gradient-to-br from-purple-100 via-pink-100 to-rose-100">
            {mainImage ? (
              <>
                <img 
                  src={mainImage} 
                  alt={clinic.naziv}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-purple-600 border-0 backdrop-blur-sm">
                      +{clinic.slike!.length - 1} slika
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-16 h-16 text-purple-300" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Title */}
            <div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                {clinic.naziv}
              </h3>
              {clinic.broj_doktora && (
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{clinic.broj_doktora} doktora</span>
                </div>
              )}
            </div>

            {/* Description */}
            {clinic.opis && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {clinic.opis}
              </p>
            )}

            {/* Info Grid */}
            <div className="space-y-2">
              {/* Location */}
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 line-clamp-1">{clinic.adresa}, {clinic.grad}</span>
              </div>

              {/* Phone */}
              {clinic.telefon && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span className="text-gray-700">{clinic.telefon}</span>
                </div>
              )}

              {/* Working Hours */}
              {clinic.radno_vrijeme && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span className="text-gray-700">Radno vrijeme dostupno</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all"
            >
              Pogledaj detalje
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-purple-200/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500" />
      </Card>
    </Link>
  );
}
