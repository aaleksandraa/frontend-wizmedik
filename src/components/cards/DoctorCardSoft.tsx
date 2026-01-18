import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Calendar, Award } from 'lucide-react';

interface Doctor {
  id: number;
  ime: string;
  prezime: string;
  specijalnost: string;
  grad: string;
  lokacija: string;
  ocjena?: string | number;
  broj_ocjena?: number;
  slika_profila?: string;
  slug: string;
  opis?: string;
}

interface DoctorCardSoftProps {
  doctor: Doctor;
}

export function DoctorCardSoft({ doctor }: DoctorCardSoftProps) {
  const rating = doctor.ocjena ? Number(doctor.ocjena) : 0;
  const hasRating = rating > 0;

  return (
    <Link to={`/doktor/${doctor.slug}`}>
      <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 rounded-3xl">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" 
             style={{ padding: '2px' }}>
          <div className="h-full w-full bg-white rounded-3xl" />
        </div>

        <CardContent className="relative p-6 space-y-4">
          {/* Profile Section */}
          <div className="flex items-start gap-4">
            {/* Avatar with Gradient Border */}
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 rounded-2xl blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                {doctor.slika_profila ? (
                  <img 
                    src={doctor.slika_profila} 
                    alt={`Dr. ${doctor.ime} ${doctor.prezime}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {doctor.ime[0]}{doctor.prezime[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
                Dr. {doctor.ime} {doctor.prezime}
              </h3>
              
              {/* Specialty Badge */}
              <Badge className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
                <Award className="w-3 h-3 mr-1" />
                {doctor.specijalnost}
              </Badge>
            </div>
          </div>

          {/* Description */}
          {doctor.opis && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {doctor.opis}
            </p>
          )}

          {/* Rating */}
          {hasRating && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-gray-900">{rating.toFixed(1)}</span>
              {doctor.broj_ocjena && (
                <span className="text-xs text-gray-500">({doctor.broj_ocjena})</span>
              )}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-purple-500" />
            <span className="line-clamp-1">{doctor.lokacija}, {doctor.grad}</span>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Zakaži termin
          </Button>
        </CardContent>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-rose-200/20 to-purple-200/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500" />
      </Card>
    </Link>
  );
}
