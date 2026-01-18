import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, FlaskConical, Package, Clock, CheckCircle, ChevronRight, Shield } from 'lucide-react';

interface Laboratory {
  id: number;
  naziv: string;
  grad: string;
  adresa: string;
  slug: string;
  opis?: string;
  prosjecna_ocjena?: string | number;
  broj_recenzija?: number;
  prosjecno_vrijeme_rezultata?: string;
  verifikovan?: boolean;
  broj_analiza?: number;
  broj_paketa?: number;
  featured_slika?: string;
  galerija?: string[];
}

interface LaboratoryCardSoftProps {
  laboratory: Laboratory;
}

export function LaboratoryCardSoft({ laboratory }: LaboratoryCardSoftProps) {
  const rating = laboratory.prosjecna_ocjena ? Number(laboratory.prosjecna_ocjena) : 0;
  const hasRating = rating > 0;
  const mainImage = laboratory.featured_slika || (laboratory.galerija && laboratory.galerija.length > 0 ? laboratory.galerija[0] : null);
  const hasMultipleImages = laboratory.galerija && laboratory.galerija.length > 1;

  return (
    <Link to={`/laboratorija/${laboratory.slug}`}>
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
                  alt={laboratory.naziv}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {hasMultipleImages && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-purple-600 border-0 backdrop-blur-sm">
                      +{laboratory.galerija!.length} slika
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FlaskConical className="w-16 h-16 text-purple-300" />
              </div>
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Verification Badge */}
            {laboratory.verifikovan && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-green-500 text-white border-0 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verifikovano
                </Badge>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 space-y-4">
            {/* Title and Rating */}
            <div>
              <h3 className="font-bold text-xl text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                {laboratory.naziv}
              </h3>
              {hasRating && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({laboratory.broj_recenzija} {laboratory.broj_recenzija === 1 ? 'recenzija' : 'recenzija'})
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            {laboratory.opis && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {laboratory.opis}
              </p>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Analyses Count */}
              {laboratory.broj_analiza && laboratory.broj_analiza > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="p-2 rounded-lg bg-white">
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{laboratory.broj_analiza}</div>
                    <div className="text-xs text-gray-600">Analiza</div>
                  </div>
                </div>
              )}

              {/* Packages Count */}
              {laboratory.broj_paketa && laboratory.broj_paketa > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50">
                  <div className="p-2 rounded-lg bg-white">
                    <Package className="w-4 h-4 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{laboratory.broj_paketa}</div>
                    <div className="text-xs text-gray-600">Paketa</div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              {/* Location */}
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <span className="line-clamp-1">{laboratory.adresa}, {laboratory.grad}</span>
              </div>

              {/* Results Time */}
              {laboratory.prosjecno_vrijeme_rezultata && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span className="text-gray-700">
                    Rezultati za {laboratory.prosjecno_vrijeme_rezultata}
                  </span>
                </div>
              )}
            </div>

            {/* Features List */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Brzi rezultati
              </Badge>
              <Badge variant="outline" className="border-pink-200 text-pink-700 bg-pink-50">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online naručivanje
              </Badge>
            </div>

            {/* Action Button */}
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all"
            >
              Pogledaj pakete
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </CardContent>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-purple-200/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
            color: '#ec4899'
          }} />
        </div>
      </Card>
    </Link>
  );
}
