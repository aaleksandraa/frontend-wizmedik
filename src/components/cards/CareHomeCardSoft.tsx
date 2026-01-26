import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Star, Users, Stethoscope, Heart, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Dom {
  id: number;
  naziv: string;
  slug: string;
  grad: string;
  regija?: string;
  adresa: string;
  telefon?: string;
  email?: string;
  opis: string;
  tip_doma: {
    id: number;
    naziv: string;
    slug: string;
  };
  nivo_njege: {
    id: number;
    naziv: string;
    slug: string;
  };
  programi_njege: Array<{
    id: number;
    naziv: string;
    slug: string;
  }>;
  nurses_availability_label: string;
  doctor_availability_label: string;
  has_physiotherapist: boolean;
  has_physiatrist: boolean;
  emergency_protocol: boolean;
  formatted_price: string;
  prosjecna_ocjena: number;
  broj_recenzija: number;
  featured_slika?: string;
  url: string;
}

interface CareHomeCardSoftProps {
  dom: Dom;
}

export default function CareHomeCardSoft({ dom }: CareHomeCardSoftProps) {
  const rating = Number(dom.prosjecna_ocjena) || 0;
  
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Link to={dom.url || `/dom-njega/${dom.slug}`}>
      <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden h-full border-0 bg-white">
        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
          {dom.featured_slika ? (
            <img
              src={dom.featured_slika}
              alt={dom.naziv}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-blue-200" />
            </div>
          )}
          
          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {dom.tip_doma?.naziv && (
              <Badge className="bg-white/95 text-blue-700 hover:bg-white shadow-lg">
                {dom.tip_doma.naziv}
              </Badge>
            )}
            {dom.emergency_protocol && (
              <Badge className="bg-red-500/95 text-white hover:bg-red-600 shadow-lg">
                <Shield className="w-3 h-3 mr-1" />
                Hitna pomoć
              </Badge>
            )}
          </div>

          {/* Rating badge */}
          {rating > 0 && (
            <div className="absolute top-3 right-3 bg-white/95 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-5">
          {/* Title and Location */}
          <div className="mb-3">
            <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
              {dom.naziv}
            </h3>
            <div className="flex items-center text-gray-600 text-sm mb-2">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="line-clamp-1">{dom.grad}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {dom.opis}
          </p>

          {/* Level of Care */}
          {dom.nivo_njege?.naziv && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                {dom.nivo_njege.naziv}
              </Badge>
            </div>
          )}

          {/* Programs */}
          {dom.programi_njege && dom.programi_njege.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Programi njege:</p>
              <div className="flex flex-wrap gap-1">
                {dom.programi_njege.slice(0, 2).map((program) => (
                  <Badge key={program.id} variant="secondary" className="text-xs">
                    {program.naziv}
                  </Badge>
                ))}
                {dom.programi_njege.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{dom.programi_njege.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Staff Info */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
            <div className="flex items-center text-gray-600">
              <Users className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
              <div>
                <p className="font-medium text-gray-900">Sestre</p>
                <p>{dom.nurses_availability_label}</p>
              </div>
            </div>
            <div className="flex items-center text-gray-600">
              <Stethoscope className="w-3.5 h-3.5 mr-1.5 text-green-500" />
              <div>
                <p className="font-medium text-gray-900">Ljekar</p>
                <p>{dom.doctor_availability_label}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 my-4"></div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div>
              {rating > 0 && (
                <div className="flex items-center gap-1 mb-1">
                  <div className="flex">{renderStars(rating)}</div>
                  <span className="text-xs text-gray-600">({dom.broj_recenzija || 0})</span>
                </div>
              )}
              {dom.formatted_price && (
                <p className="text-sm font-semibold text-blue-600">
                  {dom.formatted_price}
                </p>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Pogledaj
            </Button>
          </div>

          {/* Contact Info */}
          {(dom.telefon || dom.email) && (
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-3 text-xs text-gray-600">
              {dom.telefon && (
                <div className="flex items-center">
                  <Phone className="w-3 h-3 mr-1" />
                  <span className="line-clamp-1">{dom.telefon}</span>
                </div>
              )}
              {dom.email && (
                <div className="flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  <span className="line-clamp-1">{dom.email}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
