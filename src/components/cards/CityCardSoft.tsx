import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Building2, Stethoscope, FlaskConical, Users, TrendingUp, ChevronRight, Droplet, Home } from 'lucide-react';

interface City {
  id: number;
  naziv: string;
  slug: string;
  opis?: string;
  broj_doktora?: number;
  broj_klinika?: number;
  broj_laboratorija?: number;
  broj_banja?: number;
  broj_domova?: number;
  populacija?: string;
}

interface CityCardSoftProps {
  city: City;
}

export function CityCardSoft({ city }: CityCardSoftProps) {
  const stats = [
    { 
      icon: Stethoscope, 
      label: 'Doktora', 
      value: city.broj_doktora || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100'
    },
    { 
      icon: Building2, 
      label: 'Klinika', 
      value: city.broj_klinika || 0,
      color: 'text-pink-500',
      bgColor: 'bg-pink-100'
    },
    { 
      icon: FlaskConical, 
      label: 'Laboratorija', 
      value: city.broj_laboratorija || 0,
      color: 'text-violet-500',
      bgColor: 'bg-violet-100'
    },
    { 
      icon: Droplet, 
      label: 'Banja', 
      value: city.broj_banja || 0,
      color: 'text-teal-500',
      bgColor: 'bg-teal-100'
    },
    { 
      icon: Home, 
      label: 'Domova', 
      value: city.broj_domova || 0,
      color: 'text-rose-500',
      bgColor: 'bg-rose-100'
    },
  ];

  return (
    <Link to={`/grad/${city.slug}`}>
      <Card className="group relative overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 rounded-3xl h-full">
        {/* Gradient Border Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-400 to-rose-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" 
             style={{ padding: '2px' }}>
          <div className="h-full w-full bg-white rounded-3xl" />
        </div>

        <CardContent className="relative p-6 space-y-5">
          {/* Header with Icon */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="font-bold text-2xl text-gray-900 group-hover:text-purple-600 transition-colors">
                  {city.naziv}
                </h3>
              </div>
              
              {city.populacija && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{city.populacija} stanovnika</span>
                </div>
              )}
            </div>

            {/* Trending Badge */}
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Description */}
          {city.opis && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {city.opis}
            </p>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-5 gap-2">
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-purple-50 group-hover:to-pink-50 transition-all"
              >
                <div className={`inline-flex p-2 rounded-xl ${stat.bgColor} mb-2`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">
                  {stat.label}
                </div>
                
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Total Services Badge */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border border-purple-100">
            <div className="flex items-center gap-1 text-sm font-semibold text-purple-700">
              <span>Ukupno:</span>
              <span className="text-lg">
                {(city.broj_doktora || 0) + (city.broj_klinika || 0) + (city.broj_laboratorija || 0) + (city.broj_banja || 0) + (city.broj_domova || 0)}
              </span>
              <span>usluga</span>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white border-0 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all"
          >
            Pogledaj detaljnije
            <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-200/20 to-purple-200/20 rounded-full blur-2xl -z-10 group-hover:scale-150 transition-transform duration-500" />
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '24px 24px',
            color: '#a855f7'
          }} />
        </div>
      </Card>
    </Link>
  );
}
